"use client";

import React, { useMemo } from "react";
import StackedBartWithNegativeValuesChart from "@/components/metrics/charts/StackedBartWithNegativeValuesChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { filterCombinationsByProvinceMapId, getArmenianProvinceHyTitleByMapId } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { compareCategoryLabels } from "@/utils/chart/sort-category-labels";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndStackedBarWithNegativeValuesChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    genderAttributeId: string;
    ageAttributeId: string;
  };
}

const MapAndStackedBarWithNegativeValuesChart = ({
  combinations,
  data,
}: MapAndStackedBarWithNegativeValuesChartProps) => {
  const { mapData = [], provinceAttributeId, genderAttributeId, ageAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(activeProvinceMapId) ?? activeProvinceMapId;
  }, [activeProvinceMapId]);

  const { barData, seriesKeys } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );

    const resultMap = new Map<string, Record<string, number | string>>();
    const categories = new Set<string>();

    for (const item of filtered) {
      let gender: string | undefined;
      let age: string | undefined;

      for (const row of item.row ?? []) {
        if (row.attributeId === genderAttributeId) gender = row.value?.title;
        else if (row.attributeId === ageAttributeId) age = row.value?.title;
        if (gender && age) break;
      }

      if (!age || !gender) continue;
      categories.add(gender);

      let entry = resultMap.get(age);
      if (!entry) {
        entry = { year: age };
        resultMap.set(age, entry);
      }
      entry[gender] = Number(item.value);
    }

    const barData = Array.from(resultMap.values()).sort((a, b) =>
      compareCategoryLabels(String(a.year), String(b.year))
    );

    return { barData, seriesKeys: Array.from(categories) };
  }, [combinations, provinceAttributeId, genderAttributeId, ageAttributeId, activeProvinceMapId]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[35fr_65fr]">
      <div>
        <ArmeniaProvincesMap
          data={mapData}
          onPolygonSelect={onPolygonSelect}
          onPolygonHover={onPolygonHover}
          showRightColumn={false}
          useHeatRules={false}
          showValueInTooltip={false}
        />
      </div>
      <div>
        <StackedBartWithNegativeValuesChart
          key="map-and-stacked-bar-negative"
          data={barData}
          yAxisKey="year"
          seriesKeys={seriesKeys}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndStackedBarWithNegativeValuesChart;
