"use client";

import { useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  Laptop, HelpCircle, User, Star, 
  Lightbulb, Eye, MessageSquare, HeartHandshake, 
  FileText, BookOpen
} from "lucide-react";

// Hand-crafted high-fidelity mascot avatar matching Image 2 perfectly
function TeacherMascotAvatar({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      {/* Soft background glow */}
      <circle cx="60" cy="60" r="56" fill="#F4EFEA" />
      {/* Body / Shirt */}
      <path d="M22 118 C22 92 38 84 60 84 C82 84 98 92 98 118 Z" fill="#FFA8A4" />
      {/* Collar */}
      <polygon points="60,88 46,84 52,98" fill="#F87171" />
      <polygon points="60,88 74,84 68,98" fill="#F87171" />
      <circle cx="60" cy="106" r="2.5" fill="#FFFFFF" />
      {/* Neck */}
      <rect x="52" y="73" width="16" height="16" fill="#FFD8B8" rx="4" />
      {/* Head */}
      <ellipse cx="60" cy="54" rx="30" ry="28" fill="#FFD8B8" />
      {/* Ears */}
      <circle cx="30" cy="56" r="7" fill="#FFD8B8" />
      <circle cx="90" cy="56" r="7" fill="#FFD8B8" />
      {/* Blushing cheeks */}
      <ellipse cx="43" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      <ellipse cx="77" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      {/* Cute smile */}
      <path d="M52 63 C56 68 64 68 68 63" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" />
      {/* Glasses */}
      <rect x="37" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <rect x="64" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <path d="M56 53 L64 53" stroke="#1F2937" strokeWidth="2.5" />
      {/* Eyes behind glasses */}
      <circle cx="46.5" cy="53" r="2.3" fill="#1F2937" />
      <circle cx="73.5" cy="53" r="2.3" fill="#1F2937" />
      {/* Eyebrows */}
      <path d="M41 41.5 C45 39.5 49 40.5 52 42.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 42.5 C71 40.5 75 39.5 79 41.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      {/* Fluffy Messy Black Hair */}
      <path d="M29 49 C26 29 37 14 60 14 C83 14 94 29 91 49 C88 40 82 34 76 36 C71 27 62 24 54 27 C45 25 38 33 34 40 C32 43 31 46 29 49 Z" fill="#374151" />
      <path d="M35 36 C42 45 48 42 52 37 C56 44 62 44 66 38 C71 45 76 43 83 37 C81 48 76 50 71 46" fill="#374151" />
    </svg>
  );
}

export default function TeacherProfileClient() {
  const searchParams = useSearchParams();
  const nameParam = searchParams.get("name") || "สลิน";

  const [activeTab, setActiveTab] = useState<"profile" | "ideas" | "reviews">("profile");
  const [teacherIdeas, setTeacherIdeas] = useState<any[]>([]);
  const [isLoadingIdeas, setIsLoadingIdeas] = useState(false);

  // Fetch ideas by this teacher
  useEffect(() => {
    setIsLoadingIdeas(true);
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          const matched = data.filter(
            (item) => item.authorName?.toLowerCase() === nameParam.toLowerCase()
          );
          setTeacherIdeas(matched.length > 0 ? matched : data.slice(0, 3));
        }
      })
      .catch(() => {})
      .finally(() => setIsLoadingIdeas(false));
  }, [nameParam]);

  return (
    <div className="min-h-screen bg-[#FAF7F2] flex flex-col font-sans text-gray-800 selection:bg-orange-100 selection:text-orange-900">
      <Navbar />

      {/* Top Profile Header (White Background matching Reference Image 2 100%) */}
      <section className="bg-white border-b border-gray-200/80 pt-28 sm:pt-32">
        <div className="max-w-6xl mx-auto px-4 sm:px-8 pr-14 sm:pr-20">
          {/* Avatar & Teacher Name Row */}
          <div className="flex items-center gap-5 sm:gap-6 pb-6">
            {/* Mascot Avatar without extra button/border, standing freely on background */}
            <div className="w-24 h-24 sm:w-28 sm:h-28 rounded-full overflow-hidden shrink-0 flex items-center justify-center">
              <TeacherMascotAvatar className="w-full h-full" />
            </div>

            {/* Name & Follower counts */}
            <div className="min-w-0">
              <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 leading-tight truncate">
                {nameParam}
              </h1>
              <div className="flex items-center gap-4 text-xs sm:text-sm text-gray-600 font-medium mt-1">
                <span>ผู้ติดตาม <strong className="text-gray-900 font-bold">0</strong></span>
                <span>กำลังติดตาม <strong className="text-gray-900 font-bold">0</strong></span>
              </div>
            </div>
          </div>

          {/* Navigation Tabs (Exactly matching Reference Image 2) */}
          <div className="flex items-center gap-8 text-sm font-medium border-t border-gray-100 pt-1">
            <button
              type="button"
              onClick={() => setActiveTab("profile")}
              className={`pb-3 px-2 transition-all cursor-pointer ${
                activeTab === "profile"
                  ? "text-gray-900 font-bold border-b-[3px] border-[#1E3A8A]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              โปรไฟล์
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("ideas")}
              className={`pb-3 px-2 transition-all cursor-pointer ${
                activeTab === "ideas"
                  ? "text-gray-900 font-bold border-b-[3px] border-[#1E3A8A]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              ไอเดีย
            </button>
            <button
              type="button"
              onClick={() => setActiveTab("reviews")}
              className={`pb-3 px-2 transition-all cursor-pointer ${
                activeTab === "reviews"
                  ? "text-gray-900 font-bold border-b-[3px] border-[#1E3A8A]"
                  : "text-gray-500 hover:text-gray-800"
              }`}
            >
              รีวิว (0)
            </button>
          </div>
        </div>
      </section>

      {/* Main Content Area (Soft Warm Cream Background #FAF7F2 matching Reference 100%) */}
      <main className="flex-1 py-8 px-4 sm:px-8 pr-14 sm:pr-20">
        <div className="max-w-6xl mx-auto">
          {activeTab === "profile" && (
            <div className="flex flex-col md:flex-row items-start gap-6 w-full">
              {/* LEFT COLUMN: คุณครู + Impact Points (Fixed ~280px-300px width on desktop) */}
              <div className="w-full md:w-[280px] md:min-w-[280px] md:max-w-[280px] shrink-0 flex flex-col gap-4">
                {/* Card 1: คุณครู */}
                <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <h3 className="text-xs font-bold text-gray-900 mb-2">คุณครู</h3>
                  <p className="text-xs text-gray-700 leading-relaxed font-normal">
                    โรงเรียน โรงเรียนบ้านเกาะน้ำโจน ๑ ประถมปลาย
                  </p>
                  <div className="text-xs text-gray-700 mt-2 flex items-center gap-1.5">
                    <Laptop className="w-3.5 h-3.5 text-gray-500 shrink-0" />
                    <span>ภาษาต่างประเทศ, ภาษาอังกฤษ</span>
                  </div>
                </div>

                {/* Card 2: Impact Points */}
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] relative text-center">
                  <button 
                    type="button" 
                    className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors cursor-pointer"
                    title="Impact Points"
                  >
                    <HelpCircle className="w-4 h-4" />
                  </button>

                  <h3 className="text-base font-bold text-gray-900 font-heading tracking-tight">
                    Impact Points
                  </h3>
                  <p className="text-[11px] text-gray-400 mt-0.5">
                    เริ่มนับตั้งแต่ 16 ก.ค. 2567
                  </p>

                  <div className="text-4xl sm:text-5xl font-black text-[#FFB300] mt-4 tracking-tight">
                    150
                  </div>
                </div>
              </div>

              {/* RIGHT COLUMN: การให้คำปรึกษา + การแลกเปลี่ยนเรียนรู้ใน insKru + นักเรียนรู้ */}
              <div className="flex-1 min-w-0 flex flex-col gap-6">
                {/* Section 1: การให้คำปรึกษา */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      การให้คำปรึกษา
                    </h3>
                    <button type="button" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-gray-700 mb-2.5">
                    นักแบ่งปัน
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Card 1: session */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="w-6 h-6 rounded-md border border-emerald-500 text-emerald-600 flex items-center justify-center">
                          <User className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">session</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">0</span>
                    </div>

                    {/* Card 2: รีวิว */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <Star className="w-5 h-5 text-amber-400 stroke-[1.8]" />
                        <span className="text-xs text-gray-500 font-medium">รีวิว</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">0</span>
                    </div>
                  </div>
                </div>

                {/* Section 2: การแลกเปลี่ยนเรียนรู้ใน insKru */}
                <div>
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="text-sm sm:text-base font-bold text-gray-900">
                      การแลกเปลี่ยนเรียนรู้ใน insKru
                    </h3>
                    <button type="button" className="text-gray-400 hover:text-gray-600 cursor-pointer">
                      <HelpCircle className="w-4 h-4" />
                    </button>
                  </div>

                  <h4 className="text-xs font-bold text-gray-700 mb-2.5">
                    นักแบ่งปัน
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Item 1: ไอเดีย */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <Lightbulb className="w-5 h-5 text-amber-500 stroke-[1.8]" />
                        <span className="text-xs text-gray-500 font-medium">ไอเดีย</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">3</span>
                    </div>

                    {/* Item 2: ผู้อ่าน */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <Eye className="w-5 h-5 text-sky-500 stroke-[1.8]" />
                        <span className="text-xs text-gray-500 font-medium">ผู้อ่าน</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">79</span>
                    </div>

                    {/* Item 3: ความเห็น */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <MessageSquare className="w-5 h-5 text-indigo-500 stroke-[1.8]" />
                        <span className="text-xs text-gray-500 font-medium">ความเห็น</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">0</span>
                    </div>

                    {/* Item 4: นำไปใช้ */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <HeartHandshake className="w-5 h-5 text-rose-500 stroke-[1.8]" />
                        <span className="text-xs text-gray-500 font-medium">นำไปใช้</span>
                      </div>
                      <span className="text-base font-bold text-gray-800">1</span>
                    </div>
                  </div>
                </div>

                {/* Section 3: นักเรียนรู้ (Matching Image 3 Reference 100%) */}
                <div>
                  <h4 className="text-xs font-bold text-gray-700 mb-2.5">
                    นักเรียนรู้
                  </h4>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                    {/* Item 1: เรียนรู้ 6 ไอเดีย */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="w-6 h-6 rounded-md border border-rose-400 text-rose-500 flex items-center justify-center">
                          <FileText className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">เรียนรู้</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">6</span>
                        <span className="text-xs text-gray-500">ไอเดีย</span>
                      </div>
                    </div>

                    {/* Item 2: นำ 0 ไอเดียไปใช้ */}
                    <div className="bg-white rounded-xl p-4 border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)] flex items-center justify-between">
                      <div className="flex flex-col gap-1.5">
                        <div className="w-6 h-6 rounded-md border border-emerald-500 text-emerald-600 flex items-center justify-center">
                          <BookOpen className="w-3.5 h-3.5" />
                        </div>
                        <span className="text-xs text-gray-500 font-medium">นำ</span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span className="text-base font-bold text-gray-900">0</span>
                        <span className="text-xs text-gray-500">ไอเดียไปใช้</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Ideas Tab Content */}
          {activeTab === "ideas" && (
            <div className="space-y-4">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-bold text-gray-900">
                  ไอเดียการสอนที่แบ่งปันโดย {nameParam}
                </h2>
                <Link
                  href="/ideas/new"
                  className="px-4 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs shadow-sm transition-all"
                >
                  + แบ่งปันไอเดียใหม่
                </Link>
              </div>

              {isLoadingIdeas ? (
                <div className="py-12 text-center text-gray-400">กำลังโหลดไอเดีย...</div>
              ) : teacherIdeas.length === 0 ? (
                <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
                  <Lightbulb className="w-12 h-12 text-amber-400 mx-auto mb-3" />
                  <p className="text-gray-600 font-medium">ยังไม่มีไอเดียการสอนที่เผยแพร่</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {teacherIdeas.map((idea) => (
                    <Link
                      key={idea.id}
                      href={`/ideas/detail?id=${idea.id}`}
                      className="group bg-white rounded-2xl border border-gray-100 overflow-hidden shadow-[0_1px_3px_rgba(0,0,0,0.04)] hover:shadow-md transition-all flex flex-col"
                    >
                      <div className="aspect-video w-full bg-gray-100 relative overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={idea.coverImageUrl || "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Room"}
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      </div>
                      <div className="p-4 flex-1 flex flex-col justify-between">
                        <h3 className="font-bold text-gray-900 group-hover:text-orange-600 line-clamp-2 transition-colors">
                          {idea.title}
                        </h3>
                        <p className="text-xs text-gray-400 mt-2">
                          {new Date(idea.createdAt || Date.now()).toLocaleDateString("th-TH", {
                            day: "numeric",
                            month: "short",
                            year: "numeric",
                          })}
                        </p>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Reviews Tab Content */}
          {activeTab === "reviews" && (
            <div className="bg-white rounded-2xl p-12 text-center border border-gray-100 shadow-[0_1px_3px_rgba(0,0,0,0.04)]">
              <Star className="w-12 h-12 text-amber-400 mx-auto mb-3 stroke-[1.5]" />
              <h3 className="text-base font-bold text-gray-800 mb-1">ยังไม่มีรีวิวสำหรับคุณครูท่านนี้</h3>
              <p className="text-xs text-gray-400">
                เมื่อมีผู้เรียนหรือเพื่อนครูให้คำแนะนำหรือรีวิว จะแสดงข้อมูลที่นี่
              </p>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}
