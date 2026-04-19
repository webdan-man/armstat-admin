"use client";

import SemiCircleChart from "@/components/indicators/charts/SemiCircleChart";
import type { MetricCombination } from "@/types/metric";
import { useChart } from "@/hooks/useChart";
import LineGraphChart from "@/components/indicators/charts/LineGraphChart";
import ArmeniaProvincesMap from "@/components/indicators/charts/Map/MapChart";
import ColumnWithRotatedLabelsChart from "@/components/indicators/charts/ColumnWithRotatedLabelsChart";
import StackedAreaChart from "@/components/indicators/charts/StackedAreaChart";

interface ChartProps {
  combinations?: MetricCombination[];
}

const Chart = ({ combinations = [] }: ChartProps) => {
  const {
    type: chartType,
    data,
    xKey,
    seriesKeys,
  } = useChart({
    combinations,
  });

  switch (chartType) {
    case "semi-pie":
      return (
        <div>
          Semi-Circle Pie Chart
          <SemiCircleChart data={data} />
        </div>
      );
    case "line-graph":
      return (
        <div>
          Line graph Chart
          <LineGraphChart data={data} />
        </div>
      );
    case "armenia-map-provinces":
      return (
        <div>
          ArmeniaProvincesMap
          <ArmeniaProvincesMap data={data} />
        </div>
      );
    case "column-with-rotated-labels":
      return (
        <div>
          ColumnWithRotatedLabelsChart
          <ColumnWithRotatedLabelsChart data={data} />
        </div>
      );
    case "stacked-area-chart":
      return (
        <div>
          StackedAreaChart
          <StackedAreaChart data={data} xKey={xKey} seriesKeys={seriesKeys} />
        </div>
      );
    case "bar":
      return <div>bar</div>;
    case "pie":
      return <div>pie</div>;
    default:
      return <div>default</div>;
  }
};

export default Chart;
