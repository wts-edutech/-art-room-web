"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { Button } from "@/components/ui/button";
import { User, MessageSquare, ArrowLeft, Eye, Star, Mail, Download } from "lucide-react";
import Link from "next/link";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

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
        const lessonsRes = await fetch("/api/m3-lessons");
        const lessonsData = await lessonsRes.json();
        const foundLesson = lessonsData.find((l: any) => l.id === id);
        
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
        fetch('/api/m3-lessons/interact', {
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
      const res = await fetch("/api/m3-lessons/interact", {
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
        <main className="flex-1 flex flex-col pt-24 pb-24 bg-gray-50/50 min-h-screen">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            
            {/* Breadcrumb */}
            <div className="mb-6 flex items-center gap-2 text-sm font-medium text-gray-500">
              <Link href="/materials/m3" className="hover:text-(--color-primary-500) flex items-center gap-1">
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
                
                {lesson.category === "สื่อเอกสาร PDF" && lesson.pdfUrl && (
                  <div className="mb-6">
                    <a 
                      href={lesson.pdfUrl} 
                      download 
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-6 py-3 bg-red-500 hover:bg-red-600 text-white font-bold rounded-xl shadow-sm shadow-red-500/30 transition-all hover:-translate-y-1"
                    >
                      <Download className="w-5 h-5" /> ดาวน์โหลดไฟล์เอกสาร PDF
                    </a>
                  </div>
                )}
                
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

            {/* Comment Section */}
            <div className="bg-white rounded-3xl p-8 shadow-sm border border-gray-100">
              <div className="flex items-center gap-3 mb-8 border-b border-gray-100 pb-4">
                <MessageSquare className="w-6 h-6 text-(--color-primary-500)" />
                <h2 className="text-2xl font-bold font-heading text-gray-900">ความคิดเห็น ({comments.length})</h2>
              </div>

              {/* Comment Form */}
              {userRole === "guest" ? (
                <div className="mb-10 p-6 bg-gray-50 border border-gray-200 rounded-2xl text-center">
                  <p className="text-gray-500 mb-2">คุณกำลังเข้าชมในฐานะ "บุคคลทั่วไป"</p>
                  <p className="text-gray-700 font-medium">ไม่สามารถแสดงความคิดเห็นได้ เพื่อป้องกันสแปมและปกป้องความเป็นส่วนตัวของนักเรียน</p>
                </div>
              ) : (
                <form onSubmit={handlePostComment} className="mb-10 flex gap-4">
                  <div className="w-12 h-12 rounded-full bg-gray-100 flex-shrink-0 flex items-center justify-center text-gray-400 overflow-hidden font-bold text-lg">
                    {authorName ? authorName.charAt(0) : <User className="w-6 h-6" />}
                  </div>
                  <div className="flex-1 space-y-3">
                    <div className="flex flex-col sm:flex-row gap-3">
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <User className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="text"
                          value={authorName}
                          onChange={(e) => setAuthorName(e.target.value)}
                          placeholder="ชื่อของคุณ (เช่น ด.ช. สมชาย)"
                          className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-(--color-primary-500) focus:ring-2 focus:ring-(--color-primary-500)/20 outline-none transition-all text-sm font-medium"
                          required
                        />
                      </div>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <Mail className="h-4 w-4 text-gray-400" />
                        </div>
                        <input
                          type="email"
                          value={authorEmail}
                          onChange={(e) => setAuthorEmail(e.target.value)}
                          placeholder="อีเมลของคุณ (เพื่อยืนยันตัวตน)"
                          className="w-full h-10 pl-10 pr-4 rounded-xl border border-gray-200 focus:border-(--color-primary-500) focus:ring-2 focus:ring-(--color-primary-500)/20 outline-none transition-all text-sm font-medium"
                          required
                        />
                      </div>
                    </div>
                    <textarea 
                      value={newComment}
                      onChange={(e) => setNewComment(e.target.value)}
                      placeholder="พิมพ์ข้อความเพื่อสอบถามหรือแสดงความคิดเห็น..."
                      className="w-full h-24 p-4 rounded-xl border border-gray-200 focus:border-(--color-primary-500) focus:ring-2 focus:ring-(--color-primary-500)/20 outline-none transition-all resize-none"
                      required
                    />
                    <div className="flex justify-end">
                      <Button type="submit" disabled={!newComment.trim() || !authorName.trim() || !authorEmail.trim() || isPosting} className="rounded-full px-6 shadow-sm hover:shadow-md transition-shadow bg-(--color-primary-500) hover:bg-(--color-primary-600) text-white">
                        {isPosting ? "กำลังส่ง..." : "ส่งความคิดเห็น"}
                      </Button>
                    </div>
                  </div>
                </form>
              )}

              {/* Comment List */}
              <div className="space-y-6">
                {comments.length === 0 ? (
                  <div className="text-center text-gray-400 py-8">ยังไม่มีความคิดเห็น เป็นคนแรกที่แสดงความคิดเห็นเลย!</div>
                ) : (
                  (Array.isArray(comments) ? comments : []).map((comment) => (
                    <div key={comment.id} className="flex gap-4">
                      <div className="w-12 h-12 rounded-full bg-blue-50 flex-shrink-0 flex items-center justify-center text-(--color-accent-blue) font-bold text-lg overflow-hidden">
                        {comment.authorImage ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img src={comment.authorImage} alt={comment.author} className="w-full h-full object-cover" />
                        ) : (
                          comment.author.charAt(0)
                        )}
                      </div>
                      <div className="flex-1">
                        <div className="bg-gray-50 rounded-2xl rounded-tl-none p-4 inline-block min-w-[250px] border border-gray-100">
                          <div className="flex items-baseline justify-between gap-4 mb-1">
                            <span className="font-bold text-gray-900">{comment.author}</span>
                            <span className="text-xs text-gray-500 font-medium">{formatDate(comment.time)}</span>
                          </div>
                          <p className="text-gray-700 text-[15px]">{comment.text}</p>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>

          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
