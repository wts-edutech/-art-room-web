import { Button } from "@/components/ui/button";
import Link from "next/link";

export default function HeroSection() {
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
          เว็ปไซต์สำหรับสื่อการเรียนการสอนศิลปะรูปแบบออนไลน์ ที่สามารถเรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะได้หลายประเภท เช่น สีน้ำ สีไม้ สีโปสเตอร์ และวาดเส้นด้วยดินสอ EE
        </p>
        
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 w-full sm:w-auto animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-500 fill-mode-both flex-wrap">
          <Link href="https://wtscreativeaiart.netlify.app/" target="_blank" rel="noopener noreferrer" className="w-full sm:w-auto block">
            <Button size="lg" className="w-full sm:w-auto rounded-full px-8 h-14 shadow-xl shadow-red-500/25 hover:shadow-2xl hover:shadow-red-500/30 hover:-translate-y-1 transition-all">
              <span className="text-lg font-bold uppercase tracking-wide">WTS Creative AI ART Model</span>
            </Button>
          </Link>
        </div>
      </div>
    </section>
  );
}
