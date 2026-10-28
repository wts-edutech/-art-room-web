"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";

export default function TestimonialsSection() {
  const [testimonials, setTestimonials] = useState<any[]>([]);

  useEffect(() => {
    fetch("/api/testimonials")
      .then((res) => res.json())
      .then((data) => {
        if (Array.isArray(data)) {
          setTestimonials(data);
        }
      })
      .catch((err) => console.error("Failed to fetch testimonials:", err));
  }, []);

  return (
    <section id="testimonials" className="py-10 sm:py-16 md:py-24 bg-transparent">
      <div className="container mx-auto px-3 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-6 sm:mb-12 md:mb-16">
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-heading text-gray-900 mb-1.5 sm:mb-3 tracking-tight">
            เรียนกับ Art room แล้วได้อะไร?
          </h2>
          <p className="text-gray-600 text-xs sm:text-base md:text-xl font-light">
            เสียงตอบรับและประสบการณ์จริงจากรุ่นพี่ที่ส่งต่อแรงบันดาลใจให้น้องๆ
          </p>
        </div>

        {/* 1 column on mobile (อ่านง่าย ไม่บีบตัวหนังสือ), 2 columns on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 md:gap-8">
          {(Array.isArray(testimonials) ? testimonials : []).map((testimonial: any, index: number) => (
            <Card
              key={index}
              className="group h-full border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-3xl hover:-translate-y-1 bg-white flex flex-col overflow-hidden"
            >
              <CardContent className="p-4 sm:p-7 md:p-8 flex flex-col h-full gap-3 sm:gap-4">
                {/* แถบด้านบน: ป้ายรุ่นพี่ + ตรามหาวิทยาลัย (แยกออกจากข้อความอย่างชัดเจน ไม่บังตัวหนังสือ) */}
                <div className="flex items-center justify-between gap-2 pb-2 border-b border-gray-100/80">
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/70 text-orange-700 text-xs font-semibold">
                    <svg className="w-3.5 h-3.5 text-orange-500 fill-orange-500 shrink-0" viewBox="0 0 20 20" aria-hidden="true">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                    </svg>
                    <span>ศิษย์เก่า Art Room</span>
                  </span>

                  {testimonial.univImageUrl ? (
                    <div className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-white border border-gray-100/90 shadow-2xs p-1 flex items-center justify-center shrink-0 transition-transform duration-300 group-hover:scale-105">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={testimonial.univImageUrl}
                        alt="ตรามหาวิทยาลัย"
                        className="w-full h-full object-contain mix-blend-multiply drop-shadow-2xs"
                      />
                    </div>
                  ) : (
                    <div className="w-9 h-9 rounded-xl bg-orange-50/50 border border-orange-100 flex items-center justify-center text-orange-400">
                      <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                      </svg>
                    </div>
                  )}
                </div>

                {/* ข้อความรีวิว — เว้นระยะบรรทัด 1.85-1.9 เพื่อป้องกันสระ/วรรณยุกต์ภาษาไทยชนกัน */}
                <p className="text-gray-700 text-[14px] sm:text-[15.5px] leading-[1.85] font-normal break-words flex-grow my-1">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* แถบข้อมูลรุ่นพี่ด้านล่าง: รูป + ชื่อ + คณะ/มหาวิทยาลัย (ได้ความกว้างเต็มการ์ด ไม่โดนตรามหาวิทยาลัยเบียด) */}
                <div className="flex items-center gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100 mt-auto">
                  <div className="w-12 h-12 sm:w-14 sm:h-14 bg-gradient-to-br from-orange-100 to-orange-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border-2 border-orange-200/80 shadow-2xs">
                    {testimonial.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-6 h-6 sm:w-8 sm:h-8 opacity-70 text-gray-500" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-[15px] sm:text-base text-gray-900 leading-snug">
                      {testimonial.name}
                    </h3>
                    <p className="text-orange-600 font-semibold text-xs sm:text-[13px] leading-relaxed mt-0.5 break-words">
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
