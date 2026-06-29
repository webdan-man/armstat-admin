export type GenderRole = "male" | "female";

export const MALE_GENDER_TITLE = "Արական";
export const FEMALE_GENDER_TITLE = "Իգական";

const MALE_LABELS = [
  MALE_GENDER_TITLE,
  "Мужской",
  "Male",
  "M",
  "Men",
  "Man",
  "Males",
];

const FEMALE_LABELS = [
  FEMALE_GENDER_TITLE,
  "Женский",
  "Female",
  "F",
  "Women",
  "Woman",
  "Females",
];

const MALE_NORMALIZED = new Set(MALE_LABELS.map((label) => label.trim().toLowerCase()));
const FEMALE_NORMALIZED = new Set(FEMALE_LABELS.map((label) => label.trim().toLowerCase()));

export function classifyGenderKey(key: string): GenderRole | null {
  const lower = key.trim().toLowerCase();
  if (MALE_NORMALIZED.has(lower)) return "male";
  if (FEMALE_NORMALIZED.has(lower)) return "female";
  return null;
}

/** Bottom → top stack order: male at the base, female on top. */
export function resolveGenderStackKeysBottomToTop(keys: Iterable<string>): string[] | null {
  const list = Array.from(keys);
  let maleKey: string | undefined;
  let femaleKey: string | undefined;

  for (const key of list) {
    const role = classifyGenderKey(key);
    if (role === "male") maleKey = key;
    else if (role === "female") femaleKey = key;
  }

  if (!maleKey || !femaleKey) return null;
  return [maleKey, femaleKey];
}

/** Pyramid / seriesKeys: female label first, male second. */
export function resolveGenderSeriesKeysForPyramid(keys: Iterable<string>): string[] | null {
  const bottomToTop = resolveGenderStackKeysBottomToTop(keys);
  if (!bottomToTop) return null;
  return [...bottomToTop].reverse();
}

export function isGenderSeriesKeys(keys: Iterable<string>): boolean {
  return resolveGenderStackKeysBottomToTop(keys) != null;
}

export function getGenderSeriesPaletteIndex(key: string): 0 | 1 | null {
  const role = classifyGenderKey(key);
  if (role === "male") return 0;
  if (role === "female") return 1;
  return null;
}

/** Horizontal negative bar: female left, male right. */
export function orderGenderSeriesKeysForHorizontalBar(keys: Iterable<string>): string[] {
  return Array.from(keys).sort((a, b) => {
    const aRole = classifyGenderKey(a);
    const bRole = classifyGenderKey(b);
    if (aRole === "female" && bRole !== "female") return -1;
    if (bRole === "female" && aRole !== "female") return 1;
    return a.localeCompare(b);
  });
}

export function buildGenderStackTooltipLabel(
  maleKey: string,
  femaleKey: string,
  categoryField = "categoryX"
): string {
  return `[bold]{${categoryField}}[/]\n[font-size: 20]${femaleKey}     [bold]{${femaleKey}}[/]\n${maleKey}     [bold]{${maleKey}}[/]`;
}

/** If keys are a gender pair, return bottom→top order; otherwise use fallback. */
export function orderSeriesKeysIfGender(
  keys: Iterable<string>,
  fallback?: (list: string[]) => string[]
): string[] {
  const list = Array.from(keys);
  return resolveGenderStackKeysBottomToTop(list) ?? fallback?.(list) ?? list;
}

export function resolveGenderLabelsFromSeriesKeys(
  seriesKeys: string[],
  defaults: { male: string; female: string }
): { maleLabel: string; femaleLabel: string } {
  const bottomToTop = resolveGenderStackKeysBottomToTop(seriesKeys);
  if (bottomToTop) {
    return { maleLabel: bottomToTop[0], femaleLabel: bottomToTop[1] };
  }
  return { maleLabel: defaults.male, femaleLabel: defaults.female };
}

/** Negative horizontal bar: female on the left, male on the right. */
export function resolveGenderHorizontalBarKeys(
  seriesKeys: string[]
): { leftKey: string; rightKey: string } | null {
  if (!isGenderSeriesKeys(seriesKeys)) return null;
  const ordered = orderGenderSeriesKeysForHorizontalBar(seriesKeys);
  return { leftKey: ordered[0], rightKey: ordered[1] };
}
