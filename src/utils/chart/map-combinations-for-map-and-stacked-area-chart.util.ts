import type { MetricCombination } from "@/types/metric";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import {
  orderSeriesKeysIfGender,
  resolveGenderStackKeysBottomToTop,
} from "@/utils/chart/gender-chart-order.util";

export const mapCombinationsForMapAndStackedAreaChart = (payload: {
  combinations: MetricCombination[];
  timeAttributeId: string;
  genderAttributeId: string;
  provinceAttributeId: string;
}) => {
  const { combinations, timeAttributeId, genderAttributeId, provinceAttributeId } = payload;

  const resultMap = new Map<string, Record<string, number | string>>();
  const series = new Set<string>(); // dynamic series (genders)

  for (const item of combinations) {
    let gender: string | undefined;
    let time: string | undefined;

    for (const row of item.row ?? []) {
      if (row.attributeId === genderAttributeId) {
        gender = row.value?.title;
      } else if (row.attributeId === timeAttributeId) {
        time = row.value?.title;
      }

      if (gender && time) break;
    }

    if (!time || !gender) continue;

    series.add(gender);

    let entry = resultMap.get(time);
    if (!entry) {
      entry = { year: time };
      resultMap.set(time, entry);
    }

    const prev = Number(entry[gender] ?? 0) || 0;
    entry[gender] = prev + (Number(item.value) || 0);
  }

  const stackedAreaData = Array.from(resultMap.values());
  const seriesKeys = orderSeriesKeysIfGender(series);
  const stackSeriesKeysBottomToTop = resolveGenderStackKeysBottomToTop(series) ?? undefined;
  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    data: { stackedAreaData, mapData },
    seriesKeys,
    stackSeriesKeysBottomToTop,
  };
};

