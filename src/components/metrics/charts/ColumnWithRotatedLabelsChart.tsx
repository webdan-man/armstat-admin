import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getPaletteColor } from "@/utils/chart/chart-palette.util";
import { lockPlotHeight, setupDynamicChartHeight } from "@/utils/chart/fixed-plot-chart-layout.util";

interface DataItem {
  xAxisKey: string;
  value: number;
  label: string;
}

interface ColumnWithRotatedLabelsChartProps {
  data: DataItem[];
  /** Optional title shown above the chart. Only passed in map+chart combinations. */
  chartTitle?: string;
}

const containerId = "columns-with-rotated-labels-chartdiv";
const LEGEND_BAR_HEIGHT = 160;
const LEGEND_MAX_HEIGHT = 120;
const LEGEND_LABEL_MAX_WIDTH = 140;
const LEGEND_LABEL_GAP = 15;
const CHART_TITLE_HEIGHT = 32;
/** Small gap below the x-axis band; label overflow is already included in chart height. */
const LEGEND_TOP_GAP = 10;

type LegendEntry = {
  name: string;
  fill: am5.Color;
};

function applyHiddenColumns(series: am5xy.ColumnSeries, hidden: Set<string>) {
  series.columns.each((column) => {
    const key = (column.dataItem?.dataContext as DataItem | undefined)?.xAxisKey;
    if (!key) return;
    column.set("forceHidden", hidden.has(key));
  });
}

function refreshLegendData(
  legend: am5.Legend,
  chart: am5xy.XYChart,
  rows: DataItem[],
  hidden: Set<string>
) {
  const greyColor = am5.color(0xaaaaaa);
  legend.data.setAll(
    rows.map((row, index) => ({
      name: row.xAxisKey,
      fill: hidden.has(row.xAxisKey)
        ? greyColor
        : getPaletteColor(chart.get("colors"), index)!,
    }))
  );

  rows.forEach((row, index) => {
    legend.itemContainers.getIndex(index)?.set("opacity", hidden.has(row.xAxisKey) ? 0.35 : 1);
  });
}

function ColumnWithRotatedLabelsChart({ data, chartTitle }: ColumnWithRotatedLabelsChartProps) {
  const rootRef = useRef<am5.Root | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const seriesRef = useRef<am5xy.ColumnSeries | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const legendRef = useRef<am5.Legend | null>(null);
  const legendLabelRef = useRef<am5.Label | null>(null);
  const hiddenCategoryKeysRef = useRef<Set<string>>(new Set());
  const dataRef = useRef(data);
  dataRef.current = data;

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // Root layout
    root.container.set("layout", root.verticalLayout);

    if (chartTitle !== undefined) {
      const titleLabel = root.container.children.unshift(
        am5.Label.new(root, {
          text: chartTitle,
          fontSize: 16,
          fontWeight: "500",
          centerX: am5.p50,
          x: am5.p50,
        })
      );
      titleLabelRef.current = titleLabel;
    }

    // Chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 30,
      })
    );
    chartRef.current = chart;

    lockPlotHeight(chart);

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    // Cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    // X Axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    xRenderer.labels.template.setAll({
      rotation: -45,
      // Top-right corner on the tick / x-axis line; text runs down-right from the axis.
      centerY: am5.p0,
      centerX: am5.p100,
      textAlign: "right",
      paddingTop: 0,
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
      width: 140,
      maxWidth: 140,
      oversizedBehavior: "wrap",
    });

    xRenderer.grid.template.setAll({ location: 1 });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "xAxisKey",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxisRef.current = xAxis;

    // Y Axis
    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    const hasNegativeValue = data.some((d) => d.value < 0);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
        ...(hasNegativeValue ? {} : { min: 0 }),
      })
    );
    yAxisRef.current = yAxis;

    // Series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "xAxisKey",
        tooltip: am5.Tooltip.new(root, {
          labelText: "[bold]{valueY}[/]",
        }),
      })
    );
    seriesRef.current = series;

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });

    // Color adapters
    series.columns.template.adapters.add("fill", (fill, target) =>
      getPaletteColor(chart.get("colors"), series.columns.indexOf(target))
    );

    series.columns.template.adapters.add("stroke", (stroke, target) =>
      getPaletteColor(chart.get("colors"), series.columns.indexOf(target))
    );

    series.columns.template.adapters.add("forceHidden", (hidden, target) => {
      const key = (target.dataItem?.dataContext as DataItem | undefined)?.xAxisKey;
      if (key && hiddenCategoryKeysRef.current.has(key)) return true;
      return hidden;
    });

    xAxis.data.setAll(data);
    series.data.setAll(data);
    applyHiddenColumns(series, hiddenCategoryKeysRef.current);

    const greyColor = am5.color(0xaaaaaa);

    // Legend bar: label on the left, color squares on the right.
    const legendBar = root.container.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.percent(100),
        paddingTop: LEGEND_TOP_GAP,
        paddingBottom: 10,
        height: LEGEND_BAR_HEIGHT + LEGEND_TOP_GAP,
      })
    );

    const legendLabelSlot = legendBar.children.push(
      am5.Container.new(root, {
        width: LEGEND_LABEL_MAX_WIDTH + LEGEND_LABEL_GAP,
        height: am5.percent(100),
      })
    );

    legendLabelRef.current = legendLabelSlot.children.push(
      am5.Label.new(root, {
        position: "absolute",
        x: 0,
        y: am5.p50,
        centerY: am5.p50,
        text: data[0]?.label || "Հատկանիշ",
        width: LEGEND_LABEL_MAX_WIDTH,
        paddingRight: LEGEND_LABEL_GAP,
        fontSize: 16,
        maxWidth: LEGEND_LABEL_MAX_WIDTH,
        oversizedBehavior: "wrap",
        textAlign: "left",
      })
    );

    // Wrapper gives the legend a definite width so GridLayout can wrap items.
    const legendWrapper = legendBar.children.push(
      am5.Container.new(root, {
        width: am5.percent(100),
        height: am5.percent(100),
      })
    );

    const legend = legendWrapper.children.push(
      am5.Legend.new(root, {
        layout: am5.GridLayout.new(root, {
          fixedWidthGrid: false,
          maxColumns: 100,
        }),
        width: am5.percent(100),
        centerY: am5.p50,
        y: am5.p50,
        maxHeight: LEGEND_MAX_HEIGHT,
        paddingTop: 0,
        paddingBottom: 0,
        // Reserve room on the right for the scrollbar so the grid wraps before it
        // instead of having its last column cut off behind the scrollbar.
        paddingRight: 30,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );
    legendRef.current = legend;

    legend.labels.template.set("forceHidden", true);
    legend.valueLabels.template.set("forceHidden", true);

    // Marker styling
    legend.markers.template.setAll({
      width: 22,
      height: 22,
    });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
    });

    // Fill adapter
    legend.markerRectangles.template.adapters.add("fill", (fill, target) => {
      const entry = target.dataItem?.dataContext as LegendEntry | undefined;
      if (!entry) return fill;
      if (hiddenCategoryKeysRef.current.has(entry.name)) return greyColor;
      return entry.fill ?? fill;
    });

    // Stroke adapter
    legend.markerRectangles.template.adapters.add("stroke", (stroke, target) => {
      const entry = target.dataItem?.dataContext as LegendEntry | undefined;
      if (!entry) return stroke;
      if (hiddenCategoryKeysRef.current.has(entry.name)) return greyColor;
      return entry.fill ?? stroke;
    });

    legend.itemContainers.template.events.on("click", (e) => {
      const entry = e.target.dataItem?.dataContext as LegendEntry | undefined;
      if (!entry?.name) return;

      const nowHidden = !hiddenCategoryKeysRef.current.has(entry.name);
      if (nowHidden) hiddenCategoryKeysRef.current.add(entry.name);
      else hiddenCategoryKeysRef.current.delete(entry.name);

      applyHiddenColumns(series, hiddenCategoryKeysRef.current);
      refreshLegendData(legend, chart, dataRef.current, hiddenCategoryKeysRef.current);
    });

    refreshLegendData(legend, chart, data, hiddenCategoryKeysRef.current);

    const disposeDynamicHeight = setupDynamicChartHeight({
      root,
      chart,
      xAxis,
      getContainerEl: () => containerRef.current,
      heightWatchers: [legendBar],
      bottomBuffer: 15,
      getAboveChartHeight: () => (chartTitle !== undefined ? CHART_TITLE_HEIGHT : 0),
      getBelowChartHeight: () => legendBar.height() || LEGEND_BAR_HEIGHT + LEGEND_TOP_GAP,
    });

    // Animations
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      disposeDynamicHeight();
      rootRef.current = null;
      titleLabelRef.current = null;
      xAxisRef.current = null;
      yAxisRef.current = null;
      seriesRef.current = null;
      chartRef.current = null;
      legendRef.current = null;
      legendLabelRef.current = null;
      root.dispose();
    };
  }, []);

  useEffect(() => {
    const xAxis = xAxisRef.current;
    const yAxis = yAxisRef.current;
    const series = seriesRef.current;
    const chart = chartRef.current;
    const legend = legendRef.current;
    if (!xAxis || !series || !chart) return;

    xAxis.data.setAll(data);
    series.data.setAll(data);
    applyHiddenColumns(series, hiddenCategoryKeysRef.current);

    // Only clamp the y-axis to 0 when there are no negative values; otherwise
    // let amCharts auto-fit so negative bars are visible.
    const hasNegativeValue = data.some((d) => d.value < 0);
    yAxis?.set("min", hasNegativeValue ? undefined : 0);

    if (legend) {
      refreshLegendData(legend, chart, data, hiddenCategoryKeysRef.current);
    }

    // Update legend descriptor label (e.g. "Հատկանիշ") based on data.
    legendLabelRef.current?.set("text", data[0]?.label || "Հատկանիշ");
  }, [data]);

  useEffect(() => {
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  return (
    <div>
      <div ref={containerRef} id={containerId} style={{ width: "100%", height: "680px" }}></div>
    </div>
  );
}

export default ColumnWithRotatedLabelsChart;
