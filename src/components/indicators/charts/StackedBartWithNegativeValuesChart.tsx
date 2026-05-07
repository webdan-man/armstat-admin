import { useLayoutEffect } from "react";
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

function StackedBartWithNegativeValuesChart<T extends ChartDatum>({
  data,
  yAxisKey,
  seriesKeys = [],
}: StackedBartWithNegativeValuesChartProps<T>) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

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

    // Use only absolute numbers
    chart.getNumberFormatter().set("numberFormat", "#.#s");

    const [rightKey, leftKey] = seriesKeys;

    // Match the example palette (left: darker, right: lighter)
    const leftColor = am5.color(0x60a5fa);
    const rightColor = am5.color(0x7dd3fc);

    const chartData = data.map((row) => {
      const leftVal = Number(row[leftKey]);
      const rightVal = Number(row[rightKey]);
      return {
        ...row,
        // left side is negative to render to the left
        [leftKey]: Number.isFinite(leftVal) ? -leftVal : 0,
        [rightKey]: Number.isFinite(rightVal) ? rightVal : 0,
      };
    });

    const maxAbs = chartData.reduce((acc, row) => {
      const leftVal = Math.abs(Number(row[leftKey]));
      const rightVal = Math.abs(Number(row[rightKey]));
      return Math.max(acc, leftVal, rightVal);
    }, 0);
    const axisMax = maxAbs > 0 ? maxAbs * 1.15 : 1;

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
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

    // Top labels like the screenshot (MALE / FEMALE)
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

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    function createSeries(
      field: string,
      labelCenterX: number | am5.Percent,
      pointerOrientation: "left" | "right"
    ) {
      const series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: field,
          categoryYField: yAxisKey,
          sequencedInterpolation: true,
          clustered: false,
          name: field,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: pointerOrientation,
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
        const value = target.dataItem?.get("valueX" as any);

        if (value == null) return text;

        return `${field} ${value < 0 ? `- ${Math.abs(value)}` : value}`;
      });

      const valueLabel = am5.Label.new(root, {
        centerY: am5.p50,
        text: "{valueX}",
        populateText: true,
        centerX: labelCenterX,
        fill: am5.color(0xffffff),
      });
      valueLabel.adapters.add("text", (text, target) => {
        const di = (target as unknown as { dataItem?: { get: (k: string) => unknown } }).dataItem;
        const v = di?.get("valueX");
        const n = Number(v);
        return Number.isFinite(n) ? String(Math.abs(n)) : text;
      });

      series.bullets.push(function () {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerY: am5.p50,
            text: "{valueX}",
            populateText: true,
            centerX: labelCenterX,
          }),
        });
      });

      series.data.setAll(chartData);
      series.appear();

      return series;
    }

    // Left series (negative) and right series (positive)
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

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    const cursor = chart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        behavior: "zoomY",
      })
    );
    cursor.lineY.set("forceHidden", true);
    cursor.lineX.set("forceHidden", true);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, yAxisKey, seriesKeys]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default StackedBartWithNegativeValuesChart;
