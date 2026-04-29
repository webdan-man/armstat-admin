"use client";

import { useLayoutEffect, useRef } from "react";
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
}

export default function ArmeniaMapChart({ data }: ArmeniaMapChartProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!containerRef.current) return;

    const root = am5.Root.new(containerRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    const mainContainer = root.container.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.p100,
        height: am5.p100,
        paddingRight: 220,
        paddingLeft: 20,
      })
    );

    const chart = mainContainer.children.push(
      am5map.MapChart.new(root, {
        projection: am5map.geoMercator(),
        width: am5.percent(70),
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

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name} - {value}",
      interactive: true,
      toggleKey: "active",
      fill: am5.color(0xaaaaaa),
    });

    polygonSeries.mapPolygons.template.states.create("active", {
      fill: am5.color(COLORS.selected),
      stroke: am5.color(0x000000),
      strokeWidth: 2,
    });

    // 4. HEAT RULES
    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color(COLORS.low),
        max: am5.color(COLORS.high),
        key: "fill",
      },
    ]);

    // 5. LEGEND
    const heatLegend = mainContainer.children.push(
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

    // 6. MARKER CONTAINER
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
    const markerGroup = markerContainer.children.push(
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

    const pinnedLabel = markerGroup.children.push(
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
    const hoverGroup = markerContainer.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        centerX: am5.p100,
        centerY: am5.p50,
        x: 0,
        dx: -10,
        visible: false,
      })
    );

    const hoverLabel = hoverGroup.children.push(
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

    // 8. HELPERS
    const getMarkerPosition = (value: number) => {
      const low = heatLegend.get("startValue") as number | undefined;
      const high = heatLegend.get("endValue") as number | undefined;

      if (!low || !high || low === high) return 0;

      const ratio = (value - low) / (high - low);
      return am5.percent((1 - ratio) * 100);
    };

    const showHoverIndicator = (value: number, name: string) => {
      hoverLabel.set("text", `${name} - ${value}`);
      hoverGroup.set("y", getMarkerPosition(value));
      hoverGroup.set("visible", true);
    };

    const hideHoverIndicator = () => {
      hoverGroup.set("visible", false);
    };

    // STATE
    let lockedValue = null;
    let lockedName = "";

    // 9. EVENTS
    polygonSeries.mapPolygons.template.events.on("pointerover", (ev: any) => {
      const dataItem = ev?.target?.dataItem as any;
      const value = dataItem?.get?.("value") as number | undefined;
      const name = (dataItem?.dataContext as any)?.name ?? "Region";

      if (value !== undefined) {
        showHoverIndicator(value, name);
      }
    });

    polygonSeries.mapPolygons.template.events.on("pointerout", hideHoverIndicator);

    polygonSeries.mapPolygons.template.events.on("click", (ev: any) => {
      const target = ev?.target as any;
      const dataItem = target?.dataItem as any;

      setTimeout(() => {
        if (target.get("active")) {
          polygonSeries.mapPolygons.each((p) => {
            if (p !== target) p.set("active", false);
          });

          lockedValue = dataItem.get("value");
          lockedName = (dataItem.dataContext as any)?.name ?? "Region";

          pinnedLabel.set("text", `${lockedValue} - ${lockedName}`);
          markerGroup.set("y", getMarkerPosition(lockedValue as number));
          markerGroup.set("visible", true);
        } else {
          lockedValue = null;
          lockedName = "";
          markerGroup.set("visible", false);
        }
      }, 10);
    });

    // 10. DATA
    am5.net.load("/api/chart/map").then(({ response }: any) => {
      const geoData = am5.JSONParser.parse(response) as any;

      const lang = normalizeToMainLangCode(
        typeof navigator !== "undefined" ? navigator.language : undefined
      );
      const mapData = geoData.features.map(({ id, properties }: any) => ({
        id,
        name: PROVINCE_NAMES_BY_ID[id]?.[lang] ?? properties?.name ?? id,
        value: Math.round(Math.random() * 1000),
      }));

      polygonSeries.set("geoJSON", geoData);
      polygonSeries.data.setAll(mapData);
    });

    // 11. LEGEND VALUES
    polygonSeries.events.on("datavalidated", () => {
      const low = polygonSeries.getPrivate("valueLow") as number;
      const high = polygonSeries.getPrivate("valueHigh") as number;

      heatLegend.setAll({
        startValue: low,
        endValue: high,
        startText: `${low}`,
        endText: `${high}`,
      });
    });

    return () => {
      root.dispose(); // cleanup
    };
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}
