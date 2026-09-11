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
