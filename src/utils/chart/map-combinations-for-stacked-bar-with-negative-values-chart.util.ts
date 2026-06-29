import { MetricCombination } from "@/types/metric";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { Attribute } from "@/types/attribute";
import { compareCategoryLabels } from "@/utils/chart/sort-category-labels";
import {
  FEMALE_GENDER_TITLE,
  MALE_GENDER_TITLE,
  orderGenderSeriesKeysForHorizontalBar,
  resolveGenderStackKeysBottomToTop,
  isGenderSeriesKeys,
} from "@/utils/chart/gender-chart-order.util";

export {
  FEMALE_GENDER_TITLE,
  MALE_GENDER_TITLE,
  isGenderSeriesKeys,
  resolveGenderStackKeysBottomToTop,
};

/** @deprecated Use resolveGenderStackKeysBottomToTop */
export function orderGenderSeriesKeysForVerticalStack(keys: Iterable<string>): string[] {
  return resolveGenderStackKeysBottomToTop(keys) ?? Array.from(keys);
}

export function orderGenderSeriesKeys(genders: Set<string> | Iterable<string>): string[] {
  return orderGenderSeriesKeysForHorizontalBar(genders);
}

export const mapCombinationsForStackedBarWithNegativeValuesChartUtil = (payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  yAxisKey: string;
}) => {
  const { combinations, attributeMapByCategory, yAxisKey } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

  const resultMap = new Map<string, Record<string, number | string>>();
  const categories = new Set<string>();

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
    compareCategoryLabels(String(a[yAxisKey]), String(b[yAxisKey]))
  );
  const seriesKeys = orderGenderSeriesKeys(categories);

  return {
    data,
    seriesKeys,
  };
};
