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
  imageUrl?: string;
  topic?: string;
  mediaType?: 'pdf' | 'video' | 'canva' | 'image';
  videoId?: string;
}

export const DEFAULT_DOWNLOADS: DownloadItem[] = [
  {
    id: "dl-1",
    title: "พื้นฐาน: เรื่องของ 'จุด'",
    description: "เรียนรู้การจัดวาง การสร้างน้ำหนัก และจังหวะของจุดเพื่อสร้างลวดลายและมิติในงานศิลปะเบื้องต้น เหมาะสำหรับผู้เริ่มต้น",
    category: "ใบงาน",
    topic: "จุด & เส้น",
    grade: "all",
    fileName: "worksheet_01_points_and_lines.pdf",
    fileSize: "1.4 MB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 342,
    imageUrl: "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 1
  },
  {
    id: "v-1",
    title: "เส้นสร้างสรรค์และจังหวะเส้น",
    description: "คลิปวิดีโอสาธิตการลากเส้นตรง เส้นโค้ง และเส้นหยัก เพื่อสื่ออารมณ์และความรู้สึกในงานวาดเส้น พร้อมแบบฝึกหัดพัฒนาฝีมือ",
    category: "สื่อวิดีทัศน์",
    topic: "จุด & เส้น",
    grade: "all",
    fileName: "creative_lines_lesson.mp4",
    fileSize: "1080p Video",
    fileUrl: "https://www.youtube.com/watch?v=AB1QIlCEDDU",
    videoId: "AB1QIlCEDDU",
    downloadsCount: 512,
    mediaType: "video",
    orderIndex: 2
  },
  {
    id: "dl-2",
    title: "เทคนิค: น้ำหนักแสงเงา (Value Scale)",
    description: "แบบฝึกปฏิบัติการลงน้ำหนัก 7 ระดับ ด้วยดินสอ EE สำหรับผู้เริ่มต้นสร้างความสมจริง มิติ และน้ำหนักแสงเงาให้ชิ้นงาน",
    category: "ใบงาน",
    topic: "น้ำหนัก & แสงเงา",
    grade: "all",
    fileName: "worksheet_02_value_scale_shading.pdf",
    fileSize: "2.1 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 890,
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 3
  },
  {
    id: "dl-3",
    title: "ใบงานที่ 3: การเขียนภาพทัศนียภาพ 1 จุด และ 2 จุด (Perspective Drawing)",
    description: "หลักการลากเส้นระดับสายตา (Eye Level) และจุดรวมสายตา (Vanishing Point)",
    category: "ใบงาน",
    topic: "การวาดภาพทัศนียภาพ",
    grade: "m4",
    fileName: "worksheet_03_perspective_drawing.pdf",
    fileSize: "3.1 MB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 156,
    imageUrl: "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 4
  },
  {
    id: "dl-4",
    title: "ใบความรู้: ทฤษฎีสีและวงจรสีสากล 12 สี (Color Theory & Wheel)",
    description: "สรุปแม่สีขั้นที่ 1, 2, 3 วรรณะสี และคู่สีตรงข้าม พร้อมตัวอย่างการผสมสีน้ำและเทคนิคการระบาย",
    category: "ใบความรู้",
    topic: "ทฤษฎีสี",
    grade: "all",
    fileName: "handbook_color_theory_wheel.pdf",
    fileSize: "2.8 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 520,
    imageUrl: "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 5
  },
  {
    id: "dl-5",
    title: "เกณฑ์การให้คะแนนผลงานทัศนศิลป์ (Art Rubric Assessment Score)",
    description: "เกณฑ์การประเมินความคิดสร้างสรรค์ ความประณีต และการสื่อความหมาย",
    category: "คู่มือ",
    topic: "การประเมินผล",
    grade: "all",
    fileName: "art_rubric_assessment_guide.pdf",
    fileSize: "850 KB",
    fileUrl: "https://pdfobject.com/pdf/sample.pdf",
    downloadsCount: 210,
    imageUrl: "https://images.unsplash.com/photo-1456513080510-7bf3a84b82f8?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 6
  },
  {
    id: "dl-6",
    title: "คู่มือนักเรียน: กฎความปลอดภัยและการดูแลรักษาอุปกรณ์ในห้องปฏิบัติการศิลปะ",
    description: "ระเบียบการยืม-คืนพู่กัน การล้างจานสี การทิ้งสารเคมี และมารยาทการใช้ห้อง",
    category: "คู่มือ",
    topic: "ระเบียบห้องศิลปะ",
    grade: "all",
    fileName: "art_room_safety_and_rules.pdf",
    fileSize: "1.2 MB",
    fileUrl: "https://www.w3.org/WAI/ER/tests/xhtml/testfiles/resources/pdf/dummy.pdf",
    downloadsCount: 285,
    imageUrl: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    mediaType: "pdf",
    orderIndex: 7
  },
];
