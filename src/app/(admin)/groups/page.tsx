"use client";

import React, { useMemo, useState } from "react";
import useSWR from "swr";

import { CreateSectionDialog } from "@/components/groups/CreateSectionDialog";
import { GroupsHeader } from "@/components/groups/GroupsHeader";
import { GroupsSearchField } from "@/components/groups/GroupsSearchField";
import { SectionAccordion } from "@/components/groups/SectionAccordion";
import { swrKeys } from "@/lib/swr/cache-keys";
import { fetchSections } from "@/services/sectionsService";
import type { Section } from "@/types/section";

function filterSectionsByQuery(sections: Section[], query: string): Section[] {
  const q = query.trim().toLowerCase();
  if (!q) return sections;
  return sections.filter((s) => {
    if (s.name.toLowerCase().includes(q)) return true;
    return s.topics.some((t) => t.title.toLowerCase().includes(q));
  });
}

export default function GroupsPage() {
  const [search, setSearch] = useState("");
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const { data: sections = [], isLoading } = useSWR(swrKeys.sections, fetchSections);

  const filteredSections = useMemo(
    () => filterSectionsByQuery(sections, search),
    [sections, search]
  );

  const hasSections = sections.length > 0;
  const isEmpty = !isLoading && !hasSections;
  const isNoResults = hasSections && filteredSections.length === 0;
  const showAccordion = filteredSections.length > 0;

  return (
    <div className="flex w-full flex-col gap-2.5 overflow-y-auto">
      <GroupsHeader onAddClick={() => setCreateDialogOpen(true)} />
      <GroupsSearchField value={search} onChange={setSearch} />
      {isLoading && <p className="text-sm text-[#646464]">Բեռնվում է…</p>}
      {isEmpty && <p className="text-sm text-[#646464]">Բաժիններ չկան։</p>}
      {isNoResults && <p className="text-sm text-[#646464]">Ոչինչ չի գտնվել։</p>}
      {showAccordion && <SectionAccordion sections={filteredSections} />}
      <CreateSectionDialog open={createDialogOpen} onOpenChange={setCreateDialogOpen} />
    </div>
  );
}
