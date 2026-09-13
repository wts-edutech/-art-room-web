export interface DownloadItem {
  id: string;
  title: string;
  description: string;
  category: string;
  grade: string;
  fileName: string;
  fileSize: string;
  fileUrl: string;
  downloadsCount: number;
  orderIndex?: number;
}

export const DEFAULT_DOWNLOADS: DownloadItem[] = [
  {
    id: "dl-1",
    title: "ใบงานที่ 1: การแรเงาและน้ำหนักแสงเงา (Shading Techniques & Value Scale)",
    description: "แบบฝึกปฏิบัติการลงน้ำหนัก 7 ระดับ ด้วยดินสอดำ EE สำหรับนักเรียนเริ่มต้น",
    category: "แบบฝึกหัด",
    grade: "m3",
    fileName: "worksheet_01_shading_wts.pdf",
    fileSize: "1.4 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 142,
    orderIndex: 1
  },
  {
    id: "dl-2",
    title: "ใบความรู้: ทฤษฎีสีและวงจรสีสากล 12 สี (Color Theory & Wheel)",
    description: "สรุปแม่สีขั้นที่ 1, 2, 3 วรรณะสี และคู่สีตรงข้าม พร้อมตัวอย่างการผสมสีน้ำ",
    category: "ใบความรู้",
    grade: "all",
    fileName: "color_theory_handbook_wts.pdf",
    fileSize: "2.8 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 310,
    orderIndex: 2
  },
  {
    id: "dl-3",
    title: "ใบงานที่ 2: การเขียนภาพทัศนียภาพ 1 จุด และ 2 จุด (Perspective Drawing)",
    description: "หลักการลากเส้นระดับสายตา (Eye Level) และจุดรวมสายตา (Vanishing Point)",
    category: "แบบฝึกหัด",
    grade: "m4",
    fileName: "perspective_drawing_m4.pdf",
    fileSize: "3.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 98,
    orderIndex: 3
  },
  {
    id: "dl-4",
    title: "เกณฑ์การให้คะแนนผลงานทัศนศิลป์ (Art Rubric Assessment Score)",
    description: "เกณฑ์การประเมินความคิดสร้างสรรค์ ความประณีต และการสื่อความหมาย",
    category: "เกณฑ์การประเมิน",
    grade: "all",
    fileName: "art_rubric_assessment_wts.pdf",
    fileSize: "850 KB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 75,
    orderIndex: 4
  },
  {
    id: "dl-5",
    title: "ใบงานทบทวน: เทคนิคการระบายสีโปสเตอร์แบบเปียกบนแห้ง และปาดเรียบ",
    description: "แบบฝึกผสมน้ำและควบคุมเนื้อสีโปสเตอร์ให้เรียบเนียนสม่ำเสมอ ไม่เป็นคราบ",
    category: "แบบฝึกหัด",
    grade: "m3",
    fileName: "poster_color_exercise_m3.pdf",
    fileSize: "1.9 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 184,
    orderIndex: 5
  },
  {
    id: "dl-6",
    title: "คู่มือนักเรียน: กฎความปลอดภัยและการดูแลรักษาอุปกรณ์ในห้องปฏิบัติการศิลปะ",
    description: "ระเบียบการยืม-คืนพู่กัน การล้างจานสี การทิ้งสารเคมี และมารยาทการใช้ห้อง",
    category: "คู่มือ",
    grade: "all",
    fileName: "art_room_safety_guide.pdf",
    fileSize: "1.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 220,
    orderIndex: 6
  },
];
