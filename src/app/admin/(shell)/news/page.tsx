import React from "react";

import { NewsPageEditor } from "@/components/news/NewsPageEditor";
import { requirePermission } from "@/lib/require-permission";

export default async function NewsPage() {
  await requirePermission("news");

  return <NewsPageEditor />;
}
