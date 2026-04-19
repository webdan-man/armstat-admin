/** Per-locale label for a metric attribute row (sent as `label` on each attributes[] item). */
export type MetricAttributeLabel = {
  hy: string;
  en: string;
  ru: string;
};

/** Single attribute row on a metric (API + admin form). */
export type MetricAttribute = {
  attributeId: string;
  valueIds: string[];
  /** `label: { [lang]: text }` for hy, en, ru. */
  label: MetricAttributeLabel;
  /** Same shape as `label`, sent as `secondaryLabel` on each attributes[] item. */
  secondaryLabel: MetricAttributeLabel;
};

/** Shape returned by GET /metrics/:id when `label` / `secondaryLabel` may be absent (legacy rows). */
export type MetricAttributeFromApi = Omit<MetricAttribute, "label" | "secondaryLabel"> & {
  label?: MetricAttributeLabel;
  secondaryLabel?: MetricAttributeLabel;
};

export type CreateMetricBody = {
  topicId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  unit: Record<string, string>;
  metadata: Record<string, string>;
  attributes: MetricAttribute[];
  order: number;
};

export type UpdateMetricBody = {
  title: Record<string, string>;
  description: Record<string, string>;
  unit: Record<string, string>;
  link: Record<string, string>;
  metadata: Record<string, string>;
  attributes: MetricAttribute[];
  order: number;
};

export type MetricResponse = {
  _id: string;
  topicId?: string;
  title?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
  description?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
  metadata?: Record<string, unknown>;
  attributes?: MetricAttributeFromApi[];
  order?: number;
  link?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
  createdAt?: string;
  updatedAt?: string;
  unit?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
};

export type MetricSelectOption = {
  id: string;
  label: string;
  updatedAt: string | null;
};

/** GET /api/combinations/:metricId/combinations */
export type MetricCombinationRowAttribute = {
  _id: string;
  title: string;
};

export type MetricCombinationRowValue = {
  _id: string;
  title: string;
};

export type MetricCombinationRowEntry = {
  attributeId: string;
  label: string;
  value: MetricCombinationRowValue;
  level: number;
};

export type MetricCombination = {
  _id: string;
  combinationKey: string;
  metricId: string;
  __v?: number;
  attributes: Record<string, string>;
  createdAt?: string;
  updatedAt?: string;
  value: string;
  /** Breakdown of attribute–value pairs for this combination; may be empty. */
  row: MetricCombinationRowEntry[];
};
