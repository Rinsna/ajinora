import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { put } from "@vercel/blob";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// 📦 Institutional Archival Sync Engine v2.0
// Uses Vercel Blob in production, local filesystem in development

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const formData = await request.formData();
    const file = formData.get("file") as File;

    if (!file) {
      return NextResponse.json({ error: "No artifact detected." }, { status: 400 });
    }

    // Capacity Check (50MB)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Artifact exceeds institutional capacity (50MB)." }, { status: 413 });
    }

    const sanitizedName = file.name.replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
    const uniqueId = Date.now().toString(36);
    const uniqueFilename = `${uniqueId}-${sanitizedName}`;

    // --- PRODUCTION: Use Vercel Blob ---
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      console.log(`[Blob Sync] Committing artifact to Vercel Blob: ${uniqueFilename}`);
      const blob = await put(uniqueFilename, file, {
        access: "public",
      });
      console.log(`[Blob Sync] Success: ${blob.url}`);
      return NextResponse.json({ url: blob.url });
    }

    // --- DEVELOPMENT FALLBACK: Use local filesystem ---
    console.log(`[Local Sync] Committing artifact to local archive: ${uniqueFilename}`);
    const arrayBuffer = await file.arrayBuffer();
    const uint8Array = new Uint8Array(arrayBuffer);
    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });
    const path = join(uploadDir, uniqueFilename);
    await writeFile(path, uint8Array);
    const publicUrl = `/uploads/${uniqueFilename}`;
    console.log(`[Local Sync] Success: ${publicUrl}`);
    return NextResponse.json({ url: publicUrl });

  } catch (error: any) {
    console.error("[Upload Fault]", {
      message: error.message,
      stack: error.stack,
    });
    return NextResponse.json({
      error: "Failed to commit artifact to archives.",
      diagnostic: error.message,
    }, { status: 500 });
  }
}
