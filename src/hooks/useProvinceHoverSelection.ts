import { useCallback, useMemo, useState } from "react";

/**
 * Manages province selection with a "hover preview".
 *
 * - Click/select sets the locked selection.
 * - Hover temporarily overrides selection.
 * - Hover-out (`null`) restores the last selected province (does not clear it).
 */
export function useProvinceHoverSelection() {
  const [selectedProvinceMapId, setSelectedProvinceMapId] = useState<string | null>(null);
  const [hoveredProvinceMapId, setHoveredProvinceMapId] = useState<string | null>(null);

  const onPolygonSelect = useCallback((provinceMapId: string | null) => {
    setSelectedProvinceMapId(provinceMapId);
  }, []);

  const onPolygonHover = useCallback((provinceMapId: string | null) => {
    setHoveredProvinceMapId(provinceMapId);
  }, []);

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

