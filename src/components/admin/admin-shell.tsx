"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import React from "react";

export function AdminShell({ children }: { children: React.ReactNode }) {
    const pathname = usePathname();
    const router = useRouter();

    const navItems = [
        { href: "/admin", label: "Ցուցանիշ" },
        { href: "#", label: "Տեղեկատվական կենտրոն" },
        { href: "#", label: "Հետադարձ կապ" },
        { href: "/attributes/list", label: "Տվյալներ" },
        { href: "/attributes/manage-data", label: "Տվյալների ներմուծում" },
    ];

    function handleLogout() {
        router.push("/logout");
    }

    return (
        <div className='flex min-h-screen bg-[#f9fafb]'>
            <aside className='w-60 border-r border-[#e6e7eb] bg-white px-4 pt-5'>
                <div className='mb-6'>
                    <Link href='/' className='flex items-center gap-[5px]'>
                        <Image width={47} height={34} src='/logo.png' alt={"Logo"} />
                        <div className={"flex flex-col"}>
                            <h2 className='text-[12px] leading-[14px] font-bold tracking-[-0.12px] text-[#2c2c2c]'>
                                ՀՀ Վիճակագրական
                                <br />
                                Կոմիտե ԱՐՄՍՏԱՏ
                            </h2>
                            <p className='mt-1 text-[11px] leading-[14px] font-medium text-[#8099b8]'>
                                Admin Portal
                            </p>
                        </div>
                    </Link>
                </div>
                <Separator className='mb-4 bg-[#e6e7eb]' />
                <nav className='space-y-1 pb-5'>
                    {navItems.map((item, index) => (
                        <Link
                            key={index}
                            href={item.href}
                            className={`block h-10 rounded-[4px] px-4 py-[13px] text-[12px] leading-[14px] transition ${
                                pathname === item.href
                                    ? "bg-[#f3f4f6] font-medium text-[#324950]"
                                    : "text-[#324950] hover:bg-[#f8f9fa]"
                            }`}
                        >
                            {item.label}
                        </Link>
                    ))}
                </nav>
                <Separator className='mb-4 bg-[#e6e7eb]' />
                <Button variant='outline' className='h-9 rounded-[9px]' onClick={handleLogout}>
                    Logout
                </Button>
            </aside>

            <div className='flex flex-1 flex-col'>
                {/*<header className="flex h-[84px] items-center justify-between bg-[#f9fafb] px-[44px]">*/}
                {/*  <div>*/}
                {/*    <p className="text-[20px] font-medium leading-[24px] text-[#2c2c2c]">Ցուցանիշ</p>*/}
                {/*  </div>*/}
                {/*</header>*/}
                <main className='px-[44px] pt-10 pb-10'>{children}</main>
            </div>
        </div>
    );
}
