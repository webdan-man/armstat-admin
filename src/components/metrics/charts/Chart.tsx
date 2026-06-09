"use client";

import SemiCircleChart from "@/components/metrics/charts/SemiCircleChart";
import type { MetricCombination } from "@/types/metric";
import { useChart } from "@/hooks/useChart";
import LineGraphChart from "@/components/metrics/charts/LineGraphChart";
import ArmeniaProvincesMap from "@/components/metrics/charts/Map/MapChart";
import ColumnWithRotatedLabelsChart from "@/components/metrics/charts/ColumnWithRotatedLabelsChart";
import StackedAreaChart from "@/components/metrics/charts/StackedAreaChart";
import StackedColumnChart from "@/components/metrics/charts/StackedColumnChart";
import StackedBartWithNegativeValuesChart from "@/components/metrics/charts/StackedBartWithNegativeValuesChart";
import HistoricalPopulationPyramidChart from "@/components/metrics/charts/HistoricalPopulationPyramidChart";
import ClusteredColumnChart from "@/components/metrics/charts/ClusteredColumnChart";
import StackedAndClusteredColumnChart from "@/components/metrics/charts/StackedAndClusteredColumnChart";
import MapAndSemiPieChart from "@/components/metrics/charts/MapAndSemiPieChart";
import MapAndLineGraphChart from "@/components/metrics/charts/MapAndLineGraphChart";
import MapAndColumnWithRotatedLabelsChart from "@/components/metrics/charts/MapAndColumnWithRotatedLabelsChart";
import MapAndStackedAreaChart from "@/components/metrics/charts/MapAndStackedAreaChart";
import MapAndStackedColumnChart from "@/components/metrics/charts/MapAndStackedColumnChart";
import MapAndStackedBarWithNegativeValuesChart from "@/components/metrics/charts/MapAndStackedBarWithNegativeValuesChart";
import MapAndClusteredColumnChart from "@/components/metrics/charts/MapAndClusteredColumnChart";
import GroupedStackedColumnChart from "@/components/metrics/charts/GroupedStackedColumnChart";
import MapAndGroupedStackedColumnChart from "@/components/metrics/charts/MapAndGroupedStackedColumnChart";
import { useTranslation } from "@/hooks/useTranslation";

interface ChartProps {
  combinations?: MetricCombination[];
}

const Chart = ({ combinations = [] }: ChartProps) => {
  const { t } = useTranslation();
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
    timelineMode,
  } = useChart({
    combinations,
  });
  const noChartMessage = (
    <div className="text-textBlack600 flex flex-col gap-1">
      <p>{t("stat.chart_unavailable_line1")}</p>
      <p>{t("stat.chart_unavailable_line2")}</p>
    </div>
  );
  console.log(chartType);

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
            timelineMode={timelineMode}
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
              timelineMode={timelineMode}
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
      return <MapAndGroupedStackedColumnChart combinations={combinations} data={data} />;
    case "bar":
      return noChartMessage;
    case "pie":
      return noChartMessage;
    default:
      return noChartMessage;
  }
};

export default Chart;
