import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";
import { applyChartColorStep, getPaletteColor } from "@/utils/chart/chart-palette.util";
import { useTranslation } from "@/hooks/useTranslation";

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
const CURSOR_HINT = "historical-pyramid-cursor-hint";
// Keep the bottom label band the same height in both charts (see other column charts).
const X_AXIS_LABEL_MAX_HEIGHT = 110;
// Long frame titles wrap; cap the band so the plot area stays aligned side-by-side.
const CHART_TITLE_BAND_HEIGHT = 40;
const GENDER_LABEL_BAND_HEIGHT = 48;
// Pull headers up into dedicated root headroom so they are not clipped.
const CHART_HEADER_HEADROOM = 24;
const TOOLTIP_CONTAINER_BOUNDS = { top: 24, right: 20, bottom: 70, left: 20 };
const CURSOR_HINT_BAND_HEIGHT = 18;
const TOP_HEADER_HEIGHT =
  CURSOR_HINT_BAND_HEIGHT + CHART_TITLE_BAND_HEIGHT + GENDER_LABEL_BAND_HEIGHT;

/** Lock header + bottom X-axis bands so both charts share the same plot baseline. */
function lockChartLayoutBands(charts: am5xy.XYChart[]) {
  for (const chart of charts) {
    chart.topAxesContainer.setAll({
      minHeight: TOP_HEADER_HEIGHT,
      maxHeight: TOP_HEADER_HEIGHT,
    });
    chart.bottomAxesContainer.setAll({
      minHeight: X_AXIS_LABEL_MAX_HEIGHT,
      maxHeight: X_AXIS_LABEL_MAX_HEIGHT,
    });
  }
}

function syncBottomXAxisBand(chart: am5xy.XYChart, xAxis: am5xy.Axis<am5xy.AxisRenderer>) {
  xAxis.setAll({
    minHeight: X_AXIS_LABEL_MAX_HEIGHT,
    maxHeight: X_AXIS_LABEL_MAX_HEIGHT,
  });
  chart.bottomAxesContainer.setAll({
    minHeight: X_AXIS_LABEL_MAX_HEIGHT,
    maxHeight: X_AXIS_LABEL_MAX_HEIGHT,
  });
}

/** Pin the plot-area height after layout so both X axes sit on the same baseline. */
function syncPlotBaselines(root: am5.Root, charts: am5xy.XYChart[]) {
  lockChartLayoutBands(charts);
  root.events.once("frameended", () => {
    lockChartLayoutBands(charts);
    const plotHeights = charts.map((chart) => chart.yAxesAndPlotContainer.height());
    const maxPlotHeight = Math.max(...plotHeights);
    if (maxPlotHeight <= 0) return;
    for (const chart of charts) {
      chart.yAxesAndPlotContainer.setAll({ height: maxPlotHeight });
    }
  });
}

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
  const { t } = useTranslation();
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

    const root = am5.Root.new(containerId, {
      tooltipContainerBounds: TOOLTIP_CONTAINER_BOUNDS,
    });
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    // Thousand separator only — no k / M suffix.
    root.numberFormatter.setAll({ numberFormat: "#,###." });
    root.container.setAll({ paddingTop: CHART_HEADER_HEADROOM });

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
        height: am5.p100,
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        // Keep each side's tooltip on its own side; the default arranges (stacks)
        // overlapping tooltips, which overrides their pointerOrientation.
        arrangeTooltips: false,
        paddingTop: 0,
        paddingBottom: 4,
      })
    );

    // Male/female series are auto-colored via the ColorSet's next(); step it so
    // they match the corner labels, which look up colors via getPaletteColor.
    applyChartColorStep(pyramidChart.get("colors"));

    pyramidChart.topAxesContainer.setAll({
      marginTop: -CHART_HEADER_HEADROOM,
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: TOP_HEADER_HEIGHT,
      maxHeight: TOP_HEADER_HEIGHT,
    });

    const pyramidHeader = pyramidChart.topAxesContainer.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        layout: root.verticalLayout,
      })
    );

    // Spacer matching the timeline chart's cursor-hint band so both chart titles
    // (and the plot areas below) stay on the same level.
    pyramidHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: CURSOR_HINT_BAND_HEIGHT,
      })
    );

    const pyramidTitleBand = pyramidHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: CHART_TITLE_BAND_HEIGHT,
      })
    );

    const pyramidTitle = pyramidTitleBand.children.push(
      am5.Label.new(root, {
        text: "",
        fontSize: 20,
        x: am5.p50,
        centerX: am5.p50,
        y: am5.p50,
        centerY: am5.p50,
        // A long frame title (e.g. an area/day name) would stretch the header; cap + wrap it.
        maxWidth: 250,
        oversizedBehavior: "wrap",
        textAlign: "center",
      })
    );

    const genderRow = pyramidHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: GENDER_LABEL_BAND_HEIGHT,
        layout: root.horizontalLayout,
      })
    );

    const femaleCornerLabel = genderRow.children.push(
      am5.Label.new(root, {
        text: configRef.current.femaleLabel,
        fontSize: 20,
        width: am5.p50,
        textAlign: "left",
        fill: getPaletteColor(pyramidChart.get("colors")!, 1),
        background: am5.RoundedRectangle.new(root, { fill: am5.color(0xffffff), fillOpacity: 0.5 }),
      })
    );

    const maleCornerLabel = genderRow.children.push(
      am5.Label.new(root, {
        text: configRef.current.maleLabel,
        fontSize: 20,
        width: am5.p50,
        textAlign: "right",
        fill: getPaletteColor(pyramidChart.get("colors")!, 0),
        background: am5.RoundedRectangle.new(root, { fill: am5.color(0xffffff), fillOpacity: 0.5 }),
      })
    );

    const pyramidXRenderer = am5xy.AxisRendererX.new(root, {
      minGridDistance: 50,
      strokeOpacity: 0.1,
    });
    pyramidXRenderer.labels.template.setAll({
      centerY: am5.p0,
      paddingTop: 4,
    });
    const pyramidXAxis = pyramidChart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        min: -200000,
        max: 200000,
        strictMinMax: true,
        renderer: pyramidXRenderer,
        tooltip: am5.Tooltip.new(root, {}),
      })
    );
    syncBottomXAxisBand(pyramidChart, pyramidXAxis);

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

    // Long age labels would eat the plot width (hiding the pyramid); cap + wrap them as in the
    // other charts. The full text stays in the tooltip.
    yRenderer.labels.template.setAll({
      maxWidth: 100,
      oversizedBehavior: "wrap",
      fontSize: "12px",
      centerY: am5.p50,
      textAlign: "center",
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
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}     [bold]{male.formatNumber('#.###')}[/]",
          // Male bars sit on the right; pointer on the tooltip's left edge keeps the box to the right.
          pointerOrientation: "left",
        }),
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
        tooltip: am5.Tooltip.new(root, {
          labelText: "{categoryY}     [bold]{femaleAbs.formatNumber('#.###')}[/]",
          // Female bars sit on the left; pointer on the tooltip's right edge keeps the box to the left.
          pointerOrientation: "right",
        }),
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
        height: am5.p100,
        panX: false,
        panY: false,
        wheelX: "none",
        wheelY: "none",
        layout: root.verticalLayout,
        paddingTop: 0,
        paddingBottom: 4,
      })
    );

    // Timeline male/female series are also auto-colored; keep them stepped in
    // sync with the pyramid so the same gender keeps the same color.
    applyChartColorStep(popChart.get("colors"));

    popChart.topAxesContainer.setAll({
      marginTop: -CHART_HEADER_HEADROOM,
      paddingTop: 0,
      paddingBottom: 0,
      minHeight: TOP_HEADER_HEIGHT,
      maxHeight: TOP_HEADER_HEIGHT,
    });

    const popHeader = popChart.topAxesContainer.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        layout: root.verticalLayout,
      })
    );

    const popHintBand = popHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: CURSOR_HINT_BAND_HEIGHT,
      })
    );

    popHintBand.children.push(
      am5.Label.new(root, {
        text: t(CURSOR_HINT),
        x: am5.p50,
        centerX: am5.p50,
        y: am5.p50,
        centerY: am5.p50,
        fontSize: 11,
      })
    );

    const popTitleBand = popHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: CHART_TITLE_BAND_HEIGHT,
      })
    );

    const popTitle = popTitleBand.children.push(
      am5.Label.new(root, {
        text: configRef.current.timelineTitle,
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

    // Spacer matching the pyramid gender-label row so plot areas stay aligned.
    popHeader.children.push(
      am5.Container.new(root, {
        width: am5.p100,
        height: GENDER_LABEL_BAND_HEIGHT,
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
      // Tilt the (often long) frame labels 45° so they don't overlap; cap + wrap as in the
      // other charts so they don't eat the plot height. The full text stays in the tooltip.
      popXRenderer.labels.template.setAll({
        rotation: -45,
        centerY: am5.p0,
        centerX: am5.p100,
        paddingTop: 8,
        maxWidth: 200,
        oversizedBehavior: "wrap",
        textAlign: "center",
      });
      const popXAxis = popChart.xAxes.push(
        am5xy.CategoryAxis.new(root, {
          categoryField: FRAME_LABEL_FIELD,
          renderer: popXRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      syncBottomXAxisBand(popChart, popXAxis);

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
          tooltip: am5.Tooltip.new(root, { pointerOrientation: "vertical" }),
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
      const popXRenderer = am5xy.AxisRendererX.new(root, { minGridDistance: 40 });
      popXRenderer.labels.template.setAll({
        centerY: am5.p0,
        paddingTop: 4,
      });
      const popXAxis = popChart.xAxes.push(
        am5xy.DateAxis.new(root, {
          maxDeviation: 0.1,
          groupData: false,
          baseInterval: { timeUnit: "year", count: 1 },
          renderer: popXRenderer,
          tooltip: am5.Tooltip.new(root, {}),
        })
      );
      syncBottomXAxisBand(popChart, popXAxis);

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
      male.fills.template.setAll({
        visible: true,
        fillOpacity: 0.5,
        templateField: "lineSettings",
      });

      const female = popChart.series.push(
        am5xy.LineSeries.new(root, {
          minBulletDistance: 10,
          xAxis: popXAxis,
          yAxis: popYAxis,
          valueYField: "female",
          valueXField: "date",
          stacked: true,
          tooltip: am5.Tooltip.new(root, { pointerOrientation: "vertical" }),
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
      syncPlotBaselines(root, [pyramidChart, popChart]);
    }

    applyDataRef.current = applyData;
    applyData();
    lockChartLayoutBands([pyramidChart, popChart]);

    popSeriesMale.appear(1000, 100);
    popChart.appear(1000, 100);
    pyramidChart.appear(1000, 100);
    syncPlotBaselines(root, [pyramidChart, popChart]);

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
    <div className="overflow-visible">
      <div id={containerId} style={{ width: "100%", height: "512px" }} />
    </div>
  );
}

export default HistoricalPopulationPyramidChart;
