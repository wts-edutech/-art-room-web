"use client";

import { useState, useEffect, useRef } from "react";
import { 
  Play, ChevronLeft, ChevronRight, X, Clock, 
  Eye, Share2, Check, Heart, ExternalLink, Palette, 
  CheckCircle2, ListOrdered, Video, ArrowLeft
} from "lucide-react";

export interface StudentVideoItem {
  id: string;
  title: string;
  category: string;
  categoryColor: string;
  duration: string;
  creatorName: string;
  creatorGrade: string;
  creatorAvatar: string;
  thumbnailUrl: string;
  videoUrl: string;
  youtubeId: string;
  views: number;
  likes: number;
  description: string;
  materials: string[];
  steps: string[];
}

export const STUDENT_VIDEOS: StudentVideoItem[] = [
  {
    id: "vid-1",
    title: "วิธีเพ้นท์สีกระเป๋าผ้าแคนวาสลายธรรมชาติ ด้วยเทคนิคสีอะคริลิกกันน้ำ",
    category: "🎨 วิธีทำ DIY",
    categoryColor: "bg-amber-100 text-amber-800 border-amber-200",
    duration: "04:25",
    creatorName: "ด.ญ. ธนัชชา วชิรเวท",
    creatorGrade: "ชั้นมัธยมศึกษาปีที่ 2/1",
    creatorAvatar: "ธ",
    thumbnailUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=lLWEXRAnQd0",
    youtubeId: "lLWEXRAnQd0", // Bob Ross Island in the Wilderness (100% embeddable)
    views: 428,
    likes: 64,
    description: "โปรเจกต์เปลี่ยนกระเป๋าผ้าธรรมดาให้กลายเป็นงานศิลปะชิ้นเดียวในโลก ด้วยเทคนิคการร่างภาพและลงน้ำหนักสีอะคริลิกที่ติดทน ไม่หลุดลอกเมื่อซัก",
    materials: [
      "กระเป๋าผ้าแคนวาสสีธรรมชาติ",
      "สีอะคริลิก (แม่สี 3 สี + ขาว/ดำ)",
      "พู่กันกลมเบอร์ 2, 6 และพู่กันแบนเบอร์ 10",
      "กระดาษคาร์บอนสำหรับลอกลาย",
      "น้ำยาเคลือบเงาผ้า (Fabric Medium)"
    ],
    steps: [
      "สอดกระดาษแข็งหรือแผ่นรองไว้ด้านในกระเป๋าเพื่อป้องกันสีซึมเปื้อน",
      "ร่างแบบลวดลายธรรมชาติลงบนกระดาษ แล้วใช้กระดาษคาร์บอนถ่ายลายลงบนผ้า",
      "ผสมสีอะคริลิกกับ Fabric Medium เล็กน้อยเพื่อให้เนื้อสีซึมเข้าเส้นใยได้ดี",
      "เริ่มลงสีพื้นหลังและก้านใบไม้ก่อน จากนั้นรอให้แห้งสนิท 15 นาที",
      "ลงรายละเอียดเกสร ดอกไม้ และเน้นเส้นขอบเพื่อเพิ่มมิติความคมชัด",
      "ทิ้งไว้ให้แห้ง 24 ชั่วโมง แล้วใช้เตารีดทับด้วยผ้าบางๆ เพื่อล็อคเม็ดสี"
    ]
  },
  {
    id: "vid-2",
    title: "เทคนิคระบายสีน้ำ Wet-on-Wet วาดท้องฟ้ายามเย็นและแสงสนธยา",
    category: "🖌️ เทคนิคสีน้ำ",
    categoryColor: "bg-blue-100 text-blue-800 border-blue-200",
    duration: "05:40",
    creatorName: "นายกิตติภูมิ รักษ์ศิลป์",
    creatorGrade: "ชั้นมัธยมศึกษาปีที่ 4/3",
    creatorAvatar: "ก",
    thumbnailUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=1s58rW0_LN4",
    youtubeId: "1s58rW0_LN4", // Bob Ross Mountain Reflection (100% embeddable)
    views: 612,
    likes: 89,
    description: "เรียนรู้การควบคุมความชื้นของน้ำและกระดาษ เพื่อสร้างเฉดสีท้องฟ้าไล่ระดับสีส้ม ม่วง และน้ำเงินครามได้อย่างนุ่มนวลเป็นธรรมชาติ",
    materials: [
      "กระดาษสีน้ำ Cotton 100% หนา 300 แกรม",
      "สีน้ำเกรดสตูดิโอ (Lemon Yellow, Crimson Lake, Ultramarine Blue)",
      "พู่กัน Mop หรือพู่กันพุ่มกลมขนสัตว์",
      "สก็อตเทปกระดาษยึดขอบกระดาษ",
      "กระบอกฉีดน้ำและกระดาษทิชชู่อเนกประสงค์"
    ],
    steps: [
      "ติดเทปกระดาษรอบขอบกระดาษ 4 ด้านบนกระดานรองวาดให้แน่นสนิท",
      "ใช้พู่กันจุ่มน้ำสะอาดปาดทั่วแผ่นกระดาษให้ชุ่มสม่ำเสมอ (ไม่ให้มีน้ำขัง)",
      "ลงสีเหลืองสว่างบริเวณจุดรวมแสงอาทิตย์ ขณะที่กระดาษยังเปียก",
      "นำสีส้มแดงและสีม่วงมาแตะเชื่อมต่อ ปล่อยให้สีไหลผสานกันเองตามธรรมชาติ",
      "แต้มสีน้ำเงินเข้มที่ขอบบนของท้องฟ้าเพื่อสร้างมิติความลึก",
      "เมื่อสีเริ่มหมาด ใช้พู่กันชุบสีเข้มวาดเงาภูเขาและเงาต้นไม้สีดำทึบด้านล่าง"
    ]
  },
  {
    id: "vid-3",
    title: "ปั้นกระถางดินเผาจิ๋ว DIY แบบ Hand-Building ไม่ต้องใช้แป้นหมุน",
    category: "🏺 ประติมากรรม & ปั้น",
    categoryColor: "bg-emerald-100 text-emerald-800 border-emerald-200",
    duration: "03:50",
    creatorName: "ด.ช. พัทธดนย์ จันทร์หอม",
    creatorGrade: "ชั้นมัธยมศึกษาปีที่ 3/2",
    creatorAvatar: "พ",
    thumbnailUrl: "https://images.unsplash.com/photo-1565193566173-7a0ee3dbe261?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=aqz-KE-bpKQ",
    youtubeId: "aqz-KE-bpKQ", // Open Creative Film
    views: 385,
    likes: 52,
    description: "เทคนิคการปั้นดินแบบขึ้นรูปด้วยมือ (Pinch & Coil Pot) ทำกระถางต้นกระบองเพชรทรงเรขาคณิตน่ารัก ฝึกสมาธิและการประสานงานของกล้ามเนื้อมือ",
    materials: [
      "ดินเหนียวขาว หรือดินแอร์กดราย (Air Dry Clay) 300 กรัม",
      "เครื่องมือปั้นดินไม้หรือช้อนพลาสติก",
      "ฟองน้ำชุบน้ำหมาดๆ สำหรับเกลี่ยผิว",
      "สีอะคริลิกและแปรงสำหรับระบายตกแต่ง"
    ],
    steps: [
      "นวดดินเหนียวให้เป็นก้อนกลมเนียน เพื่อไล่ฟองอากาศด้านในออกให้หมด",
      "ใช้นิ้วหัวแม่มือกดลงกึ่งกลางก้อนดินให้เกิดเป็นหลุมลึกพอประมาณ",
      "ใช้นิ้วมือค่อยๆ บีบขยายผนังดินวนเป็นวงกลมให้ความหนาสม่ำเสมอทั่วทั้งใบ",
      "ใช้ฟองน้ำชุบน้ำหมาดๆ ลูบผิวรอบนอกและปากกระถางให้เรียบเนียน",
      "เจาะรูระบายน้ำที่ก้นกระถางขนาดเส้นผ่านศูนย์กลาง 5 มม.",
      "ผึ่งลมในที่ร่มประมาณ 48 ชั่วโมงจนแห้งสนิท แล้วระบายสีตกแต่งตามใจชอบ"
    ]
  },
  {
    id: "vid-4",
    title: "สร้างแอนิเมชัน 2D สั้น 10 วินาทีบน Procreate Dreams สำหรับผู้เริ่มต้น",
    category: "💻 Digital Art",
    categoryColor: "bg-purple-100 text-purple-800 border-purple-200",
    duration: "06:15",
    creatorName: "น.ส. ชนนิกานต์ สุริยัน",
    creatorGrade: "ชั้นมัธยมศึกษาปีที่ 5/1",
    creatorAvatar: "ช",
    thumbnailUrl: "https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=dQw4w9WgXcQ",
    youtubeId: "dQw4w9WgXcQ",
    views: 740,
    likes: 115,
    description: "ขั้นตอนการสร้างภาพเคลื่อนไหวลูกบอลกระดอน (Bouncing Ball) และใบไม้ปลิวตามลม สอนหลักการ Squash & Stretch ขั้นพื้นฐานแอนิเมชันระดับสากล",
    materials: [
      "iPad พร้อมปากกา Apple Pencil",
      "แอปพลิเคชัน Procreate หรือ Flipaclip",
      "ชุดแปรง Studio Pen และ Monoline Brush",
      "เทมเพลตเฟรม 24 Frames Per Second (FPS)"
    ],
    steps: [
      "ตั้งค่า Canvas ขนาด 1920x1080px ที่อัตรา 24 FPS",
      "วาดเส้นวิถีการเคลื่อนที่ (Arc of Motion) ของวัตถุเป็น Guideline",
      "วาดคีย์เฟรมหลัก 3 จุด: จุดสูงสุด, จุดกระทบพื้น (Squash), และจุดคืนรูป (Stretch)",
      "แทรกเฟรม In-Between เพื่อให้ภาพเคลื่อนไหวต่อเนื่องและนุ่มนวลเป็นธรรมชาติ",
      "ลงสีและเงาของวัตถุแบบ Cell Shading",
      "Export ผลงานเป็นไฟล์วิดีโอ MP4 หรือ GIF พร้อมแชร์ลงแพลตฟอร์ม"
    ]
  },
  {
    id: "vid-5",
    title: "ศิลปะภาพพิมพ์จากเศษโฟมและพืชพรรณธรรมชาติ (Eco Print Workshop)",
    category: "✨ โปรเจกต์สร้างสรรค์",
    categoryColor: "bg-rose-100 text-rose-800 border-rose-200",
    duration: "04:50",
    creatorName: "ชมรม Creative Art ม.ต้น",
    creatorGrade: "กลุ่มสาระการเรียนรู้ศิลปะ",
    creatorAvatar: "ศ",
    thumbnailUrl: "https://images.unsplash.com/photo-1544717305-2782549b5136?w=800&auto=format&fit=crop&q=80",
    videoUrl: "https://www.youtube.com/watch?v=n2RWAshV9f4",
    youtubeId: "n2RWAshV9f4",
    views: 310,
    likes: 47,
    description: "การผสานศิลปะภาพพิมพ์กับการรักษ์สิ่งแวดล้อม โดยนำใบไม้ กลีบดอกไม้ และถาดโฟมรีไซเคิลมาสร้างลวดลายกราฟิกพิมพ์มืออันเป็นเอกลักษณ์",
    materials: [
      "ใบไม้และดอกไม้ที่มีเส้นใบชัดเจน (เช่น ใบสัก ใบฝรั่ง ใบเฟิร์น)",
      "ถาดโฟมสะอาดหรือยางลบแกะสลัก",
      "ลูกกลิ้งยางสำหรับงานพิมพ์ (Brayer)",
      "หมึกพิมพ์น้ำ (Water-based Block Printing Ink)",
      "กระดาษวาดเขียนร้อยปอนด์ผิวเรียบ"
    ],
    steps: [
      "คัดเลือกใบไม้ที่มีเส้นใยลึก ชัดเจน แล้วเช็ดทำความสะอาดให้แห้งสนิท",
      "บีบหมึกพิมพ์ลงบนกระจกหรือจานผสมสี แล้วใช้ลูกกลิ้งเกลี่ยให้เนียนบางสม่ำเสมอ",
      "กลิ้งหมึกทับลงบนหลังใบไม้ให้ทั่วถึงทุกเส้นใย",
      "วางใบไม้ลงบนแผ่นกระดาษวาดเขียน ปูทับด้วยกระดาษหนังสือพิมพ์",
      "ใช้ฝ่ามือหรือลูกกลิ้งสะอาดรีดกดเบาๆ ให้ทั่วแผ่น แล้วยกใบไม้ออกอย่างระมัดระวัง",
      "จัดองค์ประกอบพิมพ์ใบไม้ซ้อนกันหลายเฉดสีจนได้ผลงานภาพพิมพ์ที่สมบูรณ์"
    ]
  }
];

export default function StudentVideoShowcase() {
  const [selectedVideo, setSelectedVideo] = useState<StudentVideoItem | null>(null);
  const [copied, setCopied] = useState(false);
  const [likedList, setLikedList] = useState<Record<string, boolean>>({});
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // Close modal on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setSelectedVideo(null);
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const handleScroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = direction === "left" ? -340 : 340;
      scrollContainerRef.current.scrollBy({ left: scrollAmount, behavior: "smooth" });
    }
  };

  const toggleLike = (e: React.MouseEvent, id: string) => {
    e.stopPropagation();
    setLikedList(prev => ({ ...prev, [id]: !prev[id] }));
  };

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <section className="w-full mb-12">
      {/* Header & Section Title */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-5">
        <div>
          <p className="text-xs sm:text-sm font-normal text-orange-600 mb-1">
            Inspiring Young Creators
          </p>
          <h2 className="text-xl sm:text-2xl font-normal text-gray-900 tracking-tight flex flex-wrap items-baseline gap-2">
            <span>คลิปผลงานและวิธีทำสร้างสรรค์</span>
            <span className="text-xs sm:text-sm font-normal text-gray-500">โดยนักเรียน Art Room</span>
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal mt-1">
            ชมคลิปวิดีโอสาธิตวิธีทำทีละขั้นตอน และโปรเจกต์ไอเดียสร้างสรรค์เพื่อปลุกพลังจินตนาการ
          </p>
        </div>

        {/* Carousel Navigation Buttons */}
        <div className="flex items-center gap-2 self-end sm:self-auto">
          <button 
            onClick={() => handleScroll("left")}
            aria-label="Previous Slide"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-600 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            onClick={() => handleScroll("right")}
            aria-label="Next Slide"
            className="w-9 h-9 rounded-full bg-white border border-gray-200 hover:border-orange-300 hover:bg-orange-50 text-gray-700 hover:text-orange-600 flex items-center justify-center shadow-xs transition-all active:scale-95 cursor-pointer"
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      {/* Horizontal Video Reel Carousel */}
      <div 
        ref={scrollContainerRef}
        className="flex gap-4 sm:gap-5 overflow-x-auto pb-4 pt-1 snap-x snap-mandatory scrollbar-none"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {STUDENT_VIDEOS.map((video) => {
          const isLiked = likedList[video.id];

          return (
            <div 
              key={video.id}
              onClick={() => setSelectedVideo(video)}
              className="w-[280px] sm:w-[320px] shrink-0 snap-start bg-white rounded-3xl overflow-hidden border border-orange-100/80 shadow-xs hover:shadow-xl hover:-translate-y-1.5 transition-all duration-300 flex flex-col cursor-pointer group"
            >
              {/* Thumbnail Container (16:9) */}
              <div className="relative aspect-video w-full overflow-hidden bg-gray-900">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={video.thumbnailUrl} 
                  alt={video.title}
                  className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-500 opacity-90 group-hover:opacity-100"
                />
                
                {/* Dark Gradient Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />

                {/* Glowing Play Button */}
                <div className="absolute inset-0 flex items-center justify-center">
                  <div className="w-12 h-12 rounded-full bg-white/95 backdrop-blur-md flex items-center justify-center shadow-lg group-hover:scale-115 group-hover:bg-gradient-to-tr group-hover:from-orange-500 group-hover:to-amber-400 group-hover:text-white text-orange-600 transition-all duration-300">
                    <Play className="w-5 h-5 fill-current ml-0.5" />
                  </div>
                </div>

                {/* Category Badge Top Left */}
                <div className="absolute top-2.5 left-2.5 z-10">
                  <span className={`text-[10px] font-bold px-2.5 py-0.5 rounded-full border shadow-2xs backdrop-blur-md ${video.categoryColor}`}>
                    {video.category}
                  </span>
                </div>

                {/* Duration Badge Bottom Right */}
                <div className="absolute bottom-2.5 right-2.5 z-10">
                  <span className="text-[10px] font-medium px-2 py-0.5 rounded-md bg-black/75 text-white backdrop-blur-md flex items-center gap-1">
                    <Clock className="w-3 h-3 text-orange-400" />
                    {video.duration}
                  </span>
                </div>
              </div>

              {/* Card Body */}
              <div className="p-4 flex-1 flex flex-col justify-between">
                <div>
                  <h3 className="font-bold text-gray-900 text-sm leading-snug group-hover:text-orange-600 transition-colors line-clamp-2 mb-2">
                    {video.title}
                  </h3>
                  <p className="text-gray-500 text-xs font-light line-clamp-2 leading-relaxed">
                    {video.description}
                  </p>
                </div>

                {/* Creator & Stats Footer */}
                <div className="pt-3 mt-3 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-full bg-gradient-to-tr from-orange-400 to-amber-300 text-white font-bold text-[10px] flex items-center justify-center shadow-2xs">
                      {video.creatorAvatar}
                    </div>
                    <div className="leading-none">
                      <span className="text-xs font-semibold text-gray-800 block truncate max-w-[130px]">
                        {video.creatorName}
                      </span>
                      <span className="text-[10px] text-gray-400 font-light block mt-0.5">
                        {video.creatorGrade}
                      </span>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => toggleLike(e, video.id)}
                    className="flex items-center gap-1 text-xs text-gray-400 hover:text-rose-500 transition-colors cursor-pointer"
                  >
                    <Heart className={`w-3.5 h-3.5 ${isLiked ? "fill-rose-500 text-rose-500" : ""}`} />
                    <span className="text-[11px] font-medium">
                      {video.likes + (isLiked ? 1 : 0)}
                    </span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Interactive Video Player Modal (Compact & Centered with Back/Close Buttons) */}
      {selectedVideo && (
        <div 
          onClick={() => setSelectedVideo(null)}
          className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-start justify-center p-3 sm:p-6 py-6 sm:py-10 animate-in fade-in duration-150"
        >
          {/* Floating Top-Right Close Button for immediate exit from anywhere */}
          <button 
            type="button"
            onClick={() => setSelectedVideo(null)}
            className="fixed top-3 right-3 sm:top-5 sm:right-6 z-50 bg-black/80 hover:bg-red-600 text-white px-3 py-2 rounded-full shadow-2xl transition-all cursor-pointer flex items-center gap-1.5 text-xs font-bold border border-white/20 active:scale-95"
            title="ปิดหน้าต่าง (Esc)"
          >
            <X className="w-4 h-4" />
            <span>ปิด (Esc)</span>
          </button>

          {/* Modal Content Card (Compact max-w-2xl) */}
          <div 
            className="bg-white rounded-3xl overflow-hidden shadow-2xl w-full max-w-2xl border border-gray-100 my-auto animate-in zoom-in-95 duration-150 relative"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Sticky Header Bar */}
            <div className="sticky top-0 z-20 px-4 sm:px-5 py-3 bg-white/95 backdrop-blur-md border-b border-gray-100 flex items-center justify-between gap-3 shadow-2xs">
              <h3 className="text-xs sm:text-sm font-bold text-gray-800 truncate min-w-0">
                {selectedVideo.title}
              </h3>

              <div className="flex items-center gap-1.5 shrink-0">
                <button 
                  type="button"
                  onClick={handleCopyLink}
                  className="inline-flex items-center gap-1 px-2.5 py-1.5 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-medium transition-colors cursor-pointer"
                  title="แชร์คลิป"
                >
                  {copied ? <Check className="w-3 h-3 text-emerald-600" /> : <Share2 className="w-3 h-3" />}
                  <span className="hidden sm:inline">{copied ? "คัดลอกแล้ว" : "แชร์"}</span>
                </button>

                <button 
                  type="button"
                  onClick={() => setSelectedVideo(null)}
                  className="w-7 h-7 rounded-full bg-gray-100 hover:bg-red-50 hover:text-red-600 text-gray-500 flex items-center justify-center transition-colors cursor-pointer"
                  title="ปิดหน้าต่าง"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Modal Body Content (Compact) */}
            <div className="p-4 sm:p-6 space-y-5 max-h-[78vh] overflow-y-auto">
              {/* Responsive Video Player Container */}
              <div className="space-y-2">
                <div className="relative aspect-video w-full rounded-2xl overflow-hidden bg-black shadow-md border border-gray-200">
                  <iframe 
                    src={`https://www.youtube.com/embed/${selectedVideo.youtubeId}?autoplay=1&rel=0`}
                    title={selectedVideo.title}
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                    className="w-full h-full border-0"
                  />
                </div>

                {/* Direct Link to YouTube */}
                <div className="flex items-center justify-between text-xs text-gray-500 px-1 pt-0.5">
                  <span className="flex items-center gap-1 text-gray-400">
                    <Clock className="w-3.5 h-3.5 text-orange-500" /> ความยาวคลิป: {selectedVideo.duration} นาที
                  </span>
                  <a 
                    href={`https://www.youtube.com/watch?v=${selectedVideo.youtubeId}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-orange-600 hover:text-orange-700 hover:underline font-medium"
                  >
                    <span>เปิดดูใน YouTube (แท็บใหม่)</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                </div>
              </div>

              {/* Creator & Stats Row */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-full bg-gradient-to-tr from-orange-500 to-amber-400 text-white font-bold text-sm flex items-center justify-center shadow-xs">
                    {selectedVideo.creatorAvatar}
                  </div>
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">
                      {selectedVideo.creatorName}
                    </h4>
                    <span className="text-xs text-orange-600 font-medium">
                      {selectedVideo.creatorGrade} • โรงเรียนวชิรธรรมสาธิต
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-3 text-xs text-gray-500">
                  <span className="flex items-center gap-1">
                    <Eye className="w-3.5 h-3.5 text-gray-400" />
                    <strong>{selectedVideo.views}</strong> ครั้ง
                  </span>
                  <span className="flex items-center gap-1">
                    <Heart className="w-3.5 h-3.5 text-rose-500 fill-rose-500" />
                    <strong>{selectedVideo.likes + (likedList[selectedVideo.id] ? 1 : 0)}</strong> ชื่นชอบ
                  </span>
                </div>
              </div>

              {/* Project Concept / Description */}
              <div>
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1.5 flex items-center gap-1.5">
                  <Video className="w-3.5 h-3.5 text-orange-500" />
                  แนวคิดและแรงบันดาลใจ (Inspiration)
                </h4>
                <p className="text-xs sm:text-sm text-gray-700 font-light leading-relaxed bg-orange-50/40 p-3.5 rounded-2xl border border-orange-100/60">
                  {selectedVideo.description}
                </p>
              </div>

              {/* 2-Columns Grid: Materials & Step-by-Step */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Column 1: Materials Needed */}
                <div className="bg-amber-50/30 rounded-2xl p-4 border border-amber-100/70">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                    <Palette className="w-3.5 h-3.5 text-amber-600" />
                    <span>อุปกรณ์ที่ต้องเตรียม</span>
                  </h4>
                  <ul className="space-y-1.5 text-xs text-gray-600 font-light">
                    {selectedVideo.materials.map((mat, idx) => (
                      <li key={idx} className="flex items-start gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        <span>{mat}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Column 2: Step-by-Step Instructions */}
                <div className="bg-blue-50/30 rounded-2xl p-4 border border-blue-100/70">
                  <h4 className="text-xs sm:text-sm font-bold text-gray-900 mb-2.5 flex items-center gap-1.5">
                    <ListOrdered className="w-3.5 h-3.5 text-blue-600" />
                    <span>ขั้นตอนวิธีทำ (Step-by-Step)</span>
                  </h4>
                  <ol className="space-y-2 text-xs text-gray-600 font-light">
                    {selectedVideo.steps.map((step, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-4 h-4 rounded-full bg-blue-600 text-white font-bold text-[9px] flex items-center justify-center shrink-0 mt-0.5 shadow-2xs">
                          {idx + 1}
                        </span>
                        <span className="leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              </div>
            </div>

            {/* Modal Footer Bar */}
            <div className="px-4 sm:px-5 py-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
              <button 
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="inline-flex items-center gap-1 text-gray-500 hover:text-gray-800 font-medium cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>ย้อนกลับไปหน้าไอเดีย</span>
              </button>

              <button 
                type="button"
                onClick={() => setSelectedVideo(null)}
                className="px-4 py-1.5 rounded-xl bg-gray-900 hover:bg-gray-800 text-white font-medium transition-colors cursor-pointer shadow-xs active:scale-95"
              >
                ปิดหน้าต่าง (✕)
              </button>
            </div>
          </div>
        </div>
      )}
    </section>
  );
}
