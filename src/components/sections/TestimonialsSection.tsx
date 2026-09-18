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
    <section id="testimonials" className="py-24 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-20">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
            เรียนกับ Art room แล้วได้อะไร?
          </h2>
          <p className="text-gray-600 text-lg md:text-xl font-light">
            เสียงตอบรับและประสบการณ์จริงจากรุ่นพี่ที่ส่งต่อแรงบันดาลใจให้น้องๆ
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8 lg:gap-10">
          {(Array.isArray(testimonials) ? testimonials : []).map((testimonial: any, index: number) => (
            <Card key={index} className="group h-full border border-gray-100 shadow-md hover:shadow-2xl transition-all duration-300 rounded-[2rem] hover:-translate-y-1 bg-gradient-to-br from-white to-gray-50/50">
              <CardContent className="p-8 md:p-12 flex flex-col h-full relative overflow-hidden">
                <Quote className="absolute top-8 right-8 w-24 h-24 text-gray-50 opacity-50 group-hover:scale-110 transition-transform duration-500 group-hover:text-red-50 z-0" />
                
                {testimonial.univImageUrl && (
                  <div className="absolute top-6 right-6 md:top-8 md:right-8 w-16 h-16 md:w-20 md:h-20 z-10 group-hover:scale-105 transition-all duration-300">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img src={testimonial.univImageUrl} alt="University Logo" className="w-full h-full object-contain drop-shadow-md" />
                  </div>
                )}

                <p className="text-gray-700 text-lg md:text-[19px] mb-12 flex-grow leading-relaxed font-light relative z-10 pr-14 md:pr-24">
                  &quot;{testimonial.quote}&quot;
                </p>
                <div className="flex items-center gap-5 mt-auto relative z-10">
                  <div className="w-16 h-16 bg-gradient-to-br from-gray-100 to-gray-200 rounded-full flex items-center justify-center text-gray-400 overflow-hidden shadow-inner flex-shrink-0 border-2 border-white">
                    {testimonial.imageUrl ? (
                      /* eslint-disable-next-line @next/next/no-img-element */
                      <img src={testimonial.imageUrl} alt={testimonial.name} className="w-full h-full object-cover" />
                    ) : (
                      <svg className="w-8 h-8 opacity-70" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                        <path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" />
                      </svg>
                    )}
                  </div>
                  <div className="flex-1">
                    <h4 className="font-heading font-bold text-xl md:text-2xl text-gray-900 mb-1">
                      {testimonial.name}
                    </h4>
                    <div className="flex items-center gap-2">
                      <p className="text-orange-500 font-medium text-sm md:text-base">
                        {testimonial.university}
                      </p>
                    </div>
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
