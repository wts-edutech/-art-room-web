import TeachersPageClient from "./TeachersPageClient";
import { DEFAULT_KRU_KAE } from "@/app/api/teachers/route";

export const metadata = {
  title: "Teacher Profile & Awards | ART ROOM โรงเรียนวชิรธรรมสาธิต",
  description: "ประวัติ ผลงาน รางวัลเกียรติยศ และภาพกิจกรรมของครูชญานิษฐ์ ศิลป์ประเสริฐ (ครูเก๋) Teacher Profile & Awards กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
};

export default function TeachersPage() {
  return <TeachersPageClient initialTeacher={DEFAULT_KRU_KAE} />;
}
