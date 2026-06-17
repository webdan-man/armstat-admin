/** Natural sort for axis category labels (e.g. age groups: 0-4, 5-9, 10-14). */
export function compareCategoryLabels(a: string, b: string): number {
  return a.localeCompare(b, undefined, { numeric: true, sensitivity: "base" });
}
