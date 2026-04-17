import { NextResponse } from "next/server";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const data = await query("SELECT brand_name, tagline, hero_title, hero_description, logo_url, two_factor_auth, ip_restriction, session_heartbeat FROM global_settings LIMIT 1");
    
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
    // If table doesn't exist yet, return fallback instead of failing
    return NextResponse.json({
       brand_name: "Ajinora",
       tagline: "Next-Gen Learning",
       hero_title: "Empowering the minds of tomorrow",
       hero_description: "A limitless educational ecosystem combining intelligent tools, interactive curriculums, and seamless performance tracking",
       logo_url: ""
    });
  }
}
