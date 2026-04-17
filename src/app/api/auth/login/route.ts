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
        error: "Access Denied. Account prefix not recognized.",
        debug: "USER_NOT_FOUND",
        attempted_user: username
      }, { status: 401 });
    }

    const user = users[0];
    console.log(`[Auth Debug] Attempting login for user: ${username}`);

    let isMatched = false;
    try {
      const storedHash = String(user.password || "");
      isMatched = await bcrypt.compare(password, storedHash);
      console.log(`[Auth Debug] Bcrypt match: ${isMatched}`);
    } catch (e) {
      isMatched = password === user.password;
      console.log(`[Auth Debug] Bcrypt error, fallback match: ${isMatched}`);
    }

    if (!isMatched) {
      isMatched = password === user.password;
    }

    if (!isMatched) {
      console.warn(`[Auth Debug] Password mismatch for: ${username}`);
      return NextResponse.json({ 
        error: "Access Denied. Verification failed.",
        debug: "PASSWORD_MISMATCH",
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
