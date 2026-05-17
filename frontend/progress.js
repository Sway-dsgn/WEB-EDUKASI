// ===========================
// EDUVIX.ID – Premium Minimalist Progress
// ===========================

document.addEventListener('DOMContentLoaded', () => {

    // 1. SYNC GLOBAL UI
    if (typeof eduvixUpdateUI === 'function') {
        eduvixUpdateUI();
    }

    // 2. REVEAL ANIMATIONS
    const revealEls = document.querySelectorAll('.white-box, .lesson-item, .badge-item');
    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, i) => {
            if (entry.isIntersecting) {
                setTimeout(() => {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                    if (entry.target.classList.contains('badge-item')) {
                        entry.target.style.transform = 'scale(1)';
                    }
                }, i * 40);
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealEls.forEach(el => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = 'all 0.5s cubic-bezier(0.22, 1, 0.36, 1)';
        observer.observe(el);
    });

    // 3. PROGRESS DATA SYNC
    const syncProgressData = () => {
        const user = typeof eduvixGetUser === 'function' ? eduvixGetUser() : null;
        if (!user) return;

        const totalMateri = 6;
        const done = (user.materiSelesai || []).length;
        const pct = Math.round((done / totalMateri) * 100);

        // Update Percentage & Count
        const progPct = document.getElementById('progPct');
        const doneCount = document.getElementById('doneCount');
        if (progPct) progPct.innerText = pct;
        if (doneCount) doneCount.innerText = done;

        // Update SVG Circle
        const circle = document.getElementById('progCircle');
        if (circle) {
            const r = circle.getAttribute('r');
            const circ = 2 * Math.PI * r;
            circle.style.strokeDasharray = circ;
            circle.style.strokeDashoffset = circ - (pct / 100) * circ;
        }

        // Lesson Items Sync
        const lessonItems = document.querySelectorAll('.lesson-item');
        lessonItems.forEach((item, i) => {
            const id = (i + 1).toString();
            const isDone = (user.materiSelesai || []).includes(id);
            const isUnl = i < (user.unlockedLesson || 1);

            if (isDone) {
                item.classList.remove('locked');
                item.classList.add('active');
                const status = item.querySelector('.l-status');
                if (status) status.innerHTML = '<i class="fa-solid fa-circle-check"></i>';
            } else if (isUnl) {
                item.classList.remove('locked');
                item.classList.add('active');
                const status = item.querySelector('.l-status');
                if (status) status.innerHTML = '<i class="fa-solid fa-play" style="font-size:14px;"></i>';
            } else {
                item.classList.add('locked');
                const status = item.querySelector('.l-status');
                if (status) status.innerHTML = '';
            }
        });

        // Earned Badges (if in this page)
        const badges = document.querySelectorAll('.badge-item');
        badges.forEach((b, i) => {
            if (i < done) b.classList.add('earned');
        });
    };

    syncProgressData();
});