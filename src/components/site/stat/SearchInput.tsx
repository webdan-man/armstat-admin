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
import { useRouter } from "next/navigation";
import useSWR from "swr";
import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import { isRootTopic } from "@/lib/section-topic-utils";
import type { Topic } from "@/types/section";

type SearchOption = {
  id: string;
  label: string;
};

function flattenTopics(topics: Topic[]): Topic[] {
  return topics.flatMap((t) => [t, ...flattenTopics(t.subtopics ?? [])]);
}

export default function SearchInput({
  query,
  setQuery,
  setData,
}: {
  query: string;
  setQuery: (v: string) => void;
  setData: (v: any) => void;
}) {
  const router = useRouter();
  const { data: sections = [] } = useSWR(swrKeys.sections, fetchSections);

  const options = useMemo<SearchOption[]>(() => {
    return sections.flatMap((section) => {
      const rootTopics = section.topics.filter(isRootTopic);
      const allTopics = flattenTopics(rootTopics);
      return allTopics.map((t) => ({ id: t._id, label: t.title }));
    });
  }, [sections]);

  return (
    <Combobox
      items={options}
      itemToStringValue={(item: SearchOption) => item.label}
      onValueChange={(item: SearchOption | null) => {
        if (item) {
          setQuery("");
          setData([]);
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
