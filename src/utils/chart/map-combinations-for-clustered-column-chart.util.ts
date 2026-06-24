import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";

export const mapCombinationsForClusteredColumnChart = (payload: {
  combinations: MetricCombination[];
  xAxisAttributeId: Attribute["_id"];
  yAxisAttributeId: Attribute["_id"];
  xAxisKey: string;
  /**
   * Skip the auto-transpose below. Use when the caller needs a fixed orientation —
   * e.g. the `xAxisAttributeId` must stay on the x-axis even when there are more
   * x categories than series keys.
   */
  disableAutoTranspose?: boolean;
}) => {
  const { combinations, xAxisAttributeId, yAxisAttributeId, xAxisKey, disableAutoTranspose } =
    payload;

  // Default orientation produced by this mapper:
  // - X axis: many categories (e.g. `other`)
  // - Series: few keys (e.g. "Քաղաք"/"Գյուղ")
  //
  // For some metrics we need the opposite:
  // - X axis: the few keys (e.g. "Քաղաք"/"Գյուղ") => 2 columns/groups
  // - Series: the many categories (e.g. each "other" label)
  //
  // So we build the default map, then auto-transpose when it matches that pattern.
  const resultMap: Record<string, Record<string, string | number>> = {};
  const seriesKeys: string[] = [];

  for (const item of combinations) {
    const xAxisTitle = item.row.find((r) => r.attributeId === xAxisAttributeId)?.value.title as
      | string
      | undefined;
    const yAxisTitle = item.row.find((r) => r.attributeId === yAxisAttributeId)?.value.title as
      | string
      | undefined;

    if (!xAxisTitle || !yAxisTitle) continue;

    const seriesKey = yAxisTitle;
    if (!seriesKeys.includes(seriesKey)) seriesKeys.push(seriesKey);

    const value = Number(String(item.value).replace(/,/g, ""));

    if (!resultMap[xAxisTitle]) {
      resultMap[xAxisTitle] = { [xAxisKey]: xAxisTitle };
    }

    resultMap[xAxisTitle][seriesKey] = value;
  }

  const data = Object.values(resultMap);

  // If we have many x categories but only a few series keys (typically 2),
  // transpose so the chart shows 2 grouped columns with many inner columns.
  const uniqueX = new Set(data.map((d) => d?.[xAxisKey]).filter(Boolean));
  if (!disableAutoTranspose && uniqueX.size > seriesKeys.length && seriesKeys.length >= 2) {
    const categories: string[] = [];
    const seen = new Set<string>();

    for (const row of data) {
      const label = row?.[xAxisKey];
      if (typeof label !== "string" || !label.trim()) continue;
      if (seen.has(label)) continue;
      seen.add(label);
      categories.push(label);
    }

    const newXAxisKey = "__group__";

    const transposed = seriesKeys.map((groupKey) => {
      const out: Record<string, string | number> = { [newXAxisKey]: groupKey };

      for (const row of data) {
        const category = row?.[xAxisKey];
        if (typeof category !== "string" || !category.trim()) continue;

        const v = row?.[groupKey];
        out[category] = typeof v === "number" ? v : Number(v ?? 0);
      }

      return out;
    });

    return {
      data: transposed,
      seriesKeys: categories,
      xAxisKey: newXAxisKey,
    };
  }

  return {
    data,
    seriesKeys,
  };
};
