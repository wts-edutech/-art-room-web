import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import ArtworksGallery from "@/components/sections/ArtworksGallery";
import { Palette, Sparkles, Image as ImageIcon } from "lucide-react";

export default function ArtworksPage() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col min-h-screen bg-white">
        {/* Hero Section */}
        <section className="relative pt-32 pb-20 overflow-hidden">
          {/* Abstract Background Elements */}
          <div className="absolute top-0 inset-x-0 h-full overflow-hidden z-0">
            <div className="absolute -top-40 -right-40 w-[500px] h-[500px] bg-gradient-to-br from-pink-400/20 to-orange-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse"></div>
            <div className="absolute top-20 -left-20 w-[400px] h-[400px] bg-gradient-to-tr from-purple-400/20 to-pink-400/20 rounded-full blur-3xl mix-blend-multiply opacity-70 animate-pulse" style={{ animationDelay: '2s' }}></div>
            <div className="absolute bottom-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-tl from-yellow-300/10 to-orange-400/10 rounded-full blur-3xl mix-blend-multiply opacity-50"></div>
            
            {/* Grid Pattern */}
            <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)]"></div>
          </div>

          <div className="container mx-auto px-4 sm:px-6 max-w-6xl relative z-10 text-center">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-white/80 backdrop-blur-md border border-pink-100 shadow-sm text-pink-600 font-medium text-sm mb-6">
              <Sparkles className="w-4 h-4" />
              <span>หอศิลป์จำลอง (Virtual Art Gallery)</span>
            </div>
            
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold font-heading text-gray-900 mb-6 tracking-tight leading-tight">
              รวบรวมผลงาน <br className="md:hidden" />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-orange-500 to-pink-500">
                สุดสร้างสรรค์
              </span>
            </h1>
            
            <p className="text-lg md:text-xl text-gray-600 max-w-2xl mx-auto font-light leading-relaxed mb-10">
              พื้นที่จัดแสดงผลงานศิลปะของนักเรียนที่เต็มไปด้วยจินตนาการ ความตั้งใจ และทักษะที่ได้รับการพัฒนาในห้องเรียนศิลปะ
            </p>
          </div>
        </section>

        {/* Gallery Section */}
        <div className="mb-24 relative z-10">
          <ArtworksGallery />
        </div>
      </main>
      <Footer />
    </>
  );
}
