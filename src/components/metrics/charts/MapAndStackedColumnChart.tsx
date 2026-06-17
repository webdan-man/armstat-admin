"use client";

import React, { useMemo } from "react";
import StackedColumnChart from "@/components/metrics/charts/StackedColumnChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { filterCombinationsByProvinceMapId, getArmenianProvinceHyTitleByMapId } from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForMapAndStackedColumnChart } from "@/utils/chart/map-combinations-for-map-and-stacked-column-chart.util";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndStackedColumnChartProps {
  combinations: MetricCombination[];
  xAxisKey: string;
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    stackedAttributeId: string;
    seriesAttributeId: string;
  };
}

function getSeriesRowLabel(combinations: MetricCombination[], attributeId: string): string {
  for (const item of combinations) {
    const entry = (item.row ?? []).find((r) => r.attributeId === attributeId);
    if (entry?.label) return entry.label;
  }
  return "";
}

const MapAndStackedColumnChart = ({
  combinations,
  xAxisKey,
  data,
}: MapAndStackedColumnChartProps) => {
  const { mapData = [], provinceAttributeId, stackedAttributeId, seriesAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(activeProvinceMapId) ?? activeProvinceMapId;
  }, [activeProvinceMapId]);

  const seriesAttributeTitle = useMemo(
    () => getSeriesRowLabel(combinations, seriesAttributeId),
    [combinations, seriesAttributeId]
  );

  const { columnData, seriesKeys } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    const {
      data: { columnData },
      seriesKeys,
    } = mapCombinationsForMapAndStackedColumnChart({
      combinations: filtered,
      stackedAttributeId,
      seriesAttributeId,
      provinceAttributeId,
      xAxisKey,
    });
    return { columnData, seriesKeys };
  }, [
    combinations,
    provinceAttributeId,
    stackedAttributeId,
    seriesAttributeId,
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
        <StackedColumnChart
          key="map-and-stacked-column-chart"
          data={columnData as Record<string, string>[]}
          xAxisKey={xAxisKey}
          seriesKeys={seriesKeys}
          chartTitle={chartTitle}
          yAxisLabel={seriesAttributeTitle}
        />
      </div>
    </div>
  );
};

export default MapAndStackedColumnChart;
