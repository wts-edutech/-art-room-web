import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsPageClient from "@/components/news/NewsPageClient";
import { getDb } from '@/db';
import { news } from '@/db/schema';
import { desc } from 'drizzle-orm';
import type { Metadata } from 'next';

export const runtime = 'edge';

export const metadata: Metadata = {
  title: "ข่าวสารและประชาสัมพันธ์ | ART ROOM - โรงเรียนวชิรธรรมสาธิต",
  description: "ติดตามข่าวสารนิทรรศการผลงาน กิจกรรมสร้างสรรค์ และเรื่องราวน่าภาคภูมิใจของนักเรียนกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
  openGraph: {
    title: "ข่าวสารและประชาสัมพันธ์ | ART ROOM",
    description: "ติดตามข่าวสารนิทรรศการผลงาน และกิจกรรมสร้างสรรค์",
    images: [{ url: "/images/news/hero-exhibition.jpg", width: 1200, height: 630 }],
  }
};

// Helper to get news on server side
async function getNews() {
  try {
    const db = getDb();
    return await db.select().from(news).orderBy(desc(news.date));
  } catch (error) {
    console.error("Failed to load news:", error);
    return [];
  }
}

export default async function NewsPage() {
  const newsList = await getNews();

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-[#FDF9F1]">
        <NewsPageClient initialNews={newsList} />
      </main>
      <Footer />
    </>
  );
}
