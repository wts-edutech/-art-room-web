/**
 * Art Room - Comprehensive Profanity & Inappropriate Content Filter
 * ระบบตรวจจับคำหยาบและถ้อยคำที่ไม่เหมาะสมสำหรับสังคมการเรียนรู้ศิลปะ
 */

export const PROFANITY_ALERT_MESSAGE =
  "ตรวจพบถ้อยคำที่ไม่เหมาะสม เพื่อรักษาบรรยากาศอันดีในห้องเรียนศิลปะและสังคมการเรียนรู้ของเรา กรุณาใช้ถ้อยคำที่สุภาพและสร้างสรรค์ค่ะ";

// รายการคำหยาบคาย ถ้อยคำไม่เหมาะสม ลามก อนาจาร หรือด่าทอ (ไทย & อังกฤษ)
const THAI_PROFANITY_WORDS = [
  // คำด่าทอ / คำหยาบพื้นฐาน
  "ควย",
  "เหี้ย",
  "สัส",
  "สัตว์",
  "ไอ้สัส",
  "อีสัส",
  "ไอ้เหี้ย",
  "อีเหี้ย",
  "เย็ด",
  "เยด",
  "เย็",
  "หี",
  "แตด",
  "ดอกทอง",
  "อีดอก",
  "อีดอกทอง",
  "จัญไร",
  "สถุล",
  "ระยำ",
  "ชาติชั่ว",
  "ชาติหมา",
  "หน้าด้าน",
  "หน้าตัวเมีย",
  "กระหรี่",
  "กะหรี่",
  "ส้นตีน",
  "กวนส้นตีน",
  "ชิบหาย",
  "ฉิบหาย",
  "ไอ้ควาย",
  "อีควาย",
  "ไอ้ห่า",
  "อีห่า",
  "ห่าราก",
  "มึงตาย",
  "พ่อมึงตาย",
  "แม่มึงตาย",
  "เย็ดแม่",
  "เย็ดเข้",
  "ปอบ",
  "สันดาน",
  "เสือก",
  "ตอแหล",
  "บัดซบ",
  "เปรต",
  "แรด",
  "อัณฑะ",
  "เย็ดเป็ด",
  "หน้าหี",
  "หัวดิก",
  "หัวควย",
  "ขี้หมา",
  "กวนตีน",
  "แม่ง",
  "ชักว่าว",
  "หื่น",
  "ร่าน",
  "ดัดจริต",
  "เสนียด",
  "ระยำหมา",
  "กินขี้",
  "แดกขี้",
  "ไอ้เวร",
  "อีเวร",
  "หัวดอ",
  "ห่าเอ๊ย",
  "เหี้ยเอ๊ย",
  "หักคอแม่มึง",
  "ฆ่าตัวตาย",
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

  // 1. ตรวจสอบคำหยาบภาษาไทยในข้อความดิบ
  for (const word of THAI_PROFANITY_WORDS) {
    if (rawLower.includes(word)) {
      return { isClean: false, matchedWord: word, originalText: text };
    }
  }

  // 2. ตรวจสอบคำหยาบภาษาไทยในข้อความที่ถูก Normalize (กรณีเว้นวรรคหรือใส่สัญลักษณ์คั่น)
  for (const word of THAI_PROFANITY_WORDS) {
    // ป้องกัน False Positive กับคำสั้นเกินไป เช่น 1 ตัวอักษร
    if (word.length >= 2 && normalized.includes(normalizeText(word))) {
      return { isClean: false, matchedWord: word, originalText: text };
    }
  }

  // 3. ตรวจสอบคำหยาบภาษาอังกฤษ (ใช้ Regex boundary เพื่อป้องกันคำทั่วไป เช่น "assume" ไม่ให้ติด "ass")
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
