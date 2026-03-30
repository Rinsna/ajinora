import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string, contentId: string, assetId: string }> }) {
  const { assetId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { title, details } = await request.json();
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    
    if (title !== undefined) { fields.push("title = ?"); values.push(title); }
    if (details !== undefined) { fields.push("details = ?"); values.push(details); }
    
    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }
    
    values.push(assetId);
    await query(`UPDATE module_assets SET ${fields.join(", ")} WHERE id = ?`, values);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Asset Modification Fault:", error);
    return NextResponse.json({ error: "Failed to modify institutional asset." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string, contentId: string, assetId: string }> }) {
  const { assetId } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    await query("DELETE FROM module_assets WHERE id = ?", [assetId]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Asset Removal Fault:", error);
    return NextResponse.json({ error: "Failed to remove institutional asset." }, { status: 500 });
  }
}
