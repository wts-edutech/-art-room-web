import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
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
      <main className="flex-1 flex flex-col relative min-h-screen bg-transparent pb-6">
        {/* Artistic Faded Watercolor Background Layer for Mobile & Desktop */}
        <div 
          className="absolute inset-0 z-[-1] pointer-events-none opacity-30 md:opacity-40 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />
        
        {/* 1. Hero Banner — Unified responsive layout matching desktop aesthetic */}
        <HeroSection />

        {/* 2. Why Art Room Features Grid */}
        <div className="pt-2 md:pt-0">
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
