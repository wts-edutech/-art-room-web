DROP TABLE IF EXISTS "artworks";

CREATE TABLE "artworks" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`author` text NOT NULL,
	`image_url` text NOT NULL,
	`year` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
, technique TEXT, dimensions TEXT);

DROP TABLE IF EXISTS "awards";

CREATE TABLE "awards" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`student` text NOT NULL,
	`description` text,
	`image_url` text,
	`year` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
, `date` text, `award_level` text, `competition_level` text, `organization` text, `is_highlight` integer DEFAULT false, certificate_url TEXT, grade TEXT);

DROP TABLE IF EXISTS "comments";

CREATE TABLE "comments" (
	`id` text PRIMARY KEY NOT NULL,
	`lesson_id` text NOT NULL,
	`idea_id` text,
	`author` text NOT NULL,
	`author_email` text,
	`author_image` text,
	`text` text NOT NULL,
	`time` text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "guests";

CREATE TABLE "guests" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "ideas";

CREATE TABLE "ideas" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text NOT NULL,
	`category` text,
	`author_name` text NOT NULL,
	`author_email` text,
	`cover_image_url` text,
	`files` text,
	`status` text DEFAULT 'pending' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
, `link` text, is_featured INTEGER DEFAULT 0);

DROP TABLE IF EXISTS "lessons";

CREATE TABLE "lessons" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`description` text,
	`video_id` text,
	`category` text,
	`image_url` text,
	`views` integer DEFAULT 0,
	`rating_sum` integer DEFAULT 0,
	`rating_count` integer DEFAULT 0,
	`type` text DEFAULT 'general' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "news";

CREATE TABLE "news" (
	`id` text PRIMARY KEY NOT NULL,
	`title` text NOT NULL,
	`content` text NOT NULL,
	`date` text NOT NULL,
	`image_url` text,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "students";

CREATE TABLE "students" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL
, classroom text, grade_level text, academic_year_id text, student_number INTEGER, password TEXT, login_count INTEGER DEFAULT 0, last_login_at TEXT);

DROP TABLE IF EXISTS "users";

CREATE TABLE "users" (
	`id` text PRIMARY KEY NOT NULL,
	`name` text NOT NULL,
	`email` text,
	`role` text DEFAULT 'student' NOT NULL,
	`created_at` text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "visitors";

CREATE TABLE "visitors" (
	`date` text PRIMARY KEY NOT NULL,
	`count` integer DEFAULT 0 NOT NULL
);

DROP TABLE IF EXISTS "site_settings";

CREATE TABLE "site_settings" (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

DROP TABLE IF EXISTS "downloads";

CREATE TABLE "downloads" (
        id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        description TEXT,
        category TEXT NOT NULL DEFAULT 'แบบฝึกหัด',
        grade TEXT NOT NULL DEFAULT 'all',
        file_name TEXT,
        file_size TEXT,
        file_url TEXT NOT NULL,
        downloads_count INTEGER DEFAULT 0,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );

DROP TABLE IF EXISTS "teachers";

CREATE TABLE "teachers" (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        role TEXT,
        position TEXT,
        grades TEXT,
        specialties TEXT,
        bio TEXT,
        image_url TEXT,
        email TEXT,
        room_location TEXT,
        order_index INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      , education TEXT, experience TEXT, awards TEXT, activity_images TEXT);

DROP TABLE IF EXISTS "testimonials";

CREATE TABLE "testimonials" (id TEXT PRIMARY KEY, name TEXT NOT NULL, university TEXT, quote TEXT NOT NULL, image_url TEXT, univ_image_url TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP);

DROP TABLE IF EXISTS "activities";

CREATE TABLE "activities" (id TEXT PRIMARY KEY, title TEXT NOT NULL, date TEXT NOT NULL, description TEXT, image_url TEXT, images TEXT, created_at TEXT DEFAULT CURRENT_TIMESTAMP, time TEXT, location TEXT, category TEXT, color TEXT);

DROP TABLE IF EXISTS "academic_years";

CREATE TABLE "academic_years" (
    id text PRIMARY KEY NOT NULL,
    year text NOT NULL,
    semester text NOT NULL,
    name text NOT NULL,
    is_active integer DEFAULT 1,
    created_at text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "subjects";

CREATE TABLE "subjects" (
    id text PRIMARY KEY NOT NULL,
    code text NOT NULL,
    name text NOT NULL,
    grade_level text NOT NULL,
    academic_year_id text,
    created_at text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "classrooms";

CREATE TABLE "classrooms" (
    id text PRIMARY KEY NOT NULL,
    name text NOT NULL,
    grade_level text NOT NULL,
    academic_year_id text,
    created_at text DEFAULT CURRENT_TIMESTAMP
);

DROP TABLE IF EXISTS "assignments";

CREATE TABLE "assignments" (
    id text PRIMARY KEY NOT NULL,
    title text NOT NULL,
    description text,
    subject_id text NOT NULL,
    classrooms text,
    max_score integer DEFAULT 10,
    due_date text,
    is_active integer DEFAULT 1,
    created_at text DEFAULT CURRENT_TIMESTAMP
, target_students text);

DROP TABLE IF EXISTS "submissions";

CREATE TABLE "submissions" (
    id text PRIMARY KEY NOT NULL,
    assignment_id text NOT NULL,
    student_id text NOT NULL,
    student_name text NOT NULL,
    classroom text NOT NULL,
    image_url text,
    images text,
    file_url text,
    file_name text,
    external_link text,
    concept text,
    score real,
    feedback text,
    status text DEFAULT 'pending',
    is_late integer DEFAULT 0,
    submitted_at text DEFAULT CURRENT_TIMESTAMP,
    updated_at text
);

DROP TABLE IF EXISTS "quizzes";

CREATE TABLE "quizzes" (
            id TEXT PRIMARY KEY,
            code TEXT NOT NULL,
            title TEXT NOT NULL,
            grade_level TEXT NOT NULL,
            description TEXT,
            total_questions INTEGER DEFAULT 20,
            max_score INTEGER DEFAULT 20,
            time_limit_minutes INTEGER DEFAULT 30,
            is_active INTEGER DEFAULT 0,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        , target_classrooms TEXT);

DROP TABLE IF EXISTS "quiz_questions";

CREATE TABLE "quiz_questions" (
            id TEXT PRIMARY KEY,
            quiz_id TEXT NOT NULL,
            question_number INTEGER NOT NULL,
            question_text TEXT NOT NULL,
            choice_a TEXT NOT NULL,
            choice_b TEXT NOT NULL,
            choice_c TEXT NOT NULL,
            choice_d TEXT NOT NULL,
            correct_answer TEXT NOT NULL,
            explanation TEXT,
            image_url TEXT,
            created_at TEXT DEFAULT CURRENT_TIMESTAMP
        );

DROP TABLE IF EXISTS "quiz_attempts";

CREATE TABLE "quiz_attempts" (
            id TEXT PRIMARY KEY,
            quiz_id TEXT NOT NULL,
            student_id TEXT NOT NULL,
            student_name TEXT NOT NULL,
            classroom TEXT NOT NULL,
            score INTEGER NOT NULL DEFAULT 0,
            total_questions INTEGER NOT NULL DEFAULT 20,
            answers TEXT,
            infractions_count INTEGER DEFAULT 0,
            started_at TEXT DEFAULT CURRENT_TIMESTAMP,
            submitted_at TEXT DEFAULT CURRENT_TIMESTAMP,
            status TEXT NOT NULL DEFAULT 'completed'
        );

DROP TABLE IF EXISTS "email_notification_logs";

CREATE TABLE "email_notification_logs" (
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
      );