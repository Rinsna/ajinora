import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { query } from "@/lib/db";
import { login } from "@/lib/auth";

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json();

    if (!username || !password) {
      return NextResponse.json({ error: "Missing required identification." }, { status: 400 });
    }

    const users: any = await query("SELECT * FROM users WHERE username = ?", [username]);

    if (!users || users.length === 0) {
      return NextResponse.json({ error: "Invalid institutional credentials." }, { status: 401 });
    }

    const user = users[0];

    // Robust Password Check:
    // 1. Try Bcrypt first (Modern security)
    // 2. Fallback to Plaintext check (Essential for manual SQL insertion during setup)
    let isMatched = false;
    try {
      isMatched = await bcrypt.compare(password, user.password);
    } catch (e) {
      // If bcrypt fails (e.g. data is not a hash), fallback to direct comparison
      isMatched = password === user.password;
    }

    // Final direct check to ensure 'admin123' works for manual setup
    if (!isMatched) {
      isMatched = password === user.password;
    }

    if (!isMatched) {
      return NextResponse.json({ error: "Access Denied. Verification failed." }, { status: 401 });
    }

    // Success: create session
    await login({
      id: user.id,
      username: user.username,
      role: user.role
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username, role: user.role } 
    });

  } catch (error: any) {
    console.error("Critical Auth Fault:", error?.message || error);
    return NextResponse.json({ error: error?.message || "System infrastructure error." }, { status: 500 });
  }
}
