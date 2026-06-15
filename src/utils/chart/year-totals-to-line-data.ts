import { parseYear } from "@/utils/chart/map-combinations-for-line-graph";

interface LineDataItem {
  date: number;
  value: number;
  /** Original category label; present so LineGraphChart can fall back to a category axis. */
  label: string;
}

export const yearTotalsToLineData = (yearTotals: Map<string, number>): LineDataItem[] => {
  const points = Array.from(yearTotals.entries()).map(([title, value]) => ({
    label: title,
    year: parseYear(title),
    value,
  }));

  // When every title carries a real year, plot by actual date (chronological).
  if (points.length > 0 && points.every((p) => p.year !== null)) {
    return points
      .map((p) => ({ date: new Date(p.year!, 0, 1).getTime(), value: p.value, label: p.label }))
      .sort((a, b) => a.date - b.date);
  }

  // Otherwise the titles aren't valid years — keep input order and spread the points over a
  // synthetic yearly axis so the graph still renders. (LineGraphChart switches to a category
  // axis keyed on `label` in this case.)
  const BASE_YEAR = 2000;
  return points.map((p, index) => ({
    date: new Date(BASE_YEAR + index, 0, 1).getTime(),
    value: p.value,
    label: p.label,
  }));
};
