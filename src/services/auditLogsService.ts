import apiClient from "@/lib/api/api-client";
import { AuditLogsResponse } from "@/types/audit-logs";

export async function getAuditLogs({ page, limit }: { page: number; limit: number }) {
  const params = new URLSearchParams({
    page: String(page),
    limit: String(limit),
  });
  return apiClient<AuditLogsResponse>(`/api/audit-logs?${params.toString()}`);
}
