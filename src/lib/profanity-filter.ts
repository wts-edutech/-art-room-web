/**
 * Art Room - Comprehensive Profanity & Inappropriate Content Filter
 * ระบบตรวจจับคำหยาบและถ้อยคำที่ไม่เหมาะสมสำหรับสังคมการเรียนรู้ศิลปะ
 */

export const PROFANITY_ALERT_MESSAGE =
  "ตรวจพบถ้อยคำที่ไม่เหมาะสม เพื่อรักษาบรรยากาศอันดีในห้องเรียนศิลปะและสังคมการเรียนรู้ของเรา กรุณาใช้ถ้อยคำที่สุภาพและสร้างสรรค์ค่ะ";

// กฎ Regex สำหรับคำที่มีเงื่อนไขบริบทพิเศษ (เพื่อป้องกัน False Positive กับคำทั่วไป เช่น "บ้าน", "บ่าย", "หีบ", "กูเกิล")
const SPECIAL_CONTEXT_RULES: { regex: RegExp; matchedWord: string }[] = [
  // คำว่า "บ้า" เดี่ยวๆ หรือคำสร้อยท้าย (ตรวจจับ บ้า, บ้าๆ, บ้าบอ, บ้าไปแล้ว แต่ไม่จับ บ้าน, บ่าย, บ่าว)
  {
    regex: /(?:^|[^\u0E00-\u0E7F])บ้า(?:ๆ|บอ|เอ๊ย|เอ้ย|ไปแล้ว|ปะ|เปล่า|ป่ะ)?(?=[^\u0E00-\u0E7F]|$)/,
    matchedWord: "บ้า",
  },
  // คำว่า "กู" สรรพนามหยาบคาย (ไม่จับ กูเกิล, กูเกิ้ล, กูรู, กูปรี)
  {
    regex: /(?:^|[^\u0E00-\u0E7F])กู(?!(?:เกิล|เกิ้ล|รู|ปรี))/i,
    matchedWord: "กู",
  },
  // คำว่า "หี" (ไม่จับ หีบ, หีบสมบัติ, หีบเพลง)
  {
    regex: /หี(?![บ])/u,
    matchedWord: "หี",
  },
];

// รายการคำหยาบคาย ถ้อยคำไม่เหมาะสม ลามก อนาจาร หรือด่าทอ (ไทย & อังกฤษ)
const THAI_PROFANITY_WORDS = [
  // กลุ่ม "แดก" และสแลงกินแบบหยาบคาย / อาการประสาท
  "แดก",
  "แด๊ก",
  "ประสาทจะแดก",
  "ประสาทแดก",
  "ประสาทกลับ",
  "แดกขี้",
  "กินขี้",
  "หมาไม่แดก",
  "แดกหัว",

  // กลุ่ม "บ้า" / สติปัญญา / จิตวิทยา
  "อีบ้า",
  "ไอ้บ้า",
  "อิบ้า",
  "ไอบ้า",
  "นังบ้า",
  "คนบ้า",
  "เป็นบ้า",
  "บ้าเอ๊ย",
  "บ้าเอ้ย",
  "บ้าบอ",
  "บ้าไปแล้ว",
  "บ้ากาม",
  "ปัญญาอ่อน",
  "ปญอ",
  "สมองหมา",
  "สมองกลวง",
  "ไร้สมอง",
  "ไอ้โง่",
  "อีโง่",
  "หน้าโง่",
  "โง่เง่า",
  "โง่บัดซบ",
  "โคตรโง่",
  "โรคจิต",

  // คำสรรพนามหยาบคาย
  "มึง",
  "มรึง",
  "เมิง",
  "มิง",
  "มุง",

  // คำด่าทอ / คำหยาบพื้นฐาน
  "ควย",
  "เหี้ย",
  "เฮี้ย",
  "เชี่ย",
  "สัส",
  "สัตว์",
  "ไอ้สัส",
  "อีสัส",
  "ไอ้สัตว์",
  "อีสัตว์",
  "สัด",
  "สาส",
  "ไอ้เหี้ย",
  "อีเหี้ย",
  "อิเหี้ย",
  "เย็ด",
  "เยด",
  "เย็",
  "เย็ดแม่",
  "เย็ดเข้",
  "เย็ดเป็ด",
  "เยสแม่",
  "เยสเข้",
  "ยสตน",
  "แตด",
  "ร่องแตด",
  "รูแตด",
  "ดอกทอง",
  "อีดอก",
  "อิดอก",
  "อีดอกทอง",
  "จัญไร",
  "สถุล",
  "สถุน",
  "ระยำ",
  "ชาติชั่ว",
  "ชาติหมา",
  "หน้าด้าน",
  "หน้าตัวเมีย",
  "หน้าส้นตีน",
  "หน้าหมา",
  "หน้าหี",
  "กระหรี่",
  "กะหรี่",
  "อีกระหรี่",
  "อีกะหรี่",
  "ส้นตีน",
  "กวนส้นตีน",
  "กวนตีน",
  "ตีนแตก",
  "ชิบหาย",
  "ฉิบหาย",
  "ชิพหาย",
  "ฉิพหาย",
  "ไอ้ควาย",
  "อีควาย",
  "อิควาย",
  "ควายเอ๊ย",
  "ควายเอ้ย",
  "ฟาย",
  "ควัย",
  "ไอ้ห่า",
  "อีห่า",
  "อิห่า",
  "ห่าราก",
  "ห่าเอ๊ย",
  "ห่าเอ้ย",
  "ห่าจิก",
  "ยัดห่า",
  "ไอ้เวร",
  "อีเวร",
  "อิเวร",
  "เวรเอ๊ย",
  "มึงตาย",
  "พ่อมึงตาย",
  "แม่มึงตาย",
  "หักคอแม่มึง",
  "โคตรแม่มึง",
  "ปอบ",
  "สันดาน",
  "สันดานเสีย",
  "สันดานหมา",
  "สันขวาน",
  "เสือก",
  "สัสเสือก",
  "ตอแหล",
  "อีตอแหล",
  "บัดซบ",
  "เปรต",
  "ไอ้เปรต",
  "อีเปรต",
  "แรด",
  "อีแรด",
  "ร่าน",
  "อีร่าน",
  "ดัดจริต",
  "เสนียด",
  "ระยำหมา",
  "กาลกิณี",
  "ฆ่าตัวตาย",

  // คำขึ้นต้นด่าบุคคล
  "อีผี",
  "ไอ้ผี",
  "อีแก่",
  "ไอ้แก่",
  "อีช้างน้ำ",
  "อีตัว",
  "อีงั่ง",
  "ไอ้งั่ง",
  "อีกระจอก",
  "ไอ้กระจอก",
  "ไอ้เลว",
  "อีเลว",
  "ไอ้ชั่ว",
  "อีชั่ว",
  "ปากหมา",
  "ปากเสีย",
  "ปากบอน",

  // เรื่องเพศ / อวัยวะ / อนาจาร
  "หัวดอ",
  "กระดอ",
  "กะดอ",
  "หัวดิก",
  "หัวควย",
  "อัณฑะ",
  "ชักว่าว",
  "หื่น",
  "หื่นกาม",
  "เงี่ยน",
  "ควยแข็ง",
  "น้ำแตก",
  "แตกใน",
  "อมควย",
  "ดูดควย",
  "เลียหี",
  "ดูดหี",
  "เลียแตด",
  "อมหำ",
  "ดูดหำ",
  "หอยเน่า",
  "เลียหอย",
  "ดูดหอย",
  "แม่ง",
];

const ENGLISH_PROFANITY_WORDS = [
  "fuck",
  "fucking",
  "fucker",
  "motherfucker",
  "shit",
  "bullshit",
  "bitch",
  "bitches",
  "asshole",
  "ass",
  "dick",
  "cock",
  "pussy",
  "cunt",
  "bastard",
  "whore",
  "slut",
  "faggot",
  "nigger",
  "nigga",
  "blowjob",
  "sex",
  "porn",
  "boobs",
  "penis",
  "vagina",
  "wanker",
];

/**
 * ทำความสะอาดข้อความเพื่อตรวจจับการพิมพ์เว้นวรรค / แทรกสัญลักษณ์หลบเลี่ยง
 * เช่น: "ค ว ย", "เ หี้ ย", "สั_ส", "f.u.c.k", "f*ck"
 */
function normalizeText(text: string): string {
  return text
    .toLowerCase()
    // ลบช่องว่างและอักขระพิเศษออกเพื่อจับคำที่เว้นวรรค
    .replace(/[\s\-_.*+,/\\#@!$%^&~`|<>?:;"'()[\]{}]+/g, "");
}

export interface ProfanityCheckResult {
  isClean: boolean;
  matchedWord?: string;
  originalText: string;
}

/**
 * ตรวจสอบว่าข้อความมีคำหยาบคายหรือไม่
 * @param text ข้อความที่ต้องการตรวจสอบ
 * @returns ผลการตรวจสอบ { isClean: boolean, matchedWord?: string }
 */
export function checkProfanity(text: string): ProfanityCheckResult {
  if (!text || typeof text !== "string") {
    return { isClean: true, originalText: text || "" };
  }

  const rawLower = text.toLowerCase();
  const normalized = normalizeText(text);

  // 1. ตรวจสอบเงื่อนไขบริบทพิเศษ (Special Context Rules เช่น บ้า, กู, หี)
  for (const rule of SPECIAL_CONTEXT_RULES) {
    if (rule.regex.test(rawLower)) {
      return { isClean: false, matchedWord: rule.matchedWord, originalText: text };
    }
  }

  // 2. ตรวจสอบคำหยาบภาษาไทยในข้อความดิบ
  for (const word of THAI_PROFANITY_WORDS) {
    if (rawLower.includes(word)) {
      return { isClean: false, matchedWord: word, originalText: text };
    }
  }

  // 3. ตรวจสอบคำหยาบภาษาไทยในข้อความที่ถูก Normalize (กรณีเว้นวรรคหรือใส่สัญลักษณ์คั่น เช่น "ค ว ย")
  for (const word of THAI_PROFANITY_WORDS) {
    // ป้องกัน False Positive กับคำสั้นเกินไป เช่น 1 ตัวอักษร
    if (word.length >= 2 && normalized.includes(normalizeText(word))) {
      return { isClean: false, matchedWord: word, originalText: text };
    }
  }

  // 4. ตรวจสอบคำหยาบภาษาอังกฤษ (ใช้ Regex boundary เพื่อป้องกันคำทั่วไป เช่น "assume" ไม่ให้ติด "ass")
  for (const word of ENGLISH_PROFANITY_WORDS) {
    // Exact word boundary in raw text
    const regex = new RegExp(`\\b${word}\\b`, "i");
    if (regex.test(rawLower)) {
      return { isClean: false, matchedWord: word, originalText: text };
    }

    // Spaced English evasion check (เช่น "f u c k")
    if (word.length >= 4 && normalized.includes(word)) {
      return { isClean: false, matchedWord: word, originalText: text };
    }
  }

  return { isClean: true, originalText: text };
}

/**
 * ฟังก์ชันช่วยคืนค่า boolean โดยตรงว่ามีคำหยาบหรือไม่
 */
export function containsProfanity(text: string): boolean {
  return !checkProfanity(text).isClean;
}
