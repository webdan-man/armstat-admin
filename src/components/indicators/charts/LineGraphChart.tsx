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
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
    });

    if (isCategoryBased) {
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
      xRenderer.labels.template.setAll({
        maxWidth: 140,
        oversizedBehavior: "wrap",
      });
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
      // Cap the label area so the plot keeps its height.
      xAxis.set("maxHeight", 130);
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
            labelText: "{categoryX}     [bold]{valueY}[/]",
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

    // Add scrollbar
    // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

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

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "800px" }}></div>
    </div>
  );
}

export default LineGraphChart;
