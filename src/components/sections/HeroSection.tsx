"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Palette, Star } from "lucide-react";

interface AiModelSettings {
  title: string;
  url: string;
  openInNewTab: boolean;
  isEnabled: boolean;
  buttonSize?: "compact" | "normal" | "spacious";
}

const DEFAULT_SETTINGS: AiModelSettings = {
  title: "WTS CREATIVE AI ART MODEL",
  url: "https://wtscreativeaiart.netlify.app/",
  openInNewTab: true,
  isEnabled: true,
  buttonSize: "compact",
};

// Floating paint splash particles
function FloatingElements() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none z-0">
      {/* Animated gradient orbs */}
      <div className="absolute -top-32 -right-32 w-[500px] h-[500px] bg-gradient-to-br from-rose-200/40 via-pink-300/30 to-orange-200/20 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '8s' }} />
      <div className="absolute -bottom-32 -left-32 w-[400px] h-[400px] bg-gradient-to-tr from-amber-200/30 via-yellow-300/20 to-rose-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '6s', animationDelay: '2s' }} />
      <div className="absolute top-1/3 right-1/4 w-[300px] h-[300px] bg-gradient-to-bl from-violet-200/20 to-blue-200/10 rounded-full blur-3xl animate-pulse" style={{ animationDuration: '10s', animationDelay: '4s' }} />
      
      {/* Subtle floating art elements */}
      <div className="hidden md:block absolute top-20 left-[15%] text-4xl opacity-15 animate-bounce" style={{ animationDuration: '3s' }}>🎨</div>
      <div className="hidden md:block absolute top-40 right-[12%] text-3xl opacity-10 animate-bounce" style={{ animationDuration: '4s', animationDelay: '1s' }}>✨</div>
      <div className="hidden md:block absolute bottom-20 left-[20%] text-3xl opacity-10 animate-bounce" style={{ animationDuration: '5s', animationDelay: '2s' }}>🖌️</div>
      <div className="hidden md:block absolute bottom-32 right-[18%] text-4xl opacity-10 animate-bounce" style={{ animationDuration: '3.5s', animationDelay: '0.5s' }}>🌈</div>
    </div>
  );
}

export default function HeroSection() {
  const [settings, setSettings] = useState<AiModelSettings>(DEFAULT_SETTINGS);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Trigger entrance animation
    setIsVisible(true);

    fetch("/api/settings/ai-model")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch settings");
      })
      .then((data) => {
        setSettings({
          title: data.title || DEFAULT_SETTINGS.title,
          url: data.url || DEFAULT_SETTINGS.url,
          openInNewTab: data.openInNewTab !== undefined ? data.openInNewTab : true,
          isEnabled: data.isEnabled !== undefined ? data.isEnabled : true,
          buttonSize: data.buttonSize || "compact",
        });
      })
      .catch((err) => {
        console.warn("Using default Hero button settings:", err);
      });
  }, []);

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-transparent pt-10 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-28">
      {/* Floating decorative elements */}
      <FloatingElements />

      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">
        {/* 1. School Name Capsule Badge with shimmer */}
        <div className={`mb-5 sm:mb-8 md:mb-10 transition-all duration-1000 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          <span className="inline-flex items-center gap-2 py-2 px-5 sm:px-6 rounded-full bg-red-50/90 text-red-600 font-medium text-xs sm:text-sm border border-red-200/80 shadow-xs backdrop-blur-xs select-none relative overflow-hidden">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            โรงเรียนวชิรธรรมสาธิต
            {/* Shimmer effect */}
            <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/30 to-transparent ai-shimmer-beam" />
          </span>
        </div>
        
        {/* 2. Big Headline with staggered reveal */}
        <h1 className={`text-3xl sm:text-5xl md:text-6xl lg:text-[5.2rem] font-bold font-heading text-gray-900 mb-5 sm:mb-8 leading-[1.2] sm:leading-[1.15] tracking-tight transition-all duration-1000 delay-200 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          <span className="inline-block">พื้นที่รวบรวมไอเดีย</span>
          <br />
          <span className="relative inline-block">
            <span className="text-[#ff0f39] bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
              กิจกรรม สื่อ เทคนิคการสอน
            </span>
            {/* Animated underline */}
            <span className={`absolute -bottom-1 sm:-bottom-2 left-0 h-[3px] sm:h-1 bg-gradient-to-r from-red-500 via-rose-500 to-pink-500 rounded-full transition-all duration-1500 delay-700 ${isVisible ? 'w-full' : 'w-0'}`} />
          </span>
        </h1>
        
        {/* 3. Subtitle */}
        <p className={`text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed font-light px-2 sm:px-0 transition-all duration-1000 delay-400 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ ที่สามารถเรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะได้หลายประเภท เช่น{" "}
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-normal text-gray-800">
            <Palette className="w-4 h-4 text-red-400 inline" />สีน้ำ
          </span>{" "}
          <span className="inline-flex items-center gap-1 whitespace-nowrap font-normal text-gray-800">
            <Star className="w-4 h-4 text-amber-400 inline" />สีไม้
          </span>{" "}
          <span className="inline-block whitespace-nowrap font-normal text-gray-800">สีโปสเตอร์</span> และ
          <span className="inline-block whitespace-nowrap font-normal text-gray-800">วาดเส้นด้วยดินสอ EE</span>
        </p>
        
        {/* 4. Action Buttons with enhanced styling */}
        <div className={`flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full transition-all duration-1000 delay-600 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
          {settings.isEnabled && (
            <a
              href={settings.url || "https://wtscreativeaiart.netlify.app/"}
              target={settings.openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center group cursor-pointer max-w-sm sm:max-w-none"
            >
              <span
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold uppercase tracking-wider transition-all duration-200 text-xs sm:text-sm md:text-[15px] shadow-lg shadow-red-600/25 active:scale-95 relative overflow-hidden"
              >
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </span>

                <span className="font-bold tracking-wider text-white select-none whitespace-nowrap truncate">
                  {settings.title || "WTS CREATIVE AI ART MODEL"}
                </span>

                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/15 text-white group-hover:bg-white group-hover:text-red-600 transition-colors duration-200 shrink-0">
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>

                {/* Shimmer sweep */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 to-transparent ai-shimmer-beam" />
              </span>
            </a>
          )}

          {/* Quick link to start learning / view materials */}
          <Link
            href="/materials"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-white/90 hover:bg-white active:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm border border-gray-200 transition-all duration-200 shadow-xs active:scale-95 cursor-pointer max-w-sm sm:max-w-none hover:shadow-md hover:border-gray-300"
          >
            <BookOpen className="w-4 h-4 text-red-600 shrink-0" />
            <span>เข้าสู่คลังสื่อการสอน</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:translate-x-0.5 transition-transform" />
          </Link>
        </div>

        {/* 5. Trust indicators */}
        <div className={`mt-10 sm:mt-14 flex flex-wrap items-center justify-center gap-4 sm:gap-6 transition-all duration-1000 delay-800 ${isVisible ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-6'}`}>
          {[
            { label: "ฟรี 100%", sub: "ไม่มีค่าใช้จ่าย" },
            { label: "ปลอดภัย", sub: "PDPA Compliant" },
            { label: "สื่อครบครัน", sub: "วิดีโอ + ใบงาน" },
          ].map((item, i) => (
            <div key={i} className="flex items-center gap-2 text-xs sm:text-sm text-gray-500">
              <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center shrink-0">
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd"/>
                </svg>
              </span>
              <span>
                <span className="font-semibold text-gray-700">{item.label}</span>
                <span className="hidden sm:inline text-gray-400"> — {item.sub}</span>
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
