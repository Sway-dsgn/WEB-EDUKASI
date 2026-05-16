// =============================================
//   EDUVIX.ID — Backend Server (SQLite)
//   Tidak perlu install MySQL!
//   Data tersimpan di file eduvix.db
// =============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const Database = require('better-sqlite3');

require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'eduvix_rahasia_123';
const PORT = process.env.PORT || 5000;

// ─── BUAT / BUKA DATABASE ─────────────────────
const db = new Database(path.join(__dirname, 'eduvix.db'));
db.pragma('journal_mode = WAL');

// Buat semua tabel otomatis
db.exec(`
  CREATE TABLE IF NOT EXISTS users (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    nama       TEXT    NOT NULL,
    username   TEXT    NOT NULL UNIQUE,
    password   TEXT    NOT NULL,
    xp         INTEGER DEFAULT 0,
    coins      INTEGER DEFAULT 0,
    level      INTEGER DEFAULT 1,
    streak     INTEGER DEFAULT 0,
    avatarType TEXT    DEFAULT 'initial',
    avatarValue TEXT   DEFAULT NULL,
    avatarBorder TEXT  DEFAULT 'none',
    last_login TEXT    DEFAULT NULL,
    created_at TEXT    DEFAULT (datetime('now'))
  );
  CREATE TABLE IF NOT EXISTS quiz_hasil (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    quiz_id    TEXT    DEFAULT 'default',
    skor       INTEGER DEFAULT 0,
    benar      INTEGER DEFAULT 0,
    salah      INTEGER DEFAULT 0,
    total      INTEGER DEFAULT 0,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
  CREATE TABLE IF NOT EXISTS materi_progress (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    materi_id  TEXT    NOT NULL,
    selesai_at TEXT    DEFAULT (datetime('now')),
    UNIQUE(user_id, materi_id),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─── MIGRATION: Tambah kolom jika belum ada ─────
console.log('🔄 Memeriksa pembaruan database...');
const migrations = [
  { table: 'users', name: 'xp', type: 'INTEGER DEFAULT 0' },
  { table: 'users', name: 'coins', type: 'INTEGER DEFAULT 0' },
  { table: 'users', name: 'level', type: 'INTEGER DEFAULT 1' },
  { table: 'users', name: 'streak', type: 'INTEGER DEFAULT 0' },
  { table: 'users', name: 'avatarType', type: "TEXT DEFAULT 'initial'" },
  { table: 'users', name: 'avatarValue', type: 'TEXT DEFAULT NULL' },
  { table: 'users', name: 'avatarBorder', type: "TEXT DEFAULT 'none'" },
  { table: 'users', name: 'badge', type: "TEXT DEFAULT 'Pelajar Aktif'" },
  { table: 'users', name: 'last_login', type: 'TEXT DEFAULT NULL' },
  { table: 'quiz_hasil', name: 'quiz_id', type: "TEXT DEFAULT 'default'" }
];

migrations.forEach(m => {
  try {
    // Cek dulu apakah kolom sudah ada (lebih aman)
    const info = db.prepare(`PRAGMA table_info(${m.table})`).all();
    const exists = info.some(col => col.name === m.name);
    
    if (!exists) {
      db.prepare(`ALTER TABLE ${m.table} ADD COLUMN ${m.name} ${m.type}`).run();
      console.log(`✅ Migrasi: Kolom '${m.name}' ditambahkan ke '${m.table}'.`);
    }
  } catch (e) {
    console.error(`❌ Gagal migrasi kolom '${m.name}':`, e.message);
  }
});

console.log('✅ Database SQLite siap!');

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── HELPER ───────────────────────────────────
const hitungLevel = xp => Math.floor(xp / 100) + 1;
const makeToken = user => jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token tidak valid' }); }
}

function prosesStreak(user) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const last = user.last_login ? user.last_login.split('T')[0] : null;
  let streak = user.streak || 0;
  let naik = false;
  if (last === today) { /* sudah login */ }
  else if (last === yesterday) { streak++; naik = true; }
  else { streak = 1; }
  db.prepare('UPDATE users SET streak=?, last_login=? WHERE id=?').run(streak, new Date().toISOString(), user.id);
  return { streak, naik };
}

// =============================================
//   AUTH
// =============================================
app.post('/api/auth/register', (req, res) => {
  const { nama, username, password } = req.body;
  if (!nama || !username || !password) return res.status(400).json({ error: 'Semua field wajib diisi' });
  if (username.length < 3) return res.status(400).json({ error: 'Username min 3 karakter' });
  if (password.length < 6) return res.status(400).json({ error: 'Password min 6 karakter' });
  if (db.prepare('SELECT id FROM users WHERE username=?').get(username))
    return res.status(400).json({ error: 'Username sudah dipakai' });

  const hash = bcrypt.hashSync(password, 10);
  const result = db.prepare('INSERT INTO users (nama,username,password,last_login) VALUES (?,?,?,?)')
    .run(nama, username, hash, new Date().toISOString());
  const newUser = { id: result.lastInsertRowid, username, nama };
  res.status(201).json({ message: 'Registrasi berhasil!', token: makeToken(newUser), user: { ...newUser, xp: 0, coins: 0, level: 1, streak: 1, avatarType: 'initial', avatarBorder: 'none' } });
});

app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  console.log(`Attempting login for username: ${username}`);
  if (!username || !password) return res.status(400).json({ error: 'Username & password wajib' });
  const user = db.prepare('SELECT * FROM users WHERE username=?').get(username);
  if (!user) {
    console.log(`Login failed: Username '${username}' not found.`);
    return res.status(401).json({ error: 'Username tidak ditemukan' });
  }
  if (!bcrypt.compareSync(password, user.password)) {
    console.log(`Login failed for '${username}': Incorrect password.`);
    return res.status(401).json({ error: 'Password salah' });
  }
  const streakInfo = prosesStreak(user);
  res.json({
    message: 'Login berhasil!',
    token: makeToken(user),
    user: {
      id: user.id, nama: user.nama, username: user.username, xp: user.xp, coins: user.coins,
      level: hitungLevel(user.xp), streak: streakInfo.streak, streakNaik: streakInfo.naik,
      avatarType: user.avatarType, avatarValue: user.avatarValue, avatarBorder: user.avatarBorder
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const u = db.prepare('SELECT id,nama,username,xp,coins,level,streak,last_login,created_at,avatarType,avatarValue,avatarBorder FROM users WHERE id=?').get(req.user.id);
  if (!u) return res.status(404).json({ error: 'User tidak ditemukan' });
  res.json({ ...u, level: hitungLevel(u.xp) });
});

// =============================================
//   USER
// =============================================
app.post('/api/user/xp', authMiddleware, (req, res) => {
  const { jumlah } = req.body;
  if (!jumlah || jumlah <= 0) return res.status(400).json({ error: 'Jumlah XP tidak valid' });
  const user = db.prepare('SELECT xp FROM users WHERE id=?').get(req.user.id);
  const xpBaru = user.xp + jumlah;
  const lvl = hitungLevel(xpBaru);
  db.prepare('UPDATE users SET xp=?,level=? WHERE id=?').run(xpBaru, lvl, req.user.id);
  res.json({ xp: xpBaru, level: lvl });
});

app.post('/api/user/coins', authMiddleware, (req, res) => {
  const { jumlah } = req.body;
  if (!jumlah || jumlah <= 0) return res.status(400).json({ error: 'Jumlah koin tidak valid' });
  const user = db.prepare('SELECT coins FROM users WHERE id=?').get(req.user.id);
  const koinBaru = (user.coins || 0) + jumlah;
  db.prepare('UPDATE users SET coins=? WHERE id=?').run(koinBaru, req.user.id);
  res.json({ coins: koinBaru });
});

app.post('/api/user/avatar', authMiddleware, (req, res) => {
  const { avatarType, avatarValue } = req.body;
  if (!['initial', 'icon', 'image'].includes(avatarType)) return res.status(400).json({ error: 'Tipe avatar tidak valid' });
  db.prepare('UPDATE users SET avatarType=?, avatarValue=? WHERE id=?').run(avatarType, avatarValue, req.user.id);
  res.json({ message: 'Avatar berhasil diupdate!', avatarType, avatarValue });
});

app.post('/api/user/border', authMiddleware, (req, res) => {
  const { avatarBorder } = req.body;
  if (!avatarBorder) return res.status(400).json({ error: 'Border avatar tidak valid' });
  db.prepare('UPDATE users SET avatarBorder=? WHERE id=?').run(avatarBorder, req.user.id);
  res.json({ message: 'Border avatar berhasil diupdate!', avatarBorder });
});

app.post('/api/user/badge', authMiddleware, (req, res) => {
  const { badge } = req.body;
  if (!badge) return res.status(400).json({ error: 'Badge tidak valid' });
  db.prepare('UPDATE users SET badge=? WHERE id=?').run(badge, req.user.id);
  res.json({ message: 'Badge berhasil diupdate!', badge });
});

app.post('/api/user/streak', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT * FROM users WHERE id=?').get(req.user.id);
  res.json(prosesStreak(user));
});

// =============================================
//   QUIZ
// =============================================
app.post('/api/quiz/hasil', authMiddleware, (req, res) => {
  const { quiz_id, skor, benar, salah, total } = req.body;
  
  // Hitung XP dan Koin
  const xpDapat = Math.round((benar / (total || 1)) * 50);
  const koinDapat = Math.round((benar / (total || 1)) * 20) + (skor >= 80 ? 50 : 10);

  const user = db.prepare('SELECT xp, coins FROM users WHERE id=?').get(req.user.id);
  const xpBaru = (user.xp || 0) + xpDapat;
  const koinBaru = (user.coins || 0) + koinDapat;
  const levelBaru = hitungLevel(xpBaru);

  db.prepare('INSERT INTO quiz_hasil (user_id,quiz_id,skor,benar,salah,total) VALUES (?,?,?,?,?,?)')
    .run(req.user.id, quiz_id || 'default', skor, benar, salah, total);
  
  db.prepare('UPDATE users SET xp=?, coins=?, level=? WHERE id=?')
    .run(xpBaru, koinBaru, levelBaru, req.user.id);

  res.json({ 
    message: 'Hasil quiz disimpan!', 
    xpDapat, 
    koinDapat,
    xpBaru, 
    koinBaru,
    level: levelBaru 
  });
});

app.get('/api/quiz/riwayat', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM quiz_hasil WHERE user_id=? ORDER BY created_at DESC LIMIT 20').all(req.user.id));
});

// =============================================
//   MATERI
// =============================================
app.post('/api/materi/selesai', authMiddleware, (req, res) => {
  const { materi_id, xp_materi } = req.body;
  
  // Cek apakah sudah pernah selesai
  const exist = db.prepare('SELECT id FROM materi_progress WHERE user_id=? AND materi_id=?').get(req.user.id, materi_id);
  if (exist) return res.json({ message: 'Materi sudah pernah diselesaikan', xpDapat: 0, koinDapat: 0 });

  db.prepare('INSERT INTO materi_progress (user_id,materi_id) VALUES (?,?)').run(req.user.id, materi_id);
  
  const xpDapat = xp_materi || 50;
  const koinDapat = 25; // Hadiah koin per materi

  const user = db.prepare('SELECT xp, coins FROM users WHERE id=?').get(req.user.id);
  const xpBaru = (user.xp || 0) + xpDapat;
  const koinBaru = (user.coins || 0) + koinDapat;
  const levelBaru = hitungLevel(xpBaru);

  db.prepare('UPDATE users SET xp=?, coins=?, level=? WHERE id=?')
    .run(xpBaru, koinBaru, levelBaru, req.user.id);

  res.json({ 
    message: `Materi selesai! +${xpDapat} XP & +${koinDapat} Koin`, 
    xpDapat, 
    koinDapat,
    xpBaru, 
    koinBaru,
    level: levelBaru 
  });
});

app.get('/api/materi/progress', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT materi_id,selesai_at FROM materi_progress WHERE user_id=?').all(req.user.id));
});

// =============================================
//   LEADERBOARD
// =============================================
app.get('/api/leaderboard', (req, res) => {
  res.json(db.prepare('SELECT username,nama,xp,level,streak FROM users ORDER BY xp DESC LIMIT 10').all());
});

app.get('/', (req, res) => res.json({ status: '✅ EDUVIX.ID API jalan!', db: 'SQLite', port: PORT }));

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📦 Database: eduvix.db`);
});