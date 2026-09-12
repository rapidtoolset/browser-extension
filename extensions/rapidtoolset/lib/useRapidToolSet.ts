import { useCallback, useEffect, useRef, useState } from "react";
import { getLocale } from "./i18n";
import type { RemoteUser, SearchTab, Tool, ToolSearchResponse } from "./types";
import {
  addBookmark,
  clearAuthToken,
  clearBookmarks,
  loadAuthToken,
  loadBookmarks,
  loadLastSyncedAt,
  loadQuery,
  loadTab,
  removeBookmark,
  saveAuthToken,
  saveLastSyncedAt,
  saveQuery,
  saveTab,
} from "./storage";
import {
  AuthRevokedError,
  deleteRemoteBookmark,
  extractAlias,
  fetchRemoteBookmarks,
  fetchRemoteUser,
  RAPIDTOOLSET_BASE_URL,
  requestAuthorization,
  toBookmarkTool,
  upsertRemoteBookmarks,
} from "./sync";

const API_BASE = `${RAPIDTOOLSET_BASE_URL}/api/public/search`;
const DEBOUNCE_MS = 400;

/**
 * Pushes any locally-stored bookmarks to the server, then clears them from local storage.
 * Any alias the server doesn't confirm as saved is logged and dropped rather than kept
 * around indefinitely.
 *
 * Older locally-stored bookmarks don't have an alias field, so it's extracted from the
 * tool URL instead.
 */
async function migrateLocalBookmarksToRemote(token: string): Promise<void> {
  const local = await loadBookmarks();
  if (local.length === 0) return;

  const localAliases = local.map((b) => b.alias || extractAlias(b.url));
  const savedAliases = await upsertRemoteBookmarks(token, localAliases);
  const unsynced = localAliases.filter(
    (alias) => !savedAliases.includes(alias),
  );
  if (unsynced.length > 0) {
    console.log(
      "[rapidtoolset] Could not sync bookmark(s) to RapidToolSet, removing locally:",
      unsynced,
    );
  }

  await clearBookmarks();
}

export function useRapidToolSet() {
  const [bookmarks, setBookmarks] = useState<Tool[]>([]);
  const [searchResults, setSearchResults] = useState<Tool[]>([]);
  const [query, _setQuery] = useState("");
  const [tab, _setTab] = useState<SearchTab>("online");

  const setQuery = useCallback((q: string) => {
    _setQuery(q);
    saveQuery(q);
  }, []);

  const setTab = useCallback((t: SearchTab) => {
    _setTab(t);
    saveTab(t);
  }, []);
  const [isSearching, setIsSearching] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [loadingBookmarks, setLoadingBookmarks] = useState(true);
  const [hasSearched, setHasSearched] = useState(false);

  const [authToken, setAuthToken] = useState<string | null>(null);
  const [connecting, setConnecting] = useState(false);
  const [syncing, setSyncing] = useState(false);
  const [syncError, setSyncError] = useState<string | null>(null);
  const [lastSyncedAt, setLastSyncedAt] = useState<number | null>(null);
  const [remoteUser, setRemoteUser] = useState<RemoteUser | null>(null);

  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const abortController = useRef<AbortController | null>(null);

  // Load persisted tab + bookmarks on mount
  useEffect(() => {
    loadTab().then(_setTab);
    loadQuery().then(_setQuery);
    loadLastSyncedAt().then(setLastSyncedAt);

    loadAuthToken().then(async (token) => {
      setAuthToken(token);
      if (token) {
        await sync(token, { fallbackOnError: true });
        setLoadingBookmarks(false);
      } else {
        const local = await loadBookmarks();
        setBookmarks(local);
        setLoadingBookmarks(false);
      }
    });
  }, []);

  // Debounced API search (only when online tab is active)
  useEffect(() => {
    if (debounceTimer.current) clearTimeout(debounceTimer.current);

    if (tab !== "online" || !query.trim()) {
      abortController.current?.abort();
      abortController.current = null;
      setSearchResults([]);
      setSearchError(null);
      setHasSearched(false);
      setIsSearching(false);
      return;
    }

    debounceTimer.current = setTimeout(async () => {
      abortController.current?.abort();
      abortController.current = new AbortController();

      setIsSearching(true);
      setSearchError(null);

      try {
        const params = new URLSearchParams();
        params.set("q", query.trim());
        params.set("locale", getLocale());

        const url = `${API_BASE}?${params.toString()}`;
        const res = await fetch(url, {
          signal: abortController.current.signal,
        });

        if (!res.ok) throw new Error(`Request failed: ${res.status}`);

        const data: ToolSearchResponse = await res.json();
        setSearchResults(data.tools);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSearchError(
          err instanceof Error ? err.message : "Something went wrong",
        );
        setSearchResults([]);
      } finally {
        setIsSearching(false);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceTimer.current) clearTimeout(debounceTimer.current);
    };
  }, [query, tab]);

  // Filter bookmarks locally when on bookmarks tab
  const filteredBookmarks =
    tab === "bookmarks" && query.trim()
      ? bookmarks.filter((b) => {
          const q = query.trim().toLowerCase();
          return (
            b.name.toLowerCase().includes(q) ||
            b.description.toLowerCase().includes(q)
          );
        })
      : bookmarks;

  const isBookmarked = useCallback(
    (url: string) => bookmarks.some((b) => b.url === url),
    [bookmarks],
  );

  /** Records a failed request's error, additionally resetting auth state if the token was revoked. */
  const handleRequestError = useCallback((err: unknown) => {
    setSyncError(err instanceof Error ? err.message : "Sync failed");
    if (err instanceof AuthRevokedError) {
      setAuthToken(null);
      setRemoteUser(null);
    }
  }, []);

  const toggleBookmark = useCallback(
    async (tool: Tool) => {
      if (authToken) {
        const alias = tool.alias || extractAlias(tool.url);
        if (isBookmarked(tool.url)) {
          setBookmarks((prev) => prev.filter((b) => b.url !== tool.url));
          deleteRemoteBookmark(authToken, alias).catch(handleRequestError);
        } else {
          setBookmarks((prev) => [...prev, tool]);
          upsertRemoteBookmarks(authToken, [alias]).catch(handleRequestError);
        }
        return;
      }

      if (isBookmarked(tool.url)) {
        const updated = await removeBookmark(tool.url);
        setBookmarks(updated);
      } else {
        const updated = await addBookmark(tool);
        setBookmarks(updated);
      }
    },
    [isBookmarked, authToken],
  );

  /** Pushes any local bookmarks to the server, then replaces local state with the server's list. */
  const sync = useCallback(
    async (tokenOverride?: string, options?: { fallbackOnError?: boolean }) => {
      const activeToken = tokenOverride ?? authToken;
      if (!activeToken) return;

      setSyncing(true);
      setSyncError(null);
      try {
        await migrateLocalBookmarksToRemote(activeToken);

        const [remote, user] = await Promise.all([
          fetchRemoteBookmarks(activeToken, getLocale()),
          fetchRemoteUser(activeToken),
        ]);
        setBookmarks(remote.map((b) => toBookmarkTool(b, getLocale())));
        setRemoteUser(user);

        const now = Date.now();
        await saveLastSyncedAt(now);
        setLastSyncedAt(now);
      } catch (err) {
        handleRequestError(err);
        if (options?.fallbackOnError) {
          const local = await loadBookmarks();
          setBookmarks(local);
        }
      } finally {
        setSyncing(false);
      }
    },
    [authToken, handleRequestError],
  );

  const connect = useCallback(async () => {
    setConnecting(true);
    setSyncError(null);
    try {
      const token = await requestAuthorization();
      await saveAuthToken(token);
      setAuthToken(token);
      // Automatically sync (push local bookmarks + pull the account's remote list/profile)
      // as soon as the account is linked, so the UI reflects the account's real state right away.
      await sync(token);
    } catch (err) {
      setSyncError(err instanceof Error ? err.message : "Failed to connect");
    } finally {
      setConnecting(false);
    }
  }, [sync]);

  const disconnect = useCallback(async () => {
    await clearAuthToken();
    setAuthToken(null);
    setLastSyncedAt(null);
    setSyncError(null);
    setRemoteUser(null);
    const local = await loadBookmarks();
    setBookmarks(local);
  }, []);

  const isSearchMode = tab === "online" && query.trim().length > 0;

  return {
    bookmarks: filteredBookmarks,
    searchResults,
    query,
    tab,
    isSearching,
    isSearchMode,
    hasSearched,
    searchError,
    loadingBookmarks,
    setQuery,
    setTab,
    isBookmarked,
    toggleBookmark,
    connected: !!authToken,
    connecting,
    syncing,
    syncError,
    lastSyncedAt,
    remoteUser,
    connect,
    disconnect,
    sync,
  };
}
