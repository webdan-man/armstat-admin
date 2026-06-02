import useSWR from "swr";
import { User } from "@/types/users";
import { Permission } from "@/types/permissions";

export function useUser() {
  const { data } = useSWR("/api/user", (url) => fetch(url).then((r) => r.json()));

  return {
    _id: data?._id,
    permissions: data?.permissions ? (JSON.parse(data.permissions) as User["permissions"]) : [],
    isAdmin:
      data?.permissions && JSON.parse(data.permissions).some((p: Permission) => p.key === "*"),
  };
}
