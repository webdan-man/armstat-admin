import { MetricCombination } from "@/types/metric";
import { Attribute } from "@/types/attribute";

export const mapCombinationsForStackedColumnChart = (payload: {
  combinations: MetricCombination[];
  xAxisAttributeId: Attribute["_id"];
  yAxisAttributeId: Attribute["_id"];
  xAxisKey: string;
}) => {
  const { combinations, xAxisAttributeId, yAxisAttributeId, xAxisKey } = payload;

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

    console.log("mapCombinationsForStackedColumnChart", {
      yAxisAttribute,
      xAxisAttribute,
      row: item.row,
    });

    const value = Number(item.value.replace(/,/g, ""));

    if (!resultMap[xAxisAttribute]) {
      resultMap[xAxisAttribute] = {
        [xAxisKey]: xAxisAttribute,
      };
    }

    resultMap[xAxisAttribute][yAxisAttribute] = Math.round(value);
  }

  const seriesKeys = Array.from(
    new Set(
      combinations.map(
        (item) => item.row.find((r) => r.attributeId === yAxisAttributeId)?.value.title
      )
    )
  ).filter(Boolean) as string[];

  return {
    data: Object.values(resultMap),
    seriesKeys,
  };
};
