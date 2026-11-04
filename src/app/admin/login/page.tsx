"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";
import { swalSuccess, swalError } from "@/lib/swal";

export default function AdminLoginPage() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      const res = await fetch("/api/auth", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (res.ok) {
        await swalSuccess("เข้าสู่ระบบผู้ดูแลสำเร็จ!", "กำลังเข้าสู่หน้าจัดการระบบ...", 1200);
        // Redirect to admin dashboard and force refresh to bypass layout cache if needed
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        const errMsg = data.error || "รหัสผ่านไม่ถูกต้อง";
        setError(errMsg);
        swalError("เข้าสู่ระบบไม่สำเร็จ", errMsg);
      }
    } catch (err) {
      const netErr = "เกิดข้อผิดพลาดในการเชื่อมต่อ";
      setError(netErr);
      swalError("เชื่อมต่อไม่สำเร็จ", netErr);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-orange-50/30">
      <div className="w-full max-w-md bg-white/95 backdrop-blur-md rounded-3xl shadow-xl p-8 md:p-10 border border-white">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-orange-500 rounded-2xl text-white font-bold text-3xl shadow-sm mb-6">
            🛠️
          </div>
          <h1 className="text-2xl font-bold text-gray-900 tracking-tight font-kanit">Admin Dashboard</h1>
          <p className="text-gray-500 mt-2 text-sm font-prompt">เข้าสู่ระบบจัดการหลังบ้าน</p>
        </div>

        {error && (
          <div className="mb-6 p-3 rounded-xl bg-red-50 border border-red-100 text-red-500 text-sm text-center font-prompt">
            {error}
          </div>
        )}

        <form onSubmit={handleLogin} className="space-y-6 font-prompt">
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700" htmlFor="password">รหัสผ่าน</label>
            <div className="relative">
              <input 
                id="password"
                type={showPassword ? "text" : "password"} 
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full h-12 px-4 pr-12 rounded-xl bg-white border border-gray-200 text-gray-900 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all shadow-sm"
              />
              <button 
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors cursor-pointer"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
            <p className="text-[11px] text-gray-500 mt-2 flex items-center gap-1.5">
              <span>🔑</span>
              <span>รองรับทั้งรหัสผู้ดูแลระบบสูงสุด (Super Admin) และรหัสครูผู้ช่วยสอน (Teaching Admin)</span>
            </p>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-md font-bold bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md shadow-orange-500/20 transition-all cursor-pointer"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
