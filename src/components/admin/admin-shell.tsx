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
    router.push("/logout");
  }

  return (
    <SwrProvider>
      <div className="flex min-h-screen items-start bg-[#f9fafb]">
        <aside className="sticky top-0 flex h-screen max-h-screen w-70 shrink-0 flex-col self-start border-r border-[#e6e7eb] bg-white px-4 py-5">
          <div className="mb-6 shrink-0">
            <Link href="/" className="flex items-center gap-[5px]">
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
          <Separator className="mb-4 shrink-0 bg-[#e6e7eb]" />
          <nav className="min-h-0 flex-1 space-y-1 overflow-y-auto pb-5">
            {siteSections
              .filter((item) => {
                if (!item.permissionKey || userPermissionKeys.includes("*")) return true;

                return hasPermission(item.permissionKey);
              })

              .map((item) => (
                <ShellLink href={item.href} label={item.label} key={item.href} />
              ))}
          </nav>
          <Separator className="mb-4 shrink-0 bg-[#e6e7eb]" />
          <Button
            variant="outline"
            className="h-9 shrink-0 rounded-[9px]"
            onClick={handleLogout}
          >
            Logout
          </Button>
        </aside>

        <main className="min-w-0 flex-1 px-11 pb-7">{children}</main>
      </div>
    </SwrProvider>
  );
}
