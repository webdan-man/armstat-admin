import React from "react";
import Sidebar from "@/components/site/stat/Sidebar";

export default function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex w-full flex-col items-center">
      <div className="grid w-full max-w-400 grid-cols-[303px_auto] px-5">
        <Sidebar />
        <div className="w-full border-l border-l-[rgba(217,217,217,1)]">{children}</div>
      </div>
    </div>
  );
}
