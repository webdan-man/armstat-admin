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

/**
 * Maps 3 attribute combinations into a clustered+stacked column chart format.
 *
 * Sorting by ascending unique-value count determines the role of each attribute:
 *   - Fewest options  → X axis categories
 *   - Middle options  → Stack layers (stacked within each cluster)
 *   - Most options    → Cluster groups (distinct column groups per X category)
 *
 * Output data format: { [xKey]: xValue, [clusterVal]_[stackVal]: metricValue, … }
 *
 * Example (TIME=4 years, AREA=2 settlements, OTHER=13 items):
 *   AREA → X axis, TIME → stack layers, OTHER → cluster groups
 *   Row: { area: "Քաղաք", vacation_2023: 286, vacation_2024: 384, … }
 */
export const mapCombinationsForClusteredAndStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  attributes: [AttrSpec, AttrSpec, AttrSpec];
}) => {
  const { combinations, attributes } = payload;

  const withCounts = attributes
    .map((a) => ({ ...a, options: uniqueTitlesForAttribute(combinations, a.id) }))
    .sort((a, b) => a.options.length - b.options.length);

  const xAttr = withCounts[0];       // fewest → X axis
  const stackAttr = withCounts[1];   // middle → stack layers
  const clusterAttr = withCounts[2]; // most   → cluster groups

  const clusterKeys = clusterAttr.options;
  const stackKeys = stackAttr.options;

  const resultMap = new Map<string, Record<string, string | number>>();

  for (const item of combinations) {
    const xTitle = item.row?.find((r) => r.attributeId === xAttr.id)?.value?.title;
    const clusterTitle = item.row?.find((r) => r.attributeId === clusterAttr.id)?.value?.title;
    const stackTitle = item.row?.find((r) => r.attributeId === stackAttr.id)?.value?.title;

    if (!xTitle || !clusterTitle || !stackTitle) continue;

    let entry = resultMap.get(xTitle);
    if (!entry) {
      entry = { [xAttr.key]: xTitle };
      resultMap.set(xTitle, entry);
    }

    const fieldName = `${clusterTitle}_${stackTitle}`;
    const prev = Number(entry[fieldName] ?? 0) || 0;
    entry[fieldName] = prev + (Number(item.value) || 0);
  }

  return {
    xAxisKey: xAttr.key,
    data: Array.from(resultMap.values()),
    clusterKeys,
    stackKeys,
    groupedBy: xAttr.key,
    stackedBy: stackAttr.key,
    clusteredBy: clusterAttr.key,
  };
};
