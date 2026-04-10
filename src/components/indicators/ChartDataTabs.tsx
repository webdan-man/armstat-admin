"use client";

import React, { useMemo } from "react";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";

import { Input } from "@/components/ui/input";

import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import { cn } from "@/lib/utils";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import { getMetricCombinations } from "@/services/metricsService";
import type { MetricCombination } from "@/types/metric";

const fieldBorder =
  "h-9 rounded-[8.5px] border-[rgba(230,231,235,1)] bg-white text-sm text-[#2c2c2c] md:text-sm";

function maxRowLength(combinations: MetricCombination[]): number {
  let max = 0;
  for (const combo of combinations) {
    const len = combo.row?.length ?? 0;
    if (len > max) max = len;
  }
  return max;
}

function headerForColumnIndex(combinations: MetricCombination[], columnIndex: number): string {
  for (const combo of combinations) {
    const entry = combo.row?.[columnIndex];
    if (entry) {
      const t = entry.attribute.title?.trim();
      return t && t.length > 0 ? `${t} (${entry.level})` : entry.attribute._id;
    }
  }
  return String(columnIndex + 1);
}

function valueAtColumnIndex(combo: MetricCombination, columnIndex: number): string {
  const entry = combo.row?.[columnIndex];
  if (!entry) return "—";
  const t = entry.value.title?.trim();
  return t && t.length > 0 ? t : entry.value._id;
}

function CombinationsTable({ metricId }: { metricId: string }) {
  const { data, error, isLoading } = useSWR(
    metricId ? swrKeys.metricCombinations(metricId) : null,
    () => getMetricCombinations(metricId)
  );

  const combinations = data ?? [];

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);

  if (isLoading) {
    return <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">Բեռնվում է…</p>;
  }

  if (error) {
    return <p className="text-destructive text-[14px] leading-3.5">Չհաջողվեց բեռնել տվյալները։</p>;
  }

  if (combinations.length === 0) {
    return (
      <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
        Դեռ մուտքագրված համակցություններ չկան։
      </p>
    );
  }

  if (columnCount === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[14px] leading-3.5">Metric unit</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combo) => (
            <TableRow key={combo._id}>
              <TableCell className="text-[14px] leading-3.5">{combo.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  const columnIndexes = Array.from({ length: columnCount }, (_, i) => i);

  return (
    <Table>
      <TableHeader>
        <TableRow>
          {columnIndexes.map((i) => (
            <TableHead key={i} className="text-[14px] leading-3.5">
              {headerForColumnIndex(combinations, i)}
            </TableHead>
          ))}
          <TableHead className="text-[14px] leading-3.5">Metric unit</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {combinations.map((combo) => (
          <TableRow key={combo._id}>
            {columnIndexes.map((i) => (
              <TableCell key={i} className="text-[14px] leading-3.5">
                {valueAtColumnIndex(combo, i)}
              </TableCell>
            ))}
            <TableCell className="text-[14px] leading-3.5">{combo.value}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  );
}

const ChartDataTabs = ({ className, metricId }: { className?: string; metricId: string }) => {
  const { control } = useFormContext<IndicatorFormValues>();

  return (
    <Tabs defaultValue="graph" className={cn("w-full gap-5", className)}>
      <TabsList className="flex h-11.75 w-full justify-start gap-0 rounded-none border-b border-b-[rgba(178,178,178,1)] bg-transparent p-0.5">
        <TabsTrigger
          value="graph"
          className="h-11.75 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Գծապատկեր
        </TabsTrigger>
        <TabsTrigger
          value="table"
          className="h-11.75 max-w-fit rounded-none border-b-2 border-b-transparent px-4 data-[state=active]:border-b-[rgba(15,104,192,1)] data-[state=active]:bg-[rgba(241,245,248,1)] data-[state=active]:shadow-none"
        >
          Տվյալներ
        </TabsTrigger>
      </TabsList>
      <TabsContent className="flex w-full flex-col gap-10" value="graph">
        <div className="flex flex-col gap-6">
          <p className="text-[14px] leading-3.5 font-medium text-[rgba(44,44,44,1)]">Գրաֆիկ 1</p>
          <div className="h-50"></div>
          <FormField
            control={control}
            name="charts.0.link"
            render={({ field }) => (
              <FormItem>
                <Field orientation="horizontal">
                  <FieldLabel>Link</FieldLabel>
                  <FormControl>
                    <Input className={fieldBorder} {...field} />
                  </FormControl>
                </Field>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
        <div className="flex flex-col gap-6">
          <p className="text-[14px] leading-3.5 font-medium text-[rgba(44,44,44,1)]">Գրաֆիկ 2</p>
          <div className="h-50"></div>
          <FormField
            control={control}
            name="charts.1.link"
            render={({ field }) => (
              <FormItem>
                <Field orientation="horizontal">
                  <FieldLabel>Link</FieldLabel>
                  <FormControl>
                    <Input className={fieldBorder} {...field} />
                  </FormControl>
                </Field>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>
      </TabsContent>
      <TabsContent className="flex w-full flex-col gap-5" value="table">
        {metricId ? (
          <CombinationsTable metricId={metricId} />
        ) : (
          <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
            Ընտրեք ցուցանիշ՝ տվյալների աղյուսակը տեսնելու համար։
          </p>
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ChartDataTabs;
