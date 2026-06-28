import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
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
import { mapCombinationsForClusteredColumnChartStacked3D } from "@/utils/chart/map-combinations-for-clustered-column-chart-stacked-3d.util";
import { mapCombinationsForClusteredAndStackedColumnChart } from "@/utils/chart/map-combinations-for-clustered-and-stacked-column-chart.util";
import { mapCombinationsForPyramid } from "@/utils/chart/map-combinations-for-pyramid";
import { mapCombinationsForMapAndClusteredColumnChartCXG } from "@/utils/chart/map-combinations-for-map-and-clustered-column-chart-cxg.util";
import {
  mapCombinationsForGroupedStackedColumnChart,
  countUniqueForAttr,
} from "@/utils/chart/map-combinations-for-grouped-stacked-column-chart.util";

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
  | "clustered-column-chart-stacked"
  | "map-and-historical-population-pyramid"
  | "map-and-clustered-column-chart-stacked"
  | "column-with-rotated-labels-and-clustered-column-chart-stacked"
  | "grouped-stacked-column-chart"
  | "map-and-grouped-stacked-column-chart";

/** Attribute ids in column order (matches filter columns / table), not stray `attributes` keys. */
function getUniqueAttributeIds(combinations: MetricCombination[]): string[] {
  const ids: string[] = [];
  const seen = new Set<string>();

  for (const combination of combinations) {
    for (const entry of combination.row ?? []) {
      if (entry.attributeId && !seen.has(entry.attributeId)) {
        seen.add(entry.attributeId);
        ids.push(entry.attributeId);
      }
    }
  }

  return ids;
}

/** Suffix marking an attribute id synthesized from a secondary-level row entry. */
const SECONDARY_ATTRIBUTE_ID_SUFFIX = "::secondary";

/**
 * An attribute can carry a second-level breakdown (its values' `secondaryTitle`).
 * The combinations API returns that breakdown as an extra row entry with the SAME
 * `attributeId` but `level: "secondary"`. Chart detection and every map util key
 * purely on `attributeId`, so a secondary entry would otherwise collide with its
 * primary. We rewrite each secondary entry to a synthetic attribute id and add a
 * matching synthetic OTHER-category attribute, so it is treated as an independent
 * OTHER dimension throughout the pipeline.
 */
function liftSecondaryLevelsToOtherAttributes(
  combinations: MetricCombination[],
  attributes: Attribute[]
): { combinations: MetricCombination[]; attributes: Attribute[] } {
  const sourceIdBySyntheticId = new Map<string, string>();

  const remappedCombinations = combinations.map((combo) => {
    const row = combo.row ?? [];
    let rowChanged = false;
    const newRow = row.map((entry) => {
      if (entry.level !== "secondary" || !entry.attributeId) return entry;
      const syntheticId = `${entry.attributeId}${SECONDARY_ATTRIBUTE_ID_SUFFIX}`;
      sourceIdBySyntheticId.set(syntheticId, entry.attributeId);
      rowChanged = true;
      return { ...entry, attributeId: syntheticId };
    });
    return rowChanged ? { ...combo, row: newRow } : combo;
  });

  if (sourceIdBySyntheticId.size === 0) return { combinations, attributes };

  const attributeById = new Map(attributes.map((a) => [a._id, a]));
  const syntheticAttributes: Attribute[] = [];
  for (const [syntheticId, sourceId] of sourceIdBySyntheticId) {
    const source = attributeById.get(sourceId);
    syntheticAttributes.push({
      _id: syntheticId,
      category: AttributeCategory.OTHER,
      title: source?.title ?? {},
      values: source?.values ?? [],
    });
  }

  return {
    combinations: remappedCombinations,
    attributes: [...attributes, ...syntheticAttributes],
  };
}

function pickAttributeDisplayTitle(attr: Attribute | undefined): string {
  if (!attr?.title) return "";
  const t = attr.title;
  if (typeof t.hy === "string" && t.hy.trim()) return t.hy.trim();
  if (typeof t.ru === "string" && t.ru.trim()) return t.ru.trim();
  if (typeof t.en === "string" && t.en.trim()) return t.en.trim();
  return "";
}

/** Localized title of the TIME-category attribute (from combo map, else global attributes list). */
// The metric-specific label for an attribute, taken from the combination rows,
// falling back to the attribute's global title (`pickAttributeDisplayTitle`).
function pickAttributeLabelFromRows(
  combinations: MetricCombination[],
  attribute: Attribute | undefined
): string {
  if (!attribute) return "";
  for (const combination of combinations) {
    const entry = (combination.row ?? []).find((r) => r.attributeId === attribute._id);
    if (entry?.label) return entry.label;
  }
  return pickAttributeDisplayTitle(attribute);
}

function useDetectChartType(
  combinationsProp: MetricCombination[] | undefined = [],
  isCumulative = false
): {
  type: ChartType;
  data: any;
  xAxisKey?: string;
  yAxisKey?: string;
  seriesKeys?: string[];
  /** Y-axis stack dimension label for stacked column charts (from combination row labels). */
  yAxisLabel?: string;
  /** Cluster group names for true clustered+stacked charts (3D). */
  clusterKeys?: string[];
  /** Stack layer names for true clustered+stacked charts (3D). */
  stackKeys?: string[];
  /** Localized name of the TIME attribute (timeline header on historical population pyramid). */
  timelineAxisAttributeName?: string;
  /** Pyramid timeline (X2) axis kind: real years ("time") or categorical frame ("category"). */
  timelineMode?: "time" | "category";
} {
  const { data: attributesData } = useSWR(swrKeys.attributes, fetchAttributes);
  // const { data: categories = [] } = useSWR(swrKeys.attributesCategories, fetchAttributeCategories);

  return useMemo(() => {
    const rawCombinations = combinationsProp ?? [];
    if (rawCombinations.length === 0) return { type: "bar", data: [] };
    if (attributesData === undefined) return { type: "bar", data: [] };

    // A secondary-level row entry (an attribute's 2nd-level breakdown) is treated
    // as an independent OTHER-category attribute. From here on `combinations` and
    // `attributes` include those synthetic OTHER dimensions.
    const { combinations, attributes } = liftSecondaryLevelsToOtherAttributes(
      rawCombinations,
      attributesData
    );

    const rows = combinations;
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
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const { data, seriesKeys } = mapCombinationsForStackAreaChart({
          combinations,
          attributes,
          attributeMapByCategory,
        });

        console.log("STACKED AREA CHART: X - TIME, Y - GENDER", {
          combinations,
          data,
          seriesKeys,
          attributes,
          attributeMapByCategory,
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

      // Stacked column chart: Gender + (Area or Other)
      // X is GENDER; (AREA or OTHER) is the stack series
      if (categories.has(AttributeCategory.GENDER) && stackedCategory) {
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const stackAttributeId = attributeMapByCategory.get(stackedCategory)!._id;

        const xAxisKey = "gender";

        const { data, seriesKeys, yAxisAttributeTitle } = mapCombinationsForStackedColumnChart({
          combinations,
          xAxisAttributeId: genderAttributeId,
          yAxisAttributeId: stackAttributeId,
          xAxisKey,
        });

        console.log(`STACKED COLUMN CHART: X - GENDER, Y - ${stackedCategory}`, {
          combinations,
          data,
          seriesKeys,
        });

        return {
          type: "stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
          yAxisLabel: yAxisAttributeTitle,
        };
      }

      if (categories.has(AttributeCategory.TIME) && ageOrAreaOrOther) {
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const yAxisAttributeId = attributeMapByCategory.get(ageOrAreaOrOther)!._id;

        const xAxisKey = "time";

        const { data, seriesKeys, yAxisAttributeTitle } = mapCombinationsForStackedColumnChart({
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
          yAxisLabel: yAxisAttributeTitle,
        };
      }

      if (categories.has(AttributeCategory.AGE) && categories.has(AttributeCategory.OTHER)) {
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const xAxisKey = "age";

        const { data, seriesKeys, yAxisAttributeTitle } = mapCombinationsForStackedColumnChart({
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
          yAxisLabel: yAxisAttributeTitle,
        };
      }

      // STACKED COLUMN CHART: X - AREA, Y - AGE (row 20 of Discussed sheet)
      if (categories.has(AttributeCategory.AGE) && categories.has(AttributeCategory.AREA)) {
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;

        const xAxisKey = "area";

        const { data, seriesKeys, yAxisAttributeTitle } = mapCombinationsForStackedColumnChart({
          combinations,
          xAxisAttributeId: areaAttributeId,
          yAxisAttributeId: ageAttributeId,
          xAxisKey,
        });

        console.log("STACKED COLUMN CHART: X - AREA, Y - AGE", { combinations, data, seriesKeys });

        return {
          type: "stacked-column-chart",
          xAxisKey,
          seriesKeys,
          data,
          yAxisLabel: yAxisAttributeTitle,
        };
      }

      // STACKED BAR CHART WITH NEGATIVE VALUES: X - GENDER, Y - AGE
      if (categories.has(AttributeCategory.GENDER) && categories.has(AttributeCategory.AGE)) {
        const yAxisKey = "year";
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });

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
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
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
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
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
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
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
        const attributeMapByCategory = createCombinationAttributesMap({
          combinations,
          attributes,
        });
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const xAxisKey = "area";

        // AREA must always be the x-axis clustered groups (CXG), with OTHER as the inner
        // series. Disable the util's auto-transpose so OTHER (many values) is never flipped
        // onto the x-axis.
        const mapped = mapCombinationsForClusteredColumnChart({
          combinations,
          xAxisAttributeId: areaAttributeId,
          yAxisAttributeId: otherAttributeId,
          xAxisKey,
          disableAutoTranspose: true,
        });

        const { data, seriesKeys } = mapped;
        const resolvedXAxisKey = "xAxisKey" in mapped ? mapped.xAxisKey : xAxisKey;

        console.log(`CLUSTERED COLUMN CHART: X - AREA (CXG), series - OTHER`, {
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

      // Fallback for 2 attributes from the same category (e.g. 2×OTHER, row 23 of Discussed sheet)
      // Both are OTHER → Stacked Column chart
      {
        const [id0, id1] = attributeIds;
        const a0 = attributeMap.get(id0);
        const a1 = attributeMap.get(id1);

        if (a0 && a1) {
          const xAxisKey = a0.category;

          const { data, seriesKeys, yAxisAttributeTitle } = mapCombinationsForStackedColumnChart({
            combinations,
            xAxisAttributeId: id0,
            yAxisAttributeId: id1,
            xAxisKey,
          });

          console.log("2-ATTR SAME-CATEGORY FALLBACK STACKED COLUMN CHART", {
            combinations,
            data,
            seriesKeys,
          });

          return {
            type: "stacked-column-chart",
            xAxisKey,
            seriesKeys,
            data,
            yAxisLabel: yAxisAttributeTitle,
          };
        }
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
      // True clustered+stacked: fewest options → X, middle → stack layers, most → cluster groups.
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

        const { data, clusterKeys, stackKeys, xAxisKey, groupedBy, stackedBy, clusteredBy } =
          mapCombinationsForClusteredAndStackedColumnChart({
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

        console.log("TIME+AGE+(AREA|OTHER) CLUSTERED+STACKED COLUMN", {
          combinations,
          groupedBy,
          stackedBy,
          clusteredBy,
          data,
          clusterKeys,
          stackKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          clusterKeys,
          stackKeys,
          data,
        };
      }

      // Clustered Column chart (stacked): TIME + AREA + OTHER
      // True clustered+stacked: fewest options → X, middle → stack layers, most → cluster groups.
      if (
        has(AttributeCategory.TIME) &&
        has(AttributeCategory.AREA) &&
        has(AttributeCategory.OTHER)
      ) {
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const { data, clusterKeys, stackKeys, xAxisKey, groupedBy, stackedBy, clusteredBy } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: timeAttributeId, key: "time" },
              { id: areaAttributeId, key: "area" },
              { id: otherAttributeId, key: "other" },
            ],
          });

        console.log("TIME+AREA+OTHER CLUSTERED+STACKED COLUMN", {
          combinations,
          groupedBy,
          stackedBy,
          clusteredBy,
          data,
          clusterKeys,
          stackKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          clusterKeys,
          stackKeys,
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
        const secondCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const secondAttributeId = attributeMapByCategory.get(secondCategory)!._id;

        // GENDER is the stack dimension; TIME and AREA/OTHER split into X (fewer
        // values) and cluster groups (more) by CXG — a true clustered+stacked chart.
        const { data, clusterKeys, stackKeys, xAxisKey } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: genderAttributeId, key: "gender" },
              { id: timeAttributeId, key: "time" },
              {
                id: secondAttributeId,
                key: secondCategory === AttributeCategory.AREA ? "area" : "other",
              },
            ],
            stackAttributeId: genderAttributeId,
          });

        console.log("GENDER+TIME+(AREA|OTHER) CLUSTERED+STACKED COLUMN (gender = stacks)", {
          combinations,
          data,
          clusterKeys,
          stackKeys,
        });

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          clusterKeys,
          stackKeys,
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
        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+TIME+GENDER MAP + STACKED AREA (TIME X, GENDER SERIES)", {
          combinations,
        });

        return {
          type: "map-and-stacked-area-chart",
          xAxisKey: "year",
          data: { mapData, provinceAttributeId, timeAttributeId, genderAttributeId },
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

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log(`GENDER+PROVINCE+${stackedCategory} MAP + STACKED COLUMN`, {
          combinations,
        });

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          data: {
            mapData,
            provinceAttributeId,
            stackedAttributeId,
            seriesAttributeId: genderAttributeId,
          },
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

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log(
          `PROVINCE+TIME+${stackedCategory} MAP + STACKED COLUMN (X - TIME, SERIES - ${stackedCategory})`,
          { combinations }
        );

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          data: {
            mapData,
            provinceAttributeId,
            stackedAttributeId: timeAttributeId,
            seriesAttributeId,
          },
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

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+AGE+AREA MAP + STACKED COLUMN (X - AREA, SERIES - AGE)", {
          combinations,
        });

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          data: {
            mapData,
            provinceAttributeId,
            stackedAttributeId,
            seriesAttributeId: ageAttributeId,
          },
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
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;

        // This util uses "year" as the label key for the Y axis buckets (age groups).
        const yAxisKey = "year";

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+GENDER+AGE MAP + STACKED BAR (NEGATIVE VALUES)", {
          combinations,
        });

        return {
          type: "map-and-stacked-bar-with-negative-values",
          yAxisKey,
          data: { mapData, provinceAttributeId, genderAttributeId, ageAttributeId },
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

        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+AGE+OTHER MAP + CLUSTERED COLUMN (X - OTHER, SERIES - AGE)", {
          combinations,
        });

        return {
          type: "map-and-clustered-column-chart",
          xAxisKey,
          data: {
            mapData,
            provinceAttributeId,
            xAxisAttributeId: otherAttributeId,
            yAxisAttributeId: ageAttributeId,
          },
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

        const { xAxisKey, groupedBy } = mapCombinationsForMapAndClusteredColumnChartCXG({
          combinations,
          provinceAttributeId,
          areaAttributeId,
          otherAttributeId,
        });

        const xAxisAttributeId = groupedBy === "area" ? areaAttributeId : otherAttributeId;
        const yAxisAttributeId = groupedBy === "area" ? otherAttributeId : areaAttributeId;
        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+AREA+OTHER MAP + CLUSTERED COLUMN CXG", {
          combinations,
          groupedBy,
        });

        return {
          type: "map-and-clustered-column-chart",
          xAxisKey,
          data: { mapData, provinceAttributeId, xAxisAttributeId, yAxisAttributeId },
        };
      }

      // Map + Stacked column chart: Province + 2×OTHER
      // CXG: fewer unique values → X axis, more → series/stacks
      if (
        categories.size === 2 &&
        has(AttributeCategory.PROVINCE) &&
        has(AttributeCategory.OTHER)
      ) {
        const provinceAttributeId = attributeMapByCategory.get(AttributeCategory.PROVINCE)!._id;
        const otherIds = attributeIds.filter(
          (id) => attributeMap.get(id)?.category === AttributeCategory.OTHER
        );
        const [otherId0, otherId1] = otherIds;

        const count0 = countUniqueForAttr(combinations, otherId0);
        const count1 = countUniqueForAttr(combinations, otherId1);
        const stackedAttributeId = count0 <= count1 ? otherId0 : otherId1;
        const seriesAttributeId = stackedAttributeId === otherId0 ? otherId1 : otherId0;

        const xAxisKey = "other";
        const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

        console.log("PROVINCE+2×OTHER MAP + STACKED COLUMN CXG", {
          combinations,
          stackedAttributeId,
          seriesAttributeId,
        });

        return {
          type: "map-and-stacked-column-chart",
          xAxisKey,
          data: { mapData, provinceAttributeId, stackedAttributeId, seriesAttributeId },
        };
      }

      // Gender + Age + Time:
      // - non-cumulative → clustered+stacked column (GENDER → stacks, AGE → X, TIME → clusters)
      // - cumulative → historical population pyramid (TIME as the timeline axis)
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AGE) &&
        has(AttributeCategory.TIME)
      ) {
        if (isCumulative) {
          const { data, seriesKeys, timelineMode } = mapCombinationsForPyramid({
            combinations,
            attributeMapByCategory,
          });
          console.log("historical-population-pyramid", {
            combinations,
            data,
            attributeMapByCategory,
          });

          return {
            type: "historical-population-pyramid",
            data,
            seriesKeys,
            timelineMode,
            timelineAxisAttributeName: pickAttributeLabelFromRows(
              combinations,
              attributeMapByCategory.get(AttributeCategory.TIME)
            ),
          };
        }

        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const timeAttributeId = attributeMapByCategory.get(AttributeCategory.TIME)!._id;

        const { data, clusterKeys, stackKeys, xAxisKey } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: genderAttributeId, key: "gender" },
              { id: ageAttributeId, key: "age" },
              { id: timeAttributeId, key: "time" },
            ],
            stackAttributeId: genderAttributeId,
            xAttributeId: ageAttributeId,
          });

        console.log(
          "GENDER+AGE+TIME CLUSTERED+STACKED COLUMN (gender = stacks, age = X, time = clusters)",
          {
            combinations,
            data,
            clusterKeys,
            stackKeys,
          }
        );

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          clusterKeys,
          stackKeys,
          data,
        };
      }

      // Clustered Column chart (stacked): Gender + Age + (Area or Other)
      // Fixed roles: GENDER → stacks (Y), AGE → X, AREA/OTHER → cluster groups (G).
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AGE) &&
        (has(AttributeCategory.AREA) || has(AttributeCategory.OTHER))
      ) {
        const clusterCategory = has(AttributeCategory.AREA)
          ? AttributeCategory.AREA
          : AttributeCategory.OTHER;
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const clusterAttributeId = attributeMapByCategory.get(clusterCategory)!._id;

        const { data, clusterKeys, stackKeys, xAxisKey } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: genderAttributeId, key: "gender" },
              { id: ageAttributeId, key: "age" },
              {
                id: clusterAttributeId,
                key: clusterCategory === AttributeCategory.AREA ? "area" : "other",
              },
            ],
            stackAttributeId: genderAttributeId,
            xAttributeId: ageAttributeId,
          });

        console.log(
          `GENDER+AGE+${clusterCategory} CLUSTERED+STACKED COLUMN (gender = stacks, age = X, ${clusterCategory} = clusters)`,
          { combinations, data, clusterKeys, stackKeys }
        );

        return {
          type: "clustered-column-chart-stacked",
          xAxisKey,
          clusterKeys,
          stackKeys,
          data,
        };
      }

      // Clustered Column chart (stacked): Gender + Area + Other (rows 33-34)
      // Gender is series; CXG between Area and Other
      if (
        has(AttributeCategory.GENDER) &&
        has(AttributeCategory.AREA) &&
        has(AttributeCategory.OTHER)
      ) {
        const genderAttributeId = attributeMapByCategory.get(AttributeCategory.GENDER)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        // GENDER is the stack dimension; AREA/OTHER split into X (fewer values) and
        // cluster groups (more values) by CXG — a true clustered+stacked chart.
        const { data, clusterKeys, stackKeys, xAxisKey } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: genderAttributeId, key: "gender" },
              { id: areaAttributeId, key: "area" },
              { id: otherAttributeId, key: "other" },
            ],
            stackAttributeId: genderAttributeId,
          });

        console.log("GENDER+AREA+OTHER CLUSTERED+STACKED COLUMN (gender = stacks)", {
          combinations,
          data,
          clusterKeys,
          stackKeys,
        });

        return { type: "clustered-column-chart-stacked", xAxisKey, clusterKeys, stackKeys, data };
      }

      // Clustered Column chart (stacked): Age + Area + Other (row 46)
      // True clustered+stacked: fewest options → X, middle → stack layers, most → cluster groups.
      if (
        has(AttributeCategory.AGE) &&
        has(AttributeCategory.AREA) &&
        has(AttributeCategory.OTHER)
      ) {
        const ageAttributeId = attributeMapByCategory.get(AttributeCategory.AGE)!._id;
        const areaAttributeId = attributeMapByCategory.get(AttributeCategory.AREA)!._id;
        const otherAttributeId = attributeMapByCategory.get(AttributeCategory.OTHER)!._id;

        const { data, clusterKeys, stackKeys, xAxisKey } =
          mapCombinationsForClusteredAndStackedColumnChart({
            combinations,
            attributes: [
              { id: ageAttributeId, key: "age" },
              { id: areaAttributeId, key: "area" },
              { id: otherAttributeId, key: "other" },
            ],
          });

        console.log("AGE+AREA+OTHER CLUSTERED+STACKED COLUMN", {
          combinations,
          data,
          clusterKeys,
          stackKeys,
        });

        return { type: "clustered-column-chart-stacked", xAxisKey, clusterKeys, stackKeys, data };
      }

      // Grouped stacked column chart: any combination with 2+ OTHER-category attrs (no Province)
      // Gender/Time/Age/Area + Other + Other  OR  Other + Other + Other
      {
        const [gscId0, gscId1, gscId2] = attributeIds;
        const gscA0 = attributeMap.get(gscId0);
        const gscA1 = attributeMap.get(gscId1);
        const gscA2 = attributeMap.get(gscId2);

        if (gscA0 && gscA1 && gscA2) {
          const allThreeEntries = [
            { attr: gscA0, id: gscId0 },
            { attr: gscA1, id: gscId1 },
            { attr: gscA2, id: gscId2 },
          ];
          const otherEntries = allThreeEntries.filter(
            ({ attr }) => attr.category === AttributeCategory.OTHER
          );

          if (!has(AttributeCategory.PROVINCE) && otherEntries.length >= 2) {
            const nonOtherEntry = allThreeEntries.find(
              ({ attr }) => attr.category !== AttributeCategory.OTHER
            );

            let stackId: string;
            let outerEntry: { attr: (typeof attributes)[number]; id: string };
            let innerEntry: { attr: (typeof attributes)[number]; id: string };

            if (nonOtherEntry) {
              stackId = nonOtherEntry.id;
              const [e0, e1] = otherEntries;
              const c0 = countUniqueForAttr(combinations, e0.id);
              const c1 = countUniqueForAttr(combinations, e1.id);
              outerEntry = c0 <= c1 ? e0 : e1;
              innerEntry = outerEntry === e0 ? e1 : e0;
            } else {
              // All three are OTHER: fewest → stack, then: fewer → outer, more → inner
              const sorted = otherEntries
                .map((e) => ({ ...e, count: countUniqueForAttr(combinations, e.id) }))
                .sort((a, b) => a.count - b.count);
              stackId = sorted[0].id;
              outerEntry = sorted[1];
              innerEntry = sorted[2];
            }

            const { data, stackDimensions } = mapCombinationsForGroupedStackedColumnChart({
              combinations,
              outerAttributeId: outerEntry.id,
              innerAttributeId: innerEntry.id,
              stackAttributeId: stackId,
            });

            const innerAttributeName = pickAttributeLabelFromRows(
              combinations,
              attributes.find((a) => a._id === innerEntry.id)
            );

            console.log("GROUPED STACKED COLUMN CHART", {
              combinations,
              data,
              stackDimensions,
            });

            return {
              type: "grouped-stacked-column-chart",
              data: { data, stackDimensions, innerAttributeName },
            };
          }
        } // end gscA0 && gscA1 && gscA2
      }

      // Fallback for any remaining 3-attribute combination (rows 41, 45, 47-49: repeated categories)
      {
        const [id0, id1, id2] = attributeIds;
        const a0 = attributeMap.get(id0);
        const a1 = attributeMap.get(id1);
        const a2 = attributeMap.get(id2);

        if (a0 && a1 && a2) {
          // Province + 2 same-category attrs (e.g. Province + 2×OTHER, row 45)
          // → Map + Clustered Column chart
          const provinceAttrFallback = [a0, a1, a2].find(
            (a) => a.category === AttributeCategory.PROVINCE
          );
          if (provinceAttrFallback) {
            const nonProvAttrs = [
              { attr: a0, id: id0 },
              { attr: a1, id: id1 },
              { attr: a2, id: id2 },
            ].filter(({ attr }) => attr.category !== AttributeCategory.PROVINCE);

            const xAxisKey = nonProvAttrs[0].attr.category;

            const mapped = mapCombinationsForClusteredColumnChart({
              combinations,
              xAxisAttributeId: nonProvAttrs[0].id,
              yAxisAttributeId: nonProvAttrs[1].id,
              xAxisKey,
            });

            const { data: columnData, seriesKeys } = mapped;
            const resolvedXAxisKey = "xAxisKey" in mapped ? mapped.xAxisKey : xAxisKey;
            const mapData = mapCombinationsForArmeniaProvinces(
              combinations,
              provinceAttrFallback._id
            );

            console.log("3-ATTR PROVINCE FALLBACK MAP + CLUSTERED COLUMN", {
              combinations,
              columnData,
              mapData,
              seriesKeys,
            });

            return {
              type: "map-and-clustered-column-chart",
              xAxisKey: resolvedXAxisKey,
              seriesKeys,
              data: { columnData, mapData },
            };
          }

          // No Province: true clustered+stacked across all three (rows 41, 47-49)
          const { data, clusterKeys, stackKeys, xAxisKey } =
            mapCombinationsForClusteredAndStackedColumnChart({
              combinations,
              attributes: [
                { id: id0, key: a0.category },
                { id: id1, key: a1.category },
                { id: id2, key: a2.category },
              ],
            });

          console.log("3-ATTR FALLBACK CLUSTERED+STACKED COLUMN", {
            combinations,
            data,
            clusterKeys,
            stackKeys,
          });

          return { type: "clustered-column-chart-stacked", xAxisKey, clusterKeys, stackKeys, data };
        }
      }
    }

    if (attributeIds.length === 4) {
      const attributeMap4 = new Map(attributes.map((a) => [a._id, a]));
      const attributeMapByCategory4 = createCombinationAttributesMap({ combinations, attributes });

      const attrObjects = attributeIds
        .map((id) => attributeMap4.get(id))
        .filter(Boolean) as (typeof attributes)[number][];
      if (attrObjects.length < 4) return { type: "bar", data: [] };

      const categories4 = new Set(attrObjects.map((a) => a.category));
      const has4 = (cat: AttributeCategory) => categories4.has(cat);

      const provinceAttr = attrObjects.find((a) => a.category === AttributeCategory.PROVINCE);
      const genderAttr = attrObjects.find((a) => a.category === AttributeCategory.GENDER);

      // ── Province cases ────────────────────────────────────────────────────────
      if (provinceAttr) {
        const provinceAttributeId = provinceAttr._id;

        // Map + Historical Population Pyramid: Province + Gender + Age + (Time | Area | Other)
        // Cumulative only — non-cumulative falls through to the map + clustered+stacked
        // column block below (Age + frame become the two CXG attrs).
        if (isCumulative && has4(AttributeCategory.GENDER) && has4(AttributeCategory.AGE)) {
          const frameCategory = has4(AttributeCategory.TIME)
            ? AttributeCategory.TIME
            : has4(AttributeCategory.AREA)
              ? AttributeCategory.AREA
              : AttributeCategory.OTHER;

          const frameAttributeId =
            frameCategory !== AttributeCategory.TIME
              ? attributeMapByCategory4.get(frameCategory)!._id
              : undefined;

          // Hand the component the (lifted) combinations + attribute ids so it can
          // re-run the pyramid mapper against province-filtered combinations on map
          // hover/select. mapData is the national breakdown — the map always shows all
          // provinces, so it is computed once here.
          const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

          console.log(`MAP+HISTORICAL-PYRAMID (frame: ${frameCategory})`, {
            combinations,
            mapData,
          });

          return {
            type: "map-and-historical-population-pyramid",
            data: {
              combinations,
              mapData,
              provinceAttributeId,
              attributeMapByCategory: attributeMapByCategory4,
              frameAttributeId,
              timelineAxisAttributeName: pickAttributeLabelFromRows(
                combinations,
                attributeMapByCategory4.get(frameCategory)
              ),
            },
          };
        }

        // ── Map + Grouped Stacked Column Chart ───────────────────────────────────
        {
          const nonProvAttrs4 = attrObjects.filter(
            (a) => a.category !== AttributeCategory.PROVINCE
          );
          const otherAttrs4 = nonProvAttrs4.filter((a) => a.category === AttributeCategory.OTHER);

          // Case 1: GENDER + PROVINCE + 2×OTHER → GENDER=inner(X), CXG between OTHERs
          if (
            genderAttr &&
            otherAttrs4.length === 2 &&
            !has4(AttributeCategory.AGE) &&
            !has4(AttributeCategory.AREA) &&
            !has4(AttributeCategory.TIME)
          ) {
            const [o0, o1] = otherAttrs4;
            const outerAttr =
              countUniqueForAttr(combinations, o0._id) <= countUniqueForAttr(combinations, o1._id)
                ? o0
                : o1;
            const stackAttr = outerAttr === o0 ? o1 : o0;
            const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);
            console.log("MAP+GENDER+2×OTHER GROUPED STACKED COLUMN CXG", { combinations });
            return {
              type: "map-and-grouped-stacked-column-chart",
              data: {
                mapData,
                provinceAttributeId,
                outerAttributeId: outerAttr._id,
                innerAttributeId: genderAttr._id,
                stackAttributeId: stackAttr._id,
                innerAttributeName: pickAttributeLabelFromRows(combinations, genderAttr),
              },
            };
          }

          // Case 2: TIME + PROVINCE + 2×OTHER → TIME=stack(Y), CXG between OTHERs
          if (
            has4(AttributeCategory.TIME) &&
            !has4(AttributeCategory.GENDER) &&
            otherAttrs4.length === 2
          ) {
            const timeAttr4 = attrObjects.find((a) => a.category === AttributeCategory.TIME)!;
            const [o0, o1] = otherAttrs4;
            const outerAttr =
              countUniqueForAttr(combinations, o0._id) <= countUniqueForAttr(combinations, o1._id)
                ? o0
                : o1;
            const innerAttr = outerAttr === o0 ? o1 : o0;
            const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);
            console.log("MAP+TIME+2×OTHER GROUPED STACKED COLUMN CXG", { combinations });
            return {
              type: "map-and-grouped-stacked-column-chart",
              data: {
                mapData,
                provinceAttributeId,
                outerAttributeId: outerAttr._id,
                innerAttributeId: innerAttr._id,
                stackAttributeId: timeAttr4._id,
                innerAttributeName: pickAttributeLabelFromRows(combinations, innerAttr),
              },
            };
          }

          // Cases 3-6: Province + (AGE|AREA mix + 2-3×OTHER, no GENDER, no TIME) → CYXG all 3
          // 3: AGE+AREA+OTHER, 4: AGE+2×OTHER, 5: AREA+2×OTHER, 6: 3×OTHER
          if (
            !has4(AttributeCategory.GENDER) &&
            !has4(AttributeCategory.TIME) &&
            nonProvAttrs4.length === 3
          ) {
            const sorted = nonProvAttrs4
              .map((a) => ({ a, count: countUniqueForAttr(combinations, a._id) }))
              .sort((x, y) => x.count - y.count);
            const [yEntry, xEntry, cEntry] = sorted;
            const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);
            console.log("MAP+3CYXG GROUPED STACKED COLUMN (no GENDER, no TIME)", {
              combinations,
              outer: cEntry.a,
              inner: xEntry.a,
              stack: yEntry.a,
            });
            return {
              type: "map-and-grouped-stacked-column-chart",
              data: {
                mapData,
                provinceAttributeId,
                outerAttributeId: cEntry.a._id,
                innerAttributeId: xEntry.a._id,
                stackAttributeId: yEntry.a._id,
                innerAttributeName: pickAttributeLabelFromRows(combinations, xEntry.a),
              },
            };
          }
        }

        // Map + Clustered Column chart (stacked): Province + Gender + 2 CXG attrs
        if (genderAttr) {
          const genderAttributeId = genderAttr._id;
          const nonPGAttrs = attrObjects.filter(
            (a) =>
              a.category !== AttributeCategory.PROVINCE && a.category !== AttributeCategory.GENDER
          );
          const firstCtgAttribute = { id: nonPGAttrs[0]._id, key: nonPGAttrs[0].category };
          const secondCtgAttribute = { id: nonPGAttrs[1]._id, key: nonPGAttrs[1].category };

          // Hand the component the (lifted) combinations + attribute ids so it can
          // re-run the stacked clustered mapper against province-filtered combinations
          // on map hover/select.
          const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

          console.log("MAP+GENDER+2CXG CLUSTERED COLUMN (STACKED)", {
            combinations,
            mapData,
          });

          return {
            type: "map-and-clustered-column-chart-stacked",
            data: {
              combinations,
              mapData,
              provinceAttributeId,
              variant: "gender",
              genderAttributeId,
              firstCtgAttribute,
              secondCtgAttribute,
            },
          };
        }

        // Map + Clustered Column chart (stacked): Province + 3 CYXG attrs (no Gender)
        {
          const nonProvAttrs = attrObjects.filter((a) => a.category !== AttributeCategory.PROVINCE);
          const [npa0, npa1, npa2] = nonProvAttrs;

          const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

          console.log("MAP+3CYXG CLUSTERED COLUMN (STACKED)", {
            combinations,
            mapData,
          });

          return {
            type: "map-and-clustered-column-chart-stacked",
            data: {
              combinations,
              mapData,
              provinceAttributeId,
              variant: "3d",
              attributes: [
                { id: npa0._id, key: npa0.category },
                { id: npa1._id, key: npa1.category },
                { id: npa2._id, key: npa2.category },
              ],
            },
          };
        }
      }

      // Unsupported: GENDER + AGE + AREA + OTHER has no valid chart mapping

      const nonGenderAttrs = attrObjects.filter((a) => a.category !== AttributeCategory.GENDER);

      {
        const has = (cat: AttributeCategory) => nonGenderAttrs.some((a) => a.category === cat);
        if (
          has(AttributeCategory.AGE) &&
          has(AttributeCategory.AREA) &&
          has(AttributeCategory.OTHER)
        ) {
          return { type: "bar", data: [] };
        }
      }

      // ── Fallback: Column w/ Rotated Labels + CYXG (no Province) ──
      // X1 is chosen as: AGE if present, else AREA, else the first attribute
      {
        const x1Category = has4(AttributeCategory.AGE)
          ? AttributeCategory.AGE
          : has4(AttributeCategory.AREA)
            ? AttributeCategory.AREA
            : AttributeCategory.OTHER;

        const x1Attr = attrObjects.find((a) => a.category === x1Category)!;
        const x1AttributeId = x1Attr._id;

        // Aggregate x1 values for the rotated-labels chart
        const x1Totals = new Map<string, number>();
        for (const item of combinations) {
          const label = (item.row ?? []).find((r) => r.attributeId === x1AttributeId)?.value?.title;
          if (!label) continue;
          x1Totals.set(label, (x1Totals.get(label) ?? 0) + (Number(item.value) || 0));
        }
        const rotatedLabelsData = Array.from(x1Totals.entries()).map(([xAxisKey, value]) => ({
          xAxisKey,
          value,
          label: xAxisKey,
        }));

        // CYXG across the 3 remaining attrs
        const cyxgAttrs = attrObjects.filter((a) => a._id !== x1AttributeId);
        const [cya0, cya1, cya2] = cyxgAttrs;

        const {
          data: columnData,
          seriesKeys,
          xAxisKey,
        } = mapCombinationsForClusteredColumnChartStacked3D({
          combinations,
          attributes: [
            { id: cya0._id, key: cya0.category },
            { id: cya1._id, key: cya1.category },
            { id: cya2._id, key: cya2.category },
          ],
        });

        console.log("COLUMN-ROTATED-LABELS+3CYXG CLUSTERED COLUMN (STACKED)", {
          combinations,
          rotatedLabelsData,
          columnData,
          seriesKeys,
        });

        return {
          type: "column-with-rotated-labels-and-clustered-column-chart-stacked",
          xAxisKey,
          seriesKeys,
          data: { rotatedLabelsData, columnData },
        };
      }
    }

    return { type: "bar", data: [] };
  }, [attributesData, combinationsProp, isCumulative]);
}

export const useChart = (props: {
  combinations: MetricCombination[];
  isCumulative?: boolean;
}) => {
  return useDetectChartType(props.combinations, props.isCumulative);
};
