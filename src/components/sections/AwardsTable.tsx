"use client";

import { useState } from "react";
import { Search, Eye, FileText, X, ExternalLink, Download } from "lucide-react";
import { GRADE_GROUPS } from "@/lib/constants/grades";

const AWARD_LEVELS = [
  "รางวัลชนะเลิศอันดับ 1 (เหรียญทอง)",
  "รางวัลชนะเลิศ",
  "รางวัลรองชนะเลิศอันดับที่ 1",
  "รางวัลรองชนะเลิศอันดับที่ 2",
  "รางวัลยอดเยี่ยม",
  "รางวัลระดับเหรียญทอง",
  "รางวัลระดับเหรียญเงิน",
  "รางวัลระดับเหรียญทองแดง",
  "รางวัลชมเชย",
  "รางวัลเข้าร่วม",
  "ผ่านการคัดเลือก",
  "อื่นๆ",
];

const COMPETITION_LEVELS = [
  "ระดับสถานศึกษา/กลุ่มโรงเรียนฯ",
  "ระดับเขตพื้นที่/ระดับจังหวัด",
  "ระดับภาค/ระดับกลุ่มสถานศึกษา",
  "ระดับชาติ/ประเทศ",
  "ระดับนานาชาติ",
  "อื่นๆ",
];

const YEARS = ["2569", "2568", "2567", "2566"];

const MONTHS = [
  { value: "1", label: "มกราคม" },
  { value: "2", label: "กุมภาพันธ์" },
  { value: "3", label: "มีนาคม" },
  { value: "4", label: "เมษายน" },
  { value: "5", label: "พฤษภาคม" },
  { value: "6", label: "มิถุนายน" },
  { value: "7", label: "กรกฎาคม" },
  { value: "8", label: "สิงหาคม" },
  { value: "9", label: "กันยายน" },
  { value: "10", label: "ตุลาคม" },
  { value: "11", label: "พฤศจิกายน" },
  { value: "12", label: "ธันวาคม" },
];

export default function AwardsTable({ awards }: { awards: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterGrade, setFilterGrade] = useState("");
  const [filterAwardLevel, setFilterAwardLevel] = useState("");
  const [filterCompLevel, setFilterCompLevel] = useState("");
  
  // Lightbox modal state for Image & Certificate
  const [modalItem, setModalItem] = useState<{ url: string; title: string; type: "cert" | "image"; award?: any } | null>(null);

  const filteredAwards = awards.filter(award => {
    // Exclude invalid/empty mock entries (e.g. Untitled or Unknown)
    if (!award.title || award.title === "Untitled" || award.student === "Unknown") return false;

    const searchMatch = !searchTerm || 
      award.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      award.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.description?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.grade?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const yearMatch = !filterYear || award.year === filterYear;
    const gradeMatch = !filterGrade || (award.grade && award.grade.startsWith(filterGrade));
    const awardLevelMatch = !filterAwardLevel || award.awardLevel === filterAwardLevel;
    const compLevelMatch = !filterCompLevel || award.competitionLevel === filterCompLevel;
    
    let monthMatch = true;
    if (filterMonth && award.date) {
      const parts = award.date.split('/');
      if (parts.length >= 2) {
        const m = parts[1].replace(/^0+/, '');
        monthMatch = m === filterMonth;
      }
    } else if (filterMonth) {
      monthMatch = false;
    }

    return searchMatch && yearMatch && gradeMatch && monthMatch && awardLevelMatch && compLevelMatch;
  });

  return (
    <div className="w-full space-y-6">
      {/* Clean & Simple Filter Bar */}
      <div className="bg-white rounded-2xl border border-gray-200 p-5 shadow-sm">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
          {/* Search Input */}
          <div className="relative lg:col-span-2">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input 
              type="text" 
              placeholder="ค้นหากิจกรรม, ชื่อนักเรียน, ชั้นเรียน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-10 pl-9 pr-3 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm bg-gray-50/50 focus:bg-white transition-all"
            />
          </div>

          {/* Grade Level */}
          <select 
            value={filterGrade} 
            onChange={(e) => setFilterGrade(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm bg-gray-50/50 focus:bg-white cursor-pointer"
          >
            <option value="">-- ทุกระดับชั้น (ม.1-ม.6) --</option>
            {GRADE_GROUPS.map((group) => (
              <optgroup key={group.level} label={group.label}>
                <option value={group.level}>ทั้งระดับชั้น ({group.level})</option>
                {group.rooms.map((room) => (
                  <option key={room} value={room}>
                    {room}
                  </option>
                ))}
              </optgroup>
            ))}
          </select>

          {/* Award Level */}
          <select 
            value={filterAwardLevel} 
            onChange={(e) => setFilterAwardLevel(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm bg-gray-50/50 focus:bg-white cursor-pointer"
          >
            <option value="">-- ทุกระดับรางวัล --</option>
            {AWARD_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Year */}
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm bg-gray-50/50 focus:bg-white cursor-pointer"
          >
            <option value="">-- ทุกปีการศึกษา --</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Competition Level */}
          <select 
            value={filterCompLevel} 
            onChange={(e) => setFilterCompLevel(e.target.value)}
            className="h-10 px-3 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm bg-gray-50/50 focus:bg-white cursor-pointer"
          >
            <option value="">-- ทุกระดับการแข่งขัน --</option>
            {COMPETITION_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>
        </div>

        {/* Clear Filter Button */}
        {(searchTerm || filterYear || filterMonth || filterGrade || filterAwardLevel || filterCompLevel) && (
          <div className="mt-3 pt-3 border-t border-gray-100 flex justify-end">
            <button
              onClick={() => {
                setSearchTerm("");
                setFilterYear("");
                setFilterMonth("");
                setFilterGrade("");
                setFilterAwardLevel("");
                setFilterCompLevel("");
              }}
              className="text-xs text-red-600 hover:text-red-800 font-medium flex items-center gap-1 cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
              ล้างตัวกรอง
            </button>
          </div>
        )}
      </div>

      {/* Clean & Minimalist Table Section */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
        {/* Table Top Header Bar */}
        <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row sm:items-center justify-between gap-2 bg-gradient-to-r from-gray-50/80 via-red-50/20 to-white">
          <div className="flex items-center gap-2.5">
            <div className="w-2.5 h-2.5 rounded-full bg-red-500 shadow-xs" />
            <h3 className="font-bold text-gray-800 text-sm sm:text-base font-kanit">
              ตารางสรุปผลรางวัลและการแข่งขัน
            </h3>
          </div>
          <div className="text-xs text-gray-500 font-medium">
            แสดง <span className="text-red-600 font-bold text-sm">{filteredAwards.length}</span> จากทั้งหมด {awards.length} รายการ
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm border-collapse min-w-[1000px]">
            <thead>
              <tr className="bg-gray-50/90 text-gray-700 border-b border-gray-200 font-bold text-xs uppercase tracking-wider">
                <th className="py-4 px-5 whitespace-nowrap w-[130px]">วันที่</th>
                <th className="py-4 px-5 whitespace-nowrap w-[180px] min-w-[160px]">ผู้ได้รับรางวัล</th>
                <th className="py-4 px-5 whitespace-nowrap w-[180px] min-w-[160px]">ระดับรางวัล</th>
                <th className="py-4 px-5 whitespace-nowrap w-[180px] min-w-[160px]">ระดับการแข่งขัน</th>
                <th className="py-4 px-5 min-w-[220px]">ชื่อกิจกรรม</th>
                <th className="py-4 px-5 min-w-[260px]">รายละเอียด</th>
                <th className="py-4 px-5 text-center whitespace-nowrap w-[190px] min-w-[190px]">ดาวน์โหลด / ดูไฟล์</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAwards.length > 0 ? (
                filteredAwards.map((award) => (
                  <tr key={award.id} className="hover:bg-red-50/30 transition-colors">
                    {/* วันที่ */}
                    <td className="py-4 px-5 align-middle text-gray-600 text-xs font-medium whitespace-nowrap">
                      {award.date || award.year || '-'}
                    </td>

                    {/* ผู้ได้รับรางวัล */}
                    <td className="py-4 px-5 align-middle">
                      <div className="font-bold text-gray-900 text-sm whitespace-nowrap">{award.student}</div>
                      <div className="text-[11px] text-gray-500 font-medium">
                        {award.grade ? `นักเรียน (${award.grade})` : 'นักเรียน'}
                      </div>
                    </td>

                    {/* ระดับรางวัล */}
                    <td className="py-4 px-5 align-middle">
                      <span className="inline-flex items-center px-3 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-700 border border-red-100/80 whitespace-nowrap shadow-2xs">
                        {award.awardLevel || '-'}
                      </span>
                    </td>

                    {/* ระดับการแข่งขัน */}
                    <td className="py-4 px-5 align-middle text-gray-600 text-xs font-medium">
                      {award.competitionLevel || '-'}
                    </td>

                    {/* ชื่อกิจกรรม */}
                    <td className="py-4 px-5 align-middle font-semibold text-gray-900 text-xs sm:text-sm leading-snug">
                      {award.title || '-'}
                    </td>

                    {/* รายละเอียด */}
                    <td className="py-4 px-5 align-middle text-gray-500 text-xs leading-relaxed">
                      {award.description || '-'}
                    </td>

                    {/* ดูไฟล์ภาพ / เกียรติบัตร */}
                    <td className="py-4 px-5 align-middle text-center whitespace-nowrap">
                      <div className="inline-flex items-center justify-center gap-2 whitespace-nowrap">
                        {award.imageUrl && (
                          <button
                            onClick={() => setModalItem({ url: award.imageUrl, title: award.title, type: "image", award })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 transition-colors whitespace-nowrap flex-shrink-0 cursor-pointer"
                            title="ดูรูปภาพผลงาน"
                          >
                            <Eye className="w-3.5 h-3.5 text-gray-500" />
                            <span>ดูรูป</span>
                          </button>
                        )}

                        {(award.certificateUrl || award.imageUrl) && (
                          <button
                            onClick={() => setModalItem({ 
                              url: award.certificateUrl || award.imageUrl, 
                              title: `เกียรติบัตร - ${award.student}`, 
                              type: "cert", 
                              award 
                            })}
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold text-red-700 bg-red-50 hover:bg-red-100 border border-red-200/80 transition-colors whitespace-nowrap flex-shrink-0 shadow-2xs cursor-pointer"
                            title="ดูเกียรติบัตร"
                          >
                            <FileText className="w-3.5 h-3.5 text-red-600" />
                            <span>เกียรติบัตร</span>
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-gray-400 text-sm">
                    ไม่พบข้อมูลรางวัลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Clean Modal for Previewing Image or Certificate */}
      {modalItem && (
        <div 
          className="fixed inset-0 z-[9999] bg-black/80 flex items-center justify-center p-4 animate-in fade-in duration-200"
          onClick={() => setModalItem(null)}
        >
          <div 
            className="bg-white rounded-2xl max-w-3xl w-full max-h-[85vh] overflow-hidden flex flex-col shadow-2xl relative border border-gray-200 z-[10000]"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between px-5 py-4 border-b border-gray-200 bg-gray-50">
              <div className="flex items-center gap-2">
                <FileText className="w-5 h-5 text-red-600" />
                <h3 className="font-bold text-gray-900 text-sm">{modalItem.title}</h3>
              </div>
              <button 
                onClick={() => setModalItem(null)}
                className="w-8 h-8 rounded-full text-gray-500 hover:bg-gray-200 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4 flex items-center justify-center bg-gray-100 overflow-auto max-h-[60vh]">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={modalItem.url} 
                alt={modalItem.title} 
                className="max-w-full max-h-[55vh] object-contain rounded-lg border border-gray-200 shadow-sm"
                onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/eeeeee/999999?text=File+Not+Found")}
              />
            </div>

            {/* Modal Footer */}
            <div className="px-5 py-3.5 border-t border-gray-200 flex items-center justify-between bg-white">
              <span className="text-xs text-gray-500">{modalItem.award?.student}</span>
              <div className="flex items-center gap-2">
                <a
                  href={modalItem.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-3 py-1.5 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium flex items-center gap-1 transition-colors"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  เปิดเต็มจอ
                </a>
                <a
                  href={modalItem.url}
                  download={`certificate-${modalItem.award?.student || 'award'}.png`}
                  className="px-4 py-1.5 rounded-lg bg-red-600 hover:bg-red-700 text-white text-xs font-semibold flex items-center gap-1 transition-colors shadow-sm"
                >
                  <Download className="w-3.5 h-3.5" />
                  ดาวน์โหลด
                </a>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
