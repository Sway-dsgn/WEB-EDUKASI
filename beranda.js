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
  const xpPct = ((xp % 100) / 100) * 100; // XP percentage within current level

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
    const xpPct = ((user.xp || 0) % 100);
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
function initCalendar() {
  const calendarGrid = document.querySelector('.calendar-grid');
  const monthEl = document.querySelector('.month-nav span');
  const prevBtn = document.querySelector('.month-btn:first-child');
  const nextBtn = document.querySelector('.month-btn:last-child');

  if (!calendarGrid || !monthEl) return;

  const months = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
    'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

  let date = new Date();
  let viewMonth = date.getMonth();
  let viewYear = date.getFullYear();

  function renderCalendar() {
    calendarGrid.innerHTML = '';
    monthEl.textContent = `${months[viewMonth]} ${viewYear} `;

    // Ambil hari pertama bulan ini (0 = Minggu, 1 = Senin, dst)
    const firstDay = new Date(viewYear, viewMonth, 1).getDay();
    // Ambil jumlah hari dalam bulan ini
    const lastDate = new Date(viewYear, viewMonth + 1, 0).getDate();

    // Tambahkan slot kosong untuk hari sebelum tanggal 1
    for (let i = 0; i < firstDay; i++) {
      const empty = document.createElement('div');
      empty.className = 'day empty';
      calendarGrid.appendChild(empty);
    }

    const todayReal = new Date();
    const isThisMonth = todayReal.getMonth() === viewMonth && todayReal.getFullYear() === viewYear;

    // Generate tanggal 1 sampai terakhir
    for (let d = 1; d <= lastDate; d++) {
      const dayEl = document.createElement('div');
      dayEl.className = 'day';
      dayEl.textContent = d;

      if (isThisMonth && d === todayReal.getDate()) {
        dayEl.classList.add('today');
      }

      dayEl.addEventListener('click', () => {
        document.querySelectorAll('.calendar-grid .day').forEach(x => x.classList.remove('selected'));
        dayEl.classList.add('selected');
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
  document.querySelectorAll('.course-card:not(.add-course)').forEach((card, index) => {
    card.addEventListener('click', () => {
      // Mengarahkan ke quiz sesuai materi (0: Kritis, 1: TKA)
      if (index === 0) window.location.href = 'quizz.html';
      else if (index === 1) window.location.href = 'tka.html';
      else window.location.href = 'progress.html';
    });
  });

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
      if (index === 0) window.location.href = 'quizz.html';
      else if (index === 1) window.location.href = 'tka.html';
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
  initSearch();
  initNav();
  initCourseCards();
  initTasks();
  initLogout();
  initNotifProfile();
  initUpgrade();
  initCalendar();

  // Baru ambil data dari API (pake try-catch supaya kaga ngerusak tombol)
  let stats = { materiSelesai: 0, akurasi: 0 };
  let materiProgress = [];
  let user = null;
  try {
    user = await EduvixAPI.initPage();
    if (user && user.id) materiProgress = await EduvixAPI.getProgressMateri();
    const quizRiwayat = await EduvixAPI.getRiwayatQuiz();

    // Hitung Stats
    stats.materiSelesai = materiProgress.length;
    if (quizRiwayat.length > 0) {
      const totalSkor = quizRiwayat.reduce((acc, curr) => acc + curr.skor, 0);
      stats.akurasi = Math.round(totalSkor / quizRiwayat.length);
    }
  } catch (e) {
    console.error("Gagal sinkronisasi data:", e);
  }

  renderUserInfo(user || EduvixAPI.getUser(), stats);
  animateProgressBars(materiProgress); // Animasi progress sesuai materi yang selesai
  initActivityGraph(materiProgress); // Grafik berdasarkan tanggal selesai materi

  // Greeting berdasarkan waktu
  setTimeout(() => {
    const jam = new Date().getHours();
    if (jam >= 5 && jam < 12) showToast('☀️ Selamat pagi! Semangat belajar hari ini!', 'i', 3000);
  }, 800);
});