import type { Metadata } from "next";
import "./globals.css";
import MainLayout from "@/components/index";
import { Suspense } from "react";

export const metadata: Metadata = {
  title: "MtUi Tools",
  description: "Tools for MtUi",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>
        <Suspense fallback={<div>Loading...</div>}>
          <MainLayout>{children}</MainLayout>
        </Suspense>
      </body>
    </html>
  );
}
