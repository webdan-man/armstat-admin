"use client";

import React, { useMemo, useState } from "react";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";

import { Input } from "@/components/ui/input";
import { Field, FieldLabel } from "@/components/ui/field";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { FormControl, FormField, FormItem, FormMessage } from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { cn } from "@/lib/utils";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import { getMetricCombinations } from "@/services/metricsService";
import type { MetricResponse } from "@/types/metric";
import Chart from "@/components/indicators/charts/Chart";
import CombinationsTable from "@/components/indicators/CombinationsTable";
import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/indicators/metric-combinations-table-utils";
import Image from "next/image";

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
  const { control } = useFormContext<IndicatorFormValues>();
  const [columnSelectedValues, setColumnSelectedValues] = useState<(string | null)[]>([]);

  const { data, error, isLoading } = useSWR(
    metricId ? swrKeys.metricCombinations(metricId) : null,
    () => getMetricCombinations(metricId)
  );
  const combinations = useMemo(() => data ?? [], [data]);

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount]
  );

  const ensureLength = (next: (string | null)[]) =>
    next.length >= columnCount
      ? next
      : Array.from({ length: columnCount }, (_, i) => next[i] ?? null);

  const activeFilterCount = useMemo(
    () => columnSelectedValues.reduce((sum, selected) => sum + (selected ? 1 : 0), 0),
    [columnSelectedValues]
  );

  const columnValueOptions = useMemo(() => {
    if (columnCount === 0) return [];
    return Array.from({ length: columnCount }, (_, columnIndex) => {
      const uniq = new Set<string>();
      for (const combo of combinations) {
        uniq.add(valueAtColumnIndex(combo, columnIndex));
      }
      return Array.from(uniq).sort((a, b) => a.localeCompare(b));
    });
  }, [columnCount, combinations]);

  const filteredCombinations = useMemo(() => {
    if (columnCount === 0) return combinations;
    const active = columnSelectedValues
      .map((selected, i) => ({ i, selected }))
      .filter(({ selected }) => Boolean(selected));
    if (active.length === 0) return combinations;

    return combinations.filter((combo) =>
      active.every(({ i, selected }) => valueAtColumnIndex(combo, i) === selected)
    );
  }, [columnCount, columnSelectedValues, combinations]);

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

      {metricId && !isLoading && !error ? (
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "text-[14px] leading-3.5",
                  activeFilterCount === 0 ? "text-[rgba(44,44,44,0.65)]" : "text-[rgba(44,44,44,1)]"
                )}
              >
                {activeFilterCount > 0 ? `Ֆիլտրեր (${activeFilterCount})` : "Ֆիլտրեր"}
              </div>
              <button
                type="button"
                className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline disabled:opacity-50"
                disabled={activeFilterCount === 0}
                onClick={() =>
                  setColumnSelectedValues(Array.from({ length: columnCount }, () => null))
                }
              >
                Մաքրել բոլորը
              </button>
            </div>

            <div className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
              {filteredCombinations.length} / {combinations.length}
            </div>
          </div>

          <div className="flex overflow-x-auto bg-[rgba(241,245,248,1)]">
            {columnIndexes.map((i) => {
              const options = columnValueOptions[i] ?? [];
              const selected = columnSelectedValues[i] ?? null;
              const label = headerForColumnIndex(combinations, i);
              return (
                <div key={i} className="shrink-0 px-4 py-3">
                  <Select
                    value={selected ?? "__all__"}
                    onValueChange={(val) =>
                      setColumnSelectedValues((prev) => {
                        const copy = ensureLength([...prev]);
                        copy[i] = val === "__all__" ? null : val;
                        return copy;
                      })
                    }
                  >
                    <SelectTrigger className="h-auto w-auto gap-2 border-0 bg-transparent p-0 shadow-none focus:ring-0 focus:ring-offset-0">
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="__all__">{label}</SelectItem>
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}
      <TabsContent className="flex w-full flex-col gap-10" value="graph">
        <Chart combinations={filteredCombinations} />
        <div className="mt-3.5 flex items-center gap-10">
          <div className="flex items-center gap-3">
            <Image src="/icons/man.svg" width={17} height={27} alt={"man"} />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#575757]">#</span>
              <Input className={cn(fieldBorder, "w-32")} type="text" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#575757]">%</span>
              <Input className={cn(fieldBorder, "w-16")} type="text" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Image src="/icons/women.svg" width={17} height={27} alt={"women"} />
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#575757]">#</span>
              <Input className={cn(fieldBorder, "w-32")} type="text" />
            </div>
            <div className="flex items-center gap-1.5">
              <span className="text-sm font-medium text-[#575757]">%</span>
              <Input className={cn(fieldBorder, "w-16")} type="text" />
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
            combinations={combinations}
            filteredCombinations={filteredCombinations}
            metricUnit={metric?.unit?.["hy"]}
          />
        )}
      </TabsContent>
    </Tabs>
  );
};

export default ChartDataTabs;
