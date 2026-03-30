import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    // 1. Get student course_id
    const user: any = await query("SELECT course_id FROM users WHERE id = ?", [session.user.id]);
    if (!user || user.length === 0 || !user[0].course_id) {
        return NextResponse.json({ error: "No academic path assigned. Contact Institutional Support." }, { status: 404 });
    }

    const courseId = user[0].course_id;

    // 2. Get course details
    const course: any = await query("SELECT * FROM courses WHERE id = ?", [courseId]);
    
    // 3. Get course content (modules)
    const content: any = await query("SELECT * FROM course_content WHERE course_id = ? ORDER BY created_at ASC", [courseId]);

    // 4. Get assets for each module with completion status
    const completions: any = await query("SELECT asset_id FROM student_asset_completions WHERE user_id = ?", [session.user.id]);
    const completedIds = Array.isArray(completions) ? completions.map((c: any) => c.asset_id) : [];

    const contentWithAssets = await Promise.all(content.map(async (module: any) => {
      const assets: any = await query("SELECT * FROM module_assets WHERE module_id = ? ORDER BY created_at ASC", [module.id]);
      const assetsWithStatus = assets.map((asset: any) => ({
        ...asset,
        completed: completedIds.includes(asset.id)
      }));
      return { ...module, assets: assetsWithStatus };
    }));

    return NextResponse.json({
        course: course[0],
        content: contentWithAssets
    });
  } catch (error) {
    console.error("Student Course Retrieval Fault:", error);
    return NextResponse.json({ error: "Failed to pull academic path archives." }, { status: 500 });
  }
}
