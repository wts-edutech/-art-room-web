import { getRequestContext } from '@cloudflare/next-on-pages';

export interface EmailNotificationRecord {
  id: string;
  type: 'assignment_submission' | 'quiz_completion' | 'system_test';
  recipient: string;
  subject: string;
  summary: string;
  studentName?: string;
  studentId?: string;
  classroom?: string;
  itemTitle?: string;
  scoreInfo?: string;
  status: 'sent' | 'simulated' | 'failed';
  error?: string;
  timestamp: string;
  htmlContent?: string;
}

export interface NotificationSettings {
  teacherEmail: string;
  isEmailEnabled: boolean;
  notifyOnAssignment: boolean;
  notifyOnQuiz: boolean;
  provider: 'auto' | 'resend' | 'webhook' | 'simulation';
  resendApiKey?: string;
  webhookUrl?: string;
  updatedAt: string;
}

const DEFAULT_SETTINGS: NotificationSettings = {
  teacherEmail: process.env.TEACHER_NOTIFICATION_EMAIL || 'krukae.art@wts.ac.th',
  isEmailEnabled: true,
  notifyOnAssignment: true,
  notifyOnQuiz: true,
  provider: 'auto',
  updatedAt: new Date().toISOString(),
};

// In-memory fallback for outbox log and settings
let memorySettings: NotificationSettings = { ...DEFAULT_SETTINGS };
let memoryLogs: EmailNotificationRecord[] = [];

async function getD1() {
  try {
    const ctx = getRequestContext();
    return ctx?.env?.DB || null;
  } catch {
    return null;
  }
}

async function ensureNotificationTables(d1: any) {
  if (!d1) return;
  try {
    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS site_settings (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();

    await d1.prepare(`
      CREATE TABLE IF NOT EXISTS email_notification_logs (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        recipient TEXT NOT NULL,
        subject TEXT NOT NULL,
        summary TEXT,
        student_name TEXT,
        student_id TEXT,
        classroom TEXT,
        item_title TEXT,
        score_info TEXT,
        status TEXT NOT NULL,
        error TEXT,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      )
    `).run();
  } catch (err) {
    console.warn("ensureNotificationTables note:", err);
  }
}

export async function getNotificationSettings(): Promise<NotificationSettings> {
  try {
    const d1 = await getD1();
    if (d1) {
      await ensureNotificationTables(d1);
      const stmt = d1.prepare(`SELECT value FROM site_settings WHERE key = 'notification_settings'`);
      const row: any = typeof stmt.first === 'function' ? await stmt.first() : (await stmt.all?.())?.results?.[0];
      if (row?.value) {
        try {
          const parsed = JSON.parse(row.value);
          memorySettings = { ...DEFAULT_SETTINGS, ...parsed };
          return memorySettings;
        } catch {}
      }
    }
    return memorySettings;
  } catch {
    return memorySettings;
  }
}

export async function saveNotificationSettings(newSettings: Partial<NotificationSettings>): Promise<NotificationSettings> {
  const current = await getNotificationSettings();
  const updated: NotificationSettings = {
    ...current,
    ...newSettings,
    updatedAt: new Date().toISOString(),
  };

  memorySettings = updated;

  try {
    const d1 = await getD1();
    if (d1) {
      await ensureNotificationTables(d1);
      await d1.prepare(`
        INSERT INTO site_settings (key, value, updated_at)
        VALUES ('notification_settings', ?, ?)
        ON CONFLICT(key) DO UPDATE SET value = excluded.value, updated_at = excluded.updated_at
      `).bind(JSON.stringify(updated), updated.updatedAt).run();
    }
  } catch (err) {
    console.error("Failed to persist notification settings:", err);
  }

  return updated;
}

export async function getNotificationLogs(limit: number = 50): Promise<EmailNotificationRecord[]> {
  try {
    const d1 = await getD1();
    if (d1) {
      await ensureNotificationTables(d1);
      const stmt = d1.prepare(`
        SELECT id, type, recipient, subject, summary, student_name as studentName, 
               student_id as studentId, classroom, item_title as itemTitle, 
               score_info as scoreInfo, status, error, created_at as timestamp
        FROM email_notification_logs
        ORDER BY created_at DESC
        LIMIT ?
      `);
      const results: any = typeof stmt.bind === 'function' 
        ? (await stmt.bind(limit).all?.())?.results 
        : [];
      if (Array.isArray(results) && results.length > 0) {
        return results;
      }
    }
    return memoryLogs.slice(0, limit);
  } catch {
    return memoryLogs.slice(0, limit);
  }
}

async function recordNotificationLog(record: EmailNotificationRecord) {
  memoryLogs.unshift(record);
  if (memoryLogs.length > 100) memoryLogs.pop();

  try {
    const d1 = await getD1();
    if (d1) {
      await ensureNotificationTables(d1);
      await d1.prepare(`
        INSERT INTO email_notification_logs (
          id, type, recipient, subject, summary, student_name, student_id, classroom, item_title, score_info, status, error, created_at
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `).bind(
        record.id,
        record.type,
        record.recipient,
        record.subject,
        record.summary || '',
        record.studentName || '',
        record.studentId || '',
        record.classroom || '',
        record.itemTitle || '',
        record.scoreInfo || '',
        record.status,
        record.error || '',
        record.timestamp
      ).run();
    }
  } catch (err) {
    console.warn("Could not save email notification log to D1:", err);
  }
}

/**
 * Dispatches an email via Resend API, Webhook, or logs to In-App Outbox.
 */
async function dispatchEmail(params: {
  to: string;
  subject: string;
  html: string;
  summary: string;
  type: EmailNotificationRecord['type'];
  studentName?: string;
  studentId?: string;
  classroom?: string;
  itemTitle?: string;
  scoreInfo?: string;
}): Promise<{ success: boolean; mode: 'resend' | 'webhook' | 'simulated'; error?: string }> {
  const settings = await getNotificationSettings();
  const resendApiKey = settings.resendApiKey || process.env.RESEND_API_KEY;
  const webhookUrl = settings.webhookUrl || process.env.EMAIL_WEBHOOK_URL;

  const logRecord: EmailNotificationRecord = {
    id: `notif_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
    type: params.type,
    recipient: params.to,
    subject: params.subject,
    summary: params.summary,
    studentName: params.studentName,
    studentId: params.studentId,
    classroom: params.classroom,
    itemTitle: params.itemTitle,
    scoreInfo: params.scoreInfo,
    status: 'sent',
    timestamp: new Date().toISOString(),
    htmlContent: params.html,
  };

  // 1. Try Resend API if key is available
  if (resendApiKey && (settings.provider === 'auto' || settings.provider === 'resend')) {
    try {
      const res = await fetch('https://api.resend.com/emails', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${resendApiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          from: 'ART ROOM WTS <notifications@resend.dev>',
          to: [params.to],
          subject: params.subject,
          html: params.html,
        }),
      });

      if (res.ok) {
        logRecord.status = 'sent';
        await recordNotificationLog(logRecord);
        return { success: true, mode: 'resend' };
      } else {
        const errText = await res.text();
        console.warn("Resend email dispatch error:", errText);
        logRecord.error = `Resend error: ${errText.substring(0, 100)}`;
      }
    } catch (e: any) {
      console.warn("Resend API connection failed:", e);
      logRecord.error = e?.message || 'Network error connecting to Resend';
    }
  }

  // 2. Try Webhook if URL is available
  if (webhookUrl && (settings.provider === 'auto' || settings.provider === 'webhook')) {
    try {
      const res = await fetch(webhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: params.to,
          subject: params.subject,
          html: params.html,
          summary: params.summary,
          type: params.type,
          studentName: params.studentName,
          studentId: params.studentId,
          classroom: params.classroom,
          itemTitle: params.itemTitle,
          scoreInfo: params.scoreInfo,
          timestamp: logRecord.timestamp,
        }),
      });

      if (res.ok) {
        logRecord.status = 'sent';
        await recordNotificationLog(logRecord);
        return { success: true, mode: 'webhook' };
      } else {
        const errText = await res.text();
        console.warn("Webhook dispatch error:", errText);
        logRecord.error = `Webhook error: ${errText.substring(0, 100)}`;
      }
    } catch (e: any) {
      console.warn("Webhook connection failed:", e);
      logRecord.error = e?.message || 'Network error connecting to Webhook';
    }
  }

  // 3. Fallback: In-App Outbox Notification (Always captures notification without failing)
  logRecord.status = 'simulated';
  await recordNotificationLog(logRecord);
  return { success: true, mode: 'simulated' };
}

/**
 * Creates luxury responsive HTML email template for ART ROOM.
 */
function buildArtRoomEmailHtml(options: {
  titleBadge: string;
  badgeColor: string;
  headline: string;
  studentName: string;
  studentId: string;
  classroom: string;
  itemTitle: string;
  itemType: string;
  scoreOrStatus: string;
  submittedAtThai: string;
  conceptOrNotes?: string;
  hasAttachment?: boolean;
  ctaUrl: string;
}): string {
  return `
<!DOCTYPE html>
<html lang="th">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${options.headline}</title>
  <style>
    body { font-family: 'Prompt', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 0; background-color: #f8fafc; color: #1e293b; }
    .container { max-width: 600px; margin: 24px auto; background: #ffffff; border-radius: 20px; overflow: hidden; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.05), 0 8px 10px -6px rgba(0, 0, 0, 0.01); border: 1px solid #e2e8f0; }
    .header { background: linear-gradient(135deg, #ea580c 0%, #f59e0b 50%, #d97706 100%); padding: 32px 28px; text-align: center; color: #ffffff; }
    .header-logo { font-size: 28px; margin-bottom: 8px; }
    .header-title { font-size: 22px; font-weight: 800; letter-spacing: -0.5px; margin: 0; }
    .header-sub { font-size: 13px; opacity: 0.92; margin-top: 4px; font-weight: 500; }
    .badge { display: inline-block; padding: 4px 14px; border-radius: 9999px; font-size: 11px; font-weight: 700; text-transform: uppercase; letter-spacing: 0.5px; margin-bottom: 12px; background: rgba(255, 255, 255, 0.22); color: #ffffff; border: 1px solid rgba(255, 255, 255, 0.4); }
    .content { padding: 32px 28px; }
    .alert-card { background: #fff7ed; border-left: 4px solid #ea580c; border-radius: 12px; padding: 16px 20px; margin-bottom: 24px; }
    .alert-card h3 { margin: 0 0 6px 0; color: #9a3412; font-size: 16px; font-weight: 700; }
    .alert-card p { margin: 0; color: #c2410c; font-size: 13px; }
    .table-details { width: 100%; border-collapse: separate; border-spacing: 0; border: 1px solid #e2e8f0; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
    .table-details td { padding: 12px 16px; font-size: 13px; border-bottom: 1px solid #f1f5f9; }
    .table-details tr:last-child td { border-bottom: none; }
    .td-label { width: 34%; font-weight: 600; color: #64748b; background-color: #f8fafc; }
    .td-value { font-weight: 700; color: #0f172a; }
    .cta-container { text-align: center; margin: 32px 0 16px 0; }
    .btn-cta { display: inline-block; background: linear-gradient(135deg, #ea580c 0%, #f97316 100%); color: #ffffff !important; text-decoration: none; padding: 14px 32px; border-radius: 14px; font-size: 15px; font-weight: 700; box-shadow: 0 4px 14px rgba(234, 88, 12, 0.35); }
    .footer { background: #f1f5f9; padding: 20px 28px; text-align: center; font-size: 12px; color: #64748b; border-top: 1px solid #e2e8f0; }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <div class="badge">${options.titleBadge}</div>
      <div class="header-logo">🎨</div>
      <h1 class="header-title">ART ROOM SYSTEM</h1>
      <div class="header-sub">กลุ่มสาระการเรียนรู้ศิลปะ • โรงเรียนวชิรธรรมสาธิต</div>
    </div>
    <div class="content">
      <div class="alert-card">
        <h3>${options.headline}</h3>
        <p>มีรายการข้อมูลส่งเข้ามาใหม่ในระบบหลังบ้าน กรุณาตรวจสอบรายละเอียดด้านล่าง</p>
      </div>

      <table class="table-details">
        <tr>
          <td class="td-label">ชื่อ - นามสกุล</td>
          <td class="td-value">${options.studentName}</td>
        </tr>
        <tr>
          <td class="td-label">รหัสนักเรียน</td>
          <td class="td-value">${options.studentId}</td>
        </tr>
        <tr>
          <td class="td-label">ระดับชั้น / ห้อง</td>
          <td class="td-value">${options.classroom}</td>
        </tr>
        <tr>
          <td class="td-label">ประเภทรายการ</td>
          <td class="td-value">${options.itemType}</td>
        </tr>
        <tr>
          <td class="td-label">หัวข้องาน / แบบทดสอบ</td>
          <td class="td-value">${options.itemTitle}</td>
        </tr>
        <tr>
          <td class="td-label">ผลคะแนน / สถานะ</td>
          <td class="td-value" style="color: #ea580c;">${options.scoreOrStatus}</td>
        </tr>
        <tr>
          <td class="td-label">วันเวลาที่ส่ง</td>
          <td class="td-value">${options.submittedAtThai}</td>
        </tr>
        ${options.conceptOrNotes ? `
        <tr>
          <td class="td-label">แนวคิด / คำอธิบาย</td>
          <td class="td-value" style="font-weight: normal; color: #334155;">${options.conceptOrNotes}</td>
        </tr>
        ` : ''}
        ${options.hasAttachment ? `
        <tr>
          <td class="td-label">ไฟล์ผลงาน</td>
          <td class="td-value" style="color: #059669;">✓ แนบไฟล์/ภาพผลงานเรียบร้อย</td>
        </tr>
        ` : ''}
      </table>

      <div class="cta-container">
        <a href="${options.ctaUrl}" class="btn-cta" target="_blank">
          🔍 เปิดตรวจงานและให้คะแนนในระบบ Admin
        </a>
      </div>
    </div>
    <div class="footer">
      <p style="margin: 0 0 4px 0;">อีเมลนี้เป็นการแจ้งเตือนอัตโนมัติจากระบบ <strong>ART ROOM WTS</strong></p>
      <p style="margin: 0;">หากคุณครูต้องการเปลี่ยนอีเมลผู้รับ สามารถปรับแต่งได้ที่หน้า Admin Dashboard > การแจ้งเตือน</p>
    </div>
  </div>
</body>
</html>
  `.trim();
}

/**
 * Triggers notification when a student submits an assignment/artwork.
 */
export async function sendSubmissionNotification(data: {
  studentName: string;
  studentId: string;
  classroom: string;
  assignmentTitle: string;
  submittedAt?: string;
  concept?: string;
  hasImage?: boolean;
  hasFile?: boolean;
  isLate?: boolean;
  origin?: string;
}) {
  const settings = await getNotificationSettings();
  if (!settings.isEmailEnabled || !settings.notifyOnAssignment) {
    return { skipped: true, reason: 'assignment_notifications_disabled' };
  }

  const siteUrl = data.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ctaUrl = `${siteUrl}/admin`;
  const thaiDate = new Date(data.submittedAt || Date.now()).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `[ART ROOM] 🔔 มีการส่งงานใหม่: ${data.assignmentTitle} โดย ${data.studentName} (${data.classroom})`;
  const summary = `นักเรียน ${data.studentName} (${data.classroom} เลขประจำตัว ${data.studentId}) ได้ส่งงาน "${data.assignmentTitle}" เรียบร้อยแล้ว`;

  const html = buildArtRoomEmailHtml({
    titleBadge: 'ส่งงานศิลปะใหม่',
    badgeColor: '#ea580c',
    headline: `🔔 มีการส่งงานใหม่: ${data.assignmentTitle}`,
    studentName: data.studentName,
    studentId: data.studentId,
    classroom: data.classroom,
    itemTitle: data.assignmentTitle,
    itemType: '🎨 ชิ้นงานศิลปะ / การบ้าน',
    scoreOrStatus: data.isLate ? 'ส่งช้ากว่ากำหนด (รอการตรวจ)' : 'ส่งตรงเวลา (รอการตรวจ)',
    submittedAtThai: thaiDate,
    conceptOrNotes: data.concept || undefined,
    hasAttachment: Boolean(data.hasImage || data.hasFile),
    ctaUrl,
  });

  return await dispatchEmail({
    to: settings.teacherEmail,
    subject,
    html,
    summary,
    type: 'assignment_submission',
    studentName: data.studentName,
    studentId: data.studentId,
    classroom: data.classroom,
    itemTitle: data.assignmentTitle,
    scoreInfo: 'รอตรวจให้คะแนน',
  });
}

/**
 * Triggers notification when a student finishes an online quiz/pre-test.
 */
export async function sendQuizNotification(data: {
  studentName: string;
  studentId: string;
  classroom: string;
  quizTitle: string;
  score: number;
  totalQuestions: number;
  infractionsCount?: number;
  submittedAt?: string;
  origin?: string;
}) {
  const settings = await getNotificationSettings();
  if (!settings.isEmailEnabled || !settings.notifyOnQuiz) {
    return { skipped: true, reason: 'quiz_notifications_disabled' };
  }

  const siteUrl = data.origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ctaUrl = `${siteUrl}/admin`;
  const thaiDate = new Date(data.submittedAt || Date.now()).toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const percentage = Math.round((data.score / (data.totalQuestions || 1)) * 100);
  const subject = `[ART ROOM] 📝 ทำแบบทดสอบเสร็จ: ${data.quizTitle} (${data.studentName} ได้ ${data.score}/${data.totalQuestions})`;
  const summary = `นักเรียน ${data.studentName} (${data.classroom}) ทำแบบทดสอบ "${data.quizTitle}" ได้คะแนน ${data.score}/${data.totalQuestions} (${percentage}%)`;

  const html = buildArtRoomEmailHtml({
    titleBadge: 'ทำแบบทดสอบเสร็จสิ้น',
    badgeColor: '#0284c7',
    headline: `📝 สรุปผลคะแนนแบบทดสอบ: ${data.quizTitle}`,
    studentName: data.studentName,
    studentId: data.studentId,
    classroom: data.classroom,
    itemTitle: data.quizTitle,
    itemType: '📝 แบบทดสอบก่อนเรียน / หลังเรียน',
    scoreOrStatus: `${data.score} / ${data.totalQuestions} คะแนน (${percentage}%) ${data.infractionsCount ? `• หลุดจอ ${data.infractionsCount} ครั้ง` : '• สมบูรณ์แบบ'}`,
    submittedAtThai: thaiDate,
    conceptOrNotes: `นักเรียนทำแบบทดสอบเสร็จสมบูรณ์ ระบบได้คำนวณคะแนนอัตโนมัติเรียบร้อยแล้ว`,
    ctaUrl,
  });

  return await dispatchEmail({
    to: settings.teacherEmail,
    subject,
    html,
    summary,
    type: 'quiz_completion',
    studentName: data.studentName,
    studentId: data.studentId,
    classroom: data.classroom,
    itemTitle: data.quizTitle,
    scoreInfo: `${data.score}/${data.totalQuestions} (${percentage}%)`,
  });
}

/**
 * Sends a test notification to verify teacher's email setup.
 */
export async function sendTestNotification(customEmail?: string, origin?: string) {
  const settings = await getNotificationSettings();
  const recipient = customEmail || settings.teacherEmail;
  const siteUrl = origin || process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const ctaUrl = `${siteUrl}/admin`;
  const thaiDate = new Date().toLocaleString('th-TH', {
    timeZone: 'Asia/Bangkok',
    dateStyle: 'medium',
    timeStyle: 'short',
  });

  const subject = `[ART ROOM] 🔔 ทดสอบระบบแจ้งเตือนอีเมล (ART ROOM WTS Notification Test)`;
  const summary = `ทดสอบการเชื่อมต่อระบบแจ้งเตือนอีเมลสำหรับคุณครูผู้สอน โรงเรียนวชิรธรรมสาธิต`;

  const html = buildArtRoomEmailHtml({
    titleBadge: 'ทดสอบระบบแจ้งเตือน',
    badgeColor: '#10b981',
    headline: `✅ ทดสอบระบบส่งข้อมูลเข้าอีเมลคุณครูสำเร็จ`,
    studentName: 'ทดสอบระบบ (Demo Student)',
    studentId: '99999',
    classroom: 'ม.3/1',
    itemTitle: 'การเชื่อมต่อระบบแจ้งเตือน ART ROOM WTS',
    itemType: '🛠️ การทดสอบระบบหลังบ้าน',
    scoreOrStatus: 'พร้อมใช้งาน 100%',
    submittedAtThai: thaiDate,
    conceptOrNotes: 'หากคุณครูได้รับอีเมลนี้ แสดงว่าระบบการแจ้งเตือนอีเมลสำหรับคุณครูพร้อมทำงานส่งสรุปงานนักเรียนแล้ว!',
    ctaUrl,
  });

  return await dispatchEmail({
    to: recipient,
    subject,
    html,
    summary,
    type: 'system_test',
    studentName: 'Demo Student',
    studentId: '99999',
    classroom: 'ม.3/1',
    itemTitle: 'ทดสอบระบบแจ้งเตือนอีเมล',
    scoreInfo: 'Active',
  });
}
