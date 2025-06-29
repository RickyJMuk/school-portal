-- -- Create the database
-- CREATE DATABASE IF NOT EXISTS school_portal CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
-- USE school_portal;

-- -- Users table
-- CREATE TABLE IF NOT EXISTS users (
--   id CHAR(36) PRIMARY KEY,
--   full_name TEXT NOT NULL,
--   email VARCHAR(255) UNIQUE NOT NULL,
--   password TEXT NOT NULL,
--   role ENUM('admin', 'teacher', 'student') NOT NULL,
--   is_whitelisted BOOLEAN DEFAULT FALSE,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Classes table
-- CREATE TABLE IF NOT EXISTS classes (
--   id CHAR(36) PRIMARY KEY,
--   name VARCHAR(255) UNIQUE NOT NULL,
--   level ENUM('PP1', 'PP2', 'Grade 1', 'Grade 2', 'Grade 3', 'Grade 4', 'Grade 5', 'Grade 6', 'Grade 7', 'Grade 8', 'Grade 9') NOT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
-- );

-- -- Subjects table
-- CREATE TABLE IF NOT EXISTS subjects (
--   id CHAR(36) PRIMARY KEY,
--   name TEXT NOT NULL,
--   class_id CHAR(36),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_subjects_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
-- );

-- -- Students table
-- CREATE TABLE IF NOT EXISTS students (
--   id CHAR(36) PRIMARY KEY,
--   user_id CHAR(36),
--   class_id CHAR(36),
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_students_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   CONSTRAINT fk_students_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
-- );

-- -- Teachers table
-- CREATE TABLE IF NOT EXISTS teachers (
--   id CHAR(36) PRIMARY KEY,
--   user_id CHAR(36),
--   class_id CHAR(36),
--   subject_ids JSON DEFAULT '[]',
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_teachers_user FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
--   CONSTRAINT fk_teachers_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE
-- );

-- -- Assignments table
-- CREATE TABLE IF NOT EXISTS assignments (
--   id CHAR(36) PRIMARY KEY,
--   class_id CHAR(36),
--   subject_id CHAR(36),
--   title TEXT NOT NULL,
--   description TEXT,
--   type ENUM('written', 'mcq') NOT NULL,
--   deadline TIMESTAMP NULL DEFAULT NULL,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_assignments_class FOREIGN KEY (class_id) REFERENCES classes(id) ON DELETE CASCADE,
--   CONSTRAINT fk_assignments_subject FOREIGN KEY (subject_id) REFERENCES subjects(id) ON DELETE CASCADE
-- );

-- -- Questions table
-- CREATE TABLE IF NOT EXISTS questions (
--   id CHAR(36) PRIMARY KEY,
--   assignment_id CHAR(36),
--   question_text TEXT NOT NULL,
--   options JSON,
--   correct_option TEXT,
--   marks INT DEFAULT 1,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_questions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
-- );

-- -- Submissions table
-- CREATE TABLE IF NOT EXISTS submissions (
--   id CHAR(36) PRIMARY KEY,
--   student_id CHAR(36),
--   assignment_id CHAR(36),
--   submitted_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   answers JSON DEFAULT '{}',
--   total_score INT DEFAULT 0,
--   is_marked BOOLEAN DEFAULT FALSE,
--   CONSTRAINT fk_submissions_student FOREIGN KEY (student_id) REFERENCES students(id) ON DELETE CASCADE,
--   CONSTRAINT fk_submissions_assignment FOREIGN KEY (assignment_id) REFERENCES assignments(id) ON DELETE CASCADE
-- );

-- -- Marks table
-- CREATE TABLE IF NOT EXISTS marks (
--   id CHAR(36) PRIMARY KEY,
--   submission_id CHAR(36),
--   question_id CHAR(36),
--   obtained_marks INT DEFAULT 0,
--   created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
--   CONSTRAINT fk_marks_submission FOREIGN KEY (submission_id) REFERENCES submissions(id) ON DELETE CASCADE,
--   CONSTRAINT fk_marks_question FOREIGN KEY (question_id) REFERENCES questions(id) ON DELETE CASCADE
-- );

-- -- Create indexes for better performance
-- CREATE INDEX idx_users_email ON users(email);
-- CREATE INDEX idx_users_role ON users(role);
-- CREATE INDEX idx_students_user_id ON students(user_id);
-- CREATE INDEX idx_teachers_user_id ON teachers(user_id);
-- CREATE INDEX idx_assignments_class_subject ON assignments(class_id, subject_id);
-- CREATE INDEX idx_submissions_student_assignment ON submissions(student_id, assignment_id);
