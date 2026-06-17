import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface StackedColumnChartProps<T extends Record<string, string>> {
  data: T[];
  xAxisKey: string; // e.g. "year"
  seriesKeys?: string[];
  /** Optional title shown above the chart (e.g. selected province in map combinations). */
  chartTitle?: string;
  /** Optional label above the legend (stack dimension name from combination row labels). */
  yAxisLabel?: string;
}

const containerId = "stacked-column-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;
const Y_AXIS_LABEL_BAND_HEIGHT = 32;
const CHART_HEADER_HEADROOM = 24;

function StackedColumnChart<T extends Record<string, string>>({
  data,
  xAxisKey,
  seriesKeys = [],
  chartTitle,
  yAxisLabel,
}: StackedColumnChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const xAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const yAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const yAxisLegendLabelRef = useRef<am5.Label | null>(null);
  const chartTitleRef = useRef(chartTitle);
  const yAxisLabelRef = useRef(yAxisLabel);

  const hasNegativeValue = data.some((row) => seriesKeys.some((key) => Number(row[key]) < 0));

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const showChartTitle = chartTitle !== undefined;
    const hasChartHeader = showChartTitle || Boolean(yAxisLabelRef.current);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        paddingLeft: 0,
        paddingRight: 20,
        paddingBottom: 20,
        paddingTop: 0,
        layout: root.verticalLayout,
      })
    );

    if (hasChartHeader) {
      root.container.setAll({ paddingTop: CHART_HEADER_HEADROOM });

      chart.topAxesContainer.setAll({
        marginTop: -CHART_HEADER_HEADROOM,
        paddingTop: 0,
        paddingBottom: 0,
      });

      const chartHeader = chart.topAxesContainer.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          layout: root.verticalLayout,
        })
      );

      if (showChartTitle) {
        const titleBand = chartHeader.children.push(
          am5.Container.new(root, {
            width: am5.p100,
            height: CHART_TITLE_BAND_HEIGHT,
          })
        );

        const titleLabel = titleBand.children.push(
          am5.Label.new(root, {
            text: chartTitleRef.current ?? "",
            fontSize: 20,
            x: am5.p50,
            centerX: am5.p50,
            y: am5.p50,
            centerY: am5.p50,
            maxWidth: 250,
            oversizedBehavior: "wrap",
            textAlign: "center",
          })
        );
        titleLabelRef.current = titleLabel;
      }

      const yAxisLabelBand = chartHeader.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          height: Y_AXIS_LABEL_BAND_HEIGHT,
          visible: Boolean(yAxisLabelRef.current),
        })
      );

      const yAxisLegendLabel = yAxisLabelBand.children.push(
        am5.Label.new(root, {
          text: yAxisLabelRef.current ?? "",
          fontSize: 16,
          fontWeight: "600",
          x: am5.p50,
          centerX: am5.p50,
          y: am5.p50,
          centerY: am5.p50,
          maxWidth: 250,
          oversizedBehavior: "wrap",
          textAlign: "center",
          visible: Boolean(yAxisLabelRef.current),
        })
      );
      yAxisLegendLabelRef.current = yAxisLegendLabel;
    }

    chart.set(
      "scrollbarX",
      am5.Scrollbar.new(root, {
        orientation: "horizontal",
      })
    );

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minorGridEnabled: true,
    });
    xRenderer.labels.template.setAll({
      rotation: -45,
      centerY: am5.p50,
      centerX: am5.p100,
      paddingRight: 15,
      // Long category labels would eat the plot height, so cap their width and wrap them
      // onto multiple lines. The full text is still shown in the tooltip.
      maxWidth: 140,
      fontSize: 16,
      oversizedBehavior: "wrap",
    });
    const xAxis = chart.xAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: xAxisKey,
        renderer: xRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    // Cap the label area so the plot keeps its height.
    xAxis.set("maxHeight", 130);
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

    const legend = chart.children.push(
      am5.Legend.new(root, {
        width: am5.percent(100),
        height: am5.percent(20),
        centerX: am5.p50,
        x: am5.p50,
        layout: am5.GridLayout.new(root, {
          maxColumns: 100,
          fixedWidthGrid: false,
        }),
        verticalScrollbar: am5.Scrollbar.new(root, {
          orientation: "vertical",
        }),
      })
    );

    legend.labels.template.setAll({
      fontSize: 16,
      maxWidth: 200,
      oversizedBehavior: "wrap",
      textAlign: "left",
    });

    legend.itemContainers.template.setAll({
      maxWidth: 250,
      paddingRight: 10,
      paddingLeft: 10,
      paddingTop: 5,
      paddingBottom: 5,
    });

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
        tooltipText: "{name}\n[bold]{valueY}[/]",
      });

      // Make the tooltip label wrap instead of stretching off-screen
      const tooltip = am5.Tooltip.new(root, {
        labelText: "{name}\n[bold]{valueY}[/]",
        autoTextColor: true,
      });

      tooltip.label.setAll({
        maxWidth: 250,
        oversizedBehavior: "wrap",
        textAlign: "left",
      });

      series.set("tooltip", tooltip);

      series.data.setAll(data);

      series.appear();

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
      titleLabelRef.current = null;
      yAxisLegendLabelRef.current = null;
      root.dispose();
    };
  }, []);

  useEffect(() => {
    chartTitleRef.current = chartTitle;
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  useEffect(() => {
    const xAxis = xAxisRef.current;
    if (!xAxis) return;
    xAxis.data.setAll(data);
    seriesListRef.current.forEach((series) => series.data.setAll(data));

    // Only clamp the y-axis to 0 when there are no negative values; otherwise
    // let amCharts auto-fit so negative bars are visible.
    yAxisRef.current?.set("min", hasNegativeValue ? undefined : 0);
  }, [data, hasNegativeValue]);

  useEffect(() => {
    yAxisLabelRef.current = yAxisLabel;
    const label = yAxisLegendLabelRef.current;
    if (!label) return;
    const visible = Boolean(yAxisLabel);
    label.set("text", yAxisLabel ?? "");
    label.set("visible", visible);
    label.parent?.set("visible", visible);
  }, [yAxisLabel]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "800px" }} />
    </div>
  );
}

export default StackedColumnChart;
