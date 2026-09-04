import Link from "next/link";
import { ArrowRight, ExternalLink } from "lucide-react";

export default function NewsSection({ featuredNews }: { featuredNews?: any }) {
  if (!featuredNews) return null;

  return (
    <section className="py-24 bg-transparent">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 gap-4">
          <div className="max-w-2xl">
            <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading text-gray-900 mb-4 tracking-tight">
              ข่าวสารและผลงานเด่น
            </h2>
            <p className="text-gray-600 text-lg font-light">
              อัปเดตเรื่องราวความภาคภูมิใจและผลงานที่โดดเด่นของนักเรียน
            </p>
          </div>
          <Link href="/news" className="inline-flex items-center gap-2 text-(--color-primary-500) font-medium hover:text-(--color-primary-400) transition-colors group">
            ดูข่าวสารทั้งหมด <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
          </Link>
        </div>

        <div className="max-w-6xl mx-auto">
          {/* Use a div if there is no external URL, otherwise Link */}
          <div className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl transition-all duration-500 border border-gray-100 flex flex-col lg:flex-row group-hover:-translate-y-1 relative group">
            
            {/* Image Section */}
            <div className="relative w-full lg:w-1/2 h-[300px] lg:h-[400px] overflow-hidden bg-gray-200">
              <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors duration-500 z-10"></div>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img 
                src={featuredNews.imageUrl} 
                alt={featuredNews.title}
                className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-700 ease-out"
              />
              <div className="absolute top-6 left-6 z-20">
                <span className="px-4 py-1.5 bg-black/50 backdrop-blur-md text-white text-sm font-medium rounded-full border border-white/20">
                  Featured
                </span>
              </div>
            </div>

            {/* Content Section */}
            <div className="w-full lg:w-1/2 p-8 md:p-12 flex flex-col justify-center bg-gradient-to-br from-gray-900 to-black text-white relative overflow-hidden">
              {/* Decorative background circle */}
              <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:bg-white/10 transition-colors duration-500"></div>

              <div className="flex items-center gap-3 mb-6 text-gray-300 text-sm font-light relative z-10">
                <span className="font-medium text-white">{featuredNews.source}</span>
                <span className="w-1.5 h-1.5 rounded-full bg-gray-500"></span>
                <span>{featuredNews.date}</span>
              </div>

              <h3 className="text-2xl md:text-3xl lg:text-4xl font-bold font-heading mb-6 leading-snug group-hover:text-blue-400 transition-colors duration-300 relative z-10">
                {featuredNews.title}
              </h3>
              
              <p className="text-gray-300 text-lg leading-relaxed font-light mb-8 line-clamp-4 relative z-10">
                {featuredNews.excerpt}
              </p>

              {featuredNews.url && (
                <div className="relative z-10">
                  <a href={featuredNews.url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-6 py-3 bg-white text-gray-900 font-medium rounded-xl hover:bg-gray-100 transition-colors shadow-sm">
                    อ่านบทความต้นฉบับ <ExternalLink className="w-4 h-4" />
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
