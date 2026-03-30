import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string, contentId: string }> }) {
  const { contentId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const assets = await query("SELECT * FROM module_assets WHERE module_id = ? ORDER BY created_at ASC", [contentId]);
    return NextResponse.json(assets);
  } catch (error) {
    console.error("Asset Retrieval Fault:", error);
    return NextResponse.json({ error: "Failed to pull module assets." }, { status: 500 });
  }
}

export async function POST(request: Request, { params }: { params: Promise<{ id: string, contentId: string }> }) {
  const { contentId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, type, details } = await request.json();
    if (!title || !type) {
      return NextResponse.json({ error: "Required fields missing." }, { status: 400 });
    }

    const result: any = await query("INSERT INTO module_assets (module_id, title, type, details) VALUES (?, ?, ?, ?)", [contentId, title, type, details]);
    return NextResponse.json({ id: result.insertId, title, type, details });
  } catch (error) {
    console.error("Asset Injection Fault:", error);
    return NextResponse.json({ error: "Failed to inject institutional asset." }, { status: 500 });
  }
}
