"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, GraduationCap, Sparkles } from "lucide-react";

interface Testimonial {
  id?: string;
  name: string;
  university: string;
  quote: string;
  imageUrl?: string;
  univImageUrl?: string;
  faculty?: string;
  year?: string;
}

const DEFAULT_TESTIMONIALS: Testimonial[] = [
  {
    id: "default-1",
    name: "นายภัทรดนัย วิทยาวรากร",
    university: "มหาวิทยาลัยศิลปากร",
    faculty: "คณะมัณฑนศิลป์ (ออกแบบนิเทศศิลป์)",
    quote: "การได้เรียนพื้นฐานที่ Art Room วชิรธรรมสาธิต ทำให้ผมเข้าใจเรื่องการจัดองค์ประกอบภาพ แสงเงา และเทคนิคสีน้ำอย่างลึกซึ้ง คุณครูให้คำปรึกษาพอร์ตโฟลิโออย่างใกล้ชิด จนสามารถสอบติดคณะในฝันได้ครับ",
    imageUrl: "https://images.unsplash.com/photo-1539571696357-5a69c17a67c6?w=200&auto=format&fit=crop&q=80",
    year: "รุ่นปี 2567",
  },
  {
    id: "default-2",
    name: "นางสาวชญาภา เกียรติไพบูลย์",
    university: "จุฬาลงกรณ์มหาวิทยาลัย",
    faculty: "คณะสถาปัตยกรรมศาสตร์",
    quote: "ห้องเรียนศิลปะที่นี่เปิดกว้างมาก ไม่ตีกรอบความคิด ทำให้เรากล้าทดลองเทคนิคใหม่ๆ ทั้งการวาดเส้น EE และการใช้คู่สีที่โดดเด่น สื่อการสอนออนไลน์ในเว็บก็ช่วยให้ทบทวนเทคนิคที่บ้านได้ตลอดเวลา",
    imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    year: "รุ่นปี 2568",
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<Testimonial[]>(DEFAULT_TESTIMONIALS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => {
        if (!res.ok) throw new Error("Network response was not ok");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch((err) => {
        console.warn("Using default testimonials:", err);
      })
      .finally(() => {
        setIsLoading(false);
      });
  }, []);

  return (
    <section id="testimonials" className="relative py-20 sm:py-28 overflow-hidden bg-transparent">
      {/* Decorative background orbs */}
      <div className="absolute top-1/3 -left-32 w-80 h-80 bg-red-100/40 rounded-full blur-3xl pointer-events-none -z-10" />
      <div className="absolute bottom-10 -right-32 w-80 h-80 bg-amber-100/40 rounded-full blur-3xl pointer-events-none -z-10" />

      <div className="container mx-auto px-4 sm:px-6 relative z-10">
        {/* Header */}
        <div className="text-center max-w-3xl mx-auto mb-16 sm:mb-20">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-50 border border-red-200/80 text-red-600 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-red-500" />
            <span>เสียงตอบรับจากรุ่นพี่ศิษย์เก่า</span>
          </div>

          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            เรียนกับ Art Room แล้ว{" "}
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-rose-600 to-pink-600">
              ต่อยอดได้จริง
            </span>
          </h2>
          <p className="text-gray-600 text-base sm:text-lg lg:text-xl font-light leading-relaxed">
            ประสบการณ์จริงและแรงบันดาลใจจากรุ่นพี่สู่รุ่นน้อง ร่วมก้าวสู่สถาบันและเส้นทางอาชีพในฝัน
          </p>
        </div>

        {/* Testimonials Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-8 max-w-6xl mx-auto">
          {testimonials.map((item, index) => (
            <Card
              key={item.id || index}
              className="group relative h-full border border-gray-100/90 shadow-sm hover:shadow-2xl transition-all duration-500 rounded-3xl hover:-translate-y-1.5 bg-white/95 backdrop-blur-md overflow-hidden flex flex-col justify-between"
            >
              {/* Subtle gradient glow header */}
              <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-red-500 via-rose-500 to-orange-400 opacity-80" />

              <CardContent className="p-7 sm:p-10 flex flex-col h-full relative z-10">
                {/* Top: Star ratings + Quote Icon + University Logo */}
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-1 text-amber-400">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                    <span className="ml-2 text-xs font-semibold text-gray-500">5.0</span>
                  </div>

                  {item.univImageUrl ? (
                    <div className="w-12 h-12 rounded-xl bg-gray-50 border border-gray-100 p-1 flex items-center justify-center shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={item.univImageUrl}
                        alt="University Logo"
                        className="max-h-full max-w-full object-contain"
                      />
                    </div>
                  ) : (
                    <div className="w-10 h-10 rounded-xl bg-red-50 text-red-500 flex items-center justify-center shrink-0">
                      <GraduationCap className="w-5 h-5" />
                    </div>
                  )}
                </div>

                {/* Quote Content */}
                <div className="relative flex-grow mb-8">
                  <Quote className="absolute -top-3 -left-2 w-8 h-8 text-red-100 pointer-events-none -z-10" />
                  <p className="text-gray-700 text-base sm:text-lg leading-relaxed font-light italic">
                    &ldquo;{item.quote}&rdquo;
                  </p>
                </div>

                {/* Author Info */}
                <div className="flex items-center gap-4 pt-6 border-t border-gray-100">
                  <div className="relative w-14 h-14 rounded-full overflow-hidden shrink-0 border-2 border-red-100 shadow-xs bg-gray-100">
                    {item.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img
                        src={item.imageUrl}
                        alt={item.name}
                        className="w-full h-full object-cover"
                        onError={(e) => {
                          (e.target as HTMLImageElement).src =
                            "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80";
                        }}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-red-500 to-rose-600 text-white font-bold text-lg">
                        {item.name.charAt(0)}
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h4 className="font-heading font-bold text-base sm:text-lg text-gray-900 truncate">
                      {item.name}
                    </h4>
                    <p className="text-red-600 font-medium text-xs sm:text-sm truncate">
                      {item.university}
                    </p>
                    {item.faculty && (
                      <p className="text-gray-500 text-xs truncate font-light">
                        {item.faculty}
                      </p>
                    )}
                  </div>

                  {item.year && (
                    <span className="hidden sm:inline-block text-[11px] font-medium text-gray-400 bg-gray-100 px-2.5 py-1 rounded-full shrink-0">
                      {item.year}
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
