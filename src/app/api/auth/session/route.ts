import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { query } from "@/lib/db";

export async function GET() {
  try {
    const session = await getSession();
    if (!session || !session.user) {
      return NextResponse.json({ user: null }, { status: 200 });
    }

    // Self-healing: If full_name is missing from session (old cookie), fetch it
    if (!session.user.full_name) {
       const users: any = await query("SELECT full_name FROM users WHERE id = ?", [session.user.id]);
       if (users && users.length > 0) {
          session.user.full_name = users[0].full_name;
       }
    }

    return NextResponse.json(session, { status: 200 });
  } catch (error) {
    console.error("Auth Session Error:", error);
    return NextResponse.json({ error: "Failed to fetch session" }, { status: 500 });
  }
}
