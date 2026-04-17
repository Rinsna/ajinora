import { NextResponse } from "next/server";
import { query } from "@/lib/db";
import { getSession } from "@/lib/auth";
import bcrypt from "bcryptjs";

export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    const { fullName, username, courseId, password } = await request.json();
    
    // Build update query dynamically
    const fields = [];
    const values = [];
    
    if (fullName) { fields.push("full_name = ?"); values.push(fullName); }
    if (username) { fields.push("username = ?"); values.push(username); }
    if (courseId) { fields.push("course_id = ?"); values.push(parseInt(courseId)); }
    if (password) {
      const hashedPassword = await bcrypt.hash(password, 10);
      fields.push("password = ?"); 
      values.push(hashedPassword);
    }
    
    if (fields.length === 0) {
      return NextResponse.json({ error: "No fields to update." }, { status: 400 });
    }
    
    values.push(id);
    await query(`UPDATE users SET ${fields.join(", ")} WHERE id = ?`, values);
    
    return NextResponse.json({ success: true });
  } catch (error: any) {
    if (error.code === 'ER_DUP_ENTRY') {
      return NextResponse.json({ error: "Username already assigned to another identity." }, { status: 400 });
    }
    console.error("Student Identity Modification Fault:", error);
    return NextResponse.json({ error: "Failed to modify student access parameters." }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const session = await getSession();
  if (!session || session.user.role !== 'admin') {
    return NextResponse.json({ error: "Unauthorized access protocols." }, { status: 401 });
  }

  try {
    await query("DELETE FROM users WHERE id = ?", [id]);
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Student Identity Removal Fault:", error);
    return NextResponse.json({ error: "Failed to terminate student access." }, { status: 500 });
  }
}
