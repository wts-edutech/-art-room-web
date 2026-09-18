"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Calendar, 
  BookOpen, 
  Users, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  Layers, 
  Sparkles,
  AlertCircle,
  Clock
} from "lucide-react";

export default function TeachingSetupTab() {
  const [activeSection, setActiveSection] = useState<"years" | "subjects" | "classrooms">("years");

  // Academic Years state
  const [years, setYears] = useState<any[]>([]);
  const [newYear, setNewYear] = useState("2567");
  const [newSemester, setNewSemester] = useState("1");
  const [isLoadingYears, setIsLoadingYears] = useState(false);

  // Subjects state
  const [subjects, setSubjects] = useState<any[]>([]);
  const [subjectCode, setSubjectCode] = useState("");
  const [subjectName, setSubjectName] = useState("");
  const [subjectGrade, setSubjectGrade] = useState("ม.3");
  const [isLoadingSubjects, setIsLoadingSubjects] = useState(false);

  // Classrooms state
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [customRoomName, setCustomRoomName] = useState("");
  const [customRoomGrade, setCustomRoomGrade] = useState("ม.3");
  const [batchGrade, setBatchGrade] = useState("ม.3");
  const [batchCount, setBatchCount] = useState("14");
  const [isLoadingRooms, setIsLoadingRooms] = useState(false);

  const fetchYears = async () => {
    setIsLoadingYears(true);
    try {
      const res = await fetch("/api/academic-years");
      const data = await res.json();
      setYears(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingYears(false);
    }
  };

  const fetchSubjects = async () => {
    setIsLoadingSubjects(true);
    try {
      const res = await fetch("/api/subjects");
      const data = await res.json();
      setSubjects(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingSubjects(false);
    }
  };

  const fetchClassrooms = async () => {
    setIsLoadingRooms(true);
    try {
      const res = await fetch("/api/classrooms");
      const data = await res.json();
      setClassrooms(Array.isArray(data) ? data : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoadingRooms(false);
    }
  };

  useEffect(() => {
    fetchYears();
    fetchSubjects();
    fetchClassrooms();
  }, []);

  // Handlers for Academic Years
  const handleAddYear = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newYear || !newSemester) return;

    try {
      const res = await fetch("/api/academic-years", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ year: newYear, semester: newSemester, isActive: true }),
      });
      if (res.ok) {
        fetchYears();
        alert("เพิ่มปีการศึกษาสำเร็จ!");
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleSetActiveYear = async (id: string) => {
    try {
      const res = await fetch("/api/academic-years", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: true }),
      });
      if (res.ok) {
        fetchYears();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteYear = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบปีการศึกษานี้?")) return;
    try {
      const res = await fetch(`/api/academic-years?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchYears();
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Subjects
  const handleAddSubject = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!subjectCode || !subjectName || !subjectGrade) return;

    try {
      const res = await fetch("/api/subjects", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: subjectCode,
          name: subjectName,
          gradeLevel: subjectGrade,
        }),
      });
      if (res.ok) {
        setSubjectCode("");
        setSubjectName("");
        fetchSubjects();
        alert("เพิ่มรายวิชาสำเร็จ!");
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteSubject = async (id: string, name: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบวิชา "${name}"?`)) return;
    try {
      const res = await fetch(`/api/subjects?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchSubjects();
    } catch (e) {
      console.error(e);
    }
  };

  // Handlers for Classrooms
  const handleAddCustomRoom = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!customRoomName) return;

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: customRoomName,
          gradeLevel: customRoomGrade,
        }),
      });
      if (res.ok) {
        setCustomRoomName("");
        fetchClassrooms();
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleBatchGenerateRooms = async () => {
    if (!confirm(`ต้องการสร้างห้อง ${batchGrade}/1 ถึง ${batchGrade}/${batchCount} อัตโนมัติหรือไม่?`)) return;

    try {
      const res = await fetch("/api/classrooms", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          batchGenerate: true,
          grade: batchGrade,
          count: batchCount,
        }),
      });
      if (res.ok) {
        fetchClassrooms();
        alert(`สร้างห้องเรียนระดับชั้น ${batchGrade} สำเร็จ!`);
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDeleteRoom = async (id: string) => {
    try {
      const res = await fetch(`/api/classrooms?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchClassrooms();
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="space-y-6">
      {/* Navigation Sub-Tabs */}
      <div className="flex bg-gray-100/80 p-1 rounded-xl w-full sm:w-fit border border-gray-200/80">
        <button
          onClick={() => setActiveSection("years")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === "years"
              ? "bg-white text-orange-600 shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Calendar className="w-3.5 h-3.5" />
          <span>1. ปีการศึกษา ({years.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("subjects")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === "subjects"
              ? "bg-white text-orange-600 shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <BookOpen className="w-3.5 h-3.5" />
          <span>2. รายวิชาที่สอน ({subjects.length})</span>
        </button>

        <button
          onClick={() => setActiveSection("classrooms")}
          className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
            activeSection === "classrooms"
              ? "bg-white text-orange-600 shadow-2xs"
              : "text-gray-600 hover:text-gray-900"
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>3. ห้องเรียน ({classrooms.length})</span>
        </button>
      </div>

      {/* SECTION 1: ACADEMIC YEARS */}
      {activeSection === "years" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Add Year Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <Plus className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base">เพิ่มปีการศึกษาใหม่</h3>
              </div>

              <form onSubmit={handleAddYear} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ปีการศึกษา (พ.ศ.)
                  </label>
                  <input
                    type="text"
                    required
                    value={newYear}
                    onChange={(e) => setNewYear(e.target.value)}
                    placeholder="เช่น 2567"
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-mono"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ภาคเรียนที่
                  </label>
                  <select
                    value={newSemester}
                    onChange={(e) => setNewSemester(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs"
                  >
                    <option value="1">ภาคเรียนที่ 1</option>
                    <option value="2">ภาคเรียนที่ 2</option>
                    <option value="ฤดูร้อน">ภาคฤดูร้อน</option>
                  </select>
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs"
                  >
                    เพิ่มปีการศึกษา
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Academic Years List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base">รายการปีการศึกษาทั้งหมด</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    คลิกเพื่อตั้งเป็น &quot;ภาคเรียนปัจจุบัน&quot; ที่เปิดสอน
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 divide-y divide-gray-100">
                {years.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <Calendar className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">ยังไม่มีปีการศึกษาในระบบ</p>
                  </div>
                ) : (
                  years.map((y) => (
                    <div
                      key={y.id}
                      className="py-3 flex flex-col sm:flex-row sm:items-center justify-between gap-3 group"
                    >
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                            y.isActive
                              ? "bg-emerald-100 text-emerald-700 ring-2 ring-emerald-500/30"
                              : "bg-gray-100 text-gray-500"
                          }`}
                        >
                          {y.semester}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-gray-900 text-xs sm:text-sm">
                              {y.name}
                            </span>
                            {y.isActive && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ภาคเรียนปัจจุบัน
                              </span>
                            )}
                          </div>
                          <span className="text-[11px] text-gray-400 font-mono">
                            รหัสอ้างอิง: {y.id}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2 self-end sm:self-center">
                        {!y.isActive ? (
                          <button
                            type="button"
                            onClick={() => handleSetActiveYear(y.id)}
                            className="h-7.5 px-2.5 rounded-lg border border-gray-200 text-xs font-medium text-gray-600 hover:bg-emerald-50 hover:text-emerald-700 hover:border-emerald-200 transition-colors cursor-pointer"
                          >
                            ตั้งเป็นปีปัจจุบัน
                          </button>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-xs font-bold text-emerald-600 px-2">
                            <CheckCircle2 className="w-3.5 h-3.5" /> ใช้งานอยู่
                          </span>
                        )}

                        <button
                          type="button"
                          onClick={() => handleDeleteYear(y.id)}
                          className="h-7.5 w-7.5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                          title="ลบ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 2: SUBJECTS */}
      {activeSection === "subjects" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Add Subject Form */}
          <div className="lg:col-span-1">
            <div className="bg-white rounded-2xl p-5 shadow-2xs border border-gray-200">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-gray-100">
                <BookOpen className="w-4 h-4 text-orange-500" />
                <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base">เพิ่มรายวิชาที่สอน</h3>
              </div>

              <form onSubmit={handleAddSubject} className="space-y-3.5">
                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ระดับชั้นที่สอน
                  </label>
                  <select
                    value={subjectGrade}
                    onChange={(e) => setSubjectGrade(e.target.value)}
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-medium"
                  >
                    <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                    <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                    <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                    <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                    <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                    <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                  </select>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    รหัสวิชา
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectCode}
                    onChange={(e) => setSubjectCode(e.target.value)}
                    placeholder="เช่น ศ23101"
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs font-mono uppercase"
                  />
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-700 block mb-1">
                    ชื่อรายวิชา
                  </label>
                  <input
                    type="text"
                    required
                    value={subjectName}
                    onChange={(e) => setSubjectName(e.target.value)}
                    placeholder="เช่น ทัศนศิลป์ 5 (ศิลปะ 3)"
                    className="w-full h-9 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs"
                  />
                </div>

                <div className="pt-1">
                  <Button
                    type="submit"
                    className="w-full h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-semibold text-xs shadow-xs"
                  >
                    บันทึกรายวิชา
                  </Button>
                </div>
              </form>
            </div>
          </div>

          {/* Subjects List */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
              <div className="px-5 py-3.5 border-b border-gray-100 bg-gray-50/70 flex items-center justify-between">
                <div>
                  <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base">รายวิชาศิลปะที่เปิดสอน</h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    วิชาเหล่านี้จะนำไปใช้ในการมอบหมายงานและส่งงานของนักเรียน
                  </p>
                </div>
              </div>

              <div className="p-4 sm:p-5 divide-y divide-gray-100">
                {subjects.length === 0 ? (
                  <div className="text-center py-10 text-gray-400">
                    <BookOpen className="w-8 h-8 mx-auto mb-2 opacity-30" />
                    <p className="text-xs font-medium">ยังไม่มีรายวิชาในระบบ</p>
                  </div>
                ) : (
                  subjects.map((sub) => (
                    <div
                      key={sub.id}
                      className="py-3 flex items-center justify-between gap-3 hover:bg-orange-50/30 px-2.5 rounded-xl transition-colors"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-8 rounded-lg bg-orange-50 border border-orange-200 text-orange-700 flex items-center justify-center font-bold text-xs font-mono">
                          {sub.gradeLevel}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono font-bold text-gray-900 text-xs sm:text-sm">
                              {sub.code}
                            </span>
                            <span className="font-semibold text-gray-800 text-xs sm:text-sm">
                              {sub.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-400">
                            ระดับชั้น {sub.gradeLevel}
                          </span>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDeleteSubject(sub.id, sub.name)}
                        className="h-7.5 w-7.5 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors cursor-pointer"
                        title="ลบรายวิชา"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 3: CLASSROOMS */}
      {activeSection === "classrooms" && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-200">
          {/* Batch Generator & Single Add */}
          <div className="lg:col-span-1 space-y-5">
            {/* Quick Batch Generator */}
            <div className="bg-gradient-to-br from-orange-500 to-amber-500 rounded-2xl p-4 sm:p-5 text-white shadow-xs">
              <div className="flex items-center gap-2 mb-2 pb-2 border-b border-white/20">
                <Sparkles className="w-4 h-4 text-yellow-200" />
                <h3 className="font-bold text-sm sm:text-base font-kanit">สร้างชุดห้องเรียนอัตโนมัติ</h3>
              </div>
              <p className="text-[11px] text-orange-100 mb-3 leading-relaxed font-light">
                สร้างห้องเรียนเป็นชุดรวดเดียว เช่น สร้าง ม.3/1 ถึง ม.3/14 โดยไม่ต้องพิมพ์ทีละห้อง
              </p>

              <div className="space-y-2.5 font-prompt">
                <div>
                  <label className="text-[11px] font-semibold text-orange-100 block mb-1">
                    ระดับชั้น
                  </label>
                  <select
                    value={batchGrade}
                    onChange={(e) => setBatchGrade(e.target.value)}
                    className="w-full h-8.5 px-2.5 rounded-lg bg-white text-gray-900 outline-none text-xs font-semibold"
                  >
                    <option value="ม.1">มัธยมศึกษาปีที่ 1 (ม.1)</option>
                    <option value="ม.2">มัธยมศึกษาปีที่ 2 (ม.2)</option>
                    <option value="ม.3">มัธยมศึกษาปีที่ 3 (ม.3)</option>
                    <option value="ม.4">มัธยมศึกษาปีที่ 4 (ม.4)</option>
                    <option value="ม.5">มัธยมศึกษาปีที่ 5 (ม.5)</option>
                    <option value="ม.6">มัธยมศึกษาปีที่ 6 (ม.6)</option>
                  </select>
                </div>

                <div>
                  <label className="text-[11px] font-semibold text-orange-100 block mb-1">
                    จำนวนห้อง (ห้อง 1 ถึง ...)
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="20"
                    value={batchCount}
                    onChange={(e) => setBatchCount(e.target.value)}
                    className="w-full h-8.5 px-2.5 rounded-lg bg-white text-gray-900 outline-none text-xs font-bold"
                  />
                </div>

                <button
                  type="button"
                  onClick={handleBatchGenerateRooms}
                  className="w-full py-2 rounded-lg bg-white text-orange-600 hover:bg-orange-50 font-bold text-xs shadow-2xs transition-transform active:scale-95 cursor-pointer mt-1"
                >
                  🚀 สร้างห้อง {batchGrade}/1 - {batchGrade}/{batchCount}
                </button>
              </div>
            </div>

            {/* Custom Room Add */}
            <div className="bg-white rounded-2xl p-4 sm:p-5 shadow-2xs border border-gray-200">
              <h3 className="font-bold font-kanit text-gray-900 text-xs sm:text-sm mb-2.5">หรือเพิ่มห้องเรียนเดี่ยว</h3>
              <form onSubmit={handleAddCustomRoom} className="space-y-2.5">
                <div>
                  <input
                    type="text"
                    required
                    value={customRoomName}
                    onChange={(e) => setCustomRoomName(e.target.value)}
                    placeholder="เช่น ม.3/14 หรือ ม.EP"
                    className="w-full h-8.5 px-3 rounded-lg border border-gray-200 outline-none text-xs"
                  />
                </div>
                <Button
                  type="submit"
                  className="w-full h-8.5 rounded-lg bg-gray-800 hover:bg-gray-900 text-white font-semibold text-xs"
                >
                  เพิ่มห้องนี้
                </Button>
              </form>
            </div>
          </div>

          {/* Classrooms List Grid */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 p-4 sm:p-5">
              <div className="flex items-center justify-between pb-3 mb-3.5 border-b border-gray-100">
                <div>
                  <h3 className="font-bold font-kanit text-gray-900 text-sm sm:text-base">
                    ห้องเรียนทั้งหมด ({classrooms.length} ห้อง)
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    ห้องเรียนที่ใช้กำหนดการมอบหมายงานและรายชื่อนักเรียน
                  </p>
                </div>
              </div>

              {classrooms.length === 0 ? (
                <div className="text-center py-12 text-gray-400">
                  <Users className="w-10 h-10 mx-auto mb-2 opacity-30" />
                  <p className="text-xs font-medium">ยังไม่มีห้องเรียนในระบบ กดปุ่มสร้างชุดห้องเรียนด้านซ้ายได้เลยครับ</p>
                </div>
              ) : (
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 xl:grid-cols-5 gap-2.5">
                  {classrooms.map((room) => (
                    <div
                      key={room.id}
                      className="p-2.5 rounded-xl border border-gray-200 bg-gray-50/60 flex items-center justify-between hover:border-orange-300 hover:bg-orange-50/50 transition-colors group"
                    >
                      <span className="font-bold text-xs text-gray-800 font-kanit">
                        {room.name}
                      </span>
                      <button
                        type="button"
                        onClick={() => handleDeleteRoom(room.id)}
                        className="w-5 h-5 rounded-md text-gray-400 hover:text-red-600 hover:bg-red-50 flex items-center justify-center transition-colors cursor-pointer"
                        title="ลบห้องนี้"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
