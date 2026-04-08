import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  try {
    const requests = await query(`
      SELECT rr.*, u.full_name as studentName, u.username as studentId
      FROM resource_requests rr
      LEFT JOIN users u ON rr.user_id = u.id
      ORDER BY rr.created_at DESC
    `);

    return NextResponse.json(requests);
  } catch (error) {
    console.error("Admin Fetch Requests Error:", error);
    return NextResponse.json({ error: "Institutional system fault." }, { status: 500 });
  }
}

export async function PATCH(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  try {
    const { id, status } = await request.json();
    console.log(`Admin Updating Request ${id} to ${status}`);
    
    if (!id || !status) {
      return NextResponse.json({ error: "Missing identity or status protocols." }, { status: 400 });
    }

    await query("UPDATE resource_requests SET status = ? WHERE id = ?", [status, Number(id)]);
    return NextResponse.json({ success: true, message: "Request protocol synchronized." });
  } catch (error: any) {
    console.error("Admin Request PATCH Error:", error);
    return NextResponse.json({ error: "Update logic failure." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  try {
    if (!id) return NextResponse.json({ error: "Missing identity protocol." }, { status: 400 });
    
    await query("DELETE FROM resource_requests WHERE id = ?", [Number(id)]);
    return NextResponse.json({ success: true, message: "Request decommissioned." });
  } catch (error: any) {
    console.error("Admin Request DELETE Error:", error);
    return NextResponse.json({ error: "Decommissioning failure." }, { status: 500 });
  }
}
