"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxInput,
  ComboboxList,
} from "@/components/ui/combobox";
import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { ChevronDown } from "lucide-react";
import { fetchSections } from "@/services/sectionsService";
import { getMetricById } from "@/services/metricsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import {
  buildStatMenu,
  getStatMenuTitle,
  isSlugInStatMenu,
  type StatMenuItem,
} from "@/lib/stat-menu-utils";
import {
  buildSearchTreeRows,
  hasVisibleChildren,
  type SearchTreeRow,
} from "@/lib/stat-search-utils";
import { useTranslation } from "@/hooks/useTranslation";
import { pickLocale } from "@/lib/i18n";
import { cn } from "@/lib/utils";

/** Returns the section whose subtree contains the given id (topic/subtopic). */
function findSectionForId(menu: StatMenuItem[], id: string): StatMenuItem | undefined {
  const containsId = (items: StatMenuItem[]): boolean => {
    for (const item of items) {
      if (item.id === id) return true;
      if (item.children?.length && containsId(item.children)) return true;
    }
    return false;
  };

  for (const section of menu) {
    if (section.id === id || containsId(section.children ?? [])) {
      return section;
    }
  }
  return undefined;
}

type VisibleRow = SearchTreeRow;

export default function SearchInput({
  query,
  setQuery,
  open,
  onOpenChange,
  globalMode = false,
}: {
  query: string;
  setQuery: (v: string) => void;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
  globalMode?: boolean;
}) {
  const { t, activeLang } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const menu = useMemo(() => buildStatMenu(sections, activeLang), [sections, activeLang]);
  const slugInTree = useMemo(
    () => sections.length > 0 && isSlugInStatMenu(menu, slug),
    [menu, slug, sections.length]
  );

  const { data: activeMetric } = useSWR(
    slug && sections.length > 0 && !slugInTree ? swrKeys.metricForm(slug) : null,
    () => getMetricById(slug)
  );

  const activeSection = useMemo(() => {
    if (!menu.length) return undefined;
    const direct = findSectionForId(menu, slug);
    if (direct) return direct;
    if (activeMetric?.topicId) return findSectionForId(menu, activeMetric.topicId);
    return undefined;
  }, [menu, slug, activeMetric]);

  const treeItems = useMemo(() => activeSection?.children ?? [], [activeSection]);

  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  const normalizedQuery = query.trim().toLowerCase();

  useEffect(() => {
    setExpandedIds(new Set());
    setCollapsedIds(new Set());
  }, [normalizedQuery]);

  const visibleRows = useMemo(
    () => buildSearchTreeRows(treeItems, normalizedQuery, expandedIds, collapsedIds),
    [treeItems, normalizedQuery, expandedIds, collapsedIds]
  );

  const currentLabel = useMemo(() => {
    const menuTitle = getStatMenuTitle(menu, slug);
    if (menuTitle) return menuTitle;
    return activeMetric ? (pickLocale(activeMetric.title, activeLang) ?? "") : "";
  }, [menu, slug, activeMetric, activeLang]);

  const [isFocused, setIsFocused] = useState(false);
  const inputValue = isFocused ? query : query !== "" ? query : currentLabel;

  const toggleExpand = (row: VisibleRow) => {
    const autoExpanded =
      normalizedQuery !== "" && hasVisibleChildren(row.item, normalizedQuery);

    if (autoExpanded) {
      setCollapsedIds((prev) => {
        const next = new Set(prev);
        if (next.has(row.item.id)) next.delete(row.item.id);
        else next.add(row.item.id);
        return next;
      });
      return;
    }

    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(row.item.id)) next.delete(row.item.id);
      else next.add(row.item.id);
      return next;
    });
  };

  const handleRowClick = (row: VisibleRow) => {
    if (row.hasChildren) {
      toggleExpand(row);
      onOpenChange?.(true);
      return;
    }

    navigateTo(row.item.id);
  };

  const navigateTo = (id: string) => {
    setQuery("");
    onOpenChange?.(false);
    router.push(`/stat/${id}`);
  };

  return (
    <Combobox
      open={globalMode ? false : open}
      onOpenChange={(nextOpen) => {
        if (!globalMode) onOpenChange?.(nextOpen);
      }}
      inputValue={inputValue}
      onInputValueChange={(value, details) => {
        const reason = details.reason;
        if (reason === "input-change" || reason === "input-clear") {
          setQuery(value);
        }
      }}
    >
      <ComboboxInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none"
        placeholder={t("stat.search_placeholder", "Փնտրել")}
      />
      {!globalMode && (
        <ComboboxContent>
          <ComboboxList>
            {visibleRows.length === 0 ? (
              <div className="flex w-full justify-center py-4 text-center text-sm text-muted-foreground">
                {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
              </div>
            ) : (
              visibleRows.map((row, index) => {
                const isActive = row.item.id === slug;
                const isFirstNested =
                  row.level > 0 && (index === 0 || visibleRows[index - 1].level < row.level);

                return (
                  <button
                    key={row.item.id}
                    type="button"
                    onMouseDown={(event) => event.preventDefault()}
                    onClick={(event) => {
                      event.stopPropagation();
                      handleRowClick(row);
                    }}
                    style={{ paddingLeft: 8 + row.level * 16 }}
                    className={cn(
                      "flex w-full cursor-pointer items-center gap-2 border-b border-b-[rgba(193,192,192,1)] pr-4 pt-4 pb-5 text-left text-sm text-textBlack800 outline-hidden hover:bg-textBlack300/50",
                      row.level > 0 && "bg-[rgba(241,245,248,1)]",
                      isFirstNested && "border-t border-t-[rgba(15,104,192,1)]",
                      isActive && "font-semibold text-[rgba(15,104,192,1)]"
                    )}
                  >
                    <span className="flex-1">{row.item.title}</span>
                    {row.hasChildren && (
                      <ChevronDown
                        className={cn(
                          "size-4 shrink-0 transition-transform",
                          row.expanded ? "" : "-rotate-90"
                        )}
                      />
                    )}
                  </button>
                );
              })
            )}
          </ComboboxList>
        </ComboboxContent>
      )}
    </Combobox>
  );
}
