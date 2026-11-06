"use client";

import { useState, useEffect } from "react";
import { usePathname, useRouter } from "next/navigation";
import Image from "next/image";
import { ChevronUp, Pencil } from "lucide-react";
import { useSiteMascot } from "@/context/MascotContext";

export default function BackToTop() {
  const { mascotSettings, resolvedMascotSrc } = useSiteMascot();
  const [isVisible, setIsVisible] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [isUserAdmin, setIsUserAdmin] = useState(false);
  const pathname = usePathname();
  const router = useRouter();

  // Do not render on admin pages to keep the dashboard clean
  const isAdmin = pathname?.startsWith("/admin");

  useEffect(() => {
    const checkAdmin = () => {
      try {
        const role = localStorage.getItem("artroom_role");
        const hasAdminCookie = document.cookie.includes("admin_token=");
        setIsUserAdmin(role === "admin" || hasAdminCookie);
      } catch {}
    };
    checkAdmin();
    window.addEventListener("storage", checkAdmin);
    window.addEventListener("artroom_profile_updated", checkAdmin);
    return () => {
      window.removeEventListener("storage", checkAdmin);
      window.removeEventListener("artroom_profile_updated", checkAdmin);
    };
  }, []);

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
        {mascotSettings.showTooltip && (
          <div
            className={`absolute -top-8 px-2.5 py-0.5 rounded-full bg-gray-900/90 text-white text-[11px] font-bold font-kanit shadow-md transition-all duration-200 pointer-events-none whitespace-nowrap flex items-center gap-1 ${
              isHovered
                ? "opacity-100 -translate-y-1 scale-100"
                : "opacity-0 translate-y-1 scale-90"
            }`}
          >
            <ChevronUp className="w-3 h-3 text-orange-400 animate-bounce" />
            <span>{mascotSettings.tooltipText || "ขึ้นด้านบน"}</span>
          </div>
        )}

        {/* Die-cut Mascot Logo Button */}
        <div 
          className="relative transition-all duration-300 drop-shadow-[0_8px_16px_rgba(0,0,0,0.25)] hover:drop-shadow-[0_12px_24px_rgba(132,204,22,0.45)] group-hover:-translate-y-1.5"
          style={{
            width: `${mascotSettings.size || 64}px`,
            height: `${Math.round((mascotSettings.size || 64) * 1.25)}px`,
          }}
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={resolvedMascotSrc}
            alt={mascotSettings.mascotAlt || "Art Room Mascot Back to Top"}
            className="w-full h-full object-contain filter select-none pointer-events-none"
          />

          {/* Subtle Upward Mini Indicator Badge */}
          <div className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white flex items-center justify-center shadow-md border-2 border-white transition-transform duration-200 group-hover:scale-110">
            <ChevronUp className="w-3.5 h-3.5 stroke-[3]" />
          </div>
        </div>
      </button>

      {/* Quick Edit Button for Admin right above Mascot */}
      {isUserAdmin && (
        <button
          type="button"
          onClick={(e) => {
            e.stopPropagation();
            router.push("/admin?tab=siteMascot");
          }}
          className="mt-1.5 mx-auto flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-600 hover:bg-orange-700 text-white text-[10px] font-bold shadow-md border border-white cursor-pointer transition-all hover:scale-105"
          title="แก้ไขรูปตัวการ์ตูนมุมขวาล่าง"
        >
          <Pencil className="w-2.5 h-2.5" />
          <span>แก้ไขตัวการ์ตูน</span>
        </button>
      )}
    </div>
  );
}
