import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { applyChartColorStep, getPaletteColor } from "@/utils/chart/chart-palette.util";

type ChartDatum = Record<string, string | number>;

interface StackedBartWithNegativeValuesChartProps<T extends ChartDatum> {
  data: T[];
  yAxisKey: string; // e.g. "year"
  seriesKeys?: string[];
  /** Province title for map combinations — centered above the chart. */
  chartTitle?: string;
}

const containerId = "stacked-bar-negative-chartdiv";
const CHART_TITLE_BAND_HEIGHT = 40;

// Match the population pyramid's palette: right side → index 0, left side → index 1.
const RIGHT_COLOR_INDEX = 0;
const LEFT_COLOR_INDEX = 1;

function toChartData(data: ChartDatum[], leftKey: string, rightKey: string) {
  return data.map((row) => {
    const leftVal = Number(row[leftKey]);
    const rightVal = Number(row[rightKey]);
    return {
      ...row,
      [leftKey]: Number.isFinite(leftVal) ? -leftVal : 0,
      [rightKey]: Number.isFinite(rightVal) ? rightVal : 0,
    };
  });
}

function computeAxisMax(chartData: ChartDatum[], leftKey: string, rightKey: string) {
  const maxAbs = chartData.reduce((acc, row) => {
    return Math.max(acc, Math.abs(Number(row[leftKey])), Math.abs(Number(row[rightKey])));
  }, 0);
  return maxAbs > 0 ? maxAbs * 1.15 : 1;
}

function formatValueXForDisplay(value: unknown): string {
  const n = Number(value);
  if (!Number.isFinite(n)) return "";
  return Math.abs(n).toLocaleString("en-US");
}

function StackedBartWithNegativeValuesChart<T extends ChartDatum>({
  data,
  yAxisKey,
  seriesKeys = [],
  chartTitle,
}: StackedBartWithNegativeValuesChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const chartRef = useRef<am5xy.XYChart | null>(null);
  const yAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const xAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  const titleLabelRef = useRef<am5.Label | null>(null);
  const leftTitleLabelRef = useRef<am5.Label | null>(null);
  const rightTitleLabelRef = useRef<am5.Label | null>(null);
  const chartTitleRef = useRef(chartTitle);
  const dataRef = useRef(data);
  dataRef.current = data;
  // Latest seriesKeys, kept in sync by the reconcile effect for the data effect.
  const seriesKeysRef = useRef(seriesKeys);

  // Stable dependency for the series-reconcile effect: the array identity of
  // `seriesKeys` changes on every parent render, but its contents are what matter.
  const seriesKeysSignature = seriesKeys.join(" ");

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    root.container.set("layout", root.verticalLayout);

    const chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: "panX",
        wheelY: "zoomX",
        layout: root.verticalLayout,
        arrangeTooltips: false,
        paddingLeft: 0,
        paddingRight: 10,
      })
    );
    chartRef.current = chart;

    // Space palette colors the same way as every other chart (see chart-palette.util).
    applyChartColorStep(chart.get("colors"));

    chart.getNumberFormatter().set("numberFormat", "#.#s");

    if (chartTitle !== undefined) {
      const titleBand = chart.topAxesContainer.children.push(
        am5.Container.new(root, {
          width: am5.p100,
          height: CHART_TITLE_BAND_HEIGHT,
          paddingBottom: 4,
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
          textAlign: "center",
          oversizedBehavior: "wrap",
          maxWidth: 250,
        })
      );
      titleLabelRef.current = titleLabel;
    }

    // Gender titles stay aligned with the plot area (offset from the Y-axis).
    const titlesContainer = chart.topAxesContainer.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        layout: root.horizontalLayout,
        paddingBottom: 8,
      })
    );

    const makeTitle = (color: am5.Color) =>
      am5.Label.new(root, {
        text: "",
        width: am5.p50,
        textAlign: "center",
        fontSize: 18,
        fontWeight: "500",
        fill: color,
        oversizedBehavior: "wrap",
      });

    const colors = chart.get("colors")!;
    const leftTitleLabel = makeTitle(getPaletteColor(colors, LEFT_COLOR_INDEX));
    const rightTitleLabel = makeTitle(getPaletteColor(colors, RIGHT_COLOR_INDEX));
    titlesContainer.children.push(leftTitleLabel);
    titlesContainer.children.push(rightTitleLabel);
    leftTitleLabelRef.current = leftTitleLabel;
    rightTitleLabelRef.current = rightTitleLabel;

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: yAxisKey,
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: false,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minorGridEnabled: true,
          minGridDistance: 20,
        }),
      })
    );
    yAxisRef.current = yAxis;

    const xRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 60,
      strokeOpacity: 0.1,
    });
    xRenderer.labels.template.adapters.add("text", (text, target) => {
      const dataItem = target.dataItem as am5.DataItem<am5xy.IValueAxisDataItem> | undefined;
      const value = dataItem?.get("value");
      if (value == null) return text;
      return formatValueXForDisplay(value);
    });

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        strictMinMax: true,
        renderer: xRenderer,
      })
    );
    xAxisRef.current = xAxis;

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "zoomY" }));
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);

    chart.appear(1000, 100);

    return () => {
      rootRef.current = null;
      chartRef.current = null;
      yAxisRef.current = null;
      xAxisRef.current = null;
      seriesListRef.current = [];
      titleLabelRef.current = null;
      leftTitleLabelRef.current = null;
      rightTitleLabelRef.current = null;
      root.dispose();
    };
  }, []);

  // Rebuild the two series (and refresh the category axis, axis range, and the
  // per-side titles) whenever the series keys or the y-axis category change. The
  // init effect runs only once (to avoid replaying the intro animation), so
  // without this the chart would keep the series bound to the first render and
  // ignore later changes to seriesKeys / yAxisKey.
  useEffect(() => {
    const root = rootRef.current;
    const chart = chartRef.current;
    const xAxis = xAxisRef.current;
    const yAxis = yAxisRef.current;
    if (!root || !chart || !xAxis || !yAxis) return;

    seriesKeysRef.current = seriesKeys;
    const [rightKey, leftKey] = seriesKeys;

    yAxis.set("categoryField", yAxisKey);
    leftTitleLabelRef.current?.set("text", leftKey ?? "");
    rightTitleLabelRef.current?.set("text", rightKey ?? "");

    const chartData = toChartData(dataRef.current, leftKey, rightKey);
    const axisMax = computeAxisMax(chartData, leftKey, rightKey);
    xAxis.set("min", -axisMax);
    xAxis.set("max", axisMax);
    yAxis.data.setAll(chartData);

    // Tear down the previous series so a changed key set is reflected.
    seriesListRef.current.forEach((series) => {
      chart.series.removeValue(series);
      series.dispose();
    });

    const colors = chart.get("colors")!;
    const leftColor = getPaletteColor(colors, LEFT_COLOR_INDEX);
    const rightColor = getPaletteColor(colors, RIGHT_COLOR_INDEX);
    const seriesList: am5xy.ColumnSeries[] = [];

    const createSeries = (
      field: string,
      labelCenterX: number | am5.Percent,
      pointerOrientation: "left" | "right"
    ) => {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis,
          yAxis,
          valueXField: field,
          categoryYField: yAxisKey,
          sequencedInterpolation: true,
          clustered: false,
          name: field,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation,
            labelText: `${field}     [bold]{valueX.formatNumber('#.###')}[/]`,
          }),
        })
      );

      series.columns.template.setAll({
        height: am5.p100,
        strokeOpacity: 0,
        fillOpacity: 0.8,
      });

      series.get("tooltip")?.label.adapters.add("text", (text, target) => {
        const dataItem = target.dataItem as am5.DataItem<am5xy.IXYSeriesDataItem> | undefined;
        const value = dataItem?.get("valueX");
        if (value == null) return text;
        return `${field}     [bold]${formatValueXForDisplay(value)}[/]`;
      });

      series.bullets.push(function () {
        const label = am5.Label.new(root, {
          centerY: am5.p50,
          text: "{valueX}",
          populateText: true,
          centerX: labelCenterX,
        });
        label.adapters.add("text", (text, target) => {
          const dataItem = target.dataItem as am5.DataItem<am5xy.IXYSeriesDataItem> | undefined;
          const value = dataItem?.get("valueX");
          if (value == null) return text;
          return formatValueXForDisplay(value);
        });
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: label,
        });
      });

      series.data.setAll(chartData);
      series.appear();
      seriesList.push(series);
      return series;
    };

    if (rightKey) {
      const s = createSeries(rightKey, am5.p0, "left");
      s.setAll({ fill: rightColor, stroke: rightColor });
      s.columns.template.setAll({ fill: rightColor, stroke: rightColor });
    }
    if (leftKey) {
      const s = createSeries(leftKey, am5.p100, "right");
      s.setAll({ fill: leftColor, stroke: leftColor });
      s.columns.template.setAll({ fill: leftColor, stroke: leftColor });
    }

    seriesListRef.current = seriesList;
    // `data` is read via dataRef so a pure data change doesn't rebuild series;
    // the data effect below handles that.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [seriesKeysSignature, yAxisKey]);

  useEffect(() => {
    chartTitleRef.current = chartTitle;
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  useEffect(() => {
    const yAxis = yAxisRef.current;
    const xAxis = xAxisRef.current;
    if (!yAxis || !xAxis) return;

    const [rightKey, leftKey] = seriesKeysRef.current;
    const chartData = toChartData(data, leftKey, rightKey);
    const axisMax = computeAxisMax(chartData, leftKey, rightKey);

    xAxis.set("min", -axisMax);
    xAxis.set("max", axisMax);
    yAxis.data.setAll(chartData);
    seriesListRef.current.forEach((series) => series.data.setAll(chartData));
  }, [data]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "600px" }} />
    </div>
  );
}

export default StackedBartWithNegativeValuesChart;
