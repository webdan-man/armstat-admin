import type { MetricCombination } from "@/types/metric";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { resolveGenderStackKeysBottomToTop } from "@/utils/chart/gender-chart-order.util";
import { compareCategoryLabels } from "@/utils/chart/sort-category-labels";

function orderSeriesKeys(keys: Set<string>): string[] {
  const list = Array.from(keys);
  const genderStack = resolveGenderStackKeysBottomToTop(list);
  if (genderStack) return genderStack;
  return list.sort((a, b) => compareCategoryLabels(a, b));
}

export const mapCombinationsForMapAndStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  stackedAttributeId: string;
  seriesAttributeId: string;
  provinceAttributeId: string;
  xAxisKey: string;
}) => {
  const { combinations, stackedAttributeId, seriesAttributeId, provinceAttributeId, xAxisKey } = payload;

  const resultMap = new Map<string, Record<string, number | string>>();
  const series = new Set<string>(); // dynamic series (e.g. gender, age)

  for (const item of combinations) {
    let seriesValue: string | undefined;
    let stackedValue: string | undefined;

    for (const row of item.row ?? []) {
      if (row.attributeId === seriesAttributeId) {
        seriesValue = row.value?.title;
      } else if (row.attributeId === stackedAttributeId) {
        stackedValue = row.value?.title;
      }

      if (seriesValue && stackedValue) break;
    }

    if (!stackedValue || !seriesValue) continue;

    series.add(seriesValue);

    let entry = resultMap.get(stackedValue);
    if (!entry) {
      entry = { [xAxisKey]: stackedValue };
      resultMap.set(stackedValue, entry);
    }

    const prev = Number(entry[seriesValue] ?? 0) || 0;
    entry[seriesValue] = prev + (Number(item.value) || 0);
  }

  const columnData = Array.from(resultMap.values()).sort((a, b) =>
    compareCategoryLabels(String(a[xAxisKey]), String(b[xAxisKey]))
  );
  const seriesKeys = orderSeriesKeys(series);
  const stackSeriesKeysBottomToTop = resolveGenderStackKeysBottomToTop(series);
  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    data: { columnData, mapData },
    seriesKeys,
    stackSeriesKeysBottomToTop: stackSeriesKeysBottomToTop ?? undefined,
  };
};
