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

    // Capacity Check (Platform Limits)
    // Vercel Functions have a hard limit of 4.5MB for the request body.
    if (process.env.VERCEL && file.size > 4.5 * 1024 * 1024) {
      return NextResponse.json({ 
        error: "Artifact exceeds Vercel's platform capacity (4.5MB).",
        diagnostic: "Vercel Functions have a max payload of 4.5MB. For larger files, use direct-to-blob client-side uploads."
      }, { status: 413 });
    }

    // Capacity Check (Institutional Policies)
    if (file.size > 50 * 1024 * 1024) {
      return NextResponse.json({ error: "Artifact exceeds institutional capacity (50MB)." }, { status: 413 });
    }

    const sanitizedName = (file.name || "artifact").replace(/[^a-zA-Z0-9.\-_]/g, "_").slice(-100);
    const uniqueId = Date.now().toString(36);
    const uniqueFilename = `${uniqueId}-${sanitizedName}`;

    // --- PRODUCTION: Use Vercel Blob ---
    if (process.env.BLOB_READ_WRITE_TOKEN) {
      try {
        console.log(`[Blob Sync] Attempting upload: ${uniqueFilename}, Size: ${file.size}`);
        const blob = await put(uniqueFilename, file, {
          access: "public",
        });
        console.log(`[Blob Sync] Success: ${blob.url}`);
        return NextResponse.json({ url: blob.url });
      } catch (blobError: any) {
        console.error("[Blob Sync] Vercel Blob transfer fail:", blobError.message);
        throw new Error(`Cloud storage commitment failed: ${blobError.message}`);
      }
    }

    // --- DEVELOPMENT FALLBACK: Use local filesystem ---
    // CAUTION: Vercel environment is read-only. We MUST have BLOB_READ_WRITE_TOKEN in production.
    if (process.env.VERCEL) {
      console.error("[Upload Fault] Missing BLOB_READ_WRITE_TOKEN on Vercel environment.");
      return NextResponse.json({ 
        error: "Cloud storage protocol not initialized.",
        diagnostic: "BLOB_READ_WRITE_TOKEN is missing in Vercel environment variables. Local filesystem is read-only on Vercel."
      }, { status: 500 });
    }

    console.log(`[Local Sync] Committing artifact to local archive: ${uniqueFilename}`);
    
    let arrayBuffer;
    try {
      arrayBuffer = await file.arrayBuffer();
      console.log(`[Local Sync] ArrayBuffer generated, size: ${arrayBuffer.byteLength}`);
    } catch (err: any) {
      console.error("[Local Sync] Failed to get ArrayBuffer:", err.message);
      throw new Error(`Failed to process file data: ${err.message}`);
    }

    const uint8Array = new Uint8Array(arrayBuffer);
    const uploadDir = join(process.cwd(), "public", "uploads");
    
    try {
      console.log(`[Local Sync] Ensuring directory exists: ${uploadDir}`);
      await mkdir(uploadDir, { recursive: true });
    } catch (err: any) {
      console.error("[Local Sync] Failed to create directory:", err.message);
      throw new Error(`Directory creation failed: ${err.message}`);
    }

    const path = join(uploadDir, uniqueFilename);
    try {
      console.log(`[Local Sync] Writing file to: ${path}`);
      await writeFile(path, uint8Array);
    } catch (err: any) {
      console.error("[Local Sync] Failed to write file:", err.message);
      throw new Error(`File write failed: ${err.message}`);
    }

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
