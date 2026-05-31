import { useEffect, useLayoutEffect, useMemo, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { parseYear } from "@/utils/chart/map-combinations-for-line-graph";

interface DataItem {
  date: number;
  value: number;
  /** Original category label; present when the x values aren't real years. */
  label?: string;
}

interface LineGraphChartProps {
  data: DataItem[];
  /** Optional title shown above the chart. Only passed in map+chart combinations. */
  chartTitle?: string;
}

const containerId = "line-graph-chartdiv";

function LineGraphChart({ data, chartTitle }: LineGraphChartProps) {
  const rootRef = useRef<am5.Root | null>(null);
  const seriesRef = useRef<am5xy.LineSeries | null>(null);
  const categoryAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const titleLabelRef = useRef<am5.Label | null>(null);

  // When a label isn't a parseable year, the x values are synthetic (see
  // mapCombinationsForLineGraph) — plot against the labels on a category axis instead.
  const isCategoryBased = useMemo(
    () => data.some((d) => d.label != null && parseYear(d.label) === null),
    [data]
  );

  useLayoutEffect(() => {
    // Create chart once per axis mode; otherwise amCharts replays intro animations on data updates.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    // Set themes
    // https://www.amcharts.com/docs/v5/concepts/themes/
    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        layout: root.verticalLayout,
      })
    );

    if (chartTitle !== undefined) {
      const titleLabel = chart.children.unshift(
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

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
      // Allow more labels when the container is narrow (e.g. 2-col layouts).
      minGridDistance: 25,
    });

    // Prevent label collisions by rotating labels slightly.
    xRenderer.labels.template.setAll({
      rotation: -35,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
    });

    if (isCategoryBased) {
      // Long labels render at full length angled downward; the chart is made taller (see
      // chartHeight) so the plot keeps its height and the rest of the label area is reached
      // by scrolling the container vertically.
      xRenderer.labels.template.set("rotation", -45);
    }

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    let series: am5xy.LineSeries;

    if (isCategoryBased) {
      const xAxis = chart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: "label",
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      categoryAxisRef.current = xAxis;
      xAxis.data.setAll(data);

      series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Series",
          xAxis,
          yAxis,
          valueYField: "value",
          categoryXField: "label",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{categoryX}: {valueY}",
          }),
        })
      );
    } else {
      const xAxis = chart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.2,
          baseInterval: {
            timeUnit: "year",
            count: 1,
          },
          renderer: xRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: "Series",
          xAxis,
          yAxis,
          valueYField: "value",
          valueXField: "date",
          tooltip: am5.Tooltip.new(root, {
            labelText: "{valueY}",
          }),
        })
      );
    }
    seriesRef.current = series;

    series.strokes.template.setAll({
      strokeWidth: 2, // Change this to 1 or 1.5 for a very thin line
      strokeOpacity: 1, // Optional: ensures the line remains fully visible
    });

    // Set data
    series.data.setAll(data);

    // Category mode scrolls via the surrounding container (see chartMinWidth); a chart
    // scrollbar would only duplicate that, so add it for the date axis only.
    if (!isCategoryBased) {
      // Add scrollbar
      // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
      chart.set(
        "scrollbarX",
        am5.Scrollbar.new(root, {
          orientation: "horizontal",
        })
      );
    }

    return () => {
      rootRef.current = null;
      seriesRef.current = null;
      categoryAxisRef.current = null;
      titleLabelRef.current = null;
      root.dispose();
    };
  }, [isCategoryBased]);

  useEffect(() => {
    categoryAxisRef.current?.data.setAll(data);
    seriesRef.current?.data.setAll(data);
  }, [data]);

  useEffect(() => {
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  // Keep the plot tall and let long category labels overflow into a vertically scrollable
  // area below, instead of squeezing the plot. The chart canvas grows with the longest
  // label; the outer container stays fixed and scrolls to reveal the rest of the labels.
  const PLOT_HEIGHT = 480;
  const longestLabel = isCategoryBased
    ? data.reduce((max, d) => Math.max(max, (d.label ?? "").length), 0)
    : 0;
  // Rough px the longest label needs when angled at -45°.
  const labelAreaHeight = Math.round(longestLabel * 5) + 30;
  const chartHeight = isCategoryBased ? Math.max(600, PLOT_HEIGHT + labelAreaHeight) : 600;

  return (
    <div style={{ width: "100%", height: "600px", overflowY: "auto" }}>
      <div id={containerId} style={{ width: "100%", height: `${chartHeight}px` }}></div>
    </div>
  );
}

export default LineGraphChart;
