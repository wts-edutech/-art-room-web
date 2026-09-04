"use client";

import { useState } from "react";
import Link from "next/link";
import { Search, BookOpen, Video, Image as ImageIcon, Star, Grid } from "lucide-react";

export default function MaterialsList({ initialLessons, basePath = "/materials" }: { initialLessons: any[], basePath?: string }) {
  const [activeCategory, setActiveCategory] = useState("ทั้งหมด");
  const [searchQuery, setSearchQuery] = useState("");

  const categories = [
    { id: "ทั้งหมด", label: "หมวดหมู่ทั้งหมด", icon: <Grid className="w-4 h-4" /> },
    { id: "สื่อวิดีทัศน์", label: "สื่อวิดีทัศน์", icon: <Video className="w-4 h-4" /> },
    { id: "สื่อภาพ", label: "สื่อภาพ", icon: <ImageIcon className="w-4 h-4" /> },
    { id: "สื่อแนะนำ", label: "สื่อแนะนำ", icon: <Star className="w-4 h-4" /> },
    { id: "สื่อเอกสาร PDF", label: "สื่อเอกสาร PDF", icon: <BookOpen className="w-4 h-4" /> },
  ];

  const colors = [
    { bg: "bg-blue-100", text: "text-blue-500" },
    { bg: "bg-yellow-100", text: "text-yellow-600" },
    { bg: "bg-green-100", text: "text-green-600" },
    { bg: "bg-purple-100", text: "text-purple-600" },
    { bg: "bg-pink-100", text: "text-pink-600" },
  ];

  const filteredLessons = initialLessons.filter((lesson) => {
    // Search filter
    if (searchQuery && !lesson.title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    // Category filter
    if (activeCategory !== "ทั้งหมด") {
      if (lesson.category !== activeCategory) {
        return false;
      }
    }
    return true;
  });
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState(false);

  return (
    <div className="flex flex-col lg:flex-row gap-8 items-start">
      {/* Mobile Toggle Button */}
      <button 
        onClick={() => setIsMobileSidebarOpen(true)}
        className="lg:hidden w-full bg-white border border-gray-200 rounded-xl p-4 flex items-center justify-between shadow-sm"
      >
        <div className="flex items-center gap-2 font-bold text-gray-700">
          <Search className="w-5 h-5 text-(--color-primary-500)" />
          หมวดหมู่และค้นหา
        </div>
        <span className="text-sm font-medium bg-gray-100 px-3 py-1 rounded-full text-gray-600">
          {activeCategory}
        </span>
      </button>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div 
          className="lg:hidden fixed inset-0 bg-black/50 z-[60]" 
          onClick={() => setIsMobileSidebarOpen(false)} 
        />
      )}

      {/* Sidebar Filter */}
      <aside className={`fixed inset-y-0 left-0 z-[70] w-[280px] bg-white shadow-2xl transform transition-transform duration-300 ease-in-out lg:relative lg:translate-x-0 lg:w-64 lg:shadow-none lg:bg-transparent lg:z-0 flex-shrink-0 flex flex-col h-full lg:h-auto ${isMobileSidebarOpen ? "translate-x-0" : "-translate-x-full"}`}>
        <div className="flex items-center justify-between p-4 border-b border-gray-100 lg:hidden">
          <span className="font-heading font-black text-xl">หมวดหมู่และค้นหา</span>
          <button 
            onClick={() => setIsMobileSidebarOpen(false)}
            className="p-2 text-gray-500 hover:bg-gray-100 rounded-full"
          >
            <span className="text-xl font-bold">&times;</span>
          </button>
        </div>

        <div className="flex-1 overflow-y-auto p-4 lg:p-0 space-y-8 lg:sticky lg:top-32">
          {/* Category Filter */}
          <div>
            <h2 className="text-xl font-bold font-heading text-gray-900 mb-4 border-b border-gray-200 pb-2">หมวดหมู่</h2>
            <ul className="space-y-1">
              {categories.map((cat) => (
                <li key={cat.id}>
                  <button
                    onClick={() => {
                      setActiveCategory(cat.id);
                      setIsMobileSidebarOpen(false);
                    }}
                    className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                      activeCategory === cat.id
                        ? "bg-blue-50 text-blue-600 font-bold shadow-sm border border-blue-100"
                        : "text-gray-600 hover:bg-gray-50 border border-transparent"
                    }`}
                  >
                    {cat.icon}
                    <span className="flex-1">{cat.label}</span>
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Search */}
          <div>
            <h2 className="text-xl font-bold font-heading text-gray-900 mb-4 border-b border-gray-200 pb-2">ค้นหา</h2>
            <div className="space-y-3">
              <input
                type="text"
                placeholder="คำค้นหา"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none text-sm shadow-sm"
              />
              {/* The button is purely decorative since filtering happens on typing */}
              <button 
                onClick={() => setIsMobileSidebarOpen(false)}
                className="w-full bg-[#1da1f2] hover:bg-[#1a91da] text-white h-[44px] rounded-xl font-bold flex items-center justify-center gap-2 transition-colors shadow-sm"
              >
                <Search className="w-4 h-4" /> ค้นหา
              </button>
            </div>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1 w-full">
        {filteredLessons.length === 0 ? (
          <div className="text-center py-20 text-gray-500 bg-gray-50 rounded-3xl border border-dashed border-gray-200">
            ไม่พบสื่อการสอนที่ตรงกับการค้นหา
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 2xl:grid-cols-4 gap-6">
            {filteredLessons.map((lesson: any, index: number) => {
              const colorScheme = colors[index % colors.length];
              return (
                <div key={lesson.id} className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col h-full group">
                  <div className="w-full aspect-video bg-gray-100 rounded-xl mb-4 relative overflow-hidden group-hover:shadow-inner transition-all">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={lesson.category === "สื่อภาพ" ? lesson.imageUrl : lesson.category === "สื่อเอกสาร PDF" ? "https://placehold.co/600x400/eeeeee/999999?text=PDF+Document" : `https://img.youtube.com/vi/${lesson.videoId}/hqdefault.jpg`} 
                      alt={lesson.title} 
                      className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-500"
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                    />
                    <div className={`absolute top-3 left-3 ${colorScheme.bg} ${colorScheme.text} px-3 py-1 rounded-full text-xs font-bold backdrop-blur-md bg-opacity-90 shadow-sm uppercase tracking-wide`}>
                      {lesson.category || "บทเรียน"}
                    </div>
                  </div>
                  <h3 className="text-lg font-bold font-heading text-gray-900 mb-2 line-clamp-2">{lesson.title}</h3>
                  <p className="text-gray-500 mb-4 line-clamp-2 text-sm">{lesson.description}</p>
                  <div className="mt-auto pt-4 border-t border-gray-100">
                    <Link href={`${basePath}/${lesson.id}`} className="text-[#1da1f2] font-bold hover:underline inline-flex items-center justify-center w-full min-h-[44px] gap-1 text-sm bg-blue-50/50 rounded-xl border border-blue-100/50 hover:bg-blue-50 transition-colors">
                      เข้าสู่บทเรียน <span className="text-lg leading-none">&rarr;</span>
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
