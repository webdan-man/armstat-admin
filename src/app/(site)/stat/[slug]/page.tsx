"use client";

import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartTab from "@/components/site/stat/ChartTab";
import SearchInput from "@/components/site/stat/SearchInput";
import StatIndicatorList from "@/components/site/stat/StatIndicatorList";
import StatEmptyPlaceholder from "@/components/site/stat/StatEmptyPlaceholder";
import TableTab from "@/components/site/stat/TableTab";
import React, { useMemo } from "react";
import { useColumnFilters } from "@/components/metrics/useColumnFilters";
import { ColumnFilters } from "@/components/metrics/ColumnFilters";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "@/hooks/useTranslation";
import {
  buildStatMenu,
  isSlugInStatMenu,
  getStatMenuTitle,
  getFlatListItemsForSlug,
  getFlatListItemsForSection,
  isLeafTopicOrSubtopicSlug,
  getStatBackHrefForTopic,
  parseStatReturnTo,
} from "@/lib/stat-menu-utils";
import { getTopicListIndicatorGroups } from "@/lib/stat-search-utils";
import { useTopicListMetrics } from "@/hooks/useMetricsByTopicIds";
import {
  getMetricById,
  getMetricCombinations,
  downloadMetricCombinationsCSV,
  downloadMetricCombinationsPDF,
} from "@/services/metricsService";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { formatDisplayDate } from "@/lib/format-display-date";
import { pickLocale } from "@/lib/i18n";

export default function StatPage() {
  const params = useParams();
  const router = useRouter();
  const searchParams = useSearchParams();
  const returnTo = parseStatReturnTo(searchParams.get("returnTo"));
  const slug = params.slug as string;
  const { activeLang } = useLang();
  const { t } = useTranslation();

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? [], activeLang), [sections, activeLang]);
  const activeSection = useMemo(
    () => (sections ?? []).find((section) => section._id === slug),
    [sections, slug]
  );
  const sectionsReady = sections !== undefined;
  const slugInTree = useMemo(() => {
    if (!sectionsReady) return false;
    return isSlugInStatMenu(menu, slug);
  }, [sectionsReady, menu, slug]);

  const isLeafTopicOrSubtopic = useMemo(
    () => sectionsReady && isLeafTopicOrSubtopicSlug(menu, slug),
    [sectionsReady, menu, slug]
  );

  const listItems = useMemo(() => {
    if (!slugInTree) return [];
    if (activeSection) {
      return getFlatListItemsForSection(activeSection, activeLang);
    }
    return getFlatListItemsForSlug(menu, slug);
  }, [slugInTree, activeSection, activeLang, menu, slug]);
  const { data: listMetricsByTopicId = {}, isLoading: isListMetricsLoading } =
    useTopicListMetrics(listItems);

  const listGroups = useMemo(
    () => getTopicListIndicatorGroups(listItems, listMetricsByTopicId, activeLang),
    [listItems, listMetricsByTopicId, activeLang]
  );

  const selectedMetricId = useMemo(() => {
    if (!slug || !sectionsReady || slugInTree) return null;
    return slug;
  }, [slug, sectionsReady, slugInTree]);

  const { data: metric, isLoading: isMetricLoading } = useSWR(
    selectedMetricId ? swrKeys.metricForm(selectedMetricId) : null,
    () => getMetricById(selectedMetricId!)
  );
  const { data: combinations = [], isLoading: isCombinationsLoading } = useSWR(
    selectedMetricId ? swrKeys.metricCombinations(selectedMetricId, activeLang) : null,
    () => getMetricCombinations(selectedMetricId!, activeLang)
  );

  const isMetricDataLoading =
    !sectionsReady || (!!selectedMetricId && (isMetricLoading || isCombinationsLoading));

  const columnFilters = useColumnFilters(
    combinations,
    metric?.isCumulative,
    selectedMetricId ?? undefined
  );
  const { projectedCombinations } = columnFilters;

  const shouldShowBrowsableList = slugInTree && sectionsReady;
  const hasListIndicators = listGroups.some((group) => group.indicators.length > 0);
  const shouldShowMetricPanel = !slugInTree && sectionsReady && Boolean(slug);
  const metricUnit = metric?.unit?.[activeLang];

  const pageTitle = useMemo(() => {
    const menuTitle = getStatMenuTitle(menu, slug);
    if (menuTitle !== null) return menuTitle;
    if (metric?.topicId) {
      return getStatMenuTitle(menu, metric.topicId) ?? "";
    }
    return "";
  }, [menu, slug, metric?.topicId]);

  const hideHeaderForGroupIds = useMemo(() => (activeSection ? [] : [slug]), [activeSection, slug]);

  const metricBackHref = useMemo(() => {
    if (returnTo) return returnTo;
    if (!metric?.topicId || !sectionsReady) return null;
    return getStatBackHrefForTopic(menu, metric.topicId);
  }, [returnTo, metric?.topicId, sectionsReady, menu]);

  const sexTotals = useMemo(() => {
    const maleValue = metric?.total?.male?.[activeLang];
    const femaleValue = metric?.total?.female?.[activeLang];

    return {
      hasMale: Boolean(maleValue?.length),
      hasFemale: Boolean(femaleValue?.length),
      male: metric?.total?.male,
      female: metric?.total?.female,
    };
  }, [metric?.total, activeLang]);

  const showMaleTotal = isMetricLoading || sexTotals.hasMale;
  const showFemaleTotal = isMetricLoading || sexTotals.hasFemale;

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      {shouldShowMetricPanel ? (
        <button
          type="button"
          onClick={() => {
            if (metricBackHref) router.push(metricBackHref);
            else router.back();
          }}
          className="mb-5 flex cursor-pointer items-center gap-2 outline-none"
        >
          <Image src="/icons/backIcon.svg" alt="" width={7} height={11} aria-hidden />
          <span className="text-[14px] text-[rgba(125,125,125,1)]">
            {t("stat.back_to_previous", "Գնալ նախորդ էջ")}
          </span>
        </button>
      ) : null}
      <TypographyH3 className="min-h-6 text-[rgba(40,40,40,1)]">{pageTitle}</TypographyH3>
      {shouldShowMetricPanel ? (
        <div className="mt-5">
          <SearchInput />
        </div>
      ) : null}
      {shouldShowMetricPanel ? (
        <div className="mt-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              {showMaleTotal && showFemaleTotal ? (
                <>
                  <div className="flex items-center gap-3">
                    <Image src="/icons/man.svg" alt="man" width={17} height={27} />
                    <div className="flex flex-col gap-1">
                      {isMetricLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                          {sexTotals.male?.[activeLang]}
                        </p>
                      )}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <Image src="/icons/women.svg" alt="women" width={17} height={27} />
                    <div className="flex flex-col gap-1">
                      {isMetricLoading ? (
                        <Skeleton className="h-4 w-24" />
                      ) : (
                        <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                          {sexTotals.female?.[activeLang]}
                        </p>
                      )}
                    </div>
                  </div>
                </>
              ) : null}
            </div>
            <div className="flex">
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                disabled={!selectedMetricId}
                onClick={() => {
                  if (selectedMetricId)
                    void downloadMetricCombinationsPDF(
                      selectedMetricId,
                      metric
                        ? (pickLocale(metric.title, activeLang) ?? selectedMetricId)
                        : selectedMetricId,
                      activeLang
                    );
                }}
              >
                <Image src={"/icons/download.svg"} alt="download" width={20} height={20} />
                <p className="text-link text-[12px] font-medium">
                  {t("stat.download_pdf", "Ներբեռնել")}
                </p>
              </Button>

              <Button
                variant="ghost"
                className="flex items-center gap-1"
                disabled={!selectedMetricId}
                onClick={() => {
                  if (selectedMetricId)
                    void downloadMetricCombinationsCSV(
                      selectedMetricId,
                      metric
                        ? (pickLocale(metric.title, activeLang) ?? selectedMetricId)
                        : selectedMetricId,
                      activeLang
                    );
                }}
              >
                <Image src={"/icons/download.svg"} alt="download" width={20} height={20} />
                <p className="text-link text-[12px] font-medium">
                  {t("stat.download", "Ներբեռնել")}
                </p>
              </Button>
              <Button
                variant="ghost"
                className="flex items-center gap-1"
                onClick={async () => {
                  const url = window.location.href;
                  try {
                    await navigator.clipboard.writeText(url);
                    toast.success(t("stat.link_copied", "Հղումը պատճենված է"));
                  } catch {
                    toast.error(t("stat.link_copy_failed", "Չհաջողվեց պատճենել հղումը"));
                  }
                }}
              >
                <Image src={"/icons/share.svg"} alt="share" width={20} height={20} />
                <p className="text-link text-[12px] font-medium">{t("stat.share", "Կիսվել")}</p>
              </Button>
            </div>
          </div>
          {metric?.title?.[activeLang] && (
            <h5 className="mt-7.5 min-h-[27px] text-[18px] text-[rgba(0,0,0,1)]">
              {metric?.title?.[activeLang]}
            </h5>
          )}
          {metric?.description?.[activeLang] && (
            <TypographyP className="text-fontSizeS mt-3 min-h-[24px] leading-4.75 text-[rgba(125,125,125,1)]">
              <MarkdownText as="span">{metric.description[activeLang]}</MarkdownText>
            </TypographyP>
          )}
          <div className="mt-10 border-t border-[rgba(15,104,192,1)] pt-4.25">
            <ColumnFilters
              combinations={combinations}
              filters={columnFilters}
              totalCount={combinations.length}
              filteredCount={projectedCombinations.length}
            />
          </div>
          <div className="mt-6 overflow-x-hidden overflow-y-visible rounded-2xl border border-[rgba(178,178,178,1)]">
            <Tabs defaultValue="diagram" className="w-full">
              <div className="flex h-11.75 w-full items-center justify-between gap-4 border-b border-b-[rgba(178,178,178,1)] px-5">
                <TabsList className="h-full w-auto flex-1 justify-start rounded-none border-0 bg-none p-0 shadow-none group-data-[orientation=horizontal]/tabs:h-11.75">
                  <TabsTrigger value="diagram" className="h-11.75 text-[rgba(40,40,40,1)]">
                    {t("stat.tab_chart", "Գծապատկեր")}
                  </TabsTrigger>
                  <TabsTrigger value="data" className="h-11.75 font-medium text-[rgba(40,40,40,1)]">
                    {t("stat.tab_data", "Տվյալներ")}
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="h-11.75 font-medium text-[rgba(40,40,40,1)]"
                  >
                    {t("stat.tab_metadata", "Մետատվյալներ")}
                  </TabsTrigger>
                </TabsList>
                {metricUnit ? (
                  <p className="shrink-0 text-[12px] text-[rgba(131,131,131,1)]">
                    {t("stat.measurement_unit", "Չափման միավոր՝")} {metricUnit}
                  </p>
                ) : null}
              </div>
              <TabsContent value="diagram">
                <div className="p-7.5">
                  <ChartTab
                    combinations={projectedCombinations}
                    isCumulative={metric?.isCumulative}
                    isLoading={isMetricDataLoading}
                    link={metric?.link?.[activeLang]}
                    metricId={metric?._id}
                    viewCount={metric?.viewCount}
                    updatedAt={metric?.updatedAt}
                  />
                </div>
              </TabsContent>
              <TabsContent value="data">
                <div className="w-full px-7.5 py-5">
                  <TableTab
                    combinations={projectedCombinations}
                    isLoading={isMetricDataLoading}
                    link={metric?.link?.[activeLang]}
                    metricUnit={metric?.unit?.[activeLang]}
                    updatedAt={metric?.updatedAt}
                    viewCount={metric?.viewCount}
                  />
                </div>
              </TabsContent>
              <TabsContent value="metadata">
                <div className="w-full p-6">
                  {(metric?.metadata as any)?.[activeLang]?.body && (
                    <MarkdownText className="text-fontSizeM mt-4 leading-4.75 whitespace-pre-line text-black">
                      {(metric?.metadata as any)[activeLang].body}
                    </MarkdownText>
                  )}
                  <div className="mt-7.5 flex gap-5">
                    {metric?.updatedAt && (
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        {t("stat.updated_at", "Թարմացված է՝")}{" "}
                        {formatDisplayDate(metric.updatedAt, activeLang)}
                      </p>
                    )}
                    {((metric?.metadata as any)?.[activeLang]?.sourceUrl ||
                      metric?.link?.[activeLang]) && (
                      <p className="flex gap-1 text-[11px] text-[rgba(110,127,136,1)]">
                        {t("stat.source", "Աղբյուրը՝")}{" "}
                        <MarkdownText as={"span"}>
                          {(metric?.metadata as any)?.[activeLang]?.sourceUrl ??
                            metric?.link?.[activeLang]}
                        </MarkdownText>
                      </p>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>
          </div>
        </div>
      ) : shouldShowBrowsableList ? (
        isListMetricsLoading ? (
          <div className="mt-11 flex flex-col gap-4">
            <Skeleton className="h-12 w-full" />
            <Skeleton className="h-10 w-full" />
            <Skeleton className="h-10 w-full" />
          </div>
        ) : !hasListIndicators && isLeafTopicOrSubtopic ? (
          <StatEmptyPlaceholder />
        ) : (
          <StatIndicatorList groups={listGroups} hideHeaderForGroupIds={hideHeaderForGroupIds} />
        )
      ) : null}
    </div>
  );
}
