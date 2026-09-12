import { browser } from 'wxt/browser'
import { defineBackground } from 'wxt/utils/define-background'
import { saveAuthToken } from '../lib/storage'
import { AUTHORIZE_MESSAGE, authorizeRapidToolSet } from '../lib/sync'

/**
 * Runs the RapidToolSet OAuth flow on behalf of the popup (see `requestAuthorization()` in
 * lib/sync.ts for why the popup can't run it directly). Persists the token itself so it's
 * not lost if the popup is torn down mid-flow.
 */
export default defineBackground(() => {
  browser.runtime.onMessage.addListener((message: unknown) => {
    if (!message || typeof message !== 'object' || (message as { type?: unknown }).type !== AUTHORIZE_MESSAGE) {
      return
    }

    return authorizeRapidToolSet()
      .then(async (token) => {
        await saveAuthToken(token)
        return { token }
      })
      .catch((err: unknown) => ({ error: err instanceof Error ? err.message : String(err) }))
  })
})
