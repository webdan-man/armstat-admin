"use client";

import React, { useCallback, useMemo, useState } from "react";
import SemiCircleChart from "@/components/indicators/charts/SemiCircleChart";
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
  const [selectedProvinceMapId, setSelectedProvinceMapId] = useState<string | null>(null);

  const onPolygonSelect = useCallback((provinceMapId: string | null) => {
    setSelectedProvinceMapId(provinceMapId);
  }, []);

  const pieData = useMemo(() => {
    const scoped = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      selectedProvinceMapId
    );

    return Array.from(aggregateByAttributeTitle(scoped, genderAttributeId).entries()).map(
      ([category, value]) => ({
        value,
        category,
      })
    );
  }, [combinations, provinceAttributeId, genderAttributeId, selectedProvinceMapId]);

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
        <SemiCircleChart data={pieData} chartTitle={chartTitle} />
      </div>
    </div>
  );
};

export default MapAndSemiPieChart;
