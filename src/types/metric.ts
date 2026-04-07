/** Body for POST /metrics */
export type MetricAttributeKey = {
  attributeId: string;
  valueIds: string[];
};

export type CreateMetricBody = {
  topicId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  metadata: Record<string, string>;
  attributeKeys: MetricAttributeKey[];
  order: number;
};

export type UpdateMetricBody = {
  title: Record<string, string>;
  description: Record<string, string>;
  metadata: Record<string, string>;
  attributeKeys: MetricAttributeKey[];
  order: number;
};

export type MetricResponse = {
  _id: string;
  topicId?: string;
  title?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
  description?: Record<string, string> & { am?: string; hy?: string; ru?: string; en?: string };
  metadata?: Record<string, unknown>;
  attributeKeys?: MetricAttributeKey[];
  order?: number;
  createdAt?: string;
  updatedAt?: string;
};

export type MetricSelectOption = {
  id: string;
  label: string;
  updatedAt: string | null;
};
