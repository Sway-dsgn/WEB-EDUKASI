// ===========================
// EDUVIX.ID – Beranda JS
// ===========================

document.addEventListener('DOMContentLoaded', () => {

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
    const target = parseInt(el.getAttribute('data-target'), 10);
    const duration = 1200; // ms
    const step = Math.ceil(duration / target);
    let current = 0;

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
    if (hour < 11) waktu = 'Selamat pagi ☀️';
    else if (hour < 15) waktu = 'Selamat siang 🌤️';
    else if (hour < 18) waktu = 'Selamat sore 🌇';
    else waktu = 'Selamat malam 🌙';
    greetingSub.textContent = waktu;
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

  // ---- 7. NOTIF DROPDOWN ----
  const notifBtn = document.getElementById('notifBtn');
  const notifDropdown = document.getElementById('notifDropdown');
  const notifBody = document.getElementById('notifBody');
  const notifBadge = document.getElementById('notifBadge');
  const markAllRead = document.getElementById('markAllRead');

  if (notifBtn && notifDropdown) {
    // Toggle dropdown
    notifBtn.addEventListener('click', (e) => {
      e.stopPropagation();
      notifDropdown.classList.toggle('show');
      renderNotifications();
    });

    // Close when clicking outside
    document.addEventListener('click', (e) => {
      if (!notifDropdown.contains(e.target) && !notifBtn.contains(e.target)) {
        notifDropdown.classList.remove('show');
      }
    });

    // Prevent closing when clicking inside
    notifDropdown.addEventListener('click', (e) => {
      e.stopPropagation();
    });

    // Mark all as read
    if (markAllRead) {
      markAllRead.addEventListener('click', () => {
        let notifs = getNotifs();
        notifs.forEach(n => n.unread = false);
        saveNotifs(notifs);
        renderNotifications();
      });
    }

    // Function to get notifications from localStorage
    function getNotifs() {
      try {
        const raw = localStorage.getItem('eduvix_notifs');
        if (raw) return JSON.parse(raw);
      } catch (e) { }

      // Default dummy notifs if empty
      const defaultNotifs = [
        { id: 1, type: 'streak', title: 'Streak Dipertahankan!', desc: 'Kamu telah belajar 3 hari berturut-turut. Lanjutkan!', time: 'Baru saja', unread: true },
        { id: 2, type: 'level', title: 'Level Up!', desc: 'Selamat! Kamu telah mencapai Level 2.', time: '2 jam lalu', unread: true },
        { id: 3, type: 'info', title: 'Materi Baru', desc: 'Materi "Berpikir Kritis" sudah tersedia.', time: '1 hari lalu', unread: false }
      ];
      saveNotifs(defaultNotifs);
      return defaultNotifs;
    }

    function saveNotifs(notifs) {
      localStorage.setItem('eduvix_notifs', JSON.stringify(notifs));
      updateBadge(notifs);
    }

    function updateBadge(notifs) {
      const unreadCount = notifs.filter(n => n.unread).length;
      if (notifBadge) {
        if (unreadCount > 0) {
          notifBadge.textContent = unreadCount;
          notifBadge.style.display = 'flex';
        } else {
          notifBadge.style.display = 'none';
        }
      }
    }

    function renderNotifications() {
      const notifs = getNotifs();
      if (!notifBody) return;

      if (notifs.length === 0) {
        notifBody.innerHTML = `<div class="notif-empty">Belum ada notifikasi saat ini.</div>`;
        return;
      }

      let html = '';
      notifs.forEach(n => {
        let iconClass = 'fa-bell';
        let bgClass = '';
        if (n.type === 'streak') { iconClass = 'fa-fire'; bgClass = 'streak'; }
        if (n.type === 'level') { iconClass = 'fa-star'; bgClass = 'level'; }

        html += `
          <div class="notif-item ${n.unread ? 'unread' : ''}" data-id="${n.id}">
            <div class="n-icon ${bgClass}"><i class="fa-solid ${iconClass}"></i></div>
            <div class="n-text">
              <h4>${n.title}</h4>
              <p>${n.desc}</p>
              <span class="n-time">${n.time}</span>
            </div>
          </div>
        `;
      });
      notifBody.innerHTML = html;

      // Add click listener to mark single notif as read
      notifBody.querySelectorAll('.notif-item').forEach(item => {
        item.addEventListener('click', function () {
          const id = parseInt(this.getAttribute('data-id'));
          let all = getNotifs();
          const target = all.find(x => x.id === id);
          if (target && target.unread) {
            target.unread = false;
            saveNotifs(all);
            renderNotifications();
          }
        });
      });
    }

    // Initial badge update
    updateBadge(getNotifs());
  }

});