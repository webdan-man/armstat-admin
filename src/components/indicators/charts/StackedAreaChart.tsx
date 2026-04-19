import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface StackedAreaChartProps<T extends Record<string, string>> {
  data: T[];
  xKey?: keyof T; // e.g. "year"
  seriesKeys?: (keyof T)[]; // e.g. ["Արական", "Իգական"]
}

const containerId = "stacked-area-chartdiv";

function StackedAreaChart<T extends Record<string, string>>({
  data,
  xKey,
  seriesKeys = [],
}: StackedAreaChartProps<T>) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
      })
    );

    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "none",
      })
    );
    cursor.lineY.set("visible", false);

    // ✅ Dynamic X axis
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: String(xKey),
        startLocation: 0.5,
        endLocation: 0.5,
        renderer: am5xy.AxisRendererX.new(root, {
          minorGridEnabled: true,
          minGridDistance: 70,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererY.new(root, {
          pan: "zoom",
        }),
      })
    );

    // ✅ Fully dynamic series
    seriesKeys.forEach((key) => {
      const series = chart.series.push(
        am5xy.LineSeries.new(root, {
          name: String(key),
          xAxis,
          yAxis,
          stacked: true,
          valueYField: String(key),
          categoryXField: String(xKey),
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: "horizontal",
            labelText: `[bold]{name}[/]\n{${String(xKey)}}: {valueY}`,
          }),
        })
      );

      series.fills.template.setAll({
        fillOpacity: 0.5,
        visible: true,
      });

      series.data.setAll(data);
      series.appear(1000);
    });

    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, xKey, seriesKeys]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default StackedAreaChart;
