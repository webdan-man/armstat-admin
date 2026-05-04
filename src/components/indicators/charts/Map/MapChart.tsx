"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type MainLangCode = "hy" | "ru" | "en";

const PROVINCE_NAMES_BY_ID: Record<string, { hy: string; en: string; ru: string }> = {
  "AM-AG": { hy: "Արագածոտն", en: "Aragatsotn", ru: "Арагацотн" },
  "AM-AR": { hy: "Արարատ", en: "Ararat", ru: "Арарат" },
  "AM-AV": { hy: "Արմավիր", en: "Armavir", ru: "Армавир" },
  "AM-ER": { hy: "Երևան", en: "Yerevan", ru: "Ереван" },
  "AM-GR": { hy: "Գեղարքունիք", en: "Gegharkunik", ru: "Гегаркуник" },
  "AM-KT": { hy: "Կոտայք", en: "Kotayk", ru: "Котайк" },
  "AM-LO": { hy: "Լոռի", en: "Lori", ru: "Лори" },
  "AM-SH": { hy: "Շիրակ", en: "Shirak", ru: "Ширак" },
  "AM-SU": { hy: "Սյունիք", en: "Syunik", ru: "Сюник" },
  "AM-TV": { hy: "Տավուշ", en: "Tavush", ru: "Тавуш" },
  "AM-VD": { hy: "Վայոց Ձոր", en: "Vayots Dzor", ru: "Вайоц Дзор" },
};

function normalizeToMainLangCode(locale: string | undefined): MainLangCode {
  const lower = (locale ?? "").toLowerCase();
  if (lower.startsWith("en")) return "en";
  if (lower.startsWith("ru")) return "ru";
  return "hy";
}

interface ArmeniaMapChartProps {
  data: {
    id: string;
    value: number;
  }[];
  /** Shows the right-side legend/marker column. */
  showRightColumn?: boolean;
  /** Enables value-based polygon coloring (heat rules). */
  useHeatRules?: boolean;
  /** Fired when a province polygon is toggled; `null` when the selection is cleared. */
  onPolygonSelect?: (provinceMapId: string | null) => void;
  /** Fired on polygon hover; `null` when pointer leaves the map polygon. */
  onPolygonHover?: (provinceMapId: string | null) => void;
}

export default function ArmeniaMapChart({
  data,
  showRightColumn = true,
  useHeatRules = true,
  onPolygonSelect,
  onPolygonHover,
}: ArmeniaMapChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const onPolygonSelectRef = useRef(onPolygonSelect);
  const onPolygonHoverRef = useRef(onPolygonHover);
  const dataRef = useRef<ArmeniaMapChartProps["data"]>(data);

  const rootRef = useRef<am5.Root | null>(null);
  const polygonSeriesRef = useRef<am5map.MapPolygonSeries | null>(null);
  const heatLegendRef = useRef<am5.HeatLegend | null>(null);
  const geoJsonRef = useRef<any | null>(null);
  const pendingMapDataRef = useRef<any[] | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;
    if (rootRef.current) return;

    const root = am5.Root.new(containerRef.current);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const mainContainer = root.container.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.p100,
        height: am5.p100,
        paddingRight: showRightColumn ? 150 : 20,
        paddingLeft: 20,
      })
    );

    const chart = mainContainer.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        width: am5.percent(100),
      })
    );

    // 3. SERIES
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        valueField: "value",
        calculateAggregates: true,
      })
    );

    const COLORS = {
      low: 0x8ab7ff,
      high: 0x25529a,
      selected: 0xffd700,
    };

    const hexFlat = 0x8ab7ff;
    const hexHover = 0x5d96e8;
    const hexSelected = 0xffd700;

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}",
      interactive: true,
      toggleKey: "active",
      fill: am5.color(hexFlat),
      stroke: am5.color(0xffffff),
      strokeWidth: 1,
      cursorOverStyle: "pointer",
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(hexHover),
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(hexSelected),
      stroke: am5.color(0x000000),
      strokeWidth: 2,
    });

    // 4. HEAT RULES
    if (useHeatRules) {
      polygonSeries.set("heatRules", [
        {
          target: polygonSeries.mapPolygons.template,
          dataField: "value",
          min: am5.color(COLORS.low),
          max: am5.color(COLORS.high),
          key: "fill",
        },
      ]);
    }

    // 5-7. OPTIONAL RIGHT COLUMN (legend + markers)
    let heatLegend: am5.HeatLegend | null = null;
    let markerGroup: am5.Container | null = null;
    let pinnedLabel: am5.Label | null = null;
    let hoverGroup: am5.Container | null = null;
    let hoverLabel: am5.Label | null = null;

    if (showRightColumn) {
      heatLegend = mainContainer.children.push(
        am5.HeatLegend.new(root, {
          orientation: "vertical",
          startColor: am5.color(COLORS.low),
          endColor: am5.color(COLORS.high),
          startOpacity: 1,
          endOpacity: 1,
          startText: "Min",
          endText: "Max",
          centerY: am5.p50,
          y: am5.p50,
          height: am5.percent(80),
          marginLeft: 40,
        })
      );
      heatLegendRef.current = heatLegend;

      heatLegend.startLabel.setAll({
        centerX: am5.p50,
        x: am5.p50,
        centerY: am5.p100,
        dy: 30,
        isMeasured: false,
        fill: am5.color(COLORS.low),
        fontWeight: "bold",
      });

      heatLegend.endLabel.setAll({
        centerX: am5.p50,
        x: am5.p50,
        centerY: 0,
        dy: -30,
        isMeasured: false,
        fill: am5.color(COLORS.high),
        fontWeight: "bold",
      });

      const markerContainer = heatLegend.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          height: am5.p100,
          isMeasured: false,
          position: "absolute",
          x: 0,
          y: 0,
        })
      );

      // 7a. PINNED MARKER
      markerGroup = markerContainer.children.push(
        am5.Container.new(root, {
          layout: root.horizontalLayout,
          centerX: 0,
          centerY: am5.p50,
          x: am5.p100,
          dx: 15,
          visible: false,
        })
      );

      markerGroup.children.push(
        am5.Triangle.new(root, {
          width: 10,
          height: 10,
          fill: am5.color(0xccac00),
          stroke: am5.color(0xffffff),
          strokeWidth: 1,
          rotation: 270,
          centerY: am5.p50,
        })
      );

      pinnedLabel = markerGroup.children.push(
        am5.Label.new(root, {
          text: "",
          fill: am5.color(0xccac00),
          fontWeight: "bold",
          fontSize: 14,
          paddingLeft: 8,
          centerY: am5.p50,
        })
      );

      // 7b. HOVER MARKER
      hoverGroup = markerContainer.children.push(
        am5.Container.new(root, {
          layout: root.horizontalLayout,
          centerX: am5.p100,
          centerY: am5.p50,
          x: 0,
          dx: -10,
          visible: false,
        })
      );

      hoverLabel = hoverGroup.children.push(
        am5.Label.new(root, {
          text: "",
          fill: am5.color(COLORS.high),
          fontWeight: "bold",
          fontSize: 14,
          paddingRight: 8,
          centerY: am5.p50,
        })
      );

      hoverGroup.children.push(
        am5.Triangle.new(root, {
          width: 10,
          height: 10,
          fill: am5.color(COLORS.high),
          stroke: am5.color(0xffffff),
          strokeWidth: 1,
          rotation: 90,
          centerY: am5.p50,
        })
      );
    }

    // 8. HELPERS
    const getMarkerPosition = (value: number) => {
      const legend = heatLegendRef.current;
      if (!legend) return 0;
      const low = legend.get("startValue") as number | undefined;
      const high = legend.get("endValue") as number | undefined;

      if (!low || !high || low === high) return 0;

      const ratio = (value - low) / (high - low);
      return am5.percent((1 - ratio) * 100);
    };

    const showHoverIndicator = (value: number, name: string) => {
      if (!hoverLabel || !hoverGroup) return;
      hoverLabel.set("text", `${name} - ${value}`);
      hoverGroup.set("y", getMarkerPosition(value));
      hoverGroup.set("visible", true);
    };

    const hideHoverIndicator = () => {
      if (!hoverGroup) return;
      hoverGroup.set("visible", false);
    };

    // STATE
    let lockedValue: number | null = null;
    let lockedName = "";

    // 9. EVENTS
    polygonSeries.mapPolygons.template.events.on("pointerover", (ev: any) => {
      const dataItem = ev?.target?.dataItem as any;
      const value = dataItem?.get?.("value") as number | undefined;
      const name = (dataItem?.dataContext as any)?.name ?? "Region";
      const id = (dataItem?.dataContext as any)?.id as string | undefined;

      if (value !== undefined) {
        showHoverIndicator(value, name);
      }

      onPolygonHoverRef.current?.(id ?? null);
    });

    polygonSeries.mapPolygons.template.events.on("pointerout", () => {
      hideHoverIndicator();
      onPolygonHoverRef.current?.(null);
    });

    polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
      const target = ev?.target as any;
      const dataItem = target?.dataItem as any;

      setTimeout(() => {
        if (target.get("active")) {
          polygonSeries.mapPolygons.each((p) => {
            if (p !== target) p.set("active", false);
          });

          lockedValue = dataItem.get("value") as number | null;
          lockedName = (dataItem.dataContext as any)?.name ?? "Region";

          if (pinnedLabel && markerGroup && lockedValue !== null) {
            pinnedLabel.set("text", `${lockedValue} - ${lockedName}`);
            markerGroup.set("y", getMarkerPosition(lockedValue));
            markerGroup.set("visible", true);
          }

          const mapId = (dataItem.dataContext as any)?.id as string | undefined;
          onPolygonSelectRef.current?.(mapId ?? null);
        } else {
          lockedValue = null;
          lockedName = "";
          markerGroup?.set("visible", false);
          onPolygonSelectRef.current?.(null);
        }
      }, 10);
    });

    polygonSeriesRef.current = polygonSeries;

    const buildAndSetMapData = (geoData: any, valueData: ArmeniaMapChartProps["data"]) => {
      const valueByProvinceId = new Map(valueData.map((d) => [d.id, d.value]));
      const lang = normalizeToMainLangCode(
        typeof navigator !== "undefined" ? navigator.language : undefined
      );
      const mapData = geoData.features.map(({ id, properties }: any) => ({
        id,
        name: PROVINCE_NAMES_BY_ID[id]?.[lang] ?? properties?.name ?? id,
        value: valueByProvinceId.get(id) ?? 0,
      }));

      polygonSeries.set("geoJSON", geoData);
      polygonSeries.data.setAll(mapData);
    };

    am5.net.load("/api/chart/map").then(({ response }: any) => {
      const geoData = am5.JSONParser.parse(response) as any;
      geoJsonRef.current = geoData;

      const nextData = pendingMapDataRef.current ?? dataRef.current;
      pendingMapDataRef.current = null;
      buildAndSetMapData(geoData, nextData);
    });

    // 11. LEGEND VALUES
    polygonSeries.events.on("datavalidated", () => {
      const low = polygonSeries.getPrivate("valueLow") as number;
      const high = polygonSeries.getPrivate("valueHigh") as number;

      heatLegend?.setAll({
        startValue: low,
        endValue: high,
        startText: `${low}`,
        endText: `${high}`,
      });
    });

    return () => {
      rootRef.current = null;
      polygonSeriesRef.current = null;
      heatLegendRef.current = null;
      geoJsonRef.current = null;
      pendingMapDataRef.current = null;
      root.dispose(); // cleanup
    };
  }, [showRightColumn, useHeatRules]);

  useEffect(() => {
    onPolygonSelectRef.current = onPolygonSelect;
    onPolygonHoverRef.current = onPolygonHover;
  }, [onPolygonSelect, onPolygonHover]);

  useEffect(() => {
    dataRef.current = data;
    const geoData = geoJsonRef.current;
    const polygonSeries = polygonSeriesRef.current;

    if (!polygonSeries) return;
    if (!geoData) {
      pendingMapDataRef.current = data;
      return;
    }

    const valueByProvinceId = new Map(data.map((d) => [d.id, d.value]));
    const lang = normalizeToMainLangCode(
      typeof navigator !== "undefined" ? navigator.language : undefined
    );
    const mapData = geoData.features.map(({ id, properties }: any) => ({
      id,
      name: PROVINCE_NAMES_BY_ID[id]?.[lang] ?? properties?.name ?? id,
      value: valueByProvinceId.get(id) ?? 0,
    }));
    polygonSeries.data.setAll(mapData);
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}
