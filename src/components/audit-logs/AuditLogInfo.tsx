import React from "react";
import { AuditLog } from "@/types/audit-logs";
import { format } from "date-fns";

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

            <div>
                <div>
                    Գործողություն: <b>{auditLog.action}</b>
                </div>
                <div>
                    Ամսաթիվ: <b>{format(new Date(auditLog.createdAt), "d MMMM yyyy HH:mm")}</b>
                </div>
                <div>
                    Կարգավիճակ: <b>{auditLog.status}</b>
                </div>
                <div>
                    Message: <b>{auditLog.message}</b>
                </div>
                {!!auditLog.before && (
                    <div style={{ wordBreak: "break-word" }}>
                        Before: <b>{JSON.stringify(auditLog.before)}</b>
                    </div>
                )}
                {!!auditLog.after && (
                    <div style={{ wordBreak: "break-word" }}>
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
