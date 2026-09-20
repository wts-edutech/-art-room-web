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
  Radio,
  Search,
  Activity,
  Shield,
  AlertOctagon
} from "lucide-react";
import { Button } from "@/components/ui/button";

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
  // Form state
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

  // Active Sessions state
  const [adminSessions, setAdminSessions] = useState<SessionItem[]>([]);
  const [studentSessions, setStudentSessions] = useState<SessionItem[]>([]);
  const [loadingSessions, setLoadingSessions] = useState(true);
  const [kickingId, setKickingId] = useState<string | null>(null);
  const [kickingAllOthers, setKickingAllOthers] = useState(false);
  const [studentSearch, setStudentSearch] = useState("");
  const [sessionActionMsg, setSessionActionMsg] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  // Fetch current password and sessions on mount
  useEffect(() => {
    fetchCurrentPassword();
    fetchSessions();
  }, []);

  const fetchCurrentPassword = async () => {
    setLoadingPassword(true);
    try {
      const res = await fetch("/api/admin/change-password");
      if (res.ok) {
        const data = await res.json();
        setSavedPassword(data.password || null);
      }
    } catch {
      // Silently fail — will show default hint
    } finally {
      setLoadingPassword(false);
    }
  };

  const fetchSessions = async () => {
    setLoadingSessions(true);
    try {
      const res = await fetch("/api/admin/sessions");
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

  // Kick a single session
  const handleKickSession = async (sessionId: string, userName?: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ว่าต้องการเตะอุปกรณ์นี้ (${userName || 'เซสชัน'}) ออกจากระบบ?`)) {
      return;
    }

    setKickingId(sessionId);
    setSessionActionMsg(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ sessionId }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionActionMsg({ type: 'success', text: 'เตะอุปกรณ์ออกจากระบบเรียบร้อยแล้ว' });
        await fetchSessions();
      } else {
        setSessionActionMsg({ type: 'error', text: data.error || 'ไม่สามารถเตะอุปกรณ์ได้' });
      }
    } catch (err) {
      setSessionActionMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อเซิร์ฟเวอร์' });
    } finally {
      setKickingId(null);
    }
  };

  // Kick all other admin sessions
  const handleKickAllOtherAdminSessions = async () => {
    if (!confirm("คุณแน่ใจหรือไม่ว่าต้องการออกจากระบบอุปกรณ์แอดมินอื่นๆ ทั้งหมด ยกเว้นอุปกรณ์นี้?")) {
      return;
    }

    setKickingAllOthers(true);
    setSessionActionMsg(null);
    try {
      const res = await fetch("/api/admin/sessions", {
        method: "DELETE",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ allOthers: true }),
      });
      const data = await res.json();
      if (res.ok) {
        setSessionActionMsg({ type: 'success', text: data.message || 'ออกจากระบบอุปกรณ์แอดมินอื่นทั้งหมดแล้ว' });
        await fetchSessions();
      } else {
        setSessionActionMsg({ type: 'error', text: data.error || 'เกิดข้อผิดพลาด' });
      }
    } catch (err) {
      setSessionActionMsg({ type: 'error', text: 'เกิดข้อผิดพลาดในการเชื่อมต่อ' });
    } finally {
      setKickingAllOthers(false);
    }
  };

  // Helper format relative time
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
        // Refresh the displayed password
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
      {/* Header Card */}
      <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-500 text-white flex items-center justify-center font-bold shadow-md shadow-orange-500/20 shrink-0">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-xl font-bold font-kanit text-gray-950 flex items-center gap-2">
              <span>ศูนย์ความปลอดภัย & จัดการอุปกรณ์</span>
              <span className="text-[11px] font-semibold px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                Security Center
              </span>
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              ตรวจสอบอุปกรณ์ที่ล็อกอินอยู่ ตรวจจับผู้บุกรุก/การแฮ็ก สั่งเตะเซสชันแปลกปลอม และเปลี่ยนรหัสผ่านผู้ดูแลระบบ
            </p>
          </div>
        </div>
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 1: ACTIVE ADMIN SESSIONS / DEVICES ===== */}
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
                หากพบอุปกรณ์แปลกปลอมที่คุณไม่ได้ใช้งาน ให้กด <strong>"เตะออกจากระบบ"</strong> ทันที
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
                onClick={handleKickAllOtherAdminSessions}
                disabled={kickingAllOthers}
                className="rounded-xl text-xs h-9 px-3 bg-red-600 hover:bg-red-700 text-white shadow-xs cursor-pointer"
              >
                <LogOut className="w-3.5 h-3.5 mr-1.5" />
                {kickingAllOthers ? "กำลังเตะ..." : "เตะอุปกรณ์อื่นทั้งหมด"}
              </Button>
            )}
          </div>
        </div>

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
            ไม่พบประวัติเซสชันแอดมินที่บันทึกไว้ในระบบ (เข้าใช้งานผ่านเซสชันชั่วคราว)
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-3">
            {adminSessions.map((session) => (
              <div
                key={session.id}
                className={`p-4 rounded-2xl border transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4 ${
                  session.isCurrent
                    ? 'bg-emerald-50/50 border-emerald-200/90 shadow-xs'
                    : 'bg-slate-50/70 border-slate-200 hover:bg-slate-50'
                }`}
              >
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
                  ) : (
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => handleKickSession(session.id, `${session.os} (${session.ipAddress})`)}
                      disabled={kickingId === session.id}
                      className="rounded-xl text-xs h-9 px-3 border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5 mr-1.5" />
                      {kickingId === session.id ? "กำลังเตะ..." : "เตะออกจากระบบ"}
                    </Button>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 2: STUDENT ACTIVE LOGINS MONITOR ===== */}
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
                สอดส่องและตรวจจับกรณีนักเรียนถูกแอบล็อกอินซ้อน หรือมีการใช้งานผิดปกติจาก IP แปลกปลอม
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
                className="p-3.5 rounded-2xl border border-gray-200 bg-slate-50/60 hover:bg-white hover:border-purple-200 transition-all flex items-center justify-between gap-3 shadow-2xs"
              >
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
                  onClick={() => handleKickSession(session.id, `${session.userName} (${session.userId})`)}
                  disabled={kickingId === session.id}
                  className="h-8 px-2 text-[11px] text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg shrink-0 cursor-pointer"
                  title="เตะนักเรียนออกจากระบบ"
                >
                  <LogOut className="w-3.5 h-3.5 mr-1" />
                  {kickingId === session.id ? "..." : "เตะออก"}
                </Button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* ============================================================ */}
      {/* ===== SECTION 3: CURRENT ADMIN PASSWORD DISPLAY ===== */}
      {/* ============================================================ */}
      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 shadow-xs">
        <div className="flex items-center gap-2.5 mb-3">
          <div className="w-8 h-8 rounded-xl bg-blue-100 text-blue-600 flex items-center justify-center shrink-0">
            <Lock className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-gray-900">รหัสผ่านปัจจุบันของระบบ</h3>
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
                {showSavedPassword ? savedPassword || "admin1234" : "••••••••••"}
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
      {/* ===== SECTION 4: CHANGE ADMIN PASSWORD FORM ===== */}
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
              <li>รหัสผ่านผู้ดูแลระบบมีอำนาจสูงสุดในการจัดการเว็บไซต์ ห้องเรียน คะแนนสอบ และข้อมูลนักเรียนทั้งหมด</li>
              <li>ตั้งรหัสผ่านที่มีทั้งตัวอักษรพิมพ์เล็ก พิมพ์ใหญ่ หรือตัวเลข ความยาวรวมอย่างน้อย 6 ตัวอักษร</li>
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
