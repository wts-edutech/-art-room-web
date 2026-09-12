import TeachersPageClient from "./TeachersPageClient";

export const metadata = {
  title: "ทำเนียบครูผู้สอนศิลปะ | ART ROOM โรงเรียนวชิรธรรมสาธิต",
  description: "รายนามคณะครูกลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ผู้เชี่ยวชาญการสอนทัศนศิลป์ ดิจิทัลอาร์ต และการสร้างสรรค์ผลงานระดับชาติ",
};

// Seed/Fallback teachers if database is empty
const DEFAULT_TEACHERS = [
  {
    id: "teacher-1",
    name: "ครูพิชญ์ชญา วงศ์ศิลป์",
    role: "หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูชำนาญการพิเศษ",
    grades: "มัธยมศึกษาปีที่ 3 และ มัธยมศึกษาปีที่ 6",
    specialties: "จิตรกรรมสีน้ำ, ทฤษฎีทัศนศิลป์, องค์ประกอบศิลป์",
    bio: "มุ่งเน้นการส่งเสริมให้นักเรียนค้นหาตัวตนผ่านงานศิลปะ และพัฒนาทักษะสู่การประกวดระดับชาติ",
    imageUrl: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?auto=format&fit=crop&q=80&w=800",
    email: "art.wts@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการศิลปะ 1 (อาคาร 2 ชั้น 3)",
  },
  {
    id: "teacher-2",
    name: "ครูธีรภัทร จิตรกรรม",
    role: "ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูชำนาญการ",
    grades: "มัธยมศึกษาปีที่ 4 และ มัธยมศึกษาปีที่ 5",
    specialties: "วาดเส้นด้วยดินสอ EE, สีอะคริลิก, การออกแบบผลิตภัณฑ์",
    bio: "ผู้ฝึกสอนนักเรียนตัวแทนโรงเรียนเข้าร่วมการแข่งขันงานศิลปหัตถกรรมนักเรียน ชนะเลิศระดับเหรียญทอง",
    imageUrl: "https://images.unsplash.com/photo-1560250097-0b93528c311a?auto=format&fit=crop&q=80&w=800",
    email: "theerapat.j@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการศิลปะ 2 (อาคาร 2 ชั้น 3)",
  },
  {
    id: "teacher-3",
    name: "ครูชลธิชา นวศิลป์",
    role: "ครูผู้สอนกลุ่มสาระการเรียนรู้ศิลปะ",
    position: "ครูผู้ช่วย",
    grades: "มัธยมศึกษาปีที่ 1 และ มัธยมศึกษาปีที่ 2",
    specialties: "Digital Art, คาแรคเตอร์ดีไซน์, สื่อผสมสร้างสรรค์",
    bio: "ส่งเสริมการเรียนรู้ศิลปะยุคใหม่ด้วย iPad และแท็บเล็ตกราฟิก เพื่อปูทางสู่อุตสาหกรรมสร้างสรรค์",
    imageUrl: "https://images.unsplash.com/photo-1580489944761-15a19d654956?auto=format&fit=crop&q=80&w=800",
    email: "chonthicha.n@wts.ac.th",
    roomLocation: "ห้องปฏิบัติการคอมพิวเตอร์ศิลปะ (อาคาร 2 ชั้น 3)",
  },
];

export default function TeachersPage() {
  return <TeachersPageClient initialTeachers={DEFAULT_TEACHERS} />;
}
