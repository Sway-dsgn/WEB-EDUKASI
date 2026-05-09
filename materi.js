// =============================================
//   EDUVIX.ID — Materi JS  |  Premium Edition
// =============================================

// ─── STATE ────────────────────────────────────
const State = {
  xp: 0,
  streak: 0,
  currentLesson: 1,
  unlockedUp: 1,          // highest unlocked lesson
  readProgress: 0,
  quizOpen: false,
  quizCurrent: 1,
  quizTotal: 3,
  quizAnswers: {},         // { 1: 'correct'|'wrong', ... }
  dragItems: {},         // placed drag items { id: zone }

  get xpForNextLevel() { return (this.level) * 100; },
  get level() { return Math.floor(this.xp / 100) + 1; },
  get xpPct() { return ((this.xp % 100) / 100) * 100; },
};

// Load from localStorage via jalan.js if available
function loadState() {
  if (typeof eduvixGetUser === 'function') {
    const user = eduvixGetUser();
    if (user) {
      State.xp = user.xp || 0;
      State.streak = user.streak || 0;
      State.unlockedUp = user.unlockedLesson || 1;
      return;
    }
  }
  // Fallback
  const saved = localStorage.getItem('eduvix_materi_state');
  if (!saved) return;
  try {
    const d = JSON.parse(saved);
    State.xp = d.xp || 0;
    State.streak = d.streak || 0;
    State.unlockedUp = d.unlockedUp || 1;
  } catch (e) { }
}
function saveState() {
  if (typeof eduvixGetUser === 'function') {
    const user = eduvixGetUser();
    if (user) {
      user.unlockedLesson = Math.max(user.unlockedLesson || 1, State.unlockedUp);
      // Let jalan.js handle xp/streak via its own functions to avoid overrides
      eduvixSaveUser(user);
    }
  }
  // Local fallback
  localStorage.setItem('eduvix_materi_state', JSON.stringify({
    xp: State.xp, streak: State.streak, unlockedUp: State.unlockedUp
  }));
}

// ─── DOM REFS ─────────────────────────────────
const $ = id => document.getElementById(id);
const $$ = sel => document.querySelectorAll(sel);

// ─── INIT ─────────────────────────────────────
function init() {
  loadState();
  refreshUI();
  initCursorGlow();
  initSidebar();
  initTopbar();
  initReveal();
  initReadProgress();
  initLessonNav();
  initDragGame();
  initQuiz();
  initResultModal();
  updateStreakDaily();
}

// ─── REFRESH UI ───────────────────────────────
function refreshUI() {
  // Sidebar
  const sbXpFill = $('sbXpFill');
  const sbXpNum = $('sbXpNum');
  const sbLevel = $('sbLevel');
  const sbStreak = $('sbStreak');
  if (sbXpFill) sbXpFill.style.width = State.xpPct + '%';
  if (sbXpNum) sbXpNum.textContent = State.xp + ' XP';
  if (sbLevel) sbLevel.textContent = 'Lv.' + State.level;
  if (sbStreak) sbStreak.textContent = State.streak;

  // Topbar
  const tbXp = $('tbXp');
  const tbStreak = $('tbStreak');
  if (tbXp) tbXp.textContent = State.xp + ' XP';
  if (tbStreak) tbStreak.textContent = State.streak;

  // Unlock lessons in sidebar
  $$('.sb-lesson').forEach(btn => {
    const n = parseInt(btn.dataset.lesson);
    if (n <= State.unlockedUp) {
      btn.classList.remove('locked');
      btn.classList.add('unlocked');
      const icon = btn.querySelector('.sbl-lock-icon i');
      if (icon && n < State.unlockedUp) {
        icon.className = 'fa-solid fa-circle-check';
        btn.querySelector('.sbl-lock-icon').style.color = '#34d399';
      }
    }
  });
}

// ─── CURSOR GLOW ──────────────────────────────
function initCursorGlow() {
  const glow = $('cursorGlow');
  if (!glow) return;
  document.addEventListener('mousemove', e => {
    glow.style.left = e.clientX + 'px';
    glow.style.top = e.clientY + 'px';
  });
}

// ─── SIDEBAR ──────────────────────────────────
function initSidebar() {
  const sidebar = $('sidebar');
  const mobBtn = $('mobMenuBtn');
  const backdrop = $('sidebarBackdrop');

  // Lesson click
  $$('.sb-lesson.unlocked').forEach(btn => {
    btn.addEventListener('click', () => {
      const n = parseInt(btn.dataset.lesson);
      switchLesson(n);
    });
  });

  // Mobile toggle
  if (mobBtn) {
    mobBtn.addEventListener('click', () => {
      sidebar.classList.toggle('open');
      backdrop.classList.toggle('show');
    });
  }
  if (backdrop) {
    backdrop.addEventListener('click', () => {
      sidebar.classList.remove('open');
      backdrop.classList.remove('show');
    });
  }
}

function switchLesson(n) {
  // Auto-unlock up to n so navigation always works
  if (n > State.unlockedUp) {
    State.unlockedUp = n;
    saveState();
    refreshUI();
  }
  State.currentLesson = n;

  // Update sidebar active
  $$('.sb-lesson').forEach(b => b.classList.remove('active'));
  const target = document.querySelector(`.sb-lesson[data-lesson="${n}"]`);
  if (target) target.classList.add('active');

  // Update breadcrumb
  const titles = ['', 'Pengantar Berpikir Kritis', 'Identifikasi Argumen',
    'Logical Fallacies', 'Cognitive Biases', 'Evaluasi Sumber', 'Keputusan Rasional'];
  const tbCurrent = $('tbCurrent');
  if (tbCurrent) tbCurrent.textContent = titles[n] || `Materi ${n}`;

  // Switch pages
  $$('.lesson-page').forEach(p => p.classList.remove('active'));
  const page = $(`page-${n}`);
  if (page) {
    page.classList.add('active');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    // Re-trigger reveals
    page.querySelectorAll('.reveal').forEach(el => {
      el.classList.remove('visible');
      setTimeout(() => el.classList.add('visible'), 100);
    });
  }

  // Close mobile sidebar
  $('sidebar').classList.remove('open');
  $('sidebarBackdrop')?.classList.remove('show');

  // Dots
  updateLnDots(n);
}

// ─── TOPBAR ───────────────────────────────────
function initTopbar() {
  // Reading ring update is handled in initReadProgress
}

// ─── REVEAL ON SCROLL ─────────────────────────
function initReveal() {
  const obs = new IntersectionObserver((entries) => {
    entries.forEach((entry, i) => {
      if (entry.isIntersecting) {
        setTimeout(() => entry.target.classList.add('visible'), i * 80);
        obs.unobserve(entry.target);
      }
    });
  }, { threshold: 0.1 });

  $$('.reveal').forEach(el => obs.observe(el));
}

// ─── READ PROGRESS ────────────────────────────
function initReadProgress() {
  const ring = $('tbReadRing');
  const circumference = 88; // 2 * pi * r(14)

  window.addEventListener('scroll', () => {
    const doc = document.documentElement;
    const scrolled = doc.scrollTop;
    const total = doc.scrollHeight - doc.clientHeight;
    const pct = total > 0 ? scrolled / total : 0;

    if (ring) {
      const offset = circumference * (1 - pct);
      ring.style.strokeDashoffset = offset;
    }
  });
}

// ─── LESSON NAVIGATION ───────────────────────
function initLessonNav() {
  document.addEventListener('click', e => {
    const btn = e.target.closest('[data-next]');
    const prevBtn = e.target.closest('[data-prev]');

    if (btn) {
      const next = parseInt(btn.dataset.next);
      if (next > State.unlockedUp) {
        // Unlock it if current lesson is done
        if (next === State.currentLesson + 1) {
          unlockLesson(next);
        } else {
          showToast('Selesaikan materi sebelumnya!', 'e');
          return;
        }
      }
      switchLesson(next);
    }

    if (prevBtn) {
      const prev = parseInt(prevBtn.dataset.prev);
      switchLesson(prev);
    }
  });
}

function updateLnDots(n) {
  $$('.ln-dot').forEach((dot, i) => {
    dot.classList.toggle('active', i + 1 === n);
  });
}

// ─── UNLOCK LESSON ────────────────────────────
function unlockLesson(n) {
  if (n <= State.unlockedUp) return;
  State.unlockedUp = n;
  // Also unlock all in between
  for (let i = 2; i <= n; i++) {
    const btn = document.querySelector(`.sb-lesson[data-lesson="${i}"]`);
    if (btn) {
      btn.classList.remove('locked');
      btn.classList.add('unlocked');
      if (!btn._bound) {
        btn.addEventListener('click', () => switchLesson(i));
        btn._bound = true;
      }
    }
  }
  saveState();
  refreshUI();

  // Re-bind newly unlocked lesson
  const btn = document.querySelector(`.sb-lesson[data-lesson="${n}"]`);
  if (btn) {
    btn.classList.remove('locked');
    btn.classList.add('unlocked');
    btn.addEventListener('click', () => switchLesson(n));
    const icon = btn.querySelector('.sbl-lock-icon i');
    if (icon) icon.className = 'fa-solid fa-lock-open';
  }

  showToast(`🔓 Materi ${n} dibuka!`, 'i', 3000);
}

// ─── ADD XP ───────────────────────────────────
function addXP(amount) {
  if (typeof eduvixTambahXP === 'function') {
    eduvixTambahXP(amount, 'Materi activity');
    loadState(); // Refresh local unlockedUp
  } else {
    // Fallback
    const oldLevel = State.level;
    State.xp += amount;
    saveState();
    refreshUI();

    const popup = $('xpPopup');
    const val = $('xpPopupVal');
    if (popup && val) {
      val.textContent = amount;
      popup.classList.add('show');
      setTimeout(() => popup.classList.remove('show'), 2500);
    }
    if (State.level > oldLevel) {
      setTimeout(() => showToast(`⭐ Level Up! Kamu sekarang Level ${State.level}`, 'i', 3500), 600);
    }
  }
}

// ─── STREAK ───────────────────────────────────
function updateStreakDaily() {
  if (typeof eduvixGetUser === 'function') {
    // jalan.js already handles streak globally on load
    return;
  }
  const today = new Date().toDateString();
  const lastVisit = localStorage.getItem('eduvix_last_visit');
  const yesterday = new Date(Date.now() - 86400000).toDateString();

  if (lastVisit === yesterday) {
    State.streak++;
  } else if (lastVisit !== today) {
    State.streak = 1;
  }
  localStorage.setItem('eduvix_last_visit', today);
  saveState();
}

// ─── DRAG & DROP GAME ─────────────────────────
function initDragGame() {
  const cards = $$('.dg-card');
  const zones = $$('.dg-zone');
  const checkBtn = $('btnCheckDrag');
  const feedback = $('dragFeedback');
  let dragging = null;

  cards.forEach(card => {
    card.addEventListener('dragstart', e => {
      dragging = card;
      setTimeout(() => card.classList.add('dragging'), 0);
      e.dataTransfer.effectAllowed = 'move';
    });
    card.addEventListener('dragend', () => {
      card.classList.remove('dragging');
      dragging = null;
      checkAllPlaced();
    });

    // Touch / click support (tap to select, tap zone to place)
    card.addEventListener('click', () => {
      if (card.classList.contains('correct') || card.classList.contains('wrong')) return;
      $$('.dg-card.selected-touch').forEach(c => c.classList.remove('selected-touch'));
      card.classList.add('selected-touch');
    });
  });

  zones.forEach(zone => {
    const drop = zone.querySelector('.dz-drop');
    const accept = zone.dataset.accept;

    zone.addEventListener('dragover', e => {
      e.preventDefault();
      zone.classList.add('drag-over');
    });
    zone.addEventListener('dragleave', () => zone.classList.remove('drag-over'));
    zone.addEventListener('drop', e => {
      e.preventDefault();
      zone.classList.remove('drag-over');
      if (!dragging) return;
      placeCard(dragging, drop, accept);
      checkAllPlaced();
    });

    // Tap zone to place selected card
    zone.addEventListener('click', () => {
      const selected = document.querySelector('.dg-card.selected-touch');
      if (!selected) return;
      placeCard(selected, drop, accept);
      selected.classList.remove('selected-touch');
      checkAllPlaced();
    });
  });

  function placeCard(card, drop, zoneAccept) {
    drop.appendChild(card);
    State.dragItems[card.dataset.id] = zoneAccept;
    card.style.cursor = 'default';
  }

  function checkAllPlaced() {
    const total = $$('.dg-card').length;
    const placed = Object.keys(State.dragItems).length;
    if (checkBtn) checkBtn.style.display = placed === total ? 'flex' : 'none';
  }

  if (checkBtn) {
    checkBtn.addEventListener('click', () => {
      let correct = 0;
      $$('.dg-card').forEach(card => {
        const id = card.dataset.id;
        const expected = card.dataset.type;
        const placed = State.dragItems[id];
        if (placed === expected) {
          card.classList.add('correct');
          card.classList.remove('wrong');
          correct++;
        } else {
          card.classList.add('wrong');
          card.classList.remove('correct');
        }
      });

      const all = $$('.dg-card').length;
      if (correct === all) {
        feedback.className = 'drag-feedback correct';
        feedback.innerHTML = '<i class="fa-solid fa-circle-check"></i> Semua benar! Kamu keren!';
        addXP(10);
        showToast('Mini game selesai! +10 XP', 's');
      } else {
        feedback.className = 'drag-feedback wrong';
        feedback.innerHTML = `<i class="fa-solid fa-circle-xmark"></i> ${correct}/${all} benar. Coba cek lagi!`;
      }
      checkBtn.style.display = 'none';
    });
  }
}

// ─── QUIZ ─────────────────────────────────────
function initQuiz() {
  const openBtn = $('openQuizBtn');
  const modal = $('quizModal');
  const closeBtn = $('closeQuizBtn');
  const nextBtn = $('qmNext');
  const prevBtn = $('qmPrev');
  const finishBtn = $('qmFinish');

  if (openBtn) openBtn.addEventListener('click', openQuiz);
  if (closeBtn) closeBtn.addEventListener('click', closeQuiz);
  if (nextBtn) nextBtn.addEventListener('click', quizNext);
  if (prevBtn) prevBtn.addEventListener('click', quizPrev);
  if (finishBtn) finishBtn.addEventListener('click', finishQuiz);

  // Close on backdrop click
  if (modal) {
    modal.addEventListener('click', e => {
      if (e.target === modal) closeQuiz();
    });
  }

  // Options
  $$('.qm-opt').forEach(opt => {
    opt.addEventListener('click', () => handleOptionClick(opt));
  });
}

function openQuiz() {
  State.quizCurrent = 1;
  State.quizAnswers = {};
  $('quizModal').classList.add('open');
  document.body.style.overflow = 'hidden';
  renderQuizState();
}
function closeQuiz() {
  $('quizModal').classList.remove('open');
  document.body.style.overflow = '';
  resetQuizUI();
}

function resetQuizUI() {
  $$('.qm-question').forEach(q => {
    q.classList.remove('active');
    q.querySelectorAll('.qm-opt').forEach(o => {
      o.classList.remove('selected', 'correct', 'wrong');
      o.disabled = false;
      const icon = o.querySelector('.qm-opt-icon');
      if (icon) icon.className = 'qm-opt-icon';
    });
    const fb = q.querySelector('.qm-feedback');
    if (fb) { fb.style.display = 'none'; fb.className = 'qm-feedback'; }
  });
  State.quizCurrent = 1;
  State.quizAnswers = {};
}

function renderQuizState() {
  const total = State.quizTotal;
  const cur = State.quizCurrent;

  // Show current question
  $$('.qm-question').forEach(q => q.classList.remove('active'));
  const qEl = document.querySelector(`.qm-question[data-q="${cur}"]`);
  if (qEl) qEl.classList.add('active');

  // Progress bar
  const pct = ((cur - 1) / total) * 100;
  const fill = $('qmProgFill');
  const label = $('qmProgLabel');
  if (fill) fill.style.width = pct + '%';
  if (label) label.textContent = `${cur} / ${total}`;

  // Buttons
  const prevBtn = $('qmPrev');
  const nextBtn = $('qmNext');
  const finishBtn = $('qmFinish');

  if (prevBtn) prevBtn.style.display = cur > 1 ? 'flex' : 'none';

  const answered = State.quizAnswers[cur] !== undefined;
  if (nextBtn) {
    nextBtn.disabled = !answered;
    nextBtn.style.display = cur < total ? 'flex' : 'none';
  }
  if (finishBtn) {
    finishBtn.style.display = cur === total && answered ? 'flex' : 'none';
    if (cur !== total) finishBtn.style.display = 'none';
  }

  // Live score
  const liveScore = $('qmLiveScore');
  if (liveScore) {
    const correct = Object.values(State.quizAnswers).filter(v => v === 'correct').length;
    const done = Object.keys(State.quizAnswers).length;
    liveScore.textContent = done > 0 ? `${correct}/${done} benar` : '';
  }
}

function handleOptionClick(opt) {
  const qEl = opt.closest('.qm-question');
  const qNum = parseInt(qEl.dataset.q);

  if (State.quizAnswers[qNum] !== undefined) return; // already answered

  const isCorrect = opt.dataset.ans === 'correct';
  State.quizAnswers[qNum] = isCorrect ? 'correct' : 'wrong';

  // Disable all opts in this question
  qEl.querySelectorAll('.qm-opt').forEach(o => {
    o.disabled = true;
    if (o.dataset.ans === 'correct') {
      o.classList.add('correct');
      o.querySelector('.qm-opt-icon').innerHTML = '<i class="fa-solid fa-circle-check" style="color:var(--green)"></i>';
    }
  });

  // Mark selected
  if (!isCorrect) {
    opt.classList.add('wrong');
    opt.querySelector('.qm-opt-icon').innerHTML = '<i class="fa-solid fa-circle-xmark" style="color:var(--red)"></i>';
  }

  // Feedback
  const fb = qEl.querySelector('.qm-feedback');
  if (fb) {
    fb.style.display = 'flex';
    if (isCorrect) {
      fb.className = 'qm-feedback correct';
      const msgs = ['Benar! Kamu hebat!', 'Tepat sekali!', 'Luar biasa! Jawaban sempurna!'];
      fb.innerHTML = `<i class="fa-solid fa-party-horn"></i> ${msgs[Math.floor(Math.random() * msgs.length)]}`;
    } else {
      fb.className = 'qm-feedback wrong';
      fb.innerHTML = `<i class="fa-solid fa-face-frown"></i> Kurang tepat. Perhatikan jawaban yang benar ya!`;
    }
  }

  renderQuizState();
}

function quizNext() {
  if (State.quizCurrent < State.quizTotal) {
    State.quizCurrent++;
    renderQuizState();
  }
}
function quizPrev() {
  if (State.quizCurrent > 1) {
    State.quizCurrent--;
    renderQuizState();
  }
}

function finishQuiz() {
  const correct = Object.values(State.quizAnswers).filter(v => v === 'correct').length;
  const total = State.quizTotal;
  const score = Math.round((correct / total) * 100);
  const xpEarned = correct * 20;

  // Give XP
  addXP(xpEarned);

  // Close quiz
  closeQuiz();

  // Open result
  setTimeout(() => openResult(correct, total, score, xpEarned), 300);

  // Unlock next lesson
  if (correct >= Math.ceil(total / 2)) {
    unlockLesson(State.currentLesson + 1);
  }
}

// ─── RESULT MODAL ─────────────────────────────
function initResultModal() {
  const continueBtn = $('rmContinue');
  if (continueBtn) {
    continueBtn.addEventListener('click', () => {
      $('resultModal').classList.remove('open');
      document.body.style.overflow = '';
      // Go to next lesson
      const next = State.currentLesson + 1;
      if (next <= 6) switchLesson(next);
    });
  }
}

function openResult(correct, total, score, xp) {
  const modal = $('resultModal');
  if (!modal) return;

  modal.classList.add('open');
  document.body.style.overflow = 'hidden';

  // Stars
  const stars = $('rmStars');
  if (stars) {
    const starCount = score === 100 ? 3 : score >= 66 ? 2 : score >= 33 ? 1 : 0;
    stars.innerHTML = [1, 2, 3].map(i =>
      `<span style="transition:transform .3s ease ${i * .15}s;display:inline-block;${i <= starCount ? 'color:#fbbf24;filter:drop-shadow(0 0 6px rgba(251,191,36,.6))' : 'color:#e2e8f6'}">
        <i class="fa-solid fa-star"></i>
      </span>`
    ).join('');
    setTimeout(() => stars.querySelectorAll('span').forEach(s => s.style.transform = 'scale(1)'), 100);
  }

  // Title & sub
  const title = $('rmTitle');
  const sub = $('rmSub');
  if (title) title.textContent = score === 100 ? 'Sempurna! 🏆' : score >= 66 ? 'Bagus Sekali!' : score >= 33 ? 'Lumayan! Terus berlatih!' : 'Jangan menyerah ya!';
  if (sub) sub.textContent = `${correct} dari ${total} soal benar — terus semangat!`;

  // Stats with counter animation
  animateValue($('rmScore'), 0, score, 1000);
  animateValue($('rmCorrect'), 0, correct, 800, `/${total}`);
  animateValue($('rmXp'), 0, xp, 1200, '', '+');

  // Bar
  setTimeout(() => {
    const fill = $('rmBarFill');
    const pct = $('rmBarPct');
    if (fill) fill.style.width = score + '%';
    if (pct) pct.textContent = score + '%';
  }, 400);

  // Confetti
  if (score >= 66) launchConfetti();
}

function animateValue(el, from, to, duration, suffix = '', prefix = '') {
  if (!el) return;
  const start = Date.now();
  const tick = () => {
    const elapsed = Date.now() - start;
    const progress = Math.min(elapsed / duration, 1);
    const ease = 1 - Math.pow(1 - progress, 3);
    const val = Math.round(from + (to - from) * ease);
    el.textContent = prefix + val + suffix;
    if (progress < 1) requestAnimationFrame(tick);
  };
  requestAnimationFrame(tick);
}

function launchConfetti() {
  const wrap = $('rmConfetti');
  if (!wrap) return;
  const colors = ['#2563eb', '#7c3aed', '#10b981', '#f59e0b', '#ec4899', '#06b6d4'];
  for (let i = 0; i < 50; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-piece';
    el.style.cssText = `
      left: ${Math.random() * 100}%;
      top: -10px;
      background: ${colors[Math.floor(Math.random() * colors.length)]};
      width: ${Math.random() * 10 + 5}px;
      height: ${Math.random() * 10 + 5}px;
      border-radius: ${Math.random() > .5 ? '50%' : '2px'};
      animation-duration: ${Math.random() * 2 + 1.5}s;
      animation-delay: ${Math.random() * 1}s;
    `;
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

// ─── TOAST ────────────────────────────────────
function showToast(msg, type = '', duration = 2200) {
  const toast = $('toast');
  if (!toast) return;
  toast.innerHTML = msg;
  toast.className = `toast show ${type}`;
  clearTimeout(toast._t);
  toast._t = setTimeout(() => toast.classList.remove('show'), duration);
}

// ─── KEYBOARD SHORTCUTS ───────────────────────
document.addEventListener('keydown', e => {
  if (['INPUT', 'TEXTAREA'].includes(e.target.tagName)) return;
  if (e.key === 'Escape') {
    $('quizModal')?.classList.remove('open');
    $('resultModal')?.classList.remove('open');
    document.body.style.overflow = '';
  }
  if (e.key === 'ArrowRight' && !$('quizModal')?.classList.contains('open')) {
    const next = State.currentLesson + 1;
    if (next <= State.unlockedUp && next <= 6) switchLesson(next);
  }
  if (e.key === 'ArrowLeft' && !$('quizModal')?.classList.contains('open')) {
    const prev = State.currentLesson - 1;
    if (prev >= 1) switchLesson(prev);
  }
});

// ─── ELEMENT CARD TILT ───────────────────────
function initTilt() {
  $$('[data-tilt]').forEach(card => {
    card.addEventListener('mousemove', e => {
      const rect = card.getBoundingClientRect();
      const x = (e.clientX - rect.left) / rect.width - 0.5;
      const y = (e.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(600px) rotateX(${-y * 10}deg) rotateY(${x * 10}deg) translateY(-4px)`;
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
    });
  });
}

// ─── START ────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  init();
  initTilt();
  // Trigger reveals for first page
  setTimeout(() => {
    $$('.lesson-page.active .reveal').forEach((el, i) => {
      setTimeout(() => el.classList.add('visible'), i * 100);
    });
  }, 200);
});