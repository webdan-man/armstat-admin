import { useEffect, useLayoutEffect, useRef } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataItem {
  category: string;
  value: number;
}

interface SemiCircleChartProps {
  data: DataItem[];
  /** Optional title shown above the chart. Only passed in map+chart combinations. */
  chartTitle?: string;
}

const containerId = "semi-pie-chartdiv";

function SemiCircleChart({ data, chartTitle }: SemiCircleChartProps) {
  const rootRef = useRef<am5.Root | null>(null);
  const seriesRef = useRef<am5percent.PieSeries | null>(null);
  const titleLabelRef = useRef<am5.Label | null>(null);

  useLayoutEffect(() => {
    // Create chart once; otherwise amCharts replays intro animations on every data update.
    if (rootRef.current) return;

    const root = am5.Root.new(containerId);
    rootRef.current = root;

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        startAngle: 180,
        endAngle: 360,
        innerRadius: am5.percent(50),
        paddingLeft: 100,
        paddingRight: 100,
      })
    );

    const series = chart.series.push(
      am5percent.PieSeries.new(root, {
        startAngle: 180,
        endAngle: 360,
        valueField: "value",
        categoryField: "category",
        alignLabels: false,
      })
    );
    seriesRef.current = series;

    series.labels.template.setAll({
      text: "{category} - {valuePercentTotal.formatNumber('0.0')}%",
      inside: false,
      radius: 10,
    });

    series.slices.template.setAll({
      cornerRadius: 5,
      tooltipText: "{category} - {value}",
    });

    if (chartTitle !== undefined) {
      titleLabelRef.current = chart.children.unshift(
        am5.Label.new(root, {
          text: chartTitle,
          fontSize: 16,
          fontWeight: "500",
          centerX: am5.p50,
          x: am5.p50,
        })
      );
    }

    // Run the intro animation only once on mount.
    series.data.setAll(data);
    series.appear();

    return () => {
      rootRef.current = null;
      seriesRef.current = null;
      titleLabelRef.current = null;
      root.dispose();
    };
  }, []);

  useEffect(() => {
    seriesRef.current?.data.setAll(data);
  }, [data]);

  useEffect(() => {
    if (chartTitle === undefined) return;
    titleLabelRef.current?.set("text", chartTitle);
  }, [chartTitle]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default SemiCircleChart;
