"use client";

import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5map from "@amcharts/amcharts5/map";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

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

    const chart = root.container.children.push(
      am5map.MapChart.new(root, {
        panX: "rotateX",
        projection: am5map.geoMercator(),
        layout: root.horizontalLayout,
      })
    );

    // Create polygon series for continents
    // https://www.amcharts.com/docs/v5/charts/map-chart/map-polygon-series/
    const polygonSeries = chart.series.push(
      am5map.MapPolygonSeries.new(root, {
        calculateAggregates: true,
        valueField: "value",
      })
    );

    polygonSeries.mapPolygons.template.setAll({
      tooltipText: "{name}", // TODO: all translations
      interactive: true,
    });

    polygonSeries.mapPolygons.template.states.create("hover", {
      fill: am5.color(0x677935),
    });

    polygonSeries.set("heatRules", [
      {
        target: polygonSeries.mapPolygons.template,
        dataField: "value",
        min: am5.color(0x8ab7ff),
        max: am5.color(0x25529a),
        key: "fill",
      },
    ]);

    polygonSeries.mapPolygons.template.events.on("pointerover", function (ev) {
      // @ts-ignore
      heatLegend.showValue(ev.target.dataItem?.get("value") + "test");
    });

    chart.set("projection", am5map.geoMercator());

    am5.net.load("/api/chart/map", chart).then(function (result) {
      const geodata = am5.JSONParser.parse(result.response as string);

      polygonSeries.set("geoJSON", geodata);
      polygonSeries.data.setAll(data);
    });

    chart.seriesContainer.children.push(
      am5.Label.new(root, {
        x: 5,
        y: 5,
        text: "",
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0.2,
        }),
      })
    );

    const heatLegend = chart.children.push(
      am5.HeatLegend.new(root, {
        orientation: "vertical",
        startColor: am5.color(0x8ab7ff),
        endColor: am5.color(0x25529a),
        startText: "Lowest",
        endText: "Highest",
        stepCount: 5,
        startOpacity: 0,
        endOpacity: 0,
      })
    );

    heatLegend.startLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("startColor"),
    });

    heatLegend.endLabel.setAll({
      fontSize: 12,
      fill: heatLegend.get("endColor"),
    });

    // change this to template when possible
    polygonSeries.events.on("datavalidated", function () {
      heatLegend.set("startValue", polygonSeries.getPrivate("valueLow"));
      heatLegend.set("endValue", polygonSeries.getPrivate("valueHigh"));
    });

    return () => {
      root.dispose(); // cleanup
    };
  }, [data]);

  return <div ref={containerRef} style={{ width: "100%", height: "500px" }} />;
}
