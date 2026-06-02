import React from "react";
import GroupsPage from "./page-content";
import { requirePermission } from "@/lib/require-permission";

export default async function Page() {
  await requirePermission("sections");

  return <GroupsPage />;
}
