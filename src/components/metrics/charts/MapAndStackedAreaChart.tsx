"use client";

import React, { useMemo } from "react";
import StackedAreaChart from "@/components/metrics/charts/StackedAreaChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { filterCombinationsByProvinceMapId, getArmenianProvinceHyTitleByMapId } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForMapAndStackedAreaChart } from "@/utils/chart/map-combinations-for-map-and-stacked-area-chart.util";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndStackedAreaChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    timeAttributeId: string;
    genderAttributeId: string;
  };
}

const MapAndStackedAreaChart = ({ combinations, data }: MapAndStackedAreaChartProps) => {
  const { mapData = [], provinceAttributeId, timeAttributeId, genderAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(activeProvinceMapId) ?? activeProvinceMapId;
  }, [activeProvinceMapId]);

  const { stackedAreaData, seriesKeys } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    const {
      data: { stackedAreaData },
      seriesKeys,
    } = mapCombinationsForMapAndStackedAreaChart({
      combinations: filtered,
      timeAttributeId,
      genderAttributeId,
      provinceAttributeId,
    });
    return { stackedAreaData, seriesKeys };
  }, [combinations, provinceAttributeId, timeAttributeId, genderAttributeId, activeProvinceMapId]);

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
        <StackedAreaChart
          key="map-and-stacked-area-chart"
          data={stackedAreaData as Record<string, string>[]}
          xAxisKey="year"
          seriesKeys={seriesKeys}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndStackedAreaChart;
