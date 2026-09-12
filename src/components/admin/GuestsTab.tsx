"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Users, Search, AlertTriangle } from "lucide-react";


export default function GuestsTab() {
  const [guests, setGuests] = useState<any[]>([]);
  const [searchGuestInput, setSearchGuestInput] = useState("");
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/auth/guest");
      const data = await res.json();
      setGuests(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setGuests([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleDeleteGuest = async (id: string) => {
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบข้อมูลบุคคลทั่วไปรหัส ${id}?`)) return;
    try {
      const res = await fetch(`/api/auth/guest?id=${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Failed to delete guest", error);
    }
  };

  const handleDeleteAllGuests = async () => {
    const confirmation = prompt('คำเตือน: การกระทำนี้จะลบข้อมูลบุคคลทั่วไปทั้งหมด! พิมพ์ "ยืนยันการลบ" เพื่อดำเนินการต่อ');
    if (confirmation !== 'ยืนยันการลบ') {
      if (confirmation !== null) alert("ยกเลิกการลบข้อมูลแล้ว");
      return;
    }
    
    try {
      const res = await fetch(`/api/auth/guest?action=deleteAll`, { method: "DELETE" });
      if (res.ok) {
        fetchData();
        alert("ลบข้อมูลบุคคลทั่วไปทั้งหมดเรียบร้อยแล้ว");
      } else {
        alert("ไม่สามารถลบข้อมูลได้");
      }
    } catch (error) {
      console.error("Failed to delete all guests", error);
    }
  };

  return (
    <div className="grid grid-cols-1 gap-8">
              <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
                <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
                  <div className="flex items-center gap-3 w-full sm:w-auto">
                    <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-500 shadow-sm border border-gray-100">
                      <Users className="w-5 h-5" />
                    </div>
                    <div>
                      <h2 className="text-lg font-bold text-gray-900 leading-tight">ฐานข้อมูลบุคคลทั่วไป</h2>
                      <p className="text-xs text-gray-500">ทั้งหมด {guests.length} รายการ</p>
                    </div>
                  </div>
                  
                  <div className="relative w-full sm:w-64">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <Search className="h-4 w-4 text-gray-400" />
                    </div>
                    <input
                      type="text"
                      placeholder="ค้นหาชื่อ หรือ เบอร์โทรศัพท์..."
                      value={searchGuestInput}
                      onChange={(e) => setSearchGuestInput(e.target.value)}
                      className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
                    />
                  </div>
                </div>

                <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 justify-end">
                  <button 
                    onClick={handleDeleteAllGuests}
                    className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-lg text-sm font-medium text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-sm"
                  >
                    <AlertTriangle className="w-4 h-4" />
                    ล้างข้อมูลทั้งหมด
                  </button>
                </div>
                
                {(Array.isArray(guests) ? guests : []).length === 0 ? (
                  <div className="p-12 text-center text-gray-400">
                    <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
                    <p>ยังไม่มีบุคคลทั่วไปลงทะเบียนเข้าระบบ</p>
                  </div>
                ) : (
                  <div className="max-h-[600px] overflow-y-auto">
                    <table className="w-full text-left text-sm whitespace-nowrap">
                      <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50 text-gray-500 sticky top-0 z-10">
                        <tr>
                          <th scope="col" className="px-6 py-4 font-medium w-1/4">วันที่-เวลา เข้าชม</th>
                          <th scope="col" className="px-6 py-4 font-medium w-2/4">ชื่อ - นามสกุล</th>
                          <th scope="col" className="px-6 py-4 font-medium w-1/4">เบอร์โทรศัพท์</th>
                          <th scope="col" className="px-6 py-4 font-medium w-1/4 text-center">จัดการ</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-50">
                        {(Array.isArray(guests) ? guests : [])
                          .filter(g => 
                            (g.phone && String(g.phone).includes(searchGuestInput)) || 
                            (g.name && String(g.name).toLowerCase().includes(searchGuestInput.toLowerCase()))
                          )
                          .map((guest) => (
                          <tr key={guest.id} className="hover:bg-blue-50/50 transition-colors group">
                            <td className="px-6 py-4">
                              <span className="text-gray-500 text-xs">
                                {new Date(guest.visitedAt).toLocaleString('th-TH')}
                              </span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-medium text-gray-700">{guest.name}</span>
                            </td>
                            <td className="px-6 py-4">
                              <span className="font-mono text-gray-600">{guest.phone}</span>
                            </td>
                            <td className="px-6 py-4">
                              <div className="flex justify-center">
                                <button 
                                  onClick={() => handleDeleteGuest(guest.id)} 
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
  );
}
