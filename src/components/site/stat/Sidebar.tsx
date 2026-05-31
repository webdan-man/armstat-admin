"use client";

import React, { useState, useEffect, useLayoutEffect, useMemo, useRef } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR, { preload } from "swr";
import { fetchSections } from "@/services/sectionsService";
import { fetchMetricsByTopicId, getMetricById } from "@/services/metricsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { Skeleton } from "@/components/ui/skeleton";
import { buildStatMenu, isSlugInStatMenu, type StatMenuItem } from "@/lib/stat-menu-utils";
import { useTranslation } from "@/hooks/useTranslation";

type MenuItem = StatMenuItem;

/** Returns the expandedPath needed to make activeSlug visible in the tree. */
function findExpandedPath(items: MenuItem[], activeSlug: string, depth = 0): string[] {
  for (const item of items) {
    if (item.id === activeSlug && item.children?.length) {
      return [item.id];
    }
    if (!item.children?.length) continue;
    for (const child of item.children) {
      if (child.id === activeSlug) {
        // child is directly inside item — we only need to expand item
        return [item.id];
      }
      // recurse into grandchildren
      if (child.children?.length) {
        for (const grand of child.children) {
          if (grand.id === activeSlug) {
            return [item.id, child.id];
          }
        }
      }
    }
  }
  return [];
}

function expandedPathForSlug(
  menu: MenuItem[],
  activeSlug: string,
  activeTopicId: string | null
): string[] {
  if (!menu.length || !activeSlug) return [];

  // Section has no nested content — only expand the section row, not topics/subtopics.
  if (menu.some((section) => section.id === activeSlug)) {
    return [activeSlug];
  }

  const path = findExpandedPath(menu, activeSlug);
  if (path.length) return [...path, activeSlug];

  if (activeTopicId) {
    const topicPath = findExpandedPath(menu, activeTopicId);
    if (topicPath.length) return [...topicPath, activeTopicId];
  }

  return [];
}

function pathsEqual(a: string[], b: string[]): boolean {
  return a.length === b.length && a.every((id, index) => id === b[index]);
}

function resolveExpandedPathOnClick(
  menu: MenuItem[],
  itemId: string,
  level: number,
  currentPath: string[]
): string[] {
  if (level === 0 && currentPath[level] === itemId) {
    return [];
  }

  const nextPath = currentPath.slice(0, level);
  nextPath[level] = itemId;
  const autoForItem = expandedPathForSlug(menu, itemId, null);
  return autoForItem.length > nextPath.length ? autoForItem : nextPath;
}

function hasActiveDescendant(item: MenuItem, activeSlug: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => child.id === activeSlug || hasActiveDescendant(child, activeSlug)
  );
}

const SIDEBAR_ROW_BORDER = "border-[rgba(228,228,228,1)]";

const SIDEBAR_SKELETON_ROWS = 14;

function SidebarSkeleton() {
  return (
    <aside className="sticky top-0 flex min-h-screen w-full flex-col self-start">
      <div className="flex w-full shrink-0 px-4 py-7.5">
        <Skeleton className="h-6 w-28" />
      </div>
      <nav className="flex min-h-0 flex-1 flex-col">
        {Array.from({ length: SIDEBAR_SKELETON_ROWS }, (_, index) => (
          <Skeleton
            key={index}
            className={`h-14 w-full shrink-0 rounded-none ${index > 0 ? "mt-px" : ""}`}
          />
        ))}
        <Skeleton className="mt-px min-h-0 flex-1 rounded-none" />
      </nav>
    </aside>
  );
}

type MenuListProps = {
  items: MenuItem[];
  level?: number;
  expandedPath: string[];
  onNavigate: (itemId: string, level: number, canExpand: boolean) => void;
  activeSlug: string;
  /** topicId that owns the currently active metric (null when activeSlug is a topic/section). */
  activeTopicId?: string | null;
};

function MenuList({
  items,
  level = 0,
  expandedPath,
  onNavigate,
  activeSlug,
  activeTopicId,
}: MenuListProps) {
  return (
    <ul className="flex w-full flex-col">
      {items.map((item, index) => {
        const hasSubtopics = !!item.children?.length;
        const canExpand = hasSubtopics;
        const isExpanded = expandedPath[level] === item.id;
        const isActive = item.id === activeSlug;
        const activeChild =
          hasActiveDescendant(item, activeSlug) ||
          (activeTopicId
            ? item.id === activeTopicId || hasActiveDescendant(item, activeTopicId)
            : false);

        const showActive = isActive || activeChild;
        const showsNestedContent = hasSubtopics && isExpanded;
        const rowBorderBottom =
          (level === 0 && !isExpanded) || (level > 0 && !showsNestedContent)
            ? `border-b ${SIDEBAR_ROW_BORDER}`
            : "";

        return (
          <li
            key={item.id}
            className={`w-full ${level > 0 && index === 0 ? `border-t ${SIDEBAR_ROW_BORDER}` : ""}`}
          >
            <button
              onClick={() => onNavigate(item.id, level, canExpand)}
              style={{ paddingLeft: 16 + level * 16 }}
              className={`text-fontSizeXS flex w-full cursor-pointer items-center justify-between py-4 pr-4 text-left ${level > 0 ? `bg-[rgba(241,245,248,1)] font-semibold ${rowBorderBottom}` : rowBorderBottom} ${
                showActive
                  ? level > 0
                    ? "border-r-6 border-r-[rgba(22,81,149,1)] text-[rgba(15,104,192,1)]"
                    : "text-textBlack100 bg-[rgba(57,127,206,1)] font-semibold"
                  : "text-[rgba(55,55,55,1)]"
              } `}
            >
              {item.title}
            </button>

            {hasSubtopics && isExpanded && (
              <MenuList
                items={item.children!}
                level={level + 1}
                expandedPath={expandedPath}
                onNavigate={onNavigate}
                activeSlug={activeSlug}
                activeTopicId={activeTopicId}
              />
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function Sidebar() {
  const { t } = useTranslation();
  const params = useParams();
  const router = useRouter();
  const activeSlug = params.slug as string;

  const [pendingSlug, setPendingSlug] = useState<string | null>(null);
  const [overrideExpandedPath, setOverrideExpandedPath] = useState<string[] | null>(null);
  const [collapsedSectionIds, setCollapsedSectionIds] = useState<Set<string>>(() => new Set());

  const effectiveSlug = pendingSlug ?? activeSlug;

  const { data: sections, isLoading: isSectionsLoading } = useSWR(swrKeys.sections, fetchSections);

  const isSidebarLoading = isSectionsLoading || sections === undefined;
  const menu = useMemo(() => buildStatMenu(sections ?? []), [sections]);

  // Once sections load, check whether the active slug belongs to the tree.
  // If it doesn't, it's a metricId — fetch the metric to resolve its topicId.
  const slugInTree = useMemo(
    () => (!menu.length ? true : isSlugInStatMenu(menu, effectiveSlug)),
    [menu, effectiveSlug]
  );

  const { data: activeMetric } = useSWR(
    effectiveSlug && !slugInTree ? swrKeys.metricForm(effectiveSlug) : null,
    () => getMetricById(effectiveSlug),
    { keepPreviousData: false }
  );
  const activeTopicId = slugInTree ? null : (activeMetric?.topicId ?? null);

  const autoExpandedPath = useMemo(
    () => expandedPathForSlug(menu, effectiveSlug, activeTopicId),
    [menu, effectiveSlug, activeTopicId]
  );

  const isSectionCollapsed = useMemo(
    () =>
      menu.some((section) => section.id === effectiveSlug) &&
      collapsedSectionIds.has(effectiveSlug),
    [menu, effectiveSlug, collapsedSectionIds]
  );

  const expandedPath = isSectionCollapsed ? [] : (overrideExpandedPath ?? autoExpandedPath);

  const expandedPathRef = useRef(expandedPath);
  expandedPathRef.current = expandedPath;

  useLayoutEffect(() => {
    if (pendingSlug !== null && pendingSlug === activeSlug) {
      setPendingSlug(null);
    }
  }, [activeSlug, pendingSlug]);

  useLayoutEffect(() => {
    if (pendingSlug !== null) return;
    setOverrideExpandedPath((prev) => {
      if (prev === null) return null;
      if (autoExpandedPath.length === 0) return prev;
      if (pathsEqual(prev, autoExpandedPath)) return null;
      return prev;
    });
  }, [activeSlug, autoExpandedPath, pendingSlug]);

  useEffect(() => {
    if (!menu.some((section) => section.id === activeSlug)) {
      setCollapsedSectionIds(new Set());
    }
  }, [activeSlug, menu]);

  const navigateToItem = (itemId: string, level: number, canExpand: boolean) => {
    setPendingSlug(itemId);
    if (canExpand) {
      if (level === 0) {
        const isSectionOpen = expandedPathRef.current[0] === itemId;
        if (isSectionOpen) {
          setCollapsedSectionIds((prev) => new Set(prev).add(itemId));
          setOverrideExpandedPath([]);
        } else {
          setCollapsedSectionIds((prev) => {
            const next = new Set(prev);
            next.delete(itemId);
            return next;
          });
          setOverrideExpandedPath([itemId]);
        }
      } else {
        setOverrideExpandedPath(
          resolveExpandedPathOnClick(menu, itemId, level, expandedPathRef.current)
        );
      }
    }
    router.push(`/stat/${itemId}`, { scroll: false });
  };

  // Pre-fetch metrics for every leaf topic so the cache is warm before any topic is expanded.
  useEffect(() => {
    if (!menu.length) return;
    for (const section of menu) {
      for (const topic of section.children ?? []) {
        if (!topic.children?.length) {
          preload(swrKeys.metricsByTopic(topic.id), () => fetchMetricsByTopicId(topic.id));
        }
        for (const sub of topic.children ?? []) {
          preload(swrKeys.metricsByTopic(sub.id), () => fetchMetricsByTopicId(sub.id));
        }
      }
    }
  }, [sections]);

  if (isSidebarLoading) {
    return <SidebarSkeleton />;
  }

  return (
    <aside className="sticky top-0 flex w-full flex-col self-start">
      <div className="flex w-full px-4 py-7.5">
        <p className="text-fontSizeM font-semibold text-[rgba(40,40,40,1)]">
          {t("stat.sections", "Բաժիններ")}
        </p>
      </div>

      <nav className="w-full">
        <MenuList
          items={menu}
          expandedPath={expandedPath}
          onNavigate={navigateToItem}
          activeSlug={effectiveSlug}
          activeTopicId={activeTopicId}
        />
      </nav>
    </aside>
  );
}
