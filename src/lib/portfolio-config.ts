export interface PortfolioConfigSettings {
  heroButtonText: string;
  heroButtonVisible: boolean;
  topRightHeaderLabel: string;
  coverMainTitle: string;
  appliedMajorLabel: string;
  defaultAcademicYear: string;
  defaultUniversity: string;
  defaultFaculty: string;
  defaultMajor: string;
  defaultProjectRound: string;
  defaultSchoolName: string;
  defaultSchoolProvince: string;
  defaultStudyPlan: string;
  pageLimitNoticeText: string;
  sec1Title: string;
  sec1PersonalTitle: string;
  sec1ParentTitle: string;
  sec1AddressTitle: string;
  sec1EducationTitle: string;
  sec1SubjectGradesTitle: string;
  sec2Title: string;
  sec3Title: string;
  sec4_1Title: string;
  sec4_2Title: string;
  sec4_3Title: string;
  sec5Title: string;
  entryAwardResultLabel: string;
  entryRoleResultLabel: string;
  entryDetailLabel: string;
  entryGalleryLabel: string;
  levelOptions: string[];
  costOptions: string[];
  defaultQuestion1: string;
  updatedAt?: string;
}

export const DEFAULT_PORTFOLIO_CONFIG: PortfolioConfigSettings = {
  heroButtonText: "สร้างแฟ้มสะสมผลงาน (Portfolio)",
  heroButtonVisible: true,
  topRightHeaderLabel: "แฟ้มสะสมผลงาน ประจำปี",
  coverMainTitle: "แฟ้มสะสมผลงาน",
  appliedMajorLabel: "สาขาวิชาที่สมัคร",
  defaultAcademicYear: "2570",
  defaultUniversity: "มหาวิทยาลัยเกษตรศาสตร์",
  defaultFaculty: "คณะศึกษาศาสตร์",
  defaultMajor: "การมัธยมศึกษา ศษ.บ. สาขาวิชาศึกษาศาสตร์",
  defaultProjectRound: "โครงการช้างเผือก (รอบ 1.2)",
  defaultSchoolName: "วชิรธรรมสาธิต",
  defaultSchoolProvince: "กรุงเทพมหานคร",
  defaultStudyPlan: "",
  pageLimitNoticeText: "หลักสูตรนี้ไม่จำกัดจำนวนหน้า",
  sec1Title: "หมวด 1 • ข้อมูลผู้สมัคร",
  sec1PersonalTitle: "ข้อมูลส่วนตัว",
  sec1ParentTitle: "ข้อมูลผู้ปกครอง",
  sec1AddressTitle: "ที่อยู่ติดต่อได้",
  sec1EducationTitle: "ข้อมูลการศึกษา",
  sec1SubjectGradesTitle: "ผลการเรียนตามกลุ่มสาระการเรียนรู้",
  sec2Title: "หมวด 2 • เรียงความ / เหตุผลในการสมัคร",
  sec3Title: "หมวด 3 • หนังสือรับรอง / เอกสารแนบ",
  sec4_1Title: "หมวด 4.1 - รางวัล / เกียรติบัตร",
  sec4_2Title: "หมวด 4.2 - ผลงานศิลปะ / โครงงาน",
  sec4_3Title: "หมวด 4.3 - กิจกรรม",
  sec5Title: "หมวด 5 - คำถามเพิ่มเติมของหลักสูตร",
  entryAwardResultLabel: "ผลรางวัล / อันดับ :",
  entryRoleResultLabel: "บทบาท / ผลการประเมิน :",
  entryDetailLabel: "รายละเอียด :",
  entryGalleryLabel: "ภาพประกอบ : สูงสุดไม่เกิน 6 รูป",
  levelOptions: [
    "ระดับนานาชาติ",
    "ระดับชาติ",
    "ระดับภูมิภาค",
    "ระดับจังหวัด",
    "ระดับเขตพื้นที่ฯ",
    "ระดับสถานศึกษา",
  ],
  costOptions: ["ไม่มีค่าใช้จ่าย", "มีค่าใช้จ่าย"],
  defaultQuestion1:
    "เหตุใดท่านจึงอยากเข้าศึกษาต่อในสาขาวิชานี้ และมีเป้าหมายในอนาคตอย่างไร",
  updatedAt: new Date().toISOString(),
};
