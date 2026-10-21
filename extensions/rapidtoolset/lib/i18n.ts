import { browser } from "wxt/browser";
import type { Locale as DateFnsLocale } from "date-fns";
import { enUS } from "date-fns/locale/en-US";
import { isSupportedLocale, type Locale } from "./locales";

export { t } from "@/lib/i18n";
export type { Locale };

/**
 * Loaded on demand, since each popup needs only one of them (and together they
 * weigh over 100 kB). English is date-fns's built-in default.
 */
const DATE_FNS_LOCALES: Record<
  Exclude<Locale, "en">,
  () => Promise<DateFnsLocale>
> = {
  fr: async () => (await import("date-fns/locale/fr")).fr,
  de: async () => (await import("date-fns/locale/de")).de,
  it: async () => (await import("date-fns/locale/it")).it,
  no: async () => (await import("date-fns/locale/nb")).nb,
  ru: async () => (await import("date-fns/locale/ru")).ru,
  es: async () => (await import("date-fns/locale/es")).es,
  pt: async () => (await import("date-fns/locale/pt")).pt,
  sv: async () => (await import("date-fns/locale/sv")).sv,
  fi: async () => (await import("date-fns/locale/fi")).fi,
  pl: async () => (await import("date-fns/locale/pl")).pl,
  ar: async () => (await import("date-fns/locale/ar")).ar,
  nl: async () => (await import("date-fns/locale/nl")).nl,
  tr: async () => (await import("date-fns/locale/tr")).tr,
  el: async () => (await import("date-fns/locale/el")).el,
  ja: async () => (await import("date-fns/locale/ja")).ja,
};

let dateFnsLocale = enUS;

/** Current UI locale, constrained to the locales RapidToolSet supports (falls back to 'en'). */
export function getLocale(): Locale {
  const uiLang = browser.i18n.getUILanguage().split("-")[0].toLowerCase();
  // Browsers report Norwegian Bokmål as "nb", the website calls it "no"
  const lang = uiLang === "nb" ? "no" : uiLang;
  return isSupportedLocale(lang) ? lang : "en";
}

/** Loads the date-fns locale for the current UI locale, for getDateFnsLocale(). */
export async function loadDateFnsLocale(): Promise<void> {
  const locale = getLocale();
  if (locale !== "en") {
    dateFnsLocale = await DATE_FNS_LOCALES[locale]();
  }
}

/** date-fns locale for formatting dates in the current UI locale (English until loadDateFnsLocale() resolves). */
export function getDateFnsLocale(): DateFnsLocale {
  return dateFnsLocale;
}
