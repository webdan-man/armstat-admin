import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface StackedAndClusteredColumnChartProps<T extends Record<string, string | number>> {
  data: T[];
  xAxisKey: string;
  seriesKeys?: string[];
}

const containerId = "stacked-and-clustered-column-chartdiv";

function StackedAndClusteredColumnChart<T extends Record<string, string | number>>({
  data,
  xAxisKey,
  seriesKeys = [],
}: StackedAndClusteredColumnChartProps<T>) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
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

    // Add legend
    // https://www.amcharts.com/docs/v5/charts/xy-chart/legend-xy-series/
    const legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
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

    xRenderer.grid.template.setAll({
      location: 1,
    });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        renderer: am5xy.AxisRendererY.new(root, {
          strokeOpacity: 0.1,
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function makeSeries(name: string, fieldName: string, stacked = false) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          stacked: stacked,
          name: name,
          xAxis: xAxis,
          yAxis: yAxis,
          valueYField: fieldName,
          categoryXField: xAxisKey,
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name}, {categoryX}:{valueY}",
        width: am5.percent(90),
        tooltipY: am5.percent(10),
      });
      series.data.setAll(data);

      // Make stuff animate on load
      // https://www.amcharts.com/docs/v5/concepts/animations/
      series.appear();

      legend.data.push(series);
    }

    seriesKeys?.forEach((key) => makeSeries(key, key));

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, xAxisKey, seriesKeys]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default StackedAndClusteredColumnChart;
