import { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { AttributeCategory } from "@/constants/attribute-category.constants";

export type HistoricalPyramidRow = {
  col0: string; // Armenia
  col1: string;
  col2: string;
  col3: number;
  col4: string;
  col5: number; // male
  col6: number; // female
  col7?: string; // optional frame label (when not using TIME)
};

export function mapCombinationsForPyramid(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
}) {
  const { combinations, attributeMapByCategory } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
  const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

  // Deterministic, string-free mapping of the two gender values:
  // - collect gender value._id's present in the dataset
  // - sort to make the assignment stable
  // - first => col5 (positive), second => col6 (negative)
  const genderValueIds = Array.from(
    new Set(
      combinations
        .flatMap((c) => c.row ?? [])
        .filter((r) => r.attributeId === genderAttributeId && r.value?._id)
        .map((r) => r.value._id)
    )
  ).sort();

  const maleGenderValueId = genderValueIds[0];
  const femaleGenderValueId = genderValueIds[1];

  const genderIdToTitle = new Map<string, string>();
  for (const c of combinations) {
    for (const r of c.row ?? []) {
      if (r.attributeId !== genderAttributeId) continue;
      if (!r.value?._id) continue;
      if (genderIdToTitle.has(r.value._id)) continue;
      if (r.value?.title) genderIdToTitle.set(r.value._id, r.value.title);
    }
  }

  const seriesKeys = [
    (maleGenderValueId ? genderIdToTitle.get(maleGenderValueId) : undefined) ?? "Series 1",
    (femaleGenderValueId ? genderIdToTitle.get(femaleGenderValueId) : undefined) ?? "Series 2",
  ];

  const map = new Map<string, HistoricalPyramidRow>();

  for (const item of combinations) {
    let genderValueId: string | undefined;
    let age: string | undefined;
    let year: string | undefined;

    for (const r of item.row) {
      if (r.attributeId === genderAttributeId) genderValueId = r.value?._id;
      else if (r.attributeId === ageAttributeId) age = r.value?.title;
      else if (r.attributeId === timeAttributeId) year = r.value?.title;

      if (genderValueId && age && year) break;
    }

    if (!genderValueId || !age || !year) continue;

    const numericValue = Number(item.value || 0);

    const key = `${year}-${age}`;

    if (!map.has(key)) {
      map.set(key, {
        col0: "051", // Armenia
        col1: "Armenia",
        col2: "Medium",
        col3: new Date(Number(year), 0, 1).getTime(), // ✅ timestamp
        col4: age,
        col5: 0, // male
        col6: 0, // female
      });
    }

    const row = map.get(key);

    if (row) {
      if (genderValueId === maleGenderValueId) {
        row.col5 += numericValue;
      } else if (genderValueId === femaleGenderValueId) {
        row.col6 -= numericValue; // keep negative for pyramid
      } else {
        // If dataset includes more than 2 gender values, keep extras on "female" side.
        row.col6 -= numericValue;
      }
    }
  }

  return { data: Array.from(map.values()), seriesKeys };
}

export function mapCombinationsForPyramidByFrameCategory(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  frameAttributeId: Attribute["_id"]; // AREA or OTHER
}) {
  const { combinations, attributeMapByCategory, frameAttributeId } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

  const frameTitles = Array.from(
    new Set(
      combinations
        .flatMap((c) => c.row ?? [])
        .filter((r) => r.attributeId === frameAttributeId && r.value?.title)
        .map((r) => r.value.title as string)
    )
  ).sort();

  // Map frame titles to stable pseudo-years so the existing chart (DateAxis) can animate.
  const baseYear = 2000;
  const frameTitleToYear = new Map<string, number>();
  for (let i = 0; i < frameTitles.length; i++) {
    frameTitleToYear.set(frameTitles[i], baseYear + i);
  }

  // Deterministic, string-free mapping of the two gender values (same as main mapper).
  const genderValueIds = Array.from(
    new Set(
      combinations
        .flatMap((c) => c.row ?? [])
        .filter((r) => r.attributeId === genderAttributeId && r.value?._id)
        .map((r) => r.value._id)
    )
  ).sort();

  const maleGenderValueId = genderValueIds[0];
  const femaleGenderValueId = genderValueIds[1];

  const genderIdToTitle = new Map<string, string>();
  for (const c of combinations) {
    for (const r of c.row ?? []) {
      if (r.attributeId !== genderAttributeId) continue;
      if (!r.value?._id) continue;
      if (genderIdToTitle.has(r.value._id)) continue;
      if (r.value?.title) genderIdToTitle.set(r.value._id, r.value.title);
    }
  }

  const seriesKeys = [
    (maleGenderValueId ? genderIdToTitle.get(maleGenderValueId) : undefined) ?? "Series 1",
    (femaleGenderValueId ? genderIdToTitle.get(femaleGenderValueId) : undefined) ?? "Series 2",
  ];

  const map = new Map<string, HistoricalPyramidRow>();

  for (const item of combinations) {
    let genderValueId: string | undefined;
    let age: string | undefined;
    let frameTitle: string | undefined;

    for (const r of item.row ?? []) {
      if (r.attributeId === genderAttributeId) genderValueId = r.value?._id;
      else if (r.attributeId === ageAttributeId) age = r.value?.title;
      else if (r.attributeId === frameAttributeId) frameTitle = r.value?.title;

      if (genderValueId && age && frameTitle) break;
    }

    if (!genderValueId || !age || !frameTitle) continue;

    const year = frameTitleToYear.get(frameTitle);
    if (!year) continue;

    const numericValue = Number(item.value || 0);

    const key = `${year}-${age}`;

    if (!map.has(key)) {
      map.set(key, {
        col0: "051",
        col1: "Armenia",
        col2: "Medium",
        col3: new Date(Number(year), 0, 1).getTime(),
        col4: age,
        col5: 0,
        col6: 0,
        col7: frameTitle,
      });
    }

    const row = map.get(key);

    if (row) {
      if (genderValueId === maleGenderValueId) {
        row.col5 += numericValue;
      } else if (genderValueId === femaleGenderValueId) {
        row.col6 -= numericValue;
      } else {
        row.col6 -= numericValue;
      }
    }
  }

  return { data: Array.from(map.values()), seriesKeys };
}
