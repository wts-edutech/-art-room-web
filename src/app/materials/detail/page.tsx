import { Suspense } from "react";
import LessonDetailClient from "./LessonDetailClient";

export default function LessonDetailPage() {
  return (
    <Suspense fallback={
      <main className="min-h-screen flex items-center justify-center bg-[#FDF9F1]">
        <div className="animate-spin rounded-full h-12 w-12 border-4 border-orange-200 border-t-orange-500"></div>
      </main>
    }>
      <LessonDetailClient />
    </Suspense>
  );
}
