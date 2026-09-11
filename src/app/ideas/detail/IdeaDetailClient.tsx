"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { ArrowLeft, Download, MessageSquare, Send, User, Video, Gamepad2, FileText, Image as ImageIcon, File, Link as LinkIcon } from "lucide-react";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

export default function IdeaDetailPage() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const id = searchParams.get("id") || (params?.id as string);
  const [idea, setIdea] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'wmv'].includes(ext || '')) return <Video className="w-6 h-6" />;
    if (['exe', 'zip', 'rar', 'apk'].includes(ext || '')) return <Gamepad2 className="w-6 h-6" />;
    if (['jpg', 'jpeg', 'png', 'gif'].includes(ext || '')) return <ImageIcon className="w-6 h-6" />;
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) return <FileText className="w-6 h-6" />;
    return <File className="w-6 h-6" />;
  };
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("student");

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    setIsLoggedIn(!!name);
    if (name) setAuthorName(name);
    if (role) setUserRole(role);

    if (id) {
      fetch(`/api/ideas/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data) => {
          setIdea(data);
          setIsLoading(false);
        })
        .catch(() => {
          router.push("/ideas");
        });
    }
  }, [id, router]);

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    if (!isLoggedIn) {
      alert("กรุณาเข้าสู่ระบบก่อนแสดงความคิดเห็น");
      return;
    }

    setIsSubmittingComment(true);

    try {
      const res = await fetch(`/api/ideas/${idea.id}/comment`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          authorName: authorName,
          text: commentText
        })
      });

      if (res.ok) {
        const newComment = await res.json();
        setIdea({
          ...idea,
          comments: [...(idea.comments || []), newComment]
        });
        setCommentText("");
      } else {
        alert("ไม่สามารถแสดงความคิดเห็นได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex items-center justify-center bg-[#FDF9F1]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
        </main>
      </>
    );
  }

  if (!idea) return null;

  return (
    <>
      <Navbar />
        <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FDF9F1]">
          <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
            {/* Header/Back button */}
            <div className="mb-8">
              <Link href="/ideas" className="inline-flex items-center text-gray-500 hover:text-orange-500 transition-colors font-medium">
                <ArrowLeft className="w-5 h-5 mr-2" />
                กลับไปยังห้องสมุดไอเดีย
              </Link>
            </div>

            {/* Main Content Card */}
            <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-8">
              <div className="relative aspect-video w-full bg-gray-100">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={idea.coverImageUrl} 
                  alt={idea.title}
                  className="w-full h-full object-cover"
                  onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x600/eeeeee/999999?text=No+Cover")}
                />
              </div>
              
              <div className="p-8">
                <div className="flex items-center gap-4 mb-6">
                  <div className="w-12 h-12 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500 uppercase flex-shrink-0 text-xl">
                    {idea.authorName.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">{idea.authorName}</h3>
                    <p className="text-sm text-gray-500">{new Date(idea.createdAt).toLocaleDateString('th-TH')}</p>
                  </div>
                </div>

                <h1 className="text-3xl font-bold font-heading text-gray-900 mb-6">
                  {idea.title}
                </h1>
                
                <div className="prose max-w-none text-gray-600 mb-8 whitespace-pre-wrap">
                  {idea.description}
                </div>

                {idea.link && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <LinkIcon className="w-5 h-5 text-orange-500" /> ลิงก์ที่เกี่ยวข้อง
                    </h3>
                    <a 
                      href={idea.link.startsWith('http') ? idea.link : `https://${idea.link}`} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-3 bg-orange-50 text-orange-600 rounded-xl hover:bg-orange-100 transition-colors font-medium break-all"
                    >
                      {idea.link}
                    </a>
                  </div>
                )}

                {idea.files && idea.files.length > 0 && (
                  <div className="mb-8">
                    <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                      <Download className="w-5 h-5 text-orange-500" /> ไฟล์แนบ ({idea.files.length})
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {(Array.isArray(idea.files) ? idea.files : []).map((file: any, index: number) => (
                        <a 
                          key={index} 
                          href={isLoggedIn ? file.url : '#'} 
                          download={isLoggedIn}
                          target={isLoggedIn ? "_blank" : undefined}
                          rel={isLoggedIn ? "noopener noreferrer" : undefined}
                          onClick={(e) => {
                            if (!isLoggedIn) {
                              e.preventDefault();
                              if (confirm("กรุณาเข้าสู่ระบบก่อนดาวน์โหลดไฟล์ ต้องการไปหน้าเข้าสู่ระบบหรือไม่?")) {
                                router.push(`/login?redirect=/ideas/detail?id=${idea.id}`);
                              }
                            }
                          }}
                          className="flex items-center gap-3 p-4 rounded-xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50 transition-colors group cursor-pointer"
                        >
                          <div className="w-10 h-10 rounded-lg bg-gray-100 group-hover:bg-white flex items-center justify-center text-gray-500 group-hover:text-orange-500 transition-colors">
                            {getFileIcon(file.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-medium text-gray-900 truncate">{file.name}</p>
                            <p className="text-xs text-gray-500 uppercase">{file.name.split('.').pop()}</p>
                          </div>
                          <Download className="w-4 h-4 text-gray-400 group-hover:text-orange-500" />
                        </a>
                      ))}
                    </div>
                  </div>
                )}

                <hr className="border-gray-100 mb-8" />

                <h3 className="text-xl font-bold text-gray-900 mb-6 flex items-center gap-2">
                  <MessageSquare className="w-5 h-5 text-orange-500" /> ความคิดเห็น ({idea.comments?.length || 0})
                </h3>

                {isLoggedIn ? (
                  <form onSubmit={handlePostComment} className="mb-10">
                    <div className="flex gap-4">
                      <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center font-bold text-orange-500 uppercase flex-shrink-0">
                        {authorName.charAt(0)}
                      </div>
                      <div className="flex-1 relative">
                        {userRole === "guest" ? (
                          <div className="w-full p-4 rounded-2xl border border-gray-200 bg-gray-50 text-gray-500 text-center">
                            คุณกำลังเข้าชมในฐานะ "บุคคลทั่วไป" ไม่สามารถแสดงความคิดเห็นได้
                          </div>
                        ) : (
                          <>
                            <textarea 
                              value={commentText}
                              onChange={(e) => setCommentText(e.target.value)}
                              placeholder="แสดงความคิดเห็น หรือขอบคุณผู้แบ่งปันไอเดีย..."
                              className="w-full h-24 p-4 pr-14 rounded-2xl border border-gray-200 bg-gray-50 focus:bg-white focus:border-orange-500 focus:ring-2 focus:ring-orange-500/20 outline-none transition-all resize-none"
                            />
                            <button 
                              type="submit"
                              disabled={!commentText.trim() || isSubmittingComment}
                              className="absolute bottom-4 right-4 w-10 h-10 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shadow-sm transition-colors"
                            >
                              <Send className="w-4 h-4" />
                            </button>
                          </>
                        )}
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-10 bg-orange-50/50 border border-orange-100 rounded-2xl p-6 text-center">
                    <p className="text-gray-600 mb-4">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็น</p>
                    <Link href="/login">
                      <button className="px-6 py-2 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl shadow-sm transition-colors">
                        เข้าสู่ระบบ
                      </button>
                    </Link>
                  </div>
                )}

                <div className="space-y-6">
                  {idea.comments && idea.comments.length > 0 ? (
                    (Array.isArray(idea.comments) ? idea.comments : []).map((comment: any) => (
                      <div key={comment.id} className="flex gap-4">
                        <div className="w-10 h-10 rounded-full bg-gray-100 text-gray-500 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0">
                          {comment.authorName.charAt(0)}
                        </div>
                        <div className="flex-1 bg-gray-50 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                          <div className="flex items-baseline justify-between mb-2">
                            <span className="font-bold text-gray-900">{comment.authorName}</span>
                            <span className="text-xs text-gray-400">
                              {new Date(comment.createdAt).toLocaleDateString('th-TH')}
                            </span>
                          </div>
                          <p className="text-gray-700 whitespace-pre-wrap">{comment.text}</p>
                        </div>
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      ยังไม่มีความคิดเห็น มาเป็นคนแรกที่แสดงความคิดเห็นสิ!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      <Footer />
    </>
  );
}
