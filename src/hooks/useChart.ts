import type { MetricCombination } from "@/types/metric";
import useSWR from "swr";
import { swrKeys } from "@/lib/swr/cache-keys";
import { fetchAttributes } from "@/services/attributeService";
import { useMemo } from "react";
import { AttributeCategory } from "@/constants/attribute-category.constants";
import { mapCombinationsForLineGraph } from "@/utils/chart/map-combinations-for-line-graph";
import { mapCombinationsForSemiCirclePieChart } from "@/utils/chart/map-combinations-for-semi-circle-pie-chart.util";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForColumnsWithRotatedLabels } from "@/utils/chart/map-combinations-for-columns-with-rotated-labels.util";
import { mapCombinationsForStackAreaChart } from "@/utils/chart/map-combinations-for-stack-area-chart.util";
import { mapCombinationsForStackedColumnChart } from "@/utils/chart/map-combinations-for-stack-column-chart.util";

type ChartType =
  | "bar"
  | "line-graph"
  | "pie"
  | "semi-pie"
  | "armenia-map-provinces"
  | "column-with-rotated-labels"
  | "stacked-area-chart"
  | "stacked-column-chart";

function getUniqueAttributeIds(combinations: MetricCombination[]): string[] {
  const ids = new Set<string>();

  for (const combination of combinations) {
    for (const attributeId of Object.keys(combination.attributes ?? {})) {
      if (attributeId) ids.add(attributeId);
    }

    for (const entry of combination.row ?? []) {
      if (entry.attributeId) ids.add(entry.attributeId);
    }
  }

  return Array.from(ids);
}

function useDetectChartType(combinations: MetricCombination[] | undefined = []): {
  type: ChartType;
  data: any[];
  xAxisKey?: string;
  seriesKeys?: string[];
} {
  const { data: attributes = [] } = useSWR(swrKeys.attributes, fetchAttributes);
  // const { data: categories = [] } = useSWR(swrKeys.attributesCategories, fetchAttributeCategories);

  return useMemo(() => {
    const rows = combinations ?? [];
    if (rows.length === 0) return { type: "bar", data: [] };

    const attributeIds = getUniqueAttributeIds(rows);

    if (attributeIds.length === 1) {
      const attribute = attributes.find((item) => item._id === attributeIds[0]);

      if (!attribute) return { type: "bar", data: [] };

      if (attribute.category === AttributeCategory.GENDER) {
        const data = mapCombinationsForSemiCirclePieChart(combinations);

        console.log("GENDER 1 SEMI-PIE", { combinations, data });

        return {
          type: "semi-pie",
          data,
        };
      }

      if (attribute.category === AttributeCategory.TIME) {
        const data = mapCombinationsForLineGraph(combinations);

        console.log("TIME 1 LINE GRAPH", { combinations, data });

        return {
          type: "line-graph",
          data,
        };
      }

      if (attribute.category === AttributeCategory.PROVINCE) {
        const data = mapCombinationsForArmeniaProvinces(combinations);

        console.log("PROVINCE 1 MAP", { combinations, data });

        return {
          type: "armenia-map-provinces",
          data,
        };
      }

      if (
        [AttributeCategory.AGE, AttributeCategory.AREA, AttributeCategory.OTHER].includes(
          attribute.category as AttributeCategory
        )
      ) {
        const data = mapCombinationsForColumnsWithRotatedLabels(combinations);

        console.log("AGE or AREA or OTHER 1 COLUMN WITH ROTATED LABELS", { combinations, data });

        return {
          type: "column-with-rotated-labels",
          data,
        };
      }
    }

    if (attributeIds.length === 2) {
      const attributeMap = new Map(attributes.map((a) => [a._id, a]));
      const attributeMapByCategory = new Map(attributes.map((a) => [a.category, a]));

      const first = attributeMap.get(attributeIds[0]);
      const second = attributeMap.get(attributeIds[1]);

      if (!first || !second) return { type: "bar", data: [] };

      const categories = new Set([first.category, second.category]);

      // STACKED AREA CHART: X - TIME, Y - GENDER
      if (categories.has(AttributeCategory.GENDER) && categories.has(AttributeCategory.TIME)) {
        const { data, seriesKeys } = mapCombinationsForStackAreaChart({ combinations, attributes });

        console.log("STACKED AREA CHART: X - TIME, Y - GENDER", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "stacked-area-chart",
          xAxisKey: "year",
          seriesKeys,
          data,
        };
      }

      const stackedCategory = [AttributeCategory.AREA, AttributeCategory.OTHER].find((cat) =>
        categories.has(cat)
      );

      if (categories.has(AttributeCategory.GENDER) && stackedCategory) {
        const xAxisAttributeId = attributeMapByCategory.get(stackedCategory)!._id;
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;

        const xAxisKey = "gender";

        const { data, seriesKeys } = mapCombinationsForStackedColumnChart({
          combinations,
          xAxisAttributeId,
          yAxisAttributeId: genderAttributeId,
          xAxisKey,
        });

        console.log(`STACKED COLUMN CHART: X - ${stackedCategory}, Y - GENDER`, {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }
    }

    return { type: "bar", data: [] };
  }, [attributes, combinations]);
}

export const useChart = (props: { combinations: MetricCombination[] }) => {
  return useDetectChartType(props.combinations);
};
