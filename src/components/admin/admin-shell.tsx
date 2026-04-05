"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";
import { ShellLink } from "@/components/ui/ShellLink";

const navItems = [
  { href: "/main", label: "Գլխավոր էջ" },
  { href: "/groups", label: "Բաժիններ" },
  { href: "/indicators", label: "Ցուցաւնիշ" },
  { href: "/information-centre", label: "Տեղեկատվական կենտրոն" },
  { href: "/contact-us", label: "Հետադարձ կապ" },
  { href: "/news", label: "Նորություններ" },
  { href: "/attributes/list", label: "Հատկանիշներ" },
  { href: "/attributes/manage-data", label: "Հատկանիշներ ներմուծում" },
];

export function AdminShell({ children }: { children: React.ReactNode }) {
  const router = useRouter();

  function handleLogout() {
    router.push("/logout");
  }

  return (
    <div className="flex min-h-screen bg-[#f9fafb]">
      <aside className="w-60 border-r border-[#e6e7eb] bg-white px-4 pt-5">
        <div className="mb-6">
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
        <Separator className="mb-4 bg-[#e6e7eb]" />
        <nav className="space-y-1 pb-5">
          {navItems.map((item, index) => (
            <ShellLink href={item.href} label={item.label} key={item.href} />
          ))}
        </nav>
        <Separator className="mb-4 bg-[#e6e7eb]" />
        <Button variant="outline" className="h-9 rounded-[9px]" onClick={handleLogout}>
          Logout
        </Button>
      </aside>

      <div className="flex flex-1 flex-col">
        {/*<header className="flex h-[84px] items-center justify-between bg-[#f9fafb] px-[44px]">*/}
        {/*  <div>*/}
        {/*    <p className="text-[20px] font-medium leading-[24px] text-[#2c2c2c]">Ցուցանիշ</p>*/}
        {/*  </div>*/}
        {/*</header>*/}
        <main className="max-h-screen overflow-y-auto px-11 py-7">{children}</main>
      </div>
    </div>
  );
}
