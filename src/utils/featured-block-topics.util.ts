import { getSectionLocalizedText } from "@/lib/section-localization";
import type { Section, SectionLocalizedText, Topic } from "@/types/section";

export type FeaturedBlockItemType = "section" | "topic";

export type FeaturedBlockSection = {
  _id: string;
  name: SectionLocalizedText;
  description: SectionLocalizedText;
  order?: number;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedBlockTopic = {
  _id: string;
  sectionId: string;
  parentTopicId?: string | null;
  title: SectionLocalizedText;
  body?: SectionLocalizedText;
  order?: number;
  createdAt: string;
  updatedAt: string;
};

export type FeaturedBlockItem = {
  type: FeaturedBlockItemType;
  id: string;
  section?: FeaturedBlockSection;
  topic?: FeaturedBlockTopic;
};

/** Keep only well-formed section/topic items coming back from the API. */
export function normalizeFeaturedBlockItems(
  items: Array<Partial<FeaturedBlockItem> | null | undefined> | undefined
): FeaturedBlockItem[] {
  return (items ?? [])
    .filter(
      (item): item is FeaturedBlockItem =>
        item != null &&
        (item.type === "section" || item.type === "topic") &&
        typeof item.id === "string" &&
        item.id.length > 0
    )
    .map((item) => ({
      type: item.type,
      id: item.id,
      ...(item.section ? { section: item.section } : {}),
      ...(item.topic ? { topic: item.topic } : {}),
    }));
}

/** Shape sent back to the backend: only the discriminator and id are needed. */
export function toFeaturedBlockItemPayload(
  items: FeaturedBlockItem[]
): Array<{ type: FeaturedBlockItemType; id: string }> {
  return items.map((item) => ({ type: item.type, id: item.id }));
}

export function sectionToFeaturedItem(section: Section): FeaturedBlockItem {
  return {
    type: "section",
    id: section._id,
    section: {
      _id: section._id,
      name: section.name,
      description: section.description,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    },
  };
}

export function topicToFeaturedItem(section: Section, topic: Topic): FeaturedBlockItem {
  return {
    type: "topic",
    id: topic._id,
    topic: {
      _id: topic._id,
      sectionId: section._id,
      parentTopicId: topic.parentTopicId ?? null,
      title: topic.title,
      ...(topic.body ? { body: topic.body } : {}),
      ...(typeof topic.order === "number" ? { order: topic.order } : {}),
      createdAt: topic.createdAt,
      updatedAt: topic.updatedAt,
    },
    section: {
      _id: section._id,
      name: section.name,
      description: section.description,
      createdAt: section.createdAt,
      updatedAt: section.updatedAt,
    },
  };
}

function findTopicInSections(
  sections: Section[],
  topicId: string
): { section: Section; topic: Topic; parent?: Topic } | null {
  for (const section of sections) {
    for (const topic of section.topics) {
      if (topic._id === topicId) return { section, topic };
      for (const sub of topic.subtopics ?? []) {
        if (sub._id === topicId) return { section, topic: sub, parent: topic };
      }
    }
  }
  return null;
}

/**
 * Build a chip label for a featured-block item, preferring the freshly loaded
 * sections tree and falling back to the data embedded in the item.
 */
export function getFeaturedItemLabel(sections: Section[], item: FeaturedBlockItem): string {
  if (item.type === "section") {
    const name = sections.find((s) => s._id === item.id)?.name ?? item.section?.name;
    return name ? getSectionLocalizedText(name) : item.id;
  }

  const found = findTopicInSections(sections, item.id);
  if (found) {
    const parts = [getSectionLocalizedText(found.section.name)];
    if (found.parent) parts.push(getSectionLocalizedText(found.parent.title));
    parts.push(getSectionLocalizedText(found.topic.title));
    return parts.join(" / ");
  }

  const embedded = item.topic;
  if (embedded) {
    const sectionName =
      sections.find((s) => s._id === embedded.sectionId)?.name ?? item.section?.name;
    const parts = [
      sectionName ? getSectionLocalizedText(sectionName) : "",
      getSectionLocalizedText(embedded.title),
    ].filter(Boolean);
    return parts.join(" / ") || item.id;
  }

  return item.id;
}
