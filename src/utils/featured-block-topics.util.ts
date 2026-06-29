import { getSectionLocalizedText } from "@/lib/section-localization";
import { isRootTopic } from "@/lib/section-topic-utils";
import { getMetricById } from "@/services/metricsService";
import type { HomePageSection } from "@/components/main/main-mock-data";
import type { Section } from "@/types/section";

export type FeaturedBlockTopicRef = {
  sectionId: string;
  topicId: string;
  subTopicId?: string;
  metricId?: string;
};

export function getResolvedTopicId(ref: FeaturedBlockTopicRef): string {
  return ref.subTopicId ?? ref.topicId;
}

export function getStoredItemId(ref: FeaturedBlockTopicRef): string {
  return ref.metricId ?? getResolvedTopicId(ref);
}

export function topicRefsToSectionIds(refs: FeaturedBlockTopicRef[]): string[] {
  return refs.map(getStoredItemId);
}

export function resolveTopicRefFromTopicId(
  sections: Section[],
  topicId: string
): Omit<FeaturedBlockTopicRef, "metricId"> | null {
  for (const section of sections) {
    for (const topic of section.topics) {
      if (!isRootTopic(topic)) continue;
      if (topic._id === topicId) {
        return { sectionId: section._id, topicId: topic._id };
      }
      for (const sub of topic.subtopics ?? []) {
        if (sub._id === topicId) {
          return { sectionId: section._id, topicId: topic._id, subTopicId: sub._id };
        }
      }
    }
  }
  return null;
}

export function sectionIdsToTopicRefs(
  sections: Section[],
  sectionIds: string[]
): FeaturedBlockTopicRef[] {
  const refs: FeaturedBlockTopicRef[] = [];
  for (const id of sectionIds) {
    const ref = resolveTopicRefFromTopicId(sections, id);
    if (ref) refs.push(ref);
  }
  return refs;
}

export async function resolveSectionIdsToRefs(
  sections: Section[],
  sectionIds: string[]
): Promise<FeaturedBlockTopicRef[]> {
  const refs: FeaturedBlockTopicRef[] = [];

  for (const id of sectionIds) {
    const topicRef = resolveTopicRefFromTopicId(sections, id);
    if (topicRef) {
      refs.push(topicRef);
      continue;
    }

    try {
      const metric = await getMetricById(id);
      const hierarchy = resolveTopicRefFromTopicId(sections, metric.topicId);
      if (hierarchy) {
        refs.push({ ...hierarchy, metricId: id });
      }
    } catch {
      // Keep unresolved ids out of the editor list.
    }
  }

  return refs;
}

export function formatTopicRefLabel(
  sections: Section[],
  ref: FeaturedBlockTopicRef,
  embeddedSections: Array<HomePageSection | null | undefined> = []
): string {
  const section = sections.find((s) => s._id === ref.sectionId);
  const topic = section?.topics.find((t) => t._id === ref.topicId);
  const sub = topic?.subtopics?.find((t) => t._id === ref.subTopicId);

  const parts = [
    section ? getSectionLocalizedText(section.name) : "",
    topic ? getSectionLocalizedText(topic.title) : "",
    sub ? getSectionLocalizedText(sub.title) : "",
  ].filter(Boolean);

  const storedId = getStoredItemId(ref);
  const embeddedMetric = embeddedSections.find((s) => s?._id === storedId);
  if (embeddedMetric) {
    parts.push(getSectionLocalizedText(embeddedMetric.name));
  }

  if (parts.length > 0) return parts.join(" / ");

  const embedded = embeddedSections.find((s) => s?._id === getResolvedTopicId(ref));
  if (embedded) return getSectionLocalizedText(embedded.name);

  return storedId;
}

export function normalizeHomePageSections(
  sections: Array<HomePageSection | null | undefined> | undefined
): HomePageSection[] {
  return (sections ?? []).filter(
    (section): section is HomePageSection =>
      section != null && typeof section._id === "string" && section._id.length > 0
  );
}
