import { encrypt, decrypt } from "./crypto";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";


export async function login(user: { id: number; username: string; role: string; full_name?: string }) {
  const expires = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 hours
  const session = await encrypt({ user, expires });

  (await cookies()).set("session", session, { 
    expires, 
    httpOnly: true, 
    path: "/", 
    sameSite: "lax", 
    secure: false 
  });
}

export async function logout() {
  (await cookies()).set("session", "", { expires: new Date(0), path: "/" });
}

export async function getSession() {
  const session = (await cookies()).get("session")?.value;
  if (!session) return null;
  return await decrypt(session);
}

export async function updateSession(request: NextRequest) {
  const session = request.cookies.get("session")?.value;
  if (!session) return;

  const parsed = await decrypt(session);
  parsed.expires = new Date(Date.now() + 24 * 60 * 60 * 1000);
  const res = NextResponse.next();
  res.cookies.set({
    name: "session",
    value: await encrypt(parsed),
    httpOnly: true,
    expires: parsed.expires,
    path: "/",
    sameSite: "lax",
    secure: false,
  });
  return res;
}
