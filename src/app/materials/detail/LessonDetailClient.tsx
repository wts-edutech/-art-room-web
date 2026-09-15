"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, ArrowLeft, Eye, Star, Mail, Download, Heart, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";
import CommunityDiscussion from "@/components/common/CommunityDiscussion";
import { DEFAULT_DOWNLOADS } from "@/data/default-downloads";
import { 
  isMaterialBookmarked, 
  toggleMaterialBookmark, 
  BOOKMARKS_EVENT 
} from "@/lib/bookmarks";

export default function LessonDetailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const id = (searchParams.get("id") || params?.id || "") as string;
  const router = useRouter();

  const [lesson, setLesson] = useState<any>(null);
  const [comments, setComments] = useState<any[]>([]);
  const [newComment, setNewComment] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isPosting, setIsPosting] = useState(false);
  const [hasRated, setHasRated] = useState(false);
  const [hoveredStar, setHoveredStar] = useState(0);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [toast, setToast] = useState<{ title: string; message: string; type: "success" | "info" } | null>(null);
  
  const [authorName, setAuthorName] = useState("");
  const [authorEmail, setAuthorEmail] = useState("");
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    // Load saved info from localStorage
    const savedName = localStorage.getItem("artroom_author_name");
    const savedEmail = localStorage.getItem("artroom_author_email");
    const savedRole = localStorage.getItem("artroom_role");
    
    if (savedName) setAuthorName(savedName);
    if (savedEmail) setAuthorEmail(savedEmail);
    if (savedRole) setUserRole(savedRole);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        // Fetch lesson details
        const lessonsRes = await fetch("/api/lessons");
        const lessonsData = await lessonsRes.json();
        let foundLesson = Array.isArray(lessonsData) ? lessonsData.find((l: any) => l.id === id) : null;
        
        if (!foundLesson) {
          const dlItem = DEFAULT_DOWNLOADS.find((d: any) => d.id === id || `dl-${d.id}` === id || `v-${d.id}` === id);
          if (dlItem) {
            foundLesson = {
              id: dlItem.id,
              title: dlItem.title,
              description: dlItem.description,
              category: dlItem.category,
              videoId: dlItem.videoId || "dQw4w9WgXcQ",
              views: dlItem.downloadsCount || 512,
              type: dlItem.grade || "general",
              fileUrl: dlItem.fileUrl,
              attachmentName: dlItem.fileName,
              createdAt: new Date().toISOString(),
            };
          }
        }

        if (!foundLesson) {
          router.push("/materials");
          return;
        }
        setLesson(foundLesson);

        // Fetch comments
        const commentsRes = await fetch(`/api/comments?lessonId=${id}`);
        const commentsData = await commentsRes.json();
        setComments(commentsData);

        // Record View
        fetch('/api/lessons/interact', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ lessonId: id, action: 'view' })
        })
          .then(r => r.json())
          .then(updated => {
             if (updated && updated.views) {
               setLesson((prev: any) => prev ? { ...prev, views: updated.views } : prev);
             }
          })
          .catch(err => console.error(err));

      } catch (error) {
        console.error("Failed to fetch data", error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [id, router]);

  useEffect(() => {
    if (!lesson) return;
    const isSaved = isMaterialBookmarked(lesson.id) || (lesson.rawId ? isMaterialBookmarked(lesson.rawId) : false);
    setIsBookmarked(isSaved);

    const handleUpdate = () => {
      const updated = isMaterialBookmarked(lesson.id) || (lesson.rawId ? isMaterialBookmarked(lesson.rawId) : false);
      setIsBookmarked(updated);
    };

    window.addEventListener(BOOKMARKS_EVENT, handleUpdate);
    return () => window.removeEventListener(BOOKMARKS_EVENT, handleUpdate);
  }, [lesson]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || isPosting || !authorName.trim() || !authorEmail.trim()) return;
    
    setIsPosting(true);
    
    // Save to localStorage
    localStorage.setItem("artroom_author_name", authorName.trim());
    localStorage.setItem("artroom_author_email", authorEmail.trim());
    
    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: id,
          text: newComment,
          author: authorName.trim(),
          authorEmail: authorEmail.trim(),
        })
      });

      if (res.ok) {
        const postedComment = await res.json();
        setComments([...comments, postedComment]);
        setNewComment("");
      }
    } catch (error) {
      console.error("Failed to post comment", error);
    } finally {
      setIsPosting(false);
    }
  };

  const handleRate = async (ratingValue: number) => {
    if (hasRated) return;
    setHasRated(true);
    
    try {
      const res = await fetch("/api/lessons/interact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: id,
          action: 'rate',
          rating: ratingValue
        })
      });

      if (res.ok) {
        const updatedLesson = await res.json();
        setLesson(updatedLesson);
      }
    } catch (error) {
      console.error("Failed to post rating", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-gray-400">กำลังโหลดบทเรียน...</div>
      </div>
    );
  }

  if (!lesson) return null;

  // Format date
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('th-TH', { 
      year: 'numeric', month: 'short', day: 'numeric', 
      hour: '2-digit', minute:'2-digit' 
    });
  };

  return (
    <>
      <Navbar />
      <ProtectedRoute studentOnly={true}>
        <main className="flex-1 flex flex-col pt-24 pb-24 bg-gray-50/50 min-h-screen relative">
          {/* Toast Notification */}
          {toast && (
            <div className="fixed bottom-6 right-6 z-50 bg-gray-900 text-white px-5 py-3.5 rounded-2xl shadow-xl border border-gray-800 flex items-center gap-3 animate-in fade-in slide-in-from-bottom-5 duration-200">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <div>
                <p className="text-xs font-bold">{toast.title}</p>
                <p className="text-[11px] text-gray-300 font-normal truncate max-w-xs">{toast.message}</p>
              </div>
            </div>
          )}

          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Link href="/materials" className="hover:text-(--color-primary-500) flex items-center gap-1">
                <ArrowLeft className="w-4 h-4" /> สื่อการสอนทั้งหมด
              </Link>
              <span className="mx-2">/</span>
              <span className="text-gray-900 truncate">{lesson.title}</span>
            </div>

            {/* Video / Content Section */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-10">
              <div className={`w-full ${lesson.category === "สื่อภาพ" ? "bg-gray-100 min-h-[400px] flex items-center justify-center" : lesson.category === "สื่อเอกสาร PDF" ? "bg-gray-100" : "aspect-video bg-gray-900 relative"}`}>
                {lesson.category === "สื่อภาพ" ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img 
                    src={lesson.imageUrl} 
                    alt={lesson.title} 
                    className="w-full h-auto max-h-[80vh] object-contain"
                    onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x800/eeeeee/999999?text=Image+Not+Found")}
                  />
                ) : lesson.category === "สื่อเอกสาร PDF" ? (
                  <iframe 
                    className="w-full min-h-[70vh]"
                    src={lesson.pdfUrl}
                    title={lesson.title}
                  >
                  </iframe>
                ) : (
                  <iframe 
                    className="absolute top-0 left-0 w-full h-full"
                    src={`https://www.youtube.com/embed/${lesson.videoId}`}
                    title={lesson.title} 
                    frameBorder="0" 
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share" 
                    allowFullScreen>
                  </iframe>
                )}
              </div>
              
              <div className="p-8">
                <h1 className="text-3xl font-bold font-heading text-gray-900 mb-4">
                  {lesson.title}
                </h1>
                
                {/* Action Bar (Bookmark, Preview, Download, Q&A) */}
                <div className="mb-6 flex items-center gap-3 flex-wrap">
                  {/* Bookmark Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const nowSaved = toggleMaterialBookmark({
                        id: lesson.id,
                        rawId: lesson.rawId,
                        title: lesson.title,
                        description: lesson.description,
                        category: lesson.category,
                        topic: lesson.topic,
                        grade: lesson.grade || lesson.type,
                        mediaType: lesson.mediaType,
                        imageUrl: lesson.imageUrl,
                        fileUrl: lesson.fileUrl || lesson.pdfUrl,
                        fileName: lesson.attachmentName,
                      });
                      setIsBookmarked(nowSaved);
                      setToast({
                        title: nowSaved ? "บันทึกในรายการโปรดแล้ว" : "นำออกจากรายการที่บันทึกแล้ว",
                        message: lesson.title,
                        type: nowSaved ? "success" : "info",
                      });
                      setTimeout(() => setToast(null), 2500);
                    }}
                    className={`inline-flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold text-sm shadow-2xs transition-all cursor-pointer border ${
                      isBookmarked
                        ? "bg-rose-50 text-rose-600 border-rose-200 hover:bg-rose-100 shadow-sm"
                        : "bg-white hover:bg-gray-100 text-gray-700 border-gray-200"
                    }`}
                  >
                    <Heart className={`w-4 h-4 transition-transform ${isBookmarked ? "fill-rose-500 text-rose-500 scale-110" : "text-gray-500"}`} />
                    <span>{isBookmarked ? "บันทึกบทเรียนแล้ว" : "บันทึกบทเรียนนี้"}</span>
                  </button>

                  {/* Jump to QA */}
                  <a 
                    href="#comments"
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-orange-50 hover:bg-orange-100 text-orange-700 font-bold text-sm rounded-xl border border-orange-200/80 shadow-2xs transition-all cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-orange-600" />
                    <span>ถาม-ตอบบทเรียน</span>
                  </a>

                  {(lesson.fileUrl || lesson.pdfUrl) && (
                    <>
                      <a 
                        href={lesson.pdfUrl || lesson.fileUrl} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-5 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-sm rounded-xl shadow-xs transition-all cursor-pointer"
                      >
                        <Eye className="w-4 h-4 text-gray-600" /> ดูพรีวิว
                      </a>
                      <a 
                        href={lesson.pdfUrl || lesson.fileUrl} 
                        download={lesson.attachmentName || "art-material.pdf"} 
                        target="_blank"
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-2 px-6 py-2.5 bg-red-600 hover:bg-red-700 text-white font-bold text-sm rounded-xl shadow-sm shadow-red-500/20 transition-all hover:-translate-y-0.5 cursor-pointer"
                      >
                        <Download className="w-4 h-4" /> ดาวน์โหลดเอกสาร
                      </a>
                    </>
                  )}
                </div>
                
                {/* Metrics & Rating */}
                <div className="flex flex-wrap items-center gap-6 mb-8 bg-gray-50 p-4 rounded-2xl border border-gray-100">
                  <div className="flex items-center gap-2 text-gray-600">
                    <Eye className="w-5 h-5" />
                    <span className="font-medium">เข้าชม {lesson.views || 0} ครั้ง</span>
                  </div>
                  
                  <div className="w-px h-6 bg-gray-200 hidden sm:block"></div>
                  
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-1">
                      <Star className="w-5 h-5 text-yellow-500 fill-yellow-500" />
                      <span className="text-gray-900 font-bold ml-1">
                        {lesson.ratingCount > 0 ? (lesson.ratingSum / lesson.ratingCount).toFixed(1) : "0.0"}
                      </span>
                      <span className="text-gray-500 text-sm">
                        ({lesson.ratingCount || 0} รีวิว)
                      </span>
                    </div>
                    
                    {!hasRated ? (
                      <div className="flex items-center ml-2">
                        <span className="text-sm text-gray-400 mr-2">ให้คะแนน:</span>
                        <div className="flex gap-1">
                          {[1, 2, 3, 4, 5].map((star) => (
                            <button
                              key={star}
                              onClick={() => handleRate(star)}
                              onMouseEnter={() => setHoveredStar(star)}
                              onMouseLeave={() => setHoveredStar(0)}
                              className="focus:outline-none transition-transform hover:scale-110"
                            >
                              <Star 
                                className={`w-6 h-6 ${
                                  (hoveredStar >= star) 
                                    ? "text-yellow-400 fill-yellow-400" 
                                    : "text-gray-300"
                                }`} 
                              />
                            </button>
                          ))}
                        </div>
                      </div>
                    ) : (
                      <div className="text-sm text-green-600 font-medium bg-green-50 px-3 py-1 rounded-full flex items-center gap-1">
                        ขอบคุณสำหรับคะแนน! 🎉
                      </div>
                    )}
                  </div>
                </div>

                <p className="text-gray-600 text-lg leading-relaxed font-light whitespace-pre-wrap">
                  {lesson.description}
                </p>
              </div>
            </div>

            {/* Community Discussion & Q&A Section */}
            <div className="mt-8">
              <CommunityDiscussion
                id="comments"
                topicId={id}
                title={`ถาม-ตอบ & สนทนาบทเรียน`}
                subtitle={`ร่วมพูดคุย สอบถามเทคนิค หรือแลกเปลี่ยนความคิดเห็นเกี่ยวกับบทเรียน "${lesson.title}"`}
                accentColor="red"
                tags={["ทั้งหมด", "❓ ถามเรื่องเทคนิค", "🎨 อุปกรณ์ที่ใช้", "💡 ข้อแนะนำเพิ่มเติม", "💬 พูดคุยทั่วไป"]}
                quickPrompts={[
                  "ขอบคุณสำหรับบทเรียนดีๆ ครับ ทำตามได้ง่ายมาก 👍",
                  "ขอคำแนะนำเรื่องการเลือกใช้สีเพิ่มเติมครับ 🎨",
                  "มีข้อสงสัยขั้นตอนการเกลี่ยน้ำหนักครับ ❓",
                  "อยากให้คุณครูทำคลิปเทคนิคนี้เพิ่มเติมครับ ✨"
                ]}
                emptyMessage="ยังไม่มีข้อความสนทนาในบทเรียนนี้ ร่วมสอบถามหรือแชร์ความคิดเห็นเป็นคนแรกได้เลย!"
              />
            </div>

          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
