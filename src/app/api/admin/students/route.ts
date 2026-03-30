import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
    }

    const { username, password, fullName, courseId } = await request.json();

    if (!username || !password || !fullName || !courseId) {
      return NextResponse.json({ error: "Missing required student profile data / course identification." }, { status: 400 });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into MySQL
    await query(
      "INSERT INTO users (username, password, role, full_name, course_id) VALUES (?, ?, 'student', ?, ?)",
      [username, hashedPassword, fullName, courseId]
    );

    // Log Activity
    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Created student account for @${username} enrolled in Course ID: ${courseId}`]
    );

    return NextResponse.json({ success: true, message: "Student account and enrollment generated successfully." });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: "The provided username is already reserved in the institutional archives." }, { status: 409 });
    }
    console.error("Admin Student API Error:", error);
    return NextResponse.json({ error: "Institutional system fault. Please contact administrative support." }, { status: 500 });
  }
}

export async function GET() {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
    }

    const students = await query(`
      SELECT u.id, u.username, u.full_name as name, u.created_at, 'active' as status, c.title as courseTitle 
      FROM users u
      LEFT JOIN courses c ON u.course_id = c.id
      WHERE u.role = 'student' 
      ORDER BY u.created_at DESC
    `);

    return NextResponse.json(students);
  } catch (error) {
    console.error("Admin Fetch Students Error:", error);
    return NextResponse.json({ error: "Institutional system fault. Please contact administrative support." }, { status: 500 });
  }
}
