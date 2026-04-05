"use client";

import React from "react";

import { Button } from "@/components/ui/button";
import { Card, CardAction, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

import { cn } from "@/lib/utils";
import Image from "next/image";
import Filters from "@/components/indicators/Filters";
import CreateWindow from "@/components/indicators/CreateWindow";
import MainTabs from "@/components/indicators/MainTabs";
import MetadataTabs from "@/components/indicators/MetadataTabs";
import ChartDataTabs from "@/components/indicators/ChartDataTabs";
import FeaturesTable from "@/components/indicators/FeaturesTable";

const cardSurface =
  "ring-0 rounded-[10px] border-0 bg-white text-[#2c2c2c] shadow-[0_6px_14px_rgba(0,0,0,0.05)]";

export default function IndicatorsPage() {
  return (
    <div className="flex w-full flex-col gap-2.5 overflow-y-auto">
      <div className="flex min-h-11 items-center justify-between">
        <h1 className="justify-start text-xl leading-4 font-semibold text-zinc-800">Ցուցաւնիշ</h1>
      </div>
      <Filters />
      <div className="mt-7.5 flex w-full flex-col gap-7.5">
        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Վերնագրեր</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <MainTabs />
          </CardContent>
        </Card>
        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Հատկանիշներ</CardTitle>
            <CardAction>
              <CreateWindow />
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <FeaturesTable />
          </CardContent>
        </Card>
        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">
              Տվյալների Մուտքագրում
            </CardTitle>
            <CardAction>
              <button className="flex cursor-pointer items-center gap-3.25 self-center">
                <Image src="/add.svg" width="24" height={24} alt={"add"} />
                <span className="text-[14px] leading-3.5 font-medium text-[rgba(39,81,153,1)]">
                  Մուտքագրել CSV
                </span>
              </button>
            </CardAction>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <ChartDataTabs />
          </CardContent>
        </Card>
        <Card className={cn(cardSurface, "gap-0 py-0")}>
          <CardHeader className="gap-4 border-0 px-8 pt-8 pb-0">
            <CardTitle className="text-base font-medium text-[#2c2c2c]">Մետատվյալներ</CardTitle>
          </CardHeader>
          <CardContent className="flex flex-col gap-4 px-8 pt-6 pb-8">
            <MetadataTabs />
          </CardContent>
        </Card>
        <div className="flex flex-wrap items-center gap-3 pt-2">
          <Button
            type="button"
            variant="outline"
            className="h-11 min-w-[131px] rounded-lg border-[#c7c7c7] bg-white text-[#2c2c2c] hover:bg-[#fafafa]"
          >
            Չեղարկել
          </Button>
          <Button
            type="button"
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#282828] text-white hover:bg-[#282828]/90"
          >
            Հաստատել
          </Button>
          <Button
            type="button"
            className="h-11 min-w-[132px] rounded-lg border-transparent bg-[#004d99] text-white hover:bg-[#004d99]/90"
          >
            Պահպանել
          </Button>
        </div>
      </div>
    </div>
  );
}
