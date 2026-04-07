"use client";

import React, { useRef, useState } from "react";
import { importAttributesFromCSV } from "@/services/attributeService";
import { withToastError } from "@/lib/withToastError";
import z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import { Form, FormLabel } from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

const schema = z.object({
  file: z
    .instanceof(File, { message: "Ֆայլը պարտադիր է" })
    .refine((f) => f.size > 0, "Ֆայլը պարտադիր է"),
});
type FormValues = z.infer<typeof schema>;

type ImportAttributesProps = {
  selectedId?: string;
  onImport: () => void;
};

export default function ImportAttributes({ selectedId, onImport }: ImportAttributesProps) {
  const fileRef = useRef<HTMLInputElement | null>(null);
  const [isUploading, setIsUploading] = useState(false);
  const [selectedFileName, setSelectedFileName] = useState<string>("");

  const form = useForm<FormValues>({
    resolver: zodResolver(schema),
    defaultValues: {},
    mode: "onSubmit",
  });

  const {
    setValue,
    formState: { errors },
  } = form;

  const onSubmit = async (data: FormValues) => {
    if (!selectedId) return;

    try {
      setIsUploading(true);

      await withToastError(() => importAttributesFromCSV({ file: data.file, id: selectedId }), {
        title: "Ֆայլը բեռնվել է հաջողությամբ:",
        description: "Ֆայլը հաջողությամբ բեռնվել և մշակվել է:",
      });

      form.setValue("file", null as any);

      if (fileRef.current) {
        fileRef.current.value = "";
      }
      setSelectedFileName("");
      onImport();
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <div className="flex flex-col">
      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <div className="flex items-center gap-4 pb-5">
            <div>
              <FormLabel className="mb-2">Ֆայլ</FormLabel>
              <div className="flex items-center gap-3">
                <Input
                  type="file"
                  accept=".csv,.zip"
                  ref={fileRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] ?? null;
                    if (f) {
                      setValue("file", f, { shouldValidate: true });
                      setSelectedFileName(f.name);
                    } else {
                      setSelectedFileName("");
                    }
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-80 justify-start"
                  disabled={isUploading}
                  onClick={() => fileRef.current?.click()}
                >
                  {selectedFileName || "Ընտրել CSV ֆայլը"}
                </Button>
              </div>
              {errors.file && <p style={{ color: "crimson" }}>{errors.file.message}</p>}
            </div>

            <Button
              type="submit"
              className="mt-5 h-15"
              disabled={!selectedId || isUploading || !form.watch("file")}
            >
              {isUploading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {isUploading ? "Բեռնվում է..." : "Ներմուծել արժեքները"}
            </Button>
          </div>
        </form>
      </Form>
    </div>
  );
}
