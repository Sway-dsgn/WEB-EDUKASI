// =============================================
//   EDUVIX.ID — Dashboard Modern JS
// =============================================

// ─── RENDER USER INFO ─────────────────────────
function renderUserInfo(user, stats = {}) {
  if (!user) return;

  // Sinkronisasi UI Global dulu menggunakan api.js
  if (window.EduvixAPI) EduvixAPI.updateUI(user);

  const nama = user.nama || user.username || 'User';
  const xp = user.xp || 0;
  const xpPct = eduvixXpPct(xp); // XP percentage within current level

  // Welcome banner
  const bannerH = document.querySelector('.banner-content h2');
  if (bannerH) {
    const jam = new Date().getHours();
    const sapa = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';
    bannerH.textContent = `${sapa}, ${nama.split(' ')[0]} 👋`;
  }

  // Streak widget
  const strNum = document.querySelector('.streak-num');
  if (strNum) strNum.textContent = user.streak || 0;

  const bannerPct = document.querySelector('.banner-pct');
  if (bannerPct) bannerPct.textContent = Math.round(xpPct) + '%';

  // Update Stats Widget Data
  document.querySelectorAll('[data-stat-materi]').forEach(el => el.textContent = stats.materiSelesai || 0);
  document.querySelectorAll('[data-stat-akurasi]').forEach(el => el.textContent = (stats.akurasi || 0) + '%');
}

// ─── PROGRESS BARS ────────────────────────────
function animateProgressBars(materiProgress = []) {
  // Banner progress
  const bannerFill = document.querySelector('.banner-bar-fill'); // This is for XP progress
  const user = EduvixAPI.getUser();
  if (bannerFill) {
    bannerFill.style.width = '0%';
    const xpPct = eduvixXpPct(user.xp || 0);
    setTimeout(() => bannerFill.style.width = xpPct + '%', 300);

    const bannerPct = document.querySelector('.banner-pct');
    if (bannerPct) bannerPct.textContent = Math.round(xpPct) + '%';
  }

  // Course progress bars
  // Materi ID biasanya 1, 2, 3... Kita asumsikan ada 3 kategori utama
  const categories = { '1': 0, '2': 0, '3': 0 };
  materiProgress.forEach(p => { if (categories[p.materi_id] !== undefined) categories[p.materi_id] = 100; });

  document.querySelectorAll('.course-progress-fill').forEach((el, i) => {
    const pct = categories[i + 1] || 0;
    setTimeout(() => el.style.width = pct + '%', 400);
  });
}

// ─── TAMBAH ELEMEN DINAMIS KE HTML ───────────
function enhanceHTML() {
  const bannerContent = document.querySelector('.banner-content');
  if (bannerContent && !bannerContent.querySelector('.banner-progress')) {
    const prog = document.createElement('div');
    prog.className = 'banner-progress';
    prog.innerHTML = `
      <div class="banner-bar-track">
        <div class="banner-bar-fill"></div>
      </div>
      <span class="banner-pct">0%</span>
    `;
    bannerContent.appendChild(prog);
  }

  // Modal profil dan Notifikasi sekarang dihandle sepenuhnya oleh jalan.js (eduvixInitGlobalUI)
  // Jadi kita tidak perlu menyuntikkan HTML duplikat di sini.

  // Terapkan tema yang tersimpan saat halaman dimuat
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme === 'dark') {
    document.body.classList.add('dark-theme');
  }

  // Ganti Upgrade Card dengan Dark Mode Toggle di Sidebar
  const sidebarFooter = document.querySelector('.sidebar-footer');
  if (sidebarFooter) {
    sidebarFooter.innerHTML = `
      <div class="theme-card" style="background: var(--card); padding: 12px 16px; border-radius: var(--r-md); border: 1.5px solid var(--border); display: flex; align-items: center; justify-content: space-between;">
          <span style="font-size: 13px; font-weight: 600; color: var(--text);">Mode Gelap</span>
          <div class="switch-toggle" id="sidebarThemeToggle" style="width: 46px; height: 24px; border-radius: 12px; background: var(--border); cursor: pointer; position: relative; transition: var(--tr);">
              <div class="switch-thumb" style="width: 20px; height: 20px; border-radius: 50%; background: #fff; position: absolute; top: 2px; left: 2px; transition: var(--tr); display: flex; align-items: center; justify-content: center; font-size: 10px; box-shadow: 0 2px 4px rgba(0,0,0,0.2);">
                  <i class="fa-solid fa-moon" style="color: #6366f1;"></i>
              </div>
          </div>
      </div>
    `;

    const sBtn = document.getElementById('sidebarThemeToggle');
    const thumb = sBtn.querySelector('.switch-thumb');
    const savedTheme = localStorage.getItem('theme');
    const isDark = savedTheme === 'dark';

    function updateSwitchUI(dark) {
      if (dark) {
        sBtn.style.background = 'var(--indigo)';
        thumb.style.left = '24px';
        thumb.innerHTML = '<i class="fa-solid fa-sun" style="color: #f59e0b;"></i>';
      } else {
        sBtn.style.background = 'var(--border)';
        thumb.style.left = '2px';
        thumb.innerHTML = '<i class="fa-solid fa-moon" style="color: #6366f1;"></i>';
      }
    }

    updateSwitchUI(isDark);

    sBtn.addEventListener('click', () => {
      const isCurrentlyDark = document.body.classList.toggle('dark-theme');
      localStorage.setItem('theme', isCurrentlyDark ? 'dark' : 'light');
      updateSwitchUI(isCurrentlyDark);
      updateSwitchUI(isCurrentlyDark);
    });
  }

  // Tambah Streak Widget di right sidebar
  const rs = document.querySelector('.right-sidebar');
  if (rs && !document.querySelector('.streak-widget')) {
    const sw = document.createElement('div');
    sw.className = 'widget streak-widget';
    sw.innerHTML = `
      <div class="widget-header">
        <h3>Streak Belajar</h3>
      </div>
      <div class="streak-inner">
        <div class="streak-fire">🔥</div>
        <div>
          <div class="streak-num" data-streak>0</div>
          <div class="streak-lbl">hari berturut-turut</div>
        </div>
      </div>
    `;
    rs.insertBefore(sw, rs.firstChild);
  }

  // Tambah Stats Widget di right sidebar
  if (rs && !document.querySelector('.stats-widget')) {
    const sv = document.createElement('div');
    sv.className = 'widget';
    sv.innerHTML = `
      <div class="widget-header"><h3>Statistik Saya</h3></div>
        <div class="stats-widget">
          <div class="stat-box">
            <span class="stat-box-val" data-user-xp>0</span>
            <div class="stat-box-lbl">Total XP</div>
          </div>
          <div class="stat-box">
            <span class="stat-box-val" data-user-level>Lv.1</span>
            <div class="stat-box-lbl">Level</div>
          </div>
          <div class="stat-box">
            <span class="stat-box-val" data-stat-materi>0</span>
            <div class="stat-box-lbl">Materi Selesai</div>
          </div>
          <div class="stat-box">
            <span class="stat-box-val" data-stat-akurasi>0%</span>
            <div class="stat-box-lbl">Akurasi Quiz</div>
          </div>
        </div>
    `;
    // Sisipkan sebelum calendar widget
    const cal = rs.querySelector('.calendar-widget');
    if (cal) rs.insertBefore(sv, cal);
    else rs.appendChild(sv);
  }
}

// ─── ACTIVITY GRAPH INTERAKTIF ────────────────
function initActivityGraph(materiProgress = []) {
  const svg = document.querySelector('.activity-graph svg');
  if (!svg) return;

  // Buat gradient fill
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `
      < linearGradient id = "graphGrad" x1 = "0" y1 = "0" x2 = "0" y2 = "1" >
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient >
      `;
  svg.insertBefore(defs, svg.firstChild);

  // Map urutan grafik (Senin-Minggu)
  const days = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
  const activity = new Array(7).fill(0);
  materiProgress.forEach(p => {
    const d = new Date(p.selesai_at).getDay();
    activity[d]++;
  });
  const dataUrut = [activity[1], activity[2], activity[3], activity[4], activity[5], activity[6], activity[0]];

  // Kalkulasi Path Dinamis (Bukan hardcoded melengkung lagi)
  let pathD = "";
  dataUrut.forEach((val, i) => {
    const x = i * 100;
    const y = 90 - (val * 15); // Baseline di 90 (bawah), naik 15px per aktivitas
    pathD += (i === 0 ? "M" : " L") + `${x},${y} `;
  });

  // Tambah area fill
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', `${pathD} L600, 100 L0, 100 Z`);
  area.setAttribute('fill', 'url(#graphGrad)');
  svg.insertBefore(area, svg.querySelector('path'));

  const mainLine = svg.querySelector('path:not([fill*="url"])');
  if (mainLine) mainLine.setAttribute('d', pathD);

  // Dots tooltip on hover
  svg.querySelectorAll('circle').forEach((dot, i) => {
    const val = dataUrut[i] || 0;
    dot.style.cursor = 'pointer';
    dot.setAttribute('r', '6');
    dot.style.transition = 'all .2s';

    // Posisikan dot sesuai data
    const dotY = 90 - (val * 15);
    dot.setAttribute('cy', dotY);

    dot.addEventListener('mouseenter', () => {
      dot.setAttribute('r', '9');
      showToast(`${labels[i]}: ${val} materi`, 'i', 1500);
    });
    dot.addEventListener('mouseleave', () => dot.setAttribute('r', '6'));
  });

  // Update date range
  const dr = document.querySelector('.date-range');
  if (dr) {
    const now = new Date();
    const week = new Date(now - 6 * 86400000);
    const fmt = d => d.toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' });
    dr.textContent = `${fmt(week)} — ${fmt(now)} `;
  }
}

// ─── CALENDAR INTERAKTIF ──────────────────────
function initCalendar(materiProgress = [], quizRiwayat = []) {
  const calendarGrid = document.querySelector('.calendar-grid');
  const monthEl = document.querySelector('.month-nav span');
  const prevBtn = document.querySelector('.month-btn:first-child');
  const nextBtn = document.querySelector('.month-btn:last-child');

  if (!calendarGrid || !monthEl) return;

  // Gabungkan semua tanggal aktivitas
  const activities = {};
  [...materiProgress, ...quizRiwayat].forEach(item => {
    const dateStr = (item.selesai_at || item.created_at || '').substring(0, 10);
    if (dateStr) activities[dateStr] = (activities[dateStr] || 0) + 1;
  });

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  let date = new Date();
  let viewMonth = date.getMonth();
  let viewYear = date.getFullYear();

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    monthEl.textContent = `${months[viewMonth]} ${viewYear} `;

    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();

    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      calendarGrid.appendChild(empty);
    }

    const todayReal = new Date();
    const isThisMonth = todayReal.getMonth() === viewMonth && todayReal.getFullYear() === viewYear;

    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      dayEl.textContent = d;

      // Cek keaktifan berdasarkan tanggal
      const curDate = `${viewYear}-${String(viewMonth + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const count = activities[curDate] || 0;

      if (count > 0) {
        if (count >= 3) dayEl.classList.add('high');
        else if (count >= 2) dayEl.classList.add('medium');
        else dayEl.classList.add('low');
      }

      if (isThisMonth && d === todayReal.getDate()) {
        dayEl.classList.add('today');
      }

      dayEl.addEventListener('click', () => {
        document.querySelectorAll('.calendar-grid .day').forEach(x => x.classList.remove('selected'));
        dayEl.classList.add('selected');
        if (count > 0) showToast(`🔥 Ada ${count} aktivitas di tanggal ini!`, 'info', 1500);
      });
      calendarGrid.appendChild(dayEl);
    }
  }

  prevBtn?.addEventListener('click', () => { viewMonth--; if (viewMonth < 0) { viewMonth = 11; viewYear--; } renderCalendar(); });
  nextBtn?.addEventListener('click', () => { viewMonth++; if (viewMonth > 11) { viewMonth = 0; viewYear++; } renderCalendar(); });

  renderCalendar();
}

// ─── SEARCH ───────────────────────────────────
function initSearch() {
  const input = document.querySelector('.search-box input');
  if (!input) return;

  input.addEventListener('keydown', async e => {
    if (e.key === 'Enter' && input.value.trim()) {
      showToast(`🔍 Mencari: "${input.value.trim()}"`, 'i', 2000);
      // Implement actual search logic here if needed
    }
  });
}

// ─── NAV ITEMS ────────────────────────────────
function initNav() {
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', function (e) {
      // Kalau href bukan '#', biarkan navigasi biasa
      if (this.getAttribute('href') && this.getAttribute('href') !== '#') return;
      e.preventDefault();
      document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });
}

// ─── COURSE CARDS ─────────────────────────────
function initCourseCards() {
  // Click handler sudah diatur langsung di HTML (onclick="window.location.href='...'")
  // Jadi di sini kosongkan saja biar nggak konflik.

  const addCard = document.querySelector('.course-card.add-course');
  if (addCard) {
    addCard.addEventListener('click', () => {
      showToast('🚀 Fitur tambah materi segera hadir!', 'i', 2500);
    });
  }
}

// ─── TASK ITEMS ───────────────────────────────
function initTasks() {
  document.querySelectorAll('.task-item').forEach((item, index) => {
    item.style.cursor = 'pointer';
    item.addEventListener('click', () => {
      // Modul 1 ke quizz.html, Modul 2 ke tka.html
      if (index === 0) window.location.href = '/quizz';
      else if (index === 1) window.location.href = '/tka';
    });
  });
}

// ─── LOGOUT ───────────────────────────────────
function initLogout() {
  const logoutEl = document.querySelector('[data-logout]') ||
    document.getElementById('logoutBtn');
  // Sudah dihandle oleh api.js
}

// ─── BELL NOTIF & PROFILE ─────────────────────
function initNotifProfile() {
  // Notifikasi dan Profil sekarang dikelola sepenuhnya oleh jalan.js (eduvixInitGlobalUI)
  // Fungsi ini dikosongkan agar tidak bentrok (double-toggle).

  // Handle Border Selection
  // These are now handled by eduvixInitGlobalUI in jalan.js
  // document.querySelectorAll('.border-opt').forEach(opt => {
  //   opt.addEventListener('click', () => {
  //     eduvixSetBorder(opt.dataset.border);
  //     showToast('Border profil berhasil diubah!', 'i', 2000);
  //   });
  // });

  // Handle Avatar Selection
  // These are now handled by eduvixInitGlobalUI in jalan.js
  // document.querySelectorAll('.avatar-opt').forEach(opt => {
  //   opt.addEventListener('click', () => {
  //     const val = opt.dataset.icon;
  //     if (val === 'initial') eduvixSetAvatar('initial', null);
  //     else eduvixSetAvatar('icon', `fas ${ val } `); // Assuming 'fas fa-icon' format
  //     showToast('Avatar profil berhasil diubah!', 'i', 2000);
  //   });
  // });

  // Handle Image Upload from Gallery
  const avatarUpload = document.getElementById('avatarUpload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', async function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = async function (evt) {
          // Use eduvixSetAvatar to update and sync with backend
          await eduvixSetAvatar('image', evt.target.result);
          EduvixAPI.showApiToast('Foto profil berhasil diunggah!', 'success');
        };
        reader.readAsDataURL(file);
      }
    });
  }
}
// ─── UPGRADE BUTTON ───────────────────────────
function initUpgrade() {
  const btn = document.querySelector('.btn-upgrade');
  if (btn) {
    btn.addEventListener('click', () => {
      showToast('✨ Fitur Pro segera hadir!', 'i', 2500);
    });
  }
}

// ─── TOAST ────────────────────────────────────
let _toastT;
function showToast(msg, type, dur) {
  dur = dur || 2200;
  let el = document.getElementById('_dash_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_dash_toast';
    el.className = 'toast';
    document.body.appendChild(el);
  }
  el.textContent = msg;
  el.className = `toast show ${type || ''} `;
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), dur);
}

// ─── INIT SEMUA ───────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  // Mencegah double initialization jika di HTML sudah ada pemanggilan initPage
  if (window._eduvix_started) return;
  window._eduvix_started = true;

  // Jalankan init UI dasar dulu supaya tombol-tombol bisa dipencet
  enhanceHTML();
  unifySidebarNav();
  initSearch();
  initNav();
  initCourseCards();
  initTasks();
  initLogout();
  initNotifProfile();
  initUpgrade();
  initCalendar();
  initResponsiveMenu();

  // Baru ambil data dari API (pake try-catch supaya kaga ngerusak tombol)
  let stats = { materiSelesai: 0, akurasi: 0 };
  let materiProgress = [];
  let quizRiwayat = [];
  let user = null;
  try {
    user = await EduvixAPI.initPage();
    if (user && user.id) materiProgress = await EduvixAPI.getProgressMateri();
    quizRiwayat = await EduvixAPI.getRiwayatQuiz();

    // Hitung Stats
    stats.materiSelesai = materiProgress.length;
    const totalMateriTersedia = 6; // Sesuaikan dengan jumlah total materi di silabus
    stats.progresPersen = Math.round((stats.materiSelesai / totalMateriTersedia) * 100);

    if (quizRiwayat.length > 0) {
      // Kelompokkan skor terbaik per quiz_id
      const bestScores = {};
      quizRiwayat.forEach(q => {
        const qid = q.quiz_id || 'default';
        if (!bestScores[qid] || q.skor > bestScores[qid]) {
          bestScores[qid] = q.skor;
        }
      });

      const scoresArray = Object.values(bestScores);
      const totalSkor = scoresArray.reduce((acc, curr) => acc + curr, 0);

      // Hitung rata-rata akurasi dari quiz yang sudah dikerjakan (maks 100%)
      stats.akurasi = Math.min(100, Math.round(totalSkor / Math.max(scoresArray.length, 1)));
    }
  } catch (e) {
    console.error("Gagal sinkronisasi data:", e);
  }

  // Update UI Elements
  renderUserInfo(user || EduvixAPI.getUser(), stats);

  // Update progres khusus di beranda/dashboard
  document.querySelectorAll('[data-stat-progres]').forEach(el => el.textContent = stats.progresPersen + '%');

  // Update label progress kursus spesifik (jika ada)
  const completedIds = materiProgress.map(m => m.materi_id);
  if (completedIds.includes('materi_01')) {
    const p1 = document.querySelector('[data-course-progress="materi_01"]');
    if (p1) p1.textContent = '100%';
  }
  if (completedIds.includes('materi_02')) {
    const p2 = document.querySelector('[data-course-progress="materi_02"]');
    if (p2) p2.textContent = '100%';
  }

  animateProgressBars(materiProgress); // Animasi progress sesuai materi yang selesai
  initCalendar(materiProgress, quizRiwayat); // Kalender berdasarkan aktivitas
  initDashboardAchievements(user, materiProgress, quizRiwayat); // Memuat pencapaian di dashboard
  initLeaderboard(); // Memuat peringkat user

  // Greeting berdasarkan waktu
  setTimeout(() => {
    const jam = new Date().getHours();
    if (jam >= 5 && jam < 12) showToast('☀️ Selamat pagi! Semangat belajar hari ini!', 'i', 3000);
  }, 800);
});

// ─── PENCAPAIAN DASHBOARD ──────────────────────
function initDashboardAchievements(user, materiProgress = [], quizRiwayat = []) {
  const container = document.querySelector('.dashboard-badges');
  if (!container) return;

  const done = materiProgress.length;
  const isPioneer = user.id <= 5;
  const streak = user.streak || 0;

  // Hitung kuis dengan nilai sempurna (100)
  const bestScores = {};
  quizRiwayat.forEach(q => {
    const qid = q.quiz_id || 'default';
    if (!bestScores[qid] || q.skor > bestScores[qid]) {
      bestScores[qid] = q.skor;
    }
  });
  const perfectQuizzes = Object.values(bestScores).filter(s => s === 100).length;

  const allBadges = [
    { name: 'Pemula', icon: 'fa-graduation-cap', color: '#fbbf24', earned: done >= 1 },
    { name: '7 Hari Belajar', icon: 'fa-fire', color: '#ef4444', earned: streak >= 7 },
    { name: 'Ahli Logika', icon: 'fa-brain', color: '#6366f1', earned: done >= 5 },
    { name: 'Skor Tertinggi', icon: 'fa-trophy', color: '#10b981', earned: perfectQuizzes >= 3 },
    { name: 'Raja Belajar', icon: 'fa-crown', color: '#f59e0b', earned: done >= 20 },
    { name: 'Pelopor EDUVIX', icon: 'fa-star', color: '#ec4899', earned: isPioneer }
  ];

  container.innerHTML = '';

  allBadges.forEach(badge => {
    const card = document.createElement('div');
    card.style.cssText = `
      background: ${badge.earned ? 'rgba(255,255,255,0.05)' : 'rgba(255,255,255,0.01)'};
      border: 1px solid ${badge.earned ? 'rgba(255,255,255,0.1)' : 'rgba(255,255,255,0.02)'};
      padding: 16px;
      border-radius: 16px;
      min-width: 120px;
      text-align: center;
      opacity: ${badge.earned ? '1' : '0.4'};
      transition: all 0.2s ease;
    `;

    card.innerHTML = `
      <i class="fa-solid ${badge.icon}" style="font-size: 32px; color: ${badge.earned ? badge.color : '#64748b'};"></i>
      <p style="font-size: 12px; font-weight: 700; margin-top: 8px; color: ${badge.earned ? 'var(--text)' : '#64748b'};">${badge.name}</p>
    `;
    container.appendChild(card);
  });
}

// ─── LEADERBOARD ──────────────────────────────
async function initLeaderboard() {
  const listEl = document.querySelector('.leaderboard-list');
  if (!listEl) return;

  const sortSelect = document.getElementById('leaderboardSort');
  const sortBy = sortSelect ? sortSelect.value : 'xp';

  // Tambah listener sekali saja
  if (sortSelect && !sortSelect.dataset.listenerAdded) {
    sortSelect.addEventListener('change', () => initLeaderboard());
    sortSelect.dataset.listenerAdded = 'true';
  }

  try {
    const response = await EduvixAPI.apiFetch(`/api/leaderboard?sort=${sortBy}`);
    console.log('[Leaderboard] Response:', response);
    listEl.innerHTML = '';

    if (!response || response.length === 0) {
      listEl.innerHTML = '<div style="text-align: center; color: #64748b; font-size: 14px;">Belum ada data peringkat.</div>';
      return;
    }

    // Ambil top 5 saja untuk di dashboard
    const top5 = response.slice(0, 5);

    top5.forEach((u, index) => {
      const item = document.createElement('div');
      item.className = 'leaderboard-item';
      item.style.cssText = `
        display: flex; align-items: center; justify-content: space-between;
        padding: 10px 12px; background: rgba(255,255,255,0.02);
        border-radius: 12px; border: 1px solid rgba(255,255,255,0.05);
      `;

      const rankColors = ['#fbbf24', '#94a3b8', '#b45309'];
      const rankColor = rankColors[index] || '#64748b';

      const displayName = u.nama || u.username || 'Anonim';

      // Julukan untuk member 1-5 (Pelopor)
      const isPioneer = u.id <= 5;
      const titleHtml = isPioneer ? `<span style="background: #ec4899; color: white; font-size: 10px; padding: 2px 6px; border-radius: 4px; margin-left: 6px; font-weight: 800;">Pelopor</span>` : '';

      // Label nilai sesuai sort
      let valueLabel = `${u.value || 0} XP`;
      if (sortBy === 'nilai') valueLabel = `${u.value || 0} Poin`;
      if (sortBy === 'akurasi') valueLabel = `${u.value || 0}`;

      item.innerHTML = `
        <div style="display: flex; align-items: center; gap: 12px;">
          <span style="font-weight: 900; color: ${rankColor}; font-size: 16px; width: 24px;">#${index + 1}</span>
          <div>
            <div style="font-weight: 700; color: #1a1d2e; font-size: 14px;">${displayName}${titleHtml}</div>
            <div style="font-size: 11px; color: #64748b;">Level ${u.level || 1}</div>
          </div>
        </div>
        <div style="font-weight: 800; color: #6366f1; font-size: 14px;">${valueLabel}</div>
      `;
      listEl.appendChild(item);
    });
  } catch (error) {
    listEl.innerHTML = '<div style="text-align: center; color: #ef4444; font-size: 14px;">Gagal memuat peringkat.</div>';
  }
}

// --- RESPONSIVE MENU (HAMBURGER) --------------
function initResponsiveMenu() {
  const header = document.querySelector(".top-header");
  const sidebar = document.querySelector(".sidebar");

  if (!header || !sidebar) return;

  // 1. Inject Hamburger Button if not exists
  if (!document.querySelector(".mobile-toggle")) {
    const toggle = document.createElement("button");
    toggle.className = "mobile-toggle";
    toggle.innerHTML = `
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
        <line x1="3" y1="12" x2="21" y2="12"></line>
        <line x1="3" y1="6" x2="21" y2="6"></line>
        <line x1="3" y1="18" x2="21" y2="18"></line>
      </svg>
    `;
    header.insertBefore(toggle, header.firstChild);

    // 2. Inject Overlay if not exists
    let overlay = document.querySelector(".sidebar-overlay");
    if (!overlay) {
      overlay = document.createElement("div");
      overlay.className = "sidebar-overlay";
      document.body.appendChild(overlay);
    }

    // 3. Toggle Events
    const toggleSidebar = () => {
      sidebar.classList.toggle("show");
      overlay.classList.toggle("active");
      document.body.style.overflow = sidebar.classList.contains("show") ? "hidden" : "";
    };

    toggle.addEventListener("click", toggleSidebar);
    overlay.addEventListener("click", toggleSidebar);

    // Close on nav click (mobile)
    sidebar.querySelectorAll(".nav-item").forEach(item => {
      item.addEventListener("click", () => {
        if (window.innerWidth <= 768) toggleSidebar();
      });
    });
  }
}


// --- UNIFY SIDEBAR NAV -------------------------
function unifySidebarNav() {
  const nav = document.querySelector(".sidebar-nav");
  if (!nav) return;

  const menuItems = [
    { href: "dashboard.html", icon: `<rect x="3" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/><rect x="14" y="3" width="7" height="7" stroke="currentColor" stroke-width="2"/><rect x="3" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/><rect x="14" y="14" width="7" height="7" stroke="currentColor" stroke-width="2"/>`, text: "Dashboard" },
    { href: "progress.html", icon: `<path d="M4 19.5C4 18.837 4.26339 18.2011 4.73223 17.7322C5.20107 17.2634 5.83696 17 6.5 17H20" stroke="currentColor" stroke-width="2"/><path d="M6.5 2H20V22H6.5C5.83696 22 5.20107 21.7366 4.73223 21.2678C4.26339 20.7989 4 20.163 4 19.5V4.5C4 3.83696 4.26339 3.20107 4.73223 2.73223C5.20107 2.26339 5.83696 2 6.5 2Z" stroke="currentColor" stroke-width="2"/>`, text: "Semua Materi" },
    { href: "pencapaian.html", icon: `<path d="M12 15l-2 5 2-1 2 1-2-5zm0-13C7.58 2 4 5.58 4 10c0 4.42 3.58 8 8 8s8-3.58 8-8c0-4.42-3.58-8-8-8z" stroke="currentColor" stroke-width="2"/>`, text: "Pencapaian" },
    { href: "store.html", icon: `<path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V9z" stroke="currentColor" stroke-width="2"/><path d="M9 22V12h6v10" stroke="currentColor" stroke-width="2"/>`, text: "Toko Hadiah" },
    { href: "materi komunitas.html", icon: `<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" stroke="currentColor" stroke-width="2"/><circle cx="9" cy="7" r="4" stroke="currentColor" stroke-width="2"/><path d="M23 21v-2a4 4 0 0 0-3-3.87" stroke="currentColor" stroke-width="2"/><path d="M16 3.13a4 4 0 0 1 0 7.75" stroke="currentColor" stroke-width="2"/>`, text: "Materi Komunitas" }
  ];

  // Perbaikan: Decode URL untuk menangani spasi (%20) dan abaikan query string/hash
  const rawFilename = window.location.pathname.split("/").pop() || "dashboard.html";
  const currentPath = decodeURIComponent(rawFilename.split(/[#?]/)[0]);

  nav.innerHTML = menuItems.map(item => `
    <a href="${item.href}" class="nav-item ${currentPath === item.href ? "active" : ""}">
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
        ${item.icon}
      </svg>
      <span>${item.text}</span>
    </a>
  `).join("");
}
