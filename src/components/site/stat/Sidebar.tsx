"use client";

import React, { useState, useEffect, useMemo } from "react";
import { useRouter, useParams } from "next/navigation";
import useSWR, { preload } from "swr";
import { fetchSections } from "@/services/sectionsService";
import { fetchMetricsByTopicId, getMetricById } from "@/services/metricsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";
import type { Section, Topic } from "@/types/section";

type MenuItem = {
  id: string;
  title: string;
  children?: MenuItem[];
};

function buildMenu(sections: Section[]): MenuItem[] {
  return sections.map((section) => ({
    id: section._id,
    title: section.name,
    children: section.topics.filter(isRootTopic).map((rootTopic) => ({
      id: rootTopic._id,
      title: rootTopic.title,
      children: (rootTopic.subtopics ?? []).map((sub) => ({
        id: sub._id,
        title: sub.title,
      })),
    })),
  }));
}

/** Returns the expandedPath needed to make activeSlug visible in the tree. */
function findExpandedPath(items: MenuItem[], activeSlug: string, depth = 0): string[] {
  for (const item of items) {
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

function hasActiveDescendant(item: MenuItem, activeSlug: string): boolean {
  if (!item.children) return false;
  return item.children.some(
    (child) => child.id === activeSlug || hasActiveDescendant(child, activeSlug)
  );
}

function TopicMetricItems({
  topicId,
  level,
  activeSlug,
}: {
  topicId: string;
  level: number;
  activeSlug: string;
}) {
  const router = useRouter();
  const { data: metrics = [] } = useSWR(swrKeys.metricsByTopic(topicId), () =>
    fetchMetricsByTopicId(topicId)
  );

  if (metrics.length === 0) return null;

  return (
    <ul className="flex w-full flex-col">
      {metrics.map((metric) => {
        const isActive = metric.id === activeSlug;
        return (
          <li
            key={metric.id}
            className="w-full border-b border-b-[rgba(228,228,228,1)] last:border-none"
          >
            <button
              onClick={() => router.push(`/stat/${metric.id}`, { scroll: false })}
              style={{ paddingLeft: 16 + level * 16 }}
              className={`text-fontSizeXS flex w-full cursor-pointer items-center justify-between py-4 pr-4 text-left bg-[rgba(241,245,248,1)] font-semibold ${
                isActive
                  ? "border-r-6 border-r-[rgba(22,81,149,1)] text-[rgba(15,104,192,1)]"
                  : "text-[rgba(55,55,55,1)]"
              }`}
            >
              {metric.label}
            </button>
          </li>
        );
      })}
    </ul>
  );
}

type MenuListProps = {
  items: MenuItem[];
  level?: number;
  expandedPath: string[];
  toggleExpand: (id: string, level: number) => void;
  activeSlug: string;
  /** topicId that owns the currently active metric (null when activeSlug is a topic/section). */
  activeTopicId?: string | null;
};

function MenuList({
  items,
  level = 0,
  expandedPath,
  toggleExpand,
  activeSlug,
  activeTopicId,
}: MenuListProps) {
  const router = useRouter();

  return (
    <ul className="flex w-full flex-col">
      {items.map((item, index) => {
        const hasSubtopics = !!item.children?.length;
        // Topics and subtopics (level > 0) can always expand to reveal their metrics.
        const canExpand = hasSubtopics || level > 0;
        const isExpanded = expandedPath[level] === item.id;
        const isActive = item.id === activeSlug;
        // A descendant topic/subtopic is active, OR this item is the topic that owns the active metric.
        const activeChild =
          hasActiveDescendant(item, activeSlug) ||
          (activeTopicId
            ? item.id === activeTopicId || hasActiveDescendant(item, activeTopicId)
            : false);

        const showActive = isActive || activeChild;

        return (
          <li
            key={item.id}
            className={`w-full border-b border-b-[rgba(228,228,228,1)] ${level > 0 && index === 0 ? "border-t border-t-[rgba(228,228,228,1)]" : ""} ${level > 0 ? "last:border-none" : ""} `}
          >
            <button
              onClick={() => {
                if (canExpand) {
                  toggleExpand(item.id, level);
                }
                router.push(`/stat/${item.id}`, { scroll: false });
              }}
              style={{ paddingLeft: 16 + level * 16 }}
              className={`text-fontSizeXS flex w-full cursor-pointer items-center justify-between py-4 pr-4 text-left ${level > 0 ? "bg-[rgba(241,245,248,1)] font-semibold" : ""} ${
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
                toggleExpand={toggleExpand}
                activeSlug={activeSlug}
                activeTopicId={activeTopicId}
              />
            )}

            {level > 0 && !hasSubtopics && isExpanded && (
              <TopicMetricItems topicId={item.id} level={level + 1} activeSlug={activeSlug} />
            )}
          </li>
        );
      })}
    </ul>
  );
}

/** Returns true when slug matches a section, topic, or subtopic in the menu tree. */
function isSlugInTree(menu: MenuItem[], slug: string): boolean {
  for (const section of menu) {
    if (section.id === slug) return true;
    for (const topic of section.children ?? []) {
      if (topic.id === slug) return true;
      for (const sub of topic.children ?? []) {
        if (sub.id === slug) return true;
      }
    }
  }
  return false;
}

export default function Sidebar() {
  const params = useParams();
  const activeSlug = params.slug as string;

  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const menu = buildMenu(sections);

  // Once sections load, check whether the active slug belongs to the tree.
  // If it doesn't, it's a metricId — fetch the metric to resolve its topicId.
  const slugInTree = useMemo(
    () => (!menu.length ? true : isSlugInTree(menu, activeSlug)),
    [menu, activeSlug]
  );

  const { data: activeMetric } = useSWR(
    activeSlug && !slugInTree ? swrKeys.metricForm(activeSlug) : null,
    () => getMetricById(activeSlug)
  );
  const activeTopicId = activeMetric?.topicId ?? null;

  const [expandedPath, setExpandedPath] = useState<string[]>([]);

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

  // Auto-expand the tree to reveal the active slug whenever sections load or the URL changes.
  useEffect(() => {
    if (!menu.length || !activeSlug) return;

    // Active slug is a topic/subtopic — expand its ancestors AND itself.
    const path = findExpandedPath(menu, activeSlug);
    if (path.length) {
      setExpandedPath([...path, activeSlug]);
      return;
    }

    // Active slug is a metricId — expand ancestors of its topic AND the topic itself.
    if (activeTopicId) {
      const topicPath = findExpandedPath(menu, activeTopicId);
      setExpandedPath([...topicPath, activeTopicId]);
    }
  }, [sections, activeSlug, activeTopicId]);

  const toggleExpand = (id: string, level: number) => {
    setExpandedPath((prev) => {
      const newPath = prev.slice(0, level);

      if (prev[level] === id) {
        return newPath;
      }

      newPath[level] = id;
      return newPath;
    });
  };

  return (
    <aside className="sticky top-0 flex w-full flex-col self-start">
      <div className="flex w-full px-4 py-7.5">
        <p className="text-fontSizeM font-semibold text-[rgba(40,40,40,1)]">Բաժիններ</p>
      </div>

      <nav className="w-full">
        <MenuList
          items={menu}
          expandedPath={expandedPath}
          toggleExpand={toggleExpand}
          activeSlug={activeSlug}
          activeTopicId={activeTopicId}
        />
      </nav>
    </aside>
  );
}
