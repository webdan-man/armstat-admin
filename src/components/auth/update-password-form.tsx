"use client";

import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { PasswordInput } from "@/components/ui/password-input";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { updatePassword } from "@/services/authService";
import { withToastError } from "@/lib/withToastError";

const formSchema = z
  .object({
    currentPassword: z.string().min(1, { message: "Մուտքագրեք ընթացիկ գաղտնաբառը։" }),
    newPassword: z
      .string()
      .min(8, { message: "Նոր գաղտնաբառը պետք է ունենա առնվազն 8 նիշ։" }),
    confirmNewPassword: z.string(),
  })
  .refine((data) => data.newPassword === data.confirmNewPassword, {
    message: "Գաղտնաբառերը չեն համընկնում։",
    path: ["confirmNewPassword"],
  })
  .refine((data) => data.currentPassword !== data.newPassword, {
    message: "Նոր գաղտնաբառը պետք է տարբերվի ընթացիկից։",
    path: ["newPassword"],
  });

type FormValues = z.infer<typeof formSchema>;

export default function UpdatePasswordForm() {
  const [loading, setLoading] = useState(false);

  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmNewPassword: "",
    },
  });

  async function onSubmit(values: FormValues) {
    setLoading(true);
    const result = await withToastError(
      () =>
        updatePassword({
          currentPassword: values.currentPassword,
          newPassword: values.newPassword,
        }),
      { title: "Գաղտնաբառը հաջողությամբ թարմացվեց։" }
    );
    setLoading(false);

    if (result !== undefined) {
      form.reset();
    }
  }

  return (
    <div className="max-w-lg py-6">
      <Card>
        <CardHeader>
          <CardTitle>Փոխել գաղտնաբառը</CardTitle>
        </CardHeader>
        <CardContent>
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <FormField
                control={form.control}
                name="currentPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Ընթացիկ գաղտնաբառ</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" autoComplete="current-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Նոր գաղտնաբառ</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormDescription>Առնվազն 8 նիշ։</FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="confirmNewPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Կրկնեք նոր գաղտնաբառը</FormLabel>
                    <FormControl>
                      <PasswordInput placeholder="********" autoComplete="new-password" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <Button type="submit" disabled={loading}>
                {loading ? "Պահպանվում է..." : "Պահպանել"}
              </Button>
            </form>
          </Form>
        </CardContent>
      </Card>
    </div>
  );
}
