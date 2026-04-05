"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

import React from "react";

export function ShellLink({ href, label }: { href: string; label: string}) {
    const pathname = usePathname();


    return (
        <Link
            href={href}
            className={`block h-10 rounded-lg px-4 py-3.25 text-[12px] leading-3.5 transition ${
                pathname === href
                    ? "bg-[rgba(243,244,246,1)] text-[rgba(50,73,80,1)] font-semibold"
                    : "hover:bg-[rgba(243,244,246,1)]"
            }`}
        >
            {label}
        </Link>
    );
}
