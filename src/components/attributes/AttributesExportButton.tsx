import React from "react";
import { downloadAttributesAsCSV } from "@/services/attributeService";
import useSWRMutation from "swr/mutation";
import { Button } from "@/components/ui/button";

const AttributesExportButton = () => {
    const { trigger: getCsv } = useSWRMutation(["attributes/csv"], async () =>
        downloadAttributesAsCSV()
    );

    return <Button onClick={() => getCsv()}>Արտահանել</Button>;
};

export default AttributesExportButton;
