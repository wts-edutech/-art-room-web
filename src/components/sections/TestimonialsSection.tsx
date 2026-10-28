"use client";

import { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Quote } from "lucide-react";

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

        {/* 2 columns on mobile, 2 columns on desktop */}
        <div className="grid grid-cols-2 gap-2.5 sm:gap-6 md:gap-8">
          {(Array.isArray(testimonials) ? testimonials : []).map((testimonial: any, index: number) => (
            <Card key={index} className="group h-full border border-gray-100 shadow-xs hover:shadow-lg transition-all duration-300 rounded-2xl sm:rounded-[2rem] hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50 flex flex-col">
              <CardContent className="p-3.5 sm:p-8 md:p-10 flex flex-col h-full relative overflow-hidden justify-between">
                <Quote className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 sm:w-20 sm:h-20 text-gray-50 opacity-40 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-50 pointer-events-none" />
                
                {testimonial.univImageUrl && (
                  <div className="absolute top-3 right-3 sm:top-6 sm:right-6 w-8 h-8 sm:w-16 sm:h-16 z-10 group-hover:scale-105 transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={testimonial.univImageUrl} alt="University Logo" className="w-full h-full object-contain drop-shadow-xs" />
                  </div>
                )}

                <p className="text-gray-700 text-[11px] sm:text-base md:text-[17px] mb-3 sm:mb-6 flex-grow leading-relaxed font-light relative z-10 italic line-clamp-3 sm:line-clamp-none">
                  &quot;{testimonial.quote}&quot;
                </p>

                <div className="flex items-center gap-2 sm:gap-4 mt-auto pt-2 sm:pt-4 border-t border-gray-100 relative z-10">
                  <div className="w-8 h-8 sm:w-14 sm:h-14 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shadow-inner shrink-0 border border-white">
                    {testimonial.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-4 h-4 sm:w-8 sm:h-8 opacity-70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <h3 className="font-heading font-bold text-xs sm:text-lg text-gray-900 leading-tight truncate">
                      {testimonial.name}
                    </h3>
                    <p className="text-orange-500 font-medium text-[9.5px] sm:text-xs md:text-sm leading-tight truncate mt-0.5">
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
