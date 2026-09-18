"use client";

import { useState, useEffect, useMemo } from "react";
import { 
  Inbox, 
  Search, 
  Filter, 
  FileSpreadsheet, 
  Download, 
  Mail, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  ExternalLink, 
  Eye, 
  RefreshCw, 
  Sparkles, 
  Layers, 
  Palette, 
  HelpCircle, 
  Save, 
  X, 
  ShieldAlert, 
  Send, 
  FileText, 
  Settings2, 
  Sliders, 
  Check, 
  Copy,
  ChevronRight,
  TrendingUp,
  GraduationCap
} from "lucide-react";
import * as XLSX from "xlsx";

interface UnifiedItem {
  id: string;
  type: 'assignment' | 'quiz';
  itemId: string;
  itemTitle: string;
  subjectName: string;
  studentId: string;
  studentName: string;
  studentNumber: number | null;
  classroom: string;
  score: number | null;
  maxScore: number;
  status: string; // 'pending' | 'graded' | 'resubmit' | 'completed'
  isLate: boolean;
  imageUrl: string | null;
  fileUrl: string | null;
  fileName: string | null;
  externalLink: string | null;
  concept: string | null;
  feedback: string | null;
  infractionsCount?: number;
  answers?: any;
  submittedAt: string | null;
  updatedAt: string | null;
}

interface NotificationLog {
  id: string;
  type: string;
  recipient: string;
  subject: string;
  summary: string;
  studentName?: string;
  studentId?: string;
  classroom?: string;
  itemTitle?: string;
  scoreInfo?: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
  timestamp: string;
}

export default function SubmissionsCenterTab() {
  const [items, setItems] = useState<UnifiedItem[]>([]);
  const [stats, setStats] = useState({
    totalItems: 0,
    totalAssignments: 0,
    totalQuizzes: 0,
    pendingGrading: 0,
    gradedCount: 0,
    resubmitCount: 0,
  });
  const [classrooms, setClassrooms] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Filters
  const [typeFilter, setTypeFilter] = useState<'all' | 'assignment' | 'quiz'>('all');
  const [classroomFilter, setClassroomFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Inspection & Grading Modal
  const [inspectItem, setInspectItem] = useState<UnifiedItem | null>(null);
  const [gradingScore, setGradingScore] = useState<string>('');
  const [gradingFeedback, setGradingFeedback] = useState<string>('');
  const [gradingStatus, setGradingStatus] = useState<string>('graded');
  const [isSavingGrade, setIsSavingGrade] = useState<boolean>(false);
  const [lightboxImage, setLightboxImage] = useState<string | null>(null);

  // Email Notification Settings & Outbox Modal
  const [showSettingsModal, setShowSettingsModal] = useState<boolean>(false);
  const [emailSettings, setEmailSettings] = useState<any>({
    teacherEmail: 'krukae.art@wts.ac.th',
    isEmailEnabled: true,
    notifyOnAssignment: true,
    notifyOnQuiz: true,
    provider: 'auto',
    resendApiKey: '',
    webhookUrl: '',
  });
  const [notificationLogs, setNotificationLogs] = useState<NotificationLog[]>([]);
  const [isLoadingSettings, setIsLoadingSettings] = useState<boolean>(false);
  const [isSavingSettings, setIsSavingSettings] = useState<boolean>(false);
  const [isSendingTest, setIsSendingTest] = useState<boolean>(false);
  const [testResult, setTestResult] = useState<{ success: boolean; message: string } | null>(null);

  // Fetch Unified Data
  const fetchData = async () => {
    setIsLoading(true);
    try {
      let url = `/api/submissions/all?type=${typeFilter}&classroom=${encodeURIComponent(classroomFilter)}&status=${statusFilter}`;
      if (searchQuery) url += `&q=${encodeURIComponent(searchQuery)}`;
      const res = await fetch(url);
      const json = await res.json();
      if (json.success && Array.isArray(json.data)) {
        setItems(json.data);
        if (json.stats) setStats(json.stats);
        if (Array.isArray(json.classrooms)) setClassrooms(json.classrooms);
      }
    } catch (e) {
      console.error("Failed to load submissions:", e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [typeFilter, classroomFilter, statusFilter]);

  // Handle Search Debounce or Enter
  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    fetchData();
  };

  // Open Inspection Modal
  const handleOpenInspect = (item: UnifiedItem) => {
    setInspectItem(item);
    setGradingScore(item.score !== null && item.score !== undefined ? String(item.score) : '');
    setGradingFeedback(item.feedback || '');
    setGradingStatus(item.status === 'resubmit' ? 'resubmit' : 'graded');
  };

  // Save Grade
  const handleSaveGrade = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inspectItem || inspectItem.type !== 'assignment') return;

    setIsSavingGrade(true);
    try {
      const res = await fetch('/api/submissions', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: inspectItem.id,
          score: gradingScore,
          feedback: gradingFeedback,
          status: gradingStatus,
        }),
      });

      if (res.ok) {
        // Update item locally
        const parsedScore = gradingScore !== '' ? parseFloat(gradingScore) : null;
        setItems((prev) =>
          prev.map((it) =>
            it.id === inspectItem.id
              ? { ...it, score: parsedScore, feedback: gradingFeedback, status: gradingStatus }
              : it
          )
        );
        setInspectItem(null);
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || 'ไม่สามารถบันทึกคะแนนได้');
      }
    } catch (err) {
      console.error(err);
      alert('เกิดข้อผิดพลาดในการบันทึกคะแนน');
    } finally {
      setIsSavingGrade(false);
    }
  };

  // Load Email Settings & Logs
  const loadEmailSettings = async () => {
    setIsLoadingSettings(true);
    setTestResult(null);
    try {
      const [resSet, resLogs] = await Promise.all([
        fetch('/api/notifications/settings'),
        fetch('/api/notifications?limit=30'),
      ]);
      const dataSet = await resSet.json();
      const dataLogs = await resLogs.json();
      if (dataSet.settings) setEmailSettings(dataSet.settings);
      if (Array.isArray(dataLogs.logs)) setNotificationLogs(dataLogs.logs);
    } catch (e) {
      console.error('Failed to load email settings:', e);
    } finally {
      setIsLoadingSettings(false);
    }
  };

  // Save Email Settings
  const handleSaveEmailSettings = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingSettings(true);
    try {
      const res = await fetch('/api/notifications/settings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(emailSettings),
      });
      const data = await res.json();
      if (data.success) {
        alert('บันทึกการตั้งค่าอีเมลเรียบร้อยแล้ว');
        loadEmailSettings();
      } else {
        alert(data.error || 'เกิดข้อผิดพลาดในการบันทึก');
      }
    } catch (e) {
      console.error(e);
      alert('เกิดข้อผิดพลาดในการบันทึกการตั้งค่า');
    } finally {
      setIsSavingSettings(false);
    }
  };

  // Send Test Email
  const handleSendTestEmail = async () => {
    setIsSendingTest(true);
    setTestResult(null);
    try {
      const res = await fetch('/api/notifications', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: emailSettings.teacherEmail }),
      });
      const data = await res.json();
      if (data.success) {
        setTestResult({
          success: true,
          message: 'ส่งการแจ้งเตือนทดสอบสำเร็จ! ตรวจสอบอีเมลของคุณครูหรือดูกล่องประวัติ Outbox ด้านล่าง',
        });
        // Reload logs
        const resLogs = await fetch('/api/notifications?limit=30');
        const dataLogs = await resLogs.json();
        if (Array.isArray(dataLogs.logs)) setNotificationLogs(dataLogs.logs);
      } else {
        setTestResult({
          success: false,
          message: data.error || 'ไม่สามารถส่งอีเมลทดสอบได้',
        });
      }
    } catch (e: any) {
      setTestResult({
        success: false,
        message: e?.message || 'เกิดข้อผิดพลาดในการเชื่อมต่อส่งอีเมล',
      });
    } finally {
      setIsSendingTest(false);
    }
  };

  // Export to Excel (.xlsx)
  const handleExportExcel = () => {
    if (items.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const exportRows = items.map((item, idx) => ({
      ลำดับ: idx + 1,
      วันเวลาที่ส่ง: item.submittedAt
        ? new Date(item.submittedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })
        : '-',
      รหัสนักเรียน: item.studentId,
      'ชื่อ - นามสกุล': item.studentName,
      ห้องเรียน: item.classroom,
      เลขที่: item.studentNumber || '-',
      ประเภท: item.type === 'assignment' ? 'ชิ้นงานศิลปะ' : 'แบบทดสอบ',
      'หัวข้อ / ชื่องาน': item.itemTitle,
      วิชา: item.subjectName,
      คะแนนที่ได้: item.score !== null && item.score !== undefined ? item.score : 'รอตรวจ',
      คะแนนเต็ม: item.maxScore,
      สถานะ:
        item.status === 'graded'
          ? 'ตรวจแล้ว'
          : item.status === 'resubmit'
          ? 'ส่งซ้ำ'
          : item.status === 'completed'
          ? 'เสร็จสิ้น'
          : 'รอตรวจ',
      การส่ง: item.isLate ? 'ส่งช้า' : 'ตรงเวลา',
      'ข้อเสนอแนะ / สถิติ': item.feedback || item.concept || '-',
      มีไฟล์แนบ: item.imageUrl || item.fileUrl ? 'มี' : 'ไม่มี',
      ลิงก์ภายนอก: item.externalLink || '-',
    }));

    const worksheet = XLSX.utils.json_to_sheet(exportRows);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'สรุปข้อมูลส่งงาน');

    const dateStr = new Date().toISOString().split('T')[0];
    const fileName = `ARTROOM_สรุปข้อมูลการส่งงานและคะแนน_${classroomFilter}_${dateStr}.xlsx`;
    XLSX.writeFile(workbook, fileName);
  };

  // Export to CSV
  const handleExportCSV = () => {
    if (items.length === 0) {
      alert('ไม่มีข้อมูลสำหรับส่งออก');
      return;
    }

    const headers = [
      'ลำดับ',
      'วันเวลาที่ส่ง',
      'รหัสนักเรียน',
      'ชื่อ-นามสกุล',
      'ห้องเรียน',
      'เลขที่',
      'ประเภท',
      'ชื่องาน/แบบทดสอบ',
      'คะแนนที่ได้',
      'คะแนนเต็ม',
      'สถานะ',
      'ข้อเสนอแนะ/หมายเหตุ',
    ];

    const rows = items.map((item, idx) => [
      idx + 1,
      item.submittedAt
        ? `"${new Date(item.submittedAt).toLocaleString('th-TH', { dateStyle: 'short', timeStyle: 'short' })}"`
        : '""',
      `"${item.studentId}"`,
      `"${item.studentName}"`,
      `"${item.classroom}"`,
      `"${item.studentNumber || '-'}"`,
      `"${item.type === 'assignment' ? 'ชิ้นงาน' : 'แบบทดสอบ'}"`,
      `"${item.itemTitle.replace(/"/g, '""')}"`,
      `"${item.score !== null && item.score !== undefined ? item.score : 'รอตรวจ'}"`,
      `"${item.maxScore}"`,
      `"${item.status}"`,
      `"${(item.feedback || item.concept || '').replace(/"/g, '""')}"`,
    ]);

    const csvContent = '\uFEFF' + [headers.join(','), ...rows.map((r) => r.join(','))].join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `ARTROOM_สรุปส่งงาน_${classroomFilter}_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6">
      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5 sm:gap-4">
        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider">ข้อมูลทั้งหมด</span>
            <div className="w-8 h-8 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center">
              <Inbox className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-kanit text-slate-900 mt-2">
            {stats.totalItems.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">ชิ้นงาน & แบบทดสอบสะสม</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-600 uppercase tracking-wider">ชิ้นงานศิลปะ</span>
            <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
              <Palette className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-kanit text-amber-700 mt-2">
            {stats.totalAssignments.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">การบ้านที่ส่งเข้ามา</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/80 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-sky-600 uppercase tracking-wider">แบบทดสอบ</span>
            <div className="w-8 h-8 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center">
              <HelpCircle className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-kanit text-sky-700 mt-2">
            {stats.totalQuizzes.toLocaleString()}
          </p>
          <p className="text-xs text-slate-400 mt-0.5">ผลการสอบ Pre-test</p>
        </div>

        <div className="bg-white rounded-2xl p-4 sm:p-5 border border-amber-200/80 bg-gradient-to-br from-amber-50/40 to-orange-50/20 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-amber-800 uppercase tracking-wider">รอตรวจให้คะแนน</span>
            <div className="w-8 h-8 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <p className="text-2xl sm:text-3xl font-bold font-kanit text-amber-900 mt-2">
            {stats.pendingGrading.toLocaleString()}
          </p>
          <p className="text-xs text-amber-700/80 mt-0.5">ชิ้นงานที่ยังไม่ได้ตรวจ</p>
        </div>

        <div className="col-span-2 lg:col-span-1 bg-white rounded-2xl p-4 sm:p-5 border border-emerald-200/80 bg-gradient-to-br from-emerald-50/40 to-teal-50/20 shadow-2xs flex flex-col justify-between">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-bold text-emerald-800 uppercase tracking-wider">แจ้งเตือนอีเมล</span>
            <button
              onClick={() => {
                setShowSettingsModal(true);
                loadEmailSettings();
              }}
              className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-700 hover:bg-emerald-200 transition-colors flex items-center justify-center"
              title="ตั้งค่าอีเมลและการแจ้งเตือน"
            >
              <Settings2 className="w-4 h-4" />
            </button>
          </div>
          <div>
            <div className="flex items-center gap-1.5 mt-1">
              <span className="inline-block w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse"></span>
              <p className="text-xs font-bold text-emerald-800">ระบบทำงานอัตโนมัติ</p>
            </div>
            <button
              onClick={() => {
                setShowSettingsModal(true);
                loadEmailSettings();
              }}
              className="text-[11px] font-bold text-emerald-700 hover:text-emerald-900 underline mt-1 block"
            >
              ตั้งค่า / ดูประวัติ Outbox →
            </button>
          </div>
        </div>
      </div>

      {/* Control & Filter Center */}
      <div className="bg-white rounded-3xl p-4 sm:p-6 border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          {/* Segmented Type Selector */}
          <div className="flex items-center p-1 bg-slate-100 rounded-2xl w-full sm:w-auto overflow-x-auto">
            <button
              onClick={() => setTypeFilter('all')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                typeFilter === 'all'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Inbox className="w-3.5 h-3.5" />
              ทั้งหมด ({stats.totalItems})
            </button>
            <button
              onClick={() => setTypeFilter('assignment')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                typeFilter === 'assignment'
                  ? 'bg-orange-500 text-white shadow-xs shadow-orange-500/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Palette className="w-3.5 h-3.5" />
              ชิ้นงานศิลปะ ({stats.totalAssignments})
            </button>
            <button
              onClick={() => setTypeFilter('quiz')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all flex items-center gap-1.5 whitespace-nowrap ${
                typeFilter === 'quiz'
                  ? 'bg-sky-600 text-white shadow-xs shadow-sky-600/20'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <HelpCircle className="w-3.5 h-3.5" />
              แบบทดสอบ ({stats.totalQuizzes})
            </button>
          </div>

          {/* Action Export Buttons */}
          <div className="flex items-center gap-2 sm:gap-2.5 flex-wrap">
            <button
              onClick={handleExportExcel}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold rounded-xl shadow-xs transition-all"
            >
              <FileSpreadsheet className="w-4 h-4" />
              ส่งออก Excel (.xlsx)
            </button>
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-xl transition-all"
            >
              <Download className="w-4 h-4" />
              CSV
            </button>
            <button
              onClick={() => {
                setShowSettingsModal(true);
                loadEmailSettings();
              }}
              className="inline-flex items-center gap-2 px-3.5 py-2 bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-xs font-bold rounded-xl transition-all"
            >
              <Mail className="w-4 h-4" />
              ตั้งค่าแจ้งเตือนอีเมล
            </button>
            <button
              onClick={fetchData}
              disabled={isLoading}
              className="p-2 text-slate-500 hover:text-slate-800 bg-slate-100 hover:bg-slate-200 rounded-xl transition-all"
              title="รีเฟรชข้อมูล"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Secondary Filter Row */}
        <div className="grid grid-cols-1 sm:grid-cols-3 lg:grid-cols-4 gap-3 pt-3 border-t border-slate-100">
          {/* Search Box */}
          <form onSubmit={handleSearchSubmit} className="relative sm:col-span-2 lg:col-span-2">
            <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="ค้นหาชื่อนักเรียน, รหัส 5 หลัก หรือชื่องาน..."
              className="w-full pl-10 pr-20 py-2 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-none transition-all"
            />
            <button
              type="submit"
              className="absolute right-2 top-1/2 -translate-y-1/2 px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[11px] font-bold hover:bg-orange-600 transition-colors"
            >
              ค้นหา
            </button>
          </form>

          {/* Classroom Filter */}
          <div className="relative">
            <select
              value={classroomFilter}
              onChange={(e) => setClassroomFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-none font-medium cursor-pointer"
            >
              <option value="all">ทุกห้องเรียน (ทั้งหมด)</option>
              {classrooms.map((room) => (
                <option key={room} value={room}>
                  ห้อง {room}
                </option>
              ))}
            </select>
          </div>

          {/* Status Filter */}
          <div className="relative">
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full py-2 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs text-slate-800 focus:bg-white focus:border-orange-500 outline-none font-medium cursor-pointer"
            >
              <option value="all">ทุกสถานะผลการตรวจ</option>
              <option value="pending">รอตรวจให้คะแนน</option>
              <option value="graded">ตรวจแล้ว (ให้คะแนน)</option>
              <option value="resubmit">แจ้งส่งซ้ำ / แก้ไข</option>
              <option value="completed">แบบทดสอบเสร็จสิ้น</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Luxury Master Table */}
      <div className="bg-white rounded-3xl border border-slate-200 shadow-2xs overflow-hidden">
        <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between bg-slate-50/50">
          <div className="flex items-center gap-2">
            <Inbox className="w-5 h-5 text-orange-600" />
            <h2 className="font-bold text-sm sm:text-base text-slate-900 font-kanit">
              รายการข้อมูลที่ส่งเข้ามา (พบ {items.length} รายการ)
            </h2>
          </div>
          <span className="text-xs text-slate-500">
            อัปเดตอัตโนมัติเมื่อนักเรียนส่งงาน
          </span>
        </div>

        {isLoading ? (
          <div className="p-12 text-center text-slate-400">
            <RefreshCw className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-3" />
            <p className="text-sm font-medium">กำลังโหลดข้อมูลรายการส่งงานทั้งหมด...</p>
          </div>
        ) : items.length === 0 ? (
          <div className="p-16 text-center text-slate-400">
            <Inbox className="w-12 h-12 mx-auto text-slate-300 mb-3" />
            <h3 className="text-base font-bold text-slate-700">ไม่พบรายการส่งงานตามเงื่อนไขที่เลือก</h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm mx-auto">
              ลองปรับตัวกรองห้องเรียน หรือล้างคำค้นหาเพื่อแสดงรายการทั้งหมด
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50/80 border-b border-slate-200 text-[11px] font-bold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-4 w-12 text-center">#</th>
                  <th className="py-3.5 px-4">วันเวลาที่ส่ง</th>
                  <th className="py-3.5 px-4">นักเรียน</th>
                  <th className="py-3.5 px-4">หัวข้องาน / แบบทดสอบ</th>
                  <th className="py-3.5 px-4">ผลงาน / คะแนน</th>
                  <th className="py-3.5 px-4 text-center">สถานะ</th>
                  <th className="py-3.5 px-4 text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-xs text-slate-700">
                {items.map((item, idx) => {
                  const isAssignment = item.type === 'assignment';
                  const thaiDate = item.submittedAt
                    ? new Date(item.submittedAt).toLocaleString('th-TH', {
                        day: '2-digit',
                        month: 'short',
                        year: '2-digit',
                        hour: '2-digit',
                        minute: '2-digit',
                      })
                    : '-';

                  return (
                    <tr key={item.id} className="hover:bg-orange-50/30 transition-colors group">
                      {/* Order */}
                      <td className="py-3.5 px-4 text-center font-bold text-slate-400">
                        {idx + 1}
                      </td>

                      {/* Submitted Time */}
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <div className="font-semibold text-slate-900">{thaiDate}</div>
                        {item.isLate && (
                          <span className="inline-block text-[10px] font-bold text-rose-600 bg-rose-50 px-1.5 py-0.5 rounded-md border border-rose-200/60 mt-0.5">
                            ส่งช้ากว่ากำหนด
                          </span>
                        )}
                      </td>

                      {/* Student Info */}
                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-700 font-bold text-xs flex items-center justify-center shrink-0 border border-slate-200">
                            {item.studentName.charAt(0)}
                          </div>
                          <div>
                            <p className="font-bold text-slate-900 leading-snug">{item.studentName}</p>
                            <div className="flex items-center gap-1.5 text-[11px] text-slate-500 mt-0.5">
                              <span className="font-mono text-slate-600 font-medium">#{item.studentId}</span>
                              <span>•</span>
                              <span className="bg-slate-100 text-slate-700 px-1.5 py-0.2 rounded font-semibold text-[10px]">
                                {item.classroom}
                              </span>
                              {item.studentNumber && (
                                <span className="text-slate-400 text-[10px]">
                                  (เลขที่ {item.studentNumber})
                                </span>
                              )}
                            </div>
                          </div>
                        </div>
                      </td>

                      {/* Item Title & Subject */}
                      <td className="py-3.5 px-4 max-w-xs">
                        <div className="flex items-center gap-1.5 mb-1">
                          {isAssignment ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-orange-700 bg-orange-50 px-2 py-0.5 rounded-full border border-orange-200/60">
                              <Palette className="w-3 h-3" /> ชิ้นงานศิลปะ
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-sky-700 bg-sky-50 px-2 py-0.5 rounded-full border border-sky-200/60">
                              <HelpCircle className="w-3 h-3" /> แบบทดสอบ
                            </span>
                          )}
                          <span className="text-[10px] text-slate-400 truncate max-w-[120px]">
                            {item.subjectName}
                          </span>
                        </div>
                        <p className="font-semibold text-slate-900 truncate" title={item.itemTitle}>
                          {item.itemTitle}
                        </p>
                      </td>

                      {/* Artwork Thumbnail / Score preview */}
                      <td className="py-3.5 px-4">
                        {isAssignment ? (
                          <div className="flex items-center gap-2">
                            {item.imageUrl ? (
                              <button
                                onClick={() => setLightboxImage(item.imageUrl)}
                                className="w-10 h-10 rounded-lg overflow-hidden border border-slate-200 bg-slate-100 shrink-0 hover:opacity-80 transition-opacity"
                                title="คลิกเพื่อดูภาพผลงานขนาดใหญ่"
                              >
                                {/* eslint-disable-next-line @next/next/no-img-element */}
                                <img
                                  src={item.imageUrl}
                                  alt="Artwork preview"
                                  className="w-full h-full object-cover"
                                />
                              </button>
                            ) : item.externalLink ? (
                              <a
                                href={item.externalLink}
                                target="_blank"
                                rel="noreferrer"
                                className="w-10 h-10 rounded-lg border border-orange-200 bg-orange-50 text-orange-600 flex items-center justify-center shrink-0 hover:bg-orange-100 transition-colors"
                                title="เปิดลิงก์ผลงานภายนอก (Drive/Canva)"
                              >
                                <ExternalLink className="w-4 h-4" />
                              </a>
                            ) : (
                              <div className="w-10 h-10 rounded-lg border border-slate-200 bg-slate-50 text-slate-400 flex items-center justify-center shrink-0">
                                <FileText className="w-4 h-4" />
                              </div>
                            )}
                            <div>
                              {item.score !== null && item.score !== undefined ? (
                                <p className="font-bold text-slate-900">
                                  {item.score} <span className="text-slate-400 text-[10px]">/ {item.maxScore}</span>
                                </p>
                              ) : (
                                <p className="text-slate-400 text-[11px] font-medium">ยังไม่ตรวจ</p>
                              )}
                              {item.concept && (
                                <p className="text-[10px] text-slate-500 truncate max-w-[140px]" title={item.concept}>
                                  {item.concept}
                                </p>
                              )}
                            </div>
                          </div>
                        ) : (
                          <div>
                            <p className="font-bold text-slate-900">
                              {item.score} <span className="text-slate-400 text-[10px]">/ {item.maxScore}</span>
                              <span className="text-sky-600 text-[11px] ml-1.5 font-semibold">
                                ({Math.round(((item.score || 0) / (item.maxScore || 1)) * 100)}%)
                              </span>
                            </p>
                            {item.infractionsCount && item.infractionsCount > 0 ? (
                              <p className="text-[10px] text-rose-600 font-bold flex items-center gap-1 mt-0.5">
                                <ShieldAlert className="w-3 h-3" /> หลุดจอ {item.infractionsCount} ครั้ง
                              </p>
                            ) : (
                              <p className="text-[10px] text-emerald-600 font-medium mt-0.5">
                                ✓ ไม่มีประวัติหลุดจอ
                              </p>
                            )}
                          </div>
                        )}
                      </td>

                      {/* Status Badge */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {item.status === 'graded' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ตรวจแล้ว
                          </span>
                        ) : item.status === 'resubmit' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-rose-700 bg-rose-50 px-2.5 py-1 rounded-full border border-rose-200/80">
                            <AlertCircle className="w-3.5 h-3.5" /> ส่งซ้ำ/แก้ไข
                          </span>
                        ) : item.status === 'completed' ? (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-sky-700 bg-sky-50 px-2.5 py-1 rounded-full border border-sky-200/80">
                            <CheckCircle2 className="w-3.5 h-3.5" /> เสร็จสิ้น
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200/80">
                            <Clock className="w-3.5 h-3.5" /> รอตรวจ
                          </span>
                        )}
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        <button
                          onClick={() => handleOpenInspect(item)}
                          className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-orange-700 rounded-xl text-xs font-bold transition-all border border-orange-200/60"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          {isAssignment ? 'ตรวจงาน' : 'ดูผลสอบ'}
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Inspection & Grading Modal */}
      {inspectItem && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[90dvh] overflow-y-auto p-5 sm:p-6 space-y-5">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                  {inspectItem.type === 'assignment' ? <Palette className="w-5 h-5" /> : <HelpCircle className="w-5 h-5" />}
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-kanit">
                    {inspectItem.type === 'assignment' ? 'ตรวจผลงานและบันทึกคะแนน' : 'รายละเอียดการทำแบบทดสอบ'}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {inspectItem.studentName} (#{inspectItem.studentId}) • ห้อง {inspectItem.classroom}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setInspectItem(null)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Submission Preview Content */}
            <div className="space-y-4">
              {/* Artwork Image if present */}
              {inspectItem.imageUrl && (
                <div className="rounded-2xl overflow-hidden border border-slate-200 bg-slate-50 relative group">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={inspectItem.imageUrl}
                    alt="Artwork"
                    className="w-full max-h-80 object-contain mx-auto bg-slate-950/5"
                  />
                  <button
                    onClick={() => setLightboxImage(inspectItem.imageUrl)}
                    className="absolute bottom-3 right-3 bg-black/75 hover:bg-black text-white px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shadow-lg"
                  >
                    <Eye className="w-3.5 h-3.5" /> ดูภาพขนาดเต็ม
                  </button>
                </div>
              )}

              {/* External Link or File */}
              {inspectItem.externalLink && (
                <div className="p-3.5 rounded-xl bg-orange-50 border border-orange-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-semibold text-orange-800">
                    <ExternalLink className="w-4 h-4" />
                    <span>แนบลิงก์ผลงานภายนอก:</span>
                  </div>
                  <a
                    href={inspectItem.externalLink}
                    target="_blank"
                    rel="noreferrer"
                    className="text-xs font-bold text-orange-700 hover:underline flex items-center gap-1"
                  >
                    เปิดดูผลงาน →
                  </a>
                </div>
              )}

              {/* Concept / Description */}
              {inspectItem.concept && (
                <div className="p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs space-y-1">
                  <span className="font-bold text-slate-700 block">แนวคิด / คำอธิบายผลงาน:</span>
                  <p className="text-slate-600 leading-relaxed whitespace-pre-wrap">{inspectItem.concept}</p>
                </div>
              )}

              {/* Assignment Grading Form */}
              {inspectItem.type === 'assignment' ? (
                <form onSubmit={handleSaveGrade} className="space-y-4 pt-2">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        คะแนนที่ได้ (คะแนนเต็ม {inspectItem.maxScore})
                      </label>
                      <input
                        type="number"
                        step="0.5"
                        min="0"
                        max={inspectItem.maxScore}
                        value={gradingScore}
                        onChange={(e) => setGradingScore(e.target.value)}
                        placeholder={`0 - ${inspectItem.maxScore}`}
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-sm font-bold text-slate-900 focus:border-orange-500 outline-none"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-slate-700 mb-1">
                        สถานะการประเมิน
                      </label>
                      <select
                        value={gradingStatus}
                        onChange={(e) => setGradingStatus(e.target.value)}
                        className="w-full h-10 px-3 bg-white border border-slate-200 rounded-xl text-xs font-bold text-slate-900 focus:border-orange-500 outline-none"
                      >
                        <option value="graded">ตรวจแล้ว (Graded)</option>
                        <option value="resubmit">แจ้งให้นักเรียนส่งซ้ำ / ปรับปรุง (Resubmit)</option>
                        <option value="pending">รอตรวจ (Pending)</option>
                      </select>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      ข้อเสนอแนะและคำติชมจากครู (Feedback)
                    </label>
                    <textarea
                      rows={3}
                      value={gradingFeedback}
                      onChange={(e) => setGradingFeedback(e.target.value)}
                      placeholder="เขียนคำแนะนำ คำชมเชย หรือจุดที่ควรพัฒนาให้นักเรียน..."
                      className="w-full p-3 bg-white border border-slate-200 rounded-xl text-xs text-slate-900 focus:border-orange-500 outline-none resize-none"
                    />
                  </div>

                  <div className="flex items-center justify-end gap-2.5 pt-2">
                    <button
                      type="button"
                      onClick={() => setInspectItem(null)}
                      className="px-4 py-2 rounded-xl text-xs font-bold text-slate-600 hover:bg-slate-100 transition-colors"
                    >
                      ยกเลิก
                    </button>
                    <button
                      type="submit"
                      disabled={isSavingGrade}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-orange-500 hover:bg-orange-600 text-white flex items-center gap-1.5 shadow-md shadow-orange-500/20 transition-all"
                    >
                      {isSavingGrade ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      บันทึกคะแนน
                    </button>
                  </div>
                </form>
              ) : (
                /* Quiz Details Review */
                <div className="space-y-3 pt-2">
                  <div className="p-4 rounded-2xl bg-sky-50 border border-sky-200 flex items-center justify-between">
                    <div>
                      <p className="text-xs text-sky-800 font-bold uppercase tracking-wider">คะแนนที่ได้</p>
                      <p className="text-2xl font-bold font-kanit text-sky-950 mt-0.5">
                        {inspectItem.score} <span className="text-sm font-normal text-sky-700">/ {inspectItem.maxScore} คะแนน</span>
                      </p>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-bold text-sky-800 bg-white px-3 py-1 rounded-full border border-sky-200 shadow-2xs">
                        {Math.round(((inspectItem.score || 0) / (inspectItem.maxScore || 1)) * 100)}%
                      </span>
                    </div>
                  </div>

                  {inspectItem.infractionsCount && inspectItem.infractionsCount > 0 ? (
                    <div className="p-3 rounded-xl bg-rose-50 border border-rose-200 text-xs text-rose-800 flex items-center gap-2">
                      <ShieldAlert className="w-4 h-4 text-rose-600 shrink-0" />
                      <span>พบการสลับหน้าจอหรือหลุดจากโหมดเต็มจอขณะสอบจำนวน {inspectItem.infractionsCount} ครั้ง</span>
                    </div>
                  ) : null}

                  <div className="flex justify-end pt-2">
                    <button
                      onClick={() => setInspectItem(null)}
                      className="px-5 py-2 rounded-xl text-xs font-bold bg-slate-800 hover:bg-slate-900 text-white transition-colors"
                    >
                      ปิดหน้าต่าง
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Email Settings & Outbox Modal */}
      {showSettingsModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-in fade-in">
          <div className="bg-white rounded-3xl shadow-2xl border border-slate-100 w-full max-w-2xl max-h-[92dvh] overflow-y-auto p-5 sm:p-6 space-y-6">
            {/* Modal Header */}
            <div className="flex items-start justify-between pb-3 border-b border-slate-100">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-bold">
                  <Mail className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-base text-slate-900 font-kanit">
                    การตั้งค่าระบบแจ้งเตือนและส่งข้อมูลเข้าอีเมลคุณครู
                  </h3>
                  <p className="text-xs text-slate-500">
                    กำหนดอีเมลผู้รับและตรวจสอบประวัติการแจ้งเตือนอัตโนมัติ (Outbox Log)
                  </p>
                </div>
              </div>
              <button
                onClick={() => setShowSettingsModal(false)}
                className="p-1.5 text-slate-400 hover:text-slate-700 rounded-full hover:bg-slate-100 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {isLoadingSettings ? (
              <div className="p-8 text-center text-slate-400">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-emerald-500 mb-2" />
                <p className="text-xs">กำลังโหลดการตั้งค่า...</p>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Settings Form */}
                <form onSubmit={handleSaveEmailSettings} className="space-y-4">
                  {/* Recipient Email */}
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">
                      อีเมลคุณครูผู้รับแจ้งเตือน (Teacher Recipient Email) <span className="text-red-500">*</span>
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="email"
                        required
                        value={emailSettings.teacherEmail}
                        onChange={(e) => setEmailSettings({ ...emailSettings, teacherEmail: e.target.value })}
                        placeholder="krukae.art@wts.ac.th หรือชื่อครู@gmail.com"
                        className="flex-1 h-10 px-3 bg-slate-50 border border-slate-200 rounded-xl text-xs font-semibold text-slate-900 focus:bg-white focus:border-emerald-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={handleSendTestEmail}
                        disabled={isSendingTest}
                        className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-xs transition-colors shrink-0"
                      >
                        {isSendingTest ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Send className="w-3.5 h-3.5" />}
                        ทดสอบส่งอีเมล
                      </button>
                    </div>
                    <p className="text-[11px] text-slate-400 mt-1">
                      ระบบจะส่งสรุปข้อมูลผลงานและผลคะแนนข้อสอบของนักเรียนมายังอีเมลนี้อัตโนมัติ
                    </p>
                  </div>

                  {/* Test Feedback Notice */}
                  {testResult && (
                    <div
                      className={`p-3 rounded-xl border text-xs flex items-center gap-2 ${
                        testResult.success
                          ? 'bg-emerald-50 border-emerald-200 text-emerald-800'
                          : 'bg-rose-50 border-rose-200 text-rose-800'
                      }`}
                    >
                      {testResult.success ? <Check className="w-4 h-4 text-emerald-600 shrink-0" /> : <AlertCircle className="w-4 h-4 text-rose-600 shrink-0" />}
                      <span>{testResult.message}</span>
                    </div>
                  )}

                  {/* Notification Toggles */}
                  <div className="p-3.5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <p className="text-xs font-bold text-slate-800 uppercase tracking-wider">
                      ตัวเลือกการแจ้งเตือนอัตโนมัติ
                    </p>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-slate-700">
                        เปิดใช้งานระบบแจ้งเตือนทางอีเมล (Master Switch)
                      </span>
                      <input
                        type="checkbox"
                        checked={emailSettings.isEmailEnabled}
                        onChange={(e) => setEmailSettings({ ...emailSettings, isEmailEnabled: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-slate-700">
                        แจ้งเตือนเมื่อนักเรียนส่งงานศิลปะ / การบ้าน (Assignment Submissions)
                      </span>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnAssignment}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnAssignment: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-xs font-medium text-slate-700">
                        แจ้งเตือนเมื่อนักเรียนทำแบบทดสอบเสร็จสิ้น (Quiz Completion)
                      </span>
                      <input
                        type="checkbox"
                        checked={emailSettings.notifyOnQuiz}
                        onChange={(e) => setEmailSettings({ ...emailSettings, notifyOnQuiz: e.target.checked })}
                        className="w-4 h-4 accent-emerald-600 rounded cursor-pointer"
                      />
                    </label>
                  </div>

                  <div className="flex justify-end gap-2 pt-1">
                    <button
                      type="submit"
                      disabled={isSavingSettings}
                      className="px-5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all"
                    >
                      {isSavingSettings ? <RefreshCw className="w-3.5 h-3.5 animate-spin" /> : <Save className="w-3.5 h-3.5" />}
                      บันทึกการตั้งค่า
                    </button>
                  </div>
                </form>

                {/* Outbox & Activity Log Section */}
                <div className="border-t border-slate-100 pt-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-xs font-bold text-slate-900 uppercase tracking-wider">
                        กล่องประวัติการส่งการแจ้งเตือน (Notification Outbox Log)
                      </h4>
                      <p className="text-[11px] text-slate-400">
                        บันทึกประวัติการส่งข้อมูลเข้าอีเมลคุณครูย้อนหลังล่าสุด
                      </p>
                    </div>
                    <span className="text-xs font-semibold text-slate-500 bg-slate-100 px-2 py-0.5 rounded-full">
                      {notificationLogs.length} รายการ
                    </span>
                  </div>

                  {notificationLogs.length === 0 ? (
                    <div className="p-6 text-center text-slate-400 bg-slate-50 rounded-2xl border border-slate-200">
                      <p className="text-xs">ยังไม่มีประวัติการส่งแจ้งเตือน (จะปรากฏขึ้นเมื่อนักเรียนส่งงานหรือทดสอบส่ง)</p>
                    </div>
                  ) : (
                    <div className="max-h-56 overflow-y-auto rounded-2xl border border-slate-200 divide-y divide-slate-100 bg-white">
                      {notificationLogs.map((log) => {
                        const dateText = new Date(log.timestamp).toLocaleString('th-TH', {
                          month: 'short',
                          day: '2-digit',
                          hour: '2-digit',
                          minute: '2-digit',
                        });

                        return (
                          <div key={log.id} className="p-3 text-xs flex items-center justify-between gap-3 hover:bg-slate-50">
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5 mb-0.5">
                                <span
                                  className={`inline-block w-2 h-2 rounded-full ${
                                    log.status === 'sent'
                                      ? 'bg-emerald-500'
                                      : log.status === 'simulated'
                                      ? 'bg-sky-500'
                                      : 'bg-rose-500'
                                  }`}
                                />
                                <span className="font-bold text-slate-800 truncate">{log.subject}</span>
                              </div>
                              <p className="text-[11px] text-slate-500 truncate">{log.summary}</p>
                            </div>
                            <div className="text-right shrink-0">
                              <span className="text-[10px] text-slate-400 block">{dateText}</span>
                              <span
                                className={`text-[10px] font-bold uppercase ${
                                  log.status === 'sent'
                                    ? 'text-emerald-600'
                                    : log.status === 'simulated'
                                    ? 'text-sky-600'
                                    : 'text-rose-600'
                                }`}
                              >
                                {log.status === 'sent' ? '✓ ส่งแล้ว' : log.status === 'simulated' ? 'บันทึกในระบบ' : 'ขัดข้อง'}
                              </span>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Full Artwork Lightbox Modal */}
      {lightboxImage && (
        <div 
          onClick={() => setLightboxImage(null)}
          className="fixed inset-0 z-60 bg-black/90 backdrop-blur-md flex items-center justify-center p-4 cursor-zoom-out animate-in fade-in"
        >
          <div className="relative max-w-5xl max-h-[90vh] flex flex-col items-center">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={lightboxImage}
              alt="Full artwork"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl shadow-2xl"
            />
            <p className="text-white/80 text-xs mt-3 font-prompt">คลิกที่ใดก็ได้เพื่อปิด</p>
          </div>
        </div>
      )}
    </div>
  );
}
