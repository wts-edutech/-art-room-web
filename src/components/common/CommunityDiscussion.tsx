"use client";

import { useState, useEffect, useMemo, useRef } from "react";
import Link from "next/link";
import { 
  MessageSquare, Send, Heart, Reply, Trash2, Sparkles, 
  User, Check, AlertCircle, Loader2, LogIn, MessageCircleHeart,
  CornerDownRight, Smile, Search, GraduationCap, ShieldCheck
} from "lucide-react";
import { resolveUserAvatar } from "@/lib/art-avatars";

export interface CommentItem {
  id: string;
  lessonId: string;
  author: string;
  authorEmail?: string;
  authorImage?: string;
  text: string;
  time?: string;
  createdAt?: string;
}

interface CommunityDiscussionProps {
  topicId: string;
  title?: string;
  subtitle?: string;
  accentColor?: "orange" | "red" | "amber" | "rose";
  tags?: string[];
  quickPrompts?: string[];
  emptyMessage?: string;
  id?: string;
}

export default function CommunityDiscussion({
  topicId,
  title = "พื้นที่พูดคุย & แลกเปลี่ยนความคิดเห็น",
  subtitle = "ร่วมสอบถาม แบ่งปันมุมมอง และส่งต่อแรงบันดาลใจในห้องเรียนศิลปะ Art Room",
  accentColor = "orange",
  tags = ["ทั้งหมด", "❓ ถามเรื่องบทเรียน", "🎨 เทคนิคและอุปกรณ์", "💡 เสนอแนะสื่อใหม่", "💬 พูดคุยทั่วไป"],
  quickPrompts = [
    "ชอบเทคนิคนี้มากครับ 👍",
    "ขอคำแนะนำเรื่องการเลือกใช้สีเพิ่มเติมครับ 🎨",
    "นำไปฝึกวาดตามแล้วเข้าใจง่ายมากครับ ✨",
    "อยากให้คุณครูทำคลิปสอนเทคนิคนี้เพิ่มครับ 💡"
  ],
  emptyMessage = "ยังไม่มีบทสนทนาในหัวข้อนี้ มาเป็นคนแรกที่เปิดประเด็นพูดคุยกันเถอะ!",
  id = "community-discussions"
}: CommunityDiscussionProps) {
  const [comments, setComments] = useState<CommentItem[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [newComment, setNewComment] = useState("");
  const [selectedTag, setSelectedTag] = useState("ทั้งหมด");
  const [discussionSearch, setDiscussionSearch] = useState("");
  const [activePrompt, setActivePrompt] = useState<string | null>(null);
  const [isPosting, setIsPosting] = useState(false);
  const [postError, setPostError] = useState<string | null>(null);
  const [postSuccess, setPostSuccess] = useState(false);

  // User session state from localStorage
  const [userName, setUserName] = useState<string>("");
  const [userRole, setUserRole] = useState<string>("");
  const [userAvatar, setUserAvatar] = useState<string>("");
  const [userEmail, setUserEmail] = useState<string>("");
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  // Guest input fallback (if not logged in)
  const [guestName, setGuestName] = useState("");

  // Likes state stored locally
  const [likedMap, setLikedMap] = useState<Record<string, boolean>>({});
  const [likesCountMap, setLikesCountMap] = useState<Record<string, number>>({});

  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // Read user info
  useEffect(() => {
    const name = localStorage.getItem("artroom_author_name") || "";
    const role = localStorage.getItem("artroom_user_role") || "student";
    const avatar = localStorage.getItem("artroom_user_avatar") || "";
    const email = localStorage.getItem("artroom_author_email") || "";

    setUserName(name);
    setUserRole(role);
    setUserAvatar(avatar);
    setUserEmail(email);
    setIsLoggedIn(!!name.trim());

    // Load liked comments from localStorage
    try {
      const savedLikes = localStorage.getItem(`artroom_likes_${topicId}`);
      if (savedLikes) {
        setLikedMap(JSON.parse(savedLikes));
      }
    } catch {}
  }, [topicId]);

  // Fetch comments
  const fetchComments = async () => {
    try {
      setIsLoading(true);
      const res = await fetch(`/api/comments?lessonId=${encodeURIComponent(topicId)}`);
      if (res.ok) {
        const data = await res.json();
        if (Array.isArray(data)) {
          setComments(data);
        }
      }
    } catch (err) {
      console.error("Failed to fetch comments", err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchComments();
  }, [topicId]);

  // Format date helper (Thai format)
  const formatCommentTime = (timeStr?: string) => {
    if (!timeStr) return "เมื่อสักครู่";
    try {
      const d = new Date(timeStr);
      return new Intl.DateTimeFormat("th-TH", {
        day: "numeric",
        month: "short",
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      }).format(d);
    } catch {
      return timeStr;
    }
  };

  // Submit comment
  const handlePost = async (e: React.FormEvent) => {
    e.preventDefault();
    const effectiveAuthor = isLoggedIn ? userName : guestName.trim();
    if (!newComment.trim() || isPosting) return;

    if (!effectiveAuthor) {
      setPostError("กรุณาระบุชื่อของคุณก่อนแสดงความคิดเห็น");
      return;
    }

    setIsPosting(true);
    setPostError(null);

    // If guest, save name locally for convenience
    if (!isLoggedIn && guestName.trim()) {
      localStorage.setItem("artroom_author_name", guestName.trim());
      setUserName(guestName.trim());
    }

    try {
      const res = await fetch("/api/comments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          lessonId: topicId,
          text: newComment.trim(),
          author: effectiveAuthor,
          authorEmail: userEmail || "",
          authorImage: userAvatar || "",
        }),
      });

      if (res.ok) {
        const posted = await res.json();
        setComments((prev) => [posted, ...prev]);
        setNewComment("");
        setActivePrompt(null);
        setPostSuccess(true);
        setTimeout(() => setPostSuccess(false), 3000);
      } else {
        const errData = await res.json().catch(() => ({}));
        setPostError(errData.error || "เกิดข้อผิดพลาดในการส่งข้อความ กรุณาลองใหม่อีกครั้ง");
      }
    } catch (err) {
      setPostError("ไม่สามารถเชื่อมต่อระบบได้ กรุณาลองใหม่อีกครั้ง");
    } finally {
      setIsPosting(false);
    }
  };

  // Delete comment
  const handleDelete = async (commentId: string) => {
    if (!confirm("คุณต้องการลบความคิดเห็นนี้ใช่หรือไม่?")) return;
    try {
      const res = await fetch(`/api/comments?id=${encodeURIComponent(commentId)}`, {
        method: "DELETE",
      });
      if (res.ok) {
        setComments((prev) => prev.filter((c) => c.id !== commentId));
      }
    } catch (err) {
      console.error("Failed to delete comment", err);
    }
  };

  // Handle like toggle
  const handleToggleLike = (commentId: string) => {
    const currentLiked = likedMap[commentId] || false;
    const newLiked = !currentLiked;
    const newMap = { ...likedMap, [commentId]: newLiked };
    setLikedMap(newMap);

    setLikesCountMap((prev) => {
      const currentCount = prev[commentId] || 0;
      return {
        ...prev,
        [commentId]: Math.max(0, currentCount + (newLiked ? 1 : -1)),
      };
    });

    try {
      localStorage.setItem(`artroom_likes_${topicId}`, JSON.stringify(newMap));
    } catch {}
  };

  // Quick prompt click
  const handleQuickPromptClick = (prompt: string) => {
    setActivePrompt(prompt);
    setNewComment((prev) => {
      if (!prev.trim()) return prompt;
      return `${prev.trim()}\n${prompt}`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Reply click with context quote
  const handleReplyClick = (authorName: string, textSnippet?: string) => {
    const mention = `@${authorName} `;
    setNewComment((prev) => {
      if (prev.includes(`@${authorName}`)) return prev;
      if (textSnippet) {
        const cleanSnippet = textSnippet.replace(/\n+/g, " ").trim().slice(0, 70);
        return `> @${authorName}: "${cleanSnippet}..."\n\n${mention}${prev}`;
      }
      return `${mention}${prev}`;
    });
    if (textareaRef.current) {
      textareaRef.current.focus();
    }
  };

  // Filtered comments (by Tag and by Search Keyword)
  const filteredComments = useMemo(() => {
    let list = comments;
    if (selectedTag !== "ทั้งหมด") {
      const cleanTag = selectedTag.replace(/^[^\s]+\s*/, "").trim(); // strip emoji prefix
      list = list.filter((c) => 
        c.text.toLowerCase().includes(cleanTag.toLowerCase()) || 
        c.text.toLowerCase().includes(selectedTag.toLowerCase())
      );
    }
    if (discussionSearch.trim()) {
      const q = discussionSearch.toLowerCase();
      list = list.filter((c) =>
        c.text.toLowerCase().includes(q) ||
        c.author.toLowerCase().includes(q)
      );
    }
    return list;
  }, [comments, selectedTag, discussionSearch]);

  // Color theme classes
  const colorThemes = {
    orange: {
      gradient: "from-orange-500 to-amber-500",
      accentBg: "bg-orange-50 text-orange-700 border-orange-100",
      badgeBg: "bg-orange-500 text-white",
      buttonBg: "bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white",
      borderFocus: "focus:border-orange-500 focus:ring-orange-500/10",
      iconColor: "text-orange-500",
    },
    red: {
      gradient: "from-red-600 to-rose-600",
      accentBg: "bg-red-50 text-red-700 border-red-100",
      badgeBg: "bg-red-600 text-white",
      buttonBg: "bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white",
      borderFocus: "focus:border-red-500 focus:ring-red-500/10",
      iconColor: "text-red-600",
    },
    amber: {
      gradient: "from-amber-500 to-yellow-500",
      accentBg: "bg-amber-50 text-amber-800 border-amber-100",
      badgeBg: "bg-amber-500 text-white",
      buttonBg: "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 text-white",
      borderFocus: "focus:border-amber-500 focus:ring-amber-500/10",
      iconColor: "text-amber-500",
    },
    rose: {
      gradient: "from-rose-500 to-pink-500",
      accentBg: "bg-rose-50 text-rose-700 border-rose-100",
      badgeBg: "bg-rose-500 text-white",
      buttonBg: "bg-gradient-to-r from-rose-500 to-pink-500 hover:from-rose-600 hover:to-pink-600 text-white",
      borderFocus: "focus:border-rose-500 focus:ring-rose-500/10",
      iconColor: "text-rose-500",
    },
  };

  const theme = colorThemes[accentColor] || colorThemes.orange;
  const currentResolvedAvatar = resolveUserAvatar(userAvatar, userName || guestName);

  return (
    <div id={id} className="scroll-mt-24 w-full">
      <div className="bg-white rounded-[2rem] sm:rounded-[2.5rem] border border-gray-100/90 shadow-sm p-6 sm:p-10 relative overflow-hidden">
        {/* Subtle decorative background aura */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-orange-100/30 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-amber-100/20 rounded-full blur-3xl pointer-events-none -ml-20 -mb-20" />

        {/* Section Header */}
        <div className="relative z-10 mb-8 pb-6 border-b border-gray-100">
          {/* Top Pill Badge */}
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-orange-50 border border-orange-100 text-orange-700 text-xs font-bold mb-3 shadow-2xs">
            <MessageCircleHeart className="w-3.5 h-3.5 text-orange-500 shrink-0" />
            <span className="whitespace-nowrap">คอมเมนต์ & สนทนาแลกเปลี่ยน</span>
          </div>

          {/* Title Row with Counter Badge */}
          <div className="flex flex-wrap items-center gap-2.5 sm:gap-3 mb-2">
            <h2 className="text-xl sm:text-2xl md:text-3xl font-black text-gray-900 tracking-tight leading-snug break-words">
              {title}
            </h2>
            <span className="whitespace-nowrap text-xs sm:text-sm font-bold px-3 py-1 rounded-full bg-gray-100 text-gray-700 shadow-2xs shrink-0">
              {comments.length} บทสนทนา
            </span>
          </div>

          {/* Subtitle */}
          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed max-w-3xl">
            {subtitle}
          </p>

          {/* Category Filter Pills & Discussion Search Bar */}
          <div className="mt-5 pt-4 border-t border-gray-100/80 flex flex-col gap-3.5">
            {/* Category Filter Pills (Wrapping cleanly, balanced with screen width) */}
            {tags && tags.length > 0 && (
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-xs font-medium text-gray-400 shrink-0 mr-1 hidden sm:inline">
                  หมวดหมู่:
                </span>
                {tags.map((tag) => (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => setSelectedTag(tag)}
                    className={`px-3.5 py-1.5 rounded-xl text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
                      selectedTag === tag
                        ? `${theme.badgeBg} shadow-xs scale-102 font-bold ring-2 ring-orange-400/20`
                        : "bg-gray-100/90 text-gray-600 hover:bg-gray-200/80 hover:text-gray-900"
                    }`}
                  >
                    {tag}
                  </button>
                ))}
              </div>
            )}

            {/* Quick Discussion Search & Status Counter Bar */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-0.5">
              <div className="relative flex-1 sm:max-w-md">
                <Search className="w-3.5 h-3.5 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  value={discussionSearch}
                  onChange={(e) => setDiscussionSearch(e.target.value)}
                  placeholder="ค้นหาในกระดานถาม-ตอบ (พิมพ์คำถาม หรือชื่อผู้ถาม)..."
                  className="w-full pl-9.5 pr-8 py-2 text-xs sm:text-sm bg-gray-50/90 border border-gray-200 rounded-xl focus:outline-none focus:border-orange-500 focus:bg-white transition-all shadow-2xs placeholder-gray-400"
                />
                {discussionSearch && (
                  <button
                    type="button"
                    onClick={() => setDiscussionSearch("")}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 text-xs cursor-pointer p-1 rounded-md hover:bg-gray-200/60"
                    title="ล้างคำค้นหา"
                  >
                    ✕
                  </button>
                )}
              </div>

              {/* Status / Active Filter Summary */}
              <div className="flex items-center gap-2 text-xs text-gray-500 shrink-0">
                {(selectedTag !== "ทั้งหมด" || discussionSearch) ? (
                  <>
                    <span className="font-medium text-gray-700">
                      พบ <span className="text-orange-600 font-bold">{filteredComments.length}</span> ข้อความ
                    </span>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedTag("ทั้งหมด");
                        setDiscussionSearch("");
                      }}
                      className="text-orange-600 hover:text-orange-700 hover:underline font-bold cursor-pointer ml-1"
                    >
                      ล้างตัวกรอง
                    </button>
                  </>
                ) : (
                  <span className="text-gray-400 font-normal">
                    แสดงทั้งหมด {comments.length} บทสนทนา
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Post Comment Input Box */}
        <div className="relative z-10 mb-10 bg-[#FAFAFA] rounded-2xl p-4 sm:p-6 border border-gray-100">
          <form onSubmit={handlePost}>
            {/* User Identity Info Bar */}
            <div className="flex items-center justify-between gap-3 mb-4">
              <div className="flex items-center gap-3 min-w-0">
                {/* Avatar Display */}
                <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs border border-orange-200 flex items-center justify-center shrink-0">
                  {currentResolvedAvatar.type === "image" ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img src={currentResolvedAvatar.value} alt={userName || "User"} className="w-full h-full object-cover" />
                  ) : currentResolvedAvatar.type === "preset" ? (
                    <span className="text-lg select-none">{currentResolvedAvatar.value}</span>
                  ) : (
                    <span className="text-sm font-black text-orange-600">{currentResolvedAvatar.value}</span>
                  )}
                </div>

                {/* Identity Name & Role Badge */}
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-sm text-gray-900 truncate">
                      {isLoggedIn ? userName : (guestName.trim() || "ผู้ร่วมสนทนา")}
                    </span>

                    {/* Role Badge */}
                    {isLoggedIn ? (
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-md whitespace-nowrap shrink-0 ${
                        userRole === "admin" || userRole === "teacher"
                          ? "bg-red-100 text-red-700"
                          : userRole === "guest"
                            ? "bg-blue-100 text-blue-700"
                            : "bg-amber-100 text-amber-800"
                      }`}>
                        {userRole === "admin" ? "ผู้ดูแลระบบ" : userRole === "teacher" ? "คุณครู" : userRole === "guest" ? "ผู้ปกครอง/ทั่วไป" : "นักเรียน WTS"}
                      </span>
                    ) : (
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-gray-200 text-gray-600 whitespace-nowrap shrink-0">
                        ผู้เยี่ยมชม
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-gray-400 font-light truncate">
                    {isLoggedIn ? "กำลังร่วมแสดงความคิดเห็นในนามผู้ใช้ระบบ" : "เข้าสู่ระบบเพื่อซิงค์โปรไฟล์ หรือพิมพ์ชื่อเพื่อร่วมพูดคุยได้ทันที"}
                  </p>
                </div>
              </div>

              {/* Login Shortcut if guest */}
              {!isLoggedIn && (
                <Link
                  href="/login"
                  className="shrink-0 px-3 py-1.5 rounded-xl bg-white border border-gray-200 hover:border-orange-300 text-gray-700 hover:text-orange-600 text-xs font-semibold flex items-center gap-1.5 transition-all shadow-2xs"
                >
                  <LogIn className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">เข้าสู่ระบบ</span>
                </Link>
              )}
            </div>

            {/* If not logged in, show simple name input */}
            {!isLoggedIn && (
              <div className="mb-3">
                <input
                  type="text"
                  value={guestName}
                  onChange={(e) => setGuestName(e.target.value)}
                  placeholder="ใส่ชื่อหรือนามแฝงของคุณ (เช่น ด.ช. ศิลป์ดี หรือ ผู้ปกครองน้องอิง)..."
                  className="w-full h-10 px-4 rounded-xl border border-gray-200 bg-white text-xs sm:text-sm font-medium focus:border-orange-400 focus:ring-2 focus:ring-orange-400/10 outline-none transition-all shadow-2xs"
                />
              </div>
            )}

            {/* Textarea */}
            <div className="relative">
              <textarea
                ref={textareaRef}
                value={newComment}
                onChange={(e) => {
                  setNewComment(e.target.value);
                  if (postError) setPostError(null);
                }}
                rows={3}
                placeholder="พิมพ์ข้อความเพื่อสอบถามคุณครู แลกเปลี่ยนเทคนิค หรือร่วมสนทนากับเพื่อนๆ..."
                className={`w-full p-4 rounded-2xl border border-gray-200 bg-white text-sm text-gray-800 placeholder-gray-400 outline-none transition-all resize-none shadow-2xs ${theme.borderFocus}`}
              />
            </div>

            {/* Quick Prompts Chips */}
            {quickPrompts && quickPrompts.length > 0 && (
              <div className="mt-2.5 flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[11px] text-gray-400 shrink-0 mr-1 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-amber-500" />
                  ข้อความด่วน:
                </span>
                {quickPrompts.map((prompt, idx) => (
                  <button
                    key={idx}
                    type="button"
                    onClick={() => handleQuickPromptClick(prompt)}
                    className="shrink-0 px-2.5 py-1 rounded-lg bg-white hover:bg-orange-50 border border-gray-200/80 hover:border-orange-200 text-[11px] font-normal text-gray-600 hover:text-orange-700 transition-all shadow-2xs active:scale-95 cursor-pointer"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

            {/* Error Message */}
            {postError && (
              <div className="mt-3 p-3 rounded-xl bg-red-50 border border-red-100 text-red-600 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{postError}</span>
              </div>
            )}

            {/* Success Message */}
            {postSuccess && (
              <div className="mt-3 p-3 rounded-xl bg-emerald-50 border border-emerald-100 text-emerald-600 text-xs flex items-center gap-2 animate-in fade-in">
                <Check className="w-4 h-4 shrink-0" />
                <span>ส่งข้อความสำเร็จแล้ว! ขอบคุณที่ร่วมแบ่งปันบทสนทนา</span>
              </div>
            )}

            {/* Actions Bar */}
            <div className="mt-3 flex items-center justify-between pt-2">
              <span className="text-[11px] text-gray-400">
                ความยาว: {newComment.length} / 1,000 ตัวอักษร
              </span>

              <button
                type="submit"
                disabled={!newComment.trim() || isPosting}
                className={`px-6 py-2.5 rounded-xl font-bold text-xs sm:text-sm flex items-center gap-2 transition-all shadow-sm active:scale-95 cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed ${theme.buttonBg}`}
              >
                {isPosting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>กำลังส่ง...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>ส่งข้อความ</span>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>

        {/* Discussion Feed / Comments List */}
        <div className="relative z-10 space-y-4">
          {isLoading ? (
            <div className="py-16 text-center text-gray-400">
              <Loader2 className="w-8 h-8 animate-spin mx-auto text-orange-500 mb-2" />
              <p className="text-xs">กำลังโหลดบทสนทนา...</p>
            </div>
          ) : filteredComments.length === 0 ? (
            <div className="py-14 text-center bg-gray-50/60 rounded-3xl border border-dashed border-gray-200 p-8">
              <div className="w-14 h-14 rounded-2xl bg-orange-100/70 text-orange-500 flex items-center justify-center mx-auto mb-3">
                <MessageSquare className="w-7 h-7" />
              </div>
              <h3 className="text-base font-bold text-gray-800 mb-1">ยังไม่มีบทสนทนา</h3>
              <p className="text-xs text-gray-500 max-w-sm mx-auto mb-4 font-light">
                {emptyMessage}
              </p>
              <button
                type="button"
                onClick={() => textareaRef.current?.focus()}
                className="px-5 py-2 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold transition-all shadow-sm"
              >
                + เริ่มต้นพูดคุยเป็นคนแรก
              </button>
            </div>
          ) : (
            filteredComments.map((comment) => {
              const isLiked = likedMap[comment.id] || false;
              const likesCount = likesCountMap[comment.id] || 0;
              const commentResolvedAvatar = resolveUserAvatar(comment.authorImage, comment.author);
              const canDelete =
                userRole === "admin" ||
                (userName && comment.author === userName) ||
                (userName && comment.author?.startsWith(userName));

              const isTeacher =
                comment.author.includes("ครู") ||
                comment.author.includes("อาจารย์") ||
                comment.author.toLowerCase().includes("teacher") ||
                Boolean(comment.authorEmail && comment.authorEmail.toLowerCase().includes("teacher"));

              const isAdmin =
                comment.author.includes("(Admin)") ||
                Boolean(comment.authorEmail && comment.authorEmail.toLowerCase().includes("admin"));

              return (
                <div
                  key={comment.id}
                  className={`group flex gap-3.5 p-4 sm:p-5 rounded-2xl transition-all duration-200 ${
                    isTeacher 
                      ? "bg-emerald-50/40 border border-emerald-200/90 shadow-2xs" 
                      : "bg-[#FDFDFD] hover:bg-[#F9FAFB] border border-gray-100/90"
                  }`}
                >
                  {/* Avatar */}
                  <div className="w-10 h-10 rounded-full overflow-hidden bg-white shadow-xs border border-gray-200/80 flex items-center justify-center shrink-0 mt-0.5">
                    {commentResolvedAvatar.type === "image" ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img src={commentResolvedAvatar.value} alt={comment.author} className="w-full h-full object-cover" />
                    ) : commentResolvedAvatar.type === "preset" ? (
                      <span className="text-lg select-none">{commentResolvedAvatar.value}</span>
                    ) : (
                      <span className="text-xs font-bold text-gray-700">{commentResolvedAvatar.value}</span>
                    )}
                  </div>

                  {/* Comment Body */}
                  <div className="flex-1 min-w-0">
                    {/* Author Meta Row */}
                    <div className="flex items-center justify-between gap-2 mb-1.5 flex-wrap">
                      <div className="flex items-center gap-2 min-w-0 flex-wrap">
                        <span className="font-bold text-sm text-gray-900 truncate">
                          {comment.author}
                        </span>

                        {isTeacher ? (
                          <span className="text-[10px] sm:text-[11px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-md border border-emerald-200 shrink-0 flex items-center gap-1 shadow-2xs">
                            <GraduationCap className="w-3 h-3 text-emerald-700" />
                            <span>คุณครูผู้สอน</span>
                          </span>
                        ) : isAdmin ? (
                          <span className="text-[10px] bg-red-100 text-red-700 font-bold px-2 py-0.5 rounded-md shrink-0 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-red-600" />
                            <span>ผู้ดูแลระบบ</span>
                          </span>
                        ) : null}
                      </div>

                      <div className="flex items-center gap-3 shrink-0">
                        <span className="text-[11px] text-gray-400 font-light">
                          {formatCommentTime(comment.time || comment.createdAt)}
                        </span>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() => handleDelete(comment.id)}
                            className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-600 transition-opacity p-1 rounded-lg cursor-pointer"
                            title="ลบความคิดเห็นนี้"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Text Message */}
                    <p className="text-xs sm:text-[13.5px] text-gray-700 leading-relaxed whitespace-pre-wrap mb-3 font-normal">
                      {comment.text}
                    </p>

                    {/* Comment Footer: Like and Reply */}
                    <div className="flex items-center gap-3 pt-1 text-xs">
                      {/* Like Button */}
                      <button
                        type="button"
                        onClick={() => handleToggleLike(comment.id)}
                        className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg transition-all text-xs font-semibold cursor-pointer active:scale-90 ${
                          isLiked
                            ? "bg-rose-50 text-rose-600 border border-rose-100"
                            : "bg-gray-100/60 hover:bg-gray-200/60 text-gray-500"
                        }`}
                        title="กดถูกใจข้อความนี้"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                        <span>{likesCount > 0 ? likesCount : "ถูกใจ"}</span>
                      </button>

                      {/* Reply Button with Quote */}
                      <button
                        type="button"
                        onClick={() => handleReplyClick(comment.author, comment.text)}
                        className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-gray-100/60 hover:bg-orange-50 hover:text-orange-600 text-gray-500 text-xs font-semibold transition-colors cursor-pointer"
                        title="อ้างอิงและตอบกลับความคิดเห็นนี้"
                      >
                        <Reply className="w-3.5 h-3.5" />
                        <span>ตอบกลับ</span>
                      </button>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </div>
  );
}
