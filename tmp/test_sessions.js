const db = require('better-sqlite3')('ajinora.db');
try {
  const result = db.prepare("INSERT INTO sessions (title, description, date, time, link, course_id) VALUES (?, ?, ?, ?, ?, ?)").run('Test', '', '2026-04-01', '10:00', 'https://zoom.us/j/123', null);
  console.log('INSERT OK:', result.lastInsertRowid);
  db.prepare("DELETE FROM sessions WHERE id = ?").run(result.lastInsertRowid);
} catch(e) {
  console.log('ERROR:', e.message);
}

try {
  const rows = db.prepare("SELECT s.*, c.title as course_title FROM sessions s LEFT JOIN courses c ON s.course_id = c.id ORDER BY s.date DESC").all();
  console.log('SELECT OK:', JSON.stringify(rows));
} catch(e) {
  console.log('SELECT ERROR:', e.message);
}
