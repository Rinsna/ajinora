const db = require('better-sqlite3')('ajinora.db');

// Test the users query
try {
  const result = db.prepare('SELECT course_id FROM users WHERE id = ?').all(3);
  console.log('USERS QUERY OK:', JSON.stringify(result));
} catch(e) {
  console.log('USERS ERROR:', e.message);
}

// Check if exam_results table exists and its columns
try {
  const cols = db.prepare('PRAGMA table_info(exam_results)').all();
  console.log('EXAM_RESULTS COLS:', cols.map(c => c.name).join(', '));
} catch(e) {
  console.log('EXAM_RESULTS ERROR:', e.message);
}
