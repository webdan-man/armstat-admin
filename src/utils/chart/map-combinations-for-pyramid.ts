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
