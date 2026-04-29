'use client';

import React, { useLayoutEffect, useRef } from 'react';

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';

export default function ChartTab() {
  // const chartRef = useRef<HTMLDivElement | null>(null);
  //
  // useLayoutEffect(() => {
  //   if (!chartRef.current) return;
  //
  //   // Create root
  //   let root = am5.Root.new(chartRef.current);
  //
  //   root.setThemes([am5themes_Animated.new(root)]);
  //
  //   let chart = root.container.children.push(
  //     am5xy.XYChart.new(root, {
  //       panX: false,
  //       panY: false,
  //       wheelX: 'panX',
  //       wheelY: 'zoomX',
  //       layout: root.verticalLayout,
  //       arrangeTooltips: false,
  //       paddingLeft: 0,
  //       paddingRight: 10,
  //     }),
  //   );
  //
  //   chart.getNumberFormatter().set('numberFormat', '#.#s');
  //
  //   let legend = chart.children.push(
  //     am5.Legend.new(root, {
  //       centerX: am5.p50,
  //       x: am5.p50,
  //     }),
  //   );
  //
  //   const data = [
  //     { age: '85+', male: -0.1, female: 0.3 },
  //     { age: '80-84', male: -0.2, female: 0.3 },
  //     { age: '75-79', male: -0.3, female: 0.6 },
  //     { age: '70-74', male: -0.5, female: 0.8 },
  //     { age: '65-69', male: -0.8, female: 1.0 },
  //     { age: '60-64', male: -1.1, female: 1.3 },
  //     { age: '55-59', male: -1.7, female: 1.9 },
  //     { age: '50-54', male: -2.2, female: 2.5 },
  //     { age: '45-49', male: -2.8, female: 3.0 },
  //     { age: '40-44', male: -3.4, female: 3.6 },
  //     { age: '35-39', male: -4.2, female: 4.1 },
  //     { age: '30-34', male: -5.2, female: 4.8 },
  //     { age: '25-29', male: -5.6, female: 5.1 },
  //     { age: '20-24', male: -5.1, female: 5.1 },
  //     { age: '15-19', male: -3.8, female: 3.8 },
  //     { age: '10-14', male: -3.2, female: 3.4 },
  //     { age: '5-9', male: -4.4, female: 4.1 },
  //     { age: '0-4', male: -5.0, female: 4.8 },
  //   ];
  //
  //   // Y axis
  //   let yAxis = chart.yAxes.push(
  //     am5xy.CategoryAxis.new(root, {
  //       categoryField: 'age',
  //       renderer: am5xy.AxisRendererY.new(root, {
  //         inversed: true,
  //         cellStartLocation: 0.1,
  //         cellEndLocation: 0.9,
  //         minorGridEnabled: true,
  //         minGridDistance: 20,
  //       }),
  //     }),
  //   );
  //
  //   yAxis.data.setAll(data);
  //
  //   // X axis
  //   let xAxis = chart.xAxes.push(
  //     am5xy.ValueAxis.new(root, {
  //       renderer: am5xy.AxisRendererX.new(root, {
  //         minGridDistance: 60,
  //         strokeOpacity: 0.1,
  //       }),
  //     }),
  //   );
  //
  //   function createSeries(
  //     field: string,
  //     labelCenterX: number,
  //     pointerOrientation: string,
  //     rangeValue: number,
  //   ) {
  //     let series = chart.series.push(
  //       am5xy.ColumnSeries.new(root, {
  //         xAxis: xAxis,
  //         yAxis: yAxis,
  //         valueXField: field,
  //         categoryYField: 'age',
  //         sequencedInterpolation: true,
  //         clustered: false,
  //         tooltip: am5.Tooltip.new(root, {
  //           pointerOrientation: pointerOrientation,
  //           labelText: '{categoryY}: {valueX}',
  //         }),
  //       }),
  //     );
  //
  //     series.columns.template.setAll({
  //       height: am5.p100,
  //       strokeOpacity: 0,
  //       fillOpacity: 0.8,
  //     });
  //
  //     series.bullets.push(() => {
  //       return am5.Bullet.new(root, {
  //         locationX: 1,
  //         locationY: 0.5,
  //         sprite: am5.Label.new(root, {
  //           centerY: am5.p50,
  //           text: '{valueX}',
  //           populateText: true,
  //           centerX: labelCenterX,
  //         }),
  //       });
  //     });
  //
  //     series.data.setAll(data);
  //     series.appear();
  //
  //     let rangeDataItem = xAxis.makeDataItem({
  //       value: rangeValue,
  //     });
  //
  //     xAxis.createAxisRange(rangeDataItem);
  //
  //     rangeDataItem.get('grid')?.setAll({
  //       strokeOpacity: 1,
  //       stroke: series.get('stroke'),
  //     });
  //
  //     let label = rangeDataItem.get('label');
  //
  //     label?.setAll({
  //       text: field.toUpperCase(),
  //       fontSize: '1.1em',
  //       fill: series.get('stroke'),
  //       paddingTop: 10,
  //       isMeasured: false,
  //       centerX: labelCenterX,
  //     });
  //
  //     label?.adapters.add('dy', () => {
  //       return -chart.plotContainer.height();
  //     });
  //
  //     legend.data.push(series);
  //
  //     return series;
  //   }
  //
  //   createSeries('male', am5.p100, 'right', -3);
  //   createSeries('female', 0, 'left', 4);
  //
  //   let cursor = chart.set(
  //     'cursor',
  //     am5xy.XYCursor.new(root, {
  //       behavior: 'zoomY',
  //     }),
  //   );
  //
  //   cursor.lineY.set('forceHidden', true);
  //   cursor.lineX.set('forceHidden', true);
  //
  //   chart.appear(1000, 100);
  //
  //   return () => {
  //     root.dispose();
  //   };
  // }, []);

  return (
    <div className="w-full flex flex-col">
      <div
        // ref={chartRef}
        style={{ width: '50%', height: '800px' }}
      />
      <div className="flex justify-between gap-5">
        <div className="flex gap-5">
          <p className="text-[rgba(110,127,136,1)] text-[11px]">Թարմացված է՝ 20/05/2024, 16:43</p>
          <p className="text-[rgba(110,127,136,1)] text-[11px]">
            Աղբյուրը՝ <span className="text-[rgba(39,81,153,1)]">Հղման անվանումը կարճ</span>
          </p>
        </div>
        <p className="text-[rgba(110,127,136,1)] text-[11px]">Դիտված է 1,343 անգամ</p>
      </div>
    </div>
  );
}
