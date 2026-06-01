import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type ChartDatum = Record<string, string | number>;

// Field names read off each `data` row (one row per gender × age × frame combination).
const SEX_FIELD = "sex";
const AGE_FIELD = "age";
const YEAR_FIELD = "year";
const VALUE_FIELD = "value";
const FRAME_LABEL_FIELD = "frameLabel";

const DEFAULT_MALE_LABEL = "Արական";
const DEFAULT_FEMALE_LABEL = "Իգական";

interface HistoricalPopulationPyramidChartProps<T extends ChartDatum> {
  data: T[];
  /** [maleLabel, femaleLabel] — matched against each row's `sex` value. */
  seriesKeys?: string[];
  /** Title shown above the population timeline chart. */
  timelineAxisAttributeName?: string;
  /**
   * Timeline (X2) axis kind:
   * - "time": a DateAxis of real calendar years (GENDER X1, AGE Y1, TIME X2).
   * - "category": a CategoryAxis of frame labels — area/other (GENDER X1, AGE Y1, AREA/OTHER X2).
   */
  timelineMode?: "time" | "category";
}

const containerId = "historical-pyramid-chartdiv";

interface PyramidRow {
  age: string;
  male: number;
  female: number; // negative — drawn on the left side of the pyramid
  femaleAbs: number; // positive — shown in the tooltip
}

interface TimelineRow {
  /** Timeline position as a timestamp (used by the time-mode DateAxis). */
  date: number;
  /** Frame label — the CategoryAxis category, and shown in category-mode tooltips. */
  frameLabel: string;
  male: number;
  female: number;
  lineSettings?: { strokeDasharray: number[]; strokeOpacity: number; fillOpacity: number };
}

interface ChartConfig {
  maleLabel: string;
  femaleLabel: string;
  timelineTitle: string;
}

// Unique age groups in the order they first appear (keeps 0-4, 5-9, … 85+).
function getAgeGroups<T extends ChartDatum>(data: T[]): string[] {
  const seen = new Set<string>();
  const out: string[] = [];
  for (const row of data) {
    const age = String(row[AGE_FIELD]);
    if (!seen.has(age)) {
      seen.add(age);
      out.push(age);
    }
  }
  return out;
}

// Frame positions (calendar years in time mode, synthetic ordinals in category mode), ascending.
function getYears<T extends ChartDatum>(data: T[]): number[] {
  const years = new Set<number>();
  for (const row of data) years.add(Number(row[YEAR_FIELD]));
  return Array.from(years).sort((a, b) => a - b);
}

// Maps each frame position to its display label, for categorical timelines.
function getFrameLabelByYear<T extends ChartDatum>(data: T[]): Map<number, string> {
  const map = new Map<number, string>();
  for (const row of data) {
    const label = row[FRAME_LABEL_FIELD];
    if (label == null) continue;
    const year = Number(row[YEAR_FIELD]);
    if (!map.has(year)) map.set(year, String(label));
  }
  return map;
}

// One pyramid row per age group for a single frame.
function buildPyramidData<T extends ChartDatum>(
  data: T[],
  ageGroups: string[],
  year: number,
  cfg: ChartConfig
): PyramidRow[] {
  const byAge = new Map<string, PyramidRow>();
  for (const age of ageGroups) byAge.set(age, { age, male: 0, female: 0, femaleAbs: 0 });

  for (const row of data) {
    if (Number(row[YEAR_FIELD]) !== year) continue;
    const bucket = byAge.get(String(row[AGE_FIELD]));
    if (!bucket) continue;
    const value = Number(row[VALUE_FIELD]);
    const sex = String(row[SEX_FIELD]);
    if (sex === cfg.maleLabel) {
      bucket.male = value;
    } else if (sex === cfg.femaleLabel) {
      bucket.female = -value;
      bucket.femaleAbs = value;
    }
  }

  return ageGroups.map((age) => byAge.get(age)!);
}

// One timeline row per frame with total male and female population.
function buildTimelineData<T extends ChartDatum>(
  data: T[],
  cfg: ChartConfig,
  projectionYear: number,
  options: { isCategory: boolean; frameLabelByYear: Map<number, string> }
): TimelineRow[] {
  const byYear = new Map<number, { male: number; female: number }>();
  for (const row of data) {
    const year = Number(row[YEAR_FIELD]);
    let entry = byYear.get(year);
    if (!entry) {
      entry = { male: 0, female: 0 };
      byYear.set(year, entry);
    }
    const value = Number(row[VALUE_FIELD]);
    const sex = String(row[SEX_FIELD]);
    if (sex === cfg.maleLabel) entry.male += value;
    else if (sex === cfg.femaleLabel) entry.female += value;
  }

  return getYears(data).map((year) => {
    const entry = byYear.get(year)!;
    const item: TimelineRow = {
      date: new Date(year, 0, 1).getTime(),
      frameLabel: options.frameLabelByYear.get(year) ?? String(year),
      male: entry.male,
      female: entry.female,
    };
    // Mark the latest (projection) year with a dashed, faded line — only meaningful for a
    // real time axis; categorical frames have no "projection".
    if (!options.isCategory && year === projectionYear) {
      item.lineSettings = { strokeDasharray: [3, 3], strokeOpacity: 0.3, fillOpacity: 0.3 };
    }
    return item;
  });
}

function getMaxValue<T extends ChartDatum>(data: T[]): number {
  let max = 0;
  for (const row of data) {
    const value = Number(row[VALUE_FIELD]);
    if (value > max) max = value;
  }
  return max;
}

function HistoricalPopulationPyramidChart<T extends ChartDatum>({
  data,
  seriesKeys = [],
  timelineAxisAttributeName = "Հատկանիշի անվանում",
  timelineMode = "time",
}: HistoricalPopulationPyramidChartProps<T>) {
  const rootRef = useRef<am5.Root | null>(null);
  // Latest props, read by the (create-once) chart internals on every data update.
  const dataRef = useRef<T[]>(data);
  const configRef = useRef<ChartConfig>({
    maleLabel: seriesKeys[0] ?? DEFAULT_MALE_LABEL,
    femaleLabel: seriesKeys[1] ?? DEFAULT_FEMALE_LABEL,
    timelineTitle: timelineAxisAttributeName,
  });
  const currentYearRef = useRef<number>(0);
  // Re-applies the current data to the existing chart; set up inside the layout effect.
  const applyDataRef = useRef<(() => void) | null>(null);

  // Rebuilt whenever the timeline (X2) axis kind changes — a DateAxis of years ("time") or a
  // CategoryAxis of frame labels ("category"). Data updates are applied without a rebuild
  // (see applyDataRef), so amCharts doesn't replay intro animations on every data change.
  useLayoutEffect(() => {
    const isCategory = timelineMode === "category";

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // Thousand separator only — no k / M suffix.
    root.numberFormatter.setAll({ numberFormat: "#,###." });

    const container = root.container.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: am5.p100,
        layout: root.horizontalLayout,
      })
    );

    // ---------------------------------------------------------------
    // Pyramid chart (left) — GENDER on X1, AGE on Y1. Identical in both modes.
    // ---------------------------------------------------------------
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

    pyramidChart.children.unshift(am5.Label.new(root, { text: " ", x: am5.p50, centerX: am5.p50 }));

    const pyramidTitle = pyramidChart.children.unshift(
      am5.Label.new(root, { text: "", fontSize: 20, x: am5.p50, centerX: am5.p50 })
    );

    // Sex labels in the plot corners.
    const maleCornerLabel = pyramidChart.plotContainer.children.push(
      am5.Label.new(root, {
        text: configRef.current.maleLabel,
        fontSize: 20,
        x: am5.p100,
        y: 5,
        centerX: am5.p100,
        dx: -5,
        fill: pyramidChart.get("colors")!.getIndex(0),
        background: am5.RoundedRectangle.new(root, { fill: am5.color(0xffffff), fillOpacity: 0.5 }),
      })
    );

    const femaleCornerLabel = pyramidChart.plotContainer.children.push(
      am5.Label.new(root, {
        text: configRef.current.femaleLabel,
        fontSize: 20,
        y: 5,
        x: 5,
        fill: pyramidChart.get("colors")!.getIndex(1),
        background: am5.RoundedRectangle.new(root, { fill: am5.color(0xffffff), fillOpacity: 0.5 }),
      })
    );

    const pyramidXAxis = pyramidChart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -200000,
        max: 200000,
        strictMinMax: true,
        renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 50, strokeOpacity: 0.1 }),
        tooltip: am5.Tooltip.new(root, {}),
      })
    );

    // Show absolute values on the X-axis ticks (the left side stores negatives).
    pyramidXAxis.get("renderer").labels.template.adapters.add("text", (text, target) => {
      const value = target.dataItem?.get("value" as never) as number | undefined;
      if (value == null) return text;
      return root.numberFormatter.format(Math.abs(value));
    });

    const yRenderer = am5xy.AxisRendererY.new(root, {
      minGridDistance: 10,
      minorGridEnabled: true,
    });
    const pyramidYAxis = pyramidChart.yAxes.push(
      am5xy.CategoryAxis.new(root, { categoryField: AGE_FIELD, renderer: yRenderer })
    );
    yRenderer.grid.template.setAll({ location: 1 });

    // Male series — right side.
    const pyramidSeriesMale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: AGE_FIELD,
        valueXField: "male",
        clustered: false,
        tooltip: am5.Tooltip.new(root, { labelText: "{categoryY}     [bold]{male}[/]" }),
      })
    );

    // Female series — left side (negative values).
    const pyramidSeriesFemale = pyramidChart.series.push(
      am5xy.ColumnSeries.new(root, {
        xAxis: pyramidXAxis,
        yAxis: pyramidYAxis,
        categoryYField: AGE_FIELD,
        valueXField: "female",
        clustered: false,
        tooltip: am5.Tooltip.new(root, { labelText: "{categoryY}     [bold]{femaleAbs}[/]" }),
      })
    );

    const pyramidCursor = pyramidChart.set(
      "cursor",
      am5xy.XYCursor.new(root, { xAxis: pyramidXAxis, yAxis: pyramidYAxis })
    );
    pyramidCursor.lineX.set("visible", false);
    pyramidCursor.lineY.set("visible", false);

    // ---------------------------------------------------------------
    // Timeline chart (right) — the X2 frame dimension (TIME, or AREA/OTHER).
    // ---------------------------------------------------------------
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

    const popTitle = popChart.children.unshift(
      am5.Label.new(root, {
        text: configRef.current.timelineTitle,
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
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

    // Frame label lookup + display order, refreshed by applyData; read by the cursor + title.
    let frameLabelByYear = new Map<number, string>();
    let frameYears: number[] = [];

    // Pyramid heading for a frame: its label when categorical, else the year.
    function frameTitleForYear(year: number): string {
      return isCategory ? (frameLabelByYear.get(year) ?? "") : String(year);
    }

    // Redraw the pyramid for the frame under the timeline cursor.
    function updatePyramidForYear(year: number) {
      const rows = buildPyramidData(
        dataRef.current,
        getAgeGroups(dataRef.current),
        year,
        configRef.current
      );
      if (!rows.length) return;
      rows.forEach((row, i) => {
        pyramidSeriesMale.data.setIndex(i, row);
        pyramidSeriesFemale.data.setIndex(i, row);
      });
      pyramidTitle.set("text", frameTitleForYear(year));
    }

    // Mode-specific timeline axis/series. `pushTimeline` feeds the (possibly axis-bound) data;
    // `tooltipHeader` is the per-point header populated in applyData.
    let popSeriesMale: am5xy.XYSeries;
    let popSeriesFemale: am5xy.XYSeries;
    let pushTimeline: (rows: TimelineRow[]) => void;
    let tooltipHeader: string;

    if (isCategory) {
      // AREA / OTHER on X2 → categorical axis labelled by frame, stacked male+female columns.
      const popXRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 30 });
      // Tilt the (often long) frame labels 45° so they don't overlap.
      popXRenderer.labels.template.setAll({
        rotation: -45,
        centerY: am5.p50,
        centerX: am5.p100,
      });
      const popXAxis = popChart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: FRAME_LABEL_FIELD,
          renderer: popXRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      const male = popChart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: popXAxis,
          yAxis: popYAxis,
          valueYField: "male",
          categoryXField: FRAME_LABEL_FIELD,
          stacked: true,
        })
      );

      const female = popChart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: popXAxis,
          yAxis: popYAxis,
          valueYField: "female",
          categoryXField: FRAME_LABEL_FIELD,
          stacked: true,
          tooltip: am5.Tooltip.new(root, { pointerOrientation: "horizontal" }),
        })
      );

      const popCursor = popChart.set(
        "cursor",
        am5xy.XYCursor.new(root, { xAxis: popXAxis, yAxis: popYAxis })
      );
      popCursor.lineY.set("visible", false);

      popCursor.events.on("cursormoved", (ev) => {
        const positionX = ev.target.getPrivate("positionX");
        if (positionX == null) return;
        const year = frameYears[popXAxis.axisPositionToIndex(positionX)];
        if (year != null && year !== currentYearRef.current) {
          currentYearRef.current = year;
          updatePyramidForYear(year);
        }
      });

      popSeriesMale = male;
      popSeriesFemale = female;
      // The CategoryAxis needs the category list too, in the same order as the series data.
      pushTimeline = (rows) => {
        popXAxis.data.setAll(rows);
        male.data.setAll(rows);
        female.data.setAll(rows);
      };
      tooltipHeader = "{categoryX}";
    } else {
      // TIME on X2 → real calendar-year date axis, stacked male+female area lines.
      const popXAxis = popChart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.1,
          groupData: false,
          baseInterval: { timeUnit: "year", count: 1 },
          renderer: am5xy.AxisRendererX.new(root, { minGridDistance: 40 }),
          tooltip: am5.Tooltip.new(root, {}),
        })
      );

      const male = popChart.series.push(
        am5xy.LineSeries.new(root, {
          minBulletDistance: 10,
          xAxis: popXAxis,
          yAxis: popYAxis,
          valueYField: "male",
          valueXField: "date",
          stacked: true,
        })
      );
      male.strokes.template.setAll({ strokeWidth: 2, templateField: "lineSettings" });
      male.fills.template.setAll({ visible: true, fillOpacity: 0.5, templateField: "lineSettings" });

      const female = popChart.series.push(
        am5xy.LineSeries.new(root, {
          minBulletDistance: 10,
          xAxis: popXAxis,
          yAxis: popYAxis,
          valueYField: "female",
          valueXField: "date",
          stacked: true,
          tooltip: am5.Tooltip.new(root, { pointerOrientation: "horizontal" }),
        })
      );
      female.strokes.template.setAll({ strokeWidth: 2, templateField: "lineSettings" });
      female.fills.template.setAll({
        visible: true,
        fillOpacity: 0.5,
        templateField: "lineSettings",
      });

      const popCursor = popChart.set(
        "cursor",
        am5xy.XYCursor.new(root, { xAxis: popXAxis, yAxis: popYAxis })
      );
      popCursor.lineY.set("visible", false);

      popCursor.events.on("cursormoved", (ev) => {
        const positionX = ev.target.getPrivate("positionX");
        if (positionX == null) return;
        const year = popXAxis.positionToDate(positionX).getFullYear();
        if (year !== currentYearRef.current) {
          currentYearRef.current = year;
          updatePyramidForYear(year);
        }
      });

      popSeriesMale = male;
      popSeriesFemale = female;
      pushTimeline = (rows) => {
        male.data.setAll(rows);
        female.data.setAll(rows);
      };
      tooltipHeader = "{valueX.formatDate('yyyy')}";
    }

    // (Re-)apply the current data to the already-built chart.
    function applyData() {
      const rows = dataRef.current;
      const cfg = configRef.current;
      frameLabelByYear = getFrameLabelByYear(rows);
      const ageGroups = getAgeGroups(rows);
      frameYears = getYears(rows);
      const projectionYear = frameYears.length ? frameYears[frameYears.length - 1] : 0;

      if (!frameYears.includes(currentYearRef.current)) {
        currentYearRef.current = projectionYear;
      }

      maleCornerLabel.set("text", cfg.maleLabel);
      femaleCornerLabel.set("text", cfg.femaleLabel);
      popTitle.set("text", cfg.timelineTitle);
      popSeriesFemale
        .get("tooltip")
        ?.set(
          "labelText",
          `[bold]${tooltipHeader}[/]\n[font-size: 20]${cfg.maleLabel}     [bold]{male}[/]\n${cfg.femaleLabel}     [bold]{female}[/]`
        );

      const pyramid = buildPyramidData(rows, ageGroups, currentYearRef.current, cfg);
      pyramidYAxis.data.setAll(pyramid);
      pyramidSeriesMale.data.setAll(pyramid);
      pyramidSeriesFemale.data.setAll(pyramid);
      pyramidTitle.set("text", frameTitleForYear(currentYearRef.current));

      // Fixed, symmetric bounds let users compare the pyramid shape across frames.
      const pad = getMaxValue(rows) * 1.1 || 1;
      pyramidXAxis.set("min", -pad);
      pyramidXAxis.set("max", pad);

      pushTimeline(buildTimelineData(rows, cfg, projectionYear, { isCategory, frameLabelByYear }));
    }

    applyDataRef.current = applyData;
    applyData();

    popSeriesMale.appear(1000, 100);
    popChart.appear(1000, 100);
    pyramidChart.appear(1000, 100);

    return () => {
      rootRef.current = null;
      applyDataRef.current = null;
      root.dispose();
    };
  }, [timelineMode]);

  useEffect(() => {
    dataRef.current = data;
    configRef.current = {
      maleLabel: seriesKeys[0] ?? DEFAULT_MALE_LABEL,
      femaleLabel: seriesKeys[1] ?? DEFAULT_FEMALE_LABEL,
      timelineTitle: timelineAxisAttributeName,
    };
    applyDataRef.current?.();
  }, [data, seriesKeys, timelineAxisAttributeName]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "600px" }} />
    </div>
  );
}

export default HistoricalPopulationPyramidChart;
