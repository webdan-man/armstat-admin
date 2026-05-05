import { useLayoutEffect } from "react";
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
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

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
        paddingRight: 1,
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

    xRenderer.labels.template.setAll({
      rotation: 0,
      centerY: am5.p50,
      centerX: am5.p50,
      paddingTop: 10,
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
        marginBottom: 15,
        width: am5.percent(95),
        height: am5.percent(30),
        layout: root.gridLayout,
        verticalScrollbar: am5.Scrollbar.new(root, { orientation: "vertical" }),
      })
    );

    legend.labels.template.setAll({
      maxWidth: 300,
      oversizedBehavior: "wrap",
    });

    // ========== SERIES ==========
    const seriesByItem: Record<string, am5xy.ColumnSeries[]> = {};

    const makeSeries = (name: string, fieldName: string, index: number) => {
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
      return series;
    };

    seriesKeys.forEach((def, index) => makeSeries(def, def, index));

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
      root.dispose();
    };
  }, [data, xAxisKey, seriesKeys, stacked]);

  return (
    <div>
      <p className={"text-textBlack600"}>{JSON.stringify(data, null, 2)}</p>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default ClusteredColumnChart;
