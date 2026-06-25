import * as am5 from "@amcharts/amcharts5";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

/**
 * Vivid rainbow palette — distinct hues across the spectrum for series/columns.
 * Cycles when there are more data points than colors.
 */
const CHART_RAINBOW_HEX = [
  0xe40303, 0xff6900, 0xffd800, 0x00a81c, 0x00b4d8, 0x0047ab, 0x7b2cbf, 0xc9184a, 0xff595e,
  0xffca3a, 0x8ac926, 0x1982c4, 0x6a4c93, 0xff6d00, 0x9b5de5, 0x00bbf9, 0x06d6a0, 0xf15bb5,
  0xef476f, 0x118ab2,
] as const;

const RAINBOW_COLOR_STEP = 1;

export function getChartPaletteColors(): am5.Color[] {
  return CHART_RAINBOW_HEX.map((hex) => am5.color(hex));
}

function createChartPaletteTheme(root: am5.Root): am5.Theme {
  const theme = am5.Theme.new(root);
  theme.rule("ColorSet").setAll({
    colors: getChartPaletteColors(),
    reuse: true,
    step: RAINBOW_COLOR_STEP,
  });
  return theme;
}

/** Animated transitions + rainbow ColorSet for charts that opt in via this helper. */
export function setChartThemes(root: am5.Root): void {
  root.setThemes([am5themes_Animated.new(root), createChartPaletteTheme(root)]);
}

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

/** Rainbow palette lookup — use with {@link setChartThemes} on the same chart root. */
export function getRainbowPaletteColor(colors: am5.ColorSet, index: number): am5.Color;
export function getRainbowPaletteColor(
  colors: am5.ColorSet | undefined,
  index: number
): am5.Color | undefined;
export function getRainbowPaletteColor(
  colors: am5.ColorSet | undefined,
  index: number
): am5.Color | undefined {
  return colors?.getIndex(index * RAINBOW_COLOR_STEP);
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
