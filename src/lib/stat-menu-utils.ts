import { isRootTopic } from "@/lib/section-topic-utils";
import type { Section, SectionLocalizedText, Topic } from "@/types/section";
import { getSectionLocalizedText } from "@/lib/section-localization";
import { defaultLocale, type Locale } from "@/lib/i18n";

export type StatMenuItem = {
  id: string;
  title: string;
  /** All locale variants used for case-insensitive search matching. */
  searchTitles: string[];
  children?: StatMenuItem[];
};

function getSearchTitles(value: SectionLocalizedText): string[] {
  const candidates = [value.hy, value.ru, value.en, (value as { am?: string }).am];
  return [
    ...new Set(
      candidates
        .filter((text): text is string => typeof text === "string" && text.trim() !== "")
        .map((text) => text.toLowerCase())
    ),
  ];
}

/** Mirrors Sidebar: children come only from nested `subtopics`, never flat topic lists. */
export function getChildTopics(topic: Topic): Topic[] {
  return (topic.subtopics ?? []).filter(
    (candidate) => candidate._id && candidate._id !== topic._id
  );
}

function topicToListItem(topic: Topic, lang: Locale): StatMenuItem {
  return {
    id: topic._id,
    title: getSectionLocalizedText(topic.title, lang),
    searchTitles: getSearchTitles(topic.title),
  };
}

/** Flat topic/subtopic rows for a section using raw API topics (all top-level topics). */
export function getFlatListItemsForSection(section: Section, lang: Locale): StatMenuItem[] {
  const rows: StatMenuItem[] = [];
  const topLevelTopics = section.topics.filter(isRootTopic);

  for (const topic of topLevelTopics) {
    rows.push(topicToListItem(topic, lang));
    for (const sub of getChildTopics(topic)) {
      rows.push(topicToListItem(sub, lang));
    }
  }

  return rows;
}

function mapTopicToMenuItem(
  topic: Topic,
  lang: Locale,
  ancestorIds: Set<string> = new Set()
): StatMenuItem {
  if (ancestorIds.has(topic._id)) {
    return {
      id: topic._id,
      title: getSectionLocalizedText(topic.title, lang),
      searchTitles: getSearchTitles(topic.title),
    };
  }

  const nextAncestors = new Set(ancestorIds);
  nextAncestors.add(topic._id);

  const seenChildIds = new Set<string>();
  const children = getChildTopics(topic)
    .filter((sub) => {
      if (!sub._id || seenChildIds.has(sub._id) || nextAncestors.has(sub._id)) return false;
      seenChildIds.add(sub._id);
      return true;
    })
    .map((sub) => mapTopicToMenuItem(sub, lang, nextAncestors));

  return {
    id: topic._id,
    title: getSectionLocalizedText(topic.title, lang),
    searchTitles: getSearchTitles(topic.title),
    ...(children.length > 0 ? { children } : {}),
  };
}

export function buildStatMenu(sections: Section[], lang: Locale = defaultLocale): StatMenuItem[] {
  return sections.map((section) => ({
    id: section._id,
    title: getSectionLocalizedText(section.name, lang),
    searchTitles: getSearchTitles(section.name),
    children: section.topics
      .filter(isRootTopic)
      .map((rootTopic) => mapTopicToMenuItem(rootTopic, lang)),
  }));
}

function findMenuItemTitle(items: StatMenuItem[], slug: string): string | null {
  for (const item of items) {
    if (item.id === slug) return item.title;
    if (item.children?.length) {
      const nested = findMenuItemTitle(item.children, slug);
      if (nested !== null) return nested;
    }
  }
  return null;
}

/** Returns the title of the menu item (section/topic/subtopic) matching slug, or null. */
export function getStatMenuTitle(menu: StatMenuItem[], slug: string): string | null {
  for (const section of menu) {
    if (section.id === slug) return section.title;
    const nested = findMenuItemTitle(section.children ?? [], slug);
    if (nested !== null) return nested;
  }
  return null;
}

/** True when slug matches a section, topic, or subtopic (not a bare metric id). */
export function isSlugInStatMenu(menu: StatMenuItem[], slug: string): boolean {
  return getStatMenuTitle(menu, slug) !== null;
}

/** True when a menu item has nested subtopics in the tree. */
export function hasMenuChildren(item: StatMenuItem): boolean {
  return (item.children?.length ?? 0) > 0;
}

/** Limits the sidebar to Group → Sub-Category → Sub-Sub Category (no deeper nesting). */
export function trimStatMenuToCategoryDepth(menu: StatMenuItem[]): StatMenuItem[] {
  return menu.map((section) => ({
    ...section,
    children: (section.children ?? []).map((topic) => ({
      ...topic,
      children: (topic.children ?? []).map((subtopic) => ({
        ...subtopic,
        children: undefined,
      })),
    })),
  }));
}

function findMenuItem(items: StatMenuItem[], slug: string): StatMenuItem | null {
  for (const item of items) {
    if (item.id === slug) return item;
    if (item.children?.length) {
      const nested = findMenuItem(item.children, slug);
      if (nested) return nested;
    }
  }
  return null;
}

/** Returns the menu item (section/topic/subtopic) matching slug, or null. */
export function findStatMenuItem(menu: StatMenuItem[], slug: string): StatMenuItem | null {
  for (const section of menu) {
    if (section.id === slug) return section;
    const nested = findMenuItem(section.children ?? [], slug);
    if (nested) return nested;
  }
  return null;
}

/** Flattens topic + subtopics for list display (no nesting). */
function flattenTopicList(topic: StatMenuItem): StatMenuItem[] {
  const result: StatMenuItem[] = [topic];
  for (const child of topic.children ?? []) {
    result.push(child);
  }
  return result;
}

/**
 * Returns flat topic/subtopic rows to show for a section, topic, or subtopic slug.
 * Section: all root topics and their subtopics as separate rows.
 * Topic: topic + its subtopics.
 * Subtopic: single row.
 */
export function getFlatListItemsForSlug(menu: StatMenuItem[], slug: string): StatMenuItem[] {
  const item = findStatMenuItem(menu, slug);
  if (!item) return [];

  const isSection = menu.some((section) => section.id === slug);
  if (isSection) {
    const rows: StatMenuItem[] = [];
    for (const topic of item.children ?? []) {
      rows.push(topic);
      for (const sub of topic.children ?? []) {
        rows.push(sub);
      }
    }
    return rows;
  }

  const isRootTopic = menu.some((section) =>
    (section.children ?? []).some((topic) => topic.id === slug)
  );
  if (isRootTopic) {
    return flattenTopicList(item);
  }

  return [item];
}

/** Parent browse slug to return from a metric (section or topic with subtopics). */
export function getStatBackHrefForTopic(menu: StatMenuItem[], topicId: string): string {
  for (const section of menu) {
    for (const topic of section.children ?? []) {
      if (topic.id === topicId) return `/stat/${section.id}`;
      for (const sub of topic.children ?? []) {
        if (sub.id === topicId) return `/stat/${topic.id}`;
      }
    }
  }
  return "/stat";
}

export function buildStatMetricHref(metricId: string, returnTo?: string | null): string {
  if (!returnTo) return `/stat/${metricId}`;
  return `/stat/${metricId}?returnTo=${encodeURIComponent(returnTo)}`;
}

/** Only allow in-app stat routes as a metric back target. */
export function parseStatReturnTo(value: string | null): string | null {
  if (!value || !value.startsWith("/stat")) return null;
  return value;
}

/** True when slug is a topic or subtopic leaf (no nested subtopics in the menu). */
export function isLeafTopicOrSubtopicSlug(menu: StatMenuItem[], slug: string): boolean {
  if (menu.some((section) => section.id === slug)) return false;

  const item = findStatMenuItem(menu, slug);
  if (!item) return false;

  return !hasMenuChildren(item);
}

/** Collects every topic/subtopic id from the stat menu tree. */
export function collectTopicIdsFromMenu(menu: StatMenuItem[]): string[] {
  const ids: string[] = [];

  const walk = (items: StatMenuItem[]) => {
    for (const item of items) {
      ids.push(item.id);
      if (item.children?.length) walk(item.children);
    }
  };

  for (const section of menu) {
    walk(section.children ?? []);
  }

  return ids;
}
