"use client";

import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import type {
  GroupedStackedColumnChartRow,
  GroupedStackedDimension,
} from "@/utils/chart/map-combinations-for-grouped-stacked-column-chart.util";

interface GroupedStackedColumnChartProps {
  data: GroupedStackedColumnChartRow[];
  stackDimensions: GroupedStackedDimension[];
  innerAttributeName?: string;
}

const containerId = "grouped-stacked-column-chartdiv";

function buildAxisRanges(
  xAxis: am5xy.CategoryAxis<am5xy.AxisRenderer>,
  data: GroupedStackedColumnChartRow[]
): am5.DataItem<am5xy.ICategoryAxisDataItem>[] {
  const ranges: am5.DataItem<am5xy.ICategoryAxisDataItem>[] = [];

  const providerGroups = new Map<string, { first: string; last: string }>();
  for (const row of data) {
    if (!providerGroups.has(row.provider)) {
      providerGroups.set(row.provider, { first: row.category, last: row.category });
    } else {
      providerGroups.get(row.provider)!.last = row.category;
    }
  }

  providerGroups.forEach(({ first, last }, category) => {
    const range = xAxis.makeDataItem({});
    xAxis.createAxisRange(range);
    range.set("category", first);
    range.set("endCategory", last);

    range.get("label")?.setAll({
      forceHidden: false,
      text: category,
      rotation: -45,
      centerX: am5.p100,
      centerY: am5.p0,
      fontWeight: "bold",
      fontSize: 12,
      fill: am5.color(0x000000),
      dy: 10,
      maxWidth: 200,
      oversizedBehavior: "wrap",
      textAlign: "right",
      tooltipText: category,
    });

    range.get("tick")?.setAll({
      visible: true,
      strokeOpacity: 1,
      stroke: am5.color(0x000000),
      strokeWidth: 1,
      length: 70,
      location: 0,
    });

    range.get("grid")?.setAll({
      strokeOpacity: 1,
      stroke: am5.color(0x000000),
      strokeWidth: 1,
    });

    ranges.push(range);
  });

  if (data.length > 0) {
    const lastRange = xAxis.makeDataItem({});
    xAxis.createAxisRange(lastRange);
    lastRange.set("category", data[data.length - 1].category);

    lastRange.get("tick")?.setAll({
      visible: true,
      strokeOpacity: 1,
      stroke: am5.color(0x000000),
      strokeWidth: 1,
      length: 70,
      location: 1,
    });

    lastRange.get("grid")?.setAll({
      strokeOpacity: 1,
      stroke: am5.color(0x000000),
      strokeWidth: 1,
      location: 1,
    });

    ranges.push(lastRange);
  }

  return ranges;
}

function GroupedStackedColumnChart({
  data,
  stackDimensions,
  innerAttributeName = "",
}: GroupedStackedColumnChartProps) {
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const axisRangesRef = useRef<am5.DataItem<am5xy.ICategoryAxisDataItem>[]>([]);

  // Structure effect: recreate chart when series layout or label changes.
  // Does NOT depend on `data` so province-filter updates skip this entirely.
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);
    root.setThemes([am5themes_Animated.new(root)]);

    root.container.setAll({
      layout: root.verticalLayout,
      width: am5.p100,
      height: am5.p100,
      paddingTop: 0,
      paddingBottom: 0,
      paddingLeft: 0,
      paddingRight: 0,
    });

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingBottom: 0,
        height: 500,
        minHeight: 500,
        maxHeight: 680,
      })
    );

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    // Build subtype → color index map from initial data
    const subtypeColorIndex: Record<string, number> = {};
    const allSubtypes: { name: string; colorIndex: number }[] = [];
    let ci = 0;
    const providerSubtypeOrder: { subtype: string }[] = [];
    for (const row of data) {
      providerSubtypeOrder.push({ subtype: row.realName });
    }
    for (const { subtype } of providerSubtypeOrder) {
      if (!(subtype in subtypeColorIndex)) {
        subtypeColorIndex[subtype] = ci;
        allSubtypes.push({ name: subtype, colorIndex: ci });
        ci++;
      }
    }

    const hiddenSubtypes: Record<string, boolean> = {};

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 20,
      minorGridEnabled: true,
    });
    xRenderer.labels.template.set("forceHidden", true);

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0,
        categoryField: "category",
        renderer: xRenderer,
      })
    );
    xAxisRef.current = xAxis;

    chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: am5xy.AxisRendererY.new(root, {}),
      })
    );
    const yAxis = chart.yAxes.getIndex(0) as am5xy.ValueAxis<am5xy.AxisRenderer>;

    const tooltipLines = ["{realName}", ""];
    [...stackDimensions].reverse().forEach((dim) => {
      tooltipLines.push(`${dim.label}     [bold]{${dim.field}}[/]`);
    });
    const tooltipText = tooltipLines.join("\n");

    const seriesList: am5xy.ColumnSeries[] = [];

    stackDimensions.forEach((dim, i) => {
      const opacity = Math.max(1 - i * 0.3, 0.3);
      const isTop = i === stackDimensions.length - 1;
      const tooltip = isTop ? am5.Tooltip.new(root, { labelText: tooltipText }) : undefined;

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: dim.label,
          xAxis,
          yAxis,
          valueYField: dim.field,
          sequencedInterpolation: true,
          categoryXField: "category",
          stacked: i > 0,
          tooltip,
        })
      );

      series.columns.template.setAll({
        fillOpacity: opacity,
        stroke: am5.color(0xffffff),
        strokeOpacity: 1,
        strokeWidth: 0.5,
        width: am5.percent(90),
      });

      series.columns.template.adapters.add("fill", (fill, target) => {
        const ctx = target.dataItem?.dataContext as GroupedStackedColumnChartRow | undefined;
        if (ctx) return chart.get("colors")!.getIndex(subtypeColorIndex[ctx.realName]);
        return fill;
      });

      series.columns.template.adapters.add("forceHidden", (hidden, target) => {
        const ctx = target.dataItem?.dataContext as GroupedStackedColumnChartRow | undefined;
        if (ctx && hiddenSubtypes[ctx.realName]) return true;
        return hidden;
      });

      seriesList.push(series);
    });
    seriesListRef.current = seriesList;

    if (seriesList.length > 0) {
      cursor.set("snapToSeries", [seriesList[seriesList.length - 1]]);
      seriesList[seriesList.length - 1].columns.template.setAll({
        cornerRadiusTL: 4,
        cornerRadiusTR: 4,
      });
    }

    xAxis.data.setAll(data);
    seriesList.forEach((series) => {
      series.data.setAll(data);
      series.appear(1000);
    });
    axisRangesRef.current = buildAxisRanges(xAxis, data);

    const bottomContainer = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        paddingTop: 0,
        paddingBottom: 35,
        layout: root.verticalLayout,
      })
    );

    bottomContainer.children.push(
      am5.Label.new(root, {
        text: innerAttributeName,
        centerX: am5.p50,
        x: am5.p50,
        paddingBottom: 5,
        fontWeight: "bold",
        fontSize: 12,
        height: 50,
        minHeight: 30,
      })
    );

    const legend = bottomContainer.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        width: am5.percent(95),
        height: am5.p100,
        paddingTop: 0,
        paddingBottom: 0,
        layout: root.gridLayout,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );

    legend.itemContainers.template.setAll({
      cursorOverStyle: "pointer",
      width: 300,
      paddingTop: 4,
      paddingBottom: 4,
    });

    legend.markerRectangles.template.adapters.add("fill", (fill, target) => {
      const ctx = target.dataItem?.dataContext as { fill?: am5.Color } | undefined;
      if (ctx?.fill) return ctx.fill;
      return fill;
    });

    legend.markerRectangles.template.adapters.add("stroke", (stroke, target) => {
      const ctx = target.dataItem?.dataContext as { fill?: am5.Color } | undefined;
      if (ctx?.fill) return ctx.fill;
      return stroke;
    });

    legend.markers.template.setAll({ width: 14, height: 14 });

    legend.labels.template.setAll({
      text: "{name}",
      fontSize: 11,
      maxWidth: 270,
      oversizedBehavior: "wrap",
    });

    legend.valueLabels.template.set("forceHidden", true);

    legend.itemContainers.template.events.on("click", (e) => {
      const dataItem = e.target.dataItem;
      if (!dataItem?.dataContext) return;
      const subtype = (dataItem.dataContext as { name: string }).name;
      const nowHidden = !hiddenSubtypes[subtype];
      hiddenSubtypes[subtype] = nowHidden;
      e.target.set("opacity", nowHidden ? 0.35 : 1);
      seriesList.forEach((series) => {
        series.columns.each((col) => {
          const ctx = col.dataItem?.dataContext as GroupedStackedColumnChartRow | undefined;
          if (ctx?.realName === subtype) col.set("forceHidden", nowHidden);
        });
      });
    });

    allSubtypes.forEach((s) => {
      legend.data.push({
        name: s.name,
        fill: chart.get("colors")!.getIndex(s.colorIndex),
      });
    });

    chart.appear(1000, 100);

    return () => {
      xAxisRef.current = null;
      seriesListRef.current = [];
      axisRangesRef.current = [];
      root.dispose();
    };
  }, [stackDimensions, innerAttributeName]); // eslint-disable-line react-hooks/exhaustive-deps

  // Data effect: update data and axis ranges in-place — no chart recreation, no flash.
  useEffect(() => {
    const xAxis = xAxisRef.current;
    const seriesList = seriesListRef.current;
    if (!xAxis || !seriesList.length) return;

    axisRangesRef.current.forEach((r) => r.dispose());
    xAxis.data.setAll(data);
    seriesList.forEach((series) => series.data.setAll(data));
    axisRangesRef.current = buildAxisRanges(xAxis, data);
  }, [data]);

  return <div id={containerId} style={{ width: "100%", height: "800px" }} />;
}

export default GroupedStackedColumnChart;
