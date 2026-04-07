export type IndicatorFeature = {
  id: string;
  category: string;
  attributeKey: string;
  attributeKeyLabel: string;
  level: "primary" | "secondary";
  valueIds: string[];
  /** Ցուցադրման համար սյունակ «Գրադարան» */
  libraryDisplay: string;
};
