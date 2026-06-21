import * as am5 from "@amcharts/amcharts5";

/**
 * Per-chart ordered list of series keys -> their palette slot is the position in
 * this list. Kept at module scope so it survives the chart unmounting (which
 * happens when its attribute is fully unselected), so re-selecting options one
 * by one keeps the colors that the original all-selected palette assigned.
 *
 * Keyed by a caller-supplied namespace (the chart's container id) so each chart
 * keeps its own palette.
 *
 * The order is re-based whenever a key that isn't already placed shows up (a new
 * or expanded dataset). Without that, the list would accumulate keys from every
 * dataset/metric ever rendered into the same container — and from the
 * intermediate key sets produced while data streams in — pushing later keys to
 * ever higher palette indices and giving "random" colors on first render that
 * only a full reload (which clears this module state) fixed. Narrowing to a
 * subset keeps the existing order, so toggling a selection off and back on
 * restores each key's original color.
 */
const orderByNamespace = new Map<string, string[]>();

/**
 * A private ColorSet per namespace that nothing but this module ever touches.
 *
 * The amCharts default palette is a *single* base color; every further color is
 * generated on demand by `ColorSet.generateColors()`, which is coupled to a
 * mutable `currentPass` counter. The chart resets that counter inside
 * `XYChart._applyThemes` (via `colorSet.reset()`) *without* clearing the colors
 * it already generated, which can desync the generated colors from their index.
 * Owning an isolated ColorSet that is never `reset()` nor advanced via `next()`
 * keeps `getIndex(i)` deterministic.
 */
const colorSetByNamespace = new Map<string, am5.ColorSet>();

function getStableColorSet(namespace: string, source: am5.ColorSet): am5.ColorSet {
  const existing = colorSetByNamespace.get(namespace);
  if (existing && !existing.isDisposed()) return existing;

  const colorSet = am5.ColorSet.new(source.root, {
    colors: source.get("colors")?.slice(),
    baseColor: source.get("baseColor"),
    passOptions: source.get("passOptions"),
    step: source.get("step"),
    reuse: source.get("reuse"),
    startIndex: source.get("startIndex"),
    saturation: source.get("saturation"),
  });
  colorSetByNamespace.set(namespace, colorSet);
  return colorSet;
}

/**
 * Returns the palette order for `seriesKeys`, re-basing it when the dataset grows
 * or changes (see {@link orderByNamespace}).
 */
function getPaletteOrder(namespace: string, seriesKeys: string[]): string[] {
  const order = orderByNamespace.get(namespace);
  const hasUnplacedKey = !order || seriesKeys.some((key) => !order.includes(key));
  if (hasUnplacedKey) {
    const next = [...seriesKeys];
    orderByNamespace.set(namespace, next);
    return next;
  }
  return order;
}

/**
 * Returns a color for a series key that stays the same regardless of how many
 * options are selected or the order they're (re)selected in, while still
 * following the natural palette order for the currently rendered dataset.
 *
 * `seriesKeys` must be the full set of keys for the current render so the
 * palette can be re-based when the dataset changes.
 */
export function getStableSeriesColor(
  namespace: string,
  colors: am5.ColorSet | undefined,
  key: string,
  seriesKeys: string[]
): am5.Color {
  if (!colors) return am5.color(0x000000);

  const order = getPaletteOrder(namespace, seriesKeys);
  const index = order.indexOf(key);
  return getStableColorSet(namespace, colors).getIndex(index < 0 ? order.length : index);
}
