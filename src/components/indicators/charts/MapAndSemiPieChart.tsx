"use client";

import React, { useMemo } from "react";
import SemiCircleChart from "@/components/indicators/charts/SemiCircleChart";
import ArmeniaProvincesMap from "@/components/indicators/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { aggregateByAttributeTitle } from "@/utils/chart/aggregate-by-attribute-title";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import {
  filterCombinationsByProvinceMapId,
  getArmenianProvinceHyTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndSemiPieChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    genderAttributeId: string;
  };
}

const MapAndSemiPieChart = ({ combinations, data }: MapAndSemiPieChartProps) => {
  const { mapData = [], provinceAttributeId, genderAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const pieData = useMemo(() => {
    const scoped = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );

    return Array.from(aggregateByAttributeTitle(scoped, genderAttributeId).entries()).map(
      ([category, value]) => ({
        value,
        category,
      })
    );
  }, [combinations, provinceAttributeId, genderAttributeId, activeProvinceMapId]);

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(activeProvinceMapId) ?? activeProvinceMapId;
  }, [activeProvinceMapId]);

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
        <SemiCircleChart data={pieData} chartTitle={chartTitle} />
      </div>
    </div>
  );
};

export default MapAndSemiPieChart;
