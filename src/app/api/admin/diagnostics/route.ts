import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";

export async function GET() {
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    status: "online",
    environment: process.env.NODE_ENV,
    isVercel: !!process.env.VERCEL,
    blobTokenPresent: !!process.env.BLOB_READ_WRITE_TOKEN,
    blobTokenPreview: process.env.BLOB_READ_WRITE_TOKEN ? `${process.env.BLOB_READ_WRITE_TOKEN.slice(0, 5)}...` : "missing",
    databaseUrlPresent: !!process.env.DATABASE_URL,
    nextPublicUrl: process.env.NEXT_PUBLIC_APP_URL || "not set"
  });
}
