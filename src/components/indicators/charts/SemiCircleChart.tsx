import { useLayoutEffect } from "react";
import * as am5 from "@amcharts/amcharts5";
import * as am5percent from "@amcharts/amcharts5/percent";
import am5themes_Animated from "@amcharts/amcharts5/themes/Animated";

interface DataItem {
  category: string;
  value: number;
}

interface SemiCircleChartProps {
  data: DataItem[];
  /** Shown above the chart (e.g. selected marz); defaults to whole-country label. */
  chartTitle?: string;
}

const containerId = "semi-pie-chartdiv";

function SemiCircleChart({ data, chartTitle = "Հայաստան" }: SemiCircleChartProps) {
  useLayoutEffect(() => {
    const root = am5.Root.new(containerId);

    root.setThemes([am5themes_Animated.new(root)]);

    const chart = root.container.children.push(
      am5percent.PieChart.new(root, {
        startAngle: 180,
        endAngle: 360,
        innerRadius: am5.percent(50),
        paddingLeft: 50,
        paddingRight: 50,
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

    series.labels.template.setAll({
      text: "{category} - {valuePercentTotal.formatNumber('0.0')}%",
      inside: false,
      radius: 10,
    });

    series.slices.template.setAll({
      cornerRadius: 5,
      tooltipText: "{category} - {value}",
    });

    chart.children.unshift(
      am5.Label.new(root, {
        text: chartTitle,
        fontSize: 16,
        fontWeight: "500",
        centerX: am5.p50,
        x: am5.p50,
      })
    );

    series.data.setAll(data);

    series.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, [data, chartTitle]);

  return (
    <div>
      <div id={containerId} style={{ width: "100%", height: "500px" }}></div>
    </div>
  );
}

export default SemiCircleChart;
