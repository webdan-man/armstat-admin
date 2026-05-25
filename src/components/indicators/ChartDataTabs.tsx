"use client";

import React, { useMemo, useState, useEffect } from "react";
import { useFormContext } from "react-hook-form";
import useSWR from "swr";
import { ChevronDown } from "lucide-react";

import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";

import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { cn } from "@/lib/utils";
import type { IndicatorFormValues } from "@/components/indicators/indicator-form-schema";
import { swrKeys } from "@/lib/swr/cache-keys";
import { getMetricCombinations } from "@/services/metricsService";
import type { MetricCombination, MetricCombinationRowEntry, MetricResponse } from "@/types/metric";
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
  useFormContext<IndicatorFormValues>();

  // columnVisible[i] = false means column i is hidden; undefined/true = visible
  const [columnVisible, setColumnVisible] = useState<boolean[]>([]);
  // columnSelectedValues[i] = null means all values selected; Set = specific selected values
  const [columnSelectedValues, setColumnSelectedValues] = useState<(Set<string> | null)[]>([]);

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

  // Reset filter state when metric changes
  useEffect(() => {
    setColumnVisible([]);
    setColumnSelectedValues([]);
  }, [metricId]);

  const isVisible = (i: number) => columnVisible[i] !== false;
  const getSelected = (i: number): Set<string> | null => columnSelectedValues[i] ?? null;

  const visibleColumnIndexes = useMemo(
    () => columnIndexes.filter((i) => isVisible(i)),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [columnIndexes, columnVisible]
  );

  const columnValueOptions = useMemo(() => {
    if (columnCount === 0) return [];
    return columnIndexes.map((columnIndex) => {
      const uniq = new Set<string>();
      for (const combo of combinations) {
        uniq.add(valueAtColumnIndex(combo, columnIndex));
      }
      return Array.from(uniq).sort((a, b) => a.localeCompare(b));
    });
  }, [columnCount, columnIndexes, combinations]);

  // Rows filtered by value selection; hidden columns are ignored (include all for that dimension)
  const valueFilteredCombinations = useMemo(() => {
    if (columnCount === 0) return combinations;
    return combinations.filter((combo) =>
      columnIndexes.every((i) => {
        if (!isVisible(i)) return true;
        const selected = getSelected(i);
        if (selected === null) return true;
        if (selected.size === 0) return false;
        return selected.has(valueAtColumnIndex(combo, i));
      })
    );
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount, columnIndexes, columnVisible, columnSelectedValues, combinations]);

  // Project combinations to visible columns; aggregate duplicates if summable
  const projectedCombinations = useMemo((): MetricCombination[] => {
    if (visibleColumnIndexes.length === columnCount) return valueFilteredCombinations;

    // isCumulative=true means a cumulative time series (running totals) → values must not be summed.
    // Everything else (undefined / false) is regular count data → summable.
    const isSummable = metric?.isCumulative !== true;
    const groupMap = new Map<string, { combo: MetricCombination; numValue: number }>();
    let hasDuplicates = false;

    for (const combo of valueFilteredCombinations) {
      const projectedRow = visibleColumnIndexes
        .map((i) => combo.row?.[i])
        .filter((e): e is MetricCombinationRowEntry => Boolean(e));

      const projectedAttributes: Record<string, string> = {};
      for (const i of visibleColumnIndexes) {
        const entry = combo.row?.[i];
        if (entry?.attributeId) {
          projectedAttributes[entry.attributeId] = (combo.attributes ?? {})[entry.attributeId] ?? "";
        }
      }

      const key = visibleColumnIndexes.map((i) => valueAtColumnIndex(combo, i)).join("\0");

      if (groupMap.has(key)) {
        hasDuplicates = true;
        if (!isSummable) break;
        groupMap.get(key)!.numValue += Number(combo.value) || 0;
      } else {
        groupMap.set(key, {
          combo: { ...combo, row: projectedRow, attributes: projectedAttributes },
          numValue: Number(combo.value) || 0,
        });
      }
    }

    if (hasDuplicates && !isSummable) return [];

    return Array.from(groupMap.values()).map(({ combo, numValue }) => ({
      ...combo,
      value: String(numValue),
    }));
  }, [valueFilteredCombinations, visibleColumnIndexes, columnCount, metric?.isCumulative]);

  const activeFilterCount = useMemo(() => {
    let count = 0;
    for (let i = 0; i < columnCount; i++) {
      if (!isVisible(i)) {
        count++;
        continue;
      }
      const selected = getSelected(i);
      if (selected !== null && selected.size < (columnValueOptions[i]?.length ?? 0)) {
        count++;
      }
    }
    return count;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [columnCount, columnVisible, columnSelectedValues, columnValueOptions]);

  const clearAll = () => {
    setColumnVisible(Array.from({ length: columnCount }, () => true));
    setColumnSelectedValues(Array.from({ length: columnCount }, () => null));
  };

  const toggleColumnVisible = (i: number, visible: boolean) => {
    setColumnVisible((prev) => {
      const copy = Array.from({ length: Math.max(prev.length, i + 1) }, (_, j) =>
        prev[j] !== false
      );
      copy[i] = visible;
      return copy;
    });
  };

  const toggleColumnValue = (i: number, opt: string, checked: boolean) => {
    setColumnSelectedValues((prev) => {
      const copy = Array.from(
        { length: Math.max(prev.length, i + 1) },
        (_, j) => prev[j] ?? null
      );
      const allOptions = columnValueOptions[i] ?? [];
      const current = copy[i] === null ? new Set(allOptions) : new Set(copy[i] as Set<string>);

      if (checked) current.add(opt);
      else current.delete(opt);

      copy[i] = current.size === allOptions.length ? null : current;
      return copy;
    });
  };

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
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between gap-3">
            <div className="flex min-w-0 items-center gap-3">
              <div
                className={cn(
                  "text-[14px] leading-3.5",
                  activeFilterCount === 0
                    ? "text-[rgba(44,44,44,0.65)]"
                    : "text-[rgba(44,44,44,1)]"
                )}
              >
                {activeFilterCount > 0 ? `Ֆիլտրեր (${activeFilterCount})` : "Ֆիլտրեր"}
              </div>
              <button
                type="button"
                className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline disabled:opacity-50"
                disabled={activeFilterCount === 0}
                onClick={clearAll}
              >
                Մաքրել բոլորը
              </button>
            </div>

            <div className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
              {projectedCombinations.length} / {combinations.length}
            </div>
          </div>

          <div className="flex overflow-x-auto bg-[rgba(241,245,248,1)]">
            {columnIndexes.map((i) => {
              const options = columnValueOptions[i] ?? [];
              const selected = getSelected(i);
              const visible = isVisible(i);
              const label = headerForColumnIndex(combinations, i);
              return (
                <div key={i} className="shrink-0 px-4 py-3">
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={visible}
                      onCheckedChange={(checked) => toggleColumnVisible(i, Boolean(checked))}
                    />
                    <Popover>
                      <PopoverTrigger asChild>
                        <button
                          type="button"
                          disabled={!visible}
                          className="flex items-center gap-1 text-sm text-[#2c2c2c] disabled:opacity-40"
                        >
                          <span>{label}</span>
                          <ChevronDown className="h-3.5 w-3.5 opacity-60" />
                        </button>
                      </PopoverTrigger>
                      <PopoverContent className="w-auto min-w-36 p-2" align="start">
                        <div className="flex flex-col gap-0.5">
                          {options.map((opt) => {
                            const isChecked = selected === null || (selected?.has(opt) ?? true);
                            return (
                              <label
                                key={opt}
                                className="flex cursor-pointer items-center gap-2 rounded px-2 py-1 text-sm hover:bg-[rgba(241,245,248,1)]"
                              >
                                <Checkbox
                                  checked={isChecked}
                                  onCheckedChange={(checked) =>
                                    toggleColumnValue(i, opt, Boolean(checked))
                                  }
                                />
                                <span>{opt}</span>
                              </label>
                            );
                          })}
                        </div>
                      </PopoverContent>
                    </Popover>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      ) : null}

      <TabsContent className="flex w-full flex-col gap-10" value="graph">
        <Chart combinations={projectedCombinations} />
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
