import { Controller, useFormContext } from "react-hook-form";
import React, { JSX } from "react";
import useSWR from "swr";
import { getPermissions } from "@/services/permissions";
import { Checkbox } from "@/components/ui/checkbox";
import { FormControl, FormItem } from "@/components/ui/form";

export function PermissionRow(): JSX.Element {
  const { control } = useFormContext();

  const result = useSWR("/api/permissions", () => getPermissions(), {
    revalidateOnFocus: false,
    revalidateOnReconnect: false,
    revalidateIfStale: false,
    refreshInterval: 0,
  });

  return (
    <div>
      <p className="text-xl font-bold">Իրավասություններ</p>

      {result.data?.data.map((permission) => (
        <Controller
          key={permission._id}
          control={control}
          name="permissionIds"
          render={({ field }) => {
            const selected: string[] = field.value ?? [];
            const checked = selected.includes(permission._id);

            return (
              <FormItem className="mt-2 flex items-center gap-2">
                <FormControl>
                  <Checkbox
                    checked={checked}
                    onCheckedChange={(checked) => {
                      const next = checked
                        ? [...selected, permission._id]
                        : selected.filter((k) => k !== permission._id);
                      field.onChange(next);
                    }}
                  />
                </FormControl>
                <label className="mt-0">{permission.description}</label>
              </FormItem>
            );
          }}
        />
      ))}
    </div>
  );
}
