// ==================== Quiz Data ====================
const quizData = [
  {
    question: "Apa yang dimaksud dengan berpikir kritis?",
    options: ["Kemampuan untuk mengkritik orang lain tanpa dasar", "Kemampuan menganalisis informasi secara logis dan objektif", "Hanya menerima informasi dari sumber yang terpercaya", "Mengikuti pendapat mayoritas dalam sebuah diskusi"],
    correct: 1,
    explanation: "Berpikir kritis adalah kemampuan untuk menganalisis dan mengevaluasi informasi secara logis dan objektif, bukan hanya menerima informasi begitu saja atau mengikuti pendapat orang lain."
  },
  {
    question: "Mana yang termasuk contoh FAKTA?",
    options: ["Menurutku, coklat adalah rasa terbaik", "Air mendidih pada suhu 100°C (tekanan normal)", "Film ini sangat membosankan", "Semua orang seharusnya suka matematika"],
    correct: 1,
    explanation: "Fakta adalah sesuatu yang dapat dibuktikan dengan data atau bukti ilmiah. Air mendidih pada 100°C adalah fakta yang dapat diverifikasi."
  },
  {
    question: "Apa yang BUKAN termasuk elemen berpikir kritis?",
    options: ["Observasi yang detail", "Mengajukan pertanyaan kritis", "Mengikuti pendapat mayoritas", "Mengevaluasi informasi dengan logika"],
    correct: 2,
    explanation: "Mengikuti pendapat mayoritas bukan bagian dari berpikir kritis. Berpikir kritis memerlukan analisis independen, bukan hanya mengikuti apa yang orang lain katakan."
  },
  {
    question: "Logical Fallacy 'Ad Hominem' adalah:",
    options: ["Mengubah argumen lawan menjadi versi yang lebih lemah", "Menyerang karakter orang, bukan argumennya", "Menyimpulkan dari sampel yang terlalu kecil", "Hanya memberikan dua pilihan ekstrem"],
    correct: 1,
    explanation: "Ad Hominem adalah kesalahan logika dimana seseorang menyerang karakter atau pribadi lawan debat, bukan menyerang argumennya."
  },
  {
    question: "Apa itu Confirmation Bias?",
    options: ["Kecenderungan percaya informasi pertama yang diterima", "Kecenderungan mencari informasi yang mendukung keyakinan kita", "Kecenderungan mengikuti keputusan mayoritas", "Kecenderungan menghindari informasi baru"],
    correct: 1,
    explanation: "Confirmation Bias adalah kecenderungan untuk mencari, menginterpretasi, dan mengingat informasi yang mengkonfirmasi keyakinan atau hipotesis kita yang sudah ada."
  },
  {
    question: "Kriteria CRAAP untuk evaluasi sumber informasi mencakup:",
    options: ["Cost, Relevance, Authority, Accuracy, Purpose", "Currency, Relevance, Authority, Accuracy, Purpose", "Current, Review, Author, Accuracy, Publish", "Content, Reference, Author, Access, Purpose"],
    correct: 1,
    explanation: "CRAAP adalah singkatan dari Currency (kemutakhiran), Relevance (relevansi), Authority (otoritas), Accuracy (akurasi), dan Purpose (tujuan)."
  },
  {
    question: "Dalam pengambilan keputusan rasional, langkah pertama adalah:",
    options: ["Mengumpulkan opini dari banyak orang", "Mengidentifikasi masalah dengan jelas", "Langsung memilih solusi terbaik", "Mengevaluasi konsekuensi"],
    correct: 1,
    explanation: "Langkah pertama dalam pengambilan keputusan rasional adalah mengidentifikasi dan mendefinisikan masalah dengan jelas sebelum mencari solusi."
  },
  {
    question: "Mana yang termasuk 'Hasty Generalization'?",
    options: ["Semua kucing adalah hewan, jadi hewan peliharaan saya adalah kucing", "Saya bertemu 2 orang kasar dari kota X, jadi semua orang dari kota X kasar", "Jika hujan, jalanan basah. Jalanan basah, jadi pasti hujan", "Kamu salah, jadi saya benar"],
    correct: 1,
    explanation: "Hasty Generalization adalah kesimpulan yang dibuat berdasarkan sampel yang terlalu kecil atau tidak representatif."
  },
  {
    question: "Apa perbedaan argumen DEDUKTIF dan INDUKTIF?",
    options: ["Deduktif: khusus ke umum, Induktif: umum ke khusus", "Deduktif: umum ke khusus, Induktif: khusus ke umum", "Keduanya sama saja", "Deduktif untuk sains, Induktif untuk matematika"],
    correct: 1,
    explanation: "Argumen deduktif bergerak dari premis umum ke kesimpulan khusus, sedangkan induktif dari observasi khusus ke kesimpulan umum."
  },
  {
    question: "Sikap yang BENAR dalam berpikir kritis adalah:",
    options: ["Percaya semua yang dikatakan para ahli", "Selalu skeptis dan tidak percaya apapun", "Terbuka terhadap bukti baru dan siap mengubah pendapat", "Mempertahankan pendapat awal apapun yang terjadi"],
    correct: 2,
    explanation: "Pemikir kritis harus terbuka terhadap bukti dan informasi baru, serta bersedia mengubah pendapat jika ada bukti yang lebih kuat."
  }
];

// ==================== State ====================
let currentQuestion = 0;
let userAnswers = new Array(quizData.length).fill(undefined);
let markedQuestions = new Set();
let streak = 0;
let totalXP = 0;
let timeLeft = 1200;
let timerInterval;
const MAX_TIME = 1200;

// ==================== DOM REFS (Initialized in init) ====================
let dom = {};

function initDOMRefs() {
  dom.questionText = document.getElementById('question-text');
  dom.answerOptions = document.getElementById('answer-options');
  dom.explanationBox = document.getElementById('explanation');
  dom.explanationTxt = document.getElementById('explanation-text');
  dom.progressFill = document.getElementById('progressFill');
  dom.progressPct = document.getElementById('progressPct');
  dom.progressCounter = document.getElementById('progressCounter');
  dom.timerValue = document.getElementById('timerValue');
  dom.timerRing = document.getElementById('timerRingFill');
  dom.btnPrev = document.getElementById('btn-previous');
  dom.btnNext = document.getElementById('btn-next');
  dom.btnFinish = document.getElementById('btn-finish');
  dom.questionLabel = document.getElementById('questionLabel');
  dom.streakLabel = document.getElementById('streakLabel');
  dom.streakDots = document.getElementById('streakDots');
  dom.xpBadge = document.getElementById('xpBadge');
  dom.xpPop = document.getElementById('xpPop');
  dom.qmapPanel = document.getElementById('qmapPanel');
  dom.qmapBackdrop = document.getElementById('qmapBackdrop');
  dom.qmapGrid = document.getElementById('qmapGrid');
  dom.qnavDots = document.getElementById('qnavDots');
  dom.btnMap = document.getElementById('btnMap');
  dom.btnMark = document.getElementById('btnMark');
}

// ==================== PARTICLES ====================
(function initParticles() {
  const canvas = document.getElementById('particleCanvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  let W, H, particles = [];
  function resize() { W = canvas.width = window.innerWidth; H = canvas.height = window.innerHeight; }
  resize();
  window.addEventListener('resize', resize);
  for (let i = 0; i < 55; i++) {
    particles.push({
      x: Math.random() * W, y: Math.random() * H,
      r: Math.random() * 1.8 + .5, dx: (Math.random() - .5) * .4, dy: (Math.random() - .5) * .4,
      a: Math.random()
    });
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    particles.forEach(p => {
      p.x += p.dx; p.y += p.dy;
      if (p.x < 0) p.x = W; if (p.x > W) p.x = 0;
      if (p.y < 0) p.y = H; if (p.y > H) p.y = 0;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(129,140,248,${p.a * .6})`;
      ctx.fill();
    });
    requestAnimationFrame(draw);
  }
  draw();
})();

// ==================== INIT ====================
async function init() {
  // Cek login dulu
  if (window.EduvixAPI) await EduvixAPI.requireLogin();
  
  initDOMRefs();
  buildQmap();
  buildNavDots();
  loadQuestion();
  startTimer();
  updateProgress();
  updateNavButtons();
  dom.btnPrev.addEventListener('click', prevQ);
  dom.btnNext.addEventListener('click', nextQ);
  dom.btnFinish.addEventListener('click', finishQuiz);
  dom.btnMap.addEventListener('click', openQmap);
  document.getElementById('qmapClose').addEventListener('click', closeQmap);
  dom.qmapBackdrop.addEventListener('click', closeQmap);
  dom.btnMark.addEventListener('click', toggleMark);
  document.querySelector('.btn-review-answers').addEventListener('click', reviewAnswers);
  document.querySelector('.btn-back-dashboard').addEventListener('click', () => window.location.href = 'dashboard.html');
}

// ==================== TIMER ====================
function startTimer() {
  updateTimerDisplay();
  timerInterval = setInterval(() => {
    timeLeft--;
    updateTimerDisplay();
    if (timeLeft <= 0) { clearInterval(timerInterval); finishQuiz(); }
    if (timeLeft === 300) showToast('⏰ Waktu tinggal 5 menit!', 'warn');
  }, 1000);
}

function updateTimerDisplay() {
  const m = Math.floor(timeLeft / 60);
  const s = timeLeft % 60;
  dom.timerValue.textContent = `${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
  const pct = timeLeft / MAX_TIME;
  const circ = 113.1;
  dom.timerRing.style.strokeDashoffset = circ * (1 - pct);
  const el = document.getElementById('qzTimer');
  el.classList.toggle('warn', timeLeft < 300 && timeLeft >= 60);
  el.classList.toggle('danger', timeLeft < 60);
}

// ==================== LOAD QUESTION ====================
function loadQuestion() {
  const q = quizData[currentQuestion];
  dom.questionLabel.textContent = `Soal ${currentQuestion + 1}`;
  dom.questionText.style.animation = 'none';
  requestAnimationFrame(() => { dom.questionText.style.animation = 'fadeSlide .4s ease'; });
  dom.questionText.textContent = q.question;

  dom.answerOptions.innerHTML = '';
  q.options.forEach((opt, i) => {
    const btn = document.createElement('button');
    btn.className = 'option-btn';
    btn.dataset.index = i;
    const letters = ['A', 'B', 'C', 'D'];
    btn.innerHTML = `
          <span class="option-letter">${letters[i]}</span>
          <span class="option-text">${opt}</span>
          <span class="option-check"></span>
        `;
    btn.addEventListener('click', () => selectOption(i));
    dom.answerOptions.appendChild(btn);
  });

  dom.explanationBox.style.display = 'none';

  if (userAnswers[currentQuestion] !== undefined) {
    restoreAnswer(userAnswers[currentQuestion]);
  }

  // Mark button state
  dom.btnMark.classList.toggle('marked', markedQuestions.has(currentQuestion));

  updateProgress();
  updateNavButtons();
  updateQmap();
  updateNavDots();
  updateStreakUI();
}

// ==================== SELECT OPTION ====================
function selectOption(index, skipFX = false) {
  const q = quizData[currentQuestion];
  const btns = dom.answerOptions.querySelectorAll('.option-btn');
  const already = userAnswers[currentQuestion] !== undefined;
  if (already) return;

  userAnswers[currentQuestion] = index;
  const isCorrect = index === q.correct;

  const SVG_OK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
  const SVG_X = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;

  setTimeout(() => {
    btns.forEach(b => b.disabled = true);
    btns[index].classList.add(isCorrect ? 'correct' : 'wrong');
    btns[index].querySelector('.option-check').innerHTML = isCorrect ? SVG_OK : SVG_X;
    if (!isCorrect) {
      btns[q.correct].classList.add('correct');
      btns[q.correct].querySelector('.option-check').innerHTML = SVG_OK;
      btns[index].classList.add('shake');
      setTimeout(() => btns[index].classList.remove('shake'), 500);
      streak = 0;
    } else {
      streak++;
      const xp = 10 + (streak > 1 ? (streak - 1) * 5 : 0);
      totalXP += xp;
      showXPPop(`+${xp} XP${streak > 1 ? ' 🔥' : ''}`);
      dom.xpBadge.textContent = `+${totalXP} XP`;
      if (!skipFX) spawnConfetti();
    }
    updateStreakUI();
    dom.explanationTxt.textContent = q.explanation;
    dom.explanationBox.style.display = 'flex';
    updateNavButtons();
    updateQmap();
    updateNavDots();
    if (!skipFX) playSound(isCorrect ? 'correct' : 'wrong');
  }, skipFX ? 0 : 260);
}

function restoreAnswer(index) {
  const q = quizData[currentQuestion];
  const btns = dom.answerOptions.querySelectorAll('.option-btn');
  const SVG_OK = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M5 13l4 4L19 7"/></svg>`;
  const SVG_X = `<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><path d="M18 6L6 18M6 6l12 12"/></svg>`;
  btns.forEach(b => b.disabled = true);
  const isCorrect = index === q.correct;
  btns[index].classList.add(isCorrect ? 'correct' : 'wrong');
  btns[index].querySelector('.option-check').innerHTML = isCorrect ? SVG_OK : SVG_X;
  if (!isCorrect) {
    btns[q.correct].classList.add('correct');
    btns[q.correct].querySelector('.option-check').innerHTML = SVG_OK;
  }
  dom.explanationTxt.textContent = q.explanation;
  dom.explanationBox.style.display = 'flex';
}

// ==================== NAV ====================
function nextQ() {
  if (currentQuestion < quizData.length - 1) {
    currentQuestion++;
    loadQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function prevQ() {
  if (currentQuestion > 0) {
    currentQuestion--;
    loadQuestion();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }
}

function updateNavButtons() {
  const answered = userAnswers[currentQuestion] !== undefined;
  dom.btnPrev.disabled = currentQuestion === 0;
  const isLast = currentQuestion === quizData.length - 1;
  dom.btnNext.style.display = isLast ? 'none' : 'flex';
  dom.btnFinish.style.display = isLast ? 'flex' : 'none';
  dom.btnNext.disabled = !answered;
}

// ==================== PROGRESS ====================
function updateProgress() {
  const answered = userAnswers.filter(a => a !== undefined).length;
  const pct = Math.round(((currentQuestion + 1) / quizData.length) * 100);
  dom.progressFill.style.width = pct + '%';
  dom.progressPct.textContent = pct + '%';
  dom.progressCounter.textContent = `${currentQuestion + 1} / ${quizData.length}`;
}

// ==================== QUESTION MAP ====================
function buildQmap() {
  dom.qmapGrid.innerHTML = '';
  quizData.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.textContent = i + 1;
    btn.dataset.qi = i;
    btn.addEventListener('click', () => { currentQuestion = i; loadQuestion(); closeQmap(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    dom.qmapGrid.appendChild(btn);
  });
}

function updateQmap() {
  const btns = dom.qmapGrid.querySelectorAll('button');
  btns.forEach((btn, i) => {
    btn.className = '';
    if (i === currentQuestion) btn.classList.add('current');
    else if (userAnswers[i] !== undefined) btn.classList.add('answered');
    if (markedQuestions.has(i)) btn.classList.add('marked');
  });
}

function openQmap() { dom.qmapPanel.classList.add('open'); dom.qmapBackdrop.classList.add('show'); updateQmap(); }
function closeQmap() { dom.qmapPanel.classList.remove('open'); dom.qmapBackdrop.classList.remove('show'); }

// ==================== NAV DOTS ====================
function buildNavDots() {
  dom.qnavDots.innerHTML = '';
  quizData.forEach((_, i) => {
    const dot = document.createElement('span');
    dot.className = 'qnav-dot';
    dot.addEventListener('click', () => { currentQuestion = i; loadQuestion(); window.scrollTo({ top: 0, behavior: 'smooth' }); });
    dom.qnavDots.appendChild(dot);
  });
}

function updateNavDots() {
  const dots = dom.qnavDots.querySelectorAll('.qnav-dot');
  dots.forEach((dot, i) => {
    dot.className = 'qnav-dot';
    if (i === currentQuestion) dot.classList.add('current');
    else if (userAnswers[i] !== undefined) dot.classList.add('answered');
    if (markedQuestions.has(i)) dot.classList.add('marked');
  });
}

// ==================== MARK ====================
function toggleMark() {
  if (markedQuestions.has(currentQuestion)) markedQuestions.delete(currentQuestion);
  else markedQuestions.add(currentQuestion);
  dom.btnMark.classList.toggle('marked', markedQuestions.has(currentQuestion));
  updateNavDots();
  updateQmap();
}

// ==================== STREAK UI ====================
function updateStreakUI() {
  streakLabel.textContent = `Streak: ${streak}`;
  const dots = dom.streakDots.querySelectorAll('.sd');
  dots.forEach((d, i) => d.classList.toggle('lit', i < streak));
}

// ==================== FINISH ====================
function finishQuiz() {
  clearInterval(timerInterval);
  const correct = userAnswers.filter((a, i) => a === quizData[i].correct).length;
  const wrong = quizData.length - correct;
  const pct = Math.round((correct / quizData.length) * 100);
  const xp = correct * 10;

  const gold = pct >= 70 ? 50 : 10;

  document.getElementById('correct-count').textContent = correct;
  document.getElementById('wrong-count').textContent = wrong;
  document.getElementById('score-percentage').textContent = pct + '%';
  document.getElementById('xp-earned').textContent = xp;
  const goldEl = document.getElementById('gold-earned');
  if (goldEl) goldEl.textContent = gold;

  const SVG_TROPHY = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
  const SVG_SILVER = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#94a3b8" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
  const SVG_BRONZE = `<svg width="48" height="48" viewBox="0 0 24 24" fill="none" stroke="#d97706" stroke-width="1.5" stroke-linecap="round" stroke-linejoin="round"><path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"/><path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"/><path d="M4 22h16"/><path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"/><path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"/><path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"/></svg>`;
  const SVG_STAR = `<svg width="22" height="22" viewBox="0 0 24 24" fill="#f59e0b" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>`;
  const SVG_STAR_OFF = `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#cbd5e1" stroke-width="2"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>`;

  const starsHtml = pct >= 80 ? SVG_STAR + SVG_STAR + SVG_STAR : pct >= 50 ? SVG_STAR + SVG_STAR + SVG_STAR_OFF : SVG_STAR + SVG_STAR_OFF + SVG_STAR_OFF;
  document.getElementById('rmStars').innerHTML = starsHtml;
  document.getElementById('rmTitle').textContent = pct >= 80 ? 'Luar Biasa!' : pct >= 50 ? 'Bagus!' : 'Tetap Semangat!';
  document.getElementById('rmSub').textContent = `Skor kamu ${pct}% dari ${quizData.length} soal.`;
  document.getElementById('rmTrophy').innerHTML = pct >= 80 ? SVG_TROPHY : pct >= 50 ? SVG_SILVER : SVG_BRONZE;

  // Animate score ring
  const ring = document.getElementById('scoreRingFill');
  const circ = 314.16;
  setTimeout(() => { ring.style.strokeDashoffset = circ * (1 - pct / 100); }, 300);

  document.getElementById('result-modal').classList.add('active');
  spawnResultConfetti();
  playSound('success');
  saveResult(pct, correct);
}

function reviewAnswers() {
  document.getElementById('result-modal').classList.remove('active');
  currentQuestion = 0;
  loadQuestion();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

// ==================== SAVE ====================
function saveResult(score, correct) {
  const xpEarned = correct * 10;
  const goldEarned = score >= 70 ? 50 : 10;

  // Simpan ke localStorage lokal juga (backup)
  const results = JSON.parse(localStorage.getItem('quizResults') || '[]');
  results.push({ score, correct, total: quizData.length, date: new Date().toISOString(), xp: xpEarned, gold: goldEarned });
  localStorage.setItem('quizResults', JSON.stringify(results));

  // Update data user di localStorage
  try {
    const rawUser = localStorage.getItem('eduvix_user');
    let u = rawUser ? JSON.parse(rawUser) : { xp: 0, coins: 0 };
    u.xp = (u.xp || 0) + xpEarned;
    u.coins = (u.coins || 0) + goldEarned;
    localStorage.setItem('eduvix_user', JSON.stringify(u));
  } catch (e) { }

  // Simpan ke sistem user global (api.js)
  if (window.EduvixAPI) {
    EduvixAPI.simpanHasilQuiz('tka_dasar', score, correct, quizData.length - correct, quizData.length)
      .then(res => {
        console.log("Quiz saved:", res);
        EduvixAPI.showApiToast(`+${res.xpDapat} XP & +${res.koinDapat} Koin!`, 'success');
      })
      .catch(err => {
        console.error("Failed to save quiz:", err);
      });
  }
}

// ==================== FX ====================
function spawnConfetti() {
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc'];
  for (let i = 0; i < 18; i++) {
    const el = document.createElement('div');
    el.style.cssText = `position:fixed;width:${6 + Math.random() * 6}px;height:${6 + Math.random() * 6}px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            left:${Math.random() * 100}%;top:-12px;opacity:1;border-radius:${Math.random() > 0.5 ? '50%' : '3px'};
            animation:confFall ${1.8 + Math.random() * 2}s linear forwards;z-index:9999;`;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 4000);
  }
}

function spawnResultConfetti() {
  const box = document.getElementById('rmConfetti');
  box.innerHTML = '';
  const colors = ['#818cf8', '#34d399', '#fbbf24', '#f87171', '#c084fc', '#38bdf8'];
  for (let i = 0; i < 40; i++) {
    const el = document.createElement('div');
    el.className = 'confetti-p';
    el.style.cssText = `left:${Math.random() * 100}%;top:-10px;
            background:${colors[Math.floor(Math.random() * colors.length)]};
            animation-duration:${1.5 + Math.random() * 2.5}s;animation-delay:${Math.random() * 1}s;`;
    box.appendChild(el);
  }
}

function showXPPop(msg) {
  const starSvg = `<svg width="13" height="13" viewBox="0 0 24 24" fill="#fff" stroke="none"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01z"/></svg>`;
  dom.xpPop.innerHTML = msg + ' ' + starSvg;
  dom.xpPop.classList.add('show');
  setTimeout(() => dom.xpPop.classList.remove('show'), 1800);
}

function showToast(msg, type) {
  const el = document.createElement('div');
  el.style.cssText = `position:fixed;bottom:28px;right:28px;z-index:9999;
        padding:12px 20px;border-radius:14px;font-weight:700;font-size:14px;color:#fff;
        background:${type === 'warn' ? '#d97706' : '#2563eb'};
        box-shadow:0 8px 28px rgba(0,0,0,.25);animation:fadeSlideUp .4s ease;`;
  el.textContent = msg;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 3500);
}

function playSound(type) {
  try {
    const ctx = new (window.AudioContext || window.webkitAudioContext)();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.connect(gain); gain.connect(ctx.destination);
    if (type === 'correct') {
      osc.frequency.value = 523.25;
      gain.gain.setValueAtTime(.25, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .35);
    } else if (type === 'wrong') {
      osc.type = 'sawtooth'; osc.frequency.value = 196;
      gain.gain.setValueAtTime(.2, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .4);
    } else if (type === 'success') {
      [523, 659, 784, 1047].forEach((f, i) => setTimeout(() => {
        const o = ctx.createOscillator(), g = ctx.createGain();
        o.connect(g); g.connect(ctx.destination);
        o.frequency.value = f; g.gain.setValueAtTime(.18, ctx.currentTime);
        g.gain.exponentialRampToValueAtTime(.01, ctx.currentTime + .3);
        o.start(); o.stop(ctx.currentTime + .3);
      }, i * 100));
      return;
    }
    osc.start(); osc.stop(ctx.currentTime + .35);
  } catch (e) { }
}

// ==================== KEYBOARD ====================
document.addEventListener('keydown', e => {
  if (['1', '2', '3', '4'].includes(e.key)) {
    const i = parseInt(e.key) - 1;
    if (userAnswers[currentQuestion] === undefined) selectOption(i);
  }
  if (e.key === 'ArrowRight' && !btnNext.disabled && btnNext.style.display !== 'none') nextQ();
  if (e.key === 'ArrowLeft' && !btnPrev.disabled) prevQ();
});

// ==================== INJECT KEYFRAMES ====================
const style = document.createElement('style');
style.textContent = `
@keyframes confFall { to { transform: translateY(110vh) rotate(720deg); opacity: 0; } }
@keyframes fadeSlideUp { from{opacity:0;transform:translateY(20px)} to{opacity:1;transform:translateY(0)} }
`;
document.head.appendChild(style);



// =========================================
//   BOOTSTRAP
// =========================================
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', init);
} else {
  init();
}