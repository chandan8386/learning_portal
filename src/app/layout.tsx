import type { Metadata, Viewport } from "next";
import { Header } from "@/components/Header";
import { getLocale } from "@/lib/i18n";
import "./globals.css";

export const metadata: Metadata = {
  title: { default: "VidyaPath – Nursery to Class 10", template: "%s · VidyaPath" },
  description: "Complete syllabus, e-books and audio lessons for Nursery to Class 10 (CBSE/NCERT), in English and Hindi.",
  manifest: "/manifest.webmanifest",
};

export const viewport: Viewport = {
  themeColor: "#f97316",
  width: "device-width",
  initialScale: 1,
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  return (
    <html lang={locale}>
      <body className="min-h-screen">
        <Header />
        <main className="mx-auto max-w-5xl px-4 py-6">{children}</main>
      </body>
    </html>
  );
}
