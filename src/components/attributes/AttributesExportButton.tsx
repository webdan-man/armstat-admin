import React from "react";
import { downloadAttributesAsCSV } from "@/services/attributeService";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";
import { swrKeys } from "@/lib/swr/cache-keys";

const AttributesExportButton = () => {
    const { trigger: getCsv } = useSWRMutation(swrKeys.attributesExportCsv, async () =>
        downloadAttributesAsCSV()
    );

    return <Button onClick={() => getCsv()}>Արտահանել</Button>;
};

export default AttributesExportButton;
