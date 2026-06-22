"use client";

import { useMemo } from "react";
import useSWR from "swr";
import { fetchMetricsByTopicId } from "@/services/metricsService";
import type { MetricSelectOption } from "@/types/metric";
import type { StatMenuItem } from "@/lib/stat-menu-utils";

export function useMetricsByTopicIds(topicIds: string[]) {
  const metricsKey =
    topicIds.length > 0 ? (["metrics-by-topic-ids", ...topicIds] as const) : null;

  return useSWR<Record<string, MetricSelectOption[]>>(
    metricsKey,
    async () => {
      const entries = await Promise.all(
        topicIds.map(
          async (topicId) =>
            [topicId, await fetchMetricsByTopicId(topicId, { published: true })] as const
        )
      );
      return Object.fromEntries(entries);
    }
  );
}

export function useTopicListMetrics(menuItems: StatMenuItem[]) {
  const topicIds = useMemo(() => menuItems.map((item) => item.id), [menuItems]);
  return useMetricsByTopicIds(topicIds);
}
