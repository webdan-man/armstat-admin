import apiClient from "@/lib/api/api-client";
import { AuditLogsResponse } from "@/types/audit-logs";

export async function getAuditLogs() {
  return apiClient<AuditLogsResponse>(`/api/audit-logs?limit=1000`);
}
