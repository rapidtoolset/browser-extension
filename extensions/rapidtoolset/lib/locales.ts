/**
 * Locales supported by RapidToolSet's UI and API, using the website's locale
 * codes (and order). Single source of truth.
 *
 * Each has a `public/_locales/<locale>/messages.json`, except Norwegian ("no"),
 * whose messages are in `_locales/nb`: browsers call Norwegian Bokmål "nb", and
 * Chrome doesn't pick up a `_locales/no` folder for it.
 */
export const SUPPORTED_LOCALES = [
  "en",
  "fr",
  "de",
  "it",
  "no",
  "ru",
  "es",
  "pt",
  "sv",
  "fi",
  "pl",
  "ar",
  "nl",
  "tr",
  "el",
  "ja",
] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}

/** Whether the locale's script runs right to left. */
export function isRtlLocale(locale: Locale): boolean {
  return locale === "ar";
}
