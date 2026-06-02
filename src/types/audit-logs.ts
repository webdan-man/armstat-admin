import { User } from "@/types/users";

export type AuditLog = {
    id: number;
    actorUserId: number | null;
    actorUser: User | null;
    action: string;
    status: "success" | "fail";
    message: string | null;
    meta: Record<string, any> | null;
    before: Record<string, any> | null;
    after: Record<string, any> | null;
    createdAt: string;
};

export interface AuditLogsResponse {
    data: AuditLog[];
    total: number;
}
