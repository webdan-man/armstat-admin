import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface StackedColumnChartProps<T extends Record<string, string>> {
  data: T[];
  xAxisKey: string; // e.g. "year"
  seriesKeys?: string[];
  /** Optional label to the left of the legend (y-axis stack dimension name from combination row labels). */
  yAxisLabel?: string;
}

const containerId = "stacked-column-chartdiv";

function StackedColumnChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  yAxisLabel,
}: StackedColumnChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const yAxisLegendLabelRef = useRef<am5.Label | null>(null);

  const hasNegativeValue = data.some((row) =>
    seriesKeys.some((key) => Number(row[key]) < 0)
  );

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

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

    chart.set("scrollbarX", am5.Scrollbar.new(root, { orientation: "horizontal" }));

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    });
    xRenderer.labels.template.setAll({
      rotation: -75,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    xAxisRef.current = xAxis;

    xRenderer.grid.template.setAll({ location: 1 });

    xAxis.data.setAll(data);

    const yAxis = chart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        ...(hasNegativeValue ? {} : { min: 0 }),
        renderer: am5xy.AxisRendererY.new(root, { strokeOpacity: 0.1 }),
      })
    );
    yAxisRef.current = yAxis;

    const legendContainer = chart.children.push(
      am5.Container.new(root, {
        layout: root.horizontalLayout,
        centerX: am5.p50,
        x: am5.p50,
        paddingTop: 15,
      })
    );

    const yAxisLegendLabel = legendContainer.children.push(
      am5.Label.new(root, {
        text: yAxisLabel ?? "",
        fontWeight: "bold",
        paddingRight: 10,
        centerY: am5.p50,
        visible: Boolean(yAxisLabel),
      })
    );
    yAxisLegendLabelRef.current = yAxisLegendLabel;

    const legend = legendContainer.children.push(
      am5.Legend.new(root, {
        centerY: am5.p50,
      })
    );

    const seriesList: am5xy.ColumnSeries[] = [];

    const makeSeries = (name: string, fieldName: string) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          name,
          stacked: true,
          xAxis,
          yAxis,
          valueYField: fieldName,
          categoryXField: xAxisKey,
        })
      );

      series.columns.template.setAll({
        tooltipText: "{name} - {valueY}",
        tooltipY: am5.percent(10),
      });
      series.data.setAll(data);

      series.appear();

      legend.labels.template.setAll({
        oversizedBehavior: "wrap",
      });

      legend.itemContainers.template.setAll({
        paddingTop: 2,
        paddingBottom: 2,
      });

      legend.data.push(series);
      seriesList.push(series);
    };

    seriesKeys.forEach((key) => makeSeries(key, key));
    seriesListRef.current = seriesList;

    chart.appear(1000, 100);

    return () => {
      rootRef.current = null;
      xAxisRef.current = null;
      yAxisRef.current = null;
      seriesListRef.current = [];
      yAxisLegendLabelRef.current = null;
      root.dispose();
    };
  }, []);

  useEffect(() => {
    const xAxis = xAxisRef.current;
    if (!xAxis) return;
    xAxis.data.setAll(data);
    seriesListRef.current.forEach((series) => series.data.setAll(data));

    // Only clamp the y-axis to 0 when there are no negative values; otherwise
    // let amCharts auto-fit so negative bars are visible.
    yAxisRef.current?.set("min", hasNegativeValue ? undefined : 0);
  }, [data]);

  useEffect(() => {
    const label = yAxisLegendLabelRef.current;
    if (!label) return;
    label.set("text", yAxisLabel ?? "");
    label.set("visible", Boolean(yAxisLabel));
  }, [yAxisLabel]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default StackedColumnChart;
