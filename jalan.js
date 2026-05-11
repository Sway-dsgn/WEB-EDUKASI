// ============================================
//   EDUVIX.ID — jalan.js
//   SISTEM USER GLOBAL (XP, Level, Streak)
//   Tambahkan: <script src="jalan.js"></script>
//   di SETIAP halaman (sebelum script lain)
// ============================================

// ── Konstanta ──────────────────────────────
const EDUVIX = {
    XP_PER_LEVEL: 100,
    KEY_USER: 'eduvix_user',
    KEY_USERS: 'eduvix_users',
    API_URL: 'http://localhost:3000/api'
};

// ── Helper API (Fetch dengan Token) ───────
async function eduvixApi(endpoint, method = 'GET', data = null) {
    const token = localStorage.getItem('eduvix_token');
    const headers = { 'Content-Type': 'application/json' };
    if (token) headers['Authorization'] = `Bearer ${token}`;

    const config = { method, headers };
    if (data) config.body = JSON.stringify(data);

    try {
        const response = await fetch(`${EDUVIX.API_URL}${endpoint}`, config);
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Terjadi kesalahan');
        return result;
    } catch (err) {
        console.error('API Error:', err.message);
        // Jika token tidak valid, logout
        if (err.message.includes('Token')) {
            eduvixLogout();
        }
        throw err;
    }
};

// ── Ambil user aktif ──────────────────────
function eduvixGetUser() {
    const raw = localStorage.getItem(EDUVIX.KEY_USER);
    if (!raw) return null;
    try { return JSON.parse(raw); } catch (e) { return null; }
}

// ── Simpan perubahan user ────────────────
function eduvixSaveUser(user) {
    localStorage.setItem(EDUVIX.KEY_USER, JSON.stringify(user));
    // Sync ke daftar users juga
    const users = eduvixGetAllUsers();
    const idx = users.findIndex(u => u.username === user.username);
    if (idx !== -1) { users[idx] = user; eduvixSaveAllUsers(users); }
}

function eduvixGetAllUsers() {
    try { return JSON.parse(localStorage.getItem(EDUVIX.KEY_USERS) || '[]'); } catch (e) { return []; }
}
function eduvixSaveAllUsers(users) {
    localStorage.setItem(EDUVIX.KEY_USERS, JSON.stringify(users));
}

// ── Hitung Level dari XP ──────────────────
function eduvixHitungLevel(xp) {
    return Math.floor(xp / EDUVIX.XP_PER_LEVEL) + 1;
}

// ── XP % dalam level saat ini (0–100) ────
function eduvixXpPct(xp) {
    return ((xp % EDUVIX.XP_PER_LEVEL) / EDUVIX.XP_PER_LEVEL) * 100;
}

// ── Tambah XP ─────────────────────────────
async function eduvixTambahXP(jumlah, alasan) {
    const user = eduvixGetUser();
    if (!user) return;
    const xpLama = user.xp || 0;
    const xpBaru = xpLama + jumlah;
    const lvlLama = eduvixHitungLevel(xpLama);
    const lvlBaru = eduvixHitungLevel(xpBaru);

    // Sync ke Backend
    try {
        const res = await eduvixApi('/user/xp', 'POST', { jumlah, alasan });
        if (res.xp) {
            user.xp = res.xp;
            user.level = res.level;
            eduvixSaveUser(user);
        }
    } catch (e) {
        console.error("Gagal sync XP ke server");
    }

    // Update semua elemen UI
    eduvixUpdateUI();

    // Popup XP
    eduvixShowXPPopup(jumlah);

    // Level up?
    if (lvlBaru > lvlLama) {
        setTimeout(() => eduvixShowLevelUp(lvlBaru), 700);
    }

    if (alasan) console.log(`[EDUVIX] +${jumlah} XP — ${alasan}`);
}

// ── Update Streak Harian ─────────────────
function eduvixUpdateStreak() {
    const user = eduvixGetUser();
    if (!user) return;
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    const last = user.lastLogin || '';

    if (last === today) return; // Sudah update hari ini

    let streak = user.streak || 0;
    if (last === yesterday) {
        streak++; // Hari berturut-turut
    } else {
        streak = 1; // Reset
    }
    user.streak = streak;
    user.lastLogin = today;
    eduvixSaveUser(user);

    if (streak > 1) {
        setTimeout(() => eduvixShowToast(`🔥 ${streak} hari streak! Pertahankan!`, 'streak'), 1000);
    }
}

// ── Simpan Hasil Quiz ─────────────────────
function eduvixSimpanQuiz(data) {
    // data: { skor, benar, salah, total }
    const user = eduvixGetUser();
    if (!user) return;
    if (!user.quizHistory) user.quizHistory = [];

    const xpDapat = data.benar * 10;
    user.quizHistory.push({
        ...data,
        xpDapat,
        tanggal: new Date().toISOString()
    });
    eduvixSaveUser(user);
    eduvixTambahXP(xpDapat, `Quiz selesai — skor ${data.skor}%`);
}

// ── Selesaikan Materi ─────────────────────
function eduvixSelesaikanMateri(materiId, xpMateri) {
    xpMateri = xpMateri || 50;
    const user = eduvixGetUser();
    if (!user) return;
    if (!user.materiSelesai) user.materiSelesai = [];

    const sudah = user.materiSelesai.includes(String(materiId));
    if (sudah) return; // Tidak kasih XP dua kali

    user.materiSelesai.push(String(materiId));
    const nextLesson = Math.max(user.unlockedLesson || 1, parseInt(materiId) + 1);
    user.unlockedLesson = nextLesson;
    eduvixSaveUser(user);
    eduvixTambahXP(xpMateri, `Selesai materi: ${materiId}`);
    // Bonus koin
    eduvixTambahKoin(25, `Selesai materi: ${materiId}`);
}

// ── Tambah Koin ───────────────────────────
async function eduvixTambahKoin(jumlah, alasan) {
    const user = eduvixGetUser();
    if (!user) return;
    const koinLama = user.coins || 0;
    user.coins = koinLama + jumlah;
    eduvixSaveUser(user);

    // Sync ke Backend
    try { await eduvixApi('/user/coins', 'POST', { jumlah, alasan }); } catch (e) { }

    eduvixUpdateUI();

    if (alasan) console.log(`[EDUVIX] +${jumlah} Koin — ${alasan}`);
}

// ── Gunakan Koin ──────────────────────────
function eduvixGunakanKoin(jumlah, alasan) {
    const user = eduvixGetUser();
    if (!user) return false;
    const koinLama = user.coins || 0;
    if (koinLama < jumlah) return false;

    user.coins = koinLama - jumlah;
    eduvixSaveUser(user);
    eduvixUpdateUI();

    if (alasan) console.log(`[EDUVIX] -${jumlah} Koin — ${alasan}`);
    return true;
}

// ── Set Avatar ────────────────────────────
function eduvixSetAvatar(type, value) {
    const user = eduvixGetUser();
    if (!user) return;
    user.avatarType = type; // 'icon' atau 'image'
    user.avatarValue = value; // class font-awesome atau URL
    eduvixSaveUser(user);
    eduvixUpdateUI();
}

// ── Set Border Avatar ─────────────────────
function eduvixSetBorder(value) {
    const user = eduvixGetUser();
    if (!user) return;
    user.avatarBorder = value;
    eduvixSaveUser(user);
    eduvixUpdateUI();
}

// ── Set Badge ─────────────────────────────
function eduvixSetBadge(value) {
    const user = eduvixGetUser();
    if (!user) return;
    user.badge = value;
    eduvixSaveUser(user);
    eduvixUpdateUI();
}

// ── Leaderboard Data (DUMMY) ──────────────
async function eduvixGetLeaderboard() {
    try {
        const data = await eduvixApi('/leaderboard');
        const current = eduvixGetUser();

        return data.map(u => ({
            nama: u.nama,
            username: u.username,
            xp: u.xp,
            level: u.level,
            isMe: current && u.username === current.username
        }));
    } catch (e) {
        console.error("Gagal ambil leaderboard");
        return [];
    }
}

// ── Logout ────────────────────────────────
function eduvixLogout() {
    localStorage.removeItem(EDUVIX.KEY_USER);
    localStorage.removeItem('eduvix_token');
    localStorage.removeItem('eduvix_logged_in');
    window.location.href = 'login.html';
}

// ── Guard: Cek sudah login ────────────────
//    Panggil di halaman yang perlu login
function eduvixRequireLogin() {
    if (!eduvixGetUser()) {
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

// ============================================
//   UPDATE SEMUA ELEMEN UI
//   Elemen HTML cukup pakai atribut data-*
// ============================================
function eduvixUpdateUI() {
    const user = eduvixGetUser();
    if (!user) return;

    const nama = user.nama || user.username || 'User';
    const xp = user.xp || 0;
    const level = eduvixHitungLevel(xp);
    const xpPct = eduvixXpPct(xp);
    const streak = user.streak || 0;

    // Data attributes — tambahkan ini di HTML-mu untuk menampilkan data user
    //   data-user-name     → nama lengkap
    //   data-user-username → username
    //   data-user-level    → "Lv.X"
    //   data-level-number  → angka level saja
    //   data-user-xp       → "X XP"
    //   data-xp-number     → angka XP saja
    //   data-xp-pct        → "X%"
    //   data-xp-bar        → width style (untuk progress bar)
    //   data-streak        → angka streak
    //   data-streak-label  → "X hari"
    //   data-user-avatar   → inisial nama (1 huruf)

    function setAll(attr, fn) {
        document.querySelectorAll(`[${attr}]`).forEach(fn);
    }

    setAll('data-user-name', el => el.textContent = nama);
    setAll('data-user-username', el => el.textContent = user.username || '');
    setAll('data-user-email', el => el.textContent = user.email || '');
    setAll('data-user-level', el => el.textContent = 'Lv.' + level);
    setAll('data-level-number', el => el.textContent = level);
    setAll('data-user-xp', el => el.textContent = xp + ' XP');
    setAll('data-xp-number', el => el.textContent = xp);
    setAll('data-xp-pct', el => el.textContent = Math.round(xpPct) + '%');
    setAll('data-xp-bar', el => el.style.width = xpPct + '%');
    setAll('data-streak', el => el.textContent = streak);
    setAll('data-streak-label', el => el.textContent = streak + ' hari');
    setAll('data-user-avatar', el => {
        const border = user.avatarBorder || 'none';
        el.style.border = border === 'none' ? 'none' : `3px solid ${border}`;

        if (user.avatarType === 'icon') {
            el.innerHTML = `<i class="${user.avatarValue}"></i>`;
            el.style.background = 'linear-gradient(135deg, #1BAAED, #7c3aed)';
        } else {
            el.textContent = nama.charAt(0).toUpperCase();
            el.style.background = '#6366f1';
        }
    });

    setAll('data-user-badge', el => el.textContent = user.badge || 'Pelajar Aktif');

    // Koin
    const koin = user.coins || 0;
    setAll('data-user-coins', el => el.textContent = koin);
    const userCoinsEl = document.getElementById('userCoins');
    if (userCoinsEl) userCoinsEl.textContent = koin;

    // Streak icon color
    setAll('data-streak-icon', el => {
        el.style.color = streak >= 7 ? '#ef4444' : streak >= 3 ? '#f97316' : '#94a3b8';
    });

    // XP ring SVG
    const ring = document.querySelector('[data-xp-ring]');
    if (ring) {
        const r = parseFloat(ring.getAttribute('r')) || 50;
        const circ = 2 * Math.PI * r;
        ring.style.strokeDasharray = circ;
        ring.style.strokeDashoffset = circ * (1 - xpPct / 100);
    }

    // Logout buttons
    document.querySelectorAll('[data-logout]').forEach(btn => {
        btn.addEventListener('click', eduvixLogout);
    });
}

// ============================================
//   XP POPUP
// ============================================
function eduvixShowXPPopup(jumlah) {
    let el = document.getElementById('_eduvix_xp_popup');
    if (!el) {
        el = document.createElement('div');
        el.id = '_eduvix_xp_popup';
        el.style.cssText = `
      position:fixed; top:80px; right:24px; z-index:99999;
      background:linear-gradient(135deg,#fbbf24,#f59e0b);
      color:#fff; font-weight:900; font-size:16px;
      padding:12px 22px; border-radius:50px;
      box-shadow:0 6px 20px rgba(245,158,11,.45);
      display:flex; align-items:center; gap:8px;
      opacity:0; transform:translateY(-10px);
      transition:all .35s cubic-bezier(.34,1.56,.64,1);
      pointer-events:none; font-family:inherit;
    `;
        document.body.appendChild(el);
    }
    el.innerHTML = `⭐ +${jumlah} XP!`;
    el.style.opacity = '1';
    el.style.transform = 'translateY(0)';
    setTimeout(() => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(-16px)';
    }, 2200);
}

// ============================================
//   LEVEL UP MODAL
// ============================================
function eduvixShowLevelUp(level) {
    let el = document.getElementById('_eduvix_lvlup');
    if (!el) {
        el = document.createElement('div');
        el.id = '_eduvix_lvlup';
        el.style.cssText = `
      position:fixed; inset:0; z-index:99998;
      background:rgba(0,0,0,.65); backdrop-filter:blur(6px);
      display:flex; align-items:center; justify-content:center;
      animation:_lvlFadeIn .3s ease;
    `;
        el.addEventListener('click', () => el.remove());
        document.body.appendChild(el);
        const s = document.createElement('style');
        s.textContent = `@keyframes _lvlFadeIn{from{opacity:0}to{opacity:1}}
    @keyframes _lvlPop{from{opacity:0;transform:scale(.8) translateY(20px)}to{opacity:1;transform:scale(1) translateY(0)}}`;
        document.head.appendChild(s);
    }
    el.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1.5px solid rgba(124,58,237,.4);
      border-radius:24px;padding:40px 32px;text-align:center;max-width:340px;width:90%;
      box-shadow:0 24px 60px rgba(0,0,0,.5);animation:_lvlPop .45s cubic-bezier(.34,1.56,.64,1);">
      <div style="font-size:56px;margin-bottom:16px;">🎉</div>
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#818cf8;text-transform:uppercase;margin-bottom:8px;">Level Up!</div>
      <div style="font-size:36px;font-weight:900;background:linear-gradient(135deg,#7c3aed,#3b9eff);
        -webkit-background-clip:text;-webkit-text-fill-color:transparent;margin-bottom:8px;">Level ${level}</div>
      <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">Luar biasa! Kamu terus berkembang 🚀</p>
      <button onclick="document.getElementById('_eduvix_lvlup').remove()"
        style="padding:12px 28px;background:linear-gradient(135deg,#7c3aed,#5b21b6);
          color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;
          cursor:pointer;font-family:inherit;">Sip, lanjut!</button>
    </div>
  `;
}

// ============================================
//   TOAST GLOBAL
// ============================================
function eduvixShowToast(msg, type) {
    let toast = document.getElementById('_eduvix_toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = '_eduvix_toast';
        toast.style.cssText = `
      position:fixed; bottom:28px; left:50%; transform:translateX(-50%) translateY(20px);
      z-index:99997; padding:13px 24px; border-radius:14px;
      font-weight:700; font-size:14px; color:#fff;
      box-shadow:0 8px 28px rgba(0,0,0,.3);
      opacity:0; transition:all .35s cubic-bezier(.34,1.56,.64,1);
      pointer-events:none; font-family:inherit; white-space:nowrap;
    `;
        document.body.appendChild(toast);
    }
    const colors = {
        streak: 'linear-gradient(135deg,#f97316,#dc2626)',
        success: 'linear-gradient(135deg,#10b981,#059669)',
        error: 'linear-gradient(135deg,#ef4444,#dc2626)',
        info: 'linear-gradient(135deg,#3b9eff,#2563eb)',
    };
    toast.style.background = colors[type] || colors.info;
    toast.textContent = msg;
    toast.style.opacity = '1';
    toast.style.transform = 'translateX(-50%) translateY(0)';
    clearTimeout(toast._t);
    toast._t = setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateX(-50%) translateY(20px)';
    }, 3000);
}

// ── Injek Panel Notif & Profil ke HTML ─────
function eduvixInitGlobalUI() {
    const user = eduvixGetUser() || { nama: 'User', username: 'guest' };

    // Panel Notifikasi
    if (!document.getElementById('notifPanel')) {
        const panel = document.createElement('div');
        panel.id = 'notifPanel';
        panel.className = 'notif-panel';
        panel.innerHTML = `
            <div class="notif-header"><h4>Pusat Notifikasi</h4></div>
            <div class="notif-list" id="globalNotifList">
                <div class="notif-item">👋 Halo <span data-user-name></span>, selamat datang kembali!</div>
                <div class="notif-item">🔥 Streak harian kamu: <span data-streak>0</span> hari.</div>
            </div>`;
        document.body.appendChild(panel);
    }

    // Modal Profil (Account View)
    if (!document.getElementById('profileModal')) {
        const modal = document.createElement('div');
        modal.id = 'profileModal';
        modal.className = 'modal-overlay';
        modal.innerHTML = `
            <div class="modal profile-modal" style="max-height: 90vh; overflow-y: auto;">
                <button class="modal-close" id="closeProfileModal">×</button>
                <h2 style="margin-bottom:5px;">Informasi Akun</h2>
                <p style="margin-bottom:20px;">Detail statistik belajar kamu di EDUVIX.</p>
                <div style="background:var(--bg-body, #eaf4fb); padding:20px; border-radius:16px; margin-bottom:20px; border:1px solid var(--border, #d6e8f5);">
                    <div style="display:flex; align-items:center; gap:15px; margin-bottom:15px;">
                        <div class="avatar" style="width:50px; height:50px; font-size:20px; border-radius:50%; display:flex; align-items:center; justify-content:center; color:white; background:#6366f1;" data-user-avatar></div>
                        <div>
                            <h3 style="font-size:16px;" data-user-name></h3>
                            <p style="font-size:12px; color:var(--text-light, #9ba8bb);">@<span data-user-username></span></p>
                            <span style="font-size:11px; background:#1BAAED; color:white; padding:2px 6px; border-radius:4px; font-weight:bold; display:inline-block; margin-top:4px;" data-user-badge>Pelajar Aktif</span>
                        </div>
                    </div>
                    <div style="display:grid; grid-template-columns:1fr 1fr; gap:10px; font-size:13px; font-weight:700; color:var(--text-dark, #1a2340);">
                        <div style="padding:10px; background:#fff; border-radius:8px; text-align:center;">⭐ <span data-user-xp>0</span></div>
                        <div style="padding:10px; background:#fff; border-radius:8px; text-align:center;">🏆 <span data-user-level>Lv.1</span></div>
                        <div style="padding:10px; background:#fff; border-radius:8px; text-align:center; grid-column: span 2;">💰 <span data-user-coins>0</span> Koin</div>
                    </div>
                </div>
                <div class="custom-section">
                    <h4>Kustomisasi Avatar</h4>
                    <div class="avatar-options">
                        <div class="avatar-opt" data-avatar="initial">A</div>
                        <div class="avatar-opt" data-avatar="fas fa-user-astronaut"><i class="fas fa-user-astronaut"></i></div>
                        <div class="avatar-opt" data-avatar="fas fa-user-ninja"><i class="fas fa-user-ninja"></i></div>
                        <div class="avatar-opt" data-avatar="fas fa-robot"><i class="fas fa-robot"></i></div>
                    </div>
                </div>
                <div class="custom-section">
                    <h4>Kustomisasi Border</h4>
                    <div class="border-options">
                        <div class="border-opt" data-border="none" style="background:#ddd"></div>
                        <div class="border-opt" data-border="#1BAAED" style="background:#1BAAED"></div>
                        <div class="border-opt" data-border="gold" style="background:linear-gradient(gold, yellow)"></div>
                    </div>
                </div>
                <div class="custom-section">
                    <h4>Badge Spesial</h4>
                    <div class="badge-options">
                        <div class="badge-opt" data-badge="Pelajar Aktif">Pelajar Aktif</div>
                        <div class="badge-opt" data-badge="Juara Quiz">Juara Quiz</div>
                        <div class="badge-opt" data-badge="Top 10%">Top 10%</div>
                    </div>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    // Event Click Notifikasi (Mencari tombol lonceng di header-actions)
    const notifBtn = document.querySelector('.notif-btn') || document.querySelector('.header-actions .icon-btn');
    if (notifBtn) {
        notifBtn.onclick = (e) => {
            e.stopPropagation();
            document.getElementById('notifPanel').classList.toggle('show');
        };
    }

    // Event Click Profil
    const profileBtn = document.querySelector('.user-profile');
    if (profileBtn) {
        profileBtn.onclick = () => document.getElementById('profileModal').classList.add('open');
    }

    // Tutup Modal & Panel
    const closeBtn = document.getElementById('closeProfileModal');
    if (closeBtn) closeBtn.onclick = () => document.getElementById('profileModal').classList.remove('open');

    window.onclick = (e) => {
        if (e.target.className === 'modal-overlay') e.target.classList.remove('open');
        if (!e.target.closest('.notif-btn') && !e.target.closest('.notif-panel')) {
            document.getElementById('notifPanel')?.classList.remove('show');
        }
    };

    // Handle Border Selection
    document.querySelectorAll('.border-opt').forEach(opt => {
        opt.onclick = () => eduvixSetBorder(opt.dataset.border);
    });

    // Handle Avatar Selection
    document.querySelectorAll('.avatar-opt').forEach(opt => {
        opt.onclick = () => {
            const val = opt.dataset.avatar;
            if (val === 'initial') eduvixSetAvatar('initial', '');
            else eduvixSetAvatar('icon', val);
        };
    });

    // Handle Badge Selection
    document.querySelectorAll('.badge-opt').forEach(opt => {
        opt.onclick = () => eduvixSetBadge(opt.dataset.badge);
    });

    // Pastikan data terbaru terisi ke modal yang baru disuntikkan
    eduvixUpdateUI();
}

// ============================================
//   AUTO-INIT saat DOM siap
// ============================================
document.addEventListener('DOMContentLoaded', () => {
    // Halaman login & register tidak butuh guard
    const isAuthPage = window.location.pathname.includes('login');
    if (isAuthPage) return;

    // Cek login
    if (!eduvixRequireLogin()) return;

    // Update streak harian
    eduvixUpdateStreak();

    // Update semua elemen UI
    eduvixUpdateUI();

    // Jalankan interaksi tombol
    eduvixInitGlobalUI();

    // Pasang logout handler di semua tombol logout
    document.querySelectorAll('[data-logout], .logout-btn').forEach(btn => {
        btn.addEventListener('click', e => {
            e.preventDefault();
            eduvixLogout();
        });
    });

    // ---- SIDEBAR TOGGLE (UNIVERSAL) ----
    const menuToggle = document.getElementById('menuToggle');
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebarBackdrop');

    if (menuToggle && sidebar) {
        menuToggle.addEventListener('click', () => {
            sidebar.classList.toggle('open');
            if (backdrop) backdrop.classList.toggle('show');
        });

        // Tutup sidebar kalau klik di luar
        document.addEventListener('click', (e) => {
            if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
                sidebar.classList.remove('open');
                if (backdrop) backdrop.classList.remove('show');
            }
        });

        if (backdrop) {
            backdrop.addEventListener('click', () => {
                sidebar.classList.remove('open');
                backdrop.classList.remove('show');
            });
        }
    }


});

// Export ke window agar bisa dipanggil dari file JS lain
window.eduvixGetUser = eduvixGetUser;
window.eduvixSaveUser = eduvixSaveUser;
window.eduvixTambahXP = eduvixTambahXP;
window.eduvixSimpanQuiz = eduvixSimpanQuiz;
window.eduvixSelesaikanMateri = eduvixSelesaikanMateri;
window.eduvixLogout = eduvixLogout;
window.eduvixUpdateUI = eduvixUpdateUI;
window.eduvixHitungLevel = eduvixHitungLevel;
window.eduvixXpPct = eduvixXpPct;
window.eduvixShowToast = eduvixShowToast;
window.eduvixTambahKoin = eduvixTambahKoin;
window.eduvixGunakanKoin = eduvixGunakanKoin;
window.useCoins = eduvixGunakanKoin; // Alias for store.html
window.addCoins = eduvixTambahKoin; // Alias for compatibility
window.eduvixSetAvatar = eduvixSetAvatar;
window.eduvixSetBorder = eduvixSetBorder;
window.eduvixSetBadge = eduvixSetBadge;
window.eduvixGetLeaderboard = eduvixGetLeaderboard;

const passwordInput = document.getElementById('passwordInput');
const toggleBtn = document.getElementById('toggleBtn');
const eyeIcon = document.getElementById('eyeIcon');

toggleBtn.addEventListener('click', function () {
    // Cek tipe input sekarang
    const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';

    // Ganti tipe input
    passwordInput.setAttribute('type', type);

    // Ganti ikon mata
    if (type === 'text') {
        eyeIcon.classList.replace('fa-eye', 'fa-eye-slash');
    } else {
        eyeIcon.classList.replace('fa-eye-slash', 'fa-eye');
    }
});
