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
import { TypographyH3 } from "@/components/ui/typography";
import { Input } from "@/components/ui/input";
import GlobalSearchResults from "@/components/site/stat/GlobalSearchResults";
import StatEmptyPlaceholder from "@/components/site/stat/StatEmptyPlaceholder";
import { useTranslation } from "@/hooks/useTranslation";
import { useLang } from "@/providers/LangProvider";
import { buildStatMenu } from "@/lib/stat-menu-utils";
import { useGlobalIndicatorSearchGroups } from "@/hooks/useGlobalIndicatorSearchGroups";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";

const SEARCH_DEBOUNCE_MS = 400;

export default function StatSearchPage() {
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
    if (!queryFromUrl.trim()) return undefined;
    return `/stat?q=${encodeURIComponent(queryFromUrl.trim())}`;
  }, [queryFromUrl]);

  const applySearch = useCallback(
    (value: string) => {
      const trimmed = value.trim();
      if (!trimmed) {
        if (queryFromUrl) router.replace("/stat/");
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
    <div className="flex w-full flex-col pt-7.5 pb-10 pl-16.75">
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
    </div>
  );
}
