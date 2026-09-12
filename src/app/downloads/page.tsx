"use client";

import { useState, useMemo } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Download, FileText, Search, Sparkles, Filter, CheckCircle2, GraduationCap } from "lucide-react";

// Default educational worksheets and download resources
const DEFAULT_DOWNLOADS = [
  {
    id: "dl-1",
    title: "ใบงานที่ 1: การแรเงาและน้ำหนักแสงเงา (Shading Techniques & Value Scale)",
    description: "แบบฝึกปฏิบัติการลงน้ำหนัก 7 ระดับ ด้วยดินสอดำ EE สำหรับนักเรียนเริ่มต้น",
    category: "แบบฝึกหัด",
    grade: "m3",
    fileName: "worksheet_01_shading_wts.pdf",
    fileSize: "1.4 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 142,
  },
  {
    id: "dl-2",
    title: "ใบความรู้: ทฤษฎีสีและวงจรสีสากล 12 สี (Color Theory & Wheel)",
    description: "สรุปแม่สีขั้นที่ 1, 2, 3 วรรณะสี และคู่สีตรงข้าม พร้อมตัวอย่างการผสมสีน้ำ",
    category: "ใบความรู้",
    grade: "all",
    fileName: "color_theory_handbook_wts.pdf",
    fileSize: "2.8 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 310,
  },
  {
    id: "dl-3",
    title: "ใบงานที่ 2: การเขียนภาพทัศนียภาพ 1 จุด และ 2 จุด (Perspective Drawing)",
    description: "หลักการลากเส้นระดับสายตา (Eye Level) และจุดรวมสายตา (Vanishing Point)",
    category: "แบบฝึกหัด",
    grade: "m4",
    fileName: "perspective_drawing_m4.pdf",
    fileSize: "3.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 98,
  },
  {
    id: "dl-4",
    title: "เกณฑ์การให้คะแนนผลงานทัศนศิลป์ (Art Rubric Assessment Score)",
    description: "เกณฑ์การประเมินความคิดสร้างสรรค์ ความประณีต และการสื่อความหมาย",
    category: "เกณฑ์การประเมิน",
    grade: "all",
    fileName: "art_rubric_assessment_wts.pdf",
    fileSize: "850 KB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 75,
  },
  {
    id: "dl-5",
    title: "ใบงานทบทวน: เทคนิคการระบายสีโปสเตอร์แบบเปียกบนแห้ง และปาดเรียบ",
    description: "แบบฝึกผสมน้ำและควบคุมเนื้อสีโปสเตอร์ให้เรียบเนียนสม่ำเสมอ ไม่เป็นคราบ",
    category: "แบบฝึกหัด",
    grade: "m3",
    fileName: "poster_color_exercise_m3.pdf",
    fileSize: "1.9 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 184,
  },
  {
    id: "dl-6",
    title: "คู่มือนักเรียน: กฎความปลอดภัยและการดูแลรักษาอุปกรณ์ในห้องปฏิบัติการศิลปะ",
    description: "ระเบียบการยืม-คืนพู่กัน การล้างจานสี การทิ้งสารเคมี และมารยาทการใช้ห้อง",
    category: "คู่มือ",
    grade: "all",
    fileName: "art_room_safety_guide.pdf",
    fileSize: "1.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 220,
  },
];

const CATEGORIES = ["ทั้งหมด", "แบบฝึกหัด", "ใบความรู้", "เกณฑ์การประเมิน", "คู่มือ"];
const GRADES = [
  { id: "all", label: "ทุกระดับชั้น" },
  { id: "m1", label: "ม.1" },
  { id: "m2", label: "ม.2" },
  { id: "m3", label: "ม.3" },
  { id: "m4", label: "ม.4" },
  { id: "m5", label: "ม.5" },
  { id: "m6", label: "ม.6" },
];

export default function DownloadsPage() {
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [selectedGrade, setSelectedGrade] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");

  const filteredDownloads = useMemo(() => {
    return DEFAULT_DOWNLOADS.filter((item) => {
      // Search filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        if (!item.title.toLowerCase().includes(q) && !item.description.toLowerCase().includes(q)) {
          return false;
        }
      }
      // Category filter
      if (selectedCategory !== "ทั้งหมด" && item.category !== selectedCategory) {
        return false;
      }
      // Grade filter
      if (selectedGrade !== "all" && item.grade !== "all" && item.grade !== selectedGrade) {
        return false;
      }
      return true;
    });
  }, [searchQuery, selectedCategory, selectedGrade]);

  const handleDownload = (id: string, url: string, fileName: string) => {
    // Record download event asynchronously
    fetch(`/api/downloads?id=${id}`, { method: "PATCH" }).catch(() => {});
    // Open/download link
    window.open(url, "_blank");
  };

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-[#FDF9F1]">
        
        {/* Hero Header */}
        <section className="relative overflow-hidden pt-12 pb-10 border-b border-red-100/60 bg-gradient-to-b from-red-50/50 via-white to-transparent">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-emerald-100 text-emerald-800 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
              <Sparkles className="w-4 h-4 text-emerald-600 animate-pulse" />
              <span>ศูนย์รวมเอกสารการเรียนรู้ | Art Download Center</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
              คลังดาวน์โหลดใบงานและคู่มือ
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
              ดาวน์โหลดใบงานภาคปฏิบัติ ชีตสรุปทฤษฎีสี แบบฝึกหัดดรอว์อิ้ง และเอกสารประกอบการเรียนรู้ในรูปแบบ PDF เพื่อฝึกฝนได้ทุกที่ทุกเวลา
            </p>

            {/* Search Input */}
            <div className="mt-8 max-w-xl mx-auto relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="ค้นหาชื่อใบงาน, หัวข้อ, หรือระดับชั้น..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 pl-11 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-100 outline-none text-sm shadow-xs transition-all"
              />
            </div>
          </div>
        </section>

        {/* Content Section */}
        <section className="py-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            
            {/* Grade Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-4 scrollbar-none">
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap flex items-center gap-1 mr-2">
                <GraduationCap className="w-4 h-4 text-red-500" /> ระดับชั้น:
              </span>
              {GRADES.map((g) => (
                <button
                  key={g.id}
                  onClick={() => setSelectedGrade(g.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    selectedGrade === g.id
                      ? "bg-red-600 text-white shadow-xs"
                      : "bg-white text-gray-700 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {g.label}
                </button>
              ))}
            </div>

            {/* Category Pills */}
            <div className="flex items-center gap-2 overflow-x-auto pb-3 mb-8 scrollbar-none">
              <span className="text-xs font-bold text-gray-600 whitespace-nowrap flex items-center gap-1 mr-2">
                <Filter className="w-3.5 h-3.5 text-gray-500" /> หมวดหมู่:
              </span>
              {CATEGORIES.map((cat) => (
                <button
                  key={cat}
                  onClick={() => setSelectedCategory(cat)}
                  className={`px-3 py-1 rounded-xl text-xs font-medium whitespace-nowrap transition-all cursor-pointer ${
                    selectedCategory === cat
                      ? "bg-gray-900 text-white"
                      : "bg-white text-gray-600 hover:bg-gray-100 border border-gray-200"
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>

            {/* Downloads List */}
            {filteredDownloads.length === 0 ? (
              <div className="text-center py-20 bg-white rounded-3xl border border-dashed border-gray-200 p-6">
                <FileText className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                <h3 className="font-bold text-gray-800 text-base mb-1">ไม่พบเอกสารที่ค้นหา</h3>
                <p className="text-xs text-gray-500">กรุณาลองเปลี่ยนคำค้นหาหรือตัวเลือกระดับชั้น</p>
              </div>
            ) : (
              <div className="space-y-4">
                {filteredDownloads.map((item) => (
                  <div 
                    key={item.id}
                    className="bg-white rounded-2xl p-5 border border-gray-100 shadow-2xs hover:shadow-md transition-all duration-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4 group"
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-red-600 flex items-center justify-center flex-shrink-0 group-hover:bg-red-600 group-hover:text-white transition-colors">
                        <FileText className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1 flex-wrap">
                          <span className="bg-red-100 text-red-700 text-[10px] font-bold px-2 py-0.5 rounded-md">
                            {item.grade === "all" ? "ทุกชั้น" : item.grade.toUpperCase()}
                          </span>
                          <span className="bg-gray-100 text-gray-600 text-[10px] font-medium px-2 py-0.5 rounded-md">
                            {item.category}
                          </span>
                          <span className="text-[11px] text-gray-400">
                            {item.fileSize}
                          </span>
                        </div>
                        <h4 className="text-sm sm:text-base font-bold text-gray-900 group-hover:text-red-600 transition-colors">
                          {item.title}
                        </h4>
                        <p className="text-xs text-gray-500 mt-0.5 line-clamp-1 font-light">
                          {item.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3 self-end sm:self-center flex-shrink-0">
                      <button
                        onClick={() => handleDownload(item.id, item.fileUrl, item.fileName)}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-red-600 hover:bg-red-700 active:scale-95 text-white font-bold text-xs sm:text-sm rounded-xl transition-all shadow-xs cursor-pointer"
                      >
                        <Download className="w-4 h-4" />
                        <span>ดาวน์โหลด PDF</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {/* PDPA & Copyright Notice Box */}
            <div className="mt-12 bg-white/60 backdrop-blur-xs rounded-2xl p-6 border border-red-100 text-center text-xs text-gray-500 space-y-1">
              <p className="font-semibold text-gray-700 flex items-center justify-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                เอกสารทั้งหมดจัดทำขึ้นเพื่อการศึกษาโดยไม่มีค่าใช้จ่าย
              </p>
              <p className="font-light">
                สงวนลิขสิทธิ์ตาม พ.ร.บ. ลิขสิทธิ์ กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
              </p>
            </div>

          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
