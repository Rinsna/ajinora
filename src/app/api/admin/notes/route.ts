import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const session = await getSession();
    if (!session || session.user.role !== "admin") {
      return NextResponse.json({ error: "Unauthorized Access" }, { status: 403 });
    }

    const { title, description, type, url, category, course_id } = await request.json();

    if (!title || !type || !url) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 });
    }

    const result: any = await query(
      "INSERT INTO notes (title, description, type, url, category, course_id) VALUES (?, ?, ?, ?, ?, ?) RETURNING id",
      [title, description, type, url, category, course_id || null]
    );

    const noteId = result[0]?.id;

    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Uploaded Resource: ${title}`]
    );

    return NextResponse.json({ success: true, noteId });
  } catch (error) {
    console.error("Resource API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}

export async function GET() {
  try {
    const resources = await query(
      `SELECT n.*, c.title as course_title 
       FROM notes n 
       LEFT JOIN courses c ON n.course_id = c.id 
       ORDER BY n.created_at DESC`
    );
    return NextResponse.json(resources);
  } catch (error) {
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
