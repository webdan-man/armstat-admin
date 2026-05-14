import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type ChartDatum = Record<string, string | number>;

interface StackedBartWithNegativeValuesChartProps<T extends ChartDatum> {
  data: T[];
  yAxisKey: string; // e.g. "year"
  seriesKeys?: string[];
}

const containerId = "stacked-bar-negative-chartdiv";

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
}: StackedBartWithNegativeValuesChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  const yAxisRef = useRef<am5xy.CategoryAxis<am5xy.AxisRenderer> | null>(null);
  const xAxisRef = useRef<am5xy.ValueAxis<am5xy.AxisRenderer> | null>(null);
  const seriesListRef = useRef<am5xy.ColumnSeries[]>([]);
  // Capture initial seriesKeys for use in data-update effect.
  const seriesKeysRef = useRef(seriesKeys);

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

    chart.getNumberFormatter().set("numberFormat", "#.#s");

    const [rightKey, leftKey] = seriesKeys;
    seriesKeysRef.current = seriesKeys;

    const leftColor = am5.color(0x60a5fa);
    const rightColor = am5.color(0x7dd3fc);

    const chartData = toChartData(data, leftKey, rightKey);
    const axisMax = computeAxisMax(chartData, leftKey, rightKey);

    const yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: yAxisKey,
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minorGridEnabled: true,
          minGridDistance: 20,
        }),
      })
    );
    yAxisRef.current = yAxis;

    yAxis.data.setAll(chartData);

    const xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -axisMax,
        max: axisMax,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 60,
          strokeOpacity: 0.1,
        }),
      })
    );
    xAxisRef.current = xAxis;

    chart.plotContainer.children.push(
      am5.Label.new(root, {
        text: leftKey ?? "",
        fontSize: "1.1em",
        fill: leftColor,
        x: am5.percent(25),
        centerX: am5.p50,
        y: 0,
        centerY: 0,
        isMeasured: false,
      })
    );
    chart.plotContainer.children.push(
      am5.Label.new(root, {
        text: rightKey ?? "",
        fontSize: "1.1em",
        fill: rightColor,
        x: am5.percent(75),
        centerX: am5.p50,
        y: 0,
        centerY: 0,
        isMeasured: false,
      })
    );

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
            labelText: `${field} - {valueX.formatNumber('#.###')}`,
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
        return `${field} - ${formatValueXForDisplay(value)}`;
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

    const cursor = chart.set("cursor", am5xy.XYCursor.new(root, { behavior: "zoomY" }));
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);

    chart.appear(1000, 100);

    return () => {
      rootRef.current = null;
      yAxisRef.current = null;
      xAxisRef.current = null;
      seriesListRef.current = [];
      root.dispose();
    };
  }, []);

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
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default StackedBartWithNegativeValuesChart;
