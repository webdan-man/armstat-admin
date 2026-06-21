import * as am5 from "@amcharts/amcharts5";

/**
 * Step between adjacent palette colors.
 *
 * The amCharts default ColorSet has a single base color and generates the rest by
 * shifting hue a small amount per step (~0.05), so consecutive series end up with
 * very similar colors. We bump the step by 1 (from amCharts' default of 1 to 2) so
 * adjacent series are spread further apart on the color wheel and easier to tell
 * apart.
 *
 * All chart color lookups go through {@link getPaletteColor} so this stays
 * consistent across every chart.
 */
export const CHART_COLOR_STEP = 2;

/**
 * Returns the palette color for a logical series/category index, applying
 * {@link CHART_COLOR_STEP} so colors are spaced further apart than amCharts'
 * default. Use this instead of calling `colorSet.getIndex(index)` directly.
 */
export function getPaletteColor(colors: am5.ColorSet, index: number): am5.Color;
export function getPaletteColor(
  colors: am5.ColorSet | undefined,
  index: number
): am5.Color | undefined;
export function getPaletteColor(
  colors: am5.ColorSet | undefined,
  index: number
): am5.Color | undefined {
  return colors?.getIndex(index * CHART_COLOR_STEP);
}

/**
 * Applies {@link CHART_COLOR_STEP} to a chart's ColorSet so series that amCharts
 * auto-colors (via `colorSet.next()`, e.g. pie slices or series whose `fill` we
 * don't set explicitly) are spaced the same way as colors looked up through
 * {@link getPaletteColor}. `getIndex` ignores `step`, so without this the two
 * paths would drift apart once the step is bumped.
 *
 * Call once in a chart's init, after the chart is created.
 */
export function applyChartColorStep(colors: am5.ColorSet | undefined): void {
  colors?.set("step", CHART_COLOR_STEP);
}
