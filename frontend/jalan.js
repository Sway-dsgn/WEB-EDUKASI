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
    API_URL: 'http://localhost:5000'
};

function eduvixGetAllUsers() {
    try { return JSON.parse(localStorage.getItem(EDUVIX.KEY_USERS) || '[]'); } catch (e) { return []; }
}
function eduvixSaveAllUsers(users) {
    localStorage.setItem(EDUVIX.KEY_USERS, JSON.stringify(users));
}

// Logic leveling sudah dipindahkan ke api.js agar tersedia di semua halaman.


// ── Tambah XP ─────────────────────────────
async function eduvixTambahXP(jumlah, alasan) { // Ini tidak lagi digunakan, pakai EduvixAPI.tambahXP
    console.warn("eduvixTambahXP deprecated. Use EduvixAPI.tambahXP instead.");
    const user = EduvixAPI.getUser();
    if (!user) return;
    const oldLvl = user.level;
    const data = await EduvixAPI.tambahXP(jumlah, alasan);
    if (data.level > oldLvl) EduvixAPI.showLevelUp(data.level);
    EduvixAPI.updateUI();
    if (alasan) console.log(`[EDUVIX] +${jumlah} XP — ${alasan}`);
}

async function eduvixUpdateUIFromAPI() { // Helper untuk update UI setelah operasi API
    // Update semua elemen UI
    eduvixUpdateUI();

    // Popup XP
    eduvixShowXPPopup(jumlah);

    // Level up?
    const user = EduvixAPI.getUser();
    if (user && user.level > oldLvl) {
        setTimeout(() => EduvixAPI.showLevelUp(user.level), 700);
    }
}

// ── Update Streak Harian ─────────────────
async function eduvixUpdateStreak() { // Ini tidak lagi digunakan, pakai EduvixAPI.updateStreak
    console.warn("eduvixUpdateStreak deprecated. Use EduvixAPI.updateStreak instead.");
    const user = EduvixAPI.getUser();
    if (!user) return;
    const today = new Date().toISOString().split('T')[0];
    const yesterday = new Date(Date.now() - 86400000).toISOString().split('T')[0];
    const last = user.last_login ? user.last_login.split('T')[0] : null;

    if (last === today) return; // Sudah update hari ini

    let streak = user.streak || 0;
    if (last === yesterday) {
        streak++; // Hari berturut-turut
    } else {
        streak = 1; // Reset
    }
    // Update via API
    const streakData = await EduvixAPI.updateStreak();
    EduvixAPI.setUser({ ...user, streak: streakData.streak });
    EduvixAPI.updateUI();
    if (streak > 1) {
        setTimeout(() => eduvixShowToast(`🔥 ${streak} hari streak! Pertahankan!`, 'streak'), 1000);
    }
}

// ── Simpan Hasil Quiz ─────────────────────
function eduvixSimpanQuiz(data) {
    // data: { skor, benar, salah, total }
    console.warn("eduvixSimpanQuiz deprecated. Use EduvixAPI.simpanHasilQuiz instead.");
    EduvixAPI.simpanHasilQuiz('default', data.skor, data.benar, data.salah, data.total);
}

// ── Selesaikan Materi ─────────────────────
async function eduvixSelesaikanMateri(materiId, xpMateri) { // Ini tidak lagi digunakan, pakai EduvixAPI.selesaikanMateri
    console.warn("eduvixSelesaikanMateri deprecated. Use EduvixAPI.selesaikanMateri instead.");
    const user = EduvixAPI.getUser();
    if (!user) return;
    const res = await EduvixAPI.selesaikanMateri(materiId, xpMateri);
    if (res.xpDapat > 0) {
        EduvixAPI.tambahKoin(25, `Bonus materi: ${materiId}`); // Bonus koin
    }
}

// ── Tambah Koin ───────────────────────────
async function eduvixTambahKoin(jumlah, alasan) {
    console.warn("eduvixTambahKoin deprecated. Use EduvixAPI.tambahKoin instead.");
    await EduvixAPI.tambahKoin(jumlah, alasan);
    EduvixAPI.updateUI();
    if (alasan) console.log(`[EDUVIX] +${jumlah} Koin — ${alasan}`);
}

// ── Gunakan Koin ──────────────────────────
async function eduvixGunakanKoin(jumlah, alasan) {
    const user = EduvixAPI.getUser();
    if (!user || (user.coins || 0) < jumlah) return false;

    // Untuk mengurangi koin, kita perlu endpoint baru di backend atau modifikasi yang ada.
    // Untuk sementara, kita akan mengurangi secara lokal dan update UI.
    // TODO: Implement backend endpoint for spending coins.
    user.coins = (user.coins || 0) - jumlah;
    EduvixAPI.setUser(user);
    EduvixAPI.updateUI();
    if (alasan) console.log(`[EDUVIX] -${jumlah} Koin — ${alasan}`);
    return true;
}

// ── Set Avatar ────────────────────────────
async function eduvixSetAvatar(type, value) {
    const user = EduvixAPI.getUser();
    if (!user) return;
    try {
        await EduvixAPI.apiFetch('/api/user/avatar', {
            method: 'POST',
            body: JSON.stringify({ avatarType: type, avatarValue: value })
        });
    } catch (e) {
        console.warn("⚠️ Gagal update ke server, update lokal saja:", e.message);
    }
    user.avatarType = type;
    user.avatarValue = value;
    EduvixAPI.setUser(user);
    if(EduvixAPI.updateUI) EduvixAPI.updateUI(user);
    if(typeof eduvixUpdateUI === 'function') eduvixUpdateUI();
}

// ── Set Border Avatar ─────────────────────
async function eduvixSetBorder(value) {
    const user = EduvixAPI.getUser();
    if (!user) return;
    try {
        await EduvixAPI.apiFetch('/api/user/border', {
            method: 'POST',
            body: JSON.stringify({ avatarBorder: value })
        });
    } catch (e) {
        console.warn("⚠️ Gagal update ke server, update lokal saja:", e.message);
    }
    user.avatarBorder = value;
    EduvixAPI.setUser(user);
    if(EduvixAPI.updateUI) EduvixAPI.updateUI(user);
    if(typeof eduvixUpdateUI === 'function') eduvixUpdateUI();
}

// ── Set Badge ─────────────────────────────
async function eduvixSetBadge(value) {
    const user = EduvixAPI.getUser();
    if (!user) return;
    try {
        await EduvixAPI.apiFetch('/api/user/badge', {
            method: 'POST',
            body: JSON.stringify({ badge: value })
        });
        user.badge = value;
        EduvixAPI.setUser(user);
        EduvixAPI.updateUI();
        EduvixAPI.showApiToast('Badge berhasil diupdate!', 'success');
    } catch (e) {
        EduvixAPI.showApiToast('Gagal update badge: ' + e.message, 'error');
    }
}

// ── Leaderboard Data (DUMMY) ──────────────
async function eduvixGetLeaderboard() {
    try {
        const data = await EduvixAPI.getLeaderboard();
        const current = EduvixAPI.getUser();

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
    EduvixAPI.clearAuth();
    localStorage.removeItem('eduvix_logged_in');
    window.location.href = '/login';
}

// ── Guard: Cek sudah login ────────────────
//    Panggil di halaman yang perlu login
function eduvixRequireLogin() {
    if (!EduvixAPI.getUser()) {
        console.warn("[JalanJS] requireLogin failed: User not found in storage.");
        window.location.href = '/login';
        return false;
    }
    return true;
}

// ============================================
//   UPDATE SEMUA ELEMEN UI
//   Elemen HTML cukup pakai atribut data-*
// ============================================
function eduvixUpdateUI() {
    const user = EduvixAPI.getUser();
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
        // Ini akan dihandle oleh EduvixAPI.updateUI() langsung
        // Pastikan elemen avatar di HTML memiliki data-user-avatar
        // dan EduvixAPI.updateUI() sudah diperbarui untuk menangani avatarType/Value/Border
    });

    setAll('data-user-badge', el => el.textContent = user.badge || 'Pelajar Aktif');

    // Koin
    const koin = user.coins || 0;
    setAll('data-user-coins', el => el.textContent = koin); // Ini sudah dihandle oleh EduvixAPI.updateUI

    // Streak icon color
    setAll('data-streak-icon', el => {
        el.style.color = streak >= 7 ? '#ef4444' : streak >= 3 ? '#f97316' : '#94a3b8'; // Ini juga sudah dihandle oleh EduvixAPI.updateUI
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

// ============================================
//   STREAK RECOVERY MODAL
// ============================================
function eduvixShowStreakRecovery(oldStreak) {
    let el = document.getElementById('_eduvix_streak_recover');
    if (!el) {
        el = document.createElement('div');
        el.id = '_eduvix_streak_recover';
        el.style.cssText = `
      position:fixed; inset:0; z-index:99998;
      background:rgba(0,0,0,.65); backdrop-filter:blur(6px);
      display:flex; align-items:center; justify-content:center;
      animation:_lvlFadeIn .3s ease;
    `;
        document.body.appendChild(el);
    }
    el.innerHTML = `
    <div style="background:linear-gradient(135deg,#1e1b4b,#0f172a);border:1.5px solid rgba(245,158,11,.4);
      border-radius:24px;padding:40px 32px;text-align:center;max-width:340px;width:90%;
      box-shadow:0 24px 60px rgba(0,0,0,.5);animation:_lvlPop .45s cubic-bezier(.34,1.56,.64,1);">
      <div style="font-size:56px;margin-bottom:16px;">🔥</div>
      <div style="font-size:13px;font-weight:700;letter-spacing:2px;color:#f97316;text-transform:uppercase;margin-bottom:8px;">Streak Putus!</div>
      <div style="font-size:36px;font-weight:900;color:#fff;margin-bottom:8px;">${oldStreak} Hari</div>
      <p style="color:#94a3b8;font-size:14px;margin-bottom:24px;">Kamu tidak login kemarin. Mau pulihkan streak kamu pakai 100 koin?</p>
      <div style="display:flex; gap:10px; justify-content:center;">
          <button id="recoverStreakBtn"
            style="padding:12px 20px;background:linear-gradient(135deg,#f97316,#ea580c);
              color:#fff;border:none;border-radius:12px;font-size:15px;font-weight:700;
              cursor:pointer;font-family:inherit;flex:1;">Bayar 100 Koin</button>
          <button id="skipStreakBtn"
            style="padding:12px 20px;background:#334155;
              color:#94a3b8;border:none;border-radius:12px;font-size:15px;font-weight:700;
              cursor:pointer;font-family:inherit;flex:1;">Ikhlasin Aja</button>
      </div>
    </div>
  `;

    document.getElementById('recoverStreakBtn').onclick = async () => {
        try {
            const response = await EduvixAPI.apiFetch('/api/streak/recover', { method: 'POST' });
            EduvixAPI.showApiToast(response.message, 'success');
            const user = EduvixAPI.getUser();
            user.streak = response.streak;
            user.coins = response.coins;
            user.last_streak = 0;
            EduvixAPI.setUser(user);
            EduvixAPI.updateUI();
            el.remove();
        } catch (error) {
            EduvixAPI.showApiToast(error.message, 'error');
        }
    };

    document.getElementById('skipStreakBtn').onclick = () => {
        const user = EduvixAPI.getUser();
        user.last_streak = 0;
        EduvixAPI.setUser(user);
        el.remove();
    };
}

// ── Injek Panel Notif & Profil ke HTML ─────
function eduvixInitGlobalUI() {
    const user = EduvixAPI.getUser() || { nama: 'User', username: 'guest' };

    // Injek CSS untuk Notif & Modal jika belum ada
    if (!document.getElementById('_eduvix_global_css')) {
        const style = document.createElement('style');
        style.id = '_eduvix_global_css';
        style.textContent = `
            .notif-panel { position: fixed; top: 75px; right: 20px; width: 320px; background: #fff; border-radius: 16px;
                          box-shadow: 0 10px 25px rgba(0,0,0,0.1); border: 1px solid #e2e8f0; z-index: 99999 !important;
                          display: none; flex-direction: column; overflow: hidden; }
            .notif-panel.show { display: flex !important; }
            .notif-header { padding: 15px 20px; border-bottom: 1px solid #f1f5f9; background: #f8fafc; }
            .notif-header h4 { margin: 0; font-size: 14px; color: #1e293b; }
            .notif-item { padding: 12px 20px; font-size: 13px; color: #475569; border-bottom: 1px solid #f1f5f9; }
            .modal-overlay { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(4px);
                            display: none; align-items: center; justify-content: center; z-index: 100000 !important; }
            .modal-overlay.open { display: flex !important; }
            .modal-close { position: absolute; top: 15px; right: 15px; background: none; border: none; font-size: 24px; cursor: pointer; color: #94a3b8; }
            @keyframes _lvlFadeIn{from{opacity:0}to{opacity:1}}

            /* Feedback Styles */
            .feedback-fab { position: fixed; bottom: 25px; right: 25px; width: 56px; height: 56px; 
                           background: linear-gradient(135deg, #6366f1, #8b5cf6);
                           border-radius: 50%; display: flex; align-items: center; justify-content: center;
                           color: white; font-size: 22px; cursor: pointer; z-index: 9999;
                           box-shadow: 0 8px 24px rgba(99, 102, 241, 0.4); transition: all 0.3s cubic-bezier(0.175, 0.885, 0.32, 1.275); }
            .feedback-fab:hover { transform: scale(1.1) rotate(5deg); box-shadow: 0 12px 32px rgba(99, 102, 241, 0.5); }
            .feedback-modal { position: fixed; inset: 0; background: rgba(0,0,0,0.6); backdrop-filter: blur(8px);
                             display: none; align-items: center; justify-content: center; z-index: 100001; animation: _lvlFadeIn 0.3s ease; }
            .feedback-modal.open { display: flex !important; }
            .fb-card { background: white; border-radius: 24px; padding: 32px; width: 90%; max-width: 400px; 
                      box-shadow: 0 20px 50px rgba(0,0,0,0.3); position: relative; border: 1px solid #e2e8f0; }
            .fb-header { margin-bottom: 20px; text-align: center; }
            .fb-header h3 { font-family: 'Sora', sans-serif; font-size: 20px; font-weight: 800; color: #1e293b; margin-bottom: 8px; }
            .fb-header p { font-size: 14px; color: #64748b; line-height: 1.5; }
            .fb-body textarea { width: 100%; min-height: 120px; padding: 16px; border: 2px solid #e2e8f0; border-radius: 16px;
                               font-family: inherit; font-size: 14px; resize: none; transition: border-color 0.2s; outline: none; margin-bottom: 20px;
                               background: #f8fafc; }
            .fb-body textarea:focus { border-color: #6366f1; background: #fff; }
            .fb-btn { width: 100%; padding: 14px; background: #6366f1; color: white; border: none; 
                     border-radius: 12px; font-weight: 700; font-size: 15px; cursor: pointer; transition: all 0.2s;
                     box-shadow: 0 4px 12px rgba(99, 102, 241, 0.3); }
            .fb-btn:hover { background: #4f46e5; transform: translateY(-2px); box-shadow: 0 6px 16px rgba(99, 102, 241, 0.4); }

            /* Options Styling */
            .avatar-opt, .border-opt { 
                width: 42px !important; height: 42px !important; border-radius: 12px; 
                background: #f1f5f9; display: flex !important; align-items: center !important; 
                justify-content: center !important; cursor: pointer; transition: all 0.2s;
                border: 2px solid transparent; flex-shrink: 0;
            }
            .avatar-opt i { font-size: 18px; margin: 0 !important; }
            .avatar-opt:hover, .border-opt:hover { background: #e2e8f0; transform: translateY(-2px); }
            .avatar-opt.active, .border-opt.active { border-color: #6366f1; background: #fff; box-shadow: 0 4px 12px rgba(99,102,241,0.15); }
        `;
        document.head.appendChild(style);
    }

    // Panel Notifikasi
    if (!document.getElementById('notifPanel')) {
        const panel = document.createElement('div');
        panel.id = 'notifPanel';
        panel.className = 'notif-panel';
        panel.innerHTML = `
            <div class="notif-header"><h4>Pusat Notifikasi</h4></div>
            <div class="notif-list" id="globalNotifList" style="max-height: 300px; overflow-y: auto;">
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
            <div class="modal profile-modal" style="max-height: 90vh; overflow-y: auto; background: var(--card); border-radius: 16px; padding: 30px; width: 90%; max-width: 500px; box-shadow: 0 10px 30px rgba(0,0,0,0.2);">
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
                    <p style="font-size:11px; color:#94a3b8; margin-top:4px; margin-bottom:6px;">Beli avatar di <a href="/store" style="color:#6366f1; font-weight:700;">Toko</a> untuk membukanya!</p>
                    <div class="avatar-options" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:6px;">
                        <!-- Default avatar (selalu tersedia) -->
                        <div class="avatar-opt" data-avatar="initial" style="color:#1e293b;" title="Inisial (Default)">A</div>
                        
                        <!-- Shop Avatars (hanya tampil jika sudah dibeli) -->
                        <div class="avatar-opt avatar-shop" data-avatar="fas fa-user-astronaut" data-item-id="astronaut_avatar" style="display:none; color:#1e293b;" title="Astronaut Avatar"><i class="fas fa-user-astronaut"></i></div>
                        <div class="avatar-opt avatar-shop" data-avatar="fas fa-robot" data-item-id="robot_avatar" style="display:none; color:#1e293b;" title="Robot Avatar"><i class="fas fa-robot"></i></div>
                        <div class="avatar-opt avatar-shop" data-avatar="fas fa-dragon" data-item-id="dragon_avatar" style="display:none; color:#1e293b;" title="Dragon Avatar"><i class="fas fa-dragon"></i></div>
                        <div class="avatar-opt avatar-shop" data-avatar="fas fa-user-ninja" data-item-id="ninja_avatar" style="display:none; color:#1e293b;" title="Cyber Ninja (Premium)"><i class="fas fa-user-ninja"></i></div>
                        <div class="avatar-opt avatar-shop" data-avatar="fas fa-ghost" data-item-id="ghost_avatar" style="display:none; color:#1e293b;" title="Ghost Hunter (Premium)"><i class="fas fa-ghost"></i></div>
                    </div>
                </div>
                <div class="custom-section">
                    <h4>Kustomisasi Border</h4>
                    <p style="font-size:11px; color:#94a3b8; margin-top:4px; margin-bottom:6px;">Beli border di <a href="/store" style="color:#6366f1; font-weight:700;">Toko</a> untuk membukanya!</p>
                    <div class="border-options" style="display:flex; flex-wrap:wrap; gap:10px; margin-top:6px;">
                        <!-- Default border (selalu tersedia) -->
                        <div class="border-opt" data-border="none" style="background:#ddd;" title="Tidak Ada (Default)"></div>
                        
                        <!-- Shop Borders (hanya tampil jika sudah dibeli) -->
                        <div class="border-opt border-shop" data-border="#1BAAED" data-item-id="indigo_border" style="display:none; background:#1BAAED;" title="Indigo Border"></div>
                        <div class="border-opt border-shop" data-border="gold" data-item-id="gold_border" style="display:none; background:linear-gradient(gold, yellow);" title="Gold Border"></div>
                        <div class="border-opt border-shop" data-border="#ef4444" data-item-id="red_border" style="display:none; background:#ef4444;" title="Red Border"></div>
                        <div class="border-opt border-shop" data-border="fa-fire" data-item-id="fire_border" style="display:none; background:linear-gradient(45deg, #f97316, #fbbf24);" title="Aura Berapi (Premium)"></div>
                        <div class="border-opt border-shop" data-border="fa-circle-notch" data-item-id="rainbow_infinity" style="display:none; background:linear-gradient(45deg, #ff0000, #ffff00, #00ff00, #0000ff);" title="Rainbow Infinity (Premium)"></div>
                    </div>
                </div>
                <div class="custom-section" id="premiumInventorySection" style="display:none; margin-top:15px; padding-top:15px; border-top:1px dashed #e2e8f0;">
                    <h4 style="color:#6366f1;">Koleksi Premium Kamu</h4>
                    <div id="premiumItemsList" style="display:flex; gap:8px; margin-top:8px;"></div>
                </div>
                
                <div style="margin-top:30px; border-top:1px solid #f1f5f9; pt:20px;">
                    <button id="modalLogoutBtn" style="width:100%; padding:12px; background:#fff1f2; color:#ef4444; border:1.5px solid #ffe4e6; border-radius:12px; font-weight:700; cursor:pointer; transition:all 0.2s; display:flex; align-items:center; justify-content:center; gap:8px;">
                        <i class="fas fa-sign-out-alt"></i> Keluar dari Eduvix
                    </button>
                </div>
            </div>`;
        document.body.appendChild(modal);
    }

    // --- Tombol Feedback FAB ---
    if (!document.getElementById('feedbackFab')) {
        const fab = document.createElement('div');
        fab.id = 'feedbackFab';
        fab.className = 'feedback-fab';
        fab.innerHTML = '<i class="fas fa-comment-dots"></i>';
        fab.title = 'Kirim Feedback';
        document.body.appendChild(fab);
    }

    // --- Modal Feedback ---
    if (!document.getElementById('feedbackModal')) {
        const fbModal = document.createElement('div');
        fbModal.id = 'feedbackModal';
        fbModal.className = 'feedback-modal';
        fbModal.innerHTML = `
            <div class="fb-card">
                <button class="modal-close" id="closeFbModal">×</button>
                <div class="fb-header">
                    <h3>Kirim Feedback 🚀</h3>
                    <p>Saran atau masukan kamu sangat berarti bagi pengembangan Eduvix.</p>
                </div>
                <div class="fb-body">
                    <textarea id="fbText" placeholder="Tulis pesan atau saran kamu di sini..."></textarea>
                    <button class="fb-btn" id="sendFbBtn">Kirim Feedback</button>
                </div>
            </div>`;
        document.body.appendChild(fbModal);
    }

    // --- Logic Feedback ---
    const fbFab = document.getElementById('feedbackFab');
    const fbModal = document.getElementById('feedbackModal');
    const closeFb = document.getElementById('closeFbModal');
    const sendFb = document.getElementById('sendFbBtn');
    const fbText = document.getElementById('fbText');

    if (fbFab) fbFab.onclick = () => fbModal.classList.add('open');
    if (closeFb) closeFb.onclick = () => fbModal.classList.remove('open');
    if (fbModal) {
        fbModal.onclick = (e) => {
            if (e.target === fbModal) fbModal.classList.remove('open');
        };
    }

    if (sendFb) {
        sendFb.onclick = async () => {
            const msg = fbText.value.trim();
            if (!msg) {
                if (window.EduvixAPI && EduvixAPI.showApiToast) {
                    EduvixAPI.showApiToast('Tulis pesan dulu ya!', 'error');
                } else if (window.eduvixShowToast) {
                    eduvixShowToast('Tulis pesan dulu ya!', 'error');
                }
                return;
            }
            
            try {
                const response = await EduvixAPI.apiFetch('/api/feedback', {
                    method: 'POST',
                    body: JSON.stringify({ pesan: msg })
                });
                
                fbModal.classList.remove('open');
                fbText.value = '';
                
                if (window.EduvixAPI && EduvixAPI.showApiToast) {
                    EduvixAPI.showApiToast(response.message || 'Feedback berhasil dikirim!', 'success');
                } else if (window.eduvixShowToast) {
                    eduvixShowToast(response.message || 'Feedback berhasil dikirim!', 'success');
                }
            } catch (error) {
                if (window.EduvixAPI && EduvixAPI.showApiToast) {
                    EduvixAPI.showApiToast('Gagal mengirim feedback: ' + error.message, 'error');
                }
            }
        };
    }

    // --- Sinkronkan Inventory: tampilkan semua item yang sudah dibeli ---
    async function syncPremiumInventory() {
        const user = EduvixAPI.getUser();
        if (!user) return;

        // Ambil inventory dari API
        let inventoryIds = [];
        try {
            const inv = await EduvixAPI.getInventory();
            inventoryIds = inv.map(i => i.id);
            // Simpan ke user object untuk akses cepat
            user.inventory = inventoryIds;
            EduvixAPI.setUser(user);
        } catch (e) {
            // Fallback ke inventory yang sudah tersimpan
            inventoryIds = user.inventory || [];
        }

        const premiumSection = document.getElementById('premiumInventorySection');
        let hasPremium = false;

        // Tampilkan semua border yang sudah dibeli
        document.querySelectorAll('.border-opt.border-shop').forEach(opt => {
            const itemId = opt.dataset.itemId;
            if (itemId && inventoryIds.includes(itemId)) {
                opt.style.display = 'flex';
                hasPremium = true;
            } else {
                opt.style.display = 'none';
            }
        });

        // Tampilkan semua avatar yang sudah dibeli
        document.querySelectorAll('.avatar-opt.avatar-shop').forEach(opt => {
            const itemId = opt.dataset.itemId;
            if (itemId && inventoryIds.includes(itemId)) {
                opt.style.display = 'flex';
                hasPremium = true;
            } else {
                opt.style.display = 'none';
            }
        });

        if (premiumSection) premiumSection.style.display = hasPremium ? 'block' : 'none';
    }

    // Klik Tombol Logout di Modal
    document.addEventListener('click', (e) => {
        if (e.target.id === 'modalLogoutBtn' || e.target.closest('#modalLogoutBtn')) {
            if (confirm('Apakah kamu yakin ingin keluar?')) {
                if (window.EduvixAPI) EduvixAPI.logout();
            }
        }
    });

    // Klik Tombol Akun / Profil / Notifikasi
    document.addEventListener('click', (e) => {
        // Klik Tombol Notifikasi
        if (e.target.closest('.notif-btn')) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('notifPanel')?.classList.toggle('show');
        }
        // Klik Tombol Akun / Profil
        else if (e.target.closest('.user-profile')) {
            e.preventDefault();
            e.stopPropagation();
            document.getElementById('profileModal')?.classList.add('open');
            syncPremiumInventory();
        }
    });

    // Handle Selection (Lanjutkan logic yang ada)
    document.addEventListener('click', async (e) => {
        const borderOpt = e.target.closest('.border-opt');
        if (borderOpt) {
            const val = borderOpt.dataset.border;
            await eduvixSetBorder(val);
            if (window.EduvixAPI && EduvixAPI.showApiToast) {
                EduvixAPI.showApiToast('Border profil berhasil diubah!', 'success');
            }
        }

        const avatarOpt = e.target.closest('.avatar-opt');
        if (avatarOpt) {
            const val = avatarOpt.dataset.avatar;
            if (val === 'initial') await eduvixSetAvatar('initial', null);
            else await eduvixSetAvatar('icon', val);
            if (window.EduvixAPI && EduvixAPI.showApiToast) {
                EduvixAPI.showApiToast('Avatar profil berhasil diubah!', 'success');
            }
        }
    });

    // Tutup Modal & Panel
    const closeBtn = document.getElementById('closeProfileModal');
    if (closeBtn) {
        closeBtn.onclick = () => document.getElementById('profileModal').classList.remove('open');
    }

    window.addEventListener('click', (e) => {
        if (e.target.classList.contains('modal-overlay')) e.target.classList.remove('open');
        if (!e.target.closest('.notif-btn') && !e.target.closest('.notif-panel')) {
            document.getElementById('notifPanel')?.classList.remove('show');
        }
    });

    // Handle Border Selection
    document.querySelectorAll('.border-opt').forEach(opt => {
        opt.onclick = () => {
            eduvixSetBorder(opt.dataset.border);
            EduvixAPI.showApiToast('Border profil berhasil diubah!', 'success');
        };
    });

    // Handle Avatar Selection
    document.querySelectorAll('.avatar-opt').forEach(opt => {
        opt.onclick = () => {
            const val = opt.dataset.avatar;
            if (val === 'initial') {
                eduvixSetAvatar('initial', null);
            } else {
                eduvixSetAvatar('icon', val);
            }
            EduvixAPI.showApiToast('Avatar profil berhasil diubah!', 'success');
        };
    });

    // Handle Image Upload from Gallery
    const avatarUpload = document.getElementById('avatarUpload');
    if (avatarUpload) {
        avatarUpload.addEventListener('change', handleAvatarUpload);
    }

    // Handle Badge Selection
    document.querySelectorAll('.badge-opt').forEach(opt => {
        opt.onclick = () => eduvixSetBadge(opt.dataset.badge);
    });

    // Pastikan data terbaru terisi ke modal yang baru disuntikkan
    const currentUser = EduvixAPI.getUser();
    if (currentUser) {
        EduvixAPI.updateUI(currentUser);
        eduvixUpdateUI();
    }
}

function handleAvatarUpload(e) {
    const file = e.target.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
            eduvixSetAvatar('image', evt.target.result);
            EduvixAPI.showApiToast('Foto profil berhasil diunggah!', 'success');
        };
        reader.readAsDataURL(file);
    }
}

// ============================================
//   AUTO-INIT saat DOM siap
// ============================================

document.addEventListener('DOMContentLoaded', () => {
    // Halaman login & register tidak butuh guard
    const isAuthPage = window.location.pathname.includes('login');
    if (isAuthPage) return;

    // Update semua elemen UI (sudah dipanggil oleh EduvixAPI.initPage())
    eduvixUpdateUI();

    // Jalankan interaksi tombol
    eduvixInitGlobalUI();

    // Cek apakah ada streak yang bisa dipulihkan
    const user = EduvixAPI.getUser();
    if (user && user.last_streak > 1) {
        setTimeout(() => eduvixShowStreakRecovery(user.last_streak), 1500);
    }

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
window.eduvixGetUser = EduvixAPI.getUser;
window.eduvixSaveUser = EduvixAPI.setUser; // Alias ke EduvixAPI.setUser
window.eduvixTambahXP = EduvixAPI.tambahXP; // Alias ke EduvixAPI.tambahXP
window.eduvixSimpanQuiz = EduvixAPI.simpanHasilQuiz; // Alias ke EduvixAPI.simpanHasilQuiz
window.eduvixSelesaikanMateri = EduvixAPI.selesaikanMateri; // Alias ke EduvixAPI.selesaikanMateri
window.eduvixLogout = eduvixLogout;
window.eduvixUpdateUI = EduvixAPI.updateUI; // Alias ke EduvixAPI.updateUI
window.eduvixHitungLevel = eduvixHitungLevel;
window.eduvixXpPct = eduvixXpPct;
window.eduvixShowToast = eduvixShowToast;
window.eduvixTambahKoin = EduvixAPI.tambahKoin; // Alias ke EduvixAPI.tambahKoin
window.eduvixGunakanKoin = eduvixGunakanKoin;
window.useCoins = eduvixGunakanKoin; // Alias for store.html
window.addCoins = eduvixTambahKoin; // Alias for compatibility
window.eduvixSetAvatar = eduvixSetAvatar;
window.eduvixSetBorder = eduvixSetBorder;
window.eduvixSetBadge = eduvixSetBadge;
window.eduvixGetLeaderboard = eduvixGetLeaderboard;
