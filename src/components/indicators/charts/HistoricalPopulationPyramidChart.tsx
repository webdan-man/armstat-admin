import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5xy from "@amcharts/amcharts5/xy";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

type ChartDatum = Record<string, string | number>;

interface HistoricalPopulationPyramidChartProps<T extends ChartDatum> {}

const containerId = "historical-pyramid-chartdiv";

function HistoricalPopulationPyramidChart<
  T extends ChartDatum,
>({}: HistoricalPopulationPyramidChartProps<T>) {
  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "550px" }} />
    </div>
  );
}

export default HistoricalPopulationPyramidChart;
