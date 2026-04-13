import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

// ⚡ One-Click Institutional Database Initializer
// POST /api/admin/setup-db
// Runs the full schema — safe to re-run (uses CREATE TABLE IF NOT EXISTS)

const SCHEMA_STATEMENTS = [
  `CREATE TABLE IF NOT EXISTS courses (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    thumbnail TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS course_content (
    id SERIAL PRIMARY KEY,
    course_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    details TEXT,
    type VARCHAR(50) DEFAULT 'lesson',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS users (
    id SERIAL PRIMARY KEY,
    username VARCHAR(50) NOT NULL UNIQUE,
    password VARCHAR(255) NOT NULL,
    role VARCHAR(20) NOT NULL DEFAULT 'student',
    full_name VARCHAR(100) NOT NULL,
    course_id INT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS sessions (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    date DATE NOT NULL,
    time TIME NOT NULL,
    link TEXT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS exams (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    duration INT NOT NULL,
    start_date TIMESTAMP NOT NULL,
    start_time VARCHAR(20),
    course_id INT,
    negative_mark FLOAT DEFAULT 0.0,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL
  )`,

  `CREATE TABLE IF NOT EXISTS questions (
    id SERIAL PRIMARY KEY,
    exam_id INT NOT NULL,
    question TEXT NOT NULL,
    options JSONB NOT NULL,
    correct_answer VARCHAR(255) NOT NULL,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    title VARCHAR(255) NOT NULL,
    description TEXT,
    type VARCHAR(20) NOT NULL,
    url TEXT NOT NULL,
    category VARCHAR(100),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
  )`,

  `CREATE TABLE IF NOT EXISTS exam_results (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    exam_id INT NOT NULL,
    score INT,
    total INT,
    completed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE,
    FOREIGN KEY (exam_id) REFERENCES exams(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS module_assets (
    id SERIAL PRIMARY KEY,
    module_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    type VARCHAR(50) NOT NULL,
    details TEXT,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (module_id) REFERENCES course_content(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS activity_logs (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    action TEXT NOT NULL,
    timestamp TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS exercise_results (
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
  )`,

  `CREATE TABLE IF NOT EXISTS student_asset_completions (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    asset_id INT NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE (user_id, asset_id),
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS student_documents (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    status VARCHAR(20) DEFAULT 'pending',
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  `CREATE TABLE IF NOT EXISTS student_certificates (
    id SERIAL PRIMARY KEY,
    user_id INT NOT NULL,
    title VARCHAR(255) NOT NULL,
    url TEXT NOT NULL,
    issued_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
  )`,

  // Seed default admin account (password: admin123)
  `INSERT INTO users (username, password, role, full_name)
   VALUES ('admin', '$2b$10$kN1yoraqLjIOndmqvmWa9e2IQ29rE8DslUlB9QDedK7ng/QiBoWym', 'admin', 'System Administrator')
   ON CONFLICT (username) DO UPDATE SET password = EXCLUDED.password, role = EXCLUDED.role, full_name = EXCLUDED.full_name`,
];

export async function POST(request: Request) {
  // Allow setup if:
  // 1. An admin is logged in OR
  // 2. A valid SETUP_SECRET is provided in the headers
  const session = await getSession();
  const { searchParams } = new URL(request.url);
  const secret = searchParams.get("secret");
  const SETUP_SECRET = process.env.SETUP_SECRET || "ajinora_init_2026";

  if (!(session?.role === "admin") && secret !== SETUP_SECRET) {
    return NextResponse.json({ error: "Institutional clearance required. Please provide a valid synchronization secret." }, { status: 401 });
  }

  const results: { statement: string; status: string; error?: string }[] = [];

  for (const sql of SCHEMA_STATEMENTS) {
    const label = sql.trim().split("\n")[0].substring(0, 60);
    try {
      await query(sql);
      results.push({ statement: label, status: "✅ OK" });
    } catch (err: any) {
      results.push({ statement: label, status: "❌ Failed", error: err.message });
    }
  }

  const failed = results.filter(r => r.status.startsWith("❌"));

  return NextResponse.json({
    message: failed.length === 0 
      ? "Institutional database fully synchronized." 
      : `${failed.length} statement(s) failed.`,
    results,
  }, { status: failed.length === 0 ? 200 : 207 });
}

// GET: Quick health check — returns table list
export async function GET(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized." }, { status: 401 });
  }

  try {
    const tables = await query(
      `SELECT table_name FROM information_schema.tables 
       WHERE table_schema = 'public' 
       ORDER BY table_name`
    );
    return NextResponse.json({ 
      status: "connected", 
      tables: tables.map((t: any) => t.table_name) 
    });
  } catch (err: any) {
    return NextResponse.json({ status: "error", error: err.message }, { status: 500 });
  }
}
