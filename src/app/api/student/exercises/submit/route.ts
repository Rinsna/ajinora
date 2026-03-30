import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
     return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { assetId, score, totalPoints, correctCount, totalQuestions, percentage } = await request.json();
    
    // Create table if it doesn't exist (primitive migration)
    await query(`
      CREATE TABLE IF NOT EXISTS exercise_results (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        asset_id INT NOT NULL,
        score INT NOT NULL,
        total_points INT NOT NULL,
        correct_count INT NOT NULL,
        total_questions INT NOT NULL,
        percentage INT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await query(
      "INSERT INTO exercise_results (user_id, asset_id, score, total_points, correct_count, total_questions, percentage) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [session.user.id, assetId, score, totalPoints, correctCount, totalQuestions, percentage]
    );

    // Calculate Rank (based on percentage in same asset)
    const result: any = await query(`
      SELECT COUNT(*) + 1 as rank 
      FROM exercise_results 
      WHERE asset_id = ? AND percentage > ?
    `, [assetId, percentage]);
    
    const rank = result[0]?.rank || 1;

    // Log Activity
    await query(
      "INSERT INTO activity_logs (user_id, action) VALUES (?, ?)",
      [session.user.id, `Completed Exercise ID: ${assetId} with score ${percentage}%`]
    );

    return NextResponse.json({ success: true, rank });
  } catch (error) {
    console.error("Exercise Submission Fault:", error);
    return NextResponse.json({ error: "Failed to record exercise protocol." }, { status: 500 });
  }
}
