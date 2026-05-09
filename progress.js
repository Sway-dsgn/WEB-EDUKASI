// ===========================
// EDUVIX.ID – Progress JS
// ===========================

document.addEventListener('DOMContentLoaded', () => {

    // 1. SYNC USER DATA (Coins, Avatar, Name)
    if (typeof eduvixUpdateUI === 'function') {
        eduvixUpdateUI();
    }

    // 2. SECTION SWITCHING (For Pencapaian Page)
    const sidebarLinks = document.querySelectorAll('.sidebar-link');
    const sections = document.querySelectorAll('.achievement-section');

    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const targetId = link.getAttribute('href').substring(1);

            // Update links
            sidebarLinks.forEach(l => l.classList.remove('active'));
            link.classList.add('active');

            // Update sections
            sections.forEach(section => {
                section.classList.remove('active');
                if (section.id === targetId) {
                    section.classList.add('active');
                    // Re-animate if it's leaderboard or stats
                    if (targetId === 'leaderboard') renderLeaderboard();
                    if (targetId === 'stats') updateStatsFromStorage();
                }
            });
        });
    });

    // 3. REVEAL & ANIMATE LOGIC
    const revealEls = document.querySelectorAll('.reveal');

    const animateElement = (el) => {
        // Animate Numbers
        const counters = el.querySelectorAll('.stat-value');
        counters.forEach(counter => animateNumber(counter));

        // Animate Progress Bars
        const progressBars = el.querySelectorAll('.stat-progress-fill, .progress-bar-small, .fill');
        progressBars.forEach(bar => {
            const targetWidth = bar.getAttribute('data-target-width') || bar.style.width;
            bar.style.width = '0%';
            setTimeout(() => {
                bar.style.transition = 'width 1.5s cubic-bezier(0.4, 0, 0.2, 1)';
                bar.style.width = targetWidth;
            }, 100);
        });
    };

    const animateNumber = (el) => {
        const target = parseFloat(el.innerText);
        if (isNaN(target)) return;

        let current = 0;
        const duration = 1500; // 1.5 seconds
        const startTime = performance.now();

        const update = (now) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);

            // Ease out quad
            const easeProgress = progress * (2 - progress);

            const value = easeProgress * target;
            el.innerText = target % 1 === 0 ? Math.floor(value) : value.toFixed(1);

            if (progress < 1) {
                requestAnimationFrame(update);
            } else {
                el.innerText = target;
            }
        };

        requestAnimationFrame(update);
    };

    if ('IntersectionObserver' in window) {
        const revealObserver = new IntersectionObserver((entries) => {
            entries.forEach((entry) => {
                if (entry.isIntersecting) {
                    entry.target.classList.add('visible');
                    animateElement(entry.target);
                    revealObserver.unobserve(entry.target);
                }
            });
        }, { threshold: 0.1 });

        revealEls.forEach(el => revealObserver.observe(el));
    } else {
        revealEls.forEach(el => {
            el.classList.add('visible');
            animateElement(el);
        });
    }

    // 3. DYNAMIC PROGRESS SYNC
    const updateStatsFromStorage = () => {
        // Ambil data user asli dari jalan.js system
        const user = typeof eduvixGetUser === 'function' ? eduvixGetUser() : null;
        if (!user) return;

        const totalMateri = 6; // Total materi di kurikulum
        const selesaiCount = (user.materiSelesai || []).length;
        const progressPercent = Math.round((selesaiCount / totalMateri) * 100);

        const overallEl = document.getElementById('overallPercent');
        if (overallEl) {
            overallEl.innerText = progressPercent;
            // Kita panggil ulang animateNumber untuk memastikannya jalan dari 0 ke nilai asli
            animateNumber(overallEl);
        }

        const mainFill = document.querySelector('.stat-progress-fill');
        if (mainFill) {
            mainFill.style.width = '0%';
            setTimeout(() => {
                mainFill.style.transition = 'width 2s cubic-bezier(0.4, 0, 0.2, 1)';
                mainFill.style.width = progressPercent + '%';
            }, 500);
        }

        // Update Tabel Materi secara dinamis
        const lessonRows = document.querySelectorAll('.lesson-row:not(.header-row)');
        lessonRows.forEach((row, index) => {
            const lessonId = (index + 1).toString();
            const isSelesai = (user.materiSelesai || []).includes(lessonId);
            const isUnlocked = index < (user.unlockedLesson || 1);

            const statusBadge = row.querySelector('.status-badge');
            const progressBar = row.querySelector('.fill');

            if (isSelesai) {
                statusBadge.className = 'status-badge success';
                statusBadge.innerText = 'Selesai';
                if (progressBar) progressBar.style.width = '100%';
            } else if (isUnlocked) {
                statusBadge.className = 'status-badge warning';
                statusBadge.innerText = 'Tersedia';
                if (progressBar) progressBar.style.width = '0%';
            } else {
                statusBadge.className = 'status-badge locked';
                statusBadge.innerHTML = '<i class="fa-solid fa-lock"></i> Terkunci';
                if (progressBar) progressBar.style.width = '0%';
                row.style.opacity = '0.6';
            }
        });
        // Update Badge Count di Pencapaian
        const badgeCountEl = document.querySelector('.badge-gallery .stat-value');
        if (badgeCountEl) {
            const earnedBadges = document.querySelectorAll('.badge-card.earned').length;
            badgeCountEl.innerText = earnedBadges;
            animateNumber(badgeCountEl);
        }
    };

    // 4. LEADERBOARD RENDERER
    const renderLeaderboard = () => {
        const leaderboardList = document.querySelector('.leaderboard-list');
        if (!leaderboardList) return;

        const data = typeof eduvixGetLeaderboard === 'function' ? eduvixGetLeaderboard() : [];

        leaderboardList.innerHTML = '';

        data.forEach((user, index) => {
            const item = document.createElement('div');
            item.className = `leaderboard-item ${user.isMe ? 'your-rank' : ''}`;

            item.innerHTML = `
                <span class="rank-col">${index + 1}</span>
                <span class="name-col">
                    ${user.isMe ? '<span class="your-badge">Kamu</span>' : ''}
                    <span>${user.nama}</span>
                </span>
                <span class="score-col">${user.xp} XP</span>
                <span class="badges-col">${user.level}</span>
            `;
            leaderboardList.appendChild(item);
        });
    };

    updateStatsFromStorage();
    renderLeaderboard();
});