import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { getStableSeriesColor } from "@/utils/chart/stable-series-color.util";
import { attachColumnSeriesTooltip } from "@/utils/chart/column-chart-tooltip.util";
import {
  applySingleLineLegendLabels,
  CHART_HEADER_HEADROOM,
  LEGEND_BLOCK_HEIGHT,
  LEGEND_OVERFLOW_PADDING,
  lockPlotHeight,
  setupDynamicChartHeight,
} from "@/utils/chart/fixed-plot-chart-layout.util";

interface StackedAndClusteredColumnChartProps<T extends Record<string, string | number>> {
  data: T[];
  xAxisKey: string;
  /**
   * True clustered+stacked mode (3 dimensions: X × cluster × stack).
   * When both are provided the chart renders one cluster group per clusterKey,
   * with each cluster's columns stacked by stackKey.
   */
  clusterKeys?: string[];
  stackKeys?: string[];
  /** Legacy simple-clustered mode (2 dimensions: X × series). */
  seriesKeys?: string[];
  /** Optional title shown above the chart (e.g. selected province in map combinations). */
  chartTitle?: string;
}

const containerId = "stacked-and-clustered-column-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;

function StackedAndClusteredColumnChart<T extends Record<string, string | number>>({
  data,
  xAxisKey,
  clusterKeys,
  stackKeys,
  seriesKeys = [],
  chartTitle,
}: StackedAndClusteredColumnChartProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const legendRef = useRef<am5.Legend | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const bottomContainerRef = useRef<am5.Container | null>(null);

  // The chart structure (panning, legend placement, title band, dynamic height) differs
  // between the two modes, so it is built once at mount from the mode at that time and
  // never restructured. Captured in a ref so the reconcile effect agrees with init.
  const isClusteredStackedMode = Boolean(clusterKeys?.length && stackKeys?.length);
  const modeRef = useRef(isClusteredStackedMode);

  // Read via a ref inside the reconcile effect so a pure data change doesn't rebuild
  // the series (the data effect below handles that incrementally).
  const dataRef = useRef(data);
  dataRef.current = data;

  // Stable dependencies for the reconcile effect: the array identities change on every
  // parent render, but only their contents should trigger a series rebuild.
  const clusterKeysSignature = (clusterKeys ?? []).join(" ");
  const stackKeysSignature = (stackKeys ?? []).join(" ");
  const seriesKeysSignature = seriesKeys.join(" ");

  // Create the chart structure once; otherwise amCharts disposes the root and replays
  // the intro animation (a full flash) on every data update.
  useLayoutEffect(() => {
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;
    root.setThemes([am5themes_Animated.new(root)]);

    if (modeRef.current) {
      // ── DOCX-style clustered + stacked mode ──────────────────────────────────
      // Layout: chart (70%) on top, scrollable legend (30%) below.
      root.container.set("layout", root.verticalLayout);

      const chart = root.container.children.push(
        am5xy.XYChart.new(root, {
          panX: true,
          panY: false,
          wheelX: "panX",
          wheelY: "zoomX",
          pinchZoomX: true,
          paddingLeft: 0,
          paddingRight: 15,
        })
      );
      chartRef.current = chart;

      lockPlotHeight(chart);

      if (chartTitle !== undefined) {
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
            text: chartTitle,
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

      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, { orientation: "horizontal", marginLeft: 5, marginRight: 5 })
      );

      const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "none" }));
      cursor.lineY.set("visible", false);
      cursor.lineX.set("visible", false);

      const xRenderer = am5xy.AxisRendererX.new(root, {
        minGridDistance: 30,
        minorGridEnabled: true,
        cellStartLocation: 0.1,
        cellEndLocation: 0.9,
      });

      xRenderer.labels.template.setAll({
        rotation: -45,
        // Top-right corner on the tick / x-axis line; text runs down-right from the axis.
        centerY: am5.p0,
        centerX: am5.p100,
        textAlign: "right",
        paddingTop: 0,
        // Long category labels would eat the plot height, so cap their width and wrap
        // them onto multiple lines. The full text is still shown in the tooltip.
        width: 140,
        maxWidth: 140,
        oversizedBehavior: "wrap",
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
      xAxis.data.setAll(data);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          maxDeviation: 0.3,
          renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        })
      );
      yAxisRef.current = yAxis;

      // Legend sits below the chart; rotated x-axis labels overflow the bottom axes
      // band and need padding so they do not collide with legend titles.
      const bottomContainer = root.container.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          paddingTop: LEGEND_OVERFLOW_PADDING,
          paddingBottom: 0,
          layout: root.verticalLayout,
        })
      );
      bottomContainerRef.current = bottomContainer;

      const legend = bottomContainer.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
          marginTop: 0,
          marginBottom: 10,
          width: am5.percent(95),
          maxHeight: 130,
          layout: root.gridLayout,
          verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
        })
      );
      legendRef.current = legend;

      applySingleLineLegendLabels(legend);

      const disposeDynamicHeight = setupDynamicChartHeight({
        root,
        chart,
        xAxis,
        getContainerEl: () => containerRef.current,
        heightWatchers: [bottomContainer, legend],
        bottomBuffer: 15,
        // getAboveChartHeight: () => (chartTitle !== undefined ? CHART_HEADER_HEADROOM : 0),
        getBelowChartHeight: () => {
          const measuredBottom = bottomContainerRef.current?.height();
          if (measuredBottom && measuredBottom > 0) {
            return measuredBottom;
          }
          return LEGEND_OVERFLOW_PADDING + (legend.height() || LEGEND_BLOCK_HEIGHT) + 10;
        },
      });

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
        bottomContainerRef.current = null;
        root.dispose();
      };
    }

    // ── Legacy simple-clustered mode ─────────────────────────────────────────
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );
    chartRef.current = chart;

    lockPlotHeight(chart);

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );
    legendRef.current = legend;

    const xRenderer = am5xy.AxisRendererX.new(root, {
      cellStartLocation: 0.1,
      cellEndLocation: 0.9,
      minorGridEnabled: true,
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
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );
    yAxisRef.current = yAxis;

    const disposeDynamicHeight = setupDynamicChartHeight({
      root,
      chart,
      xAxis,
      getContainerEl: () => containerRef.current,
      heightWatchers: [legend],
      bottomBuffer: 15,
      getBelowChartHeight: () => 20,
      getExtraChartHeight: () => legend.height() || LEGEND_BLOCK_HEIGHT,
    });

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
      bottomContainerRef.current = null;
      root.dispose();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Rebuild the series whenever the key sets or x-axis category change. The init
  // effect runs once (to avoid replaying the intro animation), so without this the
  // series would stay bound to the first render and ignore later prop changes.
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
    seriesListRef.current = [];

    if (modeRef.current) {
      const allClusterKeys = clusterKeys ?? [];
      const allStackKeys = stackKeys ?? [];
      const totalStacks = allStackKeys.length;

      // Lightness offsets: first stack layer is lightest, last is darkest.
      // Mirrors the DOCX values: 0.55 → 0.25 → -0.10 → -0.35 for 4 stacks.
      const getLightness = (stackIdx: number) => {
        if (totalStacks <= 1) return 0;
        return 0.55 - (0.9 * stackIdx) / (totalStacks - 1);
      };

      const seriesByCluster: Record<string, am5xy.ColumnSeries[]> = {};
      const seriesToCluster = new Map<am5xy.ColumnSeries, string>();

      allClusterKeys.forEach((clusterKey) => {
        const baseColor = getStableSeriesColor(
          containerId,
          chart.get("colors"),
          clusterKey,
          allClusterKeys
        );
        seriesByCluster[clusterKey] = [];

        allStackKeys.forEach((stackKey, stackIdx) => {
          const fieldName = `${clusterKey}_${stackKey}`;
          const color = am5.Color.lighten(baseColor, getLightness(stackIdx));

          const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: clusterKey,
              xAxis,
              yAxis,
              valueYField: fieldName,
              categoryXField: xAxisKey,
              fill: color,
              stroke: color,
              // clusterField groups all stack layers of the same cluster key
              // into the same horizontal slot on the X axis.
              clusterField: clusterKey,
              stacked: stackIdx > 0,
            } as am5xy.IColumnSeriesSettings)
          );

          series.columns.template.setAll({
            strokeOpacity: 0,
            width: am5.percent(90),
            // Rounded corners only on the topmost stack layer.
            cornerRadiusTL: stackIdx === totalStacks - 1 ? 5 : 0,
            cornerRadiusTR: stackIdx === totalStacks - 1 ? 5 : 0,
          });

          attachColumnSeriesTooltip(series, `${stackKey}     [bold]{valueY}[/]`);

          series.data.setAll(dataRef.current);
          series.appear();

          seriesByCluster[clusterKey].push(series);
          seriesToCluster.set(series, clusterKey);
          seriesListRef.current.push(series);
        });

        // Only the first (bottom) series of each cluster appears in the legend.
        const firstSeries = seriesByCluster[clusterKey][0];
        if (firstSeries) {
          legend.data.push(firstSeries);
        }
      });

      // Mirror legend toggle: hiding/showing one year series in a cluster
      // hides/shows all year series in that cluster.
      seriesListRef.current.forEach((columnSeries) => {
        columnSeries.on("visible", (visible) => {
          const clusterKey = seriesToCluster.get(columnSeries);
          if (!clusterKey) return;
          const siblings = seriesByCluster[clusterKey] ?? [];
          siblings.forEach((sibling) => {
            if (sibling !== columnSeries && sibling.get("visible") !== visible) {
              sibling.set("visible", visible);
            }
          });
        });
      });
    } else {
      seriesKeys.forEach((key) => {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name: key,
            xAxis,
            yAxis,
            valueYField: key,
            categoryXField: xAxisKey,
          })
        );

        series.columns.template.setAll({
          tooltipText: "{name}, {categoryX}: {valueY}",
          width: am5.percent(90),
          tooltipY: am5.percent(10),
        });

        series.data.setAll(dataRef.current);
        series.appear();
        legend.data.push(series);
        seriesListRef.current.push(series);
      });
    }
    // `data` is read via dataRef so a pure data change doesn't rebuild series;
    // the data effect below handles that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [clusterKeysSignature, stackKeysSignature, seriesKeysSignature, xAxisKey]);

  // Apply pure data changes incrementally — no root recreation, no re-animation.
  useEffect(() => {
    const xAxis = xAxisRef.current;
    if (!xAxis) return;
    xAxis.data.setAll(data);
    seriesListRef.current.forEach((series) => series.data.setAll(data));
  }, [data]);

  // Update the title text in place rather than rebuilding the chart.
  useEffect(() => {
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  return (
    <div>
      <div ref={containerRef} id={containerId} style={{ width: "100%", height: "610px" }} />
    </div>
  );
}

export default StackedAndClusteredColumnChart;
