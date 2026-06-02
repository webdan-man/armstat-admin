import AuditLogs from "@/components/audit-logs/AuditLogs";
import { requirePermission } from "@/lib/require-permission";

export default async function Page() {
  await requirePermission("audit-log");

  return <AuditLogs />;
}
