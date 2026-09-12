"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Users, Search, Upload, AlertTriangle } from "lucide-react";


export default function StudentsTab() {
  const [students, setStudents] = useState<any[]>([]);
  const [studentIdInput, setStudentIdInput] = useState("");
  const [studentNameInput, setStudentNameInput] = useState("");
  const [searchStudentInput, setSearchStudentInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/students");
      const data = await res.json();
      setStudents(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setStudents([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddStudent = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!studentIdInput || !studentNameInput) return;
    
    try {
      const res = await fetch("/api/students", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: studentIdInput, name: studentNameInput })
      });
      
      if (res.ok) {
        setStudentIdInput("");
        setStudentNameInput("");
        fetchData();
        alert("เพิ่มนักเรียนสำเร็จ!");
      } else {
        const data = await res.json();
        alert(data.error || "เกิดข้อผิดพลาด");
      }
    } catch (error) {
      console.error("Failed to add student", error);
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบนักเรียนรหัส ${id} ออกจากระบบ?`)) return;
    try {
      const res = await fetch(`/api/students?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถลบนักเรียนได้");
      }
    } catch (error) {
      console.error("Failed to delete student", error);
    }
  };

  const handleDeleteAllStudents = async () => {
    const confirmation = prompt('คำเตือน: การกระทำนี้จะลบรายชื่อนักเรียนทั้งหมด! พิมพ์ "ยืนยันการลบ" เพื่อดำเนินการต่อ');
    if (confirmation !== 'ยืนยันการลบ') {
      if (confirmation !== null) alert("ยกเลิกการลบข้อมูลแล้ว");
      return;
    }
    
    try {
      const res = await fetch(`/api/students?action=deleteAll`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        alert("ลบรายชื่อนักเรียนทั้งหมดเรียบร้อยแล้ว");
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Failed to delete all students", error);
    }
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.type === "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet" || file.type === "application/vnd.ms-excel" || file.type === "text/csv") {
        const reader = new FileReader();
        reader.onload = async (event) => {
          try {
            const arrayBuffer = event.target?.result;
            if (!arrayBuffer) return;
            // dynamically import XLSX
            const XLSX = await import("xlsx");
            const workbook = XLSX.read(arrayBuffer, { type: 'array' });
            const sheetName = workbook.SheetNames[0];
            const worksheet = workbook.Sheets[sheetName];
            const json = XLSX.utils.sheet_to_json(worksheet) as any[];
            
            let addedCount = 0;
            for (const row of json) {
              if (!row.id || !row.name) continue;
              const formData = new FormData();
              formData.append("id", String(row.id));
              formData.append("name", String(row.name));
              
              await fetch("/api/students", {
                method: "POST",
                body: formData,
              });
              addedCount++;
            }
            
            alert(`เพิ่มนักเรียนจากไฟล์สำเร็จ ${addedCount} คน`);
            fetchData();
            e.target.value = "";
          } catch (error) {
            console.error("Error parsing Excel:", error);
            alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
          }
        };
        reader.readAsArrayBuffer(file);
      } else {
        alert("รองรับเฉพาะไฟล์ .xlsx และ .xls และ .csv เท่านั้น");
        e.target.value = "";
      }
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Student Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Plus className="text-blue-600" />
                    <h2 className="text-lg font-bold text-gray-900">
                      เพิ่มนักเรียนใหม่
                    </h2>
                  </div>
                  <form onSubmit={handleAddStudent} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">รหัสประจำตัวนักเรียน</label>
                      <input 
                        type="text" 
                        required 
                        value={studentIdInput} 
                        onChange={(e) => setStudentIdInput(e.target.value)} 
                        placeholder="เช่น 12345"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" 
                      />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">ชื่อ - นามสกุล</label>
                      <input 
                        type="text" 
                        required 
                        value={studentNameInput} 
                        onChange={(e) => setStudentNameInput(e.target.value)} 
                        placeholder="เช่น เด็กชายรักดี เรียนเก่ง"
                        className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm" 
                      />
                    </div>
                    
                    <div className="pt-4 border-t border-gray-100">
                      <Button type="submit" className="w-full rounded-xl bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-500/20">
                        เพิ่มรายชื่อนักเรียน
                      </Button>
                    </div>
                  </form>
                </div>
              </div>

              {/* Student List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                  <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                        <Users className="w-5 h-5" />
                      </div>
                      <div>
                        <h2 className="text-lg font-bold text-gray-900 leading-tight">ฐานข้อมูลนักเรียน</h2>
                        <p className="text-xs text-gray-500">ทั้งหมด {students.length} รายการ</p>
                      </div>
                    </div>
                    
                    <div className="relative w-full sm:w-64">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <Search className="h-4 w-4 text-gray-400" />
                      </div>
                      <input
                        type="text"
                        placeholder="ค้นหาชื่อ หรือ รหัสนักเรียน..."
                        value={searchStudentInput}
                        onChange={(e) => setSearchStudentInput(e.target.value)}
                        className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                      />
                    </div>
                  </div>

                  {/* Bulk Actions Toolbar */}
                  <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 justify-end">
                    <div>
                      <input 
                        type="file" 
                        id="excelUpload" 
                        accept=".xlsx, .xls, .csv" 
                        className="hidden" 
                        onChange={handleFileUpload}
                      />
                      <label 
                        htmlFor="excelUpload"
                        className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-emerald-700 bg-emerald-50 hover:bg-emerald-100 border border-emerald-200 cursor-pointer transition-colors shadow-sm"
                      >
                        <Upload className="w-4 h-4" />
                        นำเข้ารายชื่อ (Excel/CSV)
                      </label>
                    </div>
                    
                    <button 
                      onClick={handleDeleteAllStudents}
                      className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
                    >
                      <AlertTriangle className="w-4 h-4" />
                      ล้างข้อมูลทั้งหมด
                    </button>
                  </div>
                  
                  {(Array.isArray(students) ? students : []).length === 0 ? (
                    <div className="p-12 text-center text-gray-400">
                      <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                      <p>ยังไม่มีรายชื่อนักเรียนในระบบ</p>
                    </div>
                  ) : (
                    <div className="max-h-[600px] overflow-y-auto">
                      <table className="w-full text-left text-sm whitespace-nowrap">
                        <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50 text-gray-500 sticky top-0 z-10">
                          <tr>
                            <th scope="col" className="px-6 py-4 font-medium w-1/4">รหัสนักเรียน</th>
                            <th scope="col" className="px-6 py-4 font-medium w-2/4">ชื่อ - นามสกุล</th>
                            <th scope="col" className="px-6 py-4 font-medium w-1/4 text-center">จัดการ</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-50">
                          {(Array.isArray(students) ? students : [])
                            .filter(s => 
                              (s.id && String(s.id).includes(searchStudentInput)) || 
                              (s.name && String(s.name).toLowerCase().includes(searchStudentInput.toLowerCase()))
                            )
                            .map((student) => (
                            <tr key={student.id} className="hover:bg-blue-50/50 transition-colors group">
                              <td className="px-6 py-4">
                                <span className="font-mono font-medium text-gray-900 bg-gray-100 px-2 py-1 rounded-md">{student.id}</span>
                              </td>
                              <td className="px-6 py-4">
                                <span className="font-medium text-gray-700">{student.name}</span>
                              </td>
                              <td className="px-6 py-4">
                                <div className="flex justify-center">
                                  <button 
                                    onClick={() => handleDeleteStudent(student.id)} 
                                    className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors" 
                                    title="ลบรายชื่อ"
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
              </div>
            </div>
  );
}
