import { MetricCombination } from "@/types/metric";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { Attribute } from "@/types/attribute";
import { orderSeriesKeysIfGender } from "@/utils/chart/gender-chart-order.util";

export const mapCombinationsForStackAreaChart = (payload: {
  combinations: MetricCombination[];
  attributes: Attribute[];
  attributeMapByCategory: Map<string, Attribute>;
}) => {
  const { combinations, attributeMapByCategory } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

  const resultMap = new Map<string, Record<string, number | string>>();
  const categories = new Set<string>(); // dynamic series (e.g. genders)

  for (const item of combinations) {
    let gender: string | undefined;
    let time: string | undefined;

    for (const row of item.row) {
      if (row.attributeId === genderAttributeId) {
        gender = row.value?.title;
      } else if (row.attributeId === timeAttributeId) {
        time = row.value?.title;
      }

      if (gender && time) break;
    }

    if (!time || !gender) continue;

    categories.add(gender);

    let entry = resultMap.get(time);
    if (!entry) {
      entry = { year: time };
      resultMap.set(time, entry);
    }

    entry[gender] = Number(item.value);
  }

  const data = Array.from(resultMap.values()).sort(
    (a, b) => Number(a.year) - Number(b.year),
  );
  const seriesKeys = orderSeriesKeysIfGender(categories);

  return {
    data,
    seriesKeys,
  };
};
