import { MetricCombination } from "@/types/metric";
import { Attribute } from "@/types/attribute";

export const createCombinationAttributesMap = (paylod: {
  combinations: MetricCombination[];
  attributes: Attribute[];
}) => {
  const { combinations, attributes } = paylod;

  const metricAttributes = combinations.flatMap((c) => c.row).map((r) => r.attributeId);

  return new Map(
    attributes.filter((a) => metricAttributes.includes(a._id)).map((a) => [a.category, a])
  );
};
