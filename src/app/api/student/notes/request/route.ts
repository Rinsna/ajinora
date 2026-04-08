import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.user.role !== 'student') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 403 });
  }

  try {
    const { topic, description } = await request.json();

    if (!topic || !description) {
      return NextResponse.json({ error: "Required parameters missing." }, { status: 400 });
    }

    // Ensure the table exists
    await query(`
      CREATE TABLE IF NOT EXISTS resource_requests (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        topic VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    await query(
      "INSERT INTO resource_requests (user_id, topic, description) VALUES (?, ?, ?)",
      [session.user.id, topic, description]
    );

    return NextResponse.json({ success: true, message: "Request deployed to administration." });
  } catch (error) {
    console.error("Resource Request Error:", error);
    return NextResponse.json({ error: "Institutional system fault." }, { status: 500 });
  }
}
