import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import QuickMenuSection from "@/components/sections/QuickMenuSection";
import AwardsBanner from "@/components/sections/AwardsBanner";
import ArtMediumsSection from "@/components/sections/ArtMediumsSection";
import HomeArtworksPreview from "@/components/sections/HomeArtworksPreview";
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
      <main className="flex-1 flex flex-col relative min-h-screen bg-transparent pb-6 overflow-x-clip">
        {/* Artistic Faded Watercolor Background Layer for Mobile & Desktop */}
        <div 
          className="absolute inset-0 z-[-1] pointer-events-none opacity-25 md:opacity-35 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />
        
        {/* 1. Hero Banner — Animated ambient glow, floating badges, statistics ribbon */}
        <HeroSection />

        {/* 2. Quick Access Menu — Mobile-first app dock shortcuts */}
        <QuickMenuSection />

        {/* 3. Hall of Fame — Student competition winners & highlight awards */}
        <AwardsBanner />

        {/* 4. 4 Core Art Disciplines — Watercolor, Pencil, Poster, Drawing EE */}
        <ArtMediumsSection />

        {/* 5. Live Artworks Showcase — Featured student masterpieces with HD modal */}
        <HomeArtworksPreview />

        {/* 6. Why Art Room — Feature highlights */}
        <FeaturesSection />

        {/* 7. Featured Exhibition & School News */}
        <NewsSection />

        {/* 8. Alumni Testimonials Carousel */}
        <TestimonialsSection />

        {/* 9. School Map with 1-Click GPS Navigation */}
        <MapSection />

        {/* 10. Social Media Links */}
        <SocialSection />
      </main>
      <Footer />
      
      {/* Welcome & Announcement Popup Dialog */}
      <HomeWelcomePopup />
    </>
  );
}
