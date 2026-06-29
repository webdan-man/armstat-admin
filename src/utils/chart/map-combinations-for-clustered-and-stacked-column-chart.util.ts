import type { MetricCombination } from "@/types/metric";
import { orderSeriesKeysIfGender } from "@/utils/chart/gender-chart-order.util";

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
  /**
   * When set, this attribute is forced onto the stack layers (e.g. GENDER) and the
   * remaining two are assigned by CXG: fewer options → X axis, more → cluster groups.
   * When omitted, all three roles are assigned purely by unique-value count.
   */
  stackAttributeId?: string;
  /**
   * When set alongside `stackAttributeId`, this attribute is forced onto the X axis
   * and the remaining third attribute becomes the cluster groups — a fully explicit
   * role assignment that bypasses CXG (e.g. GENDER = stacks, AGE = X, other = clusters).
   */
  xAttributeId?: string;
}) => {
  const { combinations, attributes, stackAttributeId, xAttributeId } = payload;

  const withCounts = attributes.map((a) => ({
    ...a,
    options: uniqueTitlesForAttribute(combinations, a.id),
  }));

  const forcedStack = stackAttributeId
    ? withCounts.find((a) => a.id === stackAttributeId)
    : undefined;
  const forcedX = xAttributeId ? withCounts.find((a) => a.id === xAttributeId) : undefined;

  let xAttr: (typeof withCounts)[number];
  let stackAttr: (typeof withCounts)[number];
  let clusterAttr: (typeof withCounts)[number];

  if (forcedStack && forcedX) {
    stackAttr = forcedStack; // forced → stack layers
    xAttr = forcedX; // forced → X axis
    clusterAttr = withCounts.find((a) => a.id !== forcedStack.id && a.id !== forcedX.id)!; // remaining → cluster groups
  } else if (forcedStack) {
    const rest = withCounts
      .filter((a) => a.id !== forcedStack.id)
      .sort((a, b) => a.options.length - b.options.length);
    stackAttr = forcedStack; // forced → stack layers
    xAttr = rest[0]; // fewer → X axis
    clusterAttr = rest[1]; // more  → cluster groups
  } else {
    const sorted = [...withCounts].sort((a, b) => a.options.length - b.options.length);
    xAttr = sorted[0]; // fewest → X axis
    stackAttr = sorted[1]; // middle → stack layers
    clusterAttr = sorted[2]; // most   → cluster groups
  }

  const clusterKeys = clusterAttr.options;
  const stackKeys = orderSeriesKeysIfGender(stackAttr.options);

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
