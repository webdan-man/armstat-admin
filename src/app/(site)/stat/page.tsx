"use client";

import {
  useMemo,
  useState,
  useEffect,
  useCallback,
  type FormEvent,
  type KeyboardEvent,
} from "react";
import { useRouter, useSearchParams } from "next/navigation";
import useSWR from "swr";
import { Skeleton } from "@/components/ui/skeleton";
import { TypographyH3 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import StatIndicatorList from "@/components/site/stat/StatIndicatorList";
import GlobalSearchResults from "@/components/site/stat/GlobalSearchResults";
import StatEmptyPlaceholder from "@/components/site/stat/StatEmptyPlaceholder";
import { useTranslation } from "@/hooks/useTranslation";
import { useLang } from "@/providers/LangProvider";
import {
  buildStatMenu,
  getFlatListItemsForSection,
  getStatMenuTitle,
} from "@/lib/stat-menu-utils";
import { getTopicListIndicatorGroups } from "@/lib/stat-search-utils";
import { useGlobalIndicatorSearchGroups } from "@/hooks/useGlobalIndicatorSearchGroups";
import { useTopicListMetrics } from "@/hooks/useMetricsByTopicIds";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";

const SEARCH_DEBOUNCE_MS = 400;

function StatCatalogView() {
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
    <>
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
    </>
  );
}

function StatSearchView() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const queryFromUrl = searchParams.get("q") ?? "";
  const { activeLang } = useLang();
  const { t } = useTranslation();

  const [inputValue, setInputValue] = useState(queryFromUrl);

  useEffect(() => {
    setInputValue(queryFromUrl);
  }, [queryFromUrl]);

  const { data: sections } = useSWR(swrKeys.sections, fetchSections);
  const menu = useMemo(() => buildStatMenu(sections ?? [], activeLang), [sections, activeLang]);

  const normalizedQuery = queryFromUrl.trim().toLowerCase();
  const globalSearchGroups = useGlobalIndicatorSearchGroups(menu, normalizedQuery, true);
  const hasQuery = normalizedQuery.length > 0;
  const searchReturnTo = useMemo(() => {
    if (!queryFromUrl.trim()) return "/stat/?search";
    return `/stat?q=${encodeURIComponent(queryFromUrl.trim())}`;
  }, [queryFromUrl]);

  const applySearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        router.replace("/stat/?search");
        return;
      }
      if (trimmed === queryFromUrl.trim()) return;
      router.replace(`/stat?q=${encodeURIComponent(trimmed)}`);
    },
    [queryFromUrl, router]
  );

  useEffect(() => {
    if (inputValue.trim() === queryFromUrl.trim()) return;

    const timeoutId = window.setTimeout(() => {
      applySearch(inputValue);
    }, SEARCH_DEBOUNCE_MS);

    return () => window.clearTimeout(timeoutId);
  }, [inputValue, queryFromUrl, applySearch]);

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    applySearch(inputValue);
  };

  const handleKeyDown = (event: KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      event.preventDefault();
      applySearch(inputValue);
    }
  };

  return (
    <>
      <TypographyH3 className="min-h-6 text-[rgba(40,40,40,1)]">
        {t("stat.search_page_title", "Որոնեք Ձեզ հետաքրքրող ցուցանիշը")}
      </TypographyH3>
      <form onSubmit={handleSubmit} className="mt-5 w-full">
        <Input
          value={inputValue}
          onChange={(event) => setInputValue(event.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={t("stat.search_action", "Որոնել")}
          className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none"
        />
      </form>
      {hasQuery ? (
        <GlobalSearchResults
          groups={globalSearchGroups}
          onNavigate={() => {}}
          returnTo={searchReturnTo}
        />
      ) : (
        <StatEmptyPlaceholder />
      )}
    </>
  );
}

export default function StatPage() {
  const searchParams = useSearchParams();
  const isSearchMode = searchParams.has("q") || searchParams.has("search");

  return (
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
      {isSearchMode ? <StatSearchView /> : <StatCatalogView />}
    </div>
  );
}
