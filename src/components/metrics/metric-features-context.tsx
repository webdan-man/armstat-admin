"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import { sameValueIds } from "@/components/metrics/attribute-library-helpers";
import type { MetricFeature } from "@/types/metric-feature";

type MetricFeaturesContextValue = {
  features: MetricFeature[];
  dialogOpen: boolean;
  editingId: string | null;
  setDialogOpen: (open: boolean) => void;
  startCreate: () => void;
  startEdit: (id: string) => void;
  addFeature: (input: Omit<MetricFeature, "id">) => void;
  replaceFeatures: (next: MetricFeature[]) => void;
  updateFeature: (id: string, patch: Partial<MetricFeature>) => void;
  removeFeature: (id: string, options?: { cascade?: boolean }) => void;
};

const MetricFeaturesContext = createContext<MetricFeaturesContextValue | null>(null);

export function MetricFeaturesProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<MetricFeature[]>([]);
  const [dialogOpen, setDialogOpenState] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const setDialogOpen = useCallback((open: boolean) => {
    setDialogOpenState(open);
    if (!open) {
      setEditingId(null);
    }
  }, []);

  const startCreate = useCallback(() => {
    setEditingId(null);
    setDialogOpenState(true);
  }, []);

  const startEdit = useCallback((id: string) => {
    setEditingId(id);
    setDialogOpenState(true);
  }, []);

  const addFeature = useCallback((input: Omit<MetricFeature, "id">) => {
    setFeatures((prev) => [...prev, { ...input, id: crypto.randomUUID() }]);
  }, []);
  const replaceFeatures = useCallback((next: MetricFeature[]) => {
    setFeatures(next);
  }, []);

  const updateFeature = useCallback((id: string, patch: Partial<MetricFeature>) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFeature = useCallback((id: string, options?: { cascade?: boolean }) => {
    const cascade = options?.cascade ?? true;
    setFeatures((prev) => {
      const target = prev.find((feature) => feature.id === id);
      if (!target) return prev.filter((feature) => feature.id !== id);
      if (!cascade) return prev.filter((feature) => feature.id !== id);

      return prev.filter((feature) => {
        if (feature.id === id) return false;
        const isPairedRow =
          feature.attributeKey === target.attributeKey &&
          feature.level !== target.level &&
          sameValueIds(feature.valueIds, target.valueIds);
        return !isPairedRow;
      });
    });
  }, []);

  const value = useMemo(
    () => ({
      features,
      dialogOpen,
      editingId,
      setDialogOpen,
      startCreate,
      startEdit,
      addFeature,
      replaceFeatures,
      updateFeature,
      removeFeature,
    }),
    [
      features,
      dialogOpen,
      editingId,
      setDialogOpen,
      startCreate,
      startEdit,
      addFeature,
      replaceFeatures,
      updateFeature,
      removeFeature,
    ]
  );

  return (
    <MetricFeaturesContext.Provider value={value}>{children}</MetricFeaturesContext.Provider>
  );
}

export function useMetricFeatures() {
  const ctx = useContext(MetricFeaturesContext);
  if (!ctx) {
    throw new Error("useMetricFeatures must be used within MetricFeaturesProvider");
  }
  return ctx;
}
