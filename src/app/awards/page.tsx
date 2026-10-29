"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AwardsTable from "@/components/sections/AwardsTable";
import AwardsBanner from "@/components/sections/AwardsBanner";
import { Sparkles, GraduationCap, Medal, Loader2 } from "lucide-react";

export default function AwardsPage() {
  const [awardsList, setAwardsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetch("/api/awards")
      .then((res) => res.json())
      .then((data) => {
        const list = Array.isArray(data) ? data : [];
        const validAwards = list.filter((a: any) => a.title && a.title !== "Untitled" && a.student !== "Unknown");
        setAwardsList(validAwards);
      })
      .catch((err) => console.error("Failed to load awards:", err))
      .finally(() => setLoading(false));
  }, []);

  const uniqueStudentsCount = new Set(awardsList.map((a: any) => a.student)).size;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 min-h-screen bg-white">
        
        {/* Page Title */}
        <div className="text-center pt-6 sm:pt-10 pb-3 sm:pb-4 px-4">
          <div className="inline-flex items-center justify-center w-12 h-12 sm:w-14 sm:h-14 bg-red-100 rounded-full mb-3 sm:mb-4 shadow-2xs">
            <Medal className="w-6 h-6 sm:w-7 sm:h-7 text-red-600" />
          </div>
          <h1 className="text-2xl sm:text-4xl font-black text-gray-900 font-heading">รางวัลที่ได้รับ</h1>
        </div>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-20 gap-3">
            <Loader2 className="w-8 h-8 text-red-500 animate-spin" />
            <p className="text-sm text-gray-500 font-medium">กำลังโหลดข้อมูลรางวัล...</p>
          </div>
        ) : (
          <>
            {/* Banner Section */}
            <AwardsBanner awards={awardsList} />

            <div className="w-full max-w-[1650px] mx-auto px-3.5 sm:px-6 lg:px-8 py-6 sm:py-12">
              
              {/* Stats Boxes (2-col grid on mobile for compactness) */}
              <div className="grid grid-cols-2 gap-3 sm:gap-6 mb-6 sm:mb-10 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mb-0.5 sm:mb-1">ผลรางวัลทั้งหมด</p>
                    <p className="text-xl sm:text-3xl font-black text-gray-900">{awardsList.length} <span className="text-[11px] sm:text-sm font-normal text-gray-500">รายการ</span></p>
                  </div>
                  <div className="w-8 h-8 sm:w-11 sm:h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <Sparkles className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-3.5 sm:p-6 shadow-2xs border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-[11px] sm:text-xs font-semibold text-gray-500 mb-0.5 sm:mb-1">นักเรียนที่ได้รางวัล</p>
                    <p className="text-xl sm:text-3xl font-black text-gray-900">
                      {uniqueStudentsCount} <span className="text-[11px] sm:text-sm font-normal text-gray-500">คน</span>
                    </p>
                  </div>
                  <div className="w-8 h-8 sm:w-11 sm:h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center shrink-0">
                    <GraduationCap className="w-4 h-4 sm:w-5 sm:h-5" />
                  </div>
                </div>
              </div>

              {/* Table Section */}
              <AwardsTable awards={awardsList} />
            </div>
          </>
        )}
      </main>
      <Footer />
    </>
  );
}
