export function getColumnChartYAxisMin(
  rows: Record<string, string | number>[],
  keys: string[]
): number {
  if (keys.length === 0) return 0;

  let min = Infinity;
  for (const row of rows) {
    for (const key of keys) {
      const value = Number(row[key]);
      if (Number.isFinite(value) && value < min) {
        min = value;
      }
    }
  }

  // When the data minimum is 0 or positive, anchor the axis at 0 so zero is visible.
  if (!Number.isFinite(min) || min >= 0) {
    return 0;
  }

  return min;
}
