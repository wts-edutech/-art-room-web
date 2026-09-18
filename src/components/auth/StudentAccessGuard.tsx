"use client";

import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import Link from "next/link";
import { 
  Lock, 
  LogIn, 
  ArrowLeft, 
  UserCheck, 
  ShieldAlert, 
  Building2, 
  KeyRound, 
  Info,
  ShieldCheck
} from "lucide-react";
import { syncAuthWithServer } from "@/lib/client-auth";

interface StudentAccessGuardProps {
  children: React.ReactNode;
  zoneTitle?: string;
  zoneDescription?: string;
}

export default function StudentAccessGuard({
  children,
  zoneTitle = "พื้นที่เฉพาะนักเรียนตามหลักสูตรการศึกษา",
  zoneDescription = "เอกสารประกอบการเรียน ใบงาน แบบทดสอบ และสื่อวิดีทัศน์เชิงลึกในหน้านี้ จัดทำขึ้นเพื่อการจัดการเรียนรู้ตามหลักสูตรของโรงเรียนวชิรธรรมสาธิต",
}: StudentAccessGuardProps) {
  const pathname = usePathname();
  const [querySuffix, setQuerySuffix] = useState("");
  const [authState, setAuthState] = useState<{
    isLoading: boolean;
    isStudent: boolean;
    isGuest: boolean;
    studentName?: string;
    guestName?: string;
  }>({
    isLoading: true,
    isStudent: false,
    isGuest: false,
  });

  useEffect(() => {
    let isMounted = true;

    const checkAccess = async () => {
      try {
        // 1. Sync with server session cookie
        const serverAuth = await syncAuthWithServer();

        if (!isMounted) return;

        if (serverAuth.authenticated && serverAuth.user?.role === "student") {
          setAuthState({
            isLoading: false,
            isStudent: true,
            isGuest: false,
            studentName: serverAuth.user.name,
          });
          return;
        }

        if (serverAuth.user?.role === "guest") {
          setAuthState({
            isLoading: false,
            isStudent: false,
            isGuest: true,
            guestName: serverAuth.user.name,
          });
          return;
        }

        // 2. Client localStorage fallback
        const localRole = localStorage.getItem("artroom_role");
        const studentId = localStorage.getItem("artroom_student_id");
        const authorName = localStorage.getItem("artroom_author_name");

        if (localRole === "student" && studentId) {
          setAuthState({
            isLoading: false,
            isStudent: true,
            isGuest: false,
            studentName: authorName || "นักเรียน",
          });
        } else if (localRole === "guest") {
          setAuthState({
            isLoading: false,
            isStudent: false,
            isGuest: true,
            guestName: authorName || "ผู้เยี่ยมชม",
          });
        } else {
          setAuthState({
            isLoading: false,
            isStudent: false,
            isGuest: false,
          });
        }
      } catch (err) {
        console.error("Access guard verification error:", err);
        setAuthState({
          isLoading: false,
          isStudent: false,
          isGuest: false,
        });
      }
    };

    checkAccess();

    if (typeof window !== "undefined" && window.location.search) {
      setQuerySuffix(window.location.search);
    }

    return () => {
      isMounted = false;
    };
  }, [pathname]);

  // Full current path with query parameters for redirect
  const fullPath = querySuffix ? `${pathname}${querySuffix}` : pathname;
  const loginUrl = `/login?redirect=${encodeURIComponent(fullPath)}`;

  // Loading state
  if (authState.isLoading) {
    return (
      <main className="flex-1 min-h-[calc(100vh-140px)] bg-gray-50/50 pt-28 sm:pt-32 pb-20 flex flex-col items-center justify-center p-8">
        <div className="w-10 h-10 border-3 border-red-700 border-t-transparent rounded-full animate-spin mb-3"></div>
        <p className="text-xs font-medium text-slate-500">กำลังตรวจสอบสิทธิ์การเข้าใช้งานระบบ...</p>
      </main>
    );
  }

  // Permitted: Student Access
  if (authState.isStudent) {
    return <>{children}</>;
  }

  // Denied: Formal & Institutional Access Card
  return (
    <main className="flex-1 min-h-[calc(100vh-140px)] bg-gray-50/50 pt-28 sm:pt-32 pb-20 px-4 sm:px-6 flex items-center justify-center relative">
      <div className="max-w-2xl w-full bg-white rounded-2xl border border-slate-200/90 shadow-xl shadow-slate-900/5 overflow-hidden text-left mx-auto">
        
        {/* Institutional Color Stripe */}
        <div className="h-1.5 w-full bg-gradient-to-r from-red-700 via-red-800 to-amber-700" />

        {/* School Header */}
        <div className="p-6 sm:p-7 bg-slate-50/75 border-b border-slate-200/80 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-xl bg-white border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src="/school-logo.png" 
                alt="ตราโรงเรียนวชิรธรรมสาธิต" 
                width={40}
                height={40}
                className="w-10 h-10 object-contain shrink-0" 
              />
            </div>
            <div>
              <span className="text-xs font-bold text-slate-900 block mb-0.5">โรงเรียนวชิรธรรมสาธิต</span>
              <p className="text-xs text-slate-500">ระบบบริหารจัดการการเรียนการสอนออนไลน์ (ART ROOM)</p>
            </div>
          </div>

          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-md text-[11px] font-semibold bg-red-50 text-red-700 border border-red-200/70 shrink-0">
            <Lock className="w-3.5 h-3.5 text-red-600" />
            <span>การจำกัดสิทธิ์การเข้าถึง (Restricted Access)</span>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Main Title & Description */}
          <div>
            <h1 className="text-xl sm:text-2xl font-bold text-slate-900 font-heading mb-2 tracking-tight">
              {authState.isGuest
                ? "แจ้งสถานะการเข้าใช้งานระบบ (สถานะผู้เยี่ยมชม)"
                : "สงวนสิทธิ์เฉพาะนักเรียนโรงเรียนวชิรธรรมสาธิต"}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed font-light">
              {authState.isGuest
                ? `เรียนคุณ ${authState.guestName || ""} ท่านกำลังเข้าใช้งานในสถานะผู้เยี่ยมชม (Guest) ซึ่งสามารถเข้าชมผลงานและร่วมสนทนาในโซนแชร์ไอเดียได้ สำหรับบทเรียนเชิงลึกและระบบส่งงานนี้ สงวนไว้เฉพาะนักเรียนตามหลักสูตรเท่านั้น`
                : zoneDescription}
            </p>
          </div>

          {/* Institutional Status & Policy Box */}
          <div className="bg-slate-50 border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-200/70 text-xs">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1">
              <span className="text-slate-500 font-medium">ออกแบบและพัฒนาเว็บไซต์โดย:</span>
              <span className="font-semibold text-slate-800">นางสาวสีวลี ยืนยาว</span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1 bg-white">
              <span className="text-slate-500 font-medium">สถานะบัญชีปัจจุบัน:</span>
              <span className="font-semibold flex items-center gap-1.5">
                {authState.isGuest ? (
                  <span className="text-amber-700 flex items-center gap-1">
                    <UserCheck className="w-3.5 h-3.5" />
                    ผู้เยี่ยมชม ({authState.guestName || "Guest"})
                  </span>
                ) : (
                  <span className="text-slate-600 flex items-center gap-1">
                    <ShieldAlert className="w-3.5 h-3.5 text-slate-400" />
                    บุคคลทั่วไป (ยังไม่ได้เข้าสู่ระบบ)
                  </span>
                )}
              </span>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center justify-between px-4 py-2.5 gap-1">
              <span className="text-slate-500 font-medium">เงื่อนไขการเข้าใช้งาน:</span>
              <span className="font-semibold text-slate-800 flex items-center gap-1">
                <KeyRound className="w-3.5 h-3.5 text-slate-500" />
                บัญชีนักเรียน (รหัสประจำตัวนักเรียน 5 หลัก)
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex flex-col sm:flex-row items-center gap-3 pt-1">
            <Link
              href={loginUrl}
              className="w-full sm:flex-1 h-11 px-5 rounded-xl bg-red-700 hover:bg-red-800 active:bg-red-900 text-white font-medium text-sm shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
            >
              <LogIn className="w-4 h-4" />
              <span>{authState.isGuest ? "สลับไปเข้าสู่ระบบนักเรียน" : "เข้าสู่ระบบด้วยบัญชีนักเรียน"}</span>
            </Link>

            <Link
              href="/"
              className="w-full sm:w-auto h-11 px-5 rounded-xl border border-slate-300 hover:bg-slate-50 text-slate-700 font-medium text-sm transition-colors flex items-center justify-center gap-1.5"
            >
              <ArrowLeft className="w-4 h-4 text-slate-500" />
              <span>กลับสู่หน้าหลัก</span>
            </Link>
          </div>

          {/* Official Footnote / Compliance */}
          <div className="pt-4 border-t border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 text-[11px] text-slate-400">
            <span>* รหัสผ่านเริ่มต้นคือ รหัสนักเรียน 5 หลักตามด้วย @wts (เช่น 37743@wts)</span>
            <span>ระบบสารสนเทศทางการศึกษาตามมาตรฐาน พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)</span>
          </div>

        </div>

      </div>
    </main>
  );
}
