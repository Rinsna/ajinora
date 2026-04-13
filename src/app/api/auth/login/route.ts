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
      console.warn(`[Auth Debug] User not found: ${username}`);
      return NextResponse.json({ 
        error: "Invalid institutional credentials.",
        debug: "USER_NOT_FOUND",
        db_status: "connected"
      }, { status: 401 });
    }

    const user = users[0];
    console.log(`[Auth Debug] Attempting login for user: ${username}`);

    // Robust Password Check:
    // 1. Try Bcrypt first (Modern security)
    // 2. Fallback to Plaintext check (Essential for manual SQL insertion during setup)
    let isMatched = false;
    try {
      const storedHash = String(user.password || "");
      isMatched = await bcrypt.compare(password, storedHash);
      console.log(`[Auth Debug] Bcrypt match: ${isMatched}`);
    } catch (e) {
      // If bcrypt fails (e.g. data is not a hash), fallback to direct comparison
      isMatched = password === user.password;
      console.log(`[Auth Debug] Bcrypt error, fallback match: ${isMatched}`);
    }

    // Final direct check to ensure 'admin123' works for manual setup
    if (!isMatched) {
      isMatched = password === user.password;
      console.log(`[Auth Debug] Final plaintext check: ${isMatched}`);
    }

    if (!isMatched) {
      console.warn(`[Auth Debug] Access Denied for: ${username}`);
      return NextResponse.json({ 
        error: "Access Denied. Verification failed.",
        debug: "PASSWORD_MISMATCH",
        hash_format: user.password?.substring(0, 10),
        attempted_user: username
      }, { status: 401 });
    }

    // Success: create session
    await login({
      id: user.id,
      username: user.username,
      role: user.role,
      full_name: user.full_name
    });

    return NextResponse.json({ 
      success: true, 
      user: { id: user.id, username: user.username, role: user.role, full_name: user.full_name } 
    });

  } catch (error: any) {
    console.error("Critical Auth Fault:", error?.message || error);
    return NextResponse.json({ error: error?.message || "System infrastructure error." }, { status: 500 });
  }
}
