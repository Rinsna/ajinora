const db = require('better-sqlite3')('ajinora.db');
try {
  const result = db.prepare(`
    SELECT 
      e.*,
      (SELECT COUNT(*) FROM questions q WHERE q.exam_id = e.id) as questions_count,
      r.score as result_score,
      r.total as result_total
    FROM exams e
    LEFT JOIN exam_results r ON e.id = r.exam_id AND r.user_id = ?
    WHERE e.course_id = ?
    ORDER BY e.start_date DESC
  `).all(3, 1);
  console.log('QUERY OK:', JSON.stringify(result));
} catch(e) {
  console.log('QUERY ERROR:', e.message);
}

// Also check if exams table has start_date column
try {
  const cols = db.prepare('PRAGMA table_info(exams)').all();
  console.log('EXAMS COLS:', cols.map(c => c.name).join(', '));
} catch(e) {
  console.log('PRAGMA ERROR:', e.message);
}
