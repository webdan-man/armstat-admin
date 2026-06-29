import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";

export const COLUMN_SERIES_TOOLTIP_LABEL = "{name}     [bold]{valueY}[/]";

const COLUMN_TOOLTIP_MAX_WIDTH = 250;
/** Offset tooltip down into the hovered column (px). */
const COLUMN_TOOLTIP_Y = 71.2;

function styleColumnTooltip(tooltip: am5.Tooltip): void {
  tooltip.setAll({ autoTextColor: true });
  tooltip.label.setAll({
    maxWidth: COLUMN_TOOLTIP_MAX_WIDTH,
    oversizedBehavior: "wrap",
    textAlign: "left",
  });
}

/**
 * Per-column tooltip (only the hovered bar). Uses `tooltipText` on the column
 * template so amCharts attaches one tooltip per bar — not a series-level tooltip
 * that would show every cluster at once.
 */
export function attachColumnSeriesTooltip(
  series: am5xy.ColumnSeries,
  labelText: string = COLUMN_SERIES_TOOLTIP_LABEL
): void {
  series.columns.template.setAll({
    tooltipText: labelText,
    tooltipY: COLUMN_TOOLTIP_Y,
  });

  series.columns.template.adapters.add("tooltip", (tooltip) => {
    if (tooltip) styleColumnTooltip(tooltip);
    return tooltip;
  });
}
