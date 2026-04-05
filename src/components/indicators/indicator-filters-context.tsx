"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import useSWR from "swr";

import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import type { Section, Topic } from "@/types/section";

export type IndicatorSelectedFilter = {
  section: string;
  subgroup: string;
  subSubgroup: string;
  indicator: string;
};

type IndicatorSectionsContextValue = {
  sections: Section[];
  isLoading: boolean;
};

type IndicatorFilterStateContextValue = {
  selectedFilter: IndicatorSelectedFilter;
  setSelectedFilter: React.Dispatch<React.SetStateAction<IndicatorSelectedFilter>>;
  selectedSection: Section | undefined;
  rootTopics: Topic[];
  childTopics: Topic[];
  needsSubSubgroup: boolean;
  hierarchyComplete: boolean;
  /** Topic id for POST /metrics: leaf in hierarchy (subSubgroup or subgroup). */
  resolvedTopicId: string | null;
};

const IndicatorSectionsContext = createContext<IndicatorSectionsContextValue | null>(null);
const IndicatorFilterStateContext = createContext<IndicatorFilterStateContextValue | null>(null);

function isRootTopic(topic: Topic) {
  const p = topic.parentTopicId;
  return p == null || (typeof p === "string" && p.trim() === "");
}

export function IndicatorFiltersProvider({ children }: { children: React.ReactNode }) {
  const { data: sections = [], isLoading } = useSWR(swrKeys.sections, fetchSections);

  const [selectedFilter, setSelectedFilter] = useState<IndicatorSelectedFilter>({
    section: "",
    subgroup: "",
    subSubgroup: "",
    indicator: "",
  });

  const sectionsValue = useMemo<IndicatorSectionsContextValue>(
    () => ({ sections, isLoading }),
    [sections, isLoading]
  );

  const selectedSection = useMemo(
    () => sections.find((s) => s._id === selectedFilter.section),
    [sections, selectedFilter.section]
  );

  const rootTopics = useMemo(() => {
    if (!selectedSection) return [];
    return selectedSection.topics.filter(isRootTopic).sort((a, b) => a.order - b.order);
  }, [selectedSection]);

  const childTopics = useMemo(() => {
    if (!selectedSection || !selectedFilter.subgroup) return [];
    return selectedSection.topics
      .filter((t) => t.parentTopicId === selectedFilter.subgroup)
      .sort((a, b) => a.order - b.order);
  }, [selectedSection, selectedFilter.subgroup]);

  const needsSubSubgroup = childTopics.length > 0;
  const hierarchyComplete =
    Boolean(selectedFilter.section) &&
    Boolean(selectedFilter.subgroup) &&
    (needsSubSubgroup ? Boolean(selectedFilter.subSubgroup) : true);

  const resolvedTopicId = useMemo(() => {
    if (!hierarchyComplete) return null;
    if (selectedFilter.subSubgroup) return selectedFilter.subSubgroup;
    return selectedFilter.subgroup;
  }, [hierarchyComplete, selectedFilter.subgroup, selectedFilter.subSubgroup]);

  const filterStateValue = useMemo<IndicatorFilterStateContextValue>(
    () => ({
      selectedFilter,
      setSelectedFilter,
      selectedSection,
      rootTopics,
      childTopics,
      needsSubSubgroup,
      hierarchyComplete,
      resolvedTopicId,
    }),
    [
      selectedFilter,
      setSelectedFilter,
      selectedSection,
      rootTopics,
      childTopics,
      needsSubSubgroup,
      hierarchyComplete,
      resolvedTopicId,
    ]
  );

  return (
    <IndicatorSectionsContext.Provider value={sectionsValue}>
      <IndicatorFilterStateContext.Provider value={filterStateValue}>
        {children}
      </IndicatorFilterStateContext.Provider>
    </IndicatorSectionsContext.Provider>
  );
}

/** Subscribes only to sections SWR data — stable when only the selection changes (same cache). */
export function useIndicatorSections() {
  const ctx = useContext(IndicatorSectionsContext);
  if (!ctx) {
    throw new Error("useIndicatorSections must be used within IndicatorFiltersProvider");
  }
  return ctx;
}

export function useIndicatorFilterState() {
  const ctx = useContext(IndicatorFilterStateContext);
  if (!ctx) {
    throw new Error("useIndicatorFilterState must be used within IndicatorFiltersProvider");
  }
  return ctx;
}

export function useIndicatorFilters() {
  const { sections, isLoading } = useIndicatorSections();
  const filter = useIndicatorFilterState();
  return {
    sections,
    isLoading,
    ...filter,
  };
}
