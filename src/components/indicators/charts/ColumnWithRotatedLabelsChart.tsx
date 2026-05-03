import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataItem {
  xAxisKey: string;
  value: number;
  label: string;
}

interface ColumnWithRotatedLabelsChartProps {
  data: DataItem[];
  /** Shown above the chart (e.g. selected marz); defaults to whole-country label. */
  chartTitle?: string;
}

const containerId = "columns-with-rotated-labels-chartdiv";

function ColumnWithRotatedLabelsChart({
  data,
  chartTitle = "Հայաստան",
}: ColumnWithRotatedLabelsChartProps) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    // Root layout
    root.container.set("layout", root.verticalLayout);

    root.container.children.unshift(
      am5.Label.new(root, {
        text: chartTitle,
        fontSize: 16,
        fontWeight: "500",
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    // Chart
    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: true,
        panY: true,
        wheelX: "panX",
        wheelY: "zoomX",
        pinchZoomX: true,
        paddingLeft: 0,
        paddingRight: 1,
        height: am5.percent(90),
      })
    );

    // Cursor
    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, {}));
    cursor.lineY.set("visible", false);

    // X Axis
    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 30,
      minorGridEnabled: true,
    });

    xRenderer.labels.template.setAll({
      rotation: -75,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });

    xRenderer.grid.template.setAll({ location: 1 });

    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        maxDeviation: 0.3,
        categoryField: "xAxisKey",
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Y Axis
    const yRenderer = am5xy.AxisRendererY.new(root, {
      strokeOpacity: 0.1,
    });

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.3,
        renderer: yRenderer,
      })
    );

    // Series
    const series = chart.series.push(
      am5xy.ColumnSeries.new(root, {
        name: "Series 1",
        xAxis,
        yAxis,
        valueYField: "value",
        categoryXField: "xAxisKey",
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueY}",
        }),
      })
    );

    series.columns.template.setAll({
      cornerRadiusTL: 5,
      cornerRadiusTR: 5,
      strokeOpacity: 0,
    });

    // Color adapters
    series.columns.template.adapters.add("fill", (fill, target) =>
      chart.get("colors")?.getIndex(series.columns.indexOf(target))
    );

    series.columns.template.adapters.add("stroke", (stroke, target) =>
      chart.get("colors")?.getIndex(series.columns.indexOf(target))
    );

    xAxis.data.setAll(data);
    series.data.setAll(data);

    const greyColor = am5.color(0xaaaaaa);

    // Legend bar container
    const legendBar = root.container.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        width: am5.percent(100),
        paddingTop: 10,
        paddingBottom: 10,
        paddingLeft: 20,
        paddingRight: 20,
        height: am5.percent(10),
      })
    );

    // Label
    legendBar.children.push(
      am5.Label.new(root, {
        text: data[0]?.label || "Հատկանիշ",
        centerY: am5.p50,
        paddingRight: 15,
        fontSize: 14,
      })
    );

    // Legend
    const legend = legendBar.children.push(
      am5.Legend.new(root, {
        centerY: am5.p50,
        layout: am5.GridLayout.new(root, {
          fixedWidthGrid: false,
          maxColumns: 100,
        }),
        width: am5.percent(100),
      })
    );

    // Hide text labels
    legend.labels.template.set("forceHidden", true);
    legend.valueLabels.template.set("forceHidden", true);

    // Marker styling
    legend.markers.template.setAll({
      width: 22,
      height: 22,
    });

    legend.markerRectangles.template.setAll({
      cornerRadiusTL: 4,
      cornerRadiusTR: 4,
      cornerRadiusBL: 4,
      cornerRadiusBR: 4,
    });

    // Fill adapter
    legend.markerRectangles.template.adapters.add("fill", (fill, target) => {
      const legendDataItem = target.dataItem;
      if (!legendDataItem) return fill;

      const seriesDataItem = legendDataItem.dataContext as any;
      const index = series.dataItems.indexOf(seriesDataItem);

      if (index >= 0) {
        return seriesDataItem.isHidden() ? greyColor : chart.get("colors")?.getIndex(index);
      }

      return fill;
    });

    // Stroke adapter
    legend.markerRectangles.template.adapters.add("stroke", (stroke, target) => {
      const legendDataItem = target.dataItem;
      if (!legendDataItem) return stroke;

      const seriesDataItem = legendDataItem.dataContext as any;
      const index = series.dataItems.indexOf(seriesDataItem);

      if (index >= 0) {
        return seriesDataItem.isHidden() ? greyColor : chart.get("colors")?.getIndex(index);
      }

      return stroke;
    });

    // Legend data
    legend.data.setAll(series.dataItems);

    // Force repaint on click
    legend.itemContainers.each((itemContainer, index) => {
      itemContainer.events.on("click", () => {
        setTimeout(() => {
          const rect = legend.markerRectangles.getIndex(index);
          if (rect) rect.markDirty();
        }, 0);
      });
    });

    // Animations
    series.appear(1000);
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, chartTitle]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default ColumnWithRotatedLabelsChart;
