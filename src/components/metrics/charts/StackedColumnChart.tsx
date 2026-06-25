import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getStableSeriesColor } from "@/utils/chart/stable-series-color.util";
import {
  CHART_HEADER_HEADROOM as PLOT_CHART_HEADER_HEADROOM,
  LEGEND_OVERFLOW_PADDING,
  lockPlotHeight,
  setupDynamicChartHeight,
} from "@/utils/chart/fixed-plot-chart-layout.util";

interface StackedColumnChartProps<T extends Record<string, string>> {
  data: T[];
  xAxisKey: string; // e.g. "year"
  seriesKeys?: string[];
  /** Optional title shown above the chart (e.g. selected province in map combinations). */
  chartTitle?: string;
  /** Optional label above the legend (stack dimension name from combination row labels). */
  yAxisLabel?: string;
}

const containerId = "stacked-column-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;
const CHART_HEADER_HEADROOM = 24;
const COLUMN_MAX_WIDTH = 80;
// Height reserved for the stack-dimension title that sits centered above the legend.
const LEGEND_TITLE_HEIGHT = 34;

// Legend band height is derived from the number of legend entries: one row per
// ~3 entries, clamped so it never collapses or crowds out the plot (overflow scrolls).
const LEGEND_ROW_HEIGHT = 40;
const LEGEND_ITEMS_PER_ROW = 3;
const LEGEND_MIN_HEIGHT = 30;
const LEGEND_MAX_HEIGHT = 130;

function calcLegendHeight(legendCount: number): number {
  const rows = Math.max(1, Math.ceil(legendCount / LEGEND_ITEMS_PER_ROW));
  return Math.min(LEGEND_MAX_HEIGHT, Math.max(LEGEND_MIN_HEIGHT, rows * LEGEND_ROW_HEIGHT));
}

// Total band height: the legend plus the title row above it (when a title is shown).
function calcLegendRowHeight(legendCount: number, hasTitle: boolean): number {
  return calcLegendHeight(legendCount) + (hasTitle ? LEGEND_TITLE_HEIGHT : 0);
}

function StackedColumnChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  chartTitle,
  yAxisLabel,
}: StackedColumnChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const legendRef = useRef<am5.Legend | null>(null);
  const legendRowRef = useRef<am5.Container | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const yAxisLegendLabelRef = useRef<am5.Label | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const chartTitleRef = useRef(chartTitle);
  const yAxisLabelRef = useRef(yAxisLabel);
  const dataRef = useRef(data);
  dataRef.current = data;

  const hasNegativeValue = data.some((row) => seriesKeys.some((key) => Number(row[key]) < 0));

  // Stable dependency for the series-reconcile effect: the array identity of
  // `seriesKeys` changes on every parent render, but its contents are what matter.
  const seriesKeysSignature = seriesKeys.join(" ");

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const showChartTitle = chartTitle !== undefined;
    const hasChartHeader = showChartTitle;

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        paddingRight: 20,
        paddingBottom: 20,
        paddingTop: 0,
        layout: root.verticalLayout,
      })
    );
    chartRef.current = chart;

    lockPlotHeight(chart);

    if (hasChartHeader) {
      root.container.setAll({ paddingTop: CHART_HEADER_HEADROOM });

      chart.topAxesContainer.setAll({
        marginTop: -CHART_HEADER_HEADROOM,
        paddingTop: 0,
        paddingBottom: 0,
      });

      const chartHeader = chart.topAxesContainer.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          layout: root.verticalLayout,
        })
      );

      if (showChartTitle) {
        const titleBand = chartHeader.children.push(
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
    }

    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
      maxWidth: 140,
      fontSize: 16,
      oversizedBehavior: "wrap",
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxisRef.current = xAxis;

    xRenderer.grid.template.setAll({ location: 1 });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        ...(hasNegativeValue ? {} : { min: 0 }),
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );
    yAxisRef.current = yAxis;

    // Stack-dimension title sits centered ABOVE the legend (matching the other charts'
    // legend-title styling), with the legend below it in a vertical-layout band.
    const legendRow = chart.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: calcLegendRowHeight(seriesKeys.length, Boolean(yAxisLabelRef.current)) + LEGEND_OVERFLOW_PADDING,
        paddingTop: LEGEND_OVERFLOW_PADDING,
        layout: root.verticalLayout,
      })
    );
    legendRowRef.current = legendRow;

    const yAxisLegendLabel = legendRow.children.push(
      am5.Label.new(root, {
        text: yAxisLabelRef.current ?? "",
        centerX: am5.p50,
        x: am5.p50,
        paddingBottom: 15,
        fontWeight: "bold",
        fontSize: 12,
        height: LEGEND_TITLE_HEIGHT,
        oversizedBehavior: "wrap",
        textAlign: "center",
        visible: Boolean(yAxisLabelRef.current),
      })
    );
    yAxisLegendLabelRef.current = yAxisLegendLabel;

    const legend = legendRow.children.push(
      am5.Legend.new(root, {
        width: am5.p100,
        height: calcLegendHeight(seriesKeys.length),
        centerX: am5.p50,
        x: am5.p50,
        layout: am5.GridLayout.new(root, {
          maxColumns: 100,
          fixedWidthGrid: false,
        }),
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: "vertical",
        }),
      })
    );
    legendRef.current = legend;

    const disposeDynamicHeight = setupDynamicChartHeight({
      root,
      chart,
      xAxis,
      getContainerEl: () => containerRef.current,
      heightWatchers: [legendRow, legend],
      bottomBuffer: 15,
      getAboveChartHeight: () => (hasChartHeader ? PLOT_CHART_HEADER_HEADROOM : 0),
      getBelowChartHeight: () => 20,
      getExtraChartHeight: () => legendRow.height(),
    });

    legend.labels.template.setAll({
      fontSize: 16,
      maxWidth: 200,
      oversizedBehavior: "wrap",
      textAlign: "left",
    });

    legend.itemContainers.template.setAll({
      maxWidth: 250,
      paddingRight: 10,
      paddingLeft: 10,
      paddingTop: 5,
      paddingBottom: 5,
    });

    chart.appear(1000, 100);

    return () => {
      disposeDynamicHeight();
      rootRef.current = null;
      chartRef.current = null;
      xAxisRef.current = null;
      yAxisRef.current = null;
      legendRef.current = null;
      legendRowRef.current = null;
      seriesListRef.current = [];
      titleLabelRef.current = null;
      yAxisLegendLabelRef.current = null;
      root.dispose();
    };
  }, []);

  // Rebuild the series whenever the stack dimension (seriesKeys) or the x-axis
  // category changes. The init effect runs only once (to avoid replaying the
  // intro animation), so without this the chart would keep the series bound to
  // the first render and ignore later changes to seriesKeys / xAxisKey.
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

    seriesListRef.current = seriesKeys.map((key) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name: key,
          stacked: true,
          xAxis,
          yAxis,
          valueYField: key,
          categoryXField: xAxisKey,
        })
      );

      const color = getStableSeriesColor(containerId, chart.get("colors"), key, seriesKeys);
      series.set("fill", color);
      series.set("stroke", color);

      series.columns.template.setAll({
        // Narrower than the cell so adjacent columns have a visible gap instead of touching.
        width: am5.percent(90),
        maxWidth: COLUMN_MAX_WIDTH,
        tooltipText: "{name}    [bold]{valueY}[/]",
        fill: color,
        stroke: color,
      });

      // Make the tooltip label wrap instead of stretching off-screen
      const tooltip = am5.Tooltip.new(root, {
        labelText: "{name}    [bold]{valueY}[/]",
        autoTextColor: true,
      });

      tooltip.label.setAll({
        maxWidth: 250,
        oversizedBehavior: "wrap",
        textAlign: "left",
      });

      series.set("tooltip", tooltip);

      series.data.setAll(dataRef.current);

      series.appear();

      legend.data.push(series);
      return series;
    });

    // Resize the legend band to fit the current number of legend entries.
    legendRef.current?.set("height", calcLegendHeight(seriesKeys.length));
    legendRowRef.current?.set(
      "height",
      calcLegendRowHeight(seriesKeys.length, Boolean(yAxisLabelRef.current)) + LEGEND_OVERFLOW_PADDING
    );
    // `data` is intentionally read via dataRef so a pure data change does not
    // rebuild every series — the data effect below handles that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKeysSignature, xAxisKey]);

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

    // Only clamp the y-axis to 0 when there are no negative values; otherwise
    // let amCharts auto-fit so negative bars are visible.
    yAxisRef.current?.set("min", hasNegativeValue ? undefined : 0);
  }, [data, hasNegativeValue]);

  useEffect(() => {
    yAxisLabelRef.current = yAxisLabel;
    const label = yAxisLegendLabelRef.current;
    if (!label) return;
    const visible = Boolean(yAxisLabel);
    label.set("text", yAxisLabel ?? "");
    label.set("visible", visible);
    // Reserve the title row's height only when the title is shown, so the legend keeps
    // its full band height when there's no stack-dimension title.
    legendRowRef.current?.set(
      "height",
      calcLegendRowHeight(seriesKeys.length, visible) + LEGEND_OVERFLOW_PADDING
    );
    // seriesKeysSignature stands in for seriesKeys.length here.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [yAxisLabel, seriesKeysSignature]);

  return (
    <div>
      <div ref={containerRef} id={containerId} style={{ width: "100%", height: "610px" }} />
    </div>
  );
}

export default StackedColumnChart;
