export type NewsLang = "hy" | "ru" | "en";

/** Localized news text. Persisted per language; legacy records may still be a plain string. */
export type LocalizedNewsText = Partial<Record<NewsLang, string>>;
export type MaybeLocalizedNewsText = string | LocalizedNewsText | null | undefined;

/**
 * Normalizes a news text value (which may be a legacy plain string or a
 * localized object) into a complete `{ hy, ru, en }` record of strings.
 */
export function toLocalizedNewsText(value: MaybeLocalizedNewsText): Record<NewsLang, string> {
  if (typeof value === "string") {
    // The API persists localized text as a JSON string (`{"hy":…,"ru":…,"en":…}`)
    // and returns it as-is. Parse it back so we don't render raw JSON; treat a
    // genuine legacy plain string as the Armenian value.
    const trimmed = value.trim();
    if (trimmed.startsWith("{") && trimmed.endsWith("}")) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (parsed && typeof parsed === "object") {
          return toLocalizedNewsText(parsed as LocalizedNewsText);
        }
      } catch {
        // Not valid JSON — fall through and treat as a plain string.
      }
    }
    return { hy: value, ru: "", en: "" };
  }

  if (value && typeof value === "object") {
    const raw = value as Record<string, unknown>;
    return {
      hy: typeof raw.hy === "string" ? raw.hy : "",
      ru: typeof raw.ru === "string" ? raw.ru : "",
      en: typeof raw.en === "string" ? raw.en : "",
    };
  }

  return { hy: "", ru: "", en: "" };
}

/**
 * Resolves a localized (or legacy string) news text to a single display string:
 * the preferred language first, then a fallback through the remaining languages.
 */
export function resolveLocalizedNewsText(
  value: MaybeLocalizedNewsText,
  preferredLang: NewsLang
): string {
  const localized = toLocalizedNewsText(value);
  const order: NewsLang[] = [preferredLang, "hy", "ru", "en"];
  for (const lang of order) {
    const text = localized[lang].trim();
    if (text) return text;
  }
  return "";
}

export type NewsDateFields = {
  publishedAt?: string | null;
  updatedAt?: string | null;
  createdAt?: string | null;
};

export function getNewsDisplayDate(item: NewsDateFields): string | undefined {
  return item.publishedAt ?? item.updatedAt ?? item.createdAt ?? undefined;
}

export function getNewsSortTime(item: NewsDateFields): number {
  const raw = getNewsDisplayDate(item);
  if (!raw) return 0;

  const time = new Date(raw).getTime();
  return Number.isNaN(time) ? 0 : time;
}

export function compareNewsByLatestDate<T extends NewsDateFields>(a: T, b: T): number {
  return getNewsSortTime(b) - getNewsSortTime(a);
}

export function sortNewsByLatestDate<T extends NewsDateFields>(items: T[]): T[] {
  return [...items].sort(compareNewsByLatestDate);
}

export function pickLatestNews<T extends NewsDateFields>(items: T[], limit = 3): T[] {
  return sortNewsByLatestDate(items).slice(0, limit);
}

export function truncateNewsPreview(text: string, maxLength = 40): string {
  const trimmed = text.trim();
  if (trimmed.length <= maxLength) return trimmed;
  return trimmed.slice(0, maxLength);
}
