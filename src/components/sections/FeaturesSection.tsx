import Link from "next/link";
import { Palette, Lightbulb, Smile, BookOpen, ArrowRight, Sparkles, CheckCircle2 } from "lucide-react";

export default function FeaturesSection() {
  const features = [
    {
      title: "เรียนสนุก ปลดปล่อยจินตนาการ",
      subtitle: "Creative Fun",
      tag: "เปิดกว้างทุกความคิด",
      description: "คลาสเรียนที่ออกแบบมาให้ผู้เรียนได้สนุกกับการค้นพบตัวเองผ่านศิลปะ ไม่มีถูกผิด ให้ทุกชิ้นงานสะท้อนเอกลักษณ์เฉพาะตัว",
      icon: Smile,
      gradient: "from-rose-500 to-pink-500",
      bgSoft: "bg-rose-500/10 text-rose-600 border-rose-200/60",
      glowColor: "group-hover:shadow-rose-500/20",
      link: "/ideas",
      linkText: "ชมไอเดียสร้างสรรค์",
    },
    {
      title: "เข้าใจง่าย เริ่มจากศูนย์ก็เป็น",
      subtitle: "Easy Step-by-Step",
      tag: "เหมาะกับทุกระดับ",
      description: "อธิบายเทคนิคและขั้นตอนอย่างละเอียด เริ่มจากพื้นฐานการร่าง การลงน้ำหนัก ไปจนถึงการเก็บรายละเอียดงานอย่างมืออาชีพ",
      icon: Lightbulb,
      gradient: "from-amber-500 to-yellow-500",
      bgSoft: "bg-amber-500/10 text-amber-600 border-amber-200/60",
      glowColor: "group-hover:shadow-amber-500/20",
      link: "/materials",
      linkText: "ดูเทคนิคพื้นฐาน",
    },
    {
      title: "หลากหลายเทคนิค ครบทุกด้าน",
      subtitle: "Multi-Mediums",
      tag: "4 หมวดหมู่หลัก",
      description: "ครอบคลุมทั้งสีน้ำ (Watercolor), สีไม้ (Color Pencil), สีโปสเตอร์ (Poster Color) และการวาดเส้นด้วยดินสอ EE (Drawing)",
      icon: Palette,
      gradient: "from-blue-600 to-indigo-500",
      bgSoft: "bg-blue-500/10 text-blue-600 border-blue-200/60",
      glowColor: "group-hover:shadow-blue-500/20",
      link: "/materials",
      linkText: "เลือกเทคนิคที่ชอบ",
    },
    {
      title: "สื่อการสอนครบครัน โหลดฟรี",
      subtitle: "Resource Library",
      tag: "ใบงาน + วิดีโอ",
      description: "รวบรวมคลิปวิดีโอสาธิต สื่อสไลด์สอน ใบงานฝึกทักษะ และแบบฝึกหัดพัฒนาฝีมือ ให้เข้าถึงได้ 24 ชั่วโมง ทุกที่ทุกเวลา",
      icon: BookOpen,
      gradient: "from-emerald-500 to-teal-500",
      bgSoft: "bg-emerald-500/10 text-emerald-600 border-emerald-200/60",
      glowColor: "group-hover:shadow-emerald-500/20",
      link: "/downloads",
      linkText: "ดาวน์โหลดสื่อการสอน",
    },
  ];

  return (
    <section id="features" className="relative py-20 sm:py-28 overflow-hidden bg-transparent">
      {/* Background ambient decorative blurs */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-7xl h-[600px] pointer-events-none opacity-40 blur-3xl -z-10 flex justify-between">
        <div className="w-96 h-96 bg-red-200/40 rounded-full" />
        <div className="w-96 h-96 bg-blue-200/30 rounded-full" />
      </div>

      <div className="container mx-auto px-4 sm:px-6">
        {/* Section Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>ทำไมต้องเรียนกับ Art Room</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            พื้นที่เรียนรู้ศิลปะที่{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-pink-600">
              สร้างสรรค์ ไร้ขีดจำกัด
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-light leading-relaxed">
            โรงเรียนวชิรธรรมสาธิต มุ่งมั่นพัฒนาการเรียนการสอนศิลปะยุคใหม่ <br className="hidden md:block" />
            ผสมผสานเทคนิคดั้งเดิมเข้ากับสื่อนวัตกรรมดิจิทัล เพื่อให้นักเรียนทุกคนเปล่งประกายในแบบของตัวเอง
          </p>
        </div>

        {/* Feature Cards Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 lg:gap-8">
          {features.map((feature, index) => {
            const Icon = feature.icon;
            return (
              <div
                key={index}
                className={`group relative bg-white/90 backdrop-blur-md rounded-3xl p-7 sm:p-8 border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-500 hover:-translate-y-2 flex flex-col justify-between overflow-hidden ${feature.glowColor}`}
              >
                {/* Subtle top decorative bar with gradient */}
                <div
                  className={`absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r ${feature.gradient} opacity-80 group-hover:h-2 transition-all duration-300`}
                />

                <div>
                  {/* Top row: Icon + Tag */}
                  <div className="flex items-center justify-between gap-3 mb-6">
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center bg-gradient-to-br ${feature.gradient} text-white shadow-md group-hover:scale-110 group-hover:rotate-3 transition-transform duration-500`}
                    >
                      <Icon className="w-7 h-7 drop-shadow-xs" />
                    </div>
                    <span
                      className={`text-xs font-semibold px-3 py-1 rounded-full border ${feature.bgSoft}`}
                    >
                      {feature.tag}
                    </span>
                  </div>

                  {/* Subtitle / English Label */}
                  <div className="text-[11px] font-bold tracking-widest text-gray-400 uppercase mb-1">
                    {feature.subtitle}
                  </div>

                  {/* Title */}
                  <h3 className="text-xl font-bold font-heading text-gray-900 mb-3 group-hover:text-red-600 transition-colors duration-300">
                    {feature.title}
                  </h3>

                  {/* Description */}
                  <p className="text-gray-600 text-sm leading-relaxed font-light mb-6">
                    {feature.description}
                  </p>
                </div>

                {/* Footer Link */}
                <div className="pt-4 border-t border-gray-100/80">
                  <Link
                    href={feature.link}
                    className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-gray-700 group-hover:text-red-600 transition-colors duration-200"
                  >
                    <span>{feature.linkText}</span>
                    <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform duration-200" />
                  </Link>
                </div>
              </div>
            );
          })}
        </div>

        {/* Quick Bottom Highlight Banner */}
        <div className="mt-14 sm:mt-18 rounded-3xl bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900 text-white p-6 sm:p-10 shadow-xl border border-gray-800 relative overflow-hidden">
          <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
          <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-6">
            <div className="text-center md:text-left">
              <div className="flex items-center justify-center md:justify-start gap-2 text-red-400 text-xs sm:text-sm font-semibold uppercase tracking-wider mb-2">
                <CheckCircle2 className="w-4 h-4" />
                <span>หลักสูตรมาตรฐาน กลุ่มสาระการเรียนรู้ศิลปะ</span>
              </div>
              <h4 className="text-xl sm:text-2xl font-bold font-heading text-white mb-2">
                พร้อมเปิดประสบการณ์ศิลปะไปกับเราแล้วหรือยัง?
              </h4>
              <p className="text-gray-400 text-sm font-light max-w-2xl">
                เข้าสู่คลังบทเรียน ค้นพบเทคนิคใหม่ๆ หรือร่วมแชร์ไอเดียผลงานสร้างสรรค์ของคุณได้ทันที
              </p>
            </div>
            <div className="flex flex-wrap items-center justify-center gap-3 shrink-0">
              <Link
                href="/materials"
                className="px-6 py-3 rounded-full bg-red-600 hover:bg-red-700 text-white font-bold text-sm shadow-lg shadow-red-600/30 transition-all hover:scale-105 active:scale-95"
              >
                เข้าสู่คลังสื่อการสอน
              </Link>
              <Link
                href="/artworks"
                className="px-6 py-3 rounded-full bg-white/10 hover:bg-white/20 text-white font-semibold text-sm border border-white/20 backdrop-blur-md transition-all hover:scale-105 active:scale-95"
              >
                ชมแกลเลอรี่ผลงาน
              </Link>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
