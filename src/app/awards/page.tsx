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
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-[#FDF9F1]">
        
        {/* Page Title */}
        <div className="text-center pt-10 pb-4">
          <div className="inline-flex items-center justify-center w-14 h-14 bg-red-100 rounded-full mb-4">
            <Medal className="w-7 h-7 text-red-600" />
          </div>
          <h1 className="text-3xl sm:text-4xl font-black text-gray-900 font-heading">รางวัลที่ได้รับ</h1>
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

            <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
              
              {/* Stats Boxes */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 max-w-3xl mx-auto">
                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">ผลรางวัลทั้งหมด</p>
                    <p className="text-3xl font-black text-gray-900">{awardsList.length} <span className="text-sm font-normal text-gray-500">รายการ</span></p>
                  </div>
                  <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                </div>

                <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-gray-500 mb-1">นักเรียนที่ได้รับรางวัล</p>
                    <p className="text-3xl font-black text-gray-900">
                      {uniqueStudentsCount} <span className="text-sm font-normal text-gray-500">คน</span>
                    </p>
                  </div>
                  <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                    <GraduationCap className="w-5 h-5" />
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
