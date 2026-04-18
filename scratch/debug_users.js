import { query } from "../src/lib/db.js";

async function debugUsers() {
  try {
    console.log("--- Institutional User Audit ---");
    const users = await query("SELECT id, username, role, full_name, LENGTH(password) as pass_len, LEFT(password, 7) as pass_prefix FROM users LIMIT 10");
    console.log("Summary of users found:", users.length);
    console.table(users);
    
    const admin = users.find(u => u.username === 'admin');
    if (admin) {
      console.log("Admin account identified.");
    } else {
      console.warn("CRITICAL: Default admin account missing from registry.");
    }
  } catch (error) {
    console.error("Database Inspection Fault:", error.message);
  }
}

debugUsers();
