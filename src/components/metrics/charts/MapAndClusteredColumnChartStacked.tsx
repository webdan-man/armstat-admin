"use client";

import { useMemo } from "react";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import type { MetricCombination } from "@/types/metric";
import { useProvinceHoverSelection } from "@/hooks/useProvinceHoverSelection";
import {
  filterCombinationsByProvinceMapId,
  getArmeniaTitle,
  getProvinceTitleByMapId,
} from "@/utils/chart/map-combinations-for-armenia-provinces";
import { mapCombinationsForClusteredAndStackedColumnChart } from "@/utils/chart/map-combinations-for-clustered-and-stacked-column-chart.util";
import StackedAndClusteredColumnChart from "@/components/metrics/charts/StackedAndClusteredColumnChart";
import { useLang } from "@/providers/LangProvider";

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

  const { columnData, clusterKeys, stackKeys, xAxisKey } = useMemo(() => {
    const filtered = filterCombinationsByProvinceMapId(
      combinations,
      provinceAttributeId,
      activeProvinceMapId
    );
    // True clustered+stacked (3 dimensions). Gender variant forces GENDER onto the
    // stack layers; the remaining two attributes are split into X / cluster groups by
    // CXG. The 3d variant assigns all three roles purely by unique-value count.
    const {
      data: columnData,
      clusterKeys,
      stackKeys,
      xAxisKey,
    } = data.variant === "gender"
      ? mapCombinationsForClusteredAndStackedColumnChart({
          combinations: filtered,
          attributes: [
            { id: data.genderAttributeId, key: "gender" },
            data.firstCtgAttribute,
            data.secondCtgAttribute,
          ],
          stackAttributeId: data.genderAttributeId,
        })
      : mapCombinationsForClusteredAndStackedColumnChart({
          combinations: filtered,
          attributes: data.attributes,
        });
    return { columnData, clusterKeys, stackKeys, xAxisKey };
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
        <StackedAndClusteredColumnChart
          key="map-and-clustered-column-chart-stacked"
          xAxisKey={xAxisKey}
          data={columnData as Record<string, string | number>[]}
          clusterKeys={clusterKeys}
          stackKeys={stackKeys}
          chartTitle={chartTitle}
        />
      </div>
    </div>
  );
};

export default MapAndClusteredColumnChartStacked;
