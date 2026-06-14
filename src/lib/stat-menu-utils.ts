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
function getChildTopics(topic: Topic): Topic[] {
  return (topic.subtopics ?? []).filter(
    (candidate) => candidate._id && candidate._id !== topic._id
  );
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
