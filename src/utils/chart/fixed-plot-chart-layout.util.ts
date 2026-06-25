import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

export const PLOT_HEIGHT = 350;
export const CHART_TOP_PADDING = 10;
export const LEGEND_BLOCK_HEIGHT = 130;
export const CHART_HEADER_HEADROOM = 24;
/** Gap between chart and an external legend when x-axis labels overflow downward. */
export const LEGEND_OVERFLOW_PADDING = 40;

export function lockPlotHeight(chart: am5xy.XYChart, plotHeight = PLOT_HEIGHT) {
  chart.plotContainer.setAll({
    height: plotHeight,
    minHeight: plotHeight,
    maxHeight: plotHeight,
  });
  chart.yAxesAndPlotContainer.setAll({
    height: plotHeight,
    minHeight: plotHeight,
    maxHeight: plotHeight,
  });
}

type SetupDynamicChartHeightOptions = {
  root: am5.Root;
  chart: am5xy.XYChart;
  xAxis: am5xy.Axis<am5xy.AxisRenderer>;
  getContainerEl: () => HTMLDivElement | null;
  plotHeight?: number;
  /** Extra pixels inside the chart below the x-axis band (e.g. an in-chart legend row). */
  getExtraChartHeight?: () => number;
  /** Pixels below the chart area (legend bar, margins, etc.). */
  getBelowChartHeight: () => number;
  /** Pixels above the chart area (title label, header headroom, etc.). */
  getAboveChartHeight?: () => number;
  /** Extra sprites whose height changes should trigger a layout pass. */
  heightWatchers?: am5.Sprite[];
  /** Safety buffer added to the outer container height. */
  bottomBuffer?: number;
};

/** Keep plot at a fixed height; grow chart + container when x-axis labels need more room. */
export function setupDynamicChartHeight({
  root,
  chart,
  xAxis,
  getContainerEl,
  plotHeight = PLOT_HEIGHT,
  getExtraChartHeight = () => 0,
  getBelowChartHeight,
  getAboveChartHeight = () => 0,
  heightWatchers = [],
  bottomBuffer = 0,
}: SetupDynamicChartHeightOptions) {
  const adjustChartHeight = () => {
    lockPlotHeight(chart, plotHeight);

    const xAxisHeight = xAxis.height();
    if (xAxisHeight <= 0) return;

    const scrollbar = chart.get("scrollbarX") as am5.Scrollbar | undefined;
    const scrollbarHeight = scrollbar?.height() || 0;

    const chartHeight = Math.ceil(
      plotHeight + xAxisHeight + CHART_TOP_PADDING + scrollbarHeight + getExtraChartHeight()
    );
    chart.set("height", chartHeight);

    const containerEl = getContainerEl();
    if (!containerEl) return;

    const total = Math.ceil(
      getAboveChartHeight() + chartHeight + getBelowChartHeight() + bottomBuffer
    );
    const current = parseFloat(containerEl.style.height) || 0;
    if (Math.abs(current - total) > 1) {
      containerEl.style.height = `${total}px`;
    }
  };

  const disposers = [
    xAxis.onPrivate("height", adjustChartHeight),
    ...heightWatchers.map((sprite) => sprite.onPrivate("height", adjustChartHeight)),
  ];
  const frameEndedDisposer = root.events.on("frameended", adjustChartHeight);
  adjustChartHeight();

  return () => {
    for (const disposer of disposers) {
      disposer.dispose();
    }
    frameEndedDisposer.dispose();
  };
}

type SetupDualChartDynamicHeightOptions = {
  root: am5.Root;
  charts: am5xy.XYChart[];
  xAxes: am5xy.Axis<am5xy.AxisRenderer>[];
  getContainerEl: () => HTMLDivElement | null;
  plotHeight?: number;
  getBelowRootHeight?: () => number;
  getAboveChartHeight?: () => number;
  heightWatchers?: am5.Sprite[];
  bottomBuffer?: number;
};

/** Keep two side-by-side charts aligned with a shared fixed plot height. */
export function setupDualChartDynamicHeight({
  root,
  charts,
  xAxes,
  getContainerEl,
  plotHeight = PLOT_HEIGHT,
  getBelowRootHeight = () => 0,
  getAboveChartHeight = () => 0,
  heightWatchers = [],
  bottomBuffer = 0,
}: SetupDualChartDynamicHeightOptions) {
  const adjustChartHeight = () => {
    for (const chart of charts) {
      lockPlotHeight(chart, plotHeight);
    }

    const xAxisHeight = Math.max(...xAxes.map((axis) => axis.height()));
    if (xAxisHeight <= 0) return;

    const scrollbarHeight = Math.max(
      ...charts.map((chart) => (chart.get("scrollbarX") as am5.Scrollbar | undefined)?.height() || 0)
    );

    const chartHeight = Math.ceil(plotHeight + xAxisHeight + CHART_TOP_PADDING + scrollbarHeight);
    for (const chart of charts) {
      chart.set("height", chartHeight);
    }

    const containerEl = getContainerEl();
    if (!containerEl) return;

    const total = Math.ceil(
      getAboveChartHeight() + chartHeight + getBelowRootHeight() + bottomBuffer
    );
    const current = parseFloat(containerEl.style.height) || 0;
    if (Math.abs(current - total) > 1) {
      containerEl.style.height = `${total}px`;
    }
  };

  const disposers = [
    ...xAxes.map((axis) => axis.onPrivate("height", adjustChartHeight)),
    ...heightWatchers.map((sprite) => sprite.onPrivate("height", adjustChartHeight)),
  ];
  const frameEndedDisposer = root.events.on("frameended", adjustChartHeight);
  adjustChartHeight();

  return () => {
    for (const disposer of disposers) {
      disposer.dispose();
    }
    frameEndedDisposer.dispose();
  };
}
