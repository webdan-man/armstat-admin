import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForClusteredColumnChart } from "@/utils/chart/map-combinations-for-clustered-column-chart.util";

export const mapCombinationsForMapAndClusteredColumnChart = (payload: {
  combinations: MetricCombination[];
  xAxisAttributeId: Attribute["_id"];
  yAxisAttributeId: Attribute["_id"];
  provinceAttributeId: Attribute["_id"];
  xAxisKey: string;
}) => {
  const { combinations, xAxisAttributeId, yAxisAttributeId, provinceAttributeId, xAxisKey } = payload;

  const { data: columnData, seriesKeys } = mapCombinationsForClusteredColumnChart({
    combinations,
    xAxisAttributeId,
    yAxisAttributeId,
    xAxisKey,
  });

  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    data: { columnData, mapData },
    seriesKeys,
  };
};

