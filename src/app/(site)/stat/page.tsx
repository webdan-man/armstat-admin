"use client";

import { useMemo } from "react";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH3 } from "@/components/ui/typography";
import StatIndicatorList from "@/components/site/stat/StatIndicatorList";
import useSWR from "swr";
import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildStatMenu,
  getFlatListItemsForSlug,
  getFlatListItemsForSection,
  getStatMenuTitle,
} from "@/lib/stat-menu-utils";
import { getTopicListIndicatorGroups } from "@/lib/stat-search-utils";
import { useTopicListMetrics } from "@/hooks/useMetricsByTopicIds";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";

export default function StatCatalogPage() {
  const { activeLang } = useLang();
  const { t } = useTranslation();

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? [], activeLang), [sections, activeLang]);
  const activeSection = sections?.[0];

  const listItems = useMemo(
    () => (activeSection ? getFlatListItemsForSection(activeSection, activeLang) : []),
    [activeSection, activeLang]
  );

  const { data: listMetricsByTopicId = {}, isLoading: isListMetricsLoading } =
    useTopicListMetrics(listItems);

  const listGroups = useMemo(
    () => getTopicListIndicatorGroups(listItems, listMetricsByTopicId, activeLang),
    [listItems, listMetricsByTopicId, activeLang]
  );

  const pageTitle = useMemo(() => {
    if (!activeSection) return t("stat.catalog_title", "Կատալոգ");
    return getStatMenuTitle(menu, activeSection._id) ?? t("stat.catalog_title", "Կատալոգ");
  }, [menu, activeSection, t]);

  const sectionsReady = sections !== undefined;

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      <TypographyH3 className="min-h-6 text-[rgba(40,40,40,1)]">{pageTitle}</TypographyH3>
      {!sectionsReady || isListMetricsLoading ? (
        <div className="mt-11 flex flex-col gap-4">
          <Skeleton className="h-12 w-full" />
          <Skeleton className="h-10 w-full" />
          <Skeleton className="h-10 w-full" />
        </div>
      ) : (
        <StatIndicatorList groups={listGroups} />
      )}
    </div>
  );
}
