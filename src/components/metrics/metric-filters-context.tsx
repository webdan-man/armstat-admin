"use client";

import React, { createContext, useContext, useMemo, useState } from "react";
import useSWR from "swr";

import { fetchSections } from "@/services/sectionsService";
import { swrKeys } from "@/lib/swr/cache-keys";
import type { Section, Topic } from "@/types/section";
import { isRootTopic } from "@/lib/section-topic-utils";

export type MetricSelectedFilter = {
  section: string;
  subgroup: string;
  subSubgroup: string;
  metric: string;
};
export type MetricFormMode = "closed" | "create" | "edit";

type MetricSectionsContextValue = {
  sections: Section[];
  isLoading: boolean;
};

type MetricFilterStateContextValue = {
  selectedFilter: MetricSelectedFilter;
  setSelectedFilter: React.Dispatch<React.SetStateAction<MetricSelectedFilter>>;
  formMode: MetricFormMode;
  isFormVisible: boolean;
  canSelectMetric: boolean;
  openCreateForm: () => void;
  closeForm: () => void;
  markMetricEdit: (metricId: string) => void;
  selectedSection: Section | undefined;
  rootTopics: Topic[];
  childTopics: Topic[];
  needsSubSubgroup: boolean;
  hierarchyComplete: boolean;
  /** Topic id for POST /metrics: deepest selected level (subSubgroup or subgroup). */
  resolvedTopicId: string | null;
};

const MetricSectionsContext = createContext<MetricSectionsContextValue | null>(null);
const MetricFilterStateContext = createContext<MetricFilterStateContextValue | null>(null);

export function MetricFiltersProvider({ children }: { children: React.ReactNode }) {
  const { data: sections = [], isLoading } = useSWR(swrKeys.sections, fetchSections);

  const [selectedFilter, setSelectedFilter] = useState<MetricSelectedFilter>({
    section: "",
    subgroup: "",
    subSubgroup: "",
    metric: "",
  });
  const [formMode, setFormMode] = useState<MetricFormMode>("closed");

  const sectionsValue = useMemo<MetricSectionsContextValue>(
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
  const canSelectMetric = !!selectedFilter.section;

  const openCreateForm = () => {
    // if (!resolvedTopicId) return;
    setFormMode("create");
    setSelectedFilter((prev) => ({ ...prev, metric: "" }));
  };
  const closeForm = () => setFormMode("closed");
  const markMetricEdit = (metricId: string) => {
    setSelectedFilter((prev) => ({ ...prev, metric: metricId }));
    setFormMode("edit");
  };

  React.useEffect(() => {
    if (selectedFilter.metric) {
      setFormMode("edit");
      return;
    }
    if (formMode === "create") {
      return;
    }
    if (formMode === "edit") {
      setFormMode("closed");
    }
  }, [selectedFilter.metric, formMode]);

  const filterStateValue = useMemo<MetricFilterStateContextValue>(
    () => ({
      selectedFilter,
      setSelectedFilter,
      formMode,
      isFormVisible: formMode !== "closed",
      canSelectMetric,
      openCreateForm,
      closeForm,
      markMetricEdit,
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
      canSelectMetric,
      selectedSection,
      rootTopics,
      childTopics,
      needsSubSubgroup,
      hierarchyComplete,
      resolvedTopicId,
      openCreateForm,
      closeForm,
      markMetricEdit,
    ]
  );

  return (
    <MetricSectionsContext.Provider value={sectionsValue}>
      <MetricFilterStateContext.Provider value={filterStateValue}>
        {children}
      </MetricFilterStateContext.Provider>
    </MetricSectionsContext.Provider>
  );
}

/** Subscribes only to sections SWR data — stable when only the selection changes (same cache). */
export function useMetricSections() {
  const ctx = useContext(MetricSectionsContext);
  if (!ctx) {
    throw new Error("useMetricSections must be used within MetricFiltersProvider");
  }
  return ctx;
}

export function useMetricFilterState() {
  const ctx = useContext(MetricFilterStateContext);
  if (!ctx) {
    throw new Error("useMetricFilterState must be used within MetricFiltersProvider");
  }
  return ctx;
}

export function useMetricFilters() {
  const { sections, isLoading } = useMetricSections();
  const filter = useMetricFilterState();
  return {
    sections,
    isLoading,
    ...filter,
  };
}
