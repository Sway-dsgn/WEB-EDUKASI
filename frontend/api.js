// =============================================
//   EDUVIX.ID — API Helper (SQLite version)
//   Taruh di folder WEB-EDUKASI
//   Tambahkan ke semua halaman HTML
// =============================================

// URL Backend - Dikosongkan agar otomatis menggunakan domain Vercel yang sama saat online
const PRODUCTION_BACKEND_URL = ''; 

const API_URL = (window.location.protocol === 'file:' || window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1') 
                ? 'http://localhost:3000' // Sesuaikan dengan port server lokal (default server.js menggunakan 3000)
                : (PRODUCTION_BACKEND_URL || window.location.origin);

// ─── LEVELING LOGIC ───────────────────────────
function eduvixHitungLevel(xp) {
    return Math.floor((Math.sqrt(0.16 * xp + 9) - 1) / 2);
}

function eduvixTotalXpToReach(level) {
    if (level <= 1) return 0;
    return 25 * (level - 1) * (level + 2);
}

function eduvixXpPct(xp) {
    const lvl = eduvixHitungLevel(xp);
    const curXp = eduvixTotalXpToReach(lvl);
    const nextXp = eduvixTotalXpToReach(lvl + 1);
    if (nextXp === curXp) return 0;
    const pct = ((xp - curXp) / (nextXp - curXp)) * 100;
    return Math.min(100, Math.max(0, pct));
}

// ─── TOKEN & USER ─────────────────────────────
const getToken = () => localStorage.getItem('eduvix_token');
const setToken = (t) => localStorage.setItem('eduvix_token', t);
const getUser = () => { try { return JSON.parse(localStorage.getItem('eduvix_user')); } catch { return null; } };
const setUser = (u) => localStorage.setItem('eduvix_user', JSON.stringify(u));
const clearAuth = () => { localStorage.removeItem('eduvix_token'); localStorage.removeItem('eduvix_user'); };

// ─── BASE FETCH ───────────────────────────────
async function apiFetch(path, options = {}) {
    const token = getToken();
    console.log(`[EduvixAPI] Fetching: ${API_URL + path}`);
    try {
        const res = await fetch(API_URL + path, {
            ...options,
            headers: {
                'Content-Type': 'application/json',
                ...(token ? { Authorization: 'Bearer ' + token } : {}),
                ...(options.headers || {})
            }
        });
        const contentType = res.headers.get("content-type");
        let data;
        if (contentType && contentType.includes("application/json")) {
            data = await res.json();
        } else {
            const text = await res.text();
            data = { error: text || 'Server Error (Non-JSON)' };
        }
        if (!res.ok) throw new Error(data.error || data.message || `Error ${res.status}`);
        return data;
    } catch (err) {
        console.error('API Fetch Error:', err);
        throw err;
    }
}

// ─── AUTH ─────────────────────────────────────
async function register(nama, username, password) {
    const data = await apiFetch('/api/auth/register', {
        method: 'POST',
        body: JSON.stringify({ nama, username, password })
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

async function login(username, password) {
    const data = await apiFetch('/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ username, password })
    });
    setToken(data.token);
    setUser(data.user);
    return data;
}

function logout() {
    clearAuth();
    window.location.href = 'login.html';
}

// Cek login — redirect kalau belum login
async function requireLogin() {
    console.log("[EduvixAPI] Checking session...");
    // Deteksi halaman login lebih fleksibel
    const isLoginPage = window.location.pathname.includes('login.html') || 
                         window.location.pathname.endsWith('/') || 
                         window.location.pathname === '';
    
    const token = getToken();
    const user = getUser();

    if (!token || !user) {
        if (!user) {
            console.warn("[EduvixAPI] No token or user found, redirecting to login...");
            window.location.href = 'login.html';
        }
        return null;
    }

    try {
        const [userData, inventory] = await Promise.all([
            apiFetch('/api/auth/me'),
            apiFetch('/api/shop/inventory')
        ]);
        userData.inventory = inventory.map(i => i.id);
        setUser(userData);
        console.log("[EduvixAPI] Session valid for:", userData.username, "Inventory:", userData.inventory);
        return userData;
    } catch (error) {
        const errorMessage = error?.message || "Unknown Error";
        console.error("[EduvixAPI] Verification failed:", errorMessage);

        // Jika Network Error (server mati), biarkan pakai data lokal
        if (errorMessage.includes('fetch') || errorMessage.includes('NetworkError') || errorMessage.includes('Failed to fetch') || errorMessage.includes('failed to fetch')) {
            console.warn("⚠️ Server tidak merespon. Menggunakan data lokal.");
            return user;
        }

        if (isLoginPage) return null;
        
        console.warn("[EduvixAPI] Session invalid, clearing auth and redirecting...");
        clearAuth();
        window.location.href = 'login.html';
        return null;
    }
}

// ─── XP & STREAK ──────────────────────────────
async function tambahXP(jumlah, alasan) {
    const user = getUser();
    const oldLvl = user ? (user.level || Math.floor((user.xp || 0) / 100) + 1) : 1;

    const data = await apiFetch('/api/user/xp', {
        method: 'POST',
        body: JSON.stringify({ jumlah, alasan })
    });

    if (data.level > oldLvl) showLevelUp(data.level);

    if (user) {
        user.xp = data.xp;
        user.level = data.level;
        setUser(user);
        updateUI(user);
    }
    return data;
}

async function tambahKoin(jumlah, alasan) {
    return await apiFetch('/api/user/coins', {
        method: 'POST',
        body: JSON.stringify({ jumlah, alasan })
    });
}

async function updateStreak() {
    return await apiFetch('/api/user/streak', { method: 'POST' });
}

// ─── QUIZ ─────────────────────────────────────
async function simpanHasilQuiz(quiz_id, skor, benar, salah, total) {
    const user = getUser();
    const oldLvl = user ? (user.level || eduvixHitungLevel(user.xp || 0)) : 1;

    const data = await apiFetch('/api/quiz/hasil', {
        method: 'POST',
        body: JSON.stringify({ quizId: quiz_id, skor, benar, salah, total })
    });

    if (data.level > oldLvl) showLevelUp(data.level);

    if (user) {
        user.xp = data.xpBaru;
        user.coins = data.koinBaru;
        user.level = data.level;
        setUser(user);
        updateUI(user);
    }
    return data;
}

async function getRiwayatQuiz() {
    return await apiFetch('/api/quiz/riwayat');
}

// ─── MATERI ───────────────────────────────────
async function selesaikanMateri(materi_id, xp_materi) {
    const user = getUser();
    const oldLvl = user ? (user.level || eduvixHitungLevel(user.xp || 0)) : 1;

    try {
        const data = await apiFetch('/api/materi/selesai', {
            method: 'POST',
            body: JSON.stringify({ materiId: materi_id, xpDapat: xp_materi })
        });

        if (data.level > oldLvl) showLevelUp(data.level);

        if (user) {
            user.xp = data.xpBaru;
            user.coins = data.koinBaru;
            user.level = data.level;
            setUser(user);
            updateUI(user);
        }
        return data;
    } catch (err) {
        console.warn("⚠️ Server tidak merespon. Menggunakan data lokal untuk Selesaikan Materi.");
        if (!user) return { xpBaru: 0, koinBaru: 0, level: 1 };
        
        user.xp = (user.xp || 0) + xp_materi;
        user.coins = (user.coins || 0) + 25; // Asumsi koin dapat 25
        
        const newLvl = eduvixHitungLevel(user.xp);
        if (newLvl > oldLvl) {
            user.level = newLvl;
            showLevelUp(newLvl);
        }
        
        setUser(user);
        updateUI(user);
        
        showXPPopup(xp_materi);
        
        return { xpBaru: user.xp, koinBaru: user.coins, level: user.level };
    }
}

async function getProgressMateri() {
    return await apiFetch('/api/materi/progress');
}

// ─── LEADERBOARD ──────────────────────────────
async function getLeaderboard() {
    return await apiFetch('/api/leaderboard');
}

// ─── SHOP & INVENTORY ─────────────────────────
async function getShopItems() {
    return await apiFetch('/api/shop/items');
}

async function buyItem(itemId) {
    const data = await apiFetch('/api/shop/buy', {
        method: 'POST',
        body: JSON.stringify({ itemId })
    });
    // Update local user coins
    const user = getUser();
    if (user) {
        user.coins = data.coins;
        user.inventory = user.inventory || [];
        if (!user.inventory.includes(itemId)) user.inventory.push(itemId);
        setUser(user);
        updateUI(user);
    }
    return data;
}

async function getInventory() {
    return await apiFetch('/api/shop/inventory');
}

// ─── UPDATE UI ────────────────────────────────
function updateUI(user) {
    if (!user) return;
    const set = (sel, val) => document.querySelectorAll(sel).forEach(el => el.textContent = val);
    const nama = user.nama || user.username || 'User';
    const xp = user.xp || 0;
    const level = user.level || eduvixHitungLevel(xp);
    const streak = user.streak || 0;
    const coins = user.coins || 0;
    const xpPct = eduvixXpPct(xp);

    set('[data-user-name]', nama);
    set('[data-user-xp]', xp + ' XP');
    set('[data-xp-number]', xp);
    set('[data-user-level]', 'Lv.' + level);
    set('[data-level-number]', level);
    set('[data-streak]', streak);
    set('[data-streak-label]', streak + ' hari');
    set('[data-user-coins]', coins);
    set('[data-user-badge]', user.badge || 'Pelajar Aktif');


    // XP bar
    document.querySelectorAll('[data-xp-bar]').forEach(el => el.style.width = xpPct + '%');

    // Avatar inisial
    document.querySelectorAll('[data-user-avatar]').forEach(el => {
        el.textContent = nama.charAt(0).toUpperCase();
        el.style.background = '#6366f1'; // Default background
        el.innerHTML = nama.charAt(0).toUpperCase(); // Default initial

        // Apply custom avatar if set
        el.classList.remove('avatar-ghost');
        if (user.avatarType === 'icon' && user.avatarValue) {
            el.innerHTML = `<i class="${user.avatarValue}"></i>`;
            el.style.background = 'linear-gradient(135deg, #1BAAED, #7c3aed)';
            el.style.color = 'white'; // Icon jadi putih pas dipasang
        } else if (user.avatarType === 'image' && user.avatarValue) {
            el.innerHTML = `<img src="${user.avatarValue}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
            el.style.background = 'transparent';
        }

        // Apply border
        el.classList.remove('border-rainbow', 'border-fire');
        if (user.avatarBorder === 'fa-circle-notch') {
            el.classList.add('border-rainbow');
            el.style.border = 'none';
        } else if (user.avatarBorder === 'fa-fire') {
            el.classList.add('border-fire');
            el.style.border = 'none';
        } else if (user.avatarBorder && user.avatarBorder !== 'none') {
            el.style.border = `3px solid ${user.avatarBorder}`;
        } else {
            el.style.border = 'none';
        }
    });

    // Gambar avatar
}

// ─── XP POPUP ─────────────────────────────────
function showXPPopup(jumlah) {
    let el = document.getElementById('_xp_pop');
    if (!el) {
        el = document.createElement('div');
        el.id = '_xp_pop';
        el.style.cssText = `
      position:fixed; top:80px; right:24px; z-index:9999;
      background:linear-gradient(135deg,#fbbf24,#f59e0b);
      color:#fff; font-weight:900; font-size:16px;
      padding:12px 22px; border-radius:50px;
      box-shadow:0 6px 20px rgba(245,158,11,.4);
      opacity:0; transform:translateY(-8px);
      transition:all .3s cubic-bezier(.34,1.56,.64,1);
      pointer-events:none;
    `;
        document.body.appendChild(el);
    }
    el.textContent = '⭐ +' + jumlah + ' XP!';
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-16px)';
    }, 2500);
}

// ─── LEVEL UP MODAL ───────────────────────────
function showLevelUp(level) {
    let el = document.getElementById('_lvl_up_modal');
    if (!el) {
        el = document.createElement('div');
        el.id = '_lvl_up_modal';
        el.style.cssText = `
            position:fixed; inset:0; z-index:10000;
            background:rgba(0,0,0,0.8); backdrop-filter:blur(8px);
            display:flex; align-items:center; justify-content:center;
            animation: fadeIn 0.3s ease;
        `;
        document.body.appendChild(el);
    }
    el.innerHTML = `
        <div style="background:linear-gradient(135deg,#fff,#f8fafc); padding:40px; border-radius:32px; text-align:center; max-width:340px; box-shadow:0 25px 50px -12px rgba(0,0,0,0.5); border:1px solid #e2e8f0;">
            <div style="font-size:72px; margin-bottom:16px;">🎊</div>
            <div style="text-transform:uppercase; letter-spacing:2px; font-weight:800; color:#6366f1; font-size:14px; margin-bottom:8px;">Selamat!</div>
            <h2 style="font-family:'Sora',sans-serif; font-size:32px; font-weight:800; color:#1e293b; margin-bottom:8px;">Level Naik!</h2>
            <div style="font-size:20px; font-weight:700; color:#4338ca; margin-bottom:24px;">Sekarang Level ${level}</div>
            <button onclick="this.closest('#_lvl_up_modal').remove()" style="width:100%; background:#6366f1; color:#fff; border:none; padding:16px; border-radius:16px; font-weight:700; cursor:pointer; font-size:16px;">Lanjutkan Belajar</button>
        </div>
    `;
}

// ─── TOAST ────────────────────────────────────
let _tt;
function showApiToast(msg, type, dur) {
    dur = dur || 2500;
    let el = document.getElementById('_api_toast');
    if (!el) {
        el = document.createElement('div');
        el.id = '_api_toast';
        el.style.cssText = `
      position:fixed; bottom:24px; left:50%;
      transform:translateX(-50%) translateY(16px);
      z-index:9999; padding:13px 24px; border-radius:12px;
      font-size:14px; font-weight:700; color:#fff;
      background:#1e293b; white-space:nowrap;
      box-shadow:0 8px 24px rgba(0,0,0,.25);
      opacity:0; transition:all .3s ease; pointer-events:none;
    `;
        document.body.appendChild(el);
    }
    el.textContent = msg;
    if (type === 'streak') el.style.background = 'linear-gradient(135deg,#f97316,#ea580c)';
    else if (type === 'xp') el.style.background = 'linear-gradient(135deg,#fbbf24,#f59e0b)';
    else if (type === 'error') el.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
    else if (type === 'success') el.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
    else el.style.background = '#1e293b';
    el.style.opacity = '1';
    el.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(_tt);
    _tt = setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateX(-50%) translateY(16px)';
    }, dur);
}

// ─── INIT HALAMAN ─────────────────────────────
// Panggil ini di semua halaman selain login.html
async function initPage() {
    const user = await requireLogin();
    if (!user) return null;

    // Update streak
    try {
        const streakData = await updateStreak();
        user.streak = streakData.streak;
        if (streakData.naik && streakData.streak > 1) {
            showApiToast('🔥 ' + streakData.streak + ' hari streak! Pertahankan!', 'streak', 3500);
        }
    } catch (e) { }

    // Update semua elemen UI
    updateUI(user);

    // Pasang tombol logout
    document.querySelectorAll('[data-logout], #logoutBtn, .logout-btn, .nav-link.logout').forEach(btn => {
        btn.addEventListener('click', e => { e.preventDefault(); logout(); });
    });

    return user;
}

// ─── EXPORT KE WINDOW ─────────────────────────
window.EduvixAPI = {
    // Auth
    register, login, logout, requireLogin,
    // User
    tambahXP, tambahKoin, updateStreak,
    // Quiz
    simpanHasilQuiz, getRiwayatQuiz,
    // Materi
    selesaikanMateri, getProgressMateri,
    // Leaderboard
    getLeaderboard,
    // Shop
    getShopItems, buyItem, getInventory,
    // UI
    updateUI, initPage, showApiToast, showXPPopup, showLevelUp, apiFetch,
    // Data
    getUser, getToken
};