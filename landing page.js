// ══════════════════════════════
//  ICON SLIDER
// ══════════════════════════════
const track  = document.getElementById('track');
const cards  = track.querySelectorAll('.slider-card');
const CARD_W = 130 + 20; // card width + gap
let current  = 0;

function visibleCount() {
  return Math.floor(track.parentElement.offsetWidth / CARD_W);
}

function maxIndex() {
  return Math.max(0, cards.length - visibleCount());
}

function slide(dir) {
  current = Math.max(0, Math.min(current + dir, maxIndex()));
  track.style.transform = `translateX(-${current * CARD_W}px)`;
}

document.getElementById('prev').addEventListener('click', () => slide(-2));
document.getElementById('next').addEventListener('click', () => slide(2));

// Reset on resize so cards don't get stranded
window.addEventListener('resize', () => {
  current = Math.min(current, maxIndex());
  track.style.transform = `translateX(-${current * CARD_W}px)`;
});

// ══════════════════════════════
//  STAGGERED FADE-IN ON LOAD
// ══════════════════════════════
const fadeEls = document.querySelectorAll('.class-card, .slider-card, .community');

fadeEls.forEach((el, i) => {
  el.style.opacity   = '0';
  el.style.transform = (el.style.transform || '') + ' translateY(20px)';
  el.style.transition = 'opacity .5s ease, transform .5s ease';

  setTimeout(() => {
    el.style.opacity   = '1';
    el.style.transform = el.style.transform.replace('translateY(20px)', 'translateY(0)');
  }, 200 + i * 80);
});