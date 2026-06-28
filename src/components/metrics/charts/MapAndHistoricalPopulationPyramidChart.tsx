"use client";

import { useMemo } from "react";
import HistoricalPopulationPyramidChart from "@/components/metrics/charts/HistoricalPopulationPyramidChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { useLang } from "@/providers/LangProvider";
import {
  filterCombinationsByProvinceMapId,
  getArmeniaTitle,
  getProvinceTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForMapAndHistoricalPopulationPyramid } from "@/utils/chart/map-combinations-for-map-and-historical-population-pyramid.util";

interface MapDataItem {
  id: string;
  value: number;
}

interface MapAndHistoricalPopulationPyramidChartProps {
  data: {
    combinations: MetricCombination[];
    mapData: MapDataItem[];
    provinceAttributeId: string;
    attributeMapByCategory: Map<string, Attribute>;
    frameAttributeId?: string;
    timelineAxisAttributeName?: string;
  };
}

const MapAndHistoricalPopulationPyramidChart = ({
  data,
}: MapAndHistoricalPopulationPyramidChartProps) => {
  const {
    combinations,
    mapData = [],
    provinceAttributeId,
    attributeMapByCategory,
    frameAttributeId,
    timelineAxisAttributeName,
  } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();
  const { activeLang } = useLang();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return getArmeniaTitle(activeLang);
    return getProvinceTitleByMapId(activeProvinceMapId, activeLang) ?? activeProvinceMapId;
  }, [activeProvinceMapId, activeLang]);

  const { pyramidData, seriesKeys, timelineMode } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    return mapCombinationsForMapAndHistoricalPopulationPyramid({
      combinations: filtered,
      provinceAttributeId,
      attributeMapByCategory,
      frameAttributeId,
    });
  }, [
    combinations,
    provinceAttributeId,
    attributeMapByCategory,
    frameAttributeId,
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
        {/* HistoricalPopulationPyramidChart has no chartTitle prop and its own internal
            title bands, so the province title is rendered here above the chart. */}
        <div className="flex h-10 items-center justify-center text-center text-xl font-medium">
          {chartTitle}
        </div>
        <HistoricalPopulationPyramidChart
          data={pyramidData}
          seriesKeys={seriesKeys}
          timelineAxisAttributeName={timelineAxisAttributeName}
          timelineMode={timelineMode}
        />
      </div>
    </div>
  );
};

export default MapAndHistoricalPopulationPyramidChart;
