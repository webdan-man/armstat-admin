import { useCallback, useEffect, useMemo, useRef, useState } from "react";

/**
 * Manages province selection with a "hover preview".
 *
 * - Click/select sets the locked selection.
 * - Hover temporarily overrides selection.
 * - Hover-out (`null`) restores the last selected province (does not clear it).
 *
 * Hover-out is debounced so crossing a border (null flash between two provinces)
 * does not cause a chart re-filter.
 */
export function useProvinceHoverSelection() {
  const [selectedProvinceMapId, setSelectedProvinceMapId] = useState<string | null>(null);
  const [hoveredProvinceMapId, setHoveredProvinceMapId] = useState<string | null>(null);
  const clearTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const onPolygonSelect = useCallback((provinceMapId: string | null) => {
    setSelectedProvinceMapId(provinceMapId);
  }, []);

  const onPolygonHover = useCallback((provinceMapId: string | null) => {
    if (clearTimerRef.current !== null) {
      clearTimeout(clearTimerRef.current);
      clearTimerRef.current = null;
    }
    if (provinceMapId !== null) {
      setHoveredProvinceMapId(provinceMapId);
    } else {
      // Delay clearing so a brief null between two provinces is swallowed.
      clearTimerRef.current = setTimeout(() => {
        setHoveredProvinceMapId(null);
        clearTimerRef.current = null;
      }, 80);
    }
  }, []);

  useEffect(
    () => () => {
      if (clearTimerRef.current !== null) clearTimeout(clearTimerRef.current);
    },
    []
  );

  const activeProvinceMapId = useMemo(
    () => hoveredProvinceMapId ?? selectedProvinceMapId,
    [hoveredProvinceMapId, selectedProvinceMapId]
  );

  return {
    selectedProvinceMapId,
    hoveredProvinceMapId,
    activeProvinceMapId,
    onPolygonSelect,
    onPolygonHover,
    setSelectedProvinceMapId,
    setHoveredProvinceMapId,
  };
}
