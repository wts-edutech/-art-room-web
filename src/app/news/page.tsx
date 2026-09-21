"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import NewsPageClient from "@/components/news/NewsPageClient";
import { Loader2 } from "lucide-react";

export default function NewsPage() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [activitiesList, setActivitiesList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.all([
      fetch("/api/news").then((r) => r.json()).catch(() => []),
      fetch("/api/activities").then((r) => r.json()).catch(() => [])
    ]).then(([newsData, activitiesData]) => {
      setNewsList(Array.isArray(newsData) ? newsData : []);
      setActivitiesList(Array.isArray(activitiesData) ? activitiesData : []);
    }).finally(() => {
      setLoading(false);
    });
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-[#FDF9F1]">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">กำลังโหลดข่าวสารและกิจกรรม...</p>
          </div>
        ) : (
          <NewsPageClient initialNews={newsList} initialActivities={activitiesList} />
        )}
      </main>
      <Footer />
    </>
  );
}
