"use client";

import React, { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  ArrowLeft,
  Printer,
  Save,
  Plus,
  Trash2,
  ArrowUp,
  ArrowDown,
  Image as ImageIcon,
  CheckCircle2,
  AlertTriangle,
  Info,
  FolderOpen,
  Sparkles,
  FileText,
  Award,
  Palette,
  Calendar,
  HelpCircle,
  User,
  GraduationCap,
  Upload,
  X,
  RotateCcw,
  Eye,
  LayoutGrid,
  Check,
  Building2,
  Copy,
  SlidersHorizontal,
  Pencil
} from "lucide-react";
import { compressImage, fileToDataUrl } from "@/lib/image-compressor";
import { swalToast, swalConfirm, swalSuccess } from "@/lib/swal";
import StudentAccessGuard from "@/components/auth/StudentAccessGuard";
import ImageEditorModal from "@/components/common/ImageEditorModal";
import {
  PortfolioConfigSettings,
  DEFAULT_PORTFOLIO_CONFIG,
} from "@/lib/portfolio-config";

export type LayoutType =
  | "a4-landscape"
  | "a4-full"
  | "16-9"
  | "4-3"
  | "4-5"
  | "1-1"
  | "grid-4-3-2"
  | "grid-4-3-3"
  | "grid-4-3-4"
  | "grid-4-3-6"
  | "grid-4-5-2"
  | "grid-4-5-3"
  | "grid-4-5-4"
  | "grid-4-5-5"
  | "grid-4-5-6"
  | "table-2x2"
  | "hero-1-2"
  | "hero-1-4";

export type FitMode = "cover" | "contain";

export interface PortfolioEntry {
  id: string;
  category: "4.1" | "4.2" | "4.3";
  title: string;
  level: string;
  costType: string;
  dateStr: string;
  organization: string;
  awardResult: string;
  description: string;
  learned: string;
  layout: LayoutType;
  fitMode: FitMode;
  showImages?: boolean;
  images: string[];
}

export interface QuestionEntry {
  id: string;
  question: string;
  answer: string;
}

export interface PortfolioState {
  academicYear: string;
  university: string;
  faculty: string;
  major: string;
  projectRound: string;
  universityLogo: string;
  conditionsText: string;
  showConditions: boolean;
  sections: {
    sec1_cover: boolean;
    sec1_personal: boolean;
    sec1_parent: boolean;
    sec1_address: boolean;
    sec1_education: boolean;
    sec1_gpax4: boolean;
    sec1_gpax5: boolean;
    sec1_subjectGrades: boolean;
    sec1_transcriptFront: boolean;
    sec1_transcriptBack: boolean;
    sec2_essay: boolean;
    sec3_attachments: boolean;
    sec4_1_awards: boolean;
    sec4_2_works: boolean;
    sec4_3_activities: boolean;
    sec5_questions: boolean;
  };
  profile: {
    photoUrl: string;
    fullNameTh: string;
    fullNameEn: string;
    citizenId: string;
    birthDate: string;
    age: string;
    email: string;
    phone: string;
    weight: string;
    height: string;
    gender: string;
    parentRelation: string;
    parentName: string;
    parentPhone: string;
    parentEmail: string;
    addressNo: string;
    subDistrict: string;
    district: string;
    province: string;
    postalCode: string;
    schoolName: string;
    schoolProvince: string;
    studyPlan: string;
    eduYear: string;
    gpax4: string;
    gpax5: string;
    transcriptFrontUrl: string;
    transcriptBackUrl: string;
  };
  subjectGrades: {
    subjectGroup: string;
    credits: string;
    gpa: string;
  }[];
  essay: {
    title: string;
    content: string;
  };
  attachments: {
    id: string;
    title: string;
    imageUrl: string;
  }[];
  entries: PortfolioEntry[];
  questions: QuestionEntry[];
}

const LAYOUT_OPTIONS: {
  group: string;
  items: { value: LayoutType; label: string; slots: number }[];
}[] = [
    {
      group: "1 รูป",
      items: [
        { value: "a4-landscape", label: "เต็มหน้า A4 (แนวนอน)", slots: 1 },
        { value: "a4-full", label: "เต็มหน้า A4 (แนวตั้ง)", slots: 1 },
        { value: "16-9", label: "เต็มกว้าง 16:9", slots: 1 },
        { value: "4-3", label: "เต็มกว้าง 4:3", slots: 1 },
        { value: "4-5", label: "แนวตั้ง 4:5", slots: 1 },
        { value: "1-1", label: "จัตุรัส 1:1", slots: 1 },
      ],
    },
    {
      group: "หลายรูป - แนวนอน 4:3",
      items: [
        { value: "grid-4-3-2", label: "2 ช่อง", slots: 2 },
        { value: "grid-4-3-3", label: "3 ช่อง", slots: 3 },
        { value: "grid-4-3-4", label: "4 ช่อง", slots: 4 },
        { value: "grid-4-3-6", label: "6 ช่อง", slots: 6 },
      ],
    },
    {
      group: "หลายรูป - แนวตั้ง 4:5",
      items: [
        { value: "grid-4-5-2", label: "2 รูป", slots: 2 },
        { value: "grid-4-5-3", label: "3 รูป", slots: 3 },
        { value: "grid-4-5-4", label: "4 รูป", slots: 4 },
        { value: "grid-4-5-5", label: "5 รูป", slots: 5 },
        { value: "grid-4-5-6", label: "6 รูป", slots: 6 },
      ],
    },
    {
      group: "ตาราง / เด่น",
      items: [
        { value: "table-2x2", label: "ตาราง 2×2 (1:1)", slots: 4 },
        { value: "hero-1-2", label: "เด่น (1 + 2 เล็ก)", slots: 3 },
        { value: "hero-1-4", label: "เด่น (1 + 4 เล็ก)", slots: 5 },
      ],
    },
  ];

export function getSlotCountForLayout(layout: LayoutType): number {
  for (const g of LAYOUT_OPTIONS) {
    const found = g.items.find((i) => i.value === layout);
    if (found) return found.slots;
  }
  return 5;
}

export function getLayoutLabel(layout: LayoutType): string {
  for (const g of LAYOUT_OPTIONS) {
    const found = g.items.find((i) => i.value === layout);
    if (found) return found.label;
  }
  return "เด่น (1 + 4 เล็ก)";
}

const UNIVERSITY_LOGO_PRESETS: {
  id: string;
  name: string;
  short: string;
  logo: string;
  keywords: string[];
}[] = [
  { id: "ku", name: "มหาวิทยาลัยเกษตรศาสตร์", short: "ม.เกษตรศาสตร์ (KU)", logo: "/universities/ku.png", keywords: ["เกษตรศาสตร์", "kasetsart", "มก"] },
  { id: "su", name: "มหาวิทยาลัยศิลปากร", short: "ม.ศิลปากร (SU)", logo: "/universities/su.png", keywords: ["ศิลปากร", "silpakorn", "มศก"] },
  { id: "cu", name: "จุฬาลงกรณ์มหาวิทยาลัย", short: "จุฬาลงกรณ์ฯ (CU)", logo: "/universities/cu.png", keywords: ["จุฬา", "chula"] },
  { id: "swu", name: "มหาวิทยาลัยศรีนครินทรวิโรฒ", short: "มศว (SWU)", logo: "/universities/swu.png", keywords: ["ศรีนครินทรวิโรฒ", "มศว", "ประสานมิตร", "swu"] },
  { id: "tu", name: "มหาวิทยาลัยธรรมศาสตร์", short: "ม.ธรรมศาสตร์ (TU)", logo: "/universities/tu.png", keywords: ["ธรรมศาสตร์", "thammasat", "มธ"] },
  { id: "kmitl", name: "สถาบันเทคโนโลยีพระจอมเกล้าเจ้าคุณทหารลาดกระบัง", short: "สจล. ลาดกระบัง (KMITL)", logo: "/universities/kmitl.png", keywords: ["ลาดกระบัง", "เจ้าคุณทหาร", "kmitl", "สจล"] },
  { id: "kmutt", name: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าธนบุรี", short: "มจธ. บางมด (KMUTT)", logo: "/universities/kmutt.png", keywords: ["พระจอมเกล้าธนบุรี", "บางมด", "kmutt", "มจธ"] },
  { id: "kmutnb", name: "มหาวิทยาลัยเทคโนโลยีพระจอมเกล้าพระนครเหนือ", short: "มจพ. พระนครเหนือ (KMUTNB)", logo: "/universities/kmutnb.png", keywords: ["พระนครเหนือ", "kmutnb", "มจพ"] },
  { id: "mu", name: "มหาวิทยาลัยมหิดล", short: "ม.มหิดล (MU)", logo: "/universities/mu.png", keywords: ["มหิดล", "mahidol"] },
  { id: "cmu", name: "มหาวิทยาลัยเชียงใหม่", short: "ม.เชียงใหม่ (CMU)", logo: "/universities/cmu.png", keywords: ["เชียงใหม่", "chiang mai", "cmu", "มช"] },
  { id: "kku", name: "มหาวิทยาลัยขอนแก่น", short: "ม.ขอนแก่น (KKU)", logo: "/universities/kku.png", keywords: ["ขอนแก่น", "khon kaen", "kku", "มข"] },
  { id: "buu", name: "มหาวิทยาลัยบูรพา", short: "ม.บูรพา (BUU)", logo: "/universities/buu.png", keywords: ["บูรพา", "burapha", "บางแสน", "buu"] },
  { id: "psu", name: "มหาวิทยาลัยสงขลานครินทร์", short: "ม.สงขลานครินทร์ (PSU)", logo: "/universities/psu.png", keywords: ["สงขลานครินทร์", " prince of songkla", "psu", "มอ."] },
  { id: "rmutr", name: "มหาวิทยาลัยเทคโนโลยีราชมงคลรัตนโกสินทร์ (เพาะช่าง)", short: "มทร.รัตนโกสินทร์ / เพาะช่าง", logo: "/universities/rmutr.png", keywords: ["รัตนโกสินทร์", "เพาะช่าง", "rmutr"] },
  { id: "rmutt", name: "มหาวิทยาลัยเทคโนโลยีราชมงคลธัญบุรี", short: "มทร.ธัญบุรี (RMUTT)", logo: "/universities/rmutt.png", keywords: ["ราชมงคลธัญบุรี", "ธัญบุรี", "คลองหก", "rmutt"] },
];

function matchUniversityLogoByName(univName?: string | null): string | null {
  const q = (univName || "").trim().toLowerCase();
  if (!q) return null;
  for (const u of UNIVERSITY_LOGO_PRESETS) {
    if (u.keywords.some((kw) => q.includes(kw.toLowerCase()))) {
      return u.logo;
    }
  }
  return null;
}

function resolveUniversityLogo(univName?: string | null, savedLogo?: string | null): string {
  const cleanLogo = (savedLogo || "").trim();
  const isOldArtRoomLogo = !cleanLogo || cleanLogo === "/artroom-logo.png" || cleanLogo === "/images/artroom-logo.png";
  const isBuiltInUnivLogo = cleanLogo.startsWith("/universities/");
  const matched = matchUniversityLogoByName(univName);

  if (isOldArtRoomLogo) {
    return matched || "/universities/ku.png";
  }
  if (isBuiltInUnivLogo && matched) {
    return matched;
  }
  return cleanLogo;
}

const DEFAULT_STATE: PortfolioState = {
  academicYear: "2570",
  university: "มหาวิทยาลัยเกษตรศาสตร์",
  faculty: "คณะศึกษาศาสตร์",
  major: "การมัธยมศึกษา ศษ.บ. สาขาวิชาศึกษาศาสตร์",
  projectRound: "โครงการช้างเผือก (รอบ 1.2)",
  universityLogo: "/universities/ku.png",
  showConditions: false,
  conditionsText:
    "1. ผลการเรียนเฉลี่ยสะสม (GPAX) 5 ภาคเรียน สัดส่วน 30.00\n2. แฟ้มสะสมผลงาน (ตามแบบฟอร์มของ ทปอ.) สัดส่วน 30.00\n3. TGAT ความถนัดทั่วไป สัดส่วน 30.00\n4. TPAT5 ความถนัดครุศาสตร์-ศึกษาศาสตร์ สัดส่วน 10.00",
  sections: {
    sec1_cover: true,
    sec1_personal: true,
    sec1_parent: true,
    sec1_address: true,
    sec1_education: true,
    sec1_gpax4: true,
    sec1_gpax5: true,
    sec1_subjectGrades: false,
    sec1_transcriptFront: false,
    sec1_transcriptBack: false,
    sec2_essay: false,
    sec3_attachments: false,
    sec4_1_awards: true,
    sec4_2_works: true,
    sec4_3_activities: true,
    sec5_questions: true,
  },
  profile: {
    photoUrl: "",
    fullNameTh: "",
    fullNameEn: "",
    citizenId: "",
    birthDate: "",
    age: "",
    email: "",
    phone: "",
    weight: "",
    height: "",
    gender: "",
    parentRelation: "",
    parentName: "",
    parentPhone: "",
    parentEmail: "",
    addressNo: "",
    subDistrict: "",
    district: "",
    province: "",
    postalCode: "",
    schoolName: "วชิรธรรมสาธิต",
    schoolProvince: "กรุงเทพมหานคร",
    studyPlan: "",
    eduYear: "",
    gpax4: "",
    gpax5: "",
    transcriptFrontUrl: "",
    transcriptBackUrl: "",
  },
  subjectGrades: [
    { subjectGroup: "ภาษาไทย", credits: "", gpa: "" },
    { subjectGroup: "คณิตศาสตร์", credits: "", gpa: "" },
    { subjectGroup: "วิทยาศาสตร์และเทคโนโลยี", credits: "", gpa: "" },
    { subjectGroup: "สังคมศึกษา ศาสนา และวัฒนธรรม", credits: "", gpa: "" },
    { subjectGroup: "สุขศึกษาและพลศึกษา", credits: "", gpa: "" },
    { subjectGroup: "ศิลปะ (ทัศนศิลป์ ดนตรี นาฏศิลป์)", credits: "", gpa: "" },
    { subjectGroup: "การงานอาชีพ", credits: "", gpa: "" },
    { subjectGroup: "ภาษาต่างประเทศ", credits: "", gpa: "" },
  ],
  essay: {
    title: "เหตุผลและแรงบันดาลใจในการสมัครเข้าศึกษาต่อ",
    content:
      "ข้าพเจ้ามีความมุ่งมั่นและหลงใหลในการสร้างสรรค์งานศิลปะควบคู่ไปกับการประยุกต์ใช้เทคโนโลยีสมัยใหม่ ตลอดระยะเวลาที่ศึกษาในระดับชั้นมัธยมศึกษาที่โรงเรียนวชิรธรรมสาธิต ข้าพเจ้าได้ฝึกฝนทักษะด้านทัศนศิลป์ การออกแบบ และการทำกิจกรรมเพื่อส่วนรวมอย่างต่อเนื่อง จึงมีความตั้งใจอย่างยิ่งที่จะเข้าศึกษาต่อในสาขาวิชานี้ เพื่อนำความรู้ไปพัฒนาตนเองและสร้างประโยชน์ให้แก่สังคมต่อไป",
  },
  attachments: [],
  entries: [
    {
      id: "entry_default_1",
      category: "4.1",
      title: "การประกวดนวัตกรรมและผลงานศิลปะสร้างสรรค์ระดับชาติ",
      level: "ระดับชาติ",
      costType: "ไม่มีค่าใช้จ่าย",
      dateStr: "18-21 มิถุนายน 2569",
      organization: "สำนักงานคณะกรรมการการศึกษาขั้นพื้นฐาน (สพฐ.)",
      awardResult: "รางวัลชนะเลิศ เหรียญทอง และเป็นทีมต้นแบบนวัตกรรม",
      description:
        "เข้าร่วมการแข่งขันสร้างสรรค์ผลงานศิลปะและนวัตกรรมเพื่อการศึกษา ภายใต้โครงการปลุกพลังความคิดสร้างสรรค์ เปลี่ยนห้องเรียนสู่โรงเรียนแห่งอนาคต โดยบูรณาการทักษะทัศนศิลป์และการออกแบบดิจิทัล",
      learned:
        "การวิเคราะห์บริบทและโจทย์ปัญหา ไปจนถึงการออกแบบแนวทางสร้างสรรค์ผลงานด้วยศิลปะและเทคโนโลยีให้ตอบโจทย์ผู้ใช้งานจริงในยุคดิจิทัล",
      layout: "hero-1-4",
      fitMode: "cover",
      images: ["", "", "", "", ""],
    },
    {
      id: "entry_default_2",
      category: "4.2",
      title: "ผลงานการออกแบบและจิตรกรรมสร้างสรรค์ในรายวิชาทัศนศิลป์",
      level: "ระดับสถานศึกษา",
      costType: "ไม่มีค่าใช้จ่าย",
      dateStr: "ภาคเรียนที่ 1-2 ปีการศึกษา 2569",
      organization: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
      awardResult: "ผลการประเมินดีเยี่ยม (ระดับ 4.00)",
      description:
        "รวบรวมผลงานการวาดเส้น (Drawing) สีน้ำ สีโปสเตอร์ และสื่อผสมที่ได้ลงมือปฏิบัติจริงในห้องเรียนศิลปะ ART ROOM โดยเน้นการจัดองค์ประกอบศิลป์ แสงเงา และการสื่อความหมาย",
      learned:
        "ได้ฝึกฝนความละเอียดรอบคอบ ทักษะการใช้สีและเทคนิคที่หลากหลาย รวมถึงการถ่ายทอดอารมณ์และความคิดผ่านผลงานทัศนศิลป์",
      layout: "hero-1-4",
      fitMode: "cover",
      images: ["", "", "", "", ""],
    },
    {
      id: "entry_default_3",
      category: "4.3",
      title: "กิจกรรมค่ายศิลปะสร้างสรรค์และจิตอาสาพัฒนาโรงเรียน",
      level: "ระดับจังหวัด",
      costType: "ไม่มีค่าใช้จ่าย",
      dateStr: "10-12 พฤศจิกายน 2569",
      organization: "โรงเรียนวชิรธรรมสาธิต ร่วมกับ ภาคีเครือข่ายเยาวชน",
      awardResult: "ผู้เข้าร่วมกิจกรรมและแกนนำกลุ่มนักเรียน",
      description:
        "ร่วมจัดกิจกรรมค่ายศิลปะและวาดภาพระบายสีปรับปรุงภูมิทัศน์ภายในสถานศึกษา ส่งเสริมการทำงานเป็นทีมและภาวะผู้นำในการทำกิจกรรมเพื่อสังคม",
      learned:
        "ทักษะการวางแผนการทำงานร่วมกับผู้อื่น การสื่อสารและการแก้ไขปัญหาเฉพาะหน้า ตลอดจนการนำความรู้ด้านศิลปะไปรับใช้สังคม",
      layout: "hero-1-4",
      fitMode: "cover",
      images: ["", "", "", "", ""],
    },
  ],
  questions: [
    {
      id: "q_1",
      question: "เหตุใดท่านจึงอยากเข้าศึกษาต่อในสาขาวิชานี้ และมีเป้าหมายในอนาคตอย่างไร",
      answer:
        "เพราะข้าพเจ้าเชื่อว่าศิลปะและการศึกษาเป็นรากฐานสำคัญในการพัฒนาศักยภาพของมนุษย์ ข้าพเจ้าต้องการนำทักษะความสามารถที่มีมาต่อยอดในระดับอุดมศึกษา เพื่อก้าวไปเป็นบุคลากรที่มีคุณภาพและสร้างสรรค์ผลงานที่เป็นประโยชน์ต่อสังคม",
    },
  ],
};

const STORAGE_KEY_PREFIX = "artroom_tcasfolio_builder_v1";

/**
 * Strips legacy sample mockup values ("Wachiratham Satit", "นางสมศรี สาธิต", "15/10/2008", etc.)
 * that were previously pre-filled into student drafts, while keeping any real values typed by the student.
 */
function sanitizeLegacySampleProfile(
  rawProfile: Partial<PortfolioState["profile"]> | undefined,
  realStudentName?: string
): PortfolioState["profile"] {
  const p = { ...DEFAULT_STATE.profile, ...(rawProfile || {}) };

  const hasLegacySample =
    p.fullNameEn === "Wachiratham Satit" ||
    p.citizenId === "1-1032-00161-46-5" ||
    p.birthDate === "15/10/2008" ||
    p.parentName === "นางสมศรี สาธิต" ||
    p.parentEmail === "parent@gmail.com" ||
    p.parentPhone === "081-841-5982" ||
    p.phone === "084-353-0359" ||
    p.addressNo === "เลขที่ 1091 ถนนสุขุมวิท 101/1";

  if (p.fullNameTh === "นายวชิรธรรม สาธิต") p.fullNameTh = realStudentName || "";
  else if (!p.fullNameTh && realStudentName) p.fullNameTh = realStudentName;

  if (p.fullNameEn === "Wachiratham Satit") p.fullNameEn = "";
  if (p.citizenId === "1-1032-00161-46-5") p.citizenId = "";
  if (p.birthDate === "15/10/2008") p.birthDate = "";
  if (p.age === "18 ปี 1 เดือน") p.age = "";
  if (p.email === "student@wts.ac.th" || /^\d{4,6}@(wachiratham|wts)\.ac\.th$/i.test((p.email || "").trim())) {
    p.email = "";
  }
  if (p.phone === "084-353-0359") p.phone = "";
  if (p.weight === "65 กก.") p.weight = "";
  if (p.height === "175 ซม.") p.height = "";
  if (p.parentName === "นางสมศรี สาธิต") p.parentName = "";
  if (p.parentPhone === "081-841-5982") p.parentPhone = "";
  if (p.parentEmail === "parent@gmail.com") p.parentEmail = "";
  if (p.addressNo === "เลขที่ 1091 ถนนสุขุมวิท 101/1") p.addressNo = "";

  if (hasLegacySample) {
    if (p.gender === "ชาย") p.gender = "";
    if (p.parentRelation === "มารดา") p.parentRelation = "";
    if (p.subDistrict === "บางจาก") p.subDistrict = "";
    if (p.district === "พระโขนง") p.district = "";
    if (p.province === "กรุงเทพมหานคร") p.province = "";
    if (p.postalCode === "10260") p.postalCode = "";
    if (p.studyPlan === "แผนการเรียนศิลปะ-การออกแบบ") p.studyPlan = "";
    if (p.eduYear === "2569") p.eduYear = "";
    if (p.gpax4 === "3.65") p.gpax4 = "";
    if (p.gpax5 === "3.72") p.gpax5 = "";
  }

  return p;
}

const LEGACY_SAMPLE_GPAS = ["3.80", "3.45", "3.60", "3.75", "4.00", "4.00", "3.90", "3.65"];
function sanitizeLegacySubjectGrades(
  grades: PortfolioState["subjectGrades"] | undefined
): PortfolioState["subjectGrades"] {
  if (!Array.isArray(grades) || grades.length === 0) return DEFAULT_STATE.subjectGrades;
  const isExactSample =
    grades.length === LEGACY_SAMPLE_GPAS.length &&
    grades.every((g, i) => g.gpa === LEGACY_SAMPLE_GPAS[i]);
  if (isExactSample) {
    return grades.map((g) => ({ ...g, credits: "", gpa: "" }));
  }
  return grades;
}

function getStudentStorageKey(studentId?: string): string {
  const cleanId = (studentId || "").trim();
  return cleanId ? `${STORAGE_KEY_PREFIX}_${cleanId}` : STORAGE_KEY_PREFIX;
}

const LEVEL_OPTIONS = [
  "ระดับนานาชาติ",
  "ระดับชาติ",
  "ระดับภูมิภาค",
  "ระดับจังหวัด",
  "ระดับเขตพื้นที่ฯ",
  "ระดับสถานศึกษา",
];

const COST_OPTIONS = ["ไม่มีค่าใช้จ่าย", "มีค่าใช้จ่าย"];

export default function PortfolioBuilderPage() {
  return (
    <StudentAccessGuard
      zoneTitle="ระบบสร้างแฟ้มสะสมผลงาน (Portfolio) เฉพาะนักเรียน"
      zoneDescription="ระบบจัดทำแฟ้มสะสมผลงานรายบุคคล (Portfolio) สงวนสิทธิ์เฉพาะนักเรียนโรงเรียนวชิรธรรมสาธิต โดยนักเรียนแต่ละคนจะเข้าถึงและมองเห็นเฉพาะข้อมูล ผลงานศิลปะ และเกียรติบัตรของตนเองเท่านั้น กรุณาเข้าสู่ระบบด้วยรหัสประจำตัวนักเรียนก่อนเข้าใช้งาน"
    >
      <PortfolioBuilderContent />
    </StudentAccessGuard>
  );
}

function PortfolioBuilderContent() {
  const [state, setState] = useState<PortfolioState>(DEFAULT_STATE);
  const [sysConfig, setSysConfig] = useState<PortfolioConfigSettings>(DEFAULT_PORTFOLIO_CONFIG);
  const [currentStudentId, setCurrentStudentId] = useState<string>("");
  const [currentStudentName, setCurrentStudentName] = useState<string>("");
  const [currentClassroom, setCurrentClassroom] = useState<string>("");
  const [portfolioStatus, setPortfolioStatus] = useState<"draft" | "submitted" | "approved" | "revision">("draft");
  const [teacherFeedback, setTeacherFeedback] = useState<string>("");
  const [isAdminViewing, setIsAdminViewing] = useState<boolean>(false);
  const [isSavingServer, setIsSavingServer] = useState<boolean>(false);
  const [isLoaded, setIsLoaded] = useState(false);
  const [activeEntryId, setActiveEntryId] = useState<string | null>(null);
  const [openToolbarDropdown, setOpenToolbarDropdown] = useState<"layout" | "fit" | null>(null);

  // Import from Art Room DB modal state (Strictly student's own items)
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [importTab, setImportTab] = useState<"submissions" | "awards" | "artworks">("submissions");
  const [studentSubmissions, setStudentSubmissions] = useState<any[]>([]);
  const [schoolAwards, setSchoolAwards] = useState<any[]>([]);
  const [schoolArtworks, setSchoolArtworks] = useState<any[]>([]);
  const [isLoadingImport, setIsLoadingImport] = useState(false);

  // Image picker modal for a specific slot
  const [slotPickerTarget, setSlotPickerTarget] = useState<{
    entryId: string;
    slotIndex: number;
  } | null>(null);

  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const [pendingUploadCallback, setPendingUploadCallback] = useState<((dataUrl: string) => void) | null>(null);
  const [cropperFile, setCropperFile] = useState<File | null>(null);
  const [isCropperOpen, setIsCropperOpen] = useState<boolean>(false);
  const [isUnivLogoPickerOpen, setIsUnivLogoPickerOpen] = useState<boolean>(false);

  // Load saved state scoped strictly to the logged-in student ID (or query ?studentId= for Admin)
  useEffect(() => {
    let isMounted = true;
    const initPortfolio = async () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const queryStudentId = (params.get("studentId") || "").trim();
        const role = localStorage.getItem("artroom_role") || "";
        const isTeacherOrAdmin = role === "admin" || role === "teacher";

        const localStudentId = (localStorage.getItem("artroom_student_id") || "").trim();
        const targetStudentId = queryStudentId || localStudentId;
        const name = (localStorage.getItem("artroom_author_name") || "").trim();
        const classroom = (localStorage.getItem("artroom_classroom") || localStorage.getItem("artroom_student_grade") || "").trim();
        const email = localStorage.getItem("artroom_author_email") || "";
        const phone = localStorage.getItem("artroom_phone") || "";
        const avatar = localStorage.getItem("artroom_avatar") || "";

        if (queryStudentId && queryStudentId !== localStudentId) {
          setIsAdminViewing(true);
        } else if (isTeacherOrAdmin && queryStudentId) {
          setIsAdminViewing(true);
        }

        setCurrentStudentId(targetStudentId);
        setCurrentStudentName(name);
        setCurrentClassroom(classroom);

        // 0. Load global admin portfolio labels & default config
        let fetchedCfg = DEFAULT_PORTFOLIO_CONFIG;
        try {
          const cfgRes = await fetch("/api/settings/portfolio-config", { cache: "no-store" });
          if (cfgRes.ok) {
            const cfgData: any = await cfgRes.json();
            if (cfgData) {
              fetchedCfg = { ...DEFAULT_PORTFOLIO_CONFIG, ...cfgData };
              if (isMounted) setSysConfig(fetchedCfg);
            }
          }
        } catch { }

        // 1. Try loading from D1 Server API (/api/portfolios) first
        let loadedFromServer = false;
        if (targetStudentId) {
          try {
            const res = await fetch(`/api/portfolios?studentId=${encodeURIComponent(targetStudentId)}`, {
              cache: "no-store",
            });
            if (res.ok) {
              const data: any = await res.json();
              if (data?.record && data.record.portfolioJson) {
                const parsedServer = JSON.parse(data.record.portfolioJson);
                if (isMounted) {
                  const realName = data.record.studentName || name;
                  setState((prev) => ({
                    ...prev,
                    ...parsedServer,
                    universityLogo: resolveUniversityLogo(parsedServer.university, parsedServer.universityLogo),
                    sections: { ...prev.sections, ...(parsedServer.sections || {}) },
                    profile: sanitizeLegacySampleProfile(parsedServer.profile, realName),
                    subjectGrades: sanitizeLegacySubjectGrades(parsedServer.subjectGrades),
                  }));
                  if (data.record.studentName) setCurrentStudentName(data.record.studentName);
                  if (data.record.classroom) setCurrentClassroom(data.record.classroom);
                  if (data.record.status) setPortfolioStatus(data.record.status);
                  if (data.record.teacherFeedback) setTeacherFeedback(data.record.teacherFeedback);
                  loadedFromServer = true;
                }
              }
            }
          } catch (err) {
            console.warn("Could not fetch server portfolio, falling back to localStorage:", err);
          }
        }

        // 2. Fallback to localStorage if not found on server yet
        if (!loadedFromServer && isMounted) {
          const storageKey = getStudentStorageKey(targetStudentId);
          const saved = localStorage.getItem(storageKey);

          if (saved) {
            const parsed = JSON.parse(saved);
            setState((prev) => ({
              ...prev,
              ...parsed,
              universityLogo: resolveUniversityLogo(parsed.university, parsed.universityLogo),
              sections: { ...prev.sections, ...(parsed.sections || {}) },
              profile: sanitizeLegacySampleProfile(parsed.profile, name),
              subjectGrades: sanitizeLegacySubjectGrades(parsed.subjectGrades),
            }));
          } else {
            // Initialize fresh portfolio for this logged-in student (blank personal/parent/address fields so students fill their own)
            const cleanRealEmail =
              email && !/^\d{4,6}@(wachiratham|wts)\.ac\.th$/i.test(email.trim()) && email !== "student@wts.ac.th"
                ? email
                : "";
            const initUniv = fetchedCfg.defaultUniversity || DEFAULT_STATE.university;
            setState((prev) => ({
              ...prev,
              academicYear: fetchedCfg.defaultAcademicYear || prev.academicYear,
              university: initUniv,
              universityLogo: resolveUniversityLogo(initUniv, prev.universityLogo),
              faculty: fetchedCfg.defaultFaculty || prev.faculty,
              major: fetchedCfg.defaultMajor || prev.major,
              projectRound: fetchedCfg.defaultProjectRound || prev.projectRound,
              profile: {
                ...prev.profile,
                fullNameTh: name || "",
                email: cleanRealEmail,
                phone: phone || "",
                schoolName: fetchedCfg.defaultSchoolName || prev.profile.schoolName,
                schoolProvince: fetchedCfg.defaultSchoolProvince || prev.profile.schoolProvince,
                studyPlan:
                  fetchedCfg.defaultStudyPlan && fetchedCfg.defaultStudyPlan !== "แผนการเรียนศิลปะ-การออกแบบ"
                    ? fetchedCfg.defaultStudyPlan
                    : "",
                photoUrl:
                  avatar && (avatar.startsWith("data:") || avatar.startsWith("http") || avatar.startsWith("/"))
                    ? avatar
                    : prev.profile.photoUrl,
              },
              questions: prev.questions.map((q, idx) =>
                idx === 0 && fetchedCfg.defaultQuestion1 ? { ...q, question: fetchedCfg.defaultQuestion1 } : q
              ),
            }));
          }
        }
      } catch (e) {
        console.error("Failed to load portfolio state:", e);
      } finally {
        if (isMounted) setIsLoaded(true);
      }
    };

    initPortfolio();
    return () => {
      isMounted = false;
    };
  }, []);

  // Auto-save whenever state changes (isolated per student ID)
  useEffect(() => {
    if (!isLoaded || !currentStudentId) return;
    try {
      const storageKey = getStudentStorageKey(currentStudentId);
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch (e) {
      console.warn("Could not save portfolio to localStorage (quota):", e);
    }
  }, [state, isLoaded, currentStudentId]);

  // Helper to check if an award/artwork belongs to the logged-in student
  const isOwnedByCurrentStudent = (authorOrStudentField: string | undefined | null, sName: string, sId: string): boolean => {
    const raw = (authorOrStudentField || "").trim();
    if (!raw) return false;
    if (sId && raw.includes(sId)) return true;
    if (!sName) return false;
    const cleanTarget = raw.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)\s*/g, "").trim();
    const cleanStudent = sName.replace(/^(เด็กชาย|เด็กหญิง|ด\.ช\.|ด\.ญ\.|นาย|นางสาว|น\.ส\.)\s*/g, "").trim();
    if (!cleanStudent) return false;
    return raw.includes(cleanStudent) || cleanTarget.includes(cleanStudent);
  };

  // Fetch ONLY this student's own items from Art Room repository
  const loadArtRoomRepository = async () => {
    setIsLoadingImport(true);
    try {
      const studentId = (localStorage.getItem("artroom_student_id") || currentStudentId).trim();
      const studentName = (localStorage.getItem("artroom_author_name") || currentStudentName).trim();

      if (!studentId) {
        setStudentSubmissions([]);
        setSchoolAwards([]);
        setSchoolArtworks([]);
        return;
      }

      const [subsRes, awardsRes, artworksRes] = await Promise.all([
        fetch(`/api/submissions?studentId=${encodeURIComponent(studentId)}&_t=${Date.now()}`)
          .then((r) => (r.ok ? r.json() : []))
          .catch(() => []),
        fetch("/api/awards").then((r) => (r.ok ? r.json() : [])).catch(() => []),
        fetch("/api/artworks").then((r) => (r.ok ? r.json() : [])).catch(() => []),
      ]);

      // 1. Student's own submissions (strictly filtered by studentId)
      const mySubs = (Array.isArray(subsRes) ? subsRes : []).filter(
        (s: any) => String(s.studentId || "").trim() === studentId
      );
      setStudentSubmissions(mySubs);

      // 2. Only awards belonging to this student
      const allAwards = Array.isArray(awardsRes) ? awardsRes : [];
      const myAwards = allAwards.filter((a: any) =>
        isOwnedByCurrentStudent(a.student, studentName, studentId)
      );
      setSchoolAwards(myAwards);

      // 3. Only gallery artworks belonging to this student
      const allArtworks = Array.isArray(artworksRes) ? artworksRes : [];
      const myArtworks = allArtworks.filter((art: any) =>
        isOwnedByCurrentStudent(art.author, studentName, studentId)
      );
      setSchoolArtworks(myArtworks);
    } catch (err) {
      console.error("Error loading repository:", err);
    } finally {
      setIsLoadingImport(false);
    }
  };

  const triggerImageUpload = (onUploaded: (url: string) => void) => {
    setPendingUploadCallback(() => onUploaded);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
      fileInputRef.current.click();
    }
  };

  const finalizePortfolioImageFile = async (targetFile: File, cropped: boolean) => {
    if (!pendingUploadCallback) return;
    try {
      const compressedFile = await compressImage(targetFile, {
        maxWidth: 1400,
        maxHeight: 1400,
        quality: 0.82,
      });
      const dataUrl = await fileToDataUrl(compressedFile);
      pendingUploadCallback(dataUrl);
      swalToast(cropped ? "ครอบตัดและอัปโหลดรูปภาพเรียบร้อย" : "อัปโหลดรูปภาพเรียบร้อย", "success");
    } catch (err) {
      console.error("Image upload error:", err);
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === "string") {
          pendingUploadCallback(reader.result);
        }
      };
      reader.readAsDataURL(targetFile);
    } finally {
      setIsCropperOpen(false);
      setCropperFile(null);
    }
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = "";
    if (!file || !pendingUploadCallback) return;
    setCropperFile(file);
    setIsCropperOpen(true);
  };

  const saveToBackend = async (nextStatus?: "draft" | "submitted") => {
    if (!currentStudentId) return false;
    setIsSavingServer(true);
    try {
      const res = await fetch("/api/portfolios", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          studentId: currentStudentId,
          studentName: state.profile.fullNameTh || currentStudentName,
          classroom: currentClassroom,
          status: nextStatus || portfolioStatus,
          portfolio: state,
        }),
      });
      if (res.ok && nextStatus) {
        setPortfolioStatus(nextStatus);
      }
      return res.ok;
    } catch (err) {
      console.warn("Failed to sync portfolio to server:", err);
      return false;
    } finally {
      setIsSavingServer(false);
    }
  };

  const handleSaveManual = async () => {
    try {
      const storageKey = getStudentStorageKey(currentStudentId);
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch { }
    const ok = await saveToBackend();
    if (ok) {
      swalSuccess(
        "บันทึกแฟ้มสะสมผลงานแล้ว!",
        `ซิงค์ข้อมูลแฟ้มสะสมผลงานของ ${state.profile.fullNameTh || currentStudentName || "คุณ"} เข้าสู่ระบบเรียบร้อย`,
        1600
      );
    } else {
      swalSuccess(
        "บันทึกแฟ้มสะสมผลงานแล้ว!",
        `ข้อมูลแฟ้มสะสมผลงานของ ${currentStudentName || "คุณ"} ถูกบันทึกไว้ในเครื่องเรียบร้อย`,
        1600
      );
    }
  };

  const handleSubmitForTeacherReview = async () => {
    try {
      const storageKey = getStudentStorageKey(currentStudentId);
      localStorage.setItem(storageKey, JSON.stringify(state));
    } catch { }
    const ok = await saveToBackend("submitted");
    if (ok) {
      swalSuccess(
        "ส่งแฟ้มให้คุณครูตรวจเรียบร้อย!",
        "คุณครูผู้สอนสามารถเปิดดูและให้คำแนะนำแฟ้มสะสมผลงานของคุณผ่านระบบหลังบ้านได้ทันที",
        2000
      );
    } else {
      swalToast("ไม่สามารถส่งข้อมูลไปยังเซิร์ฟเวอร์ได้ กรุณาลองอีกครั้ง", "error");
    }
  };

  const handleResetDefault = async () => {
    if (await swalConfirm("ต้องการล้างข้อมูลและคืนค่าเริ่มต้นของแฟ้มสะสมผลงานของคุณหรือไม่?")) {
      const storageKey = getStudentStorageKey(currentStudentId);
      localStorage.removeItem(storageKey);
      setState({
        ...DEFAULT_STATE,
        profile: {
          ...DEFAULT_STATE.profile,
          fullNameTh: currentStudentName || "",
        },
      });
      swalToast("คืนค่าเริ่มต้นเรียบร้อยแล้ว", "info");
    }
  };

  const handlePrintPdf = () => {
    setActiveEntryId(null);
    setTimeout(() => {
      window.print();
    }, 150);
  };

  const toggleSection = (key: keyof PortfolioState["sections"]) => {
    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        [key]: !prev.sections[key],
      },
    }));
  };

  const updateProfile = (field: keyof PortfolioState["profile"], value: string) => {
    setState((prev) => ({
      ...prev,
      profile: {
        ...prev.profile,
        [field]: value,
      },
    }));
  };

  const addEntry = (category: "4.1" | "4.2" | "4.3", prefill?: Partial<PortfolioEntry>) => {
    const newId = `entry_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const defaultLayout: LayoutType = prefill?.layout || "16-9";
    const slots = getSlotCountForLayout(defaultLayout);
    const initialImages = Array.from({ length: slots }, (_, idx) => prefill?.images?.[idx] || "");

    const newEntry: PortfolioEntry = {
      id: newId,
      category,
      title: prefill?.title ?? "",
      level: prefill?.level ?? "",
      costType: prefill?.costType ?? "",
      dateStr: prefill?.dateStr ?? "",
      organization: prefill?.organization ?? "",
      awardResult: prefill?.awardResult ?? "",
      description: prefill?.description ?? "",
      learned: prefill?.learned ?? "",
      layout: defaultLayout,
      fitMode: prefill?.fitMode || "cover",
      showImages: prefill?.showImages ?? Boolean(prefill?.images?.some(Boolean)),
      images: initialImages,
    };

    setState((prev) => ({
      ...prev,
      sections: {
        ...prev.sections,
        sec4_1_awards: category === "4.1" ? true : prev.sections.sec4_1_awards,
        sec4_2_works: category === "4.2" ? true : prev.sections.sec4_2_works,
        sec4_3_activities: category === "4.3" ? true : prev.sections.sec4_3_activities,
      },
      entries: [...prev.entries, newEntry],
    }));
    setActiveEntryId(newId);
  };

  const updateEntry = (id: string, patch: Partial<PortfolioEntry>) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((item) => {
        if (item.id !== id) return item;
        const updated = { ...item, ...patch };
        if (patch.layout && patch.layout !== item.layout) {
          const needed = getSlotCountForLayout(patch.layout);
          const nextImgs = Array.from({ length: needed }, (_, i) => updated.images[i] || "");
          updated.images = nextImgs;
        }
        return updated;
      }),
    }));
  };

  const updateEntryImageSlot = (entryId: string, slotIndex: number, imageUrl: string) => {
    setState((prev) => ({
      ...prev,
      entries: prev.entries.map((item) => {
        if (item.id !== entryId) return item;
        const needed = getSlotCountForLayout(item.layout);
        const nextImgs = Array.from({ length: needed }, (_, i) => item.images[i] || "");
        nextImgs[slotIndex] = imageUrl;
        return { ...item, images: nextImgs };
      }),
    }));
  };

  const moveEntry = (id: string, direction: "up" | "down") => {
    setState((prev) => {
      const target = prev.entries.find((e) => e.id === id);
      if (!target) return prev;
      const sameCat = prev.entries.filter((e) => e.category === target.category);
      const idxInCat = sameCat.findIndex((e) => e.id === id);
      if (direction === "up" && idxInCat <= 0) return prev;
      if (direction === "down" && idxInCat >= sameCat.length - 1) return prev;

      const swapWithId = sameCat[direction === "up" ? idxInCat - 1 : idxInCat + 1].id;
      const fullList = [...prev.entries];
      const idxA = fullList.findIndex((e) => e.id === id);
      const idxB = fullList.findIndex((e) => e.id === swapWithId);
      const temp = fullList[idxA];
      fullList[idxA] = fullList[idxB];
      fullList[idxB] = temp;
      return { ...prev, entries: fullList };
    });
  };

  const deleteEntry = async (id: string) => {
    if (await swalConfirm("ต้องการลบหัวข้อผลงานนี้ออกจากแฟ้มสะสมผลงานหรือไม่?")) {
      setState((prev) => ({
        ...prev,
        entries: prev.entries.filter((e) => e.id !== id),
      }));
      if (activeEntryId === id) setActiveEntryId(null);
      swalToast("ลบรายการเรียบร้อย", "info");
    }
  };

  const adjustEntrySlots = (entry: PortfolioEntry, delta: -1 | 1) => {
    const isShowing = entry.showImages !== false;
    if (delta === -1 && isShowing) {
      const currentSlots = getSlotCountForLayout(entry.layout);
      if (currentSlots <= 1) {
        updateEntry(entry.id, { showImages: false });
        return;
      }
      const targetSlots = currentSlots - 1;
      const mapBySlot: Record<number, LayoutType> = {
        1: "16-9",
        2: "grid-4-3-2",
        3: "hero-1-2",
        4: "table-2x2",
        5: "hero-1-4",
        6: "grid-4-3-6",
      };
      updateEntry(entry.id, { layout: mapBySlot[targetSlots] || "16-9", showImages: true });
      return;
    }

    if (delta === 1) {
      if (!isShowing) {
        updateEntry(entry.id, { showImages: true });
        return;
      }
      const currentSlots = getSlotCountForLayout(entry.layout);
      const targetSlots = Math.min(6, currentSlots + 1);
      const mapBySlot: Record<number, LayoutType> = {
        1: "16-9",
        2: "grid-4-3-2",
        3: "hero-1-2",
        4: "table-2x2",
        5: "hero-1-4",
        6: "grid-4-3-6",
      };
      updateEntry(entry.id, { layout: mapBySlot[targetSlots] || "hero-1-4", showImages: true });
    }
  };

  // Warning checks like TCASFOLIO banner
  const emptyImageSlotsWarnings: string[] = [];
  const missingTitleWarnings: string[] = [];

  state.entries.forEach((e, idx) => {
    const catName =
      e.category === "4.1"
        ? "หมวด 4.1 - รางวัล / เกียรติบัตร"
        : e.category === "4.2"
          ? "หมวด 4.2 - ผลงาน"
          : "หมวด 4.3 - กิจกรรม";
    const isCatEnabled =
      (e.category === "4.1" && state.sections.sec4_1_awards) ||
      (e.category === "4.2" && state.sections.sec4_2_works) ||
      (e.category === "4.3" && state.sections.sec4_3_activities);

    if (!isCatEnabled) return;

    if (!e.title.trim()) {
      missingTitleWarnings.push(`ยังไม่ได้ใส่ชื่อผลงาน: ${catName} - ข้อที่ ${idx + 1}`);
    }
    const slots = getSlotCountForLayout(e.layout);
    const filled = e.images.slice(0, slots).filter((img) => Boolean(img)).length;
    const emptyCount = slots - filled;
    if (emptyCount > 0) {
      emptyImageSlotsWarnings.push(
        `กล่องรูปยังว่าง ${emptyCount} ช่อง: ${catName} (${e.title.slice(0, 28)}...) — PDF จะไม่แสดงกล่องว่าง`
      );
    }
  });

  // Estimate total pages used
  const estimatedPages =
    (state.sections.sec1_cover ? 1 : 0) +
    (state.sections.sec1_transcriptFront || state.sections.sec1_transcriptBack ? 1 : 0) +
    (state.sections.sec2_essay || state.sections.sec3_attachments ? 1 : 0) +
    Math.ceil(
      state.entries.filter(
        (e) =>
          (e.category === "4.1" && state.sections.sec4_1_awards) ||
          (e.category === "4.2" && state.sections.sec4_2_works) ||
          (e.category === "4.3" && state.sections.sec4_3_activities)
      ).length / 2
    ) +
    (state.sections.sec5_questions && state.questions.length > 0 ? 1 : 0);

  // Word & character counter for active entry
  const getEntryTextStats = (entry: PortfolioEntry) => {
    const combined = `${entry.title} ${entry.awardResult} ${entry.description} ${entry.learned}`.trim();
    const noSpaceChars = combined.replace(/\s+/g, "").length;
    const words = combined
      ? combined
        .split(/\s+/)
        .filter(Boolean).length
      : 0;
    return { words, chars: noSpaceChars };
  };

  // Render dynamic photo layout matching TCASFOLIO screenshot
  const renderEntryImageGrid = (entry: PortfolioEntry) => {
    const slots = getSlotCountForLayout(entry.layout);
    const imgs = Array.from({ length: slots }, (_, i) => entry.images[i] || "");
    const objFitClass = entry.fitMode === "contain" ? "object-contain bg-slate-50" : "object-cover";

    const renderSlot = (slotIdx: number, extraClass: string = "") => {
      const imgUrl = imgs[slotIdx];
      return (
        <div
          key={slotIdx}
          onClick={(e) => {
            e.stopPropagation();
            setActiveEntryId(entry.id);
            setSlotPickerTarget({ entryId: entry.id, slotIndex: slotIdx });
          }}
          className={`relative group/slot rounded-xl overflow-hidden bg-[#f1f5f9] border border-slate-200/90 hover:border-teal-500 transition-all flex flex-col items-center justify-center cursor-pointer select-none ${extraClass} ${!imgUrl ? "print:hidden" : ""
            }`}
        >
          {imgUrl ? (
            <>
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img
                src={imgUrl}
                alt={`${entry.title} - รูปที่ ${slotIdx + 1}`}
                className={`w-full h-full ${objFitClass}`}
              />
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/slot:opacity-100 transition-opacity flex items-center justify-center gap-2 print:hidden">
                <span className="px-2.5 py-1 rounded-lg bg-white text-slate-800 font-bold text-[11px] shadow-sm">
                  เปลี่ยนรูป
                </span>
                <button
                  type="button"
                  onClick={(ev) => {
                    ev.stopPropagation();
                    updateEntryImageSlot(entry.id, slotIdx, "");
                  }}
                  className="p-1.5 rounded-lg bg-red-600 text-white hover:bg-red-700 shadow-sm no-min-h"
                  title="ลบรูปนี้"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </button>
              </div>
            </>
          ) : (
            <div className="flex flex-col items-center justify-center p-3 text-slate-400 group-hover/slot:text-teal-600 transition-colors">
              <ImageIcon className="w-7 h-7 mb-1 stroke-[1.5]" />
              <span className="text-[11px] font-medium">เลือกรูปภาพ</span>
            </div>
          )}
        </div>
      );
    };

    switch (entry.layout) {
      case "a4-landscape":
        return <div className="grid grid-cols-1 gap-2.5">{renderSlot(0, "aspect-[1.414/1] max-h-[420px]")}</div>;
      case "a4-full":
        return <div className="grid grid-cols-1 gap-2.5">{renderSlot(0, "aspect-[1/1.35] max-h-[520px]")}</div>;
      case "16-9":
        return <div className="grid grid-cols-1 gap-2.5">{renderSlot(0, "aspect-video max-h-[320px]")}</div>;
      case "4-3":
        return <div className="grid grid-cols-1 gap-2.5">{renderSlot(0, "aspect-[4/3] max-h-[340px]")}</div>;
      case "4-5":
        return <div className="grid grid-cols-1 max-w-sm mx-auto gap-2.5">{renderSlot(0, "aspect-[4/5]")}</div>;
      case "1-1":
        return <div className="grid grid-cols-1 max-w-sm mx-auto gap-2.5">{renderSlot(0, "aspect-square")}</div>;
      case "grid-4-3-2":
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {renderSlot(0, "aspect-[4/3]")}
            {renderSlot(1, "aspect-[4/3]")}
          </div>
        );
      case "grid-4-3-3":
        return (
          <div className="grid grid-cols-3 gap-2.5">
            {renderSlot(0, "aspect-[4/3]")}
            {renderSlot(1, "aspect-[4/3]")}
            {renderSlot(2, "aspect-[4/3]")}
          </div>
        );
      case "grid-4-3-4":
        return (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
            {renderSlot(0, "aspect-[4/3]")}
            {renderSlot(1, "aspect-[4/3]")}
            {renderSlot(2, "aspect-[4/3]")}
            {renderSlot(3, "aspect-[4/3]")}
          </div>
        );
      case "grid-4-3-6":
        return (
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2, 3, 4, 5].map((i) => renderSlot(i, "aspect-[4/3]"))}
          </div>
        );
      case "grid-4-5-2":
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {renderSlot(0, "aspect-[4/5]")}
            {renderSlot(1, "aspect-[4/5]")}
          </div>
        );
      case "grid-4-5-3":
        return (
          <div className="grid grid-cols-3 gap-2.5">
            {[0, 1, 2].map((i) => renderSlot(i, "aspect-[4/5]"))}
          </div>
        );
      case "grid-4-5-4":
        return (
          <div className="grid grid-cols-4 gap-2.5">
            {[0, 1, 2, 3].map((i) => renderSlot(i, "aspect-[4/5]"))}
          </div>
        );
      case "grid-4-5-5":
        return (
          <div className="grid grid-cols-5 gap-2">
            {[0, 1, 2, 3, 4].map((i) => renderSlot(i, "aspect-[4/5]"))}
          </div>
        );
      case "grid-4-5-6":
        return (
          <div className="grid grid-cols-3 sm:grid-cols-6 gap-2">
            {[0, 1, 2, 3, 4, 5].map((i) => renderSlot(i, "aspect-[4/5]"))}
          </div>
        );
      case "table-2x2":
        return (
          <div className="grid grid-cols-2 gap-2.5">
            {[0, 1, 2, 3].map((i) => renderSlot(i, "aspect-square max-h-[210px]"))}
          </div>
        );
      case "hero-1-2":
        return (
          <div className="grid grid-cols-12 gap-2.5 items-stretch">
            <div className="col-span-7">{renderSlot(0, "h-full min-h-[200px] aspect-[4/3]")}</div>
            <div className="col-span-5 grid grid-rows-2 gap-2.5">
              {renderSlot(1, "h-full min-h-[95px]")}
              {renderSlot(2, "h-full min-h-[95px]")}
            </div>
          </div>
        );
      case "hero-1-4":
      default:
        // Exact TCASFOLIO signature layout: Big certificate/hero on left (55%), 2x2 grid on right (45%)
        return (
          <div className="grid grid-cols-12 gap-2.5 items-stretch">
            <div className="col-span-12 sm:col-span-6">
              {renderSlot(0, "w-full h-full min-h-[210px] sm:min-h-[225px]")}
            </div>
            <div className="col-span-12 sm:col-span-6 grid grid-cols-2 grid-rows-2 gap-2.5">
              {renderSlot(1, "aspect-[4/3] w-full h-full min-h-[104px]")}
              {renderSlot(2, "aspect-[4/3] w-full h-full min-h-[104px]")}
              {renderSlot(3, "aspect-[4/3] w-full h-full min-h-[104px]")}
              {renderSlot(4, "aspect-[4/3] w-full h-full min-h-[104px]")}
            </div>
          </div>
        );
    }
  };

  // Render category section (4.1, 4.2, 4.3)
  const renderCategorySection = (
    catKey: "4.1" | "4.2" | "4.3",
    badgeTitle: string
  ) => {
    const catEntries = state.entries.filter((e) => e.category === catKey);

    return (
      <div className="space-y-4 pt-3">
        {catEntries.length === 0 ? (
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <div className="inline-flex items-center gap-2">
                <span className="px-4 py-1.5 rounded-lg bg-[#13426b] text-white font-bold text-xs sm:text-sm shadow-2xs">
                  {badgeTitle}
                </span>
                <span className="w-5 h-5 rounded-full border border-[#13426b] text-[#13426b] flex items-center justify-center text-[11px] font-serif italic font-bold print:hidden">
                  i
                </span>
              </div>
              <div className="flex items-center gap-1.5 print:hidden">
                <button
                  type="button"
                  onClick={() => {
                    setIsImportModalOpen(true);
                    loadArtRoomRepository();
                  }}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold transition-colors no-min-h"
                >
                  <FolderOpen className="w-3.5 h-3.5" />
                  <span>ดึงจากคลัง ART ROOM</span>
                </button>
                <button
                  type="button"
                  onClick={() => addEntry(catKey)}
                  className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white text-[11px] font-bold transition-colors no-min-h"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>เพิ่มหัวข้อ</span>
                </button>
              </div>
            </div>
            <div className="p-6 rounded-2xl border border-dashed border-slate-300 text-center text-slate-400 text-xs print:hidden">
              ยังไม่มีรายการใน{badgeTitle} กดปุ่ม <strong>+ เพิ่มหัวข้อ</strong> หรือ <strong>ดึงจากคลัง ART ROOM</strong>
            </div>
          </div>
        ) : (
          <div className="space-y-5">
            {catEntries.map((entry, idx) => {
              const isSelected = activeEntryId === entry.id;
              const stats = getEntryTextStats(entry);
              const isImagesVisible = entry.showImages !== false;

              return (
                <div
                  key={entry.id}
                  onClick={(e) => {
                    e.stopPropagation();
                    if (activeEntryId !== entry.id) {
                      setActiveEntryId(entry.id);
                      setOpenToolbarDropdown(null);
                    } else {
                      setOpenToolbarDropdown(null);
                    }
                  }}
                  className={`relative rounded-xl p-3.5 sm:p-4 transition-all break-inside-avoid ${isSelected
                    ? "border-[2px] border-[#0d9488] bg-white print:border-none"
                    : "border-[2px] border-transparent hover:border-slate-200 print:border-none"
                    }`}
                >
                  {/* Floating Dark Action Toolbar (Exact 1:1 TCASFOLIO Replica) */}
                  {isSelected && (
                    <div
                      onClick={(e) => e.stopPropagation()}
                      className=" -mt-12 mb-3 mx-auto w-fit max-w-full bg-[#111827] text-white rounded-2xl px-3.5 py-2 shadow-2xl flex flex-wrap items-center gap-2.5 text-xs border border-slate-800 relative z-40 print:hidden select-none"
                    >
                      {/* 1. Pencil Icon + Word & Character Counter */}
                      <div className="flex items-center gap-1.5 pr-3 border-r border-slate-700 text-xs text-slate-200 whitespace-nowrap">
                        <Pencil className="w-3.5 h-3.5 text-slate-300 shrink-0" />
                        <span>
                          <strong className="text-white font-bold">{stats.words}</strong> คำ -{" "}
                          <strong className="text-white font-bold">{stats.chars}</strong> ตัวอักษร (ไม่รวมช่องว่าง)
                        </span>
                      </div>

                      {/* 2. Segmented [ - | ImageIcon | + ] Button Group */}
                      <div className="flex items-center bg-[#262f3f] rounded-lg border border-slate-600/80 overflow-hidden h-8">
                        <button
                          type="button"
                          onClick={() => adjustEntrySlots(entry, -1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border-r border-slate-600/80 text-sm font-medium no-min-h"
                          title="ซ่อนรูปภาพ / ลดจำนวนช่องรูป"
                        >
                          −
                        </button>
                        <button
                          type="button"
                          onClick={() => updateEntry(entry.id, { showImages: !isImagesVisible })}
                          className={`w-9 h-full flex items-center justify-center transition-colors border-r border-slate-600/80 no-min-h ${isImagesVisible ? "text-white bg-slate-700/60" : "text-slate-400 hover:text-white"
                            }`}
                          title="เปิด/ปิดส่วนรูปภาพประกอบ"
                        >
                          <ImageIcon className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => adjustEntrySlots(entry, 1)}
                          className="w-8 h-full flex items-center justify-center hover:bg-slate-700 text-slate-300 hover:text-white transition-colors text-sm font-medium no-min-h"
                          title="แสดงรูปภาพ / เพิ่มจำนวนช่องรูป"
                        >
                          +
                        </button>
                      </div>

                      {/* 3. Custom Dark Dropdown: Layout Selector */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenToolbarDropdown(openToolbarDropdown === "layout" ? null : "layout")
                          }
                          className="h-8 px-3 rounded-lg bg-[#262f3f] hover:bg-slate-700 text-white font-bold text-xs border border-slate-600/80 flex items-center justify-between gap-3 min-w-[148px] transition-colors no-min-h"
                        >
                          <span className="truncate">{getLayoutLabel(entry.layout)}</span>
                          <svg
                            className="w-3.5 h-3.5 text-slate-300 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openToolbarDropdown === "layout" && (
                          <div className="absolute left-0 top-full mt-1 w-48 max-h-80 overflow-y-auto bg-[#172133] border border-slate-600 shadow-2xl z-50 py-1 text-xs">
                            {LAYOUT_OPTIONS.map((grp) => (
                              <div key={grp.group}>
                                <div className="px-3 py-1.5 font-extrabold text-white bg-[#172133] select-none">
                                  {grp.group}
                                </div>
                                {grp.items.map((opt) => {
                                  const isOptSelected = entry.layout === opt.value;
                                  return (
                                    <button
                                      key={opt.value}
                                      type="button"
                                      onClick={() => {
                                        updateEntry(entry.id, {
                                          layout: opt.value,
                                          showImages: true,
                                        });
                                        setOpenToolbarDropdown(null);
                                      }}
                                      className={`w-full text-left pl-6 pr-3 py-1.5 font-bold transition-colors block no-min-h ${isOptSelected
                                        ? "bg-[#1967d2] text-white"
                                        : "text-slate-100 hover:bg-[#1967d2]/80 hover:text-white"
                                        }`}
                                    >
                                      {opt.label}
                                    </button>
                                  );
                                })}
                              </div>
                            ))}
                          </div>
                        )}
                      </div>

                      {/* 4. Custom Dark Dropdown: Fit Mode (แสดงเต็มรูป / ตัดตามสัดส่วน) */}
                      <div className="relative">
                        <button
                          type="button"
                          onClick={() =>
                            setOpenToolbarDropdown(openToolbarDropdown === "fit" ? null : "fit")
                          }
                          className="h-8 px-3 rounded-lg bg-[#262f3f] hover:bg-slate-700 text-white font-bold text-xs border border-slate-600/80 flex items-center justify-between gap-2.5 min-w-[116px] transition-colors no-min-h"
                        >
                          <span>{entry.fitMode === "contain" ? "แสดงเต็มรูป" : "ตัดตามสัดส่วน"}</span>
                          <svg
                            className="w-3.5 h-3.5 text-slate-300 shrink-0"
                            fill="none"
                            stroke="currentColor"
                            viewBox="0 0 24 24"
                          >
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2.5} d="M19 9l-7 7-7-7" />
                          </svg>
                        </button>

                        {openToolbarDropdown === "fit" && (
                          <div className="absolute left-0 top-full mt-1 w-32 bg-[#172133] border border-slate-600 shadow-2xl z-50 py-0.5 text-xs">
                            {[
                              { value: "contain", label: "แสดงเต็มรูป" },
                              { value: "cover", label: "ตัดตามสัดส่วน" },
                            ].map((m) => {
                              const isModeSelected = entry.fitMode === m.value;
                              return (
                                <button
                                  key={m.value}
                                  type="button"
                                  onClick={() => {
                                    updateEntry(entry.id, { fitMode: m.value as FitMode });
                                    setOpenToolbarDropdown(null);
                                  }}
                                  className={`w-full text-left px-3 py-1.5 font-bold transition-colors block no-min-h ${isModeSelected
                                    ? "bg-[#1967d2] text-white"
                                    : "text-slate-100 hover:bg-[#1967d2]/80 hover:text-white"
                                    }`}
                                >
                                  {m.label}
                                </button>
                              );
                            })}
                          </div>
                        )}
                      </div>

                      {/* 5. Up / Down / Trash Icons */}
                      <div className="flex items-center gap-1.5 pl-2 border-l border-slate-700">
                        <button
                          type="button"
                          onClick={() => moveEntry(entry.id, "up")}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors no-min-h"
                          title="เลื่อนขึ้น"
                        >
                          <ArrowUp className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => moveEntry(entry.id, "down")}
                          className="p-1.5 rounded-lg hover:bg-slate-700 text-slate-200 hover:text-white transition-colors no-min-h"
                          title="เลื่อนลง"
                        >
                          <ArrowDown className="w-4 h-4" />
                        </button>
                        <button
                          type="button"
                          onClick={() => deleteEntry(entry.id)}
                          className="p-1.5 rounded-lg hover:bg-red-600/80 text-slate-200 hover:text-white transition-colors no-min-h"
                          title="ลบหัวข้อนี้"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Category Header Pill INSIDE First Entry Box (Exact TCASFOLIO layout) */}
                  {idx === 0 && (
                    <div className="flex items-center justify-between gap-2 mb-3.5">
                      <div className="inline-flex items-center gap-2">
                        <span className="px-3.5 py-1.5 rounded-lg bg-[#13426b] text-white font-bold text-xs sm:text-sm shadow-2xs">
                          {badgeTitle}
                        </span>
                        <span className="w-5 h-5 rounded-full border border-[#13426b] text-[#13426b] flex items-center justify-center text-[11px] font-serif italic font-bold print:hidden">
                          i
                        </span>
                      </div>

                      <div className="flex items-center gap-1.5 print:hidden">
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            setIsImportModalOpen(true);
                            loadArtRoomRepository();
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 text-[11px] font-bold transition-colors no-min-h"
                        >
                          <FolderOpen className="w-3.5 h-3.5" />
                          <span>ดึงจากคลัง ART ROOM</span>
                        </button>
                        <button
                          type="button"
                          onClick={(ev) => {
                            ev.stopPropagation();
                            addEntry(catKey);
                          }}
                          className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white text-[11px] font-bold transition-colors no-min-h"
                        >
                          <Plus className="w-3.5 h-3.5" />
                          <span>เพิ่มหัวข้อ</span>
                        </button>
                      </div>
                    </div>
                  )}

                  {/* Entry Number & Title */}
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="w-6 h-6 rounded-full bg-[#f59e0b] text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0 shadow-2xs">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={entry.title}
                      onChange={(e) => updateEntry(entry.id, { title: e.target.value })}
                      placeholder="แตะเพื่อใส่หัวข้อ..."
                      className="w-full font-bold text-sm sm:text-base text-[#0f2942] placeholder:text-slate-400 placeholder:font-bold bg-transparent border-b border-transparent focus:border-teal-500 outline-none leading-snug"
                    />
                  </div>

                  {/* Metadata Badges Row: Level? (Red Dashed if empty), Cost? (Red Dashed if empty), Date, Organization */}
                  <div className="flex flex-wrap items-center gap-2 mb-2.5 text-xs">
                    {/* Level pill */}
                    <select
                      value={entry.level}
                      onChange={(e) => updateEntry(entry.id, { level: e.target.value })}
                      className={`px-3 py-0.5 rounded-full font-bold text-[11px] outline-none cursor-pointer appearance-none text-center transition-colors ${!entry.level
                        ? "border border-dashed border-red-500 text-red-600 bg-white print:hidden"
                        : "bg-slate-100 text-[#13426b] border border-slate-200"
                        }`}
                    >
                      <option value="">ระดับ?</option>
                      {(sysConfig.levelOptions?.length ? sysConfig.levelOptions : LEVEL_OPTIONS).map((lv) => (
                        <option key={lv} value={lv} className="text-slate-800">
                          {lv}
                        </option>
                      ))}
                    </select>

                    {/* Cost pill */}
                    <select
                      value={entry.costType}
                      onChange={(e) => updateEntry(entry.id, { costType: e.target.value })}
                      className={`px-3 py-0.5 rounded-full font-bold text-[11px] outline-none cursor-pointer appearance-none text-center transition-colors ${!entry.costType
                        ? "border border-dashed border-red-500 text-red-600 bg-white print:hidden"
                        : entry.costType === "ไม่มีค่าใช้จ่าย"
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200/80"
                          : "bg-amber-50 text-amber-800 border border-amber-200/80"
                        }`}
                    >
                      <option value="">ค่าใช้จ่าย?</option>
                      {(sysConfig.costOptions?.length ? sysConfig.costOptions : COST_OPTIONS).map((c) => (
                        <option key={c} value={c} className="text-slate-800">
                          {c}
                        </option>
                      ))}
                    </select>

                    {/* Date (Show input when filled or selected) */}
                    {(entry.dateStr || isSelected) && (
                      <div
                        className={`inline-flex items-center gap-1 text-[11.5px] text-slate-700 ${!entry.dateStr ? "print:hidden" : ""
                          }`}
                      >
                        <span className="font-bold text-[#0d9488]">วันที่:</span>
                        <input
                          type="text"
                          value={entry.dateStr}
                          onChange={(e) => updateEntry(entry.id, { dateStr: e.target.value })}
                          placeholder="ระบุวันที่..."
                          className="bg-transparent border-b border-transparent focus:border-teal-500 outline-none text-slate-700 w-32 sm:w-40"
                        />
                      </div>
                    )}

                    {/* Organization */}
                    {(entry.organization || isSelected) && (
                      <input
                        type="text"
                        value={entry.organization}
                        onChange={(e) => updateEntry(entry.id, { organization: e.target.value })}
                        placeholder="• หน่วยงานผู้จัด..."
                        className={`bg-transparent border-b border-transparent focus:border-teal-500 outline-none text-[11.5px] text-slate-500 flex-1 min-w-[150px] ${!entry.organization ? "print:hidden" : ""
                          }`}
                      />
                    )}
                  </div>

                  {/* Details & Description Area (Exact TCASFOLIO Teal Label + Placeholder) */}
                  <div className="space-y-1.5 text-xs sm:text-[13px] leading-relaxed">
                    {(entry.awardResult || (isSelected && catKey === "4.1" && entry.title)) && (
                      <div
                        className={`flex flex-wrap items-baseline gap-1.5 ${!entry.awardResult ? "print:hidden" : ""
                          }`}
                      >
                        <span className="font-bold text-[#0d9488] shrink-0">
                          {sysConfig.entryAwardResultLabel || "ผลรางวัล / อันดับ :"}
                        </span>
                        <input
                          type="text"
                          value={entry.awardResult}
                          onChange={(e) => updateEntry(entry.id, { awardResult: e.target.value })}
                          placeholder="แตะเพื่อพิมพ์ผลรางวัล / อันดับ..."
                          className="font-bold text-slate-800 placeholder:text-slate-400 placeholder:font-normal bg-transparent border-b border-transparent focus:border-teal-500 outline-none flex-1 min-w-[200px]"
                        />
                      </div>
                    )}

                    {/* รายละเอียด : */}
                    <div className="space-y-0.5">
                      <div className="font-bold text-[#0d9488] text-xs">
                        {sysConfig.entryDetailLabel || "รายละเอียด :"}
                      </div>
                      <textarea
                        rows={entry.description ? 3 : 1}
                        value={entry.description}
                        onChange={(e) => updateEntry(entry.id, { description: e.target.value })}
                        placeholder="แตะเพื่อพิมพ์รายละเอียด..."
                        className="w-full bg-transparent border-0 p-0 text-slate-700 placeholder:text-slate-400 outline-none resize-y leading-relaxed"
                      />
                    </div>

                    {/* โดยได้เรียนรู้ (optional or if filled) */}
                    {entry.learned && (
                      <div className="pt-0.5">
                        <textarea
                          rows={2}
                          value={entry.learned}
                          onChange={(e) => updateEntry(entry.id, { learned: e.target.value })}
                          placeholder="โดยได้เรียนรู้ : แตะเพื่อพิมพ์สิ่งที่ได้เรียนรู้..."
                          className="w-full bg-transparent border-0 p-0 text-slate-700 placeholder:text-slate-400 outline-none resize-y leading-relaxed"
                        />
                      </div>
                    )}

                    {/* Image Gallery Section (Toggled by - / Image / + buttons in toolbar) */}
                    {isImagesVisible && (
                      <div className="pt-2 space-y-1.5">
                        <div className="text-xs text-slate-500 print:hidden">
                          <strong className="text-[#0d9488]">
                            {sysConfig.entryGalleryLabel || "ภาพประกอบ : สูงสุดไม่เกิน 6 รูป"}
                          </strong>
                        </div>
                        <div>{renderEntryImageGrid(entry)}</div>
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="min-h-screen bg-[#4b4f56] flex flex-col font-sans print:bg-white">
      {/* Hidden File Input for Image Uploads */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        onChange={handleFileChange}
        className="hidden"
      />

      {/* ================================================================= */}
      {/* TOP BAR (TCASFOLIO HEADER STYLE) - HIDDEN ON PRINT */}
      {/* ================================================================= */}
      <header className="h-14 bg-white border-b border-slate-200 px-3 sm:px-6 flex items-center justify-between sticky top-0 z-40 shadow-xs print:hidden">
        <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
          <Link
            href="/"
            className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 flex items-center justify-center transition-colors shrink-0"
            title="กลับหน้าแรก ART ROOM"
          >
            <ArrowLeft className="w-4 h-4" />
          </Link>

          {/* Major Info in Top Bar */}
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-xs sm:text-sm text-slate-700 font-bold truncate">
              {state.university} - {state.faculty} ({state.major})
            </span>
          </div>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            type="button"
            onClick={() => {
              setIsImportModalOpen(true);
              loadArtRoomRepository();
            }}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-orange-50 hover:bg-orange-100 text-orange-700 border border-orange-200 font-bold text-xs transition-all cursor-pointer no-min-h"
          >
            <Palette className="w-3.5 h-3.5" />
            <span className="hidden md:inline">ดึงผลงานจาก ART ROOM</span>
            <span className="md:hidden">ดึงผลงาน</span>
          </button>

          <button
            type="button"
            onClick={handlePrintPdf}
            className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-white hover:bg-slate-50 text-slate-800 border border-slate-300 font-bold text-xs shadow-2xs transition-all cursor-pointer no-min-h"
          >
            <Printer className="w-3.5 h-3.5 text-[#0d9488]" />
            <span>สร้างไฟล์ PDF</span>
          </button>

          {!isAdminViewing && (
            <button
              type="button"
              onClick={handleSubmitForTeacherReview}
              disabled={isSavingServer}
              className="inline-flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 no-min-h"
              title="ส่งแฟ้มสะสมผลงานให้คุณครูตรวจในระบบหลังบ้าน"
            >
              <CheckCircle2 className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">ส่งให้ครูตรวจ</span>
            </button>
          )}

          <button
            type="button"
            onClick={handleSaveManual}
            disabled={isSavingServer}
            className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shadow-xs transition-all cursor-pointer disabled:opacity-50 no-min-h"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{isSavingServer ? "กำลังบันทึก..." : "บันทึกแฟ้ม"}</span>
          </button>
        </div>
      </header>

      {/* ================================================================= */}
      {/* MAIN WORKSPACE: LEFT SIDEBAR + CENTER A4 PREVIEW */}
      {/* ================================================================= */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden print:block">
        {/* LEFT SIDEBAR: SECTION CHECKBOXES & SETTINGS (Hidden on Print) */}
        <aside className="w-full lg:w-72 xl:w-80 bg-white border-b lg:border-b-0 lg:border-r border-slate-200 overflow-y-auto p-4 space-y-5 shrink-0 max-h-[38vh] lg:max-h-[calc(100vh-3.5rem)] print:hidden">
          {/* Target University & Major Box */}
          <div className="space-y-2 pb-4 border-b border-slate-100">
            <div className="flex items-center justify-between">
              <label className="text-xs font-extrabold text-slate-800">
                สาขาวิชาที่ใช้สมัคร
              </label>
              <button
                type="button"
                onClick={handleResetDefault}
                className="text-[11px] text-slate-400 hover:text-red-600 flex items-center gap-1 no-min-h"
                title="รีเซ็ตข้อมูลเริ่มต้น"
              >
                <RotateCcw className="w-3 h-3" />
                <span>รีเซ็ต</span>
              </button>
            </div>
            <div className="p-2.5 rounded-xl bg-slate-50 border border-slate-200 space-y-2 text-xs">
              <div>
                <div className="flex items-center justify-between mb-1">
                  <span className="text-[10px] text-slate-400">มหาวิทยาลัย / สถาบัน</span>
                  <button
                    type="button"
                    onClick={() => setIsUnivLogoPickerOpen(true)}
                    className="text-[10px] font-bold text-[#0d9488] hover:underline flex items-center gap-1 cursor-pointer no-min-h"
                  >
                    <Building2 className="w-3 h-3" />
                    <span>เลือกตรามหาวิทยาลัย</span>
                  </button>
                </div>
                <input
                  type="text"
                  value={state.university}
                  onChange={(e) => {
                    const nextUniv = e.target.value;
                    const canAutoSwitch =
                      !state.universityLogo ||
                      state.universityLogo === "/artroom-logo.png" ||
                      state.universityLogo.startsWith("/universities/");
                    const autoLogo = canAutoSwitch ? matchUniversityLogoByName(nextUniv) : null;
                    setState({
                      ...state,
                      university: nextUniv,
                      universityLogo: autoLogo || state.universityLogo,
                    });
                  }}
                  className="w-full font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">คณะ / สาขาวิชา</span>
                <input
                  type="text"
                  value={state.faculty}
                  onChange={(e) => setState({ ...state, faculty: e.target.value })}
                  className="w-full font-semibold text-slate-700 bg-white px-2 py-1 rounded border border-slate-200 outline-none focus:border-teal-500 mb-1"
                />
                <input
                  type="text"
                  value={state.major}
                  onChange={(e) => setState({ ...state, major: e.target.value })}
                  className="w-full text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
              <div>
                <span className="text-[10px] text-slate-400 block">โครงการ / รอบที่สมัคร</span>
                <input
                  type="text"
                  value={state.projectRound}
                  onChange={(e) => setState({ ...state, projectRound: e.target.value })}
                  className="w-full text-slate-600 bg-white px-2 py-1 rounded border border-slate-200 outline-none focus:border-teal-500"
                />
              </div>
            </div>
          </div>

          {/* Page Counter */}
          <div className="flex items-center justify-between py-2 px-3 rounded-xl bg-teal-50/60 border border-teal-200/70">
            <div>
              <span className="text-xs font-bold text-slate-700 block">หน้าที่ใช้</span>
              <span className="text-[11px] font-semibold text-[#0d9488]">
                {sysConfig.pageLimitNoticeText || "หลักสูตรนี้ไม่จำกัดจำนวนหน้า"}
              </span>
            </div>
            <span className="text-base font-black text-[#13426b]">
              {Math.max(1, estimatedPages)} หน้า
            </span>
          </div>

          {/* Portfolio Content Sections Checklist */}
          <div className="space-y-4 text-xs">
            <div className="font-extrabold text-slate-800 text-xs">เนื้อหาในแฟ้ม</div>

            {/* หมวด 1 */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 font-bold text-[#13426b]">
                <span className="w-5 h-5 rounded-full bg-[#13426b] text-white text-[11px] flex items-center justify-center">
                  1
                </span>
                <span>หมวด 1 • ข้อมูลผู้สมัคร</span>
              </div>

              <div className="pl-2 space-y-1.5">
                {[
                  { key: "sec1_cover", label: "หน้าปก / ข้อมูลผู้สมัคร" },
                  { key: "sec1_personal", label: "ข้อมูลส่วนตัว" },
                  { key: "sec1_parent", label: "ข้อมูลผู้ปกครอง" },
                  { key: "sec1_address", label: "ที่อยู่" },
                  { key: "sec1_education", label: "ข้อมูลการศึกษา" },
                ].map((item) => (
                  <label
                    key={item.key}
                    className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      checked={state.sections[item.key as keyof PortfolioState["sections"]]}
                      onChange={() => toggleSection(item.key as keyof PortfolioState["sections"])}
                      className="w-4 h-4 rounded text-[#13426b] focus:ring-teal-500"
                    />
                    <span className="text-slate-700 font-medium">{item.label}</span>
                  </label>
                ))}

                {/* Nested GPAX checkboxes */}
                <div className="pl-5 space-y-1">
                  <label className="flex items-center gap-2 py-0.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.sections.sec1_gpax4}
                      onChange={() => toggleSection("sec1_gpax4")}
                      className="w-3.5 h-3.5 rounded text-[#13426b]"
                    />
                    <span className="text-slate-600">GPAX 4 ภาคเรียน</span>
                  </label>
                  <label className="flex items-center gap-2 py-0.5 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={state.sections.sec1_gpax5}
                      onChange={() => toggleSection("sec1_gpax5")}
                      className="w-3.5 h-3.5 rounded text-[#13426b]"
                    />
                    <span className="text-slate-600">GPAX 5 ภาคเรียน</span>
                  </label>
                </div>

                <label className="flex items-center gap-2 py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.sections.sec1_subjectGrades}
                    onChange={() => toggleSection("sec1_subjectGrades")}
                    className="w-4 h-4 rounded text-[#13426b]"
                  />
                  <span className="text-slate-700 font-medium">ผลการเรียน (กลุ่มสาระ)</span>
                </label>

                <div className="pt-1">
                  <span className="text-[11px] font-bold text-slate-500 block mb-1 px-2">
                    เอกสารหลักฐานการศึกษา
                  </span>
                  <div className="space-y-1">
                    <label className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={state.sections.sec1_transcriptFront}
                          onChange={() => toggleSection("sec1_transcriptFront")}
                          className="w-4 h-4 rounded text-[#13426b]"
                        />
                        <span className="text-slate-700 font-medium">
                          ใบปพ.1 ด้านหน้า {state.profile.transcriptFrontUrl ? "✓" : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerImageUpload((url) => {
                            updateProfile("transcriptFrontUrl", url);
                            if (!state.sections.sec1_transcriptFront) toggleSection("sec1_transcriptFront");
                          })
                        }
                        className="text-[10px] text-teal-600 font-bold hover:underline no-min-h"
                      >
                        อัปโหลด
                      </button>
                    </label>
                    <label className="flex items-center justify-between py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                      <div className="flex items-center gap-2">
                        <input
                          type="checkbox"
                          checked={state.sections.sec1_transcriptBack}
                          onChange={() => toggleSection("sec1_transcriptBack")}
                          className="w-4 h-4 rounded text-[#13426b]"
                        />
                        <span className="text-slate-700 font-medium">
                          ใบปพ.1 ด้านหลัง {state.profile.transcriptBackUrl ? "✓" : ""}
                        </span>
                      </div>
                      <button
                        type="button"
                        onClick={() =>
                          triggerImageUpload((url) => {
                            updateProfile("transcriptBackUrl", url);
                            if (!state.sections.sec1_transcriptBack) toggleSection("sec1_transcriptBack");
                          })
                        }
                        className="text-[10px] text-teal-600 font-bold hover:underline no-min-h"
                      >
                        อัปโหลด
                      </button>
                    </label>
                  </div>
                </div>
              </div>
            </div>

            {/* หมวด 2 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-[#13426b]">
                <span className="w-5 h-5 rounded-full bg-[#13426b] text-white text-[11px] flex items-center justify-center">
                  2
                </span>
                <span>หมวด 2 • เรียงความ / เหตุผลในการสมัคร</span>
              </div>
              <div className="pl-2">
                <label className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.sections.sec2_essay}
                    onChange={() => toggleSection("sec2_essay")}
                    className="w-4 h-4 rounded text-[#13426b]"
                  />
                  <span className="text-slate-700 font-medium">แสดงเรียงความ / เหตุผลในการสมัคร</span>
                </label>
              </div>
            </div>

            {/* หมวด 3 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-[#13426b]">
                <span className="w-5 h-5 rounded-full bg-[#13426b] text-white text-[11px] flex items-center justify-center">
                  3
                </span>
                <span>หมวด 3 • หนังสือรับรอง / เอกสารแนบ</span>
              </div>
              <div className="pl-2">
                <label className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.sections.sec3_attachments}
                    onChange={() => toggleSection("sec3_attachments")}
                    className="w-4 h-4 rounded text-[#13426b]"
                  />
                  <span className="text-slate-700 font-medium">แสดงหนังสือรับรอง / เอกสารแนบ</span>
                </label>
              </div>
            </div>

            {/* หมวด 4 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-[#13426b]">
                <span className="w-5 h-5 rounded-full bg-[#13426b] text-white text-[11px] flex items-center justify-center">
                  4
                </span>
                <span>หมวด 4 • รางวัล ผลงาน และกิจกรรม</span>
              </div>
              <div className="pl-2 space-y-1">
                <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.sections.sec4_1_awards}
                      onChange={() => toggleSection("sec4_1_awards")}
                      className="w-4 h-4 rounded text-[#13426b]"
                    />
                    <span className="text-slate-700 font-medium">4.1 รางวัล / เกียรติบัตร</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addEntry("4.1")}
                    className="text-[11px] text-[#0d9488] font-bold hover:underline no-min-h"
                  >
                    + เพิ่ม
                  </button>
                </label>

                <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.sections.sec4_2_works}
                      onChange={() => toggleSection("sec4_2_works")}
                      className="w-4 h-4 rounded text-[#13426b]"
                    />
                    <span className="text-slate-700 font-medium">4.2 ผลงานศิลปะ / โครงงาน</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addEntry("4.2")}
                    className="text-[11px] text-[#0d9488] font-bold hover:underline no-min-h"
                  >
                    + เพิ่ม
                  </button>
                </label>

                <label className="flex items-center justify-between py-1 px-2 rounded-lg hover:bg-slate-50 cursor-pointer">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={state.sections.sec4_3_activities}
                      onChange={() => toggleSection("sec4_3_activities")}
                      className="w-4 h-4 rounded text-[#13426b]"
                    />
                    <span className="text-slate-700 font-medium">4.3 กิจกรรม</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => addEntry("4.3")}
                    className="text-[11px] text-[#0d9488] font-bold hover:underline no-min-h"
                  >
                    + เพิ่ม
                  </button>
                </label>
              </div>
            </div>

            {/* หมวด 5 */}
            <div className="space-y-1.5 pt-2 border-t border-slate-100">
              <div className="flex items-center gap-2 font-bold text-[#13426b]">
                <span className="w-5 h-5 rounded-full bg-[#13426b] text-white text-[11px] flex items-center justify-center">
                  5
                </span>
                <span>หมวด 5 • คำถามเพิ่มเติมของหลักสูตร</span>
              </div>
              <div className="pl-2">
                <label className="flex items-center gap-2 py-1.5 px-2.5 rounded-lg border border-slate-200 hover:bg-slate-50 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={state.sections.sec5_questions}
                    onChange={() => toggleSection("sec5_questions")}
                    className="w-4 h-4 rounded text-[#13426b]"
                  />
                  <span className="text-slate-700 font-medium">แสดงคำถามเพิ่มเติมของหลักสูตร</span>
                </label>
              </div>
            </div>
          </div>
        </aside>

        {/* ================================================================= */}
        {/* CENTER WORKSPACE: WARNING BANNERS & A4 PORTFOLIO PAGES */}
        {/* ================================================================= */}
        <main
          onClick={() => setActiveEntryId(null)}
          className="flex-1 overflow-y-auto p-3 sm:p-6 lg:p-8 space-y-5 print:p-0 print:overflow-visible print:space-y-0"
        >
          {/* Warning & Teacher Feedback Banners (Hidden on Print) */}
          <div className="max-w-[820px] mx-auto space-y-2.5 print:hidden">
            {isAdminViewing && (
              <div className="p-3.5 rounded-xl bg-indigo-50 border border-indigo-200 text-indigo-900 text-xs flex items-center justify-between gap-2.5 shadow-xs">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-indigo-600 shrink-0" />
                  <span>
                    <strong>โหมดครูผู้สอน / แอดมิน:</strong> กำลังเปิดดูและแก้ไขแฟ้มสะสมผลงานของรหัสนักเรียน{" "}
                    <strong>{currentStudentId}</strong> ({state.profile.fullNameTh})
                  </span>
                </div>
                <Link
                  href="/admin?tab=portfolios"
                  className="px-3 py-1 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-[11px] shrink-0"
                >
                  กลับหน้าแอดมิน
                </Link>
              </div>
            )}

            {(teacherFeedback || portfolioStatus === "approved" || portfolioStatus === "revision") && (
              <div
                className={`p-3.5 rounded-xl border text-xs flex items-start gap-2.5 shadow-xs ${portfolioStatus === "approved"
                  ? "bg-emerald-50 border-emerald-200 text-emerald-900"
                  : portfolioStatus === "revision"
                    ? "bg-rose-50 border-rose-200 text-rose-900"
                    : "bg-blue-50 border-blue-200 text-blue-900"
                  }`}
              >
                <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
                <div className="space-y-0.5">
                  <div className="font-bold">
                    สถานะการตรวจจากครูผู้สอน:{" "}
                    {portfolioStatus === "approved"
                      ? "✅ ตรวจผ่านแล้ว"
                      : portfolioStatus === "revision"
                        ? "⚠️ ให้แก้ไขเพิ่มเติม"
                        : "⏳ ส่งให้ครูตรวจแล้ว"}
                  </div>
                  {teacherFeedback && (
                    <div>
                      <strong>ข้อเสนอแนะจากครู:</strong> &quot;{teacherFeedback}&quot;
                    </div>
                  )}
                </div>
              </div>
            )}

            {missingTitleWarnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 text-red-700 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">(สร้าง PDF ไม่ได้)</span>{" "}
                  <span className="underline">{missingTitleWarnings[0]}</span>
                </div>
              </div>
            )}

            {emptyImageSlotsWarnings.length > 0 && (
              <div className="p-3.5 rounded-xl bg-amber-50 border border-amber-200 text-amber-800 text-xs flex items-start gap-2.5 shadow-xs">
                <AlertTriangle className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold">(คำเตือน)</span>{" "}
                  <span className="underline">{emptyImageSlotsWarnings[0]}</span>
                </div>
              </div>
            )}
          </div>

          {/* =============================================================== */}
          {/* A4 DOCUMENT SHEET */}
          {/* =============================================================== */}
          <div
            id="tcasfolio-printable-area"
            className="max-w-[820px] mx-auto bg-white rounded-sm shadow-2xl p-5 sm:p-10 space-y-6 text-slate-900 print:shadow-none print:max-w-none print:p-4 print:rounded-none overflow-hidden"
          >
            {/* Top Running Header (shown only when Cover Banner is hidden) */}
            {!state.sections.sec1_cover && (
              <div className="flex items-center justify-end pb-2 border-b border-slate-200 text-[11px] text-slate-500">
                <div className="flex items-center gap-1">
                  <span>{sysConfig.topRightHeaderLabel || "แฟ้มสะสมผลงาน ประจำปี"}</span>
                  <input
                    type="text"
                    value={state.academicYear}
                    onChange={(e) => setState({ ...state, academicYear: e.target.value })}
                    className="w-10 font-bold text-slate-700 bg-transparent border-b border-transparent focus:border-teal-500 outline-none text-center"
                  />
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* หมวด 1: ข้อมูลผู้สมัคร (Cover & Applicant Profile Table) */}
            {/* ============================================================= */}
            {state.sections.sec1_cover && (
              <div className="space-y-5">
                {/* Full-Bleed Orange/Warm Hero Banner Header (Matching Reference Image 1) */}
                <div className="relative -mx-5 -mt-5 sm:-mx-10 sm:-mt-10 print:-mx-4 print:-mt-4 px-5 sm:px-10 pt-7 sm:pt-9 pb-7 bg-gradient-to-br from-[#fffdfb] via-[#fff5ee] to-[#ffe6d4]/75 overflow-hidden">
                  {/* Soft Curved Background Arch (Top-Right Sweep) */}
                  <div className="absolute -top-12 right-0 w-[62%] h-[115%] rounded-bl-[260px] bg-gradient-to-bl from-[#fed7aa]/55 via-[#ffedd5]/45 to-transparent pointer-events-none" />
                  {/* Thin Decorative Orange Ellipse Ring (Bottom-Right) */}
                  <div className="hidden sm:block absolute -bottom-16 right-4 w-56 h-36 rounded-full border border-[#f26532]/55 pointer-events-none" />

                  {/* Right Vertical Orange Ribbon Tab ("PORTFOLIO") flush to top-right corner */}
                  <div className="absolute top-0 right-0 h-40 sm:h-44 w-10 sm:w-11 bg-gradient-to-b from-[#ea580c] to-[#c2410c] rounded-bl-2xl shadow-md flex items-center justify-center select-none pointer-events-none z-20">
                    <span className="-rotate-90 text-white font-extrabold tracking-[0.2em] text-xs sm:text-sm whitespace-nowrap">
                      PORTFOLIO
                    </span>
                  </div>

                  {/* Main Flex Row: Left Portrait Photo + Right Title & Personal Info Card */}
                  <div className="relative z-10 flex flex-col sm:flex-row items-center sm:items-stretch gap-5 sm:gap-7 pr-0 sm:pr-10">
                    {/* Left: Student Portrait Photo */}
                    <div
                      onClick={() => triggerImageUpload((url) => updateProfile("photoUrl", url))}
                      className="w-36 h-40 sm:w-44 sm:h-48 rounded-2xl bg-[#e5e7eb] border-2 border-white shadow-md overflow-hidden flex flex-col items-center justify-center shrink-0 cursor-pointer group relative"
                      title="คลิกเพื่ออัปโหลดรูปถ่ายผู้สมัคร"
                    >
                      {state.profile.photoUrl ? (
                        <>
                          {/* eslint-disable-next-line @next/next/no-img-element */}
                          <img
                            src={state.profile.photoUrl}
                            alt={state.profile.fullNameTh}
                            className="w-full h-full object-cover"
                          />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-xs font-bold print:hidden">
                            เปลี่ยนรูปถ่าย
                          </div>
                        </>
                      ) : (
                        <div className="text-center p-4 text-slate-500">
                          <User className="w-12 h-12 mx-auto mb-1.5 stroke-[1.5]" />
                          <span className="text-[11px] font-bold block">คลิกใส่รูปถ่ายผู้สมัคร</span>
                        </div>
                      )}
                    </div>

                    {/* Right: PORTFOLIO Heading + แฟ้มสะสมผลงาน + Personal Info Card */}
                    <div className="flex-1 flex flex-col justify-between w-full text-center sm:text-left space-y-3">
                      <div>
                        <div className="text-4xl sm:text-[42px] font-black tracking-wide text-[#f26532] leading-none">
                          PORTFOLIO
                        </div>
                        <div className="text-base sm:text-lg font-bold text-[#1e293b] mt-1.5 flex items-center justify-center sm:justify-start gap-1.5">
                          <span>{sysConfig.coverMainTitle || "แฟ้มสะสมผลงาน"}</span>
                          <input
                            type="text"
                            value={state.academicYear}
                            onChange={(e) => setState({ ...state, academicYear: e.target.value })}
                            className="w-14 font-bold text-[#1e293b] bg-transparent border-b border-transparent focus:border-[#f26532] outline-none"
                          />
                        </div>
                      </div>

                      {/* Orange Folder-Tab Personal Summary Box + 4-Point Star Accent */}
                      <div className="relative text-left">
                        <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-t-xl bg-gradient-to-r from-[#d9381e] to-[#f26532] text-white font-bold text-xs shadow-2xs">
                          <User className="w-3.5 h-3.5" />
                          <span>{sysConfig.sec1PersonalTitle || "ข้อมูลส่วนตัว"}</span>
                        </div>
                        <div className="relative bg-white/95 backdrop-blur-xs rounded-b-2xl rounded-tr-2xl border border-[#f26532]/85 p-3.5 sm:p-4 shadow-sm grid grid-cols-1 sm:grid-cols-2 gap-x-5 gap-y-2.5 text-xs sm:text-[13px]">
                          {/* Decorative 4-Point Orange Star on top-right corner of card */}
                          <svg
                            className="absolute -top-3.5 right-3 w-7 h-7 text-[#f26532] pointer-events-none hidden sm:block drop-shadow-2xs"
                            viewBox="0 0 24 24"
                            fill="currentColor"
                          >
                            <path d="M12 0C12.8 7.5 16.5 11.2 24 12C16.5 12.8 12.8 16.5 12 24C11.2 16.5 7.5 12.8 0 12C7.5 11.2 11.2 7.5 12 0Z" />
                          </svg>

                          <div className="flex items-baseline gap-2">
                            <span className="text-[#f26532] font-bold shrink-0">ชื่อ-นามสกุล</span>
                            <input
                              type="text"
                              value={state.profile.fullNameTh}
                              onChange={(e) => updateProfile("fullNameTh", e.target.value)}
                              placeholder="กรอกชื่อ-นามสกุล..."
                              className="font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-[#f26532] print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-full"
                            />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[#f26532] font-bold shrink-0">เลขประจำตัว</span>
                            <input
                              type="text"
                              value={state.profile.citizenId}
                              onChange={(e) => updateProfile("citizenId", e.target.value)}
                              placeholder="กรอกเลขบัตรประชาชน..."
                              className="font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-[#f26532] print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-full"
                            />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[#f26532] font-bold shrink-0">สถานศึกษา</span>
                            <input
                              type="text"
                              value={state.profile.schoolName}
                              onChange={(e) => updateProfile("schoolName", e.target.value)}
                              placeholder="กรอกชื่อโรงเรียน..."
                              className="font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-[#f26532] print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-full"
                            />
                          </div>
                          <div className="flex items-baseline gap-2">
                            <span className="text-[#f26532] font-bold shrink-0">จังหวัด</span>
                            <input
                              type="text"
                              value={state.profile.schoolProvince}
                              onChange={(e) => updateProfile("schoolProvince", e.target.value)}
                              placeholder="กรอกจังหวัด..."
                              className="font-semibold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-[#f26532] print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-full"
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Applied Major Box (สาขาวิชาที่สมัคร) */}
                <div className="space-y-1.5">
                  <div className="text-xs font-extrabold text-slate-800">
                    {sysConfig.appliedMajorLabel || "สาขาวิชาที่สมัคร"}
                  </div>
                  <div className="flex items-start gap-3 p-3 rounded-xl bg-[#fffaf7] border border-[#f26532]/25">
                    <div
                      onClick={() => setIsUnivLogoPickerOpen(true)}
                      className="w-13 h-13 rounded-xl bg-white border border-[#f26532]/25 flex items-center justify-center overflow-hidden shrink-0 cursor-pointer group relative p-1 shadow-2xs"
                      title="คลิกเพื่อเลือกตรามหาวิทยาลัย หรืออัปโหลดรูปตราเอง"
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={resolveUniversityLogo(state.university, state.universityLogo)}
                        alt={state.university || "University Emblem"}
                        className="w-full h-full object-contain"
                      />
                      <div className="absolute inset-0 bg-black/45 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[9px] font-bold text-center leading-tight p-0.5 print:hidden">
                        เปลี่ยนตรา
                      </div>
                    </div>
                    <div className="space-y-0.5 text-xs flex-1">
                      <div className="font-extrabold text-[#c2410c] text-sm">{state.university}</div>
                      <div className="font-semibold text-slate-700">{state.faculty} • {state.major}</div>
                      <div className="text-slate-500 text-[11px]">{state.projectRound}</div>
                    </div>
                  </div>
                </div>

                {/* Section 1 Pill */}
                <div>
                  <span className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-xl bg-gradient-to-r from-[#d9381e] to-[#f26532] text-white font-bold text-xs shadow-2xs">
                    {sysConfig.sec1Title || "หมวด 1 • ข้อมูลผู้สมัคร"}
                  </span>
                </div>

                {/* Structured Applicant Data Table matching TCASFOLIO */}
                <div className="rounded-xl border border-slate-300 overflow-hidden text-xs">
                  {/* 1.1 ข้อมูลส่วนตัว */}
                  {state.sections.sec1_personal && (
                    <div>
                      <div className="bg-slate-100/90 px-3 py-1.5 font-extrabold text-[#13426b] border-b border-slate-300 flex items-center justify-between">
                        <span>{sysConfig.sec1PersonalTitle || "ข้อมูลส่วนตัว"}</span>
                        <span className="text-[10px] font-normal text-slate-500 print:hidden">
                          * แตะที่ช่องว่างเพื่อกรอกข้อมูลจริงของนักเรียน
                        </span>
                      </div>
                      <div className="p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-500">ชื่อ : </span>
                          <input
                            type="text"
                            value={state.profile.fullNameTh}
                            onChange={(e) => updateProfile("fullNameTh", e.target.value)}
                            placeholder="กรอกชื่อ-นามสกุล..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-36 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">ชื่อภาษาอังกฤษ : </span>
                          <input
                            type="text"
                            value={state.profile.fullNameEn}
                            onChange={(e) => updateProfile("fullNameEn", e.target.value)}
                            placeholder="กรอกชื่ออังกฤษ..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-32 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">เลขประจำตัว : </span>
                          <input
                            type="text"
                            value={state.profile.citizenId}
                            onChange={(e) => updateProfile("citizenId", e.target.value)}
                            placeholder="เลขบัตร 13 หลัก..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-32 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">วันเดือนปีเกิด : </span>
                          <input
                            type="text"
                            value={state.profile.birthDate}
                            onChange={(e) => updateProfile("birthDate", e.target.value)}
                            placeholder="เช่น 12/05/2551"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                      </div>
                      <div className="p-2.5 grid grid-cols-2 sm:grid-cols-6 gap-2.5 border-b border-slate-300">
                        <div>
                          <span className="text-slate-500">อายุ : </span>
                          <input
                            type="text"
                            value={state.profile.age}
                            onChange={(e) => updateProfile("age", e.target.value)}
                            placeholder="เช่น 17 ปี"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-20 max-w-full"
                          />
                        </div>
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">อีเมล : </span>
                          <input
                            type="text"
                            value={state.profile.email}
                            onChange={(e) => updateProfile("email", e.target.value)}
                            placeholder="กรอกอีเมลที่ติดต่อได้..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-44 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">เบอร์มือถือ : </span>
                          <input
                            type="text"
                            value={state.profile.phone}
                            onChange={(e) => updateProfile("phone", e.target.value)}
                            placeholder="0xx-xxx-xxxx"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">น้ำหนัก/ส่วนสูง : </span>
                          <span className="inline-flex items-baseline gap-1">
                            <input
                              type="text"
                              value={state.profile.weight}
                              onChange={(e) => updateProfile("weight", e.target.value)}
                              placeholder="กก."
                              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-11 text-center"
                            />
                            <span className={`text-slate-400 ${!state.profile.weight && !state.profile.height ? "print:hidden" : ""}`}>/</span>
                            <input
                              type="text"
                              value={state.profile.height}
                              onChange={(e) => updateProfile("height", e.target.value)}
                              placeholder="ซม."
                              className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-12 text-center"
                            />
                          </span>
                        </div>
                        <div>
                          <span className="text-slate-500">เพศ : </span>
                          <input
                            type="text"
                            value={state.profile.gender}
                            onChange={(e) => updateProfile("gender", e.target.value)}
                            placeholder="ชาย/หญิง"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-14 max-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.2 ข้อมูลผู้ปกครอง */}
                  {state.sections.sec1_parent && (
                    <div>
                      <div className="bg-slate-100/90 px-3 py-1.5 font-extrabold text-[#13426b] border-b border-slate-300">
                        {sysConfig.sec1ParentTitle || "ข้อมูลผู้ปกครอง"}
                      </div>
                      <div className="p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5 border-b border-slate-300">
                        <div>
                          <span className="text-slate-500">สถานะผู้ปกครอง : </span>
                          <input
                            type="text"
                            value={state.profile.parentRelation}
                            onChange={(e) => updateProfile("parentRelation", e.target.value)}
                            placeholder="บิดา/มารดา..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-20 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">ชื่อ : </span>
                          <input
                            type="text"
                            value={state.profile.parentName}
                            onChange={(e) => updateProfile("parentName", e.target.value)}
                            placeholder="ชื่อ-นามสกุลผู้ปกครอง..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-36 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">เบอร์มือถือ : </span>
                          <input
                            type="text"
                            value={state.profile.parentPhone}
                            onChange={(e) => updateProfile("parentPhone", e.target.value)}
                            placeholder="0xx-xxx-xxxx"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">อีเมล : </span>
                          <input
                            type="text"
                            value={state.profile.parentEmail}
                            onChange={(e) => updateProfile("parentEmail", e.target.value)}
                            placeholder="อีเมลผู้ปกครอง (ถ้ามี)"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-36 max-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.3 ที่อยู่ติดต่อได้ */}
                  {state.sections.sec1_address && (
                    <div>
                      <div className="bg-slate-100/90 px-3 py-1.5 font-extrabold text-[#13426b] border-b border-slate-300">
                        {sysConfig.sec1AddressTitle || "ที่อยู่ติดต่อได้"}
                      </div>
                      <div className="p-2.5 grid grid-cols-2 sm:grid-cols-5 gap-2.5 border-b border-slate-300">
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">ที่อยู่ : </span>
                          <input
                            type="text"
                            value={state.profile.addressNo}
                            onChange={(e) => updateProfile("addressNo", e.target.value)}
                            placeholder="บ้านเลขที่ หมู่ ซอย ถนน..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-48 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">ตำบล/แขวง : </span>
                          <input
                            type="text"
                            value={state.profile.subDistrict}
                            onChange={(e) => updateProfile("subDistrict", e.target.value)}
                            placeholder="ระบุแขวง/ตำบล"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">อำเภอ/เขต : </span>
                          <input
                            type="text"
                            value={state.profile.district}
                            onChange={(e) => updateProfile("district", e.target.value)}
                            placeholder="ระบุเขต/อำเภอ"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">จังหวัด : </span>
                          <input
                            type="text"
                            value={state.profile.province}
                            onChange={(e) => updateProfile("province", e.target.value)}
                            placeholder="ระบุจังหวัด"
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-24 max-w-full"
                          />
                        </div>
                      </div>
                    </div>
                  )}

                  {/* 1.4 ข้อมูลการศึกษา */}
                  {state.sections.sec1_education && (
                    <div>
                      <div className="bg-slate-100/90 px-3 py-1.5 font-extrabold text-[#13426b] border-b border-slate-300">
                        {sysConfig.sec1EducationTitle || "ข้อมูลการศึกษา"}
                      </div>
                      <div className="p-2.5 grid grid-cols-2 gap-2.5 border-b border-slate-200">
                        <div>
                          <span className="text-slate-500">ชื่อโรงเรียน : </span>
                          <input
                            type="text"
                            value={state.profile.schoolName}
                            onChange={(e) => updateProfile("schoolName", e.target.value)}
                            placeholder="กรอกชื่อโรงเรียน..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-40 max-w-full"
                          />
                        </div>
                        <div>
                          <span className="text-slate-500">จังหวัด : </span>
                          <input
                            type="text"
                            value={state.profile.schoolProvince}
                            onChange={(e) => updateProfile("schoolProvince", e.target.value)}
                            placeholder="กรอกจังหวัด..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-32 max-w-full"
                          />
                        </div>
                      </div>
                      <div className="p-2.5 grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                        <div className="sm:col-span-2">
                          <span className="text-slate-500">หลักสูตร : </span>
                          <input
                            type="text"
                            value={state.profile.studyPlan}
                            onChange={(e) => updateProfile("studyPlan", e.target.value)}
                            placeholder="ระบุแผนการเรียน..."
                            className="font-bold text-slate-900 bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-48 max-w-full"
                          />
                        </div>
                        {state.sections.sec1_gpax4 && (
                          <div>
                            <span className="text-slate-500">GPAX4 : </span>
                            <input
                              type="text"
                              value={state.profile.gpax4}
                              onChange={(e) => updateProfile("gpax4", e.target.value)}
                              placeholder="0.00"
                              className="font-extrabold text-[#0d9488] bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-14"
                            />
                            {state.profile.gpax4.trim() && (
                              <span className="inline-block ml-1 px-1 rounded bg-emerald-500 text-white text-[9px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        )}
                        {state.sections.sec1_gpax5 && (
                          <div>
                            <span className="text-slate-500">GPAX5 : </span>
                            <input
                              type="text"
                              value={state.profile.gpax5}
                              onChange={(e) => updateProfile("gpax5", e.target.value)}
                              placeholder="0.00"
                              className="font-extrabold text-[#0d9488] bg-transparent border-b border-dashed border-slate-300 focus:border-solid focus:border-teal-500 print:border-none placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent outline-none w-14"
                            />
                            {state.profile.gpax5.trim() && (
                              <span className="inline-block ml-1 px-1 rounded bg-emerald-500 text-white text-[9px] font-bold">
                                ✓
                              </span>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}
                </div>

                {/* ผลการเรียน 8 กลุ่มสาระ */}
                {state.sections.sec1_subjectGrades && (
                  <div className="rounded-xl border border-slate-300 overflow-hidden text-xs">
                    <div className="bg-slate-100/90 px-3 py-1.5 font-extrabold text-[#13426b] border-b border-slate-300">
                      {sysConfig.sec1SubjectGradesTitle || "ผลการเรียนตามกลุ่มสาระการเรียนรู้"}
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-200">
                      {state.subjectGrades.map((sg, i) => (
                        <div
                          key={i}
                          className="p-2 flex items-center justify-between gap-2 border-b border-slate-100"
                        >
                          <span className="font-medium text-slate-700 truncate">{sg.subjectGroup}</span>
                          <div className="flex items-center gap-2 shrink-0">
                            <span className="text-slate-400 text-[11px]">เกรดเฉลี่ย:</span>
                            <input
                              type="text"
                              value={sg.gpa}
                              placeholder="0.00"
                              onChange={(e) => {
                                const next = [...state.subjectGrades];
                                next[i] = { ...next[i], gpa: e.target.value };
                                setState({ ...state, subjectGrades: next });
                              }}
                              className="w-14 font-bold text-[#0d9488] text-right bg-slate-50 px-1.5 py-0.5 rounded border border-slate-200 placeholder:text-slate-300 placeholder:font-normal print:placeholder:text-transparent"
                            />
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ใบ ปพ.1 ด้านหน้า / ด้านหลัง */}
                {(state.sections.sec1_transcriptFront || state.sections.sec1_transcriptBack) && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 break-inside-avoid">
                    {state.sections.sec1_transcriptFront && (
                      <div
                        onClick={() =>
                          triggerImageUpload((url) => updateProfile("transcriptFrontUrl", url))
                        }
                        className="rounded-xl border border-slate-300 p-3 text-center cursor-pointer hover:border-teal-500 transition-colors"
                      >
                        <div className="text-xs font-bold text-[#13426b] mb-2">
                          ระเบียนแสดงผลการเรียน (ปพ.1) ด้านหน้า
                        </div>
                        {state.profile.transcriptFrontUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={state.profile.transcriptFrontUrl}
                            alt="ปพ.1 ด้านหน้า"
                            className="w-full max-h-[360px] object-contain mx-auto rounded"
                          />
                        ) : (
                          <div className="py-12 bg-slate-50 rounded-lg text-slate-400 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                            คลิกเพื่ออัปโหลดภาพ ปพ.1 ด้านหน้า
                          </div>
                        )}
                      </div>
                    )}
                    {state.sections.sec1_transcriptBack && (
                      <div
                        onClick={() =>
                          triggerImageUpload((url) => updateProfile("transcriptBackUrl", url))
                        }
                        className="rounded-xl border border-slate-300 p-3 text-center cursor-pointer hover:border-teal-500 transition-colors"
                      >
                        <div className="text-xs font-bold text-[#13426b] mb-2">
                          ระเบียนแสดงผลการเรียน (ปพ.1) ด้านหลัง
                        </div>
                        {state.profile.transcriptBackUrl ? (
                          // eslint-disable-next-line @next/next/no-img-element
                          <img
                            src={state.profile.transcriptBackUrl}
                            alt="ปพ.1 ด้านหลัง"
                            className="w-full max-h-[360px] object-contain mx-auto rounded"
                          />
                        ) : (
                          <div className="py-12 bg-slate-50 rounded-lg text-slate-400 text-xs">
                            <ImageIcon className="w-8 h-8 mx-auto mb-1 stroke-[1.5]" />
                            คลิกเพื่ออัปโหลดภาพ ปพ.1 ด้านหลัง
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* หมวด 2: เรียงความ / เหตุผลในการสมัคร */}
            {/* ============================================================= */}
            {state.sections.sec2_essay && (
              <div className="space-y-3 pt-4 border-t border-slate-200 break-inside-avoid">
                <span className="inline-block px-4 py-1.5 rounded-full bg-[#13426b] text-white font-bold text-xs sm:text-sm">
                  {sysConfig.sec2Title || "หมวด 2 • เรียงความ / เหตุผลในการสมัคร"}
                </span>
                <div className="p-4 rounded-2xl border border-slate-200 bg-slate-50/40 space-y-2">
                  <input
                    type="text"
                    value={state.essay.title}
                    onChange={(e) =>
                      setState({ ...state, essay: { ...state.essay, title: e.target.value } })
                    }
                    className="w-full font-bold text-sm text-[#13426b] bg-transparent border-b border-transparent focus:border-teal-500 outline-none"
                  />
                  <textarea
                    rows={4}
                    value={state.essay.content}
                    onChange={(e) =>
                      setState({ ...state, essay: { ...state.essay, content: e.target.value } })
                    }
                    placeholder="แตะเพื่อพิมพ์เรียงความหรือเหตุผลในการสมัครเข้าศึกษาต่อ..."
                    className="w-full text-xs sm:text-[13px] text-slate-700 bg-transparent outline-none resize-y leading-relaxed"
                  />
                </div>
              </div>
            )}

            {/* ============================================================= */}
            {/* หมวด 3: หนังสือรับรอง / เอกสารแนบ */}
            {/* ============================================================= */}
            {state.sections.sec3_attachments && (
              <div className="space-y-3 pt-4 border-t border-slate-200 break-inside-avoid">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#13426b] text-white font-bold text-xs sm:text-sm">
                    {sysConfig.sec3Title || "หมวด 3 • หนังสือรับรอง / เอกสารแนบ"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      triggerImageUpload((url) => {
                        setState((prev) => ({
                          ...prev,
                          attachments: [
                            ...prev.attachments,
                            {
                              id: `att_${Date.now()}`,
                              title: "หนังสือรับรอง / เอกสารแนบเพิ่มเติม",
                              imageUrl: url,
                            },
                          ],
                        }));
                      })
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d9488] text-white text-[11px] font-bold print:hidden no-min-h"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มเอกสารแนบ</span>
                  </button>
                </div>

                {state.attachments.length === 0 ? (
                  <div className="p-6 rounded-xl border border-dashed border-slate-300 text-center text-xs text-slate-400 print:hidden">
                    ยังไม่มีเอกสารแนบในหมวดที่ 3 กดปุ่ม <strong>+ เพิ่มเอกสารแนบ</strong> เพื่ออัปโหลดรูปเอกสาร
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {state.attachments.map((att) => (
                      <div key={att.id} className="p-3 rounded-xl border border-slate-200 space-y-2">
                        <div className="flex items-center justify-between gap-2">
                          <input
                            type="text"
                            value={att.title}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                attachments: prev.attachments.map((a) =>
                                  a.id === att.id ? { ...a, title: e.target.value } : a
                                ),
                              }))
                            }
                            className="font-bold text-xs text-slate-800 bg-transparent outline-none flex-1"
                          />
                          <button
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                attachments: prev.attachments.filter((a) => a.id !== att.id),
                              }))
                            }
                            className="text-red-500 hover:text-red-700 print:hidden no-min-h"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={att.imageUrl}
                          alt={att.title}
                          className="w-full max-h-[340px] object-contain rounded-lg bg-slate-50"
                        />
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* ============================================================= */}
            {/* หมวด 4.1, 4.2, 4.3: รางวัล / ผลงาน / กิจกรรม */}
            {/* ============================================================= */}
            {state.sections.sec4_1_awards &&
              renderCategorySection("4.1", sysConfig.sec4_1Title || "หมวด 4.1 - รางวัล / เกียรติบัตร")}

            {state.sections.sec4_2_works &&
              renderCategorySection("4.2", sysConfig.sec4_2Title || "หมวด 4.2 - ผลงานศิลปะ / โครงงาน")}

            {state.sections.sec4_3_activities &&
              renderCategorySection("4.3", sysConfig.sec4_3Title || "หมวด 4.3 - กิจกรรม")}

            {/* ============================================================= */}
            {/* หมวด 5: คำถามเพิ่มเติมของหลักสูตร */}
            {/* ============================================================= */}
            {state.sections.sec5_questions && (
              <div className="space-y-4 pt-4 border-t border-slate-200 break-inside-avoid">
                <div className="flex items-center justify-between">
                  <span className="inline-block px-4 py-1.5 rounded-full bg-[#13426b] text-white font-bold text-xs sm:text-sm">
                    {sysConfig.sec5Title || "หมวด 5 - คำถามเพิ่มเติมของหลักสูตร"}
                  </span>
                  <button
                    type="button"
                    onClick={() =>
                      setState((prev) => ({
                        ...prev,
                        questions: [
                          ...prev.questions,
                          {
                            id: `q_${Date.now()}`,
                            question: "หัวข้อคำถามเพิ่มเติม...",
                            answer: "",
                          },
                        ],
                      }))
                    }
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-[#0d9488] text-white text-[11px] font-bold print:hidden no-min-h"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>เพิ่มคำถาม</span>
                  </button>
                </div>

                <div className="space-y-4">
                  {state.questions.map((q, idx) => (
                    <div key={q.id} className="space-y-2 p-3 rounded-xl hover:bg-slate-50/70">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5 flex-1">
                          <span className="w-6 h-6 rounded-full bg-amber-400 text-slate-950 font-extrabold text-xs flex items-center justify-center shrink-0">
                            {idx + 1}
                          </span>
                          <input
                            type="text"
                            value={q.question}
                            onChange={(e) =>
                              setState((prev) => ({
                                ...prev,
                                questions: prev.questions.map((item) =>
                                  item.id === q.id ? { ...item, question: e.target.value } : item
                                ),
                              }))
                            }
                            className="font-bold text-sm text-[#0f2942] bg-transparent border-b border-transparent focus:border-teal-500 outline-none w-full"
                          />
                        </div>
                        {state.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() =>
                              setState((prev) => ({
                                ...prev,
                                questions: prev.questions.filter((item) => item.id !== q.id),
                              }))
                            }
                            className="text-slate-400 hover:text-red-600 print:hidden no-min-h"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                      <div className="pl-8">
                        <textarea
                          rows={3}
                          value={q.answer}
                          onChange={(e) =>
                            setState((prev) => ({
                              ...prev,
                              questions: prev.questions.map((item) =>
                                item.id === q.id ? { ...item, answer: e.target.value } : item
                              ),
                            }))
                          }
                          placeholder="แตะเพื่อพิมพ์คำตอบ..."
                          className="w-full text-xs sm:text-[13px] text-slate-700 bg-transparent border-t border-slate-200 pt-2 outline-none resize-y leading-relaxed"
                        />
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </main>
      </div>

      {/* ================================================================= */}
      {/* MODAL 1: PICK IMAGE FOR A SPECIFIC SLOT (Upload or Choose from Art Room) */}
      {/* ================================================================= */}
      {slotPickerTarget && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={() => setSlotPickerTarget(null)}
        >
          <div
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-teal-50 text-[#0d9488] flex items-center justify-center">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    เลือกรูปภาพใส่ช่องที่ {slotPickerTarget.slotIndex + 1}
                  </h3>
                  <p className="text-xs text-slate-500">
                    อัปโหลดรูปจากเครื่องของคุณ หรือเลือกรูปผลงานจากคลัง ART ROOM
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setSlotPickerTarget(null)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center no-min-h"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-5 overflow-y-auto space-y-5">
              {/* Option A: Upload from device */}
              <button
                type="button"
                onClick={() => {
                  const target = slotPickerTarget;
                  setSlotPickerTarget(null);
                  triggerImageUpload((url) => {
                    updateEntryImageSlot(target.entryId, target.slotIndex, url);
                  });
                }}
                className="w-full py-5 px-4 rounded-2xl border-2 border-dashed border-teal-400 bg-teal-50/40 hover:bg-teal-50 text-[#0f766e] font-bold text-sm flex flex-col items-center justify-center gap-1.5 transition-colors cursor-pointer"
              >
                <Upload className="w-7 h-7 text-[#0d9488]" />
                <span>อัปโหลดรูปภาพจากเครื่องคอมพิวเตอร์ / มือถือ</span>
                <span className="text-[11px] font-normal text-slate-500">
                  รองรับไฟล์ JPG, PNG, WEBP (ระบบบีบอัดภาพให้อัตโนมัติ)
                </span>
              </button>

              {/* Option B: Pick from Art Room Gallery / Submissions */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-700">
                    หรือเลือกรูปจากคลังผลงานในเว็บ ART ROOM:
                  </span>
                  <button
                    type="button"
                    onClick={loadArtRoomRepository}
                    className="text-[11px] text-[#0d9488] font-bold hover:underline no-min-h"
                  >
                    โหลดรูปภาพในคลัง
                  </button>
                </div>

                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {[
                    ...studentSubmissions.map((s) => ({
                      img: s.imageUrl || s.fileUrl,
                      label: s.assignment?.title || "งานที่ส่ง",
                    })),
                    ...schoolAwards.flatMap((a) => [
                      a.certificateUrl ? { img: a.certificateUrl, label: `เกียรติบัตร: ${a.title}` } : null,
                      a.imageUrl ? { img: a.imageUrl, label: a.title } : null,
                    ]),
                    ...schoolArtworks.map((art) => ({
                      img: art.imageUrl,
                      label: art.title,
                    })),
                  ]
                    .filter((x): x is { img: string; label: string } => Boolean(x && x.img))
                    .slice(0, 16)
                    .map((item, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          updateEntryImageSlot(
                            slotPickerTarget.entryId,
                            slotPickerTarget.slotIndex,
                            item.img
                          );
                          setSlotPickerTarget(null);
                          swalToast("เลือกรูปภาพเรียบร้อย", "success");
                        }}
                        className="group relative aspect-[4/3] rounded-xl overflow-hidden border border-slate-200 hover:border-teal-500 bg-slate-100"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                        <div className="absolute inset-x-0 bottom-0 bg-black/60 text-white text-[10px] px-1.5 py-1 truncate">
                          {item.label}
                        </div>
                      </button>
                    ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ================================================================= */}
      {/* MODAL 2: IMPORT FULL ENTRY FROM ART ROOM DATABASE */}
      {/* ================================================================= */}
      {isImportModalOpen && (
        <div
          className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 print:hidden"
          onClick={() => setIsImportModalOpen(false)}
        >
          <div
            className="bg-white rounded-3xl max-w-3xl w-full max-h-[85vh] flex flex-col overflow-hidden shadow-2xl border border-slate-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="p-4 sm:p-5 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-orange-400 to-red-500 text-white flex items-center justify-center shadow-sm">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-slate-900 text-sm sm:text-base">
                    คลังผลงานและรางวัลส่วนตัวของ {currentStudentName || "ฉัน"} ({currentStudentId})
                  </h3>
                  <p className="text-xs text-slate-500">
                    แสดงเฉพาะชิ้นงานและเกียรติบัตรของคุณเท่านั้น คลิกเพื่อนำข้อมูลใส่พอร์ตได้ทันที
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsImportModalOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 text-slate-500 hover:text-slate-800 flex items-center justify-center no-min-h"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Category Tabs (Only student's own items) */}
            <div className="px-5 pt-3 border-b border-slate-100 flex items-center gap-2 overflow-x-auto text-xs">
              {[
                { id: "submissions", label: `งานศิลปะที่ฉันส่ง (${studentSubmissions.length})` },
                { id: "awards", label: `รางวัล/เกียรติบัตรของฉัน (${schoolAwards.length})` },
                { id: "artworks", label: `ผลงานในหอศิลป์ของฉัน (${schoolArtworks.length})` },
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setImportTab(t.id as any)}
                  className={`px-3.5 py-2 rounded-t-xl font-bold border-b-2 transition-colors whitespace-nowrap no-min-h ${importTab === t.id
                    ? "border-[#0d9488] text-[#0d9488] bg-teal-50/50"
                    : "border-transparent text-slate-500 hover:text-slate-800"
                    }`}
                >
                  {t.label}
                </button>
              ))}
            </div>

            <div className="p-5 overflow-y-auto flex-1 space-y-3">
              {isLoadingImport ? (
                <div className="py-12 text-center text-slate-400 text-xs">
                  กำลังโหลดข้อมูลจากคลัง ART ROOM...
                </div>
              ) : importTab === "submissions" ? (
                studentSubmissions.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs space-y-2">
                    <p>ไม่พบรายการส่งงานของบัญชีนักเรียนที่ล็อกอินอยู่ในขณะนี้</p>
                    <p>สามารถสลับไปดูแท็บ <strong>รางวัล/เกียรติบัตร</strong> หรือ <strong>หอศิลป์โรงเรียน</strong> ได้เลยครับ</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {studentSubmissions.map((sub) => {
                      const img = sub.imageUrl || sub.fileUrl || "";
                      const extraImgs = Array.isArray(sub.images) ? sub.images : img ? [img] : [];
                      return (
                        <div
                          key={sub.id}
                          className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 flex items-center gap-3 justify-between"
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            {img && (
                              // eslint-disable-next-line @next/next/no-img-element
                              <img
                                src={img}
                                alt={sub.assignment?.title}
                                className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                              />
                            )}
                            <div className="min-w-0">
                              <div className="font-bold text-xs text-slate-900 truncate">
                                {sub.assignment?.title || "ชิ้นงานศิลปะ"}
                              </div>
                              <div className="text-[11px] text-slate-500 truncate">
                                {sub.concept || "รายวิชาศิลปะ โรงเรียนวชิรธรรมสาธิต"}
                              </div>
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => {
                              addEntry("4.2", {
                                title: sub.assignment?.title || "ผลงานศิลปะสร้างสรรค์",
                                level: "ระดับสถานศึกษา",
                                dateStr: sub.submittedAt
                                  ? new Date(sub.submittedAt).toLocaleDateString("th-TH")
                                  : "ปีการศึกษา 2569",
                                organization: "กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต",
                                awardResult:
                                  sub.score !== null && sub.score !== undefined
                                    ? `คะแนนประเมิน ${sub.score} / ${sub.assignment?.maxScore || 10} คะแนน`
                                    : "ผลงานที่ผ่านการคัดเลือก",
                                description:
                                  sub.concept ||
                                  sub.assignment?.description ||
                                  "สร้างสรรค์ผลงานทัศนศิลป์ตามโจทย์การเรียนรู้ในห้องเรียนศิลปะ",
                                learned:
                                  sub.feedback ||
                                  "ได้ฝึกทักษะการวางแผน การจัดองค์ประกอบศิลป์ และการสื่อสารแนวคิดผ่านผลงาน",
                                layout: extraImgs.length > 1 ? "hero-1-4" : "16-9",
                                images: [
                                  extraImgs[0] || "",
                                  extraImgs[1] || "",
                                  extraImgs[2] || "",
                                  extraImgs[3] || "",
                                  extraImgs[4] || "",
                                ],
                              });
                              setIsImportModalOpen(false);
                              swalToast("นำเข้าผลงานลงในหมวด 4.2 เรียบร้อย!", "success");
                            }}
                            className="px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shrink-0 no-min-h"
                          >
                            + นำใส่พอร์ต
                          </button>
                        </div>
                      );
                    })}
                  </div>
                )
              ) : importTab === "awards" ? (
                schoolAwards.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    ยังไม่มีรายการรางวัลหรือเกียรติบัตรที่เป็นชื่อของคุณในระบบ
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schoolAwards.map((aw) => (
                      <div
                        key={aw.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 flex items-center gap-3 justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {(aw.certificateUrl || aw.imageUrl) && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={aw.certificateUrl || aw.imageUrl}
                              alt={aw.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{aw.title}</div>
                            <div className="text-[11px] text-emerald-700 font-semibold truncate">
                              {aw.awardLevel || "รางวัลเกียรติคุณ"} • {aw.student}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addEntry("4.1", {
                              title: aw.title,
                              level: aw.competitionLevel || "ระดับชาติ",
                              dateStr: aw.date || aw.year || "2569",
                              organization: aw.organization || "โรงเรียนวชิรธรรมสาธิต",
                              awardResult: aw.awardLevel || "รางวัลชนะเลิศ",
                              description:
                                aw.description ||
                                `ได้รับรางวัลจากการเข้าร่วมการแข่งขันรายการ ${aw.title}`,
                              layout: "hero-1-4",
                              images: [
                                aw.certificateUrl || aw.imageUrl || "",
                                aw.imageUrl || "",
                                "",
                                "",
                                "",
                              ],
                            });
                            setIsImportModalOpen(false);
                            swalToast("นำเข้ารางวัลลงในหมวด 4.1 เรียบร้อย!", "success");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shrink-0 no-min-h"
                        >
                          + นำใส่พอร์ต
                        </button>
                      </div>
                    ))}
                  </div>
                )
              ) : (
                schoolArtworks.length === 0 ? (
                  <div className="py-10 text-center text-slate-400 text-xs">
                    ยังไม่มีผลงานของคุณที่จัดแสดงในหอศิลป์โรงเรียน
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {schoolArtworks.map((art) => (
                      <div
                        key={art.id}
                        className="p-3 rounded-2xl border border-slate-200 hover:border-teal-500 flex items-center gap-3 justify-between"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          {art.imageUrl && (
                            // eslint-disable-next-line @next/next/no-img-element
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-14 h-14 rounded-xl object-cover shrink-0 bg-slate-100"
                            />
                          )}
                          <div className="min-w-0">
                            <div className="font-bold text-xs text-slate-900 truncate">{art.title}</div>
                            <div className="text-[11px] text-slate-500 truncate">
                              เทคนิค: {art.technique || "ทัศนศิลป์"} • {art.author}
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => {
                            addEntry("4.2", {
                              title: art.title,
                              level: "ระดับสถานศึกษา",
                              dateStr: art.year || "ปีการศึกษา 2569",
                              organization: "หอศิลป์จำลอง โรงเรียนวชิรธรรมสาธิต",
                              awardResult: `ผลงานจัดแสดงในหอศิลป์ (เทคนิค: ${art.technique || "ทัศนศิลป์"})`,
                              description: `สร้างสรรค์ผลงานทัศนศิลป์หัวข้อ "${art.title}" ด้วยเทคนิค${art.technique || "สีและสื่อผสม"} ขนาด ${art.dimensions || "มาตรฐาน"}`,
                              layout: "4-3",
                              images: [art.imageUrl || ""],
                            });
                            setIsImportModalOpen(false);
                            swalToast("นำเข้าผลงานศิลปะลงในหมวด 4.2 เรียบร้อย!", "success");
                          }}
                          className="px-3 py-1.5 rounded-xl bg-[#0d9488] hover:bg-[#0f766e] text-white font-bold text-xs shrink-0 no-min-h"
                        >
                          + นำใส่พอร์ต
                        </button>
                      </div>
                    ))}
                  </div>
                )
              )}
            </div>
          </div>
        </div>
      )}
      {/* University Official Emblem Picker Modal */}
      {isUnivLogoPickerOpen && (
        <div
          onClick={() => setIsUnivLogoPickerOpen(false)}
          className="fixed inset-0 z-[120] bg-black/65 backdrop-blur-xs flex items-center justify-center p-3 sm:p-4 print:hidden"
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-3xl max-w-2xl w-full max-h-[88dvh] overflow-hidden shadow-2xl border border-slate-100 flex flex-col animate-in zoom-in-95 duration-150"
          >
            <div className="px-5 py-4 border-b border-slate-100 flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-orange-100 text-orange-600 flex items-center justify-center">
                  <Building2 className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-sm sm:text-base font-extrabold text-slate-900">
                    เลือกตรามหาวิทยาลัย / สถาบันที่สมัคร
                  </h3>
                  <p className="text-[11px] text-slate-500">
                    คลิกเลือกมหาวิทยาลัยเพื่อใส่ตราสัญลักษณ์และชื่อสถาบันอัตโนมัติ หรืออัปโหลดไฟล์ตราเอง
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setIsUnivLogoPickerOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-500 flex items-center justify-center cursor-pointer no-min-h"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="p-4 sm:p-5 overflow-y-auto space-y-4">
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                {UNIVERSITY_LOGO_PRESETS.map((u) => {
                  const isSelected = state.universityLogo === u.logo;
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => {
                        setState((prev) => ({
                          ...prev,
                          university: u.name,
                          universityLogo: u.logo,
                        }));
                        setIsUnivLogoPickerOpen(false);
                        swalToast(`เลือกตรา ${u.short} เรียบร้อย`, "success");
                      }}
                      className={`p-3 rounded-2xl border text-left flex items-center gap-3 transition-all cursor-pointer ${
                        isSelected
                          ? "border-orange-500 bg-orange-50/70 ring-2 ring-orange-500/15"
                          : "border-slate-200 hover:border-orange-300 hover:bg-slate-50"
                      }`}
                    >
                      {/* eslint-disable-next-line @next/next/no-img-element */}
                      <img
                        src={u.logo}
                        alt={u.name}
                        className="w-11 h-11 object-contain shrink-0 bg-white rounded-xl p-1 border border-slate-100"
                      />
                      <div className="min-w-0">
                        <div className="text-xs font-bold text-slate-900 leading-tight line-clamp-2">
                          {u.short}
                        </div>
                        <div className="text-[10px] text-slate-400 truncate mt-0.5">
                          {u.name}
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>

              <div className="pt-2 border-t border-slate-100 flex flex-col sm:flex-row items-center justify-between gap-2.5">
                <span className="text-xs text-slate-500">
                  ไม่พบมหาวิทยาลัยที่ต้องการ? สามารถอัปโหลดรูปตราสถาบันจากเครื่องได้เลย
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setIsUnivLogoPickerOpen(false);
                    triggerImageUpload((url) => setState((prev) => ({ ...prev, universityLogo: url })));
                  }}
                  className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0 no-min-h"
                >
                  <Upload className="w-3.5 h-3.5" />
                  <span>อัปโหลดรูปตราสถาบันเอง</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Smart Desk-Trimming & Interactive Cropper for Portfolio Uploads */}
      <ImageEditorModal
        isOpen={isCropperOpen}
        file={cropperFile}
        onClose={() => {
          setIsCropperOpen(false);
          setCropperFile(null);
        }}
        onSave={(editedFile) => finalizePortfolioImageFile(editedFile, true)}
        onSkipCrop={(rawFile) => finalizePortfolioImageFile(rawFile, false)}
        title="✂️ ครอบตัดขอบโต๊ะ & จัดกรอบรูปสำหรับแฟ้มสะสมผลงาน"
        defaultAspectRatio="free"
        autoDetectArtwork={true}
      />
    </div>
  );
}
