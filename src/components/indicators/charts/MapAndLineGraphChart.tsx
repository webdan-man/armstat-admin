"use client";

import React, { useCallback, useMemo, useState } from "react";
import LineGraphChart from "@/components/indicators/charts/LineGraphChart";
import ArmeniaProvincesMap from "@/components/indicators/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { aggregateByAttributeTitle } from "@/utils/chart/aggregate-by-attribute-title";
import {
  filterCombinationsByProvinceMapId,
  getArmenianProvinceHyTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";
import { yearTotalsToLineData } from "@/utils/chart/year-totals-to-line-data";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndLineGraphChartProps {
  combinations: MetricCombination[];
  data: {
    mapData: MapDataItem[];
    provinceAttributeId: string;
    timeAttributeId: string;
  };
}

const MapAndLineGraphChart = ({ combinations, data }: MapAndLineGraphChartProps) => {
  const { mapData = [], provinceAttributeId, timeAttributeId } = data;
  const [selectedProvinceMapId, setSelectedProvinceMapId] = useState<string | null>(null);

  const onPolygonSelect = useCallback((provinceMapId: string | null) => {
    setSelectedProvinceMapId(provinceMapId);
  }, []);

  const lineData = useMemo(() => {
    const scoped = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      selectedProvinceMapId
    );
    return yearTotalsToLineData(aggregateByAttributeTitle(scoped, timeAttributeId));
  }, [combinations, provinceAttributeId, timeAttributeId, selectedProvinceMapId]);

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
        <LineGraphChart data={lineData} chartTitle={chartTitle} />
      </div>
    </div>
  );
};

export default MapAndLineGraphChart;
