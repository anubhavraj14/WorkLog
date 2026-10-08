import React, { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/lib/store";
import { Shell } from "@/components/shell";
import { ThemeProvider } from "next-themes";
import { DialogProvider } from "@/components/dialog-provider";

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "WorkLog — Personal Work Dashboard",
  description: "Your personal professional work diary and proof-of-work system.",
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" suppressHydrationWarning className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="min-h-full">
        <ThemeProvider attribute="class" defaultTheme="light" enableSystem>
          <StoreProvider>
            <DialogProvider>
              <Suspense fallback={<div className="flex min-h-screen items-center justify-center text-sm text-zinc-500">Loading…</div>}>
                <Shell>{children}</Shell>
              </Suspense>
            </DialogProvider>
          </StoreProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
