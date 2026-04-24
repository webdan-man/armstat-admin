import type { MetricCombination } from "@/types/metric";

export const aggregateByAttributeTitle = (
  combinations: MetricCombination[],
  attributeId: string
): Map<string, number> => {
  const totals = new Map<string, number>();

  for (const item of combinations) {
    const entry = (item.row ?? []).find((r) => r.attributeId === attributeId);
    const title = entry?.value?.title ?? "Unknown";
    const value = Number(item.value) || 0;
    totals.set(title, (totals.get(title) ?? 0) + value);
  }

  return totals;
};
