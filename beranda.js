// ===========================
// EDUVIX.ID – Beranda JS
// ===========================

document.addEventListener('DOMContentLoaded', () => {

  // ---- 1. SIDEBAR TOGGLE (mobile) ----
  const menuToggle = document.getElementById('menuToggle');
  const sidebar    = document.getElementById('sidebar');

  if (menuToggle && sidebar) {
    menuToggle.addEventListener('click', () => {
      sidebar.classList.toggle('open');
    });

    // Tutup sidebar kalau klik di luar
    document.addEventListener('click', (e) => {
      if (!sidebar.contains(e.target) && !menuToggle.contains(e.target)) {
        sidebar.classList.remove('open');
      }
    });
  }

  // ---- 2. ACTIVE NAV ITEM ----
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function (e) {
      if (this.classList.contains('logout')) return;
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
    });
  });

  // ---- 3. REVEAL ON SCROLL ----
  const revealEls = document.querySelectorAll('.reveal');

  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        // Delay tiap elemen sedikit agar ada efek stagger
        setTimeout(() => {
          entry.target.classList.add('visible');
        }, i * 80);
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12 });

  revealEls.forEach(el => revealObserver.observe(el));

  // ---- 4. COUNTER ANIMATION (stat cards) ----
  const counterEls = document.querySelectorAll('.stat-value[data-target]');

  const countObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        animateCounter(entry.target);
        countObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.5 });

  counterEls.forEach(el => countObserver.observe(el));

  function animateCounter(el) {
    const target   = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200; // ms
    const step     = Math.ceil(duration / target);
    let current    = 0;

    const timer = setInterval(() => {
      current++;
      el.textContent = current;
      if (current >= target) {
        el.textContent = target;
        clearInterval(timer);
      }
    }, step);
  }

  // ---- 5. SEARCH LIVE FILTER ----
  const searchInput = document.querySelector('.search-box input');
  const materiItems = document.querySelectorAll('.materi-item');

  if (searchInput) {
    searchInput.addEventListener('input', function () {
      const query = this.value.toLowerCase().trim();

      materiItems.forEach(item => {
        const title = item.querySelector('h4')?.textContent.toLowerCase() || '';
        const match = title.includes(query);
        item.style.display = match ? 'flex' : 'none';
      });
    });
  }

  // ---- 6. GREETING TIME ----
  const greetingSub = document.querySelector('.greeting-sub');
  if (greetingSub) {
    const hour = new Date().getHours();
    let waktu = '';
    if (hour < 11)       waktu = 'Selamat pagi ☀️';
    else if (hour < 15)  waktu = 'Selamat siang 🌤️';
    else if (hour < 18)  waktu = 'Selamat sore 🌇';
    else                 waktu = 'Selamat malam 🌙';
    greetingSub.textContent = waktu;
  }

  // ---- 7. NOTIF BUTTON (demo) ----
  const notifBtn = document.querySelector('.notif-btn');
  if (notifBtn) {
    notifBtn.addEventListener('click', () => {
      const badge = notifBtn.querySelector('.badge');
      if (badge) {
        badge.style.display = badge.style.display === 'none' ? 'flex' : 'none';
      }
    });
  }

  // ---- 8. JADWAL HOVER RIPPLE ----
  const jadwalItems = document.querySelectorAll('.jadwal-item');
  jadwalItems.forEach(item => {
    item.addEventListener('click', function () {
      this.style.transform = 'scale(0.97)';
      setTimeout(() => { this.style.transform = ''; }, 150);
    });
  });

  // ---- 9. MATERI ITEM CLICK FEEDBACK ----
  materiItems.forEach(item => {
    item.addEventListener('click', function () {
      const h4 = this.querySelector('h4')?.textContent || '';
      // Ganti dengan navigasi sebenarnya jika diperlukan
      console.log('Membuka materi:', h4);
    });
  });

});