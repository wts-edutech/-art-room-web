"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";
import GuestBlockModal from "@/components/modals/GuestBlockModal";

interface ProtectedRouteProps {
  children: React.ReactNode;
  studentOnly?: boolean;
}

export default function ProtectedRoute({ children, studentOnly = false }: ProtectedRouteProps) {
  const router = useRouter();
  const pathname = usePathname();
  const [authState, setAuthState] = useState<"checking" | "authorized" | "unauthorized" | "guest_blocked">("checking");

  useEffect(() => {
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    
    if (!isLoggedIn) {
      if (studentOnly) {
        const search = typeof window !== "undefined" ? window.location.search || "" : "";
        const target = `${pathname}${search}`;
        router.replace(`/login?tab=student&redirect=${encodeURIComponent(target)}&notice=student_only`);
        return;
      }
      setAuthState("unauthorized");
    } else if (studentOnly && role !== "student") {
      setAuthState("guest_blocked");
    } else {
      setAuthState("authorized");
    }
  }, [pathname, studentOnly, router]);

  // While checking authorization, show a loading spinner
  if (authState === "checking") {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-red-200 border-t-red-600"></div>
      </div>
    );
  }

  // If student-only route and user is logged in as guest
  if (authState === "guest_blocked") {
    const search = typeof window !== "undefined" ? window.location.search || "" : "";
    return <GuestBlockModal redirectPath={`${pathname}${search}`} />;
  }

  // If not authorized, show the elegant modal
  if (authState === "unauthorized") {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs">
        <div className="bg-white rounded-2xl p-6 sm:p-7 max-w-sm w-full relative shadow-xl border border-zinc-200 text-center animate-in fade-in zoom-in-95 duration-150 z-10">
          <button 
            onClick={() => router.push("/")}
            className="absolute top-4 right-4 w-7 h-7 flex items-center justify-center text-zinc-400 hover:text-zinc-700 hover:bg-zinc-100 rounded-full transition-all cursor-pointer text-xs"
          >
            <X className="w-4 h-4" />
          </button>
          
          <div className="w-12 h-12 rounded-2xl bg-zinc-100 border border-zinc-200/80 flex items-center justify-center text-zinc-700 mx-auto mb-4">
            <Lock className="w-5 h-5 text-zinc-700" />
          </div>

          <h3 className="text-lg font-bold text-zinc-900 mb-1.5 tracking-tight">เข้าสู่ระบบเพื่อดำเนินการต่อ</h3>
          <p className="text-zinc-500 text-xs leading-relaxed font-normal mb-5">
            กรุณาเข้าสู่ระบบเพื่อเข้าถึงเนื้อหาและร่วมแบ่งปันผลงาน
          </p>

          <div className="flex flex-col gap-2">
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="w-full">
              <button className="w-full py-2.5 bg-zinc-900 hover:bg-zinc-800 text-white font-medium text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer">
                เข้าสู่ระบบ
              </button>
            </Link>
            <button
              onClick={() => router.push("/")}
              className="w-full py-2 text-zinc-500 hover:text-zinc-700 font-medium text-xs transition-colors cursor-pointer"
            >
              กลับสู่หน้าหลัก
            </button>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
