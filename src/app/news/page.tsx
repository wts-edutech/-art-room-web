import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsSection from "@/components/sections/NewsSection";
import { ExternalLink } from "lucide-react";
import { getDb } from '@/db';
import { news } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';

// Helper to get news on server side
async function getNews() {
  try {
    const db = getDb();
    return await db.select().from(news).orderBy(desc(news.date));
  } catch (error) {
    return [];
  }
}

export default async function NewsPage() {
  const newsList = getNews();
  const featuredNews = newsList.length > 0 ? newsList[0] : null;
  const otherNews = newsList.length > 1 ? newsList.slice(1) : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-gray-50/30">
        <NewsSection featuredNews={featuredNews} />
        
        {otherNews.length > 0 && (
          <div className="container mx-auto px-4 sm:px-6 pb-24 max-w-6xl mt-12">
            <h3 className="text-2xl font-bold font-heading text-gray-900 mb-8 tracking-tight border-b pb-4">
              ข่าวสารอื่นๆ
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {otherNews.map((news: any) => (
                <div key={news.id} className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm group hover:shadow-md transition-all flex flex-col h-full">
                  <div className="w-full h-48 bg-gray-200 relative overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                    />
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <span className="text-xs font-medium text-(--color-primary-500) mb-2 block">{news.date} • {news.source}</span>
                    <h4 className="font-bold font-heading text-lg mb-2 group-hover:text-(--color-primary-500) transition-colors">{news.title}</h4>
                    <p className="text-gray-500 text-sm mb-4 line-clamp-3">{news.excerpt}</p>
                    
                    {news.url && (
                      <div className="mt-auto pt-4 border-t border-gray-50">
                        <a href={news.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
                          อ่านต่อ <ExternalLink className="w-3 h-3 ml-1" />
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
        {newsList.length === 0 && (
          <div className="container mx-auto px-4 sm:px-6 pb-24 max-w-6xl mt-12 text-center text-gray-500">
            ยังไม่มีข่าวสารในขณะนี้ กรุณาเพิ่มข้อมูลผ่านระบบแอดมิน
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
