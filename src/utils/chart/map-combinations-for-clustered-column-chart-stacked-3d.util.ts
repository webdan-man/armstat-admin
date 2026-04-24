import type { MetricCombination } from "@/types/metric";

type AttrSpec = { id: string; key: string };

function uniqueTitlesForAttribute(combinations: MetricCombination[], attributeId: string): string[] {
  const titles = new Set<string>();
  for (const item of combinations) {
    const title = item.row?.find((r) => r.attributeId === attributeId)?.value?.title;
    if (title) titles.add(title);
  }
  return Array.from(titles);
}

export const mapCombinationsForClusteredColumnChartStacked3D = (payload: {
  combinations: MetricCombination[];
  attributes: [AttrSpec, AttrSpec, AttrSpec]; // TIME, AGE, (AREA|OTHER)
}) => {
  const { combinations, attributes } = payload;

  const withCounts = attributes
    .map((a) => ({ ...a, options: uniqueTitlesForAttribute(combinations, a.id) }))
    .sort((a, b) => a.options.length - b.options.length);

  // CYGX: group by the attribute with fewer options.
  // Use the next one as series; aggregate over the last.
  const xAttr = withCounts[0];
  const seriesAttr = withCounts[1];
  const aggregatedOver = withCounts[2];

  const resultMap = new Map<string, Record<string, string | number>>();
  const series = new Set<string>();

  for (const item of combinations) {
    const xTitle = item.row?.find((r) => r.attributeId === xAttr.id)?.value?.title;
    const seriesTitle = item.row?.find((r) => r.attributeId === seriesAttr.id)?.value?.title;
    if (!xTitle || !seriesTitle) continue;

    series.add(seriesTitle);

    let entry = resultMap.get(xTitle);
    if (!entry) {
      entry = { [xAttr.key]: xTitle };
      resultMap.set(xTitle, entry);
    }

    const prev = Number(entry[seriesTitle] ?? 0) || 0;
    entry[seriesTitle] = prev + (Number(item.value) || 0);
  }

  return {
    xAxisKey: xAttr.key,
    data: Array.from(resultMap.values()),
    seriesKeys: Array.from(series),
    groupedBy: xAttr.key,
    seriesBy: seriesAttr.key,
    aggregatedOver: aggregatedOver.key,
  };
};

