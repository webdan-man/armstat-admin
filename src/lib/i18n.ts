export const locales = ["hy", "en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hy";

/** Cookie + localStorage key under which the active locale is persisted. */
export const LANG_COOKIE = "armstat_lang";
export const LANG_STORAGE_KEY = "armstat_lang";

/** Narrows an arbitrary string to a supported Locale, or null. */
export function parseLocale(value: string | null | undefined): Locale | null {
  if (value && (locales as readonly string[]).includes(value)) {
    return value as Locale;
  }
  return null;
}

/** A value localized per supported locale (e.g. CMS title/description). */
export type Localized = Record<string, string | undefined>;

/** Reads the value for `locale` from a localized record, falling back to "". */
export function pickLocale(value?: Localized, locale: Locale = defaultLocale) {
  if (!value) return undefined;
  return value[locale] ?? "";
}
