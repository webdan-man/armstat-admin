// require-role.ts (server-only)
import "server-only";
import { forbidden } from "next/navigation";
import { cookies } from "next/headers";
import { hasPermission } from "@/utils/has-permission.util";
import { Permission } from "@/types/permissions";

function safeParsePermissions(raw: string | undefined): Permission[] {
  if (!raw) return [];
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? (parsed as Permission[]) : [];
  } catch (e) {
    console.error("Failed to parse user permissions:", e);
    return [];
  }
}

export async function requirePermission(permissionKey: string) {
  console.log("requirePermission", permissionKey);

  const allowed = await hasPermissionByKey(permissionKey);
  if (!allowed) {
    forbidden(); // renders the 403 page
  }
}

export async function hasPermissionByKey(permissionKey: string) {
  const cookiesData = await cookies();

  const cookie = await cookiesData.get("userPermissions")?.value;

  console.log("cookie", cookie);

  const permissions = safeParsePermissions(cookie);

  console.log("hasPermissionByKey", permissions);
  const userPermissionKeys = permissions.map((p) => p.key);

  return hasPermission(userPermissionKeys, permissionKey);
}
