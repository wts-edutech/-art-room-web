"use client";

import { MapPin, Navigation, ExternalLink } from "lucide-react";

export default function MapSection() {
  const mapUrl = "https://maps.google.com/maps?q=โรงเรียนวชิรธรรมสาธิต&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const directDirectionsUrl = "https://www.google.com/maps/dir/?api=1&destination=โรงเรียนวชิรธรรมสาธิต";

  return (
    <section className="py-16 sm:py-24 bg-transparent relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-5xl">
        <div className="text-center max-w-2xl mx-auto mb-10 sm:mb-14">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-red-50 text-red-600 text-xs font-semibold mb-3 border border-red-100 select-none">
            <MapPin className="w-3.5 h-3.5" />
            <span>ที่ตั้งและแผนที่การเดินทาง</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 mb-3 tracking-tight">
            แผนที่<span className="text-red-600">โรงเรียนวชิรธรรมสาธิต</span>
          </h2>
          <p className="text-gray-600 text-xs sm:text-base font-light leading-relaxed">
            1253 ซอยวชิรธรรมสาธิต 57 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260
          </p>
        </div>

        <div className="w-full rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50 h-[320px] sm:h-[420px] md:h-[480px] relative group">
          <iframe
            src={mapUrl}
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
            title="แผนที่โรงเรียนวชิรธรรมสาธิต"
          />

          {/* Quick 1-Click Directions Floating Pill on Mobile & Desktop */}
          <div className="absolute bottom-4 right-4 sm:bottom-6 sm:right-6 z-20">
            <a
              href={directDirectionsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-white/95 hover:bg-white text-gray-900 font-bold text-xs sm:text-sm shadow-lg border border-gray-200 backdrop-blur-md active:scale-95 transition-all group-hover:bg-red-600 group-hover:text-white"
            >
              <Navigation className="w-4 h-4 text-red-600 group-hover:text-white transition-colors" />
              <span>เปิดนำทางใน Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-70" />
            </a>
          </div>
        </div>
      </div>
    </section>
  );
}
