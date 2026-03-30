import { NextRequest, NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function middleware(request: NextRequest) {
  const session = await getSession();
  const { pathname } = request.nextUrl;

  // 1. If trying to access admin routes
  if (pathname.startsWith("/admin")) {
    if (!session || session.user.role !== "admin") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 2. If trying to access student routes
  if (pathname.startsWith("/student")) {
    if (!session || session.user.role !== "student") {
      return NextResponse.redirect(new URL("/login", request.url));
    }
  }

  // 3. If already logged in and at login page, redirect to correct dashboard
  if (pathname === "/login" && session) {
    if (session.user.role === "admin") {
      return NextResponse.redirect(new URL("/admin", request.url));
    } else {
      return NextResponse.redirect(new URL("/student", request.url));
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login"],
};
