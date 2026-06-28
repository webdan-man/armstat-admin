"use client";

import { useMemo } from "react";
import ClusteredColumnChart from "@/components/metrics/charts/ClusteredColumnChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import { useLang } from "@/providers/LangProvider";
import {
  filterCombinationsByProvinceMapId,
  getArmeniaTitle,
  getProvinceTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForClusteredColumnChartStacked } from "@/utils/chart/map-combinations-for-clustered-column-chart-stacked.util";
import { mapCombinationsForClusteredColumnChartStacked3D } from "@/utils/chart/map-combinations-for-clustered-column-chart-stacked-3d.util";

interface MapDataItem {
  id: string;
  value: number;
}

type AttrSpec = { id: string; key: string };

type GenderVariant = {
  variant: "gender";
  genderAttributeId: string;
  firstCtgAttribute: AttrSpec;
  secondCtgAttribute: AttrSpec;
};

type ThreeDVariant = {
  variant: "3d";
  attributes: [AttrSpec, AttrSpec, AttrSpec];
};

type MapAndClusteredColumnChartStackedProps = {
  data: {
    combinations: MetricCombination[];
    mapData: MapDataItem[];
    provinceAttributeId: string;
  } & (GenderVariant | ThreeDVariant);
};

const MapAndClusteredColumnChartStacked = ({ data }: MapAndClusteredColumnChartStackedProps) => {
  const { combinations, mapData = [], provinceAttributeId } = data;
  const { activeProvinceMapId, onPolygonHover, onPolygonSelect } = useProvinceHoverSelection();
  const { activeLang } = useLang();

  const chartTitle = useMemo(() => {
    if (!activeProvinceMapId) return getArmeniaTitle(activeLang);
    return getProvinceTitleByMapId(activeProvinceMapId, activeLang) ?? activeProvinceMapId;
  }, [activeProvinceMapId, activeLang]);

  const { columnData, seriesKeys, xAxisKey } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    const {
      data: columnData,
      seriesKeys,
      xAxisKey,
    } =
      data.variant === "gender"
        ? mapCombinationsForClusteredColumnChartStacked({
            combinations: filtered,
            genderAttributeId: data.genderAttributeId,
            firstCtgAttribute: data.firstCtgAttribute,
            secondCtgAttribute: data.secondCtgAttribute,
          })
        : mapCombinationsForClusteredColumnChartStacked3D({
            combinations: filtered,
            attributes: data.attributes,
          });
    return { columnData, seriesKeys, xAxisKey };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, combinations, provinceAttributeId, activeProvinceMapId]);

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
          key="map-and-clustered-column-chart-stacked"
          xAxisKey={xAxisKey}
          data={columnData as Record<string, string>[]}
          seriesKeys={seriesKeys}
          stacked
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndClusteredColumnChartStacked;
