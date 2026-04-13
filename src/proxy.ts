import { NextRequest, NextResponse } from "next/server";
import { decrypt } from "@/lib/auth";

export default async function proxy(request: NextRequest) {
  try {
    const sessionCookie = request.cookies.get("session")?.value;
    const { pathname, host, protocol } = request.nextUrl;

    console.log(`[Proxy] ${protocol}//${host}${pathname}, Cookies: ${JSON.stringify(request.cookies.getAll().map(c => c.name))}`);
    
    let session = null;
    if (sessionCookie) {
      try {
        session = await decrypt(sessionCookie);
        console.log(`[Middleware] Session Decrypted: ${!!session}`);
      } catch (e) {
        console.error("[Middleware] Decrypt failed:", e);
      }
    }

    // 1. If trying to access admin routes
    if (pathname.startsWith("/admin")) {
      if (!session || session.user.role !== "admin") {
        console.log(`[Middleware] Redirecting to /login from ${pathname}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // 2. If trying to access student routes
    if (pathname.startsWith("/student")) {
      if (!session || session.user.role !== "student") {
        console.log(`[Middleware] Redirecting to /login from ${pathname}`);
        return NextResponse.redirect(new URL("/login", request.url));
      }
    }

    // 3. If already logged in and at login page, redirect to correct dashboard
    if (pathname === "/login" && session) {
      const target = session.user.role === "admin" ? "/admin" : "/student";
      console.log(`[Middleware] Redirecting to ${target} from /login`);
      return NextResponse.redirect(new URL(target, request.url));
    }

    return NextResponse.next();
  } catch (error) {
    console.error("[Proxy Error]", error);
    return NextResponse.next();
  }
}

export const config = {
  matcher: ["/admin/:path*", "/student/:path*", "/login"],
};
