"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Image as ImageIcon, FileText, Upload, Plus, X, CheckCircle, AlertCircle, Sparkles } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

const MAX_COVER_SIZE = 5 * 1024 * 1024; // 5 MB
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB

export default function NewIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [link, setLink] = useState("");
  const [category, setCategory] = useState("ทั่วไป");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [coverPreviewUrl, setCoverPreviewUrl] = useState<string | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  const [isAdmin, setIsAdmin] = useState(false);
  const [instantApprove, setInstantApprove] = useState(true);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    
    if (!name) {
      router.push("/ideas");
      return;
    }
    
    setAuthorName(name);
    setIsAdmin(role === "admin");
  }, [router]);

  useEffect(() => {
    if (coverImage) {
      const objectUrl = URL.createObjectURL(coverImage);
      setCoverPreviewUrl(objectUrl);
      return () => URL.revokeObjectURL(objectUrl);
    } else {
      setCoverPreviewUrl(null);
    }
  }, [coverImage]);

  const handleCoverChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > MAX_COVER_SIZE) {
        setErrorMsg("รูปภาพหน้าปกต้องมีขนาดไม่เกิน 5 MB");
        return;
      }
      setCoverImage(file);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setErrorMsg("");
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setErrorMsg("อัปโหลดไฟล์แนบได้สูงสุดไม่เกิน 5 ไฟล์");
        return;
      }
      const oversized = selectedFiles.find(f => f.size > MAX_FILE_SIZE);
      if (oversized) {
        setErrorMsg(`ไฟล์ "${oversized.name}" มีขนาดเกิน 10 MB กรุณาเลือกไฟล์ที่เล็กลง`);
        return;
      }
      setFiles([...files, ...selectedFiles]);
    }
  };

  const removeFile = (index: number) => {
    const newFiles = [...files];
    newFiles.splice(index, 1);
    setFiles(newFiles);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg("");
    setSuccessMsg("");
    
    if (!title.trim() || !description.trim() || !coverImage) {
      setErrorMsg("กรุณากรอกหัวข้อ รายละเอียด และอัปโหลดรูปภาพหน้าปกให้ครบถ้วน");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", title.trim());
    formData.append("description", description.trim());
    formData.append("category", category);
    if (link.trim()) formData.append("link", link.trim());
    formData.append("authorName", authorName);
    formData.append("authorEmail", localStorage.getItem("artroom_author_email") || "");
    formData.append("coverImage", coverImage);

    if (isAdmin && instantApprove) {
      formData.append("status", "approved");
    }
    
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        const msg = isAdmin && instantApprove
          ? "เผยแพร่ไอเดียสำเร็จแล้ว! กำลังพาท่านไปยังหน้ารวมไอเดีย..."
          : "ส่งไอเดียสำเร็จแล้ว! ระบบจะแสดงผลเมื่อได้รับการอนุมัติจากผู้ดูแลระบบ";
        setSuccessMsg(msg);
        setTimeout(() => {
          router.push("/ideas");
        }, 2000);
      } else {
        const data = (await res.json().catch(() => ({}))) as any;
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อเครือข่าย");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FCFBF8]">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link 
              href="/ideas" 
              className="inline-flex items-center text-gray-500 hover:text-orange-600 font-medium mb-6 transition-colors group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" /> 
              กลับไปหน้าห้องสมุดไอเดีย
            </Link>

            <div className="bg-white rounded-3xl p-6 sm:p-10 md:p-12 shadow-sm border border-gray-100">
              <div className="flex items-center justify-between pb-6 mb-8 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold">
                    <Plus className="w-6 h-6" />
                  </div>
                  <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-gray-900">
                      แบ่งปันไอเดียใหม่
                    </h1>
                    <p className="text-sm text-gray-500">โดย: <span className="font-semibold text-orange-600">{authorName}</span></p>
                  </div>
                </div>
              </div>
              
              {errorMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-200 text-red-700 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <AlertCircle className="w-5 h-5 flex-shrink-0 text-red-500" />
                  <span>{errorMsg}</span>
                </div>
              )}
            
              {successMsg && (
                <div className="mb-6 p-4 rounded-2xl bg-green-50 border border-green-200 text-green-800 text-sm font-medium flex items-center gap-2 animate-in fade-in">
                  <CheckCircle className="w-5 h-5 flex-shrink-0 text-green-600" />
                  <span>{successMsg}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="space-y-6">
                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    ชื่อไอเดีย / หัวข้อ <span className="text-red-500">*</span>
                  </label>
                  <input 
                    type="text" 
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="เช่น ใบงานระบายสีวงล้อสี, สื่อการสอนแม่สีและสีคู่ตรงข้าม"
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    หมวดหมู่สื่อ / กิจกรรม <span className="text-red-500">*</span>
                  </label>
                  <select
                    value={category}
                    onChange={(e) => setCategory(e.target.value)}
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all bg-white text-gray-800 font-medium cursor-pointer"
                  >
                    <option value="ทั่วไป">💡 ทั่วไป</option>
                    <option value="ใบงาน">📄 ใบงาน</option>
                    <option value="รูปภาพ">🎨 รูปภาพ</option>
                    <option value="กิจกรรม">🎪 กิจกรรม</option>
                    <option value="วีดีโอ">🎬 วีดีโอ</option>
                    <option value="สื่อการสอน">📚 สื่อการสอน</option>
                    <option value="เกมส์">🎮 เกมส์</option>
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    รายละเอียดไอเดีย <span className="text-red-500">*</span>
                  </label>
                  <textarea 
                    required
                    value={description}
                    onChange={(e) => setDescription(e.target.value)}
                    placeholder="อธิบายขั้นตอนการจัดกิจกรรม วัตถุประสงค์ วิธีการนำสื่อไปใช้งาน หรือคำแนะนำสำหรับเพื่อนๆ และคุณครู..."
                    className="w-full h-36 p-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-gray-800 leading-relaxed"
                  />
                </div>

                <div>
                  <label className="block text-sm font-bold text-gray-800 mb-2">
                    ลิงก์ภายนอก / เว็บไซต์ที่เกี่ยวข้อง (ถ้ามี)
                  </label>
                  <input 
                    type="url" 
                    value={link}
                    onChange={(e) => setLink(e.target.value)}
                    placeholder="เช่น https://www.canva.com/design/... หรือ https://drive.google.com/..."
                    className="w-full h-12 px-4 rounded-xl border border-gray-200 focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all text-gray-800 text-sm"
                  />
                </div>

                {/* Cover Image Upload */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800">
                      รูปภาพหน้าปก <span className="text-red-500">*</span>
                    </label>
                    <span className="text-xs text-gray-400">ขนาดแนะนำ 800x600 px (ไม่เกิน 5 MB)</span>
                  </div>

                  {coverPreviewUrl ? (
                    <div className="relative aspect-video w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-100 group">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={coverPreviewUrl} 
                        alt="Cover Preview" 
                        className="w-full h-full object-cover" 
                      />
                      <button
                        type="button"
                        onClick={() => setCoverImage(null)}
                        className="absolute top-3 right-3 bg-black/70 hover:bg-red-600 text-white p-2 rounded-xl transition-all shadow-md flex items-center gap-1.5 text-xs font-semibold"
                      >
                        <X className="w-4 h-4" /> เปลี่ยนรูปหน้าปก
                      </button>
                    </div>
                  ) : (
                    <label className="relative w-full h-44 border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50/50 hover:bg-orange-50/20 rounded-2xl transition-all group overflow-hidden cursor-pointer flex flex-col items-center justify-center text-center p-4">
                      <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleCoverChange}
                        className="hidden"
                      />
                      <div className="w-12 h-12 rounded-2xl bg-orange-100 text-orange-500 flex items-center justify-center mb-3 group-hover:scale-110 transition-transform">
                        <ImageIcon className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-700 group-hover:text-orange-600 transition-colors">
                        คลิกเพื่อเลือกรูปภาพหน้าปก
                      </p>
                      <p className="text-xs text-gray-400 mt-1">รองรับ JPG, PNG, WEBP (สูงสุด 5 MB)</p>
                    </label>
                  )}
                </div>

                {/* File Attachments */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-sm font-bold text-gray-800">
                      ไฟล์แนบประกอบ (ใบงาน / เอกสาร / สื่อนำเสนอ)
                    </label>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {files.length}/5 ไฟล์
                    </span>
                  </div>
                  
                  {files.length < 5 && (
                    <label className="relative w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/20 rounded-2xl transition-all group flex items-center justify-center cursor-pointer px-4">
                      <input 
                        type="file" 
                        multiple
                        onChange={handleFileChange}
                        className="hidden"
                      />
                      <div className="flex items-center gap-2 text-gray-500 group-hover:text-blue-600 transition-colors">
                        <Upload className="w-5 h-5 text-blue-500" />
                        <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์แนบ (PDF, Word, PPTX, รูปภาพ ฯลฯ ขนาดไม่เกิน 10MB ต่อไฟล์)</span>
                      </div>
                    </label>
                  )}

                  {files.length > 0 && (
                    <div className="mt-3 grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                      {files.map((file, index) => (
                        <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                          <div className="flex items-center gap-3 overflow-hidden">
                            <div className="w-8 h-8 bg-blue-50 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                              <FileText className="w-4 h-4" />
                            </div>
                            <div className="truncate">
                              <p className="text-xs font-semibold text-gray-800 truncate">{file.name}</p>
                              <p className="text-[11px] text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                            </div>
                          </div>
                          <button 
                            type="button" 
                            onClick={() => removeFile(index)}
                            className="w-7 h-7 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors flex-shrink-0 ml-2"
                            title="ลบไฟล์นี้"
                          >
                            <X className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {/* Admin Instant Publish Option */}
                {isAdmin && (
                  <div className="p-4 rounded-2xl bg-amber-50/80 border border-amber-200/80 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Sparkles className="w-5 h-5 text-amber-600 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-bold text-amber-900">สิทธิ์ผู้ดูแลระบบ (Admin)</p>
                        <p className="text-xs text-amber-700">อนุมัติและเผยแพร่ลงหน้าเว็บทันที ไม่ต้องรอตรวจสอบ</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input 
                        type="checkbox" 
                        checked={instantApprove} 
                        onChange={(e) => setInstantApprove(e.target.checked)}
                        className="sr-only peer" 
                      />
                      <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500"></div>
                    </label>
                  </div>
                )}
                
                <div className="pt-6 border-t border-gray-100">
                  <button 
                    type="submit" 
                    disabled={isSubmitting || successMsg.length > 0}
                    className="w-full h-14 rounded-2xl text-base font-bold bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-lg shadow-orange-500/25 disabled:opacity-50 transition-all flex items-center justify-center cursor-pointer hover:-translate-y-0.5"
                  >
                    {isSubmitting ? (
                      <div className="flex items-center gap-2">
                        <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                        <span>กำลังบันทึกและส่งข้อมูล...</span>
                      </div>
                    ) : (
                      <span>{isAdmin && instantApprove ? "เผยแพร่ไอเดียทันที" : "ส่งไอเดียเพื่อตรวจสอบ"}</span>
                    )}
                  </button>
                  <p className="text-center text-xs text-gray-400 mt-4">
                    {isAdmin && instantApprove 
                      ? "ไอเดียนี้จะแสดงผลในหน้าห้องสมุดไอเดียทันทีหลังจากส่ง" 
                      : "ไอเดียจะถูกส่งให้คุณครูหรือผู้ดูแลระบบตรวจสอบก่อนเผยแพร่สู่สาธารณะ"}
                  </p>
                </div>
              </form>
            </div>
          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
