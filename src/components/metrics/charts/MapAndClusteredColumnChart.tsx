"use client";

import React, { useMemo } from "react";
import ClusteredColumnChart from "@/components/metrics/charts/ClusteredColumnChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { filterCombinationsByProvinceMapId, getArmenianProvinceHyTitleByMapId } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForClusteredColumnChart } from "@/utils/chart/map-combinations-for-clustered-column-chart.util";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndClusteredColumnChartProps {
  combinations: MetricCombination[];
  xAxisKey: string;
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    xAxisAttributeId: string;
    yAxisAttributeId: string;
  };
}

const MapAndClusteredColumnChart = ({
  combinations,
  xAxisKey,
  data,
}: MapAndClusteredColumnChartProps) => {
  const { mapData = [], provinceAttributeId, xAxisAttributeId, yAxisAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(activeProvinceMapId) ?? activeProvinceMapId;
  }, [activeProvinceMapId]);

  const { columnData, seriesKeys, resolvedXAxisKey } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    const {
      data: columnData,
      seriesKeys,
      xAxisKey: transposedKey,
    } = mapCombinationsForClusteredColumnChart({
      combinations: filtered,
      xAxisAttributeId,
      yAxisAttributeId,
      xAxisKey,
    });
    return { columnData, seriesKeys, resolvedXAxisKey: transposedKey ?? xAxisKey };
  }, [
    combinations,
    provinceAttributeId,
    xAxisAttributeId,
    yAxisAttributeId,
    xAxisKey,
    activeProvinceMapId,
  ]);

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
        <ClusteredColumnChart
          key="map-and-clustered-column-chart"
          xAxisKey={resolvedXAxisKey}
          data={columnData as Record<string, string>[]}
          seriesKeys={seriesKeys}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndClusteredColumnChart;
