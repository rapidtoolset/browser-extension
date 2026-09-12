import { browser } from "wxt/browser";
import { isSupportedLocale, type Locale } from "./locales";

type MessageKey = Parameters<typeof browser.i18n.getMessage>[0];

export type { Locale };

/** Thin wrapper around browser.i18n.getMessage with English fallback. */
export function t(key: MessageKey, substitutions?: string | string[]): string {
  return browser.i18n.getMessage(key, substitutions) || key;
}

/** Current UI locale, constrained to the locales RapidToolSet supports (falls back to 'en'). */
export function getLocale(): Locale {
  const uiLang = browser.i18n.getUILanguage().split("-")[0].toLowerCase();
  return isSupportedLocale(uiLang) ? uiLang : "en";
}
