// =============================================
//   EDUVIX.ID — Backend Server (SQLite dengan Promises)
//   Fixed untuk Railway deployment
// =============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const path = require('path');
const sqlite3 = require('sqlite3').verbose();

require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'eduvix_rahasia_123';
const PORT = process.env.PORT || 5000;

// ─── DATABASE CONNECTION ─────────────────────
const db = new sqlite3.Database(path.join(__dirname, 'eduvix.db'), (err) => {
  if (err) {
    console.error('❌ Database error:', err.message);
  } else {
    console.log('✅ Database SQLite connected!');
  }
});

// Promisify database methods untuk lebih mudah
const dbRun = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.run(sql, params, function (err) {
      if (err) reject(err);
      else resolve({ lastID: this.lastID, changes: this.changes });
    });
  });
};

const dbGet = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.get(sql, params, (err, row) => {
      if (err) reject(err);
      else resolve(row);
    });
  });
};

const dbAll = (sql, params = []) => {
  return new Promise((resolve, reject) => {
    db.all(sql, params, (err, rows) => {
      if (err) reject(err);
      else resolve(rows || []);
    });
  });
};

// ─── BUAT TABEL OTOMATIS ─────────────────────
const initDB = async () => {
  try {
    await dbRun(`CREATE TABLE IF NOT EXISTS users (
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
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS quiz_hasil (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      quiz_id    TEXT    DEFAULT 'default',
      skor       INTEGER DEFAULT 0,
      benar      INTEGER DEFAULT 0,
      salah      INTEGER DEFAULT 0,
      total      INTEGER DEFAULT 0,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS materi_progress (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      materi_id  TEXT    NOT NULL,
      selesai_at TEXT    DEFAULT (datetime('now')),
      UNIQUE(user_id, materi_id),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS shop_items (
      id         TEXT    PRIMARY KEY,
      nama       TEXT    NOT NULL,
      deskripsi  TEXT    NOT NULL,
      tipe       TEXT    NOT NULL,
      harga      INTEGER NOT NULL,
      icon       TEXT    NOT NULL
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS user_inventory (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      item_id    TEXT    NOT NULL,
      purchased_at TEXT  DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id),
      FOREIGN KEY (item_id) REFERENCES shop_items(id)
    )`);

    await dbRun(`CREATE TABLE IF NOT EXISTS feedback (
      id         INTEGER PRIMARY KEY AUTOINCREMENT,
      user_id    INTEGER NOT NULL,
      pesan      TEXT    NOT NULL,
      created_at TEXT    DEFAULT (datetime('now')),
      FOREIGN KEY (user_id) REFERENCES users(id)
    )`);

    console.log('✅ Semua tabel berhasil dibuat/diupdate!');
  } catch (e) {
    console.error('❌ Error inisialisasi database:', e.message);
  }
};

// ─── INSERT SHOP ITEMS ───────────────────────
const initShopItems = async () => {
  try {
    const items = [
      ['ninja_avatar', 'Cyber Ninja Avatar', 'Avatar ninja futuristik eksklusif.', 'avatar', 200, 'fa-user-ninja'],
      ['xp_booster', 'XP Booster 2x', 'Gandakan perolehan XP selama 24 jam.', 'booster', 300, 'fa-bolt'],
      ['royal_crown', 'Mahkota Kerajaan', 'Simbol kejayaan murid rajin.', 'border', 600, 'fa-crown'],
      ['ghost_avatar', 'Ghost Hunter', 'Avatar hantu yang misterius.', 'avatar', 250, 'fa-ghost'],
      ['fire_border', 'Aura Berapi', 'Border profil dengan efek api.', 'border', 350, 'fa-fire'],
      ['rainbow_infinity', 'Rainbow Infinity', 'Border pelangi yang berubah warna.', 'border', 400, 'fa-circle-notch']
    ];

    for (const item of items) {
      await dbRun('INSERT OR REPLACE INTO shop_items (id, nama, deskripsi, tipe, harga, icon) VALUES (?,?,?,?,?,?)', item);
    }
    console.log('✅ Shop items berhasil dimasukkan!');
  } catch (e) {
    console.error('❌ Error insert shop items:', e.message);
  }
};

// ─── BUAT ADMIN DEFAULT ──────────────────────
const initAdminUser = async () => {
  try {
    const adminExists = await dbGet('SELECT id FROM users WHERE username=?', ['admin_eduvix']);
    const hash = bcrypt.hashSync('EVXLK2091-22', 10);

    if (!adminExists) {
      await dbRun('INSERT INTO users (nama, username, password, role) VALUES (?, ?, ?, ?)',
        ['Admin Eduvix', 'admin_eduvix', hash, 'admin']);
      console.log('👑 Akun Admin default dibuat!');
    } else {
      await dbRun('UPDATE users SET password=? WHERE username=?', [hash, 'admin_eduvix']);
      console.log('👑 Password Admin berhasil diperbarui!');
    }
  } catch (e) {
    console.error('❌ Error admin setup:', e.message);
  }
};

// ─── JALANKAN INISIALISASI ───────────────────
(async () => {
  await initDB();
  await initShopItems();
  await initAdminUser();
})();

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());

// ─── HELPER ───────────────────────────────────
const hitungLevel = xp => Math.floor((Math.sqrt(0.16 * xp + 9) - 1) / 2);
const makeToken = user => jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  }
  catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}

async function adminMiddleware(req, res, next) {
  authMiddleware(req, res, async () => {
    try {
      const user = await dbGet('SELECT role FROM users WHERE id=?', [req.user.id]);
      if (!user || user.role !== 'admin') {
        return res.status(403).json({ error: 'Akses Ditolak! Khusus Admin.' });
      }
      next();
    } catch (e) {
      res.status(500).json({ error: 'Database error' });
    }
  });
}

async function prosesStreak(user) {
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
      await dbRun('UPDATE users SET last_streak=? WHERE id=?', [streak, user.id]);
    }
    streak = 1;
  }

  await dbRun('UPDATE users SET streak=?, last_login=? WHERE id=?', [streak, new Date().toISOString(), user.id]);
  return { streak, naik, lost, oldStreak };
}

// =============================================
//   AUTH ENDPOINTS
// =============================================
app.post('/api/auth/register', async (req, res) => {
  try {
    const { nama, username, password } = req.body;
    if (!nama || !username || !password) return res.status(400).json({ error: 'Semua field wajib diisi' });
    if (username.length < 3) return res.status(400).json({ error: 'Username min 3 karakter' });
    if (password.length < 6) return res.status(400).json({ error: 'Password min 6 karakter' });

    const exists = await dbGet('SELECT id FROM users WHERE username=?', [username]);
    if (exists) return res.status(400).json({ error: 'Username sudah dipakai' });

    const hash = bcrypt.hashSync(password, 10);
    const result = await dbRun('INSERT INTO users (nama,username,password,last_login) VALUES (?,?,?,?)',
      [nama, username, hash, new Date().toISOString()]);

    const newUser = { id: result.lastID, username, nama };
    res.status(201).json({
      message: 'Registrasi berhasil!',
      token: makeToken(newUser),
      user: { ...newUser, xp: 0, coins: 0, level: 1, streak: 1, avatarType: 'initial', avatarBorder: 'none' }
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/auth/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    if (!username || !password) return res.status(400).json({ error: 'Username & password wajib' });

    const user = await dbGet('SELECT * FROM users WHERE username=?', [username]);
    if (!user) return res.status(401).json({ error: 'Username tidak ditemukan' });
    if (!bcrypt.compareSync(password, user.password)) return res.status(401).json({ error: 'Password salah' });
    if (user.is_banned === 1) return res.status(403).json({ error: 'Akun Anda telah diblokir!' });

    const streakInfo = await prosesStreak(user);
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
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const u = await dbGet('SELECT id,nama,username,xp,coins,level,streak,last_login,created_at,avatarType,avatarValue,avatarBorder,last_streak,is_banned FROM users WHERE id=?', [req.user.id]);
    if (!u) return res.status(404).json({ error: 'User tidak ditemukan' });
    if (u.is_banned === 1) return res.status(403).json({ error: 'Akun Anda telah diblokir!' });
    res.json({ ...u, level: hitungLevel(u.xp) });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   USER ENDPOINTS
// =============================================
app.post('/api/user/xp', authMiddleware, async (req, res) => {
  try {
    const { jumlah } = req.body;
    if (!jumlah || jumlah <= 0) return res.status(400).json({ error: 'Jumlah XP tidak valid' });

    const user = await dbGet('SELECT xp FROM users WHERE id=?', [req.user.id]);
    const xpBaru = user.xp + jumlah;
    const lvl = hitungLevel(xpBaru);

    await dbRun('UPDATE users SET xp=?,level=? WHERE id=?', [xpBaru, lvl, req.user.id]);
    res.json({ xp: xpBaru, level: lvl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/coins', authMiddleware, async (req, res) => {
  try {
    const { jumlah } = req.body;
    if (!jumlah || jumlah <= 0) return res.status(400).json({ error: 'Jumlah koin tidak valid' });

    const user = await dbGet('SELECT coins FROM users WHERE id=?', [req.user.id]);
    const koinBaru = (user.coins || 0) + jumlah;

    await dbRun('UPDATE users SET coins=? WHERE id=?', [koinBaru, req.user.id]);
    res.json({ coins: koinBaru });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarType, avatarValue } = req.body;
    if (!['initial', 'icon', 'image'].includes(avatarType)) return res.status(400).json({ error: 'Tipe avatar tidak valid' });

    await dbRun('UPDATE users SET avatarType=?, avatarValue=? WHERE id=?', [avatarType, avatarValue, req.user.id]);
    res.json({ message: 'Avatar berhasil diupdate!', avatarType, avatarValue });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/border', authMiddleware, async (req, res) => {
  try {
    const { avatarBorder } = req.body;
    if (!avatarBorder) return res.status(400).json({ error: 'Border avatar tidak valid' });

    await dbRun('UPDATE users SET avatarBorder=? WHERE id=?', [avatarBorder, req.user.id]);
    res.json({ message: 'Border avatar berhasil diupdate!', avatarBorder });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/badge', authMiddleware, async (req, res) => {
  try {
    const { badge } = req.body;
    if (!badge) return res.status(400).json({ error: 'Badge tidak valid' });

    await dbRun('UPDATE users SET badge=? WHERE id=?', [badge, req.user.id]);
    res.json({ message: 'Badge berhasil diupdate!', badge });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/streak', authMiddleware, async (req, res) => {
  try {
    const user = await dbGet('SELECT * FROM users WHERE id=?', [req.user.id]);
    const result = await prosesStreak(user);
    res.json(result);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   QUIZ ENDPOINTS
// =============================================
app.post('/api/quiz/hasil', authMiddleware, async (req, res) => {
  try {
    const { quiz_id, skor, benar, salah, total } = req.body;

    const xpDapat = Math.round((benar / (total || 1)) * 50);
    const koinDapat = Math.round((benar / (total || 1)) * 20) + (skor >= 80 ? 50 : 10);

    const user = await dbGet('SELECT xp, coins FROM users WHERE id=?', [req.user.id]);
    const xpBaru = (user.xp || 0) + xpDapat;
    const koinBaru = (user.coins || 0) + koinDapat;
    const levelBaru = hitungLevel(xpBaru);

    await dbRun('INSERT INTO quiz_hasil (user_id,quiz_id,skor,benar,salah,total) VALUES (?,?,?,?,?,?)',
      [req.user.id, quiz_id || 'default', skor, benar, salah, total]);

    await dbRun('UPDATE users SET xp=?, coins=?, level=? WHERE id=?',
      [xpBaru, koinBaru, levelBaru, req.user.id]);

    res.json({
      message: 'Hasil quiz disimpan!',
      xpDapat,
      koinDapat,
      xpBaru,
      koinBaru,
      level: levelBaru
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/quiz/riwayat', authMiddleware, async (req, res) => {
  try {
    const data = await dbAll('SELECT * FROM quiz_hasil WHERE user_id=? ORDER BY created_at DESC LIMIT 20', [req.user.id]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   MATERI ENDPOINTS
// =============================================
app.post('/api/materi/selesai', authMiddleware, async (req, res) => {
  try {
    const { materi_id, xp_materi } = req.body;

    const exist = await dbGet('SELECT id FROM materi_progress WHERE user_id=? AND materi_id=?', [req.user.id, materi_id]);
    if (exist) return res.json({ message: 'Materi sudah pernah diselesaikan', xpDapat: 0, koinDapat: 0 });

    await dbRun('INSERT INTO materi_progress (user_id,materi_id) VALUES (?,?)', [req.user.id, materi_id]);

    const xpDapat = xp_materi || 50;
    const koinDapat = 25;

    const user = await dbGet('SELECT xp, coins FROM users WHERE id=?', [req.user.id]);
    const xpBaru = (user.xp || 0) + xpDapat;
    const koinBaru = (user.coins || 0) + koinDapat;
    const levelBaru = hitungLevel(xpBaru);

    await dbRun('UPDATE users SET xp=?, coins=?, level=? WHERE id=?',
      [xpBaru, koinBaru, levelBaru, req.user.id]);

    res.json({
      message: `Materi selesai! +${xpDapat} XP & +${koinDapat} Koin`,
      xpDapat,
      koinDapat,
      xpBaru,
      koinBaru,
      level: levelBaru
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/materi/progress', authMiddleware, async (req, res) => {
  try {
    const data = await dbAll('SELECT materi_id,selesai_at FROM materi_progress WHERE user_id=?', [req.user.id]);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   SHOP ENDPOINTS
// =============================================
app.get('/api/shop/items', async (req, res) => {
  try {
    const data = await dbAll('SELECT * FROM shop_items');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/shop/buy', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const item = await dbGet('SELECT * FROM shop_items WHERE id=?', [itemId]);
    if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' });

    const user = await dbGet('SELECT coins FROM users WHERE id=?', [req.user.id]);
    if ((user.coins || 0) < item.harga) return res.status(400).json({ error: 'Koin tidak cukup' });

    const owned = await dbGet('SELECT id FROM user_inventory WHERE user_id=? AND item_id=?', [req.user.id, itemId]);
    if (owned) return res.status(400).json({ error: 'Sudah memiliki item ini' });

    const koinBaru = user.coins - item.harga;
    await dbRun('UPDATE users SET coins=? WHERE id=?', [koinBaru, req.user.id]);
    await dbRun('INSERT INTO user_inventory (user_id, item_id) VALUES (?, ?)', [req.user.id, itemId]);

    res.json({ message: `Berhasil membeli ${item.nama}!`, coins: koinBaru, itemId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/shop/inventory', authMiddleware, async (req, res) => {
  try {
    const items = await dbAll(`
      SELECT si.*, ui.purchased_at 
      FROM shop_items si
      JOIN user_inventory ui ON si.id = ui.item_id
      WHERE ui.user_id = ?
      ORDER BY ui.purchased_at DESC
    `, [req.user.id]);
    res.json(items);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   FEEDBACK ENDPOINTS
// =============================================
app.post('/api/feedback', authMiddleware, async (req, res) => {
  try {
    const { pesan } = req.body;
    if (!pesan) return res.status(400).json({ error: 'Pesan tidak boleh kosong' });

    await dbRun('INSERT INTO feedback (user_id, pesan) VALUES (?, ?)', [req.user.id, pesan]);
    res.json({ message: 'Feedback berhasil dikirim! Terima kasih atas masukan Anda.' });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   STREAK RECOVERY
// =============================================
app.post('/api/streak/recover', authMiddleware, async (req, res) => {
  try {
    const user = await dbGet('SELECT streak, coins, last_streak FROM users WHERE id=?', [req.user.id]);
    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });

    if ((user.coins || 0) < 100) return res.status(400).json({ error: 'Koin tidak cukup (butuh 100 koin)' });
    if (!user.last_streak || user.last_streak <= 1) return res.status(400).json({ error: 'Tidak ada streak yang bisa dipulihkan' });

    const koinBaru = user.coins - 100;
    const streakBaru = user.last_streak;

    await dbRun('UPDATE users SET streak=?, coins=?, last_streak=0 WHERE id=?', [streakBaru, koinBaru, req.user.id]);

    res.json({ message: 'Streak berhasil dipulihkan!', streak: streakBaru, coins: koinBaru });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   LEADERBOARD
// =============================================
app.get('/api/leaderboard', async (req, res) => {
  try {
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
      query = 'SELECT id, username, nama, xp as value, level FROM users ORDER BY value DESC LIMIT 100';
    }

    const data = await dbAll(query);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   ADMIN ENDPOINTS
// =============================================
app.get('/api/admin/feedback', adminMiddleware, async (req, res) => {
  try {
    const data = await dbAll(`
      SELECT f.id, u.nama, u.username, f.pesan, f.created_at 
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const data = await dbAll('SELECT username, level, streak, password, is_banned FROM users');
    res.json(data);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/ban', adminMiddleware, async (req, res) => {
  try {
    const { username, status } = req.body;
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' });

    await dbRun('UPDATE users SET is_banned=? WHERE username=?', [status ? 1 : 0, username]);
    res.json({ message: `User ${username} berhasil ${status ? 'diblokir' : 'dipulihkan'}!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/ban', adminMiddleware, async (req, res) => {
  try {
    const { username, status } = req.query;
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' });

    await dbRun('UPDATE users SET is_banned=? WHERE username=?', [status === '1' ? 1 : 0, username]);
    res.json({ message: `User ${username} berhasil ${status === '1' ? 'diblokir' : 'dipulihkan'}!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   ROOT ENDPOINT
// =============================================
app.get('/', (req, res) => res.json({ status: '✅ EDUVIX.ID API jalan!', db: 'SQLite', port: PORT }));

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📦 Database: eduvix.db`);
});