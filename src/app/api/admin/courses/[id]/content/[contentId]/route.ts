import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function DELETE(
  request: Request, 
  { params }: { params: Promise<{ id: string, contentId: string }> }
) {
  const { contentId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    await query("DELETE FROM course_content WHERE id = ?", [contentId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content Deletion Fault:", error);
    return NextResponse.json({ error: "Failed to remove educational module." }, { status: 500 });
  }
}

export async function PUT(
  request: Request, 
  { params }: { params: Promise<{ id: string, contentId: string }> }
) {
  const { contentId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, details, type } = await request.json();
    if (!title) {
        return NextResponse.json({ error: "Missing required identification." }, { status: 400 });
    }

    await query(
      "UPDATE course_content SET title = ?, details = ?, type = ? WHERE id = ?",
      [title, details, type, contentId]
    );

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Content Update Fault:", error);
    return NextResponse.json({ error: "Failed to update educational module." }, { status: 500 });
  }
}
