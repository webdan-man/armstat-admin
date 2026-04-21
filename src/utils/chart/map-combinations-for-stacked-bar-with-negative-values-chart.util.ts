import { MetricCombination } from "@/types/metric";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { Attribute } from "@/types/attribute";

export const mapCombinationsForStackedBarWithNegativeValuesChartUtil = (payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  yAxisKey: string;
}) => {
  const { combinations, attributeMapByCategory, yAxisKey } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

  const resultMap = new Map<string, Record<string, number | string>>();
  const categories = new Set<string>(); // dynamic series (e.g. genders)

  for (const item of combinations) {
    let gender: string | undefined;
    let age: string | undefined;

    for (const row of item.row) {
      if (row.attributeId === genderAttributeId) {
        gender = row.value?.title;
      } else if (row.attributeId === ageAttributeId) {
        age = row.value?.title;
      }

      if (gender && age) break;
    }

    if (!age || !gender) continue;

    categories.add(gender);

    let entry = resultMap.get(age);
    if (!entry) {
      entry = { year: age };
      resultMap.set(age, entry);
    }

    entry[gender] = Number(item.value);
  }

  const data = Array.from(resultMap.values()).sort((a, b) =>
    (b[yAxisKey] as string).localeCompare(a[yAxisKey] as string)
  );
  const seriesKeys = Array.from(categories);

  return {
    data,
    seriesKeys,
  };
};
