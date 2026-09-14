"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  ArrowLeft, Download, MessageSquare, Send, Trash2, 
  Video, Gamepad2, FileText, Image as ImageIcon, File, 
  Link as LinkIcon, Share2, Check, Sparkles, Calendar, User,
  Eye, MessageCircle, Bookmark
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
  const [viewsCount, setViewsCount] = useState(7);
  const [starryCount, setStarryCount] = useState(0);
  const [hasLikedStarry, setHasLikedStarry] = useState(false);
  const [flowerCount, setFlowerCount] = useState(0);
  const [hasLikedFlower, setHasLikedFlower] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);

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
      // Load saved interaction states
      const savedBookmark = localStorage.getItem(`artroom_idea_bookmark_${id}`) === "true";
      const savedStarry = localStorage.getItem(`artroom_idea_starry_${id}`) === "true";
      const savedFlower = localStorage.getItem(`artroom_idea_flower_${id}`) === "true";
      const savedStarryCount = Number(localStorage.getItem(`artroom_idea_starry_count_${id}`)) || 0;
      const savedFlowerCount = Number(localStorage.getItem(`artroom_idea_flower_count_${id}`)) || 0;

      setIsBookmarked(savedBookmark);
      setHasLikedStarry(savedStarry);
      setHasLikedFlower(savedFlower);
      setStarryCount(savedStarryCount);
      setFlowerCount(savedFlowerCount);

      const localViews = Number(localStorage.getItem(`artroom_idea_views_${id}`)) || Math.floor(Math.random() * 5) + 7;
      const newViews = localViews + 1;
      localStorage.setItem(`artroom_idea_views_${id}`, String(newViews));
      setViewsCount(newViews);

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

  const handleToggleStarry = () => {
    setHasLikedStarry((prev) => {
      const next = !prev;
      const nextCount = next ? starryCount + 1 : Math.max(0, starryCount - 1);
      setStarryCount(nextCount);
      if (id) {
        localStorage.setItem(`artroom_idea_starry_${id}`, String(next));
        localStorage.setItem(`artroom_idea_starry_count_${id}`, String(nextCount));
      }
      return next;
    });
  };

  const handleToggleFlower = () => {
    setHasLikedFlower((prev) => {
      const next = !prev;
      const nextCount = next ? flowerCount + 1 : Math.max(0, flowerCount - 1);
      setFlowerCount(nextCount);
      if (id) {
        localStorage.setItem(`artroom_idea_flower_${id}`, String(next));
        localStorage.setItem(`artroom_idea_flower_count_${id}`, String(nextCount));
      }
      return next;
    });
  };

  const handleToggleBookmark = () => {
    setIsBookmarked((prev) => {
      const next = !prev;
      if (id) {
        localStorage.setItem(`artroom_idea_bookmark_${id}`, String(next));
      }
      return next;
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
      <main className="flex-1 flex flex-col pt-28 pb-24 min-h-screen bg-white">
        <div className="container mx-auto px-4 sm:px-6 max-w-4xl">
          {/* Top Bar Navigation */}
          <div className="mb-5">
            <Link 
              href="/ideas" 
              className="inline-flex items-center text-gray-500 hover:text-orange-600 transition-colors font-medium text-sm group"
            >
              <ArrowLeft className="w-4 h-4 mr-2 group-hover:-translate-x-1 transition-transform" />
              กลับไปยังห้องสมุดไอเดีย
            </Link>
          </div>

          {/* Article Header (Exactly matching user mockup) */}
          <div className="mb-6">
            {/* 1. Title */}
            <h1 className="text-2xl sm:text-3xl font-bold font-heading text-gray-900 mb-4 leading-snug">
              {idea.title}
            </h1>

            {/* 2. Author Row & Stats Bar */}
            <div className="flex items-center justify-between gap-4 pb-4 border-b border-gray-100">
              {/* Left Column: Avatar + Author + Date */}
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200/80 bg-orange-50 shrink-0 shadow-2xs flex items-center justify-center">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img 
                    src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(idea.authorName || 'ArtTeacher')}&backgroundColor=ffdfbf`} 
                    alt={idea.authorName}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.currentTarget.style.display = 'none';
                      if (e.currentTarget.parentElement) {
                        e.currentTarget.parentElement.innerHTML = `<span class="text-orange-600 font-bold text-base">${(idea.authorName || 'ค').charAt(0)}</span>`;
                      }
                    }}
                  />
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-800 text-sm sm:text-[15px] leading-tight truncate">
                    {idea.authorName}
                  </h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5 truncate">
                    {new Date(idea.createdAt || Date.now()).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {idea.createdAt ? ` (แก้ไข ${new Date(idea.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })})` : ''}
                  </p>
                </div>
              </div>

              {/* Right Column: Views/Comments + Reactions + Share/Bookmark */}
              <div className="flex flex-col items-end gap-1.5 shrink-0">
                {/* Views & Comments */}
                <div className="flex items-center gap-3 text-xs text-gray-500 font-normal">
                  <div className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <span>{viewsCount}</span>
                  </div>
                  <div className="flex items-center gap-1">
                    <MessageCircle className="w-3.5 h-3.5 text-gray-400" />
                    <span>{idea.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Reactions & Buttons */}
                <div className="flex items-center gap-1.5 sm:gap-2">
                  <button
                    onClick={handleToggleStarry}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      hasLikedStarry ? "bg-amber-100 text-amber-700 font-semibold scale-105" : "text-gray-500 hover:bg-gray-100"
                    }`}
                    title="ว้าว / ชื่นชอบ"
                  >
                    <span className="text-sm">🤩</span>
                    <span>{starryCount}</span>
                  </button>

                  <button
                    onClick={handleToggleFlower}
                    className={`flex items-center gap-1 text-xs px-2 py-0.5 rounded-full transition-all cursor-pointer ${
                      hasLikedFlower ? "bg-pink-100 text-pink-700 font-semibold scale-105" : "text-gray-500 hover:bg-gray-100"
                    }`}
                    title="มอบช่อดอกไม้ / ชื่นชม"
                  >
                    <span className="text-sm">💐</span>
                    <span>{flowerCount}</span>
                  </button>

                  <div className="h-3.5 w-[1px] bg-gray-300 mx-0.5" />

                  {/* Share button */}
                  <button
                    onClick={handleCopyLink}
                    className="w-7 h-7 rounded-full border border-gray-300 hover:border-gray-400 hover:bg-gray-50 flex items-center justify-center text-gray-600 hover:text-gray-900 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={isCopied ? "คัดลอกลิงก์แล้ว!" : "แชร์ไอเดียนี้"}
                  >
                    {isCopied ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Share2 className="w-3.5 h-3.5" />}
                  </button>

                  {/* Bookmark button */}
                  <button
                    onClick={handleToggleBookmark}
                    className={`w-7 h-7 rounded-full border transition-all shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 ${
                      isBookmarked
                        ? "border-amber-400 bg-amber-50 text-amber-500"
                        : "border-gray-300 hover:border-gray-400 hover:bg-gray-50 text-gray-600 hover:text-gray-900"
                    }`}
                    title={isBookmarked ? "ยกเลิกการบันทึก" : "บันทึกไอเดียนี้"}
                  >
                    <Bookmark className={`w-3.5 h-3.5 ${isBookmarked ? "fill-amber-400" : ""}`} />
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Cover Image Banner */}
          <div className="relative aspect-video sm:aspect-[16/9] w-full bg-gray-100 rounded-2xl sm:rounded-3xl overflow-hidden border border-gray-100/90 shadow-sm mb-8">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img 
              src={idea.coverImageUrl || "https://placehold.co/1200x675/FFF7ED/EA580C?text=Art+Room"} 
              alt={idea.title}
              className="w-full h-full object-cover"
              onError={(e) => (e.currentTarget.src = "https://placehold.co/1200x675/FFF7ED/EA580C?text=Art+Room")}
            />
            {idea.category && (
              <div className="absolute top-4 left-4 bg-white/95 backdrop-blur-md text-gray-800 font-bold text-xs px-3.5 py-1.5 rounded-full shadow-sm border border-gray-100">
                {idea.category}
              </div>
            )}
          </div>

          {/* 4. Idea Details Body */}
          <div className="bg-white rounded-3xl p-6 sm:p-10 border border-gray-100 shadow-sm mb-10">
            {/* Description */}
            <div className="prose max-w-none text-gray-800 mb-8 whitespace-pre-wrap leading-relaxed text-base">
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
