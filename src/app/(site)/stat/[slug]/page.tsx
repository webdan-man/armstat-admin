"use client";

import { MarkdownText } from "@/components/site/MarkdownText";
import { TypographyH3, TypographyP } from "@/components/ui/typography";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import Image from "next/image";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectSeparator,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import ChartTab from "@/components/site/stat/ChartTab";
import SearchInput from "@/components/site/stat/SearchInput";
import TableTab from "@/components/site/stat/TableTab";
import React, { useState, useMemo } from "react";
import { useParams } from "next/navigation";
import useSWR from "swr";
import { useLang } from "@/providers/LangProvider";
import { buildStatMenu, isSlugInStatMenu } from "@/lib/stat-menu-utils";
import { formatIntegerWithCommas, sexTotalPercents } from "@/lib/format-integer";
import {
  getMetricById,
  getMetricCombinations,
  fetchMetricsByTopicId,
} from "@/services/metricsService";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import {
  headerForColumnIndex,
  maxRowLength,
  valueAtColumnIndex,
} from "@/components/indicators/metric-combinations-table-utils";

export default function StatPage() {
  const params = useParams();
  const slug = params.slug as string;
  const { activeLang } = useLang();

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? []), [sections]);
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
    if (sectionsReady && slugInTree) {
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
    selectedMetricId ? swrKeys.metricCombinations(selectedMetricId) : null,
    () => getMetricCombinations(selectedMetricId!)
  );

  const isLoading =
    !sectionsReady ||
    isTopicMetricsLoading ||
    (!!selectedMetricId && (isMetricLoading || isCombinationsLoading));

  const [columnSelectedValues, setColumnSelectedValues] = useState<(string | null)[]>([]);

  const columnCount = useMemo(() => maxRowLength(combinations), [combinations]);
  const columnIndexes = useMemo(
    () => Array.from({ length: columnCount }, (_, i) => i),
    [columnCount]
  );

  const ensureLength = (next: (string | null)[]) =>
    next.length >= columnCount
      ? next
      : Array.from({ length: columnCount }, (_, i) => next[i] ?? null);

  const activeFilterCount = useMemo(
    () => columnSelectedValues.reduce((sum, v) => sum + (v ? 1 : 0), 0),
    [columnSelectedValues]
  );

  const columnValueOptions = useMemo(() => {
    if (columnCount === 0) return [];
    return Array.from({ length: columnCount }, (_, ci) => {
      const uniq = new Set<string>();
      for (const combo of combinations) uniq.add(valueAtColumnIndex(combo, ci));
      return Array.from(uniq).sort((a, b) => a.localeCompare(b));
    });
  }, [columnCount, combinations]);

  const filteredCombinations = useMemo(() => {
    if (columnCount === 0) return combinations;
    const active = columnSelectedValues.map((v, i) => ({ i, v })).filter(({ v }) => Boolean(v));
    if (active.length === 0) return combinations;
    return combinations.filter((combo) =>
      active.every(({ i, v }) => valueAtColumnIndex(combo, i) === v)
    );
  }, [columnCount, columnSelectedValues, combinations]);

  const [query, setQuery] = useState<string>("");

  const shouldShowMetricPanel = Boolean(slug) && !isSectionSlug && !query;
  const metricUnit = metric?.unit?.[activeLang];

  const sexTotals = useMemo(() => {
    const male = Number(metric?.total?.male ?? 0);
    const female = Number(metric?.total?.female ?? 0);
    const hasTotals = male + female > 0;
    const percents = sexTotalPercents(male, female);
    return {
      hasTotals,
      male: {
        count: formatIntegerWithCommas(male),
        percent: `${percents.male}%`,
      },
      female: {
        count: formatIntegerWithCommas(female),
        percent: `${percents.female}%`,
      },
    };
  }, [metric?.total]);

  const sexTotalsPlaceholder = (
    <>
      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">-</p>
      <p className="text-[11px] text-[rgba(110,127,136,1)]">-</p>
    </>
  );

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      <TypographyH3 className="min-h-6 text-[rgba(40,40,40,1)]">
        {isSectionSlug ? (activeSection?.name ?? "") : (metric?.title?.[activeLang] ?? "")}
      </TypographyH3>
      <div className="mt-5 flex gap-3">
        <SearchInput query={query} setQuery={setQuery} />
        <Button
          onClick={() => {
            if (query) {
              setQuery("");
            }
          }}
          variant="secondary"
          size="icon"
          className="size-10.5 cursor-pointer"
        >
          <Image
            src={query ? "/icons/close.svg" : "/icons/search-blue.svg"}
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
                      <Skeleton className="h-3 w-10" />
                    </>
                  ) : sexTotals.hasTotals ? (
                    <>
                      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                        {sexTotals.male.count}
                      </p>
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        {sexTotals.male.percent}
                      </p>
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
                      <Skeleton className="h-3 w-10" />
                    </>
                  ) : sexTotals.hasTotals ? (
                    <>
                      <p className="text-fontSizeXS font-semibold text-[rgba(56,56,56,1)]">
                        {sexTotals.female.count}
                      </p>
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        {sexTotals.female.percent}
                      </p>
                    </>
                  ) : (
                    sexTotalsPlaceholder
                  )}
                </div>
              </div>
            </div>
            <div className="flex">
              <Button variant="ghost" className="flex items-center gap-1">
                <Image src={"/icons/download.svg"} alt="download" width={20} height={20} />
                <p className="text-link text-[12px] font-medium">Ներբեռնել</p>
              </Button>
              <Button variant="ghost" className="flex items-center gap-1">
                <Image src={"/icons/share.svg"} alt="share" width={20} height={20} />
                <p className="text-link text-[12px] font-medium">Կիսվել</p>
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
          <div className="mt-10 border-t border-[rgba(15,104,192,1)] bg-[rgba(241,245,248,1)] px-3 pt-4.25 pb-4.75">
            <div className="mb-3 flex items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <span className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
                  {activeFilterCount > 0 ? `Ֆիլտրեր (${activeFilterCount})` : "Ֆիլտրեր"}
                </span>
                <button
                  type="button"
                  className="text-xs font-medium text-[rgba(39,81,153,1)] hover:underline disabled:opacity-50"
                  disabled={activeFilterCount === 0}
                  onClick={() =>
                    setColumnSelectedValues(Array.from({ length: columnCount }, () => null))
                  }
                >
                  Մաքրել բոլորը
                </button>
              </div>
              <span className="text-[14px] leading-3.5 text-[rgba(44,44,44,0.65)]">
                {filteredCombinations.length} / {combinations.length}
              </span>
            </div>
            <div className="flex gap-4 overflow-x-auto">
              {columnIndexes.map((ci) => {
                const options = columnValueOptions[ci] ?? [];
                const selected = columnSelectedValues[ci] ?? null;
                const label = headerForColumnIndex(combinations, ci);
                return (
                  <Select
                    key={ci}
                    value={selected ?? "__all__"}
                    onValueChange={(val) =>
                      setColumnSelectedValues((prev) => {
                        const copy = ensureLength([...prev]);
                        copy[ci] = val === "__all__" ? null : val;
                        return copy;
                      })
                    }
                  >
                    <SelectTrigger className="h-9 border-none bg-transparent px-2 text-[rgba(44,44,44,1)] shadow-none">
                      <SelectValue placeholder={label} />
                    </SelectTrigger>
                    <SelectContent className="max-w-[30vw]">
                      <SelectGroup>
                        <SelectItem
                          value="__all__"
                          className="font-semibold text-[rgba(44,44,44,1)]"
                        >
                          {label}
                        </SelectItem>
                        <SelectSeparator className="bg-[rgba(178,178,178,1)]" />
                        {options.map((opt) => (
                          <SelectItem key={opt} value={opt}>
                            {opt}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                );
              })}
            </div>
          </div>
          <div className="mt-6 min-h-[975px] overflow-hidden rounded-2xl border border-[rgba(178,178,178,1)]">
            <Tabs defaultValue="diagram" className="w-full">
              <div className="flex h-11.75 w-full items-center justify-between gap-4 border-b border-b-[rgba(178,178,178,1)] px-5">
                <TabsList className="h-full w-auto flex-1 justify-start rounded-none border-0 bg-none p-0 shadow-none group-data-[orientation=horizontal]/tabs:h-11.75">
                  <TabsTrigger value="diagram" className="h-11.75 text-[rgba(40,40,40,1)]">
                    Գծապատկեր
                  </TabsTrigger>
                  <TabsTrigger value="data" className="h-11.75 font-medium text-[rgba(40,40,40,1)]">
                    Տվյալներ
                  </TabsTrigger>
                  <TabsTrigger
                    value="metadata"
                    className="h-11.75 font-medium text-[rgba(40,40,40,1)]"
                  >
                    Մետատվյալներ
                  </TabsTrigger>
                </TabsList>
                {metricUnit ? (
                  <p className="shrink-0 text-[12px] text-[rgba(131,131,131,1)]">
                    Չափման միավոր՝ {metricUnit}
                  </p>
                ) : null}
              </div>
              <TabsContent value="diagram">
                <div className="p-7.5">
                  <ChartTab
                    combinations={filteredCombinations}
                    isLoading={isLoading}
                    link={metric?.link?.[activeLang]}
                  />
                </div>
              </TabsContent>
              <TabsContent value="data">
                <div className="w-full px-7.5 py-5">
                  <TableTab
                    combinations={combinations}
                    filteredCombinations={filteredCombinations}
                    isLoading={isLoading}
                    link={metric?.link?.[activeLang]}
                    updatedAt={metric?.updatedAt}
                  />
                </div>
              </TabsContent>
              <TabsContent value="metadata">
                <div className="w-full p-6">
                  {(metric?.metadata as any)?.[activeLang] && (
                    <p className="text-fontSizeS mt-4 leading-4.75 whitespace-pre-line text-[rgba(125,125,125,1)]">
                      <MarkdownText>{(metric?.metadata as any)[activeLang]}</MarkdownText>
                    </p>
                  )}
                  <div className="mt-7.5 flex gap-5">
                    {metric?.updatedAt && (
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        Թարմացված է՝{" "}
                        {new Date(metric.updatedAt).toLocaleDateString("hy-AM", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })}
                      </p>
                    )}
                    {((metric?.metadata as any)?.[activeLang]?.sourceUrl ||
                      metric?.link?.[activeLang]) && (
                      <p className="text-[11px] text-[rgba(110,127,136,1)]">
                        Աղբյուրը՝{" "}
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
      ) : (
        <div className="flex h-[calc(100vh-304px)] w-full flex-col items-center justify-center">
          <div className="flex flex-col items-center justify-center gap-1">
            <Image src="/empty.png" alt="empty" width={210} height={112} />
            <p className="text-textBlack600 text-fontSizeS leading-7.25 font-medium">
              Որոնման արդյունքները կտեսնեք այստեղ
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
