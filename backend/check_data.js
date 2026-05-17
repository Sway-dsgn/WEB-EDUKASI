const Database = require('better-sqlite3');
const db = new Database('eduvix.db');

const users = db.prepare('SELECT id, username, xp FROM users').all();
const results = db.prepare('SELECT * FROM quiz_hasil').all();

console.log('--- USERS ---');
console.log(users);
console.log('--- QUIZ RESULTS ---');
console.log(results);

db.close();
