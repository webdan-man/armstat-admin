import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getStableSeriesColor } from "@/utils/chart/stable-series-color.util";
import {
  applySingleLineLegendLabels,
  CHART_HEADER_HEADROOM as PLOT_CHART_HEADER_HEADROOM,
  LEGEND_BLOCK_HEIGHT,
  LEGEND_OVERFLOW_PADDING,
  lockPlotHeight,
  setupDynamicChartHeight,
} from "@/utils/chart/fixed-plot-chart-layout.util";

interface ClusteredColumnChartProps<T extends Record<string, string | number>> {
  data: T[];
  xAxisKey: string; // e.g. xAxisKey
  seriesKeys?: string[];
  stacked?: boolean;
  /** Optional title shown above the chart (e.g. selected province in map combinations). */
  chartTitle?: string;
}

const containerId = "clustered-column-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;
const CHART_HEADER_HEADROOM = 24;

function ClusteredColumnChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  stacked = false,
  chartTitle,
}: ClusteredColumnChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const legendRef = useRef<am5.Legend | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartTitleRef = useRef(chartTitle);
  const dataRef = useRef(data);
  dataRef.current = data;

  // Stable dependency for the series-reconcile effect: the array identity of
  // `seriesKeys` changes on every parent render, but its contents are what matter.
  const seriesKeysSignature = seriesKeys.join(" ");

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    root.container.set("layout", root.verticalLayout);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 20,
        paddingTop: 0,
      })
    );
    chartRef.current = chart;

    lockPlotHeight(chart);

    if (chartTitle !== undefined) {
      root.container.setAll({ paddingTop: PLOT_CHART_HEADER_HEADROOM });

      chart.topAxesContainer.setAll({
        marginTop: -CHART_HEADER_HEADROOM,
        paddingTop: 0,
        paddingBottom: 0,
      });

      const titleBand = chart.topAxesContainer.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          height: CHART_TITLE_BAND_HEIGHT,
        })
      );

      const titleLabel = titleBand.children.push(
        am5.Label.new(root, {
          text: chartTitleRef.current ?? "",
          fontSize: 20,
          x: am5.p50,
          centerX: am5.p50,
          y: am5.p50,
          centerY: am5.p50,
          maxWidth: 250,
          oversizedBehavior: "wrap",
          textAlign: "center",
        })
      );
      titleLabelRef.current = titleLabel;
    }

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);
    cursor.lineX.set("visible", false);

    // ========== AXES ==========
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
    });

    xRenderer.grid.template.setAll({ location: 1 });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: xAxisKey,
        renderer: xRenderer,
      })
    );
    xAxisRef.current = xAxis;

    xRenderer.labels.template.setAll({
      rotation: -45,
      // Top-right corner on the tick / x-axis line; text runs down-right from the axis.
      centerY: am5.p0,
      centerX: am5.p100,
      textAlign: "right",
      paddingTop: 0,
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
      // Rotated labels only wrap with an explicit width (maxWidth alone won't trigger it).
      width: 140,
      maxWidth: 140,
      oversizedBehavior: "wrap",
    });

    xRenderer.grid.template.setAll({ location: 1 });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );
    yAxisRef.current = yAxis;

    // Legend sits below the chart; rotated x-axis labels overflow the bottom axes band.
    const bottomContainer = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        paddingTop: LEGEND_OVERFLOW_PADDING,
        layout: root.verticalLayout,
      })
    );

    const legend = bottomContainer.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 0,
        marginBottom: 10,
        width: am5.percent(95),
        maxHeight: LEGEND_BLOCK_HEIGHT,
        layout: root.gridLayout,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );
    legendRef.current = legend;

    const disposeDynamicHeight = setupDynamicChartHeight({
      root,
      chart,
      xAxis,
      getContainerEl: () => containerRef.current,
      heightWatchers: [bottomContainer, legend],
      bottomBuffer: 15,
      getAboveChartHeight: () => (chartTitle !== undefined ? PLOT_CHART_HEADER_HEADROOM : 0),
      getBelowChartHeight: () => {
        const measured = bottomContainer.height();
        if (measured > 0) return measured;
        return LEGEND_OVERFLOW_PADDING + (legend.height() || LEGEND_BLOCK_HEIGHT) + 10;
      },
    });

    applySingleLineLegendLabels(legend);

    chart.appear(1000, 100);

    return () => {
      disposeDynamicHeight();
      rootRef.current = null;
      chartRef.current = null;
      xAxisRef.current = null;
      yAxisRef.current = null;
      legendRef.current = null;
      seriesListRef.current = [];
      titleLabelRef.current = null;
      root.dispose();
    };
  }, []);

  // Rebuild the series whenever the series keys, x-axis category, or stacking
  // mode change. The init effect runs only once (to avoid replaying the intro
  // animation), so without this the chart would keep the series bound to the
  // first render and ignore later changes to these props.
  useEffect(() => {
    const root = rootRef.current;
    const chart = chartRef.current;
    const xAxis = xAxisRef.current;
    const yAxis = yAxisRef.current;
    const legend = legendRef.current;
    if (!root || !chart || !xAxis || !yAxis || !legend) return;

    xAxis.set("categoryField", xAxisKey);

    // Tear down the previous series so a changed key set is reflected.
    seriesListRef.current.forEach((series) => {
      legend.data.removeValue(series);
      chart.series.removeValue(series);
      series.dispose();
    });

    const seriesByItem: Record<string, am5xy.ColumnSeries[]> = {};

    seriesListRef.current = seriesKeys.map((key) => {
      seriesByItem[key] = [];

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          xAxis,
          yAxis,
          valueYField: key,
          categoryXField: xAxisKey,
          stacked,
          clustered: !stacked,
        })
      );

      const color = getStableSeriesColor(containerId, chart.get("colors"), key, seriesKeys);
      series.set("fill", color);
      series.set("stroke", color);

      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
        width: am5.percent(90),
        // Per-column tooltip (only the hovered bar) with the same formatted value as the
        // pyramid chart. A series-level tooltip would be cursor-driven and show every
        // series' tooltip at once.
        tooltipText: "{name}     [bold]{valueY}[/]",
        fill: color,
        stroke: color,
      });

      series.data.setAll(dataRef.current);
      series.appear();

      legend.data.push(series);
      return series;
    });

    // Sync legend visibility across stacked series
    chart.series.values.forEach((s) => {
      s.on("visible", (visible) => {
        const itemField = s.get("valueYField")?.replace(/_y\d{4}$/, "");
        const siblings = seriesByItem[itemField as string];

        if (!siblings) return;

        siblings.forEach((sib) => {
          if (sib !== s && sib.get("visible") !== visible) {
            sib.set("visible", visible);
          }
        });
      });
    });
    // `data` is read via dataRef so a pure data change doesn't rebuild series;
    // the data effect below handles that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKeysSignature, xAxisKey, stacked]);

  useEffect(() => {
    chartTitleRef.current = chartTitle;
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  useEffect(() => {
    const xAxis = xAxisRef.current;
    if (!xAxis) return;
    xAxis.data.setAll(data);
    seriesListRef.current.forEach((series) => series.data.setAll(data));
  }, [data]);

  return (
    <div ref={containerRef} id={containerId} style={{ width: "100%", height: "610px" }} />
  );
}

export default ClusteredColumnChart;
