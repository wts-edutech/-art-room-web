"use client";

import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import Image from "next/image";
import { ChevronUp } from "lucide-react";

export default function BackToTop() {
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const pathname = usePathname();

  // Do not render on admin pages to keep the dashboard clean
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const toggleVisibility = () => {
      if (window.scrollY > 300) {
        setIsVisible(true);
      } else {
        setIsVisible(false);
      }
    };

    window.addEventListener("scroll", toggleVisibility, { passive: true });
    // Check initial scroll position
    toggleVisibility();

    return () => window.removeEventListener("scroll", toggleVisibility);
  }, []);

  const scrollToTop = () => {
    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  };

  if (isAdmin) return null;

  return (
    <div
      className={`fixed right-3.5 sm:right-6 bottom-20 lg:bottom-8 z-40 transition-all duration-300 ease-out select-none ${
        isVisible
          ? "opacity-100 scale-100 translate-y-0 pointer-events-auto"
          : "opacity-0 scale-75 translate-y-8 pointer-events-none"
      }`}
    >
      <button
        type="button"
        onClick={scrollToTop}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className="group relative flex flex-col items-center justify-center cursor-pointer transition-transform duration-300 active:scale-90 hover:scale-105 outline-none focus:outline-none"
        aria-label="เลื่อนขึ้นด้านบนสุด (Back to Top)"
        title="เลื่อนขึ้นด้านบนสุด"
      >
        {/* Tooltip / Floating Indicator */}
        <div
          className={`absolute -top-8 px-2.5 py-0.5 rounded-full bg-gray-900/90 text-white text-[11px] font-bold font-kanit shadow-md transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1 ${
            isHovered
              ? "opacity-100 -translate-y-1 scale-100"
              : "opacity-0 translate-y-1 scale-90"
          }`}
        >
          <ChevronUp className="w-3 h-3 text-orange-400 animate-bounce" />
          <span>ขึ้นด้านบน</span>
        </div>

        {/* Die-cut Mascot Logo Button */}
        <div className="relative w-14 h-14 sm:w-16 sm:h-16 transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.28)] hover:drop-shadow-[0_12px_24px_rgba(132,204,22,0.45)] group-hover:-translate-y-1">
          <Image
            src="/images/artroom-mascot-transparent.png"
            alt="Art Room Mascot Back to Top"
            width={72}
            height={72}
            className="w-full h-full object-contain filter"
            priority={false}
          />

          {/* Subtle Upward Mini Indicator Badge on bottom-right of mascot */}
          <div className="absolute -bottom-0.5 -right-0.5 w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-xs border border-white transition-transform group-hover:scale-110">
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </button>
    </div>
  );
}
