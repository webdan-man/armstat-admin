import React from "react";
import AttributesList from "@/components/attributes/AttributesList";
import { requirePermission } from "@/lib/require-permission";

export default async function AttributesPage() {
  await requirePermission("attributes");

  return <AttributesList />;
}
