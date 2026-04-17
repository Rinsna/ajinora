import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";

export async function GET(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const certificates = await query(
      "SELECT * FROM student_certificates WHERE user_id = ? ORDER BY issued_at DESC",
      [session.user.id]
    );

    return NextResponse.json(certificates);
  } catch (error) {
    console.error("Fetch Student Certificates Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
