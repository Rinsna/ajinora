import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
  const response = NextResponse.json({ success: true, message: "Logged out from institutional mainframe." });
  response.cookies.set("session", "", { expires: new Date(0), path: "/" });
  
  return response;
}
