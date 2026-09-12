"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Users, Search, AlertTriangle, Mail, Phone, ShieldCheck, Globe } from "lucide-react";

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
    if (!confirm(`คุณแน่ใจหรือไม่ที่จะลบประวัติการเข้าใช้งานรหัส ${id}?`)) return;
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

  const filteredGuests = (Array.isArray(guests) ? guests : []).filter(g => {
    const q = searchGuestInput.toLowerCase().trim();
    if (!q) return true;
    return (
      (g.name && String(g.name).toLowerCase().includes(q)) ||
      (g.email && String(g.email).toLowerCase().includes(q)) ||
      (g.phone && String(g.phone).includes(q)) ||
      (g.role && String(g.role).toLowerCase().includes(q))
    );
  });

  return (
    <div className="grid grid-cols-1 gap-8">
      <div className="bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="p-6 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between bg-gray-50/50 gap-4">
          <div className="flex items-center gap-3 w-full sm:w-auto">
            <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center text-blue-600 shadow-sm border border-gray-100">
              <Users className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-gray-900 leading-tight">ฐานข้อมูลบุคคลทั่วไปและผู้ปกครอง</h2>
              <p className="text-xs text-gray-500">บันทึกอีเมลและชื่อผู้เข้าใช้งานจริง ทั้งหมด {guests.length} รายการ</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-80">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-4 w-4 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร หรือสถานะ..."
              value={searchGuestInput}
              onChange={(e) => setSearchGuestInput(e.target.value)}
              className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm bg-white"
            />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-6 py-3 bg-gray-50 border-b border-gray-100 flex flex-wrap gap-2 justify-between items-center">
          <span className="text-xs text-gray-500 font-medium">
            แสดง {filteredGuests.length} จากทั้งหมด {guests.length} คน
          </span>
          <button 
            onClick={handleDeleteAllGuests}
            className="h-9 px-4 inline-flex items-center justify-center gap-2 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-xs cursor-pointer"
          >
            <AlertTriangle className="w-4 h-4" />
            ล้างข้อมูลทั้งหมด
          </button>
        </div>
        
        {/* Table Content */}
        {filteredGuests.length === 0 ? (
          <div className="p-16 text-center text-gray-400">
            <Users className="w-12 h-12 mx-auto mb-3 opacity-20" />
            <p className="text-sm font-medium">ยังไม่มีข้อมูลบุคคลทั่วไปที่เข้าสู่ระบบ</p>
            <p className="text-xs text-gray-400 mt-1">เมื่อมีผู้ปกครองหรือบุคคลทั่วไปเข้าสู่ระบบ ข้อมูลอีเมลและชื่อจะถูกบันทึกที่นี่โดยอัตโนมัติ</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-sm whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50 text-gray-500 sticky top-0 z-10 text-xs">
                <tr>
                  <th scope="col" className="px-6 py-3.5 font-semibold">วัน-เวลา เข้าใช้งาน</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">ชื่อ - นามสกุล</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">อีเมลที่ใช้งาน (Email)</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">สถานะ / ช่องทาง</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold">เบอร์โทรศัพท์</th>
                  <th scope="col" className="px-6 py-3.5 font-semibold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-blue-50/40 transition-colors group">
                    <td className="px-6 py-4">
                      <span className="text-gray-500 text-xs">
                        {guest.createdAt ? new Date(guest.createdAt).toLocaleString('th-TH') : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span className="font-bold text-gray-900">{guest.name}</span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-blue-50 text-blue-700 rounded-lg text-xs font-mono font-medium border border-blue-100">
                        <Mail className="w-3.5 h-3.5 text-blue-500 flex-shrink-0" />
                        <span>{guest.email}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {guest.role || 'บุคคลทั่วไป'}
                        </span>
                        {guest.provider && guest.provider !== 'Email' && (
                          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                            {guest.provider}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs text-gray-600 font-mono">
                        {guest.phone && guest.phone !== '-' ? guest.phone : '-'}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDeleteGuest(guest.id)} 
                          className="w-8 h-8 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" 
                          title="ลบประวัติ"
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
