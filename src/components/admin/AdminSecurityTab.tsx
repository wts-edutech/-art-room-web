"use client";

import { useState, useEffect } from "react";
import { 
  KeyRound, 
  ShieldCheck, 
  Lock, 
  Eye, 
  EyeOff, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldAlert,
  Save,
  RotateCcw,
  Copy,
  Check,
  Laptop,
  Smartphone,
  Tablet,
  Globe,
  MapPin,
  Clock,
  LogOut,
  Trash2,
  Users,
  RefreshCw,
  Search,
  Shield,
  Fingerprint
} from "lucide-react";
import { Button } from "@/components/ui/button";
import MasterPinConfirmModal from "@/components/modals/MasterPinConfirmModal";

interface SessionItem {
  id: string;
  userId: string;
  userName: string;
  role: string;
  ipAddress: string | null;
  userAgent: string | null;
  deviceType: 'desktop' | 'mobile' | 'tablet' | string | null;
  browser: string | null;
  os: string | null;
  location: string | null;
  createdAt: string | null;
  lastActiveAt: string | null;
  isRevoked: boolean | null;
  isCurrent?: boolean;
}

export default function AdminSecurityTab() {
  // Password Form state
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  // Visibility toggles
  const [showCurrentPassword, setShowCurrentPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // UI state
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);

  // Current password display
  const [savedPassword, setSavedPassword] = useState<string | null>(null);
  const [showSavedPassword, setShowSavedPassword] = useState(false);
  const [loadingPassword, setLoadingPassword] = useState(true);
  const [copied, setCopied] = useState(false);

  // Master PIN state
  const [masterPin, setMasterPin] = useState<string | null>(null);
  const [showMasterPin, setShowMasterPin] = useState(false);
  const [loadingMasterPin, setLoadingMasterPin] = useState(true);
  const [copiedPin, setCopiedPin] = useState(false);

  // Change Master PIN Form state
  const [currentPinInput, setCurrentPinInput] = useState("");
  const [newPinInput, setNewPinInput] = useState("");
  const [confirmPinInput, setConfirmPinInput] = useState("");
  const [isPinSaving, setIsPinSaving] = useState(false);
  const [pinSuccess, setPinSuccess] = useState<string | null>(null);
  const [pinError, setPinError] = useState<string | null>(null);

  // Active Sessions state
  const [adminSessions, setAdminSessions] = useState<SessionItem[]>([]);
  const [studentSessions, setStudentSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [studentSearch, setStudentSearch] = useState("");
  const [sessionActionMsg, setSessionActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Master PIN Confirmation State (Both Inline and Modal)
  const [isPinModalOpen, setIsPinModalOpen] = useState(false);
  const [pendingKickAction, setPendingKickAction] = useState<{
    type: 'single' | 'all';
    sessionId?: string;
    userName?: string;
  } | null>(null);
  const [isModalProcessing, setIsModalProcessing] = useState(false);
  const [modalErrorMessage, setModalErrorMessage] = useState<string | null>(null);
  const [kickingSessionId, setKickingSessionId] = useState<string | null>(null);

  // Direct Inline PIN verification state
  const [confirmingSessionId, setConfirmingSessionId] = useState<string | null>(null);
  const [isKickAllConfirming, setIsKickAllConfirming] = useState(false);
  const [inlinePinInput, setInlinePinInput] = useState("K1234");
  const [inlinePinError, setInlinePinError] = useState<string | null>(null);

  // Fetch initial data and setup auto-refresh
  useEffect(() => {
    fetchCurrentPassword();
    fetchMasterPin();
    fetchSessions();

    const interval = setInterval(() => {
      fetchSessions();
    }, 8000);

    const onFocus = () => {
      fetchSessions();
      fetchMasterPin();
    };

    window.addEventListener("focus", onFocus);
    return () => {
      clearInterval(interval);
      window.removeEventListener("focus", onFocus);
    };
  }, []);

  const fetchCurrentPassword = async () => {
    setLoadingPassword(true);
    try {
      const res = await fetch(`/api/admin/change-password?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setSavedPassword(data.password || null);
      }
    } catch {
    } finally {
      setLoadingPassword(false);
    }
  };

  const fetchMasterPin = async () => {
    setLoadingMasterPin(true);
    try {
      const res = await fetch(`/api/admin/master-pin?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setMasterPin(data.masterPin || "K1234");
      }
    } catch {
      setMasterPin("K1234");
    } finally {
      setLoadingMasterPin(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch(`/api/admin/sessions?_t=${Date.now()}`, {
        cache: "no-store",
        headers: { "Cache-Control": "no-cache" },
      });
      if (res.ok) {
        const data = await res.json();
        setAdminSessions(data.adminSessions || []);
        setStudentSessions(data.studentSessions || []);
      }
    } catch (err) {
      console.error("Fetch sessions error:", err);
    } finally {
      setLoadingSessions(false);
    }
  };

  const handleCopyPassword = async () => {
    if (!savedPassword) return;
    try {
      await navigator.clipboard.writeText(savedPassword);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {}
  };

  const handleCopyPin = async () => {
    if (!masterPin) return;
    try {
      await navigator.clipboard.writeText(masterPin);
      setCopiedPin(true);
      setTimeout(() => setCopiedPin(false), 2000);
    } catch {}
  };

  // Trigger inline kick confirmation on a single device
  const requestKickSingle = (sessionId: string, userName?: string) => {
    setConfirmingSessionId(sessionId);
    setIsKickAllConfirming(false);
    setInlinePinInput(masterPin || "K1234");
    setInlinePinError(null);
  };

  // Trigger inline kick all other devices confirmation
  const requestKickAllOthers = () => {
    setIsKickAllConfirming(true);
    setConfirmingSessionId(null);
    setInlinePinInput(masterPin || "K1234");
    setInlinePinError(null);
  };

  // Direct Inline Kick Executor
  const handleDirectKick = async (targetSessionId?: string, isAll: boolean = false) => {
    const pin = inlinePinInput.trim();
    if (!pin) {
      setInlinePinError("กรุณากรอกรหัส Master PIN");
      return;
    }

    setIsModalProcessing(true);
    setInlinePinError(null);
    setSessionActionMsg(null);
    if (targetSessionId) {
      setKickingSessionId(targetSessionId);
    }

    try {
      const payload: any = { masterPin: pin };
      if (isAll) {
        payload.allOthers = true;
      } else {
        payload.sessionId = targetSessionId;
      }

      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        cache: "no-store",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setInlinePinError(data.error || "รหัส Master PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ K1234)");
      } else {
        setConfirmingSessionId(null);
        setIsKickAllConfirming(false);
        setSessionActionMsg({
          type: 'success',
          text: data.message || "เตะอุปกรณ์ออกจากระบบเรียบร้อยแล้ว",
        });
        await fetchSessions();
      }
    } catch (err) {
      setInlinePinError("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsModalProcessing(false);
      setKickingSessionId(null);
    }
  };

  // Confirm kick with Master PIN (for modal if used)
  const handleConfirmKickWithPin = async (enteredPin: string) => {
    if (!pendingKickAction) return;

    setIsModalProcessing(true);
    setModalErrorMessage(null);
    setSessionActionMsg(null);
    if (pendingKickAction.sessionId) {
      setKickingSessionId(pendingKickAction.sessionId);
    }

    try {
      const payload: any = { masterPin: enteredPin };
      if (pendingKickAction.type === 'all') {
        payload.allOthers = true;
      } else {
        payload.sessionId = pendingKickAction.sessionId;
      }

      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        cache: "no-store",
        headers: { 
          "Content-Type": "application/json",
          "Cache-Control": "no-cache"
        },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (!res.ok) {
        setModalErrorMessage(data.error || "รหัส Master PIN ไม่ถูกต้อง (ค่าเริ่มต้นคือ K1234)");
      } else {
        setIsPinModalOpen(false);
        setPendingKickAction(null);
        setSessionActionMsg({
          type: 'success',
          text: data.message || "เตะอุปกรณ์ออกจากระบบเรียบร้อยแล้ว",
        });
        await fetchSessions();
      }
    } catch (err) {
      setModalErrorMessage("เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsModalProcessing(false);
      setKickingSessionId(null);
    }
  };

  // Handle Changing Master PIN
  const handleChangeMasterPin = async (e: React.FormEvent) => {
    e.preventDefault();
    setPinError(null);
    setPinSuccess(null);

    if (!currentPinInput || !newPinInput || !confirmPinInput) {
      setPinError("กรุณากรอกข้อมูลให้ครบทุกช่อง");
      return;
    }

    if (newPinInput !== confirmPinInput) {
      setPinError("รหัส Master PIN ใหม่และการยืนยันไม่ตรงกัน");
      return;
    }

    if (newPinInput.length < 4) {
      setPinError("รหัส Master PIN ต้องมีความยาวอย่างน้อย 4 ตัวอักษร");
      return;
    }

    setIsPinSaving(true);

    try {
      const res = await fetch("/api/admin/master-pin", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          currentPin: currentPinInput,
          newPin: newPinInput,
        }),
      });

      const data = await res.json();

      if (!res.ok) {
        setPinError(data.error || "เกิดข้อผิดพลาดในการเปลี่ยน Master PIN");
      } else {
        setPinSuccess("เปลี่ยนรหัส Master PIN สำเร็จแล้ว");
        setCurrentPinInput("");
        setNewPinInput("");
        setConfirmPinInput("");
        setMasterPin(newPinInput);
        fetchMasterPin();
      }
    } catch {
      setPinError("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้");
    } finally {
      setIsPinSaving(false);
    }
  };

  // Format relative time helper
  const formatTimeAgo = (dateStr: string | null) => {
    if (!dateStr) return "ไม่ระบุเวลา";
    try {
      const date = new Date(dateStr);
      const diffMs = Date.now() - date.getTime();
      const diffSec = Math.floor(diffMs / 1000);
      if (diffSec < 60) return "เมื่อสักครู่";
      const diffMin = Math.floor(diffSec / 60);
      if (diffMin < 60) return `${diffMin} นาทีที่แล้ว`;
      const diffHours = Math.floor(diffMin / 60);
      if (diffHours < 24) return `${diffHours} ชั่วโมงที่แล้ว`;
      const diffDays = Math.floor(diffHours / 24);
      return `${diffDays} วันที่แล้ว`;
    } catch {
      return dateStr;
    }
  };

  const getDeviceIcon = (deviceType: string | null) => {
    if (deviceType === 'mobile') return <Smartphone className="w-5 h-5 text-indigo-500" />;
    if (deviceType === 'tablet') return <Tablet className="w-5 h-5 text-purple-500" />;
    return <Laptop className="w-5 h-5 text-blue-500" />;
  };

  // Filter student sessions
  const filteredStudentSessions = studentSessions.filter((s) => {
    if (!studentSearch.trim()) return true;
    const term = studentSearch.toLowerCase();
    return (
      s.userId.toLowerCase().includes(term) ||
      s.userName.toLowerCase().includes(term) ||
      (s.ipAddress && s.ipAddress.includes(term)) ||
      (s.browser && s.browser.toLowerCase().includes(term)) ||
      (s.os && s.os.toLowerCase().includes(term))
    );
  });

  // Password validation rules
  const rules = [
    {
      label: "ความยาวอย่างน้อย 6 ตัวอักษร",
      pass: newPassword.length >= 6,
    },
    {
      label: "มีตัวอักษรพิมพ์เล็ก (a-z) อย่างน้อย 1 ตัว",
      pass: /[a-z]/.test(newPassword),
    },
    {
      label: "มีตัวอักษรพิมพ์ใหญ่ (A-Z) หรือ ตัวเลข (0-9) หรือ อักขระพิเศษ (@#$...)",
      pass: /[A-Z0-9!@#$%^&*()_+\-=[\]{};':"\\|,.<>/?]/.test(newPassword),
    },
  ];

  const allRulesPass = newPassword.length > 0 && rules.every((r) => r.pass);
  const isMatching = newPassword === confirmPassword && confirmPassword.length > 0;
  const isFormValid = currentPassword.length > 0 && allRulesPass && isMatching;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setSuccessMessage(null);

    if (!currentPassword) {
      setErrorMessage("กรุณาระบุรหัสผ่านปัจจุบัน");
      return;
    }

    if (!allRulesPass) {
      setErrorMessage("รหัสผ่านใหม่ยังไม่ผ่านเงื่อนไขทั้งหมด ดูรายละเอียดด้านล่าง");
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
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ currentPassword, newPassword }),
      });

      const data = await res.json();

      if (!res.ok) {
        setErrorMessage(data.error || "เกิดข้อผิดพลาดในการเปลี่ยนรหัสผ่าน");
      } else {
        setSuccessMessage(data.message || "เปลี่ยนรหัสผ่านผู้ดูแลระบบสำเร็จแล้ว");
        setCurrentPassword("");
        setNewPassword("");
        setConfirmPassword("");
        setSavedPassword(null);
        fetchCurrentPassword();
      }
    } catch (err) {
      console.error("Change password error:", err);
      setErrorMessage("ไม่สามารถเชื่อมต่อเซิร์ฟเวอร์ได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-4xl mx-auto pb-12">
      {/* Master PIN Confirmation Modal */}
      <MasterPinConfirmModal
        isOpen={isPinModalOpen}
        onClose={() => {
          setIsPinModalOpen(false);
          setPendingKickAction(null);
          setModalErrorMessage(null);
        }}
        onConfirm={handleConfirmKickWithPin}
        isLoading={isModalProcessing}
        errorMessage={modalErrorMessage}
        title={pendingKickAction?.type === 'all' ? "ยืนยันเตะอุปกรณ์อื่นทั้งหมด" : `ยืนยันเตะอุปกรณ์: ${pendingKickAction?.userName || 'เซสชัน'}`}
        description="กรุณากรอกรหัส Master Security PIN (เช่น K1234) เพื่อยืนยันสิทธิ์แอดมินหลักก่อนทำรายการเตะอุปกรณ์"
      />

      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-kanit text-gray-950 flex items-center gap-2">
              <span>ศูนย์ความปลอดภัย & จัดการอุปกรณ์แอดมิน</span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Master Security Center
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              ป้องกันการแฮ็ก สั่งเตะอุปกรณ์แปลกปลอมแบบ LINE พร้อมรหัสยืนยันแอดมินหลัก (Master PIN: K1234)
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 1: MASTER ADMIN PIN MANAGEMENT CARD ===== */}
      {/* ============================================================ */}
      <div className="bg-gradient-to-br from-amber-50/80 via-orange-50/40 to-white rounded-3xl p-6 sm:p-8 border border-amber-200 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-amber-200/70">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-md shadow-amber-500/20 shrink-0">
              <Fingerprint className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 font-kanit">
                  รหัสยืนยันแอดมินหลัก (Master Security PIN)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-amber-200 text-amber-950 text-[10px] font-extrabold">
                  สิทธิ์สูงสุด (Super Admin)
                </span>
              </div>
              <p className="text-xs text-amber-900/80">
                รหัสนี้ใช้ยืนยันก่อนสั่งเตะอุปกรณ์ทุกครั้ง เพื่อป้องกันไม่ให้ผู้อื่นที่รู้แค่รหัสผ่านเข้าเว็บมาเตะแอดมินหลักได้
              </p>
            </div>
          </div>
        </div>

        {/* Current Master PIN Display */}
        <div className="bg-white/90 backdrop-blur-xs rounded-2xl border border-amber-200/90 p-4 sm:p-5 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5 text-amber-500" />
              <span>รหัส Master PIN ปัจจุบันของคุณ:</span>
            </span>
            <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-md font-semibold">
              ค่าเริ่มต้นระบบ: K1234
            </span>
          </div>

          <div className="flex items-center gap-2 bg-amber-50/50 rounded-xl border border-amber-200 px-4 py-3">
            {loadingMasterPin ? (
              <div className="flex items-center gap-2 text-xs text-gray-400">
                <div className="w-3.5 h-3.5 border-2 border-amber-400 border-t-transparent rounded-full animate-spin" />
                กำลังโหลด PIN...
              </div>
            ) : (
              <>
                <span className="flex-1 font-mono text-base font-extrabold text-amber-950 tracking-widest select-all">
                  {showMasterPin ? masterPin || "K1234" : "••••••••"}
                </span>
                <button
                  type="button"
                  onClick={() => setShowMasterPin(!showMasterPin)}
                  className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                  title={showMasterPin ? "ซ่อน PIN" : "แสดง PIN"}
                >
                  {showMasterPin ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
                <button
                  type="button"
                  onClick={handleCopyPin}
                  className="p-1.5 rounded-lg text-amber-700 hover:text-amber-900 hover:bg-amber-100 transition-colors cursor-pointer"
                  title="คัดลอก PIN"
                >
                  {copiedPin ? <Check className="w-4 h-4 text-emerald-600 stroke-[3]" /> : <Copy className="w-4 h-4" />}
                </button>
              </>
            )}
          </div>
        </div>

        {/* Change Master PIN Form Toggle / Form */}
        <div className="pt-1">
          <details className="group">
            <summary className="text-xs font-bold text-amber-900 hover:text-amber-950 cursor-pointer flex items-center justify-between select-none py-1">
              <span>ต้องการเปลี่ยนรหัส Master PIN ใหม่? (คลิกเพื่อแก้ไข)</span>
              <span className="text-[11px] text-amber-700 group-open:rotate-180 transition-transform">▼</span>
            </summary>

            <form onSubmit={handleChangeMasterPin} className="mt-4 bg-white rounded-2xl border border-amber-200/80 p-5 space-y-4">
              {pinSuccess && (
                <div className="p-3 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>{pinSuccess}</span>
                </div>
              )}
              {pinError && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-900 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
                  <span>{pinError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Master PIN ปัจจุบัน</label>
                  <input
                    type="password"
                    required
                    value={currentPinInput}
                    onChange={(e) => setCurrentPinInput(e.target.value)}
                    placeholder="รหัสเดิม เช่น K1234"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">Master PIN ใหม่</label>
                  <input
                    type="text"
                    required
                    value={newPinInput}
                    onChange={(e) => setNewPinInput(e.target.value)}
                    placeholder="กำหนดรหัสใหม่ (4-20 ตัว)"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 text-xs font-mono font-bold outline-none"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-[11px] font-bold text-gray-700">ยืนยัน PIN ใหม่</label>
                  <input
                    type="text"
                    required
                    value={confirmPinInput}
                    onChange={(e) => setConfirmPinInput(e.target.value)}
                    placeholder="พิมพ์รหัสใหม่อีกครั้ง"
                    className="w-full h-10 px-3 rounded-xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-amber-500 text-xs font-mono font-bold outline-none"
                  />
                </div>
              </div>

              <div className="flex justify-end pt-1">
                <Button
                  type="submit"
                  disabled={isPinSaving || !currentPinInput || !newPinInput || !confirmPinInput}
                  className="h-9 px-4 rounded-xl text-xs font-bold bg-amber-600 hover:bg-amber-700 text-white cursor-pointer transition-all"
                >
                  {isPinSaving ? "กำลังบันทึก..." : "บันทึก Master PIN ใหม่"}
                </Button>
              </div>
            </form>
          </details>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 2: ACTIVE ADMIN SESSIONS / DEVICES ===== */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/10 text-blue-600 flex items-center justify-center shrink-0">
              <Laptop className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 font-kanit">
                  อุปกรณ์ที่เข้าสู่ระบบแอดมิน (Active Admin Devices)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-blue-100 text-blue-800 text-[11px] font-bold">
                  {adminSessions.length} อุปกรณ์
                </span>
              </div>
              <p className="text-xs text-gray-500">
                สั่งเตะอุปกรณ์แปลกปลอมได้ทันที โดยระบบจะถาม <strong>Master PIN (K1234)</strong> เพื่อยืนยันสิทธิ์แอดมินหลัก
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={fetchSessions}
              disabled={loadingSessions}
              className="rounded-xl text-xs h-9 px-3 border-gray-200 text-gray-600 hover:bg-gray-50 cursor-pointer"
            >
              <RefreshCw className={`w-3.5 h-3.5 mr-1.5 ${loadingSessions ? 'animate-spin' : ''}`} />
              รีเฟรช
            </Button>

            {adminSessions.length > 1 && (
              <Button
                type="button"
                variant="destructive"
                size="sm"
                onClick={requestKickAllOthers}
                className="rounded-xl text-xs h-9 px-3 bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                เตะอุปกรณ์อื่นทั้งหมด
              </Button>
            )}
          </div>
        </div>

        {/* Kick All Others Inline Confirmation Bar */}
        {isKickAllConfirming && (
          <div className="p-4 rounded-2xl bg-gradient-to-r from-red-50 to-amber-50 border-2 border-red-300 flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150 shadow-xs">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-xl bg-red-500 text-white flex items-center justify-center shrink-0">
                <ShieldAlert className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-bold text-red-950">ยืนยันเตะอุปกรณ์แอดมินอื่นทั้งหมดออกจากระบบ</p>
                <p className="text-[11px] text-red-800">
                  กรุณากรอกรหัส Master PIN (ค่าเริ่มต้น: <strong className="font-mono bg-red-100 px-1 py-0.5 rounded">K1234</strong>)
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2 flex-wrap">
              <input
                type="text"
                autoFocus
                value={inlinePinInput}
                onChange={(e) => setInlinePinInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') handleDirectKick(undefined, true);
                  if (e.key === 'Escape') setIsKickAllConfirming(false);
                }}
                placeholder="รหัส เช่น K1234"
                className="h-9 px-3 w-36 rounded-xl border-2 border-red-400 bg-white text-xs font-mono font-bold text-gray-900 outline-none focus:border-red-600 focus:ring-2 focus:ring-red-300"
              />
              <Button
                type="button"
                size="sm"
                disabled={isModalProcessing || !inlinePinInput.trim()}
                onClick={() => handleDirectKick(undefined, true)}
                className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold cursor-pointer shadow-xs"
              >
                {isModalProcessing ? "กำลังเตะ..." : "ยืนยันเตะทั้งหมด"}
              </Button>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => { setIsKickAllConfirming(false); setInlinePinError(null); }}
                className="h-9 px-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 text-xs cursor-pointer"
              >
                ยกเลิก
              </Button>
            </div>
            {inlinePinError && (
              <div className="w-full text-xs text-red-600 font-semibold bg-white/80 p-2 rounded-lg border border-red-200">
                ⚠️ {inlinePinError}
              </div>
            )}
          </div>
        )}

        {/* Action feedback message */}
        {sessionActionMsg && (
          <div className={`p-3.5 rounded-2xl text-xs flex items-center gap-2.5 ${
            sessionActionMsg.type === 'success' 
              ? 'bg-emerald-50 border border-emerald-200 text-emerald-900' 
              : 'bg-red-50 border border-red-200 text-red-900'
          }`}>
            {sessionActionMsg.type === 'success' ? (
              <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
            ) : (
              <AlertTriangle className="w-4 h-4 text-red-600 shrink-0" />
            )}
            <span>{sessionActionMsg.text}</span>
          </div>
        )}

        {/* Admin Sessions List */}
        {loadingSessions ? (
          <div className="py-12 flex flex-col items-center justify-center text-gray-400 gap-2">
            <div className="w-6 h-6 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
            <span className="text-xs">กำลังตรวจสอบอุปกรณ์ที่เชื่อมต่อ...</span>
          </div>
        ) : adminSessions.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ไม่พบประวัติเซสชันแอดมินที่บันทึกไว้ในระบบ
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {adminSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col justify-between gap-3 ${
                  session.isCurrent
                    ? 'bg-emerald-50/50 border-emerald-200/90 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start sm:items-center gap-3.5">
                    <div className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 shadow-xs ${
                      session.isCurrent ? 'bg-emerald-100 text-emerald-700' : 'bg-white text-gray-600 border border-gray-200/80'
                    }`}>
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div className="space-y-1 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 font-kanit">
                          {session.os || 'อุปกรณ์ไม่ระบุ'} • {session.browser || 'เบราว์เซอร์'}
                        </span>
                        {session.isCurrent ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-emerald-500 text-white shadow-xs">
                            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse" />
                            อุปกรณ์นี้ (กำลังใช้งาน)
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-medium bg-gray-200 text-gray-700">
                            อุปกรณ์อื่น
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-[11px] text-gray-500 flex-wrap">
                        <span className="flex items-center gap-1 font-mono">
                          <Globe className="w-3 h-3 text-gray-400" />
                          {session.ipAddress || 'IP ไม่ระบุ'}
                        </span>
                        <span className="flex items-center gap-1">
                          <MapPin className="w-3 h-3 text-gray-400" />
                          {session.location || 'Localhost / ประเทศไทย'}
                        </span>
                        <span className="flex items-center gap-1 text-gray-400">
                          <Clock className="w-3 h-3" />
                          เข้าสู่ระบบ: {formatTimeAgo(session.createdAt)}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2 self-end sm:self-center shrink-0">
                    {session.isCurrent ? (
                      <span className="text-[11px] font-medium text-emerald-700 px-3 py-1.5 rounded-xl bg-emerald-100/80 border border-emerald-200">
                        เซสชันปัจจุบัน
                      </span>
                    ) : confirmingSessionId === session.id ? (
                      <span className="text-xs font-bold text-amber-700 bg-amber-100 px-3 py-1 rounded-xl animate-pulse">
                        กำลังรอยืนยัน PIN ด้านล่าง ▼
                      </span>
                    ) : (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        disabled={isModalProcessing || kickingSessionId === session.id}
                        onClick={() => requestKickSingle(session.id, `${session.os || 'อุปกรณ์'} (${session.ipAddress || 'IP'})`)}
                        className="rounded-xl text-xs h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer disabled:opacity-50 font-bold"
                      >
                        {kickingSessionId === session.id ? (
                          <>
                            <div className="w-3.5 h-3.5 mr-1.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                            กำลังเตะออก...
                          </>
                        ) : (
                          <>
                            <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                            เตะออกจากระบบ
                          </>
                        )}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Inline Master PIN Confirmation Box for this device */}
                {confirmingSessionId === session.id && (
                  <div className="w-full pt-3 mt-2 border-t border-amber-200/80 bg-amber-50/90 -mx-4 -mb-4 p-4 rounded-b-2xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 animate-in fade-in duration-150">
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-xl bg-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-amber-950">
                          กรอกรหัสยืนยันแอดมินหลัก (Master PIN) เพื่อเตะอุปกรณ์นี้
                        </p>
                        <p className="text-[11px] text-amber-800">
                          รหัสยืนยันเริ่มต้นคือ <strong className="font-mono bg-amber-200/80 px-1 py-0.5 rounded text-amber-950">K1234</strong>
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 flex-wrap">
                      <input
                        type="text"
                        autoFocus
                        value={inlinePinInput}
                        onChange={(e) => setInlinePinInput(e.target.value)}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter') handleDirectKick(session.id);
                          if (e.key === 'Escape') { setConfirmingSessionId(null); setInlinePinError(null); }
                        }}
                        placeholder="กรอก PIN เช่น K1234"
                        className="h-9 px-3 w-36 rounded-xl border-2 border-amber-400 bg-white text-xs font-mono font-extrabold text-gray-900 outline-none focus:border-amber-600 focus:ring-2 focus:ring-amber-300 shadow-xs"
                      />
                      <Button
                        type="button"
                        size="sm"
                        disabled={isModalProcessing || !inlinePinInput.trim()}
                        onClick={() => handleDirectKick(session.id)}
                        className="h-9 px-4 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-bold shadow-xs cursor-pointer"
                      >
                        {isModalProcessing && kickingSessionId === session.id ? "กำลังเตะ..." : "ยืนยันเตะออก"}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={() => { setConfirmingSessionId(null); setInlinePinError(null); }}
                        className="h-9 px-3 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-100 text-xs cursor-pointer"
                      >
                        ยกเลิก
                      </Button>
                    </div>
                    {inlinePinError && (
                      <div className="w-full text-xs text-red-600 font-semibold bg-white p-2 rounded-lg border border-red-200">
                        ⚠️ {inlinePinError}
                      </div>
                    )}
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 3: STUDENT ACTIVE LOGINS MONITOR ===== */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-purple-500/10 text-purple-600 flex items-center justify-center shrink-0">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-gray-950 font-kanit">
                  ตรวจสอบการเข้าใช้งานของนักเรียน (Student Logins & Anti-Hack)
                </h3>
                <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-800 text-[11px] font-bold">
                  {studentSessions.length} เซสชัน
                </span>
              </div>
              <p className="text-xs text-gray-500">
                สอดส่องและตรวจจับกรณีนักเรียนถูกแอบล็อกอินซ้อน หรือมีการใช้งานผิดปกติ
              </p>
            </div>
          </div>

          <div className="w-full sm:w-64 relative">
            <input
              type="text"
              value={studentSearch}
              onChange={(e) => setStudentSearch(e.target.value)}
              placeholder="ค้นหา รหัส / ชื่อ / IP..."
              className="w-full h-9 pl-8 pr-3 rounded-xl border border-gray-200 bg-gray-50/80 focus:bg-white focus:border-purple-500 text-xs font-medium outline-none transition-all"
            />
            <Search className="w-3.5 h-3.5 text-gray-400 absolute left-2.5 top-1/2 -translate-y-1/2" />
          </div>
        </div>

        {studentSessions.length === 0 ? (
          <div className="py-8 text-center text-gray-400 text-xs bg-slate-50 rounded-2xl border border-dashed border-slate-200">
            ยังไม่มีเซสชันนักเรียนที่ล็อกอินอยู่ในขณะนี้
          </div>
        ) : filteredStudentSessions.length === 0 ? (
          <div className="py-6 text-center text-gray-400 text-xs">
            ไม่พบเซสชันนักเรียนที่ตรงกับคำค้นหา "{studentSearch}"
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[380px] overflow-y-auto pr-1">
            {filteredStudentSessions.map((session) => (
              <div
                key={session.id}
                className="p-3.5 rounded-2xl border border-gray-200 bg-slate-50/60 hover:bg-white hover:border-purple-200 transition-all flex flex-col justify-between gap-2 shadow-2xs"
              >
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-3 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-white border border-gray-200 flex items-center justify-center shrink-0">
                      {getDeviceIcon(session.deviceType)}
                    </div>
                    <div className="min-w-0 space-y-0.5">
                      <div className="flex items-center gap-1.5 truncate">
                        <span className="font-mono text-xs font-bold text-purple-700 bg-purple-50 px-1.5 py-0.5 rounded">
                          {session.userId}
                        </span>
                        <span className="text-xs font-bold text-gray-800 truncate">
                          {session.userName || 'นักเรียน'}
                        </span>
                      </div>
                      <div className="text-[10px] text-gray-500 truncate flex items-center gap-1.5">
                        <span>{session.os}</span>
                        <span>•</span>
                        <span>{session.browser}</span>
                        <span>•</span>
                        <span className="font-mono text-gray-400">{session.ipAddress}</span>
                      </div>
                    </div>
                  </div>

                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={isModalProcessing || kickingSessionId === session.id}
                    onClick={() => requestKickSingle(session.id, `${session.userName || 'นักเรียน'} (${session.userId})`)}
                    className="h-8 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer disabled:opacity-50"
                    title="เตะนักเรียนออกจากระบบ"
                  >
                    {kickingSessionId === session.id ? (
                      <div className="w-3.5 h-3.5 border-2 border-red-500 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <>
                        <LogOut className="w-3.5 h-3.5 mr-1" />
                        เตะออก
                      </>
                    )}
                  </Button>
                </div>

                {/* Inline Student Kick Confirm */}
                {confirmingSessionId === session.id && (
                  <div className="pt-2 border-t border-amber-200 flex items-center gap-2 flex-wrap animate-in fade-in duration-150">
                    <input
                      type="text"
                      autoFocus
                      value={inlinePinInput}
                      onChange={(e) => setInlinePinInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') handleDirectKick(session.id);
                        if (e.key === 'Escape') setConfirmingSessionId(null);
                      }}
                      placeholder="PIN: K1234"
                      className="h-7 px-2 w-24 rounded border border-amber-400 text-xs font-mono font-bold outline-none"
                    />
                    <Button
                      type="button"
                      size="sm"
                      onClick={() => handleDirectKick(session.id)}
                      className="h-7 px-2 text-[11px] bg-red-600 hover:bg-red-700 text-white rounded font-bold"
                    >
                      เตะออก
                    </Button>
                    <Button
                      type="button"
                      variant="ghost"
                      size="sm"
                      onClick={() => setConfirmingSessionId(null)}
                      className="h-7 px-1.5 text-[11px] text-gray-500"
                    >
                      ✕
                    </Button>
                  </div>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 4: CURRENT ADMIN PASSWORD DISPLAY ===== */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">รหัสผ่านปัจจุบันของระบบ (Admin Password)</h3>
            <p className="text-[11px] text-gray-400">คลิกไอคอนตาเพื่อดูรหัสผ่าน หรือคัดลอก</p>
          </div>
        </div>

        <div className="flex items-center gap-2 bg-slate-50 rounded-xl border border-slate-200 px-4 py-3">
          {loadingPassword ? (
            <div className="flex items-center gap-2 text-sm text-gray-400">
              <div className="w-4 h-4 border-2 border-gray-300 border-t-transparent rounded-full animate-spin" />
              กำลังโหลด...
            </div>
          ) : (
            <>
              <span className="flex-1 font-mono text-base font-bold text-gray-800 tracking-wider select-all">
                {showSavedPassword ? savedPassword || "admin@wt" : "••••••••••"}
              </span>
              <button
                type="button"
                onClick={() => setShowSavedPassword(!showSavedPassword)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title={showSavedPassword ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน"}
              >
                {showSavedPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
              </button>
              <button
                type="button"
                onClick={handleCopyPassword}
                className="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition-colors cursor-pointer"
                title="คัดลอกรหัสผ่าน"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 5: CHANGE ADMIN PASSWORD FORM ===== */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-xs space-y-6">
        <div className="flex items-center gap-3 pb-3 border-b border-gray-100">
          <div className="w-10 h-10 rounded-2xl bg-amber-500/10 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-gray-950 font-kanit">เปลี่ยนรหัสผ่านผู้ดูแลระบบ</h3>
            <p className="text-xs text-gray-500">กำหนดรหัสผ่านใหม่สำหรับเข้าสู่ระบบหลังบ้าน</p>
          </div>
        </div>

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
                (ดูรหัสปัจจุบันได้จากกล่องด้านบน)
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
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5" htmlFor="newPassword">
                <KeyRound className="w-3.5 h-3.5 text-amber-500" />
                <span>รหัสผ่านใหม่ <span className="text-red-500">*</span></span>
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

          {/* ===== PASSWORD RULES CHECKLIST ===== */}
          {newPassword.length > 0 && (
            <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2 animate-in fade-in duration-200">
              <p className="text-xs font-bold text-gray-700 mb-2">เงื่อนไขรหัสผ่าน:</p>
              {rules.map((rule, i) => (
                <div key={i} className="flex items-center gap-2">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center shrink-0 ${
                    rule.pass 
                      ? "bg-emerald-500 text-white" 
                      : "bg-gray-200 text-gray-400"
                  }`}>
                    {rule.pass ? <Check className="w-3 h-3 stroke-[3]" /> : <span className="text-[10px] font-bold">✕</span>}
                  </div>
                  <span className={`text-xs ${rule.pass ? "text-emerald-700 font-semibold" : "text-gray-500"}`}>
                    {rule.label}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* Security Notice Box */}
          <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200 text-amber-950 text-xs space-y-2">
            <div className="flex items-center gap-2 font-bold text-amber-900">
              <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
              <span>ข้อควรทราบด้านความปลอดภัย</span>
            </div>
            <ul className="text-[11px] text-amber-900/90 space-y-1 list-disc list-inside leading-relaxed">
              <li>รหัสผ่านผู้ดูแลระบบมีอำนาจในการจัดการเว็บไซต์ ห้องเรียน คะแนนสอบ และข้อมูลนักเรียนทั้งหมด</li>
              <li>การสั่งเตะอุปกรณ์ออกจากระบบ หรือการเปลี่ยนการตั้งค่าความปลอดภัยระดับสูง ต้องใช้รหัสยืนยันแอดมินหลัก (Master PIN: K1234) ทุกครั้ง</li>
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
