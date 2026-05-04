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
import { mapCombinationsForClusteredColumnChart } from "../utils/chart/map-combinations-for-clustered-column-chart.util";
import { mapCombinationsForStackedBarWithNegativeValuesChartUtil } from "@/utils/chart/map-combinations-for-stacked-bar-with-negative-values-chart.util";
import { createCombinationAttributesMap } from "@/utils/chart/create-combination-attributes-map.util";
import { mapCombinationsForPyramid } from "@/utils/chart/map-combinations-for-pyramid";
import { aggregateByAttributeTitle } from "@/utils/chart/aggregate-by-attribute-title";
import { mapCombinationsForMapAndStackedAreaChart } from "@/utils/chart/map-combinations-for-map-and-stacked-area-chart.util";
import { mapCombinationsForMapAndStackedColumnChart } from "@/utils/chart/map-combinations-for-map-and-stacked-column-chart.util";
import { mapCombinationsForMapAndStackedBarWithNegativeValuesChart } from "@/utils/chart/map-combinations-for-map-and-stacked-bar-with-negative-values-chart.util";
import { mapCombinationsForMapAndClusteredColumnChart } from "@/utils/chart/map-combinations-for-map-and-clustered-column-chart.util";
import { mapCombinationsForClusteredColumnChartStacked } from "@/utils/chart/map-combinations-for-clustered-column-chart-stacked.util";
import { mapCombinationsForPyramidByFrameCategory } from "@/utils/chart/map-combinations-for-pyramid";
import { mapCombinationsForClusteredColumnChartStacked3D } from "@/utils/chart/map-combinations-for-clustered-column-chart-stacked-3d.util";
import { mapCombinationsForMapAndClusteredColumnChartCXG } from "@/utils/chart/map-combinations-for-map-and-clustered-column-chart-cxg.util";

type ChartType =
  | "bar"
  | "line-graph"
  | "pie"
  | "semi-pie"
  | "map-and-semi-pie"
  | "map-and-column-with-rotated-labels"
  | "map-and-line-graph"
  | "map-and-stacked-area-chart"
  | "map-and-stacked-column-chart"
  | "map-and-stacked-bar-with-negative-values"
  | "map-and-clustered-column-chart"
  | "armenia-map-provinces"
  | "column-with-rotated-labels"
  | "stacked-area-chart"
  | "stacked-column-chart"
  | "stacked-bar-chart-with-negative-values"
  | "historical-population-pyramid"
  | "clustered-column-chart"
  | "clustered-column-chart-stacked";

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
  data: any;
  xAxisKey?: string;
  yAxisKey?: string;
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
      const attributeMapByCategory = createCombinationAttributesMap({
        combinations,
        attributes,
      });

      const first = attributeMap.get(attributeIds[0]);
      const second = attributeMap.get(attributeIds[1]);

      if (!first || !second) return { type: "bar", data: [] };

      const categories = new Set([first.category, second.category]);
      const ageOrAreaOrOther = [
        AttributeCategory.AGE,
        AttributeCategory.AREA,
        AttributeCategory.OTHER,
      ].find((cat) => categories.has(cat));

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

      // Clustered Column chart (stacked): Gender + (Area or Other)
      // Gender is the series; X is (AREA or OTHER)
      if (categories.has(AttributeCategory.GENDER) && stackedCategory) {
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const xAxisAttributeId = attributeMapByCategory.get(stackedCategory)!._id;

        const xAxisKey = stackedCategory === AttributeCategory.AREA ? "area" : "other";

        const mapped = mapCombinationsForClusteredColumnChart({
          combinations,
          xAxisAttributeId,
          yAxisAttributeId: genderAttributeId,
          xAxisKey,
        });

        const { data, seriesKeys } = mapped;
        const resolvedXAxisKey = "xAxisKey" in mapped ? mapped.xAxisKey : xAxisKey;

        console.log(`CLUSTERED COLUMN CHART (STACKED): X - ${stackedCategory}, SERIES - GENDER`, {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey: resolvedXAxisKey,
          seriesKeys,
          data,
        };
      }

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

      if (categories.has(AttributeCategory.TIME) && ageOrAreaOrOther) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const yAxisAttributeId = attributeMapByCategory.get(ageOrAreaOrOther)!._id;

        const xAxisKey = "time";

        const { data, seriesKeys } = mapCombinationsForStackedColumnChart({
          combinations,
          xAxisAttributeId: timeAttributeId,
          yAxisAttributeId,
          xAxisKey,
        });

        console.log(`STACKED COLUMN CHART: X - TIME, Y - AGE`, {
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

      if (categories.has(AttributeCategory.AGE) && categories.has(AttributeCategory.OTHER)) {
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const xAxisKey = "age";

        const { data, seriesKeys } = mapCombinationsForStackedColumnChart({
          combinations,
          xAxisAttributeId: otherAttributeId,
          yAxisAttributeId: ageAttributeId,
          xAxisKey,
        });

        console.log(`STACKED COLUMN CHART: X - OTHER, Y - AGE`, {
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

      // STACKED BAR CHART WITH NEGATIVE VALUES: X - GENDER, Y - AGE
      if (categories.has(AttributeCategory.GENDER) && categories.has(AttributeCategory.AGE)) {
        const yAxisKey = "year";

        const { data, seriesKeys } = mapCombinationsForStackedBarWithNegativeValuesChartUtil({
          combinations,
          attributeMapByCategory,
          yAxisKey,
        });

        console.log("STACKED BAR CHART WITH NEGATIVE VALUES: X - GENDER, Y - AGE", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "stacked-bar-chart-with-negative-values",
          yAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Semi-Circle PIE: Province + Gender (pie slices are derived in MapAndSemiPieChart from selected province)
      if (categories.has(AttributeCategory.PROVINCE) && categories.has(AttributeCategory.GENDER)) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        const data = { mapData, provinceAttributeId, genderAttributeId };

        console.log("GENDER+PROVINCE MAP + SEMI-PIE", { combinations, data });

        return {
          type: "map-and-semi-pie",
          data,
        };
      }

      // Map + Column with rotated labels: Province + AGE or AREA or OTHER (columns derived in MapAndColumnWithRotatedLabelsChart from selected province)
      if (categories.has(AttributeCategory.PROVINCE) && ageOrAreaOrOther) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const breakdownAttributeId = attributeMapByCategory.get(ageOrAreaOrOther)!._id;

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        const data = { mapData, provinceAttributeId, breakdownAttributeId };

        console.log("PROVINCE+AGE or AREA or OTHER MAP + COLUMN WITH ROTATED LABELS", {
          combinations,
          data,
        });

        return {
          type: "map-and-column-with-rotated-labels",
          data,
        };
      }

      // Map + Line graph: Province + Time (line series is derived in MapAndLineGraphChart from selected province)
      if (categories.has(AttributeCategory.PROVINCE) && categories.has(AttributeCategory.TIME)) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        const data = { mapData, provinceAttributeId, timeAttributeId };

        console.log("PROVINCE+TIME MAP + LINE GRAPH", { combinations, data });

        return {
          type: "map-and-line-graph",
          data,
        };
      }

      if (categories.has(AttributeCategory.AREA) && categories.has(AttributeCategory.OTHER)) {
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const xAxisKey = "other";

        const mapped = mapCombinationsForClusteredColumnChart({
          combinations,
          xAxisAttributeId: otherAttributeId,
          yAxisAttributeId: areaAttributeId,
          xAxisKey,
        });

        const { data, seriesKeys } = mapped;
        const resolvedXAxisKey = "xAxisKey" in mapped ? mapped.xAxisKey : xAxisKey;

        console.log(`CLUSTERED COLUMN CHART: X - OTHER, Y - AREA`, {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "clustered-column-chart",
          xAxisKey: resolvedXAxisKey,
          seriesKeys,
          data,
        };
      }
    }

    if (attributeIds.length === 3) {
      const attributeMap = new Map(attributes.map((a) => [a._id, a]));
      const attributeMapByCategory = createCombinationAttributesMap({
        combinations,
        attributes,
      });

      const first = attributeMap.get(attributeIds[0]);
      const second = attributeMap.get(attributeIds[1]);
      const third = attributeMap.get(attributeIds[2]);

      if (!first || !second || !third) return { type: "bar", data: [] };

      const categories = new Set([first.category, second.category, third.category]);

      const has = (cat: AttributeCategory) => categories.has(cat);

      // Clustered Column chart (stacked): TIME + AGE + (AREA or OTHER)
      // CYGX rule: choose grouping dimension by fewer options; series = next; aggregate over last.
      if (
        has(AttributeCategory.TIME) &&
        has(AttributeCategory.AGE) &&
        (has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const thirdCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const thirdAttributeId = attributeMapByCategory.get(thirdCategory)!._id;

        const { data, seriesKeys, xAxisKey, groupedBy, seriesBy, aggregatedOver } =
          mapCombinationsForClusteredColumnChartStacked3D({
            combinations,
            attributes: [
              { id: timeAttributeId, key: "time" },
              { id: ageAttributeId, key: "age" },
              {
                id: thirdAttributeId,
                key: thirdCategory === AttributeCategory.AREA ? "area" : "other",
              },
            ],
          });

        console.log("TIME+AGE+(AREA|OTHER) CLUSTERED COLUMN (STACKED) CYGX", {
          combinations,
          groupedBy,
          seriesBy,
          aggregatedOver,
          data,
          seriesKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Clustered Column chart (stacked): TIME + AREA + OTHER
      // CYGX rule: choose grouping dimension by fewer options; series = next; aggregate over last.
      if (
        has(AttributeCategory.TIME) &&
        has(AttributeCategory.AREA) &&
        has(AttributeCategory.OTHER)
      ) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const { data, seriesKeys, xAxisKey, groupedBy, seriesBy, aggregatedOver } =
          mapCombinationsForClusteredColumnChartStacked3D({
            combinations,
            attributes: [
              { id: timeAttributeId, key: "time" },
              { id: areaAttributeId, key: "area" },
              { id: otherAttributeId, key: "other" },
            ],
          });

        console.log("TIME+AREA+OTHER CLUSTERED COLUMN (STACKED) CYGX", {
          combinations,
          groupedBy,
          seriesBy,
          aggregatedOver,
          data,
          seriesKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Clustered Column chart (stacked): Gender + Time + (Area or Other)
      // CXG rule: choose TIME vs (AREA/OTHER) based on which has fewer options.
      // Gender is the series; the non-chosen CXG dimension is aggregated over.
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.TIME) &&
        (has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const stackedCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const secondAttributeId = attributeMapByCategory.get(stackedCategory)!._id;

        const { data, seriesKeys, xAxisKey, groupedBy, aggregatedOver } =
          mapCombinationsForClusteredColumnChartStacked({
            combinations,
            genderAttributeId,
            firstCtgAttribute: { id: timeAttributeId, key: "time" },
            secondCtgAttribute: {
              id: secondAttributeId,
              key: stackedCategory === AttributeCategory.AREA ? "area" : "other",
            },
          });

        console.log("GENDER+TIME+(AREA|OTHER) CLUSTERED COLUMN (STACKED) CXG", {
          combinations,
          groupedBy,
          aggregatedOver,
          data,
          seriesKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Stacked area chart + Armenia map:
      // Stacked area: X - TIME, series - GENDER (aggregated across provinces)
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.TIME) &&
        has(AttributeCategory.GENDER)
      ) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const { data, seriesKeys } = mapCombinationsForMapAndStackedAreaChart({
          combinations,
          timeAttributeId,
          genderAttributeId,
          provinceAttributeId,
        });

        console.log("PROVINCE+TIME+GENDER MAP + STACKED AREA (TIME X, GENDER SERIES)", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-stacked-area-chart",
          xAxisKey: "year",
          seriesKeys,
          data,
        };
      }

      // Map + Stacked column chart: Gender + Province + (Area or Other)
      // Stacked column: X - (AREA or OTHER) (aggregated across provinces), series - GENDER
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.PROVINCE) &&
        (has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const stackedCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const stackedAttributeId = attributeMapByCategory.get(stackedCategory)!._id;
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;

        // Keep the existing stacked-column shape used elsewhere in this hook.
        const xAxisKey = "gender";

        const { data, seriesKeys } = mapCombinationsForMapAndStackedColumnChart({
          combinations,
          stackedAttributeId,
          seriesAttributeId: genderAttributeId,
          provinceAttributeId,
          xAxisKey,
        });

        console.log(`GENDER+PROVINCE+${stackedCategory} MAP + STACKED COLUMN`, {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Stacked column chart: Province + Time + (Age or Area or Other)
      // Stacked column: X - TIME (aggregated across provinces), series - (AGE or AREA or OTHER)
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.TIME) &&
        (has(AttributeCategory.AGE) || has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const stackedCategory = has(AttributeCategory.AGE)
          ? AttributeCategory.AGE
          : has(AttributeCategory.AREA)
            ? AttributeCategory.AREA
            : AttributeCategory.OTHER;

        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const seriesAttributeId = attributeMapByCategory.get(stackedCategory)!._id;
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;

        const xAxisKey = "time";

        const { data, seriesKeys } = mapCombinationsForMapAndStackedColumnChart({
          combinations,
          stackedAttributeId: timeAttributeId,
          seriesAttributeId,
          provinceAttributeId,
          xAxisKey,
        });

        console.log(
          `PROVINCE+TIME+${stackedCategory} MAP + STACKED COLUMN (X - TIME, SERIES - ${stackedCategory})`,
          {
            combinations,
            data,
            seriesKeys,
          }
        );

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Stacked column chart: Province + Age + Area
      // Stacked column: X - AREA (aggregated across provinces), series - AGE
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.AGE) &&
        has(AttributeCategory.AREA)
      ) {
        const stackedAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;

        const xAxisKey = "area";

        const { data, seriesKeys } = mapCombinationsForMapAndStackedColumnChart({
          combinations,
          stackedAttributeId,
          seriesAttributeId: ageAttributeId,
          provinceAttributeId,
          xAxisKey,
        });

        console.log("PROVINCE+AGE+AREA MAP + STACKED COLUMN (X - AREA, SERIES - AGE)", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Stacked bar chart with negative values: Province + Gender + Age
      // Stacked bar (negative values): X - GENDER, Y - AGE
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AGE)
      ) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;

        // This util uses "year" as the label key for the Y axis buckets (age groups).
        const yAxisKey = "year";

        const { data, seriesKeys } = mapCombinationsForMapAndStackedBarWithNegativeValuesChart({
          combinations,
          attributeMapByCategory,
          provinceAttributeId,
          yAxisKey,
        });

        console.log("PROVINCE+GENDER+AGE MAP + STACKED BAR (NEGATIVE VALUES)", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-stacked-bar-with-negative-values",
          yAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Clustered column chart: Province + Age + Other
      // Clustered column: X - OTHER, series - AGE
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.AGE) &&
        has(AttributeCategory.OTHER)
      ) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const xAxisKey = "other";

        const { data, seriesKeys } = mapCombinationsForMapAndClusteredColumnChart({
          combinations,
          xAxisAttributeId: otherAttributeId,
          yAxisAttributeId: ageAttributeId,
          provinceAttributeId,
          xAxisKey,
        });

        console.log("PROVINCE+AGE+OTHER MAP + CLUSTERED COLUMN (X - OTHER, SERIES - AGE)", {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-clustered-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      // Map + Clustered column chart: Province + Area + Other
      // CXG rule: choose whether AREA/OTHER goes on X based on fewer options.
      if (
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.AREA) &&
        has(AttributeCategory.OTHER)
      ) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const { data, seriesKeys, xAxisKey, groupedBy, seriesBy } =
          mapCombinationsForMapAndClusteredColumnChartCXG({
            combinations,
            provinceAttributeId,
            areaAttributeId,
            otherAttributeId,
          });

        console.log("PROVINCE+AREA+OTHER MAP + CLUSTERED COLUMN CXG", {
          combinations,
          groupedBy,
          seriesBy,
          data,
          seriesKeys,
        });

        return {
          type: "map-and-clustered-column-chart",
          xAxisKey,
          seriesKeys,
          data,
        };
      }

      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AGE) &&
        has(AttributeCategory.TIME)
      ) {
        const { data, seriesKeys } = mapCombinationsForPyramid({
          combinations,
          attributeMapByCategory,
        });
        console.log("historical-population-pyramid", {
          combinations,
          data,
        });

        return { type: "historical-population-pyramid", data, seriesKeys };
      }

      // Historical Population Pyramid:
      // GENDER: X1, AGE: Y1, AREA or OTHER: X2 (frames)
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AGE) &&
        (has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const frameCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const frameAttributeId = attributeMapByCategory.get(frameCategory)!._id;

        const { data, seriesKeys } = mapCombinationsForPyramidByFrameCategory({
          combinations,
          attributeMapByCategory,
          frameAttributeId,
        });

        console.log(`historical-population-pyramid (frame: ${frameCategory})`, {
          combinations,
          data,
        });

        return { type: "historical-population-pyramid", data, seriesKeys };
      }
    }

    return { type: "bar", data: [] };
  }, [attributes, combinations]);
}

export const useChart = (props: { combinations: MetricCombination[] }) => {
  return useDetectChartType(props.combinations);
};
