"use client";

import React, { useMemo } from "react";
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
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

type MetricOption = {
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
  globalMode = false,
}: {
  query: string;
  setQuery: (v: string) => void;
  globalMode?: boolean;
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
    const merged: MetricOption[] = [];
    for (const list of lists) {
      for (const item of list) {
        if (seen.has(item.id)) continue;
        seen.add(item.id);
        merged.push({ id: item.id, label: item.label, title: item.title });
      }
    }
    return merged;
  });

  const labelFor = (item: MetricOption) => pickLocale(item.title, activeLang) || item.label;

  const isSectionSlug = useMemo(() => menu.some((section) => section.id === slug), [menu, slug]);

  const selectedMetricId = useMemo(() => {
    if (metrics.length === 0 || isSectionSlug) return undefined;
    if (!slugInTree) return metrics.find((metric) => metric.id === slug)?.id;
    return metrics[0]?.id;
  }, [metrics, isSectionSlug, slugInTree, slug]);

  if (globalMode) {
    return (
      <Input
        value={query}
        onChange={(event) => setQuery(event.target.value)}
        className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none"
        placeholder={t("stat.search_placeholder", "Փնտրել")}
      />
    );
  }

  return (
    <Select
      value={selectedMetricId}
      disabled={metrics.length === 0 || isSectionSlug}
      onValueChange={(metricId) => router.push(`/stat/${metricId}`)}
    >
      <SelectTrigger className="border-textBlack300 h-10.5 w-full text-[rgba(55,71,79,1)] shadow-none">
        <SelectValue placeholder={t("stat.indicator_placeholder", "Ցուցանիշ")} />
      </SelectTrigger>
      <SelectContent position="popper" className="w-(--radix-select-trigger-width)">
        {metrics.map((metric) => (
          <SelectItem key={metric.id} value={metric.id}>
            {labelFor(metric)}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  );
}
