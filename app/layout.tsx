import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"),
  title: { default: "Wabi — AI WhatsApp Assistant for Small Business", template: "%s · Wabi" },
  description: "Wabi answers your customers on WhatsApp 24/7 — FAQs, lead capture, booking questions. Simple setup, works in English & Urdu. Free plan included.",
  keywords: ["whatsapp ai", "whatsapp assistant", "business whatsapp", "ai chatbot pakistan", "lead capture", "small business"],
  openGraph: { title: "Wabi — AI WhatsApp Assistant for Small Business", description: "Never miss another customer. Wabi answers WhatsApp messages 24/7.", type: "website", locale: "en_US" },
  twitter: { card: "summary_large_image", title: "Wabi — AI WhatsApp Assistant for Small Business", description: "Never miss another customer. Wabi answers WhatsApp messages 24/7." },
  icons: { icon: [{ url: "/icon.svg", type: "image/svg+xml" }] },
  robots: { index: true, follow: true },
};

export const viewport: Viewport = { themeColor: "#0f172a", width: "device-width", initialScale: 1 };

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="font-sans antialiased text-slate-800 bg-white">{children}</body>
    </html>
  );
}