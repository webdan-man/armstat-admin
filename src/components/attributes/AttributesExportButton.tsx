import React from "react";
import { Download } from "lucide-react";
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
    <Button
      disabled={disabled}
      variant="outline"
      size="sm"
      className="h-9"
      onClick={() => getCsv()}
    >
      <Download />
      Արտահանել
    </Button>
  );
};

export default AttributesExportButton;
