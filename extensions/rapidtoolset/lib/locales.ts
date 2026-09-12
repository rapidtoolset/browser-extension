/** Locales supported by RapidToolSet's UI and API. Single source of truth. */
export const SUPPORTED_LOCALES = ["en", "ru"] as const;

export type Locale = (typeof SUPPORTED_LOCALES)[number];

export function isSupportedLocale(value: string): value is Locale {
  return (SUPPORTED_LOCALES as readonly string[]).includes(value);
}
