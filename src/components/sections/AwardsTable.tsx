"use client";

import { useState } from "react";
import { Search } from "lucide-react";

export default function AwardsTable({ awards }: { awards: any[] }) {
  const [searchTerm, setSearchTerm] = useState("");
  const [filterYear, setFilterYear] = useState("");
  const [filterMonth, setFilterMonth] = useState("");
  const [filterAwardLevel, setFilterAwardLevel] = useState("");
  const [filterCompLevel, setFilterCompLevel] = useState("");
  const [filterOrg, setFilterOrg] = useState("");

  // Extract unique filter options from data
  const years = Array.from(new Set(awards.map(a => a.year).filter(Boolean)));
  const awardLevels = Array.from(new Set(awards.map(a => a.awardLevel).filter(Boolean)));
  const compLevels = Array.from(new Set(awards.map(a => a.competitionLevel).filter(Boolean)));
  const orgs = Array.from(new Set(awards.map(a => a.organization).filter(Boolean)));

  const filteredAwards = awards.filter(award => {
    // Search term matching
    const searchMatch = !searchTerm || 
      award.title?.toLowerCase().includes(searchTerm.toLowerCase()) || 
      award.student?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      award.description?.toLowerCase().includes(searchTerm.toLowerCase());
    
    // Exact matching for dropdowns
    const yearMatch = !filterYear || award.year === filterYear;
    const awardLevelMatch = !filterAwardLevel || award.awardLevel === filterAwardLevel;
    const compLevelMatch = !filterCompLevel || award.competitionLevel === filterCompLevel;
    const orgMatch = !filterOrg || award.organization === filterOrg;
    
    // Month extraction (basic implementation assuming date is DD/MM/YYYY or similar)
    // If date format is varied, this might need more robust parsing
    let monthMatch = true;
    if (filterMonth && award.date) {
      const parts = award.date.split('/');
      if (parts.length >= 2) {
        // Assume format DD/MM/YYYY
        const m = parts[1].replace(/^0+/, ''); // remove leading zero
        monthMatch = m === filterMonth;
      }
    } else if (filterMonth) {
      monthMatch = false; // Filter is set, but no date
    }

    return searchMatch && yearMatch && monthMatch && awardLevelMatch && compLevelMatch && orgMatch;
  });

  return (
    <div className="w-full">
      {/* Filter Section */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-6 mb-8">
        <div className="flex items-center gap-2 mb-4">
          <div className="w-1 h-6 bg-teal-700 rounded-full"></div>
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
              className="w-full h-12 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-teal-500 focus:ring-1 focus:ring-teal-500 outline-none text-sm"
            />
          </div>

          <select value="" disabled className="h-12 px-4 rounded-xl border border-gray-200 bg-gray-50 text-gray-500 text-sm appearance-none outline-none">
            <option>-- ทุกประเภทผู้ได้รับรางวัล (นักเรียน) --</option>
          </select>

          <select 
            value={filterYear} 
            onChange={(e) => setFilterYear(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
          >
            <option value="">-- ทุกปี --</option>
            {years.map(y => <option key={y as string} value={y as string}>{y}</option>)}
          </select>

          <select 
            value={filterMonth} 
            onChange={(e) => setFilterMonth(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
          >
            <option value="">-- ทุกเดือน --</option>
            <option value="1">มกราคม</option>
            <option value="2">กุมภาพันธ์</option>
            <option value="3">มีนาคม</option>
            <option value="4">เมษายน</option>
            <option value="5">พฤษภาคม</option>
            <option value="6">มิถุนายน</option>
            <option value="7">กรกฎาคม</option>
            <option value="8">สิงหาคม</option>
            <option value="9">กันยายน</option>
            <option value="10">ตุลาคม</option>
            <option value="11">พฤศจิกายน</option>
            <option value="12">ธันวาคม</option>
          </select>

          <select 
            value={filterAwardLevel} 
            onChange={(e) => setFilterAwardLevel(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
          >
            <option value="">-- ทุกระดับรางวัล --</option>
            {awardLevels.map(a => <option key={a as string} value={a as string}>{a}</option>)}
          </select>

          <select 
            value={filterCompLevel} 
            onChange={(e) => setFilterCompLevel(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
          >
            <option value="">-- ทุกระดับผลงาน/การแข่งขัน --</option>
            {compLevels.map(c => <option key={c as string} value={c as string}>{c}</option>)}
          </select>

          <select 
            value={filterOrg} 
            onChange={(e) => setFilterOrg(e.target.value)}
            className="h-12 px-4 rounded-xl border border-gray-200 focus:border-teal-500 outline-none text-sm appearance-none bg-white"
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
            <thead className="bg-[#1A7367] text-white">
              <tr>
                <th className="p-4 font-semibold whitespace-nowrap">วันที่</th>
                <th className="p-4 font-semibold whitespace-nowrap">ประเภทผู้ได้รับรางวัล</th>
                <th className="p-4 font-semibold whitespace-nowrap">ระดับรางวัล/ผลงาน</th>
                <th className="p-4 font-semibold whitespace-nowrap">ระดับผลงาน/การแข่งขัน</th>
                <th className="p-4 font-semibold whitespace-nowrap">หน่วยงานที่จัด</th>
                <th className="p-4 font-semibold whitespace-nowrap min-w-[200px]">ชื่อกิจกรรม</th>
                <th className="p-4 font-semibold whitespace-nowrap min-w-[250px]">รายละเอียดกิจกรรม</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredAwards.length > 0 ? (
                filteredAwards.map((award, index) => (
                  <tr key={award.id} className="hover:bg-gray-50 transition-colors">
                    <td className="p-4 align-top">
                      <div className="text-gray-600 w-16 break-words">
                        {award.date ? award.date.replace(/\//g, '\n') : '-'}
                      </div>
                    </td>
                    <td className="p-4 align-top text-gray-700">นักเรียน<br/><span className="text-gray-500 text-xs">({award.student})</span></td>
                    <td className="p-4 align-top font-medium text-teal-700">{award.awardLevel || '-'}</td>
                    <td className="p-4 align-top text-gray-600">{award.competitionLevel || '-'}</td>
                    <td className="p-4 align-top text-gray-600">{award.organization || '-'}</td>
                    <td className="p-4 align-top font-bold text-gray-900">{award.title || '-'}</td>
                    <td className="p-4 align-top text-gray-600 whitespace-pre-wrap">{award.description || '-'}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={7} className="p-8 text-center text-gray-400">
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
