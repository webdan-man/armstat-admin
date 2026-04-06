import React from "react";
import { downloadAttributesAsCSV } from "@/services/attributeService";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";
import { swrKeys } from "@/lib/swr/cache-keys";

const AttributesExportButton = () => {
  const { trigger: getCsv } = useSWRMutation(swrKeys.attributesExportCsv, async () =>
    downloadAttributesAsCSV()
  );

  return (
    <Button size="sm" className="h-15 max-w-30" onClick={() => getCsv()}>
      Արտահանել արժեքները
    </Button>
  );
};

export default AttributesExportButton;
