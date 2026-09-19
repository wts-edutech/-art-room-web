export const runtime = 'edge';

import { NextResponse } from 'next/server';
import { checkIsAdmin } from '@/lib/api-auth';

// Curated high quality art-related cover images from Unsplash matching various topics
const ART_THEME_IMAGES: Record<string, string[]> = {
  drawing: [
    "https://images.unsplash.com/photo-1541701494587-cb58502866ab?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513364776144-60967b0f800f?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1579783900882-c0d3dad7b119?q=80&w=800&auto=format&fit=crop",
  ],
  painting: [
    "https://images.unsplash.com/photo-1579783902614-a3fb3927b675?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1582561424760-0321d75e81fa?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1460661419201-fd4cecdf8a8b?q=80&w=800&auto=format&fit=crop",
  ],
  color: [
    "https://images.unsplash.com/photo-1502691876148-a84978e59af8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1550684848-fac1c5b4e853?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1518709268805-4e9042af9f23?q=80&w=800&auto=format&fit=crop",
  ],
  craft: [
    "https://images.unsplash.com/photo-1525909002-1b05e0c869d8?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1513519245088-0e12902e5a38?q=80&w=800&auto=format&fit=crop",
  ],
  general: [
    "https://images.unsplash.com/photo-1544717305-2782549b5136?q=80&w=800&auto=format&fit=crop",
    "https://images.unsplash.com/photo-1499750310107-5fef28a66643?q=80&w=800&auto=format&fit=crop",
  ]
};

function pickCoverImage(topic: string): string {
  const t = topic.toLowerCase();
  let pool = ART_THEME_IMAGES.general;
  if (t.includes("สี") || t.includes("คราม") || t.includes("วงจร") || t.includes("color")) {
    pool = ART_THEME_IMAGES.color;
  } else if (t.includes("วาด") || t.includes("เส้น") || t.includes("ดินสอ") || t.includes("perspective") || t.includes("ทัศนียภาพ") || t.includes("เงา")) {
    pool = ART_THEME_IMAGES.drawing;
  } else if (t.includes("ระบาย") || t.includes("น้ำ") || t.includes("อะคริลิก") || t.includes("painting") || t.includes("ภาพ")) {
    pool = ART_THEME_IMAGES.painting;
  } else if (t.includes("ปั้น") || t.includes("พิมพ์") || t.includes("ประดิษฐ์") || t.includes("ลายไทย")) {
    pool = ART_THEME_IMAGES.craft;
  }
  const idx = Math.floor(Math.random() * pool.length);
  return pool[idx];
}

interface MaterialGenerationResult {
  title: string;
  topic: string;
  category: string;
  grade: string;
  gradeLabel: string;
  description: string;
  objectives: string[];
  theoryContent: string;
  activitySteps: { step: number; title: string; detail: string }[];
  rubricCriteria: { criteria: string; weight: string; description: string }[];
  reflectionQuestions: string[];
  recommendedImageUrl: string;
  suggestedFileName: string;
  fileSize: string;
  fileUrl: string;
  contentMarkdown: string;
  aiModel: string;
  aiPersonaName: string;
  generatedAt: string;
}

export async function POST(request: Request) {
  try {
    if (!(await checkIsAdmin())) {
      return NextResponse.json({ error: 'Unauthorized — เฉพาะผู้ดูแลระบบเท่านั้น' }, { status: 401 });
    }

    const body = await request.json().catch(() => ({}));
    const topic = String(body.topic || '').trim();
    const grade = String(body.grade || 'all').trim();
    const category = String(body.category || 'แบบฝึกหัด').trim();
    const aiModel = String(body.aiModel || 'gpt').trim().toLowerCase(); // 'gpt' | 'gemini' | 'claude' | 'notebooklm'
    const customPrompt = String(body.customPrompt || '').trim();

    if (!topic) {
      return NextResponse.json({ error: 'กรุณาระบุหัวข้อหรือไอเดียสื่อการสอนที่ต้องการออกแบบ' }, { status: 400 });
    }

    const gradeLabelMap: Record<string, string> = {
      all: 'ทุกระดับชั้น',
      m1: 'มัธยมศึกษาปีที่ 1 (ม.1)',
      m2: 'มัธยมศึกษาปีที่ 2 (ม.2)',
      m3: 'มัธยมศึกษาปีที่ 3 (ม.3)',
      m4: 'มัธยมศึกษาปีที่ 4 (ม.4)',
      m5: 'มัธยมศึกษาปีที่ 5 (ม.5)',
      m6: 'มัธยมศึกษาปีที่ 6 (ม.6)',
    };
    const gradeLabel = gradeLabelMap[grade] || 'ทุกระดับชั้น';

    // Persona Name and Characteristics
    let personaName = 'ChatGPT (GPT-4o)';
    let toneTagline = 'โครงสร้างมาตรฐาน ทางการ ชัดเจน';
    if (aiModel === 'gemini') {
      personaName = 'Google Gemini 2.0 Flash';
      toneTagline = 'ความคิดสร้างสรรค์ล้ำสมัย บูรณาการ STEAM';
    } else if (aiModel === 'claude') {
      personaName = 'Anthropic Claude 3.5 Sonnet';
      toneTagline = 'การจัดลำดับขั้นตอนลึกซึ้ง และสุนทรียศาสตร์ทางศิลปะ';
    } else if (aiModel === 'notebooklm') {
      personaName = 'Google NotebookLM Art Assistant';
      toneTagline = 'สรุปสาระสำคัญ (Study Guide) บรีฟกะทัดรัด คัดเน้นประเด็นสำคัญ';
    }

    // Dynamic synthesis based on topic, grade, category, and AI Persona
    const coverImage = pickCoverImage(topic);
    const sanitizedTitle = topic.replace(/[^\u0E00-\u0E7Fa-zA-Z0-9\s]/g, '').trim();

    let generatedTitle = `ใบงาน: ${sanitizedTitle}`;
    if (category === 'ใบความรู้') generatedTitle = `ใบความรู้และสรุปเนื้อหา: ${sanitizedTitle}`;
    else if (category === 'สื่อภาพ') generatedTitle = `สื่อภาพและขั้นตอนเทคนิค: ${sanitizedTitle}`;
    else if (category === 'เกณฑ์การประเมิน') generatedTitle = `คู่มือเกณฑ์การประเมินชิ้นงาน: ${sanitizedTitle}`;
    else if (category === 'คู่มือ') generatedTitle = `คู่มือนักเรียน: ${sanitizedTitle}`;

    // Persona-specific description & pedagogy
    let description = '';
    let theoryContent = '';
    let objectives: string[] = [];
    let activitySteps: { step: number; title: string; detail: string }[] = [];
    let rubricCriteria: { criteria: string; weight: string; description: string }[] = [];
    let reflectionQuestions: string[] = [];

    if (aiModel === 'gemini') {
      // Creative STEAM style
      description = `ชุดสื่อการสอนที่ออกแบบโดย Google Gemini มุ่งเน้นการจุดประกายจินตนาการและการทดลองสร้างสรรค์ผ่าน ${topic} สำหรับนักเรียน ${gradeLabel} เชื่อมโยงบริบทชีวิตจริงและเทคนิคสมัยใหม่`;
      objectives = [
        `เข้าใจหลักการพื้นฐานและบริบททางสุนทรียภาพของ ${topic} ได้อย่างถูกต้อง`,
        `สามารถทดลองและประยุกต์ใช้เทคนิคสร้างสรรค์ผลงานศิลปะในสไตล์เฉพาะตัว`,
        `แสดงออกทางความคิดริเริ่มและวิเคราะห์เชื่อมโยงคุณค่าของงานศิลปะสู่ชีวิตประจำวัน`
      ];
      theoryContent = `### สาระการเรียนรู้และแนวคิดสร้างสรรค์ (STEAM Art Focus)\n\nการศึกษาเรื่อง **${topic}** ไม่ได้จำกัดเพียงแค่การทำตามแบบแผน แต่เป็นการสำรวจความสัมพันธ์ระหว่างรูปทรง พื้นผิว และอารมณ์ความรู้สึก คุณครูควรส่งเสริมให้นักเรียนกล้าที่จะทดลองผสมผสานเทคนิค เช่น การใช้น้ำหนักเส้นแบบอิสระ การจับคู่สีตรงข้ามที่สร้างความตื่นตาตื่นใจ และการสังเกตแสงเงาจากธรรมชาติรอบตัว เพื่อให้ผลงานมีชีวิตชีวาและสื่อถึงเอกลักษณ์ของตนเอง`;
      activitySteps = [
        { step: 1, title: 'สำรวจและค้นหาแรงบันดาลใจ (Inspire & Explore)', detail: `ให้นักเรียนสังเกตวัตถุจริงหรือภาพตัวอย่างเรื่อง ${topic} สเก็ตช์ภาพร่างไอเดียอย่างรวดเร็ว (Thumbnails) 2-3 แบบ` },
        { step: 2, title: 'วางผังองค์ประกอบและโครงสร้าง (Composition Layout)', detail: `เลือกไอเดียที่ดีที่สุด ขยายลงบนกระดาษวาดเขียน กำหนดจุดเด่น (Focal Point) และจัดสมดุลซ้าย-ขวา` },
        { step: 3, title: 'ลงมือปฏิบัติการเชิงลึก (Creative Execution)', detail: `ประยุกต์ใช้เทคนิคเฉพาะของ ${topic} ค่อยๆ เพิ่มรายละเอียด น้ำหนัก และมิติให้ผลงานสมบูรณ์` },
        { step: 4, title: 'จัดแสดงผลงานและแลกเปลี่ยนมุมมอง (Gallery Walk)', detail: `ร่วมกันจัดนิทรรศการขนาดย่อมในห้องเรียน เพื่อชื่นชมและแลกเปลี่ยนข้อเสนอแนะเชิงบวก` }
      ];
      rubricCriteria = [
        { criteria: 'ความคิดริเริ่มสร้างสรรค์ (Creativity)', weight: '30%', description: 'มีความแปลกใหม่ โดดเด่น ไม่ลอกเลียนแบบใคร และกล้าทดลองเทคนิคใหม่' },
        { criteria: 'ทักษะการใช้เทคนิคและสื่อ (Technical Skill)', weight: '30%', description: 'ประยุกต์ใช้เทคนิคตามที่กำหนดได้อย่างชำนาญ แม่นยำ และประณีต' },
        { criteria: 'การจัดองค์ประกอบศิลป์ (Composition)', weight: '20%', description: 'จัดวางจุดเด่น ความสมดุล และจังหวะของภาพได้อย่างลงตัว' },
        { criteria: 'ความสมบูรณ์และความมุ่งมั่น (Dedication)', weight: '20%', description: 'ทำงานเสร็จตามเวลาที่กำหนด รักษาความสะอาด และมีความรับผิดชอบ' }
      ];
      reflectionQuestions = [
        `สิ่งที่ท้าทายที่สุดในการสร้างสรรค์ผลงานเกี่ยวกับ "${topic}" คืออะไร และนักเรียนแก้ปัญหานั้นอย่างไร?`,
        `หากมีเวลาเพิ่มเติม นักเรียนต้องการพัฒนาหรือต่อยอดผลงานชิ้นนี้ในมิติใดอีกบ้าง?`
      ];
    } else if (aiModel === 'claude') {
      // In-depth pedagogical & nuanced style
      description = `สื่อการเรียนรู้เชิงลึกที่สังเคราะห์โดย Claude 3.5 เน้นการลงมือปฏิบัติอย่างประณีต ความรู้ความเข้าใจแก่นแท้ทางศิลปะในเรื่อง ${topic} สำหรับ ${gradeLabel}`;
      objectives = [
        `อธิบายหลักทฤษฎี โครงสร้าง และมิติสุนทรียภาพของ ${topic} ได้อย่างลึกซึ้ง`,
        `ฝึกฝนทักษะการปฏิบัติงานศิลปะตามขั้นตอนอย่างเป็นลำดับและประณีตเรียบร้อย`,
        `ประเมินและสะท้อนคิด (Reflective Thinking) ถึงผลงานของตนเองและผู้อื่นอย่างสร้างสรรค์`
      ];
      theoryContent = `### สาระสำคัญเชิงทฤษฎีและสุนทรียศาสตร์ (Nuanced Art Pedagogy)\n\nในบริบทของ **${topic}** การเรียนรู้เริ่มต้นจากการรับรู้ (Perception) อย่างตั้งใจ ผ่านการมองเห็นคุณค่าในรายละเอียดเล็กๆ น้อยๆ ศิลปินผู้สร้างสรรค์จะต้องฝึกฝนการควบคุมน้ำหนักมือ การเลือกใช้จังหวะ และการถ่ายทอดอารมณ์ความรู้สึกผ่านสื่อที่เลือกใช้ การทำความเข้าใจมิตินี้จะช่วยให้นักเรียนพัฒนาฝีมือได้อย่างยั่งยืนและมีรสนิยมทางศิลปะที่ประณีต`;
      activitySteps = [
        { step: 1, title: 'เตรียมความพร้อมและวิเคราะห์ตัวอย่าง (Analytical Preparation)', detail: `วิเคราะห์โครงสร้างเส้น แสงเงา และสีจากผลงานระดับปรมาจารย์เรื่อง ${topic}` },
        { step: 2, title: 'ฝึกทักษะย่อยเพื่อความชำนาญ (Skill Drilling)', detail: `ทดลองฝึกร่างและลงน้ำหนักบนกระดาษทดลอง ก่อนลงมือในกระดาษจริง` },
        { step: 3, title: 'สร้างสรรค์ชิ้นงานหลักอย่างประณีต (Masterwork Creation)', detail: `นำทักษะที่ฝึกฝนมาสร้างสรรค์ชิ้นงานจริงอย่างมีสมาธิและใส่ใจในทุกรายละเอียด` },
        { step: 4, title: 'ประเมินและสะท้อนตนเอง (Self-Assessment & Reflection)', detail: `เขียนบันทึกความรู้สึก แนวคิด และการให้คะแนนผลงานตามเกณฑ์รูบริก` }
      ];
      rubricCriteria = [
        { criteria: 'ความถูกต้องตามหลักการศิลปะ', weight: '35%', description: 'เข้าใจและประยุกต์ใช้หลักการของหัวข้อได้อย่างถูกต้องตามทฤษฎี' },
        { criteria: 'ความประณีตและทักษะฝีมือ', weight: '35%', description: 'การควบคุมเส้น สี น้ำหนัก และความสะอาดเรียบร้อยของชิ้นงาน' },
        { criteria: 'การสื่อความหมายและอารมณ์', weight: '15%', description: 'ผลงานสามารถถ่ายทอดความรู้สึกและแนวคิดได้อย่างชัดเจน' },
        { criteria: 'การบันทึกการเรียนรู้และการสะท้อนคิด', weight: '15%', description: 'มีบันทึกสรุปและสะท้อนความเข้าใจในกระบวนการทำงานอย่างจริงใจ' }
      ];
      reflectionQuestions = [
        `อะไรคือจุดที่นักเรียนพึงพอใจมากที่สุดในกระบวนการสร้างสรรค์ชิ้นนี้?`,
        `เทคนิคหรือแนวคิดที่ได้เรียนรู้ สามารถนำไปปรับใช้กับการสร้างผลงานในชีวิตจริงได้อย่างไร?`
      ];
    } else if (aiModel === 'notebooklm') {
      // Study Guide / Synthesis Brief style
      description = `เอกสารสรุปบทเรียนและแนวทางการปฏิบัติงาน (Study Guide) โดย Google NotebookLM สรุปสาระสำคัญ คีย์เวิร์ด และขั้นตอนกระชับ เข้าใจง่าย ตรงประเด็นสำหรับ ${gradeLabel}`;
      objectives = [
        `สรุปใจความสำคัญและคีย์เวิร์ดหลักของ ${topic} ได้ครบถ้วน`,
        `ปฏิบัติตามแนวทางการทำงานแบบ Step-by-Step ได้อย่างถูกต้องและรวดเร็ว`,
        `ตอบคำถามทบทวนความรู้และประเมินผลสัมฤทธิ์ทางการเรียนได้ตามเป้าหมาย`
      ];
      theoryContent = `### สรุปสาระสำคัญ (Executive Study Guide by NotebookLM)\n\n- **หัวข้อหลัก:** ${topic}\n- **กลุ่มเป้าหมาย:** ${gradeLabel}\n- **แนวคิดสำคัญ (Key Takeaways):**\n  1. โครงสร้างและการจัดระเบียบองค์ประกอบภาพให้สมดุล\n  2. การควบคุมน้ำหนักและการใช้พื้นที่ว่าง (Positive & Negative Space)\n  3. การสื่อสารอารมณ์ผ่านสื่อศิลปะอย่างมีเป้าหมายชัดเจน\n\n*ข้อควรจำ:* หลีกเลี่ยงการลงน้ำหนักที่เข้มเกินไปในขั้นแรก ให้เริ่มจากร่างเบาๆ เสมอ`;
      activitySteps = [
        { step: 1, title: 'อ่านสรุปและเช็กความพร้อม (Read & Prep)', detail: `อ่านคีย์เวิร์ดและเตรียมอุปกรณ์ (ดินสอ, ยางลบ, ไม้บรรทัด, สี) ให้พร้อมบนโต๊ะทำงาน` },
        { step: 2, title: 'วางกรอบและร่างโครงสร้าง (Drafting)', detail: `วาดกรอบรูปและร่างเส้นเบาๆ ตามแนวทางเรื่อง ${topic}` },
        { step: 3, title: 'ลงน้ำหนักและเก็บรายละเอียด (Refining)', detail: `เน้นส่วนสำคัญและตัดเส้นหรือลงสีตามเกณฑ์ที่กำหนด` },
        { step: 4, title: 'ตรวจสอบความถูกต้องตามเกณฑ์ (Checklist Audit)', detail: `ตรวจเช็กความเรียบร้อยตามตาราง Checklist 4 ข้อก่อนส่งงาน` }
      ];
      rubricCriteria = [
        { criteria: 'ความถูกต้องตามสาระการเรียนรู้', weight: '40%', description: 'ผลงานตรงตามวัตถุประสงค์และข้อกำหนดครบทุกประการ' },
        { criteria: 'ความสมบูรณ์และเรียบร้อยของงาน', weight: '30%', description: 'งานเสร็จสิ้น สะอาด ไม่ยับ และมีรายละเอียดที่ประณีต' },
        { criteria: 'การตอบคำถามท้ายบทเรียน', weight: '30%', description: 'ตอบคำถามทบทวนความรู้ได้อย่างถูกต้องและครบถ้วน' }
      ];
      reflectionQuestions = [
        `สรุปใจความสำคัญของ "${topic}" ด้วยคำพูดของตนเองใน 1-2 ประโยค`,
        `ทริกหรือเคล็ดลับสำคัญที่ช่วยให้ผลงานชิ้นนี้สำเร็จคืออะไร?`
      ];
    } else {
      // Default: ChatGPT (GPT-4o) Balanced Standard
      description = `สื่อการสอนวิชาศิลปะที่จัดทำโดย ChatGPT (GPT-4o) ครอบคลุมจุดประสงค์ เนื้อหาทฤษฎี กิจกรรมฝึกปฏิบัติ และเกณฑ์ประเมินรูบริกสำหรับนักเรียน ${gradeLabel} โรงเรียนวชิรธรรมสาธิต`;
      objectives = [
        `นักเรียนมีความรู้ความเข้าใจในหลักการและทฤษฎีเรื่อง ${topic}`,
        `นักเรียนสามารถสร้างสรรค์ผลงานศิลปะโดยประยุกต์ใช้ความรู้เรื่อง ${topic} ได้อย่างมีประสิทธิภาพ`,
        `นักเรียนมีความตระหนักในคุณค่าความงามและมีความมุ่งมั่นในการปฏิบัติงานอย่างประณีต`
      ];
      theoryContent = `### สาระสำคัญ / องค์ความรู้ (Core Art Concept)\n\n**${topic}** เป็นหนึ่งในองค์ประกอบสำคัญของวิชาทัศนศิลป์ที่ช่วยพัฒนาการรับรู้ทางสายตาและการประสานสัมพันธ์ระหว่างมือกับความคิด การจัดวางจังหวะ การใช้น้ำหนักแสงเงา และการเลือกคู่สีที่เหมาะสม จะช่วยขับเน้นเรื่องราวและอารมณ์ความรู้สึกของชิ้นงานให้เด่นชัด นักเรียนจึงควรทำความเข้าใจพื้นฐานนี้เพื่อนำไปประยุกต์ใช้ในการสร้างสรรค์ผลงานในระดับที่สูงขึ้น`;
      activitySteps = [
        { step: 1, title: 'ขั้นนำเข้าสู่บทเรียนและการสังเกต', detail: `ครูอธิบายแนวคิดเรื่อง ${topic} พร้อมยกตัวอย่างชิ้นงานจริงเพื่อให้นักเรียนสังเกตและตั้งคำถาม` },
        { step: 2, title: 'ขั้นวางแผนและร่างภาพ', detail: `ให้นักเรียนร่างภาพร่างบนกระดาษ โดยคำนึงถึงขนาด สัดส่วน และองค์ประกอบศิลป์` },
        { step: 3, title: 'ขั้นปฏิบัติงานสร้างสรรค์', detail: `ลงมือระบายสีหรือใช้อุปกรณ์ตามเทคนิคที่กำหนด ตรวจสอบน้ำหนักแสงเงาและความคมชัด` },
        { step: 4, title: 'ขั้นสรุปและประเมินผล', detail: `ตรวจทานความเรียบร้อย ทำความสะอาดอุปกรณ์ และส่งผลงานเข้าสู่ระบบเพื่อรับการประเมิน` }
      ];
      rubricCriteria = [
        { criteria: 'ด้านความคิดสร้างสรรค์ (Creativity)', weight: '30%', description: 'แสดงออกถึงความคิดแปลกใหม่และการแก้ปัญหาได้อย่างน่าสนใจ' },
        { criteria: 'ด้านทักษะกระบวนการ (Process & Skills)', weight: '30%', description: 'ใช้อุปกรณ์และเทคนิคได้ถูกต้องตามหลักวิชาการ' },
        { criteria: 'ด้านความประณีตและความสมบูรณ์ (Refinement)', weight: '25%', description: 'ผลงานมีความประณีต เรียบร้อย และส่งตรงเวลา' },
        { criteria: 'ด้านเจตคติและการมีส่วนร่วม (Attitude)', weight: '15%', description: 'ตั้งใจปฏิบัติงาน ดูแลรักษาความสะอาด และปฏิบัติตามข้อตกลง' }
      ];
      reflectionQuestions = [
        `นักเรียนได้เรียนรู้สิ่งใหม่ใดบ้างจากการทำกิจกรรมเรื่อง "${topic}"?`,
        `หากเปรียบเทียบผลงานของตนเองกับเป้าหมายที่ตั้งไว้ นักเรียนคิดว่าจุดใดทำได้ดีที่สุด?`
      ];
    }

    // Suggested file name
    const cleanFileName = `wts_art_${sanitizedTitle.toLowerCase().replace(/\s+/g, '_')}_${grade}.pdf`;

    // Full Markdown Document content
    const contentMarkdown = `# โรงเรียนวชิรธรรมสาธิต (Wachiratham Sathit School)
## เอกสารประกอบการเรียนรู้และใบงานวิชาทัศนศิลป์ กลุ่มสาระการเรียนรู้ศิลปะ
### เรื่อง: ${sanitizedTitle} (${gradeLabel})

---

### 1. จุดประสงค์การเรียนรู้ (Learning Objectives)
${objectives.map((obj, i) => `${i + 1}. ${obj}`).join('\n')}

---

### 2. สาระสำคัญ / องค์ความรู้ (Core Knowledge)
${theoryContent}

---

### 3. ขั้นตอนและคำชี้แจงการปฏิบัติกิจกรรม (Step-by-Step Activities)
${activitySteps.map((s) => `**ขั้นตอนที่ ${s.step}: ${s.title}**\n${s.detail}`).join('\n\n')}

---

### 4. เกณฑ์การประเมินผลงาน (Assessment Rubric)
| เกณฑ์การประเมิน | น้ำหนักคะแนน | คำอธิบายระดับคุณภาพ |
| :--- | :---: | :--- |
${rubricCriteria.map((r) => `| ${r.criteria} | ${r.weight} | ${r.description} |`).join('\n')}

---

### 5. คำถามสะท้อนคิดหลังบทเรียน (Reflection)
${reflectionQuestions.map((q, i) => `${i + 1}. ${q}`).join('\n')}

*จัดทำและพัฒนาสื่อการเรียนรู้โดย: กลุ่มสาระการเรียนรู้ศิลปะ โรงเรียนวชิรธรรมสาธิต ด้วยระบบ AI Assistant (${personaName})*
`;

    const result: MaterialGenerationResult = {
      title: generatedTitle,
      topic: sanitizedTitle,
      category,
      grade,
      gradeLabel,
      description,
      objectives,
      theoryContent,
      activitySteps,
      rubricCriteria,
      reflectionQuestions,
      recommendedImageUrl: coverImage,
      suggestedFileName: cleanFileName,
      fileSize: '1.6 MB',
      fileUrl: 'https://pdfobject.com/pdf/sample.pdf',
      contentMarkdown,
      aiModel,
      aiPersonaName: personaName,
      generatedAt: new Date().toISOString()
    };

    return NextResponse.json({ success: true, material: result });

  } catch (error: any) {
    console.error('POST /api/admin/generate-material error:', error);
    return NextResponse.json({ error: error?.message || 'ไม่สามารถสร้างสื่อการสอนด้วย AI ได้' }, { status: 500 });
  }
}
