"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialsList from "@/components/sections/MaterialsList";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import { EyeOff, ShieldAlert, ArrowLeft, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export default function M4MaterialsPage() {
  const [lessons, setLessons] = useState<any[]>([]);
  const [isM4Enabled, setIsM4Enabled] = useState<boolean | null>(null);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const role = localStorage.getItem("artroom_role");
    if (role === "admin" || role === "teacher") {
      setIsAdmin(true);
    }

    // Check visibility status
    fetch("/api/m4-lessons/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setIsM4Enabled(data.enabled);
        } else {
          setIsM4Enabled(true);
        }
      })
      .catch(() => setIsM4Enabled(true));

    // Fetch M4 lessons
    fetch("/api/m4-lessons")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setLessons(data);
        }
      })
      .catch((err) => console.error("Failed to load m4 lessons:", err))
      .finally(() => setIsLoading(false));
  }, []);

  // While checking status
  if (isM4Enabled === null || isLoading) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex items-center justify-center min-h-screen bg-[#FDF9F1] pt-24">
          <div className="w-8 h-8 border-2 border-red-600 border-t-transparent rounded-full animate-spin"></div>
        </main>
        <Footer />
      </>
    );
  }

  // If disabled and NOT admin -> Show maintenance/hidden notice
  if (!isM4Enabled && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-[#FDF9F1] pt-28 pb-16 px-4 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 sm:p-10 border border-gray-100 shadow-xl shadow-gray-200/50">
            <div className="w-16 h-16 rounded-full bg-amber-100 text-amber-600 flex items-center justify-center mx-auto mb-5 shadow-inner">
              <EyeOff className="w-8 h-8" />
            </div>
            
            <h1 className="text-xl sm:text-2xl font-bold text-gray-900 mb-2">
              สื่อการสอน ม.4 อยู่ระหว่างปรับปรุง
            </h1>
            
            <p className="text-xs sm:text-sm text-gray-500 leading-relaxed mb-6">
              คุณครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ กำลังจัดเตรียมบทเรียน สื่อวิดีทัศน์ และใบงานสำหรับระดับชั้น ม.4 เพิ่มเติม กรุณากลับมาติดตามใหม่อีกครั้ง หรือศึกษาในคลังสื่อการสอนทั่วไป
            </p>

            <div className="flex flex-col gap-2.5">
              <Link href="/materials">
                <Button className="w-full h-11 rounded-xl bg-red-600 hover:bg-red-700 text-white font-bold text-xs sm:text-sm flex items-center justify-center gap-2 shadow-md">
                  <BookOpen className="w-4 h-4" />
                  <span>ดูคลังสื่อการสอนทั่วไป</span>
                </Button>
              </Link>
              <Link href="/">
                <Button variant="outline" className="w-full h-11 rounded-xl border-gray-200 text-gray-700 font-bold text-xs sm:text-sm flex items-center justify-center gap-2">
                  <ArrowLeft className="w-4 h-4" />
                  <span>กลับสู่หน้าแรก</span>
                </Button>
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      {/* Admin Preview Notice */}
      {!isM4Enabled && isAdmin && (
        <div className="bg-amber-500 text-white px-4 py-2.5 text-xs sm:text-sm font-bold flex items-center justify-center gap-2 shadow-md sticky top-16 z-30">
          <ShieldAlert className="w-4 h-4 flex-shrink-0" />
          <span>โหมดดูตัวอย่าง (Admin Preview): สื่อการสอน ม.4 ยังปิดการแสดงผลหน้าบ้านอยู่ เฉพาะผู้ดูแลระบบเท่านั้นที่มองเห็นหน้านี้ได้</span>
        </div>
      )}

      <ProtectedRoute studentOnly={true}>
        <main className="flex-1 flex flex-col pt-32 pb-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
                สื่อการสอน (ระดับชั้น ม.4)
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                รวบรวมสื่อการเรียนรู้ เทคนิค และแหล่งค้นคว้าเพิ่มเติมสำหรับนักเรียนระดับชั้น ม.4
              </p>
            </div>
            
            <MaterialsList initialLessons={lessons} basePath="/materials/m4" />
          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
