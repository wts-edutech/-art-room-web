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
  grade: text('grade').default('all'), // 'all', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'
  mediaType: text('media_type').default('video'), // 'video', 'pdf', 'canva', 'slides'
  fileUrl: text('file_url'),
  attachmentName: text('attachment_name'),
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
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

export const awards = sqliteTable('awards', {
  id: text('id').primaryKey(),
  title: text('title').notNull(), // Activity Name
  student: text('student').notNull(),
  description: text('description'), // Details
  imageUrl: text('image_url'),
  year: text('year'),
  date: text('date'), // YYYY-MM-DD
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
  imageUrl: text('image_url'),
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
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Testimonials ---
export const testimonials = sqliteTable('testimonials', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role'), // 'student', 'teacher', 'parent', etc.
  message: text('message').notNull(),
  avatarUrl: text('avatar_url'),
  rating: integer('rating').default(5),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Teachers (Faculty) ---
export const teachers = sqliteTable('teachers', {
  id: text('id').primaryKey(),
  name: text('name').notNull(),
  role: text('role').notNull(), // e.g. 'หัวหน้ากลุ่มสาระการเรียนรู้ศิลปะ', 'ครูผู้สอนทัศนศิลป์'
  position: text('position'), // e.g. 'ครูชำนาญการพิเศษ', 'ครูผู้ช่วย'
  grades: text('grades'), // e.g. 'ม.1, ม.3'
  specialties: text('specialties'), // e.g. 'จิตรกรรมสีน้ำ, วาดเส้น, ดิจิทัลอาร์ต'
  bio: text('bio'),
  imageUrl: text('image_url'),
  email: text('email'),
  roomLocation: text('room_location'), // e.g. 'ห้องปฏิบัติการศิลปะ อาคาร 2 ชั้น 3'
  orderIndex: integer('order_index').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

// --- Downloads (Worksheets & Guides) ---
export const downloads = sqliteTable('downloads', {
  id: text('id').primaryKey(),
  title: text('title').notNull(),
  description: text('description'),
  category: text('category').notNull(), // 'ใบงาน', 'ใบความรู้', 'เกณฑ์การประเมิน', 'แบบฟอร์ม'
  grade: text('grade').default('all'), // 'all', 'm1', 'm2', 'm3', 'm4', 'm5', 'm6'
  fileUrl: text('file_url').notNull(),
  fileName: text('file_name'),
  fileSize: text('file_size'),
  downloadsCount: integer('downloads_count').default(0),
  createdAt: text('created_at').default(sql`CURRENT_TIMESTAMP`),
});

