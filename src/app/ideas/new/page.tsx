"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Image as ImageIcon, FileText, Upload, Plus, X } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function NewIdeaPage() {
  const router = useRouter();
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("ทั่วไป");
  const [coverImage, setCoverImage] = useState<File | null>(null);
  const [files, setFiles] = useState<File[]>([]);
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [successMsg, setSuccessMsg] = useState("");
  const [authorName, setAuthorName] = useState("");

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    
    if (!name) {
      router.push("/ideas");
      return;
    }
    
    setAuthorName(name);
  }, [router]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const selectedFiles = Array.from(e.target.files);
      if (files.length + selectedFiles.length > 5) {
        setErrorMsg("อัปโหลดไฟล์แนบได้สูงสุด 5 ไฟล์");
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
    
    if (!title || !description || !coverImage) {
      setErrorMsg("กรุณากรอกข้อมูลให้ครบถ้วน และอัปโหลดรูปภาพหน้าปก");
      return;
    }

    setIsSubmitting(true);
    
    const formData = new FormData();
    formData.append("title", title);
    formData.append("description", description);
    formData.append("category", category);
    formData.append("authorName", authorName);
    formData.append("authorEmail", localStorage.getItem("artroom_author_email") || "");
    formData.append("coverImage", coverImage);
    
    files.forEach(file => {
      formData.append("files", file);
    });

    try {
      const res = await fetch("/api/ideas", {
        method: "POST",
        body: formData,
      });

      if (res.ok) {
        setSuccessMsg("ส่งไอเดียสำเร็จแล้ว! ระบบจะแสดงผลเมื่อได้รับการอนุมัติจากผู้ดูแลระบบ");
        setTimeout(() => {
          router.push("/ideas");
        }, 3000);
      } else {
        const data = await res.json();
        setErrorMsg(data.error || "เกิดข้อผิดพลาดในการส่งข้อมูล");
        setIsSubmitting(false);
      }
    } catch (error) {
      setErrorMsg("เกิดข้อผิดพลาดในการเชื่อมต่อ");
      setIsSubmitting(false);
    }
  };

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FDF9F1]">
          <div className="container mx-auto px-4 max-w-3xl">
            <Link href="/ideas" className="inline-flex items-center text-gray-500 hover:text-orange-500 font-medium mb-8 transition-colors">
              <ArrowLeft className="w-4 h-4 mr-2" /> กลับไปหน้าไอเดีย
            </Link>

            <div className="bg-white rounded-3xl p-8 md:p-12 shadow-sm border border-gray-100">
              <h1 className="text-3xl font-bold font-heading text-gray-900 mb-8 flex items-center gap-3">
                <Plus className="w-8 h-8 text-orange-500" /> แบ่งปันไอเดียใหม่
              </h1>
              
              {errorMsg && (
                <div className="mb-6 p-4 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm font-medium">
                  {errorMsg}
                </div>
              )}
            
            {successMsg && (
              <div className="mb-6 p-4 rounded-xl bg-green-50 border border-green-200 text-green-700 text-sm font-medium flex items-center gap-2">
                <span className="w-6 h-6 bg-green-500 text-white rounded-full flex items-center justify-center font-bold">✓</span>
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">ชื่อไอเดีย / หัวข้อ</label>
                <input 
                  type="text" 
                  required
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="เช่น สื่อการสอนคำศัพท์ภาษาอังกฤษ, กิจกรรมวาดภาพระบายสี"
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">หมวดหมู่ / ประเภทสื่อ</label>
                <select
                  value={category}
                  onChange={(e) => setCategory(e.target.value)}
                  className="w-full h-12 px-4 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all bg-white"
                >
                  <option value="ทั่วไป">ทั่วไป</option>
                  <option value="ใบงาน">ใบงาน</option>
                  <option value="รูปภาพ">รูปภาพ</option>
                  <option value="กิจกรรม">กิจกรรม</option>
                  <option value="วีดีโอ">วีดีโอ</option>
                  <option value="สื่อการสอน">สื่อการสอน</option>
                  <option value="เกมส์">เกมส์</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รายละเอียด</label>
                <textarea 
                  required
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="อธิบายรายละเอียด วิธีการนำไปใช้ หรือเนื้อหาของไอเดียนี้..."
                  className="w-full h-40 p-4 rounded-xl border border-gray-300 focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                />
              </div>

              <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">รูปภาพหน้าปก <span className="text-red-500">*</span></label>
                <div className="relative w-full h-48 border-2 border-dashed border-gray-300 hover:border-orange-400 bg-gray-50 hover:bg-orange-50/30 rounded-2xl transition-colors group overflow-hidden">
                  <input 
                    type="file" 
                    accept="image/*"
                    onChange={(e) => {
                      if (e.target.files && e.target.files[0]) {
                        setCoverImage(e.target.files[0]);
                      }
                    }}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                  />
                  {coverImage ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={URL.createObjectURL(coverImage)} alt="Cover" className="w-full h-full object-cover" />
                  ) : (
                    <div className="absolute inset-0 flex flex-col items-center justify-center text-gray-400 group-hover:text-orange-500 transition-colors">
                      <ImageIcon className="w-10 h-10 mb-2" />
                      <p className="text-sm font-medium">คลิกเพื่ออัปโหลดรูปภาพหน้าปก</p>
                      <p className="text-xs mt-1 text-gray-400">ขนาดแนะนำ 800x600 px</p>
                    </div>
                  )}
                </div>
              </div>

              <div>
                <div className="flex items-center justify-between mb-2">
                  <label className="block text-sm font-bold text-gray-700">ไฟล์แนบ (สามารถอัปโหลดได้สูงสุด 5 ไฟล์)</label>
                  <span className="text-xs font-medium bg-gray-100 text-gray-600 px-2 py-1 rounded-full">{files.length}/5</span>
                </div>
                
                {files.length < 5 && (
                  <div className="relative w-full h-16 border-2 border-dashed border-gray-300 hover:border-blue-400 bg-gray-50 hover:bg-blue-50/30 rounded-xl transition-colors group">
                    <input 
                      type="file" 
                      multiple
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="absolute inset-0 flex items-center justify-center text-gray-500 group-hover:text-blue-600 transition-colors">
                      <Upload className="w-5 h-5 mr-2" />
                      <span className="text-sm font-medium">คลิกเพื่อเลือกไฟล์แนบ (PDF, วีดีโอ, เกมส์, รูปภาพ ฯลฯ)</span>
                    </div>
                  </div>
                )}

                {files.length > 0 && (
                  <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Array.isArray(files) ? files : []).map((file, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-white border border-gray-200 rounded-xl shadow-sm">
                        <div className="flex items-center gap-3 overflow-hidden">
                          <div className="w-8 h-8 bg-blue-100 text-blue-600 rounded-lg flex items-center justify-center flex-shrink-0">
                            <FileText className="w-4 h-4" />
                          </div>
                          <div className="truncate">
                            <p className="text-sm font-medium text-gray-700 truncate">{file.name}</p>
                            <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                          </div>
                        </div>
                        <button 
                          type="button" 
                          onClick={() => removeFile(index)}
                          className="w-8 h-8 flex items-center justify-center text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors flex-shrink-0"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              
              <div className="pt-6 border-t border-gray-100">
                <button 
                  type="submit" 
                  disabled={isSubmitting || successMsg.length > 0}
                  className="w-full h-14 rounded-xl text-lg font-bold bg-gradient-to-r from-orange-500 to-orange-400 hover:from-orange-600 hover:to-orange-500 text-white shadow-md shadow-orange-500/30 disabled:opacity-50 transition-all flex items-center justify-center"
                >
                  {isSubmitting ? (
                    <div className="flex items-center gap-2">
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      กำลังส่งข้อมูล...
                    </div>
                  ) : "ส่งไอเดีย"}
                </button>
                <p className="text-center text-xs text-gray-400 mt-4">
                  ไอเดียของคุณจะถูกส่งให้ผู้ดูแลระบบตรวจสอบก่อนเผยแพร่
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
