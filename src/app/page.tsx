import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import HeroSection from "@/components/sections/HeroSection";
import FeaturesSection from "@/components/sections/FeaturesSection";
import NewsSection from "@/components/sections/NewsSection";
import TestimonialsSection from "@/components/sections/TestimonialsSection";
import SocialSection from "@/components/sections/SocialSection";
import MapSection from "@/components/sections/MapSection";

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col relative min-h-screen">
        {/* Artistic Faded Background Layer */}
        <div 
          className="absolute inset-0 z-[-1] pointer-events-none opacity-40 bg-fixed bg-center bg-cover"
          style={{ backgroundImage: "url('/bg-art.jpg')" }}
        />
        <HeroSection />
        <FeaturesSection />
        <NewsSection />
        <TestimonialsSection />
        <MapSection />
        <SocialSection />
      </main>
      <Footer />
    </>
  );
}
