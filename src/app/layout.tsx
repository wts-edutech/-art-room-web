import type { Metadata, Viewport } from "next";
import { Prompt, Kanit } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import SessionProvider from "@/components/providers/SessionProvider";
import LiveClock from "@/components/ui/LiveClock";
import FloatingSocialSidebar from "@/components/ui/FloatingSocialSidebar";
import VisitorTracker from "@/components/VisitorTracker";
import BottomNavbar from "@/components/layout/BottomNavbar";

const prompt = Prompt({
  variable: "--font-prompt",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

const kanit = Kanit({
  variable: "--font-kanit",
  subsets: ["thai", "latin"],
  weight: ["400", "500", "600", "700"],
  display: "swap",
});

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

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
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Itim&family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&family=Mali:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden has-bottom-nav">
        <SessionProvider>
          <VisitorTracker />
          <LiveClock />
          {children}
          <CookieConsent />
          <FloatingSocialSidebar />
          <BottomNavbar />
        </SessionProvider>
      </body>
    </html>
  );
}
