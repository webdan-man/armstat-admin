"use client";

import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";

import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { withToastError } from "@/lib/withToastError";
import { getUserById, updateUser } from "@/services/userService";
import { User } from "@/types/users";
import { PermissionRow } from "@/components/users/PermissionRow";

export const userSchema = z.object({
  firstName: z.string().min(1, "Անունը պարտադիր է"),
  lastName: z.string().min(1, "Ազգանունը պարտադիր է"),
  email: z.string().email("Մուտքագրված էլ․ հասցեն անվավեր է"),
  password: z
    .string()
    .transform((val) => (val.trim() === "" ? undefined : val))
    .refine(
      (val) => val === undefined || val.length >= 6,
      "Գաղտնաբառը պետք է պարունակի առնվազն 6 նիշ"
    )
    .optional(),
  permissionIds: z.array(z.string()),
});

type UserForm = z.infer<typeof userSchema>;

function EditUserForm({ id }: { id: string }) {
  const [data, setData] = useState<User | null>(null);

  useEffect(() => {
    getUserById(id).then((data) => {
      setData(data);
    });
  }, [id]);

  const form = useForm<UserForm>({
    resolver: zodResolver(userSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      permissionIds: [],
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        firstName: data.firstName ?? "",
        lastName: data.lastName ?? "",
        email: data.email,
        password: "",
        permissionIds: data.permissions.map((p) => p._id),
      });
    }
  }, [data, form]);

  const onSubmit = async (values: UserForm) => {
    await withToastError(() => updateUser(id, values), {
      title: "Օգտագործողը թարմացվել է հաջողությամբ!",
      description: "Օգտագործողի տվյալները թարմացվել են և հասանելի են համակարգում։",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Խմբագրել օգտագործողը</h1>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
          <FormField
            control={form.control}
            name="firstName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Անուն</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Մուտքագրեք անունը" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="lastName"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Ազգանուն</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Մուտքագրեք ազգանունը" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="email"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Էլ․ փոստ</FormLabel>
                <FormControl>
                  <Input {...field} placeholder="Օրինակ՝ user@example.com" autoComplete="off" />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="password"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Գաղտնաբառ (թարմացնելու դեպքում)</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Նոր գաղտնաբառ"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PermissionRow />

          <Button type="submit">Թարմացնել օգտագործողը</Button>
        </form>
      </Form>
    </div>
  );
}

export default EditUserForm;
