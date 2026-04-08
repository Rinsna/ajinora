import { NextResponse } from "next/server";
import { getSession } from "@/lib/auth";
import { writeFile, mkdir } from "fs/promises";
import { join } from "path";

// 📦 Zero-Dependency Archival Sync Engine v1.2
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

    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    const uploadDir = join(process.cwd(), "public", "uploads");
    await mkdir(uploadDir, { recursive: true });

    const uniqueId = Date.now().toString(36) + Math.random().toString(36).substring(2, 5);
    const uniqueFilename = `${uniqueId}-${file.name.replace(/\s+/g, "_")}`;
    const path = join(uploadDir, uniqueFilename);
    const publicUrl = `/uploads/${uniqueFilename}`;

    await writeFile(path, buffer);

    return NextResponse.json({ url: publicUrl });
  } catch (error) {
    console.error("Institutional Upload Fault:", error);
    return NextResponse.json({ error: "Failed to commit artifact to archives." }, { status: 500 });
  }
}
