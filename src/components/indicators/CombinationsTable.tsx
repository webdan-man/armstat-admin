"use client";

import React, { useMemo } from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import type { MetricCombination } from "@/types/metric";

import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/indicators/metric-combinations-table-utils";

export default function CombinationsTable({
  combinations,
  filteredCombinations,
  metricUnit,
}: {
  combinations: MetricCombination[];
  filteredCombinations: MetricCombination[];
  metricUnit?: string;
}) {
  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);

  const columnIndexes = Array.from({ length: columnCount }, (_, i) => i);

  const cellClassName = "w-[1%] text-[14px] leading-3.5";

  if (columnCount === 0) {
    return (
      <Table className="table-fixed">
        <TableHeader>
          <TableRow>
            <TableHead className={cellClassName} />
          </TableRow>
        </TableHeader>
        <TableBody>
          {combinations.map((combo) => (
            <TableRow key={combo._id}>
              <TableCell className={cellClassName}>{combo.value}</TableCell>
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
            <TableHead className={cellClassName}>ID</TableHead>
            {columnIndexes.map((i) => (
              <TableHead key={i} className={cellClassName}>
                {headerForColumnIndex(combinations, i)}
              </TableHead>
            ))}
            <TableHead className={cellClassName}>{metricUnit}</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {filteredCombinations.map((combo, index) => (
            <TableRow key={combo._id}>
              <TableCell className={cellClassName}>{index + 1}</TableCell>
              {columnIndexes.map((i) => (
                <TableCell key={i} className={cellClassName}>
                  {valueAtColumnIndex(combo, i)}
                </TableCell>
              ))}
              <TableCell className={cellClassName}>{combo.value}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  );
}

