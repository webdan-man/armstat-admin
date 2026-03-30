import { toast } from "sonner";
import { ApiError } from "./api/api-error";

export async function withToastError<T>(
    fn: () => Promise<T>,
    successMessage?: { title: string; description?: string }
): Promise<T | undefined> {
    try {
        const result = await fn();

        if (successMessage) {
            toast.success(successMessage.title, {
                description: successMessage.description,
            });
        }

        return result;
    } catch (error: any) {
        if (error instanceof ApiError) {
            const errors = error.data?.errors;

            if (errors && typeof errors === "object") {
                Object.values(errors).forEach((msg: any) => {
                    toast.error("Սխալ!", {
                        description: String(msg),
                    });
                });
            } else {
                toast.error("Սխալ!", {
                    description: error.message || "Սերվերի սխալ։",
                });
            }
        } else {
            toast.error("Սխալ կապի հետ։", {
                description: "Խնդրում ենք ստուգել ձեր ինտերնետ կապը։",
            });
        }
    }
}
