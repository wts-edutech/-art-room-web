"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { User, Users, ArrowLeft } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"student" | "guest">("student");
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestPhone, setGuestPhone] = useState("");
  const [guestEmail, setGuestEmail] = useState("");

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!guestEmail.trim()) return;
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: guestEmail.trim(), emailOrProvider: guestEmail.trim() })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("artroom_author_name", guestEmail.split('@')[0] || guestEmail);
        localStorage.setItem("artroom_author_email", guestEmail);
        localStorage.setItem("artroom_role", "guest");
        
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
        router.push(redirectPath);
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
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
      
      // Save student info to localStorage for the comments system
      localStorage.setItem("artroom_author_name", data.student.name);
      localStorage.setItem("artroom_author_email", `${studentId}@wachiratham.ac.th`);
      localStorage.setItem("artroom_role", "student"); // Explicitly set role
      
      const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/materials';
      router.push(redirectPath);
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsLoading(false);
    }
  };

  const handleGuestLogin = async (e: React.MouseEvent, provider: string) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const displayName = `ผู้เยี่ยมชม (${provider})`;
      const res = await fetch('/api/auth/guest', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ guestName: displayName, emailOrProvider: provider })
      });
      
      const data = await res.json();
      
      if (res.ok) {
        localStorage.setItem("artroom_author_name", displayName);
        localStorage.setItem("artroom_role", "guest");
        
        const redirectPath = new URLSearchParams(window.location.search).get('redirect') || '/';
        router.push(redirectPath);
      } else {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการเข้าสู่ระบบ");
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
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
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="email">รหัสนักเรียน</label>
                  <input 
                    id="email"
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
            <div className="animate-in fade-in slide-in-from-bottom-2 duration-300 py-2">
              <form onSubmit={handleEmailLogin} className="space-y-4 mb-6">
                {errorMsg && (
                  <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3 rounded-xl flex items-center justify-center">
                    {errorMsg}
                  </div>
                )}
                <div className="relative">
                  <input 
                    type="email" 
                    id="guestEmail"
                    required
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    className="block px-4 pb-2.5 pt-6 w-full text-sm text-gray-900 bg-white rounded-xl border border-gray-300 appearance-none focus:outline-none focus:ring-0 focus:border-blue-500 peer"
                    placeholder=" "
                  />
                  <label 
                    htmlFor="guestEmail" 
                    className="absolute text-sm text-gray-500 duration-300 transform -translate-y-3 scale-75 top-4 z-10 origin-[0] left-4 peer-focus:text-blue-500 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-3"
                  >
                    อีเมล <span className="text-red-500">*</span>
                  </label>
                </div>
                <Button 
                  type="submit" 
                  disabled={isLoading}
                  className="w-full h-12 rounded-xl text-md bg-[#ED2128] hover:bg-[#D11A20] text-white transition-all font-bold"
                >
                  {isLoading ? "กำลังเข้าสู่ระบบ..." : "ถัดไป"}
                </Button>
              </form>
              
              <div className="text-center mb-6">
                <p className="text-gray-600 text-[11px] px-2 leading-relaxed mb-4">
                  กรุณาศึกษาอ่านรายละเอียด <Link href="/privacy-policy" className="text-blue-500 hover:underline">นโยบายคุ้มครองข้อมูลส่วนบุคคล</Link> <Link href="/data-processing" className="text-blue-500 hover:underline">ประกาศการประมวลผลข้อมูลส่วนบุคคล</Link> และ <Link href="/terms" className="text-blue-500 hover:underline">เงื่อนไขการใช้บริการ</Link> ของ Art Room
                </p>
              </div>

              <div className="space-y-3">
                <button 
                  onClick={(e) => handleGuestLogin(e, "Google")}
                  className="w-full h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475656/google-color.svg" alt="Google" className="w-5 h-5" />
                  เข้าสู่ระบบด้วย Google
                </button>
                
                <button 
                  onClick={(e) => handleGuestLogin(e, "Facebook")}
                  className="w-full h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/475647/facebook-color.svg" alt="Facebook" className="w-5 h-5" />
                  เข้าสู่ระบบด้วย Facebook
                </button>

                <button 
                  onClick={(e) => handleGuestLogin(e, "Line")}
                  className="w-full h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://upload.wikimedia.org/wikipedia/commons/4/41/LINE_logo.svg" alt="Line" className="w-5 h-5" />
                  เข้าสู่ระบบด้วย Line
                </button>

                <button 
                  onClick={(e) => handleGuestLogin(e, "Microsoft")}
                  className="w-full h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/452062/microsoft.svg" alt="Microsoft" className="w-5 h-5" />
                  เข้าสู่ระบบด้วย Microsoft
                </button>

                <button 
                  onClick={(e) => handleGuestLogin(e, "Apple")}
                  className="w-full h-12 rounded-lg bg-white border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium flex items-center justify-center gap-3 transition-colors shadow-sm"
                >
                  <img src="https://www.svgrepo.com/show/511330/apple-173.svg" alt="Apple" className="w-5 h-5" />
                  เข้าสู่ระบบด้วย Apple
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
