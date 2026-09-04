"use client";

import { useEffect, useState } from "react";
import { useRouter, usePathname } from "next/navigation";
import Link from "next/link";
import { X } from "lucide-react";

export default function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [isChecking, setIsChecking] = useState(true);

  useEffect(() => {
    // Check if the user is logged in
    const isLoggedIn = localStorage.getItem("artroom_author_name");
    
    if (isLoggedIn) {
      setIsAuthorized(true);
    } else {
      setIsAuthorized(false);
    }
    setIsChecking(false);
  }, []);

  // While checking authorization, show a loading spinner
  if (isChecking) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FDF9F1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
      </div>
    );
  }

  // If not authorized, show the mascot modal
  if (!isAuthorized) {
    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-gray-900">
        {/* Artistic Background */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-40"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        ></div>
        <div className="absolute inset-0 backdrop-blur-sm bg-black/20"></div>

        {/* Modal Content */}
        <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-300 z-10">
          <button 
            onClick={() => router.push("/")}
            className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
          >
            <X className="w-5 h-5" />
          </button>
          <div className="text-center mb-4 mt-2">
            <div className="flex justify-center mb-2 relative">
              <img 
                src="/images/login-mascot.png"
                alt="Login Mascot"
                className="w-48 h-48 object-contain animate-bounce relative z-10" 
                style={{ animationDuration: '3s' }}
              />
            </div>
            <h3 className="text-2xl font-black text-[#1E3A8A] mb-3 tracking-tight">เข้าสู่ระบบก่อนน้า~</h3>
            <p className="text-gray-500 font-medium mb-2">เพื่อเข้าถึงเนื้อหาพิเศษนี้!</p>
          </div>
          <div className="flex flex-col gap-3 px-4 pb-4">
            <Link href={`/login?redirect=${encodeURIComponent(pathname)}`} className="w-full group">
              <button className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-xl rounded-full transition-all shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] group-hover:shadow-[0_12px_25px_-6px_rgba(251,146,60,0.6)] group-hover:-translate-y-0.5">
                เข้าสู่ระบบ
              </button>
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return <>{children}</>;
}
