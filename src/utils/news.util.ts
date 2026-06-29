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
