import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialsList from "@/components/sections/MaterialsList";
import GuestBlockModal from "@/components/modals/GuestBlockModal";
import CommunityDiscussion from "@/components/common/CommunityDiscussion";
import { getDb } from "@/db";
import { lessons } from "@/db/schema";
import { desc } from "drizzle-orm";
import { DEFAULT_DOWNLOADS, DownloadItem } from "@/data/default-downloads";
import { Suspense } from "react";
import { Sparkles, BookOpen, FileText, MessageSquare, ChevronDown } from "lucide-react";
import { getSession, checkIsAdmin } from "@/lib/api-auth";
import { redirect } from "next/navigation";

const DEFAULT_LESSONS = [
  {
    id: "1788253108830",
    title: "เทคนิควาดเส้น ประเภทของเส้น",
    description: "เรียนรู้ประเภทของเส้นและเทคนิคการวาดเส้นสร้างสรรค์เพื่อสื่ออารมณ์",
    videoId: "AB1QIlCEDDU",
    category: "สื่อวิดีทัศน์",
    type: "general"
  },
  {
    id: "1788253557873",
    title: "สอนลงสีไม้รูปมังคุด",
    description: "เทคนิคการระบายสีไม้และเกลี่ยน้ำหนักให้ผลงานดูมีมิติและสมจริง",
    videoId: "Frj7Onjr4kg",
    category: "สื่อวิดีทัศน์",
    type: "general"
  },
  {
    id: "1788253613400",
    title: "เทคนิคสีไม้ รูปผีเสื้อ",
    description: "การไล่เฉดสีไม้สร้างลวดลายปีกผีเสื้อที่สวยงามประณีต",
    videoId: "71JjYfjynTM",
    category: "สื่อวิดีทัศน์",
    type: "general"
  }
];

// Helper to fetch lessons from database
async function getLessons() {
  try {
    const db = getDb();
    const list = await db.select().from(lessons).orderBy(desc(lessons.createdAt));
    return list && list.length > 0 ? list : DEFAULT_LESSONS;
  } catch (error) {
    return DEFAULT_LESSONS;
  }
}

export default async function MaterialsPage() {
  // Authentication Guard: Restricted to Students & Admins
  const session = await getSession();
  const isAdmin = await checkIsAdmin();

  if (!session && !isAdmin) {
    redirect("/login?tab=student&redirect=/materials&notice=student_only");
  }

  if (!isAdmin && session?.role !== "student") {
    return <GuestBlockModal redirectPath="/materials" />;
  }

  const allLessons = await getLessons();
  const allDownloads: DownloadItem[] = DEFAULT_DOWNLOADS;

  const totalLessons = allLessons.length;
  const totalDownloads = allDownloads.length;

  return (
    <>
      <Navbar />
      <main className="flex-1 flex flex-col pt-28 pb-24 bg-[#FCFBF8]">
        {/* Modern Studio Showcase Hero Banner */}
        <section className="relative overflow-hidden bg-gradient-to-b from-red-50/70 via-orange-50/40 to-transparent pt-12 pb-14 border-b border-gray-100">
          {/* Subtle Decorative Gradient Circles */}
          <div className="absolute -top-24 -left-24 w-96 h-96 bg-red-200/30 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute top-10 -right-24 w-96 h-96 bg-amber-200/30 rounded-full blur-3xl pointer-events-none" />

          <div className="container mx-auto px-4 sm:px-6 max-w-7xl relative z-10">
            <div className="text-center max-w-3xl mx-auto">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white text-red-700 text-xs sm:text-sm font-bold mb-5 shadow-sm border border-red-100">
                <Sparkles className="w-4 h-4 text-red-500" />
                <span>ศูนย์รวมสื่อการเรียนรู้และใบงานศิลปะ</span>
              </div>

              {/* Main Heading */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-black text-gray-900 mb-4 tracking-tight leading-tight">
                คลังสื่อการสอน <span className="text-transparent bg-clip-text bg-gradient-to-r from-red-600 via-orange-600 to-amber-600">Art Room</span>
              </h1>

              {/* Subtitle */}
              <p className="text-base sm:text-lg text-gray-600 font-light leading-relaxed mb-8">
                รวบรวมสื่อวิดีทัศน์ เทคนิคการสร้างสรรค์ผลงานศิลปะ สไลด์การสอน และศูนย์ดาวน์โหลดใบงาน PDF 
                สำหรับนักเรียนทุกระดับชั้น เพื่อการเรียนรู้ทั้งในและนอกห้องเรียน
              </p>

              {/* Stats Counters */}
              <div className="grid grid-cols-2 gap-4 sm:gap-6 max-w-sm mx-auto mb-6">
                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                    <BookOpen className="w-3.5 h-3.5 text-red-500" />
                    <span className="hidden sm:inline">บทเรียนและวิดีโอ</span>
                    <span className="sm:hidden">บทเรียน</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">{totalLessons}</p>
                </div>

                <div className="bg-white/90 backdrop-blur-md p-4 rounded-2xl border border-gray-200/80 shadow-xs hover:shadow-md hover:-translate-y-0.5 transition-all duration-200 text-center">
                  <div className="flex items-center justify-center gap-1.5 text-xs text-gray-500 font-semibold mb-1">
                    <FileText className="w-3.5 h-3.5 text-emerald-500" />
                    <span className="hidden sm:inline">ใบงาน PDF</span>
                    <span className="sm:hidden">ใบงาน</span>
                  </div>
                  <p className="text-2xl sm:text-3xl font-black text-emerald-600 tracking-tight">{totalDownloads}</p>
                </div>
              </div>

              {/* Jump to Discussion Shortcut */}
              <div className="flex items-center justify-center">
                <a
                  href="#materials-community-discussion"
                  className="group inline-flex items-center gap-2.5 px-6 sm:px-7 py-3 rounded-full bg-white hover:bg-red-50/30 text-gray-800 hover:text-red-600 font-bold text-xs sm:text-sm border border-red-100/90 hover:border-red-200 shadow-2xs hover:shadow-md transition-all duration-200 active:scale-98 cursor-pointer"
                >
                  <div className="w-6 h-6 rounded-full bg-red-50 text-red-500 group-hover:bg-red-500 group-hover:text-white transition-colors flex items-center justify-center shrink-0">
                    <MessageSquare className="w-3.5 h-3.5" />
                  </div>
                  <span className="whitespace-nowrap font-bold text-gray-800 group-hover:text-red-600 transition-colors">
                    กระดานสนทนา & ถาม-ตอบ สื่อการสอน
                  </span>
                  <ChevronDown className="w-4 h-4 text-gray-400 group-hover:text-red-500 group-hover:translate-y-0.5 transition-all shrink-0" />
                </a>
              </div>
            </div>
          </div>
        </section>

        {/* Unified Feed Section */}
        <section className="container mx-auto px-4 sm:px-6 max-w-7xl pt-10">
          <Suspense fallback={
            <div className="py-20 text-center text-gray-400">
              <div className="animate-spin rounded-full h-10 w-10 border-2 border-red-300 border-t-red-600 mx-auto mb-3"></div>
              <p className="text-sm">กำลังโหลดคลังสื่อการสอน...</p>
            </div>
          }>
            <MaterialsList 
              initialLessons={allLessons} 
              initialDownloads={allDownloads}
              basePath="/materials"
            />
          </Suspense>
        </section>

        {/* Learning Materials Community Discussion & Q&A Board */}
        <section className="container mx-auto px-4 sm:px-6 max-w-7xl pt-16">
          <CommunityDiscussion
            id="materials-community-discussion"
            topicId="materials-hub"
            title="กระดานสนทนา & ถาม-ตอบ สื่อการสอน"
            subtitle="ร่วมพูดคุย สอบถามเทคนิคในบทเรียน แลกเปลี่ยนวิธีการทำงานศิลปะ หรือเสนอแนะสื่อการสอนใหม่ๆ ที่ต้องการให้คุณครูจัดทำ"
            accentColor="red"
            tags={["ทั้งหมด", "❓ ถามเรื่องบทเรียน", "🎨 เทคนิคและอุปกรณ์", "💡 เสนอแนะสื่อใหม่", "💬 พูดคุยทั่วไป"]}
            quickPrompts={[
              "ชอบเทคนิควิดีโอนี้มากครับ ทำตามได้เข้าใจง่าย 👍",
              "ขอสอบถามเรื่องการเกลี่ยน้ำหนักสีไม้ครับ 🎨",
              "อยากให้คุณครูทำคลิปสอนเทคนิคสีน้ำเพิ่มครับ 💡",
              "มีใบงานสำหรับฝึกวาดเพิ่มเติมไหมครับ 📄"
            ]}
            emptyMessage="ยังไม่มีข้อความสนทนาในกระดานสื่อการสอน มาเป็นคนแรกที่สอบถามหรือพูดคุยกับคุณครูกันเถอะ!"
          />
        </section>
      </main>
      <Footer />
    </>
  );
}
