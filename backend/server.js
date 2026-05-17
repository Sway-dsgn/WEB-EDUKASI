// =============================================
//   EDUVIX.ID — Backend Server (PostgreSQL)
//   Railway-optimized, no native binding issues
// =============================================

const express = require('express');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
const { Pool } = require('pg');
const path = require('path');

require('dotenv').config();

const app = express();
const JWT_SECRET = process.env.JWT_SECRET || 'eduvix_rahasia_123';
const PORT = process.env.PORT || 3000;

// ─── DATABASE CONNECTION ─────────────────────
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

pool.on('error', (err) => {
  console.error('❌ Pool error:', err.message);
});

// Helper untuk query
const query = (text, params = []) => pool.query(text, params);

// ─── CREATE TABLES ───────────────────────────
const initDB = async () => {
  try {
    // Users table
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id         SERIAL PRIMARY KEY,
        nama       TEXT    NOT NULL,
        username   TEXT    NOT NULL UNIQUE,
        password   TEXT    NOT NULL,
        xp         INTEGER DEFAULT 0,
        coins      INTEGER DEFAULT 0,
        level      INTEGER DEFAULT 1,
        streak     INTEGER DEFAULT 0,
        "avatarType" TEXT DEFAULT 'initial',
        "avatarValue" TEXT DEFAULT NULL,
        "avatarBorder" TEXT DEFAULT 'none',
        last_login TIMESTAMP DEFAULT NULL,
        last_streak INTEGER DEFAULT 0,
        is_banned  INTEGER DEFAULT 0,
        role       TEXT    DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Quiz results table
    await query(`
      CREATE TABLE IF NOT EXISTS quiz_hasil (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        quiz_id    TEXT    DEFAULT 'default',
        skor       INTEGER DEFAULT 0,
        benar      INTEGER DEFAULT 0,
        salah      INTEGER DEFAULT 0,
        total      INTEGER DEFAULT 0,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Material progress table
    await query(`
      CREATE TABLE IF NOT EXISTS materi_progress (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        materi_id  TEXT    NOT NULL,
        selesai_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, materi_id)
      )
    `);

    // Shop items table
    await query(`
      CREATE TABLE IF NOT EXISTS shop_items (
        id         TEXT PRIMARY KEY,
        nama       TEXT    NOT NULL,
        deskripsi  TEXT    NOT NULL,
        tipe       TEXT    NOT NULL,
        harga      INTEGER NOT NULL,
        icon       TEXT    NOT NULL
      )
    `);

    // User inventory table
    await query(`
      CREATE TABLE IF NOT EXISTS user_inventory (
        id           SERIAL PRIMARY KEY,
        user_id      INTEGER NOT NULL REFERENCES users(id),
        item_id      TEXT    NOT NULL REFERENCES shop_items(id),
        purchased_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    // Feedback table
    await query(`
      CREATE TABLE IF NOT EXISTS feedback (
        id         SERIAL PRIMARY KEY,
        user_id    INTEGER NOT NULL REFERENCES users(id),
        pesan      TEXT    NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      )
    `);

    console.log('✅ Database tables ready!');
  } catch (e) {
    console.error('❌ Error creating tables:', e.message);
  }
};

// ─── INSERT INITIAL DATA ─────────────────────
const initData = async () => {
  try {
    // Insert shop items
    const items = [
      ['ninja_avatar', 'Cyber Ninja Avatar', 'Avatar ninja futuristik eksklusif.', 'avatar', 200, 'fa-user-ninja'],
      ['xp_booster', 'XP Booster 2x', 'Gandakan perolehan XP selama 24 jam.', 'booster', 300, 'fa-bolt'],
      ['royal_crown', 'Mahkota Kerajaan', 'Simbol kejayaan murid rajin.', 'border', 600, 'fa-crown'],
      ['ghost_avatar', 'Ghost Hunter', 'Avatar hantu yang misterius.', 'avatar', 250, 'fa-ghost'],
      ['fire_border', 'Aura Berapi', 'Border profil dengan efek api.', 'border', 350, 'fa-fire'],
      ['rainbow_infinity', 'Rainbow Infinity', 'Border pelangi yang berubah warna.', 'border', 400, 'fa-circle-notch']
    ];

    for (const item of items) {
      await query(
        'INSERT INTO shop_items (id, nama, deskripsi, tipe, harga, icon) VALUES ($1, $2, $3, $4, $5, $6) ON CONFLICT DO NOTHING',
        item
      );
    }
    console.log('✅ Shop items initialized!');

    // Create admin account
    const adminExists = await query('SELECT id FROM users WHERE username = $1', ['admin_eduvix']);
    if (adminExists.rows.length === 0) {
      const hash = bcrypt.hashSync('EVXLK2091-22', 10);
      await query(
        'INSERT INTO users (nama, username, password, role) VALUES ($1, $2, $3, $4)',
        ['Admin Eduvix', 'admin_eduvix', hash, 'admin']
      );
      console.log('👑 Admin account created!');
    } else {
      const hash = bcrypt.hashSync('EVXLK2091-22', 10);
      await query('UPDATE users SET password = $1 WHERE username = $2', [hash, 'admin_eduvix']);
      console.log('👑 Admin password updated!');
    }
  } catch (e) {
    console.error('❌ Error initializing data:', e.message);
  }
};

// ─── INITIALIZE ON START ─────────────────────
(async () => {
  await initDB();
  await initData();
})();

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors({ origin: '*' }));
app.use(express.json());
app.use(express.static(path.join(__dirname, '../frontend')));
// ─── HELPER FUNCTIONS ─────────────────────────
const hitungLevel = xp => Math.floor((Math.sqrt(0.16 * xp + 9) - 1) / 2);
const makeToken = user => jwt.sign({ id: user.id, username: user.username }, JWT_SECRET, { expiresIn: '7d' });

function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada' });
  try {
    req.user = jwt.verify(token, JWT_SECRET);
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}

async function adminMiddleware(req, res, next) {
  authMiddleware(req, res, async () => {
    try {
      const result = await query('SELECT role FROM users WHERE id = $1', [req.user.id]);
      const user = result.rows[0];
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
  const last = user.last_login ? user.last_login.toISOString().split('T')[0] : null;
  let streak = user.streak || 0;
  let naik = false;
  let lost = false;
  let oldStreak = streak;

  if (last === today) { /* sudah login */ }
  else if (last === yesterday) { streak++; naik = true; }
  else {
    lost = true;
    if (streak > 1) {
      await query('UPDATE users SET last_streak = $1 WHERE id = $2', [streak, user.id]);
    }
    streak = 1;
  }

  await query('UPDATE users SET streak = $1, last_login = $2 WHERE id = $3', [streak, new Date(), user.id]);
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

    const exists = await query('SELECT id FROM users WHERE username = $1', [username]);
    if (exists.rows.length > 0) return res.status(400).json({ error: 'Username sudah dipakai' });

    const hash = bcrypt.hashSync(password, 10);
    const result = await query(
      'INSERT INTO users (nama, username, password, last_login) VALUES ($1, $2, $3, $4) RETURNING id',
      [nama, username, hash, new Date()]
    );

    const newUser = { id: result.rows[0].id, username, nama };
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

    const result = await query('SELECT * FROM users WHERE username = $1', [username]);
    const user = result.rows[0];

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
    const result = await query(
      'SELECT id, nama, username, xp, coins, level, streak, last_login, created_at, "avatarType", "avatarValue", "avatarBorder", last_streak, is_banned FROM users WHERE id = $1',
      [req.user.id]
    );
    const u = result.rows[0];

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

    const result = await query('SELECT xp FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const xpBaru = user.xp + jumlah;
    const lvl = hitungLevel(xpBaru);

    await query('UPDATE users SET xp = $1, level = $2 WHERE id = $3', [xpBaru, lvl, req.user.id]);
    res.json({ xp: xpBaru, level: lvl });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/coins', authMiddleware, async (req, res) => {
  try {
    const { jumlah } = req.body;
    if (!jumlah || jumlah <= 0) return res.status(400).json({ error: 'Jumlah koin tidak valid' });

    const result = await query('SELECT coins FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const koinBaru = (user.coins || 0) + jumlah;

    await query('UPDATE users SET coins = $1 WHERE id = $2', [koinBaru, req.user.id]);
    res.json({ coins: koinBaru });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/avatar', authMiddleware, async (req, res) => {
  try {
    const { avatarType, avatarValue } = req.body;
    if (!['initial', 'icon', 'image'].includes(avatarType)) return res.status(400).json({ error: 'Tipe avatar tidak valid' });

    await query('UPDATE users SET "avatarType" = $1, "avatarValue" = $2 WHERE id = $3', [avatarType, avatarValue, req.user.id]);
    res.json({ message: 'Avatar berhasil diupdate!', avatarType, avatarValue });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/border', authMiddleware, async (req, res) => {
  try {
    const { avatarBorder } = req.body;
    if (!avatarBorder) return res.status(400).json({ error: 'Border avatar tidak valid' });

    await query('UPDATE users SET "avatarBorder" = $1 WHERE id = $2', [avatarBorder, req.user.id]);
    res.json({ message: 'Border avatar berhasil diupdate!', avatarBorder });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/badge', authMiddleware, async (req, res) => {
  try {
    const { badge } = req.body;
    if (!badge) return res.status(400).json({ error: 'Badge tidak valid' });

    await query('UPDATE users SET badge = $1 WHERE id = $2', [badge, req.user.id]);
    res.json({ message: 'Badge berhasil diupdate!', badge });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/user/streak', authMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT * FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const streakInfo = await prosesStreak(user);
    res.json(streakInfo);
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

    const result = await query('SELECT xp, coins FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const xpBaru = (user.xp || 0) + xpDapat;
    const koinBaru = (user.coins || 0) + koinDapat;
    const levelBaru = hitungLevel(xpBaru);

    await query('INSERT INTO quiz_hasil (user_id, quiz_id, skor, benar, salah, total) VALUES ($1, $2, $3, $4, $5, $6)',
      [req.user.id, quiz_id || 'default', skor, benar, salah, total]);

    await query('UPDATE users SET xp = $1, coins = $2, level = $3 WHERE id = $4',
      [xpBaru, koinBaru, levelBaru, req.user.id]);

    res.json({
      message: 'Hasil quiz disimpan!',
      xpDapat, koinDapat, xpBaru, koinBaru,
      level: levelBaru
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/quiz/riwayat', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT * FROM quiz_hasil WHERE user_id = $1 ORDER BY created_at DESC LIMIT 20',
      [req.user.id]
    );
    res.json(result.rows);
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

    const exist = await query(
      'SELECT id FROM materi_progress WHERE user_id = $1 AND materi_id = $2',
      [req.user.id, materi_id]
    );

    if (exist.rows.length > 0) {
      return res.json({ message: 'Materi sudah pernah diselesaikan', xpDapat: 0, koinDapat: 0 });
    }

    await query('INSERT INTO materi_progress (user_id, materi_id) VALUES ($1, $2)', [req.user.id, materi_id]);

    const xpDapat = xp_materi || 50;
    const koinDapat = 25;

    const result = await query('SELECT xp, coins FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];
    const xpBaru = (user.xp || 0) + xpDapat;
    const koinBaru = (user.coins || 0) + koinDapat;
    const levelBaru = hitungLevel(xpBaru);

    await query('UPDATE users SET xp = $1, coins = $2, level = $3 WHERE id = $4',
      [xpBaru, koinBaru, levelBaru, req.user.id]);

    res.json({
      message: `Materi selesai! +${xpDapat} XP & +${koinDapat} Koin`,
      xpDapat, koinDapat, xpBaru, koinBaru,
      level: levelBaru
    });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/materi/progress', authMiddleware, async (req, res) => {
  try {
    const result = await query(
      'SELECT materi_id, selesai_at FROM materi_progress WHERE user_id = $1',
      [req.user.id]
    );
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   SHOP ENDPOINTS
// =============================================
app.get('/api/shop/items', async (req, res) => {
  try {
    const result = await query('SELECT * FROM shop_items');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/shop/buy', authMiddleware, async (req, res) => {
  try {
    const { itemId } = req.body;
    const itemResult = await query('SELECT * FROM shop_items WHERE id = $1', [itemId]);
    const item = itemResult.rows[0];

    if (!item) return res.status(404).json({ error: 'Item tidak ditemukan' });

    const userResult = await query('SELECT coins FROM users WHERE id = $1', [req.user.id]);
    const user = userResult.rows[0];

    if ((user.coins || 0) < item.harga) return res.status(400).json({ error: 'Koin tidak cukup' });

    const owned = await query('SELECT id FROM user_inventory WHERE user_id = $1 AND item_id = $2',
      [req.user.id, itemId]);

    if (owned.rows.length > 0) return res.status(400).json({ error: 'Sudah memiliki item ini' });

    const koinBaru = user.coins - item.harga;
    await query('UPDATE users SET coins = $1 WHERE id = $2', [koinBaru, req.user.id]);
    await query('INSERT INTO user_inventory (user_id, item_id) VALUES ($1, $2)', [req.user.id, itemId]);

    res.json({ message: `Berhasil membeli ${item.nama}!`, coins: koinBaru, itemId });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/shop/inventory', authMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT si.*, ui.purchased_at
      FROM shop_items si
      JOIN user_inventory ui ON si.id = ui.item_id
      WHERE ui.user_id = $1
      ORDER BY ui.purchased_at DESC
    `, [req.user.id]);
    res.json(result.rows);
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

    await query('INSERT INTO feedback (user_id, pesan) VALUES ($1, $2)', [req.user.id, pesan]);
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
    const result = await query('SELECT streak, coins, last_streak FROM users WHERE id = $1', [req.user.id]);
    const user = result.rows[0];

    if (!user) return res.status(404).json({ error: 'User tidak ditemukan' });
    if ((user.coins || 0) < 100) return res.status(400).json({ error: 'Koin tidak cukup (butuh 100 koin)' });
    if (!user.last_streak || user.last_streak <= 1) return res.status(400).json({ error: 'Tidak ada streak yang bisa dipulihkan' });

    const koinBaru = user.coins - 100;
    const streakBaru = user.last_streak;

    await query('UPDATE users SET streak = $1, coins = $2, last_streak = 0 WHERE id = $3',
      [streakBaru, koinBaru, req.user.id]);

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
    let queryStr = '';

    if (sort === 'nilai') {
      queryStr = `
        SELECT u.id, u.username, u.nama, u.xp, u.level, COALESCE(SUM(q.skor), 0) as value
        FROM users u
        LEFT JOIN quiz_hasil q ON u.id = q.user_id
        GROUP BY u.id
        ORDER BY value DESC
        LIMIT 100
      `;
    } else if (sort === 'akurasi') {
      queryStr = `
        SELECT u.id, u.username, u.nama, u.xp, u.level,
               CASE WHEN SUM(q.total) > 0 THEN (SUM(q.benar) * 100 / SUM(q.total)) ELSE 0 END as value
        FROM users u
        LEFT JOIN quiz_hasil q ON u.id = q.user_id
        GROUP BY u.id
        ORDER BY value DESC
        LIMIT 100
      `;
    } else {
      queryStr = 'SELECT id, username, nama, xp as value, level FROM users ORDER BY value DESC LIMIT 100';
    }

    const result = await query(queryStr);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   ADMIN ENDPOINTS
// =============================================
app.get('/api/admin/feedback', adminMiddleware, async (req, res) => {
  try {
    const result = await query(`
      SELECT f.id, u.nama, u.username, f.pesan, f.created_at
      FROM feedback f
      JOIN users u ON f.user_id = u.id
      ORDER BY f.created_at DESC
    `);
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/users', adminMiddleware, async (req, res) => {
  try {
    const result = await query('SELECT username, level, streak, password, is_banned FROM users');
    res.json(result.rows);
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.post('/api/admin/ban', adminMiddleware, async (req, res) => {
  try {
    const { username, status } = req.body;
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' });

    await query('UPDATE users SET is_banned = $1 WHERE username = $2', [status ? 1 : 0, username]);
    res.json({ message: `User ${username} berhasil ${status ? 'diblokir' : 'dipulihkan'}!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

app.get('/api/admin/ban', adminMiddleware, async (req, res) => {
  try {
    const { username, status } = req.query;
    if (!username) return res.status(400).json({ error: 'Username wajib diisi' });

    await query('UPDATE users SET is_banned = $1 WHERE username = $2', [status === '1' ? 1 : 0, username]);
    res.json({ message: `User ${username} berhasil ${status === '1' ? 'diblokir' : 'dipulihkan'}!` });
  } catch (e) {
    res.status(500).json({ error: e.message });
  }
});

// =============================================
//   ROOT ENDPOINT
// =============================================
app.get('/', (req, res) => {
  res.json({
    status: '✅ EDUVIX.ID API jalan!',
    db: 'PostgreSQL',
    port: PORT,
    message: 'Welcome to EDUVIX.ID Backend'
  });
});

app.listen(PORT, () => {
  console.log(`🚀 Server jalan di http://localhost:${PORT}`);
  console.log(`📦 Database: PostgreSQL`);
  console.log(`🔐 JWT Secret configured`);
});