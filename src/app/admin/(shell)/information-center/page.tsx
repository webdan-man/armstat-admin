import React from "react";

import { InformationCentreEditor } from "@/components/information-centre/InformationCentreEditor";
import { requirePermission } from "@/lib/require-permission";

export default async function InformationCentrePage() {
  await requirePermission("information-center");

  return <InformationCentreEditor />;
}
