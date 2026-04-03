"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { LoaderIcon } from "lucide-react";

export default function LogoutPage() {
    const router = useRouter();

    useEffect(() => {
        fetch("/api/logout", { method: "POST" }).finally(() => {
            router.push("/login");
        });
    }, [router]);

    return (
        <div className='bg-muted/30 flex h-screen items-center justify-center'>
            <LoaderIcon className='animate-spin' />
        </div>
    );
}
