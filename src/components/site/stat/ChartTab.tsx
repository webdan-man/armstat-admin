'use client';

import Chart from '@/components/indicators/charts/Chart';
import type { MetricCombination } from '@/types/metric';
import { Skeleton } from '@/components/ui/skeleton';

interface ChartTabProps {
  combinations?: MetricCombination[];
  isLoading?: boolean;
}

export default function ChartTab({ combinations = [], isLoading = false }: ChartTabProps) {
  return (
    <div className="w-full flex flex-col gap-4">
      {isLoading ? (
        <div className="flex flex-col gap-3">
          <Skeleton className="h-64 w-full" />
          <div className="flex gap-4">
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-4 w-24" />
            <Skeleton className="h-4 w-28" />
          </div>
        </div>
      ) : (
        <Chart combinations={combinations} />
      )}
      <div className="flex justify-between gap-5">
        <div className="flex gap-5">
          <p className="text-[rgba(110,127,136,1)] text-[11px]">Թարմացված է՝ 20/05/2024, 16:43</p>
          <p className="text-[rgba(110,127,136,1)] text-[11px]">
            Աղբյուրը՝ <span className="text-[rgba(39,81,153,1)]">Հղման անվանումը կարճ</span>
          </p>
        </div>
        <p className="text-[rgba(110,127,136,1)] text-[11px]">Դիտված է 1,343 անգամ</p>
      </div>
    </div>
  );
}
