import React from "react";
import { AuditLog } from "@/types/audit-logs";
import { formatDisplayDateTime } from "@/lib/format-display-date";

const AuditLogInfo = ({ auditLog }: { auditLog: AuditLog }) => {
  const { actorUser } = auditLog;

  return (
    <div>
      {actorUser && (
        <>
          <div>
            Էլ. հասցե: <b>{actorUser.email ?? "-"}</b>
          </div>
        </>
      )}

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "14px",
        }}
      >
        <div>
          Գործողություն: <b>{auditLog.action}</b>
        </div>
        <div>
          Ամսաթիվ: <b>{formatDisplayDateTime(auditLog.createdAt)}</b>
        </div>
        <div>
          Կարգավիճակ: <b>{auditLog.status}</b>
        </div>
        <div>
          Message: <b>{auditLog.message}</b>
        </div>
        {!!auditLog.before && (
          <div style={{ wordBreak: "break-word", maxHeight: "300px", overflowY: "auto" }}>
            Before: <b>{JSON.stringify(auditLog.before)}</b>
          </div>
        )}
        {!!auditLog.after && (
          <div style={{ wordBreak: "break-word", maxHeight: "300px", overflowY: "auto" }}>
            After: <b>{JSON.stringify(auditLog.after)}</b>
          </div>
        )}
        {!!auditLog.meta && (
          <div style={{ wordBreak: "break-word" }}>
            Meta: <b>{JSON.stringify(auditLog.meta)}</b>
          </div>
        )}
      </div>
    </div>
  );
};

export default AuditLogInfo;
