import { useCallback, useEffect, useRef, useState } from "react";
import { getLocale, t } from "./i18n";
import type { RemoteUser, SearchTab, Tool } from "./types";
import {
  addBookmark,
  clearAuthToken,
  clearBookmarks,
  loadAuthToken,
  loadBookmarks,
  loadLastSyncedAt,
  loadOpenTool,
  loadPopupWarningHidden,
  loadQuery,
  loadTab,
  removeBookmark,
  saveAuthToken,
  saveLastSyncedAt,
  saveOpenTool,
  savePopupWarningHidden,
  saveQuery,
  saveTab,
} from "./storage";
import {
  AuthRevokedError,
  deleteRemoteBookmark,
  extractAlias,
  fetchRemoteBookmarks,
  fetchRemoteUser,
  requestAuthorization,
  searchTools,
  toBookmarkTool,
  upsertRemoteBookmarks,
} from "./sync";

const DEBOUNCE_MS = 400;

/**
 * Pushes any locally-stored bookmarks to the server, then clears them from local storage.
 * Older locally-stored bookmarks don't have an alias field, so it's extracted from the
 * tool URL instead.
 */
async function migrateLocalBookmarksToRemote(token: string): Promise<void> {
  const local = await loadBookmarks();
  if (local.length === 0) return;

  const localAliases = local.map((b) => b.alias || extractAlias(b.url));
  await upsertRemoteBookmarks(token, localAliases);
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

  // The tool shown inside the popup instead of the tabs, kept for the next time the popup opens
  const [openTool, _setOpenTool] = useState<Tool | null>(null);

  const setOpenTool = useCallback((tool: Tool | null) => {
    _setOpenTool(tool);
    saveOpenTool(tool);
  }, []);

  // "Don't show again" on the warning above a tool open in the popup
  const [popupWarningHidden, setPopupWarningHidden] = useState(false);

  const hidePopupWarning = useCallback(() => {
    setPopupWarningHidden(true);
    savePopupWarningHidden();
  }, []);

  // Whether the tab, query and tool the popup was left with are back, so the view isn't drawn
  // without them first (the tabs would flash before a tool left open replaces them, and the
  // warning above a tool would push it down once it turned up)
  const [restored, setRestored] = useState(false);
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

  useEffect(() => {
    Promise.all([
      loadTab(),
      loadQuery(),
      loadOpenTool(),
      loadPopupWarningHidden(),
    ]).then(([savedTab, savedQuery, savedTool, warningHidden]) => {
      _setTab(savedTab);
      _setQuery(savedQuery);
      _setOpenTool(savedTool);
      setPopupWarningHidden(warningHidden);
      setRestored(true);
    });
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
        const data = await searchTools(
          query.trim(),
          getLocale(),
          abortController.current.signal,
        );
        setSearchResults(data.tools);
        setHasSearched(true);
      } catch (err) {
        if (err instanceof DOMException && err.name === "AbortError") return;
        setSearchError(
          err instanceof Error ? err.message : t("searchErrorUnknown"),
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
    setSyncError(err instanceof Error ? err.message : t("syncErrorUnknown"));
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
      setSyncError(
        err instanceof Error ? err.message : t("syncErrorConnectFailed"),
      );
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
    restored,
    openTool,
    setOpenTool,
    popupWarningHidden,
    hidePopupWarning,
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
