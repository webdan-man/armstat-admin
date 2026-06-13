"use client";

import { ChevronDown } from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import {
  buildSearchTreeRows,
  hasVisibleChildren,
  getGlobalSearchGroups,
  type SearchResultGroup,
  type SearchTreeRow,
} from "@/lib/stat-search-utils";
import { hasMenuChildren, type StatMenuItem } from "@/lib/stat-menu-utils";
import { cn } from "@/lib/utils";
import { useTranslation } from "@/hooks/useTranslation";

type GlobalSearchResultsProps = {
  menu: StatMenuItem[];
  query: string;
  onNavigate: () => void;
};

function groupRowsByTopLevel(rows: SearchTreeRow[]): SearchTreeRow[][] {
  const groups: SearchTreeRow[][] = [];
  let current: SearchTreeRow[] = [];

  for (const row of rows) {
    if (row.level === 0 && current.length > 0) {
      groups.push(current);
      current = [];
    }
    current.push(row);
  }

  if (current.length > 0) groups.push(current);

  return groups;
}

function SearchGroup({
  group,
  normalizedQuery,
  expandedIds,
  collapsedIds,
  onToggleExpand,
  onNavigateTo,
}: {
  group: SearchResultGroup;
  normalizedQuery: string;
  expandedIds: Set<string>;
  collapsedIds: Set<string>;
  onToggleExpand: (row: SearchTreeRow, useStructuralChildren: boolean) => void;
  onNavigateTo: (id: string) => void;
}) {
  const rows = useMemo(
    () =>
      buildSearchTreeRows(
        group.nodes,
        normalizedQuery,
        expandedIds,
        collapsedIds,
        group.showAllNodes,
        group.structuralLevel0 ?? group.showAllNodes
      ),
    [
      group.nodes,
      group.showAllNodes,
      group.structuralLevel0,
      normalizedQuery,
      expandedIds,
      collapsedIds,
    ]
  );

  if (rows.length === 0) return null;

  const topicGroups = groupRowsByTopLevel(rows);

  return (
    <div className="flex flex-col">
      <div
        className={cn(
          "text-textBlack800 border-t border-t-[rgba(15,104,192,1)] bg-[rgba(241,245,248,1)] px-4 text-sm font-medium",
          group.structuralLevel0 ? "py-4" : "py-2"
        )}
      >
        {group.header}
      </div>
      <div className="flex flex-col gap-[12px] pt-[11px]">
        {topicGroups.map((topicRows, groupIndex) => (
          <div key={`${group.headerId}-topic-${groupIndex}`} className="flex flex-col">
            {topicRows.map((row, index) => {
              const isFirstNested =
                row.level > 0 && (index === 0 || topicRows[index - 1].level < row.level);

              const canExpand = row.hasChildren && hasMenuChildren(row.item);

              return (
                <button
                  key={`${group.headerId}-${row.item.id}-${row.level}`}
                  type="button"
                  onClick={() => {
                    if (canExpand) {
                      onToggleExpand(row, group.showAllNodes ?? false);
                      return;
                    }
                    onNavigateTo(row.item.id);
                  }}
                  style={{ paddingLeft: 16 + row.level * 16 }}
                  className={cn(
                    "text-textBlack800 hover:bg-textBlack300/50 flex w-full cursor-pointer items-center gap-2 py-2 pr-4 text-left text-sm outline-hidden",
                    row.level > 0 && "bg-[rgba(241,245,248,1)]",
                    isFirstNested && "border-t border-t-[rgba(15,104,192,1)]"
                  )}
                >
                  <span className="flex-1">{row.item.title}</span>
                  {canExpand && (
                    <ChevronDown
                      className={cn(
                        "size-4 shrink-0 transition-transform",
                        row.expanded ? "" : "-rotate-90"
                      )}
                    />
                  )}
                </button>
              );
            })}
          </div>
        ))}
      </div>
    </div>
  );
}

export default function GlobalSearchResults({ menu, query, onNavigate }: GlobalSearchResultsProps) {
  const router = useRouter();
  const { t } = useTranslation();
  const normalizedQuery = query.trim().toLowerCase();
  const [expandedIds, setExpandedIds] = useState<Set<string>>(() => new Set());
  const [collapsedIds, setCollapsedIds] = useState<Set<string>>(() => new Set());

  useEffect(() => {
    setExpandedIds(new Set());
    setCollapsedIds(new Set());
  }, [normalizedQuery]);

  const groups = useMemo(
    () => getGlobalSearchGroups(menu, normalizedQuery),
    [menu, normalizedQuery]
  );

  const navigateTo = (id: string) => {
    onNavigate();
    router.push(`/stat/${id}`);
  };

  const toggleExpand = (row: SearchTreeRow, useStructuralChildren: boolean) => {
    const autoExpanded =
      !useStructuralChildren &&
      normalizedQuery !== "" &&
      hasVisibleChildren(row.item, normalizedQuery);

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

  return (
    <div className="mt-11 flex w-full flex-col gap-8">
      {groups.map((group) => (
        <SearchGroup
          key={group.headerId}
          group={group}
          normalizedQuery={normalizedQuery}
          expandedIds={expandedIds}
          collapsedIds={collapsedIds}
          onToggleExpand={toggleExpand}
          onNavigateTo={navigateTo}
        />
      ))}
      {groups.length === 0 && (
        <p className="text-textBlack600 text-fontSizeS py-8 text-center font-medium">
          {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
        </p>
      )}
    </div>
  );
}
