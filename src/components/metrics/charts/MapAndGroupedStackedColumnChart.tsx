"use client";

import React, { useMemo } from "react";
import GroupedStackedColumnChart from "@/components/metrics/charts/GroupedStackedColumnChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { useLang } from "@/providers/LangProvider";
import {
  filterCombinationsByProvinceMapId,
  getArmeniaTitle,
  getProvinceTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForGroupedStackedColumnChart } from "@/utils/chart/map-combinations-for-grouped-stacked-column-chart.util";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndGroupedStackedColumnChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    outerAttributeId: string;
    innerAttributeId: string;
    stackAttributeId: string;
    innerAttributeName: string;
  };
}

const MapAndGroupedStackedColumnChart = ({
  combinations,
  data,
}: MapAndGroupedStackedColumnChartProps) => {
  const {
    mapData = [],
    provinceAttributeId,
    outerAttributeId,
    innerAttributeId,
    stackAttributeId,
    innerAttributeName,
  } = data;

  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();
  const { activeLang } = useLang();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return getArmeniaTitle(activeLang);
    return getProvinceTitleByMapId(activeProvinceMapId, activeLang) ?? activeProvinceMapId;
  }, [activeProvinceMapId, activeLang]);

  // stackDimensions derives from the full dataset — stable across province selections
  // so the chart structure effect never re-fires on filter changes.
  const { stackDimensions } = useMemo(
    () =>
      mapCombinationsForGroupedStackedColumnChart({
        combinations,
        outerAttributeId,
        innerAttributeId,
        stackAttributeId,
      }),
    [combinations, outerAttributeId, innerAttributeId, stackAttributeId]
  );

  // chartData re-derives on province selection — triggers only the data effect.
  const chartData = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    return mapCombinationsForGroupedStackedColumnChart({
      combinations: filtered,
      outerAttributeId,
      innerAttributeId,
      stackAttributeId,
    }).data;
  }, [combinations, provinceAttributeId, outerAttributeId, innerAttributeId, stackAttributeId, activeProvinceMapId]);

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
        {/* GroupedStackedColumnChart has no chartTitle prop, so the province title is
            rendered here above the chart. */}
        <div className="flex h-10 items-center justify-center text-center text-xl font-medium">
          {chartTitle}
        </div>
        <GroupedStackedColumnChart
          data={chartData}
          stackDimensions={stackDimensions}
          innerAttributeName={innerAttributeName}
        />
      </div>
    </div>
  );
};

export default MapAndGroupedStackedColumnChart;
