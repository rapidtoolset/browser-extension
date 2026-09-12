import { browser } from 'wxt/browser'

type MessageKey = Parameters<typeof browser.i18n.getMessage>[0]

const SUPPORTED_LOCALES = ['en', 'ru'] as const
export type Locale = typeof SUPPORTED_LOCALES[number]

/** Thin wrapper around browser.i18n.getMessage with English fallback. */
export function t(key: MessageKey, substitutions?: string | string[]): string {
  return browser.i18n.getMessage(key, substitutions) || key
}

/** Current UI locale, constrained to the locales RapidToolSet supports (falls back to 'en'). */
export function getLocale(): Locale {
  const uiLang = browser.i18n.getUILanguage().split('-')[0].toLowerCase()
  return SUPPORTED_LOCALES.includes(uiLang as Locale) ? (uiLang as Locale) : 'en'
}
