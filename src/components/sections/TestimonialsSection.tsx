"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote, Star, Sparkles, GraduationCap } from "lucide-react";

const FALLBACK_TESTIMONIALS = [
  {
    name: "รุ่นพี่สิริมา แซ่ลี้",
    university: "คณะมัณฑนศิลป์ มหาวิทยาลัยศิลปากร",
    quote: "การเรียนศิลปะที่ Art Room วชิรธรรมสาธิต ช่วยปูพื้นฐานการวาดเส้น EE และการจัดองค์ประกอบภาพได้อย่างมั่นใจ จนสามารถสอบติดคณะในฝันได้จริงค่ะ",
    imageUrl: "/images/cute-art-welcome.jpg",
  },
  {
    name: "รุ่นพี่ธนกร เจริญผล",
    university: "คณะสถาปัตยกรรมศาสตร์ จุฬาลงกรณ์มหาวิทยาลัย",
    quote: "อาจารย์ให้คำแนะนำเทคนิคสีน้ำและสีโปสเตอร์อย่างใกล้ชิด ทำให้มีแฟ้มสะสมผลงาน (Portfolio) ที่โดดเด่นและมีเอกลักษณ์เฉพาะตัว ขอบคุณ Art Room มากครับ",
    imageUrl: "/images/login-mascot.png",
  },
];

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>(FALLBACK_TESTIMONIALS);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => {
        if (!res.ok) throw new Error("Failed to fetch");
        return res.json();
      })
      .then((data) => {
        if (Array.isArray(data) && data.length > 0) {
          setTestimonials(data);
        }
      })
      .catch((err) => {
        console.warn("Using fallback testimonials:", err);
      });
  }, []);

  return (
    <section id="testimonials" className="py-16 sm:py-24 bg-transparent relative">
      <div className="container mx-auto px-4 sm:px-6 max-w-6xl">
        <div className="text-center max-w-3xl mx-auto mb-12 sm:mb-16">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 text-orange-600 text-xs font-semibold mb-3 border border-orange-100 select-none">
            <GraduationCap className="w-3.5 h-3.5" />
            <span>เรื่องเล่าจากรุ่นพี่สู่รุ่นน้อง</span>
          </div>
          <h2 className="text-2xl sm:text-4xl md:text-5xl font-black font-heading text-gray-900 mb-4 tracking-tight">
            เรียนกับ Art Room <span className="text-red-600">แล้วได้อะไร?</span>
          </h2>
          <p className="text-gray-600 text-sm sm:text-lg font-light">
            เสียงตอบรับและประสบการณ์จริงจากรุ่นพี่ที่ส่งต่อแรงบันดาลใจให้น้องๆ ก้าวสู่รั้วมหาวิทยาลัย
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-8">
          {testimonials.map((testimonial: any, index: number) => (
            <Card
              key={index}
              className="group h-full border border-gray-100 shadow-sm hover:shadow-2xl transition-all duration-300 rounded-3xl hover:-translate-y-1.5 bg-white/95 backdrop-blur-md overflow-hidden relative"
            >
              <CardContent className="p-6 sm:p-10 flex flex-col h-full relative">
                {/* Decorative background quotation mark */}
                <Quote className="absolute top-6 right-6 w-20 h-20 text-red-500/5 group-hover:text-red-500/10 transition-colors pointer-events-none" />

                {/* Star rating */}
                <div className="flex items-center gap-1 mb-4 text-amber-400">
                  {[1, 2, 3, 4, 5].map((s) => (
                    <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                  ))}
                  <span className="text-xs font-bold text-gray-400 ml-2">5.0 / 5.0</span>
                </div>

                <p className="text-gray-700 text-sm sm:text-base md:text-lg mb-8 flex-grow leading-relaxed font-light relative z-10 italic">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-4 mt-auto pt-4 border-t border-gray-100 relative z-10">
                  <div className="w-14 h-14 bg-gradient-to-br from-red-100 to-rose-200 rounded-2xl flex items-center justify-center text-gray-500 overflow-hidden shadow-inner shrink-0 border border-white">
                    {testimonial.imageUrl ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={testimonial.imageUrl}
                        alt={testimonial.name}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <span className="text-xl font-bold text-red-600 font-heading">
                        {testimonial.name?.charAt(0) || "ศ"}
                      </span>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-base sm:text-lg text-gray-900 mb-0.5 truncate">
                      {testimonial.name}
                    </h3>
                    <p className="text-orange-600 font-medium text-xs sm:text-sm truncate">
                      {testimonial.university}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    </section>
  );
}
