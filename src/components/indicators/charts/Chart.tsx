"use client";

import SemiCircleChart from "@/components/indicators/charts/SemiCircleChart";
import type { MetricCombination } from "@/types/metric";
import { useChart } from "@/hooks/useChart";
import LineGraphChart from "@/components/indicators/charts/LineGraphChart";
import ArmeniaProvincesMap from "@/components/indicators/charts/Map/MapChart";
import ColumnWithRotatedLabelsChart from "@/components/indicators/charts/ColumnWithRotatedLabelsChart";
import StackedAreaChart from "@/components/indicators/charts/StackedAreaChart";
import StackedColumnChart from "@/components/indicators/charts/StackedColumnChart";
import StackedBartWithNegativeValuesChart from "@/components/indicators/charts/StackedBartWithNegativeValuesChart";
import HistoricalPopulationPyramidChart from "@/components/indicators/charts/HistoricalPopulationPyramidChart";
import ClusteredColumnChart from "@/components/indicators/charts/ClusteredColumnChart";
import StackedAndClusteredColumnChart from "@/components/indicators/charts/StackedAndClusteredColumnChart";
import MapAndSemiPieChart from "@/components/indicators/charts/MapAndSemiPieChart";
import MapAndLineGraphChart from "@/components/indicators/charts/MapAndLineGraphChart";
import MapAndColumnWithRotatedLabelsChart from "@/components/indicators/charts/MapAndColumnWithRotatedLabelsChart";
import MapAndStackedAreaChart from "@/components/indicators/charts/MapAndStackedAreaChart";
import MapAndStackedColumnChart from "@/components/indicators/charts/MapAndStackedColumnChart";
import MapAndStackedBarWithNegativeValuesChart from "@/components/indicators/charts/MapAndStackedBarWithNegativeValuesChart";
import MapAndClusteredColumnChart from "@/components/indicators/charts/MapAndClusteredColumnChart";
import GroupedStackedColumnChart from "@/components/indicators/charts/GroupedStackedColumnChart";
import MapAndGroupedStackedColumnChart from "@/components/indicators/charts/MapAndGroupedStackedColumnChart";

interface ChartProps {
  combinations?: MetricCombination[];
}

const Chart = ({ combinations = [] }: ChartProps) => {
  const {
    type: chartType,
    data,
    xAxisKey,
    yAxisKey,
    seriesKeys,
    yAxisLabel,
    clusterKeys,
    stackKeys,
    timelineAxisAttributeName,
  } = useChart({
    combinations,
  });

  switch (chartType) {
    case "map-and-semi-pie":
      return <MapAndSemiPieChart combinations={combinations} data={data} />;
    case "map-and-line-graph":
      return <MapAndLineGraphChart combinations={combinations} data={data} />;
    case "map-and-stacked-area-chart":
      return <MapAndStackedAreaChart combinations={combinations} data={data} />;
    case "map-and-stacked-column-chart":
      return (
        <MapAndStackedColumnChart
          combinations={combinations}
          xAxisKey={xAxisKey as string}
          data={data}
        />
      );
    case "map-and-stacked-bar-with-negative-values":
      return <MapAndStackedBarWithNegativeValuesChart combinations={combinations} data={data} />;
    case "map-and-clustered-column-chart":
      return (
        <MapAndClusteredColumnChart
          combinations={combinations}
          xAxisKey={xAxisKey as string}
          data={data}
        />
      );
    case "map-and-column-with-rotated-labels":
      return <MapAndColumnWithRotatedLabelsChart combinations={combinations} data={data} />;
    case "semi-pie":
      return (
        <div>
          {/*Semi-Circle Pie Chart*/}
          <SemiCircleChart data={data} />
        </div>
      );
    case "line-graph":
      return (
        <div>
          {/*Line graph Chart*/}
          <LineGraphChart data={data} />
        </div>
      );
    case "armenia-map-provinces":
      return (
        <div>
          {/*ArmeniaProvincesMap*/}
          <ArmeniaProvincesMap data={data} />
        </div>
      );
    case "column-with-rotated-labels":
      return (
        <div>
          {/*ColumnWithRotatedLabelsChart*/}
          <ColumnWithRotatedLabelsChart data={data} />
        </div>
      );
    case "stacked-area-chart":
      return (
        <div>
          {/*StackedAreaChart*/}
          <StackedAreaChart data={data} xAxisKey={xAxisKey} seriesKeys={seriesKeys} />
        </div>
      );
    case "stacked-column-chart":
      return (
        <div>
          {/*StackedColumnChart - xAxisKey: {xAxisKey}, seriesKeys: {JSON.stringify(seriesKeys)}*/}
          <StackedColumnChart
            data={data}
            xAxisKey={xAxisKey as string}
            seriesKeys={seriesKeys}
            yAxisLabel={yAxisLabel}
          />
        </div>
      );
    case "stacked-bar-chart-with-negative-values":
      return (
        <div>
          {/*StackedBartWithNegativeValuesChart - yAxisKey: {yAxisKey}, seriesKeys:{" "}*/}
          {/*{JSON.stringify(seriesKeys)}*/}
          <StackedBartWithNegativeValuesChart
            data={data}
            yAxisKey={yAxisKey as string}
            seriesKeys={seriesKeys}
          />
        </div>
      );
    case "historical-population-pyramid":
      return (
        <div>

          <HistoricalPopulationPyramidChart
            data={data}
            seriesKeys={seriesKeys}
            timelineAxisAttributeName={timelineAxisAttributeName}
          />
        </div>
      );
    case "clustered-column-chart":
      return (
        <div>
          <ClusteredColumnChart
            xAxisKey={xAxisKey as string}
            data={data}
            seriesKeys={seriesKeys}
            stacked={false}
          />
        </div>
      );
    case "clustered-column-chart-stacked":
      return (
        <div>
          <StackedAndClusteredColumnChart
            xAxisKey={xAxisKey as string}
            data={data}
            clusterKeys={clusterKeys}
            stackKeys={stackKeys}
            seriesKeys={seriesKeys}
          />
        </div>
      );
    case "map-and-historical-population-pyramid":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <HistoricalPopulationPyramidChart
              data={data?.pyramidData ?? []}
              seriesKeys={seriesKeys}
              timelineAxisAttributeName={timelineAxisAttributeName}
            />
          </div>
          <div>
            <ArmeniaProvincesMap data={data?.mapData ?? []} />
          </div>
        </div>
      );
    case "map-and-clustered-column-chart-stacked":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <ClusteredColumnChart
              xAxisKey={xAxisKey as string}
              data={data?.columnData ?? []}
              seriesKeys={seriesKeys}
              stacked
            />
          </div>
          <div>
            <ArmeniaProvincesMap data={data?.mapData ?? []} />
          </div>
        </div>
      );
    case "semi-pie-and-clustered-column-chart-stacked":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <SemiCircleChart data={data?.semiPieData ?? []} />
          </div>
          <div>
            <ClusteredColumnChart
              xAxisKey={xAxisKey as string}
              data={data?.columnData ?? []}
              seriesKeys={seriesKeys}
              stacked
            />
          </div>
        </div>
      );
    case "line-graph-and-clustered-column-chart-stacked":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <LineGraphChart data={data?.lineData ?? []} />
          </div>
          <div>
            <ClusteredColumnChart
              xAxisKey={xAxisKey as string}
              data={data?.columnData ?? []}
              seriesKeys={seriesKeys}
              stacked
            />
          </div>
        </div>
      );
    case "line-graph-and-grouped-stacked-column-chart":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <LineGraphChart data={data?.lineData ?? []} />
          </div>
          <div>
            <GroupedStackedColumnChart
              data={data?.data ?? []}
              stackDimensions={data?.stackDimensions ?? []}
              innerAttributeName={data?.innerAttributeName ?? ""}
            />
          </div>
        </div>
      );
    case "column-with-rotated-labels-and-clustered-column-chart-stacked":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <ColumnWithRotatedLabelsChart data={data?.rotatedLabelsData ?? []} />
          </div>
          <div>
            <ClusteredColumnChart
              xAxisKey={xAxisKey as string}
              data={data?.columnData ?? []}
              seriesKeys={seriesKeys}
              stacked
            />
          </div>
        </div>
      );
    case "grouped-stacked-column-chart":
      return (
        <GroupedStackedColumnChart
          data={data?.data ?? []}
          stackDimensions={data?.stackDimensions ?? []}
          innerAttributeName={data?.innerAttributeName ?? ""}
        />
      );
    case "semi-pie-and-grouped-stacked-column-chart":
      return (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
          <div>
            <SemiCircleChart data={data?.semiPieData ?? []} />
          </div>
          <div>
            <GroupedStackedColumnChart
              data={data?.data ?? []}
              stackDimensions={data?.stackDimensions ?? []}
              innerAttributeName={data?.innerAttributeName ?? ""}
            />
          </div>
        </div>
      );
    case "map-and-grouped-stacked-column-chart":
      return (
        <MapAndGroupedStackedColumnChart
          combinations={combinations}
          data={data}
        />
      );
    case "bar":
      return <div className="text-textBlack600">bar</div>;
    case "pie":
      return <div className="text-textBlack600">pie</div>;
    default:
      return <div className="text-textBlack600">default</div>;
  }
};

export default Chart;
