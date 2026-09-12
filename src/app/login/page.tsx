"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { 
  User, 
  Users, 
  ArrowLeft, 
  Mail, 
  Phone, 
  ShieldCheck, 
  CheckCircle2, 
  Sparkles,
  Info
} from "lucide-react";

interface SocialProvider {
  id: string;
  name: string;
  tagline: string;
  placeholderEmail: string;
  icon: React.ReactNode;
  activeColor: string;
}

const PROVIDERS: SocialProvider[] = [
  {
    id: "Google",
    name: "Google / Gmail",
    tagline: "สำหรับผู้ใช้งาน Google / Gmail",
    placeholderEmail: "เช่น somchai.art@gmail.com",
    activeColor: "border-blue-500 bg-blue-50/50 text-blue-700",
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
    name: "Facebook",
    tagline: "สำหรับผู้ใช้งาน Facebook",
    placeholderEmail: "เช่น somchai@facebook.com หรืออีเมลที่ผูกไว้",
    activeColor: "border-blue-600 bg-blue-50/50 text-blue-800",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0 text-[#1877F2]" fill="currentColor" viewBox="0 0 24 24">
        <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
      </svg>
    ),
  },
  {
    id: "Line",
    name: "LINE",
    tagline: "สำหรับผู้ใช้งานผ่าน LINE",
    placeholderEmail: "เช่น somchai@line.me หรืออีเมลบัญชี LINE",
    activeColor: "border-emerald-500 bg-emerald-50/50 text-emerald-800",
    icon: (
      <svg className="w-5 h-5 flex-shrink-0" viewBox="0 0 24 24" fill="#06C755">
        <path d="M19.365 9.864c0-4.043-4.32-7.332-9.615-7.332C4.455 2.532.135 5.821.135 9.864c0 3.626 3.447 6.666 8.106 7.218.316.068.746.21.855.48.098.243.064.623.031.868l-.138.835c-.042.254-.196.993.87.542 1.066-.452 5.753-3.388 7.848-5.803 1.564-1.748 1.658-3.082 1.658-4.154zM8.136 12.247H6.38a.636.636 0 01-.636-.636V8.293a.636.636 0 111.272 0v2.682h1.12a.636.636 0 010 1.272zm2.08-.636a.636.636 0 01-1.272 0V8.293a.636.636 0 111.272 0v3.318zm4.492 0a.636.636 0 01-.51.624.64.64 0 01-.606-.176l-2.074-2.812v2.364a.636.636 0 11-1.272 0V8.293a.636.636 0 01.51-.624.636.636 0 01.606.176l2.074 2.812V8.293a.636.636 0 111.272 0v3.318zm3.504-2.682a.636.636 0 010 1.272h-1.12v.774h1.12a.636.636 0 110 1.272H16.42a.636.636 0 01-.636-.636V8.293a.636.636 0 01.636-.636h1.752a.636.636 0 110 1.272h-1.116v.636h1.116z"/>
      </svg>
    ),
  },
  {
    id: "Email",
    name: "อีเมลทั่วไป",
    tagline: "Outlook, Yahoo, Hotmail, องค์กร",
    placeholderEmail: "เช่น somchai@outlook.com หรืออีเมลที่สะดวก",
    activeColor: "border-gray-800 bg-gray-50 text-gray-900",
    icon: (
      <Mail className="w-5 h-5 text-indigo-600 flex-shrink-0" />
    ),
  },
];

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [activeTab, setActiveTab] = useState<"student" | "guest">("student");
  
  // Student Login State
  const [studentId, setStudentId] = useState("");
  const [password, setPassword] = useState("");

  // Guest Real Login State
  const [selectedProvider, setSelectedProvider] = useState<string>("Google");
  const [guestEmail, setGuestEmail] = useState("");
  const [guestName, setGuestName] = useState("");
  const [guestRole, setGuestRole] = useState("ผู้ปกครองนักเรียน");
  const [guestPhone, setGuestPhone] = useState("");

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

  // Student Login Handler
  const handleStudentLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setErrorMsg("");
    
    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ studentId: studentId.trim(), password: password.trim() })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการตรวจสอบสิทธิ์");
        setIsLoading(false);
        return;
      }
      
      // Save student session locally
      localStorage.setItem("artroom_author_name", data.student.name);
      localStorage.setItem("artroom_author_email", `${studentId.trim()}@wachiratham.ac.th`);
      localStorage.setItem("artroom_role", "student");
      
      // Redirect
      window.location.href = getRedirectPath();
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ กรุณาลองใหม่อีกครั้ง");
      setIsLoading(false);
    }
  };

  // Real Guest Login Handler (Records genuine email, name, role, phone in DB)
  const handleGuestLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isLoading) return;
    setErrorMsg("");

    const trimmedEmail = guestEmail.trim().toLowerCase();
    const trimmedName = guestName.trim();

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!trimmedEmail || !emailRegex.test(trimmedEmail)) {
      setErrorMsg("กรุณาระบุที่อยู่อีเมลที่ถูกต้อง (ตัวอย่างเช่น yourname@gmail.com)");
      return;
    }

    // Validate name
    if (!trimmedName || trimmedName.length < 2) {
      setErrorMsg("กรุณาระบุชื่อ - นามสกุลจริงของท่าน เพื่อบันทึกการเข้าใช้งาน");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/auth/guest", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          email: trimmedEmail,
          name: trimmedName,
          role: guestRole,
          phone: guestPhone.trim(),
          provider: selectedProvider,
        })
      });

      const data = await res.json();

      if (res.ok) {
        localStorage.setItem("artroom_author_name", trimmedName);
        localStorage.setItem("artroom_author_email", trimmedEmail);
        localStorage.setItem("artroom_role", "guest");
        localStorage.setItem("artroom_user_role", guestRole);

        // Redirect
        window.location.href = getRedirectPath();
      } else {
        setErrorMsg(data.error || "ไม่สามารถเข้าสู่ระบบได้ กรุณาลองใหม่อีกครั้ง");
        setIsLoading(false);
      }
    } catch (error) {
      console.error(error);
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์");
      setIsLoading(false);
    }
  };

  const currentProviderConfig = PROVIDERS.find(p => p.id === selectedProvider) || PROVIDERS[0];

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50/70 p-4 relative py-12">
      {/* Back Button */}
      <Link 
        href="/" 
        className="absolute top-6 left-6 z-20 flex items-center gap-2 px-4 py-2 bg-white rounded-full text-gray-600 font-medium shadow-sm border border-gray-200 hover:text-orange-500 hover:border-orange-300 hover:shadow-md transition-all group"
      >
        <ArrowLeft className="w-5 h-5 group-hover:-translate-x-1 transition-transform" />
        <span className="hidden sm:inline">กลับสู่หน้าแรก</span>
      </Link>

      {/* Background Grid Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none"></div>
      
      <div className="w-full max-w-lg relative z-10 bg-white rounded-3xl shadow-xl shadow-gray-200/60 p-7 sm:p-10 border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="text-center mb-8">
          <Link href="/" className="inline-block mb-4 hover:scale-105 transition-transform">
            <img 
              src="/school-logo.png" 
              alt="School Logo" 
              className="w-20 h-20 sm:w-24 sm:h-24 object-contain mx-auto"
            />
          </Link>
          <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 tracking-tight">เข้าสู่ระบบห้องเรียนศิลปะ</h1>
          <p className="text-gray-500 mt-2 font-light text-sm">
            {activeTab === "student" 
              ? "สำหรับนักเรียนโรงเรียนวชิรธรรมสาธิต" 
              : "สำหรับผู้ปกครอง ศิษย์เก่า และบุคคลทั่วไป"}
          </p>
        </div>

        {/* Tab Selection */}
        <div className="flex bg-gray-100 p-1.5 rounded-2xl mb-7 shadow-inner">
          <button
            type="button"
            onClick={() => { setActiveTab("student"); setErrorMsg(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "student" 
                ? "bg-white text-gray-900 shadow-md shadow-gray-200/50" 
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <User className="w-4 h-4" /> นักเรียน (WTS)
          </button>
          <button
            type="button"
            onClick={() => { setActiveTab("guest"); setErrorMsg(""); }}
            className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm font-bold rounded-xl transition-all cursor-pointer ${
              activeTab === "guest" 
                ? "bg-white text-gray-900 shadow-md shadow-gray-200/50" 
                : "text-gray-500 hover:text-gray-800 hover:bg-gray-200/50"
            }`}
          >
            <Users className="w-4 h-4" /> บุคคลทั่วไป / ผู้ปกครอง
          </button>
        </div>

        {/* Error Notification Banner */}
        {errorMsg && (
          <div className="bg-red-50 border border-red-200 text-red-600 text-sm font-medium p-3.5 rounded-2xl flex items-start gap-2.5 mb-6 animate-in fade-in">
            <span className="font-bold flex-shrink-0">⚠️</span>
            <div className="leading-snug">{errorMsg}</div>
          </div>
        )}

        {/* Tab 1: Student Login */}
        {activeTab === "student" ? (
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            <div className="text-center mb-6">
              <h2 className="text-md font-bold text-gray-800">เข้าสู่ระบบด้วยรหัสประจำตัวนักเรียน</h2>
            </div>
            <form onSubmit={handleStudentLogin} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="studentId">
                  รหัสนักเรียน (5 หลัก) *
                </label>
                <input 
                  id="studentId"
                  type="text" 
                  required
                  value={studentId}
                  onChange={(e) => setStudentId(e.target.value)}
                  placeholder="เช่น 12345"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-medium"
                />
              </div>
              
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-gray-600 uppercase tracking-wider" htmlFor="password">
                    รหัสผ่าน *
                  </label>
                </div>
                <input 
                  id="password"
                  type="password" 
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full h-12 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-red-500 focus:ring-2 focus:ring-red-500/20 outline-none transition-all text-sm font-medium"
                />
                <div className="bg-orange-50 border border-orange-100 rounded-xl p-3 text-[11px] text-orange-900 leading-relaxed mt-2">
                  <span className="font-bold text-orange-700">💡 คำแนะนำ:</span> รหัสผ่านคือ รหัสประจำตัวนักเรียนตามด้วย <code className="font-bold text-orange-800 bg-orange-200/60 px-1 py-0.5 rounded">@wts</code> (เช่น รหัส 12345 รหัสผ่านคือ <code className="font-bold">12345@wts</code>)
                </div>
              </div>

              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-md shadow-md shadow-red-500/20 hover:shadow-lg hover:shadow-red-500/30 bg-[#ff0f39] hover:bg-[#e00028] text-white transition-all mt-6 font-bold cursor-pointer"
              >
                {isLoading ? "กำลังตรวจสอบข้อมูล..." : "เข้าสู่ระบบนักเรียน"}
              </Button>
            </form>
            
            <div className="mt-6 text-center text-gray-500 text-xs">
              มีปัญหาการเข้าสู่ระบบ? <a href="https://line.me/R/ti/p/@137odaxl" target="_blank" rel="noopener noreferrer" className="text-red-600 font-bold hover:underline cursor-pointer">ติดต่อคุณครูผู้สอนผ่าน LINE</a>
            </div>
          </div>
        ) : (
          /* Tab 2: Guest / Parent Real Identification Login */
          <div className="animate-in fade-in slide-in-from-bottom-2 duration-300">
            
            {/* Step 1: Provider Channel Badges */}
            <div className="mb-5">
              <label className="block text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">
                เลือกช่องทางการเข้าใช้งาน
              </label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                {PROVIDERS.map((item) => {
                  const isSelected = selectedProvider === item.id;
                  return (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => setSelectedProvider(item.id)}
                      className={`p-2.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer text-center ${
                        isSelected 
                          ? `${item.activeColor} ring-2 ring-blue-500/30 shadow-sm font-bold scale-[1.02]` 
                          : "border-gray-200 bg-white hover:bg-gray-50 text-gray-600 font-medium"
                      }`}
                    >
                      <div className="flex items-center justify-center">
                        {item.icon}
                      </div>
                      <span className="text-xs truncate w-full">{item.name}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Provider Info Banner */}
            <div className="bg-blue-50/70 border border-blue-100 rounded-2xl p-3 mb-5 flex items-start gap-2.5">
              <Info className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" />
              <p className="text-xs text-blue-900 leading-relaxed">
                เข้าสู่ระบบผ่านช่องทาง <span className="font-bold text-blue-700">{currentProviderConfig.name}</span> — ระบบจะบันทึกอีเมลและชื่อจริงของท่านไว้ในระบบหลังบ้านของผู้ดูแลระบบเพื่อความปลอดภัย
              </p>
            </div>

            {/* Real Login Form */}
            <form onSubmit={handleGuestLogin} className="space-y-4">
              
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="guestEmail">
                  <span>อีเมลที่ใช้งานจริง (Email) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-normal text-gray-400">บันทึกลงระบบจริง</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Mail className="w-4 h-4" />
                  </div>
                  <input 
                    id="guestEmail"
                    type="email" 
                    required
                    autoComplete="email"
                    value={guestEmail}
                    onChange={(e) => setGuestEmail(e.target.value)}
                    placeholder={currentProviderConfig.placeholderEmail}
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Name Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="guestName">
                  <span>ชื่อ - นามสกุลจริง (Full Name) <span className="text-red-500">*</span></span>
                  <span className="text-[10px] font-normal text-gray-400">แสดงแก่ครูผู้สอน</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <User className="w-4 h-4" />
                  </div>
                  <input 
                    id="guestName"
                    type="text" 
                    required
                    autoComplete="name"
                    value={guestName}
                    onChange={(e) => setGuestName(e.target.value)}
                    placeholder="เช่น นายสมชาย ใจดี หรือ ผู้ปกครอง ด.ช.เอกชัย"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Role Selector */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700" htmlFor="guestRole">
                  สถานะผู้เข้าใช้งาน <span className="text-red-500">*</span>
                </label>
                <select
                  id="guestRole"
                  value={guestRole}
                  onChange={(e) => setGuestRole(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium text-gray-800"
                >
                  <option value="ผู้ปกครองนักเรียน">ผู้ปกครองนักเรียน (Parent)</option>
                  <option value="ประชาชนทั่วไป / ศิลปิน">ประชาชนทั่วไป / ผู้สนใจศิลปะ</option>
                  <option value="ศิษย์เก่าโรงเรียนวชิรธรรมสาธิต">ศิษย์เก่าโรงเรียนวชิรธรรมสาธิต (Alumni)</option>
                  <option value="ครู / บุคลากรภายนอก">ครู / บุคลากรทางการศึกษาภายนอก</option>
                </select>
              </div>

              {/* Optional Phone Number */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="guestPhone">
                  <span>เบอร์โทรศัพท์สำหรับติดต่อ</span>
                  <span className="text-[10px] font-normal text-gray-400">ไม่บังคับ</span>
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-gray-400">
                    <Phone className="w-4 h-4" />
                  </div>
                  <input 
                    id="guestPhone"
                    type="tel" 
                    autoComplete="tel"
                    value={guestPhone}
                    onChange={(e) => setGuestPhone(e.target.value)}
                    placeholder="เช่น 081-234-5678"
                    className="w-full h-11 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 outline-none transition-all text-sm font-medium"
                  />
                </div>
              </div>

              {/* Submit Button */}
              <Button 
                type="submit" 
                disabled={isLoading}
                className="w-full h-12 rounded-xl text-md shadow-md shadow-blue-600/20 hover:shadow-lg hover:shadow-blue-600/30 bg-blue-600 hover:bg-blue-700 text-white transition-all mt-6 font-bold cursor-pointer"
              >
                {isLoading ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>กำลังบันทึกและเข้าสู่ระบบ...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-5 h-5" />
                    <span>เข้าสู่ระบบและเริ่มใช้งาน</span>
                  </div>
                )}
              </Button>
            </form>

            {/* Legal and Privacy Notice */}
            <div className="mt-6 pt-4 border-t border-gray-100 text-center">
              <p className="text-gray-400 text-[11px] leading-relaxed">
                การเข้าใช้งานถือว่าท่านยอมรับ <Link href="/privacy-policy" className="text-blue-600 hover:underline">นโยบายคุ้มครองข้อมูลส่วนบุคคล (PDPA)</Link> และ <Link href="/terms" className="text-blue-600 hover:underline">ข้อกำหนดการใช้งาน</Link> ของเว็บไซต์ Art Room
              </p>
            </div>

          </div>
        )}
      </div>
    </div>
  );
}
