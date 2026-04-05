/** Body for POST /metrics */
export type CreateMetricBody = {
  topicId: string;
  title: Record<string, string>;
  description: Record<string, string>;
  metadata: Record<string, unknown>;
  attributeKeys: string[];
  order: number;
};
