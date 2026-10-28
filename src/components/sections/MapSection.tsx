export default function MapSection() {
  return (
    <section className="py-10 sm:py-16 md:py-24 bg-transparent relative">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="text-center max-w-2xl mx-auto mb-5 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-heading text-gray-900 mb-1 sm:mb-3 tracking-tight">
            แผนที่โรงเรียน
          </h2>
          <p className="text-gray-600 text-xs sm:text-base md:text-xl font-light">
            โรงเรียนวชิรธรรมสาธิต 1253 ซอยวชิรธรรมสาธิต 57 แขวงบางจาก เขตพระโขนง
          </p>
        </div>

        <div className="w-full max-w-5xl mx-auto rounded-2xl sm:rounded-3xl overflow-hidden shadow-xl border border-gray-100 bg-gray-50 h-[240px] sm:h-[360px] md:h-[480px] relative">
          <iframe
            src="https://maps.google.com/maps?q=โรงเรียนวชิรธรรมสาธิต&t=&z=15&ie=UTF8&iwloc=&output=embed"
            width="100%"
            height="100%"
            style={{ border: 0 }}
            allowFullScreen
            loading="lazy"
            referrerPolicy="no-referrer-when-downgrade"
            className="absolute inset-0 w-full h-full"
            title="แผนที่โรงเรียนวชิรธรรมสาธิต"
          ></iframe>
        </div>
      </div>
    </section>
  );
}
