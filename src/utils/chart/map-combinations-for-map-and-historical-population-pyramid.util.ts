import type { MetricCombination } from "@/types/metric";
import type { Attribute } from "@/types/attribute";
import { mapCombinationsForArmeniaProvinces } from "@/utils/chart/map-combinations-for-armenia-provinces";
import {
  mapCombinationsForPyramid,
  mapCombinationsForPyramidByFrameCategory,
} from "@/utils/chart/map-combinations-for-pyramid";

/**
 * Province + Gender + Age + (Time OR Area/Other)
 *
 * - pyramidData: same format as HistoricalPopulationPyramidChart expects, aggregated
 *   across all provinces (the map handles per-province breakdown).
 * - mapData: total values per province (for ArmeniaProvincesMap).
 */
export const mapCombinationsForMapAndHistoricalPopulationPyramid = (payload: {
  combinations: MetricCombination[];
  provinceAttributeId: string;
  /** Full category→attribute map built from these combinations. */
  attributeMapByCategory: Map<string, Attribute>;
  /**
   * Pass the frame attribute id when the 4th dimension is AREA or OTHER.
   * Leave undefined when the 4th dimension is TIME (uses time axis).
   */
  frameAttributeId?: string;
}) => {
  const { combinations, provinceAttributeId, attributeMapByCategory, frameAttributeId } = payload;

  const pyramidResult = frameAttributeId
    ? mapCombinationsForPyramidByFrameCategory({
        combinations,
        attributeMapByCategory,
        frameAttributeId,
      })
    : mapCombinationsForPyramid({ combinations, attributeMapByCategory });

  const mapData = mapCombinationsForArmeniaProvinces(combinations, provinceAttributeId);

  return {
    pyramidData: pyramidResult.data,
    mapData,
    seriesKeys: pyramidResult.seriesKeys,
    timelineMode: pyramidResult.timelineMode,
  };
};
