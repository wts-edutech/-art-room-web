"use client";

import { useState, useEffect } from "react";
import { Award, ArrowDownToLine } from "lucide-react";

const THAI_MONTHS = [
  "", "มกราคม", "กุมภาพันธ์", "มีนาคม", "เมษายน", "พฤษภาคม", "มิถุนายน",
  "กรกฎาคม", "สิงหาคม", "กันยายน", "ตุลาคม", "พฤศจิกายน", "ธันวาคม"
];

function getMonthYearLabel(dateStr: string) {
  if (!dateStr) return "ผลงานอื่นๆ";
  // Try to parse DD/MM/YYYY
  const parts = dateStr.split('/');
  if (parts.length >= 3) {
    const month = parseInt(parts[1], 10);
    const year = parts[2];
    if (month >= 1 && month <= 12) {
      return `เดือน${THAI_MONTHS[month]} ${year}`;
    }
  }
  // Fallback if not matching DD/MM/YYYY
  return "ผลงานอื่นๆ";
}

export default function AwardsTable() {
  const [groupedArtworks, setGroupedArtworks] = useState<Record<string, any[]>>({});
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchArtworks = async () => {
      try {
        const res = await fetch("/api/awards");
        const data = await res.json();
        
        // Group by month
        const grouped: Record<string, any[]> = {};
        data.forEach((artwork: any) => {
          const groupLabel = getMonthYearLabel(artwork.date);
          if (!grouped[groupLabel]) {
            grouped[groupLabel] = [];
          }
          grouped[groupLabel].push(artwork);
        });
        
        setGroupedArtworks(grouped);
      } catch (error) {
        console.error("Failed to fetch artworks", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchArtworks();
  }, []);

  if (isLoading) {
    return <div className="text-center py-12 text-gray-500">กำลังโหลดข้อมูลรางวัล...</div>;
  }

  if (Object.keys(groupedArtworks).length === 0) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 sm:px-6 max-w-5xl mt-16 pb-12 pt-4">
      <div className="flex items-center gap-3 mb-12 justify-center">
        <div className="w-12 h-12 rounded-2xl bg-[#c10000] flex items-center justify-center text-white shadow-lg">
          <Award className="w-6 h-6" />
        </div>
        <div>
          <h2 className="text-3xl md:text-4xl font-bold font-heading text-gray-900 tracking-tight">
            รางวัลที่ได้รับ
          </h2>
        </div>
      </div>

      <div className="space-y-16">
        {Object.entries(groupedArtworks).map(([groupLabel, artworks]) => (
          <div key={groupLabel}>
            {/* Red Month Header aligned left, resembling a tab */}
            <div className="mb-6 flex overflow-hidden">
              <div className="bg-[#c10000] text-white px-8 py-3 rounded-full font-bold text-lg md:text-xl relative inline-block shadow-md whitespace-nowrap z-10">
                {groupLabel}
              </div>
              <div className="flex-1 border-b-4 border-[#c10000] ml-[-20px] mb-4 z-0 translate-y-[2px]"></div>
            </div>

            {/* Table wrapper for horizontal scroll on small screens */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-300 overflow-x-auto">
              <table className="w-full text-left border-collapse min-w-[700px]">
                <thead>
                  <tr>
                    <th className="bg-[#c10000] text-white font-bold py-4 px-6 border-r border-[#a00000] border-b border-[#a00000] text-center w-[15%]">
                      วันที่
                    </th>
                    <th className="bg-[#c10000] text-white font-bold py-4 px-6 border-r border-[#a00000] border-b border-[#a00000] text-center w-[45%]">
                      รายการ
                    </th>
                    <th className="bg-[#c10000] text-white font-bold py-4 px-6 border-r border-[#a00000] border-b border-[#a00000] text-center w-[25%]">
                      รางวัลที่ได้รับ
                    </th>
                    <th className="bg-[#c10000] text-white font-bold py-4 px-6 border-b border-[#a00000] text-center w-[15%]">
                      รูปภาพ
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-300">
                  {artworks.map((artwork, idx) => (
                    <tr key={artwork.id} className="hover:bg-gray-50 transition-colors">
                      <td className="py-5 px-6 border-r border-gray-300 text-center text-gray-700 font-medium">
                        {artwork.date}
                      </td>
                      <td className="py-5 px-6 border-r border-gray-300 text-gray-800">
                        {artwork.activityName}
                      </td>
                      <td className="py-5 px-6 border-r border-gray-300 text-center text-gray-700">
                        {artwork.award}
                      </td>
                      <td className="py-5 px-6 text-center align-middle">
                        {artwork.imageUrl && (
                          <a 
                            href={artwork.imageUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex w-12 h-12 bg-[#c10000] hover:bg-[#a00000] text-white rounded-full items-center justify-center transition-transform hover:scale-110 shadow-md"
                            title="ดูเกียรติบัตร / รูปภาพ"
                          >
                            <ArrowDownToLine className="w-6 h-6" />
                          </a>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
