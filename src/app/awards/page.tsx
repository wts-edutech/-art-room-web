import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AwardsTable from "@/components/sections/AwardsTable";
import AwardsBanner from "@/components/sections/AwardsBanner";
import { getDb } from "@/db";
import { awards } from "@/db/schema";
import { desc } from "drizzle-orm";
import { Sparkles, GraduationCap } from "lucide-react";

export const runtime = 'edge';

export default async function AwardsPage() {
  const db = getDb();
  const allAwards = await db.select().from(awards).orderBy(desc(awards.createdAt));

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20 min-h-screen bg-[#FDF9F1]">
        
        {/* Banner Section */}
        <AwardsBanner awards={allAwards} />

        <div className="container mx-auto px-4 sm:px-6 py-12 max-w-7xl">
          
          {/* Stats Boxes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-12 max-w-3xl mx-auto md:mx-0">
            <div className="bg-white rounded-3xl p-6 shadow-sm border border-teal-500/20 flex items-center justify-between border-l-4 border-l-teal-500 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-teal-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 mb-1">ผลการค้นหา (รายการ)</p>
                <p className="text-4xl font-black text-gray-900">{allAwards.length}</p>
              </div>
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm">
                <Sparkles className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-6 shadow-sm border border-blue-500/20 flex items-center justify-between border-l-4 border-l-blue-500 relative overflow-hidden group">
              <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-blue-50 rounded-full group-hover:scale-150 transition-transform duration-500"></div>
              <div className="relative z-10">
                <p className="text-sm font-medium text-gray-500 mb-1">นักเรียนที่ได้รับรางวัล</p>
                <p className="text-4xl font-black text-gray-900">
                  {new Set(allAwards.map(a => a.student)).size}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm">
                <GraduationCap className="w-6 h-6" />
              </div>
            </div>
          </div>

          {/* Table Section */}
          <AwardsTable awards={allAwards} />
        </div>
      </main>
      <Footer />
    </>
  );
}
