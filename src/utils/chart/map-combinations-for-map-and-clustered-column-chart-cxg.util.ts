import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForClusteredColumnChart } from "@/utils/chart/map-combinations-for-clustered-column-chart.util";

function uniqueTitlesForAttribute(combinations: MetricCombination[], attributeId: string): string[] {
  const titles = new Set<string>();
  for (const item of combinations) {
    const title = item.row?.find((r) => r.attributeId === attributeId)?.value?.title;
    if (title) titles.add(title);
  }
  return Array.from(titles);
}

export const mapCombinationsForMapAndClusteredColumnChartCXG = (payload: {
  combinations: MetricCombination[];
  provinceAttributeId: Attribute["_id"];
  areaAttributeId: Attribute["_id"];
  otherAttributeId: Attribute["_id"];
}) => {
  const { combinations, provinceAttributeId, areaAttributeId, otherAttributeId } = payload;

  const areaCount = uniqueTitlesForAttribute(combinations, areaAttributeId).length;
  const otherCount = uniqueTitlesForAttribute(combinations, otherAttributeId).length;

  // CXG: group by the attribute with fewer options (tie -> AREA)
  const x = areaCount <= otherCount
    ? { id: areaAttributeId, key: "area" as const }
    : { id: otherAttributeId, key: "other" as const };
  const series =
    x.id === areaAttributeId
      ? { id: otherAttributeId, key: "other" as const }
      : { id: areaAttributeId, key: "area" as const };

  const { data: columnData, seriesKeys } = mapCombinationsForClusteredColumnChart({
    combinations,
    xAxisAttributeId: x.id,
    yAxisAttributeId: series.id,
    xAxisKey: x.key,
  });

  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    xAxisKey: x.key,
    data: { columnData, mapData },
    seriesKeys,
    groupedBy: x.key,
    seriesBy: series.key,
  };
};

