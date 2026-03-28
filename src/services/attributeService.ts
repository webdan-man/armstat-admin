import apiClient from "@/lib/api/api-client";
import { Attribute } from "@/types/attribute";

export async function fetchAttributes() {
    return apiClient<Attribute[]>(`${process.env.NEXT_PUBLIC_BASE_URL}/attributes`);
}

// export async function postVehicleCalculatorRulesCsv(file: File): Promise<{ inserted: number }> {
//     const formData = new FormData();
//     formData.append("file", file);
//
//     return apiClient(`/api/vehicle-calculator-rules/csv`, {
//         method: "POST",
//         body: formData,
//     });
// }
