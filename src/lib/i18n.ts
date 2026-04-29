export const locales = ["hy", "en", "ru"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "hy";
