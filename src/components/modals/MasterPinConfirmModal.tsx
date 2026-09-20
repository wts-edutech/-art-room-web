"use client";

import { useState, useEffect, useRef } from "react";
import { createPortal } from "react-dom";
import { ShieldAlert, KeyRound, Eye, EyeOff, X, Check, Lock, Shield } from "lucide-react";
import { Button } from "@/components/ui/button";

interface MasterPinConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (pin: string) => Promise<void> | void;
  title?: string;
  description?: string;
  isLoading?: boolean;
  errorMessage?: string | null;
}

export default function MasterPinConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  title = "ยืนยันสิทธิ์แอดมินหลัก (Master PIN)",
  description = "กรุณากรอกรหัส Master Security PIN (เช่น K1234) เพื่อยืนยันคำสั่งเตะอุปกรณ์ออกจากระบบ",
  isLoading = false,
  errorMessage = null,
}: MasterPinConfirmModalProps) {
  const [pin, setPin] = useState("");
  const [showPin, setShowPin] = useState(false);
  const [mounted, setMounted] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      setPin("");
      const timer = setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 80);
      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  // Handle ESC key to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen && !isLoading) {
        onClose();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, isLoading, onClose]);

  if (!isOpen || !mounted) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!pin.trim()) return;
    onConfirm(pin.trim());
  };

  const modalContent = (
    <div 
      className="fixed inset-0 z-[99999] flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150"
      onClick={() => {
        if (!isLoading) onClose();
      }}
    >
      <div 
        className="w-full max-w-md bg-white rounded-3xl border border-gray-100 shadow-2xl overflow-hidden p-6 sm:p-7 space-y-5 animate-in zoom-in-95 duration-150 relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0 shadow-inner">
              <KeyRound className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base sm:text-lg font-bold text-gray-950 font-kanit flex items-center gap-2">
                <span>{title}</span>
              </h3>
              <span className="inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                <Shield className="w-3 h-3" />
                Primary Admin Security
              </span>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={isLoading}
            className="p-1.5 rounded-xl text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors cursor-pointer"
            title="ปิดหน้าต่าง"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <p className="text-xs text-gray-600 leading-relaxed">
          {description}
        </p>

        {/* Error Alert */}
        {errorMessage && (
          <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2 animate-in fade-in duration-150">
            <ShieldAlert className="w-4 h-4 text-red-600 shrink-0" />
            <span className="font-medium">{errorMessage}</span>
          </div>
        )}

        {/* PIN Input Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-1.5">
            <label className="text-xs font-bold text-gray-700 flex items-center justify-between" htmlFor="masterPinInput">
              <span className="flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-gray-400" />
                <span>รหัสยืนยันแอดมินหลัก (Master PIN) <span className="text-red-500">*</span></span>
              </span>
              <button
                type="button"
                onClick={() => setPin("K1234")}
                className="text-[10px] text-amber-600 hover:text-amber-700 font-semibold underline cursor-pointer"
              >
                (ค่าเริ่มต้น: K1234)
              </button>
            </label>
            <div className="relative">
              <input
                id="masterPinInput"
                ref={inputRef}
                type={showPin ? "text" : "password"}
                required
                autoComplete="off"
                value={pin}
                onChange={(e) => setPin(e.target.value)}
                placeholder="กรอกรหัส PIN เช่น K1234..."
                className="w-full h-12 pl-4 pr-11 rounded-xl border-2 border-amber-300/80 bg-amber-50/20 focus:bg-white focus:border-amber-500 focus:ring-4 focus:ring-amber-500/20 text-base font-mono font-extrabold tracking-wider outline-none transition-all text-gray-900"
              />
              <button
                type="button"
                onClick={() => setShowPin(!showPin)}
                className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                tabIndex={-1}
              >
                {showPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
            </div>
          </div>

          <div className="flex items-center justify-end gap-2 pt-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="rounded-xl text-xs h-10 px-4 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              ยกเลิก
            </Button>
            <Button
              type="submit"
              disabled={isLoading || !pin.trim()}
              className="rounded-xl text-xs font-bold h-10 px-5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white shadow-md shadow-orange-500/20 cursor-pointer transition-all disabled:opacity-50"
            >
              {isLoading ? (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  <span>กำลังตรวจสอบ...</span>
                </div>
              ) : (
                <div className="flex items-center gap-1.5">
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>ยืนยันและเตะออก</span>
                </div>
              )}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );

  return typeof document !== "undefined" ? createPortal(modalContent, document.body) : null;
}
