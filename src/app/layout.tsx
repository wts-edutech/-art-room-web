import type { Metadata } from "next";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import SessionProvider from "@/components/providers/SessionProvider";
import LiveClock from "@/components/ui/LiveClock";
import FloatingSocialSidebar from "@/components/ui/FloatingSocialSidebar";
import VisitorTracker from "@/components/VisitorTracker";
const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600"],
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Art Room - โรงเรียนวชิรธรรมสาธิต",
  description: "เว็ปไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ ที่สามรถเรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะได้หลายประเภท",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${prompt.variable} ${kanit.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col overflow-x-hidden">
        <SessionProvider>
          <VisitorTracker />
          <LiveClock />
          {children}
          <CookieConsent />
          <FloatingSocialSidebar />
        </SessionProvider>
      </body>
    </html>
  );
}
