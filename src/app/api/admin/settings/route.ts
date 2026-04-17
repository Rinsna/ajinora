import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  
  if (!session || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await query("SELECT * FROM global_settings LIMIT 1");
    // If empty for some reason, return default
    if (data.length === 0) {
      return NextResponse.json({
         brand_name: "Ajinora",
         tagline: "Next-Gen Learning",
         hero_title: "Empowering the minds of tomorrow",
         hero_description: "A limitless educational ecosystem combining intelligent tools, interactive curriculums, and seamless performance tracking",
         logo_url: "",
         two_factor_auth: false,
         ip_restriction: false,
         session_heartbeat: true
      });
    }
    return NextResponse.json(data[0]);
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  
  if (!session || session?.user?.role !== "admin") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { brand_name, tagline, hero_title, hero_description, logo_url, two_factor_auth, ip_restriction, session_heartbeat } = body;

    const sql = `
      UPDATE global_settings 
      SET 
        brand_name = $1, tagline = $2, hero_title = $3, hero_description = $4, logo_url = $5,
        two_factor_auth = $6, ip_restriction = $7, session_heartbeat = $8,
        updated_at = CURRENT_TIMESTAMP
      WHERE id = 1
    `;
    
    await query(sql, [brand_name, tagline, hero_title, hero_description, logo_url, two_factor_auth ? true : false, ip_restriction ? true : false, session_heartbeat ? true : false]);
    
    return NextResponse.json({ success: true, message: "Settings Updated" });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
