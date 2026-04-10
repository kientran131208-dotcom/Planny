const Database = require('better-sqlite3');
const db = new Database('prisma/dev.db');

const users = db.prepare('SELECT id, name, email FROM User').all();
console.log('Users in database:');
console.log(JSON.stringify(users, null, 2));

db.close();
