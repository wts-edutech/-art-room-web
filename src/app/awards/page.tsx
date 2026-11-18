"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import AwardsTable from "@/components/sections/AwardsTable";
import AwardsBanner from "@/components/sections/AwardsBanner";
import { Sparkles, GraduationCap, Medal, Loader2, EyeOff, ShieldAlert, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AwardsPage() {
  const [awardsList, setAwardsList] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [isAwardsEnabled, setIsAwardsEnabled] = useState(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const role = typeof window !== "undefined" ? localStorage.getItem("artroom_role") : null;
    if (role === "admin" || role === "teacher") {
      setIsAdmin(true);
    }

    // Check visibility status
    fetch("/api/awards/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setIsAwardsEnabled(data.enabled);
        }
      })
      .catch(() => {})
      .finally(() => setCheckingStatus(false));

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

  // If disabled and NOT admin -> Show polite maintenance view
  if (!checkingStatus && !isAwardsEnabled && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white pt-32 pb-16 px-4 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-red-950/5">
            <div className="w-16 h-16 bg-amber-50 text-amber-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-amber-100 shadow-sm">
              <EyeOff className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gray-900 mb-2">
              ส่วนนี้ยังไม่เปิดให้บริการ
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-light">
              หน้ารางวัลที่ได้รับ (Awards) อยู่ระหว่างการปรับปรุงข้อมูลโดยผู้ดูแลระบบ
            </p>
            <Link href="/" className="inline-block w-full">
              <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl py-3 font-medium transition-all shadow-md shadow-red-500/20 border-0 cursor-pointer">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>กลับสู่หน้าแรก</span>
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const uniqueStudentsCount = new Set(awardsList.map((a: any) => a.student)).size;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 min-h-screen bg-white">
        
        {/* Admin Preview Notice Bar when hidden */}
        {!isAwardsEnabled && isAdmin && (
          <div className="bg-amber-500/15 backdrop-blur-md border-b border-amber-300 py-2.5 px-4 text-amber-950 sticky top-16 sm:top-20 z-30 shadow-xs">
            <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>โหมดพรีวิวสำหรับผู้ดูแลระบบ:</strong> หน้านี้กำลังถูกซ่อนอยู่สำหรับบุคคลทั่วไป สามารถเปิดแสดงผลได้ที่{" "}
                  <Link href="/admin" className="underline font-bold hover:text-amber-900">
                    ระบบหลังบ้าน (Admin)
                  </Link>
                </span>
              </div>
              <Link 
                href="/admin" 
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs whitespace-nowrap"
              >
                ไปที่หน้าหลังบ้าน (Admin)
              </Link>
            </div>
          </div>
        )}

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
