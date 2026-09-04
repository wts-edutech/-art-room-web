import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import fs from "fs";
import path from "path";
import MaterialsList from "@/components/sections/MaterialsList";
import ProtectedRoute from "@/components/auth/ProtectedRoute";

// Helper to get lessons on server side
async function getLessons(type) {
  try {
    const db = getDb();
    return await db.select().from(lessons).where(eq(lessons.type, type)).orderBy(desc(lessons.createdAt));
  } catch (error) {
    return [];
  }
}

export default async function MaterialsPage() {
  const lessons = await getLessons("general");

  return (
    <>
      <Navbar />
      <ProtectedRoute>
        <main className="flex-1 flex flex-col pt-32 pb-24 bg-white">
          <div className="container mx-auto px-4 sm:px-6 max-w-7xl">
            <div className="text-center mb-16">
              <h1 className="text-4xl md:text-5xl font-bold font-heading text-gray-900 mb-6 tracking-tight">
                สื่อการสอน (ระดับชั้น ม.4)
              </h1>
              <p className="text-xl text-gray-600 max-w-2xl mx-auto font-light">
                รวบรวมสื่อการเรียนรู้ เทคนิค และแหล่งค้นคว้าเพิ่มเติมสำหรับนักเรียนที่สนใจพัฒนาทักษะทางศิลปะ
              </p>
            </div>
            
            <MaterialsList initialLessons={lessons} basePath="/materials/m4" />
          </div>
        </main>
      </ProtectedRoute>
      <Footer />
    </>
  );
}
