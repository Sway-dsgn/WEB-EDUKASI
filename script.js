// ===========================
//  EDUVIX.ID – Dashboard JS
// ===========================

// ── Tab Filter ──────────────────────────────────────────────
function filterTab(btn, status) {
  // Update active tab
  document.querySelectorAll('.tab').forEach(t => t.classList.remove('active'));
  btn.classList.add('active');

  const cards = document.querySelectorAll('.exam-card');

  cards.forEach((card, i) => {
    const cardStatus = card.getAttribute('data-status');
    const show = (status === 'semua') || (cardStatus === status);

    if (show) {
      card.classList.remove('hidden');
      // Stagger animation
      card.style.animation = 'none';
      card.offsetHeight; // reflow
      card.style.animation = '';
      card.style.animationDelay = `${i * 0.05}s`;
    } else {
      card.classList.add('hidden');
    }
  });
}

// ── Modal: Buat Ujian Baru ───────────────────────────────────
function handleCreate() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.add('open');
}

function closeModal() {
  const overlay = document.getElementById('modalOverlay');
  overlay.classList.remove('open');
}

// Close modal when clicking backdrop
document.getElementById('modalOverlay').addEventListener('click', function (e) {
  if (e.target === this) closeModal();
});

// Close modal with Escape key
document.addEventListener('keydown', function (e) {
  if (e.key === 'Escape') closeModal();
});

// ── Exam Actions ────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {

  // Delete exam card with confirmation
  document.querySelectorAll('.btn-icon.delete').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.exam-card');
      const title = card.querySelector('h3').textContent;
      if (confirm(`Hapus ujian "${title}"?`)) {
        card.style.transition = 'opacity 0.3s, transform 0.3s';
        card.style.opacity = '0';
        card.style.transform = 'translateX(20px)';
        setTimeout(() => card.remove(), 320);
      }
    });
  });

  // Edit button (placeholder)
  document.querySelectorAll('.btn-icon.edit').forEach(btn => {
    btn.addEventListener('click', (e) => {
      const card = btn.closest('.exam-card');
      const title = card.querySelector('h3').textContent;
      alert(`Edit: ${title}\n(Fitur edit akan tersedia segera)`);
    });
  });

  // Nav item click
  document.querySelectorAll('.nav-item').forEach(item => {
    item.addEventListener('click', (e) => {
      document.querySelectorAll('.nav-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Schedule item click
  document.querySelectorAll('.schedule-item').forEach(item => {
    item.addEventListener('click', () => {
      document.querySelectorAll('.schedule-item').forEach(i => i.classList.remove('active'));
      item.classList.add('active');
    });
  });

  // Modal option click
  document.querySelectorAll('.modal-option').forEach(opt => {
    opt.addEventListener('click', () => {
      const text = opt.querySelector('span').textContent;
      alert(`Dipilih: ${text}\n(Fitur ini akan segera tersedia)`);
      closeModal();
    });
  });

  // Search live filter
  const searchInput = document.querySelector('.search-box input');
  searchInput.addEventListener('input', () => {
    const query = searchInput.value.toLowerCase();
    document.querySelectorAll('.exam-card').forEach(card => {
      const title = card.querySelector('h3').textContent.toLowerCase();
      const topic = card.querySelector('p').textContent.toLowerCase();
      const match = title.includes(query) || topic.includes(query);
      card.classList.toggle('hidden', !match);
    });
  });
});