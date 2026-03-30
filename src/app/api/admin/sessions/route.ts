import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { title, description, date, time, link, assignedStudents } = await request.json();

    if (!title || !date || !time || !link) {
      return NextResponse.json({ error: "Missing session details" }, { status: 400 });
    }

    // Insert session
    const result: any = await query(
      "INSERT INTO sessions (title, description, date, time, link) VALUES (?, ?, ?, ?, ?)",
      [title, description, date, time, link]
    );

    const sessionId = result.insertId;

    // Assign students if provided
    if (assignedStudents && assignedStudents.length > 0) {
      const placeholders = assignedStudents.map(() => "(?, ?, 'session')").join(", ");
      const values = assignedStudents.flatMap((uid: number) => [uid, sessionId]);
      await query(
        `INSERT INTO user_assignments (user_id, item_id, item_type) VALUES ${placeholders}`,
        values
      );
    }

    // Audit Log
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
    const sessions = await query(
      "SELECT * FROM sessions ORDER BY date DESC, time DESC"
    );
    return NextResponse.json(sessions);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
