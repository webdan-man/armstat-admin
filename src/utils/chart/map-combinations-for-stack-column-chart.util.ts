import { MetricCombination } from "@/types/metric";
import { Attribute } from "@/types/attribute";
import { orderSeriesKeysIfGender } from "@/utils/chart/gender-chart-order.util";

export const mapCombinationsForStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  xAxisAttributeId: Attribute["_id"];
  yAxisAttributeId: Attribute["_id"];
  xAxisKey: string;
}) => {
  const { combinations, xAxisAttributeId, yAxisAttributeId, xAxisKey } = payload;

  const yAxisAttributeTitle =
    combinations.flatMap((c) => c.row ?? []).find((r) => r.attributeId === yAxisAttributeId)
      ?.label ?? "";

  const resultMap: Record<
    string,
    {
      [key: string]: string | number;
    }
  > = {};

  for (const item of combinations) {
    const yAxisAttribute = item.row.find((r) => r.attributeId === yAxisAttributeId)?.value
      .title as string;
    const xAxisAttribute = item.row.find((r) => r.attributeId === xAxisAttributeId)?.value
      .title as string;

    const value = Number(item.value.replace(/,/g, ""));

    if (!resultMap[xAxisAttribute]) {
      resultMap[xAxisAttribute] = {
        [xAxisKey]: xAxisAttribute,
      };
    }

    resultMap[xAxisAttribute][yAxisAttribute] = value;
  }

  const rawKeys = combinations
    .map((item) => item.row.find((r) => r.attributeId === yAxisAttributeId)?.value.title)
    .filter((title): title is string => Boolean(title));
  const seriesKeys = orderSeriesKeysIfGender(rawKeys);

  return {
    data: Object.values(resultMap),
    seriesKeys,
    yAxisAttributeTitle,
  };
};
