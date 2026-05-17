const Database = require('better-sqlite3');
const db = new Database('eduvix.db');

// Beri XP ke user yang masih 0
db.prepare("UPDATE users SET xp = 350 WHERE id = 2").run();
db.prepare("UPDATE users SET xp = 420 WHERE id = 3").run();
db.prepare("UPDATE users SET xp = 150 WHERE id = 4").run();
db.prepare("UPDATE users SET xp = 850 WHERE id = 5").run(); // Akun Admin

// Tambah data kuis buatan biar tidak 0
const stmt = db.prepare("INSERT INTO quiz_hasil (user_id, quiz_id, skor, benar, salah, total) VALUES (?, ?, ?, ?, ?, ?)");

// User 2
stmt.run(2, 'materi_1', 80, 8, 2, 10);
// User 3
stmt.run(3, 'materi_1', 70, 7, 3, 10);
// User 4
stmt.run(4, 'materi_1', 90, 9, 1, 10);
// User 5 (Admin)
stmt.run(5, 'materi_1', 100, 10, 0, 10);
stmt.run(5, 'materi_2', 90, 9, 1, 10);

console.log("Dummy data berhasil di-inject!");
db.close();
