import { sqliteTable, text, integer, real } from 'drizzle-orm/sqlite-core';
import { sql } from 'drizzle-orm';

// --- Auth & Users ---
export const users = sqliteTable('users', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  email: text('email'),
  role: text('role').notNull().default('student'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const guests = sqliteTable('guests', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Visitors ---
export const visitors = sqliteTable('visitors', {
  date: text('date').primaryKey(), // YYYY-MM-DD
  count: integer('count').notNull().default(0),
});

// --- Students ---
export const students = sqliteTable('students', {
  id: text('id').primaryKey(), // Student ID (รหัสนักเรียน)
  name: text('name').notNull(),
  classroom: text('classroom'), // e.g. "ม.3/1"
  gradeLevel: text('grade_level'), // e.g. "ม.3"
  studentNumber: integer('student_number'), // เลขที่ (เช่น 1, 2, 3...)
  academicYearId: text('academic_year_id'),
  password: text('password'), // Custom hashed student password
  avatar: text('avatar'), // Profile avatar (preset ID, URL, or data URI)
  loginCount: integer('login_count').default(0), // จำนวนครั้งที่เข้าใช้งาน
  lastLoginAt: text('last_login_at'), // วันเวลาที่เข้าใช้งานล่าสุด
});

// --- Lessons (M3, M4, General) ---
export const lessons = sqliteTable('lessons', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  videoId: text('video_id'),
  category: text('category'),
  imageUrl: text('image_url'),
  views: integer('views').default(0),
  ratingSum: integer('rating_sum').default(0),
  ratingCount: integer('rating_count').default(0),
  type: text('type').notNull().default('general'), // 'general', 'm3', 'm4'
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const comments = sqliteTable('comments', {
  id: text('id').primaryKey(),
  lessonId: text('lesson_id').notNull(), // can link to ideas too, might need reference
  ideaId: text('idea_id'),
  author: text('author').notNull(),
  authorEmail: text('author_email'),
  authorImage: text('author_image'),
  text: text('text').notNull(),
  time: text('time').default(sql`CURRENT_TIMESTAMP`),
});

// --- Artworks & Awards ---
export const artworks = sqliteTable('artworks', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  author: text('author').notNull(),
  imageUrl: text('image_url').notNull(),
  year: text('year'),
  technique: text('technique'),
  dimensions: text('dimensions'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const awards = sqliteTable('awards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(), // Activity Name
  student: text('student').notNull(),
  grade: text('grade'), // e.g., ม.3/1, ม.6/14
  description: text('description'), // Details
  imageUrl: text('image_url'),
  certificateUrl: text('certificate_url'), // Certificate image/file URL
  year: text('year'),
  date: text('date'), // YYYY-MM-DD or Thai date string
  awardLevel: text('award_level'), // e.g., Gold Medal
  competitionLevel: text('competition_level'), // e.g., National
  organization: text('organization'), // Organizer
  isHighlight: integer('is_highlight', { mode: 'boolean' }).default(false),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Activities & News ---
export const activities = sqliteTable('activities', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  date: text('date').notNull(),
  description: text('description'),
  time: text('time'),
  location: text('location'),
  category: text('category'),
  color: text('color'),
  imageUrl: text('image_url'), // Main/cover image
  images: text('images', { mode: 'json' }), // Array of gallery image URLs
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const news = sqliteTable('news', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  content: text('content').notNull(),
  date: text('date').notNull(),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Ideas ---
export const ideas = sqliteTable('ideas', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description').notNull(),
  category: text('category'),
  authorName: text('author_name').notNull(),
  authorEmail: text('author_email'),
  coverImageUrl: text('cover_image_url'),
  files: text('files', { mode: 'json' }), // JSON string for files array
  link: text('link'), // Optional external link/website
  status: text('status').notNull().default('pending'), // 'pending', 'approved', 'rejected'
  isFeatured: integer('is_featured').default(0), // 1 = featured / แนะนำไอเดียใหม่, 0 = normal
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Testimonials ---
export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  university: text('university'),
  quote: text('quote').notNull(),
  imageUrl: text('image_url'),
  univImageUrl: text('univ_image_url'), // New field for university logo
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Teaching & Assignments System ---

// 1. ปีการศึกษาและภาคเรียน
export const academicYears = sqliteTable('academic_years', {
  id: text('id').primaryKey(),
  year: text('year').notNull(), // e.g. "2567"
  semester: text('semester').notNull(), // e.g. "1" หรือ "2"
  name: text('name').notNull(), // e.g. "ปีการศึกษา 2567 / ภาคเรียนที่ 1"
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. รายวิชาที่สอน
export const subjects = sqliteTable('subjects', {
  id: text('id').primaryKey(),
  code: text('code').notNull(), // e.g. "ศ23101"
  name: text('name').notNull(), // e.g. "ทัศนศิลป์ 5"
  gradeLevel: text('grade_level').notNull(), // e.g. "ม.3"
  academicYearId: text('academic_year_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3. ห้องเรียน
export const classrooms = sqliteTable('classrooms', {
  id: text('id').primaryKey(),
  name: text('name').notNull(), // e.g. "ม.3/1"
  gradeLevel: text('grade_level').notNull(), // e.g. "ม.3"
  academicYearId: text('academic_year_id'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 4. หัวข้องาน / การบ้านที่ครูสั่ง (Assignments)
export const assignments = sqliteTable('assignments', {
  id: text('id').primaryKey(),
  title: text('title').notNull(), // e.g. "ชิ้นงานที่ 1: วาดภาพทัศนียภาพ 1 จุด"
  description: text('description'),
  subjectId: text('subject_id').notNull(),
  classrooms: text('classrooms', { mode: 'json' }), // e.g. ["ม.3/1", "ม.3/2"]
  targetStudents: text('target_students', { mode: 'json' }), // array of student IDs e.g. ["12345", "12346"]
  maxScore: integer('max_score').default(10),
  dueDate: text('due_date'), // YYYY-MM-DDTHH:mm
  isActive: integer('is_active', { mode: 'boolean' }).default(true),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 5. การส่งงานของนักเรียน (Submissions)
export const submissions = sqliteTable('submissions', {
  id: text('id').primaryKey(),
  assignmentId: text('assignment_id').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  classroom: text('classroom').notNull(),
  imageUrl: text('image_url'),
  images: text('images', { mode: 'json' }),
  fileUrl: text('file_url'),
  fileName: text('file_name'),
  externalLink: text('external_link'), // Canva, Google Drive, YouTube link
  concept: text('concept'), // แนวคิดผลงาน / เทคนิคที่ใช้
  score: real('score'),
  feedback: text('feedback'),
  status: text('status').default('pending'), // 'pending', 'graded', 'resubmit'
  isLate: integer('is_late', { mode: 'boolean' }).default(false),
  submittedAt: text('submitted_at').default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text('updated_at'),
});

// --- Quizzes & Pre-test System ---

// 1. ตารางชุดแบบทดสอบ (Quizzes)
export const quizzes = sqliteTable('quizzes', {
  id: text('id').primaryKey(), // e.g. "quiz_m3_pretest", "quiz_m4_pretest"
  code: text('code').notNull(), // e.g. "ศ23101", "ศ31101"
  title: text('title').notNull(), // e.g. "แบบทดสอบก่อนเรียน: วิชาศิลปะ (ทัศนศิลป์) ม.3"
  gradeLevel: text('grade_level').notNull(), // "ม.3" หรือ "ม.4"
  description: text('description'),
  totalQuestions: integer('total_questions').default(20),
  maxScore: integer('max_score').default(20),
  timeLimitMinutes: integer('time_limit_minutes').default(30),
  isActive: integer('is_active', { mode: 'boolean' }).default(false), // ครูเปิด/ปิดการสอบ
  targetClassrooms: text('target_classrooms', { mode: 'json' }), // array e.g. ["ม.3/1", "ม.3/2"] or null for all
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 2. คลังคำถามของแบบทดสอบ (Quiz Questions)
export const quizQuestions = sqliteTable('quiz_questions', {
  id: text('id').primaryKey(), // e.g. "q_m3_1", "q_m3_2" ...
  quizId: text('quiz_id').notNull(),
  questionNumber: integer('question_number').notNull(),
  questionText: text('question_text').notNull(),
  choiceA: text('choice_a').notNull(),
  choiceB: text('choice_b').notNull(),
  choiceC: text('choice_c').notNull(),
  choiceD: text('choice_d').notNull(),
  correctAnswer: text('correct_answer').notNull(), // "A", "B", "C", "D"
  explanation: text('explanation'),
  imageUrl: text('image_url'),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// 3. ประวัติการทำข้อสอบของนักเรียน (Quiz Attempts / Submissions)
export const quizAttempts = sqliteTable('quiz_attempts', {
  id: text('id').primaryKey(),
  quizId: text('quiz_id').notNull(),
  studentId: text('student_id').notNull(),
  studentName: text('student_name').notNull(),
  classroom: text('classroom').notNull(),
  score: integer('score').notNull().default(0),
  totalQuestions: integer('total_questions').notNull().default(20),
  answers: text('answers', { mode: 'json' }), // Record of selected answers { "1": "A", "2": "C", ... }
  infractionsCount: integer('infractions_count').default(0), // จำนวนครั้งที่สลับหน้าจอ/หลุดจากเต็มจอ
  startedAt: text('started_at').default(sql`CURRENT_TIMESTAMP`),
  submittedAt: text('submitted_at').default(sql`CURRENT_TIMESTAMP`),
  status: text('status').notNull().default('completed'), // 'completed', 'timed_out', 'force_submitted'
});

// --- Site Settings (Key-Value configuration) ---
export const siteSettings = sqliteTable('site_settings', {
  key: text('key').primaryKey(),
  value: text('value').notNull(),
  updatedAt: text('updated_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Downloads & Teaching Materials ---
export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull().default('แบบฝึกหัด'),
  grade: text('grade').notNull().default('all'),
  fileName: text('file_name'),
  fileSize: text('file_size'),
  fileUrl: text('file_url').notNull(),
  imageUrl: text('image_url'),
  topic: text('topic'),
  mediaType: text('media_type').default('pdf'),
  content: text('content'),
  downloadsCount: integer('downloads_count').default(0),
  orderIndex: integer('order_index').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

