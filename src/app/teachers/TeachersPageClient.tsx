"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { 
  GraduationCap, 
  Mail, 
  MapPin, 
  Palette, 
  EyeOff, 
  ShieldAlert, 
  ArrowLeft,
  Trophy,
  Briefcase,
  Image as ImageIcon,
  Calendar,
  Award,
  BookOpen,
  X,
  Maximize2,
  Check,
  School,
  Copy,
  UserCheck,
  ChevronRight,
  ChevronLeft,
  Star,
  Globe,
  FileText,
  Download,
  ExternalLink,
  Sparkles,
  Quote,
  CheckCircle2,
  Layers,
  Compass,
  Flame,
  Zap,
  Rocket,
  Heart,
  Smile,
  Users,
  Paintbrush
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface EducationItem {
  id: string;
  level: string;
  degree: string;
  major: string;
  institution: string;
  graduationYear: string;
}

interface ExperienceItem {
  id: string;
  role: string;
  workplace: string;
  period: string;
  details: string;
}

interface AwardItem {
  id: string;
  title: string;
  year: string;
  issuer: string;
  imageUrl?: string;
  images?: string[];
  coverImage?: string;
}

interface ActivityImageItem {
  id: string;
  title: string;
  date?: string;
  imageUrl: string;
}

export interface InnovationItem {
  id: string;
  title: string;
  category: string;
  year?: string;
  description: string;
  coverImageUrl?: string;
  websiteUrl?: string;
  pdfUrl?: string;
  pdfFileName?: string;
  pdfFileSize?: string;
  isPublished?: boolean;
}

interface TeacherProfile {
  id: string;
  name: string;
  role: string;
  position: string;
  grades: string;
  specialties: string;
  bio: string;
  imageUrl: string;
  email: string;
  roomLocation: string;
  education?: EducationItem[];
  experience?: ExperienceItem[];
  awards?: AwardItem[];
  activityImages?: ActivityImageItem[];
  innovations?: InnovationItem[];
}

interface TeachersPageClientProps {
  initialTeacher: TeacherProfile;
}

// Multi-Image Flowing Carousel Component ("ทำแบบไหลๆๆ")
function AwardPhotoCarousel({
  award,
  onOpenLightbox
}: {
  award: AwardItem;
  onOpenLightbox: (images: string[], index: number, title: string, subtitle?: string) => void;
}) {
  const rawImages = (award.images && award.images.length > 0)
    ? award.images
    : (award.imageUrl ? [award.imageUrl] : []);

  // Ensure chosen coverImage is first
  const cover = award.coverImage || award.imageUrl || rawImages[0];
  const images = cover && rawImages.includes(cover)
    ? [cover, ...rawImages.filter(img => img !== cover)]
    : rawImages;

  const [currentIndex, setCurrentIndex] = useState(0);

  if (images.length === 0) return null;

  const subtitle = award.issuer ? `หน่วยงานที่มอบ: ${award.issuer} (ปี พ.ศ. ${award.year})` : (award.year ? `ปี พ.ศ. ${award.year}` : undefined);

  // Single Image Mode (Full uncropped real-size view)
  if (images.length === 1) {
    return (
      <div 
        onClick={() => onOpenLightbox(images, 0, award.title, subtitle)}
        className="relative w-full min-h-[220px] max-h-[380px] sm:min-h-[260px] sm:max-h-[420px] rounded-2xl overflow-hidden mb-3.5 bg-gray-950 flex items-center justify-center cursor-pointer group/img border border-gray-100 shadow-sm select-none"
        title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
      >
        {/* Ambient blurred backdrop so any proportions look seamless */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
        />
        {/* Full real-size uncropped photo */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[0]}
          alt={award.title}
          className="relative z-10 max-h-[360px] sm:max-h-[400px] w-auto max-w-full object-contain mx-auto rounded-xl shadow-xs transition-transform duration-300 group-hover/img:scale-[1.02]"
        />
        <div className="absolute inset-0 bg-black/25 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-opacity z-20">
          <Maximize2 className="w-4 h-4" />
          <span>แตะเพื่อดูรูปภาพขนาดเต็ม</span>
        </div>
      </div>
    );
  }

  // Multi-Image Carousel Mode
  return (
    <div className="mb-3.5 select-none">
      {/* Carousel Main Frame */}
      <div className="relative w-full min-h-[230px] max-h-[390px] sm:min-h-[270px] sm:max-h-[430px] rounded-2xl overflow-hidden bg-gray-950 flex items-center justify-center group/caro border border-gray-100 shadow-sm">
        {/* Ambient blurred backdrop */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={images[currentIndex]}
          alt=""
          className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none transition-all duration-500"
        />

        {/* Current Image (Uncropped full view) */}
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          key={currentIndex}
          src={images[currentIndex]}
          alt={`${award.title} - ${currentIndex + 1}`}
          onClick={() => onOpenLightbox(images, currentIndex, award.title, subtitle)}
          className="relative z-10 max-h-[370px] sm:max-h-[410px] w-auto max-w-full object-contain mx-auto rounded-xl shadow-xs cursor-pointer animate-in fade-in duration-300"
          title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
        />

        {/* Previous Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev - 1 + images.length) % images.length);
          }}
          className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover/caro:opacity-100 hover:scale-105 active:scale-95 border border-white/20 z-20"
          aria-label="รูปภาพก่อนหน้า"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>

        {/* Next Button */}
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            setCurrentIndex((prev) => (prev + 1) % images.length);
          }}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer opacity-90 sm:opacity-0 sm:group-hover/caro:opacity-100 hover:scale-105 active:scale-95 border border-white/20 z-20"
          aria-label="รูปภาพถัดไป"
        >
          <ChevronRight className="w-4 h-4" />
        </button>

        {/* Counter Badge */}
        <div className="absolute bottom-2.5 right-2.5 z-20 px-2.5 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-white text-[10px] font-mono font-bold border border-white/20 flex items-center gap-1">
          <ImageIcon className="w-3 h-3 text-amber-400" />
          <span>{currentIndex + 1} / {images.length}</span>
        </div>

        {/* Tap to expand hint */}
        <div 
          onClick={() => onOpenLightbox(images, currentIndex, award.title, subtitle)}
          className="absolute top-2.5 right-2.5 z-20 px-2 py-0.5 rounded-full bg-black/60 hover:bg-black/85 text-white text-[10px] font-medium backdrop-blur-md border border-white/20 flex items-center gap-1 cursor-pointer"
        >
          <Maximize2 className="w-3 h-3" />
          <span className="hidden sm:inline">ขยาย</span>
        </div>
      </div>

      {/* Flowing Thumbnail Strip */}
      <div className="flex items-center gap-1.5 mt-2 overflow-x-auto pb-1 scrollbar-thin">
        {images.map((img, idx) => (
          <button
            key={idx}
            type="button"
            onClick={() => setCurrentIndex(idx)}
            className={`relative shrink-0 w-12 h-12 rounded-lg overflow-hidden border-2 bg-gray-900 transition-all cursor-pointer ${
              currentIndex === idx
                ? "border-red-500 scale-105 shadow-xs opacity-100 ring-2 ring-red-400/40"
                : "border-transparent opacity-60 hover:opacity-100"
            }`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={img} alt={`thumb-${idx}`} className="w-full h-full object-contain" />
            {idx === 0 && (
              <span className="absolute bottom-0 inset-x-0 bg-amber-500/90 text-white text-[8px] font-bold text-center leading-tight">
                ปก
              </span>
            )}
          </button>
        ))}
      </div>
    </div>
  );
}

export default function TeachersPageClient({ initialTeacher }: TeachersPageClientProps) {
  const [teacher, setTeacher] = useState<TeacherProfile>(initialTeacher);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Multi-Image Lightbox Modal
  const [lightboxData, setLightboxData] = useState<{
    images: string[];
    currentIndex: number;
    title: string;
    subtitle?: string;
  } | null>(null);

  const handleOpenLightbox = (images: string[], index: number, title: string, subtitle?: string) => {
    setLightboxData({ images, currentIndex: index, title, subtitle });
  };
  const [copiedEmail, setCopiedEmail] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem("artroom_role");
    if (role === "admin" || role === "teacher") {
      setIsAdmin(true);
    }

    // Check visibility status
    fetch("/api/teachers/status")
      .then((res) => res.json())
      .then((data) => {
        if (data && typeof data.enabled === "boolean") {
          setIsTeachersEnabled(data.enabled);
        } else {
          setIsTeachersEnabled(false);
        }
      })
      .catch(() => setIsTeachersEnabled(false));

    // Fetch dynamic teacher profile
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          const match = data.find((t: any) => t.id === "teacher-kae" || t.name?.includes("เก๋")) || data[0];
          setTeacher(match);
        }
      })
      .catch((err) => console.error("Failed to load teacher dynamically:", err));
  }, []);

  // Keyboard navigation for Lightbox
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxData(null);
      } else if (e.key === "ArrowLeft" && lightboxData && lightboxData.images.length > 1) {
        setLightboxData(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
        } : null);
      } else if (e.key === "ArrowRight" && lightboxData && lightboxData.images.length > 1) {
        setLightboxData(prev => prev ? {
          ...prev,
          currentIndex: (prev.currentIndex + 1) % prev.images.length
        } : null);
      }
    };
    if (lightboxData) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxData]);

  const handleCopyEmail = () => {
    if (teacher.email) {
      navigator.clipboard.writeText(teacher.email);
      setCopiedEmail(true);
      setTimeout(() => setCopiedEmail(false), 2500);
    }
  };

  const scrollToSection = (id: string) => {
    setActiveSection(id);
    const element = document.getElementById(id);
    if (element) {
      const yOffset = -110;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // If disabled and NOT admin -> Show maintenance placeholder
  if (!isTeachersEnabled && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white pt-32 pb-16 px-4 text-center">
          <div className="max-w-md w-full bg-white rounded-3xl p-8 border border-gray-100 shadow-xl shadow-red-950/5">
            <div className="w-16 h-16 bg-red-50 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-100 shadow-sm">
              <EyeOff className="w-8 h-8" />
            </div>
            <h1 className="text-xl font-bold font-heading text-gray-900 mb-2">
              ส่วนนี้ยังไม่เปิดให้บริการ
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-light">
              หน้า Teacher Profile &amp; Awards อยู่ระหว่างการปรับปรุงข้อมูลโดยผู้ดูแลระบบ
            </p>
            <Link href="/" className="inline-block w-full">
              <Button className="w-full bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white rounded-xl py-3 font-medium transition-all shadow-md shadow-red-500/20 border-0">
                <ArrowLeft className="w-4 h-4 mr-2" />
                <span>กลับสู่หน้าแรก</span>
              </Button>
            </Link>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  const education = teacher.education || [];
  const experience = teacher.experience || [];
  const awards = teacher.awards || [];
  const activityImages = teacher.activityImages || [];
  const rawInnovations = teacher.innovations || [];
  const displayedInnovations = isAdmin
    ? rawInnovations
    : rawInnovations.filter((i) => i.isPublished !== false);
  const specialtiesList = teacher.specialties 
    ? teacher.specialties.split(/[,،]+/).map(s => s.trim()).filter(Boolean) 
    : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 min-h-screen bg-slate-50/60 text-gray-800 relative selection:bg-orange-500 selection:text-white overflow-hidden">
        
        {/* Dynamic Studio Grid & Light Aura Background */}
        <div className="absolute inset-0 bg-[radial-gradient(#f97316_0.75px,transparent_0.75px)] [background-size:24px_24px] opacity-[0.12] pointer-events-none" />
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[750px] h-[380px] bg-gradient-to-b from-orange-200/40 via-rose-100/30 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-48 right-[-8%] w-[450px] h-[450px] bg-amber-200/30 rounded-full blur-3xl pointer-events-none animate-pulse" />
        <div className="absolute top-72 left-[-8%] w-[480px] h-[480px] bg-rose-200/30 rounded-full blur-3xl pointer-events-none" />

        {/* Admin Preview Notice Bar */}
        {!isTeachersEnabled && isAdmin && (
          <div className="bg-amber-500/15 backdrop-blur-md border-b border-amber-300 py-2.5 px-4 text-amber-950 sticky top-16 sm:top-20 z-30 shadow-xs">
            <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>โหมดพรีวิวสำหรับผู้ดูแลระบบ:</strong> หน้านี้ยังถูกซ่อนอยู่สำหรับบุคคลทั่วไป สามารถเปิดแสดงผลได้ที่{" "}
                  <Link href="/admin" className="underline font-bold hover:text-amber-900">
                    ระบบหลังบ้าน
                  </Link>
                </span>
              </div>
              <Link 
                href="/admin" 
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-xl transition-all shadow-xs whitespace-nowrap"
              >
                ไปที่หน้าหลังบ้าน (Admin)
              </Link>
            </div>
          </div>
        )}

        {/* ULTRA-COOL HERO HEADER WITH CARTOON MASCOT */}
        <section className="pt-4 sm:pt-8 pb-4 sm:pb-8 relative z-10">
          <div className="container mx-auto px-3.5 sm:px-6 max-w-5xl">
            
            {/* Top Pill Badges Row */}
            <div className="flex items-center justify-center gap-2 flex-wrap mb-3 sm:mb-4">
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-white/95 backdrop-blur-md border border-emerald-200/80 shadow-xs text-[#164e3f] text-[11px] sm:text-xs font-bold">
                <span className="w-2 h-2 rounded-full bg-[#164e3f] animate-ping"></span>
                <span>กลุ่มสาระการเรียนรู้ศิลปะ • โรงเรียนวชิรธรรมสาธิต</span>
              </div>
              <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-[#164e3f] text-white text-[11px] sm:text-xs font-bold tracking-wide shadow-xs">
                <Palette className="w-3.5 h-3.5 text-emerald-200" />
                <span>ART TEACHER PORTFOLIO</span>
              </div>
            </div>

            {/* Main Page Title */}
            <h1 className="text-center text-3xl sm:text-5xl lg:text-6xl font-black font-heading text-gray-900 tracking-tight leading-tight mb-2 sm:mb-3">
              Teacher Profile{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#164e3f] via-emerald-700 to-[#749f81]">
                &amp; Awards
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-center text-xs sm:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-6 sm:mb-8">
              ประวัติ ผลงานทางวิชาการ รางวัลเกียรติยศ และนวัตกรรมการสอนของ{" "}
              <strong className="font-bold text-gray-900 underline decoration-[#749f81] decoration-2 underline-offset-4">
                {teacher.name || "นางสาวสีวลี ยืนยาว (ครูเก๋)"}
              </strong>
            </p>

            {/* FEATURED: COOL 3D CHIBI CARTOON ART MASCOT BANNER */}
            <div className="mb-8 relative overflow-hidden rounded-3xl bg-gradient-to-r from-orange-500/10 via-amber-500/10 to-rose-500/10 border-2 border-orange-300/60 p-4 sm:p-6 backdrop-blur-xl shadow-lg shadow-orange-500/5 group hover:border-orange-400 transition-all">
              
              {/* Decorative Background Glow */}
              <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-orange-400/20 rounded-full blur-2xl pointer-events-none" />
              <div className="absolute -left-10 -top-10 w-48 h-48 bg-rose-400/20 rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col md:flex-row items-center gap-5 sm:gap-7">
                
                {/* 3D Chibi Mascot Character */}
                <div className="relative shrink-0 flex items-center justify-center">
                  <div className="relative w-32 h-32 sm:w-40 sm:h-40 rounded-3xl overflow-hidden bg-gradient-to-b from-white to-orange-50/80 p-1.5 border-2 border-white shadow-xl shadow-orange-500/15 group-hover:scale-105 transition-transform duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src="/images/cool-teacher-mascot.png"
                      alt="Art Room Teacher Mascot"
                      className="w-full h-full object-cover rounded-2xl"
                    />
                    <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/70 backdrop-blur-md text-amber-300 text-[9px] font-black border border-white/20 flex items-center gap-1 shadow-sm">
                      <Sparkles className="w-2.5 h-2.5" />
                      <span>MASCOT</span>
                    </div>
                  </div>

                  {/* Little floating palette sticker */}
                  <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-2xl bg-white border border-orange-200 shadow-md flex items-center justify-center text-lg rotate-12 group-hover:rotate-0 transition-transform">
                    🎨
                  </div>
                </div>

                {/* Mascot Speech Bubble & Content */}
                <div className="flex-1 text-center md:text-left space-y-2.5">
                  <div className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full bg-orange-100 text-orange-800 text-[11px] font-bold border border-orange-200">
                    <Smile className="w-3.5 h-3.5 text-orange-600" />
                    <span>สวัสดีเด็กๆ และผู้เยี่ยมชมทุกท่าน!</span>
                  </div>

                  <div className="relative bg-white/90 backdrop-blur-md rounded-2xl p-3.5 sm:p-4 border border-orange-200/80 shadow-xs">
                    <p className="text-xs sm:text-sm md:text-base font-bold text-gray-800 leading-relaxed font-kanit">
                      &ldquo;ยินดีต้อนรับสู่ <span className="text-orange-600 font-black">ART ROOM สตูดิโอ!</span> ห้องเรียนศิลปะที่ทุกคนจะได้ปลดปล่อยพลังจินตนาการ ระเบิดไอเดียสร้างสรรค์ และสร้างผลงานสุดเจ๋งไปพร้อมกับครูเก๋นะคะ ✨&rdquo;
                    </p>
                  </div>

                  {/* Cool Interactive Action Tags */}
                  <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap pt-1 text-[11px]">
                    <span className="px-3 py-1 rounded-xl bg-white border border-gray-200/80 text-gray-700 font-semibold shadow-2xs flex items-center gap-1.5">
                      <Palette className="w-3.5 h-3.5 text-orange-500" />
                      <span>จิตรกรรม &amp; สื่อผสม</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white border border-gray-200/80 text-gray-700 font-semibold shadow-2xs flex items-center gap-1.5">
                      <Trophy className="w-3.5 h-3.5 text-amber-500" />
                      <span>รางวัลระดับชาติ สพฐ.</span>
                    </span>
                    <span className="px-3 py-1 rounded-xl bg-white border border-gray-200/80 text-gray-700 font-semibold shadow-2xs flex items-center gap-1.5">
                      <Rocket className="w-3.5 h-3.5 text-rose-500" />
                      <span>นวัตกรรมการสอนออนไลน์</span>
                    </span>
                  </div>
                </div>

              </div>
            </div>

            {/* Modern Floating Capsule Navigation Pills */}
            <div className="flex justify-center">
              <div className="inline-flex items-center justify-center p-1.5 rounded-2xl sm:rounded-full bg-white/95 backdrop-blur-xl border border-gray-200/90 shadow-md gap-1 sm:gap-1.5 flex-wrap max-w-full">
                <button
                  type="button"
                  onClick={() => scrollToSection("overview")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "overview"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <UserCheck className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>โปรไฟล์ครู</span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("education")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "education"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <GraduationCap className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>การศึกษา</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                    activeSection === "education" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {education.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("experience")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "experience"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <Briefcase className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>ประสบการณ์</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                    activeSection === "experience" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {experience.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("awards")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "awards"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <Trophy className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>รางวัล &amp; เกียรติยศ</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                    activeSection === "awards" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {awards.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("innovations")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "innovations"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>สื่อนวัตกรรม</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                    activeSection === "innovations" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {displayedInnovations.length}
                  </span>
                </button>

                <button
                  type="button"
                  onClick={() => scrollToSection("gallery")}
                  className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                    activeSection === "gallery"
                      ? "bg-[#164e3f] text-white font-bold shadow-md shadow-[#164e3f]/25 scale-[1.02]"
                      : "text-gray-700 hover:text-[#164e3f] hover:bg-emerald-50"
                  }`}
                >
                  <ImageIcon className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
                  <span>ภาพกิจกรรม</span>
                  <span className={`text-[10px] sm:text-xs px-1.5 py-0.2 rounded-full font-mono ${
                    activeSection === "gallery" ? "bg-white/25 text-white" : "bg-gray-100 text-gray-600"
                  }`}>
                    {activityImages.length}
                  </span>
                </button>
              </div>
            </div>

          </div>
        </section>

        {/* MAIN PROFILE CARD: REPLICATED EXACTLY FROM KRU KAE'S ART TEACHER PORTFOLIO POSTER */}
        <section id="overview" className="py-4 sm:py-8 relative z-10">
          <div className="container mx-auto px-3 sm:px-6 max-w-4xl">
            
            {/* Top Toolbar: View Original High-Res Poster & Status */}
            <div className="flex items-center justify-between mb-3 px-1 sm:px-2 flex-wrap gap-2">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-[#164e3f] animate-pulse"></span>
                <span className="text-xs sm:text-sm font-bold text-[#164e3f]">
                  Art Teacher Portfolio • โรงเรียนวชิรธรรมสาธิต
                </span>
              </div>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => onOpenLightbox(
                    ["/images/teacher-poster-2x.png"],
                    0,
                    "Art Teacher Portfolio • ครูเก๋ (นางสาวสีวลี ยืนยาว)",
                    "โปสเตอร์ประวัติส่วนตัว กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต"
                  )}
                  className="px-3.5 py-1.5 rounded-full bg-[#164e3f] hover:bg-[#113d31] text-white text-xs font-bold transition-all shadow-sm flex items-center gap-1.5 cursor-pointer hover:scale-105 active:scale-95"
                >
                  <Maximize2 className="w-3.5 h-3.5 text-emerald-200" />
                  <span>ดูโปสเตอร์ต้นฉบับเต็มจอ</span>
                </button>
              </div>
            </div>

            {/* THE EXACT POSTER CANVAS */}
            <div className="relative bg-[#faf8f4] rounded-[32px] sm:rounded-[44px] p-3 sm:p-6 shadow-2xl border-4 border-[#164e3f]/25 overflow-hidden transition-all group/poster">
              
              {/* Inner Poster Card */}
              <div className="relative bg-[#f5f1e8] rounded-[24px] sm:rounded-[36px] overflow-hidden border border-[#ded8c9] shadow-inner">
                
                {/* 1. Header Banner with Art Studio & Kru Kae */}
                <div className="relative w-full h-44 sm:h-64 bg-slate-900 overflow-hidden">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src="/images/poster-header-art-studio-2x.png"
                    alt="Art Studio Classroom - Kru Kae"
                    className="w-full h-full object-cover object-center filter saturate-105"
                  />
                  {/* Soft ambient overlay */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/30 pointer-events-none" />

                  {/* Top-Right Forest Green Badge: "ประวัติส่วนตัว PROFILE" */}
                  <div className="absolute top-0 right-0 bg-[#164e3f] text-white px-5 sm:px-8 py-2.5 sm:py-3.5 rounded-bl-3xl sm:rounded-bl-4xl shadow-xl text-center z-20 border-l border-b border-emerald-800/40">
                    <div className="font-kanit font-black text-sm sm:text-lg tracking-wide leading-tight text-white drop-shadow-sm">
                      ประวัติส่วนตัว
                    </div>
                    <div className="text-[10px] sm:text-xs font-mono font-bold tracking-[0.25em] text-emerald-200 uppercase mt-0.5">
                      PROFILE
                    </div>
                  </div>

                  {/* White Cursive Script: "Art Teacher Portfolio" */}
                  <div 
                    className="absolute right-4 sm:right-8 bottom-3 sm:bottom-4 text-white text-xl sm:text-3xl font-bold tracking-wide drop-shadow-[0_2px_8px_rgba(0,0,0,0.9)] z-20 select-none pointer-events-none"
                    style={{ fontFamily: "'Dancing Script', 'Brush Script MT', 'Caveat', cursive, sans-serif" }}
                  >
                    Art Teacher Portfolio
                  </div>
                </div>

                {/* 2. Middle Row: Circular Teacher Portrait & Bold Quote */}
                <div className="relative -mt-16 sm:-mt-24 px-4 sm:px-8 flex flex-col sm:flex-row items-center sm:items-end gap-4 sm:gap-7 z-20">
                  
                  {/* Circular Portrait Frame with White Border, Accent Dots & Curved Arrow */}
                  <div className="relative shrink-0">
                    
                    {/* Curved White Arrow SVG */}
                    <svg
                      className="absolute -top-6 -right-4 sm:-top-8 sm:-right-6 w-12 h-12 sm:w-16 sm:h-16 text-white pointer-events-none drop-shadow-[0_2px_4px_rgba(0,0,0,0.45)] z-30"
                      viewBox="0 0 100 100"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    >
                      <path d="M 85 15 C 65 5, 28 15, 20 60" />
                      <path d="M 10 48 L 20 62 L 32 54" />
                    </svg>

                    {/* Decorative Sage Green Accent Dots */}
                    <div className="absolute -top-1 -right-1 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#749f81] border-2 border-white shadow-xs z-30" />
                    <div className="absolute top-1/2 -right-3 w-4 h-4 sm:w-4.5 sm:h-4.5 rounded-full bg-[#749f81] border-2 border-white shadow-xs z-30" />
                    <div className="absolute bottom-2 -left-2 w-3.5 h-3.5 sm:w-4 sm:h-4 rounded-full bg-[#749f81] border-2 border-white shadow-xs z-30" />

                    {/* Circular Portrait */}
                    <div className="w-36 h-36 sm:w-48 sm:h-48 rounded-full border-4 sm:border-[5px] border-white shadow-2xl overflow-hidden bg-gradient-to-b from-[#e3e8e1] to-[#cbd7c9]">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src="/uploads/1788262758554-___________.png"
                        alt={teacher.name}
                        className="w-full h-full object-cover object-top hover:scale-105 transition-transform duration-300"
                      />
                    </div>
                  </div>

                  {/* Dark Forest Green Quote */}
                  <div className="flex-1 text-center sm:text-left pb-1 sm:pb-3 sm:pr-4">
                    <h2 className="text-[#164e3f] font-kanit font-black text-xl sm:text-3xl lg:text-4xl leading-tight tracking-tight drop-shadow-xs">
                      “ศิลปะสร้างแรงบันดาลใจ<br />
                      <span className="sm:inline-block sm:pl-3">ให้ทุกความคิดเติบโต ”</span>
                    </h2>
                  </div>
                </div>

                {/* 3. Main Sage Green Card */}
                <div className="bg-[#749f81] rounded-[24px] sm:rounded-[36px] p-5 sm:p-9 text-white shadow-xl mt-5 sm:mt-7 mx-2 sm:mx-6 mb-4 sm:mb-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-10 relative">
                    
                    {/* Vertical Divider (Desktop) */}
                    <div className="hidden md:block absolute left-1/2 top-2 bottom-2 w-px bg-white/30 -translate-x-1/2 pointer-events-none" />

                    {/* Left Column: ข้อมูลส่วนตัว & ความเชี่ยวชาญ */}
                    <div className="space-y-6">
                      
                      {/* ข้อมูลส่วนตัว */}
                      <div>
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-white text-[#164e3f] text-xs sm:text-sm font-bold shadow-xs mb-3.5 font-kanit">
                          ข้อมูลส่วนตัว
                        </div>
                        <div className="space-y-2 text-xs sm:text-sm font-medium text-white/95 pl-1">
                          <div className="flex items-start">
                            <span className="w-20 shrink-0 font-bold text-white">ชื่อ</span>
                            <span className="font-semibold">{teacher.name || "นางสาวสีวลี ยืนยาว"}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-20 shrink-0 font-bold text-white">ชื่อเล่น</span>
                            <span className="font-semibold">ครูเก๋</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-20 shrink-0 font-bold text-white">ตำแหน่ง</span>
                            <span className="font-semibold">{teacher.role || "ครู กลุ่มสาระการเรียนรู้ศิลปะ"}</span>
                          </div>
                          <div className="flex items-start">
                            <span className="w-20 shrink-0 font-bold text-white">โรงเรียน</span>
                            <span className="font-semibold">โรงเรียนวชิรธรรมสาธิต</span>
                          </div>
                        </div>
                      </div>

                      {/* ความเชี่ยวชาญ */}
                      <div>
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-white text-[#164e3f] text-xs sm:text-sm font-bold shadow-xs mb-3.5 font-kanit">
                          ความเชี่ยวชาญ
                        </div>
                        <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-white/95 pl-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <Palette className="w-4 h-4" />
                            </div>
                            <span>ทัศนศิลป์</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <Paintbrush className="w-4 h-4" />
                            </div>
                            <span>จิตรกรรมสีน้ำและสีน้ำมัน</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <Layers className="w-4 h-4" />
                            </div>
                            <span>การสร้างสรรค์สื่อผสม</span>
                          </div>
                        </div>
                      </div>

                    </div>

                    {/* Right Column: การสอน & ข้อมูลติดต่อ */}
                    <div className="space-y-6 flex flex-col justify-between">
                      
                      {/* การสอน */}
                      <div>
                        <div className="inline-flex items-center px-4 py-1 rounded-full bg-white text-[#164e3f] text-xs sm:text-sm font-bold shadow-xs mb-3.5 font-kanit">
                          การสอน
                        </div>
                        <div className="space-y-2.5 text-xs sm:text-sm font-semibold text-white/95 pl-1">
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <Users className="w-4 h-4" />
                            </div>
                            <span>มัธยมศึกษาปีที่ 3 และ 6</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <BookOpen className="w-4 h-4" />
                            </div>
                            <span>ประสบการณ์สอน 10+ ปี</span>
                          </div>
                          <div className="flex items-center gap-3">
                            <div className="w-8 h-8 rounded-full bg-white text-[#164e3f] flex items-center justify-center shrink-0 shadow-xs">
                              <School className="w-4 h-4" />
                            </div>
                            <div>
                              <div>ห้องปฏิบัติการศิลปะ: 126</div>
                              <div className="text-[11px] text-white/80 font-normal">(อาคาร 1 ชั้น 2)</div>
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* ข้อมูลติดต่อ (White Card) */}
                      <div className="bg-white rounded-2xl p-4 sm:p-5 text-[#164e3f] shadow-md">
                        <div className="inline-flex items-center px-3 py-0.5 rounded-full bg-[#749f81] text-white text-[11px] font-bold mb-2.5 font-kanit">
                          ข้อมูลติดต่อ
                        </div>
                        <div className="flex items-center justify-between gap-2">
                          <div className="flex items-center gap-2.5 min-w-0">
                            <div className="w-8 h-8 rounded-full bg-[#164e3f] text-white flex items-center justify-center shrink-0 shadow-xs">
                              <Mail className="w-4 h-4" />
                            </div>
                            <a
                              href={`mailto:${teacher.email || "krusiwalee@gmail.com"}`}
                              className="text-xs sm:text-sm font-bold text-[#164e3f] hover:underline truncate"
                              title="คลิกเพื่อส่งอีเมลหาครูเก๋"
                            >
                              {teacher.email || "krusiwalee@gmail.com"}
                            </a>
                          </div>
                          <button
                            type="button"
                            onClick={handleCopyEmail}
                            className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-all shrink-0 flex items-center gap-1 cursor-pointer border ${
                              copiedEmail
                                ? "bg-emerald-100 text-emerald-800 border-emerald-300"
                                : "bg-gray-100 hover:bg-gray-200 text-gray-700 border-gray-200"
                            }`}
                            title="คัดลอกอีเมล"
                          >
                            {copiedEmail ? <Check className="w-3 h-3 text-emerald-700" /> : <Copy className="w-3 h-3" />}
                            <span>{copiedEmail ? "คัดลอกแล้ว" : "คัดลอก"}</span>
                          </button>
                        </div>
                      </div>

                    </div>

                  </div>
                </div>

                {/* 4. Footer Accent */}
                <div className="relative py-4 text-center">
                  <div className="text-[#749f81] font-semibold text-xs sm:text-sm tracking-widest font-kanit">
                    —— ART ROOM • ครูเก๋ ——
                  </div>
                  {/* Dark forest green corner accents */}
                  <div className="absolute bottom-0 right-0 w-8 h-8 bg-[#164e3f] rounded-tl-2xl pointer-events-none opacity-90" />
                  <div className="absolute bottom-0 left-0 w-8 h-8 bg-[#164e3f] rounded-tr-2xl pointer-events-none opacity-90" />
                </div>

              </div>
            </div>

          </div>
        </section>

        {/* CONTAINER FOR SECTIONS: Education, Experience, Awards, Innovations, Gallery */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl pb-24 space-y-14 relative z-10">
          
          {/* SECTION 1: ประวัติการศึกษา (Education History) */}
          <section id="education" className="scroll-mt-28 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-violet-500 to-indigo-600 text-white flex items-center justify-center shadow-md shadow-violet-500/20 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 leading-tight">
                    ประวัติการศึกษา <span className="text-sm sm:text-base font-normal text-gray-500 font-sans">(Education)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light">
                    คุณวุฒิทางการศึกษา สาขาวิชา สถาบัน และปีที่สำเร็จการศึกษา
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {education.length} วุฒิ
              </span>
            </div>

            {education.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลประวัติการศึกษา
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {education.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-6 rounded-3xl bg-white border border-gray-200/80 hover:border-violet-300 hover:shadow-lg hover:shadow-violet-950/5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full text-xs font-bold bg-violet-50 text-violet-700 border border-violet-100">
                          {edu.level || "วุฒิการศึกษา"}
                        </span>

                        {edu.graduationYear && (
                          <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-3 py-1 rounded-full">
                            สำเร็จการศึกษา พ.ศ. {edu.graduationYear}
                          </span>
                        )}
                      </div>

                      <h4 className="text-lg font-bold font-heading text-gray-900 mb-1 group-hover:text-violet-900 transition-colors">
                        {edu.degree || edu.level}
                      </h4>

                      {edu.major && (
                        <p className="text-sm font-medium text-gray-600 mb-4">
                          {edu.major}
                        </p>
                      )}
                    </div>

                    <div className="pt-3.5 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-600">
                      <School className="w-4 h-4 text-violet-500 shrink-0" />
                      <span className="truncate font-semibold text-gray-700">{edu.institution || "ไม่ระบุสถาบัน"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: ประวัติการทำงานและประสบการณ์สอน (Teaching Experience) */}
          <section id="experience" className="scroll-mt-28 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-orange-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 leading-tight">
                    ประวัติการทำงานและประสบการณ์สอน <span className="text-sm sm:text-base font-normal text-gray-500 font-sans">(Experience)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light">
                    เส้นทางการปฏิบัติงานวิชาชีพครู และการจัดการเรียนรู้ศิลปะ
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {experience.length} ช่วงเวลา
              </span>
            </div>

            {experience.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลประวัติการทำงาน
              </div>
            ) : (
              <div className="relative pl-6 sm:pl-8 border-l-2 border-orange-300/80 space-y-6 ml-3 sm:ml-4">
                {experience.map((exp, idx) => {
                  const isCurrent = exp.period?.includes("ปัจจุบัน");
                  return (
                    <div key={exp.id || idx} className="relative">
                      {/* Node Marker */}
                      <div className={`absolute -left-[31px] sm:-left-[39px] top-2 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isCurrent ? "bg-gradient-to-r from-orange-500 to-rose-500 ring-4 ring-orange-100" : "bg-gray-400"
                      }`} />

                      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 hover:border-orange-300 hover:shadow-lg hover:shadow-orange-950/5 transition-all">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base sm:text-lg font-bold font-heading text-gray-900">
                              {exp.role}
                            </h4>
                            {isCurrent && (
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200 flex items-center gap-1">
                                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                                <span>ปัจจุบัน</span>
                              </span>
                            )}
                          </div>

                          {exp.period && (
                            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                              {exp.period}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-700 mb-2 flex items-center gap-1.5">
                          <School className="w-4 h-4 text-gray-400" />
                          <span>{exp.workplace}</span>
                        </p>

                        {exp.details && (
                          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed pt-2.5 border-t border-gray-100">
                            {exp.details}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 3: รางวัลและเกียรติประวัติ (Awards & Honors) */}
          <section id="awards" className="scroll-mt-28 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-rose-500 to-red-600 text-white flex items-center justify-center shadow-md shadow-rose-500/20 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 leading-tight">
                    รางวัลและเกียรติประวัติ <span className="text-sm sm:text-base font-normal text-gray-500 font-sans">(Awards &amp; Honors)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light">
                    ผลงานดีเด่นและรางวัลเกียรติยศ พร้อมภาพถ่ายพิธีรับรางวัล
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {awards.length} รางวัล
              </span>
            </div>

            {awards.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลรางวัลที่ได้รับ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
                {awards.map((award, idx) => (
                  <div
                    key={award.id || idx}
                    className="p-6 rounded-3xl bg-white border border-gray-200/80 hover:border-red-400 hover:shadow-lg hover:shadow-red-950/5 transition-all flex flex-col justify-between group"
                  >
                    <div>
                      {/* Photo Flowing Carousel ("ทำแบบไหลๆๆ") */}
                      <AwardPhotoCarousel award={award} onOpenLightbox={handleOpenLightbox} />

                      <div className="flex items-center justify-between gap-2 mb-2.5">
                        <span className="w-7 h-7 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0 border border-amber-100 shadow-2xs">
                          <Award className="w-4 h-4" />
                        </span>

                        {award.year && (
                          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                            ปี พ.ศ. {award.year}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-bold font-heading text-gray-900 mb-2 leading-snug group-hover:text-red-700 transition-colors">
                        {award.title}
                      </h4>
                    </div>

                    {award.issuer && (
                      <div className="pt-3.5 border-t border-gray-100 mt-3 flex items-center justify-between text-xs text-gray-600">
                        <span>หน่วยงานที่มอบ: <strong className="text-gray-900 font-semibold">{award.issuer}</strong></span>
                        <Check className="w-4 h-4 text-red-500 shrink-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 4: ผลงานนวัตกรรมการจัดการเรียนรู้และสื่อการสอน (Educational Innovations) */}
          <section id="innovations" className="scroll-mt-28 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-amber-500 to-rose-600 text-white flex items-center justify-center shadow-md shadow-amber-500/20 shrink-0">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 leading-tight">
                    นวัตกรรมทางการศึกษาและสื่อการสอน <span className="text-sm sm:text-base font-normal text-gray-500 font-sans">(Innovations)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light">
                    ผลงานนวัตกรรมการจัดการเรียนรู้ สื่อดิจิทัล แหล่งเรียนรู้ออนไลน์ และรูปเล่มรายงานฉบับเต็ม
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {displayedInnovations.length} รายการ
              </span>
            </div>

            {displayedInnovations.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลนวัตกรรมทางการศึกษาที่เผยแพร่
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {displayedInnovations.map((item, idx) => {
                  const isDraft = item.isPublished === false;
                  return (
                    <div
                      key={item.id || idx}
                      className={`bg-white rounded-3xl border p-6 flex flex-col justify-between transition-all hover:shadow-xl hover:shadow-red-950/5 relative ${
                        isDraft ? "border-amber-300 bg-amber-50/20" : "border-gray-200/80 hover:border-red-300"
                      }`}
                    >
                      <div>
                        {/* Top Category Badge & Draft Label */}
                        <div className="flex items-center justify-between gap-2 mb-3.5 flex-wrap">
                          <div className="flex items-center gap-1.5 flex-wrap">
                            <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                              {item.category || "นวัตกรรมการศึกษา"}
                            </span>
                            {item.year && (
                              <span className="text-xs font-mono font-bold text-gray-700 bg-gray-100 px-2.5 py-0.5 rounded-full">
                                พ.ศ. {item.year}
                              </span>
                            )}
                          </div>
                          {isDraft && (
                            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-amber-100 text-amber-800 border border-amber-300">
                              ⚪ ฉบับร่าง (เฉพาะผู้ดูแลระบบ)
                            </span>
                          )}
                        </div>

                        {/* Booklet Cover Image (Uncropped true-size display with ambient blur) */}
                        {item.coverImageUrl && (
                          <div
                            onClick={() =>
                              handleOpenLightbox(
                                [item.coverImageUrl!],
                                0,
                                item.title,
                                item.category ? `หมวดหมู่: ${item.category}` : undefined
                              )
                            }
                            className="relative w-full min-h-[220px] max-h-[380px] sm:min-h-[260px] sm:max-h-[420px] rounded-2xl overflow-hidden mb-4 bg-gray-950 flex items-center justify-center cursor-pointer group/img border border-gray-100 shadow-sm select-none"
                            title="คลิกเพื่อดูรูปเล่มหน้าปกขนาดเต็ม"
                          >
                            {/* Ambient blurred backdrop so any proportions look seamless */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.coverImageUrl}
                              alt=""
                              className="absolute inset-0 w-full h-full object-cover blur-md opacity-30 scale-110 pointer-events-none"
                            />
                            {/* Uncropped true-size booklet cover */}
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img
                              src={item.coverImageUrl}
                              alt={item.title}
                              className="relative z-10 max-h-[360px] sm:max-h-[400px] w-auto max-w-full object-contain mx-auto rounded-lg shadow-sm transition-transform duration-300 group-hover/img:scale-[1.02]"
                            />
                            <div className="absolute inset-0 bg-black/30 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-opacity z-20">
                              <Maximize2 className="w-4 h-4" />
                              <span>แตะดูรูปเล่มขนาดเต็ม</span>
                            </div>
                          </div>
                        )}

                        {/* Title */}
                        <h4 className="text-lg font-bold font-heading text-gray-900 mb-2 leading-snug">
                          {item.title}
                        </h4>

                        {/* Description */}
                        {item.description && (
                          <p className="text-xs sm:text-sm text-gray-600 font-light leading-relaxed whitespace-pre-line mb-4">
                            {item.description}
                          </p>
                        )}
                      </div>

                      {/* Action Links (Website & PDF Download) */}
                      {(item.websiteUrl || item.pdfUrl) && (
                        <div className="pt-4 border-t border-gray-100 mt-2 flex flex-col sm:flex-row gap-2.5">
                          {item.websiteUrl && (
                            <a
                              href={item.websiteUrl}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-700 hover:to-rose-700 text-white text-xs font-bold transition-all shadow-md shadow-red-500/20 group"
                            >
                              <Globe className="w-3.5 h-3.5 group-hover:rotate-12 transition-transform" />
                              <span>เข้าชมเว็บไซต์นวัตกรรม</span>
                              <ExternalLink className="w-3 h-3 opacity-70 ml-0.5" />
                            </a>
                          )}

                          {item.pdfUrl && (
                            <a
                              href={item.pdfUrl}
                              download={item.pdfFileName || `${item.title}.pdf`}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="flex-1 inline-flex items-center justify-center gap-1.5 px-4 py-2.5 rounded-xl bg-gray-900 hover:bg-black text-white text-xs font-bold transition-all shadow-sm group"
                            >
                              <Download className="w-3.5 h-3.5 group-hover:translate-y-0.5 transition-transform text-red-400" />
                              <div className="flex flex-col text-left leading-tight truncate">
                                <span>ดาวน์โหลดรูปเล่ม PDF</span>
                                {item.pdfFileSize && (
                                  <span className="text-[10px] font-mono text-gray-300 font-normal">
                                    {item.pdfFileSize}
                                  </span>
                                )}
                              </div>
                            </a>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </section>

          {/* SECTION 5: ภาพกิจกรรมและบรรยากาศ (Activities & Gallery) */}
          <section id="gallery" className="scroll-mt-28 space-y-5">
            <div className="flex items-center justify-between pb-3.5 border-b border-gray-200/80">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-emerald-500 to-teal-600 text-white flex items-center justify-center shadow-md shadow-emerald-500/20 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xl sm:text-2xl font-black font-heading text-gray-900 leading-tight">
                    ภาพกิจกรรมและบรรยากาศการเรียนรู้ <span className="text-sm sm:text-base font-normal text-gray-500 font-sans">(Gallery)</span>
                  </h3>
                  <p className="text-xs sm:text-sm text-gray-500 font-light">
                    ประมวลภาพบรรยากาศการจัดการเรียนการสอน เวิร์กช็อป และกิจกรรมสร้างสรรค์ผลงานศิลปะ
                  </p>
                </div>
              </div>
              <span className="text-xs font-bold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">
                {activityImages.length} รูปภาพ
              </span>
            </div>

            {activityImages.length === 0 ? (
              <div className="py-12 text-center text-gray-400 text-sm bg-white rounded-3xl border border-dashed border-gray-200">
                ยังไม่มีรูปภาพกิจกรรม
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {activityImages.map((act, idx) => (
                  <div
                    key={act.id || idx}
                    onClick={() => handleOpenLightbox([act.imageUrl], 0, act.title, act.date ? `วันที่: ${act.date}` : undefined)}
                    className="group rounded-3xl overflow-hidden bg-gray-900 relative aspect-4/3 border border-gray-200/80 hover:border-red-500 transition-all cursor-pointer flex flex-col justify-end shadow-sm hover:shadow-xl hover:shadow-red-950/10"
                  >
                    {/* Background Image */}
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={act.imageUrl}
                      alt={act.title}
                      className="absolute inset-0 w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 opacity-95"
                    />

                    {/* Gradient Overlay */}
                    <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-black/30 to-transparent" />

                    {/* Caption */}
                    <div className="relative z-10 p-5 w-full">
                      {act.date && (
                        <span className="px-2.5 py-0.5 rounded-full bg-white/20 backdrop-blur-md text-white text-[10px] font-medium border border-white/20 inline-flex items-center gap-1 mb-2">
                          <Calendar className="w-3 h-3" />
                          <span>{act.date}</span>
                        </span>
                      )}
                      <h4 className="text-sm font-bold font-heading text-white leading-snug group-hover:text-red-300 transition-colors line-clamp-2">
                        {act.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* LIGHTBOX MODAL WITH MULTI-IMAGE GLIDE SUPPORT */}
        {lightboxData && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-in fade-in duration-200"
            onClick={() => setLightboxData(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-gray-950 rounded-3xl overflow-hidden flex flex-col border border-gray-800 shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 sm:p-5 bg-gray-900 text-white border-b border-gray-800">
                <div className="min-w-0 pr-4">
                  <div className="flex items-center gap-2">
                    <h4 className="text-sm sm:text-base font-bold font-heading truncate text-white">{lightboxData.title}</h4>
                    {lightboxData.images.length > 1 && (
                      <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-mono font-bold border border-amber-500/30">
                        {lightboxData.currentIndex + 1} / {lightboxData.images.length}
                      </span>
                    )}
                  </div>
                  {lightboxData.subtitle && (
                    <p className="text-xs text-gray-400 font-light truncate mt-0.5">{lightboxData.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxData(null)}
                  className="w-9 h-9 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-all cursor-pointer shrink-0"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Modal Image with Navigation Arrows */}
              <div className="relative p-4 flex items-center justify-center min-h-[50vh] max-h-[75vh] overflow-hidden bg-black select-none">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  key={lightboxData.currentIndex}
                  src={lightboxData.images[lightboxData.currentIndex]}
                  alt={`${lightboxData.title} - ${lightboxData.currentIndex + 1}`}
                  className="max-h-[70vh] max-w-full object-contain rounded-xl animate-in fade-in duration-200"
                />

                {/* Left Arrow */}
                {lightboxData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex - 1 + prev.images.length) % prev.images.length
                      } : null);
                    }}
                    className="absolute left-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20 z-10"
                    aria-label="รูปก่อนหน้า"
                  >
                    <ChevronLeft className="w-5 h-5" />
                  </button>
                )}

                {/* Right Arrow */}
                {lightboxData.images.length > 1 && (
                  <button
                    type="button"
                    onClick={(e) => {
                      e.stopPropagation();
                      setLightboxData(prev => prev ? {
                        ...prev,
                        currentIndex: (prev.currentIndex + 1) % prev.images.length
                      } : null);
                    }}
                    className="absolute right-4 top-1/2 -translate-y-1/2 w-11 h-11 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center transition-all cursor-pointer hover:scale-105 active:scale-95 border border-white/20 z-10"
                    aria-label="รูปถัดไป"
                  >
                    <ChevronRight className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
