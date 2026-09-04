"use client";
import Link from "next/link";
import { useEffect, useState } from "react";

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
    <footer className="bg-white border-t border-gray-100 pt-20 pb-10">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-12 md:gap-8 mb-16">
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-6">
              <img 
                src="/school-logo.png" 
                alt="School Logo" 
                className="w-12 h-12 object-contain" 
              />
              <h2 className="font-heading font-bold text-2xl text-gray-900 tracking-tight">
                Art Room
              </h2>
            </div>
            <p className="text-gray-600 font-light leading-relaxed max-w-xs">
              <strong className="font-medium text-gray-900">โรงเรียนวชิรธรรมสาธิต</strong> <br />
              โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง
            </p>
          </div>
          
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-6">เมนูนำทาง</h3>
            <ul className="space-y-4 text-gray-600 font-light">
              <li><Link href="/" className="hover:text-(--color-primary-500) transition-colors">หน้าแรก</Link></li>
              <li><Link href="#features" className="hover:text-(--color-primary-500) transition-colors">จุดเด่นของเรา</Link></li>
              <li><Link href="#testimonials" className="hover:text-(--color-primary-500) transition-colors">รีวิวจากรุ่นพี่</Link></li>
            </ul>
          </div>

          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-lg text-gray-900 mb-6">ติดต่อเรา</h3>
            <ul className="space-y-4 text-gray-600 font-light">
              <li>1253 ซอยวชิรธรรมสาธิต 57 ถนนสุขุมวิท 101/1 <br/> แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260</li>
              <li className="pt-2 mt-4 border-t border-gray-100">
                <a href="line://ti/p/~0990499597" target="_blank" rel="noopener noreferrer" className="text-[#00B900] font-medium hover:underline flex items-center gap-2">
                  <span>💬</span> ติดต่อผ่าน LINE
                </a>
              </li>
            </ul>
          </div>
        </div>
        
        <div className="text-sm text-gray-400 font-light border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex flex-col items-center md:items-start gap-1">
            <p>&copy; 2569 WTS ART ROOM | ออกแบบและพัฒนาเว็บไซต์โดย นางสาวสีวลี ยืนยาว</p>
            <p className="text-gray-500 font-medium">จำนวนผู้เข้าชมเว็บไซต์ทั้งหมด: {visitorCount.toLocaleString()} ครั้ง</p>
          </div>
          <div className="flex gap-6">
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Privacy Policy</span>
            <span className="hover:text-gray-600 cursor-pointer transition-colors">Terms of Service</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
