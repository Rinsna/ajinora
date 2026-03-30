import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { assetId } = await request.json();
    if (!assetId) {
        return NextResponse.json({ error: "No asset identification provided." }, { status: 400 });
    }

    // Create table if it doesn't exist (primitive migration)
    await query(`
      CREATE TABLE IF NOT EXISTS student_asset_completions (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        asset_id INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE (user_id, asset_id)
      )
    `);

    // Insert completion record
    await query(
      `INSERT INTO student_asset_completions (user_id, asset_id) 
       VALUES (?, ?) 
       ON CONFLICT (user_id, asset_id) DO NOTHING`,
      [session.user.id, assetId]
    );

    return NextResponse.json({ success: true, message: "Asset verification recorded." });
  } catch (error) {
    console.error("Asset Completion Error:", error);
    return NextResponse.json({ error: "Institutional system failure." }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { assetId } = await request.json();
    if (!assetId) {
        return NextResponse.json({ error: "No asset identification provided." }, { status: 400 });
    }

    await query(
      "DELETE FROM student_asset_completions WHERE user_id = ? AND asset_id = ?",
      [session.user.id, assetId]
    );

    return NextResponse.json({ success: true, message: "Verification removed." });
  } catch (error) {
    console.error("Asset Completion Removal Error:", error);
    return NextResponse.json({ error: "Institutional system failure." }, { status: 500 });
  }
}
