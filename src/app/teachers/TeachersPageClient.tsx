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
  Compass
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
      <main className="flex-1 flex flex-col pt-20 sm:pt-24 min-h-screen bg-white text-gray-800 relative selection:bg-red-500 selection:text-white">
        
        {/* Subtle Ambient Studio Lighting Blobs */}
        <div className="absolute top-10 left-1/2 -translate-x-1/2 w-[700px] h-[350px] bg-gradient-to-b from-red-100/40 via-orange-100/20 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-40 right-[-10%] w-[400px] h-[400px] bg-amber-100/30 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-60 left-[-10%] w-[450px] h-[450px] bg-rose-100/30 rounded-full blur-3xl pointer-events-none" />

        {/* Admin Preview Notice Bar */}
        {!isTeachersEnabled && isAdmin && (
          <div className="bg-amber-500/10 backdrop-blur-md border-b border-amber-300 py-2 px-4 text-amber-950 sticky top-16 sm:top-20 z-30 shadow-2xs">
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
                className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-all shadow-xs whitespace-nowrap"
              >
                ไปที่หน้าหลังบ้าน (Admin)
              </Link>
            </div>
          </div>
        )}

        {/* MODERN HERO HEADER */}
        <section className="pt-4 sm:pt-8 pb-4 sm:pb-8 relative z-10">
          <div className="container mx-auto px-3.5 sm:px-6 max-w-5xl text-center">
            
            {/* Top School Pill Badge */}
            <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/90 backdrop-blur-md border border-red-100 shadow-2xs text-red-700 text-[11px] sm:text-sm font-semibold mb-2.5 sm:mb-4">
              <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse"></span>
              <span>กลุ่มสาระการเรียนรู้ศิลปะ • โรงเรียนวชิรธรรมสาธิต</span>
            </div>

            {/* Main Page Title: Teacher Profile & Awards */}
            <h1 className="text-2xl sm:text-5xl lg:text-6xl font-black font-heading text-gray-900 tracking-tight leading-tight mb-1.5 sm:mb-3">
              Teacher Profile{" "}
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-500 to-amber-500">
                &amp; Awards
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xs sm:text-base text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-4 sm:mb-8">
              ประวัติ ผลงานทางวิชาการ รางวัลเกียรติยศ และนวัตกรรมการสอนของ{" "}
              <strong className="font-semibold text-gray-900">{teacher.name || "นางสาวสีวลี ยืนยาว (ครูเก๋)"}</strong>
            </p>

            {/* Modern Floating Capsule Navigation Pills */}
            <div className="inline-flex items-center justify-center p-1.5 rounded-2xl sm:rounded-full bg-white/80 backdrop-blur-xl border border-gray-200/80 shadow-sm gap-1 sm:gap-1.5 flex-wrap max-w-full">
              <button
                type="button"
                onClick={() => scrollToSection("overview")}
                className={`px-3.5 sm:px-4 py-1.5 sm:py-2 rounded-xl sm:rounded-full text-xs sm:text-sm font-medium transition-all cursor-pointer flex items-center gap-1.5 ${
                  activeSection === "overview"
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
                    ? "bg-gradient-to-r from-red-600 to-rose-600 text-white font-bold shadow-md shadow-red-500/25 scale-[1.02]"
                    : "text-gray-700 hover:text-red-600 hover:bg-red-50/70"
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
        </section>

        {/* MAIN PROFILE CARD: Luxury Studio Glass Card */}
        <section id="overview" className="py-2 sm:py-8 relative z-10">
          <div className="container mx-auto px-3.5 sm:px-6 max-w-5xl">
            <div className="relative bg-white/95 backdrop-blur-xl rounded-3xl p-4 sm:p-10 border border-gray-200/80 shadow-xl shadow-red-950/5 overflow-hidden">
              
              {/* Decorative Subtle Corner Aura */}
              <div className="absolute top-0 right-0 w-80 h-80 bg-gradient-to-bl from-red-100/50 via-orange-100/20 to-transparent rounded-full blur-2xl pointer-events-none" />

              <div className="relative z-10 flex flex-col lg:flex-row gap-6 sm:gap-8 lg:gap-12 items-center lg:items-start">
                
                {/* Left: Portrait Showcase with Modern Studio Frame */}
                <div className="w-full max-w-[260px] sm:w-72 shrink-0 flex flex-col items-center text-center">
                  
                  {/* Portrait Box with Double Ring Frame */}
                  <div className="relative w-full aspect-[3/4] rounded-2xl overflow-hidden border border-gray-200/80 bg-gradient-to-b from-gray-900 to-gray-950 shadow-md ring-4 ring-red-50/80 flex items-center justify-center group/portrait">
                    {teacher.imageUrl ? (
                      <>
                        {/* Ambient blurred backdrop for seamless fill */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={teacher.imageUrl}
                          alt=""
                          className="absolute inset-0 w-full h-full object-cover blur-lg opacity-40 scale-110 pointer-events-none"
                        />
                        {/* Uncropped True-Size Portrait Image */}
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={teacher.imageUrl}
                          alt={teacher.name}
                          className="relative z-10 max-h-full max-w-full object-contain mx-auto rounded-xl shadow-xs transition-transform duration-500 group-hover/portrait:scale-[1.02]"
                        />
                      </>
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400 bg-gray-100">
                        <Palette className="w-12 h-12 mb-2 text-gray-300" />
                        <span className="text-xs font-medium">ภาพถ่ายครูผู้สอน</span>
                      </div>
                    )}

                    {/* Modern Shimmering Position Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold bg-gradient-to-r from-red-600 to-rose-600 text-white shadow-md shadow-red-900/30 border border-white/20">
                        <Star className="w-3 h-3 text-amber-300 fill-amber-300" />
                        <span>{teacher.position || "ครูชำนาญการ"}</span>
                      </span>
                    </div>

                    {/* Official Verified Emblem Accent */}
                    <div className="absolute bottom-3 right-3 z-20">
                      <div className="w-7 h-7 rounded-full bg-white/90 backdrop-blur-md text-red-600 flex items-center justify-center shadow-xs border border-red-100" title="ครูผู้สอนสังกัด สพฐ.">
                        <CheckCircle2 className="w-4 h-4 text-red-600" />
                      </div>
                    </div>
                  </div>

                  {/* Interactive Contact & Location Buttons */}
                  <div className="w-64 sm:w-72 mt-3.5 space-y-2">
                    {teacher.email && (
                      <button
                        type="button"
                        onClick={handleCopyEmail}
                        className={`w-full py-2.5 px-3.5 rounded-xl border text-xs font-semibold transition-all flex items-center justify-between cursor-pointer ${
                          copiedEmail
                            ? "bg-emerald-50 text-emerald-800 border-emerald-300 shadow-2xs"
                            : "bg-white hover:bg-red-50/80 text-gray-700 hover:text-red-700 border-gray-200/90 shadow-2xs hover:border-red-200"
                        }`}
                        title="คลิกเพื่อคัดลอกอีเมล"
                      >
                        <div className="flex items-center gap-2 truncate">
                          <div className={`w-6 h-6 rounded-lg flex items-center justify-center shrink-0 ${copiedEmail ? "bg-emerald-100 text-emerald-700" : "bg-red-50 text-red-600"}`}>
                            {copiedEmail ? <Check className="w-3.5 h-3.5" /> : <Mail className="w-3.5 h-3.5" />}
                          </div>
                          <span className="truncate">{teacher.email}</span>
                        </div>
                        <span className="text-[10px] text-gray-400 font-normal shrink-0 ml-1">
                          {copiedEmail ? "คัดลอกแล้ว" : <Copy className="w-3 h-3" />}
                        </span>
                      </button>
                    )}

                    {teacher.roomLocation && (
                      <div className="w-full py-2 px-3 rounded-xl bg-gray-50/80 border border-gray-200/60 text-xs text-gray-600 flex items-center justify-center gap-1.5">
                        <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                        <span className="truncate">{teacher.roomLocation}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Right: Educator Biography & Interactive Bento Stats */}
                <div className="flex-1 w-full space-y-5 text-left">
                  
                  {/* Department & Role Badge */}
                  <div>
                    <div className="flex items-center gap-2 mb-2.5 flex-wrap">
                      <span className="px-3.5 py-1 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-200/80 shadow-2xs inline-flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-red-500" />
                        <span>{teacher.role || "กลุ่มสาระการเรียนรู้ศิลปะ"}</span>
                      </span>

                      {teacher.grades && (
                        <span className="text-xs text-gray-600 font-medium inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-slate-50 border border-slate-200/80">
                          <BookOpen className="w-3.5 h-3.5 text-slate-500" />
                          <span>ระดับชั้น: {teacher.grades}</span>
                        </span>
                      )}
                    </div>

                    {/* Teacher Name */}
                    <h2 className="text-2xl sm:text-4xl lg:text-5xl font-black font-heading text-gray-900 tracking-tight leading-tight">
                      {teacher.name}
                    </h2>
                  </div>

                  {/* 4 Rich Bento Metric Cards */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-3">
                    
                    {/* Bento 1: Education */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-violet-50/80 to-purple-50/40 border border-violet-100/90 shadow-2xs hover:border-violet-300 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-violet-700 uppercase tracking-wider">วุฒิการศึกษา</span>
                        <div className="w-6 h-6 rounded-lg bg-violet-100 text-violet-700 flex items-center justify-center shrink-0">
                          <GraduationCap className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-heading text-gray-900 block leading-tight">
                        {education.length > 0 ? education[education.length - 1].degree.replace("ศึกษาศาสตรมหาบัณฑิต", "ศษ.ม.") : "ศษ.ม."}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                        {education.length > 0 ? education[education.length - 1].institution : "ม.รามคำแหง"}
                      </span>
                    </div>

                    {/* Bento 2: Experience */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-amber-50/80 to-orange-50/40 border border-amber-100/90 shadow-2xs hover:border-amber-300 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-amber-700 uppercase tracking-wider">ประสบการณ์</span>
                        <div className="w-6 h-6 rounded-lg bg-amber-100 text-amber-700 flex items-center justify-center shrink-0">
                          <Briefcase className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-heading text-gray-900 block leading-tight">
                        10+ ปีการสอน
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                        วชิรธรรมสาธิต &amp; วัดธาตุทอง
                      </span>
                    </div>

                    {/* Bento 3: Awards */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-rose-50/80 to-red-50/40 border border-rose-100/90 shadow-2xs hover:border-rose-300 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-rose-700 uppercase tracking-wider">รางวัลเกียรติยศ</span>
                        <div className="w-6 h-6 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                          <Trophy className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-heading text-gray-900 block leading-tight">
                        {awards.length > 0 ? `${awards.length} รางวัลเชิดชู` : "2 รางวัลเชิดชู"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                        ระดับชาติ สพฐ. &amp; สพม.
                      </span>
                    </div>

                    {/* Bento 4: Creative Activities */}
                    <div className="p-3.5 rounded-2xl bg-gradient-to-br from-teal-50/80 to-emerald-50/40 border border-teal-100/90 shadow-2xs hover:border-teal-300 transition-all group">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-bold text-teal-700 uppercase tracking-wider">วิชาที่รับผิดชอบ</span>
                        <div className="w-6 h-6 rounded-lg bg-teal-100 text-teal-700 flex items-center justify-center shrink-0">
                          <Palette className="w-3.5 h-3.5" />
                        </div>
                      </div>
                      <span className="text-xs sm:text-sm font-black font-heading text-gray-900 block leading-tight">
                        สาระทัศนศิลป์
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block mt-0.5">
                        จิตรกรรม &amp; สื่อผสม
                      </span>
                    </div>
                  </div>

                  {/* Specialties Tags */}
                  {specialtiesList.length > 0 && (
                    <div className="pt-1">
                      <h3 className="text-[11px] font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Compass className="w-3.5 h-3.5 text-red-500" />
                        <span>ความเชี่ยวชาญเฉพาะทาง (Specialties)</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {specialtiesList.map((skill, i) => (
                          <span
                            key={i}
                            className="px-3 py-1 rounded-full bg-white hover:bg-red-50 text-gray-700 hover:text-red-700 border border-gray-200/90 text-xs font-medium transition-all shadow-2xs hover:scale-105"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Teaching Philosophy & Vision Quote Block */}
                  {teacher.bio && (
                    <div className="relative overflow-hidden bg-gradient-to-br from-red-50/80 via-orange-50/40 to-amber-50/20 rounded-2xl p-5 sm:p-6 border border-red-100/90 shadow-xs">
                      <Quote className="absolute top-3 right-3 w-10 h-10 text-red-200/60 pointer-events-none" />
                      <p className="relative z-10 text-xs sm:text-sm md:text-base text-gray-800 leading-relaxed font-normal italic">
                        &ldquo;{teacher.bio}&rdquo;
                      </p>
                      <div className="relative z-10 mt-3 pt-2.5 border-t border-red-200/60 flex items-center gap-2 text-xs font-semibold text-gray-600">
                        <span className="w-2 h-2 rounded-full bg-red-600"></span>
                        <span>วิสัยทัศน์การจัดการเรียนการสอนศิลปะ • {teacher.name}</span>
                      </div>
                    </div>
                  )}

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
              <div className="relative pl-6 sm:pl-8 border-l-2 border-red-200/80 space-y-6 ml-3 sm:ml-4">
                {experience.map((exp, idx) => {
                  const isCurrent = exp.period?.includes("ปัจจุบัน");
                  return (
                    <div key={exp.id || idx} className="relative">
                      {/* Node Marker */}
                      <div className={`absolute -left-[31px] sm:-left-[39px] top-2 w-4 h-4 rounded-full border-2 border-white shadow-xs ${
                        isCurrent ? "bg-red-600 ring-4 ring-red-100" : "bg-gray-400"
                      }`} />

                      <div className="bg-white rounded-3xl p-5 sm:p-6 border border-gray-200/80 hover:border-red-300 hover:shadow-lg hover:shadow-red-950/5 transition-all">
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
