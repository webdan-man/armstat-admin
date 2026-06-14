"use client";

import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import ChartTab from "@/components/site/stat/ChartTab";
import SearchInput from "@/components/site/stat/SearchInput";
import GlobalSearchResults from "@/components/site/stat/GlobalSearchResults";
import TableTab from "@/components/site/stat/TableTab";
import React, { useState, useMemo } from "react";
import { useColumnFilters } from "@/components/metrics/useColumnFilters";
import { ColumnFilters } from "@/components/metrics/ColumnFilters";
import { useParams } from "next/navigation";
import { toast } from "sonner";
import useSWR from "swr";
import { useLang } from "@/providers/LangProvider";
import { useTranslation } from "@/hooks/useTranslation";
import { buildStatMenu, isSlugInStatMenu, getStatMenuTitle } from "@/lib/stat-menu-utils";
import { useGlobalIndicatorSearchGroups } from "@/hooks/useGlobalIndicatorSearchGroups";
import {
  getMetricById,
  getMetricCombinations,
  fetchMetricsByTopicId,
  downloadMetricCombinationsCSV,
  downloadMetricCombinationsPDF,
} from "@/services/metricsService";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { pickLocale } from "@/lib/i18n";

export default function StatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { activeLang } = useLang();
  const { t } = useTranslation();

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? [], activeLang), [sections, activeLang]);
  const activeSection = useMemo(
    () => (sections ?? []).find((section) => section._id === slug),
    [sections, slug]
  );
  const isSectionSlug = Boolean(activeSection);
  const sectionsReady = sections !== undefined;
  const slugInTree = useMemo(() => {
    if (!sectionsReady) return false;
    return isSlugInStatMenu(menu, slug);
  }, [sectionsReady, menu, slug]);
  const shouldLoadTopicMetrics = Boolean(slug) && sectionsReady && !isSectionSlug && slugInTree;

  const { data: topicMetrics = [], isLoading: isTopicMetricsLoading } = useSWR(
    shouldLoadTopicMetrics ? swrKeys.metricsByTopic(slug) : null,
    () => fetchMetricsByTopicId(slug)
  );

  const selectedMetricId = useMemo(() => {
    if (!slug || isSectionSlug) return null;
    // Wait for sections so we can tell whether the slug is a topic id or a bare
    // metric id. Returning `slug` early fires requests against /api/metrics/<topicId>
    // which 404 until the topic resolves to its real metric id.
    if (!sectionsReady) return null;
    if (slugInTree) {
      if (topicMetrics.length > 0) return topicMetrics[0].id;
      return null;
    }
    return slug;
  }, [slug, isSectionSlug, sectionsReady, slugInTree, topicMetrics]);

  const { data: metric, isLoading: isMetricLoading } = useSWR(
    selectedMetricId ? swrKeys.metricForm(selectedMetricId) : null,
    () => getMetricById(selectedMetricId!)
  );
  const { data: combinations = [], isLoading: isCombinationsLoading } = useSWR(
    selectedMetricId ? swrKeys.metricCombinations(selectedMetricId, activeLang) : null,
    () => getMetricCombinations(selectedMetricId!, activeLang)
  );

  const isLoading =
    !sectionsReady ||
    isTopicMetricsLoading ||
    (!!selectedMetricId && (isMetricLoading || isCombinationsLoading));

  const columnFilters = useColumnFilters(
    combinations,
    metric?.isCumulative,
    selectedMetricId ?? undefined
  );
  const { projectedCombinations } = columnFilters;

  const [query, setQuery] = useState<string>("");
  const [isGlobalSearch, setIsGlobalSearch] = useState<boolean>(false);

  const normalizedQuery = query.trim().toLowerCase();
  const globalSearchGroups = useGlobalIndicatorSearchGroups(menu, normalizedQuery, isGlobalSearch);

  const shouldShowGlobalResults =
    isGlobalSearch && normalizedQuery.length > 0 && globalSearchGroups.length > 0;
  const shouldShowPlaceholder = isGlobalSearch && !shouldShowGlobalResults;
  const shouldShowMetricPanel = Boolean(slug) && !isSectionSlug && !isGlobalSearch;
  const metricUnit = metric?.unit?.[activeLang];

  const pageTitle = useMemo(() => {
    const menuTitle = getStatMenuTitle(menu, slug);
    if (menuTitle !== null) return menuTitle;
    return metric?.title?.[activeLang] ?? "";
  }, [menu, slug, metric, activeLang]);

  const sexTotals = useMemo(() => {
    const hasTotals =
      !!metric?.total?.femalePercentage?.length || !!metric?.total?.malePercentage?.length;

    return {
      hasTotals,
      male: metric?.total?.malePercentage,
      female: metric?.total?.femalePercentage,
    };
  }, [metric?.total]);

  const sexTotalsPlaceholder = (
    <>
      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">-</p>
    </>
  );

  const exitGlobalSearch = () => {
    setIsGlobalSearch(false);
    setQuery("");
  };

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      <TypographyH3 className="min-h-6 text-[rgba(40,40,40,1)]">{pageTitle}</TypographyH3>
      <div className="mt-5 flex items-start gap-3">
        <SearchInput query={query} setQuery={setQuery} globalMode={isGlobalSearch} />
        <Button
          onClick={() => {
            if (isGlobalSearch) {
              exitGlobalSearch();
            } else {
              setIsGlobalSearch(true);
            }
          }}
          variant="secondary"
          size="icon"
          className="size-10.5 cursor-pointer"
        >
          <Image
            src={isGlobalSearch ? "/icons/close.svg" : "/icons/search-blue.svg"}
            alt="search"
            width={24}
            height={24}
          />
        </Button>
      </div>
      {shouldShowMetricPanel ? (
        <div className="mt-6 flex flex-col">
          <div className="flex items-center justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-3">
                <Image src="/icons/man.svg" alt="man" width={17} height={27} />
                <div className="flex flex-col gap-1">
                  {isMetricLoading ? (
                    <>
                      <Skeleton className="h-4 w-24" />
                      {/*<Skeleton className="h-3 w-10" />*/}
                    </>
                  ) : sexTotals.hasTotals ? (
                    <>
                      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                        {sexTotals.male}
                      </p>
                      {/*<p className="text-[11px] text-[rgba(110,127,136,1)]">*/}
                      {/*  {sexTotals.male.percent}*/}
                      {/*</p>*/}
                    </>
                  ) : (
                    sexTotalsPlaceholder
                  )}
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Image src="/icons/women.svg" alt="women" width={17} height={27} />
                <div className="flex flex-col gap-1">
                  {isMetricLoading ? (
                    <>
                      <Skeleton className="h-4 w-24" />
                      {/*<Skeleton className="h-3 w-10" />*/}
                    </>
                  ) : sexTotals.hasTotals ? (
                    <>
                      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                        {sexTotals.female}
                      </p>
                      {/*<p className="text-[11px] text-[rgba(110,127,136,1)]">*/}
                      {/*  {sexTotals.female.percent}*/}
                      {/*</p>*/}
                    </>
                  ) : (
                    sexTotalsPlaceholder
                  )}
                </div>
              </div>
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
          <div className="mt-6 overflow-hidden rounded-2xl border border-[rgba(178,178,178,1)]">
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
                    isLoading={isLoading}
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
                    isLoading={isLoading}
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
                    <p className="text-fontSizeS mt-4 leading-4.75 whitespace-pre-line text-[rgba(125,125,125,1)]">
                      <MarkdownText>{(metric?.metadata as any)[activeLang].body}</MarkdownText>
                    </p>
                  )}
                  <div className="mt-7.5 flex gap-5">
                    {metric?.updatedAt && (
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        {t("stat.updated_at", "Թարմացված է՝")}{" "}
                        {new Date(metric.updatedAt).toLocaleDateString("hy-AM", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {((metric?.metadata as any)?.[activeLang]?.sourceUrl ||
                      metric?.link?.[activeLang]) && (
                      <p className="flex text-[11px] text-[rgba(110,127,136,1)]">
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
      ) : shouldShowGlobalResults ? (
        <GlobalSearchResults groups={globalSearchGroups} onNavigate={exitGlobalSearch} />
      ) : (
        <div className="flex h-[calc(100vh-304px)] w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <Image src="/empty.png" alt="empty" width={210} height={112} />
            <p className="text-textBlack600 text-fontSizeS leading-7.25 font-medium">
              {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
