"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { cn } from "@/lib/utils";
import { swrKeys } from "@/lib/swr/cache-keys";
import { getMetricCombinations } from "@/services/metricsService";
import type { MetricResponse } from "@/types/metric";

import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/indicators/metric-combinations-table-utils";

export default function CombinationsTable({
  metricId,
  metric,
}: {
  metricId: string;
  metric?: MetricResponse;
}) {
  const { data, error, isLoading } = useSWR(
    metricId ? swrKeys.metricCombinations(metricId) : null,
    () => getMetricCombinations(metricId)
  );

  const combinations = useMemo(() => data ?? [], [data]);

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const [columnSelectedValues, setColumnSelectedValues] = useState<(string | null)[]>([]);
  const selectedAt = (i: number) => columnSelectedValues[i] ?? null;
  const ensureLength = (next: (string | null)[]) =>
    next.length >= columnCount
      ? next
      : Array.from({ length: columnCount }, (_, i) => next[i] ?? null);

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

  const columnIndexes = Array.from({ length: columnCount }, (_, i) => i);
  const activeFilterCount = useMemo(
    () => columnSelectedValues.reduce((sum, selected) => sum + (selected ? 1 : 0), 0),
    [columnSelectedValues]
  );

  if (isLoading) {
    return <p className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">Բեռնվում է…</p>;
  }

  if (error) {
    return <p className="text-destructive text-[14px] leading-3.5">Չհաջողվեց բեռնել տվյալները։</p>;
  }

  const metricUnit = metric?.unit?.["hy"];

  if (columnCount === 0) {
    return (
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[14px] leading-3.5" />
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

  return (
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
            onClick={() => setColumnSelectedValues(Array.from({ length: columnCount }, () => null))}
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
          const selected = selectedAt(i);
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

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-[14px] leading-3.5">ID</TableHead>
            {columnIndexes.map((i) => (
              <TableHead key={i} className="text-[14px] leading-3.5">
                {headerForColumnIndex(combinations, i)}
              </TableHead>
            ))}
            <TableHead className="text-[14px] leading-3.5">{metricUnit}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCombinations.map((combo, index) => (
            <TableRow key={combo._id}>
              <TableCell className="text-[14px] leading-3.5">{index + 1}</TableCell>
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
    </div>
  );
}

