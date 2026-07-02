"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { formatDisplayDate } from "@/lib/format-display-date";
import { useRouter } from "next/navigation";
import { withToastError } from "@/lib/withToastError";
import { UsersResponse } from "@/types/users";
import { deleteUser, getUsers } from "@/services/userService";
import { useUser } from "@/hooks/useUser";
import { cn } from "@/lib/utils";

export default function ListTable() {
  const [data, setData] = useState<UsersResponse["data"] | null>(null);

  useEffect(() => {
    getUsers().then((data) => {
      setData(data);
    });
  }, []);

  const router = useRouter();

  const onDelete = async (id: string) => {
    await withToastError(() => deleteUser(id), {
      title: "Օգտատերը ջնջվեց։",
      description: "Օգտատերը հաջողությամբ հեռացվեց։",
    });

    router.refresh();
  };

  const user = useUser();

  const userPermissionKeys = user.permissions.map((p) => p.key);

  const hasPermission = (perm: string) =>
    userPermissionKeys.includes("*") ||
    userPermissionKeys.includes(perm) ||
    userPermissionKeys.includes(perm.split(".")[0] + ".*");

  const thClass = "bg-background sticky top-0 z-20";

  return (
    <div className="flex w-full flex-col pb-10">
      <div className="sticky top-0 z-10 -mx-11 flex min-h-11 flex-col gap-4 bg-[#f9fafb] px-11 pt-7 pb-4 sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-xl leading-6 font-medium text-[#2c2c2c]">Օգտատերերի կառավարում</h1>
        <Button
          type="button"
          disabled={!hasPermission("user.create")}
          className="h-11 shrink-0 rounded-lg border-0 bg-[#004d99] px-5 text-[13px] font-medium text-white hover:bg-[#004080] disabled:opacity-50"
          onClick={() => router.push(`/users/create`)}
        >
          Ավելացնել օգտատեր
        </Button>
      </div>
      <div className="w-full">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className={thClass}>Էլ. հասցե</TableHead>
              <TableHead className={thClass}>Ստեղծման ամսաթիվ</TableHead>
              <TableHead className={thClass}>Գործողություններ</TableHead>
            </TableRow>
          </TableHeader>

          <TableBody>
            {data?.map((item: any) => {
              const isCurrentUser = item._id === user._id;

              return (
                <TableRow key={item._id}>
                  <TableCell>{item.email}</TableCell>
                  <TableCell>
                    {formatDisplayDate(item.createdAt)}
                  </TableCell>

                  <TableCell>
                    <Button
                      disabled={isCurrentUser}
                      variant="outline"
                      size="sm"
                      onClick={() => router.push(`/users/${item._id}`)}
                      className="mr-2"
                    >
                      Դիտել և խմբագրել
                    </Button>

                    <AlertDialog>
                      <AlertDialogTrigger asChild>
                        <Button variant="destructive" size="sm" disabled={isCurrentUser}>
                          Ջնջել
                        </Button>
                      </AlertDialogTrigger>

                      <AlertDialogContent>
                        <AlertDialogHeader>
                          <AlertDialogTitle>
                            Վստա՞հ եք, որ ցանկանում եք ջնջել օգտատերը։
                          </AlertDialogTitle>
                          <AlertDialogDescription>
                            Այս գործողությունը չի կարող չեղարկվել։ Այն ամբողջությամբ կհեռացնի
                            տվյալներն ու օգտատիրոջ հաշիվը։
                          </AlertDialogDescription>
                        </AlertDialogHeader>

                        <AlertDialogFooter>
                          <AlertDialogCancel>Չեղարկել</AlertDialogCancel>
                          <AlertDialogAction onClick={() => onDelete(item.id)}>
                            Շարունակել
                          </AlertDialogAction>
                        </AlertDialogFooter>
                      </AlertDialogContent>
                    </AlertDialog>
                  </TableCell>
                </TableRow>
              );
            })}
          </TableBody>
        </Table>
      </div>
    </div>
  );
}
