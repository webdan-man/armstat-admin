"use client";

import type { MetricCombination } from "@/types/metric";

export function maxRowLength(combinations: MetricCombination[]): number {
  let max = 0;
  for (const combo of combinations) {
    const len = combo.row?.length ?? 0;
    if (len > max) max = len;
  }
  return max;
}

export function headerForColumnIndex(
  combinations: MetricCombination[],
  columnIndex: number
): string {
  for (const combo of combinations) {
    const entry = combo.row?.[columnIndex];
    if (entry) {
      const t = entry.label?.trim();
      return t && t.length > 0 ? `${t}` : entry.attributeId;
    }
  }
  return String(columnIndex + 1);
}

export function valueAtColumnIndex(combo: MetricCombination, columnIndex: number): string {
  const entry = combo.row?.[columnIndex];
  if (!entry) return "—";
  const t = entry.value.title?.trim();
  return t && t.length > 0 ? t : entry.value._id;
}

/** Metric value for table cells: at most 2 decimal places. */
export function formatCombinationValue(value: string | number | undefined | null): string {
  if (value == null || value === "") return "";
  const n = Number(value);
  if (!Number.isFinite(n)) return String(value);
  return new Intl.NumberFormat(undefined, {
    maximumFractionDigits: 2,
    minimumFractionDigits: 0,
  }).format(n);
}
