import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";

export const mapCombinationsForClusteredColumnChart = (payload: {
  combinations: MetricCombination[];
  xAxisAttributeId: Attribute["_id"];
  yAxisAttributeId: Attribute["_id"];
  xAxisKey: string;
}) => {
  const { combinations, xAxisAttributeId, yAxisAttributeId, xAxisKey } = payload;

  const resultMap: Record<string, Record<string, string | number>> = {};
  const seriesKeys: string[] = [];

  for (const item of combinations) {
    const xAxisTitle = item.row.find((r) => r.attributeId === xAxisAttributeId)?.value.title as
      | string
      | undefined;
    const yAxisTitle = item.row.find((r) => r.attributeId === yAxisAttributeId)?.value.title as
      | string
      | undefined;

    if (!xAxisTitle || !yAxisTitle) continue;

    const seriesKey = yAxisTitle;
    if (!seriesKeys.includes(seriesKey)) seriesKeys.push(seriesKey);

    const value = Number(String(item.value).replace(/,/g, ""));

    if (!resultMap[xAxisTitle]) {
      resultMap[xAxisTitle] = { [xAxisKey]: xAxisTitle };
    }

    resultMap[xAxisTitle][seriesKey] = Math.round(value);
  }

  return {
    data: Object.values(resultMap),
    seriesKeys,
  };
};
