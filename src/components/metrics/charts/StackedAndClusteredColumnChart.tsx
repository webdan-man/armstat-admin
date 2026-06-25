import { useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import { getRainbowPaletteColor, setChartThemes } from "@/utils/chart/chart-palette.util";
import {
  applySingleLineLegendLabels,
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
}

const containerId = "stacked-and-clustered-column-chartdiv";

function StackedAndClusteredColumnChart<T extends Record<string, string | number>>({
  data,
  xAxisKey,
  clusterKeys,
  stackKeys,
  seriesKeys = [],
}: StackedAndClusteredColumnChartProps<T>) {
  const containerRef = useRef<HTMLDivElement>(null);
  const bottomContainerRef = useRef<am5.Container | null>(null);

  useLayoutEffect(() => {
    const isClusteredStackedMode = Boolean(clusterKeys?.length && stackKeys?.length);
    const root = am5.Root.new(containerId);
    setChartThemes(root);
    let disposeDynamicHeight: (() => void) | undefined;

    if (isClusteredStackedMode) {
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

      lockPlotHeight(chart);

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
        centerY: am5.p50,
        centerX: am5.p100,
        paddingTop: 0,
        // Long category labels would eat the plot height, so cap their width and wrap
        // them onto multiple lines. The full text is still shown in the tooltip.
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
      xAxis.data.setAll(data);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          maxDeviation: 0.3,
          renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        })
      );

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

      applySingleLineLegendLabels(legend);

      const allClusterKeys = clusterKeys!;
      const allStackKeys = stackKeys!;
      const totalStacks = allStackKeys.length;

      // Lightness offsets: first stack layer is lightest, last is darkest.
      // Mirrors the DOCX values: 0.55 → 0.25 → -0.10 → -0.35 for 4 stacks.
      const getLightness = (stackIdx: number) => {
        if (totalStacks <= 1) return 0;
        return 0.55 - (0.9 * stackIdx) / (totalStacks - 1);
      };

      const seriesByCluster: Record<string, am5xy.ColumnSeries[]> = {};
      const seriesToCluster = new Map<am5xy.ColumnSeries, string>();

      allClusterKeys.forEach((clusterKey, clusterIdx) => {
        const baseColor = getRainbowPaletteColor(chart.get("colors")!, clusterIdx);
        seriesByCluster[clusterKey] = [];

        allStackKeys.forEach((stackKey, stackIdx) => {
          const fieldName = `${clusterKey}_${stackKey}`;
          const color = am5.Color.lighten(baseColor, getLightness(stackIdx));

          const series = chart.series.push(
            am5xy.ColumnSeries.new(root, {
              name: clusterKey,
              xAxis: xAxis,
              yAxis: yAxis,
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
            tooltipText: `${stackKey}     [bold]{valueY}[/]`,
            // Rounded corners only on the topmost stack layer.
            cornerRadiusTL: stackIdx === totalStacks - 1 ? 5 : 0,
            cornerRadiusTR: stackIdx === totalStacks - 1 ? 5 : 0,
          });

          series.data.setAll(data);
          series.appear();

          seriesByCluster[clusterKey].push(series);
          seriesToCluster.set(series, clusterKey);
        });

        // Only the first (bottom) series of each cluster appears in the legend.
        const firstSeries = seriesByCluster[clusterKey][0];
        if (firstSeries) {
          legend.data.push(firstSeries);
        }
      });

      // Mirror legend toggle: hiding/showing one year series in a cluster
      // hides/shows all year series in that cluster.
      chart.series.each((s) => {
        const columnSeries = s as am5xy.ColumnSeries;
        columnSeries.on("visible", (visible: boolean | undefined) => {
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

      disposeDynamicHeight = setupDynamicChartHeight({
        root,
        chart,
        xAxis,
        getContainerEl: () => containerRef.current,
        heightWatchers: [bottomContainer, legend],
        bottomBuffer: 15,
        getBelowChartHeight: () => {
          const measuredBottom = bottomContainerRef.current?.height();
          if (measuredBottom && measuredBottom > 0) {
            return measuredBottom;
          }
          return LEGEND_OVERFLOW_PADDING + (legend.height() || LEGEND_BLOCK_HEIGHT) + 10;
        },
      });

      chart.appear(1000, 100);
    } else {
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

      lockPlotHeight(chart);

      const legend = chart.children.push(
        am5.Legend.new(root, {
          centerX: am5.p50,
          x: am5.p50,
        })
      );

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

      xRenderer.grid.template.setAll({ location: 1 });
      xAxis.data.setAll(data);

      const yAxis = chart.yAxes.push(
        am5xy.ValueAxis.new(root, {
          min: 0,
          renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
        })
      );

      function makeSeries(name: string, fieldName: string) {
        const series = chart.series.push(
          am5xy.ColumnSeries.new(root, {
            name,
            xAxis,
            yAxis,
            valueYField: fieldName,
            categoryXField: xAxisKey,
          })
        );

        series.columns.template.setAll({
          tooltipText: "{name}, {categoryX}: {valueY}",
          width: am5.percent(90),
          tooltipY: am5.percent(10),
        });
        series.data.setAll(data);
        series.appear();
        legend.data.push(series);
      }

      seriesKeys.forEach((key) => makeSeries(key, key));

      disposeDynamicHeight = setupDynamicChartHeight({
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
    }

    return () => {
      disposeDynamicHeight?.();
      bottomContainerRef.current = null;
      root.dispose();
    };
  }, [data, xAxisKey, clusterKeys, stackKeys, seriesKeys]);

  return (
    <div>
      <div ref={containerRef} id={containerId} style={{ width: "100%", height: "610px" }} />
    </div>
  );
}

export default StackedAndClusteredColumnChart;
