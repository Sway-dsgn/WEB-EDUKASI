// =============================================
//   EDUVIX.ID — Dashboard Modern JS
// =============================================

// ─── DATA USER (dari localStorage) ───────────
function getUser() {
  try {
    const raw = localStorage.getItem('eduvix_user');
    if (raw) return JSON.parse(raw);
  } catch (e) { }
  // Default jika tidak ada
  return {
    nama: 'User',
    username: '',
    xp: 0,
    coins: 0,
    level: 1,
    streak: 0,
    lastLogin: null
  };
}

function saveUser(data) {
  localStorage.setItem('eduvix_user', JSON.stringify(data));
}

let user = getUser();

// ─── STREAK HARIAN ────────────────────────────
function updateStreak() {
  const today = new Date().toDateString();
  const yesterday = new Date(Date.now() - 86400000).toDateString();
  const last = user.lastLogin;

  if (last === today) {
    // Sudah login hari ini, tidak ubah streak
  } else if (last === yesterday) {
    // Berturut-turut
    user.streak = (user.streak || 0) + 1;
    user.lastLogin = today;
    saveUser(user);
    if (user.streak > 1) showToast(`🔥 ${user.streak} hari streak! Keren!`, 'i', 3500);
  } else {
    // Putus / login pertama
    user.streak = 1;
    user.lastLogin = today;
    saveUser(user);
  }
}

// ─── RENDER USER INFO ─────────────────────────
function renderUserInfo(stats = {}) {
  const nama = user.nama || 'User';
  const xp = user.xp || 0;
  const level = Math.floor(xp / 100) + 1;
  const streak = user.streak || 0;
  const xpPct = ((xp % 100) / 100) * 100;

  // Nama di header & banner
  setAll('[data-user-name]', nama.split(' ')[0]);
  setAll('[data-user-level]', 'Lv.' + level);
  setAll('[data-user-xp]', xp + ' XP');
  setAll('[data-streak]', streak);

  // Avatar
  document.querySelectorAll('.avatar').forEach(el => {
    if (el.tagName === 'IMG') {
      el.src = `https://ui-avatars.com/api/?name=${encodeURIComponent(nama)}&background=6366f1&color=fff`;
      el.alt = nama;
    } else {
      if (user.avatarImage) {
        el.innerHTML = `<img src="${user.avatarImage}" style="width:100%;height:100%;border-radius:50%;object-fit:cover;">`;
        el.style.background = 'transparent';
      } else if (user.avatarIcon) {
        el.innerHTML = `<i class="fas ${user.avatarIcon}"></i>`;
        el.style.background = 'linear-gradient(135deg, #1BAAED, #7c3aed)';
      } else {
        el.innerHTML = '';
        el.textContent = nama.charAt(0).toUpperCase();
        el.style.background = '#6366f1';
      }
    }

    // Apply Border
    if (user.avatarBorder && user.avatarBorder !== 'none') {
      if (user.avatarBorder === 'gold') {
        el.style.boxShadow = `0 0 0 3px gold`;
      } else {
        el.style.boxShadow = `0 0 0 3px ${user.avatarBorder}`;
      }
      el.style.border = `2px solid white`;
    } else {
      el.style.border = `none`;
      el.style.boxShadow = `none`;
    }
  });
  document.querySelectorAll('.user-name').forEach(el => el.textContent = nama);

  // Welcome banner
  const bannerH = document.querySelector('.banner-content h2');
  if (bannerH) {
    const jam = new Date().getHours();
    const sapa = jam < 11 ? 'Selamat Pagi' : jam < 15 ? 'Selamat Siang' : jam < 18 ? 'Selamat Sore' : 'Selamat Malam';
    bannerH.textContent = `${sapa}, ${nama.split(' ')[0]} 👋`;
  }

  // Streak widget
  const strNum = document.querySelector('.streak-num');
  if (strNum) strNum.textContent = streak;

  const bannerPct = document.querySelector('.banner-pct');
  if (bannerPct) bannerPct.textContent = Math.round(xpPct) + '%';

  // Update Stats Widget Data
  document.querySelectorAll('[data-stat-materi]').forEach(el => el.textContent = stats.materiSelesai || 0);
  document.querySelectorAll('[data-stat-akurasi]').forEach(el => el.textContent = (stats.akurasi || 0) + '%');
}

function setAll(sel, val) {
  document.querySelectorAll(sel).forEach(el => el.textContent = val);
}

// ─── PROGRESS BARS ────────────────────────────
function animateProgressBars(materiProgress = []) {
  // Banner progress
  const bannerFill = document.querySelector('.banner-bar-fill');
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

  // Tambah progress bar ke setiap course card
  document.querySelectorAll('.course-card:not(.add-course)').forEach((card, i) => {
    const info = card.querySelector('.course-info');
    if (info && !card.querySelector('.course-progress')) {
      const bar = document.createElement('div');
      bar.className = 'course-progress';
      bar.innerHTML = `<div class="course-progress-fill" style="width:0%"></div>`;
      info.appendChild(bar);
    }
  });

  // Notifikasi Panel
  if (!document.getElementById('notifPanel')) {
    const panel = document.createElement('div');
    panel.id = 'notifPanel';
    panel.className = 'notif-panel';
    panel.innerHTML = `
      <div class="notif-header">
        <h4>Notifikasi</h4>
      </div>
      <div class="notif-list">
        <div class="notif-item">👋 Selamat datang di EDUVIX! Mulai belajarmu hari ini.</div>
        <div class="notif-item">🔥 Pertahankan streak belajarmu untuk dapat koin extra!</div>
      </div>
    `;
    document.body.appendChild(panel);
  }

  // Profile Customization Modal
  if (!document.getElementById('profileModal')) {
    const modal = document.createElement('div');
    modal.id = 'profileModal';
    modal.className = 'modal-overlay';
    modal.innerHTML = `
      <div class="modal profile-modal">
        <button class="modal-close" id="closeProfileModal">×</button>
        <h2>Kustomisasi Profil</h2>
        <p>Ubah tampilan avatar dan border kamu agar lebih keren!</p>
        <div class="custom-section">
          <h4>Pilih Warna Border</h4>
          <div class="border-options">
            <div class="border-opt" data-border="none" style="background:#ddd"></div>
            <div class="border-opt" data-border="#1BAAED" style="background:#1BAAED"></div>
            <div class="border-opt" data-border="#f59e0b" style="background:#f59e0b"></div>
            <div class="border-opt" data-border="#ef4444" style="background:#ef4444"></div>
            <div class="border-opt" data-border="gold" style="background:linear-gradient(gold, #fff700)"></div>
          </div>
        </div>
        <div class="custom-section">
          <h4>Pilih Icon Avatar</h4>
          <div class="avatar-options">
            <div class="avatar-opt" data-icon="initial">A</div>
            <div class="avatar-opt" data-icon="fa-user"><i class="fas fa-user"></i></div>
            <div class="avatar-opt" data-icon="fa-rocket"><i class="fas fa-rocket"></i></div>
            <div class="avatar-opt" data-icon="fa-brain"><i class="fas fa-brain"></i></div>
            <div class="avatar-opt" data-icon="fa-star"><i class="fas fa-star"></i></div>
            <div class="avatar-opt" data-icon="fa-fire"><i class="fas fa-fire"></i></div>
          </div>
          <div style="margin-top: 15px; text-align: center;">
             <label for="avatarUpload" style="cursor: pointer; background: #6366f1; color: white; padding: 10px 20px; border-radius: 8px; font-size: 14px; display: inline-block; font-weight: bold; transition: all 0.2s;">
                <i class="fas fa-upload"></i> Upload dari Galeri
             </label>
             <input type="file" id="avatarUpload" accept="image/*" style="display: none;">
          </div>
        </div>
      </div>
    `;
    document.body.appendChild(modal);
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
    <linearGradient id="graphGrad" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#6366f1" stop-opacity="0.3"/>
      <stop offset="100%" stop-color="#6366f1" stop-opacity="0"/>
    </linearGradient>
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
    pathD += (i === 0 ? "M" : " L") + `${x},${y}`;
  });

  // Tambah area fill
  const area = document.createElementNS('http://www.w3.org/2000/svg', 'path');
  area.setAttribute('d', `${pathD} L600,100 L0,100 Z`);
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
    dr.textContent = `${fmt(week)} — ${fmt(now)}`;
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
    monthEl.textContent = `${months[viewMonth]} ${viewYear}`;

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

  input.addEventListener('keydown', e => {
    if (e.key === 'Enter' && input.value.trim()) {
      showToast(`🔍 Mencari: "${input.value.trim()}"`, 'i', 2000);
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
  if (logoutEl) {
    logoutEl.addEventListener('click', () => {
      showToast('Sampai jumpa! 👋', 'i', 1500);
      setTimeout(() => {
        localStorage.removeItem('eduvix_logged_in');
        window.location.href = 'login.html';
      }, 1600);
    });
  }
}

// ─── BELL NOTIF & PROFILE ─────────────────────
function initNotifProfile() {
  const notifBtn = document.querySelector('.notif-btn') || document.querySelector('.header-actions .icon-btn');
  const notifPanel = document.getElementById('notifPanel');

  if (notifBtn && notifPanel) {
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifPanel.classList.toggle('show');
    });
  }

  const profileBtn = document.querySelector('.user-profile');
  const profileModal = document.getElementById('profileModal');
  const closeProfileModal = document.getElementById('closeProfileModal');

  if (profileBtn && profileModal) {
    profileBtn.addEventListener('click', () => {
      profileModal.classList.add('open');
    });
  }

  if (closeProfileModal && profileModal) {
    closeProfileModal.addEventListener('click', () => {
      profileModal.classList.remove('open');
    });
  }

  document.addEventListener('click', (e) => {
    if (profileModal && e.target === profileModal) {
      profileModal.classList.remove('open');
    }
    if (notifPanel && !notifPanel.contains(e.target) && notifBtn && !notifBtn.contains(e.target)) {
      notifPanel.classList.remove('show');
    }
  });

  // Handle Border Selection
  document.querySelectorAll('.border-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      user.avatarBorder = opt.dataset.border;
      saveUser(user);
      renderUserInfo({});
      showToast('Border profil berhasil diubah!', 'i', 2000);
    });
  });

  // Handle Avatar Selection
  document.querySelectorAll('.avatar-opt').forEach(opt => {
    opt.addEventListener('click', () => {
      user.avatarImage = null; // Hapus image jika pilih icon
      if (opt.dataset.icon === 'initial') {
        user.avatarIcon = null;
      } else {
        user.avatarIcon = opt.dataset.icon;
      }
      saveUser(user);
      renderUserInfo({});
      showToast('Avatar profil berhasil diubah!', 'i', 2000);
    });
  });

  // Handle Image Upload from Gallery
  const avatarUpload = document.getElementById('avatarUpload');
  if (avatarUpload) {
    avatarUpload.addEventListener('change', function (e) {
      const file = e.target.files[0];
      if (file) {
        const reader = new FileReader();
        reader.onload = function (evt) {
          user.avatarImage = evt.target.result;
          user.avatarIcon = null; // Hapus icon karena pakai image
          saveUser(user);
          renderUserInfo({});
          showToast('Foto profil berhasil diunggah!', 'i', 2000);
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
  el.className = `toast show ${type || ''}`;
  clearTimeout(_toastT);
  _toastT = setTimeout(() => el.classList.remove('show'), dur);
}

// ─── CEK LOGIN ────────────────────────────────
function cekLogin() {
  const loggedIn = localStorage.getItem('eduvix_logged_in');
  if (!loggedIn) {
    // Kalau pakai sistem login sederhana
    // window.location.href = 'login.html';
    // Untuk dev, biarkan masuk dulu
  }
}

// ─── INIT SEMUA ───────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  cekLogin();

  // Ambil data terbaru dari Server
  let stats = { materiSelesai: 0, akurasi: 0 };
  let materiProgress = [];

  try {
    const profile = await eduvixApi('/auth/me');
    localStorage.setItem('eduvix_user', JSON.stringify(profile));
    user = profile; // Update variabel global

    materiProgress = await eduvixApi('/materi/progress');
    const quizRiwayat = await eduvixApi('/quiz/riwayat');

    // Hitung Stats
    stats.materiSelesai = materiProgress.length;
    if (quizRiwayat.length > 0) {
      const totalSkor = quizRiwayat.reduce((acc, curr) => acc + curr.skor, 0);
      stats.akurasi = Math.round(totalSkor / quizRiwayat.length);
    }
  } catch (e) {
    console.error("Gagal sinkronisasi data:", e);
  }

  enhanceHTML();       // Tambah elemen dinamis
  renderUserInfo(stats);    // Tampilkan data user & stats asli
  animateProgressBars(materiProgress); // Animasi progress sesuai materi yang selesai
  initActivityGraph(materiProgress); // Grafik berdasarkan tanggal selesai materi
  initCalendar();      // Kalender
  initSearch();        // Search
  initNav();           // Navigasi
  initCourseCards();   // Course card click
  initTasks();         // Task items
  initLogout();        // Logout
  initNotifProfile();  // Notifikasi & Profil
  initUpgrade();       // Upgrade btn

  // Greeting berdasarkan waktu
  setTimeout(() => {
    const jam = new Date().getHours();
    if (jam >= 5 && jam < 12) showToast('☀️ Selamat pagi! Semangat belajar hari ini!', 'i', 3000);
  }, 800);
});