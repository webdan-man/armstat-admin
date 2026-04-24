import type { MetricCombination } from "@/types/metric";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";

export const mapCombinationsForMapAndStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  stackedAttributeId: string;
  genderAttributeId: string;
  provinceAttributeId: string;
  xAxisKey: string;
}) => {
  const { combinations, stackedAttributeId, genderAttributeId, provinceAttributeId, xAxisKey } = payload;

  const resultMap = new Map<string, Record<string, number | string>>();
  const series = new Set<string>(); // dynamic series (genders)

  for (const item of combinations) {
    let gender: string | undefined;
    let stackedValue: string | undefined;

    for (const row of item.row ?? []) {
      if (row.attributeId === genderAttributeId) {
        gender = row.value?.title;
      } else if (row.attributeId === stackedAttributeId) {
        stackedValue = row.value?.title;
      }

      if (gender && stackedValue) break;
    }

    if (!stackedValue || !gender) continue;

    series.add(gender);

    let entry = resultMap.get(stackedValue);
    if (!entry) {
      entry = { [xAxisKey]: stackedValue };
      resultMap.set(stackedValue, entry);
    }

    const prev = Number(entry[gender] ?? 0) || 0;
    entry[gender] = prev + (Number(item.value) || 0);
  }

  const columnData = Array.from(resultMap.values());
  const seriesKeys = Array.from(series);
  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    data: { columnData, mapData },
    seriesKeys,
  };
};

