"use client";

import React, { useMemo } from "react";
import ColumnWithRotatedLabelsChart from "@/components/metrics/charts/ColumnWithRotatedLabelsChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
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

function getBreakdownRowLabel(combinations: MetricCombination[], attributeId: string): string {
  for (const item of combinations) {
    const entry = (item.row ?? []).find((r) => r.attributeId === attributeId);
    if (entry?.label) return entry.label;
  }
  return "Հատկանիշ";
}

interface MapAndColumnWithRotatedLabelsChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    breakdownAttributeId: string;
  };
}

const MapAndColumnWithRotatedLabelsChart = ({
  combinations,
  data,
}: MapAndColumnWithRotatedLabelsChartProps) => {
  const { mapData = [], provinceAttributeId, breakdownAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();

  const columnData = useMemo(() => {
    const scoped = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    const label = getBreakdownRowLabel(scoped, breakdownAttributeId);
    return Array.from(aggregateByAttributeTitle(scoped, breakdownAttributeId).entries()).map(
      ([xAxisKey, value]) => ({
        value,
        xAxisKey,
        label,
      })
    );
  }, [combinations, provinceAttributeId, breakdownAttributeId, activeProvinceMapId]);

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
        <ColumnWithRotatedLabelsChart
          key="map-and-column-with-rotated-labels"
          data={columnData}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndColumnWithRotatedLabelsChart;
