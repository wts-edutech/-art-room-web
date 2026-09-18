import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Trash2, Plus, Pencil, Image as ImageIcon, Palette, Maximize2 } from "lucide-react";
import { optimizeImageToFile } from "@/lib/image-optimizer";
import { GRADE_GROUPS } from "@/lib/constants/grades";

const ARTWORK_TECHNIQUES = [
  "ลายเส้น Drawing",
  "สีน้ำ",
  "สีโปสเตอร์",
  "สีไม้",
  "สีน้ำมัน",
  "สีชอล์ก",
  "จิตรกรรมผสม (Mixed Media)",
  "ดิจิทัลอาร์ต (Digital Art)",
  "ประติมากรรม / สื่อผสม",
  "อื่นๆ (พิมพ์ระบุเอง)",
];

const ARTWORK_DIMENSIONS = [
  "A4 (21 x 29.7 ซม.)",
  "A3 (29.7 x 42 ซม.)",
  "A2 (42 x 59.4 ซม.)",
  "A1 (59.4 x 84.1 ซม.)",
  "1/4 แผ่น (37.5 x 55 ซม.)",
  "1/2 แผ่น (55 x 75 ซม.)",
  "1 แผ่นเต็ม (75 x 110 ซม.)",
  "เฟรมผ้าใบ 30 x 40 ซม.",
  "เฟรมผ้าใบ 40 x 50 ซม.",
  "เฟรมผ้าใบ 50 x 60 ซม.",
  "อื่นๆ (พิมพ์ระบุเอง)",
];

export default function ArtworksTab() {
  const [artworks, setArtworks] = useState<any[]>([]);
  const [artworkTitle, setArtworkTitle] = useState("");
  const [studentName, setStudentName] = useState("");
  const [grade, setGrade] = useState("");
  const [selectedTechnique, setSelectedTechnique] = useState("");
  const [customTechnique, setCustomTechnique] = useState("");
  const [selectedDimensions, setSelectedDimensions] = useState("");
  const [customDimensions, setCustomDimensions] = useState("");
  const [imageUrl, setImageUrl] = useState("");
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [editingArtworkId, setEditingArtworkId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/artworks");
      const data = await res.json();
      setArtworks(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error("Failed to fetch", error);
      setArtworks([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleAddArtwork = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!artworkTitle || !studentName) return;
    
    setIsSubmitting(true);
    try {
      const formData = new FormData();
      if (editingArtworkId) formData.append("id", editingArtworkId);
      formData.append("title", artworkTitle);
      formData.append("studentName", studentName);
      formData.append("grade", grade);
      
      const finalTechnique = selectedTechnique === "อื่นๆ (พิมพ์ระบุเอง)"
        ? customTechnique.trim()
        : selectedTechnique.trim();
      const finalDimensions = selectedDimensions === "อื่นๆ (พิมพ์ระบุเอง)"
        ? customDimensions.trim()
        : selectedDimensions.trim();

      formData.append("technique", finalTechnique);
      formData.append("dimensions", finalDimensions);

      if (imageFile) {
        const compressed = await optimizeImageToFile(imageFile, { maxWidth: 1200, maxHeight: 1200, quality: 0.75 });
        formData.append("image", compressed);
      } else if (imageUrl) {
        formData.append("imageUrl", imageUrl);
      }

      const method = editingArtworkId ? "PUT" : "POST";
      const res = await fetch("/api/artworks", {
        method,
        body: formData,
      });
      if (res.ok) {
        resetArtworkForm();
        fetchData();
      } else {
        const err = (await res.json()) as any;
        alert(err.error || "เกิดข้อผิดพลาดในการบันทึกข้อมูล");
      }
    } catch (error) {
      console.error("Failed to save artwork", error);
      alert("ไม่สามารถบันทึกผลงานได้");
    } finally {
      setIsSubmitting(false);
    }
  };

  const resetArtworkForm = () => {
    setArtworkTitle("");
    setStudentName("");
    setGrade("");
    setSelectedTechnique("");
    setCustomTechnique("");
    setSelectedDimensions("");
    setCustomDimensions("");
    setImageUrl("");
    setImageFile(null);
    setEditingArtworkId(null);
    const fileInput = document.getElementById("artworkImageInput") as HTMLInputElement;
    if (fileInput) fileInput.value = "";
  };

  const handleEditArtwork = (artwork: any) => {
    setArtworkTitle(artwork.title);
    setStudentName(artwork.studentName || artwork.author || "");
    setGrade(artwork.grade || artwork.year || "");
    
    const tech = artwork.technique || "";
    if (ARTWORK_TECHNIQUES.includes(tech)) {
      setSelectedTechnique(tech);
      setCustomTechnique("");
    } else if (tech) {
      setSelectedTechnique("อื่นๆ (พิมพ์ระบุเอง)");
      setCustomTechnique(tech);
    } else {
      setSelectedTechnique("");
      setCustomTechnique("");
    }

    const dim = artwork.dimensions || "";
    if (ARTWORK_DIMENSIONS.includes(dim)) {
      setSelectedDimensions(dim);
      setCustomDimensions("");
    } else if (dim) {
      setSelectedDimensions("อื่นๆ (พิมพ์ระบุเอง)");
      setCustomDimensions(dim);
    } else {
      setSelectedDimensions("");
      setCustomDimensions("");
    }

    setImageUrl(artwork.imageUrl);
    setImageFile(null);
    setEditingArtworkId(artwork.id);
  };

  const handleDeleteArtwork = async (id: string) => {
    if (!confirm("คุณแน่ใจหรือไม่ที่จะลบผลงานนี้?")) return;
    try {
      const res = await fetch(`/api/artworks?id=${id}`, { method: "DELETE" });
      if (res.ok) fetchData();
    } catch (error) {
      console.error("Failed to delete artwork", error);
    }
  };

  const handleAiAutoEnhance = async () => {
    const currentSrc = imageFile ? URL.createObjectURL(imageFile) : imageUrl;
    if (!currentSrc) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      // Apply photo enhancement filters: boost contrast, saturation, and brightness
      ctx.filter = "contrast(115%) saturate(115%) brightness(103%)";
      ctx.drawImage(img, 0, 0);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "ai-enhanced-artwork.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
      }, "image/jpeg", 0.90);
    } catch (err) {
      console.error("AI Enhance error:", err);
    }
  };

  const handleRotateImage = async () => {
    const currentSrc = imageFile ? URL.createObjectURL(imageFile) : imageUrl;
    if (!currentSrc) return;

    try {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.src = currentSrc;
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
      });

      const canvas = document.createElement("canvas");
      canvas.width = img.naturalHeight;
      canvas.height = img.naturalWidth;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.translate(canvas.width / 2, canvas.height / 2);
      ctx.rotate((90 * Math.PI) / 180);
      ctx.drawImage(img, -img.naturalWidth / 2, -img.naturalHeight / 2);

      canvas.toBlob((blob) => {
        if (!blob) return;
        const file = new File([blob], "rotated-artwork.jpg", { type: "image/jpeg" });
        setImageFile(file);
        setImageUrl(URL.createObjectURL(file));
      }, "image/jpeg", 0.90);
    } catch (err) {
      console.error("Rotate error:", err);
    }
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      {/* Artwork Form Section */}
      <div className="lg:col-span-1">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100 sticky top-8">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3.5">
            {editingArtworkId ? <Pencil className="w-4 h-4 text-orange-500" /> : <Plus className="w-4 h-4 text-orange-500" />}
            <h2 className="text-base font-bold text-slate-800">
              {editingArtworkId ? "แก้ไขผลงาน" : "เพิ่มผลงานใหม่"}
            </h2>
          </div>
          <form onSubmit={handleAddArtwork} className="space-y-3.5">
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ชื่อผลงาน</label>
              <input 
                type="text" 
                required 
                value={artworkTitle} 
                onChange={(e) => setArtworkTitle(e.target.value)} 
                className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white" 
                placeholder="ระบุชื่อผลงานศิลปะ" 
              />
            </div>
            
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ชื่อนักเรียน</label>
              <input 
                type="text" 
                required 
                value={studentName} 
                onChange={(e) => setStudentName(e.target.value)} 
                className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white" 
                placeholder="เช่น ด.ช. ศิลป์ สร้างสรรค์" 
              />
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">ระดับชั้นเรียน (ม.1 - ม.6 รวม 14 ห้อง)</label>
              <select 
                value={grade} 
                onChange={(e) => setGrade(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white cursor-pointer"
              >
                <option value="">-- เลือกระดับชั้นเรียน (ม.1/1 - ม.6/14) --</option>
                {GRADE_GROUPS.map((group) => (
                  <optgroup key={group.level} label={group.label}>
                    {group.rooms.map((room) => (
                      <option key={room} value={room}>
                        {room}
                      </option>
                    ))}
                  </optgroup>
                ))}
              </select>
            </div>

            {/* Technique Field (Dropdown + Custom) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                เทคนิคการวาดภาพ (Drawing / Technique)
              </label>
              <select
                value={selectedTechnique}
                onChange={(e) => setSelectedTechnique(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white cursor-pointer"
              >
                <option value="">-- เลือกเทคนิค (ลายเส้น, สีน้ำ, สีโปสเตอร์ ฯลฯ) --</option>
                {ARTWORK_TECHNIQUES.map((tech) => (
                  <option key={tech} value={tech}>
                    {tech}
                  </option>
                ))}
              </select>
              {selectedTechnique === "อื่นๆ (พิมพ์ระบุเอง)" && (
                <input
                  type="text"
                  required
                  value={customTechnique}
                  onChange={(e) => setCustomTechnique(e.target.value)}
                  placeholder="พิมพ์ระบุเทคนิค เช่น สีอะคริลิคบนผ้าใบ, ปากกาดำ..."
                  className="w-full h-9 px-3 rounded-xl border border-orange-300 focus:border-orange-500 outline-none text-xs bg-orange-50/20 mt-1.5"
                />
              )}
            </div>

            {/* Dimensions Field (Dropdown + Custom) */}
            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1">
                ขนาดของภาพวาด (Paper / Canvas Size)
              </label>
              <select
                value={selectedDimensions}
                onChange={(e) => setSelectedDimensions(e.target.value)}
                className="w-full h-9 px-3 rounded-xl border border-slate-200 focus:border-orange-500 focus:ring-1 focus:ring-orange-500 outline-none text-xs bg-white cursor-pointer"
              >
                <option value="">-- เลือกขนาดภาพวาด (A3, A2, A4 ฯลฯ) --</option>
                {ARTWORK_DIMENSIONS.map((dim) => (
                  <option key={dim} value={dim}>
                    {dim}
                  </option>
                ))}
              </select>
              {selectedDimensions === "อื่นๆ (พิมพ์ระบุเอง)" && (
                <input
                  type="text"
                  required
                  value={customDimensions}
                  onChange={(e) => setCustomDimensions(e.target.value)}
                  placeholder="พิมพ์ระบุขนาด เช่น 30 x 40 ซม., 15 x 20 นิ้ว..."
                  className="w-full h-9 px-3 rounded-xl border border-orange-300 focus:border-orange-500 outline-none text-xs bg-orange-50/20 mt-1.5"
                />
              )}
            </div>

            <div>
              <label className="text-xs font-semibold text-slate-700 block mb-1.5">
                รูปภาพผลงาน {editingArtworkId && <span className="text-[11px] font-normal text-slate-400">(ไม่ต้องเลือกหากใช้รูปเดิม)</span>}
              </label>
              
              <div className="relative border-2 border-dashed border-slate-200 bg-slate-50/50 hover:bg-orange-50/30 hover:border-orange-300 transition-colors rounded-2xl p-4 text-center cursor-pointer overflow-hidden group">
                <input 
                  id="artworkImageInput"
                  type="file" 
                  accept="image/jpeg, image/jpg, image/png, image/webp"
                  onChange={(e) => {
                    if (e.target.files && e.target.files[0]) {
                      setImageFile(e.target.files[0]);
                    } else {
                      setImageFile(null);
                    }
                  }}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center justify-center relative z-0">
                  <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center mb-1.5 shadow-2xs">
                    <ImageIcon className="w-4 h-4" />
                  </div>
                  <p className="text-slate-700 font-semibold text-xs mb-0.5 group-hover:text-orange-600 transition-colors">คลิกหรือลากไฟล์ภาพมาที่นี่</p>
                  <p className="text-slate-400 text-[11px]">รองรับ JPG, PNG, WebP (ไม่เกิน 10MB)</p>
                </div>
              </div>
              
              {/* Image Preview with AI Enhance, Rotate, Change & Clear buttons */}
              {imageFile || (editingArtworkId && imageUrl) ? (
                <div className="mt-3 relative w-full h-64 bg-slate-900/5 rounded-2xl overflow-hidden border border-slate-200 p-2 group shadow-inner flex flex-col items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={imageFile ? URL.createObjectURL(imageFile) : imageUrl} 
                    alt="preview" 
                    className="max-h-full w-auto max-w-full object-contain rounded-xl shadow-sm" 
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")}
                  />

                  <div className="absolute top-2 left-2 bg-black/70 backdrop-blur-sm text-white text-[10px] px-2 py-0.5 rounded-md font-semibold">
                    {imageFile ? "รูปใหม่ที่เลือก" : "รูปเดิม"}
                  </div>

                  {/* AI Quick Tools */}
                  <div className="absolute bottom-2 inset-x-2 flex items-center justify-center gap-1.5 z-20">
                    <button
                      type="button"
                      onClick={handleAiAutoEnhance}
                      className="px-2.5 py-1 bg-gradient-to-r from-orange-500 to-pink-500 text-white rounded-lg text-[11px] font-semibold hover:opacity-90 shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      title="AI ปรับแต่งความคมชัด แสง และสีสันให้อัตโนมัติ"
                    >
                      ✨ ปรับภาพด้วย AI
                    </button>
                    <button
                      type="button"
                      onClick={handleRotateImage}
                      className="px-2.5 py-1 bg-white/90 backdrop-blur-md text-slate-700 rounded-lg text-[11px] font-semibold hover:bg-white shadow-md transition-all flex items-center gap-1 cursor-pointer"
                      title="หมุนภาพ 90 องศา"
                    >
                      🔄 หมุนภาพ
                    </button>
                  </div>

                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-2">
                    <button
                      type="button"
                      onClick={() => document.getElementById("artworkImageInput")?.click()}
                      className="px-3 py-1 bg-white text-slate-800 rounded-lg text-xs font-semibold hover:bg-slate-100 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Pencil className="w-3 h-3 text-orange-500" />
                      เปลี่ยนรูป
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageFile(null);
                        setImageUrl("");
                        const fileInput = document.getElementById("artworkImageInput") as HTMLInputElement;
                        if (fileInput) fileInput.value = "";
                      }}
                      className="px-3 py-1 bg-rose-600 text-white rounded-lg text-xs font-semibold hover:bg-rose-700 shadow-sm transition-all flex items-center gap-1 cursor-pointer"
                    >
                      <Trash2 className="w-3 h-3" />
                      ลบรูปนี้
                    </button>
                  </div>
                </div>
              ) : null}
            </div>
            
            <div className="flex gap-2 pt-3 border-t border-slate-100">
              <Button type="submit" disabled={isSubmitting} className="flex-1 h-9 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-xs">
                {isSubmitting ? "กำลังบันทึก..." : editingArtworkId ? "บันทึกการแก้ไข" : "เพิ่มผลงาน"}
              </Button>
              {editingArtworkId && (
                <Button type="button" variant="outline" onClick={resetArtworkForm} className="rounded-xl px-3.5 h-9 border-slate-200 text-xs">ยกเลิก</Button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Artwork List Section */}
      <div className="lg:col-span-2">
        <div className="bg-white rounded-3xl p-5 sm:p-6 shadow-sm border border-slate-100">
          <div className="flex items-center gap-2 mb-5 border-b border-slate-100 pb-3.5">
            <div className="w-8 h-8 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold shadow-2xs">
              <ImageIcon className="w-4 h-4" />
            </div>
            <div>
              <h2 className="text-base font-bold text-slate-800">รายการผลงาน ({artworks.length})</h2>
              <p className="text-[11px] text-slate-400">ผลงานภาพวาดและศิลปกรรมของนักเรียน</p>
            </div>
          </div>
          {isLoading ? (
            <div className="text-center py-16 text-slate-400">
              <div className="animate-spin rounded-full h-8 w-8 border-2 border-orange-300 border-t-orange-600 mx-auto mb-2"></div>
              <p className="text-xs font-medium">กำลังโหลด...</p>
            </div>
          ) : artworks.length === 0 ? (
            <div className="text-center py-16 text-slate-400">
              <ImageIcon className="w-10 h-10 mx-auto mb-2 text-slate-300" />
              <p className="text-sm font-semibold text-slate-700">ไม่มีข้อมูลผลงาน</p>
              <p className="text-xs text-slate-400 mt-1">เพิ่มผลงานนักเรียนใหม่ได้จากแบบฟอร์มด้านข้าง</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {(Array.isArray(artworks) ? artworks : []).map((artwork) => (
                <div key={artwork.id} className="flex flex-col bg-white rounded-2xl overflow-hidden border border-slate-200/90 shadow-2xs hover:shadow-md hover:border-orange-200 transition-all duration-200 group">
                  <div className="w-full aspect-[4/5] max-h-[300px] sm:max-h-[330px] bg-slate-900/5 relative overflow-hidden flex items-center justify-center">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={artwork.imageUrl} 
                      alt={artwork.title} 
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" 
                      onError={(e) => (e.currentTarget.src = "https://placehold.co/600x400/eeeeee/999999?text=Image+Not+Found")} 
                    />
                  </div>
                  <div className="p-3.5 flex-1 flex flex-col justify-between">
                    <div>
                      <h3 className="font-bold text-slate-800 truncate mb-0.5 text-xs sm:text-sm group-hover:text-orange-600 transition-colors" title={artwork.title}>
                        {artwork.title}
                      </h3>
                      <p className="text-xs text-slate-600 truncate font-medium">
                        {artwork.studentName || artwork.author || "ไม่ระบุชื่อ"}
                      </p>
                      <p className="text-[11px] text-slate-400 mt-0.5">
                        {artwork.grade?.startsWith("ม.") ? `ชั้น ${artwork.grade}` : artwork.grade || artwork.year || "ทั่วไป"}
                      </p>
                      
                      {/* Technique and Dimensions badges */}
                      {(artwork.technique || artwork.dimensions) && (
                        <div className="flex flex-wrap gap-1 mt-2 pt-2 border-t border-slate-50">
                          {artwork.technique && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-orange-50 text-orange-700 border border-orange-100/80 px-1.5 py-0.5 rounded-md">
                              <Palette className="w-2.5 h-2.5 text-orange-500 shrink-0" />
                              {artwork.technique}
                            </span>
                          )}
                          {artwork.dimensions && (
                            <span className="inline-flex items-center gap-1 text-[10px] font-medium bg-slate-100 text-slate-600 border border-slate-200/80 px-1.5 py-0.5 rounded-md">
                              <Maximize2 className="w-2.5 h-2.5 text-slate-400 shrink-0" />
                              {artwork.dimensions}
                            </span>
                          )}
                        </div>
                      )}
                    </div>

                    <div className="flex gap-1.5 mt-3 pt-2.5 border-t border-slate-100">
                      <button onClick={() => handleEditArtwork(artwork)} className="flex-1 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-orange-600 bg-orange-50 hover:bg-orange-100 transition-colors active:scale-95 cursor-pointer">
                        <Pencil className="w-3 h-3 mr-1" /> แก้ไข
                      </button>
                      <button onClick={() => handleDeleteArtwork(artwork.id)} className="flex-1 h-7 rounded-lg flex items-center justify-center text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 transition-colors active:scale-95 cursor-pointer">
                        <Trash2 className="w-3 h-3 mr-1" /> ลบ
                      </button>
                    </div>
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
