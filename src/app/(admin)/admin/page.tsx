'use client';

import React, { useLayoutEffect, useRef } from 'react';
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";

import * as am5 from '@amcharts/amcharts5';
import * as am5xy from '@amcharts/amcharts5/xy';
import am5themes_Animated from '@amcharts/amcharts5/themes/Animated';
import Image from "next/image";

export default function AdminDashboardPage() {

  const chartRef = useRef<HTMLDivElement | null>(null);

  useLayoutEffect(() => {
    if (!chartRef.current) return;

    // Create root
    let root = am5.Root.new(chartRef.current);

    root.setThemes([am5themes_Animated.new(root)]);

    let chart = root.container.children.push(
      am5xy.XYChart.new(root, {
        panX: false,
        panY: false,
        wheelX: 'panX',
        wheelY: 'zoomX',
        layout: root.verticalLayout,
        arrangeTooltips: false,
        paddingLeft: 0,
        paddingRight: 10,
      }),
    );

    chart.getNumberFormatter().set('numberFormat', '#.#s');

    let legend = chart.children.push(
      am5.Legend.new(root, {
        centerX: am5.p50,
        x: am5.p50,
      }),
    );

    const data = [
      { age: '85+', male: -0.1, female: 0.3 },
      { age: '80-84', male: -0.2, female: 0.3 },
      { age: '75-79', male: -0.3, female: 0.6 },
      { age: '70-74', male: -0.5, female: 0.8 },
      { age: '65-69', male: -0.8, female: 1.0 },
      { age: '60-64', male: -1.1, female: 1.3 },
      { age: '55-59', male: -1.7, female: 1.9 },
      { age: '50-54', male: -2.2, female: 2.5 },
      { age: '45-49', male: -2.8, female: 3.0 },
      { age: '40-44', male: -3.4, female: 3.6 },
      { age: '35-39', male: -4.2, female: 4.1 },
      { age: '30-34', male: -5.2, female: 4.8 },
      { age: '25-29', male: -5.6, female: 5.1 },
      { age: '20-24', male: -5.1, female: 5.1 },
      { age: '15-19', male: -3.8, female: 3.8 },
      { age: '10-14', male: -3.2, female: 3.4 },
      { age: '5-9', male: -4.4, female: 4.1 },
      { age: '0-4', male: -5.0, female: 4.8 },
    ];

    // Y axis
    let yAxis = chart.yAxes.push(
      am5xy.CategoryAxis.new(root, {
        categoryField: 'age',
        renderer: am5xy.AxisRendererY.new(root, {
          inversed: true,
          cellStartLocation: 0.1,
          cellEndLocation: 0.9,
          minorGridEnabled: true,
          minGridDistance: 20,
        }),
      }),
    );

    yAxis.data.setAll(data);

    // X axis
    let xAxis = chart.xAxes.push(
      am5xy.ValueAxis.new(root, {
        renderer: am5xy.AxisRendererX.new(root, {
          minGridDistance: 60,
          strokeOpacity: 0.1,
        }),
      }),
    );

    function createSeries(
      field: string,
      labelCenterX: number,
      pointerOrientation: "left" | "right" | "up" | "down" | "vertical" | "horizontal" | undefined,
      rangeValue: number,
    ) {
      let series = chart.series.push(
        am5xy.ColumnSeries.new(root, {
          xAxis: xAxis,
          yAxis: yAxis,
          valueXField: field,
          categoryYField: 'age',
          sequencedInterpolation: true,
          clustered: false,
          tooltip: am5.Tooltip.new(root, {
            pointerOrientation: pointerOrientation,
            labelText: '{categoryY}: {valueX}',
          }),
        }),
      );

      series.columns.template.setAll({
        height: am5.p100,
        strokeOpacity: 0,
        fillOpacity: 0.8,
      });

      series.bullets.push(() => {
        return am5.Bullet.new(root, {
          locationX: 1,
          locationY: 0.5,
          sprite: am5.Label.new(root, {
            centerY: am5.p50,
            text: '{valueX}',
            populateText: true,
            centerX: labelCenterX,
          }),
        });
      });

      series.data.setAll(data);
      series.appear();

      let rangeDataItem = xAxis.makeDataItem({
        value: rangeValue,
      });

      xAxis.createAxisRange(rangeDataItem);

      rangeDataItem.get('grid')?.setAll({
        strokeOpacity: 1,
        stroke: series.get('stroke'),
      });

      let label = rangeDataItem.get('label');

      label?.setAll({
        text: field.toUpperCase(),
        fontSize: '1.1em',
        fill: series.get('stroke'),
        paddingTop: 10,
        isMeasured: false,
        centerX: labelCenterX,
      });

      label?.adapters.add('dy', () => {
        return -chart.plotContainer.height();
      });

      legend.data.push(series);

      return series;
    }

    createSeries('male', Number(am5.p100), 'right', -3);
    createSeries('female', 0, 'left', 4);

    let cursor = chart.set(
      'cursor',
      am5xy.XYCursor.new(root, {
        behavior: 'zoomY',
      }),
    );

    cursor.lineY.set('forceHidden', true);
    cursor.lineX.set('forceHidden', true);

    chart.appear(1000, 100);

    return () => {
      root.dispose();
    };
  }, []);

  return (
    <div className="w-full max-w-[1096px] space-y-[30px]">
      <section className="grid grid-cols-[303px_374px_374px] gap-[15px]">
        <Input
          className="h-9 rounded-[9px] border-[#c8c8c8] bg-white text-[13px] text-[#2c2c2c]"
          defaultValue="Միգրացիա"
        />
        <Input
          className="h-9 rounded-[9px] border-[#c8c8c8] bg-white text-[13px] text-[#2c2c2c]"
          defaultValue="Փախստական"
        />
        <Input
          className="h-9 rounded-[9px] border-[#c8c8c8] bg-white text-[13px] text-[#2c2c2c]"
          defaultValue="ԱՊՀ-ից"
        />
        <button className="flex items-center gap-[13px] cursor-pointer">
          <Image src='/add.svg' width='24' height={24} alt={'add'} />
          <span className="text-[rgba(39,81,153,1)] text-[14px] leading-[14px] font-medium">Ստեղծել</span>
        </button>
      </section>

      <Card className="rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-4 px-8 py-7">
          <p className="text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Վերնագրեր</p>
          <div className="rounded-[9px] border border-[#e6e7eb] px-4 py-[11px] text-[14px] leading-[14px] tracking-[-0.42px] text-[#2c2c2c]">
            ՀՀ կացության կարգավիճակ ստացած օտարերկրացիների բաշխումն ըստ կարգավիճակի տեսակի և
            տարիքային խմբերի
          </div>
          <div className="rounded-[9px] border border-[#e6e7eb] px-4 py-[11px] text-[14px] leading-[18px] tracking-[-0.42px] text-[#575757]">
            Լորեմ իպսում դոլոր սիթ ամեթ, կոնսեկթեթուր ադիպիսցինգ էլիթ...
          </div>
          <div className="grid grid-cols-[130px_517px] items-center gap-y-4 text-sm">
            <p className="text-[12px] font-medium leading-[14px] text-[#575757]">Հղումը՝</p>
            <Input
              defaultValue="https://translate.google.com/"
              className="h-9 rounded-[9px] border-[#e6e7eb] text-[14px]"
            />
            <p className="text-[12px] font-medium leading-[14px] text-[#575757]">Չափման միավորը՝</p>
            <Input defaultValue="Մարդ" className="h-9 rounded-[9px] border-[#e6e7eb] text-[14px]" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-4 px-8 py-7">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Հատկանիշներ</p>
            <button className="text-[14px] font-medium leading-[14px] text-[#275199]">Ավել Հատկանիշ</button>
          </div>
          <div className="h-11 w-[161px] rounded-[8px] bg-[#282828] px-4 py-[15px] text-center text-[13px] font-medium leading-[14px] text-white">
            Գեներացնել CSV
          </div>
          <div className="space-y-2 text-[13px]">
            <div className="grid grid-cols-5 border-b border-[#e6e7eb] pb-3 text-[#2c2c2c]">
              <p>Արտակարգ Դեպքերի Տեսակներ</p>
              <p>Արտակարգ Դեպքեր</p>
              <p>Հիմնական</p>
              <p className="text-[#275199]">Խմբագրել</p>
              <p className="text-[#c00]">Ջնջել</p>
            </div>
            <div className="grid grid-cols-5 border-b border-[#e6e7eb] pb-3 text-[#2c2c2c]">
              <p>Արտակարգ Ենթատեսակներ</p>
              <p>Արտակարգ Դեպքեր</p>
              <p>Երկրորդային</p>
              <p className="text-[#275199]">Խմբագրել</p>
              <p className="text-[#c00]">Ջնջել</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-6 px-8 py-7">
          <div className="flex items-center justify-between">
            <p className="text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Տվյալների Մուտքագրում</p>
            <button className="text-[14px] font-medium leading-[14px] text-[#275199]">Մուտքագրել CSV</button>
          </div>
          <div className="flex gap-0 border-b border-[#e6e7eb] pb-[1px] text-[14px]">
            <button className="h-[47px] w-[134px] border-b-2 border-[#0f68c0] bg-[#f1f5f8] px-4 py-2 font-medium text-[#282828]">
              Գծապատկեր
            </button>
            <button className="h-[47px] w-[102px] px-4 py-2 text-[#282828]">Տվյալներ</button>
          </div>
          <div>
            <p className="mb-3 text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Գրաֆիկ 1</p>

            <div
                ref={chartRef}
                style={{ width: '100%', height: '410px' }}
            />
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <p className="text-[12px] font-medium leading-[14px] text-[#575757]">Աղբյուրը</p>
            <Input className="h-9 rounded-[9px] border-[#e6e7eb]" />
          </div>
          <div>
            <p className="mb-3 text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Գրաֆիկ 2</p>
            {/*<div*/}
            {/*    ref={chartRef}*/}
            {/*    style={{ width: '100%', height: '368px' }}*/}
            {/*/>*/}
          </div>
          <div className="grid grid-cols-[120px_1fr] items-center gap-4">
            <p className="text-[12px] font-medium leading-[14px] text-[#575757]">Աղբյուրը</p>
            <Input className="h-9 max-w-[500px] rounded-[9px] border-[#e6e7eb]" />
          </div>
        </CardContent>
      </Card>

      <Card className="rounded-[10px] border-0 bg-white shadow-[0px_6px_7px_rgba(0,0,0,0.05)]">
        <CardContent className="space-y-5 px-8 py-7">
          <p className="text-[14px] font-medium leading-[14px] text-[#2c2c2c]">Մետատվյալներ</p>
          <textarea className="w-full rounded-[9px] p-8 border border-[#e6e7eb]" name="" id="" rows={10}></textarea>
          <div className="grid grid-cols-[130px_1fr] items-center gap-4">
            <p className="text-[12px] font-medium leading-[14px] text-[#575757]">Աղբյուրի հղումը՝</p>
            <Input className="h-9 max-w-[520px] rounded-[9px] border-[#e6e7eb]" />
          </div>
          <div className="flex gap-2">
            <button className="h-11 w-[132px] rounded-[8px] border border-[#c7c7c7] px-6 py-[15px] text-[13px] leading-[14px] text-[#2c2c2c]">
              Չեղարկել
            </button>
            <button className="h-11 w-[132px] rounded-[8px] bg-[#282828] px-6 py-[15px] text-[13px] leading-[14px] text-white">
              Պահպանել
            </button>
            <button className="h-11 w-[132px] rounded-[8px] bg-[#004d99] px-6 py-[15px] text-[13px] leading-[14px] text-white">
              Հրապարակել
            </button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
