"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { 
  Plus, 
  FileText, 
  Calendar, 
  Clock, 
  Trash2, 
  Edit3, 
  CheckCircle, 
  Users, 
  AlertCircle,
  Eye,
  Check,
  Search,
  UserCheck,
  Filter,
  X,
  CheckSquare,
  Square
} from "lucide-react";

export default function AssignmentsTab({ onGoToGrading }: { onGoToGrading?: (assignmentId: string) => void }) {
  const [assignments, setAssignments] = useState<any[]>([]);
  const [subjects, setSubjects] = useState<any[]>([]);
  const [classrooms, setClassrooms] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  // Form State
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [selectedSubjectId, setSelectedSubjectId] = useState("");
  const [selectedRooms, setSelectedRooms] = useState<string[]>([]);
  const [targetMode, setTargetMode] = useState<"all" | "selective">("all");
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [studentSearchTerm, setStudentSearchTerm] = useState("");
  const [studentClassFilter, setStudentClassFilter] = useState("all");
  const [maxScore, setMaxScore] = useState("10");
  const [dueDate, setDueDate] = useState("");
  const [isActive, setIsActive] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const [resAss, resSub, resRooms, resStud] = await Promise.all([
        fetch("/api/assignments"),
        fetch("/api/subjects"),
        fetch("/api/classrooms"),
        fetch("/api/students"),
      ]);

      const [dataAss, dataSub, dataRooms, dataStud] = await Promise.all([
        resAss.json(),
        resSub.json(),
        resRooms.json(),
        resStud.json(),
      ]);

      setAssignments(Array.isArray(dataAss) ? dataAss : []);
      setSubjects(Array.isArray(dataSub) ? dataSub : []);
      setClassrooms(Array.isArray(dataRooms) ? dataRooms : []);
      setStudents(Array.isArray(dataStud) ? dataStud : []);
    } catch (e) {
      console.error(e);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const resetForm = () => {
    setTitle("");
    setDescription("");
    setSelectedSubjectId("");
    setSelectedRooms([]);
    setTargetMode("all");
    setSelectedStudents([]);
    setStudentSearchTerm("");
    setStudentClassFilter("all");
    setMaxScore("10");
    setDueDate("");
    setIsActive(true);
    setEditingId(null);
    setIsFormOpen(false);
  };

  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setTitle(item.title || "");
    setDescription(item.description || "");
    setSelectedSubjectId(
      item.subject?.name
        ? (item.subject.code ? `${item.subject.code} - ${item.subject.name}` : item.subject.name)
        : (item.subjectId || "")
    );
    setSelectedRooms(item.classroomsList || []);
    
    if (item.targetStudentsList && Array.isArray(item.targetStudentsList) && item.targetStudentsList.length > 0) {
      setTargetMode("selective");
      setSelectedStudents(item.targetStudentsList);
    } else {
      setTargetMode("all");
      setSelectedStudents([]);
    }

    setMaxScore(String(item.maxScore || 10));
    setDueDate(item.dueDate || "");
    setIsActive(Boolean(item.isActive));
    setIsFormOpen(true);
  };

  const handleToggleRoom = (roomName: string) => {
    setSelectedRooms((prev) =>
      prev.includes(roomName) ? prev.filter((r) => r !== roomName) : [...prev, roomName]
    );
  };

  const handleSelectAllRoomsForGrade = (grade: string) => {
    const roomsOfGrade = classrooms.filter((r) => r.gradeLevel === grade).map((r) => r.name);
    const allSelected = roomsOfGrade.every((r) => selectedRooms.includes(r));
    if (allSelected) {
      setSelectedRooms((prev) => prev.filter((r) => !roomsOfGrade.includes(r)));
    } else {
      setSelectedRooms((prev) => Array.from(new Set([...prev, ...roomsOfGrade])));
    }
  };

  const handleToggleStudent = (studentId: string) => {
    setSelectedStudents((prev) =>
      prev.includes(studentId)
        ? prev.filter((id) => id !== studentId)
        : [...prev, studentId]
    );
  };

  const handleSelectAllFilteredStudents = () => {
    const idsToAdd = filteredStudents.map((s) => s.id);
    setSelectedStudents((prev) => Array.from(new Set([...prev, ...idsToAdd])));
  };

  const handleDeselectAllFilteredStudents = () => {
    const idsToRemove = new Set(filteredStudents.map((s) => s.id));
    setSelectedStudents((prev) => prev.filter((id) => !idsToRemove.has(id)));
  };

  // Filter students based on search term and room filter
  const filteredStudents = students.filter((s) => {
    const searchLower = studentSearchTerm.trim().toLowerCase();
    const matchSearch =
      !searchLower ||
      (s.id && String(s.id).toLowerCase().includes(searchLower)) ||
      (s.name && String(s.name).toLowerCase().includes(searchLower));

    const matchClass =
      studentClassFilter === "all" ||
      (s.classroom && s.classroom === studentClassFilter);

    return matchSearch && matchClass;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title || !selectedSubjectId) {
      alert("กรุณาระบุชื่องานและวิชาที่มอบหมาย");
      return;
    }

    if (targetMode === "selective" && selectedStudents.length === 0) {
      alert("กรุณาเลือกนักเรียนอย่างน้อย 1 คน หรือเลือกโหมด 'มอบหมายทั้งห้องเรียน'");
      return;
    }

    try {
      const payload = {
        id: editingId,
        title,
        description,
        subjectId: selectedSubjectId,
        classrooms: selectedRooms,
        targetStudents: targetMode === "selective" ? selectedStudents : null,
        maxScore: Number(maxScore) || 10,
        dueDate: dueDate || null,
        isActive,
      };

      const res = await fetch("/api/assignments", {
        method: editingId ? "PUT" : "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        resetForm();
        fetchData();
        alert(editingId ? "อัปเดตงานสำเร็จ!" : "สร้างงานใหม่สำเร็จ!");
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาด");
      }
    } catch (e) {
      console.error(e);
    }
  };

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบงาน "${title}"?`)) return;
    try {
      const res = await fetch(`/api/assignments?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  const handleToggleActive = async (id: string, current: boolean) => {
    try {
      const res = await fetch("/api/assignments", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, isActive: !current }),
      });
      if (res.ok) fetchData();
    } catch (e) {
      console.error(e);
    }
  };

  // Defined standard grades in order
  const GRADE_ORDER = ["ม.1", "ม.2", "ม.3", "ม.4", "ม.5", "ม.6"];

  // Group classrooms by grade
  const classroomsByGrade = classrooms.reduce((acc: Record<string, any[]>, curr) => {
    const grade = curr.gradeLevel || "ทั่วไป";
    if (!acc[grade]) acc[grade] = [];
    acc[grade].push(curr);
    return acc;
  }, {});

  // Sort grades by standard order
  const sortedGrades = Object.keys(classroomsByGrade).sort((a, b) => {
    const idxA = GRADE_ORDER.indexOf(a);
    const idxB = GRADE_ORDER.indexOf(b);
    if (idxA !== -1 && idxB !== -1) return idxA - idxB;
    if (idxA !== -1) return -1;
    if (idxB !== -1) return 1;
    return a.localeCompare(b, "th");
  });

  // Unique classrooms for student filter
  const allUniqueClassrooms = Array.from(
    new Set(classrooms.map((c) => c.name))
  ).sort((a, b) => a.localeCompare(b, "th", { numeric: true }));

  // Helper: Format Thai Date & Time formally (e.g. "17 ก.ย. 2569 เวลา 23:10 น.")
  const formatThaiDateTime = (dateStr: string) => {
    if (!dateStr) return "-";
    try {
      const d = new Date(dateStr);
      if (isNaN(d.getTime())) return dateStr;
      const months = [
        "ม.ค.", "ก.พ.", "มี.ค.", "เม.ย.", "พ.ค.", "มิ.ย.",
        "ก.ค.", "ส.ค.", "ก.ย.", "ต.ค.", "พ.ย.", "ธ.ค."
      ];
      const day = d.getDate();
      const month = months[d.getMonth()];
      const year = d.getFullYear() + 543;
      const hours = String(d.getHours()).padStart(2, "0");
      const minutes = String(d.getMinutes()).padStart(2, "0");
      return `${day} ${month} ${year} เวลา ${hours}:${minutes} น.`;
    } catch {
      return dateStr;
    }
  };

  // Helper: Format Classrooms list formally into structured summary
  const formatClassroomsSummary = (rooms: string[]) => {
    if (!rooms || rooms.length === 0) return "ทุกห้องเรียน (84 ห้อง)";
    if (rooms.length === 84) return "ทุกห้องเรียน (84 ห้อง)";
    if (rooms.length <= 3) return rooms.map((r) => `ห้อง ${r}`).join(", ");

    const grouped: Record<string, string[]> = {};
    rooms.forEach((r) => {
      const parts = r.split("/");
      if (parts.length === 2) {
        const grade = parts[0];
        const roomNo = parts[1];
        if (!grouped[grade]) grouped[grade] = [];
        grouped[grade].push(roomNo);
      } else {
        if (!grouped["อื่นๆ"]) grouped["อื่นๆ"] = [];
        grouped["อื่นๆ"].push(r);
      }
    });

    const parts = Object.entries(grouped).map(([grade, roomNos]) => {
      return `${grade} (ห้อง ${roomNos.join(", ")})`;
    });

    return `${parts.join(" • ")} (รวม ${rooms.length} ห้อง)`;
  };

  return (
    <div className="space-y-5">
      {/* Top Header & Add Button */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 bg-white p-4 sm:p-5 rounded-xl border border-gray-200/90 shadow-2xs">
        <div>
          <h2 className="text-base sm:text-lg font-bold text-gray-900">ระบบจัดการภาระงานและชิ้นงาน (Assignments)</h2>
          <p className="text-xs sm:text-sm text-gray-500 mt-0.5 font-normal">
            กำหนดภาระงาน กำหนดเวลาส่ง เกณฑ์คะแนน และกลุ่มห้องเรียนเป้าหมาย
          </p>
        </div>

        <button
          type="button"
          onClick={() => {
            resetForm();
            setIsFormOpen(!isFormOpen);
          }}
          className="inline-flex items-center gap-1.5 h-10 px-4 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-sm shadow-xs active:scale-95 transition-all cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{isFormOpen ? "ปิดฟอร์ม" : "มอบหมายงานใหม่"}</span>
        </button>
      </div>

      {/* Form Drawer / Modal */}
      {isFormOpen && (
        <div className="bg-white rounded-xl p-5 md:p-6 border border-gray-200 shadow-sm animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between pb-3 mb-5 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-base">
              {editingId ? "แก้ไขข้อมูลภาระงาน" : "แบบบันทึกการมอบหมายภาระงานใหม่"}
            </h3>
            <button
              onClick={resetForm}
              className="text-xs text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
            >
              ยกเลิก
            </button>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Subject Input (Type freely or choose from suggestion) */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  วิชาที่มอบหมาย (พิมพ์เองได้) <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <input
                    type="text"
                    required
                    list="subject-suggestions-list"
                    value={selectedSubjectId}
                    onChange={(e) => setSelectedSubjectId(e.target.value)}
                    placeholder="พิมพ์ชื่อวิชา เช่น ศ23101 ทัศนศิลป์ 5"
                    className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm font-medium transition-colors"
                  />
                  <datalist id="subject-suggestions-list">
                    {subjects.map((s) => (
                      <option key={s.id} value={s.code ? `${s.code} - ${s.name}` : s.name} />
                    ))}
                  </datalist>
                </div>
                <span className="text-[11px] text-gray-400 mt-1 block">
                  💡 สามารถพิมพ์ชื่อวิชาได้เองโดยตรง หรือเลือกจากวิชาที่แนะนำ
                </span>
              </div>

              {/* Title */}
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1.5">
                  ชื่องาน / ภาระงาน <span className="text-red-500">*</span>
                </label>
                <input
                  type="text"
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น ชิ้นงานที่ 1: วาดภาพทัศนียภาพ 1 จุด"
                  className="w-full h-11 px-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm font-medium"
                />
              </div>
            </div>

            {/* Description */}
            <div>
              <label className="text-xs font-bold text-gray-700 block mb-1.5">
                คำอธิบาย / รายละเอียดโจทย์งาน
              </label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="ระบุข้อกำหนด เช่น วาดลงกระดาษร้อยปอนด์ขนาด A4 ใช้เทคนิคสีน้ำ..."
                className="w-full p-4 rounded-xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 outline-none text-sm leading-relaxed"
              />
            </div>

            {/* Max Score & Due Date */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-5">
              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  คะแนนเต็ม (คะแนน)
                </label>
                <input
                  type="number"
                  min="1"
                  max="100"
                  value={maxScore}
                  onChange={(e) => setMaxScore(e.target.value)}
                  className="w-full h-11 px-4 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-900 outline-none text-sm font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-semibold text-gray-700 block mb-1.5">
                  วันและเวลากำหนดส่ง (Deadline)
                </label>
                <input
                  type="datetime-local"
                  value={dueDate}
                  onChange={(e) => setDueDate(e.target.value)}
                  className="w-full h-11 px-3.5 rounded-lg border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-gray-900 outline-none text-sm font-medium"
                />
              </div>

              <div className="flex items-center gap-3 pt-6">
                <input
                  type="checkbox"
                  id="isActiveToggle"
                  checked={isActive}
                  onChange={(e) => setIsActive(e.target.checked)}
                  className="w-5 h-5 rounded accent-gray-900 cursor-pointer"
                />
                <label htmlFor="isActiveToggle" className="text-sm font-semibold text-gray-800 cursor-pointer">
                  เปิดรับการส่งงานทันที
                </label>
              </div>
            </div>

            {/* Target Mode Selector: Whole Classrooms vs Selective Students */}
            <div className="bg-gray-50/70 rounded-xl p-4 border border-gray-200">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-4">
                <div>
                  <label className="text-xs font-semibold text-gray-900 block">
                    กลุ่มเป้าหมายผู้เรียน <span className="text-red-500">*</span>
                  </label>
                  <p className="text-[11px] text-gray-500 mt-0.5">
                    กำหนดระดับชั้น/ห้องเรียนที่รับมอบหมาย หรือระบุเฉพาะผู้เรียนรายบุคคล
                  </p>
                </div>

                <div className="flex items-center gap-1.5 p-1 bg-white rounded-lg border border-gray-200 shadow-2xs self-start sm:self-center">
                  <button
                    type="button"
                    onClick={() => setTargetMode("all")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      targetMode === "all"
                        ? "bg-orange-500 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    กำหนดตามห้องเรียน ({selectedRooms.length === 0 ? "ทุกห้องเรียน" : `${selectedRooms.length} ห้อง`})
                  </button>

                  <button
                    type="button"
                    onClick={() => setTargetMode("selective")}
                    className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all cursor-pointer ${
                      targetMode === "selective"
                        ? "bg-orange-500 text-white shadow-xs"
                        : "text-gray-600 hover:text-gray-900"
                    }`}
                  >
                    ระบุผู้เรียนรายบุคคล ({selectedStudents.length} คน)
                  </button>
                </div>
              </div>

              {/* MODE 1: ENTIRE CLASSROOMS */}
              {targetMode === "all" && (
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-medium text-gray-600">
                      เลือกห้องเรียนที่มอบหมาย (หากไม่เลือกห้องใด = มอบหมายทุกห้องเรียน 84 ห้อง)
                    </span>
                    <button
                      type="button"
                      onClick={() => setSelectedRooms([])}
                      className="text-[11px] text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
                    >
                      ล้างการเลือกทั้งหมด (มอบหมายทุกห้อง)
                    </button>
                  </div>

                  {classrooms.length === 0 ? (
                    <p className="text-xs text-amber-700 bg-amber-50 p-3 rounded-lg border border-amber-200">
                      ยังไม่มีห้องเรียนในระบบ กรุณาไปที่แท็บ "1. โครงสร้างการสอน" เพื่อสร้างห้องเรียนก่อน
                    </p>
                  ) : (
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200 max-h-60 overflow-y-auto">
                      {sortedGrades.map((grade) => {
                        const roomsOfGrade = [...(classroomsByGrade[grade] || [])].sort((a, b) =>
                          a.name.localeCompare(b.name, "th", { numeric: true })
                        );
                        const allSelected = roomsOfGrade.length > 0 && roomsOfGrade.every((r) => selectedRooms.includes(r.name));

                        return (
                          <div key={grade} className="border-b border-gray-100 pb-3 last:border-b-0">
                            <div className="flex items-center justify-between mb-2">
                              <span className="text-xs font-semibold text-gray-800 bg-gray-100 px-2.5 py-0.5 rounded">
                                {grade} ({roomsOfGrade.length} ห้องเรียน)
                              </span>
                              <button
                                type="button"
                                onClick={() => handleSelectAllRoomsForGrade(grade)}
                                className="text-[11px] text-gray-600 hover:text-gray-900 font-medium cursor-pointer"
                              >
                                {allSelected ? `ยกเลิกทั้ง ${grade}` : `เลือกทั้งระดับชั้น ${grade} (${roomsOfGrade.length} ห้อง)`}
                              </button>
                            </div>
                            <div className="grid grid-cols-4 sm:grid-cols-7 gap-1.5">
                              {roomsOfGrade.map((r) => {
                                const isSel = selectedRooms.includes(r.name);
                                return (
                                  <button
                                    key={r.id}
                                    type="button"
                                    onClick={() => handleToggleRoom(r.name)}
                                    className={`px-2 py-1.5 rounded-lg text-xs font-medium transition-all cursor-pointer text-center ${
                                      isSel
                                        ? "bg-orange-500 text-white shadow-xs"
                                        : "bg-gray-50 text-gray-700 border border-gray-200 hover:border-gray-400 hover:bg-white"
                                    }`}
                                  >
                                    {r.name}
                                  </button>
                                );
                              })}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              )}

              {/* MODE 2: SELECTIVE STUDENTS */}
              {targetMode === "selective" && (
                <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                  {/* Search and Filters */}
                  <div className="flex flex-col md:flex-row items-stretch md:items-center gap-2">
                    <div className="relative flex-1">
                      <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
                      <input
                        type="text"
                        value={studentSearchTerm}
                        onChange={(e) => setStudentSearchTerm(e.target.value)}
                        placeholder="ค้นหาด้วยรหัสนักเรียน หรือชื่อ-นามสกุล..."
                        className="w-full h-10 pl-9 pr-8 rounded-lg border border-gray-200 text-xs bg-gray-50/50 focus:bg-white focus:border-gray-900 outline-none transition-colors"
                      />
                      {studentSearchTerm && (
                        <button
                          type="button"
                          onClick={() => setStudentSearchTerm("")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
                        >
                          <X className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>

                    <div className="flex items-center gap-2">
                      <select
                        value={studentClassFilter}
                        onChange={(e) => setStudentClassFilter(e.target.value)}
                        className="h-10 px-3 rounded-lg border border-gray-200 text-xs font-medium bg-gray-50/50 focus:bg-white focus:border-gray-900 outline-none cursor-pointer"
                      >
                        <option value="all">ห้องเรียนทั้งหมด ({students.length} คน)</option>
                        {allUniqueClassrooms.map((c) => (
                          <option key={c} value={c}>
                            ห้อง {c}
                          </option>
                        ))}
                      </select>

                      <button
                        type="button"
                        onClick={handleSelectAllFilteredStudents}
                        className="h-10 px-3 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-medium whitespace-nowrap transition-colors cursor-pointer"
                        title="เลือกนักเรียนทั้งหมดในผลการค้นหานี้"
                      >
                        ✓ เลือกทั้งหมด ({filteredStudents.length})
                      </button>

                      <button
                        type="button"
                        onClick={handleDeselectAllFilteredStudents}
                        className="h-10 px-3 rounded-lg bg-gray-50 hover:bg-gray-100 text-gray-600 text-xs font-medium border border-gray-200 whitespace-nowrap transition-colors cursor-pointer"
                        title="ยกเลิกรายการที่ค้นหา"
                      >
                        ยกเลิก
                      </button>
                    </div>
                  </div>

                  {/* Selected Students Preview Chips */}
                  {selectedStudents.length > 0 && (
                    <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-semibold text-gray-800 inline-flex items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-gray-600" />
                          <span>ระบุรายบุคคลแล้ว <strong>{selectedStudents.length}</strong> คน</span>
                        </span>
                        <button
                          type="button"
                          onClick={() => setSelectedStudents([])}
                          className="text-[11px] text-red-600 hover:underline font-medium cursor-pointer"
                        >
                          ล้างการเลือกทั้งหมด
                        </button>
                      </div>

                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto">
                        {selectedStudents.slice(0, 20).map((sId) => {
                          const sObj = students.find((s) => s.id === sId);
                          return (
                            <span
                              key={sId}
                              className="inline-flex items-center gap-1 px-2.5 py-1 rounded-md bg-white text-gray-800 border border-gray-200 text-[11px] font-medium shadow-2xs"
                            >
                              <span className="font-mono text-gray-700 font-semibold">{sId}</span>
                              <span className="truncate max-w-[120px]">{sObj?.name || "ไม่ทราบนาม"}</span>
                              {sObj?.classroom && (
                                <span className="text-[9px] bg-gray-100 text-gray-600 px-1 py-0.5 rounded">
                                  {sObj.classroom}
                                </span>
                              )}
                              <button
                                type="button"
                                onClick={() => handleToggleStudent(sId)}
                                className="hover:text-red-600 p-0.5 rounded cursor-pointer ml-0.5"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </span>
                          );
                        })}
                        {selectedStudents.length > 20 && (
                          <span className="text-[11px] font-medium text-gray-600 self-center px-2">
                            + อีก {selectedStudents.length - 20} คน
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Student List View */}
                  <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-lg divide-y divide-gray-100">
                    {filteredStudents.length === 0 ? (
                      <div className="text-center py-8 text-gray-400 text-xs">
                        {students.length === 0 ? (
                          <span>ยังไม่มีข้อมูลนักเรียนในระบบ กรุณาเพิ่มข้อมูลที่แท็บ "นักเรียน"</span>
                        ) : (
                          <span>ไม่พบนักเรียนที่ตรงกับคำค้นหา "{studentSearchTerm}"</span>
                        )}
                      </div>
                    ) : (
                      filteredStudents.map((s) => {
                        const isSelected = selectedStudents.includes(s.id);
                        return (
                          <div
                            key={s.id}
                            onClick={() => handleToggleStudent(s.id)}
                            className={`flex items-center justify-between p-2.5 px-3 transition-colors cursor-pointer select-none hover:bg-gray-50 ${
                              isSelected ? "bg-gray-50" : "bg-white"
                            }`}
                          >
                            <div className="flex items-center gap-3 min-w-0">
                              <input
                                type="checkbox"
                                checked={isSelected}
                                onChange={() => {}}
                                className="w-4 h-4 rounded accent-gray-900 cursor-pointer pointer-events-none"
                              />
                              <div className="flex items-center gap-2 min-w-0">
                                <span className="font-mono text-xs font-semibold text-gray-500">
                                  {s.id}
                                </span>
                                <span className="text-xs font-medium text-gray-800 truncate">
                                  {s.name}
                                </span>
                              </div>
                            </div>

                            <span className="text-[10px] font-medium text-gray-600 bg-gray-100 px-2 py-0.5 rounded font-mono shrink-0">
                              {s.classroom || "ไม่ระบุห้อง"}
                            </span>
                          </div>
                        );
                      })
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="pt-4 flex items-center gap-3 border-t border-gray-100">
              <Button
                type="submit"
                className="h-10 px-6 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shadow-xs cursor-pointer"
              >
                {editingId ? "บันทึกการแก้ไขข้อมูล" : "บันทึกและประกาศมอบหมายงาน"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={resetForm}
                className="h-10 px-5 rounded-lg border-gray-200 text-gray-600 hover:bg-gray-50 text-xs font-medium cursor-pointer"
              >
                ยกเลิก
              </Button>
            </div>
          </form>
        </div>
      )}

      {/* Assignments List */}
      <div className="space-y-3.5">
        {assignments.length === 0 ? (
          <div className="bg-white rounded-xl p-12 text-center text-gray-400 border border-gray-200">
            <FileText className="w-12 h-12 mx-auto mb-3 opacity-30 text-gray-400" />
            <p className="text-sm font-semibold text-gray-700">ยังไม่มีข้อมูลการมอบหมายงานในระบบ</p>
            <p className="text-xs text-gray-400 mt-1">คลิกปุ่ม "+ มอบหมายงานใหม่" ด้านบนเพื่อเริ่มบันทึกภาระงาน</p>
          </div>
        ) : (
          assignments.map((item) => {
            const hasDue = item.dueDate;
            const isExpired = hasDue ? new Date() > new Date(item.dueDate) : false;
            const isSelective = item.targetStudentsList && Array.isArray(item.targetStudentsList) && item.targetStudentsList.length > 0;

            return (
              <div
                key={item.id}
                className={`bg-white rounded-xl p-5 border transition-all ${
                  item.isActive ? "border-gray-200/90 shadow-2xs hover:border-gray-300" : "border-gray-200/60 bg-gray-50/50 opacity-80"
                }`}
              >
                <div className="flex flex-col gap-3">
                  {/* Top Metadata Strip */}
                  <div className="flex flex-wrap items-center gap-2">
                    {item.subject && (
                      <span className="px-2.5 py-1 rounded-md text-xs font-semibold bg-slate-100 text-slate-800 border border-slate-200">
                        {item.subject.code ? `${item.subject.code} ${item.subject.name}` : item.subject.name}
                      </span>
                    )}

                    <span className="px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-700 border border-gray-200/80">
                      คะแนนเต็ม {item.maxScore} คะแนน
                    </span>

                    {item.isActive ? (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-emerald-50 text-emerald-800 border border-emerald-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        เปิดรับการส่งงาน
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium bg-gray-100 text-gray-600 border border-gray-200">
                        <span className="w-1.5 h-1.5 rounded-full bg-gray-400"></span>
                        ระงับการรับงานชั่วคราว
                      </span>
                    )}

                    {hasDue && (
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md text-xs font-medium ${
                          isExpired
                            ? "bg-rose-50 text-rose-700 border border-rose-200"
                            : "bg-slate-50 text-slate-700 border border-slate-200"
                        }`}
                      >
                        <Clock className="w-3.5 h-3.5 text-gray-500" />
                        <span>กำหนดส่ง: {formatThaiDateTime(item.dueDate)}</span>
                        {isExpired && <span className="font-semibold text-rose-600">(สิ้นสุดระยะเวลาส่ง)</span>}
                      </span>
                    )}
                  </div>

                  {/* Title & Description */}
                  <div className="space-y-1">
                    <h3 className="font-semibold text-gray-900 text-base">
                      {item.title}
                    </h3>
                    {item.description && (
                      <p className="text-sm text-gray-600 leading-relaxed font-normal line-clamp-3">
                        {item.description}
                      </p>
                    )}
                  </div>

                  {/* Divider & Footer: Target Group & Action Buttons */}
                  <div className="pt-3 border-t border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    {/* Target Group */}
                    <div className="flex items-center gap-2 text-xs text-gray-600 flex-1 min-w-0">
                      {isSelective ? (
                        <div className="flex flex-wrap items-center gap-1.5">
                          <UserCheck className="w-3.5 h-3.5 text-purple-600 shrink-0" />
                          <span className="font-medium text-gray-500">กลุ่มเป้าหมาย:</span>
                          <span className="px-2 py-0.5 rounded bg-purple-50 text-purple-800 border border-purple-200 font-medium">
                            ผู้เรียนเฉพาะบุคคล ({item.targetStudentsList.length} คน)
                          </span>
                          {item.classroomsList && item.classroomsList.length > 0 && (
                            <span className="text-gray-400 text-[11px]">
                              (อิงห้อง: {item.classroomsList.join(", ")})
                            </span>
                          )}
                        </div>
                      ) : (
                        <div className="flex items-center gap-1.5 truncate">
                          <Users className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                          <span className="font-medium text-gray-500 shrink-0">ห้องเรียนเป้าหมาย:</span>
                          <span className="text-gray-800 font-medium truncate">
                            {formatClassroomsSummary(item.classroomsList)}
                          </span>
                        </div>
                      )}
                    </div>

                    {/* Action Buttons */}
                    <div className="flex items-center gap-2 shrink-0 self-end sm:self-center">
                      {onGoToGrading && (
                        <button
                          type="button"
                          onClick={() => onGoToGrading(item.id)}
                          className="inline-flex items-center gap-1.5 h-8 px-3 rounded-lg bg-orange-500 hover:bg-orange-600 text-white font-medium text-xs shadow-xs transition-colors cursor-pointer"
                        >
                          <Eye className="w-3.5 h-3.5" />
                          <span>ตรวจผลงาน</span>
                        </button>
                      )}

                      <button
                        type="button"
                        onClick={() => handleToggleActive(item.id, item.isActive)}
                        className={`h-8 px-3 rounded-lg text-xs font-medium border transition-colors cursor-pointer ${
                          item.isActive
                            ? "border-gray-200 text-gray-600 hover:bg-gray-50 hover:text-gray-900"
                            : "border-emerald-200 text-emerald-700 bg-emerald-50 hover:bg-emerald-100"
                        }`}
                      >
                        {item.isActive ? "ระงับการรับงาน" : "เปิดรับการส่งงาน"}
                      </button>

                      <button
                        type="button"
                        onClick={() => handleEdit(item)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-500 hover:text-gray-900 hover:bg-gray-50 transition-colors cursor-pointer"
                        title="แก้ไขข้อมูลภาระงาน"
                      >
                        <Edit3 className="w-3.5 h-3.5" />
                      </button>

                      <button
                        type="button"
                        onClick={() => handleDelete(item.id, item.title)}
                        className="w-8 h-8 rounded-lg border border-gray-200 flex items-center justify-center text-gray-400 hover:text-red-600 hover:border-red-200 hover:bg-red-50 transition-colors cursor-pointer"
                        title="ลบภาระงาน"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

