"use client";

import { useState, useEffect } from "react";
import { Sparkles, ArrowRight } from "lucide-react";

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

  // Proportional padding based on admin buttonSize setting to snugly fit text
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
    <section className="relative w-full min-h-[95vh] flex items-center justify-center overflow-hidden bg-transparent pt-28 pb-20 md:pt-36 md:pb-32">
      {/* Background Pattern */}
      <div className="absolute inset-0 z-0 bg-[linear-gradient(to_right,#f0f0f0_1px,transparent_1px),linear-gradient(to_bottom,#f0f0f0_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>

      {/* Decorative blurred gradients (Removed per user request) */}

      <div className="container mx-auto px-4 relative z-10 flex flex-col items-center text-center">
        <div className="animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-100 fill-mode-both">
          <span className="inline-flex items-center gap-2 py-2 px-6 rounded-full bg-red-50 text-(--color-primary-500) font-medium text-sm mb-10 border border-red-100 shadow-sm hover:shadow-md transition-shadow">
            <span className="w-2 h-2 rounded-full bg-(--color-primary-500) animate-pulse"></span>
            โรงเรียนวชิรธรรมสาธิต
          </span>
        </div>
        
        <h1 className="text-4xl sm:text-5xl md:text-7xl lg:text-[5.5rem] font-bold font-heading text-gray-900 mb-8 leading-[1.15] tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-200 fill-mode-both">
          พื้นที่รวบรวมไอเดีย <br className="hidden sm:block" />
          <span className="text-[#ff0f39]">
            กิจกรรม สื่อ เทคนิคการสอน
          </span>
        </h1>
        
        <p className="text-lg md:text-xl lg:text-2xl text-gray-600 mb-14 max-w-3xl mx-auto leading-relaxed animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300 fill-mode-both font-light">
          เว็บไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ ที่สามารถเรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะได้หลายประเภท เช่น <span className="inline-block whitespace-nowrap">สีน้ำ</span> <span className="inline-block whitespace-nowrap">สีไม้</span> <span className="inline-block whitespace-nowrap">สีโปสเตอร์</span> และ<span className="inline-block whitespace-nowrap">วาดเส้นด้วยดินสอ EE</span>
        </p>
        
        {settings.isEnabled && (
          <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both flex-wrap">
            <a
              href={settings.url || "https://wtscreativeaiart.netlify.app/"}
              target={settings.openInNewTab ? "_blank" : "_self"}
              rel="noopener noreferrer"
              className="inline-flex items-center group cursor-pointer"
            >
              {/* Main AI Art Pill Button - สีแดงธรรมดา ไม่เน้นเงา */}
              <span
                className={`inline-flex items-center justify-center gap-2.5 sm:gap-3 rounded-full bg-red-600 hover:bg-red-700 active:bg-red-800 text-white font-bold uppercase tracking-wider transition-colors duration-200 ${getSizeClasses(settings.buttonSize)}`}
              >
                {/* AI Sparkle Icon Badge */}
                <span className="flex items-center justify-center w-6 h-6 sm:w-7 sm:h-7 rounded-full bg-white/20 shrink-0">
                  <Sparkles className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
                </span>

                {/* Button Title with snug fit */}
                <span className="font-bold tracking-wider text-white select-none whitespace-nowrap">
                  {settings.title || "WTS CREATIVE AI ART MODEL"}
                </span>

                {/* Interactive Arrow Badge */}
                <span className="flex items-center justify-center w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-black/15 text-white group-hover:bg-white group-hover:text-red-600 transition-colors duration-200 shrink-0">
                  <ArrowRight className="w-3 h-3 sm:w-3.5 sm:h-3.5" />
                </span>
              </span>
            </a>
          </div>
        )}
      </div>
    </section>
  );
}
