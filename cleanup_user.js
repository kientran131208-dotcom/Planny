
const Database = require('better-sqlite3');
const path = require('path');

const dbPath = path.resolve(__dirname, 'prisma/dev.db');
const db = new Database(dbPath);

try {
  const result = db.prepare("DELETE FROM User WHERE email = ?").run('kientran131208@gmail.com');
  console.log(`Successfully deleted user kientran131208@gmail.com. Changes: ${result.changes}`);
} catch (err) {
  console.error("Error deleting user:", err);
} finally {
  db.close();
}
