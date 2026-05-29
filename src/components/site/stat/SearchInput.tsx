"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import React, { useMemo } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { fetchMetricsByTopicId, getMetricById } from "@/services/metricsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";
import { buildStatMenu, isSlugInStatMenu } from "@/lib/stat-menu-utils";
import type { Section } from "@/types/section";

type SearchOption = {
  id: string;
  label: string;
};

type SlugTarget =
  | { kind: "section"; topicIds: string[] }
  | { kind: "topic"; topicIds: [string] }
  | { kind: "subtopic"; topicIds: [string] };

function collectTopicIdsForSection(section: Section): string[] {
  const ids: string[] = [];
  for (const topic of section.topics) {
    ids.push(topic._id);
    for (const sub of topic.subtopics ?? []) ids.push(sub._id);
  }
  return ids;
}

function resolveSlug(sections: Section[], slug: string): SlugTarget | null {
  for (const section of sections) {
    if (section._id === slug) {
      return { kind: "section", topicIds: collectTopicIdsForSection(section) };
    }
    for (const topic of section.topics) {
      if (topic._id === slug) {
        return isRootTopic(topic)
          ? { kind: "topic", topicIds: [topic._id] }
          : { kind: "subtopic", topicIds: [topic._id] };
      }
      for (const sub of topic.subtopics ?? []) {
        if (sub._id === slug) return { kind: "subtopic", topicIds: [sub._id] };
      }
    }
  }
  return null;
}

export default function SearchInput({
  query,
  setQuery,
}: {
  query: string;
  setQuery: (v: string) => void;
}) {
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const menu = useMemo(() => buildStatMenu(sections), [sections]);
  const slugInTree = useMemo(
    () => sections.length > 0 && isSlugInStatMenu(menu, slug),
    [menu, slug, sections.length]
  );

  // When the slug is a metric ID (not a section/topic/subtopic), fetch the
  // metric so we can surface its sibling indicators via topicId.
  const { data: activeMetric } = useSWR(
    slug && sections.length > 0 && !slugInTree ? swrKeys.metricForm(slug) : null,
    () => getMetricById(slug)
  );

  const topicIds = useMemo<string[]>(() => {
    if (!slug || sections.length === 0) return [];
    const target = resolveSlug(sections, slug);
    if (target) return target.topicIds;
    return activeMetric?.topicId ? [activeMetric.topicId] : [];
  }, [slug, sections, activeMetric]);

  const indicatorsKey = useMemo(
    () => (topicIds.length === 0 ? null : (["search-indicators", ...topicIds] as const)),
    [topicIds]
  );

  const { data: indicators = [] } = useSWR(indicatorsKey, async () => {
    const lists = await Promise.all(topicIds.map((id) => fetchMetricsByTopicId(id)));
    const seen = new Set<string>();
    const merged: SearchOption[] = [];
    for (const list of lists) {
      for (const item of list) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push({ id: item.id, label: item.label });
      }
    }
    return merged;
  });

  return (
    <Combobox
      items={indicators}
      itemToStringValue={(item: SearchOption) => item.label}
      onValueChange={(item: SearchOption | null) => {
        if (item) {
          setQuery("");
          router.push(`/stat/${item.id}`);
        }
      }}
    >
      <ComboboxInput
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        className="text-[rgba(55,71,79,1)] border-textBlack300 shadow-none h-10.5 w-full"
        placeholder="Փնտրել"
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: SearchOption) => (
            <ComboboxItem key={item.id} value={item}>
              {item.label}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>Որոնման արդյունքները կտեսնեք այստեղ</ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
