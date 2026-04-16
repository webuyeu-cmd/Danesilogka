import type { Metadata } from "next";
import "./globals.css";
import { Sidebar } from "@/components/sidebar";
import { CommandPalette } from "@/components/command-palette";

export const metadata: Metadata = {
  title: "Danesilogika — Panel Zarządzania",
  description: "System zarządzania projektami AI i klientami",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="pl" className="h-full antialiased">
      <body className="min-h-full flex bg-gray-50 font-sans">
        <Sidebar />
        <CommandPalette />
        <main className="flex-1 ml-64 p-8">{children}</main>
      </body>
    </html>
  );
}
