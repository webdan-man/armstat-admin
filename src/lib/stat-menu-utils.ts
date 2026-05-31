import { isRootTopic } from "@/lib/section-topic-utils";
import type { Section } from "@/types/section";
import { getSectionLocalizedText } from "@/lib/section-localization";
import { defaultLocale, type Locale } from "@/lib/i18n";

export type StatMenuItem = {
  id: string;
  title: string;
  children?: StatMenuItem[];
};

export function buildStatMenu(sections: Section[], lang: Locale = defaultLocale): StatMenuItem[] {
  return sections.map((section) => ({
    id: section._id,
    title: getSectionLocalizedText(section.name, lang),
    children: section.topics.filter(isRootTopic).map((rootTopic) => ({
      id: rootTopic._id,
      title: getSectionLocalizedText(rootTopic.title, lang),
      children: (rootTopic.subtopics ?? []).map((sub) => ({
        id: sub._id,
        title: getSectionLocalizedText(sub.title, lang),
      })),
    })),
  }));
}

/** True when slug matches a section, topic, or subtopic (not a bare metric id). */
export function isSlugInStatMenu(menu: StatMenuItem[], slug: string): boolean {
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
