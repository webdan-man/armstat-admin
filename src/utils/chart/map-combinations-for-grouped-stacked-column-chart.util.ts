import type { MetricCombination } from "@/types/metric";
import { orderSeriesKeysIfGender } from "@/utils/chart/gender-chart-order.util";

export type GroupedStackedColumnChartRow = {
  category: string;
  realName: string;
  provider: string;
  [field: string]: string | number;
};

export type GroupedStackedDimension = {
  field: string;
  label: string;
};

export function countUniqueForAttr(combinations: MetricCombination[], attributeId: string): number {
  const titles = new Set<string>();
  for (const item of combinations) {
    const title = item.row?.find((r) => r.attributeId === attributeId)?.value?.title;
    if (title) titles.add(title);
  }
  return titles.size;
}

/**
 * Maps 3-attribute combinations with 2+ "other"-category attributes into a
 * two-level grouped stacked column chart format.
 *
 * - outerAttributeId → outer X axis category (range groups)
 * - innerAttributeId → inner X axis subtype (individual column positions)
 * - stackAttributeId → stack dimension (column layers per subtype)
 *
 * Output row shape: { category, realName, provider, [stackValue]: number, … }
 */
export const mapCombinationsForGroupedStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  outerAttributeId: string;
  innerAttributeId: string;
  stackAttributeId: string;
}): {
  data: GroupedStackedColumnChartRow[];
  stackDimensions: GroupedStackedDimension[];
} => {
  const { combinations, outerAttributeId, innerAttributeId, stackAttributeId } = payload;

  // nested: outer → inner → stackVal → sum
  const nested = new Map<string, Map<string, Map<string, number>>>();
  const stackValues = new Set<string>();

  for (const item of combinations) {
    let outer: string | undefined;
    let inner: string | undefined;
    let stack: string | undefined;

    for (const row of item.row ?? []) {
      if (row.attributeId === outerAttributeId) outer = row.value?.title;
      else if (row.attributeId === innerAttributeId) inner = row.value?.title;
      else if (row.attributeId === stackAttributeId) stack = row.value?.title;
    }

    if (!outer || !inner || !stack) continue;

    stackValues.add(stack);

    if (!nested.has(outer)) nested.set(outer, new Map());
    const innerMap = nested.get(outer)!;
    if (!innerMap.has(inner)) innerMap.set(inner, new Map());
    const stackMap = innerMap.get(inner)!;

    stackMap.set(stack, (stackMap.get(stack) ?? 0) + (Number(item.value) || 0));
  }

  const data: GroupedStackedColumnChartRow[] = [];

  for (const [outer, innerMap] of nested) {
    for (const [inner, stackMap] of innerMap) {
      const row: GroupedStackedColumnChartRow = {
        category: `${outer}_${inner}`,
        realName: inner,
        provider: outer,
      };

      for (const [stackVal, total] of stackMap) {
        row[stackVal] = total;
      }

      data.push(row);
    }
  }

  const orderedStackValues = orderSeriesKeysIfGender(stackValues);
  const stackDimensions: GroupedStackedDimension[] = orderedStackValues.map((v) => ({
    field: v,
    label: v,
  }));

  return { data, stackDimensions };
};