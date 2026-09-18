import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AwardsTable from "@/components/sections/AwardsTable";
import AwardsBanner from "@/components/sections/AwardsBanner";
import { getDb } from "@/db";
import { awards } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Sparkles, GraduationCap, Medal } from "lucide-react";

export const runtime = 'edge';

export default async function AwardsPage() {
  const db = getDb();
  const allAwards = await db.select().from(awards).orderBy(desc(awards.createdAt));
  const validAwards = allAwards.filter(a => a.title && a.title !== "Untitled" && a.student !== "Unknown");

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

        {/* Banner Section */}
        <AwardsBanner awards={validAwards} />

        <div className="w-full max-w-[1650px] mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-12">
          
          {/* Stats Boxes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 mb-10 max-w-3xl mx-auto">
            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">ผลรางวัลทั้งหมด</p>
                <p className="text-3xl font-black text-gray-900">{validAwards.length} <span className="text-sm font-normal text-gray-500">รายการ</span></p>
              </div>
              <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <Sparkles className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-200 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-gray-500 mb-1">นักเรียนที่ได้รับรางวัล</p>
                <p className="text-3xl font-black text-gray-900">
                  {new Set(validAwards.map(a => a.student)).size} <span className="text-sm font-normal text-gray-500">คน</span>
                </p>
              </div>
              <div className="w-11 h-11 bg-red-50 text-red-600 rounded-xl flex items-center justify-center">
                <GraduationCap className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <AwardsTable awards={validAwards} />
        </div>
      </main>
      <Footer />
    </>
  );
}
