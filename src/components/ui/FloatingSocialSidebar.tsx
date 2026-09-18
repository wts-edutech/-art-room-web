"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { FaFacebook, FaYoutube, FaTiktok } from "react-icons/fa";
import { Share2, X } from "lucide-react";

export default function FloatingSocialSidebar() {
  const pathname = usePathname();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  // Do not render on admin pages to keep the dashboard clean, spacious, and elegant
  if (pathname?.startsWith("/admin")) return null;

  const socials = [
    {
      name: "Facebook",
      url: "https://www.facebook.com/share/1EsbVuyZpm/?mibextid=wwXIfr",
      icon: <FaFacebook className="w-6 h-6" />,
      color: "bg-[#1877F2] hover:bg-[#1569d6]",
      shadow: "shadow-md shadow-[#1877F2]/30 hover:shadow-lg hover:shadow-[#1877F2]/40",
    },
    {
      name: "TikTok",
      url: "https://www.tiktok.com/@artroom253",
      icon: <FaTiktok className="w-5.5 h-5.5" />,
      color: "bg-black hover:bg-neutral-900",
      shadow: "shadow-md shadow-black/30 hover:shadow-lg hover:shadow-black/40",
    },
    {
      name: "YouTube",
      url: "https://youtube.com/@artroom-u4l",
      icon: <FaYoutube className="w-6 h-6" />,
      color: "bg-[#FF0000] hover:bg-[#e00000]",
      shadow: "shadow-md shadow-[#FF0000]/30 hover:shadow-lg hover:shadow-[#FF0000]/40",
    },
  ];

  return (
    <>
      {/* Desktop Floating Sidebar */}
      <div className="hidden xl:flex fixed right-0 top-1/2 -translate-y-1/2 z-50 flex-col items-end pointer-events-none">
        <div className="bg-white/95 backdrop-blur-xl shadow-[-6px_0_28px_-4px_rgba(0,0,0,0.12)] rounded-l-3xl border border-r-0 border-gray-200/80 p-2.5 pointer-events-auto flex flex-col items-center gap-3 relative transition-all duration-300 hover:shadow-[-8px_0_35px_-4px_rgba(0,0,0,0.18)] group/sidebar">
          
          <div className="w-full flex flex-col items-center py-2 border-b border-gray-100">
            <span className="w-1.5 h-1.5 rounded-full bg-orange-500 animate-pulse mb-2.5" />
            <span className="text-[11px] font-bold text-gray-400 tracking-wider [writing-mode:vertical-rl] rotate-180 select-none py-1">
              ติดตามผลงานของเรา
            </span>
          </div>

          <div className="flex flex-col gap-2.5 pt-0.5 pb-0.5">
            {(Array.isArray(socials) ? socials : []).map((social, index) => (
              <Link
                key={index}
                href={social.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`group flex items-center justify-end rounded-2xl transition-all duration-300 w-12 h-12 hover:w-40 overflow-hidden ${social.color} ${social.shadow} cursor-pointer relative hover:scale-[1.03] active:scale-[0.98]`}
                title={social.name}
              >
                <div className="absolute right-0 w-12 h-12 flex items-center justify-center text-white z-10 bg-inherit">
                  {social.icon}
                </div>
                <div className="pr-12 pl-4 py-2 text-white font-bold text-sm whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity duration-300 delay-75">
                  {social.name}
                </div>
              </Link>
            ))}
          </div>
        </div>
      </div>

      {/* Mobile & Tablet Floating Button */}
      <div className="xl:hidden fixed bottom-6 right-6 z-40">
        <button
          onClick={() => setIsMobileMenuOpen(true)}
          className="w-14 h-14 bg-gradient-to-r from-orange-500 to-pink-500 rounded-full flex items-center justify-center text-white shadow-lg shadow-orange-500/30 hover:scale-105 active:scale-95 transition-all cursor-pointer"
          aria-label="Share options"
        >
          <Share2 className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile & Tablet Bottom Sheet Overlay */}
      <div 
        className={`xl:hidden fixed inset-0 z-50 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isMobileMenuOpen ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMobileMenuOpen(false)}
      >
        {/* Bottom Sheet */}
        <div 
          className={`absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-2xl transition-transform duration-300 ease-out transform ${
            isMobileMenuOpen ? "translate-y-0" : "translate-y-full"
          }`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="p-6 pb-8 safe-pb">
            <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
              <h3 className="font-bold text-xl text-gray-900 font-heading">ติดตามผลงานของเรา</h3>
              <button 
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full bg-gray-100 text-gray-500 hover:bg-gray-200 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            
            <div className="grid grid-cols-3 gap-4">
              {(Array.isArray(socials) ? socials : []).map((social, index) => (
                <Link
                  key={index}
                  href={social.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex flex-col items-center gap-2 group"
                >
                  <div className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white shadow-sm transition-transform active:scale-95 ${social.color}`}>
                    <div className="scale-125">
                      {social.icon}
                    </div>
                  </div>
                  <span className="text-xs font-medium text-gray-600">{social.name}</span>
                </Link>
              ))}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
