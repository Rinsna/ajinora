-- Run this against your PostgreSQL database to add the missing columns
-- These columns are required for exam-course linking and student exam visibility

ALTER TABLE exams ADD COLUMN IF NOT EXISTS start_time VARCHAR(20);
ALTER TABLE exams ADD COLUMN IF NOT EXISTS course_id INT REFERENCES courses(id) ON DELETE SET NULL;
