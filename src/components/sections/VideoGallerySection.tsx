import LiteYouTube from "@/components/ui/LiteYouTube";
import { PlayCircle } from "lucide-react";

export default function VideoGallerySection() {
  const videos = [
    {
      title: "เทคนิคการวาดเส้น ประเภทของเส้น",
      videoId: "AB1QIlCEDDU",
    },
    {
      title: "สอนลงสีไม้รูปมังคุด",
      videoId: "Frj7Onjr4kg",
    },
    {
      title: "เทคนิคสีไม้ รูปผีเสื้อ",
      videoId: "71JjYfjynTM",
    }
  ];

  return (
    <section id="learning-videos" className="py-24 bg-gray-900 text-white">
      <div className="container mx-auto px-4 sm:px-6">
        <div className="text-center max-w-3xl mx-auto mb-16">
          <h2 className="text-3xl md:text-4xl lg:text-5xl font-bold font-heading mb-6 tracking-tight">
            สื่อการสอน <span className="text-(--color-accent-yellow)">Art Room</span>
          </h2>
          <p className="text-gray-300 text-lg md:text-xl font-light">
            เรียนรู้เทคนิคการสร้างสรรค์ผลงานศิลปะผ่านวิดีโอสอนที่เข้าใจง่ายและทำตามได้ทันที
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {videos.map((video, index) => (
            <div key={index} className="group flex flex-col bg-gray-800 rounded-3xl overflow-hidden shadow-xl hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 border border-gray-700">
              {/* Lite Video Container (Lazy-loaded, Zero Initial Lag) */}
              <LiteYouTube 
                videoId={video.videoId} 
                title={video.title} 
                className="w-full"
              />
              <div className="p-6">
                <h3 className="text-xl font-bold font-heading text-white group-hover:text-(--color-accent-yellow) transition-colors line-clamp-2">
                  {video.title}
                </h3>
              </div>
            </div>
          ))}
        </div>
        
        <div className="mt-16 text-center">
          <a 
            href="https://youtube.com/@artroom-u4l" 
            target="_blank" 
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 px-8 py-4 bg-red-600 hover:bg-red-700 text-white rounded-full font-medium transition-all hover:scale-105 hover:shadow-lg hover:shadow-red-500/30"
          >
            <PlayCircle className="w-5 h-5" /> ดูคลิปสอนทั้งหมดบน YouTube
          </a>
        </div>
      </div>
    </section>
  );
}
