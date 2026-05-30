import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type ChartDatum = Record<string, string | number>;

interface HistoricalPopulationPyramidChartProps<T extends ChartDatum> {
  data: T[];
  seriesKeys?: string[];
  /** Localized title of the TIME attribute (timeline chart header). */
  timelineAxisAttributeName?: string;
}

const containerId = "historical-pyramid-chartdiv";

/** One raw fact row after normalizing props (analogous to POP_DATA rows). */
type SourceRow = {
  year: number;
  age: string;
  male: number;
  female: number;
  femaleAbs: number;
};

/** One row per age band for the pyramid series (amCharts fields match client demo). */
type PyramidDatum = {
  age: string;
  male: number;
  female: number;
  femaleAbs: number;
};

/** One row per year for the timeline (stacked lines). */
type TimelineDatum = {
  date: number;
  male: number;
  female: number;
  lineSettings?: {
    strokeDasharray: number[];
    strokeOpacity: number;
    fillOpacity: number;
  };
};

function HistoricalPopulationPyramidChart<T extends ChartDatum>({
  data,
  seriesKeys = [],
  timelineAxisAttributeName = "",
}: HistoricalPopulationPyramidChartProps<T>) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    // Thousand separator only, no compact suffix (matches client snippet)
    root.numberFormatter.setAll({
      numberFormat: "#,###.",
    });

    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        layout: root.horizontalLayout,
      })
    );

    // ---- Normalize props into source rows (sex already split into male / female columns)
    const sourceRows: SourceRow[] = [];
    for (const d of data) {
      if (!d || d.col3 == null || d.col4 == null) continue;
      const year = new Date(d.col3 as string | number).getFullYear();
      if (!Number.isFinite(year)) continue;
      const male = Number(d.col5 ?? 0);
      const femaleRaw = Number(d.col6 ?? 0);
      const femaleAbs = Math.abs(femaleRaw);
      const female = femaleRaw <= 0 ? femaleRaw : -femaleAbs;
      sourceRows.push({
        year,
        age: String(d.col4),
        male,
        female,
        femaleAbs,
      });
    }

    const years = sourceRows.map((r) => r.year).filter((y) => Number.isFinite(y));
    let currentYear: number = years.length > 0 ? Math.max(...years) : new Date().getFullYear();

    const frameLabelByYear = new Map<number, string>();
    for (const d of data as ChartDatum[]) {
      const y = new Date(d?.col3 as string | number).getFullYear();
      const label = d?.col7;
      if (Number.isFinite(y) && typeof label === "string" && label.trim()) {
        frameLabelByYear.set(y, label);
      }
    }

    const maleCornerLabel = seriesKeys[0] ?? "Արական";
    const femaleCornerLabel = seriesKeys[1] ?? "Իգական";

    // Unique age groups in first-seen order (preserves 0-4, 5-9, … like client)
    const ageGroups: string[] = [];
    const seenAge = new Set<string>();
    for (const r of sourceRows) {
      if (!seenAge.has(r.age)) {
        seenAge.add(r.age);
        ageGroups.push(r.age);
      }
    }

    function buildPyramidData(year: number): PyramidDatum[] {
      const byAge: Record<string, PyramidDatum> = {};
      for (const a of ageGroups) {
        byAge[a] = { age: a, male: 0, female: 0, femaleAbs: 0 };
      }
      for (const r of sourceRows) {
        if (r.year !== year) continue;
        const b = byAge[r.age];
        if (!b) continue;
        b.male = r.male;
        b.female = r.female;
        b.femaleAbs = r.femaleAbs;
      }
      return ageGroups.map((a) => byAge[a]);
    }

    function buildTimelineData(): TimelineDatum[] {
      const byYear: Record<number, { male: number; female: number }> = {};
      for (const r of sourceRows) {
        if (!byYear[r.year]) byYear[r.year] = { male: 0, female: 0 };
        byYear[r.year].male += r.male;
        byYear[r.year].female += r.femaleAbs;
      }
      const sortedYears = Object.keys(byYear)
        .map(Number)
        .sort((a, b) => a - b);
      return sortedYears.map((y) => {
        const item: TimelineDatum = {
          date: new Date(y, 0, 1).getTime(),
          male: byYear[y].male,
          female: byYear[y].female,
        };
        if (y === currentYear) {
          item.lineSettings = {
            strokeDasharray: [3, 3],
            strokeOpacity: 0.3,
            fillOpacity: 0.3,
          };
        }
        return item;
      });
    }

    function fitPyramidAxis() {
      let maxCell = 0;
      for (const r of sourceRows) {
        maxCell = Math.max(maxCell, r.male, r.femaleAbs);
      }
      const pad = maxCell > 0 ? maxCell * 1.1 : 1;
      pyramidXAxis.set("min", -pad);
      pyramidXAxis.set("max", pad);
    }

    function updateData() {
      const pyramidData = buildPyramidData(currentYear);
      if (!pyramidData.length) return;
      for (let i = 0; i < pyramidData.length; i++) {
        pyramidSeriesMale.data.setIndex(i, pyramidData[i]);
        pyramidSeriesFemale.data.setIndex(i, pyramidData[i]);
      }
      pyramidTitle.set("text", frameLabelByYear.get(currentYear) ?? String(currentYear));
    }

    // ---- Pyramid chart
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

    pyramidChart.children.unshift(
      am5.Label.new(root, {
        text: " ",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const pyramidTitle = pyramidChart.children.unshift(
      am5.Label.new(root, {
        text: frameLabelByYear.get(currentYear) ?? String(currentYear),
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    pyramidChart.plotContainer.children.push(
      am5.Label.new(root, {
        text: maleCornerLabel,
        fontSize: 20,
        x: am5.p100,
        y: 5,
        centerX: am5.p100,
        dx: -5,
        fill: pyramidChart.get("colors")?.getIndex(0) ?? am5.color(0x000000),
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0.5,
        }),
      })
    );

    pyramidChart.plotContainer.children.push(
      am5.Label.new(root, {
        text: femaleCornerLabel,
        fontSize: 20,
        y: 5,
        x: 5,
        fill: pyramidChart.get("colors")?.getIndex(1) ?? am5.color(0x000000),
        background: am5.RoundedRectangle.new(root, {
          fill: am5.color(0xffffff),
          fillOpacity: 0.5,
        }),
      })
    );

    const pyramidXAxis = pyramidChart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 50,
          strokeOpacity: 0.1,
        }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    pyramidXAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
      const v = (target.dataItem as { get?: (key: string) => unknown } | undefined)?.get?.(
        "value"
      ) as number | undefined;
      if (v == null) return text;
      return root.numberFormatter.format(Math.abs(v));
    });

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 10,
      minorGridEnabled: true,
    });
    const pyramidYAxis = pyramidChart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: "age",
        renderer: yRenderer,
      })
    );
    yRenderer.grid.template.setAll({ location: 1 });

    const pyramidSeriesMale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: "age",
        valueXField: "male",
        clustered: false,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}     [bold]{male}[/]",
        }),
      })
    );

    const pyramidSeriesFemale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: "age",
        valueXField: "female",
        clustered: false,
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}     [bold]{femaleAbs}[/]",
        }),
      })
    );

    const pyramidCursor = pyramidChart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
      })
    );
    pyramidCursor.lineX.set("visible", false);
    pyramidCursor.lineY.set("visible", false);

    // ---- Timeline chart
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

    popChart.children.unshift(
      am5.Label.new(root, {
        text: "(շարժեք մկնիկը՝ արժեքները տեսնելու համար)",
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    popChart.children.unshift(
      am5.Label.new(root, {
        text: timelineAxisAttributeName.trim() || " ",
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
      })
    );

    const popXAxis = popChart.xAxes.push(
      am5xy.DateAxis.new(root, {
        maxDeviation: 0.1,
        groupData: false,
        baseInterval: { timeUnit: "year", count: 1 },
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 40 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    const popYAxis = popChart.yAxes.push(
      am5xy.ValueAxis.new(root, {
        min: 0,
        strictMinMax: true,
        maxDeviation: 0.1,
        renderer: am5xy.AxisRendererY.new(root, { opposite: true }),
      })
    );

    const popSeriesMale = popChart.series.push(
      am5xy.LineSeries.new(root, {
        minBulletDistance: 10,
        xAxis: popXAxis,
        yAxis: popYAxis,
        valueYField: "male",
        valueXField: "date",
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
        valueYField: "female",
        valueXField: "date",
        stacked: true,
        tooltip: am5.Tooltip.new(root, {
          pointerOrientation: "horizontal",
          labelText: `[bold]{valueX.formatDate('yyyy')}[/]\n[font-size: 20]${maleCornerLabel}     [bold]{male}[/]\n${femaleCornerLabel}     [bold]{female}[/]`,
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

    const popCursor = popChart.set(
      "cursor",
      am5xy.XYCursor.new(root, {
        xAxis: popXAxis,
        yAxis: popYAxis,
      })
    );
    popCursor.lineY.set("visible", false);

    popCursor.events.on("cursormoved", (ev) => {
      const x = ev.target.getPrivate("positionX");
      if (typeof x !== "number") return;
      const y = popXAxis.positionToDate(x).getFullYear();
      if (y !== currentYear) {
        currentYear = y;
        updateData();
      }
    });

    // ---- Initial render
    const initialPyramid = buildPyramidData(currentYear);
    pyramidYAxis.data.setAll(initialPyramid);
    pyramidSeriesMale.data.setAll(initialPyramid);
    pyramidSeriesFemale.data.setAll(initialPyramid);
    fitPyramidAxis();

    const timeline = buildTimelineData();
    popSeriesMale.data.setAll(timeline);
    popSeriesFemale.data.setAll(timeline);

    popSeriesMale.appear(1000, 100);
    popChart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, seriesKeys, timelineAxisAttributeName]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "550px" }} />
    </div>
  );
}

export default HistoricalPopulationPyramidChart;
