/** Active search tab */
export type SearchTab = "online" | "bookmarks" | "sync";

/** A single tool returned from the search API */
export interface Tool {
  alias: string;
  name: string;
  description: string;
  url: string;
}

/** Response shape from GET /api/tools/search */
export interface ToolSearchResponse {
  locale: string;
  total: number;
  tools: Tool[];
}

/** User info returned by GET /api/public/user */
export interface RemoteUser {
  name: string | null;
  email: string;
}

/** A single bookmark entry returned by GET /api/public/bookmarks */
export interface RemoteBookmark {
  alias: string;
  name: string;
  description: string;
}
