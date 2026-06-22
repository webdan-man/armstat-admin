"use client";

import React, { useMemo, useState } from "react";
import { ChevronDown, ChevronUp } from "lucide-react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MetricCombination } from "@/types/metric";
import { cn } from "@/lib/utils";

import {
  formatCombinationValue,
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/metrics/metric-combinations-table-utils";

type SortKey = number | "value" | "id";

export default function CombinationsTable({
  combinations,
  metricUnit,
}: {
  combinations: MetricCombination[];
  metricUnit?: string;
}) {
  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);

  const columnIndexes = Array.from({ length: columnCount }, (_, i) => i);

  const cellClassName = "w-full text-[14px] leading-3.5 text-black";

  const [sortKey, setSortKey] = useState<SortKey>("id");
  const [order, setOrder] = useState<"asc" | "desc">("asc");

  const sortedCombinations = useMemo(() => {
    return [...combinations].sort((a, b) => {
      const aVal =
        sortKey === "value"
          ? (a.value ?? "")
          : sortKey === "id"
            ? String(a.id)
            : valueAtColumnIndex(a, sortKey);
      const bVal =
        sortKey === "value"
          ? (b.value ?? "")
          : sortKey === "id"
            ? String(b.id)
            : valueAtColumnIndex(b, sortKey);
      const cmp = aVal.localeCompare(bVal, undefined, { numeric: true });
      return order === "asc" ? cmp : -cmp;
    });
  }, [combinations, sortKey, order]);

  const handleSort = (key: SortKey) => {
    setOrder((prev) => (sortKey === key && prev === "asc" ? "desc" : "asc"));
    setSortKey(key);
  };

  const SortableHead = ({
    sortBy,
    children,
    className,
  }: {
    sortBy: SortKey;
    children?: React.ReactNode;
    className?: string;
  }) => (
    <TableHead className={cn(cellClassName, className)}>
      <button
        type="button"
        onClick={() => handleSort(sortBy)}
        className="flex cursor-pointer items-center gap-1 select-none"
      >
        <span>{children}</span>
        {sortKey === sortBy &&
          (order === "asc" ? (
            <ChevronUp className="h-3.5 w-3.5 opacity-60" />
          ) : (
            <ChevronDown className="h-3.5 w-3.5 opacity-60" />
          ))}
      </button>
    </TableHead>
  );

  if (columnCount === 0) {
    return (
      <Table className="table-fixed" style={{}}>
        <TableHeader>
          <TableRow>
            <SortableHead sortBy="value">{metricUnit}</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCombinations.map((combo) => (
            <TableRow key={combo.id}>
              <TableCell className={cellClassName}>{formatCombinationValue(combo.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    );
  }

  return (
    <div className="flex flex-col gap-3">
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <SortableHead sortBy="id" className="w-15">
              ID
            </SortableHead>
            {columnIndexes.map((i) => (
              <SortableHead key={i} sortBy={i}>
                {headerForColumnIndex(combinations, i)}
              </SortableHead>
            ))}
            <SortableHead sortBy="value">{metricUnit}</SortableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {sortedCombinations.map((combo) => (
            <TableRow key={combo.id}>
              <TableCell className={cellClassName}>{combo.id}</TableCell>
              {columnIndexes.map((i) => (
                <TableCell key={i} className={cn(cellClassName)}>
                  {valueAtColumnIndex(combo, i)}
                </TableCell>
              ))}
              <TableCell className={cellClassName}>{formatCombinationValue(combo.value)}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}
