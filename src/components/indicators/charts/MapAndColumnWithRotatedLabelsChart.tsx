"use client";

import React, { useCallback, useMemo, useState } from "react";
import ColumnWithRotatedLabelsChart from "@/components/indicators/charts/ColumnWithRotatedLabelsChart";
import ArmeniaProvincesMap from "@/components/indicators/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { aggregateByAttributeTitle } from "@/utils/chart/aggregate-by-attribute-title";
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
  const [selectedProvinceMapId, setSelectedProvinceMapId] = useState<string | null>(null);

  const onPolygonSelect = useCallback((provinceMapId: string | null) => {
    setSelectedProvinceMapId(provinceMapId);
  }, []);

  const columnData = useMemo(() => {
    const scoped = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      selectedProvinceMapId
    );
    const label = getBreakdownRowLabel(scoped, breakdownAttributeId);
    return Array.from(aggregateByAttributeTitle(scoped, breakdownAttributeId).entries()).map(
      ([xAxisKey, value]) => ({
        value,
        xAxisKey,
        label,
      })
    );
  }, [combinations, provinceAttributeId, breakdownAttributeId, selectedProvinceMapId]);

  const chartTitle = useMemo(() => {
    if (!selectedProvinceMapId) return "Հայաստան";
    return getArmenianProvinceHyTitleByMapId(selectedProvinceMapId) ?? selectedProvinceMapId;
  }, [selectedProvinceMapId]);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-[35fr_65fr]">
      <div>
        <ArmeniaProvincesMap
          data={[]}
          onPolygonSelect={onPolygonSelect}
          onPolygonHover={onPolygonSelect}
          showRightColumn={false}
          useHeatRules={false}
        />
      </div>
      <div>
        <ColumnWithRotatedLabelsChart data={columnData} chartTitle={chartTitle} />
      </div>
    </div>
  );
};

export default MapAndColumnWithRotatedLabelsChart;
