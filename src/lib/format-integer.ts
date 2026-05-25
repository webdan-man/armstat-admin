/** e.g. 1580982 → "1,580,982" */
export function formatIntegerWithCommas(value: number): string {
  if (!Number.isFinite(value)) return "0";
  return Math.trunc(value).toLocaleString("en-US");
}

/** Whole percents that sum to 100 when total > 0. */
export function sexTotalPercents(male: number, female: number): { male: number; female: number } {
  const m = Number.isFinite(male) ? Math.max(0, Math.trunc(male)) : 0;
  const f = Number.isFinite(female) ? Math.max(0, Math.trunc(female)) : 0;
  const sum = m + f;
  if (sum === 0) return { male: 0, female: 0 };
  const malePercent = Math.round((m / sum) * 100);
  return { male: malePercent, female: 100 - malePercent };
}
