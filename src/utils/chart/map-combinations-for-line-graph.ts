import { MetricCombination } from "@/types/metric";

// Pull a 4-digit year out of a row title ("2026", "2026 թ."); null if there isn't one.
export const parseYear = (title?: string): number | null => {
  if (!title) return null;
  const match = String(title).match(/\d{4}/);
  return match ? Number(match[0]) : null;
};

export const mapCombinationsForLineGraph = (combinations: MetricCombination[]) => {
  const points = combinations
    .map((item) => {
      const title = item.row?.[0]?.value?.title;
      const value = Number(item.value);

      if (!title || isNaN(value)) return null;

      return { label: String(title), year: parseYear(title), value };
    })
    .filter(Boolean) as { label: string; year: number | null; value: number }[];

  // When every title is a real year, plot by actual date (chronological).
  if (points.every((p) => p.year !== null)) {
    return points
      .map((p) => ({ date: new Date(p.year!, 0, 1).getTime(), value: p.value, label: p.label }))
      .sort((a, b) => a.date - b.date);
  }

  // Otherwise the titles aren't valid dates — keep input order and spread the points over a
  // synthetic yearly axis so the graph still renders. (The DateAxis needs valid dates.)
  const BASE_YEAR = 2000;
  return points.map((p, index) => ({
    date: new Date(BASE_YEAR + index, 0, 1).getTime(),
    value: p.value,
    label: p.label,
  }));
};
