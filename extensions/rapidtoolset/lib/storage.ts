import { browser } from "wxt/browser";
import type { OpenToolsIn, SearchTab, Tool } from "./types";

// NOTE: these key names intentionally keep the original "tool_hub_*" prefix
// from before the extension was renamed to "RapidToolSet". Changing them
// would orphan existing users' bookmarks/settings, since browser.storage.local
// persists across extension updates but nothing migrates data between key
// names automatically.
const BOOKMARKS_KEY = "tool_hub_bookmarks";
const TAB_KEY = "tool_hub_tab";
const QUERY_KEY = "tool_hub_query";
const OPEN_TOOL_KEY = "tool_hub_open_tool";
const OPEN_TOOLS_IN_KEY = "tool_hub_open_tools_in";
const POPUP_WARNING_HIDDEN_KEY = "tool_hub_popup_warning_hidden";
const AUTH_TOKEN_KEY = "tool_hub_auth_token";
const LAST_SYNCED_KEY = "tool_hub_last_synced";

/** Load the last selected tab from storage. */
export async function loadTab(): Promise<SearchTab> {
  const result = await browser.storage.local.get(TAB_KEY);
  const val = result[TAB_KEY];
  return val === "online" || val === "bookmarks" || val === "sync"
    ? val
    : "online";
}

/** Persist the selected tab. */
export async function saveTab(tab: SearchTab): Promise<void> {
  await browser.storage.local.set({ [TAB_KEY]: tab });
}

/** Load the last search query from storage. */
export async function loadQuery(): Promise<string> {
  const result = await browser.storage.local.get(QUERY_KEY);
  return typeof result[QUERY_KEY] === "string" ? result[QUERY_KEY] : "";
}

/** Persist the search query. */
export async function saveQuery(query: string): Promise<void> {
  await browser.storage.local.set({ [QUERY_KEY]: query });
}

/** Load the tool left open in the popup, if any. */
export async function loadOpenTool(): Promise<Tool | null> {
  const result = await browser.storage.local.get(OPEN_TOOL_KEY);
  return (result[OPEN_TOOL_KEY] as Tool | undefined) ?? null;
}

/** Persist the tool open in the popup, or forget it (null) once it's closed. */
export async function saveOpenTool(tool: Tool | null): Promise<void> {
  if (tool) {
    await browser.storage.local.set({ [OPEN_TOOL_KEY]: tool });
  } else {
    await browser.storage.local.remove(OPEN_TOOL_KEY);
  }
}

/** Load where a click on a tool opens it (a new tab unless changed in the settings). */
export async function loadOpenToolsIn(): Promise<OpenToolsIn> {
  const result = await browser.storage.local.get(OPEN_TOOLS_IN_KEY);
  return result[OPEN_TOOLS_IN_KEY] === "popup" ? "popup" : "tab";
}

/** Persist where a click on a tool opens it. */
export async function saveOpenToolsIn(value: OpenToolsIn): Promise<void> {
  await browser.storage.local.set({ [OPEN_TOOLS_IN_KEY]: value });
}

/** Whether the warning above tools opened in the popup was turned off ("Don't show again"). */
export async function loadPopupWarningHidden(): Promise<boolean> {
  const result = await browser.storage.local.get(POPUP_WARNING_HIDDEN_KEY);
  return result[POPUP_WARNING_HIDDEN_KEY] === true;
}

/** Turn off the warning above tools opened in the popup for good. */
export async function savePopupWarningHidden(): Promise<void> {
  await browser.storage.local.set({ [POPUP_WARNING_HIDDEN_KEY]: true });
}

/** Load all bookmarked tools from storage. */
export async function loadBookmarks(): Promise<Tool[]> {
  const result = await browser.storage.local.get(BOOKMARKS_KEY);
  return (result[BOOKMARKS_KEY] as Tool[] | undefined) ?? [];
}

/** Persist the full bookmarks list. */
async function saveBookmarks(bookmarks: Tool[]): Promise<void> {
  await browser.storage.local.set({ [BOOKMARKS_KEY]: bookmarks });
}

/** Add a tool to bookmarks. No-op if already bookmarked (matched by url). */
export async function addBookmark(tool: Tool): Promise<Tool[]> {
  const bookmarks = await loadBookmarks();
  if (bookmarks.some((b) => b.url === tool.url)) return bookmarks;
  bookmarks.push(tool);
  await saveBookmarks(bookmarks);
  return bookmarks;
}

/** Remove a tool from bookmarks by url. */
export async function removeBookmark(url: string): Promise<Tool[]> {
  const bookmarks = (await loadBookmarks()).filter((b) => b.url !== url);
  await saveBookmarks(bookmarks);
  return bookmarks;
}

/** Clear all locally-stored bookmarks (used once bookmarks are synced to a remote account). */
export async function clearBookmarks(): Promise<void> {
  await browser.storage.local.remove(BOOKMARKS_KEY);
}

/** Load the stored RapidToolSet bearer token, if connected. */
export async function loadAuthToken(): Promise<string | null> {
  const result = await browser.storage.local.get(AUTH_TOKEN_KEY);
  return typeof result[AUTH_TOKEN_KEY] === "string"
    ? result[AUTH_TOKEN_KEY]
    : null;
}

/** Persist the RapidToolSet bearer token. */
export async function saveAuthToken(token: string): Promise<void> {
  await browser.storage.local.set({ [AUTH_TOKEN_KEY]: token });
}

/** Remove the stored RapidToolSet bearer token (disconnects sync). */
export async function clearAuthToken(): Promise<void> {
  await browser.storage.local.remove(AUTH_TOKEN_KEY);
}

/** Load the timestamp (ms) of the last successful sync. */
export async function loadLastSyncedAt(): Promise<number | null> {
  const result = await browser.storage.local.get(LAST_SYNCED_KEY);
  return typeof result[LAST_SYNCED_KEY] === "number"
    ? result[LAST_SYNCED_KEY]
    : null;
}

/** Persist the timestamp (ms) of the last successful sync. */
export async function saveLastSyncedAt(timestamp: number): Promise<void> {
  await browser.storage.local.set({ [LAST_SYNCED_KEY]: timestamp });
}
