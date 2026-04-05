import type { Metadata } from "next";
import { Noto_Sans_Armenian } from "next/font/google";
import { Toaster } from "sonner";
import "./globals.css";
import React from "react";

const notoSansArmenian = Noto_Sans_Armenian({
  variable: "--font-noto-sans-armenian",
  subsets: ["armenian"],
});

export const metadata: Metadata = {
  title: "Armstat Admin",
  description: "Admin panel frontend with mock authentication",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${notoSansArmenian.className} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {children}
        <Toaster richColors position="top-right" />
      </body>
    </html>
  );
}
