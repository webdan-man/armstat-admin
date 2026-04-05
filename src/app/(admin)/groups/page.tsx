"use client";

import React, { useMemo, useState } from "react";

import { GroupsHeader } from "@/components/groups/GroupsHeader";
import { MOCK_SECTIONS } from "@/components/groups/groups-mock-data";
import { GroupsSearchField } from "@/components/groups/GroupsSearchField";
import { SectionAccordion } from "@/components/groups/SectionAccordion";
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
  const sections = MOCK_SECTIONS;

  const filteredSections = useMemo(
    () => filterSectionsByQuery(sections, search),
    [sections, search]
  );

  return (
    <div className="flex w-full flex-col gap-2.5 overflow-y-auto">
      <GroupsHeader />
      <GroupsSearchField value={search} onChange={setSearch} />
      {sections.length === 0 && (
        <p className="text-sm text-[#646464]">Բաժիններ չկան։</p>
      )}
      {sections.length > 0 && filteredSections.length === 0 && (
        <p className="text-sm text-[#646464]">Ոչինչ չի գտնվել։</p>
      )}
      {filteredSections.length > 0 && <SectionAccordion sections={filteredSections} />}
    </div>
  );
}
