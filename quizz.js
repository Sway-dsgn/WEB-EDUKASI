// ===========================
// EDUVIX.ID — Quiz JS v2
// ===========================

// ========== DEFAULT SOAL ==========
const DEFAULT_QUESTIONS = [
  {
    id: 1,
    text: "Pengantar berpikir kritis adalah kemampuan untuk menganalisis informasi secara objektif. Manakah yang BUKAN merupakan ciri berpikir kritis?",
    options: ["Menganalisis argumen secara logis", "Mengevaluasi bukti secara objektif", "Menerima semua informasi tanpa pertanyaan", "Menarik kesimpulan berdasarkan data"],
    answer: 2
  },
  {
    id: 2,
    text: "Identifikasi argumen merupakan langkah pertama dalam berpikir kritis. Sebuah argumen yang valid harus memiliki...",
    options: ["Premis yang mendukung kesimpulan", "Emosi yang kuat dari penulis", "Banyak data tanpa kesimpulan", "Pernyataan yang tidak dapat dibuktikan"],
    answer: 0
  },
  {
    id: 3,
    text: "Logical Fallacy (kekeliruan logis) adalah kesalahan dalam penalaran. Contoh fallacy 'Ad Hominem' adalah...",
    options: ["Menyerang karakter seseorang daripada argumennya", "Menarik kesimpulan terlalu luas dari satu kasus", "Menganggap sesuatu benar karena banyak yang percaya", "Menggunakan bukti yang tidak relevan"],
    answer: 0
  },
  {
    id: 4,
    text: "Dalam logika, pernyataan 'Semua manusia adalah makhluk hidup, Soni adalah manusia, maka Soni adalah makhluk hidup' disebut...",
    options: ["Induksi", "Deduksi (Silogisme)", "Analogi", "Abduktif"],
    answer: 1
  },
  {
    id: 5,
    text: "Straw Man fallacy terjadi ketika seseorang...",
    options: ["Memberikan bukti yang kuat", "Memalsukan atau melebih-lebihkan argumen lawan untuk memudahkan serangan", "Menggunakan otoritas yang tepat sebagai referensi", "Menarik kesimpulan dari banyak premis"],
    answer: 1
  },
  {
    id: 6,
    text: "Manakah contoh argumen induktif yang tepat?",
    options: ["Semua X adalah Y, Z adalah X, maka Z adalah Y", "Matahari terbit setiap hari selama ribuan tahun, maka besok matahari pasti terbit", "Jika hujan, maka jalan basah. Jalan basah, maka hujan", "P atau Q, bukan P, maka Q"],
    answer: 1
  },
  {
    id: 7,
    text: "False Dichotomy adalah jenis logical fallacy yang...",
    options: ["Menyerang pribadi lawan", "Membuat pilihan seolah hanya ada dua opsi padahal lebih banyak", "Menggunakan banyak data statistik palsu", "Menarik simpati audiens lewat emosi"],
    answer: 1
  },
  {
    id: 8,
    text: "Evaluasi sumber informasi yang baik meliputi hal berikut, KECUALI...",
    options: ["Kredibilitas penulis atau lembaga", "Tanggal publikasi", "Jumlah like di media sosial", "Metodologi penelitian yang digunakan"],
    answer: 2
  },
  {
    id: 9,
    text: "Bias konfirmasi (confirmation bias) adalah kecenderungan...",
    options: ["Mencari informasi yang bertentangan dengan keyakinan kita", "Hanya mencari dan menerima informasi yang mendukung keyakinan kita", "Selalu meragukan setiap informasi yang diterima", "Menggunakan logika deduktif secara ketat"],
    answer: 1
  },
  {
    id: 10,
    text: "Dalam debat, teknik Socratic Questioning digunakan untuk...",
    options: ["Memenangkan argumen dengan emosi", "Mengajukan pertanyaan mendalam untuk mengungkap asumsi tersembunyi", "Menyerang karakter lawan bicara", "Mengabaikan bukti yang berlawanan"],
    answer: 1
  }
];

const QUIZ_CONFIG = {
  title:    "MCT Mock Tests",
  session:  "Session 1",
  duration: 20 * 60  // detik
};

// ========== LOAD SOAL dari localStorage atau default ==========
function loadQuestions() {
  const saved = localStorage.getItem('eduvix_custom_questions');
  if (saved) {
    try {
      const custom = JSON.parse(saved);
      if (Array.isArray(custom) && custom.length > 0) return custom;
    } catch(e) {}
  }
  return [...DEFAULT_QUESTIONS];
}

function saveQuestions(qs) {
  localStorage.setItem('eduvix_custom_questions', JSON.stringify(qs));
}

let QUESTIONS = loadQuestions();

// ========== STATE ==========
const state = {
  current:  0,
  answers:  {},
  marked:   new Set(),
  timer:    QUIZ_CONFIG.duration,
  timerInt: null,
  review:   false,
  done:     false,
  correctAnswer: null  // tambah soal: index jawaban benar
};

// ========== DOM ==========
const $ = id => document.getElementById(id);
const dom = {
  progressPct:   $('progressPct'),
  progressCount: $('progressCount'),
  progressFill:  $('progressFill'),
  sessionLabel:  $('sessionLabel'),
  questionMeta:  $('questionMeta'),
  questionText:  $('questionText'),
  optionsList:   $('optionsList'),
  prevBtn:       $('prevBtn'),
  nextBtn:       $('nextBtn'),
  finishBtn:     $('finishBtn'),
  reviewBtn:     $('reviewBtn'),
  markBtn:       $('markBtn'),
  timerVal:      $('timerVal'),
  timerBox:      $('timerBox'),
  // Map
  qmapOverlay:   $('qmapOverlay'),
  qmapGrid:      $('qmapGrid'),
  qmapClose:     $('qmapClose'),
  qmapFinish:    $('qmapFinish'),
  qmapSummary:   $('qmapSummary'),
  // Modal tambah soal
  addSoalBtn:    $('addSoalBtn'),
  addSoalOverlay:$('addSoalOverlay'),
  addSoalClose:  $('addSoalClose'),
  addSoalCancel: $('addSoalCancel'),
  addSoalSave:   $('addSoalSave'),
  inputQuestion: $('inputQuestion'),
  optionsInput:  $('optionsInput'),
  // Result
  resultScreen:  $('resultScreen'),
  rsScore:       $('rsScore'),
  rsCorrect:     $('rsCorrect'),
  rsWrong:       $('rsWrong'),
  rsUnanswered:  $('rsUnanswered'),
  scoreBarFill:  $('scoreBarFill'),
  scoreBarLabel: $('scoreBarLabel'),
  reviewResultBtn: $('reviewResultBtn'),
  retryBtn:      $('retryBtn'),
  // Toast
  toast:         $('toast'),
};

// ========== INIT ==========
function init() {
  loadState();
  dom.sessionLabel.textContent = QUIZ_CONFIG.session;
  renderQuestion();
  startTimer();
  buildQMap();
  bindEvents();
}

// ========== RENDER SOAL ==========
function renderQuestion() {
  const q   = QUESTIONS[state.current];
  const tot = QUESTIONS.length;

  dom.questionMeta.textContent = `Question ${state.current + 1}`;
  dom.questionText.textContent = q.text;

  // Progress
  const pct = Math.round(((state.current + 1) / tot) * 100);
  dom.progressPct.textContent  = pct + '%';
  dom.progressCount.textContent = `${state.current + 1} / ${tot}`;
  dom.progressFill.style.width = pct + '%';

  // Buttons
  dom.prevBtn.disabled = state.current === 0;
  dom.nextBtn.disabled = state.current === tot - 1;
  updateMarkBtn();

  // Animate question
  const qa = document.querySelector('.question-area');
  qa.style.opacity = '0'; qa.style.transform = 'translateY(8px)';
  requestAnimationFrame(() => {
    qa.style.transition = 'opacity .22s ease, transform .22s ease';
    qa.style.opacity = '1'; qa.style.transform = 'translateY(0)';
  });

  renderOptions(q);
}

function renderOptions(q) {
  dom.optionsList.innerHTML = '';
  q.options.forEach((opt, i) => {
    const el = document.createElement('div');
    el.className = 'option-item';

    if (state.review) {
      if (i === q.answer) el.classList.add('correct');
      else if (state.answers[state.current] === i) el.classList.add('wrong');
    } else {
      if (state.answers[state.current] === i) el.classList.add('selected');
    }

    el.innerHTML = `<span class="opt-text">${opt}</span><div class="opt-radio"></div>`;

    if (!state.review && !state.done) {
      el.addEventListener('click', () => selectOption(i));
    }

    el.style.opacity = '0';
    el.style.transform = 'translateX(-8px)';
    dom.optionsList.appendChild(el);
    setTimeout(() => {
      el.style.transition = 'opacity .2s ease, transform .2s ease, border-color .2s, background .2s, transform .25s cubic-bezier(.4,0,.2,1)';
      el.style.opacity = '1';
      el.style.transform = '';
    }, i * 55 + 40);
  });
}

function selectOption(idx) {
  state.answers[state.current] = idx;
  saveState();
  renderOptions(QUESTIONS[state.current]);
  updateQMap();
  showToast('✓ Jawaban dipilih', 'success', 1000);
}

// ========== NAV ==========
dom.prevBtn.addEventListener('click', () => { state.current--; renderQuestion(); updateQMap(); });
dom.nextBtn.addEventListener('click', () => { state.current++; renderQuestion(); updateQMap(); });

// ========== MARK ==========
dom.markBtn.addEventListener('click', () => {
  if (state.marked.has(state.current)) {
    state.marked.delete(state.current);
    showToast('Tanda dihapus');
  } else {
    state.marked.add(state.current);
    showToast('🔖 Soal ditandai', 'info');
  }
  updateMarkBtn(); updateQMap(); saveState();
});

function updateMarkBtn() {
  const m = state.marked.has(state.current);
  dom.markBtn.classList.toggle('marked', m);
  dom.markBtn.innerHTML = m
    ? '<i class="fa-solid fa-bookmark"></i> Marked'
    : '<i class="fa-regular fa-bookmark"></i> Mark as review';
}

// ========== TIMER ==========
function startTimer() {
  updateTimer();
  state.timerInt = setInterval(() => {
    state.timer--;
    updateTimer();
    saveState();
    if (state.timer <= 60) dom.timerBox.classList.add('urgent');
    if (state.timer <= 0) { clearInterval(state.timerInt); showToast('⏰ Waktu habis!', 'error', 2000); setTimeout(finishQuiz, 2100); }
  }, 1000);
}

function updateTimer() {
  const m = String(Math.floor(state.timer / 60)).padStart(2,'0');
  const s = String(state.timer % 60).padStart(2,'0');
  dom.timerVal.textContent = `${m}:${s}`;
}

// ========== FINISH ==========
dom.finishBtn.addEventListener('click', () => {
  const unanswered = QUESTIONS.length - Object.keys(state.answers).length;
  if (unanswered > 0) {
    showToast(`⚠️ Masih ${unanswered} soal belum dijawab!`, 'error', 2800);
  }
  setTimeout(finishQuiz, unanswered > 0 ? 2900 : 0);
});

function finishQuiz() {
  if (state.done) return;
  clearInterval(state.timerInt);
  state.done = true;

  let correct = 0;
  QUESTIONS.forEach((q, i) => { if (state.answers[i] === q.answer) correct++; });
  const wrong      = Object.keys(state.answers).length - correct;
  const unanswered = QUESTIONS.length - Object.keys(state.answers).length;
  const score      = Math.round((correct / QUESTIONS.length) * 100);

  dom.rsScore.textContent      = score;
  dom.rsCorrect.textContent    = correct;
  dom.rsWrong.textContent      = wrong;
  dom.rsUnanswered.textContent = unanswered;

  dom.resultScreen.classList.add('show');

  // Animate bar
  setTimeout(() => {
    dom.scoreBarFill.style.width = score + '%';
    dom.scoreBarLabel.textContent = score + '%';
  }, 300);

  // Animate counters
  animateCounters([
    {el: dom.rsScore, val: score},
    {el: dom.rsCorrect, val: correct},
    {el: dom.rsWrong, val: wrong},
    {el: dom.rsUnanswered, val: unanswered}
  ]);

  localStorage.setItem('eduvix_last_result', JSON.stringify({score, correct, wrong, unanswered, date: new Date().toISOString()}));
  localStorage.removeItem('eduvix_quiz_progress');
}

function animateCounters(items) {
  items.forEach(({el, val}) => {
    let cur = 0;
    const inc = Math.max(1, Math.ceil(val / 25));
    const t = setInterval(() => {
      cur = Math.min(cur + inc, val);
      el.textContent = cur;
      if (cur >= val) clearInterval(t);
    }, 35);
  });
}

// ========== REVIEW RESULT ==========
dom.reviewResultBtn.addEventListener('click', () => {
  dom.resultScreen.classList.remove('show');
  state.review = true;
  state.current = 0;
  renderQuestion();
  showToast('👁️ Mode review aktif — jawaban benar ditampilkan', 'info', 3000);
});

dom.retryBtn.addEventListener('click', () => {
  localStorage.removeItem('eduvix_quiz_progress');
  location.reload();
});

// ========== QUESTION MAP ==========
dom.reviewBtn.addEventListener('click', openQMap);
dom.qmapClose.addEventListener('click', closeQMap);
dom.qmapOverlay.addEventListener('click', e => { if (e.target === dom.qmapOverlay) closeQMap(); });
dom.qmapFinish.addEventListener('click', () => { closeQMap(); dom.finishBtn.click(); });

function buildQMap() {
  dom.qmapGrid.innerHTML = '';
  QUESTIONS.forEach((_, i) => {
    const btn = document.createElement('button');
    btn.className = 'qmap-num';
    btn.textContent = i + 1;
    btn.addEventListener('click', () => { state.current = i; renderQuestion(); closeQMap(); });
    dom.qmapGrid.appendChild(btn);
  });
  updateQMap();
}

function updateQMap() {
  const btns = dom.qmapGrid.querySelectorAll('.qmap-num');
  btns.forEach((btn, i) => {
    btn.className = 'qmap-num';
    if (i === state.current)               btn.classList.add('current');
    else if (state.marked.has(i))          btn.classList.add('marked');
    else if (state.answers[i] !== undefined) btn.classList.add('answered');
  });

  const answered   = Object.keys(state.answers).length;
  const marked     = state.marked.size;
  const unanswered = QUESTIONS.length - answered;
  dom.qmapSummary.innerHTML =
    `<span>Total: <span>${QUESTIONS.length}</span></span>
     <span>Dijawab: <span>${answered}</span></span>
     <span>Ditandai: <span>${marked}</span></span>
     <span>Belum: <span>${unanswered}</span></span>`;
}

function openQMap()  { dom.qmapOverlay.classList.add('show'); updateQMap(); }
function closeQMap() { dom.qmapOverlay.classList.remove('show'); }

// ========== TAMBAH SOAL ==========
let selectedCorrect = null; // index jawaban benar yang dipilih user

dom.addSoalBtn.addEventListener('click', openAddSoal);
dom.addSoalClose.addEventListener('click', closeAddSoal);
dom.addSoalCancel.addEventListener('click', closeAddSoal);
dom.addSoalOverlay.addEventListener('click', e => { if (e.target === dom.addSoalOverlay) closeAddSoal(); });

function openAddSoal() {
  selectedCorrect = null;
  dom.inputQuestion.value = '';
  dom.optionsInput.querySelectorAll('.opt-field').forEach(f => f.value = '');
  dom.optionsInput.querySelectorAll('.opt-row').forEach(r => r.classList.remove('is-correct'));
  dom.optionsInput.querySelectorAll('.opt-correct-toggle').forEach(b => {
    b.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
  });
  dom.addSoalOverlay.classList.add('show');
  setTimeout(() => dom.inputQuestion.focus(), 200);
}

function closeAddSoal() {
  dom.addSoalOverlay.classList.remove('show');
}

// Toggle jawaban benar
dom.optionsInput.querySelectorAll('.opt-correct-toggle').forEach(btn => {
  btn.addEventListener('click', () => {
    const idx = parseInt(btn.dataset.idx, 10);
    selectedCorrect = idx;

    // Reset semua
    dom.optionsInput.querySelectorAll('.opt-row').forEach(r => r.classList.remove('is-correct'));
    dom.optionsInput.querySelectorAll('.opt-correct-toggle').forEach(b => {
      b.innerHTML = '<i class="fa-regular fa-circle-check"></i>';
    });

    // Set yang dipilih
    btn.closest('.opt-row').classList.add('is-correct');
    btn.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
    showToast(`✓ Jawaban benar: Pilihan ${'ABCD'[idx]}`, 'success', 1500);
  });
});

dom.addSoalSave.addEventListener('click', () => {
  const questionText = dom.inputQuestion.value.trim();
  const fields = dom.optionsInput.querySelectorAll('.opt-field');
  const options = [...fields].map(f => f.value.trim());

  // Validasi
  if (!questionText) {
    showToast('⚠️ Pertanyaan tidak boleh kosong!', 'error'); return;
  }
  if (options.some(o => !o)) {
    showToast('⚠️ Semua pilihan jawaban harus diisi!', 'error'); return;
  }
  if (selectedCorrect === null) {
    showToast('⚠️ Pilih jawaban yang benar dulu!', 'error'); return;
  }

  // Tambahkan soal baru
  const newQ = {
    id: Date.now(),
    text: questionText,
    options: options,
    answer: selectedCorrect
  };

  QUESTIONS.push(newQ);
  saveQuestions(QUESTIONS);
  buildQMap(); // rebuild peta soal
  updateQMap();

  closeAddSoal();
  showToast(`🎉 Soal ke-${QUESTIONS.length} berhasil ditambahkan!`, 'success', 2500);

  // Langsung ke soal baru
  setTimeout(() => {
    state.current = QUESTIONS.length - 1;
    renderQuestion();
    updateQMap();
  }, 300);
});

// ========== KEYBOARD SHORTCUTS ==========
document.addEventListener('keydown', e => {
  if (state.done) return;
  if (['INPUT','TEXTAREA','SELECT'].includes(e.target.tagName)) return;

  switch(e.key) {
    case 'ArrowLeft':
      if (state.current > 0) { state.current--; renderQuestion(); updateQMap(); } break;
    case 'ArrowRight':
      if (state.current < QUESTIONS.length - 1) { state.current++; renderQuestion(); updateQMap(); } break;
    case '1': case '2': case '3': case '4':
      const idx = parseInt(e.key) - 1;
      if (!state.review && idx < QUESTIONS[state.current].options.length) selectOption(idx);
      break;
    case 'm': case 'M': dom.markBtn.click(); break;
    case 'Escape':
      if (dom.qmapOverlay.classList.contains('show')) closeQMap();
      if (dom.addSoalOverlay.classList.contains('show')) closeAddSoal();
      break;
  }
});

// ========== TOAST ==========
function showToast(msg, type = '', duration = 2000) {
  dom.toast.textContent = msg;
  dom.toast.className = 'toast show ' + type;
  clearTimeout(dom.toast._t);
  dom.toast._t = setTimeout(() => dom.toast.classList.remove('show'), duration);
}

// ========== LOCALSTORAGE ==========
function saveState() {
  const data = {
    current: state.current,
    answers: state.answers,
    marked:  [...state.marked],
    timer:   state.timer
  };
  localStorage.setItem('eduvix_quiz_progress', JSON.stringify(data));
}

function loadState() {
  const raw = localStorage.getItem('eduvix_quiz_progress');
  if (!raw) return;
  try {
    const d = JSON.parse(raw);
    state.current = d.current || 0;
    state.answers = d.answers || {};
    state.marked  = new Set(d.marked || []);
    state.timer   = d.timer  || QUIZ_CONFIG.duration;
  } catch(e) {}
}

function bindEvents() {
  // sudah di-bind di atas semua
}

// ========== START ==========
init();

// Hint shortcut setelah 4 detik
setTimeout(() => {
  const hints = ['⌨️ Tekan 1–4 untuk memilih jawaban','⌨️ ← → untuk navigasi soal','⌨️ M untuk mark soal'];
  let i = 0;
  const next = () => showToast(hints[i++ % hints.length], 'info', 2500);
  next();
  setInterval(next, 18000);
}, 4000);