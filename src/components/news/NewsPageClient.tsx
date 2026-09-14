"use client";

import { useState } from "react";
import { Search, Calendar, User, Tag, Share2, Sparkles, ExternalLink, X, ChevronRight, Newspaper, Check, Info } from "lucide-react";

export interface NewsItem {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  date: string;
  source: string;
  category: string;
  imageUrl: string;
  imageType?: "banner" | "poster" | "square";
  isFeatured?: boolean;
  tags?: string[];
  url?: string;
}

export const DEMO_NEWS_LIST: NewsItem[] = [
  {
    id: "demo-1",
    title: "นิทรรศการศิลปกรรมนักเรียนประจำปี ART ROOM ANNUAL EXHIBITION 2026: ปลดปล่อยจินตนาการสู่โลกศิลปะร่วมสมัย",
    excerpt: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ขอเชิญชวนครู นักเรียน และผู้ปกครอง ร่วมชมนิทรรศการแสดงผลงานศิลปะยอดเยี่ยมประจำปีการศึกษา 2569 รวบรวมผลงานภาพวาด จิตรกรรม ประติมากรรม และดิจิทัลอาร์ตกว่า 150 ชิ้น",
    content: `กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต มีความภูมิใจเสนอ "ART ROOM ANNUAL EXHIBITION 2026" นิทรรศการแสดงผลงานศิลปะของนักเรียนทุกระดับชั้น 

ภายในงานจัดแสดง:
• ผลงานจิตรกรรมสีน้ำ สีอะคริลิก และสีน้ำมันจากนักเรียน ม.1 - ม.6
• การแสดงผลงาน Digital Art และผลงานออกแบบสื่อสร้างสรรค์
• โซนประติมากรรมและงานปั้นสร้างสรรค์สะท้อนมุมมองสังคม
• กิจกรรม Workshop สาธิตการวาดภาพสดโดยนักเรียนที่ได้รับรางวัลระดับชาติ

กำหนดการจัดแสดง:
• วันที่: 18 พฤษภาคม - 1 มิถุนายน 2569
• สถานที่: หอศิลป์และห้อง ART ROOM โรงเรียนวชิรธรรมสาธิต
• พิธีเปิด: วันจันทร์ที่ 18 พ.ค. 2569 เวลา 09.00 น. ณ หอประชุมใหญ่`,
    date: "10 พ.ย. 2569",
    source: "กลุ่มสาระฯ ศิลปะ",
    category: "นิทรรศการ",
    imageUrl: "/images/news/hero-exhibition.jpg",
    imageType: "banner",
    isFeatured: true,
    tags: ["นิทรรศการ", "ผลงานนักเรียน", "Banner 1.91:1"],
    url: "https://art-room-web.pages.dev/artworks"
  },
  {
    id: "demo-2",
    title: "เปิดพื้นที่สร้างสรรค์ Art Space: โครงการจัดแสดงผลงานศิลปะและนิทรรศการหมุนเวียน ณ อาคาร 2",
    excerpt: "เปิดโอกาสให้นักเรียนนำผลงานภาพวาด จิตรกรรม และงานออกแบบมาจัดแสดงร่วมกันในพื้นที่ Art Space เพื่อแลกเปลี่ยนมุมมองความคิดสร้างสรรค์ตลอดภาคเรียน",
    content: `กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ขอเชิญชวนนักเรียนทุกระดับชั้น ร่วมส่งผลงานเข้าร่วมโครงการ Art Space เพื่อจัดแสดงผลงานศิลปะหมุนเวียน

รายละเอียดกิจกรรม:
1. เปิดรับผลงานภาพวาด จิตรกรรม ประติมากรรม และงานออกแบบสื่อสร้างสรรค์
2. ผลงานจะได้รับการจัดแสดงในพื้นที่ Art Space อาคาร 2 ชั้น 3
3. มีการจัดมุมเสวนาแลกเปลี่ยนเทคนิคการสร้างสรรค์ผลงานร่วมกับครูและรุ่นพี่

กำหนดการจัดแสดง:
• จัดแสดงตลอดภาคเรียนที่ 1 และ 2
• ติดต่อสอบถามและส่งผลงานได้ที่ห้องปฏิบัติการศิลปะ (ART ROOM 204)`,
    date: "8 พ.ย. 2569",
    source: "ฝ่ายกิจกรรมศิลปะ",
    category: "นิทรรศการ",
    imageUrl: "/images/news/art-contest-poster.jpg",
    imageType: "poster",
    isFeatured: false,
    tags: ["นิทรรศการ", "Art Space", "โปสเตอร์ PR (3:4)"]
  },
  {
    id: "demo-3",
    title: "ภาพบรรยากาศความประทับใจ: กิจกรรม Workshop 'เทคนิคสีน้ำและสื่อสร้างสรรค์ร่วมสมัย' ประจำเดือน",
    excerpt: "เต็มเปี่ยมด้วยรอยยิ้มและพลังสร้างสรรค์! นักเรียนร่วมลงมือปฏิบัติการผสมผสานสีน้ำ เทคนิคการปาดสี และการถ่ายทอดอารมณ์ลงบนผืนผ้าใบ โดยมีครูผู้เชี่ยวชาญดูแลอย่างใกล้ชิด",
    content: `ประมวลภาพบรรยากาศกิจกรรมสร้างเสริมทักษะศิลปะ Workshop "Creative Watercolor & Mixed Media" ประจำภาคเรียน

กิจกรรมครั้งนี้นักเรียนได้เรียนรู้:
1. ทฤษฎีสีขั้นสูงและการสื่ออารมณ์ผ่านคู่สีตรงข้าม
2. เทคนิค Wet-on-Wet และ Wet-on-Dry ในการวาดภาพทิวทัศน์
3. การใช้วัสดุแปลกใหม่ร่วมกับสีน้ำ เช่น เกลือ พลาสติกแรป และหมึกอินเดียน
4. การแลกเปลี่ยนมุมมองศิลปะ (Critique Session) ร่วมกันในกลุ่มเพื่อน

บรรยากาศเต็มไปด้วยความสนุกสนาน นักเรียนทุกคนได้สร้างสรรค์ผลงานชิ้นเอกของตัวเองกลับบ้าน และนำไปเตรียมจัดแสดงในสัปดาห์ศิลปกรรมต่อไป`,
    date: "4 พ.ย. 2569",
    source: "ชมรมศิลปะ Art Club",
    category: "เวิร์กช็อป & กิจกรรม",
    imageUrl: "/images/news/art-workshop.jpg",
    imageType: "square",
    isFeatured: false,
    tags: ["เวิร์กช็อป", "ภาพกิจกรรม (1:1)", "สีน้ำ"]
  },
  {
    id: "demo-4",
    title: "กิจกรรมศิลปะสร้างสรรค์เพื่อชุมชน: นักเรียนร่วมวาดภาพฝาผนังส่งเสริมสิ่งแวดล้อม",
    excerpt: "นักเรียนกลุ่มสาระการเรียนรู้ศิลปะร่วมแรงร่วมใจสร้างสรรค์ภาพวาดจิตรกรรมฝาผนังสะท้อนความงดงามของธรรมชาติและสิ่งแวดล้อม สร้างบรรยากาศสดใสให้โรงเรียน",
    content: `โครงการจิตรกรรมฝาผนังเพื่อสิ่งแวดล้อม (Eco Wall Art Project) โดยนักเรียนและคณะครูกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต

กิจกรรมประกอบด้วย:
• การออกแบบลวดลายจิตรกรรมฝาผนังในหัวข้อ "ธรรมชาติและโลกสีเขียว"
• การลงสีจริงบนกำแพงอาคารเรียนด้วยสีอะคริลิกคุณภาพสูง
• การฝึกทักษะการทำงานศิลปะร่วมกันเป็นทีมในพื้นที่จริง

ผลงานสำเร็จอย่างสวยงามและสร้างความภาคภูมิใจให้กับนักเรียนทุกคน`,
    date: "1 พ.ย. 2569",
    source: "ชมรมศิลปะ Art Club",
    category: "เวิร์กช็อป & กิจกรรม",
    imageUrl: "/images/news/hero-exhibition.jpg",
    imageType: "banner",
    isFeatured: false,
    tags: ["กิจกรรม", "จิตรกรรมฝาผนัง", "ผลงานนักเรียน"]
  },
  {
    id: "demo-5",
    title: "เปิดรับสมัครสมาชิกชุมนุม Digital Art & Creative Media ประจำภาคเรียนใหม่",
    excerpt: "สำหรับนักเรียนที่สนใจการวาดภาพบน iPad / Tablet, งาน 3D Modeling, Concept Art และการสร้างสรรค์ผลงานแอนิเมชันเบื้องต้น รับจำนวนจำกัดเพียง 30 คนต่อรอบ",
    content: `ชุมนุม Digital Art & Creative Media เปิดประตูต้อนรับนักเรียนที่สนใจสร้างสรรค์งานศิลปะยุคดิจิทัล!

สิ่งที่จะได้เรียนรู้ในชุมนุม:
• พื้นฐานการใช้โปรแกรม Procreate, Photoshop และ Clip Studio Paint
• การวาดภาพ Character Design และ Storyboard
• การใช้เครื่องมือกราฟิกและแท็บเล็ตวาดภาพของห้องปฏิบัติการ
• การจัดทำแฟ้มสะสมผลงาน (Portfolio) เพื่อยื่นศึกษาต่อระดับมหาวิทยาลัยในสายศิลปะ/มีเดีย

สมัครได้ตั้งแต่วันนี้ที่ห้องปฏิบัติการคอมพิวเตอร์ศิลปะ อาคาร 2`,
    date: "28 ต.ค. 2569",
    source: "ชุมนุม Digital Art",
    category: "ประกาศทั่วไป",
    imageUrl: "/images/news/art-workshop.jpg",
    imageType: "square",
    isFeatured: false,
    tags: ["ชุมนุม", "Digital Art", "รับสมัคร"]
  }
];

const CATEGORIES = ["ทั้งหมด", "นิทรรศการ", "เวิร์กช็อป & กิจกรรม", "ประกาศทั่วไป"];

export default function NewsPageClient({ initialNews = [] }: { initialNews?: any[] }) {
  // Combine real database news with demo news if database has fewer items
  const combinedNews: NewsItem[] = initialNews.length > 0 
    ? initialNews.map((n, idx) => ({
        id: n.id || `db-${idx}`,
        title: n.title,
        excerpt: n.excerpt || n.content?.slice(0, 150) + "...",
        content: n.content || n.excerpt || "",
        date: n.date || "ไม่ระบุวันที่",
        source: n.source || "Art Room",
        category: n.category || "ข่าวสารทั่วไป",
        imageUrl: n.imageUrl || "/images/news/hero-exhibition.jpg",
        imageType: (idx % 3 === 0 ? "banner" : idx % 3 === 1 ? "poster" : "square") as any,
        isFeatured: idx === 0,
        tags: ["ข่าวสาร", "Art Room"]
      }))
    : DEMO_NEWS_LIST;

  const [selectedCategory, setSelectedCategory] = useState("ทั้งหมด");
  const [searchTerm, setSearchTerm] = useState("");
  const [activeModalNews, setActiveModalNews] = useState<NewsItem | null>(null);
  const [copied, setCopied] = useState(false);

  // Featured News is either the first featured or the very first item
  const featured = combinedNews.find(n => n.isFeatured) || combinedNews[0];
  
  // Filter other news
  const filteredNews = combinedNews.filter(n => {
    const matchesCategory = selectedCategory === "ทั้งหมด" || n.category === selectedCategory;
    const matchesSearch = !searchTerm || 
      n.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
      n.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      n.content.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleCopyLink = () => {
    if (typeof window !== "undefined") {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="w-full">
      {/* Hero Header Section */}
      <section className="relative overflow-hidden bg-gradient-to-b from-red-50/60 via-amber-50/30 to-transparent pt-12 pb-8 border-b border-red-100/50">
        <div className="container mx-auto px-4 sm:px-6 max-w-6xl text-center">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-red-100/80 border border-red-200 text-red-700 text-xs sm:text-sm font-semibold mb-4 shadow-2xs">
            <Sparkles className="w-4 h-4 text-red-600 animate-pulse" />
            <span>ข่าวสารและประชาสัมพันธ์ | PR & Art Room News</span>
          </div>

          <h1 className="text-3xl sm:text-5xl font-black text-gray-900 tracking-tight mb-4">
            ข่าวสารและกิจกรรมศิลปะ
          </h1>
          <p className="text-gray-600 text-sm sm:text-base max-w-2xl mx-auto font-light leading-relaxed">
            ติดตามข่าวสารนิทรรศการผลงาน กิจกรรมสร้างสรรค์ และเรื่องราวน่าภาคภูมิใจของนักเรียนกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต
          </p>

          {/* Search & Filter Bar */}
          <div className="mt-8 max-w-3xl mx-auto flex flex-col sm:flex-row gap-3 items-center">
            <div className="relative w-full">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
              <input 
                type="text"
                placeholder="ค้นหาข่าวสาร นิทรรศการ หรือกิจกรรม..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full h-12 pl-12 pr-4 rounded-2xl bg-white border border-gray-200 focus:border-red-500 focus:ring-2 focus:ring-red-200 outline-none text-sm shadow-xs transition-all"
              />
              {searchTerm && (
                <button 
                  onClick={() => setSearchTerm("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 p-1"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>

          {/* Categories Pills */}
          <div className="flex items-center justify-center flex-wrap gap-2 mt-5">
            {CATEGORIES.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-xl text-xs sm:text-sm font-medium transition-all ${
                  selectedCategory === cat
                    ? "bg-red-600 text-white shadow-md shadow-red-200"
                    : "bg-white text-gray-600 hover:bg-gray-100/80 border border-gray-200/80"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </section>

      <div className="container mx-auto px-4 sm:px-6 max-w-6xl py-10">
        {/* Featured Hero News (1.91:1 Standard Banner) */}
        {featured && selectedCategory === "ทั้งหมด" && !searchTerm && (
          <div className="mb-14">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <span className="w-2.5 h-6 bg-red-600 rounded-full"></span>
                ข่าวเด่นน่าสนใจ (Featured News)
              </h2>
              <span className="text-xs font-medium text-red-600 bg-red-50 px-3 py-1 rounded-full border border-red-100">
                สัดส่วนมาตรฐาน Banner 1.91:1
              </span>
            </div>

            <div 
              onClick={() => setActiveModalNews(featured)}
              className="bg-white rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl border border-gray-100 flex flex-col lg:flex-row cursor-pointer group transition-all duration-300"
            >
              {/* Banner Image Container */}
              <div className="relative w-full lg:w-3/5 min-h-[280px] sm:min-h-[360px] lg:h-[400px] overflow-hidden bg-gray-900 flex items-center justify-center">
                {/* Ambient blur */}
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-lg opacity-40 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${featured.imageUrl})` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={featured.imageUrl} 
                  alt={featured.title}
                  className="relative z-10 max-h-full max-w-full object-contain transform group-hover:scale-102 transition-transform duration-500 rounded-xl drop-shadow-md"
                  onError={(e) => (e.currentTarget.src = "/images/news/hero-exhibition.jpg")}
                />
                <div className="absolute top-4 left-4 z-20">
                  <span className="px-3.5 py-1.5 bg-red-600 text-white text-xs font-bold rounded-full shadow-md flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5" /> ไฮไลต์เด่น
                  </span>
                </div>
              </div>

              {/* Banner Info */}
              <div className="w-full lg:w-2/5 p-6 sm:p-8 flex flex-col justify-between bg-gradient-to-br from-white to-gray-50/50">
                <div>
                  <div className="flex items-center gap-3 text-xs text-gray-500 mb-3">
                    <span className="inline-flex items-center gap-1 font-medium text-red-600">
                      <User className="w-3.5 h-3.5" /> {featured.source}
                    </span>
                    <span>•</span>
                    <span className="inline-flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" /> {featured.date}
                    </span>
                  </div>

                  <h3 className="text-xl sm:text-2xl font-bold text-gray-900 mb-3 leading-snug group-hover:text-red-600 transition-colors">
                    {featured.title}
                  </h3>

                  <p className="text-gray-600 text-sm leading-relaxed line-clamp-4 font-light">
                    {featured.excerpt}
                  </p>
                </div>

                <div className="pt-6 border-t border-gray-100 flex items-center justify-between mt-4">
                  <div className="flex flex-wrap gap-1.5">
                    {featured.tags?.map((t) => (
                      <span key={t} className="text-[11px] bg-gray-100 text-gray-600 px-2.5 py-0.5 rounded-md">
                        #{t}
                      </span>
                    ))}
                  </div>

                  <span className="inline-flex items-center gap-1 text-sm font-semibold text-red-600 group-hover:translate-x-1 transition-transform">
                    อ่านต่อ <ChevronRight className="w-4 h-4" />
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Section Heading for All News */}
        <div className="flex items-center justify-between mb-6 border-b border-gray-200/70 pb-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900">
              {selectedCategory === "ทั้งหมด" ? "ข่าวสารและกิจกรรมทั้งหมด" : `หมวดหมู่: ${selectedCategory}`}
            </h2>
            <p className="text-xs text-gray-500 mt-0.5">พบทั้งหมด {filteredNews.length} รายการ</p>
          </div>

          <div className="hidden sm:flex items-center gap-2 text-xs text-gray-500">
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-blue-500"></span> Banner 1.91:1</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-amber-500"></span> โปสเตอร์ 3:4</span>
            <span className="flex items-center gap-1"><span className="w-2 h-2 rounded-full bg-emerald-500"></span> จัตุรัส 1:1</span>
          </div>
        </div>

        {/* News Grid (Showcasing all 3 PR formats) */}
        {filteredNews.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredNews.map((news) => {
              // Badge colors based on image type
              const isPoster = news.imageType === "poster";
              const isSquare = news.imageType === "square";

              return (
                <div 
                  key={news.id}
                  onClick={() => setActiveModalNews(news)}
                  className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 flex flex-col h-full cursor-pointer group"
                >
                  {/* Image Container */}
                  <div className={`relative w-full ${isPoster ? "h-64 sm:h-72" : isSquare ? "h-56 sm:h-60" : "h-48 sm:h-52"} bg-gray-900 overflow-hidden flex items-center justify-center`}>
                    {/* Blurred backdrop */}
                    <div 
                      className="absolute inset-0 bg-cover bg-center blur-md opacity-35 scale-110 pointer-events-none"
                      style={{ backgroundImage: `url(${news.imageUrl})` }}
                    />
                    
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img 
                      src={news.imageUrl} 
                      alt={news.title}
                      className="relative z-10 max-h-full max-w-full object-contain group-hover:scale-105 transition-transform duration-500 drop-shadow-sm"
                      onError={(e) => (e.currentTarget.src = "/images/news/hero-exhibition.jpg")}
                    />

                    {/* Format Tag Badge */}
                    <div className="absolute top-3 left-3 z-20">
                      <span className={`text-[10px] font-bold px-2.5 py-1 rounded-full shadow-xs text-white ${
                        isPoster ? "bg-amber-600" : isSquare ? "bg-emerald-600" : "bg-blue-600"
                      }`}>
                        {isPoster ? "โปสเตอร์ PR (3:4)" : isSquare ? "ภาพกิจกรรม (1:1)" : "Banner (1.91:1)"}
                      </span>
                    </div>

                    <div className="absolute top-3 right-3 z-20">
                      <span className="text-[10px] font-medium px-2.5 py-1 rounded-full bg-black/60 backdrop-blur-md text-white">
                        {news.category}
                      </span>
                    </div>
                  </div>

                  {/* Body Content */}
                  <div className="p-5 flex-1 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                        <span className="font-medium text-red-600">{news.source}</span>
                        <span>•</span>
                        <span>{news.date}</span>
                      </div>

                      <h4 className="font-bold text-gray-900 text-base mb-2 group-hover:text-red-600 transition-colors leading-snug line-clamp-2">
                        {news.title}
                      </h4>

                      <p className="text-gray-500 text-xs sm:text-sm leading-relaxed line-clamp-3 font-light mb-4">
                        {news.excerpt}
                      </p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                      <span className="text-gray-400 font-medium">คลิกเพื่ออ่านเนื้อหา</span>
                      <span className="inline-flex items-center gap-1 text-red-600 font-semibold group-hover:translate-x-1 transition-transform">
                        รายละเอียด <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="bg-white rounded-3xl p-12 text-center border border-gray-100 shadow-sm max-w-xl mx-auto my-8">
            <Newspaper className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <h3 className="text-lg font-bold text-gray-800 mb-1">ไม่พบข่าวสารที่ค้นหา</h3>
            <p className="text-sm text-gray-500 mb-4">ลองเปลี่ยนคำค้นหา หรือเลือกหมวดหมู่อื่นเพื่อค้นหาข่าวสาร</p>
            <button 
              onClick={() => { setSelectedCategory("ทั้งหมด"); setSearchTerm(""); }}
              className="px-4 py-2 bg-red-600 text-white text-xs font-semibold rounded-xl hover:bg-red-700 transition-colors"
            >
              ดูข่าวสารทั้งหมด
            </button>
          </div>
        )}

      </div>

      {/* News Detail Reading Modal */}
      {activeModalNews && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div 
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl overflow-hidden max-w-3xl w-full max-h-[90vh] flex flex-col shadow-2xl border border-white/20 animate-scaleUp"
          >
            {/* Modal Header */}
            <div className="flex items-center justify-between p-4 sm:p-5 border-b border-gray-100 bg-gray-50/70">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-1 rounded-md bg-red-100 text-red-800">
                  {activeModalNews.category}
                </span>
                <span className="text-xs text-gray-500">
                  {activeModalNews.date}
                </span>
              </div>
              <button 
                onClick={() => setActiveModalNews(null)}
                className="w-9 h-9 rounded-full bg-gray-200/60 hover:bg-gray-200 text-gray-700 flex items-center justify-center transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6">
              {/* Image Container with Ambient Backdrop */}
              <div className="w-full max-h-[420px] rounded-2xl overflow-hidden bg-gray-950 relative flex items-center justify-center shadow-md p-2">
                <div 
                  className="absolute inset-0 bg-cover bg-center blur-xl opacity-35 scale-110 pointer-events-none"
                  style={{ backgroundImage: `url(${activeModalNews.imageUrl})` }}
                />
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={activeModalNews.imageUrl} 
                  alt={activeModalNews.title} 
                  className="relative z-10 max-h-[380px] w-auto max-w-full object-contain rounded-xl drop-shadow-md"
                  onError={(e) => (e.currentTarget.src = "/images/news/hero-exhibition.jpg")}
                />
              </div>

              {/* Title & Meta */}
              <div>
                <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                  <span className="font-semibold text-red-600">{activeModalNews.source}</span>
                  <span>•</span>
                  <span>เผยแพร่เมื่อ {activeModalNews.date}</span>
                </div>
                <h2 className="text-2xl sm:text-3xl font-bold text-gray-900 leading-tight mb-4">
                  {activeModalNews.title}
                </h2>
              </div>

              {/* Excerpt callout */}
              <div className="p-4 bg-red-50/60 rounded-2xl border-l-4 border-red-600 text-sm font-medium text-gray-700 leading-relaxed">
                {activeModalNews.excerpt}
              </div>

              {/* Full Content */}
              <div className="text-sm sm:text-base text-gray-700 leading-relaxed whitespace-pre-line font-light">
                {activeModalNews.content}
              </div>

              {/* Tags */}
              {activeModalNews.tags && activeModalNews.tags.length > 0 && (
                <div className="pt-4 border-t border-gray-100 flex items-center gap-2 flex-wrap">
                  <Tag className="w-4 h-4 text-gray-400" />
                  {activeModalNews.tags.map((t) => (
                    <span key={t} className="text-xs bg-gray-100 text-gray-600 px-3 py-1 rounded-lg">
                      #{t}
                    </span>
                  ))}
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-gray-100 bg-gray-50 flex items-center justify-between">
              <button 
                onClick={handleCopyLink}
                className="inline-flex items-center gap-2 text-xs font-semibold text-gray-700 bg-white border border-gray-200 px-4 py-2 rounded-xl hover:bg-gray-100 transition-colors shadow-2xs"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4 text-gray-500" />}
                {copied ? "คัดลอกลิงก์แล้ว!" : "แชร์ข่าวนักเรียน"}
              </button>

              <button 
                onClick={() => setActiveModalNews(null)}
                className="px-5 py-2 bg-red-600 hover:bg-red-700 text-white text-xs font-bold rounded-xl transition-colors shadow-sm"
              >
                ปิดหน้าต่าง
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
