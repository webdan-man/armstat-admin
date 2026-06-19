import * as am5 from "@amcharts/amcharts5";

/**
 * Per-chart registry of series-key -> palette index, kept at module scope so it
 * survives the chart unmounting (which happens when its attribute is fully
 * unselected). Without this, reselecting options one by one would assign colors
 * in selection order and no longer match the original all-selected palette.
 *
 * Keyed by a caller-supplied namespace (the chart's container id) so each chart
 * keeps its own palette.
 */
const paletteIndexByNamespace = new Map<string, Map<string, number>>();

/**
 * Returns a color for a series key that stays the same regardless of how many
 * options are selected, the order they're (re)selected in, or whether the chart
 * has been unmounted and remounted in between.
 *
 * A key keeps the palette slot it was first assigned, so colors line up with the
 * initial all-selected state and a re-selected key gets its original color back.
 */
export function getStableSeriesColor(
  namespace: string,
  colors: am5.ColorSet | undefined,
  key: string
): am5.Color {
  let indexByKey = paletteIndexByNamespace.get(namespace);
  if (!indexByKey) {
    indexByKey = new Map();
    paletteIndexByNamespace.set(namespace, indexByKey);
  }

  let index = indexByKey.get(key);
  if (index === undefined) {
    // First time we see this key: give it the next free palette slot.
    // ColorSet.getIndex generates colors past the base palette as needed.
    index = indexByKey.size;
    indexByKey.set(key, index);
  }

  return colors?.getIndex(index) ?? am5.color(0x000000);
}
