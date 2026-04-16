import { MetricCombination } from "@/types/metric";

export const mapCombinationsForSemiCirclePieChart = (combinations: MetricCombination[]) =>
  combinations.map((item) => ({
    value: Number(item.value),
    category: item.row?.[0]?.value?.title ?? "Unknown",
  }));
