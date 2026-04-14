import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

// GET courses
export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const courses: any = await query("SELECT * FROM courses ORDER BY created_at DESC");
    return NextResponse.json(courses);
  } catch (error) {
    console.error("Course Retrieval Fault:", error);
    return NextResponse.json({ error: "Failed to pull course archives." }, { status: 500 });
  }
}

// POST new course
export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, description, thumbnail } = await request.json();

    if (!title) {
      return NextResponse.json({ error: "Missing required identification." }, { status: 400 });
    }

    const result: any = await query(
      "INSERT INTO courses (title, description, thumbnail) VALUES (?, ?, ?) RETURNING id",
      [title, description, thumbnail || 'https://via.placeholder.com/400x300']
    );

    return NextResponse.json({ success: true, id: result[0]?.id });
  } catch (error) {
    console.error("Course Generation Fault:", error);
    return NextResponse.json({ error: "Failed to commit course profile." }, { status: 500 });
  }
}
