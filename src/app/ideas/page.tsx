"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Lightbulb, Search, Plus, X } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function IdeasPage() {
  const [ideas, setIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [showGuestModal, setShowGuestModal] = useState(false);
  const router = useRouter();

  const categories = ["ทั้งหมด", "ทั่วไป", "ใบงาน", "รูปภาพ", "กิจกรรม", "วีดีโอ", "สื่อการสอน", "เกมส์"];

  useEffect(() => {
    // Check login status
    const authorName = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    setIsLoggedIn(!!authorName);
    if (role) setUserRole(role);

    // Fetch approved ideas
    fetch("/api/ideas")
      .then((res) => res.json())
      .then((data) => {
        setIdeas(data);
        setIsLoading(false);
      })
      .catch((error) => {
        console.error("Failed to fetch ideas:", error);
        setIsLoading(false);
      });
  }, []);

  const handleShareClick = () => {
    if (!isLoggedIn) {
      setShowGuestModal(true);
    } else {
      router.push("/ideas/new");
    }
  };

  const filteredIdeas = ideas.filter(
    (idea) => {
      const matchesSearch = idea.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
                            idea.description.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesCategory = selectedCategory === "ทั้งหมด" || idea.category === selectedCategory || (!idea.category && selectedCategory === "ทั่วไป");
      return matchesSearch && matchesCategory;
    }
  );

  return (
    <>
      <Navbar />
        <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-white">
          {/* Header Section */}
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="text-center mb-12">
              <div className="inline-flex items-center justify-center w-20 h-20 bg-orange-100 rounded-full text-orange-500 mb-6 shadow-sm">
                <Lightbulb className="w-10 h-10" />
              </div>
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
                ห้องสมุดไอเดีย
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                ได้แรงบันดาลใจเต็มๆ เลยใช่ไหม? <br />
                ร่วมแบ่งปันไอเดีย สื่อการสอน และกิจกรรมดีๆ ให้กับเพื่อนๆ และคุณครู
              </p>
              
              <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-4">
                <button onClick={handleShareClick} className="px-8 py-3 bg-white border-2 border-orange-400 text-orange-500 font-bold rounded-full hover:bg-orange-50 hover:scale-105 transition-all shadow-sm flex items-center gap-2">
                  <Plus className="w-5 h-5" /> ร่วมแบ่งปันไอเดีย
                </button>
              </div>
            </div>

            {/* Category Filter */}
            <div className="max-w-4xl mx-auto mb-8 flex flex-wrap justify-center gap-2">
              {categories.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
                    selectedCategory === category
                      ? "bg-orange-500 text-white shadow-md"
                      : "bg-white text-gray-600 border border-gray-200 hover:border-orange-300 hover:text-orange-500 hover:bg-orange-50"
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>

            {/* Search Bar */}
            <div className="max-w-2xl mx-auto mb-12 relative">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <Search className="h-5 w-5 text-gray-400" />
              </div>
              <input
                type="text"
                placeholder="ค้นหาไอเดีย สื่อการสอน กิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-14 pl-12 pr-4 rounded-full border border-gray-200 bg-white focus:border-orange-400 focus:ring-2 focus:ring-orange-400/20 outline-none transition-all shadow-sm text-lg"
              />
            </div>

            {/* Ideas Grid */}
            <div className="mt-8">
              <h2 className="text-2xl font-bold text-gray-900 mb-6">ไอเดียน่าอ่านต่อ</h2>
              
              {isLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
                </div>
              ) : filteredIdeas.length === 0 ? (
                <div className="bg-white rounded-3xl p-12 text-center shadow-sm border border-gray-100">
                  <Lightbulb className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-700 mb-2">ยังไม่มีไอเดียในขณะนี้</h3>
                  <p className="text-gray-500">มาเป็นคนแรกที่แบ่งปันไอเดียดีๆ กันเถอะ!</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {(Array.isArray(filteredIdeas) ? filteredIdeas : []).map((idea) => (
                    <Link href={`/ideas/${idea.id}`} key={idea.id} className="group flex flex-col bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-xl transition-all duration-300 hover:-translate-y-1">
                      <div className="relative aspect-[4/3] w-full bg-gray-100 overflow-hidden">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img 
                          src={idea.coverImageUrl} 
                          alt={idea.title}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                          onError={(e) => (e.currentTarget.src = "https://placehold.co/800x600/eeeeee/999999?text=No+Cover")}
                        />
                        {idea.files && idea.files.length > 0 && (
                          <div className="absolute top-3 right-3 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-gray-700 shadow-sm flex items-center gap-1">
                            📎 {idea.files.length} ไฟล์
                          </div>
                        )}
                        {idea.category && (
                          <div className="absolute top-3 left-3 bg-orange-500/90 backdrop-blur-sm px-2 py-1 rounded-lg text-xs font-bold text-white shadow-sm">
                            {idea.category}
                          </div>
                        )}
                      </div>
                      
                      <div className="p-6 flex-1 flex flex-col">
                        <h3 className="text-xl font-bold font-heading text-gray-900 mb-2 line-clamp-2 group-hover:text-orange-500 transition-colors">
                          {idea.title}
                        </h3>
                        <p className="text-gray-500 text-sm line-clamp-2 mb-4 font-light">
                          {idea.description}
                        </p>
                        
                        <div className="mt-auto flex items-center justify-between pt-4 border-t border-gray-50">
                          <div className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-xs uppercase">
                              {idea.authorName.charAt(0)}
                            </div>
                            <div className="text-xs text-gray-500 font-medium truncate max-w-[120px]">
                              {idea.authorName}
                            </div>
                          </div>
                          <div className="text-xs text-gray-400 flex items-center gap-1">
                            💬 {idea.comments ? idea.comments.length : 0}
                          </div>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </div>
          </div>
        </main>
      <Footer />

      {/* Guest Login Modal */}
      {showGuestModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/50 backdrop-blur-md transition-opacity">
          <div className="bg-white rounded-[2rem] p-8 max-w-sm w-full relative shadow-2xl border border-white/20 animate-in fade-in zoom-in-95 duration-300">
            <button 
              onClick={() => setShowGuestModal(false)}
              className="absolute top-5 right-5 w-8 h-8 flex items-center justify-center bg-gray-50 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-full transition-all"
            >
              <X className="w-5 h-5" />
            </button>
            <div className="text-center mb-4 mt-2">
              <div className="flex justify-center mb-2 relative">
                <img 
                  src="/images/login-mascot.png"
                  alt="Login Mascot"
                  className="w-48 h-48 object-contain animate-bounce relative z-10" 
                  style={{ animationDuration: '3s' }}
                />
              </div>
              <h3 className="text-2xl font-black text-[#1E3A8A] mb-3 tracking-tight">เข้าสู่ระบบก่อนน้า~</h3>
              <p className="text-gray-500 font-medium mb-2">แล้วมาแบ่งปันไอเดียกัน!</p>
            </div>
            <div className="flex flex-col gap-3 px-4 pb-4">
              <Link href="/login?redirect=/ideas/new" className="w-full group">
                <button className="w-full py-3.5 bg-gradient-to-r from-orange-400 to-yellow-400 hover:from-orange-500 hover:to-yellow-500 text-white font-bold text-xl rounded-full transition-all shadow-[0_8px_20px_-6px_rgba(251,146,60,0.5)] group-hover:shadow-[0_12px_25px_-6px_rgba(251,146,60,0.6)] group-hover:-translate-y-0.5">
                  เข้าสู่ระบบ
                </button>
              </Link>

            </div>
          </div>
        </div>
      )}
    </>
  );
}
