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
          <h2 className="text-xl sm:text-3xl md:text-5xl font-bold font-heading text-gray-900 mb-1 sm:mb-3 tracking-tight">
            เรียนกับ Art room แล้วได้อะไร?
          </h2>
          <p className="text-gray-600 text-xs sm:text-base md:text-xl font-light">
            เสียงตอบรับและประสบการณ์จริงจากรุ่นพี่ที่ส่งต่อแรงบันดาลใจให้น้องๆ
          </p>
        </div>

        {/* 1 column on mobile (ข้อความแสดงครบ), 2 columns on tablet/desktop */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-6 md:gap-8">
          {(Array.isArray(testimonials) ? testimonials : []).map((testimonial: any, index: number) => (
            <Card key={index} className="group h-full border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-[2rem] hover:-translate-y-1 bg-white flex flex-col">
              <CardContent className="p-4 sm:p-8 md:p-10 flex flex-col h-full gap-3 sm:gap-5">
                {/* Quote text — ไม่ใช้ตัวเอียง/บรรทัดชิด เพื่อไม่ให้สระและวรรณยุกต์ไทยทับกัน */}
                <p className="text-gray-700 text-[14px] sm:text-base md:text-[17px] leading-[1.8] font-normal break-words flex-grow">
                  &ldquo;{testimonial.quote}&rdquo;
                </p>

                {/* Profile row: avatar | name + university | university logo */}
                <div className="flex items-start gap-3 sm:gap-4 pt-3 sm:pt-4 border-t border-gray-100">
                  <div className="w-11 h-11 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shrink-0 border border-white shadow-xs">
                    {testimonial.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-5 h-5 sm:w-8 sm:h-8 opacity-70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-[15px] sm:text-lg text-gray-900 leading-normal">
                      {testimonial.name}
                    </h3>
                    <p className="text-orange-600 font-medium text-[12.5px] sm:text-sm leading-normal mt-0.5 break-words">
                      {testimonial.university}
                    </p>
                  </div>

                  {testimonial.univImageUrl && (
                    <div className="w-10 h-10 sm:w-14 sm:h-14 shrink-0">
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img src={testimonial.univImageUrl} alt="ตรามหาวิทยาลัย" className="w-full h-full object-contain" />
                    </div>
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
