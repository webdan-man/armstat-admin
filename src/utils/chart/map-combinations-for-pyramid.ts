import { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { AttributeCategory } from "@/constants/attribute-category.constants";

export function mapCombinationsForPyramid(payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
}) {
  const { combinations, attributeMapByCategory } = payload;

  const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
  const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
  const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

  return { data: [] };
}
