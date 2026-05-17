// =============================================
//   EDUVIX.ID — Materi JS
//   Sesuai dengan HTML yang ada
// =============================================

// ========== STATE QUIZ ==========
let currentLesson = 1;

// ========== DOM REFS ==========
const $ = (id) => document.getElementById(id);
const $$ = (sel) => document.querySelectorAll(sel);

// ========== NAVIGASI HALAMAN MATERI ==========
function initMateriNav() {
  document.querySelectorAll('[data-next]').forEach(btn => {
    btn.addEventListener('click', function() {
      const next    = parseInt(this.dataset.next);
      const current = document.querySelector('.lesson-page.active');
      const nextEl  = document.getElementById('page-' + next);

      if (current) { current.classList.remove('active'); current.style.display = 'none'; }
      if (nextEl)  { nextEl.classList.add('active');     nextEl.style.display  = 'block'; }
      
      currentLesson = next;
      updateBreadcrumb(next);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  });
}

function updateBreadcrumb(n) {
  const titles = ['', 'Dasar Berpikir Kritis', 'Tes Kemampuan Akademik (TKA)', 'Anatomi Argumen', 'Logical Fallacies', 'Syllogism Logic'];
  const tbCurrent = $('tbCurrent');
  if (tbCurrent) tbCurrent.textContent = titles[n] || `Materi ${n}`;
}

// ========== ANIMASI ANGKA ==========
function animasiAngka(el, dari, ke, durasi) {
  if (!el) return;
  const t0 = Date.now();
  (function tick() {
    const p = Math.min((Date.now() - t0) / durasi, 1);
    el.textContent = Math.round(dari + (ke - dari) * (1 - Math.pow(1 - p, 3)));
    if (p < 1) requestAnimationFrame(tick);
  })();
}

// ========== CONFETTI ==========
function buatConfetti() {
  if (!document.getElementById('_cf_kf')) {
    const s = document.createElement('style');
    s.id = '_cf_kf';
    s.textContent = `@keyframes _cfFall { to { transform: translateY(105vh) rotate(720deg); opacity: 0; } }`;
    document.head.appendChild(s);
  }
  const warna = ['#6366f1','#22c55e','#f59e0b','#ec4899','#3b82f6','#00e5d1'];
  for (let i = 0; i < 60; i++) {
    const el = document.createElement('div');
    el.style.cssText = `
      position:fixed; pointer-events:none; z-index:9999;
      left:${Math.random() * 100}%; top:-10px;
      width:${Math.random() * 10 + 5}px; height:${Math.random() * 10 + 5}px;
      background:${warna[Math.floor(Math.random() * warna.length)]};
      border-radius:${Math.random() > .5 ? '50%' : '2px'};
      animation: _cfFall ${1.5 + Math.random() * 2}s linear ${Math.random() * 1}s forwards;
    `;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 5000);
  }
}

// ========== TOAST ==========
let _tt;
function showToastMateri(msg, type, dur) {
  dur = dur || 2000;
  let el = document.getElementById('_mtr_toast');
  if (!el) {
    el = document.createElement('div');
    el.id = '_mtr_toast';
    el.style.cssText = `
      position:fixed; bottom:24px; right:24px; z-index:9999;
      padding:12px 22px; border-radius:12px;
      font-size:14px; font-weight:700; color:#fff;
      background:#1e293b; box-shadow:0 8px 24px rgba(0,0,0,.2);
      opacity:0; transform:translateY(12px);
      transition:all .25s ease; pointer-events:none;
    `;
    document.body.appendChild(el);
  }
  el.textContent = msg;
  if (type === 'success') el.style.background = 'linear-gradient(135deg,#22c55e,#16a34a)';
  else if (type === 'error') el.style.background = 'linear-gradient(135deg,#ef4444,#dc2626)';
  else el.style.background = '#1e293b';

  el.style.opacity   = '1';
  el.style.transform = 'translateY(0)';
  clearTimeout(_tt);
  _tt = setTimeout(() => {
    el.style.opacity   = '0';
    el.style.transform = 'translateY(12px)';
  }, dur);
}

// ========== BIND EVENTS ==========
document.addEventListener('DOMContentLoaded', () => {
  initMateriNav();
  
  // Auto-switch page based on URL hash (misal: #page-2)
  const hash = window.location.hash;
  if (hash && hash.startsWith('#page-')) {
    const pageId = hash.substring(1);
    const nextEl = document.getElementById(pageId);
    const current = document.querySelector('.lesson-page.active');
    if (nextEl && current) {
      current.classList.remove('active');
      current.style.display = 'none';
      nextEl.classList.add('active');
      nextEl.style.display = 'block';
      
      const pageNum = parseInt(pageId.split('-')[1]);
      updateBreadcrumb(pageNum);
      currentLesson = pageNum;
    }
  }
});