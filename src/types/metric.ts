/** Body for POST /metrics */
export type MetricAttribute = {
  attributeId: string;
  valueIds: string[];
};

export type CreateMetricBody = {
  topicId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  metadata: Record<string, string>;
  attributes: MetricAttribute[];
  order: number;
};

export type UpdateMetricBody = {
  title: Record<string, string>;
  description: Record<string, string>;
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
  attributes?: MetricAttribute[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
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
  attribute: MetricCombinationRowAttribute;
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
  row?: MetricCombinationRowEntry[];
};
