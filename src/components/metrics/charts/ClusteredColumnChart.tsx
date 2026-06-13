import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface ClusteredColumnChartProps<T extends Record<string, string | number>> {
  data: T[];
  xAxisKey: string; // e.g. xAxisKey
  seriesKeys?: string[];
  stacked?: boolean;
}

const containerId = "clustered-column-chartdiv";

function ClusteredColumnChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  stacked = false,
}: ClusteredColumnChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);

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
        height: am5.percent(70),
      })
    );

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
    // Cap the label area so the plot keeps its height.
    xAxis.set("maxHeight", 130);
    xAxisRef.current = xAxis;

    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 10,
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
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

    // ========== LEGEND ==========
    const legend = root.container.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
        marginTop: 15,
        width: am5.percent(95),
        height: am5.percent(20),
        layout: root.gridLayout,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );

    legend.labels.template.setAll({
      fontSize: 16,
      maxWidth: 300,
      oversizedBehavior: "wrap",
    });

    // ========== SERIES ==========
    const seriesByItem: Record<string, am5xy.ColumnSeries[]> = {};
    const seriesList: am5xy.ColumnSeries[] = [];

    const makeSeries = (name: string, fieldName: string) => {
      seriesByItem[name] = [];

      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          xAxis,
          yAxis,
          valueYField: fieldName,
          categoryXField: xAxisKey,
          stacked,
          clustered: !stacked,
        })
      );

      series.columns.template.setAll({
        cornerRadiusTL: 5,
        cornerRadiusTR: 5,
        strokeOpacity: 0,
        width: am5.percent(90),
        tooltipText: "{valueY}",
      });

      series.data.setAll(data);
      series.appear();

      legend.data.push(series);
      seriesList.push(series);
      return series;
    };

    seriesKeys.forEach((def) => makeSeries(def, def));
    seriesListRef.current = seriesList;

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

  return <div id={containerId} style={{ width: "100%", height: "800px" }} />;
}

export default ClusteredColumnChart;
