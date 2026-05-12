import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataItem {
  date: number;
  value: number;
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
  const titleLabelRef = useRef<am5.Label | null>(null);

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
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

    // Prevent label collisions by rotating years slightly.
    xRenderer.labels.template.setAll({
      rotation: -35,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
    });

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

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    const series = chart.series.push(
      am5xy.LineSeries.new(root, {
        name: "Series",
        xAxis: xAxis,
        yAxis: yAxis,
        valueYField: "value",
        valueXField: "date",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );
    seriesRef.current = series;

    // // Add scrollbar
    // // https://www.amcharts.com/docs/v5/charts/xy-chart/scrollbars/
    // chart.set(
    //   "scrollbarX",
    //   am5.Scrollbar.new(root, {
    //     orientation: "horizontal",
    //   })
    // );

    series.strokes.template.setAll({
      strokeWidth: 2, // Change this to 1 or 1.5 for a very thin line
      strokeOpacity: 1, // Optional: ensures the line remains fully visible
    });

    // Set data
    series.data.setAll(data);

    return () => {
      rootRef.current = null;
      seriesRef.current = null;
      titleLabelRef.current = null;
      root.dispose();
    };
  }, []);

  useEffect(() => {
    seriesRef.current?.data.setAll(data);
  }, [data]);

  useEffect(() => {
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default LineGraphChart;
