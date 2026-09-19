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
  ChevronRight
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
}

interface ActivityImageItem {
  id: string;
  title: string;
  date?: string;
  imageUrl: string;
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
}

interface TeachersPageClientProps {
  initialTeacher: TeacherProfile;
}

export default function TeachersPageClient({ initialTeacher }: TeachersPageClientProps) {
  const [teacher, setTeacher] = useState<TeacherProfile>(initialTeacher);
  const [isTeachersEnabled, setIsTeachersEnabled] = useState<boolean>(true);
  const [isAdmin, setIsAdmin] = useState(false);
  const [activeSection, setActiveSection] = useState<string>("overview");

  // Lightbox Modal for award & activity photos
  const [lightboxImage, setLightboxImage] = useState<{ url: string; title: string; subtitle?: string } | null>(null);
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

  // Keyboard navigation for Lightbox (Esc to close)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setLightboxImage(null);
      }
    };
    if (lightboxImage) {
      window.addEventListener("keydown", handleKeyDown);
    }
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [lightboxImage]);

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
      const yOffset = -100;
      const y = element.getBoundingClientRect().top + window.pageYOffset + yOffset;
      window.scrollTo({ top: y, behavior: "smooth" });
    }
  };

  // If disabled and NOT admin -> Show maintenance placeholder
  if (!isTeachersEnabled && !isAdmin) {
    return (
      <>
        <Navbar />
        <main className="flex-1 flex flex-col items-center justify-center min-h-screen bg-white pt-28 pb-16 px-4 text-center">
          <div className="max-w-md w-full bg-white rounded-2xl p-8 border border-gray-200">
            <div className="w-14 h-14 bg-red-50 text-red-600 rounded-xl flex items-center justify-center mx-auto mb-4 border border-red-100">
              <EyeOff className="w-7 h-7" />
            </div>
            <h1 className="text-xl font-bold font-kanit text-gray-900 mb-2">
              ส่วนนี้ยังไม่เปิดให้บริการ
            </h1>
            <p className="text-sm text-gray-600 leading-relaxed mb-6 font-light">
              หน้า Teacher Profile &amp; Awards อยู่ระหว่างการปรับปรุงข้อมูลโดยผู้ดูแลระบบ
            </p>
            <Link href="/" className="inline-block w-full">
              <Button className="w-full bg-red-600 hover:bg-red-700 text-white rounded-xl py-2.5 font-medium transition-colors border-0">
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
  const specialtiesList = teacher.specialties 
    ? teacher.specialties.split(/[,،]+/).map(s => s.trim()).filter(Boolean) 
    : [];

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-white text-gray-800">
        
        {/* Admin Preview Notice Bar */}
        {!isTeachersEnabled && isAdmin && (
          <div className="bg-amber-50 border-b border-amber-200 py-2.5 px-4 text-amber-900 sticky top-20 z-30">
            <div className="container mx-auto max-w-5xl flex flex-col sm:flex-row items-center justify-between gap-2 text-xs">
              <div className="flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
                <span>
                  <strong>โหมดพรีวิวสำหรับผู้ดูแลระบบ:</strong> หน้านี้ยังถูกซ่อนอยู่สำหรับบุคคลทั่วไป สามารถเปิดแสดงผลได้ที่{" "}
                  <Link href="/admin" className="underline font-bold hover:text-amber-950">
                    ระบบหลังบ้าน
                  </Link>
                </span>
              </div>
              <Link 
                href="/admin" 
                className="px-3 py-1 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg transition-colors whitespace-nowrap"
              >
                ไปที่หน้าหลังบ้าน (Admin)
              </Link>
            </div>
          </div>
        )}

        {/* HERO HEADER: Clean ART ROOM Red & Ink Minimal Style */}
        <section className="pt-10 pb-8 border-b border-gray-100 bg-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl text-center">
            
            {/* Top School Pill Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-red-50 border border-red-100 text-red-600 text-xs font-semibold mb-3">
              <span className="w-2 h-2 rounded-full bg-red-600"></span>
              <span>กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต</span>
            </div>

            {/* Main Page Title: Teacher Profile & Awards */}
            <h1 className="text-3xl sm:text-5xl font-black font-heading text-[#03071C] tracking-tight mb-2">
              Teacher Profile <span className="text-red-600">&amp; Awards</span>
            </h1>

            {/* Subtitle */}
            <p className="text-sm sm:text-base text-gray-500 max-w-xl mx-auto font-light leading-relaxed">
              ประวัติ ผลงานทางวิชาการ และรางวัลเกียรติยศ <strong className="font-semibold text-gray-800">{teacher.name || "นางสาวสีวลี ยืนยาว (ครูเก๋)"}</strong>
            </p>

            {/* Clean Quick Jump Navigation Pills */}
            <div className="mt-6 flex items-center justify-center gap-2 sm:gap-2.5 flex-wrap">
              <button
                type="button"
                onClick={() => scrollToSection("overview")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeSection === "overview"
                    ? "bg-red-600 text-white border-red-600 font-bold"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>โปรไฟล์ครู</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("education")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeSection === "education"
                    ? "bg-red-600 text-white border-red-600 font-bold"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
                }`}
              >
                <GraduationCap className="w-3.5 h-3.5" />
                <span>การศึกษา ({education.length})</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("experience")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeSection === "experience"
                    ? "bg-red-600 text-white border-red-600 font-bold"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" />
                <span>ประสบการณ์ ({experience.length})</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("awards")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeSection === "awards"
                    ? "bg-red-600 text-white border-red-600 font-bold"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
                }`}
              >
                <Trophy className="w-3.5 h-3.5" />
                <span>รางวัล &amp; เกียรติยศ ({awards.length})</span>
              </button>

              <button
                type="button"
                onClick={() => scrollToSection("gallery")}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold transition-colors cursor-pointer border flex items-center gap-1.5 ${
                  activeSection === "gallery"
                    ? "bg-red-600 text-white border-red-600 font-bold"
                    : "bg-white text-gray-700 hover:bg-red-50 hover:text-red-600 border-gray-200"
                }`}
              >
                <ImageIcon className="w-3.5 h-3.5" />
                <span>ภาพกิจกรรม ({activityImages.length})</span>
              </button>
            </div>
          </div>
        </section>

        {/* MAIN PROFILE CARD: Clean & Focused */}
        <section id="overview" className="py-10">
          <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
            <div className="bg-white rounded-2xl p-6 sm:p-8 border border-gray-200">
              <div className="flex flex-col lg:flex-row gap-8 lg:gap-10 items-center lg:items-start">
                
                {/* Left: Portrait Showcase */}
                <div className="w-full sm:w-64 shrink-0 flex flex-col items-center text-center">
                  
                  {/* Clean Portrait Box */}
                  <div className="relative w-56 h-72 sm:w-64 sm:h-80 rounded-2xl overflow-hidden border border-gray-200 bg-gray-100">
                    {teacher.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={teacher.imageUrl}
                        alt={teacher.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex flex-col items-center justify-center text-gray-400">
                        <Palette className="w-12 h-12 mb-2 text-gray-300" />
                        <span className="text-xs font-medium">ภาพถ่ายครูผู้สอน</span>
                      </div>
                    )}

                    {/* Position Pill */}
                    <div className="absolute top-3 left-3">
                      <span className="px-3 py-1 rounded-full text-xs font-bold bg-red-600 text-white">
                        {teacher.position || "ครูชำนาญการพิเศษ"}
                      </span>
                    </div>
                  </div>

                  {/* Clean Contact Action Button */}
                  {teacher.email && (
                    <button
                      type="button"
                      onClick={handleCopyEmail}
                      className={`mt-3.5 w-full max-w-[256px] py-2 px-3 rounded-xl border text-xs font-semibold transition-colors flex items-center justify-center gap-1.5 cursor-pointer ${
                        copiedEmail
                          ? "bg-emerald-50 text-emerald-700 border-emerald-300"
                          : "bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border-gray-200"
                      }`}
                      title="คลิกเพื่อคัดลอกอีเมล"
                    >
                      {copiedEmail ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-600" />
                          <span>คัดลอกอีเมลสำเร็จ!</span>
                        </>
                      ) : (
                        <>
                          <Mail className="w-3.5 h-3.5 text-red-500" />
                          <span className="truncate">{teacher.email}</span>
                          <Copy className="w-3 h-3 text-gray-400 ml-auto" />
                        </>
                      )}
                    </button>
                  )}

                  {/* Room Location */}
                  {teacher.roomLocation && (
                    <div className="mt-2 text-xs text-gray-500 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>{teacher.roomLocation}</span>
                    </div>
                  )}
                </div>

                {/* Right: Biography & Key Facts */}
                <div className="flex-1 w-full space-y-5 text-left">
                  
                  {/* Department & Role Badge */}
                  <div>
                    <div className="flex items-center gap-2 mb-2 flex-wrap">
                      <span className="px-3 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                        {teacher.role || "หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ"}
                      </span>

                      {teacher.grades && (
                        <span className="text-xs text-gray-500 font-medium inline-flex items-center gap-1">
                          <BookOpen className="w-3.5 h-3.5 text-gray-400" />
                          <span>ระดับชั้นที่สอน: {teacher.grades}</span>
                        </span>
                      )}
                    </div>

                    {/* Teacher Name */}
                    <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black font-kanit text-[#03071C] leading-tight">
                      {teacher.name}
                    </h2>
                  </div>

                  {/* 4 Clean Metric Cards (Flat & Compact) */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">วุฒิการศึกษา</span>
                      <span className="text-sm font-bold font-kanit text-gray-900 block mt-0.5">
                        {education.length > 0 ? education[education.length - 1].degree.split(" ")[0] || "ปริญญาโท" : "ปริญญาโท"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block">
                        {education.length > 0 ? education[education.length - 1].institution : "จุฬาฯ"}
                      </span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">ประสบการณ์สอน</span>
                      <span className="text-sm font-bold font-kanit text-gray-900 block mt-0.5">10+ ปี</span>
                      <span className="text-[10px] text-gray-500 truncate block">2557 - ปัจจุบัน</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">รางวัลที่ได้รับ</span>
                      <span className="text-sm font-bold font-kanit text-gray-900 block mt-0.5">
                        {awards.length > 0 ? `${awards.length} รางวัล` : "ระดับเหรียญทอง"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block">ระดับชาติ &amp; สพม.</span>
                    </div>

                    <div className="p-3 rounded-xl bg-gray-50 border border-gray-100">
                      <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider block">กิจกรรมศิลปะ</span>
                      <span className="text-sm font-bold font-kanit text-gray-900 block mt-0.5">
                        {activityImages.length > 0 ? `${activityImages.length} กิจกรรม` : "Workshop & งานสอน"}
                      </span>
                      <span className="text-[10px] text-gray-500 truncate block">ภาพบรรยากาศ</span>
                    </div>
                  </div>

                  {/* Specialties Tags */}
                  {specialtiesList.length > 0 && (
                    <div>
                      <h3 className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Palette className="w-3.5 h-3.5 text-red-500" />
                        <span>ความเชี่ยวชาญและวิชาที่สอน</span>
                      </h3>
                      <div className="flex flex-wrap gap-1.5">
                        {specialtiesList.map((skill, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-1 rounded-lg bg-gray-50 hover:bg-red-50 text-gray-700 hover:text-red-600 border border-gray-200 text-xs font-medium transition-colors"
                          >
                            #{skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Clean Quote Box */}
                  {teacher.bio && (
                    <div className="bg-gray-50/70 rounded-xl p-4 sm:p-5 border-l-4 border-red-500 border-y border-r border-gray-100">
                      <p className="text-sm sm:text-base text-gray-700 leading-relaxed font-normal italic">
                        &ldquo;{teacher.bio}&rdquo;
                      </p>
                      <div className="mt-2 text-xs font-semibold text-gray-500">
                        วิสัยทัศน์การจัดการเรียนการสอนศิลปะ • {teacher.name}
                      </div>
                    </div>
                  )}

                </div>
              </div>
            </div>
          </div>
        </section>

        {/* CONTAINER FOR SECTIONS: Education, Experience, Awards, Gallery */}
        <div className="container mx-auto px-4 sm:px-6 max-w-5xl pb-20 space-y-12">
          
          {/* SECTION 1: ประวัติการศึกษา (Education History) */}
          <section id="education" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <GraduationCap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-kanit text-gray-900 leading-tight">
                    ประวัติการศึกษา (Education)
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    คุณวุฒิทางการศึกษา สาขาวิชา สถาบัน และปีที่สำเร็จการศึกษา
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {education.length} รายการ
              </span>
            </div>

            {education.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลประวัติการศึกษา
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {education.map((edu, idx) => (
                  <div
                    key={edu.id || idx}
                    className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-400 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-red-50 text-red-700 border border-red-100">
                          {edu.level || "วุฒิการศึกษา"}
                        </span>

                        {edu.graduationYear && (
                          <span className="text-xs font-mono font-bold text-gray-600 bg-gray-100 px-2.5 py-0.5 rounded-md">
                            จบปี พ.ศ. {edu.graduationYear}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base sm:text-lg font-bold font-kanit text-gray-900 mb-1">
                        {edu.degree || edu.level}
                      </h4>

                      {edu.major && (
                        <p className="text-sm font-medium text-gray-600 mb-3">
                          {edu.major}
                        </p>
                      )}
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center gap-2 text-xs text-gray-500">
                      <School className="w-3.5 h-3.5 text-gray-400 shrink-0" />
                      <span className="truncate">{edu.institution || "ไม่ระบุสถาบัน"}</span>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 2: ประวัติการทำงานและประสบการณ์สอน (Teaching Experience) */}
          <section id="experience" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <Briefcase className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-kanit text-gray-900 leading-tight">
                    ประวัติการทำงานและประสบการณ์สอน (Experience)
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    เส้นทางการปฏิบัติงานวิชาชีพครู และการจัดการเรียนรู้ศิลปะ
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {experience.length} รายการ
              </span>
            </div>

            {experience.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลประวัติการทำงาน
              </div>
            ) : (
              <div className="relative pl-6 border-l-2 border-red-200 space-y-6 ml-2 sm:ml-3">
                {experience.map((exp, idx) => {
                  const isCurrent = exp.period?.includes("ปัจจุบัน");
                  return (
                    <div key={exp.id || idx} className="relative">
                      {/* Node Marker */}
                      <div className="absolute -left-[31px] top-1.5 w-4 h-4 rounded-full bg-red-600 border-2 border-white" />

                      <div className="bg-white rounded-2xl p-5 border border-gray-200 hover:border-red-300 transition-colors">
                        <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
                          <div className="flex items-center gap-2">
                            <h4 className="text-base font-bold font-kanit text-gray-900">
                              {exp.role}
                            </h4>
                            {isCurrent && (
                              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                ปัจจุบัน
                              </span>
                            )}
                          </div>

                          {exp.period && (
                            <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-full border border-red-100">
                              {exp.period}
                            </span>
                          )}
                        </div>

                        <p className="text-sm font-semibold text-gray-600 mb-1.5">
                          {exp.workplace}
                        </p>

                        {exp.details && (
                          <p className="text-xs sm:text-sm text-gray-500 font-light leading-relaxed pt-1.5 border-t border-gray-100">
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
          <section id="awards" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <Trophy className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-kanit text-gray-900 leading-tight">
                    รางวัลและเกียรติประวัติ (Awards &amp; Honors)
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    ผลงานดีเด่นและรางวัลเกียรติยศ พร้อมภาพถ่ายพิธีรับรางวัล
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {awards.length} รางวัล
              </span>
            </div>

            {awards.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                ยังไม่มีข้อมูลรางวัลที่ได้รับ
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-5">
                {awards.map((award, idx) => (
                  <div
                    key={award.id || idx}
                    className="p-5 rounded-2xl bg-white border border-gray-200 hover:border-red-400 transition-colors flex flex-col justify-between"
                  >
                    <div>
                      {/* Photo if available */}
                      {award.imageUrl && (
                        <div 
                          onClick={() => setLightboxImage({ url: award.imageUrl!, title: award.title, subtitle: award.issuer ? `หน่วยงานที่มอบ: ${award.issuer} (ปี พ.ศ. ${award.year})` : undefined })}
                          className="relative aspect-video rounded-xl overflow-hidden mb-3.5 bg-gray-900 cursor-pointer group/img border border-gray-100"
                          title="คลิกเพื่อดูรูปภาพขนาดเต็ม"
                        >
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={award.imageUrl}
                            alt={award.title}
                            className="w-full h-full object-cover group-hover/img:scale-105 transition-transform duration-300"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/img:opacity-100 flex items-center justify-center gap-1.5 text-white text-xs font-bold transition-opacity">
                            <Maximize2 className="w-3.5 h-3.5" />
                            <span>ดูรูปขยาย</span>
                          </div>
                        </div>
                      )}

                      <div className="flex items-center justify-between gap-2 mb-2">
                        <span className="w-6 h-6 rounded-lg bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                          <Award className="w-3.5 h-3.5" />
                        </span>

                        {award.year && (
                          <span className="text-xs font-mono font-bold text-red-700 bg-red-50 px-2.5 py-0.5 rounded-md border border-red-100">
                            ปี พ.ศ. {award.year}
                          </span>
                        )}
                      </div>

                      <h4 className="text-base font-bold font-kanit text-gray-900 mb-2 leading-snug">
                        {award.title}
                      </h4>
                    </div>

                    {award.issuer && (
                      <div className="pt-3 border-t border-gray-100 mt-2 flex items-center justify-between text-xs text-gray-500">
                        <span>หน่วยงานที่มอบ: <strong className="text-gray-700 font-medium">{award.issuer}</strong></span>
                        <Check className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </section>

          {/* SECTION 4: ภาพครูกับกิจกรรมและผลงาน (Activities & Gallery) */}
          <section id="gallery" className="scroll-mt-24 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-gray-200">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-xl bg-red-50 text-red-600 flex items-center justify-center border border-red-100 shrink-0">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg sm:text-xl font-bold font-kanit text-gray-900 leading-tight">
                    ภาพครูกับกิจกรรมและผลงานศิลปะ (Activities &amp; Gallery)
                  </h3>
                  <p className="text-xs text-gray-500 font-light">
                    ประมวลภาพบรรยากาศการจัดการเรียนการสอน เวิร์กช็อป และกิจกรรมศิลปะ
                  </p>
                </div>
              </div>
              <span className="text-xs font-medium text-gray-400">
                {activityImages.length} รูปภาพ
              </span>
            </div>

            {activityImages.length === 0 ? (
              <div className="py-8 text-center text-gray-400 text-sm bg-gray-50 rounded-xl border border-dashed border-gray-200">
                ยังไม่มีรูปภาพกิจกรรม
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                {activityImages.map((act, idx) => (
                  <div
                    key={act.id || idx}
                    onClick={() => setLightboxImage({ url: act.imageUrl, title: act.title, subtitle: act.date })}
                    className="group rounded-2xl overflow-hidden bg-gray-900 relative aspect-4/3 border border-gray-200 hover:border-red-500 transition-colors cursor-pointer flex flex-col justify-end"
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
                    <div className="relative z-10 p-4 w-full">
                      {act.date && (
                        <span className="px-2 py-0.5 rounded-md bg-white/20 backdrop-blur-md text-white text-[10px] font-medium border border-white/20 inline-flex items-center gap-1 mb-1.5">
                          <Calendar className="w-3 h-3" />
                          <span>{act.date}</span>
                        </span>
                      )}
                      <h4 className="text-sm font-bold font-kanit text-white leading-snug group-hover:text-red-300 transition-colors line-clamp-2">
                        {act.title}
                      </h4>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </section>

        </div>

        {/* LIGHTBOX MODAL */}
        {lightboxImage && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm"
            onClick={() => setLightboxImage(null)}
          >
            <div
              className="relative max-w-4xl w-full bg-gray-950 rounded-2xl overflow-hidden flex flex-col border border-gray-800"
              onClick={(e) => e.stopPropagation()}
            >
              {/* Modal Header */}
              <div className="flex items-center justify-between p-4 bg-gray-900 text-white border-b border-gray-800">
                <div className="min-w-0 pr-4">
                  <h4 className="text-sm font-bold font-kanit truncate text-white">{lightboxImage.title}</h4>
                  {lightboxImage.subtitle && (
                    <p className="text-xs text-gray-400 font-light truncate mt-0.5">{lightboxImage.subtitle}</p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setLightboxImage(null)}
                  className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors cursor-pointer shrink-0"
                  aria-label="ปิดหน้าต่าง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Modal Image */}
              <div className="p-3 flex items-center justify-center max-h-[75vh] overflow-hidden bg-black">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={lightboxImage.url}
                  alt={lightboxImage.title}
                  className="max-h-[70vh] max-w-full object-contain rounded-lg"
                />
              </div>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </>
  );
}
