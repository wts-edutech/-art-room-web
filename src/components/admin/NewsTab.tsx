"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Newspaper } from "lucide-react";
import PRImageGuide from "./PRImageGuide";


export default function NewsTab() {
  const [newsList, setNewsList] = useState<any[]>([]);
  const [newsTitle, setNewsTitle] = useState("");
  const [newsExcerpt, setNewsExcerpt] = useState("");
  const [newsSource, setNewsSource] = useState("Art Room");
  const [newsDate, setNewsDate] = useState("");
  const [newsImageUrl, setNewsImageUrl] = useState("");
  const [newsImageFile, setNewsImageFile] = useState<File | null>(null);
  const [editingNewsId, setEditingNewsId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/news");
      const data = await res.json();
      setNewsList(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setNewsList([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddNews = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsTitle || !newsExcerpt || !newsDate) return;
    if (!editingNewsId && !newsImageFile && !newsImageUrl) {
      alert("กรุณาเลือกรูปภาพข่าวสาร");
      return;
    }
    
    const formData = new FormData();
    if (editingNewsId) formData.append("id", editingNewsId);
    formData.append("title", newsTitle);
    formData.append("excerpt", newsExcerpt);
    formData.append("source", newsSource);
    formData.append("date", newsDate);
    
    if (newsImageFile) {
      formData.append("image", newsImageFile);
    } else if (newsImageUrl) {
      formData.append("imageUrl", newsImageUrl);
    }

    try {
      const method = editingNewsId ? "PUT" : "POST";
      const res = await fetch("/api/news", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetNewsForm();
        fetchData();
      } else {
        const err = await res.json();
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save news", error);
      alert("ไม่สามารถบันทึกข่าวสารได้");
    }
  };

  const resetNewsForm = () => {
    setNewsTitle("");
    setNewsExcerpt("");
    setNewsSource("Art Room");
    setNewsDate("");
    setNewsImageUrl("");
    setNewsImageFile(null);
    setEditingNewsId(null);
    const fileInput = document.getElementById("newsImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditNews = (news: any) => {
    setNewsTitle(news.title);
    setNewsExcerpt(news.excerpt);
    setNewsSource(news.source || "Art Room");
    setNewsDate(news.date);
    setNewsImageUrl(news.imageUrl);
    setNewsImageFile(null);
    setEditingNewsId(news.id);
  };

  const handleDeleteNews = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบข่าวสารนี้?")) return;
    try {
      const res = await fetch(`/api/news?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete news", error);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* News Form Section */}
              <div className="lg:col-span-1">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100 sticky top-8">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    {editingNewsId ? <Pencil className="text-orange-500" /> : <Plus className="text-orange-500" />}
                    <h2 className="text-lg font-bold text-gray-900">
                      {editingNewsId ? "แก้ไขข่าวสาร" : "เพิ่มข่าวสารใหม่"}
                    </h2>
                  </div>
                  <form onSubmit={handleAddNews} className="space-y-4">
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">หัวข้อข่าวสาร</label>
                      <input type="text" required value={newsTitle} onChange={(e) => setNewsTitle(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">เนื้อหาย่อ</label>
                      <textarea required value={newsExcerpt} onChange={(e) => setNewsExcerpt(e.target.value)} className="w-full h-20 p-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm resize-none" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">แหล่งที่มา / ผู้เขียน</label>
                      <input type="text" value={newsSource} onChange={(e) => setNewsSource(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-1">วันที่ (เช่น 6 พ.ย. 2568)</label>
                      <input type="text" required value={newsDate} onChange={(e) => setNewsDate(e.target.value)} className="w-full h-10 px-3 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-sm" />
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-700 block mb-2">
                        รูปภาพปกข่าว {editingNewsId && <span className="text-xs font-normal text-gray-500">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
                      </label>

                      {/* PR Image Guidelines Box */}
                      <PRImageGuide />

                      <div className="relative border-2 border-dashed border-gray-300 bg-gray-50/50 hover:bg-gray-50 transition-colors rounded-2xl p-6 text-center cursor-pointer overflow-hidden group">
                        <input 
                          id="newsImageInput"
                          type="file" 
                          accept="image/jpeg, image/jpg, image/png, image/webp"
                          onChange={(e) => {
                            if (e.target.files && e.target.files[0]) {
                              setNewsImageFile(e.target.files[0]);
                            } else {
                              setNewsImageFile(null);
                            }
                          }}
                          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                        />
                        <div className="flex flex-col items-center justify-center relative z-0">
                          <span className="text-2xl drop-shadow-sm mb-2">📰</span>
                          <p className="text-gray-600 font-medium text-sm mb-1 group-hover:text-gray-900 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                          <p className="text-gray-400 text-xs">รองรับ JPG, PNG, WebP (Banner 1.91:1, โปสเตอร์ 3:4, จัตุรัส 1:1)</p>
                        </div>
                      </div>
                      
                      {newsImageFile ? (
                        <div className="mt-3 relative w-full min-h-[180px] max-h-[280px] flex items-center justify-center bg-gray-900/5 rounded-xl overflow-hidden border border-gray-200 p-2 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={URL.createObjectURL(newsImageFile)} alt="preview" className="max-h-[260px] w-auto max-w-full object-contain rounded-2xl" />
                        </div>
                      ) : editingNewsId && newsImageUrl ? (
                        <div className="mt-3 relative w-full min-h-[180px] max-h-[280px] flex items-center justify-center bg-gray-900/5 rounded-xl overflow-hidden border border-gray-200 p-2 shadow-inner">
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img src={newsImageUrl} alt="preview" className="max-h-[260px] w-auto max-w-full object-contain rounded-2xl" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          <div className="absolute top-2 left-2 bg-black/60 backdrop-blur-sm text-white text-xs px-2 py-1 rounded-xl">รูปเดิม</div>
                        </div>
                      ) : null}
                    </div>
                    
                    <div className="flex gap-2 pt-4 border-t border-gray-100">
                      <Button type="submit" className="flex-1 rounded-xl bg-orange-500 hover:bg-orange-600 text-white">
                        {editingNewsId ? "บันทึก" : "เพิ่ม"}
                      </Button>
                      {editingNewsId && (
                        <Button type="button" variant="outline" onClick={resetNewsForm} className="rounded-xl px-4 border-gray-200">ยกเลิก</Button>
                      )}
                    </div>
                  </form>
                </div>
              </div>

              {/* News List Section */}
              <div className="lg:col-span-2">
                <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-100">
                  <div className="flex items-center gap-2 mb-6 border-b border-gray-100 pb-4">
                    <Newspaper className="text-gray-400" />
                    <h2 className="text-lg font-bold text-gray-900">รายการข่าวสาร ({newsList.length})</h2>
                  </div>
                  {isLoading ? (
                    <div className="text-center py-10 text-gray-400">กำลังโหลด...</div>
                  ) : newsList.length === 0 ? (
                    <div className="text-center py-10 text-gray-400">ไม่มีข้อมูลข่าวสาร</div>
                  ) : (
                    <div className="space-y-4">
                      {(Array.isArray(newsList) ? newsList : []).map((news) => (
                        <div key={news.id} className="flex gap-4 p-4 bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all">
                          <div className="w-40 h-28 bg-gray-100 relative rounded-xl overflow-hidden flex-shrink-0">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={news.imageUrl} alt={news.title} className="w-full h-full object-cover" onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} />
                          </div>
                          <div className="flex-1 flex flex-col justify-center min-w-0">
                            <h3 className="font-bold text-gray-900 truncate mb-1 text-base">{news.title}</h3>
                            <p className="text-xs text-gray-500 mb-2 truncate">{news.date} • {news.source}</p>
                            <p className="text-sm text-gray-600 line-clamp-2">{news.excerpt}</p>
                          </div>
                          <div className="flex flex-col justify-center gap-2 flex-shrink-0 px-2">
                            <button onClick={() => handleEditNews(news)} className="w-10 h-10 rounded-xl flex items-center justify-center text-orange-500 bg-orange-50 hover:bg-orange-100 transition-colors">
                              <Pencil className="w-4 h-4" />
                            </button>
                            <button onClick={() => handleDeleteNews(news.id)} className="w-10 h-10 rounded-xl flex items-center justify-center text-red-600 bg-red-50 hover:bg-red-100 transition-colors">
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
  );
}
