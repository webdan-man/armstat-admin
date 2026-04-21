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

