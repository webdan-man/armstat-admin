import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface StackedAreaChartProps<T extends Record<string, string>> {
  data: T[];
  xAxisKey?: string;
  seriesKeys?: string[]; // e.g. ["Արական", "Իգական"]
}

const containerId = "stacked-area-chartdiv";

function StackedAreaChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
}: StackedAreaChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.LineSeries[]>([]);

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

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
    // Cap the label area so the plot keeps its height.
    xAxis.set("maxHeight", 130);
    xAxisRef.current = xAxis;

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, { pan: "zoom" }),
        min: 0,
      })
    );

    const seriesList: am5xy.LineSeries[] = [];
    seriesKeys.forEach((key) => {
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
            labelText: `[bold]{name}[/]\n{${String(xAxisKey)}} - {valueY}`,
          }),
        })
      );

      series.fills.template.setAll({
        fillOpacity: 0.5,
        visible: true,
      });

      series.data.setAll(data);
      series.appear(1000);
      seriesList.push(series);
    });
    seriesListRef.current = seriesList;

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        marginBottom: 15,
        useDefaultMarker: true,
      })
    );

    legend.markers.template.setAll({ width: 22, height: 22 });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
      strokeOpacity: 0,
    });

    legend.data.setAll(chart.series.values);

    chart.appear(1000, 100);

    return () => {
      rootRef.current = null;
      xAxisRef.current = null;
      seriesListRef.current = [];
      root.dispose();
    };
  }, []);

  useEffect(() => {
    const xAxis = xAxisRef.current;
    if (!xAxis) return;
    xAxis.data.setAll(data);
    seriesListRef.current.forEach((series) => series.data.setAll(data));
  }, [data]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "600px" }} />
    </div>
  );
}

export default StackedAreaChart;
