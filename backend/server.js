// =============================================
//   EDUVIX.ID — Backend Server
//   Node.js + Express + MySQL
// =============================================

const express = require('express');
const mysql = require('mysql2/promise');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const cors = require('cors');
require('dotenv').config();

const app = express();

// ─── MIDDLEWARE ───────────────────────────────
app.use(cors({
  origin: [
    'http://localhost:5500',
    'http://127.0.0.1:5500',
    'https://sway-dsgn.github.io',  // ← ganti dengan domain kamu
  ],
  credentials: true
}));
app.use(express.json());

// ─── DATABASE CONNECTION ──────────────────────
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  port: process.env.DB_PORT || 3306,
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASS || '',
  database: process.env.DB_NAME || 'eduvix',
  waitForConnections: true,
  connectionLimit: 10,
});

// Test koneksi DB
async function testDB() {
  try {
    const conn = await pool.getConnection();
    console.log('✅ MySQL terhubung!');
    conn.release();
  } catch (err) {
    console.error('❌ MySQL gagal:', err.message);
    console.error(`📍 Mencoba terhubung ke: ${process.env.DB_HOST}:${process.env.DB_PORT}`);
    if (err.code === 'ER_BAD_DB_ERROR') {
      console.error('💡 TIP: Database "eduvix" tidak ditemukan. Pastikan kamu sudah menjalankan database.sql di phpMyAdmin!');
    } else if (err.code === 'ECONNREFUSED') {
      console.error('💡 TIP: MySQL menolak koneksi. Pastikan Laragon/XAMPP sudah "Start All" dan port-nya sama.');
    }
    process.exit(1);
  }
}

// ─── JWT MIDDLEWARE ───────────────────────────
function authMiddleware(req, res, next) {
  const token = req.headers.authorization?.split(' ')[1];
  if (!token) return res.status(401).json({ error: 'Token tidak ada' });
  try {
    req.user = jwt.verify(token, process.env.JWT_SECRET || 'eduvix_secret_key');
    next();
  } catch {
    res.status(401).json({ error: 'Token tidak valid' });
  }
}

// ─── HELPER ───────────────────────────────────
function makeToken(user) {
  return jwt.sign(
    { id: user.id, username: user.username, email: user.email },
    process.env.JWT_SECRET || 'eduvix_secret_key',
    { expiresIn: '7d' }
  );
}

function hitungLevel(xp) { return Math.floor(xp / 100) + 1; }

// =============================================
//   ROUTES — AUTH
// =============================================

// ── REGISTER ──
app.post('/api/auth/register', async (req, res) => {
  const { nama, username, password } = req.body;

  if (!nama || !username || !password)
    return res.status(400).json({ error: 'Semua field wajib diisi' });
  if (username.length < 3)
    return res.status(400).json({ error: 'Username minimal 3 karakter' });
  if (password.length < 6)
    return res.status(400).json({ error: 'Password minimal 6 karakter' });
  if (!/^[a-zA-Z0-9_]+$/.test(username))
    return res.status(400).json({ error: 'Username hanya boleh huruf, angka, underscore' });

  try {
    // Cek username sudah ada
    const [existing] = await pool.query(
      'SELECT id FROM users WHERE username = ?', [username]
    );
    if (existing.length > 0)
      return res.status(400).json({ error: 'Username sudah dipakai' });

    const hash = await bcrypt.hash(password, 10);
    const [result] = await pool.query(
      `INSERT INTO users (nama, username, password_hash, xp, coins, level, streak, last_login)
       VALUES (?, ?, ?, 0, 0, 1, 0, NOW())`,
      [nama, username, hash]
    );

    const newUser = { id: result.insertId, nama, username };
    const token = makeToken(newUser);

    res.status(201).json({
      message: 'Registrasi berhasil!',
      token,
      user: { id: newUser.id, nama, username, xp: 0, coins: 0, level: 1, streak: 0 }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── LOGIN ──
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password)
    return res.status(400).json({ error: 'Username dan password wajib diisi' });

  try {
    const [rows] = await pool.query(
      'SELECT * FROM users WHERE username = ?', [username]
    );
    if (rows.length === 0)
      return res.status(401).json({ error: 'Username tidak ditemukan' });

    const user = rows[0];
    const valid = await bcrypt.compare(password, user.password_hash);
    if (!valid)
      return res.status(401).json({ error: 'Password salah' });

    // Update streak
    const streakInfo = await updateStreakDB(user);

    // Update last_login
    await pool.query('UPDATE users SET last_login = NOW() WHERE id = ?', [user.id]);

    const token = makeToken(user);
    res.json({
      message: 'Login berhasil!',
      token,
      user: {
        id: user.id,
        nama: user.nama,
        username: user.username,
        xp: user.xp,
        coins: user.coins,
        level: hitungLevel(user.xp),
        streak: streakInfo.streak,
        streakNaik: streakInfo.naik
      }
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── GET PROFIL ──
app.get('/api/auth/me', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT id, nama, username, xp, coins, level, streak, last_login, created_at
       FROM users WHERE id = ?`,
      [req.user.id]
    );
    if (rows.length === 0)
      return res.status(404).json({ error: 'User tidak ditemukan' });

    const u = rows[0];
    res.json({
      id: u.id,
      nama: u.nama,
      username: u.username,
      xp: u.xp,
      coins: u.coins,
      level: hitungLevel(u.xp),
      streak: u.streak,
      last_login: u.last_login,
      created_at: u.created_at,
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
//   ROUTES — XP & LEVEL
// =============================================

// ── TAMBAH XP ──
app.post('/api/user/xp', authMiddleware, async (req, res) => {
  const { jumlah, alasan } = req.body;
  if (!jumlah || jumlah <= 0)
    return res.status(400).json({ error: 'Jumlah XP tidak valid' });

  try {
    // Ambil XP sekarang
    const [rows] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    const xpLama = rows[0].xp;
    const xpBaru = xpLama + jumlah;
    const lvlLama = hitungLevel(xpLama);
    const lvlBaru = hitungLevel(xpBaru);

    await pool.query(
      'UPDATE users SET xp = ?, level = ? WHERE id = ?',
      [xpBaru, lvlBaru, req.user.id]
    );

    // Catat di tabel xp_log
    await pool.query(
      'INSERT INTO xp_log (user_id, jumlah, alasan) VALUES (?, ?, ?)',
      [req.user.id, jumlah, alasan || 'Aktivitas']
    );

    res.json({
      xp: xpBaru,
      level: lvlBaru,
      levelUp: lvlBaru > lvlLama,
      levelBaru: lvlBaru > lvlLama ? lvlBaru : null
    });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── TAMBAH KOIN ──
app.post('/api/user/coins', authMiddleware, async (req, res) => {
  const { jumlah, alasan } = req.body;
  try {
    await pool.query(
      'UPDATE users SET coins = coins + ? WHERE id = ?',
      [jumlah, req.user.id]
    );
    res.json({ success: true, message: alasan });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
//   ROUTES — STREAK
// =============================================

// ── CEK & UPDATE STREAK ──
app.post('/api/user/streak', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT * FROM users WHERE id = ?', [req.user.id]);
    const streakInfo = await updateStreakDB(rows[0]);
    res.json(streakInfo);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// Helper update streak
async function updateStreakDB(user) {
  const now = new Date();
  const todayStr = now.toISOString().split('T')[0];
  const lastLogin = user.last_login ? new Date(user.last_login) : null;
  const lastStr = lastLogin ? lastLogin.toISOString().split('T')[0] : null;
  const yesterday = new Date(now - 86400000).toISOString().split('T')[0];

  let streak = user.streak || 0;
  let naik = false;

  if (lastStr && lastStr === todayStr) {
    // Sudah login hari ini, tidak ubah
  } else if (lastStr === yesterday) {
    // Berturut-turut
    streak++;
    naik = true;
    await pool.query('UPDATE users SET streak = ? WHERE id = ?', [streak, user.id]);
  } else {
    // Reset streak
    streak = 1;
    await pool.query('UPDATE users SET streak = 1 WHERE id = ?', [user.id]);
  }

  return { streak, naik, tanggal: todayStr };
}

// =============================================
//   ROUTES — QUIZ
// =============================================

// ── SIMPAN HASIL QUIZ ──
app.post('/api/quiz/hasil', authMiddleware, async (req, res) => {
  const { quiz_id, skor, benar, salah, total, waktu_detik } = req.body;

  if (skor === undefined || !total)
    return res.status(400).json({ error: 'Data tidak lengkap' });

  try {
    // Simpan hasil quiz
    await pool.query(
      `INSERT INTO quiz_hasil (user_id, quiz_id, skor, benar, salah, total, waktu_detik)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [req.user.id, quiz_id || 'default', skor, benar, salah, total, waktu_detik || 0]
    );

    // Hitung XP dari quiz
    const xpDapat = Math.round((benar / total) * 50);
    const [rows] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    const xpLama = rows[0].xp;
    const xpBaru = xpLama + xpDapat;
    const lvlLama = hitungLevel(xpLama);
    const lvlBaru = hitungLevel(xpBaru);

    await pool.query(
      'UPDATE users SET xp = ?, level = ? WHERE id = ?',
      [xpBaru, lvlBaru, req.user.id]
    );
    await pool.query(
      'INSERT INTO xp_log (user_id, jumlah, alasan) VALUES (?, ?, ?)',
      [req.user.id, xpDapat, `Quiz selesai — skor ${skor}%`]
    );

    res.json({
      message: 'Hasil quiz disimpan!',
      xpDapat,
      xpBaru,
      level: lvlBaru,
      levelUp: lvlBaru > lvlLama
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Server error' });
  }
});

// ── RIWAYAT QUIZ USER ──
app.get('/api/quiz/riwayat', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT quiz_id, skor, benar, salah, total, waktu_detik, created_at
       FROM quiz_hasil WHERE user_id = ? ORDER BY created_at DESC LIMIT 20`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
//   ROUTES — MATERI
// =============================================

// ── TANDAI MATERI SELESAI ──
app.post('/api/materi/selesai', authMiddleware, async (req, res) => {
  const { materi_id, xp_materi } = req.body;
  if (!materi_id) return res.status(400).json({ error: 'materi_id wajib' });

  try {
    // Cek sudah pernah selesai belum
    const [cek] = await pool.query(
      'SELECT id FROM materi_progress WHERE user_id = ? AND materi_id = ?',
      [req.user.id, materi_id]
    );
    if (cek.length > 0)
      return res.json({ message: 'Sudah pernah selesai', xpDapat: 0 });

    // Simpan progress
    await pool.query(
      'INSERT INTO materi_progress (user_id, materi_id) VALUES (?, ?)',
      [req.user.id, materi_id]
    );

    // Tambah XP
    const xp = xp_materi || 50;
    const [rows] = await pool.query('SELECT xp FROM users WHERE id = ?', [req.user.id]);
    const xpBaru = rows[0].xp + xp;
    const lvlBaru = hitungLevel(xpBaru);

    await pool.query(
      'UPDATE users SET xp = ?, level = ? WHERE id = ?',
      [xpBaru, lvlBaru, req.user.id]
    );
    await pool.query(
      'INSERT INTO xp_log (user_id, jumlah, alasan) VALUES (?, ?, ?)',
      [req.user.id, xp, `Selesai materi: ${materi_id}`]
    );

    res.json({ message: 'Materi selesai!', xpDapat: xp, xpBaru, level: lvlBaru });
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ── PROGRESS MATERI USER ──
app.get('/api/materi/progress', authMiddleware, async (req, res) => {
  try {
    const [rows] = await pool.query(
      'SELECT materi_id, selesai_at FROM materi_progress WHERE user_id = ?',
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// =============================================
//   ROUTES — LEADERBOARD
// =============================================
app.get('/api/leaderboard', async (req, res) => {
  try {
    const [rows] = await pool.query(
      `SELECT username, nama, xp, level, streak
       FROM users ORDER BY xp DESC LIMIT 10`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ error: 'Server error' });
  }
});

// ─── HEALTH CHECK ─────────────────────────────
app.get('/', (req, res) => {
  res.json({
    status: '✅ EDUVIX.ID API berjalan!',
    version: '1.0.0',
    endpoints: [
      'POST /api/auth/register',
      'POST /api/auth/login',
      'GET  /api/auth/me',
      'POST /api/user/xp',
      'POST /api/user/streak',
      'POST /api/quiz/hasil',
      'GET  /api/quiz/riwayat',
      'POST /api/materi/selesai',
      'GET  /api/materi/progress',
      'GET  /api/leaderboard',
    ]
  });
});

// ─── START SERVER ─────────────────────────────
const PORT = process.env.PORT || 3000;
async function start() {
  await testDB();
  app.listen(PORT, () => {
    console.log(`🚀 Server EDUVIX berjalan di port ${PORT}`);
  });
}
start();
