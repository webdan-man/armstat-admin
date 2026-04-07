"use client";

import React, { createContext, useCallback, useContext, useMemo, useState } from "react";

import type { IndicatorFeature } from "@/types/indicator-feature";

type IndicatorFeaturesContextValue = {
  features: IndicatorFeature[];
  dialogOpen: boolean;
  editingId: string | null;
  setDialogOpen: (open: boolean) => void;
  startCreate: () => void;
  startEdit: (id: string) => void;
  addFeature: (input: Omit<IndicatorFeature, "id">) => void;
  replaceFeatures: (next: IndicatorFeature[]) => void;
  updateFeature: (id: string, patch: Partial<IndicatorFeature>) => void;
  removeFeature: (id: string) => void;
};

const IndicatorFeaturesContext = createContext<IndicatorFeaturesContextValue | null>(null);

export function IndicatorFeaturesProvider({ children }: { children: React.ReactNode }) {
  const [features, setFeatures] = useState<IndicatorFeature[]>([]);
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

  const addFeature = useCallback((input: Omit<IndicatorFeature, "id">) => {
    setFeatures((prev) => [...prev, { ...input, id: crypto.randomUUID() }]);
  }, []);
  const replaceFeatures = useCallback((next: IndicatorFeature[]) => {
    setFeatures(next);
  }, []);

  const updateFeature = useCallback((id: string, patch: Partial<IndicatorFeature>) => {
    setFeatures((prev) => prev.map((f) => (f.id === id ? { ...f, ...patch } : f)));
  }, []);

  const removeFeature = useCallback((id: string) => {
    setFeatures((prev) => prev.filter((f) => f.id !== id));
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
    <IndicatorFeaturesContext.Provider value={value}>{children}</IndicatorFeaturesContext.Provider>
  );
}

export function useIndicatorFeatures() {
  const ctx = useContext(IndicatorFeaturesContext);
  if (!ctx) {
    throw new Error("useIndicatorFeatures must be used within IndicatorFeaturesProvider");
  }
  return ctx;
}
