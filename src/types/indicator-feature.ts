export type IndicatorFeature = {
  id: string;
  category: string;
  attributeKey: string;
  attributeKeyLabel: string;
  level: "primary" | "secondary";
  valueIds: string[];
  /** Per-locale display label sent to the API on each attributes[] entry. */
  label: { hy: string; en: string; ru: string };
  /** Ցուցադրման համար սյունակ «Գրադարան» */
  libraryDisplay: string;
};
