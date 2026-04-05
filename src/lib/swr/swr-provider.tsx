"use client";

import React from "react";
import { SWRConfig } from "swr";
import { toast } from "sonner";
import { ApiError } from "@/lib/api/api-error";

function swrOnError(error: Error) {
  if (error instanceof ApiError) {
    const errors = error.data?.errors;

    if (errors && typeof errors === "object") {
      Object.values(errors).forEach((msg: unknown) => {
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

const swrDefaultConfig = {
  revalidateOnFocus: false,
  dedupingInterval: 2000,
  shouldRetryOnError: false,
  onError: swrOnError,
};

export function SwrProvider({ children }: { children: React.ReactNode }) {
  return <SWRConfig value={swrDefaultConfig}>{children}</SWRConfig>;
}
