"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  FolderKanban,
  Search,
  CheckCircle2,
  Clock,
  AlertCircle,
  ExternalLink,
  Trash2,
  MessageSquare,
  RefreshCw,
  GraduationCap,
  Building2,
  Users,
  Eye,
  X,
  Save,
  Sparkles,
  FileText,
  Edit3,
  Settings2,
  RotateCcw,
  Plus,
  Type,
  Layers
} from "lucide-react";
import { swalToast, swalConfirm, swalSuccess, swalError } from "@/lib/swal";
import {
  PortfolioConfigSettings,
  DEFAULT_PORTFOLIO_CONFIG,
} from "@/app/api/settings/portfolio-config/route";

interface PortfolioSummaryItem {
  studentId: string;
  studentName: string;
  classroom: string;
  university: string;
  faculty: string;
  major: string;
  projectRound: string;
  gpax4: string;
  gpax5: string;
  entriesCount: number;
  status: "draft" | "submitted" | "approved" | "revision";
  teacherFeedback: string;
  updatedAt: string;
}

export default function PortfoliosAdminTab() {
  const [subTab, setSubTab] = useState<"students" | "settings">("students");

  // Student Portfolios List State
  const [portfolios, setPortfolios] = useState<PortfolioSummaryItem[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal 1: Quick Review & Status
  const [reviewModalItem, setReviewModalItem] = useState<PortfolioSummaryItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"draft" | "submitted" | "approved" | "revision">("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  // Modal 2: Full Data & Text Editor for a Student's Portfolio directly inside Admin
  const [editModalStudentId, setEditModalStudentId] = useState<string | null>(null);
  const [editPortfolioData, setEditPortfolioData] = useState<any | null>(null);
  const [editStudentClassroom, setEditStudentClassroom] = useState<string>("");
  const [editStudentStatus, setEditStudentStatus] = useState<"draft" | "submitted" | "approved" | "revision">("draft");
  const [editStudentFeedback, setEditStudentFeedback] = useState<string>("");
  const [isLoadingEditData, setIsLoadingEditData] = useState(false);
  const [isSavingEditData, setIsSavingEditData] = useState(false);

  // Sub-Tab 2: Global Portfolio Labels & Template Config
  const [config, setConfig] = useState<PortfolioConfigSettings>(DEFAULT_PORTFOLIO_CONFIG);
  const [levelsInput, setLevelsInput] = useState(DEFAULT_PORTFOLIO_CONFIG.levelOptions.join(", "));
  const [costsInput, setCostsInput] = useState(DEFAULT_PORTFOLIO_CONFIG.costOptions.join(", "));
  const [isSavingConfig, setIsSavingConfig] = useState(false);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const [resPortfolios, resRooms, resCfg] = await Promise.all([
        fetch("/api/portfolios?all=true", { cache: "no-store" }),
        fetch("/api/classrooms"),
        fetch("/api/settings/portfolio-config", { cache: "no-store" }),
      ]);

      if (resPortfolios.ok) {
        const data: any = await resPortfolios.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
      if (resRooms.ok) {
        const rData: any = await resRooms.json();
        setClassrooms(Array.isArray(rData) ? rData : []);
      }
      if (resCfg.ok) {
        const cData: any = await resCfg.json();
        if (cData) {
          const merged = { ...DEFAULT_PORTFOLIO_CONFIG, ...cData };
          setConfig(merged);
          setLevelsInput((merged.levelOptions || []).join(", "));
          setCostsInput((merged.costOptions || []).join(", "));
        }
      }
    } catch (err) {
      console.error("Failed to fetch student portfolios:", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchPortfolios();
  }, []);

  const filteredList = useMemo(() => {
    return portfolios.filter((item) => {
      if (selectedClassroom !== "all" && item.classroom !== selectedClassroom) {
        return false;
      }
      if (selectedStatus !== "all" && item.status !== selectedStatus) {
        return false;
      }
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchId = (item.studentId || "").toLowerCase().includes(q);
        const matchName = (item.studentName || "").toLowerCase().includes(q);
        const matchUniv = (item.university || "").toLowerCase().includes(q);
        const matchFaculty = (item.faculty || "").toLowerCase().includes(q);
        const matchMajor = (item.major || "").toLowerCase().includes(q);
        return matchId || matchName || matchUniv || matchFaculty || matchMajor;
      }
      return true;
    });
  }, [portfolios, selectedClassroom, selectedStatus, searchQuery]);

  const stats = useMemo(() => {
    const total = portfolios.length;
    const approved = portfolios.filter((p) => p.status === "approved").length;
    const submitted = portfolios.filter((p) => p.status === "submitted").length;
    const revision = portfolios.filter((p) => p.status === "revision").length;
    return { total, approved, submitted, revision };
  }, [portfolios]);

  const handleOpenReview = (item: PortfolioSummaryItem) => {
    setReviewModalItem(item);
    setReviewStatus(item.status === "draft" ? "approved" : item.status);
    setReviewFeedback(item.teacherFeedback || "");
  };

  const handleSaveReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!reviewModalItem) return;
    setIsSavingReview(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: reviewModalItem.studentId,
          status: reviewStatus,
          teacherFeedback: reviewFeedback,
        }),
      });
      if (res.ok) {
        setPortfolios((prev) =>
          prev.map((p) =>
            p.studentId === reviewModalItem.studentId
              ? {
                  ...p,
                  status: reviewStatus,
                  teacherFeedback: reviewFeedback,
                  updatedAt: new Date().toISOString(),
                }
              : p
          )
        );
        setReviewModalItem(null);
        swalSuccess("บันทึกผลการตรวจพอร์ตแล้ว!", `อัปเดตสถานะของ ${reviewModalItem.studentName} เรียบร้อย`, 1500);
      } else {
        swalError("บันทึกไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      swalError("เชื่อมต่อไม่สำเร็จ", "ไม่สามารถบันทึกผลการตรวจได้");
    } finally {
      setIsSavingReview(false);
    }
  };

  // Open full portfolio data & text editor inside Admin
  const handleOpenFullEditModal = async (item: PortfolioSummaryItem) => {
    setEditModalStudentId(item.studentId);
    setEditStudentClassroom(item.classroom || "");
    setEditStudentStatus(item.status || "draft");
    setEditStudentFeedback(item.teacherFeedback || "");
    setIsLoadingEditData(true);
    setEditPortfolioData(null);

    try {
      const res = await fetch(`/api/portfolios?studentId=${encodeURIComponent(item.studentId)}`, {
        cache: "no-store",
      });
      if (res.ok) {
        const data: any = await res.json();
        if (data?.record?.portfolioJson) {
          const parsed = JSON.parse(data.record.portfolioJson);
          setEditPortfolioData(parsed);
        }
      }
    } catch (err) {
      console.error("Failed to load full portfolio for editing:", err);
      swalError("โหลดข้อมูลไม่สำเร็จ", "ไม่สามารถดึงรายละเอียดพอร์ตของนักเรียนได้");
    } finally {
      setIsLoadingEditData(false);
    }
  };

  const handleSaveFullEditModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editModalStudentId || !editPortfolioData) return;
    setIsSavingEditData(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: editModalStudentId,
          studentName: editPortfolioData?.profile?.fullNameTh || "นักเรียน",
          classroom: editStudentClassroom,
          status: editStudentStatus,
          teacherFeedback: editStudentFeedback,
          portfolio: editPortfolioData,
        }),
      });

      if (res.ok) {
        await fetchPortfolios();
        setEditModalStudentId(null);
        setEditPortfolioData(null);
        swalSuccess("บันทึกการแก้ไขข้อมูลพอร์ตแล้ว!", "ข้อมูลและข้อความทั้งหมดของนักเรียนถูกอัปเดตเรียบร้อย", 1600);
      } else {
        swalError("บันทึกไม่สำเร็จ", "กรุณาลองใหม่อีกครั้ง");
      }
    } catch {
      swalError("เชื่อมต่อไม่สำเร็จ", "ไม่สามารถบันทึกข้อมูลได้");
    } finally {
      setIsSavingEditData(false);
    }
  };

  const handleDeletePortfolio = async (item: PortfolioSummaryItem) => {
    if (
      await swalConfirm(
        `ต้องการลบแฟ้มสะสมผลงานของ "${item.studentName} (${item.studentId})" ออกจากฐานข้อมูลหรือไม่?`
      )
    ) {
      try {
        const res = await fetch(`/api/portfolios?studentId=${encodeURIComponent(item.studentId)}`, {
          method: "DELETE",
        });
        if (res.ok) {
          setPortfolios((prev) => prev.filter((p) => p.studentId !== item.studentId));
          swalToast("ลบแฟ้มสะสมผลงานเรียบร้อยแล้ว", "info");
        }
      } catch {
        swalError("ลบไม่สำเร็จ", "เกิดข้อผิดพลาดในการเชื่อมต่อ");
      }
    }
  };

  const handleSaveConfig = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSavingConfig(true);
    try {
      const parsedLevels = levelsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);
      const parsedCosts = costsInput
        .split(",")
        .map((s) => s.trim())
        .filter(Boolean);

      const payload: PortfolioConfigSettings = {
        ...config,
        levelOptions: parsedLevels.length > 0 ? parsedLevels : DEFAULT_PORTFOLIO_CONFIG.levelOptions,
        costOptions: parsedCosts.length > 0 ? parsedCosts : DEFAULT_PORTFOLIO_CONFIG.costOptions,
      };

      const res = await fetch("/api/settings/portfolio-config", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        const data: any = await res.json();
        if (data?.config) {
          setConfig(data.config);
        }
        swalSuccess(
          "บันทึกข้อความและค่าเริ่มต้นแล้ว!",
          "คำและหัวข้อต่างๆ บนระบบแฟ้มสะสมผลงานและปุ่มหน้าแรกอัปเดตเรียบร้อย",
          1700
        );
      } else {
        swalError("บันทึกไม่สำเร็จ", "กรุณาตรวจสอบสิทธิ์แอดมิน");
      }
    } catch {
      swalError("เชื่อมต่อไม่สำเร็จ", "ไม่สามารถบันทึกการตั้งค่าได้");
    } finally {
      setIsSavingConfig(false);
    }
  };

  const handleResetConfig = async () => {
    if (await swalConfirm("ต้องการคืนค่าคำและหัวข้อทั้งหมดของระบบแฟ้มสะสมผลงานเป็นค่าเริ่มต้นหรือไม่?")) {
      setConfig(DEFAULT_PORTFOLIO_CONFIG);
      setLevelsInput(DEFAULT_PORTFOLIO_CONFIG.levelOptions.join(", "));
      setCostsInput(DEFAULT_PORTFOLIO_CONFIG.costOptions.join(", "));
      swalToast("คืนค่าเริ่มต้นแล้ว กดปุ่มบันทึกเพื่อยืนยัน", "info");
    }
  };

  const renderStatusBadge = (status: PortfolioSummaryItem["status"]) => {
    switch (status) {
      case "approved":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
            <span>ครูตรวจผ่านแล้ว</span>
          </span>
        );
      case "submitted":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-blue-50 text-blue-700 border border-blue-200">
            <Clock className="w-3.5 h-3.5 text-blue-600" />
            <span>ส่งให้ครูตรวจ</span>
          </span>
        );
      case "revision":
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-rose-50 text-rose-700 border border-rose-200">
            <AlertCircle className="w-3.5 h-3.5 text-rose-600" />
            <span>รอแก้ไขเพิ่มเติม</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
            <FileText className="w-3.5 h-3.5 text-slate-400" />
            <span>กำลังจัดทำ (ฉบับร่าง)</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Mode Switcher: 1) จัดการและแก้ไขข้อมูลพอร์ตนักเรียน vs 2) ตั้งค่าข้อความ/แก้คำต่างๆ ของระบบพอร์ต */}
      <div className="bg-white rounded-3xl p-2 border border-gray-200/80 shadow-2xs flex flex-wrap items-center gap-2">
        <button
          type="button"
          onClick={() => setSubTab("students")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === "students"
              ? "bg-gradient-to-r from-teal-600 to-cyan-600 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Users className="w-4 h-4" />
          <span>1. จัดการและแก้ไขข้อมูลพอร์ตนักเรียน ({portfolios.length})</span>
        </button>

        <button
          type="button"
          onClick={() => setSubTab("settings")}
          className={`flex-1 sm:flex-none inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-2xl font-bold text-xs sm:text-sm transition-all cursor-pointer ${
            subTab === "settings"
              ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-sm"
              : "text-gray-600 hover:bg-gray-100"
          }`}
        >
          <Settings2 className="w-4 h-4" />
          <span>2. ตั้งค่าข้อความ / แก้คำหัวข้อต่างๆ ในระบบพอร์ต</span>
        </button>
      </div>

      {subTab === "settings" ? (
        /* ================================================================= */
        /* SUB-TAB 2: แก้คำ หัวข้อหมวดหมู่ ป้ายกำกับ และค่าเริ่มต้นทั้งหมด */
        /* ================================================================= */
        <form
          onSubmit={handleSaveConfig}
          className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200/80 shadow-2xs space-y-7"
        >
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-2xl bg-orange-50 text-orange-600 flex items-center justify-center shrink-0">
                <Type className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-bold text-gray-900 text-base sm:text-lg font-kanit">
                  แก้ไขคำ ข้อความหัวข้อ และข้อมูลเริ่มต้นของระบบแฟ้มสะสมผลงาน
                </h3>
                <p className="text-xs text-gray-500">
                  ปรับเปลี่ยนคำบนปุ่มหน้าแรก หัวข้อกระดาษ A4 ชื่อหมวด 1-5 ป้ายระดับ/ค่าใช้จ่าย และค่าเริ่มต้นได้ทุกจุด
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 self-end sm:self-center">
              <button
                type="button"
                onClick={handleResetConfig}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs cursor-pointer"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                <span>คืนค่าเริ่มต้น</span>
              </button>
              <button
                type="submit"
                disabled={isSavingConfig}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm cursor-pointer disabled:opacity-50"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingConfig ? "กำลังบันทึก..." : "บันทึกการแก้คำทั้งหมด"}</span>
              </button>
            </div>
          </div>

          {/* Section A: ปุ่มบนหน้าแรก & หัวกระดาษ A4 */}
          <div className="space-y-4">
            <h4 className="text-xs font-extrabold text-orange-700 uppercase tracking-wider flex items-center gap-2">
              <Sparkles className="w-4 h-4" />
              <span>ส่วนที่ 1: ข้อความปุ่มบนหน้าแรก & หัวกระดาษแฟ้มสะสมผลงาน</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ข้อความบนปุ่มหน้าแรก (Hero Button):
                </label>
                <input
                  type="text"
                  value={config.heroButtonText}
                  onChange={(e) => setConfig({ ...config, heroButtonText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  หัวข้อใหญ่หน้าปก (เช่น แฟ้มสะสมผลงาน ประจำปี):
                </label>
                <input
                  type="text"
                  value={config.coverMainTitle}
                  onChange={(e) => setConfig({ ...config, coverMainTitle: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ข้อความมุมขวาบนกระดาษ A4:
                </label>
                <input
                  type="text"
                  value={config.topRightHeaderLabel}
                  onChange={(e) => setConfig({ ...config, topRightHeaderLabel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none font-bold text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  คำว่า &quot;สาขาวิชาที่สมัคร&quot;:
                </label>
                <input
                  type="text"
                  value={config.appliedMajorLabel}
                  onChange={(e) => setConfig({ ...config, appliedMajorLabel: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ปีการศึกษาเริ่มต้น (พ.ศ.):
                </label>
                <input
                  type="text"
                  value={config.defaultAcademicYear}
                  onChange={(e) => setConfig({ ...config, defaultAcademicYear: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ข้อความแจ้งจำนวนหน้า (แถบซ้าย):
                </label>
                <input
                  type="text"
                  value={config.pageLimitNoticeText}
                  onChange={(e) => setConfig({ ...config, pageLimitNoticeText: e.target.value })}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-gray-200 focus:border-orange-500 outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section B: ชื่อหมวดหมู่ 1 ถึง 5 */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-teal-700 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4" />
              <span>ส่วนที่ 2: แก้คำชื่อหมวดหมู่ (หมวด 1 - หมวด 5) และหัวข้อย่อย</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 1:</label>
                <input
                  type="text"
                  value={config.sec1Title}
                  onChange={(e) => setConfig({ ...config, sec1Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">หัวข้อตาราง: ข้อมูลส่วนตัว</label>
                <input
                  type="text"
                  value={config.sec1PersonalTitle}
                  onChange={(e) => setConfig({ ...config, sec1PersonalTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">หัวข้อตาราง: ข้อมูลผู้ปกครอง</label>
                <input
                  type="text"
                  value={config.sec1ParentTitle}
                  onChange={(e) => setConfig({ ...config, sec1ParentTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">หัวข้อตาราง: ที่อยู่ติดต่อได้</label>
                <input
                  type="text"
                  value={config.sec1AddressTitle}
                  onChange={(e) => setConfig({ ...config, sec1AddressTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">หัวข้อตาราง: ข้อมูลการศึกษา</label>
                <input
                  type="text"
                  value={config.sec1EducationTitle}
                  onChange={(e) => setConfig({ ...config, sec1EducationTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">หัวข้อตาราง: ผลการเรียนกลุ่มสาระ</label>
                <input
                  type="text"
                  value={config.sec1SubjectGradesTitle}
                  onChange={(e) => setConfig({ ...config, sec1SubjectGradesTitle: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 2 (เรียงความ):</label>
                <input
                  type="text"
                  value={config.sec2Title}
                  onChange={(e) => setConfig({ ...config, sec2Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 3 (เอกสารแนบ):</label>
                <input
                  type="text"
                  value={config.sec3Title}
                  onChange={(e) => setConfig({ ...config, sec3Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 4.1 (รางวัล/เกียรติบัตร):</label>
                <input
                  type="text"
                  value={config.sec4_1Title}
                  onChange={(e) => setConfig({ ...config, sec4_1Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 4.2 (ผลงาน):</label>
                <input
                  type="text"
                  value={config.sec4_2Title}
                  onChange={(e) => setConfig({ ...config, sec4_2Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 4.3 (กิจกรรม):</label>
                <input
                  type="text"
                  value={config.sec4_3Title}
                  onChange={(e) => setConfig({ ...config, sec4_3Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ป้ายหมวด 5 (คำถามเพิ่มเติม):</label>
                <input
                  type="text"
                  value={config.sec5Title}
                  onChange={(e) => setConfig({ ...config, sec5Title: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-teal-500 outline-none font-bold text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section C: คำกำกับในแต่ละรายการผลงาน & ตัวเลือกระดับ/ค่าใช้จ่าย */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-indigo-700 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4" />
              <span>ส่วนที่ 3: แก้คำกำกับในกล่องผลงาน & ตัวเลือกเมนู (ระดับ / ค่าใช้จ่าย)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">คำว่า &quot;ผลรางวัล / อันดับ :&quot;</label>
                <input
                  type="text"
                  value={config.entryAwardResultLabel}
                  onChange={(e) => setConfig({ ...config, entryAwardResultLabel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">คำว่า &quot;รายละเอียด :&quot;</label>
                <input
                  type="text"
                  value={config.entryDetailLabel}
                  onChange={(e) => setConfig({ ...config, entryDetailLabel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">คำว่า &quot;ภาพประกอบ : สูงสุดไม่เกิน 6 รูป&quot;</label>
                <input
                  type="text"
                  value={config.entryGalleryLabel}
                  onChange={(e) => setConfig({ ...config, entryGalleryLabel: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-gray-800"
                />
              </div>

              <div className="md:col-span-2">
                <label className="font-bold text-gray-700 block mb-1">
                  ตัวเลือกระดับผลงาน (คั่นแต่ละตัวเลือกด้วยเครื่องหมายจุลภาค , ):
                </label>
                <input
                  type="text"
                  value={levelsInput}
                  onChange={(e) => setLevelsInput(e.target.value)}
                  placeholder="ระดับนานาชาติ, ระดับชาติ, ระดับภูมิภาค, ระดับจังหวัด, ระดับเขตพื้นที่ฯ, ระดับสถานศึกษา"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-gray-800"
                />
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1">
                  ตัวเลือกค่าใช้จ่าย (คั่นด้วย , ):
                </label>
                <input
                  type="text"
                  value={costsInput}
                  onChange={(e) => setCostsInput(e.target.value)}
                  placeholder="ไม่มีค่าใช้จ่าย, มีค่าใช้จ่าย"
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-indigo-500 outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          {/* Section D: ข้อมูลสถาบัน/โรงเรียนเริ่มต้นสำหรับพอร์ตใหม่ */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-extrabold text-emerald-700 uppercase tracking-wider flex items-center gap-2">
              <Building2 className="w-4 h-4" />
              <span>ส่วนที่ 4: ค่าเริ่มต้นมหาวิทยาลัย คณะ สาขา และโรงเรียน (สำหรับพอร์ตที่สร้างใหม่)</span>
            </h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1">มหาวิทยาลัยเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultUniversity}
                  onChange={(e) => setConfig({ ...config, defaultUniversity: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">คณะเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultFaculty}
                  onChange={(e) => setConfig({ ...config, defaultFaculty: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">สาขาวิชาเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultMajor}
                  onChange={(e) => setConfig({ ...config, defaultMajor: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">โครงการ/รอบเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultProjectRound}
                  onChange={(e) => setConfig({ ...config, defaultProjectRound: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">ชื่อโรงเรียนเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultSchoolName}
                  onChange={(e) => setConfig({ ...config, defaultSchoolName: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div>
                <label className="font-bold text-gray-700 block mb-1">แผนการเรียนเริ่มต้น:</label>
                <input
                  type="text"
                  value={config.defaultStudyPlan}
                  onChange={(e) => setConfig({ ...config, defaultStudyPlan: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
              <div className="md:col-span-3">
                <label className="font-bold text-gray-700 block mb-1">หัวข้อคำถามเริ่มต้นในหมวด 5:</label>
                <input
                  type="text"
                  value={config.defaultQuestion1}
                  onChange={(e) => setConfig({ ...config, defaultQuestion1: e.target.value })}
                  className="w-full px-3.5 py-2 rounded-xl border border-gray-200 focus:border-emerald-500 outline-none text-gray-800"
                />
              </div>
            </div>
          </div>

          <div className="pt-4 border-t border-gray-100 flex items-center justify-end">
            <button
              type="submit"
              disabled={isSavingConfig}
              className="inline-flex items-center gap-2 px-6 py-2.5 rounded-2xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs sm:text-sm shadow-md cursor-pointer disabled:opacity-50"
            >
              <Save className="w-4 h-4" />
              <span>{isSavingConfig ? "กำลังบันทึก..." : "บันทึกการตั้งค่าคำและข้อความทั้งหมด"}</span>
            </button>
          </div>
        </form>
      ) : (
        /* ================================================================= */
        /* SUB-TAB 1: ตารางจัดการและแก้ไขข้อมูล/คำในพอร์ตของนักเรียนแต่ละคน */
        /* ================================================================= */
        <>
          {/* 1. Overview Stats Cards */}
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5 sm:gap-4">
            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-gray-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-gray-500">พอร์ตนักเรียนทั้งหมด</p>
                <p className="text-2xl sm:text-3xl font-black text-gray-900 font-kanit mt-1">
                  {stats.total} <span className="text-xs font-normal text-gray-400">แฟ้ม</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                <FolderKanban className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-blue-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-blue-700">ส่งให้ครูตรวจ</p>
                <p className="text-2xl sm:text-3xl font-black text-blue-700 font-kanit mt-1">
                  {stats.submitted} <span className="text-xs font-normal text-blue-400">แฟ้ม</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-emerald-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-emerald-700">ตรวจผ่านแล้ว</p>
                <p className="text-2xl sm:text-3xl font-black text-emerald-700 font-kanit mt-1">
                  {stats.approved} <span className="text-xs font-normal text-emerald-500">แฟ้ม</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-5 h-5" />
              </div>
            </div>

            <div className="bg-white rounded-3xl p-4 sm:p-5 border border-rose-200/80 shadow-2xs flex items-center justify-between">
              <div>
                <p className="text-xs font-bold text-rose-700">ให้แก้ไขเพิ่มเติม</p>
                <p className="text-2xl sm:text-3xl font-black text-rose-700 font-kanit mt-1">
                  {stats.revision} <span className="text-xs font-normal text-rose-400">แฟ้ม</span>
                </p>
              </div>
              <div className="w-11 h-11 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center">
                <AlertCircle className="w-5 h-5" />
              </div>
            </div>
          </div>

          {/* 2. Search & Filter Bar */}
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-2xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
            <div className="flex flex-wrap items-center gap-3 flex-1">
              <div className="relative flex-1 min-w-[220px]">
                <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="ค้นหาชื่อนักเรียน, รหัสประจำตัว, มหาวิทยาลัย, คณะ/สาขา..."
                  className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 bg-gray-50/70 focus:bg-white text-xs text-gray-800 outline-none focus:border-teal-500"
                />
              </div>

              <select
                value={selectedClassroom}
                onChange={(e) => setSelectedClassroom(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">ทุกห้องเรียน</option>
                {classrooms.map((c) => (
                  <option key={c.id} value={c.name}>
                    ห้อง {c.name}
                  </option>
                ))}
              </select>

              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="h-10 px-3.5 rounded-xl border border-gray-200 bg-gray-50/70 text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">ทุกสถานะ</option>
                <option value="submitted">ส่งให้ครูตรวจ</option>
                <option value="approved">ครูตรวจผ่านแล้ว</option>
                <option value="revision">รอแก้ไขเพิ่มเติม</option>
                <option value="draft">กำลังจัดทำ (ฉบับร่าง)</option>
              </select>
            </div>

            <div className="flex items-center gap-2 self-end lg:self-center">
              <button
                type="button"
                onClick={fetchPortfolios}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs transition-colors cursor-pointer"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`} />
                <span>รีเฟรชข้อมูล</span>
              </button>
            </div>
          </div>

          {/* 3. Student Portfolios Table */}
          <div className="bg-white rounded-3xl border border-gray-200/80 shadow-2xs overflow-hidden">
            <div className="p-5 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div>
                <h3 className="font-bold text-gray-900 text-base font-kanit flex items-center gap-2">
                  <FolderKanban className="w-5 h-5 text-teal-600" />
                  <span>รายการแฟ้มสะสมผลงานนักเรียนรายบุคคล ({filteredList.length} คน)</span>
                </h3>
                <p className="text-xs text-gray-500 mt-0.5">
                  กดปุ่ม <strong>&quot;แก้ไขข้อมูล/แก้คำ&quot;</strong> เพื่อแก้ข้อความในพอร์ตของนักเรียนได้ทันทีในหน้านี้ หรือกด <strong>&quot;เปิดหน้า A4&quot;</strong> เพื่อจัดวางรูปและพิมพ์ PDF
                </p>
              </div>
            </div>

            {isLoading ? (
              <div className="p-14 text-center text-gray-400 text-xs space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-teal-600" />
                <p>กำลังโหลดข้อมูลแฟ้มสะสมผลงานนักเรียน...</p>
              </div>
            ) : filteredList.length === 0 ? (
              <div className="p-14 text-center text-gray-400 space-y-2">
                <FolderKanban className="w-10 h-10 mx-auto text-gray-300 stroke-[1.5]" />
                <p className="font-bold text-sm text-gray-700">ยังไม่มีรายการแฟ้มสะสมผลงานที่บันทึกในระบบ</p>
                <p className="text-xs text-gray-400 max-w-md mx-auto">
                  เมื่อนักเรียนเข้าสู่ระบบและกดบันทึกแฟ้มสะสมผลงานในหน้า /portfolio ข้อมูลพอร์ตของนักเรียนแต่ละคนจะซิงค์ขึ้นมาแสดงที่ตารางนี้โดยอัตโนมัติ
                </p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse text-xs">
                  <thead>
                    <tr className="bg-gray-50/90 border-b border-gray-200 text-gray-600 font-bold">
                      <th className="py-3.5 px-4">นักเรียน</th>
                      <th className="py-3.5 px-4">มหาวิทยาลัย / คณะ / สาขาที่สมัคร</th>
                      <th className="py-3.5 px-3 text-center">GPAX 4 / 5</th>
                      <th className="py-3.5 px-3 text-center">จำนวนผลงาน</th>
                      <th className="py-3.5 px-4">สถานะ & ข้อเสนอแนะครู</th>
                      <th className="py-3.5 px-4">อัปเดตล่าสุด</th>
                      <th className="py-3.5 px-4 text-right">จัดการ / แก้ไขข้อมูล</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100">
                    {filteredList.map((item) => (
                      <tr key={item.studentId} className="hover:bg-teal-50/20 transition-colors">
                        <td className="py-3.5 px-4 align-top">
                          <div className="font-bold text-gray-900 text-sm font-kanit">
                            {item.studentName}
                          </div>
                          <div className="flex items-center gap-1.5 mt-1">
                            <span className="px-2 py-0.5 rounded-md bg-orange-50 text-orange-700 border border-orange-200 font-mono font-bold text-[10.5px]">
                              {item.studentId}
                            </span>
                            {item.classroom && (
                              <span className="px-2 py-0.5 rounded-md bg-gray-100 text-gray-700 font-bold text-[10.5px]">
                                {item.classroom}
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 align-top max-w-xs">
                          <div className="font-bold text-[#13426b] text-xs flex items-center gap-1">
                            <Building2 className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            <span className="truncate">{item.university || "-"}</span>
                          </div>
                          <div className="text-gray-700 font-medium truncate mt-0.5">
                            {item.faculty} {item.major ? `• ${item.major}` : ""}
                          </div>
                          {item.projectRound && (
                            <div className="text-[11px] text-gray-400 truncate mt-0.5">
                              {item.projectRound}
                            </div>
                          )}
                        </td>

                        <td className="py-3.5 px-3 align-top text-center font-mono">
                          <div className="inline-flex flex-col items-center gap-0.5 bg-slate-50 px-2.5 py-1 rounded-xl border border-slate-200">
                            <span className="text-[10.5px] text-gray-500">
                              4 เทอม: <strong className="text-teal-700">{item.gpax4 || "-"}</strong>
                            </span>
                            <span className="text-[10.5px] text-gray-500">
                              5 เทอม: <strong className="text-teal-700">{item.gpax5 || "-"}</strong>
                            </span>
                          </div>
                        </td>

                        <td className="py-3.5 px-3 align-top text-center">
                          <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-bold border border-teal-200">
                            {item.entriesCount} รายการ
                          </span>
                        </td>

                        <td className="py-3.5 px-4 align-top max-w-[220px]">
                          <div>{renderStatusBadge(item.status)}</div>
                          {item.teacherFeedback && (
                            <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200 mt-1.5 italic line-clamp-2">
                              &quot;{item.teacherFeedback}&quot;
                            </p>
                          )}
                        </td>

                        <td className="py-3.5 px-4 align-top text-gray-500 whitespace-nowrap">
                          {item.updatedAt
                            ? new Date(item.updatedAt).toLocaleString("th-TH", {
                                dateStyle: "short",
                                timeStyle: "short",
                              })
                            : "-"}
                        </td>

                        <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                          <div className="inline-flex items-center justify-end gap-1.5">
                            <button
                              type="button"
                              onClick={() => handleOpenFullEditModal(item)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-2xs transition-all cursor-pointer no-min-h"
                              title="แก้ไขข้อมูลส่วนตัว มหาวิทยาลัย ผลงาน และแก้คำต่างๆ ในพอร์ตของนักเรียนคนนี้"
                            >
                              <Edit3 className="w-3.5 h-3.5" />
                              <span>แก้ไขข้อมูล/แก้คำ</span>
                            </button>

                            <Link
                              href={`/portfolio?studentId=${encodeURIComponent(item.studentId)}`}
                              target="_blank"
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-2xs transition-all no-min-h"
                              title="เปิดหน้ากระดาษ A4 เพื่อจัดวางรูปและสั่งพิมพ์ PDF"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>เปิดหน้า A4</span>
                              <ExternalLink className="w-3 h-3 opacity-80" />
                            </Link>

                            <button
                              type="button"
                              onClick={() => handleOpenReview(item)}
                              className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors cursor-pointer no-min-h"
                              title="ให้คำแนะนำ / รับรองสถานะพอร์ต"
                            >
                              <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                              <span>ติชม</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleDeletePortfolio(item)}
                              className="p-1.5 rounded-xl text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer no-min-h"
                              title="ลบข้อมูลพอร์ตนี้"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </>
      )}

      {/* ================================================================= */}
      {/* MODAL 1: FULL DATA & TEXT EDITOR FOR A STUDENT PORTFOLIO IN ADMIN */}
      {/* ================================================================= */}
      {editModalStudentId && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setEditModalStudentId(null)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-4xl w-full max-h-[90vh] flex flex-col overflow-hidden shadow-2xl border border-gray-200"
          >
            {/* Header */}
            <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between bg-slate-50/70">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                  <Edit3 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-kanit">
                    แก้ไขข้อมูลและแก้คำในแฟ้มสะสมผลงาน (รหัส {editModalStudentId})
                  </h3>
                  <p className="text-xs text-gray-500">
                    แอดมิน/ครูสามารถแก้คำผิด แก้ข้อมูลผู้สมัคร มหาวิทยาลัย ผลงาน รางวัล กิจกรรม และคำตอบได้ครบทุกช่อง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setEditModalStudentId(null)}
                className="w-8 h-8 rounded-full bg-white border border-gray-200 text-gray-500 hover:text-gray-800 flex items-center justify-center no-min-h"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {isLoadingEditData || !editPortfolioData ? (
              <div className="p-16 text-center text-gray-400 text-xs space-y-2">
                <RefreshCw className="w-6 h-6 animate-spin mx-auto text-indigo-600" />
                <p>กำลังโหลดข้อมูลทั้งหมดของพอร์ตนักเรียน...</p>
              </div>
            ) : (
              <form onSubmit={handleSaveFullEditModal} className="flex-1 overflow-y-auto p-5 sm:p-6 space-y-6 text-xs">
                {/* 1. ข้อมูลมหาวิทยาลัยและสถานะการตรวจ */}
                <div className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100 space-y-3">
                  <h4 className="font-bold text-indigo-950 text-sm font-kanit">
                    1. ข้อมูลสาขาวิชาที่สมัคร & สถานะการตรวจ
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">มหาวิทยาลัย / สถาบัน:</label>
                      <input
                        type="text"
                        value={editPortfolioData.university || ""}
                        onChange={(e) =>
                          setEditPortfolioData({ ...editPortfolioData, university: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">คณะ:</label>
                      <input
                        type="text"
                        value={editPortfolioData.faculty || ""}
                        onChange={(e) =>
                          setEditPortfolioData({ ...editPortfolioData, faculty: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">สาขาวิชา:</label>
                      <input
                        type="text"
                        value={editPortfolioData.major || ""}
                        onChange={(e) =>
                          setEditPortfolioData({ ...editPortfolioData, major: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">โครงการ / รอบที่สมัคร:</label>
                      <input
                        type="text"
                        value={editPortfolioData.projectRound || ""}
                        onChange={(e) =>
                          setEditPortfolioData({ ...editPortfolioData, projectRound: e.target.value })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">ห้องเรียน:</label>
                      <input
                        type="text"
                        value={editStudentClassroom}
                        onChange={(e) => setEditStudentClassroom(e.target.value)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">สถานะการตรวจ:</label>
                      <select
                        value={editStudentStatus}
                        onChange={(e) => setEditStudentStatus(e.target.value as any)}
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800 outline-none focus:border-indigo-500"
                      >
                        <option value="approved">✅ ครูตรวจผ่านแล้ว</option>
                        <option value="revision">⚠️ ให้แก้ไขเพิ่มเติม</option>
                        <option value="submitted">⏳ ส่งให้ครูตรวจ</option>
                        <option value="draft">📝 กำลังจัดทำ (ฉบับร่าง)</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="font-bold text-gray-700 block mb-1">ข้อเสนอแนะจากครูผู้สอน:</label>
                    <input
                      type="text"
                      value={editStudentFeedback}
                      onChange={(e) => setEditStudentFeedback(e.target.value)}
                      placeholder="พิมพ์คำแนะนำหรือคำชมให้นักเรียน..."
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800 outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                {/* 2. หมวด 1 ข้อมูลส่วนตัวและผลการเรียน */}
                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <h4 className="font-bold text-slate-900 text-sm font-kanit">
                    2. หมวด 1 • ข้อมูลผู้สมัคร ผู้ปกครอง และการศึกษา
                  </h4>
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">ชื่อ-นามสกุล (ภาษาไทย):</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.fullNameTh || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, fullNameTh: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">ชื่อ-นามสกุล (ภาษาอังกฤษ):</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.fullNameEn || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, fullNameEn: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">เบอร์โทรศัพท์:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.phone || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, phone: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">อีเมล:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.email || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, email: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">ชื่อผู้ปกครอง:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.parentName || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, parentName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">แผนการเรียน:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.studyPlan || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, studyPlan: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">GPAX 4 ภาคเรียน:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.gpax4 || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, gpax4: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-teal-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">GPAX 5 ภาคเรียน:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.gpax5 || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, gpax5: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-teal-700"
                      />
                    </div>
                    <div>
                      <label className="font-bold text-gray-700 block mb-1">โรงเรียน:</label>
                      <input
                        type="text"
                        value={editPortfolioData.profile?.schoolName || ""}
                        onChange={(e) =>
                          setEditPortfolioData({
                            ...editPortfolioData,
                            profile: { ...editPortfolioData.profile, schoolName: e.target.value },
                          })
                        }
                        className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white text-gray-800"
                      />
                    </div>
                  </div>
                </div>

                {/* 3. หมวด 2 เรียงความ */}
                {editPortfolioData.essay && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-2.5">
                    <h4 className="font-bold text-slate-900 text-sm font-kanit">
                      3. หมวด 2 • เรียงความ / เหตุผลในการสมัคร
                    </h4>
                    <input
                      type="text"
                      value={editPortfolioData.essay.title || ""}
                      onChange={(e) =>
                        setEditPortfolioData({
                          ...editPortfolioData,
                          essay: { ...editPortfolioData.essay, title: e.target.value },
                        })
                      }
                      className="w-full px-3 py-2 rounded-xl border border-gray-200 bg-white font-bold text-gray-800"
                    />
                    <textarea
                      rows={3}
                      value={editPortfolioData.essay.content || ""}
                      onChange={(e) =>
                        setEditPortfolioData({
                          ...editPortfolioData,
                          essay: { ...editPortfolioData.essay, content: e.target.value },
                        })
                      }
                      className="w-full p-3 rounded-xl border border-gray-200 bg-white text-gray-800 leading-relaxed"
                    />
                  </div>
                )}

                {/* 4. หมวด 4 รางวัล ผลงาน และกิจกรรมทั้งหมด */}
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <h4 className="font-bold text-slate-900 text-sm font-kanit">
                      4. หมวด 4 • แก้คำและรายละเอียดผลงาน รางวัล และกิจกรรม ({Array.isArray(editPortfolioData.entries) ? editPortfolioData.entries.length : 0} รายการ)
                    </h4>
                  </div>

                  {Array.isArray(editPortfolioData.entries) &&
                    editPortfolioData.entries.map((entry: any, idx: number) => (
                      <div
                        key={entry.id || idx}
                        className="p-4 rounded-2xl border border-gray-200 bg-white space-y-2.5 shadow-2xs"
                      >
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <span className="px-2.5 py-0.5 rounded-full bg-[#13426b] text-white font-bold text-[11px]">
                            รายการที่ {idx + 1} (หมวด {entry.category})
                          </span>
                          <button
                            type="button"
                            onClick={() =>
                              setEditPortfolioData({
                                ...editPortfolioData,
                                entries: editPortfolioData.entries.filter((_: any, i: number) => i !== idx),
                              })
                            }
                            className="text-red-500 hover:text-red-700 font-bold text-[11px] flex items-center gap-1 no-min-h"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            <span>ลบรายการนี้</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                          <div className="sm:col-span-2">
                            <label className="font-bold text-gray-600 block mb-0.5">หัวข้อผลงาน / รางวัล / กิจกรรม:</label>
                            <input
                              type="text"
                              value={entry.title || ""}
                              onChange={(e) => {
                                const next = [...editPortfolioData.entries];
                                next[idx] = { ...next[idx], title: e.target.value };
                                setEditPortfolioData({ ...editPortfolioData, entries: next });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 font-bold text-gray-900"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-600 block mb-0.5">ผลรางวัล / อันดับ / บทบาท:</label>
                            <input
                              type="text"
                              value={entry.awardResult || ""}
                              onChange={(e) => {
                                const next = [...editPortfolioData.entries];
                                next[idx] = { ...next[idx], awardResult: e.target.value };
                                setEditPortfolioData({ ...editPortfolioData, entries: next });
                              }}
                              className="w-full px-3 py-1.5 rounded-xl border border-gray-200 text-gray-800"
                            />
                          </div>

                          <div>
                            <label className="font-bold text-gray-600 block mb-0.5">หน่วยงานผู้จัด / วันที่:</label>
                            <div className="flex gap-2">
                              <input
                                type="text"
                                value={entry.dateStr || ""}
                                onChange={(e) => {
                                  const next = [...editPortfolioData.entries];
                                  next[idx] = { ...next[idx], dateStr: e.target.value };
                                  setEditPortfolioData({ ...editPortfolioData, entries: next });
                                }}
                                placeholder="วันที่..."
                                className="w-1/3 px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-800"
                              />
                              <input
                                type="text"
                                value={entry.organization || ""}
                                onChange={(e) => {
                                  const next = [...editPortfolioData.entries];
                                  next[idx] = { ...next[idx], organization: e.target.value };
                                  setEditPortfolioData({ ...editPortfolioData, entries: next });
                                }}
                                placeholder="หน่วยงาน..."
                                className="flex-1 px-2.5 py-1.5 rounded-xl border border-gray-200 text-gray-800"
                              />
                            </div>
                          </div>

                          <div className="sm:col-span-2">
                            <label className="font-bold text-gray-600 block mb-0.5">รายละเอียด:</label>
                            <textarea
                              rows={2}
                              value={entry.description || ""}
                              onChange={(e) => {
                                const next = [...editPortfolioData.entries];
                                next[idx] = { ...next[idx], description: e.target.value };
                                setEditPortfolioData({ ...editPortfolioData, entries: next });
                              }}
                              className="w-full p-2.5 rounded-xl border border-gray-200 text-gray-800 leading-relaxed"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                </div>

                {/* 5. หมวด 5 คำถามเพิ่มเติม */}
                {Array.isArray(editPortfolioData.questions) && editPortfolioData.questions.length > 0 && (
                  <div className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                    <h4 className="font-bold text-slate-900 text-sm font-kanit">
                      5. หมวด 5 • คำถามเพิ่มเติมของหลักสูตร
                    </h4>
                    {editPortfolioData.questions.map((q: any, qIdx: number) => (
                      <div key={q.id || qIdx} className="space-y-1.5">
                        <input
                          type="text"
                          value={q.question || ""}
                          onChange={(e) => {
                            const next = [...editPortfolioData.questions];
                            next[qIdx] = { ...next[qIdx], question: e.target.value };
                            setEditPortfolioData({ ...editPortfolioData, questions: next });
                          }}
                          className="w-full px-3 py-1.5 rounded-xl border border-gray-200 bg-white font-bold text-gray-900"
                        />
                        <textarea
                          rows={2}
                          value={q.answer || ""}
                          onChange={(e) => {
                            const next = [...editPortfolioData.questions];
                            next[qIdx] = { ...next[qIdx], answer: e.target.value };
                            setEditPortfolioData({ ...editPortfolioData, questions: next });
                          }}
                          className="w-full p-2.5 rounded-xl border border-gray-200 bg-white text-gray-800 leading-relaxed"
                        />
                      </div>
                    ))}
                  </div>
                )}

                <div className="flex items-center justify-end gap-2 pt-4 border-t border-gray-100 sticky bottom-0 bg-white py-3">
                  <button
                    type="button"
                    onClick={() => setEditModalStudentId(null)}
                    className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs no-min-h"
                  >
                    ยกเลิก
                  </button>
                  <button
                    type="submit"
                    disabled={isSavingEditData}
                    className="inline-flex items-center gap-1.5 px-6 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-xs shadow-md disabled:opacity-50 no-min-h"
                  >
                    <Save className="w-3.5 h-3.5" />
                    <span>{isSavingEditData ? "กำลังบันทึก..." : "บันทึกการแก้ไขข้อมูลและข้อความทั้งหมด"}</span>
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: QUICK REVIEW & FEEDBACK */}
      {/* ================================================================= */}
      {reviewModalItem && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4"
          onClick={() => setReviewModalItem(null)}
        >
          <form
            onSubmit={handleSaveReview}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-lg w-full p-6 space-y-5 shadow-2xl border border-gray-100 animate-in zoom-in-95 duration-150"
          >
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-teal-50 text-teal-600 flex items-center justify-center">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-gray-900 text-base font-kanit">
                    ตรวจประเมินและให้ข้อเสนอแนะแฟ้มสะสมผลงาน
                  </h3>
                  <p className="text-xs text-gray-500">
                    {reviewModalItem.studentName} (รหัส {reviewModalItem.studentId})
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="w-8 h-8 rounded-full bg-gray-100 text-gray-500 hover:text-gray-800 flex items-center justify-center no-min-h"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  สถานะการตรวจแฟ้มสะสมผลงาน:
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {[
                    { value: "approved", label: "✅ ครูตรวจผ่านแล้ว", desc: "ข้อมูลและรูปภาพครบถ้วนสมบูรณ์" },
                    { value: "revision", label: "⚠️ ให้แก้ไขเพิ่มเติม", desc: "แจ้งจุดที่ควรปรับปรุงให้นักเรียนทราบ" },
                    { value: "submitted", label: "⏳ ส่งให้ครูตรวจ", desc: "รอครูตรวจสอบรายละเอียด" },
                    { value: "draft", label: "📝 กำลังจัดทำ (ร่าง)", desc: "นักเรียนกำลังทยอยใส่ข้อมูล" },
                  ].map((st) => (
                    <button
                      key={st.value}
                      type="button"
                      onClick={() => setReviewStatus(st.value as any)}
                      className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                        reviewStatus === st.value
                          ? "border-teal-600 bg-teal-50/70 ring-2 ring-teal-500/20"
                          : "border-gray-200 hover:bg-gray-50"
                      }`}
                    >
                      <div className="font-bold text-gray-900">{st.label}</div>
                      <div className="text-[10.5px] text-gray-500 mt-0.5">{st.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-bold text-gray-700 block mb-1.5">
                  ข้อเสนอแนะจากครูผู้สอน (แสดงให้นักเรียนเห็นบนหน้าพอร์ตของตนเอง):
                </label>
                <textarea
                  rows={4}
                  value={reviewFeedback}
                  onChange={(e) => setReviewFeedback(e.target.value)}
                  placeholder="เช่น การจัดวางรูปผลงานหมวด 4.2 สวยงามมาก แนะนำให้เพิ่มคำอธิบายเทคนิคสีน้ำในข้อที่ 2 อีกเล็กน้อย..."
                  className="w-full p-3 rounded-2xl border border-gray-200 focus:border-teal-500 outline-none text-xs text-gray-800 leading-relaxed resize-y"
                />
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-gray-100">
              <button
                type="button"
                onClick={() => setReviewModalItem(null)}
                className="px-4 py-2 rounded-xl bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs no-min-h"
              >
                ยกเลิก
              </button>
              <button
                type="submit"
                disabled={isSavingReview}
                className="inline-flex items-center gap-1.5 px-5 py-2 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-sm disabled:opacity-50 no-min-h"
              >
                <Save className="w-3.5 h-3.5" />
                <span>{isSavingReview ? "กำลังบันทึก..." : "บันทึกผลการตรวจ"}</span>
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
