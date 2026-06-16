import { hasMenuChildren, type StatMenuItem } from "@/lib/stat-menu-utils";
import { pickLocale, type Locale } from "@/lib/i18n";
import type { MetricSelectOption } from "@/types/metric";

export type SearchResultGroup = {
  header: string;
  headerId: string;
  nodes: StatMenuItem[];
  /** When true, render all root nodes (section name matched) without filtering roots by query. */
  showAllNodes?: boolean;
  /** When true with showAllNodes, level-0 rows use menu structure for expand (section topics). */
  structuralLevel0?: boolean;
};

export type IndicatorSearchResult = {
  id: string;
  title: string;
};

export type IndicatorSearchGroup = {
  header: string;
  headerId: string;
  indicators: IndicatorSearchResult[];
};

export type SearchResultItem = {
  id: string;
  title: string;
};

export type SearchTreeRow = {
  item: StatMenuItem;
  level: number;
  hasChildren: boolean;
  expanded: boolean;
};

/** True when any localized title variant contains the query. */
export function titleMatches(item: StatMenuItem, query: string): boolean {
  return item.searchTitles.some((title) => title.includes(query));
}

/** True when the item's title or any descendant's title contains the query. */
export function subtreeMatches(item: StatMenuItem, query: string): boolean {
  if (titleMatches(item, query)) return true;
  return (item.children ?? []).some((child) => subtreeMatches(child, query));
}

/** Children shown when expanding a row in the search tree. */
function getChildrenForTree(
  item: StatMenuItem,
  normalizedQuery: string,
  useStructuralChildren: boolean
): StatMenuItem[] {
  if (!hasMenuChildren(item)) return [];

  const children = item.children ?? [];
  if (useStructuralChildren || !normalizedQuery) return children;
  return children.filter((child) => subtreeMatches(child, normalizedQuery));
}

/** True when the item has children that would actually render in the tree. */
export function hasVisibleChildren(
  item: StatMenuItem,
  normalizedQuery: string,
  useStructuralChildren = false
): boolean {
  return getChildrenForTree(item, normalizedQuery, useStructuralChildren).length > 0;
}

export function getRowExpandedState(
  item: StatMenuItem,
  normalizedQuery: string,
  expandedIds: Set<string>,
  collapsedIds: Set<string>,
  useStructuralChildren = false
): boolean {
  const hasMatchingChild =
    !useStructuralChildren &&
    normalizedQuery !== "" &&
    hasVisibleChildren(item, normalizedQuery);

  return hasMatchingChild ? !collapsedIds.has(item.id) : expandedIds.has(item.id);
}

export function buildSearchTreeRows(
  roots: StatMenuItem[],
  normalizedQuery: string,
  expandedIds: Set<string>,
  collapsedIds: Set<string>,
  includeAllRoots = false,
  structuralLevel0 = includeAllRoots
): SearchTreeRow[] {
  const rows: SearchTreeRow[] = [];

  const walk = (
    items: StatMenuItem[],
    level: number,
    filterItems: boolean,
    includeAllRoots: boolean
  ) => {
    for (const item of items) {
      if (filterItems && normalizedQuery && !subtreeMatches(item, normalizedQuery)) continue;

      const useStructuralChildren = includeAllRoots && structuralLevel0 && level === 0;
      const browseEpicRoots = includeAllRoots && level === 0 && !structuralLevel0;

      let childrenForTree: StatMenuItem[];
      let hasChildren: boolean;

      if (useStructuralChildren) {
        // Section topics: expand only when at least one subtopic has nested subtopics.
        childrenForTree = item.children ?? [];
        hasChildren = childrenForTree.some((child) => hasMenuChildren(child));
      } else if (browseEpicRoots) {
        // Topic-name browse lists subtopics at level 0 — expand only with real nested subtopics.
        childrenForTree = item.children ?? [];
        hasChildren = hasMenuChildren(item);
      } else {
        // Same query-aware logic as local search for nested rows and filter mode.
        childrenForTree = getChildrenForTree(item, normalizedQuery, false);
        hasChildren = childrenForTree.length > 0;
      }

      const expanded = hasChildren
        ? getRowExpandedState(
            item,
            normalizedQuery,
            expandedIds,
            collapsedIds,
            useStructuralChildren || browseEpicRoots
          )
        : false;

      rows.push({ item, level, hasChildren, expanded });

      if (hasChildren && expanded) {
        const showAllDirectChildren = includeAllRoots && level === 0;
        walk(
          showAllDirectChildren ? (item.children ?? []) : childrenForTree,
          level + 1,
          !showAllDirectChildren,
          includeAllRoots
        );
      }
    }
  };

  walk(roots, 0, !includeAllRoots, includeAllRoots);
  return rows;
}

/** Builds indicator groups for flat topic/subtopic list mode (no search filter). */
export function getTopicListIndicatorGroups(
  items: StatMenuItem[],
  metricsByTopicId: Record<string, MetricSelectOption[]>,
  lang: Locale
): IndicatorSearchGroup[] {
  const groups: IndicatorSearchGroup[] = [];

  for (const item of items) {
    const metrics = metricsByTopicId[item.id] ?? [];

    groups.push({
      header: item.title,
      headerId: item.id,
      indicators: metrics.map((metric) => ({
        id: metric.id,
        title: pickLocale(metric.title, lang) || metric.label,
      })),
    });
  }

  return groups;
}

/** Collects global indicator search results grouped by parent category (topic/subtopic). */
export function getGlobalIndicatorSearchGroups(
  menu: StatMenuItem[],
  metricsByTopicId: Record<string, MetricSelectOption[]>,
  query: string,
  lang: Locale
): IndicatorSearchGroup[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const groupMap = new Map<string, IndicatorSearchGroup>();

  const addIndicator = (topic: StatMenuItem, metric: MetricSelectOption) => {
    const title = pickLocale(metric.title, lang) || metric.label;
    let group = groupMap.get(topic.id);
    if (!group) {
      group = { header: topic.title, headerId: topic.id, indicators: [] };
      groupMap.set(topic.id, group);
    }
    if (!group.indicators.some((indicator) => indicator.id === metric.id)) {
      group.indicators.push({ id: metric.id, title });
    }
  };

  const topicInMatchedBranch = (
    topicId: string,
    section: StatMenuItem,
    normalizedQuery: string
  ): boolean => {
    if (titleMatches(section, normalizedQuery)) return true;

    const walk = (items: StatMenuItem[], ancestors: StatMenuItem[]): boolean => {
      for (const item of items) {
        const path = [...ancestors, item];
        if (item.id === topicId) {
          return path.some((node) => titleMatches(node, normalizedQuery));
        }
        if (item.children?.length && walk(item.children, path)) return true;
      }
      return false;
    };

    return walk(section.children ?? [], []);
  };

  const walkTopics = (section: StatMenuItem, items: StatMenuItem[]) => {
    for (const topic of items) {
      const metrics = metricsByTopicId[topic.id] ?? [];
      const categoryMatches = topicInMatchedBranch(topic.id, section, normalizedQuery);

      for (const metric of metrics) {
        if (categoryMatches || metricTitleMatches(metric, normalizedQuery)) {
          addIndicator(topic, metric);
        }
      }

      if (topic.children?.length) walkTopics(section, topic.children);
    }
  };

  for (const section of menu) {
    walkTopics(section, section.children ?? []);
  }

  const orderedGroups: IndicatorSearchGroup[] = [];

  const collectGroups = (items: StatMenuItem[]) => {
    for (const item of items) {
      const group = groupMap.get(item.id);
      if (group) orderedGroups.push(group);
      if (item.children?.length) collectGroups(item.children);
    }
  };

  for (const section of menu) {
    collectGroups(section.children ?? []);
  }

  return orderedGroups;
}

function metricTitleMatches(metric: MetricSelectOption, query: string): boolean {
  const candidates = [
    metric.title.hy,
    metric.title.ru,
    metric.title.en,
    (metric.title as { am?: string }).am,
    metric.label,
  ];
  return candidates.some(
    (title) => typeof title === "string" && title.trim() !== "" && title.toLowerCase().includes(query)
  );
}

/** @deprecated Use getGlobalIndicatorSearchGroups for site global search. */
export function getGlobalSearchGroups(menu: StatMenuItem[], query: string): SearchResultGroup[] {
  const normalizedQuery = query.trim().toLowerCase();
  if (!normalizedQuery) return [];

  const groups: SearchResultGroup[] = [];

  for (const section of menu) {
    if (!subtreeMatches(section, normalizedQuery)) continue;

    if (titleMatches(section, normalizedQuery)) {
      const children = section.children ?? [];
      groups.push({
        header: section.title,
        headerId: section.id,
        nodes: children.length > 0 ? children : [section],
        showAllNodes: true,
        structuralLevel0: true,
      });
      continue;
    }

    for (const topic of section.children ?? []) {
      if (!subtreeMatches(topic, normalizedQuery)) continue;

      const topicTitleMatches = titleMatches(topic, normalizedQuery);
      const children = topic.children ?? [];

      groups.push({
        header: topic.title,
        headerId: topic.id,
        nodes: topicTitleMatches && children.length > 0 ? children : [topic],
        showAllNodes: topicTitleMatches && children.length > 0,
        structuralLevel0: false,
      });
    }
  }

  return groups;
}
