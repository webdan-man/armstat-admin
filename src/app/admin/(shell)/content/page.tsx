import React from "react";

import { ContentPageEditor } from "@/components/content/ContentPageEditor";
import { requirePermission } from "@/lib/require-permission";

export default async function ContentPage() {
  await requirePermission("content");

  return <ContentPageEditor />;
}
