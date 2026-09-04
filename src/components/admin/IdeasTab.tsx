"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Lightbulb, CheckCircle, XCircle, Image as ImageIcon, Upload } from "lucide-react";
import * as XLSX from "xlsx";

export default function IdeasTab() {
  const [ideasList, setIdeasList] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filterStatus, setFilterStatus] = useState<string>("all");

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/ideas?admin=true");
      const data = await res.json();
      setIdeasList(data);
    } catch (error) {
      console.error("Failed to fetch", error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleUpdateIdeaStatus = async (id: string, status: 'pending' | 'approved' | 'rejected') => {
    try {
      const res = await fetch(`/api/ideas/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถอัปเดตสถานะได้");
      }
    } catch (error) {
      console.error("Failed to update idea status", error);
    }
  };

  const handleDeleteIdea = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบไอเดียนี้?")) return;
    try {
      const res = await fetch(`/api/ideas/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถลบไอเดียได้");
      }
    } catch (error) {
      console.error("Failed to delete idea", error);
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setIsLoading(true);
    const reader = new FileReader();
    reader.onload = async (event) => {
      try {
        const bstr = event.target?.result;
        const workbook = XLSX.read(bstr, { type: "binary" });
        
        let newStudents: {id: string, name: string}[] = [];
        
        // Loop through all sheets
        workbook.SheetNames.forEach(sheetName => {
          const worksheet = workbook.Sheets[sheetName];
          const data = XLSX.utils.sheet_to_json<any>(worksheet, { header: 1 });
          
          data.forEach(row => {
            if (row && row.length >= 4) {
              const col0 = String(row[0] || "").trim();
              const col1 = String(row[1] || "").trim();
              
              // Assume row[0] is number, row[1] is ID, row[2] is firstname, row[3] is lastname
              if (/^\d+$/.test(col0) && /^\d{5}$/.test(col1)) {
                const firstName = String(row[2] || "").trim();
                const lastName = String(row[3] || "").trim();
                newStudents.push({
                  id: col1,
                  name: `${firstName} ${lastName}`.trim()
                });
              }
            }
          });
        });

        if (newStudents.length === 0) {
          alert("ไม่พบข้อมูลนักเรียนที่ถูกต้องในไฟล์นี้");
          setIsLoading(false);
          return;
        }

        // Send to backend bulk API
        const res = await fetch("/api/students", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ action: "bulkInsert", students: newStudents })
        });
        
        if (res.ok) {
          const data = await res.json();
          alert(`นำเข้าข้อมูลนักเรียนสำเร็จ ${data.addedCount} รายการ!`);
          fetchData();
        } else {
          alert("เกิดข้อผิดพลาดในการนำเข้าข้อมูล");
          setIsLoading(false);
        }
      } catch (error) {
        console.error("Error parsing Excel:", error);
        alert("เกิดข้อผิดพลาดในการอ่านไฟล์");
        setIsLoading(false);
      }
      
      // Reset input
      e.target.value = '';
    };
    reader.readAsBinaryString(file);
  };

  return (
    <div className="space-y-6">
              <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center text-orange-600 font-bold shadow-sm">
                      <Lightbulb className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-gray-900">จัดการไอเดียที่แบ่งปัน</h2>
                      <p className="text-sm text-gray-500">ตรวจสอบและอนุมัติไอเดียจากครูและนักเรียน</p>
                    </div>
                  </div>
                  <div>
                    <select
                      value={filterStatus}
                      onChange={(e) => setFilterStatus(e.target.value)}
                      className="h-10 pl-3 pr-8 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                    >
                      <option value="all">ทั้งหมด</option>
                      <option value="pending">รอตรวจสอบ</option>
                      <option value="approved">อนุมัติแล้ว</option>
                      <option value="rejected">ไม่อนุมัติ</option>
                    </select>
                  </div>
                </div>
                
                <div className="overflow-x-auto">
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : ideasList.filter(idea => filterStatus === "all" || idea.status === filterStatus).length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ยังไม่มีข้อมูลไอเดีย</div>
                  ) : (
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-100 text-sm font-semibold text-gray-600">
                          <th className="p-4">รูปภาพ</th>
                          <th className="p-4">หัวข้อ</th>
                          <th className="p-4">ผู้แบ่งปัน</th>
                          <th className="p-4">ไฟล์แนบ</th>
                          <th className="p-4">สถานะ</th>
                          <th className="p-4 text-right">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {ideasList.filter(idea => filterStatus === "all" || idea.status === filterStatus).map((idea) => (
                          <tr key={idea.id} className="hover:bg-gray-50/50 transition-colors">
                            <td className="p-4">
                              <div className="w-16 h-12 bg-gray-100 rounded-lg overflow-hidden border border-gray-200">
                                {idea.coverImageUrl ? (
                                  // eslint-disable-next-line @next/next/no-img-element
                                  <img src={idea.coverImageUrl} alt={idea.title} className="w-full h-full object-cover" />
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                                    <ImageIcon className="w-5 h-5" />
                                  </div>
                                )}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="font-bold text-gray-900 text-sm line-clamp-1">{idea.title}</div>
                              <div className="text-xs text-gray-500 mt-1">
                                {idea.category && <span className="bg-orange-100 text-orange-700 px-2 py-0.5 rounded-full mr-2">{idea.category}</span>}
                                {new Date(idea.createdAt).toLocaleDateString('th-TH')}
                              </div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm font-medium text-gray-700">{idea.authorName}</div>
                            </td>
                            <td className="p-4">
                              <div className="text-sm text-gray-600 bg-gray-100 px-2 py-1 rounded-md inline-block">
                                {idea.files ? idea.files.length : 0} ไฟล์
                              </div>
                            </td>
                            <td className="p-4">
                              {idea.status === 'pending' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800 border border-yellow-200">
                                  รอตรวจสอบ
                                </span>
                              )}
                              {idea.status === 'approved' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800 border border-green-200">
                                  อนุมัติแล้ว
                                </span>
                              )}
                              {idea.status === 'rejected' && (
                                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800 border border-red-200">
                                  ไม่อนุมัติ
                                </span>
                              )}
                            </td>
                            <td className="p-4">
                              <div className="flex justify-end gap-2">
                                {idea.status === 'pending' && (
                                  <>
                                    <button 
                                      onClick={() => handleUpdateIdeaStatus(idea.id, 'approved')} 
                                      className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                                      title="อนุมัติ"
                                    >
                                      <CheckCircle className="w-4 h-4" />
                                    </button>
                                    <button 
                                      onClick={() => handleUpdateIdeaStatus(idea.id, 'rejected')} 
                                      className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                      title="ไม่อนุมัติ"
                                    >
                                      <XCircle className="w-4 h-4" />
                                    </button>
                                  </>
                                )}
                                {idea.status === 'rejected' && (
                                  <button 
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'approved')} 
                                    className="p-2 rounded-lg text-green-600 bg-green-50 hover:bg-green-100 transition-colors"
                                    title="อนุมัติ"
                                  >
                                    <CheckCircle className="w-4 h-4" />
                                  </button>
                                )}
                                {idea.status === 'approved' && (
                                  <button 
                                    onClick={() => handleUpdateIdeaStatus(idea.id, 'rejected')} 
                                    className="p-2 rounded-lg text-yellow-600 bg-yellow-50 hover:bg-yellow-100 transition-colors"
                                    title="ยกเลิกการอนุมัติ"
                                  >
                                    <XCircle className="w-4 h-4" />
                                  </button>
                                )}
                                <button 
                                  onClick={() => handleDeleteIdea(idea.id)} 
                                  className="p-2 rounded-lg text-red-600 bg-red-50 hover:bg-red-100 transition-colors"
                                  title="ลบ"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  )}
                </div>
              </div>
            </div>
  );
}
