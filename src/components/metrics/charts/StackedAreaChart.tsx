import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getStableSeriesColor } from "@/utils/chart/stable-series-color.util";

interface StackedAreaChartProps<T extends Record<string, string>> {
  data: T[];
  xAxisKey?: string;
  seriesKeys?: string[]; // e.g. ["Արական", "Իգական"]
  /** Optional title shown above the chart (e.g. selected province in map combinations). */
  chartTitle?: string;
}

const containerId = "stacked-area-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;
const CHART_HEADER_HEADROOM = 24;
const PLOT_HEIGHT = 350;
const X_AXIS_LABEL_BAND_HEIGHT = 150;

function lockStackedAreaChartLayout(
  chart: am5xy.XYChart,
  xAxis: am5xy.Axis<am5xy.AxisRenderer>
) {
  chart.plotContainer.setAll({
    height: PLOT_HEIGHT,
    minHeight: PLOT_HEIGHT,
    maxHeight: PLOT_HEIGHT,
  });
  chart.yAxesAndPlotContainer.setAll({
    height: PLOT_HEIGHT,
    minHeight: PLOT_HEIGHT,
    maxHeight: PLOT_HEIGHT,
  });
  chart.bottomAxesContainer.setAll({
    height: X_AXIS_LABEL_BAND_HEIGHT,
    minHeight: X_AXIS_LABEL_BAND_HEIGHT,
    maxHeight: X_AXIS_LABEL_BAND_HEIGHT,
  });
  xAxis.setAll({
    minHeight: X_AXIS_LABEL_BAND_HEIGHT,
    maxHeight: X_AXIS_LABEL_BAND_HEIGHT,
  });
}

function StackedAreaChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  chartTitle,
}: StackedAreaChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const legendRef = useRef<am5.Legend | null>(null);
  const seriesListRef = useRef<am5xy.LineSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
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
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingTop: 0,
        layout: root.verticalLayout,
        // Plot area is locked to 350 below; reserve 150 for the x-axis label band
        // in bottomAxesContainer so labels never eat into the plot height.
        height: PLOT_HEIGHT + X_AXIS_LABEL_BAND_HEIGHT,
      })
    );
    chartRef.current = chart;

    if (chartTitle !== undefined) {
      root.container.setAll({ paddingTop: CHART_HEADER_HEADROOM });

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

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
    cursor.lineY.set("visible", false);

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      minGridDistance: 70,
    });

    // Long category labels would eat the plot height, so cap their width and wrap them
    // onto multiple lines. The full text is still shown in the tooltip.
    xRenderer.labels.template.setAll({
      maxWidth: 140,
      oversizedBehavior: "wrap",
      rotation: -45,
    });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "year",
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxisRef.current = xAxis;

    lockStackedAreaChartLayout(chart, xAxis);
    root.events.once("frameended", () => {
      lockStackedAreaChartLayout(chart, xAxis);
    });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
        min: 0,
      })
    );
    yAxisRef.current = yAxis;

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    // Legend lives in root.container (not inside the chart) so the chart's fixed height
    // stays dedicated to the locked 350 plot + x-axis labels.
    const legend = root.container.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
        width: am5.percent(95),
        height: am5.percent(20),
        useDefaultMarker: true,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );
    legendRef.current = legend;

    legend.labels.template.setAll({ fontSize: 16 });

    legend.markers.template.setAll({ width: 22, height: 22 });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
      strokeOpacity: 0,
    });

    chart.appear(1000, 100);

    return () => {
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

  // Rebuild the series whenever the series keys or x-axis category change. The
  // init effect runs only once (to avoid replaying the intro animation), so
  // without this the chart would keep the series bound to the first render and
  // ignore later changes to seriesKeys / xAxisKey.
  useEffect(() => {
    const root = rootRef.current;
    const chart = chartRef.current;
    const xAxis = xAxisRef.current;
    const yAxis = yAxisRef.current;
    const legend = legendRef.current;
    if (!root || !chart || !xAxis || !yAxis || !legend) return;

    // Tear down the previous series so a changed key set is reflected.
    seriesListRef.current.forEach((series) => {
      legend.data.removeValue(series);
      chart.series.removeValue(series);
      series.dispose();
    });

    seriesListRef.current = seriesKeys.map((key) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: String(key),
          xAxis,
          yAxis,
          stacked: true,
          valueYField: String(key),
          categoryXField: String(xAxisKey),
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: `[bold]{${String(xAxisKey)}}[/]\n{name}     [bold]{valueY}[/]`,
          }),
        })
      );

      const color = getStableSeriesColor(containerId, chart.get("colors"), String(key), seriesKeys);
      series.set("fill", color);
      series.set("stroke", color);

      series.fills.template.setAll({
        fillOpacity: 0.5,
        visible: true,
      });

      series.data.setAll(dataRef.current);
      series.appear(1000);
      return series;
    });

    legend.data.setAll(chart.series.values);
    // `data` is read via dataRef so a pure data change doesn't rebuild series;
    // the data effect below handles that.
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
  }, [data]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "610px" }} />
    </div>
  );
}

export default StackedAreaChart;
