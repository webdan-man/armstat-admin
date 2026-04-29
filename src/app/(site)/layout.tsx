import React from "react";
import Header from "@/components/site/Header";
import { SWRProvider } from "@/providers/SWRProvider";

export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return (
    <SWRProvider>
      <div className="flex min-h-screen items-center justify-center bg-lightTone1 text-textBlack100 text-fontSizeM font-normal tracking-[-0.03em] leading-[1.5] dark:bg-black">
        <main className="flex min-h-screen w-full flex-col">
          <Header />
          {children}
        </main>
      </div>
    </SWRProvider>
  );
}
