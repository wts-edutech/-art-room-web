import { Suspense } from "react";
import ProfilePageClient from "./ProfilePageClient";

export const metadata = {
  title: "ข้อมูลโปรไฟล์ | ART ROOM",
  description: "จัดการข้อมูลส่วนตัว รูปภาพโปรไฟล์ และสถานะการใช้งานในระบบ ART ROOM",
};

export default function ProfilePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-[#FBF9F4]">
          <div className="animate-spin rounded-full h-10 w-10 border-4 border-orange-200 border-t-orange-500"></div>
        </div>
      }
    >
      <ProfilePageClient />
    </Suspense>
  );
}
