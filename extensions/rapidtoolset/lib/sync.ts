import { browser } from 'wxt/browser'
import { t } from './i18n'
import type { RemoteBookmark, RemoteUser, Tool } from './types'

/**
 * Base origin for the RapidToolSet API (search + account/sync). Configurable
 * via the WXT_RAPIDTOOLSET_API_URL env var (see .env / .env.development at
 * the repo root) so dev builds can point at a local/staging instance while
 * prod builds use the public site.
 */
export const RAPIDTOOLSET_BASE_URL = "https://rapidtoolset.com";

const AUTHORIZE_URL = `${RAPIDTOOLSET_BASE_URL}/en/authorize`
const USER_ENDPOINT = `${RAPIDTOOLSET_BASE_URL}/api/public/user`
const BOOKMARKS_ENDPOINT = `${RAPIDTOOLSET_BASE_URL}/api/public/bookmarks`

/**
 * Launches the RapidToolSet consent screen via the browser's identity flow and
 * resolves with the issued bearer token, or throws if denied/cancelled.
 */
export async function authorizeRapidToolSet(): Promise<string> {
  const redirectUri = browser.identity.getRedirectURL()
  const authUrl = `${AUTHORIZE_URL}?redirect_uri=${encodeURIComponent(redirectUri)}`

  const redirectUrl = await browser.identity.launchWebAuthFlow({ url: authUrl, interactive: true })
  if (!redirectUrl) throw new Error(t('syncErrorCancelled'))

  const params = new URLSearchParams(new URL(redirectUrl).hash.slice(1))
  const error = params.get('error')
  if (error) throw new Error(error === 'access_denied' ? t('syncErrorDenied') : error)

  const token = params.get('token')
  if (!token) throw new Error(t('syncErrorNoToken'))
  return token
}

async function request<T>(url: string, token: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    ...init,
    headers: {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
      ...init?.headers,
    },
  })

  if (res.status === 401) throw new Error(t('syncErrorExpired'))
  if (!res.ok) throw new Error(t('syncErrorRequestFailed', String(res.status)))

  return res.json() as Promise<T>
}

/** Fetch the signed-in RapidToolSet account's basic profile info. */
export async function fetchRemoteUser(token: string): Promise<RemoteUser> {
  const body = await request<{ data: RemoteUser }>(USER_ENDPOINT, token)
  return body.data
}

/** Fetch the bookmarks stored for the account, with name/description in the given locale. */
export async function fetchRemoteBookmarks(token: string, locale?: string): Promise<RemoteBookmark[]> {
  const url = locale ? `${BOOKMARKS_ENDPOINT}?locale=${encodeURIComponent(locale)}` : BOOKMARKS_ENDPOINT
  const body = await request<{ data: { bookmarks: RemoteBookmark[] } }>(url, token)
  return body.data?.bookmarks ?? []
}

/** Upsert one or more aliases (bookmark urls). Returns the full merged list of aliases. */
export async function upsertRemoteBookmarks(token: string, aliases: string[]): Promise<string[]> {
  const body = await request<{ data: { bookmarks: string[] } }>(BOOKMARKS_ENDPOINT, token, {
    method: 'POST',
    body: JSON.stringify({ aliases }),
  })
  return body.data?.bookmarks ?? []
}

/** Remove a single alias (bookmark url). Returns the remaining list of aliases. */
export async function deleteRemoteBookmark(token: string, alias: string): Promise<string[]> {
  const body = await request<{ data: { bookmarks: string[] } }>(BOOKMARKS_ENDPOINT, token, {
    method: 'DELETE',
    body: JSON.stringify({ alias }),
  })
  return body.data?.bookmarks ?? []
}

/**
 * Extracts the RapidToolSet alias (slug) from a full tool URL, e.g.
 * `https://rapidtoolset.com/en/tool/audio-fingerprint-calculator` -> `audio-fingerprint-calculator`.
 * Returns the input unchanged if it isn't a URL (i.e. it's already a bare alias).
 */
export function extractAlias(urlOrAlias: string): string {
  try {
    const segments = new URL(urlOrAlias).pathname.split('/').filter(Boolean)
    return segments[segments.length - 1] || urlOrAlias
  } catch {
    return urlOrAlias
  }
}

/** Converts a remote bookmark entry (alias + localized name/description) into a local Tool. */
export function toBookmarkTool(bookmark: RemoteBookmark, locale = 'en'): Tool {
  return {
    url: `${RAPIDTOOLSET_BASE_URL}/${locale}/tool/${bookmark.alias}`,
    name: bookmark.name || bookmark.alias,
    description: bookmark.description || t('syncedBookmarkDescription'),
  }
}
