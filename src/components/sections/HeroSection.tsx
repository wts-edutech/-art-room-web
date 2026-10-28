"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { Sparkles, ArrowRight, BookOpen, Trophy, Palette, Lightbulb, Users, Compass } from "lucide-react";

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
    <section className="relative w-full min-h-[80vh] md:min-h-[88vh] flex items-center justify-center overflow-hidden bg-transparent pt-8 pb-14 sm:pt-16 sm:pb-20 md:pt-24 md:pb-28">
      {/* 1. Ambient Dynamic Glow Orbs (Artistic Lighting) */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[340px] sm:w-[600px] md:w-[800px] h-[340px] sm:h-[450px] bg-gradient-to-tr from-red-500/15 via-rose-400/20 to-amber-300/15 rounded-full blur-3xl pointer-events-none animate-pulse-glow" />
      <div className="hidden md:block absolute top-1/3 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl pointer-events-none animate-float-slow" />
      <div className="hidden md:block absolute bottom-1/4 right-10 w-80 h-80 bg-rose-500/10 rounded-full blur-3xl pointer-events-none animate-float-reverse" />

      {/* 2. Subtle Grid Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:3rem_3rem] sm:bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] pointer-events-none" />

      {/* 3. Floating Creative Chips (Hidden on small mobile, visible on tablet & desktop) */}
      <div className="hidden lg:flex absolute top-24 left-[8%] items-center gap-2.5 px-4 py-2 rounded-2xl glass-panel shadow-sm border border-red-100/60 animate-float-slow z-20 pointer-events-none select-none">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-rose-500 to-red-500 flex items-center justify-center text-white shadow-xs">
          <Palette className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-gray-800 leading-tight">สีน้ำ & สีโปสเตอร์</span>
          <span className="text-[9.5px] text-gray-500">เทคนิคระดับมืออาชีพ</span>
        </div>
      </div>

      <div className="hidden lg:flex absolute top-36 right-[8%] items-center gap-2.5 px-4 py-2 rounded-2xl glass-panel shadow-sm border border-amber-100/60 animate-float-reverse z-20 pointer-events-none select-none">
        <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-amber-500 to-yellow-400 flex items-center justify-center text-white shadow-xs">
          <Trophy className="w-4 h-4" />
        </div>
        <div className="flex flex-col text-left">
          <span className="text-[11px] font-bold text-gray-800 leading-tight">40+ รางวัลชนะเลิศ</span>
          <span className="text-[9.5px] text-gray-500">ระดับเขตและระดับชาติ</span>
        </div>
      </div>

      <div className="hidden xl:flex absolute bottom-28 left-[12%] items-center gap-2 px-3.5 py-1.5 rounded-full bg-white/90 backdrop-blur-md shadow-xs border border-gray-100 text-[11px] text-gray-600 animate-float-reverse z-20 pointer-events-none select-none">
        <Lightbulb className="w-3.5 h-3.5 text-amber-500" />
        <span>พื้นที่สร้างสรรค์ผลงานศิลปะ</span>
      </div>

      <div className="container mx-auto px-4 sm:px-6 relative z-10 flex flex-col items-center text-center max-w-5xl">
        {/* 1. School Name Capsule Badge with Live Ping */}
        <div className="animate-in fade-in slide-in-from-bottom-6 duration-700 delay-100 fill-mode-both mb-4 sm:mb-6 md:mb-8">
          <span className="inline-flex items-center gap-2.5 py-2 px-4 sm:px-6 rounded-full bg-white/90 backdrop-blur-md text-red-600 font-semibold text-xs sm:text-sm border border-red-200/80 shadow-xs hover:border-red-300 transition-colors select-none">
            <span className="relative flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-red-600"></span>
            </span>
            <span className="font-heading tracking-wide">กลุ่มสาระการเรียนรู้ศิลปะ • โรงเรียนวชิรธรรมสาธิต</span>
          </span>
        </div>
        
        {/* 2. Big Dynamic Headline */}
        <h1 className="text-3xl sm:text-5xl md:text-6xl lg:text-[5.4rem] font-black font-heading text-gray-900 mb-4 sm:mb-7 leading-[1.18] sm:leading-[1.12] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-900 delay-200 fill-mode-both">
          พื้นที่รวบรวมไอเดีย <br />
          <span className="bg-gradient-to-r from-red-600 via-rose-600 to-pink-600 bg-clip-text text-transparent drop-shadow-2xs">
            กิจกรรม สื่อ เทคนิคการสอน
          </span>
        </h1>
        
        {/* 3. Subtitle / Description Paragraph */}
        <p className="text-sm sm:text-lg md:text-xl lg:text-2xl text-gray-600 mb-7 sm:mb-10 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-900 delay-300 fill-mode-both font-normal px-2 sm:px-0">
          เว็บไซต์สื่อการสอนศิลปะรูปแบบออนไลน์ เรียนรู้เทคนิคการสร้างสรรค์ผลงานหลายประเภท เช่น{" "}
          <span className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-red-50 text-red-700 font-semibold border border-red-100/80">สีน้ำ</span>{" "}
          <span className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-amber-50 text-amber-700 font-semibold border border-amber-100/80">สีไม้</span>{" "}
          <span className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-blue-50 text-blue-700 font-semibold border border-blue-100/80">สีโปสเตอร์</span> และ{" "}
          <span className="inline-block px-2 py-0.5 mx-0.5 rounded-md bg-purple-50 text-purple-700 font-semibold border border-purple-100/80">วาดเส้นดินสอ EE</span>
        </p>
        
        {/* 4. Action Buttons (AI ART MODEL & Materials) */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-3.5 sm:gap-4 w-full animate-in fade-in slide-in-from-bottom-8 duration-900 delay-400 fill-mode-both">
          {settings.isEnabled && (
            <a
              href={settings.url || "https://wtscreativeaiart.netlify.app/"}
              target={settings.openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="w-full sm:w-auto inline-flex items-center justify-center group cursor-pointer max-w-sm sm:max-w-none relative"
            >
              {/* Subtle animated blur behind button */}
              <div className="absolute inset-0 rounded-full bg-red-600/40 blur-md group-hover:blur-lg transition-all opacity-80" />
              
              <span className="relative w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-gradient-to-r from-red-600 via-rose-600 to-red-700 hover:from-red-700 hover:to-rose-800 active:scale-95 text-white font-bold uppercase tracking-wider transition-all duration-300 text-xs sm:text-sm md:text-[15px] shadow-xl shadow-red-600/30 overflow-hidden">
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white animate-pulse" />
                </span>

                <span className="font-extrabold tracking-wider text-white select-none whitespace-nowrap truncate font-heading">
                  {settings.title || "WTS CREATIVE AI ART MODEL"}
                </span>

                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/15 text-white group-hover:bg-white group-hover:text-red-600 transition-colors duration-200 shrink-0">
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5 group-hover:translate-x-0.5 transition-transform" />
                </span>

                {/* Shimmer light sweep animation */}
                <span className="absolute inset-0 bg-gradient-to-r from-transparent via-white/25 to-transparent ai-shimmer-beam pointer-events-none" />
              </span>
            </a>
          )}

          {/* Quick link to start learning / view materials */}
          <Link
            href="/materials"
            className="w-full sm:w-auto min-h-[48px] sm:min-h-[52px] px-6 sm:px-8 py-3.5 inline-flex items-center justify-center gap-2.5 rounded-full bg-white/95 hover:bg-white active:bg-gray-100 text-gray-800 font-bold text-xs sm:text-sm md:text-[15px] border border-gray-200/90 hover:border-gray-300 transition-all duration-200 shadow-sm hover:shadow-md active:scale-95 cursor-pointer max-w-sm sm:max-w-none group"
          >
            <BookOpen className="w-4 h-4 text-red-600 shrink-0 group-hover:scale-110 transition-transform" />
            <span>เข้าสู่คลังสื่อการสอน</span>
            <ArrowRight className="w-3.5 h-3.5 text-gray-400 shrink-0 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        {/* 5. Interactive School Statistics Pill Bar */}
        <div className="w-full max-w-3xl mt-10 sm:mt-14 pt-6 sm:pt-8 border-t border-gray-200/70 animate-in fade-in slide-in-from-bottom-8 duration-900 delay-500 fill-mode-both">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl sm:text-2xl font-black text-gray-900 font-heading">150+</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">สื่อ & ใบงานศิลปะ</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl sm:text-2xl font-black text-rose-600 font-heading">4 หมวด</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">เทคนิคสร้างสรรค์</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl sm:text-2xl font-black text-amber-600 font-heading">40+</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">รางวัลการแข่งขัน</span>
            </div>
            <div className="flex flex-col items-center p-3 rounded-2xl bg-white/70 backdrop-blur-sm border border-gray-100 shadow-2xs hover:shadow-xs transition-shadow">
              <span className="text-xl sm:text-2xl font-black text-blue-600 font-heading">1,200+</span>
              <span className="text-[11px] sm:text-xs text-gray-500 font-medium mt-0.5">นักเรียนเข้าใช้งาน</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
