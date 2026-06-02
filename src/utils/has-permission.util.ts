export const hasPermission = (permissions: string[], perm: string) =>
    permissions.includes("*") ||
    permissions.includes(perm) ||
    permissions.includes(perm.split(".")[0] + ".*");
