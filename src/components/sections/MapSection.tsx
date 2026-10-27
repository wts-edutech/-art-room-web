import { MapPin, Navigation, ExternalLink, School } from "lucide-react";

export default function MapSection() {
  const mapUrl = "https://maps.google.com/maps?q=โรงเรียนวชิรธรรมสาธิต&t=&z=15&ie=UTF8&iwloc=&output=embed";
  const directMapsLink = "https://maps.google.com/?q=โรงเรียนวชิรธรรมสาธิต";

  return (
    <section className="relative py-20 sm:py-28 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>ที่ตั้งและการเดินทาง</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-4 tracking-tight">
            แผนที่{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-pink-600">
              โรงเรียนวชิรธรรมสาธิต
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg font-light leading-relaxed">
            1253 ซอยวชิรธรรมสาธิต 57 ถนนสุขุมวิท 101/1 แขวงบางจาก เขตพระโขนง กรุงเทพมหานคร 10260
          </p>
        </div>

        {/* Map Card Container */}
        <div className="w-full max-w-5xl mx-auto rounded-3xl overflow-hidden shadow-2xl border border-gray-100 bg-white relative">
          {/* Top Bar with School Info and Quick Direction Button */}
          <div className="p-4 sm:p-6 bg-white/95 border-b border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3 text-left">
              <div className="w-10 h-10 rounded-xl bg-red-50 text-red-600 flex items-center justify-center shrink-0">
                <School className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-gray-900 text-sm sm:text-base leading-tight">
                  กลุ่มสาระการเรียนรู้ศิลปะ ห้อง Art Room
                </h4>
                <p className="text-xs text-gray-500 font-light mt-0.5">
                  อาคารเรียนโรงเรียนวชิรธรรมสาธิต (BTS อุดมสุข / ปุณณวิถี)
                </p>
              </div>
            </div>

            <a
              href={directMapsLink}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 px-4 py-2.5 rounded-full bg-red-600 hover:bg-red-700 text-white text-xs sm:text-sm font-bold shadow-md shadow-red-600/20 active:scale-95 transition-all shrink-0"
            >
              <Navigation className="w-4 h-4" />
              <span>นำทางด้วย Google Maps</span>
              <ExternalLink className="w-3.5 h-3.5 opacity-80" />
            </a>
          </div>

          {/* Embedded Google Map iframe */}
          <div className="relative w-full h-[360px] sm:h-[440px] md:h-[500px] bg-gray-100">
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
          </div>
        </div>
      </div>
    </section>
  );
}
