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
    <div className="space-y-5 font-prompt">
      <div className="bg-white rounded-2xl shadow-2xs border border-gray-200 overflow-hidden">
        
        {/* Header Section */}
        <div className="px-5 py-3.5 border-b border-gray-100 flex flex-col sm:flex-row items-start sm:items-center justify-between bg-gray-50/70 gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 bg-white rounded-xl flex items-center justify-center text-orange-500 shadow-2xs border border-gray-200">
              <Users className="w-4.5 h-4.5" />
            </div>
            <div>
              <h2 className="text-sm sm:text-base font-bold font-kanit text-gray-900 leading-tight">ฐานข้อมูลบุคคลทั่วไปและผู้ปกครอง</h2>
              <p className="text-xs text-gray-500 mt-0.5">บันทึกอีเมลและชื่อผู้เข้าใช้งานจริง ({guests.length} รายการ)</p>
            </div>
          </div>
          
          <div className="relative w-full sm:w-72">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search className="h-3.5 w-3.5 text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="ค้นหาชื่อ, อีเมล, เบอร์โทร..."
              value={searchGuestInput}
              onChange={(e) => setSearchGuestInput(e.target.value)}
              className="w-full h-9 pl-9 pr-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white shadow-2xs"
            />
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="px-5 py-2.5 bg-gray-50/50 border-b border-gray-100 flex flex-wrap gap-2 justify-between items-center text-xs">
          <span className="text-gray-500 font-medium">
            แสดง {filteredGuests.length} จากทั้งหมด {guests.length} คน
          </span>
          <button 
            onClick={handleDeleteAllGuests}
            className="h-7.5 px-3 inline-flex items-center justify-center gap-1.5 rounded-lg text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200 transition-colors shadow-2xs cursor-pointer"
          >
            <AlertTriangle className="w-3.5 h-3.5" />
            ล้างข้อมูลทั้งหมด
          </button>
        </div>
        
        {/* Table Content */}
        {filteredGuests.length === 0 ? (
          <div className="p-12 text-center text-gray-400">
            <Users className="w-10 h-10 mx-auto mb-2 opacity-20" />
            <p className="text-xs font-semibold text-gray-600">ยังไม่มีข้อมูลบุคคลทั่วไปที่เข้าสู่ระบบ</p>
            <p className="text-[11px] text-gray-400 mt-0.5">เมื่อมีผู้ปกครองหรือบุคคลทั่วไปเข้าสู่ระบบ ข้อมูลอีเมลและชื่อจะถูกบันทึกที่นี่โดยอัตโนมัติ</p>
          </div>
        ) : (
          <div className="max-h-[600px] overflow-y-auto">
            <table className="w-full text-left text-xs whitespace-nowrap">
              <thead className="uppercase tracking-wider border-b border-gray-100 bg-gray-50/80 text-gray-500 sticky top-0 z-10 text-[11px]">
                <tr>
                  <th scope="col" className="px-4 py-3 font-bold">วัน-เวลา เข้าใช้งาน</th>
                  <th scope="col" className="px-4 py-3 font-bold">ชื่อ - นามสกุล</th>
                  <th scope="col" className="px-4 py-3 font-bold">อีเมลที่ใช้งาน (Email)</th>
                  <th scope="col" className="px-4 py-3 font-bold">สถานะ / ช่องทาง</th>
                  <th scope="col" className="px-4 py-3 font-bold">เบอร์โทรศัพท์</th>
                  <th scope="col" className="px-4 py-3 font-bold text-center">จัดการ</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {filteredGuests.map((guest) => (
                  <tr key={guest.id} className="hover:bg-orange-50/30 transition-colors group">
                    <td className="px-4 py-3">
                      <span className="text-gray-500 text-xs font-mono">
                        {guest.createdAt ? new Date(guest.createdAt).toLocaleString('th-TH') : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <span className="font-bold text-gray-900">{guest.name}</span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="inline-flex items-center gap-1.5 px-2 py-0.5 bg-orange-50 text-orange-700 rounded-md text-xs font-mono font-medium border border-orange-200/60">
                        <Mail className="w-3 h-3 text-orange-500 shrink-0" />
                        <span>{guest.email}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="px-2 py-0.5 rounded-full text-[11px] font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                          {guest.role || 'บุคคลทั่วไป'}
                        </span>
                        {guest.provider && guest.provider !== 'Email' && (
                          <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-gray-100 text-gray-600">
                            {guest.provider}
                          </span>
                        )}
                      </div>
                    </td>
                    <td className="px-4 py-3">
                      <span className="text-xs text-gray-600 font-mono">
                        {guest.phone && guest.phone !== '-' ? guest.phone : '-'}
                      </span>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex justify-center">
                        <button 
                          onClick={() => handleDeleteGuest(guest.id)} 
                          className="h-7 w-7 rounded-lg flex items-center justify-center text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors cursor-pointer" 
                          title="ลบประวัติ"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
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
