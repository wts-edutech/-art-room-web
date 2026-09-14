import { Suspense } from "react";
import TeacherProfileClient from "./TeacherProfileClient";

export const metadata = {
  title: "ข้อมูลคุณครู | ART ROOM",
  description: "โปรไฟล์และผลงานการแบ่งปันไอเดียการจัดการเรียนรู้ของคุณครู",
};

export default function TeacherProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500"></div>
        </div>
      }
    >
      <TeacherProfileClient />
    </Suspense>
  );
}
