import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  const { id } = params;

  try {
    const results = await query(`
      SELECT er.*, ma.title as assetTitle 
      FROM exercise_results er
      LEFT JOIN module_assets ma ON er.asset_id = ma.id
      WHERE er.user_id = ?
      ORDER BY er.created_at DESC
    `, [id]);

    return NextResponse.json(results);
  } catch (error) {
    console.error("Admin Fetch Student Results Error:", error);
    return NextResponse.json({ error: "Institutional system fault." }, { status: 500 });
  }
}
