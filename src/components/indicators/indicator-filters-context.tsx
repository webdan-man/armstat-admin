"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import useSWR from "swr";

import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import type { Section, Topic } from "@/types/section";
import { isRootTopic } from "@/lib/section-topic-utils";

export type IndicatorSelectedFilter = {
  section: string;
  subgroup: string;
  subSubgroup: string;
  indicator: string;
};
export type IndicatorFormMode = "closed" | "create" | "edit";

type IndicatorSectionsContextValue = {
  sections: Section[];
  isLoading: boolean;
};

type IndicatorFilterStateContextValue = {
  selectedFilter: IndicatorSelectedFilter;
  setSelectedFilter: React.Dispatch<React.SetStateAction<IndicatorSelectedFilter>>;
  formMode: IndicatorFormMode;
  isFormVisible: boolean;
  canSelectIndicator: boolean;
  openCreateForm: () => void;
  closeForm: () => void;
  markIndicatorEdit: (indicatorId: string) => void;
  selectedSection: Section | undefined;
  rootTopics: Topic[];
  childTopics: Topic[];
  needsSubSubgroup: boolean;
  hierarchyComplete: boolean;
  /** Topic id for POST /metrics: deepest selected level (subSubgroup or subgroup). */
  resolvedTopicId: string | null;
};

const IndicatorSectionsContext = createContext<IndicatorSectionsContextValue | null>(null);
const IndicatorFilterStateContext = createContext<IndicatorFilterStateContextValue | null>(null);

export function IndicatorFiltersProvider({ children }: { children: React.ReactNode }) {
  const { data: sections = [], isLoading } = useSWR(swrKeys.sections, fetchSections);

  const [selectedFilter, setSelectedFilter] = useState<IndicatorSelectedFilter>({
    section: "",
    subgroup: "",
    subSubgroup: "",
    indicator: "",
  });
  const [formMode, setFormMode] = useState<IndicatorFormMode>("closed");

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
    return selectedSection.topics.filter(isRootTopic);
  }, [selectedSection]);

  const childTopics = useMemo(() => {
    if (!selectedSection || !selectedFilter.subgroup) return [];
    return selectedSection.topics.find((t) => t._id === selectedFilter.subgroup)?.subtopics || [];
  }, [selectedSection, selectedFilter.subgroup]);

  const needsSubSubgroup = childTopics.length > 0;

  const resolvedTopicId = useMemo(() => {
    if (!selectedFilter.section || !selectedFilter.subgroup) return null;
    if (selectedFilter.subSubgroup) return selectedFilter.subSubgroup;
    return selectedFilter.subgroup;
  }, [selectedFilter.section, selectedFilter.subgroup, selectedFilter.subSubgroup]);

  const hierarchyComplete = Boolean(resolvedTopicId);
  const canSelectIndicator = hierarchyComplete;

  const openCreateForm = () => {
    if (!resolvedTopicId) return;
    setSelectedFilter((prev) => ({ ...prev, indicator: "" }));
    setFormMode("create");
  };
  const closeForm = () => setFormMode("closed");
  const markIndicatorEdit = (indicatorId: string) => {
    setSelectedFilter((prev) => ({ ...prev, indicator: indicatorId }));
    setFormMode("edit");
  };

  React.useEffect(() => {
    if (formMode === "create") {
      return;
    }
    if (selectedFilter.indicator) {
      setFormMode("edit");
      return;
    }
    if (formMode === "edit") {
      setFormMode("closed");
    }
  }, [selectedFilter.indicator, formMode]);

  const filterStateValue = useMemo<IndicatorFilterStateContextValue>(
    () => ({
      selectedFilter,
      setSelectedFilter,
      formMode,
      isFormVisible: formMode !== "closed",
      canSelectIndicator,
      openCreateForm,
      closeForm,
      markIndicatorEdit,
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
      formMode,
      canSelectIndicator,
      selectedSection,
      rootTopics,
      childTopics,
      needsSubSubgroup,
      hierarchyComplete,
      resolvedTopicId,
      openCreateForm,
      closeForm,
      markIndicatorEdit,
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
