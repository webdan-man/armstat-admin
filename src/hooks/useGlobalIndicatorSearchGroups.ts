"use client";

import { useMemo } from "react";
import useSWR from "swr";

import { useTranslation } from "@/hooks/useTranslation";
import { collectTopicIdsFromMenu, type StatMenuItem } from "@/lib/stat-menu-utils";
import {
  getGlobalIndicatorSearchGroups,
  type IndicatorSearchGroup,
} from "@/lib/stat-search-utils";
import { fetchMetricsByTopicId } from "@/services/metricsService";
import type { MetricSelectOption } from "@/types/metric";

export function useGlobalIndicatorSearchGroups(
  menu: StatMenuItem[],
  query: string,
  enabled: boolean
): IndicatorSearchGroup[] {
  const { activeLang } = useTranslation();
  const normalizedQuery = query.trim().toLowerCase();

  const topicIds = useMemo(() => collectTopicIdsFromMenu(menu), [menu]);

  const metricsKey =
    enabled && normalizedQuery && topicIds.length > 0
      ? (["global-indicator-search", ...topicIds] as const)
      : null;

  const { data: metricsByTopicId = {} } = useSWR<Record<string, MetricSelectOption[]>>(
    metricsKey,
    async () => {
      const entries = await Promise.all(
        topicIds.map(async (topicId) => [topicId, await fetchMetricsByTopicId(topicId)] as const)
      );
      return Object.fromEntries(entries);
    }
  );

  return useMemo(
    () =>
      enabled
        ? getGlobalIndicatorSearchGroups(menu, metricsByTopicId, normalizedQuery, activeLang)
        : [],
    [enabled, menu, metricsByTopicId, normalizedQuery, activeLang]
  );
}
