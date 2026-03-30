import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, description, thumbnail } = await request.json();
    await query("UPDATE courses SET title = ?, description = ?, thumbnail = ? WHERE id = ?", [title, description, thumbnail, id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course Update Fault:", error);
    return NextResponse.json({ error: "Failed to update academic path profile." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    await query("DELETE FROM courses WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Course Deletion Fault:", error);
    return NextResponse.json({ error: "Failed to terminate academic path." }, { status: 500 });
  }
}
