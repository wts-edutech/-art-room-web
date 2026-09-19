"use client";

import { useState } from "react";
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  ShieldAlert,
  Save,
  RotateCcw
} from "lucide-react";
import { Button } from "@/components/ui/button";

export default function AdminSecurityTab() {
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Validation
  const isLengthValid = newPassword.length >= 6;
  const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = currentPassword.length > 0 && isLengthValid && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage("กรุณาระบุรหัสผ่านปัจจุบัน");
      return;
    }

    if (newPassword.length < 6) {
      setErrorMessage("รหัสผ่านใหม่ต้องมีความยาวอย่างน้อย 6 ตัวอักษร");
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage("รหัสผ่านใหม่และการยืนยันรหัสผ่านไม่ตรงกัน");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch("/api/admin/change-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          currentPassword,
          newPassword,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      } else {
        setSuccessMessage(data.message || "เปลี่ยนรหัสผ่านผู้ดูแลระบบสำเร็จแล้ว");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
      }
    } catch (err) {
      console.error("Change password error:", err);
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center font-bold shadow-inner shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-kanit text-gray-950 flex items-center gap-2">
              <span>ตั้งค่ารหัสผ่านผู้ดูแลระบบ (Admin Password)</span>
              <span className="text-[11px] font-semibold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                ความปลอดภัยระบบ
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              เปลี่ยนรหัสผ่านสำหรับเข้าสู่ระบบแอดมินหลังบ้าน (Admin Dashboard) ข้อมูลจะถูกจัดเก็บเข้ารหัสในฐานข้อมูล Cloudflare D1 ทันที
            </p>
          </div>
        </div>
      </div>

      {/* Main Security Form Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        {/* Success Alert */}
        {successMessage && (
          <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 flex items-start gap-3 animate-in fade-in duration-200">
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-bold text-emerald-950 block text-sm">บันทึกสำเร็จ!</strong>
              <p>{successMessage}</p>
              <p className="text-emerald-800/80 text-[11px]">
                รหัสผ่านใหม่มีผลทันที ในการเข้าใช้งานระบบครั้งต่อไป กรุณาใช้รหัสผ่านใหม่นี้
              </p>
            </div>
          </div>
        )}

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-4 rounded-2xl bg-red-50 border border-red-200 text-red-900 flex items-start gap-3 animate-in fade-in duration-200">
            <AlertTriangle className="w-5 h-5 text-red-600 shrink-0 mt-0.5" />
            <div className="text-xs space-y-1">
              <strong className="font-bold text-red-950 block text-sm">ไม่สามารถเปลี่ยนรหัสผ่านได้</strong>
              <p>{errorMessage}</p>
            </div>
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Current Password */}
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="currentPassword">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>รหัสผ่านปัจจุบัน <span className="text-red-500">*</span></span>
              </span>
              <span className="text-[11px] text-gray-400 font-normal">
                (ค่าเริ่มต้นโรงเรียนคือ admin1234 หรือรหัสล่าสุดที่ตั้งไว้)
              </span>
            </label>
            <div className="relative">
              <input
                id="currentPassword"
                type={showCurrentPassword ? "text" : "password"}
                required
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                placeholder="กรอกรหัสผ่านปัจจุบันเพื่อยืนยันตัวตน..."
                className="w-full h-11 pl-4 pr-11 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
              />
              <button
                type="button"
                onClick={() => setShowCurrentPassword(!showCurrentPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showCurrentPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
            {/* New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="newPassword">
                <span className="flex items-center gap-1.5">
                  <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                  <span>รหัสผ่านใหม่ <span className="text-red-500">*</span></span>
                </span>
                <span className={`text-[11px] font-medium ${isLengthValid ? "text-emerald-600" : "text-gray-400"}`}>
                  อย่างน้อย 6 ตัวอักษร
                </span>
              </label>
              <div className="relative">
                <input
                  id="newPassword"
                  type={showNewPassword ? "text" : "password"}
                  required
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="กำหนดรหัสผ่านใหม่..."
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPassword(!showNewPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showNewPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm New Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="confirmPassword">
                <span className="flex items-center gap-1.5">
                  <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                  <span>ยืนยันรหัสผ่านใหม่ <span className="text-red-500">*</span></span>
                </span>
                {confirmPassword && (
                  <span className={`text-[11px] font-medium ${isMatching ? "text-emerald-600" : "text-red-500"}`}>
                    {isMatching ? "รหัสผ่านตรงกัน ✓" : "รหัสผ่านไม่ตรงกัน ✕"}
                  </span>
                )}
              </label>
              <div className="relative">
                <input
                  id="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  required
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="กรอกรหัสผ่านใหม่อีกครั้ง..."
                  className="w-full h-11 pl-4 pr-11 rounded-xl border border-gray-200 bg-gray-50/60 focus:bg-white focus:border-amber-500 focus:ring-2 focus:ring-amber-500/20 outline-none transition-all text-sm font-medium"
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
          </div>

          {/* Security Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ข้อควรทราบด้านความปลอดภัย</span>
            </div>
            <ul className="text-[11px] text-amber-900/90 space-y-1 list-disc list-inside leading-relaxed">
              <li>รหัสผ่านผู้ดูแลระบบมีอำนาจสูงสุดในการจัดการเว็บไซต์ ห้องเรียน คะแนนสอบ และข้อมูลนักเรียนทั้งหมด</li>
              <li>แนะนำให้ตั้งรหัสผ่านที่มีทั้งตัวอักษรและตัวเลขความยาวอย่างน้อย 6 ตัวขึ้นไป และจดจำไว้อย่างปลอดภัย</li>
              <li>เมื่อเปลี่ยนสำเร็จ ระบบจะบันทึกข้อมูลอย่างปลอดภัย (เข้ารหัส SHA-256) ลงในฐานข้อมูล Cloudflare D1</li>
            </ul>
          </div>

          {/* Submit Button */}
          <div className="pt-2 flex items-center justify-end gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setCurrentPassword("");
                setNewPassword("");
                setConfirmPassword("");
                setErrorMessage(null);
                setSuccessMessage(null);
              }}
              disabled={isLoading || (!currentPassword && !newPassword && !confirmPassword)}
              className="rounded-xl text-xs font-semibold px-4 h-11 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5 mr-1.5" />
              ล้างข้อมูล
            </Button>

            <Button
              type="submit"
              disabled={isLoading || !isFormValid}
              className="rounded-xl text-xs font-bold px-6 h-11 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>กำลังบันทึก...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Save className="w-4 h-4" />
                  <span>บันทึกรหัสผ่านใหม่</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
