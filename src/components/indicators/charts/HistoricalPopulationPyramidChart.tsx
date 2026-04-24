import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { HistoricalPyramidRow } from "@/utils/chart/map-combinations-for-pyramid";

type ChartDatum = Record<string, string | number>;

interface HistoricalPopulationPyramidChartProps<T extends ChartDatum> {
  data: T[];
  seriesKeys?: string[];
}

const containerId = "historical-pyramid-chartdiv";

function HistoricalPopulationPyramidChart<T extends ChartDatum>({
  data,
  seriesKeys = [],
}: HistoricalPopulationPyramidChartProps<T>) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    root.numberFormatter.setAll({
      numberFormat: "#,###.#a",
      bigNumberPrefixes: [
        { number: 1e3, suffix: "K" },
        { number: 1e6, suffix: "M" },
        { number: 1e9, suffix: "B" },
      ],
    });

    // Create wrapper for charts
    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        layout: root.horizontalLayout,
      })
    );

    // ==========================================
    // Data (from props)
    // ==========================================

    type PyramidRow = {
      col3: number; // timestamp (ms)
      col4: string; // age group label
      col5: number; // male
      col6: number; // female (often negative for pyramid)
      lineSettings?: unknown;
    };

    const sourceData: PyramidRow[] = data
      .filter((d) => d && d.col3 != null && d.col4 != null)
      .map((d) => {
        const yearFromCol3 = new Date(d.col3).getFullYear();
        const ts = Number.isFinite(yearFromCol3)
          ? new Date(yearFromCol3, 0, 1).getTime()
          : Number(new Date(d.col3).getTime());

        return {
          col3: ts,
          col4: String(d.col4),
          col5: Number(d.col5 || 0),
          col6: Number(d.col6 || 0),
        } satisfies PyramidRow;
      });

    const years = sourceData
      .map((d) => new Date(d.col3).getFullYear())
      .filter((y) => Number.isFinite(y));

    let currentYear: number = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    const frameLabelByYear = new Map<number, string>();
    for (const d of data as any[]) {
      const y = new Date(d?.col3).getFullYear();
      const label = d?.col7;
      if (Number.isFinite(y) && typeof label === "string" && label.trim()) {
        frameLabelByYear.set(y, label);
      }
    }

    const leftLabelText = seriesKeys[0] ?? "Series 1";
    const rightLabelText = seriesKeys[1] ?? "Series 2";

    function buildPopulationSeriesData(rows: PyramidRow[]) {
      const byYear = new Map<
        number,
        { col3: number; col4: number; col5: number; lineSettings?: unknown }
      >();

      for (const r of rows) {
        const year = new Date(r.col3).getFullYear();
        if (!Number.isFinite(year)) continue;

        const male = Number(r.col5 || 0);
        const femaleAbs = Math.abs(Number(r.col6 || 0));

        const ts = new Date(year, 0, 1).getTime();
        const existing = byYear.get(year) ?? { col3: ts, col4: 0, col5: 0 };
        existing.col4 += male;
        existing.col5 += femaleAbs;
        byYear.set(year, existing);
      }

      const result = Array.from(byYear.values()).sort((a, b) => a.col3 - b.col3);
      for (const item of result) {
        if (new Date(item.col3).getFullYear() === currentYear) {
          item.lineSettings = {
            strokeDasharray: [3, 3],
            strokeOpacity: 0.3,
            fillOpacity: 0.3,
          };
        }
      }
      return result;
    }

    function getCurrentData() {
      const currentData: PyramidRow[] = [];
      am5.array.each(sourceData, function (row, i) {
        const year = new Date(row.col3).getFullYear();
        if (year === currentYear) {
          if (row.col6 > 0) {
            row.col6 *= -1;
          }
          currentData.push(row);
        }
      });
      currentData.sort(function (a, b) {
        const a1 = Number(a.col4.replace(/[^0-9]+.*$/, ""));
        const b1 = Number(b.col4.replace(/[^0-9]+.*$/, ""));
        if (a1 > b1) {
          return 1;
        } else if (a1 < b1) {
          return -1;
        }
        return 0;
      });
      return currentData;
    }

    function updateData() {
      const data: PyramidRow[] = getCurrentData();
      const pyramidData = pyramidSeriesMale.data.values;

      if (data.length == 0) {
        return;
      }
      for (let i = 0; i < pyramidData.length; i++) {
        const base = pyramidData[i] as HistoricalPyramidRow;
        const next = { ...(base ?? {}) };
        if (!data[i]) {
          next.col5 = 0;
          next.col6 = 0;
        } else {
          next.col5 = data[i].col5;
          next.col6 = data[i].col6;
        }
        pyramidSeriesMale.data.setIndex(i, next);
        pyramidSeriesFemale.data.setIndex(i, next);
      }

      // Set title
      pyramidTitle.set("text", frameLabelByYear.get(currentYear) ?? (currentYear + ""));
    }

    // ==========================================
    // Pyramid chart
    // ==========================================

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    const pyramidChart = container.children.push(
      am5xy.XYChart.new(root, {
        width: am5.p50,
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
      })
    );

    // // Add titles
    // const pyramidSubtitle = pyramidChart.children.unshift(
    //   am5.Label.new(root, {
    //     text: " ",
    //     x: am5.p50,
    //     centerX: am5.p50,
    //   })
    // );

    const pyramidTitle = pyramidChart.children.unshift(
      am5.Label.new(root, {
        text: frameLabelByYear.get(currentYear) ?? (currentYear + ""),
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // // Add labels
    // const maleLabel = pyramidChart.plotContainer.children.push(
    //   am5.Label.new(root, {
    //     text: rightLabelText,
    //     fontSize: 20,
    //     x: am5.p100,
    //     y: 5,
    //     centerX: am5.p100,
    //     dx: -5,
    //     fill: pyramidChart.get("colors")?.getIndex(0) ?? am5.color(0x000000),
    //     background: am5.RoundedRectangle.new(root, {
    //       fill: am5.color(0xffffff),
    //       fillOpacity: 0.5,
    //     }),
    //   })
    // );
    //
    // const femaleLabel = pyramidChart.plotContainer.children.push(
    //   am5.Label.new(root, {
    //     text: leftLabelText,
    //     fontSize: 20,
    //     y: 5,
    //     x: 5,
    //     fill: pyramidChart.get("colors")?.getIndex(1) ?? am5.color(0x000000),
    //     background: am5.RoundedRectangle.new(root, {
    //       fill: am5.color(0xffffff),
    //       fillOpacity: 0.5,
    //     }),
    //   })
    // );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    const pyramidXAxis = pyramidChart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
          strokeOpacity: 0.1,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 10,
      minorGridEnabled: true,
    });
    const pyramidYAxis = pyramidChart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "col4",
        renderer: yRenderer,
      })
    );

    yRenderer.grid.template.setAll({
      location: 1,
    });

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/
    const pyramidSeriesMale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: "col4",
        valueXField: "col5",
        clustered: false,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueX}",
        }),
      })
    );

    const pyramidSeriesFemale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: "col4",
        valueXField: "col6",
        clustered: false,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{valueX}",
        }),
      })
    );

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    const pyradmidCursor = pyramidChart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
      })
    );
    pyradmidCursor.lineX.set("visible", false);
    pyradmidCursor.lineY.set("visible", false);

    // ==========================================
    // Population chart
    // ==========================================

    // Create chart
    // https://www.amcharts.com/docs/v5/charts/xy-chart/
    const popChart = container.children.push(
      am5xy.XYChart.new(root, {
        width: am5.p50,
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
      })
    );

    // Add titles
    const popSubtitle = popChart.children.unshift(
      am5.Label.new(root, {
        text: "(hover to see breakdown)",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const popTitle = popChart.children.unshift(
      am5.Label.new(root, {
        text: "U.S. population",
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    // Create axes
    // https://www.amcharts.com/docs/v5/charts/xy-chart/axes/
    const popXAxis = popChart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.1,
        groupData: false,
        baseInterval: { timeUnit: "year", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 40,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const popYAxis = popChart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        maxDeviation: 0.1,
        renderer: am5xy.AxisRendererY.new(root, {
          opposite: true,
        }),
      })
    );

    // Add series
    // https://www.amcharts.com/docs/v5/charts/xy-chart/series/

    const popSeriesMale = popChart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        xAxis: popXAxis,
        yAxis: popYAxis,
        valueYField: "col4",
        valueXField: "col3",
        stacked: true,
      })
    );

    popSeriesMale.strokes.template.setAll({
      strokeWidth: 2,
      templateField: "lineSettings",
    });

    popSeriesMale.fills.template.setAll({
      visible: true,
      fillOpacity: 0.5,
      templateField: "lineSettings",
    });

    const popSeriesFemale = popChart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        xAxis: popXAxis,
        yAxis: popYAxis,
        valueYField: "col5",
        valueXField: "col3",
        stacked: true,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: `[bold]Population in {valueX.formatDate()}[/]\n[font-size: 20]${leftLabelText}: {col4}\n${rightLabelText}: {col5}`,
        }),
      })
    );

    popSeriesFemale.strokes.template.setAll({
      strokeWidth: 2,
      templateField: "lineSettings",
    });

    popSeriesFemale.fills.template.setAll({
      visible: true,
      fillOpacity: 0.5,
      templateField: "lineSettings",
    });

    // Add cursor
    // https://www.amcharts.com/docs/v5/charts/xy-chart/cursor/
    const popCursor = popChart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: popXAxis,
        yAxis: popYAxis,
      })
    );
    popCursor.lineY.set("visible", false);

    popCursor.events.on("cursormoved", function (ev) {
      const x = ev.target.getPrivate("positionX");
      if (typeof x !== "number") return;
      currentYear = popXAxis.positionToDate(x).getFullYear();
      updateData();
    });

    // ==========================================
    // Bind data to charts
    // ==========================================

    const currentData = getCurrentData();
    pyramidYAxis.data.setAll(currentData);
    pyramidSeriesMale.data.setAll(currentData);
    pyramidSeriesFemale.data.setAll(currentData);

    // Auto-scale pyramid X axis to your data (supports millions).
    const maxAbs = currentData.reduce((acc, r) => {
      const v = Math.max(Math.abs(Number(r.col5 || 0)), Math.abs(Number(r.col6 || 0)));
      return v > acc ? v : acc;
    }, 0);
    if (maxAbs > 0) {
      const pad = Math.ceil(maxAbs * 1.1);
      pyramidXAxis.setAll({ min: -pad, max: pad });
    }

    const popData = buildPopulationSeriesData(sourceData);
    popSeriesMale.data.setAll(popData);
    popSeriesFemale.data.setAll(popData);

    // Make stuff animate on load
    // https://www.amcharts.com/docs/v5/concepts/animations/
    popSeriesMale.appear(1000, 100);
    popChart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, seriesKeys]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }} />
    </div>
  );
}

export default HistoricalPopulationPyramidChart;
