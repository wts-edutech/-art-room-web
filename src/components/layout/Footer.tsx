"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import { ShieldCheck, Eye, Sparkles } from "lucide-react";

export default function Footer() {
  const [visitorCount, setVisitorCount] = useState(0);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState(false);

  useEffect(() => {
    fetch("/api/visitors")
      .then(res => res.json())
      .then(data => {
        setVisitorCount(data.total || 0);
      })
      .catch(err => console.error("Failed to fetch visitors:", err));

    fetch("/api/teachers/status")
      .then(res => res.json())
      .then(data => {
        if (data && typeof data.enabled === "boolean") {
          setIsTeachersEnabled(data.enabled);
        }
      })
      .catch(() => {});
  }, []);

  return (
    <footer className="bg-white border-t border-gray-100 pt-16 pb-10">
      <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 mb-14">
          
          {/* Col 1: Brand & Motto */}
          <div className="md:col-span-1 space-y-4">
            <div className="flex items-center gap-3">
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
            <p className="text-gray-600 font-light leading-relaxed text-xs sm:text-sm">
              <strong className="font-semibold text-gray-900">กลุ่มสาระการเรียนรู้ศิลปะ</strong> <br />
              โรงเรียนวชิรธรรมสาธิต &ldquo;โรงเรียนคุณภาพ บริการด้วยหัวใจ ไม่ทิ้งใครคนใดไว้ข้างหลัง&rdquo;
            </p>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-700 text-xs font-semibold border border-red-100">
              <Sparkles className="w-3.5 h-3.5 text-red-500" />
              <span>Inspiring Young Creators</span>
            </div>
          </div>
          
          {/* Col 2: Learning Hub */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">
              แหล่งเรียนรู้ศิลปะ
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-light">
              <li>
                <Link href="/materials" className="hover:text-red-600 transition-colors">
                  คลังสื่อการสอน Art Room  By:ครูเก๋
                </Link>
              </li>
              <li>
                <Link href="/downloads" className="hover:text-red-600 transition-colors flex items-center gap-1.5">
                  <span>ศูนย์ดาวน์โหลดใบงาน PDF</span>
                  <span className="bg-emerald-100 text-emerald-700 text-[9px] px-1 rounded font-bold">ฟรี</span>
                </Link>
              </li>
              <li>
                <Link href="/ideas" className="hover:text-red-600 transition-colors">
                  สตูดิโอไอเดียสร้างสรรค์
                </Link>
              </li>
              {isTeachersEnabled && (
                <li>
                  <Link href="/teachers" className="hover:text-red-600 transition-colors">
                    ทำเนียบครูผู้สอนศิลปะ
                  </Link>
                </li>
              )}
            </ul>
          </div>

          {/* Col 3: Gallery & Activities */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">
              กิจกรรมและผลงาน
            </h3>
            <ul className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-light">
              <li>
                <Link href="/artworks" className="hover:text-red-600 transition-colors">
                  หอศิลป์เสมือนจริง (Art Gallery)
                </Link>
              </li>
              <li>
                <Link href="/awards" className="hover:text-red-600 transition-colors">
                  หอเกียรติยศและรางวัล (Hall of Fame)
                </Link>
              </li>
              <li>
                <Link href="/news" className="hover:text-red-600 transition-colors">
                  ข่าวสารและนิทรรศการ
                </Link>
              </li>
              <li>
                <Link href="/activities" className="hover:text-red-600 transition-colors">
                  ปฏิทินกิจกรรมศิลปะ
                </Link>
              </li>
            </ul>
          </div>

          {/* Col 4: Contact & Location */}
          <div className="md:col-span-1">
            <h3 className="font-heading font-bold text-sm text-gray-900 mb-4 uppercase tracking-wider">
              สถานที่และการติดต่อ
            </h3>
            <div className="space-y-2.5 text-xs sm:text-sm text-gray-600 font-light leading-relaxed">
              <p>
                ห้องปฏิบัติการศิลปะ อาคาร 2 ชั้น 3 <br/>
                โรงเรียนวชิรธรรมสาธิต 1253 ซอยวชิรธรรมสาธิต 57 ถนนสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260
              </p>
              <div className="pt-2">
                <a 
                  href="line://ti/p/~0990499597" 
                  target="_blank" 
                  rel="noopener noreferrer" 
                  className="inline-flex items-center gap-1.5 text-xs font-bold text-[#00B900] hover:underline"
                >
                  <span>💬 ติดต่อกลุ่มสาระฯ ศิลปะ ผ่าน LINE</span>
                </a>
              </div>
            </div>
          </div>

        </div>
        
        {/* Bottom Legal, PDPA & Visitor Counter */}
        <div className="border-t border-gray-100 pt-8 flex flex-col md:flex-row items-center justify-between gap-4 text-xs text-gray-500 font-light">
          <div className="flex flex-col items-center md:items-start gap-1 text-center md:text-left">
            <p>
              &copy; 2569 ART ROOM กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต | ออกแบบและพัฒนาเว็บไซต์โดย นางสาวสีวลี ยืนยาว
            </p>
            <p className="text-[11px] text-gray-400">
              ผลงานและภาพถ่ายบนเว็บไซต์นี้จัดทำขึ้นเพื่อการศึกษาและการประชาสัมพันธ์ตาม พ.ร.บ. คุ้มครองข้อมูลส่วนบุคคล (PDPA)
            </p>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-gray-50 border border-gray-200 text-gray-700 text-xs font-medium">
              <Eye className="w-3.5 h-3.5 text-red-500" />
              <span>ผู้เข้าชมทั้งหมด: <strong className="font-bold text-gray-900">{visitorCount.toLocaleString()}</strong> ครั้ง</span>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}
