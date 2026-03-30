-- LMS Database Schema (PostgreSQL)

-- Courses Table
CREATE TABLE IF NOT EXISTS courses (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  thumbnail TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Course Content Table (Modules)
CREATE TABLE IF NOT EXISTS course_content (
  id SERIAL PRIMARY KEY,
  course_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  details TEXT,
  type VARCHAR(50) DEFAULT 'lesson', -- lesson, video, reading, assignment
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Users Table
CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  username VARCHAR(50) NOT NULL UNIQUE,
  password VARCHAR(255) NOT NULL,
  role VARCHAR(20) NOT NULL DEFAULT 'student', -- admin, student
  full_name VARCHAR(100) NOT NULL,
  course_id INT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Sessions Table (Live Classes)
CREATE TABLE IF NOT EXISTS sessions (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  time TIME NOT NULL,
  link TEXT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exams Table
CREATE TABLE IF NOT EXISTS exams (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  duration INT NOT NULL, -- duration in minutes
  start_date TIMESTAMP NOT NULL,
  start_time VARCHAR(20),
  course_id INT,
  negative_mark FLOAT DEFAULT 0.0,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
);

-- Questions Table
CREATE TABLE IF NOT EXISTS questions (
  id SERIAL PRIMARY KEY,
  exam_id INT NOT NULL,
  question TEXT NOT NULL,
  options JSONB NOT NULL, -- Store as JSONB array ["A", "B", "C", "D"]
  correct_answer VARCHAR(255) NOT NULL,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Notes Table
CREATE TABLE IF NOT EXISTS notes (
  id SERIAL PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  type VARCHAR(20) NOT NULL, -- pdf, video, link
  url TEXT NOT NULL,
  category VARCHAR(100),
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Exam Results
CREATE TABLE IF NOT EXISTS exam_results (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  exam_id INT NOT NULL,
  score INT,
  total INT,
  completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
  FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
);

-- Module Assets Table (Multi-Asset support)
CREATE TABLE IF NOT EXISTS module_assets (
  id SERIAL PRIMARY KEY,
  module_id INT NOT NULL,
  title VARCHAR(255) NOT NULL,
  type VARCHAR(50) NOT NULL, -- video, pdf, quiz, puzzle
  details TEXT,
  FOREIGN KEY (module_id) REFERENCES course_content(id) ON DELETE CASCADE,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Activity Logs
CREATE TABLE IF NOT EXISTS activity_logs (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  action TEXT NOT NULL,
  timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Performance Tracking (Exercise Results)
CREATE TABLE IF NOT EXISTS exercise_results (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  asset_id INT NOT NULL,
  score INT NOT NULL,
  total_points INT NOT NULL,
  correct_count INT NOT NULL,
  total_questions INT NOT NULL,
  percentage INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);

-- Student Completions
CREATE TABLE IF NOT EXISTS student_asset_completions (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL,
  asset_id INT NOT NULL,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  UNIQUE (user_id, asset_id),
  FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
);
