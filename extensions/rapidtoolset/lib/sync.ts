import { browser } from "wxt/browser";
import { getLocale, t } from "./i18n";
import { clearAuthToken } from "./storage";
import type {
  RemoteBookmark,
  RemoteUser,
  Tool,
  ToolSearchResponse,
} from "./types";

/** Base origin for the RapidToolSet API (search + account/sync). */
export const RAPIDTOOLSET_BASE_URL = "https://rapidtoolset.com";

const USER_ENDPOINT = `${RAPIDTOOLSET_BASE_URL}/api/public/user`;
const BOOKMARKS_ENDPOINT = `${RAPIDTOOLSET_BASE_URL}/api/public/bookmarks`;
const SEARCH_ENDPOINT = `${RAPIDTOOLSET_BASE_URL}/api/public/search`;

const REQUEST_TIMEOUT_MS = 10_000;

/**
 * Combines an optional caller-provided abort signal with a timeout, so every
 * request is aborted if it takes too long even if the caller doesn't pass one.
 */
function withTimeout(signal?: AbortSignal | null): AbortSignal {
  const timeoutSignal = AbortSignal.timeout(REQUEST_TIMEOUT_MS);
  return signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
}

/**
 * Error thrown when a request is rejected with 401 because the stored token was
 * revoked or is otherwise invalid. Callers should treat this as "disconnected"
 * and prompt the user to reconnect rather than retrying with the same token.
 */
export class AuthRevokedError extends Error {}

/**
 * The `app_id` this build authenticates as, matching one of the values on
 * RapidToolSet's server-side allow-list of registered redirect URIs (one per
 * browser/extension-id pair). There's no per-install registration: each
 * browser target ships with a fixed extension id, so a single app_id per
 * browser covers every install.
 */
function getAppId(): string {
  return import.meta.env.BROWSER === "firefox"
    ? "firefox-extension"
    : "chrome-extension";
}

/**
 * Launches the RapidToolSet consent screen via the browser's identity flow and
 * resolves with the issued bearer token, or throws if denied/cancelled.
 *
 * Must be called from the background script, not the popup: Firefox steals focus and
 * unloads the popup document as soon as `launchWebAuthFlow` opens its auth window, which
 * would abort any in-flight promise living in the popup's JS context. See
 * `requestAuthorization()` below and `entrypoints/background.ts`.
 */
export async function authorizeRapidToolSet(): Promise<string> {
  const appId = getAppId();
  const locale = getLocale();
  const authUrl = `${RAPIDTOOLSET_BASE_URL}/${locale}/authorize?app_id=${encodeURIComponent(appId)}`;

  const redirectUrl = await browser.identity.launchWebAuthFlow({
    url: authUrl,
    interactive: true,
  });
  if (!redirectUrl) throw new Error(t("syncErrorCancelled"));

  const params = new URL(redirectUrl).searchParams;
  const error = params.get("error");
  if (error)
    throw new Error(error === "access_denied" ? t("syncErrorDenied") : error);

  const token = params.get("token");
  if (!token) throw new Error(t("syncErrorNoToken"));
  return token;
}

/** Runtime message type the popup sends to ask the background script to run the OAuth flow. */
export const AUTHORIZE_MESSAGE = "rapidtoolset:authorize";

type AuthorizeResponse = { token: string } | { error: string };

/**
 * Popup-side entry point for connecting a RapidToolSet account: asks the background script
 * to run `authorizeRapidToolSet()` (see its docstring for why it can't run in the popup
 * directly) and resolves with the issued bearer token, or throws if denied/cancelled.
 *
 * On Firefox, the popup may be unloaded mid-flow before this response ever arrives; the
 * background script persists the token to storage itself, and the popup reloads it from
 * storage on its next mount (see `useRapidToolSet.ts`).
 */
export async function requestAuthorization(): Promise<string> {
  const response = (await browser.runtime.sendMessage({
    type: AUTHORIZE_MESSAGE,
  })) as AuthorizeResponse | undefined;
  if (!response) throw new Error(t("syncErrorCancelled"));
  if ("error" in response) throw new Error(response.error);
  return response.token;
}

async function request<T>(
  url: string,
  token: string,
  init?: RequestInit,
): Promise<T> {
  const res = await fetch(url, {
    ...init,
    signal: withTimeout(init?.signal),
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      ...init?.headers,
    },
  });

  if (res.status === 401) {
    // Token was revoked (e.g. the user removed the app from their account) or is
    // otherwise invalid. Clear it so the UI falls back to a "connect" state
    // instead of repeatedly failing with the same stale token.
    await clearAuthToken();
    throw new AuthRevokedError(t("syncErrorExpired"));
  }
  if (!res.ok) throw new Error(t("syncErrorRequestFailed", String(res.status)));

  return res.json() as Promise<T>;
}

/** Search RapidToolSet's public tool catalog. */
export async function searchTools(
  query: string,
  locale: string,
  signal?: AbortSignal,
): Promise<ToolSearchResponse> {
  const params = new URLSearchParams({ q: query, locale });
  const res = await fetch(`${SEARCH_ENDPOINT}?${params.toString()}`, {
    signal: withTimeout(signal),
  });
  if (!res.ok) throw new Error(t("syncErrorRequestFailed", String(res.status)));
  return res.json() as Promise<ToolSearchResponse>;
}

/** Fetch the signed-in RapidToolSet account's basic profile info. */
export async function fetchRemoteUser(token: string): Promise<RemoteUser> {
  const body = await request<{ data: RemoteUser }>(USER_ENDPOINT, token);
  return body.data;
}

/** Fetch the bookmarks stored for the account, with name/description in the given locale. */
export async function fetchRemoteBookmarks(
  token: string,
  locale?: string,
): Promise<RemoteBookmark[]> {
  const url = locale
    ? `${BOOKMARKS_ENDPOINT}?locale=${encodeURIComponent(locale)}`
    : BOOKMARKS_ENDPOINT;
  const body = await request<{ data: { bookmarks: RemoteBookmark[] } }>(
    url,
    token,
  );
  return body.data?.bookmarks ?? [];
}

/** Upsert one or more aliases (bookmark urls). Returns the full merged list of aliases. */
export async function upsertRemoteBookmarks(
  token: string,
  aliases: string[],
): Promise<string[]> {
  const body = await request<{ data: { bookmarks: string[] } }>(
    BOOKMARKS_ENDPOINT,
    token,
    {
      method: "POST",
      body: JSON.stringify({ aliases }),
    },
  );
  return body.data?.bookmarks ?? [];
}

/** Remove a single alias (bookmark url). Returns the remaining list of aliases. */
export async function deleteRemoteBookmark(
  token: string,
  alias: string,
): Promise<string[]> {
  const body = await request<{ data: { bookmarks: string[] } }>(
    BOOKMARKS_ENDPOINT,
    token,
    {
      method: "DELETE",
      body: JSON.stringify({ alias }),
    },
  );
  return body.data?.bookmarks ?? [];
}

/**
 * Extracts the RapidToolSet alias (slug) from a full tool URL, e.g.
 * `https://rapidtoolset.com/en/tool/audio-fingerprint-calculator` -> `audio-fingerprint-calculator`.
 * Returns the input unchanged if it isn't a URL (i.e. it's already a bare alias).
 */
export function extractAlias(urlOrAlias: string): string {
  try {
    const segments = new URL(urlOrAlias).pathname.split("/").filter(Boolean);
    return segments[segments.length - 1] || urlOrAlias;
  } catch {
    return urlOrAlias;
  }
}

/** Converts a remote bookmark entry (alias + localized name/description) into a local Tool. */
export function toBookmarkTool(bookmark: RemoteBookmark, locale = "en"): Tool {
  return {
    alias: bookmark.alias,
    url: `${RAPIDTOOLSET_BASE_URL}/${locale}/tool/${bookmark.alias}`,
    name: bookmark.name || bookmark.alias,
    description: bookmark.description || t("syncedBookmarkDescription"),
  };
}
