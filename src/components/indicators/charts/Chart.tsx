"use client";

import SemiCircleChart from "@/components/indicators/charts/SemiCircleChart";
import type { MetricCombination } from "@/types/metric";
import { useChart } from "@/hooks/useChart";
import LineGraphChart from "@/components/indicators/charts/LineGraph";

interface ChartProps {
  combinations?: MetricCombination[];
}

const Chart = ({ combinations = [] }: ChartProps) => {
  const { type: chartType, data } = useChart({
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
    case "pie":
      return <div />;
    case "bar":
    default:
      return <div />;
  }
};

export default Chart;
