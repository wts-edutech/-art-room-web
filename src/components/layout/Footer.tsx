"use client";
import { useEffect, useState } from "react";
import { Eye } from "lucide-react";

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(0);

  useEffect(() => {
    fetch("/api/visitors")
      .then(res => res.json())
      .then(data => {
        setVisitorCount(data.total || 0);
      })
      .catch(err => console.error("Failed to fetch visitors:", err));
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-10 pb-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        {/* Brand & Motto */}
        <div className="flex flex-col md:flex-row items-center justify-between gap-6 pb-8 border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src="/school-logo.png" 
              alt="School Logo" 
              className="w-12 h-12 object-contain" 
            />
            <div>
              <span className="font-heading font-black text-xl tracking-wide block leading-none">
                <span className="text-red-600">ART </span>
                <span className="text-gray-900">ROOM</span>
              </span>
              <span className="text-[10px] text-gray-500 font-bold block mt-1">
                WACHIRATHAMMASATIT SCHOOL
              </span>
            </div>
          </div>

          <p className="text-gray-600 font-light leading-relaxed text-xs sm:text-sm text-center md:text-right max-w-lg">
            <strong className="font-semibold text-gray-900">กลุ่มสาระการเรียนรู้ศิลปะ</strong> โรงเรียนวชิรธรรมสาธิต <br />
            &ldquo;โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง&rdquo;
          </p>
        </div>
        
        {/* Bottom Legal, PDPA & Visitor Counter */}
        <div className="pt-6 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <p>
              &copy; 2569 ART ROOM กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต | ออกแบบและพัฒนาเว็บไซต์โดย นางสาวสีวลี ยืนยาว
            </p>
            <p className="text-[11px] text-gray-400">
              ผลงานและภาพถ่ายบนเว็บไซต์นี้จัดทำขึ้นเพื่อการศึกษาและการประชาสัมพันธ์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </p>
          </div>
          
          <div className="flex items-center gap-3 shrink-0">
            <div className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              <span>ผู้เข้าชมทั้งหมด: <strong className="font-bold text-gray-900">{visitorCount.toLocaleString()}</strong> ครั้ง</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
