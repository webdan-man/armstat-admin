import type { Topic } from "@/types/section";

export function isRootTopic(topic: Topic) {
  const p = topic.parentTopicId;
  return p == null || (typeof p === "string" && p.trim() === "");
}
