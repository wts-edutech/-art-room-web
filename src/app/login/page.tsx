"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Users, ArrowLeft, Zap } from "lucide-react";

const SOCIAL_PROVIDERS = [
  {
    id: "Google",
    name: "เข้าสู่ระบบด้วย Google",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24">
        <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
        <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
        <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
        <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
      </svg>
    ),
  },
  {
    id: "Facebook",
    name: "เข้าสู่ระบบด้วย Facebook",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "Line",
    name: "เข้าสู่ระบบด้วย Line",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#06C755">
        <path d="M19.365 9.864c0-4.043-4.32-7.332-9.615-7.332C4.455 2.532.135 5.821.135 9.864c0 3.626 3.447 6.666 8.106 7.218.316.068.746.21.855.48.098.243.064.623.031.868l-.138.835c-.042.254-.196.993.87.542 1.066-.452 5.753-3.388 7.848-5.803 1.564-1.748 1.658-3.082 1.658-4.154zM8.136 12.247H6.38a.636.636 0 01-.636-.636V8.293a.636.636 0 111.272 0v2.682h1.12a.636.636 0 010 1.272zm2.08-.636a.636.636 0 01-1.272 0V8.293a.636.636 0 111.272 0v3.318zm4.492 0a.636.636 0 01-.51.624.64.64 0 01-.606-.176l-2.074-2.812v2.364a.636.636 0 11-1.272 0V8.293a.636.636 0 01.51-.624.636.636 0 01.606.176l2.074 2.812V8.293a.636.636 0 111.272 0v3.318zm3.504-2.682a.636.636 0 010 1.272h-1.12v.774h1.12a.636.636 0 110 1.272H16.42a.636.636 0 01-.636-.636V8.293a.636.636 0 01.636-.636h1.752a.636.636 0 110 1.272h-1.116v.636h1.116z"/>
      </svg>
    ),
  },
  {
    id: "Microsoft",
    name: "เข้าสู่ระบบด้วย Microsoft",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 21 21">
        <rect x="1" y="1" width="9" height="9" fill="#F25022"/>
        <rect x="11" y="1" width="9" height="9" fill="#7FBA00"/>
        <rect x="1" y="11" width="9" height="9" fill="#00A4EF"/>
        <rect x="11" y="11" width="9" height="9" fill="#FFB900"/>
      </svg>
    ),
  },
  {
    id: "Apple",
    name: "เข้าสู่ระบบด้วย Apple",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0 fill-current text-black" viewBox="0 0 170 170">
        <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.06-7.7-7.9-12.04-14.5-6.26-9.52-11.28-20.08-15.08-31.69-3.8-11.61-5.7-22.68-5.7-33.22 0-14.07 3.57-25.79 10.7-35.16 7.14-9.37 16.03-14.19 26.68-14.46 5.56 0 11.29 1.48 17.18 4.43 5.88 2.96 10.02 4.49 12.4 4.59 2.05 0 6.39-1.6 13.01-4.8 6.62-3.2 12.63-4.66 18.04-4.38 12.03.62 21.76 4.97 29.18 13.06-10.42 6.33-15.54 15.15-15.35 26.46.2 8.78 3.52 16.2 9.97 22.25 6.45 6.06 14.13 9.77 23.03 11.14-2.45 7.42-5.46 15.02-9.04 22.8zM119.22 31.95c0-6.84 2.53-13.43 7.6-19.78 5.07-6.35 11.39-10.41 18.96-12.17.65 1.55.98 3.27.98 5.16 0 6.84-2.58 13.48-7.73 19.92-5.15 6.44-11.45 10.43-18.9 11.97-.33-1.67-.91-3.37-.91-5.1z"/>
      </svg>
    ),
  },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [loadingProvider, setLoadingProvider] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"student" | "guest">("student");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  useEffect(() => {
    // Check if ?tab=guest was requested in URL
    const params = new URLSearchParams(window.location.search);
    if (params.get("tab") === "guest") {
      setActiveTab("guest");
    }
  }, []);

  const getRedirectPath = () => {
    return new URLSearchParams(window.location.search).get("redirect") || "/materials";
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: guestEmail.trim(), emailOrProvider: guestEmail.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("artroom_author_name", guestEmail.split("@")[0] || guestEmail);
        localStorage.setItem("artroom_author_email", guestEmail);
        localStorage.setItem("artroom_role", "guest");
        
        // Full page redirect for instant authentication and cookie application
        window.location.href = getRedirectPath();
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId, password })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาด");
        setIsLoading(false);
        return;
      }
      
      // Save student info to localStorage for the comments and lessons system
      localStorage.setItem("artroom_author_name", data.student.name);
      localStorage.setItem("artroom_author_email", `${studentId}@wachiratham.ac.th`);
      localStorage.setItem("artroom_role", "student");
      
      // Full page redirect to ensure cookie and auth state take effect immediately
      window.location.href = getRedirectPath();
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
    }
  };

  // 1-Click Instant Login for guests who don't want to type email
  const handleGuestLogin = async (e: React.MouseEvent, provider: string) => {
    e.preventDefault();
    if (isLoading) return;
    
    setLoadingProvider(provider);
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const displayName = `ผู้ใช้ ${provider}`;
      const mockEmail = `${provider.toLowerCase()}_guest@artroom.local`;

      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ guestName: displayName, emailOrProvider: mockEmail })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("artroom_author_name", displayName);
        localStorage.setItem("artroom_author_email", mockEmail);
        localStorage.setItem("artroom_role", "guest");
        
        // Instant redirect directly into the app
        window.location.href = getRedirectPath();
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
        setIsLoading(false);
        setLoadingProvider(null);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
      setLoadingProvider(null);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/50 p-4 relative">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-medium shadow-sm border border-gray-200 hover:text-orange-500 hover:border-orange-300 hover:shadow-md transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">กลับสู่หน้าแรก</span>
      </Link>

      {/* Background decoration */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
      
      <div className="w-full max-w-md relative z-10 bg-white rounded-3xl shadow-xl shadow-gray-200/50 p-8 md:p-10 border border-gray-100 overflow-hidden">
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-6 hover:scale-105 transition-transform">
            <img 
              src="/school-logo.png" 
              alt="School Logo" 
              className="w-24 h-24 object-contain mx-auto"
            />
          </Link>
          <h1 className="text-2xl md:text-3xl font-bold font-heading text-gray-900 tracking-tight">เข้าสู่ระบบ</h1>
          <p className="text-gray-500 mt-2 font-light text-sm">เลือกประเภทผู้ใช้งานเพื่อเข้าสู่บทเรียน</p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab("student")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === "student" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            <User className="w-4 h-4" /> นักเรียน
          </button>
          <button
            onClick={() => setActiveTab("guest")}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all ${
              activeTab === "guest" 
                ? "bg-white text-gray-900 shadow-sm" 
                : "text-gray-500 hover:text-gray-700 hover:bg-gray-200/50"
            }`}
          >
            <Users className="w-4 h-4" /> บุคคลทั่วไป
          </button>
        </div>

        <div className="min-h-[250px]">
          {activeTab === "student" ? (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
              <div className="text-center mb-6">
                <h2 className="text-lg font-bold text-gray-800">นักเรียนโรงเรียนวชิรธรรมสาธิต</h2>
              </div>
              <form onSubmit={handleLogin} className="space-y-5">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl flex items-center justify-center">
                    {errorMsg}
                  </div>
                )}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="studentId">รหัสนักเรียน</label>
                  <input 
                    id="studentId"
                    type="text" 
                    required
                    value={studentId}
                    onChange={(e) => setStudentId(e.target.value)}
                    placeholder="รหัสประจำตัวนักเรียน 5 หลัก"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--color-primary-500) focus:ring-2 focus:ring-(--color-primary-500)/20 outline-none transition-all"
                  />
                </div>
                
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="password">รหัสผ่าน</label>
                  </div>
                  <input 
                    id="password"
                    type="password" 
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-(--color-primary-500) focus:ring-2 focus:ring-(--color-primary-500)/20 outline-none transition-all"
                  />
                  <p className="text-[11px] text-gray-500 mt-1.5 leading-relaxed">
                    <span className="font-bold text-(--color-primary-500)">คำแนะนำ:</span> ให้นักเรียนใส่รหัสประจำตัวนักเรียน แล้วตามด้วย <span className="font-bold">@wts</span> <br/>
                    (ตัวอย่างเช่น ถ้ารหัสนักเรียนคือ 12345 รหัสผ่านจะเป็น <span className="font-bold text-gray-700 bg-gray-100 px-1 py-0.5 rounded">12345@wts</span>)
                  </p>
                </div>

                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-md shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 transition-all mt-6 font-bold"
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
                </Button>
              </form>
              
              <div className="mt-6 text-center text-gray-500 text-xs">
                หากมีปัญหาการเข้าสู่ระบบ <a href="https://line.me/R/ti/p/@137odaxl" target="_blank" rel="noopener noreferrer" className="text-(--color-primary-500) font-bold hover:underline cursor-pointer">ติดต่อคุณครูผู้สอนผ่าน LINE</a>
              </div>
            </div>
          ) : (
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-1">
              {errorMsg && (
                <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl flex items-center justify-center mb-4">
                  {errorMsg}
                </div>
              )}

              {/* Legal Notice */}
              <div className="text-center mb-4">
                <p className="text-gray-500 text-[11px] px-1 leading-relaxed">
                  การเข้าใช้งานถือว่ายอมรับ <Link href="/privacy-policy" className="text-blue-600 hover:underline">นโยบายคุ้มครองข้อมูลส่วนบุคคล</Link> <Link href="/data-processing" className="text-blue-600 hover:underline">ประกาศการประมวลผลข้อมูลส่วนบุคคล</Link> และ <Link href="/terms" className="text-blue-600 hover:underline">เงื่อนไขการใช้บริการ</Link> ของ Art Room
                </p>
              </div>

              {/* 1-Click Instant Social Login Buttons */}
              <div className="space-y-3 mb-6">
                {SOCIAL_PROVIDERS.map((item) => {
                  const isThisLoading = loadingProvider === item.id;
                  return (
                    <button 
                      key={item.id}
                      type="button"
                      disabled={isLoading}
                      onClick={(e) => handleGuestLogin(e, item.id)}
                      className="w-full h-12 rounded-xl bg-white border border-gray-300 hover:border-gray-400 hover:bg-gray-50/80 active:scale-[0.99] text-gray-700 font-medium text-[15px] flex items-center justify-center gap-3 transition-all shadow-xs hover:shadow-sm disabled:opacity-60 disabled:cursor-not-allowed group cursor-pointer"
                    >
                      {isThisLoading ? (
                        <div className="flex items-center gap-2 text-sm text-gray-700 font-semibold animate-pulse">
                          <div className="w-4 h-4 border-2 border-orange-500 border-t-transparent rounded-full animate-spin"></div>
                          <span>กำลังเข้าสู่ระบบด้วย {item.id}...</span>
                        </div>
                      ) : (
                        <>
                          {item.icon}
                          <span>{item.name}</span>
                        </>
                      )}
                    </button>
                  );
                })}
              </div>

              {/* Or divider */}
              <div className="relative my-6 flex items-center justify-center">
                <div className="border-t border-gray-200 w-full"></div>
                <span className="bg-white px-3 text-xs text-gray-400 font-medium absolute">หรือระบุอีเมลสำหรับติดต่อ</span>
              </div>

              {/* Email Form for optional custom email entry */}
              <form onSubmit={handleEmailLogin} className="space-y-3">
                <div className="relative">
                  <input 
                    type="email" 
                    id="guestEmail"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="block px-4 pb-2.5 pt-6 w-full text-sm text-gray-900 bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="guestEmail" 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    อีเมล (ไม่บังคับ)
                  </label>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading || !guestEmail.trim()}
                  className="w-full h-11 rounded-xl text-sm bg-gray-900 hover:bg-gray-800 text-white transition-all font-medium disabled:opacity-40"
                >
                  {isLoading && !loadingProvider ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบด้วยอีเมล"}
                </Button>
              </form>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
