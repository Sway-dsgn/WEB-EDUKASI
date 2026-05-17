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
    last_streak INTEGER DEFAULT 0,
    is_banned INTEGER DEFAULT 0,
    role       TEXT    DEFAULT 'user',
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
  CREATE TABLE IF NOT EXISTS shop_items (
    id         TEXT    PRIMARY KEY,
    nama       TEXT    NOT NULL,
    deskripsi  TEXT    NOT NULL,
    tipe       TEXT    NOT NULL, -- 'avatar', 'border', 'booster'
    harga      INTEGER NOT NULL,
    icon       TEXT    NOT NULL
  );
  CREATE TABLE IF NOT EXISTS user_inventory (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    item_id    TEXT    NOT NULL,
    purchased_at TEXT  DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id),
    FOREIGN KEY (item_id) REFERENCES shop_items(id)
  );
  CREATE TABLE IF NOT EXISTS feedback (
    id         INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id    INTEGER NOT NULL,
    pesan      TEXT    NOT NULL,
    created_at TEXT    DEFAULT (datetime('now')),
    FOREIGN KEY (user_id) REFERENCES users(id)
  );
`);

// ─── INITIAL SHOP ITEMS ──────────────────────
const insertShop = db.prepare('INSERT OR REPLACE INTO shop_items (id, nama, deskripsi, tipe, harga, icon) VALUES (?,?,?,?,?,?)');
insertShop.run('ninja_avatar', 'Cyber Ninja Avatar', 'Avatar ninja futuristik eksklusif.', 'avatar', 200, 'fa-user-ninja');
insertShop.run('xp_booster', 'XP Booster 2x', 'Gandakan perolehan XP selama 24 jam.', 'booster', 300, 'fa-bolt');
insertShop.run('royal_crown', 'Mahkota Kerajaan', 'Simbol kejayaan murid rajin.', 'border', 600, 'fa-crown');
insertShop.run('ghost_avatar', 'Ghost Hunter', 'Avatar hantu yang misterius.', 'avatar', 250, 'fa-ghost');
insertShop.run('fire_border', 'Aura Berapi', 'Border profil dengan efek api.', 'border', 350, 'fa-fire');
insertShop.run('rainbow_infinity', 'Rainbow Infinity', 'Border pelangi yang berubah warna.', 'border', 400, 'fa-circle-notch');


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
  { table: 'users', name: 'last_streak', type: 'INTEGER DEFAULT 0' },
  { table: 'users', name: 'is_banned', type: 'INTEGER DEFAULT 0' },
  { table: 'users', name: 'role', type: "TEXT DEFAULT 'user'" },
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

// Buat akun admin default jika belum ada
try {
  const adminExists = db.prepare('SELECT id FROM users WHERE username=?').get('admin_eduvix');
  const hash = bcrypt.hashSync('EVXLK2091-22', 10);
  
  if (!adminExists) {
    db.prepare("INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)").run('Admin Eduvix', 'admin_eduvix', hash, 'admin');
    console.log('👑 Akun Admin default dibuat!');
  } else {
    // Paksa update password ke yang baru
    db.prepare("UPDATE users SET password=? WHERE username=?").run(hash, 'admin_eduvix');
    console.log('👑 Password Admin berhasil diperbarui!');
  }
} catch (e) {
  console.error('❌ Gagal memproses akun admin:', e.message);
}

console.log('✅ Database SQLite siap!');

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── HELPER ───────────────────────────────────
const hitungLevel = xp => Math.floor((Math.sqrt(0.16 * xp + 9) - 1) / 2);
const makeToken = user => jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada' });
  try { req.user = jwt.verify(token, JWT_SECRET); next(); }
  catch { res.status(401).json({ error: 'Token tidak valid' }); }
}

function adminMiddleware(req, res, next) {
  authMiddleware(req, res, () => {
    const user = db.prepare('SELECT role FROM users WHERE id=?').get(req.user.id);
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Akses Ditolak! Khusus Admin.' });
    }
    next();
  });
}

function prosesStreak(user) {
  const today = new Date().toISOString().split('T')[0];
  const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
  const last = user.last_login ? user.last_login.split('T')[0] : null;
  let streak = user.streak || 0;
  let naik = false;
  let lost = false;
  let oldStreak = streak;

  if (last === today) { /* sudah login */ }
  else if (last === yesterday) { streak++; naik = true; }
  else { 
    lost = true; 
    if (streak > 1) {
      db.prepare('UPDATE users SET last_streak=? WHERE id=?').run(streak, user.id);
    }
    streak = 1; 
  }
  
  db.prepare('UPDATE users SET streak=?, last_login=? WHERE id=?').run(streak, new Date().toISOString(), user.id);
  return { streak, naik, lost, oldStreak };
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
  if (user.is_banned === 1) {
    return res.status(403).json({ error: 'Akun Anda telah diblokir!' });
  }
  const streakInfo = prosesStreak(user);
  res.json({
    message: 'Login berhasil!',
    token: makeToken(user),
    user: {
      id: user.id, nama: user.nama, username: user.username, xp: user.xp, coins: user.coins,
      level: hitungLevel(user.xp), streak: streakInfo.streak, streakNaik: streakInfo.naik,
      streakLost: streakInfo.lost, oldStreak: streakInfo.oldStreak,
      avatarType: user.avatarType, avatarValue: user.avatarValue, avatarBorder: user.avatarBorder
    }
  });
});

app.get('/api/auth/me', authMiddleware, (req, res) => {
  const u = db.prepare('SELECT id,nama,username,xp,coins,level,streak,last_login,created_at,avatarType,avatarValue,avatarBorder,last_streak,is_banned FROM users WHERE id=?').get(req.user.id);
  if (!u) return res.status(404).json({ error: 'User tidak ditemukan' });
  if (u.is_banned === 1) return res.status(403).json({ error: 'Akun Anda telah diblokir!' });
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
//   SHOP & INVENTORY
// =============================================
app.get('/api/shop/items', (req, res) => {
  res.json(db.prepare('SELECT * FROM shop_items').all());
});

app.post('/api/shop/buy', authMiddleware, (req, res) => {
  const { itemId } = req.body;
  const item = db.prepare('SELECT * FROM shop_items WHERE id=?').get(itemId);
  if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' });

  const user = db.prepare('SELECT coins FROM users WHERE id=?').get(req.user.id);
  if ((user.coins || 0) < item.harga) return res.status(400).json({ error: 'Koin tidak cukup' });

  // Cek apakah sudah punya
  const owned = db.prepare('SELECT id FROM user_inventory WHERE user_id=? AND item_id=?').get(req.user.id, itemId);
  if (owned) return res.status(400).json({ error: 'Sudah memiliki item ini' });

  // Proses transaksi
  const koinBaru = user.coins - item.harga;
  db.prepare('UPDATE users SET coins=? WHERE id=?').run(koinBaru, req.user.id);
  db.prepare('INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)').run(req.user.id, itemId);

  res.json({ message: `Berhasil membeli ${item.nama}!`, coins: koinBaru, itemId });
});

app.get('/api/shop/inventory', authMiddleware, (req, res) => {
  const items = db.prepare(`
    SELECT si.*, ui.purchased_at 
    FROM shop_items si
    JOIN user_inventory ui ON si.id = ui.item_id
    WHERE ui.user_id = ?
    ORDER BY ui.purchased_at DESC
  `).all(req.user.id);
  res.json(items);
});

// Endpoint untuk riwayat quiz user
app.get('/api/quiz/riwayat', authMiddleware, (req, res) => {
  res.json(db.prepare('SELECT * FROM quiz_hasil WHERE user_id=? ORDER BY created_at DESC').all(req.user.id));
});

// =============================================
//   FEEDBACK
// =============================================
app.post('/api/feedback', authMiddleware, (req, res) => {
  const { pesan } = req.body;
  if (!pesan) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });

  db.prepare('INSERT INTO feedback (user_id, pesan) VALUES (?, ?)').run(req.user.id, pesan);
  res.json({ message: 'Feedback berhasil dikirim! Terima kasih atas masukan Anda.' });
});

// =============================================
//   STREAK RECOVERY
// =============================================
app.post('/api/streak/recover', authMiddleware, (req, res) => {
  const user = db.prepare('SELECT streak, coins, last_streak FROM users WHERE id=?').get(req.user.id);
  if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
  
  if ((user.coins || 0) < 100) return res.status(400).json({ error: 'Koin tidak cukup (butuh 100 koin)' });
  if (!user.last_streak || user.last_streak <= 1) return res.status(400).json({ error: 'Tidak ada streak yang bisa dipulihkan' });

  const koinBaru = user.coins - 100;
  const streakBaru = user.last_streak; // Restore the old streak

  db.prepare('UPDATE users SET streak=?, coins=?, last_streak=0 WHERE id=?').run(streakBaru, koinBaru, req.user.id);

  res.json({ message: 'Streak berhasil dipulihkan!', streak: streakBaru, coins: koinBaru });
});

// =============================================
//   LEADERBOARD
// =============================================
app.get('/api/leaderboard', (req, res) => {
  const { sort } = req.query;
  let query = '';
  
  if (sort === 'nilai') {
    query = `
      SELECT u.id, u.username, u.nama, u.xp, u.level, COALESCE(SUM(q.skor), 0) as value 
      FROM users u 
      LEFT JOIN quiz_hasil q ON u.id = q.user_id 
      GROUP BY u.id 
      ORDER BY value DESC 
      LIMIT 100
    `;
  } else if (sort === 'akurasi') {
    query = `
      SELECT u.id, u.username, u.nama, u.xp, u.level, 
             CASE WHEN SUM(q.total) > 0 THEN (SUM(q.benar) * 100 / SUM(q.total)) ELSE 0 END as value 
      FROM users u 
      LEFT JOIN quiz_hasil q ON u.id = q.user_id 
      GROUP BY u.id 
      ORDER BY value DESC 
      LIMIT 100
    `;
  } else {
    // Default: XP
    query = 'SELECT id, username, nama, xp as value, level FROM users ORDER BY value DESC LIMIT 100';
  }
  
  const data = db.prepare(query).all();
  res.json(data);
});

// Endpoint untuk cek feedback di browser
app.get('/api/admin/feedback', adminMiddleware, (req, res) => {
  const data = db.prepare(`
    SELECT f.id, u.nama, u.username, f.pesan, f.created_at 
    FROM feedback f
    JOIN users u ON f.user_id = u.id
    ORDER BY f.created_at DESC
  `).all();
  res.json(data);
});
// Endpoint untuk cek daftar user di browser
app.get('/api/admin/users', adminMiddleware, (req, res) => {
  const data = db.prepare('SELECT username, level, streak, password, is_banned FROM users').all();
  res.json(data);
});

// Endpoint untuk ban/unban user (POST)
app.post('/api/admin/ban', adminMiddleware, (req, res) => {
  const { username, status } = req.body; // status: 1 (ban), 0 (unban)
  if (!username) return res.status(400).json({ error: 'Username wajib diisi' });
  
  const result = db.prepare('UPDATE users SET is_banned=? WHERE username=?').run(status ? 1 : 0, username);
  if (result.changes === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
  
  res.json({ message: `User ${username} berhasil ${status ? 'diblokir' : 'dipulihkan'}!` });
});

// Endpoint alternatif GET untuk mempermudah (tinggal buka di browser)
app.get('/api/admin/ban', adminMiddleware, (req, res) => {
  const { username, status } = req.query; // ?username=xxx&status=1
  if (!username) return res.status(400).json({ error: 'Username wajib diisi' });
  
  const result = db.prepare('UPDATE users SET is_banned=? WHERE username=?').run(status === '1' ? 1 : 0, username);
  if (result.changes === 0) return res.status(404).json({ error: 'User tidak ditemukan' });
  
  res.json({ message: `User ${username} berhasil ${status === '1' ? 'diblokir' : 'dipulihkan'}!` });
});

app.get('/', (req, res) => res.json({ status: '✅ EDUVIX.ID API jalan!', db: 'SQLite', port: PORT }));

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📦 Database: eduvix.db`);
});