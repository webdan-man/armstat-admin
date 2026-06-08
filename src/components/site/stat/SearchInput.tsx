"use client";

import {
  Combobox,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxItem,
  ComboboxList,
} from "@/components/ui/combobox";
import React, { useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { fetchMetricsByTopicId, getMetricById } from "@/services/metricsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";
import { buildStatMenu, isSlugInStatMenu } from "@/lib/stat-menu-utils";
import { useTranslation } from "@/hooks/useTranslation";
import { pickLocale } from "@/lib/i18n";
import type { Section } from "@/types/section";

type SearchOption = {
  id: string;
  label: string;
  title: Record<string, string>;
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
  const { t, activeLang } = useTranslation();
  const router = useRouter();
  const params = useParams();
  const slug = (params?.slug as string) ?? "";
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const menu = useMemo(() => buildStatMenu(sections, activeLang), [sections, activeLang]);
  const slugInTree = useMemo(
    () => sections.length > 0 && isSlugInStatMenu(menu, slug),
    [menu, slug, sections.length]
  );

  // When the slug is a metric ID (not a section/topic/subtopic), fetch the
  // metric so we can surface its sibling metrics via topicId.
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

  const metricsKey = useMemo(
    () => (topicIds.length === 0 ? null : (["search-metrics", ...topicIds] as const)),
    [topicIds]
  );

  const { data: metrics = [] } = useSWR(metricsKey, async () => {
    const lists = await Promise.all(topicIds.map((id) => fetchMetricsByTopicId(id)));
    const seen = new Set<string>();
    const merged: SearchOption[] = [];
    for (const list of lists) {
      for (const item of list) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push({ id: item.id, label: item.label, title: item.title });
      }
    }
    return merged;
  });

  const labelFor = (item: SearchOption) => pickLocale(item.title, activeLang) || item.label;

  const isSectionSlug = useMemo(() => menu.some((section) => section.id === slug), [menu, slug]);

  // Mirrors the page's selectedMetricId logic so the input reflects the metric
  // currently shown on the page: a section has none, a topic/subtopic auto-selects
  // its first metric, and a bare metric id selects itself.
  const selectedOption = useMemo<SearchOption | null>(() => {
    if (metrics.length === 0 || isSectionSlug) return null;
    if (!slugInTree) return metrics.find((m) => m.id === slug) ?? null;
    return metrics[0] ?? null;
  }, [metrics, isSectionSlug, slugInTree, slug]);

  const selectedLabel = selectedOption ? labelFor(selectedOption) : "";

  const [isFocused, setIsFocused] = useState(false);

  // While the input is focused, reflect exactly what the user typed (so it can be
  // cleared). When unfocused and not searching, show the selected metric's name.
  const inputValue = isFocused ? query : query !== "" ? query : selectedLabel;

  return (
    <Combobox
      items={metrics}
      value={selectedOption}
      itemToStringValue={(item: SearchOption) => labelFor(item)}
      inputValue={inputValue}
      onInputValueChange={(value, details) => {
        const reason = details.reason;
        if (reason === "input-change" || reason === "input-clear") {
          setQuery(value);
        }
      }}
      onValueChange={(item: SearchOption | null) => {
        if (item) {
          setQuery("");
          router.push(`/stat/${item.id}`);
        }
      }}
    >
      <ComboboxInput
        onFocus={() => setIsFocused(true)}
        onBlur={() => setIsFocused(false)}
        className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none"
        placeholder={t("stat.search_placeholder", "Փնտրել")}
      />
      <ComboboxContent>
        <ComboboxList>
          {(item: SearchOption) => (
            <ComboboxItem key={item.id} value={item}>
              {labelFor(item)}
            </ComboboxItem>
          )}
        </ComboboxList>
        <ComboboxEmpty>
          {t("stat.search_results_placeholder", "Որոնման արդյունքները կտեսնեք այստեղ")}
        </ComboboxEmpty>
      </ComboboxContent>
    </Combobox>
  );
}
