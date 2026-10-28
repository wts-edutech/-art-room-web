/**
 * Smart URL Converter & Media Detector for Art Room
 * Automatically transforms YouTube, Google Drive, Canva, and direct image links
 * into optimal embeddable and previewable formats.
 */

export interface SmartUrlAnalysis {
  type: "youtube" | "gdrive_pdf" | "gdrive_image" | "canva" | "direct_image" | "direct_pdf" | "unknown";
  label: string;
  badgeClass: string;
  iconType: "youtube" | "gdrive" | "canva" | "image" | "pdf" | "link";
  originalUrl: string;
  transformedUrl: string;
  previewUrl: string;
  imageUrl?: string;
  videoId?: string;
  suggestedMediaType: "video" | "pdf" | "canva" | "image";
  suggestedCategory?: string;
  suggestedFileName?: string;
  suggestedFileSize?: string;
  message: string;
}

/**
 * Extracts Google Drive ID from various formats
 */
export function extractDriveFileId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  // 1. /file/d/FILE_ID
  const matchFileD = url.match(/\/file\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchFileD && matchFileD[1]) return matchFileD[1];

  // 2. /document/d/FILE_ID, /presentation/d/FILE_ID, /spreadsheets/d/FILE_ID
  const matchDocsD = url.match(/\/(?:document|presentation|spreadsheets)\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchDocsD && matchDocsD[1]) return matchDocsD[1];

  // 3. ?id=FILE_ID or &id=FILE_ID
  const matchIdParam = url.match(/[?&]id=([a-zA-Z0-9_-]+)/i);
  if (matchIdParam && matchIdParam[1]) return matchIdParam[1];

  // 4. /d/FILE_ID
  const matchD = url.match(/\/d\/([a-zA-Z0-9_-]+)/i);
  if (matchD && matchD[1]) return matchD[1];

  return null;
}

/**
 * Extracts YouTube Video ID
 */
export function extractYouTubeVideoId(url: string): string | null {
  if (!url || typeof url !== "string") return null;

  const clean = url.trim();

  // Standard watch: youtube.com/watch?v=ID
  const matchWatch = clean.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/|youtube\.com\/shorts\/)([^"&?\/\s]{11})/i);
  if (matchWatch && matchWatch[1]) return matchWatch[1];

  // Raw 11-char ID
  if (/^[a-zA-Z0-9_-]{11}$/.test(clean)) return clean;

  return null;
}

/**
 * Main URL Analyzer and Smart Auto-Transform
 */
export function analyzeAndTransformUrl(rawUrl: string, currentTitle: string = ""): SmartUrlAnalysis {
  const url = (rawUrl || "").trim();

  if (!url) {
    return {
      type: "unknown",
      label: "ยังไม่ได้ระบุลิงก์",
      badgeClass: "bg-gray-100 text-gray-600 border-gray-200",
      iconType: "link",
      originalUrl: "",
      transformedUrl: "",
      previewUrl: "",
      suggestedMediaType: "pdf",
      message: "สามารถวางลิงก์ YouTube, Google Drive, รูปภาพ หรือลิงก์ Canva ได้ทันที ระบบจะแปลงให้อัตโนมัติ",
    };
  }

  // 1. Check YouTube
  const ytId = extractYouTubeVideoId(url);
  if (ytId) {
    const embedUrl = `https://www.youtube.com/embed/${ytId}`;
    const thumbUrl = `https://img.youtube.com/vi/${ytId}/hqdefault.jpg`;
    return {
      type: "youtube",
      label: "วิดีโอ YouTube",
      badgeClass: "bg-red-50 text-red-700 border-red-200",
      iconType: "youtube",
      originalUrl: url,
      transformedUrl: embedUrl,
      previewUrl: embedUrl,
      imageUrl: thumbUrl,
      videoId: ytId,
      suggestedMediaType: "video",
      suggestedCategory: "สื่อวิดีทัศน์",
      suggestedFileName: `${currentTitle || `youtube_lesson_${ytId}`}.mp4`,
      suggestedFileSize: "YouTube Video",
      message: "แปลงเป็นรูปแบบ /embed สำหรับเล่นในระบบเรียบร้อย พร้อมดึงภาพปกอัตโนมัติ",
    };
  }

  // 2. Check Canva (แคนวา)
  if (url.includes("canva.com")) {
    // Check if it's a presentation or design
    // Canva embed format: https://www.canva.com/design/DAG.../.../view?embed
    let canvaEmbed = url;
    if (url.includes("/edit")) {
      canvaEmbed = url.replace(/\/edit(\?.*)?$/, "/view?embed");
    } else if (url.includes("/watch")) {
      canvaEmbed = url.replace(/\/watch(\?.*)?$/, "/view?embed");
    } else if (url.includes("/view") && !url.includes("embed")) {
      canvaEmbed = url.includes("?") ? `${url.split("?")[0]}?embed` : `${url}?embed`;
    } else if (!url.includes("embed")) {
      canvaEmbed = `${url}${url.includes("?") ? "&" : "?"}embed`;
    }

    return {
      type: "canva",
      label: "สไลด์สื่อการสอน Canva",
      badgeClass: "bg-purple-50 text-purple-700 border-purple-200",
      iconType: "canva",
      originalUrl: url,
      transformedUrl: canvaEmbed,
      previewUrl: canvaEmbed,
      suggestedMediaType: "canva",
      suggestedCategory: "สไลด์สื่อการสอน (Canva/PPT)",
      suggestedFileName: `${currentTitle || "canva_presentation"}.canva`,
      suggestedFileSize: "Canva Slides",
      message: "แปลงเป็นรูปแบบ Canva Embed สำหรับเปิดสไลด์บนหน้าเว็บได้ทันที",
    };
  }

  // 3. Check Google Drive / Google Docs / Google Slides
  const driveId = extractDriveFileId(url);
  if (driveId) {
    // Check if user specifically linked an image (or query param/filename contains image extension)
    const isImageHint = /\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url) || url.includes("image") || url.includes("photo");

    if (isImageHint) {
      const directImgUrl = `https://lh3.googleusercontent.com/d/${driveId}`;
      const thumbUrl = `https://lh3.googleusercontent.com/d/${driveId}=w800`;
      return {
        type: "gdrive_image",
        label: "รูปภาพ Google Drive",
        badgeClass: "bg-amber-50 text-amber-700 border-amber-200",
        iconType: "image",
        originalUrl: url,
        transformedUrl: directImgUrl,
        previewUrl: thumbUrl,
        imageUrl: thumbUrl,
        suggestedMediaType: "image",
        suggestedCategory: "สื่อภาพและเทคนิค",
        suggestedFileName: `${currentTitle || `drive_image_${driveId}`}.jpg`,
        suggestedFileSize: "Image",
        message: "แปลงเป็นลิงก์ภาพตรงความเร็วสูงผ่าน Edge CDN (lh3.googleusercontent.com)",
      };
    }

    // Google Document / Slides / Spreadsheets / PDF
    let previewUrl = `https://drive.google.com/file/d/${driveId}/preview`;
    if (url.includes("docs.google.com/document")) {
      previewUrl = `https://docs.google.com/document/d/${driveId}/preview`;
    } else if (url.includes("docs.google.com/presentation")) {
      previewUrl = `https://docs.google.com/presentation/d/${driveId}/preview`;
    }

    // Google Drive provides a thumbnail endpoint for any document!
    const docThumb = `https://lh3.googleusercontent.com/d/${driveId}=w800`;

    return {
      type: "gdrive_pdf",
      label: "เอกสาร / ใบงาน Google Drive",
      badgeClass: "bg-emerald-50 text-emerald-700 border-emerald-200",
      iconType: "gdrive",
      originalUrl: url,
      transformedUrl: previewUrl,
      previewUrl: previewUrl,
      imageUrl: docThumb,
      suggestedMediaType: "pdf",
      suggestedCategory: "ใบงานและแบบฝึกหัด",
      suggestedFileName: `${currentTitle || `worksheet_${driveId}`}.pdf`,
      suggestedFileSize: "1.5 MB",
      message: "แปลงเป็นรูปแบบ /preview ป้องกันหน้าจอสีขาว พร้อมเปิดดูเอกสารได้ทันที",
    };
  }

  // 4. Check Direct Image URL
  if (/\.(jpg|jpeg|png|webp|gif|svg)($|\?)/i.test(url)) {
    return {
      type: "direct_image",
      label: "ไฟล์รูปภาพตรง (Image)",
      badgeClass: "bg-blue-50 text-blue-700 border-blue-200",
      iconType: "image",
      originalUrl: url,
      transformedUrl: url,
      previewUrl: url,
      imageUrl: url,
      suggestedMediaType: "image",
      suggestedCategory: "สื่อภาพและเทคนิค",
      suggestedFileName: `${currentTitle || "artwork_image"}.jpg`,
      suggestedFileSize: "1.0 MB",
      message: "ตรวจพบไฟล์รูปภาพตรง พร้อมแสดงผลในแกลเลอรีและคลังสื่อ",
    };
  }

  // 5. Check Direct PDF URL
  if (/\.pdf($|\?)/i.test(url)) {
    return {
      type: "direct_pdf",
      label: "ไฟล์เอกสาร PDF ตรง",
      badgeClass: "bg-rose-50 text-rose-700 border-rose-200",
      iconType: "pdf",
      originalUrl: url,
      transformedUrl: url,
      previewUrl: url,
      suggestedMediaType: "pdf",
      suggestedCategory: "ใบงานและแบบฝึกหัด",
      suggestedFileName: `${currentTitle || "document"}.pdf`,
      suggestedFileSize: "1.5 MB",
      message: "ตรวจพบไฟล์เอกสาร PDF พร้อมระบบดาวน์โหลดและดูตัวอย่าง",
    };
  }

  // 6. Generic or Unknown Link
  return {
    type: "unknown",
    label: "ลิงก์เว็บทั่วไป",
    badgeClass: "bg-slate-50 text-slate-700 border-slate-200",
    iconType: "link",
    originalUrl: url,
    transformedUrl: url,
    previewUrl: url,
    suggestedMediaType: "pdf",
    message: "ลิงก์ภายนอกทั่วไป สามารถเปิดดูและดาวน์โหลดได้ตามปกติ",
  };
}
