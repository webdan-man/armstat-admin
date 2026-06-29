import type { MetricCombination } from "@/types/metric";
import { orderSeriesKeysIfGender } from "@/utils/chart/gender-chart-order.util";

function uniqueTitlesForAttribute(combinations: MetricCombination[], attributeId: string): string[] {
  const titles = new Set<string>();

  for (const item of combinations) {
    const title = item.row?.find((r) => r.attributeId === attributeId)?.value?.title;
    if (title) titles.add(title);
  }

  return Array.from(titles);
}

export const mapCombinationsForClusteredColumnChartStacked = (payload: {
  combinations: MetricCombination[];
  genderAttributeId: string;
  firstCtgAttribute: { id: string; key: string }; // TIME
  secondCtgAttribute: { id: string; key: string }; // AREA or OTHER
}) => {
  const { combinations, genderAttributeId, firstCtgAttribute, secondCtgAttribute } = payload;

  const firstOptions = uniqueTitlesForAttribute(combinations, firstCtgAttribute.id);
  const secondOptions = uniqueTitlesForAttribute(combinations, secondCtgAttribute.id);

  // CXG: group by the attribute with fewer options (tie -> first)
  const xAttr =
    firstOptions.length <= secondOptions.length ? firstCtgAttribute : secondCtgAttribute;
  const otherAttr =
    xAttr.id === firstCtgAttribute.id ? secondCtgAttribute : firstCtgAttribute;

  const resultMap = new Map<string, Record<string, string | number>>();
  const series = new Set<string>(); // genders

  for (const item of combinations) {
    let gender: string | undefined;
    let xTitle: string | undefined;

    for (const row of item.row ?? []) {
      if (row.attributeId === genderAttributeId) gender = row.value?.title;
      else if (row.attributeId === xAttr.id) xTitle = row.value?.title;

      if (gender && xTitle) break;
    }

    if (!gender || !xTitle) continue;
    series.add(gender);

    let entry = resultMap.get(xTitle);
    if (!entry) {
      entry = { [xAttr.key]: xTitle };
      resultMap.set(xTitle, entry);
    }

    // Sum across the "other" CXG attribute dimension.
    const prev = Number(entry[gender] ?? 0) || 0;
    entry[gender] = prev + (Number(item.value) || 0);
  }

  return {
    xAxisKey: xAttr.key,
    data: Array.from(resultMap.values()),
    seriesKeys: orderSeriesKeysIfGender(series),
    groupedBy: xAttr.key,
    aggregatedOver: otherAttr.key,
  };
};

