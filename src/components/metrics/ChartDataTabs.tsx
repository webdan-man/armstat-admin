"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
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

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

const ChartDataTabs = ({
  className,
  metricId,
  metric,
}: {
  className?: string;
  metricId: string;
  metric?: MetricResponse;
}) => {
  const { control } = useFormContext<MetricFormValues>();

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
        <Chart combinations={projectedCombinations} />
        <div className="mt-3.5 flex items-center gap-10">
          <div className="flex items-center gap-3">
            <Image src="/icons/man.svg" width={17} height={27} alt="man" />
            <div className="flex items-center gap-1.5">
              {/*<span className="text-sm font-medium text-[#575757]">#</span>*/}
              {/*<FormField*/}
              {/*  control={control}*/}
              {/*  name="total.male"*/}
              {/*  render={({ field }) => (*/}
              {/*    <FormItem>*/}
              {/*      <FormControl>*/}
              {/*        <Input className={cn(fieldBorder, "w-32")} type="text" {...field} />*/}
              {/*      </FormControl>*/}
              {/*      <FormMessage />*/}
              {/*    </FormItem>*/}
              {/*  )}*/}
              {/*/>*/}

              {/*<span className="text-sm font-medium text-[#575757]">%</span>*/}
              <FormField
                control={control}
                name="total.malePercentage"
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
              {/*<span className="text-sm font-medium text-[#575757]">#</span>*/}
              {/*<FormField*/}
              {/*  control={control}*/}
              {/*  name="total.female"*/}
              {/*  render={({ field }) => (*/}
              {/*    <FormItem>*/}
              {/*      <FormControl>*/}
              {/*        <Input className={cn(fieldBorder, "w-32")} type="text" {...field} />*/}
              {/*      </FormControl>*/}
              {/*      <FormMessage />*/}
              {/*    </FormItem>*/}
              {/*  )}*/}
              {/*/>*/}

              {/*<span className="text-sm font-medium text-[#575757]">%</span>*/}
              <FormField
                control={control}
                name="total.femalePercentage"
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
        </div>
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
            filteredCombinations={projectedCombinations}
            metricUnit={metric?.unit?.["hy"]}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ChartDataTabs;
