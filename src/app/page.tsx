import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import QuickMenuSection from "@/components/sections/QuickMenuSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import NewsSection from "@/components/sections/NewsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import MapSection from "@/components/sections/MapSection";
import SocialSection from "@/components/sections/SocialSection";
import HomeWelcomePopup from "@/components/modals/HomeWelcomePopup";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col relative min-h-screen bg-[#FDF7F0] md:bg-transparent pb-6">
        {/* Artistic Faded Background Layer for Desktop */}
        <div 
          className="hidden md:block absolute inset-0 z-[-1] pointer-events-none opacity-40 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />
        
        {/* 1. Hero Banner — HeroSection manages its own mobile/desktop layout internally */}
        {/* Mobile: purple card + AI Art card (md:hidden inside HeroSection) */}
        {/* Desktop: full hero with big typography (hidden md:flex inside HeroSection) */}
        <HeroSection />

        {/* 2. Quick Menu Shortcuts — Mobile only */}
        <div className="block md:hidden">
          <QuickMenuSection />
        </div>

        {/* 3. Why Art Room Features Grid */}
        <div className="pt-4 md:pt-0">
          <FeaturesSection />
        </div>

        {/* 4. Featured Exhibition & News */}
        <NewsSection />

        {/* 5. Alumni Testimonials Carousel */}
        <TestimonialsSection />

        {/* 6. School Map */}
        <MapSection />

        {/* 7. Social Links */}
        <SocialSection />
      </main>
      <Footer />
      
      {/* Welcome & Announcement Popup Dialog */}
      <HomeWelcomePopup />
    </>
  );
}
