import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import MaterialsList from "@/components/sections/MaterialsList";
import { getDb } from '@/db';
import { lessons } from '@/db/schema';
import { desc, eq } from 'drizzle-orm';
// Helper to get lessons on server side
async function getLessons() {
  try {
    const db = getDb();
    return await db.select().from(lessons).orderBy(desc(lessons.createdAt));
  } catch (error) {
    return [];
  }
}

export default async function MaterialsPage() {
  const allLessons = await getLessons();

  return (
    <>
      <Navbar />

        <main className="flex-1 flex flex-col pt-32 pb-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
                Art Room by Students
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                รวบรวมสื่อการเรียนรู้ เทคนิค และแหล่งค้นคว้าเพิ่มเติมสำหรับนักเรียนที่สนใจพัฒนาทักษะทางศิลปะ
              </p>
            </div>
            
            <MaterialsList initialLessons={allLessons} />
          </div>
        </main>

      <Footer />
    </>
  );
}
