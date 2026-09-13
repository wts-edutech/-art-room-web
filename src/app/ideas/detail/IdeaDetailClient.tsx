"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  ArrowLeft, Download, MessageSquare, Send, Trash2, 
  Video, Gamepad2, FileText, Image as ImageIcon, File, 
  Link as LinkIcon, Share2, Check, Sparkles, Calendar, User
} from "lucide-react";

interface CommentItem {
  id: string;
  authorName: string;
  authorEmail?: string;
  text: string;
  createdAt: string;
}

interface IdeaDetail {
  id: string;
  title: string;
  description: string;
  category?: string;
  authorName: string;
  authorEmail?: string;
  coverImageUrl?: string;
  files?: any[];
  link?: string;
  status: string;
  createdAt: string;
  comments?: CommentItem[];
}

export default function IdeaDetailClient() {
  const searchParams = useSearchParams();
  const params = useParams();
  const router = useRouter();
  const id = searchParams.get("id") || (params?.id as string);

  const [idea, setIdea] = useState<IdeaDetail | null>(null);
  const [relatedIdeas, setRelatedIdeas] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [commentText, setCommentText] = useState("");
  const [isSubmittingComment, setIsSubmittingComment] = useState(false);
  const [authorName, setAuthorName] = useState("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [userRole, setUserRole] = useState("student");
  const [isCopied, setIsCopied] = useState(false);

  const getFileIcon = (filename: string) => {
    const ext = filename?.split('.').pop()?.toLowerCase();
    if (['mp4', 'mov', 'avi', 'wmv'].includes(ext || '')) return <Video className="w-5 h-5 text-purple-500" />;
    if (['exe', 'zip', 'rar', 'apk'].includes(ext || '')) return <Gamepad2 className="w-5 h-5 text-indigo-500" />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext || '')) return <ImageIcon className="w-5 h-5 text-emerald-500" />;
    if (['pdf', 'doc', 'docx', 'ppt', 'pptx', 'xls', 'xlsx'].includes(ext || '')) return <FileText className="w-5 h-5 text-blue-500" />;
    return <File className="w-5 h-5 text-gray-500" />;
  };

  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name");
    const role = localStorage.getItem("artroom_role");
    setIsLoggedIn(!!name);
    if (name) setAuthorName(name);
    if (role) setUserRole(role);

    if (id) {
      setIsLoading(true);
      fetch(`/api/ideas/${id}`)
        .then((res) => {
          if (!res.ok) throw new Error("Not found");
          return res.json();
        })
        .then((data: any) => {
          setIdea(data as IdeaDetail);
          setIsLoading(false);
        })
        .catch(() => {
          router.push("/ideas");
        });

      // Also fetch related ideas
      fetch("/api/ideas")
        .then((res) => res.json())
        .then((all: any) => {
          if (Array.isArray(all)) {
            const others = all.filter((item: any) => item.id !== id).slice(0, 3);
            setRelatedIdeas(others);
          }
        })
        .catch(() => {});
    }
  }, [id, router]);

  const handleCopyLink = () => {
    const shareUrl = window.location.href;
    navigator.clipboard.writeText(shareUrl).then(() => {
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2500);
    });
  };

  const handlePostComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim() || !idea) return;

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
          text: commentText.trim()
        })
      });

      if (res.ok) {
        const newComment: CommentItem = (await res.json()) as CommentItem;
        setIdea({
          ...idea,
          comments: [newComment, ...(idea.comments || [])]
        });
        setCommentText("");
      } else {
        const err = (await res.json().catch(() => ({}))) as any;
        alert(err.error || "ไม่สามารถแสดงความคิดเห็นได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    } finally {
      setIsSubmittingComment(false);
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!idea) return;
    if (!confirm("คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;

    try {
      const res = await fetch(`/api/ideas/${idea.id}/comment?commentId=${commentId}`, {
        method: "DELETE",
      });

      if (res.ok) {
        setIdea({
          ...idea,
          comments: (idea.comments || []).filter((c) => c.id !== commentId)
        });
      } else {
        const err = (await res.json().catch(() => ({}))) as any;
        alert(err.error || "ไม่สามารถลบความคิดเห็นได้");
      }
    } catch (error) {
      alert("เกิดข้อผิดพลาดในการเชื่อมต่อ");
    }
  };

  if (isLoading) {
    return (
      <>
        <Navbar />
        <main className="min-h-screen flex flex-col items-center justify-center bg-[#FCFBF8]">
          <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500 mb-4"></div>
          <p className="text-gray-500 text-sm">กำลังโหลดเนื้อหาไอเดีย...</p>
        </main>
        <Footer />
      </>
    );
  }

  if (!idea) return null;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-32 pb-24 min-h-screen bg-[#FCFBF8]">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Top Bar Navigation & Actions */}
          <div className="flex items-center justify-between mb-6">
            <Link 
              href="/ideas" 
              className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors font-medium text-sm group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              กลับไปยังห้องสมุดไอเดีย
            </Link>

            <button
              onClick={handleCopyLink}
              className={`inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl border text-xs font-semibold transition-all shadow-sm ${
                isCopied 
                  ? "bg-green-50 border-green-300 text-green-700" 
                  : "bg-white border-gray-200 text-gray-700 hover:border-orange-300 hover:text-orange-600 hover:bg-orange-50/50"
              }`}
            >
              {isCopied ? <Check className="w-4 h-4 text-green-600" /> : <Share2 className="w-4 h-4" />}
              <span>{isCopied ? "คัดลอกลิงก์แล้ว!" : "แชร์ไอเดีย"}</span>
            </button>
          </div>

          {/* Main Idea Content Card */}
          <div className="bg-white rounded-3xl overflow-hidden shadow-sm border border-gray-100 mb-10">
            {/* Cover Image Banner */}
            <div className="relative aspect-[16/9] w-full bg-gray-100 overflow-hidden">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={idea.coverImageUrl || "https://placehold.co/1200x600/FFF7ED/EA580C?text=Art+Room"} 
                alt={idea.title}
                className="w-full h-full object-cover"
                onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x600/FFF7ED/EA580C?text=Art+Room")}
              />
              {idea.category && (
                <div className="absolute top-4 left-4 bg-orange-500/95 backdrop-blur-md text-white font-bold text-xs px-3.5 py-1.5 rounded-full shadow-md">
                  {idea.category}
                </div>
              )}
            </div>
            
            <div className="p-6 sm:p-10">
              {/* Author & Meta */}
              <div className="flex flex-wrap items-center justify-between gap-4 pb-6 mb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-orange-400 to-amber-400 text-white flex items-center justify-center font-bold text-lg uppercase shadow-sm">
                    {(idea.authorName || "U").charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900 text-base leading-tight">
                      {idea.authorName}
                    </h3>
                    <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-1">
                      <Calendar className="w-3.5 h-3.5" />
                      <span>{new Date(idea.createdAt).toLocaleDateString('th-TH', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs">
                  <span className="px-3 py-1 bg-gray-50 text-gray-600 rounded-full border border-gray-200">
                    หมวดหมู่: <strong className="text-gray-900 font-semibold">{idea.category || "ทั่วไป"}</strong>
                  </span>
                </div>
              </div>

              {/* Title */}
              <h1 className="text-2xl sm:text-3xl md:text-4xl font-extrabold text-gray-900 mb-6 leading-tight">
                {idea.title}
              </h1>
              
              {/* Description */}
              <div className="prose max-w-none text-gray-700 mb-8 whitespace-pre-wrap leading-relaxed text-base">
                {idea.description}
              </div>

              {/* External Link */}
              {idea.link && (
                <div className="mb-8 p-5 bg-gradient-to-r from-orange-50/60 to-amber-50/40 rounded-2xl border border-orange-100">
                  <h3 className="text-sm font-bold text-gray-900 mb-2 flex items-center gap-2">
                    <LinkIcon className="w-4 h-4 text-orange-500" /> ลิงก์ที่เกี่ยวข้อง / เว็บไซต์ภายนอก
                  </h3>
                  <a 
                    href={idea.link.startsWith('http') ? idea.link : `https://${idea.link}`} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 hover:underline text-sm font-medium break-all"
                  >
                    <span>{idea.link}</span>
                    <span className="text-xs bg-orange-100 text-orange-700 px-2 py-0.5 rounded-md font-semibold shrink-0">เปิดลิงก์ ↗</span>
                  </a>
                </div>
              )}

              {/* Attachments Section */}
              {idea.files && idea.files.length > 0 && (
                <div className="mb-10">
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                      <Download className="w-5 h-5 text-orange-500" /> 
                      <span>เอกสารและไฟล์แนบ</span>
                      <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-orange-100 text-orange-700">
                        {idea.files.length} ไฟล์
                      </span>
                    </h3>
                    {!isLoggedIn && (
                      <span className="text-xs text-amber-700 font-medium bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                        * เข้าสู่ระบบเพื่อดาวน์โหลด
                      </span>
                    )}
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {(Array.isArray(idea.files) ? idea.files : []).map((file: any, index: number) => {
                      const ext = file.name?.split('.').pop()?.toUpperCase() || 'FILE';
                      const sizeStr = file.size ? `${(file.size / 1024 / 1024).toFixed(2)} MB` : '';

                      return (
                        <a 
                          key={index} 
                          href={isLoggedIn ? file.url : '#'} 
                          download={isLoggedIn ? (file.name || `attachment-${index + 1}`) : undefined}
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
                          className="flex items-center gap-3 p-4 rounded-2xl border border-gray-200 hover:border-orange-500 hover:bg-orange-50/30 transition-all group cursor-pointer shadow-sm bg-white"
                        >
                          <div className="w-10 h-10 rounded-xl bg-gray-50 group-hover:bg-white flex items-center justify-center flex-shrink-0 border border-gray-100">
                            {getFileIcon(file.name)}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-bold text-gray-800 truncate group-hover:text-orange-600 transition-colors">
                              {file.name}
                            </p>
                            <p className="text-xs text-gray-400 flex items-center gap-1.5 mt-0.5">
                              <span className="font-semibold text-gray-500">{ext}</span>
                              {sizeStr && <span>• {sizeStr}</span>}
                            </p>
                          </div>
                          <div className="w-8 h-8 rounded-lg bg-gray-50 group-hover:bg-orange-500 group-hover:text-white flex items-center justify-center text-gray-400 transition-colors shrink-0">
                            <Download className="w-4 h-4" />
                          </div>
                        </a>
                      );
                    })}
                  </div>
                </div>
              )}

              <hr className="border-gray-100 my-8" />

              {/* Comments Section */}
              <div>
                <div className="flex items-center justify-between mb-6">
                  <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-orange-500" />
                    <span>ความคิดเห็น</span>
                    <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-gray-100 text-gray-600">
                      {idea.comments?.length || 0}
                    </span>
                  </h3>
                </div>

                {/* Post Comment Form */}
                {isLoggedIn ? (
                  <form onSubmit={handlePostComment} className="mb-8">
                    <div className="flex gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-orange-100 text-orange-600 flex items-center justify-center font-bold text-sm uppercase flex-shrink-0 shadow-sm">
                        {(authorName || "U").charAt(0)}
                      </div>
                      <div className="flex-1 relative">
                        <textarea 
                          value={commentText}
                          onChange={(e) => setCommentText(e.target.value)}
                          placeholder={`แสดงความคิดเห็นในชื่อ ${authorName}...`}
                          className="w-full h-24 p-4 pr-14 rounded-2xl border border-gray-200 bg-gray-50/50 focus:bg-white focus:border-orange-500 focus:ring-4 focus:ring-orange-500/10 outline-none transition-all resize-none text-sm text-gray-800"
                        />
                        <button 
                          type="submit"
                          disabled={!commentText.trim() || isSubmittingComment}
                          className="absolute bottom-3 right-3 w-9 h-9 bg-orange-500 hover:bg-orange-600 disabled:bg-gray-300 disabled:cursor-not-allowed text-white rounded-xl flex items-center justify-center shadow-sm transition-all"
                          title="ส่งความคิดเห็น"
                        >
                          <Send className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  </form>
                ) : (
                  <div className="mb-8 bg-orange-50/60 border border-orange-100 rounded-2xl p-6 text-center">
                    <p className="text-gray-700 text-sm mb-3">เข้าสู่ระบบเพื่อร่วมแสดงความคิดเห็นหรือพูดคุยกับผู้แบ่งปันไอเดีย</p>
                    <Link href={`/login?redirect=/ideas/detail?id=${idea.id}`}>
                      <button className="px-6 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl text-sm shadow-sm transition-all">
                        เข้าสู่ระบบเพื่อคอมเมนต์
                      </button>
                    </Link>
                  </div>
                )}

                {/* Comments List */}
                <div className="space-y-4">
                  {idea.comments && idea.comments.length > 0 ? (
                    idea.comments.map((comment) => {
                      const canDelete = 
                        userRole === "admin" || 
                        comment.authorName === authorName ||
                        (authorName && comment.authorName?.startsWith(authorName));

                      return (
                        <div key={comment.id} className="flex gap-3 group">
                          <div className="w-9 h-9 rounded-xl bg-gray-100 text-gray-600 flex items-center justify-center font-bold text-xs uppercase flex-shrink-0 mt-0.5">
                            {(comment.authorName || "U").charAt(0)}
                          </div>
                          <div className="flex-1 bg-gray-50/80 rounded-2xl rounded-tl-none p-4 border border-gray-100">
                            <div className="flex items-center justify-between mb-1.5">
                              <div className="flex items-center gap-2">
                                <span className="font-bold text-gray-900 text-sm">
                                  {comment.authorName}
                                </span>
                                {comment.authorName?.includes("(Admin)") && (
                                  <span className="text-[10px] bg-red-100 text-red-700 px-2 py-0.5 rounded-md font-bold">
                                    ผู้ดูแล
                                  </span>
                                )}
                              </div>
                              
                              <div className="flex items-center gap-2">
                                <span className="text-[11px] text-gray-400">
                                  {comment.createdAt ? new Date(comment.createdAt).toLocaleDateString('th-TH') : ''}
                                </span>
                                {canDelete && (
                                  <button
                                    onClick={() => handleDeleteComment(comment.id)}
                                    className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 p-1 rounded transition-all"
                                    title="ลบความคิดเห็นนี้"
                                  >
                                    <Trash2 className="w-3.5 h-3.5" />
                                  </button>
                                )}
                              </div>
                            </div>
                            <p className="text-gray-700 text-sm whitespace-pre-wrap leading-relaxed">
                              {comment.text}
                            </p>
                          </div>
                        </div>
                      );
                    })
                  ) : (
                    <div className="text-center py-8 text-gray-400 text-sm bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
                      ยังไม่มีความคิดเห็น มาเป็นคนแรกที่แบ่งปันความคิดเห็นกันเถอะ!
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Related / Recommended Ideas Section */}
          {relatedIdeas.length > 0 && (
            <div className="mt-12">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-orange-500" />
                  <span>ไอเดียอื่นๆ ที่น่าสนใจ</span>
                </h2>
                <Link href="/ideas" className="text-xs font-semibold text-orange-600 hover:underline">
                  ดูทั้งหมด →
                </Link>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {relatedIdeas.map((rel) => (
                  <Link 
                    key={rel.id} 
                    href={`/ideas/detail?id=${rel.id}`}
                    className="group bg-white rounded-2xl overflow-hidden shadow-sm border border-gray-100 hover:shadow-lg transition-all hover:-translate-y-1"
                  >
                    <div className="aspect-[4/3] bg-gray-100 overflow-hidden relative">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img 
                        src={rel.coverImageUrl || "https://placehold.co/600x400/FFF7ED/EA580C?text=Art+Idea"} 
                        alt={rel.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform" 
                      />
                      {rel.category && (
                        <div className="absolute top-2 left-2 bg-white/90 backdrop-blur-sm text-orange-600 text-[10px] font-bold px-2 py-0.5 rounded-md">
                          {rel.category}
                        </div>
                      )}
                    </div>
                    <div className="p-4">
                      <h4 className="font-bold text-sm text-gray-900 line-clamp-1 group-hover:text-orange-600 transition-colors mb-1">
                        {rel.title}
                      </h4>
                      <p className="text-xs text-gray-400">โดย: {rel.authorName}</p>
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}
        </div>
      </main>
      <Footer />
    </>
  );
}
