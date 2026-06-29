import { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { resolveGenderSeriesKeysForPyramid } from "@/utils/chart/gender-chart-order.util";

/** One flat row per gender × age × frame combination, as the pyramid chart expects. */
export type PyramidRow = {
  sex: string;
  age: string;
  /** Numeric position on the timeline axis (calendar year, or a frame ordinal). */
  year: number;
  value: number;
  /** Display label for the frame on the timeline (X2) axis — the area/other value title. */
  frameLabel: string;
};

export type PyramidResult = {
  data: PyramidRow[];
  /** [femaleLabel, maleLabel] — the gender titles found, female first. */
  seriesKeys: string[];
  /**
   * Whether the timeline (X2) axis represents real calendar years ("time") or a
   * categorical frame dimension — area/other — rendered by label ("category").
   */
  timelineMode: "time" | "category";
};

// Gender titles ordered [female, male] — matches the pyramid chart's seriesKeys convention.
function orderGenders(genders: Set<string>): string[] {
  return resolveGenderSeriesKeysForPyramid(genders) ?? Array.from(genders).sort((a, b) => a.localeCompare(b));
}

// Parse a calendar year out of a time value title (e.g. "2026" or "2026 թ.").
function toYear(title: string): number {
  const direct = Number(title);
  if (Number.isFinite(direct)) return direct;
  const match = title.match(/\d{4}/);
  return match ? Number(match[0]) : NaN;
}

// Distinct frame value titles present for an attribute across all combinations.
function collectFrameTitles(combinations: MetricCombination[], attributeId: string): string[] {
  const titles = new Set<string>();
  for (const item of combinations) {
    for (const row of item.row) {
      if (row.attributeId === attributeId && row.value?.title) titles.add(row.value.title);
    }
  }
  return Array.from(titles);
}

// Shared builder: `resolveYear` turns the frame value title into a timeline position.
function buildPyramidRows(payload: {
  combinations: MetricCombination[];
  genderAttributeId: string;
  ageAttributeId: string;
  frameAttributeId: string;
  resolveYear: (frameTitle: string, frameValueId: string) => number;
}): Omit<PyramidResult, "timelineMode"> {
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
    data.push({ sex: gender, age, year, value: Number(item.value), frameLabel: frameTitle });
  }

  return { data, seriesKeys: orderGenders(genders) };
}

/**
 * Gender + Age + Time → population pyramid framed by the TIME dimension.
 *
 * A TIME attribute can hold real calendar years (e.g. 2015, 2016 → a continuous date axis)
 * or categorical periods such as days of the week or months (→ labelled, ordinal frames).
 * We use a real-year timeline only when every time value is a distinct calendar year;
 * otherwise we frame by label, exactly like Area/Other.
 */
export function mapCombinationsForPyramid(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
}): PyramidResult {
  const { combinations, attributeMapByCategory } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
  const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

  const timeTitles = collectFrameTitles(combinations, timeAttributeId);
  const years = timeTitles.map(toYear);
  const allRealYears =
    timeTitles.length > 0 &&
    years.every((y) => Number.isFinite(y)) &&
    new Set(years).size === timeTitles.length;

  // Categorical time (days, months, …) → frame by label, just like Area/Other.
  if (!allRealYears) {
    return mapCombinationsForPyramidByFrameCategory({
      combinations,
      attributeMapByCategory,
      frameAttributeId: timeAttributeId,
    });
  }

  return {
    ...buildPyramidRows({
      combinations,
      genderAttributeId,
      ageAttributeId,
      frameAttributeId: timeAttributeId,
      resolveYear: (frameTitle) => toYear(frameTitle),
    }),
    timelineMode: "time",
  };
}

/**
 * Gender + Age + (Area OR Other), or categorical Time → pyramid framed by a labelled dimension.
 *
 * Each frame value gets a sequential integer position (ordered by the frame attribute's value
 * `number`, falling back to first appearance) used purely as the internal frame key; the chart
 * renders the frame's title on a categorical X2 axis via each row's `frameLabel`.
 */
export function mapCombinationsForPyramidByFrameCategory(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  frameAttributeId: string;
}): PyramidResult {
  const { combinations, attributeMapByCategory, frameAttributeId } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

  // Stable order for frame values: by the attribute's value `number`, falling back to title.
  const frameAttribute = Array.from(attributeMapByCategory.values()).find(
    (attr) => attr._id === frameAttributeId
  );
  const orderByValueId = new Map<string, number>();
  frameAttribute?.values
    .slice()
    .sort((a, b) => a.number - b.number)
    .forEach((value, index) => orderByValueId.set(value._id, index));

  // Base year is arbitrary; only the relative ordering of frames matters.
  const BASE_YEAR = 2000;
  const fallbackOrder = new Map<string, number>();

  return {
    ...buildPyramidRows({
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
    }),
    timelineMode: "category",
  };
}
