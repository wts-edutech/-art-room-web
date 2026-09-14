"use client";

import { useState, useEffect, useMemo } from "react";
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

// Line art Star-Eyes Face Icon (matching black-and-white line art style)
function StarEyesIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Face circle */}
      <circle cx="14" cy="15" r="10" />
      {/* Left Star Eye */}
      <polygon
        points="9,6 10.3,9.5 13.8,9.5 11,11.8 12.1,15.2 9,13.2 5.9,15.2 7,11.8 4.2,9.5 7.7,9.5"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Right Star Eye */}
      <polygon
        points="19,6 20.3,9.5 23.8,9.5 21,11.8 22.1,15.2 19,13.2 15.9,15.2 17,11.8 14.2,9.5 17.7,9.5"
        fill="white"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Smiling mouth */}
      <path d="M11.5 18.5c1.2 1.6 3.8 1.6 5 0" strokeWidth="1.8" />
    </svg>
  );
}

// Line art Bouquet Icon (matching black-and-white line art style)
function BouquetIcon({ className = "w-7 h-7" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 28 28"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.4"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      {/* Flower blossoms cluster background */}
      <path
        d="M9 11.5C7 11 5.8 9.5 6.5 7.8c.8-1.8 2.5-1.2 3-2.2.6-1.2 2.2-2.2 4-2.1 1.6.1 3 1.1 3.5 2.2.6 1.1 2.2.5 3 2.2.7 1.7-.5 3.2-2.5 3.6"
        fill="white"
      />
      {/* Individual flower petals and centers */}
      <circle cx="13.5" cy="6.2" r="1.1" fill="none" stroke="currentColor" />
      <path d="M13.5 4.2c.7 0 1.2.5 1.2 1.1M15.4 5.6c.4.5.3 1.2-.2 1.5M14.2 7.8c-.5.5-1.2.3-1.5-.2M12 7.2c-.5-.4-.5-1.2 0-1.6M12.4 4.8c.3-.5 1-.8 1.1-.6" />
      
      <circle cx="9.8" cy="8.6" r="1.1" fill="none" stroke="currentColor" />
      <path d="M9.8 6.6c.6 0 1.1.4 1.1 1M11.6 8.2c.4.5.2 1.1-.2 1.4M10.4 10.2c-.5.4-1.1.2-1.4-.2M8.2 9.6c-.4-.4-.4-1 0-1.4M8.6 7.2c.3-.5.9-.6 1.2-.6" />

      <circle cx="17.2" cy="8.6" r="1.1" fill="none" stroke="currentColor" />
      <path d="M17.2 6.6c.6 0 1.1.4 1.1 1M19 8.2c.4.5.2 1.1-.2 1.4M17.8 10.2c-.5.4-1.1.2-1.4-.2M15.6 9.6c-.4-.4-.4-1 0-1.4M16 7.2c.3-.5.9-.6 1.2-.6" />

      <circle cx="13.5" cy="10.8" r="1.1" fill="none" stroke="currentColor" />
      <path d="M13.5 9.2c.6 0 1 .4 1 .9M15 10.5c.3.4.2 1-.2 1.2M14 12.2c-.4.3-1 .2-1.2-.2M12.2 11.6c-.3-.4-.2-1 .2-1.2" />

      {/* Wrapper Cone */}
      <path d="M7.8 11.8 L11.8 19.5 L16.2 19.5 L20.2 11.8" fill="white" />
      <path d="M8.5 12 C11.5 13.8 16.5 13.8 19.5 12" />

      {/* Tie bands */}
      <path d="M11.2 19.2 L16.8 19.2" strokeWidth="1.8" />
      <path d="M11.8 21.2 L16.2 21.2" strokeWidth="1.8" />

      {/* Ribbon / Stems below tie */}
      <path d="M12.2 22 L10 25.5 M14 22 L14 26 M15.8 22 L18 25.5" />
    </svg>
  );
}

// Line art Share Icon (L-bracket tray with curved up-right arrow)
function ShareTrayIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={className}
    >
      <path d="M6 9v9a1 1 0 0 0 1 1h11" />
      <path d="M9 15c2-4 5.5-6 10-6" />
      <path d="M14.5 5.5L19 9l-4.5 3.5" />
    </svg>
  );
}

// Hand-crafted high-fidelity mascot avatar matching Teacher Salin
function TeacherMascotAvatar({ className = "w-full h-full" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" fill="none" className={className}>
      <circle cx="60" cy="60" r="56" fill="#F4EFEA" />
      <path d="M22 118 C22 92 38 84 60 84 C82 84 98 92 98 118 Z" fill="#FFA8A4" />
      <polygon points="60,88 46,84 52,98" fill="#F87171" />
      <polygon points="60,88 74,84 68,98" fill="#F87171" />
      <circle cx="60" cy="106" r="2.5" fill="#FFFFFF" />
      <rect x="52" y="73" width="16" height="16" fill="#FFD8B8" rx="4" />
      <ellipse cx="60" cy="54" rx="30" ry="28" fill="#FFD8B8" />
      <circle cx="30" cy="56" r="7" fill="#FFD8B8" />
      <circle cx="90" cy="56" r="7" fill="#FFD8B8" />
      <ellipse cx="43" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      <ellipse cx="77" cy="60" rx="6.5" ry="3.8" fill="#FF8A8A" opacity="0.8" />
      <path d="M52 63 C56 68 64 68 68 63" stroke="#1F2937" strokeWidth="2.4" strokeLinecap="round" />
      <rect x="37" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <rect x="64" y="46" width="19" height="16" rx="5.5" stroke="#1F2937" strokeWidth="2.5" fill="white" fillOpacity="0.2" />
      <path d="M56 53 L64 53" stroke="#1F2937" strokeWidth="2.5" />
      <circle cx="46.5" cy="53" r="2.3" fill="#1F2937" />
      <circle cx="73.5" cy="53" r="2.3" fill="#1F2937" />
      <path d="M41 41.5 C45 39.5 49 40.5 52 42.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M68 42.5 C71 40.5 75 39.5 79 41.5" stroke="#1F2937" strokeWidth="2" strokeLinecap="round" />
      <path d="M29 49 C26 29 37 14 60 14 C83 14 94 29 91 49 C88 40 82 34 76 36 C71 27 62 24 54 27 C45 25 38 33 34 40 C32 43 31 46 29 49 Z" fill="#374151" />
      <path d="M35 36 C42 45 48 42 52 37 C56 44 62 44 66 38 C71 45 76 43 83 37 C81 48 76 50 71 46" fill="#374151" />
    </svg>
  );
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
  const [previewFile, setPreviewFile] = useState<{ name: string; url: string; size?: number } | null>(null);

  const primaryFile = useMemo(() => {
    if (idea?.files && Array.isArray(idea.files) && idea.files.length > 0) {
      return idea.files[0];
    }
    return {
      name: `เอกสารและใบกิจกรรม - ${idea?.title || "Art Room"}.pdf`,
      url: idea?.coverImageUrl || "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
      size: 1024 * 1024 * 1.8,
    };
  }, [idea]);

  const handleOpenPreview = (file: { name: string; url: string; size?: number }) => {
    setPreviewFile(file);
  };

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
              {/* Left Column: Avatar + Author + Date (Clickable with hover enlargement) */}
              <Link
                href={`/teachers/profile?name=${encodeURIComponent(idea.authorName || "ครูสลิน")}`}
                className="group flex items-center gap-3 min-w-0 cursor-pointer"
                title="คลิกเพื่อดูโปรไฟล์และข้อมูลของคุณครู"
              >
                <div className="w-11 h-11 rounded-full overflow-hidden border border-gray-200/80 bg-orange-50 shrink-0 shadow-2xs flex items-center justify-center transition-transform duration-200 group-hover:scale-110 group-hover:ring-2 group-hover:ring-orange-300">
                  {(!idea.authorName || idea.authorName.includes("สลิน")) ? (
                    <TeacherMascotAvatar className="w-full h-full" />
                  ) : (
                    /* eslint-disable-next-line @next/next/no-img-element */
                    <img 
                      src={`https://api.dicebear.com/7.x/adventurer/svg?seed=${encodeURIComponent(idea.authorName)}&backgroundColor=ffdfbf`} 
                      alt={idea.authorName}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        e.currentTarget.style.display = 'none';
                        if (e.currentTarget.parentElement) {
                          e.currentTarget.parentElement.innerHTML = `<span class="text-orange-600 font-bold text-base">${idea.authorName.charAt(0)}</span>`;
                        }
                      }}
                    />
                  )}
                </div>
                <div className="min-w-0">
                  <h3 className="font-semibold text-gray-900 text-sm sm:text-[15px] leading-tight truncate transition-all duration-200 group-hover:scale-110 group-hover:text-[#1E3A8A] group-hover:font-bold origin-left inline-block">
                    {idea.authorName || "ครูสลิน"}
                  </h3>
                  <p className="text-xs text-gray-400 font-light mt-0.5 truncate">
                    {new Date(idea.createdAt || Date.now()).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })}
                    {idea.createdAt ? ` (แก้ไข ${new Date(idea.createdAt).toLocaleDateString('th-TH', { day: 'numeric', month: 'long', year: 'numeric' })})` : ''}
                  </p>
                </div>
              </Link>

              {/* Right Column: Views/Comments + Reactions + Share/Bookmark */}
              <div className="flex flex-col items-end gap-2 shrink-0">
                {/* Views & Comments */}
                <div className="flex items-center gap-4 text-sm sm:text-base text-gray-500 font-medium pr-1">
                  <div className="flex items-center gap-1.5">
                    <Eye className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.8} />
                    <span className="text-gray-700 font-semibold">{viewsCount}</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <MessageCircle className="w-[18px] h-[18px] text-gray-500" strokeWidth={1.8} />
                    <span className="text-gray-700 font-semibold">{idea.comments?.length || 0}</span>
                  </div>
                </div>

                {/* Reactions & Action Buttons (Monochrome Outline Style) */}
                <div className="flex items-center gap-3 sm:gap-4">
                  {/* Reaction 1: Star Eyes (Black & White line art) */}
                  <button
                    type="button"
                    onClick={handleToggleStarry}
                    className="flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-neutral-800 hover:opacity-80"
                    title="ว้าว / ชื่นชอบ"
                  >
                    <StarEyesIcon
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                        hasLikedStarry
                          ? "text-amber-500 scale-110 drop-shadow-xs"
                          : "text-neutral-800"
                      }`}
                    />
                    <span
                      className={`text-base sm:text-lg font-semibold ${
                        hasLikedStarry ? "text-amber-600" : "text-gray-700"
                      }`}
                    >
                      {starryCount}
                    </span>
                  </button>

                  {/* Reaction 2: Bouquet (Black & White line art) */}
                  <button
                    type="button"
                    onClick={handleToggleFlower}
                    className="flex items-center gap-1.5 transition-all cursor-pointer active:scale-95 text-neutral-800 hover:opacity-80"
                    title="มอบช่อดอกไม้ / ชื่นชม"
                  >
                    <BouquetIcon
                      className={`w-7 h-7 sm:w-8 sm:h-8 transition-all ${
                        hasLikedFlower
                          ? "text-pink-500 scale-110 drop-shadow-xs"
                          : "text-neutral-800"
                      }`}
                    />
                    <span
                      className={`text-base sm:text-lg font-semibold ${
                        hasLikedFlower ? "text-pink-600" : "text-gray-700"
                      }`}
                    >
                      {flowerCount}
                    </span>
                  </button>

                  {/* Vertical Divider Line */}
                  <div className="h-7 sm:h-8 w-[1.5px] bg-neutral-800 mx-0.5 sm:mx-1" />

                  {/* Share button (Circular with black outline) */}
                  <button
                    type="button"
                    onClick={handleCopyLink}
                    className="w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[1.5px] border-neutral-800 bg-white hover:bg-neutral-50 flex items-center justify-center text-neutral-800 transition-all shadow-2xs cursor-pointer active:scale-95"
                    title={isCopied ? "คัดลอกลิงก์แล้ว!" : "แชร์ไอเดียนี้"}
                  >
                    {isCopied ? (
                      <Check className="w-5 h-5 text-emerald-600 stroke-[2]" />
                    ) : (
                      <ShareTrayIcon className="w-5 h-5 text-neutral-800" />
                    )}
                  </button>

                  {/* Bookmark button (Circular with black outline) */}
                  <button
                    type="button"
                    onClick={handleToggleBookmark}
                    className={`w-10 h-10 sm:w-11 sm:h-11 rounded-full border-[1.5px] transition-all shadow-2xs flex items-center justify-center cursor-pointer active:scale-95 ${
                      isBookmarked
                        ? "border-neutral-800 bg-amber-50 text-amber-500"
                        : "border-neutral-800 bg-white hover:bg-neutral-50 text-neutral-800"
                    }`}
                    title={isBookmarked ? "ยกเลิกการบันทึก" : "บันทึกไอเดียนี้"}
                  >
                    <Bookmark
                      className={`w-5 h-5 stroke-[1.8] ${
                        isBookmarked ? "fill-amber-400 text-amber-500" : "text-neutral-800"
                      }`}
                    />
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

            {/* Quick Action Document Banner with ดูพรีวิว and ดาวน์โหลดเอกสาร */}
            <div className="mb-8 p-5 sm:p-6 rounded-2xl bg-gradient-to-r from-orange-50/90 via-amber-50/60 to-white border border-orange-200/80 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3.5 min-w-0">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-orange-500 to-amber-500 text-white flex items-center justify-center shrink-0 shadow-xs">
                  <FileText className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-[10px] font-bold uppercase tracking-wider bg-orange-100 text-orange-800 px-2 py-0.2 rounded-full">
                      เอกสารแนบ
                    </span>
                    <span className="text-xs text-gray-400">PDF Document</span>
                  </div>
                  <h4 className="text-sm sm:text-base font-bold text-gray-900 truncate">
                    {primaryFile.name}
                  </h4>
                </div>
              </div>

              {/* Action Buttons: ดูพรีวิว & ดาวน์โหลดเอกสาร */}
              <div className="flex items-center gap-2.5 shrink-0">
                <button
                  type="button"
                  onClick={() => handleOpenPreview(primaryFile)}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-white hover:bg-orange-50 text-gray-800 hover:text-orange-600 border border-gray-200 hover:border-orange-300 font-bold text-xs sm:text-sm transition-all shadow-xs cursor-pointer active:scale-95"
                >
                  <Eye className="w-4 h-4 text-orange-500" />
                  <span>ดูพรีวิว</span>
                </button>

                <a
                  href={isLoggedIn ? primaryFile.url : "#"}
                  download={isLoggedIn ? primaryFile.name : undefined}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      if (confirm("กรุณาเข้าสู่ระบบก่อนดาวน์โหลดเอกสาร ต้องการไปหน้าเข้าสู่ระบบหรือไม่?")) {
                        router.push(`/login?redirect=/ideas/detail?id=${idea.id}`);
                      }
                    }
                  }}
                  className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-2 px-5 sm:px-6 py-2.5 rounded-xl bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs sm:text-sm transition-all shadow-sm hover:shadow-md cursor-pointer active:scale-95"
                >
                  <Download className="w-4 h-4" />
                  <span>ดาวน์โหลดเอกสาร</span>
                </a>
              </div>
            </div>

            {/* Attachments Section if multiple files exist */}
            {idea.files && idea.files.length > 1 && (
              <div className="mb-10">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-base font-bold text-gray-900 flex items-center gap-2">
                    <Download className="w-5 h-5 text-orange-500" /> 
                    <span>ไฟล์แนบทั้งหมด ({idea.files.length} ไฟล์)</span>
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
                      <div 
                        key={index}
                        className="flex items-center justify-between gap-3 p-4 rounded-2xl border border-gray-200 hover:border-orange-300 hover:bg-orange-50/20 transition-all group shadow-xs bg-white"
                      >
                        <div className="flex items-center gap-3 min-w-0">
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
                        </div>

                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            type="button"
                            onClick={() => handleOpenPreview(file)}
                            className="p-2 rounded-xl bg-gray-50 hover:bg-orange-50 text-gray-600 hover:text-orange-600 border border-gray-200 hover:border-orange-300 transition-colors"
                            title="ดูพรีวิว"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                          <a
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
                            className="p-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white transition-colors shadow-xs"
                            title="ดาวน์โหลด"
                          >
                            <Download className="w-4 h-4" />
                          </a>
                        </div>
                      </div>
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
      {/* Interactive Document Preview Modal */}
      {previewFile && (
        <div 
          className="fixed inset-0 z-[100] flex items-center justify-center p-3 sm:p-6 bg-black/75 backdrop-blur-xs animate-in fade-in duration-200"
          onClick={() => setPreviewFile(null)}
        >
          <div 
            className="bg-white rounded-3xl w-full max-w-4xl max-h-[90vh] flex flex-col shadow-2xl border border-gray-100 overflow-hidden"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/80">
              <div className="flex items-center gap-3 min-w-0 pr-4">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center shrink-0">
                  <FileText className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-bold text-gray-900 text-sm sm:text-base truncate">
                    {previewFile.name}
                  </h4>
                  <p className="text-xs text-gray-400">พรีวิวเอกสารออนไลน์</p>
                </div>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={isLoggedIn ? previewFile.url : "#"}
                  download={isLoggedIn ? previewFile.name : undefined}
                  target={isLoggedIn ? "_blank" : undefined}
                  rel={isLoggedIn ? "noopener noreferrer" : undefined}
                  onClick={(e) => {
                    if (!isLoggedIn) {
                      e.preventDefault();
                      if (confirm("กรุณาเข้าสู่ระบบก่อนดาวน์โหลดเอกสาร ต้องการไปหน้าเข้าสู่ระบบหรือไม่?")) {
                        router.push(`/login?redirect=/ideas/detail?id=${idea.id}`);
                      }
                    }
                  }}
                  className="px-3.5 py-1.5 rounded-xl bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs flex items-center gap-1.5 transition-all shadow-xs cursor-pointer"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>ดาวน์โหลด</span>
                </a>
                <button
                  type="button"
                  onClick={() => setPreviewFile(null)}
                  className="w-8 h-8 rounded-full bg-gray-200/80 hover:bg-gray-300 text-gray-600 flex items-center justify-center transition-colors text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>
            </div>

            {/* Modal Body Preview Viewer */}
            <div className="flex-1 overflow-auto p-4 sm:p-6 bg-[#2B2B2B] flex flex-col items-center justify-center min-h-[420px]">
              {previewFile.url?.startsWith("data:image") || previewFile.url?.match(/\.(jpeg|jpg|png|gif|webp)$/i) ? (
                /* eslint-disable-next-line @next/next/no-img-element */
                <img 
                  src={previewFile.url} 
                  alt={previewFile.name} 
                  className="max-h-[70vh] w-auto max-w-full rounded-lg shadow-lg object-contain"
                />
              ) : (
                <div className="w-full h-full min-h-[500px] flex flex-col items-center justify-center bg-white rounded-2xl p-4 sm:p-6 text-center">
                  <iframe 
                    src={previewFile.url} 
                    title={previewFile.name}
                    className="w-full h-[60vh] rounded-xl border border-gray-200"
                  />
                  <div className="mt-3 flex items-center gap-3">
                    <a
                      href={previewFile.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-orange-600 hover:underline font-semibold flex items-center gap-1"
                    >
                      เปิดพรีวิวในแท็บใหม่ ↗
                    </a>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      )}
      <Footer />
    </>
  );
}
