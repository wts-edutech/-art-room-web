"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen } from "lucide-react";

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

export default function HeroSection() {
  const [settings, setSettings] = useState<AiModelSettings>(DEFAULT_SETTINGS);

  useEffect(() => {
    fetch("/api/settings/ai-model")
      .then((res) => {
        if (res.ok) return res.json();
        throw new Error("Failed to fetch settings");
      })
      .then((data: any) => {
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

  const getSizeClasses = (size?: string) => {
    switch (size) {
      case "normal":
        return "px-7 py-3 text-sm sm:text-base";
      case "spacious":
        return "px-9 py-3.5 text-base sm:text-lg";
      case "compact":
      default:
        return "px-5 py-2 sm:px-6 sm:py-2.5 text-xs sm:text-sm md:text-[15px]";
    }
  };

  return (
    <section className="relative w-full min-h-[75vh] md:min-h-[85vh] flex items-center justify-center overflow-hidden bg-transparent pt-10 pb-12 sm:pt-20 sm:pb-16 md:pt-28 md:pb-28">
      {/* Subtle Grid Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">
        {/* 1. School Name Capsule Badge */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both mb-5 sm:mb-8 md:mb-10">
          <span className="inline-flex items-center gap-2 py-2 px-5 sm:px-6 rounded-full bg-red-50/90 text-red-600 font-medium text-xs sm:text-sm border border-red-200/80 shadow-xs backdrop-blur-xs select-none">
            <span className="w-2 h-2 rounded-full bg-red-600 animate-pulse" />
            โรงเรียนวชิรธรรมสาธิต
          </span>
        </div>
        
        {/* 2. Big 2-Line Headline: Black & Red-Pink */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.2rem] font-bold font-heading text-gray-900 mb-5 sm:mb-8 leading-[1.2] sm:leading-[1.15] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-900 delay-200 fill-mode-both">
          พื้นที่รวบรวมไอเดีย <br />
          <span className="text-[#ff0f39] bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent">
            กิจกรรม สื่อ เทคนิคการสอน
          </span>
        </h1>
        
        {/* 3. Subtitle / Description Paragraph */}
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-8 sm:mb-12 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900 delay-300 fill-mode-both font-light px-2 sm:px-0">
          เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ ที่สามารถเรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะได้หลายประเภท เช่น <span className="inline-block whitespace-nowrap font-normal text-gray-800">สีน้ำ</span> <span className="inline-block whitespace-nowrap font-normal text-gray-800">สีไม้</span> <span className="inline-block whitespace-nowrap font-normal text-gray-800">สีโปสเตอร์</span> และ<span className="inline-block whitespace-nowrap font-normal text-gray-800">วาดเส้นด้วยดินสอ EE</span>
        </p>
        
        {/* 4. Action Buttons (WTS CREATIVE AI ART MODEL & Materials) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full animate-in fade-in slide-in-from-bottom-8 duration-900 delay-500 fill-mode-both">
          {settings.isEnabled && (
            <a
              href={settings.url || "https://wtscreativeaiart.netlify.app/"}
              target={settings.openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center group cursor-pointer max-w-sm sm:max-w-none"
            >
              <span
                className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold uppercase tracking-wider transition-all duration-200 text-xs sm:text-sm md:text-[15px] shadow-lg shadow-red-600/25 active:scale-95"
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
              </span>
            </a>
          )}

          {/* Quick link to start learning / view materials */}
          <Link
            href="/materials"
            className="w-full sm:w-auto min-h-[48px] px-6 py-3.5 inline-flex items-center justify-center gap-2 rounded-full bg-white/90 hover:bg-white active:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm border border-gray-200 transition-all duration-200 shadow-xs active:scale-95 cursor-pointer max-w-sm sm:max-w-none"
          >
            <BookOpen className="w-4 h-4 text-red-600 shrink-0" />
            <span>เข้าสู่คลังสื่อการสอน</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0" />
          </Link>
        </div>
      </div>
    </section>
  );
}
