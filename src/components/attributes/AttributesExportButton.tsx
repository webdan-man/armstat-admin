import React from "react";
import { downloadAttributesAsCSV } from "@/services/attributeService";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";
import { swrKeys } from "@/lib/swr/cache-keys";

const AttributesExportButton = ({
  selectedId,
  disabled,
}: {
  selectedId: string;
  disabled: boolean;
}) => {
  const { trigger: getCsv } = useSWRMutation(swrKeys.attributesExportCsv, async () =>
    downloadAttributesAsCSV(selectedId)
  );

  return (
    <Button disabled={disabled} size="sm" className="h-15 max-w-30" onClick={() => getCsv()}>
      Արտահանել արժեքները
    </Button>
  );
};

export default AttributesExportButton;
