import { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { AttributeCategory } from "@/constants/attribute-category.constants";

/** One flat row per gender × age × frame combination, as the pyramid chart expects. */
export type PyramidRow = {
  sex: string;
  age: string;
  /** Numeric position on the timeline axis (calendar year, or a frame ordinal). */
  year: number;
  value: number;
};

export type PyramidResult = {
  data: PyramidRow[];
  /** [maleLabel, femaleLabel] — the gender titles found, male first. */
  seriesKeys: string[];
};

// The pyramid chart treats this gender as the right-hand (positive) side.
const MALE_TITLE = "Արական";

// Gender titles ordered so the male side is first (matches the chart's series order).
function orderGenders(genders: Set<string>): string[] {
  return Array.from(genders).sort((a, b) => {
    if (a === MALE_TITLE) return -1;
    if (b === MALE_TITLE) return 1;
    return a.localeCompare(b);
  });
}

// Parse a calendar year out of a time value title (e.g. "2026" or "2026 թ.").
function toYear(title: string): number {
  const direct = Number(title);
  if (Number.isFinite(direct)) return direct;
  const match = title.match(/\d{4}/);
  return match ? Number(match[0]) : NaN;
}

// Shared builder: `resolveYear` turns the frame value title into a timeline position.
function buildPyramidRows(payload: {
  combinations: MetricCombination[];
  genderAttributeId: string;
  ageAttributeId: string;
  frameAttributeId: string;
  resolveYear: (frameTitle: string, frameValueId: string) => number;
}): PyramidResult {
  const { combinations, genderAttributeId, ageAttributeId, frameAttributeId, resolveYear } =
    payload;

  const data: PyramidRow[] = [];
  const genders = new Set<string>();

  for (const item of combinations) {
    let gender: string | undefined;
    let age: string | undefined;
    let frameTitle: string | undefined;
    let frameValueId: string | undefined;

    for (const row of item.row) {
      if (row.attributeId === genderAttributeId) {
        gender = row.value?.title;
      } else if (row.attributeId === ageAttributeId) {
        age = row.value?.title;
      } else if (row.attributeId === frameAttributeId) {
        frameTitle = row.value?.title;
        frameValueId = row.value?._id;
      }
    }

    if (!gender || !age || frameTitle === undefined) continue;

    const year = resolveYear(frameTitle, frameValueId ?? "");
    if (!Number.isFinite(year)) continue;

    genders.add(gender);
    data.push({ sex: gender, age, year, value: Number(item.value) });
  }

  return { data, seriesKeys: orderGenders(genders) };
}

/**
 * Gender + Age + Time → population pyramid with a real calendar-year timeline.
 */
export function mapCombinationsForPyramid(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
}): PyramidResult {
  const { combinations, attributeMapByCategory } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
  const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

  return buildPyramidRows({
    combinations,
    genderAttributeId,
    ageAttributeId,
    frameAttributeId: timeAttributeId,
    resolveYear: (frameTitle) => toYear(frameTitle),
  });
}

/**
 * Gender + Age + (Area OR Other) → population pyramid framed by a non-time dimension.
 *
 * The chart's timeline axis is date-based, so each frame value is mapped to a synthetic
 * sequential year (ordered by the frame attribute's value `number`). The pyramid still
 * steps through frames correctly; only the timeline tick labels read as ordinals.
 */
export function mapCombinationsForPyramidByFrameCategory(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  frameAttributeId: string;
}): PyramidResult {
  console.log("asdsds");
  const { combinations, attributeMapByCategory, frameAttributeId } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

  // Stable order for frame values: by the attribute's value `number`, falling back to title.
  const frameAttribute = Array.from(attributeMapByCategory.values()).find(
    (attr) => attr._id === frameAttributeId
  );
  console.log("frameAttribute", frameAttribute);
  const orderByValueId = new Map<string, number>();
  frameAttribute?.values
    .slice()
    .sort((a, b) => a.number - b.number)
    .forEach((value, index) => orderByValueId.set(value._id, index));

  // Base year is arbitrary; only the relative ordering of frames matters.
  const BASE_YEAR = 2000;
  const fallbackOrder = new Map<string, number>();

  return buildPyramidRows({
    combinations,
    genderAttributeId,
    ageAttributeId,
    frameAttributeId,
    resolveYear: (frameTitle, frameValueId) => {
      let index = orderByValueId.get(frameValueId);
      if (index === undefined) {
        // Frame value not declared on the attribute — keep a stable order by first appearance.
        index = fallbackOrder.get(frameTitle);
        if (index === undefined) {
          index = fallbackOrder.size;
          fallbackOrder.set(frameTitle, index);
        }
        index += orderByValueId.size;
      }
      return BASE_YEAR + index;
    },
  });
}
