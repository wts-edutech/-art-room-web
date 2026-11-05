// src/lib/gamification.ts
// ระบบเหรียญสะสมศิลป์ (Art Coins), ฉายาศิลปิน (Artist Ranks) และ Art Toy Companion
// ปรับแต่งตามโครงสร้างหลักสูตร 1 เทอม (10 - 15 กิจกรรม / ~1,500 - 2,000 Coins)

export interface ArtToyStage {
  level: number;
  name: string;
  minCoins: number;
  image: string;
  description: string;
  badge: string;
  color: string;
  glowEffect?: boolean;
}

export interface ArtToySeries {
  id: "red" | "blue" | "black";
  name: string;
  theme: string;
  accentColor: string;
  stages: ArtToyStage[];
}

export const ART_TOY_SERIES: Record<string, ArtToySeries> = {
  red: {
    id: "red",
    name: "Red Fox Art Toy (จิ้งจอกเพลิงศิลป์)",
    theme: "จากเปลวไฟแห่งแรงบันดาลใจ สู่ผลงานที่ร้อนแรงและมีชีวิตชีวา",
    accentColor: "from-rose-500 to-orange-500",
    stages: [
      {
        level: 0,
        name: "ไข่ศิลปินฝึกหัด (Art Egg)",
        minCoins: 0,
        image: "/arttoy/egg.jpg",
        description: "ไข่ปริศนาที่กำลังบ่มเพาะพลังจินตนาการและความคิดสร้างสรรค์",
        badge: "🥚 กำเนิดไอเดีย",
        color: "text-amber-800 bg-amber-50 border-amber-200",
      },
      {
        level: 1,
        name: "จิ้งจอกฝึกหัด (Little Spark)",
        minCoins: 120, // สัปดาห์ที่ 1 - 2 (ส่งงาน 1 ชิ้นแรก)
        image: "/arttoy/red-1.jpg",
        description: "เริ่มก้าวแรกในการวาดเส้น มีประกายไฟแห่งความมุ่งมั่นลุกโชน",
        badge: "🔥 สปาร์กแรก (งานที่ 1-2)",
        color: "text-orange-800 bg-orange-50 border-orange-200",
      },
      {
        level: 2,
        name: "จิ้งจอกปัดแปรง (Brush Flame)",
        minCoins: 450, // สัปดาห์ที่ 4 - 5 (ส่งงาน 4 ชิ้น)
        image: "/arttoy/red-2.jpg",
        description: "ผสมสีและควบคุมปลายพู่กันได้อย่างคล่องแคล่วเปี่ยมพลัง",
        badge: "🎨 ช่างฝีมือเปลวเพลิง (งานที่ 4-5)",
        color: "text-rose-800 bg-rose-50 border-rose-200",
      },
      {
        level: 3,
        name: "จิ้งจอกคัลเลอร์ฟูล (Flare Master)",
        minCoins: 900, // สัปดาห์ที่ 8 - 9 (ช่วงกลางภาค ส่งงาน 8 ชิ้น)
        image: "/arttoy/red-3.jpg",
        description: "สร้างสรรค์ผลงานที่สะกดทุกสายตา เส้นสายและโทนสีมีเอกลักษณ์",
        badge: "✨ จิตรกรเพลิงเอก (กลางภาค)",
        color: "text-pink-800 bg-pink-50 border-pink-200",
      },
      {
        level: 4,
        name: "จิ้งจอกสุริยันมาสเตอร์ (Solar Deity)",
        minCoins: 1500, // สัปดาห์ที่ 13 - 15 (ปลายเทอม ส่งงาน 12 - 15 ชิ้น)
        image: "/arttoy/red-4.jpg",
        description: "ร่างสูงสุดแห่งแรงบันดาลใจ ผลงานเปล่งประกายดุจดวงอาทิตย์ จบหลักสูตรอย่างสมบูรณ์แบบ!",
        badge: "👑 มาสเตอร์ห้องศิลป์ (ปลายเทอม)",
        color: "text-amber-900 bg-gradient-to-r from-amber-100 to-orange-100 border-amber-300",
        glowEffect: true,
      },
    ],
  },
  blue: {
    id: "blue",
    name: "Blue Spirit (วิญญาณแห่งสีน้ำเงิน)",
    theme: "ความสงบ สมาธิ และความลุ่มลึกแห่งงานจิตรกรรม",
    accentColor: "from-blue-500 to-indigo-600",
    stages: [
      {
        level: 0,
        name: "ไข่ศิลปินฝึกหัด (Art Egg)",
        minCoins: 0,
        image: "/arttoy/egg.jpg",
        description: "ไข่ปริศนาที่กำลังบ่มเพาะพลังจินตนาการ",
        badge: "🥚 กำเนิดไอเดีย",
        color: "text-sky-800 bg-sky-50 border-sky-200",
      },
      {
        level: 1,
        name: "ภูตพรายสีฟ้า (Cyan Breeze)",
        minCoins: 350,
        image: "/arttoy/blue-1.jpg",
        description: "สมาธินิ่งสงบ เส้นสายลื่นไหลไร้ขอบเขต",
        badge: "🌊 กระแสลมศิลป์",
        color: "text-cyan-800 bg-cyan-50 border-cyan-200",
      },
      {
        level: 2,
        name: "นักรบคลื่นคราม (Deep Ocean Master)",
        minCoins: 1000,
        image: "/arttoy/blue-2.jpg",
        description: "ลึกซึ้งในหลักการจัดองค์ประกอบและแสงเงาเหนือระดับ",
        badge: "💎 ปรมาจารย์คลื่นสี",
        color: "text-blue-900 bg-blue-100 border-blue-300",
        glowEffect: true,
      },
    ],
  },
  black: {
    id: "black",
    name: "Shadow Obsidian (ออบซิเดียนเงามายา)",
    theme: "พลังแห่งความลึกลับ เส้นหมึก และจินตนาการไร้ที่สิ้นสุด",
    accentColor: "from-zinc-700 to-neutral-900",
    stages: [
      {
        level: 0,
        name: "ไข่ศิลปินฝึกหัด (Art Egg)",
        minCoins: 0,
        image: "/arttoy/egg.jpg",
        description: "ไข่หินโบราณที่รอการตื่นขึ้น",
        badge: "🥚 กำเนิดไอเดีย",
        color: "text-zinc-800 bg-zinc-100 border-zinc-200",
      },
      {
        level: 1,
        name: "เงาหมึกสเก็ตช์ (Ink Shadow)",
        minCoins: 120,
        image: "/arttoy/black-1.jpg",
        description: "เริ่มควบคุมเส้นหมึกดำและน้ำหนักขาว-ดำได้อย่างเฉียบคม",
        badge: "✒️ ลายเส้นหมึกดำ",
        color: "text-zinc-800 bg-zinc-100 border-zinc-300",
      },
      {
        level: 2,
        name: "ภูตหมึกรัตติกาล (Midnight Phantom)",
        minCoins: 450,
        image: "/arttoy/black-2.jpg",
        description: "ความมืดมิดสะท้อนแสงเงาที่ตัดกันอย่างทรงพลัง",
        badge: "🌙 เงารัตติกาล",
        color: "text-purple-900 bg-purple-50 border-purple-200",
      },
      {
        level: 3,
        name: "อัศวินหมึกดำ (Void Knight)",
        minCoins: 900,
        image: "/arttoy/black-3.jpg",
        description: "สร้างมิติและแรงดึงดูดที่ไม่เหมือนใครในโลกศิลปะ",
        badge: "⚡ จอมขมังเวทย์แห่งเส้น",
        color: "text-slate-900 bg-slate-100 border-slate-300",
      },
      {
        level: 4,
        name: "ออบซิเดียนมาสเตอร์ (Obsidian Legend)",
        minCoins: 1500,
        image: "/arttoy/black-4.jpg",
        description: "ตำนานแห่งห้องศิลป์ผู้พิชิตทุกโจทย์และปลดปล่อยจินตนาการสูงสุด",
        badge: "👑 ราชาแห่งเงามืด",
        color: "text-black bg-gradient-to-r from-zinc-200 to-neutral-300 border-zinc-400",
        glowEffect: true,
      },
    ],
  },
};

export interface GamificationStats {
  totalCoins: number;
  quizCoins: number;
  artworkCoins: number;
  rankTitle: string;
  rankIcon: string;
  rankColor: string;
  currentToy: ArtToyStage;
  nextToy: ArtToyStage | null;
  currentSeries: ArtToySeries;
  progressPercentToNext: number;
  coinsNeededForNext: number;
  unlockedAllStages: boolean;
  canHatchNewSeries: boolean;
}

export function calculateGamification(
  submissions: any[] = [],
  activeQuizzes: any[] = [],
  preferredSeriesId: string = "red"
): GamificationStats {
  let quizCoins = 0;
  activeQuizzes.forEach((q) => {
    if (q.attempt) {
      const qScore = Number(q.attempt.score) || 0;
      const qTotal = Number(q.attempt.totalQuestions) || 20;
      quizCoins += qScore * 10;
      if (qScore === qTotal && qTotal > 0) {
        quizCoins += 50; // โบนัสคะแนนเต็ม
      }
    }
  });

  let artworkCoins = 0;
  submissions.forEach((s) => {
    if (s.score !== null && s.score !== undefined) {
      artworkCoins += Math.round(Number(s.score) * 10);
      if (!s.isLate) {
        artworkCoins += 20; // ส่งตรงเวลา +20
      }
    }
  });

  const totalCoins = quizCoins + artworkCoins;

  // ปรับบันไดยศตาม 1 เทอม (10 - 15 งาน)
  let rankTitle = "ศิลปินฝึกหัด";
  let rankIcon = "🥉";
  let rankColor = "text-amber-800 bg-amber-50 border-amber-200";

  if (totalCoins >= 1500) {
    rankTitle = "มาสเตอร์ห้องศิลป์ระดับตำนาน";
    rankIcon = "💎";
    rankColor = "text-cyan-900 bg-cyan-100 border-cyan-300 shadow-xs";
  } else if (totalCoins >= 900) {
    rankTitle = "จิตรกรเอกแห่งห้องศิลป์";
    rankIcon = "🥇";
    rankColor = "text-amber-900 bg-amber-100 border-amber-300";
  } else if (totalCoins >= 450) {
    rankTitle = "นักผสมสีผู้ชำนาญ";
    rankIcon = "🥈";
    rankColor = "text-slate-800 bg-slate-100 border-slate-300";
  } else if (totalCoins >= 120) {
    rankTitle = "จิตรกรนักสเก็ตช์";
    rankIcon = "✏️";
    rankColor = "text-orange-800 bg-orange-50 border-orange-200";
  }

  // Selected series
  const series = ART_TOY_SERIES[preferredSeriesId] || ART_TOY_SERIES.red;
  const stages = series.stages;

  let currentToy = stages[0];
  let nextToy: ArtToyStage | null = stages[1] || null;

  for (let i = stages.length - 1; i >= 0; i--) {
    if (totalCoins >= stages[i].minCoins) {
      currentToy = stages[i];
      nextToy = stages[i + 1] || null;
      break;
    }
  }

  let progressPercentToNext = 100;
  let coinsNeededForNext = 0;

  if (nextToy) {
    const range = nextToy.minCoins - currentToy.minCoins;
    const gainedInRange = totalCoins - currentToy.minCoins;
    progressPercentToNext = Math.min(100, Math.max(0, Math.round((gainedInRange / range) * 100)));
    coinsNeededForNext = Math.max(0, nextToy.minCoins - totalCoins);
  }

  const unlockedAllStages = !nextToy;
  const canHatchNewSeries = totalCoins >= 900; // เมื่อสะสมได้ 900 เหรียญขึ้นไป สามารถสลับไปเลี้ยงซีรีส์อื่นคู่กันได้

  return {
    totalCoins,
    quizCoins,
    artworkCoins,
    rankTitle,
    rankIcon,
    rankColor,
    currentToy,
    nextToy,
    currentSeries: series,
    progressPercentToNext,
    coinsNeededForNext,
    unlockedAllStages,
    canHatchNewSeries,
  };
}
