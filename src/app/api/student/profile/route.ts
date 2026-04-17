import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PUT(req: Request) {
  try {
    const session = await getSession();
    if (!session || session.role !== "student") {
      return NextResponse.json({ error: "Unauthorized access" }, { status: 401 });
    }

    const { password } = await req.json();

    if (!password) {
      return NextResponse.json({ error: "Password is required" }, { status: 400 });
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const result: any = await query(
      "UPDATE users SET password = ? WHERE id = ? AND role = 'student'",
      [hashedPassword, session.user.id]
    );

    if (result.affectedRows === 0) {
      return NextResponse.json({ error: "User not found or no changes applied" }, { status: 404 });
    }

    return NextResponse.json({ success: true, message: "Password updated successfully" });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return NextResponse.json({ error: error.message || "Failed to update profile" }, { status: 500 });
  }
}
