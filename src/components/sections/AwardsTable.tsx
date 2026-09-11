"use client";

import { useState } from "react";
import { Search } from "lucide-react";

// Predefined dropdown options matching the reference images
const AWARD_LEVELS = [
  "รางวัลชนะเลิศ",
  "รางวัลรองชนะเลิศอันดับที่ 1",
  "รางวัลรองชนะเลิศอันดับที่ 2",
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
  const [filterAwardLevel, setFilterAwardLevel] = useState("");
  const [filterCompLevel, setFilterCompLevel] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  // Extract unique organizations from data
  const orgs = Array.from(new Set(awards.map(a => a.organization).filter(Boolean)));

  const filteredAwards = awards.filter(award => {
    const searchMatch = !searchTerm || 
      award.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      award.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const yearMatch = !filterYear || award.year === filterYear;
    const awardLevelMatch = !filterAwardLevel || award.awardLevel === filterAwardLevel;
    const compLevelMatch = !filterCompLevel || award.competitionLevel === filterCompLevel;
    const orgMatch = !filterOrg || award.organization === filterOrg;
    
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

    return searchMatch && yearMatch && monthMatch && awardLevelMatch && compLevelMatch && orgMatch;
  });

  return (
    <div className="w-full">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-red-600 rounded-full"></div>
          <h2 className="text-lg font-bold text-gray-900">ค้นหาและกรองข้อมูล</h2>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search Input */}
          <div className="relative col-span-1 md:col-span-2 lg:col-span-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
            <input 
              type="text" 
              placeholder="พิมพ์คำค้นหากิจกรรม/ผลงาน..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-red-500 focus:ring-1 focus:ring-red-500 outline-none text-sm"
            />
          </div>

          {/* Award Level */}
          <select 
            value={filterAwardLevel} 
            onChange={(e) => setFilterAwardLevel(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="">-- ทุกระดับรางวัล --</option>
            {AWARD_LEVELS.map(a => <option key={a} value={a}>{a}</option>)}
          </select>

          {/* Year */}
          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="">-- ปีการศึกษา --</option>
            {YEARS.map(y => <option key={y} value={y}>{y}</option>)}
          </select>

          {/* Month */}
          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="">-- ทุกเดือน --</option>
            {MONTHS.map(m => <option key={m.value} value={m.value}>{m.label}</option>)}
          </select>

          {/* Competition Level */}
          <select 
            value={filterCompLevel} 
            onChange={(e) => setFilterCompLevel(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="">-- ทุกระดับผลงาน/การแข่งขัน --</option>
            {COMPETITION_LEVELS.map(c => <option key={c} value={c}>{c}</option>)}
          </select>

          {/* Organization */}
          <select 
            value={filterOrg} 
            onChange={(e) => setFilterOrg(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-red-500 outline-none text-sm appearance-none bg-white cursor-pointer"
          >
            <option value="">-- ทุกหน่วยงานที่จัด --</option>
            {orgs.map(o => <option key={o as string} value={o as string}>{o}</option>)}
          </select>
        </div>
      </div>

      {/* Table Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="bg-red-700 text-white">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">วันที่</th>
                <th className="p-4 font-semibold whitespace-nowrap">ประเภทผู้ได้รับรางวัล</th>
                <th className="p-4 font-semibold whitespace-nowrap">ระดับรางวัล/ผลงาน</th>
                <th className="p-4 font-semibold whitespace-nowrap">ระดับผลงาน/การแข่งขัน</th>
                <th className="p-4 font-semibold whitespace-nowrap">หน่วยงานที่จัด</th>
                <th className="p-4 font-semibold whitespace-nowrap min-w-[200px]">ชื่อกิจกรรม</th>
                <th className="p-4 font-semibold whitespace-nowrap min-w-[250px]">รายละเอียดกิจกรรม</th>
                <th className="p-4 font-semibold whitespace-nowrap">ภาพ</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAwards.length > 0 ? (
                filteredAwards.map((award) => (
                  <tr key={award.id} className="hover:bg-red-50/50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="text-gray-600 w-20 whitespace-nowrap">
                        {award.date || '-'}
                      </div>
                    </td>
                    <td className="p-4 align-top text-gray-700">นักเรียน<br/><span className="text-gray-500 text-xs">({award.student})</span></td>
                    <td className="p-4 align-top font-medium text-red-700">{award.awardLevel || '-'}</td>
                    <td className="p-4 align-top text-gray-600">{award.competitionLevel || '-'}</td>
                    <td className="p-4 align-top text-gray-600">{award.organization || '-'}</td>
                    <td className="p-4 align-top font-bold text-gray-900">{award.title || '-'}</td>
                    <td className="p-4 align-top text-gray-600 whitespace-pre-wrap">{award.description || '-'}</td>
                    <td className="p-4 align-top">
                      {award.imageUrl ? (
                        <a href={award.imageUrl} target="_blank" rel="noopener noreferrer" className="inline-flex items-center justify-center w-10 h-10 bg-red-50 text-red-600 rounded-lg hover:bg-red-100 transition-colors" title="ดาวน์โหลดรูปภาพ">
                          <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                        </a>
                      ) : '-'}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="p-8 text-center text-gray-400">
                    ไม่พบข้อมูลรางวัลที่ตรงกับเงื่อนไข
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
