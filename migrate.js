const { Client } = require('pg');

const DATABASE_URL = "postgresql://neondb_owner:npg_EXfh5zcYB1Ub@ep-spring-cell-a153nap4-pooler.ap-southeast-1.aws.neon.tech/neondb?channel_binding=require&sslmode=require";

async function migrate() {
  const client = new Client({
    connectionString: DATABASE_URL,
    ssl: { rejectUnauthorized: false }
  });

  try {
    await client.connect();
    console.log("Connected to database.");

    const queries = [
      `CREATE TABLE IF NOT EXISTS resource_requests (
        id SERIAL PRIMARY KEY,
        user_id INT NOT NULL,
        topic VARCHAR(255) NOT NULL,
        description TEXT,
        status VARCHAR(20) DEFAULT 'pending',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )`,
      `ALTER TABLE notes ADD COLUMN IF NOT EXISTS course_id INT`,
      `ALTER TABLE notes DROP CONSTRAINT IF EXISTS notes_course_id_fkey`,
      `ALTER TABLE notes ADD CONSTRAINT notes_course_id_fkey FOREIGN KEY (course_id) REFERENCES courses(id) ON DELETE SET NULL`
    ];

    for (const sql of queries) {
      console.log(`Running: ${sql.substring(0, 50)}...`);
      await client.query(sql);
      console.log("✅ Success");
    }

    console.log("Migration completed successfully.");
  } catch (err) {
    console.error("❌ Migration failed:", err.message);
  } finally {
    await client.end();
  }
}

migrate();
