"use client";

import React from "react";
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
import { createUser } from "@/services/userService";
import { PermissionRow } from "./PermissionRow";

export const userSchema = z.object({
  firstName: z.string().min(1, "Անունը պարտադիր է"),
  lastName: z.string().min(1, "Ազգանունը պարտադիր է"),
  email: z.string().email("Անվավեր էլ․ փոստ"),
  password: z.string().min(6, "Գաղտնաբառը պետք է պարունակի առնվազն 6 նիշ"),
  permissionIds: z.array(z.string()),
});

type UserForm = z.infer<typeof userSchema>;

function CreateUserForm() {
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

  const onSubmit = async (values: UserForm) => {
    await withToastError(() => createUser(values), {
      title: "Օգտագործողը հաջողությամբ ստեղծվեց!",
      description: "Օգտագործողը ավելացվել է և հասանելի է համակարգում։",
    });
  };

  return (
    <div className="flex flex-col gap-3">
      <h1 className="text-2xl font-bold">Ստեղծել օգտագործող</h1>

      <Form {...form}>
        <form
          onSubmit={form.handleSubmit(onSubmit, (errors) => console.log(errors))}
          className="space-y-4"
        >
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
                  <Input {...field} placeholder="user@example.com" autoComplete="off" />
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
                <FormLabel>Գաղտնաբառ</FormLabel>
                <FormControl>
                  <Input
                    {...field}
                    type="password"
                    placeholder="Գաղտնաբառ"
                    autoComplete="new-password"
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          <PermissionRow />

          <Button type="submit">Ստեղծել օգտագործող</Button>
        </form>
      </Form>
    </div>
  );
}

export default CreateUserForm;
