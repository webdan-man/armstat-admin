"use client";

import React, { useMemo } from "react";
import StackedColumnChart from "@/components/metrics/charts/StackedColumnChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { filterCombinationsByProvinceMapId } from "@/utils/chart/map-combinations-for-armenia-provinces";
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

const MapAndStackedColumnChart = ({
  combinations,
  xAxisKey,
  data,
}: MapAndStackedColumnChartProps) => {
  const { mapData = [], provinceAttributeId, stackedAttributeId, seriesAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

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
          data={columnData as Record<string, string>[]}
          xAxisKey={xAxisKey}
          seriesKeys={seriesKeys}
        />
      </div>
    </div>
  );
};

export default MapAndStackedColumnChart;
