import { MetricCombination } from "@/types/metric";

export const mapCombinationsForColumnsWithRotatedLabels = (combinations: MetricCombination[]) =>
  combinations.map((item) => ({
    value: Number(item.value),
    xAxisKey: item.row?.[0]?.value?.title ?? "Unknown",
  }));
