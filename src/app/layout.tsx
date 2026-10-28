import type { Metadata, Viewport } from "next";
import { Sarabun, Prompt, Kanit } from "next/font/google";
import "./globals.css";
import CookieConsent from "@/components/ui/CookieConsent";
import SessionProvider from "@/components/providers/SessionProvider";
import SecuritySessionWatcher from "@/components/providers/SecuritySessionWatcher";
import LiveClock from "@/components/ui/LiveClock";
import FloatingSocialSidebar from "@/components/ui/FloatingSocialSidebar";
import VisitorTracker from "@/components/VisitorTracker";
import BottomNavbar from "@/components/layout/BottomNavbar";
import BackToTop from "@/components/ui/BackToTop";
import { LogoProvider } from "@/context/LogoContext";

const sarabun = Sarabun({
  variable: "--font-sarabun",
  subsets: ["thai", "latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  display: "swap",
});

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
  maximumScale: 5,
  userScalable: true,
  viewportFit: "cover",
  themeColor: "#ffffff",
};

const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://artroom-wts.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: "Art Room - โรงเรียนวชิรธรรมสาธิต",
    template: "%s | Art Room วชิรธรรมสาธิต",
  },
  description:
    "เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ โรงเรียนวชิรธรรมสาธิต รวมสื่อการสอนสีน้ำ สีไม้ สีโปสเตอร์ วาดเส้น EE ไอเดีย และนิทรรศการผลงานนักเรียน",
  keywords: [
    "Art Room",
    "วชิรธรรมสาธิต",
    "ศิลปะ",
    "สื่อการสอนศิลปะ",
    "เรียนศิลปะออนไลน์",
    "สีน้ำ",
    "สีไม้",
    "สีโปสเตอร์",
    "วาดเส้น EE",
    "ผลงานศิลปะนักเรียน",
  ],
  authors: [{ name: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต" }],
  creator: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
  publisher: "โรงเรียนวชิรธรรมสาธิต",
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Art Room - โรงเรียนวชิรธรรมสาธิต",
    description:
      "เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ โรงเรียนวชิรธรรมสาธิต รวบรวมเทคนิค สื่อการสอน และผลงานนักเรียน",
    url: SITE_URL,
    siteName: "Art Room วชิรธรรมสาธิต",
    locale: "th_TH",
    type: "website",
    images: [
      {
        url: "/artroom-logo.png",
        width: 800,
        height: 800,
        alt: "Art Room วชิรธรรมสาธิต",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "Art Room - โรงเรียนวชิรธรรมสาธิต",
    description:
      "เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ โรงเรียนวชิรธรรมสาธิต",
    images: ["/artroom-logo.png"],
  },
  icons: {
    icon: "/favicon.ico",
    apple: "/artroom-logo.png",
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@type": "EducationalOrganization",
  name: "Art Room - โรงเรียนวชิรธรรมสาธิต",
  alternateName: "Wachirathammasatit School Art Room",
  url: SITE_URL,
  logo: `${SITE_URL}/artroom-logo.png`,
  description:
    "เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ โรงเรียนวชิรธรรมสาธิต",
  address: {
    "@type": "PostalAddress",
    streetAddress: "1253 ถนนสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง",
    addressLocality: "กรุงเทพมหานคร",
    postalCode: "10260",
    addressCountry: "TH",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="th" className={`${sarabun.variable} ${prompt.variable} ${kanit.variable} h-full antialiased`}>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link
          href="https://fonts.googleapis.com/css2?family=Itim&family=Kanit:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&family=Mali:ital,wght@0,300;0,400;0,500;0,600;0,700;1,300;1,400&family=Prompt:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,500;1,600;1,700;1,800&family=Sarabun:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;1,300;1,400;1,600;1,700&display=swap"
          rel="stylesheet"
        />
        <script
          dangerouslySetInnerHTML={{
            __html: `
              (function() {
                try {
                  var saved = localStorage.getItem('artroom_selected_font');
                  var cookieMatch = document.cookie.match(/(?:^|;\\s*)artroom_selected_font=([^;]*)/);
                  var fontId = saved || (cookieMatch ? decodeURIComponent(cookieMatch[1]) : 'sarabun');
                  if (!fontId || fontId === 'prompt') {
                    fontId = 'sarabun';
                  }
                  var fontMap = {
                    sarabun: "'Sarabun', sans-serif",
                    prompt: "'Prompt', sans-serif",
                    kanit: "'Kanit', sans-serif",
                    matchanamphung: "'Matchanamphung', 'Sarabun', sans-serif",
                    hamsters: "'FH Hamsters', 'Sarabun', sans-serif",
                    "kancha-easy": "'KanchaEasy', 'Sarabun', sans-serif",
                    ebwriter: "'EBWriter', 'Sarabun', sans-serif",
                    mali: "'Mali', cursive, sans-serif",
                    itim: "'Itim', cursive, sans-serif"
                  };
                  var family = fontMap[fontId] || "'Sarabun', sans-serif";
                  document.documentElement.style.setProperty('--user-font', family);
                  document.documentElement.style.fontFamily = family;
                } catch(e) {}
              })();
            `,
          }}
        />
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }}
        />
      </head>
      <body className="min-h-full flex flex-col overflow-x-hidden has-bottom-nav">
        <SessionProvider>
          <LogoProvider>
            <SecuritySessionWatcher />
            <VisitorTracker />
            <LiveClock />
            {children}
            <CookieConsent />
            <FloatingSocialSidebar />
            <BackToTop />
            <BottomNavbar />
          </LogoProvider>
        </SessionProvider>
      </body>
    </html>
  );
}
