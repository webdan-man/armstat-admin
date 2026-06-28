"use client";

import React, { useMemo } from "react";
import { useFormContext, useWatch } from "react-hook-form";
import useSWR from "swr";

import { Input } from "@/components/ui/input";
import { FormField, FormItem, FormControl, FormMessage } from "@/components/ui/form";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { MetricFormValues } from "@/components/metrics/metric-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import { getMetricCombinations } from "@/services/metricsService";
import type { MetricResponse } from "@/types/metric";
import Chart from "@/components/metrics/charts/Chart";
import CombinationsTable from "@/components/metrics/CombinationsTable";
import Image from "next/image";
import { useColumnFilters } from "./useColumnFilters";
import { ColumnFilters } from "./ColumnFilters";
import { useLang } from "@/providers/LangProvider";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const locales = ["en", "hy", "ru"] as const;

const triggerClass =
  "h-8 min-w-[64px] rounded-lg px-2 py-0 text-[13px] font-normal text-black hover:bg-white/50 group-data-[variant=default]/tabs-list:data-[state=active]:bg-white group-data-[variant=default]/tabs-list:data-[state=active]:border-b-0 data-[state=active]:shadow-[0px_4px_4px_0px_rgba(0,0,0,0.05)]";

function TotalLocaleContent({ lang }: { lang: (typeof locales)[number] }) {
  const { control } = useFormContext<MetricFormValues>();

  return (
    <TabsContent className="flex items-center gap-10" value={lang}>
      <div className="flex items-center gap-3">
        <Image src="/icons/man.svg" width={17} height={27} alt="man" />
        <div className="flex items-center gap-1.5">
          <FormField
            control={control}
            name={`total.male.${lang}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input className={cn(fieldBorder, "w-32")} type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
      <div className="flex items-center gap-3">
        <Image src="/icons/women.svg" width={17} height={27} alt="women" />
        <div className="flex items-center gap-1.5">
          <FormField
            control={control}
            name={`total.female.${lang}`}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Input className={cn(fieldBorder, "w-32")} type="text" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </div>
    </TabsContent>
  );
}

const ChartDataTabs = ({
  className,
  metricId,
  metric,
  lang,
  onLangChange,
}: {
  className?: string;
  metricId: string;
  metric?: MetricResponse;
  lang: string;
  onLangChange: (v: string) => void;
}) => {
  const { activeLang } = useLang();
  const { control } = useFormContext<MetricFormValues>();
  const isCumulative = useWatch({ control, name: "isCumulative" });

  const { data, error, isLoading } = useSWR(
    metricId ? swrKeys.metricCombinations(metricId) : null,
    () => getMetricCombinations(metricId)
  );
  const combinations = useMemo(() => data ?? [], [data]);

  const filters = useColumnFilters(combinations, metric?.isCumulative, metricId);
  const { projectedCombinations } = filters;

  return (
    <Tabs defaultValue="graph" className={cn("w-full gap-5", className)}>
      <TabsList className="flex h-11.75 w-full justify-start gap-0 rounded-none border-b border-b-[rgba(178,178,178,1)] bg-transparent p-0.5">
        <TabsTrigger
          value="graph"
          className="h-10 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Գծապատկեր
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className="h-10 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Տվյալներ
        </TabsTrigger>
      </TabsList>

      {metricId && !isLoading && !error ? (
        <ColumnFilters
          combinations={combinations}
          filters={filters}
          totalCount={combinations.length}
          filteredCount={projectedCombinations.length}
        />
      ) : null}

      <TabsContent className="flex w-full flex-col gap-10" value="graph">
        <Chart combinations={projectedCombinations} isCumulative={isCumulative} />
        <Tabs value={lang} onValueChange={onLangChange} className="mt-3.5 w-full gap-5">
          <TabsList className="h-9 gap-0 rounded-[9px] bg-[#e6e7eb] p-0.5">
            <TabsTrigger value="hy" className={triggerClass}>
              HY
            </TabsTrigger>
            <TabsTrigger value="ru" className={triggerClass}>
              RU
            </TabsTrigger>
            <TabsTrigger value="en" className={triggerClass}>
              ENG
            </TabsTrigger>
          </TabsList>
          {locales.map((lang) => (
            <TotalLocaleContent key={lang} lang={lang} />
          ))}
        </Tabs>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-5" value="table">
        {!metricId ? (
          <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
            Ընտրեք ցուցանիշ՝ տվյալների աղյուսակը տեսնելու համար։
          </p>
        ) : isLoading ? (
          <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">Բեռնվում է…</p>
        ) : error ? (
          <p className="text-destructive text-[14px] leading-3.5">Չհաջողվեց բեռնել տվյալները։</p>
        ) : (
          <CombinationsTable
            combinations={projectedCombinations}
            metricUnit={metric?.unit?.[activeLang]}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ChartDataTabs;
