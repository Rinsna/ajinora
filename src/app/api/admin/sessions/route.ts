import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { title, description, date, time, link, course_id } = await request.json();

    if (!title || !date || !time) {
      return NextResponse.json({ error: "Missing session details" }, { status: 400 });
    }

    // Auto-generate a unique meeting room link if not provided
    const meetingLink = link?.trim() || 
      `https://meet.jit.si/ajinora-${title.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;

    const result: any = await query(
      "INSERT INTO sessions (title, description, date, time, link, course_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      [title, description, date, time, meetingLink, course_id || null]
    );

    const sessionId = result[0]?.id;

    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Scheduled Session: ${title}`]
    );

    return NextResponse.json({ success: true, sessionId });
  } catch (error) {
    console.error("Admin Sessions API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    // Ensure course_id column exists (safe migration)
    try {
      await query("ALTER TABLE sessions ADD COLUMN course_id INTEGER");
    } catch (e) {
      // Column already exists — ignore
    }

    const sessions = await query(
      `SELECT s.*, c.title as course_title 
       FROM sessions s 
       LEFT JOIN courses c ON s.course_id = c.id 
       ORDER BY s.date DESC, s.time DESC`
    );
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 });
    }
    const { id } = await request.json();
    await query("DELETE FROM sessions WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
