"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";
import { ShellLink } from "@/components/ui/ShellLink";
import { SwrProvider } from "@/lib/swr/swr-provider";
import { useUser } from "@/hooks/useUser";
import { siteSections } from "@/constants/sections";

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  const user = useUser();

  const userPermissionKeys = user.permissions.map((p) => p.key);
  console.log(userPermissionKeys);
  const hasPermission = (perm: string) =>
    userPermissionKeys.includes("*") ||
    userPermissionKeys.includes(perm) ||
    userPermissionKeys.includes(perm.split(".")[0] + ".*");

  function handleLogout() {
    router.push("/admin/logout");
  }

  return (
    <SwrProvider>
      <div className="flex min-h-screen bg-[#f9fafb]">
        <aside className="w-70 shrink-0 border-r border-[#e6e7eb] bg-white px-4 pt-5">
          <div className="mb-6">
            <Link href="/admin" className="flex items-center gap-[5px]">
              <Image width={47} height={34} src="/logo.png" alt={"Logo"} />
              <div className={"flex flex-col"}>
                <h2 className="text-[12px] leading-[14px] font-bold tracking-[-0.12px] text-[#2c2c2c]">
                  ՀՀ Վիճակագրական
                  <br />
                  Կոմիտե ԱՐՄՍՏԱՏ
                </h2>
                <p className="mt-1 text-[11px] leading-[14px] font-medium text-[#8099b8]">
                  Admin Portal
                </p>
              </div>
            </Link>
          </div>
          <Separator className="mb-4 bg-[#e6e7eb]" />
          <nav className="space-y-1 pb-5">
            {siteSections
              .filter((item) => {
                if (!item.permissionKey || userPermissionKeys.includes("*")) return true;

                return hasPermission(item.permissionKey);
              })

              .map((item) => (
                <ShellLink href={item.href} label={item.label} key={item.href} />
              ))}
          </nav>
          <Separator className="mb-4 bg-[#e6e7eb]" />
          <Button variant="outline" className="h-9 rounded-[9px]" onClick={handleLogout}>
            Logout
          </Button>
        </aside>

        <div className="flex min-w-0 flex-1 flex-col">
          <main className="flex-1 px-11 pb-7">{children}</main>
        </div>
      </div>
    </SwrProvider>
  );
}
