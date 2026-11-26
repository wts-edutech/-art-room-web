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
  FileText
} from "lucide-react";
import { swalToast, swalConfirm, swalSuccess, swalError } from "@/lib/swal";

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
  const [portfolios, setPortfolios] = useState<PortfolioSummaryItem[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedClassroom, setSelectedClassroom] = useState("all");
  const [selectedStatus, setSelectedStatus] = useState("all");

  // Modal for reviewing & giving feedback on a student's portfolio
  const [reviewModalItem, setReviewModalItem] = useState<PortfolioSummaryItem | null>(null);
  const [reviewStatus, setReviewStatus] = useState<"draft" | "submitted" | "approved" | "revision">("approved");
  const [reviewFeedback, setReviewFeedback] = useState("");
  const [isSavingReview, setIsSavingReview] = useState(false);

  const fetchPortfolios = async () => {
    setIsLoading(true);
    try {
      const [resPortfolios, resRooms] = await Promise.all([
        fetch("/api/portfolios?all=true", { cache: "no-store" }),
        fetch("/api/classrooms"),
      ]);

      if (resPortfolios.ok) {
        const data: any = await resPortfolios.json();
        setPortfolios(Array.isArray(data) ? data : []);
      }
      if (resRooms.ok) {
        const rData: any = await resRooms.json();
        setClassrooms(Array.isArray(rData) ? rData : []);
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
          {/* Search Input */}
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

          {/* Classroom Filter */}
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

          {/* Status Filter */}
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
              ครูผู้สอนสามารถกด <strong>&quot;เปิดดู / แก้ไขพอร์ต&quot;</strong> เพื่อเข้าไปช่วยจัดหน้า ตรวจทาน หรือสั่งพิมพ์ PDF ของนักเรียนแต่ละคนได้ทันที
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
                  <th className="py-3.5 px-4 text-right">จัดการ / ตรวจพอร์ต</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredList.map((item) => (
                  <tr key={item.studentId} className="hover:bg-teal-50/20 transition-colors">
                    {/* Student Info */}
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

                    {/* Target University & Major */}
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

                    {/* GPAX */}
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

                    {/* Entries count */}
                    <td className="py-3.5 px-3 align-top text-center">
                      <span className="inline-flex items-center justify-center px-2.5 py-1 rounded-xl bg-teal-50 text-teal-800 font-bold border border-teal-200">
                        {item.entriesCount} รายการ
                      </span>
                    </td>

                    {/* Status & Feedback */}
                    <td className="py-3.5 px-4 align-top max-w-[220px]">
                      <div>{renderStatusBadge(item.status)}</div>
                      {item.teacherFeedback && (
                        <p className="text-[11px] text-gray-600 bg-gray-50 p-2 rounded-xl border border-gray-200 mt-1.5 italic line-clamp-2">
                          &quot;{item.teacherFeedback}&quot;
                        </p>
                      )}
                    </td>

                    {/* Updated At */}
                    <td className="py-3.5 px-4 align-top text-gray-500 whitespace-nowrap">
                      {item.updatedAt
                        ? new Date(item.updatedAt).toLocaleString("th-TH", {
                            dateStyle: "short",
                            timeStyle: "short",
                          })
                        : "-"}
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 align-top text-right whitespace-nowrap">
                      <div className="inline-flex items-center justify-end gap-1.5">
                        <Link
                          href={`/portfolio?studentId=${encodeURIComponent(item.studentId)}`}
                          target="_blank"
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-2xs transition-all no-min-h"
                          title="เปิดดูและแก้ไขแฟ้มสะสมผลงานของนักเรียนคนนี้"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>เปิดดู / แก้ไขพอร์ต</span>
                          <ExternalLink className="w-3 h-3 opacity-80" />
                        </Link>

                        <button
                          type="button"
                          onClick={() => handleOpenReview(item)}
                          className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-800 border border-amber-200 font-bold text-xs transition-colors cursor-pointer no-min-h"
                          title="ให้คำแนะนำ / รับรองสถานะพอร์ต"
                        >
                          <MessageSquare className="w-3.5 h-3.5 text-amber-600" />
                          <span>ตรวจ/ติชม</span>
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

      {/* 4. Review & Feedback Modal */}
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
