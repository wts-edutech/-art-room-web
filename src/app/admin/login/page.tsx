"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Eye, EyeOff } from "lucide-react";

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
        // Redirect to admin dashboard and force refresh to bypass layout cache if needed
        window.location.href = "/admin";
      } else {
        const data = await res.json();
        setError(data.error || "รหัสผ่านไม่ถูกต้อง");
      }
    } catch (err) {
      setError("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center relative p-4 bg-orange-50/30">
      <div 
        className="absolute inset-0 z-[-1] pointer-events-none opacity-40 bg-fixed bg-center bg-cover mix-blend-multiply"
        style={{ backgroundImage: "url('/bg-art.jpg')" }}
      />
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
                className="absolute right-3 top-1/2 -translate-y-1/2 p-2 rounded-lg text-gray-400 hover:text-orange-500 hover:bg-orange-50 transition-colors"
              >
                {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
              </button>
            </div>
          </div>

          <Button 
            type="submit" 
            disabled={isLoading}
            className="w-full h-12 rounded-xl text-md font-bold bg-orange-500 hover:bg-orange-600 text-white border-none shadow-md shadow-orange-500/20 transition-all"
          >
            {isLoading ? "กำลังเข้าสู่ระบบ..." : "เข้าสู่ระบบ"}
          </Button>
        </form>
      </div>
    </div>
  );
}
