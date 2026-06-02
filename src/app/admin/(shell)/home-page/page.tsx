import React from "react";

import { MainPageEditor } from "@/components/main/MainPageEditor";
import { requirePermission } from "@/lib/require-permission";

export default async function MainPage() {
  await requirePermission("home-page");

  return <MainPageEditor />;
}
