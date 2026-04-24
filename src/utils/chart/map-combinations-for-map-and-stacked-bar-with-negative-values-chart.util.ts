import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForStackedBarWithNegativeValuesChartUtil } from "@/utils/chart/map-combinations-for-stacked-bar-with-negative-values-chart.util";

export const mapCombinationsForMapAndStackedBarWithNegativeValuesChart = (payload: {
  combinations: MetricCombination[];
  attributeMapByCategory: Map<string, Attribute>;
  provinceAttributeId: string;
  yAxisKey: string;
}) => {
  const { combinations, attributeMapByCategory, provinceAttributeId, yAxisKey } = payload;

  // Reuse existing mapper: X - GENDER, Y - AGE
  const { data: barData, seriesKeys } = mapCombinationsForStackedBarWithNegativeValuesChartUtil({
    combinations,
    attributeMapByCategory,
    yAxisKey,
  });

  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  // Defensive: ensure required categories exist in the map (helps callers catch issues early)
  if (!attributeMapByCategory.get(AttributeCategory.GENDER) || !attributeMapByCategory.get(AttributeCategory.AGE)) {
    return { data: { barData: [], mapData }, seriesKeys: [] as string[] };
  }

  return {
    data: { barData, mapData },
    seriesKeys,
  };
};

