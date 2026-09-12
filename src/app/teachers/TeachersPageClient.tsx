"use client";

import { useState, useEffect } from "react";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import { GraduationCap, Mail, MapPin, Sparkles, Palette } from "lucide-react";

interface Teacher {
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
}

interface TeachersPageClientProps {
  initialTeachers: Teacher[];
}

export default function TeachersPageClient({ initialTeachers }: TeachersPageClientProps) {
  const [teachers, setTeachers] = useState<Teacher[]>(initialTeachers);

  useEffect(() => {
    fetch("/api/teachers")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTeachers(data);
        }
      })
      .catch((err) => console.error("Failed to load teachers dynamically:", err));
  }, []);

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-24 min-h-screen bg-[#FDF9F1]">
        
        {/* Hero Header */}
        <section className="relative overflow-hidden pt-12 pb-10 border-b border-red-100/60 bg-gradient-to-b from-red-50/50 via-white to-transparent">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl text-center">
            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100 text-red-700 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
              <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
              <span>คณะครูและบุคลากร | Art Department Faculty</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
              ทำเนียบครูผู้สอนศิลปะ
            </h1>
            <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
              กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต พร้อมถ่ายทอดทักษะ จินตนาการ และส่งเสริมศักยภาพนักเรียนสู่เวทีระดับชาติ
            </p>
          </div>
        </section>

        {/* Teachers Cards Grid */}
        <section className="py-12 sm:py-16">
          <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
              {teachers.map((teacher: any) => (
                <div 
                  key={teacher.id} 
                  className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col group hover:-translate-y-1"
                >
                  {/* Image Container */}
                  <div className="relative aspect-[4/3] bg-gray-100 overflow-hidden">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={teacher.imageUrl || "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800"} 
                      alt={teacher.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute top-3 left-3 bg-red-600 text-white text-[11px] font-bold px-3 py-1 rounded-full shadow-xs">
                      {teacher.position || "ครูผู้สอน"}
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-6 flex-1 flex flex-col">
                    <h3 className="text-xl font-bold font-heading text-gray-900 mb-1 group-hover:text-red-600 transition-colors">
                      {teacher.name}
                    </h3>
                    <p className="text-xs font-semibold text-red-600 mb-4">
                      {teacher.role}
                    </p>

                    <div className="space-y-2.5 text-xs text-gray-600 mb-6">
                      {teacher.grades && (
                        <div className="flex items-start gap-2">
                          <GraduationCap className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span><strong>ระดับชั้นที่สอน:</strong> {teacher.grades}</span>
                        </div>
                      )}
                      {teacher.specialties && (
                        <div className="flex items-start gap-2">
                          <Palette className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span><strong>ความเชี่ยวชาญ:</strong> {teacher.specialties}</span>
                        </div>
                      )}
                      {teacher.roomLocation && (
                        <div className="flex items-start gap-2">
                          <MapPin className="w-4 h-4 text-gray-400 flex-shrink-0 mt-0.5" />
                          <span>{teacher.roomLocation}</span>
                        </div>
                      )}
                    </div>

                    {teacher.bio && (
                      <p className="text-xs text-gray-500 italic bg-gray-50 p-3 rounded-xl border border-gray-100 mb-4 font-light">
                        &ldquo;{teacher.bio}&rdquo;
                      </p>
                    )}

                    {teacher.email && (
                      <div className="mt-auto pt-4 border-t border-gray-100">
                        <a 
                          href={`mailto:${teacher.email}`}
                          className="inline-flex items-center justify-center w-full gap-2 text-xs font-bold text-gray-700 bg-gray-50 hover:bg-red-50 hover:text-red-600 py-2.5 px-4 rounded-xl transition-colors border border-gray-200/60"
                        >
                          <Mail className="w-3.5 h-3.5" />
                          <span>ติดต่อสอบถามผ่านอีเมล</span>
                        </a>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

      </main>
      <Footer />
    </>
  );
}
