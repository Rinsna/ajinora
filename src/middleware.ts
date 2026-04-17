import { NextRequest, NextResponse } from "next/server";
import { jwtVerify } from "jose";

const secretKey = "ajinora-lms-super-secret-key-change-this-in-env"; 
const key = new TextEncoder().encode(secretKey);

export async function middleware(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    const { pathname, host, protocol } = request.nextUrl;

    console.log(`[Middleware] Processing ${pathname}`);
    
    let session = null;
    if (sessionCookie) {
      try {
        const { payload } = await jwtVerify(sessionCookie, key, {
          algorithms: ["HS256"],
        });
        session = payload;
      } catch (e) {
        console.error("[Middleware] Token invalid or expired");
      }
    }

    // 1. If trying to access admin routes
    if (pathname.startsWith("/admin")) {
      if (!session || !session.user || session.user.role !== "admin") {
        console.log(`[Middleware] Admin access denied for ${pathname}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // 2. If trying to access student routes
    if (pathname.startsWith("/student")) {
      if (!session || !session.user || session.user.role !== "student") {
        console.log(`[Middleware] Student access denied for ${pathname}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // 3. If already logged in and at login page, redirect to correct dashboard
    if (pathname === "/login" && session && session.user) {
      const target = session.user.role === "admin" ? "/admin" : "/student";
      console.log(`[Middleware] Already logged in, redirecting to ${target}`);
      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Middleware Critical Error]", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login"],
};
