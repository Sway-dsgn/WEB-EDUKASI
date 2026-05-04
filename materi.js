// Get lesson number from URL
function getLessonFromURL() {
    const params = new URLSearchParams(window.location.search);
    return params.get('lesson') || '1';
}

// Lesson Data
const lessonData = {
    1: { title: 'Pengantar Berpikir Kritis', duration: '45 menit', difficulty: 'Pemula' },
    2: { title: 'Identifikasi Argumen', duration: '60 menit', difficulty: 'Menengah' },
    3: { title: 'Logical Fallacies', duration: '55 menit', difficulty: 'Menengah' },
    4: { title: 'Cognitive Biases', duration: '50 menit', difficulty: 'Menengah' },
    5: { title: 'Evaluasi Sumber Informasi', duration: '65 menit', difficulty: 'Menengah' },
    6: { title: 'Pengambilan Keputusan Rasional', duration: '70 menit', difficulty: 'Lanjut' }
};

// Show/Hide lesson content
function showLesson(lessonNumber) {
    // Hide all lessons
    document.querySelectorAll('.lesson').forEach(lesson => {
        lesson.style.display = 'none';
    });
    
    // Show selected lesson
    const selectedLesson = document.getElementById(`lesson-${lessonNumber}`);
    if (selectedLesson) {
        selectedLesson.style.display = 'block';
        window.scrollTo(0, 0);
    }
    
    // Update sidebar active state
    document.querySelectorAll('.lesson-nav-item').forEach(item => {
        item.classList.remove('active');
    });
    
    const activeLink = document.querySelector(`.lesson-nav-item[data-lesson="${lessonNumber}"]`);
    if (activeLink) {
        activeLink.classList.add('active');
    }
    
    // Update progress bar
    updateProgress(lessonNumber);
    
    // Update navigation buttons
    updateNavigationButtons(lessonNumber);
}

// Update progress bar
function updateProgress(lessonNumber) {
    const progress = (lessonNumber / 6) * 100;
    const progressFill = document.querySelector('.progress-fill');
    if (progressFill) {
        progressFill.style.width = progress + '%';
    }
    
    const progressText = document.querySelector('.lesson-progress-text');
    if (progressText) {
        progressText.textContent = Math.round(progress) + '% selesai';
    }
}

// Update navigation buttons
function updateNavigationButtons(lessonNumber) {
    const prevButtons = document.querySelectorAll('[id^="prev-btn"]');
    const nextButtons = document.querySelectorAll('[id^="next-btn"]');
    
    prevButtons.forEach(btn => {
        btn.disabled = lessonNumber === '1';
    });
    
    nextButtons.forEach(btn => {
        if (lessonNumber === '6') {
            btn.textContent = 'Selesai';
            btn.onclick = () => {
                markLessonComplete(lessonNumber);
            };
        } else {
            btn.textContent = 'Materi Berikutnya';
        }
    });
}

// Navigation button handlers
function setupNavigationButtons() {
    const lessonNumber = getLessonFromURL();
    
    // Previous buttons
    document.querySelectorAll('[id^="prev-btn"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentLesson = parseInt(lessonNumber);
            if (currentLesson > 1) {
                const previousLesson = currentLesson - 1;
                window.location.href = `materi.html?lesson=${previousLesson}`;
            }
        });
    });
    
    // Next buttons
    document.querySelectorAll('[id^="next-btn"]').forEach(btn => {
        btn.addEventListener('click', () => {
            const currentLesson = parseInt(lessonNumber);
            if (currentLesson < 6) {
                const nextLesson = currentLesson + 1;
                markLessonComplete(currentLesson);
                window.location.href = `materi.html?lesson=${nextLesson}`;
            } else if (currentLesson === 6) {
                markLessonComplete(currentLesson);
            }
        });
    });
}

// Mark lesson as complete
function markLessonComplete(lessonNumber) {
    // Save to localStorage
    const completedLessons = JSON.parse(localStorage.getItem('completedLessons') || '[]');
    if (!completedLessons.includes(parseInt(lessonNumber))) {
        completedLessons.push(parseInt(lessonNumber));
        localStorage.setItem('completedLessons', JSON.stringify(completedLessons));
    }
    
    showNotification(`Materi ${lessonNumber} sudah selesai! Hebat!`);
}

// Sidebar navigation
function setupSidebarNavigation() {
    document.querySelectorAll('.lesson-nav-item').forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const lessonNumber = link.getAttribute('data-lesson');
            window.location.href = `materi.html?lesson=${lessonNumber}`;
        });
    });
}

// Feedback buttons
function setupFeedbackButtons() {
    const feedbackHelpful = document.querySelector('.feedback-helpful');
    const feedbackNotHelpful = document.querySelector('.feedback-notHelpful');
    const currentLesson = getLessonFromURL();
    
    if (feedbackHelpful) {
        feedbackHelpful.addEventListener('click', () => {
            saveFeedback(currentLesson, 'helpful');
            showNotification('Terima kasih atas feedback Anda! Kami senang materi ini membantu.');
        });
    }
    
    if (feedbackNotHelpful) {
        feedbackNotHelpful.addEventListener('click', () => {
            saveFeedback(currentLesson, 'notHelpful');
            showNotification('Terima kasih atas masukan Anda. Kami akan meningkatkan materi ini.');
        });
    }
}

// Save feedback
function saveFeedback(lesson, feedback) {
    const feedbackData = JSON.parse(localStorage.getItem('feedbackData') || '{}');
    feedbackData[`lesson_${lesson}`] = feedback;
    localStorage.setItem('feedbackData', JSON.stringify(feedbackData));
}

// Notification system
function showNotification(message) {
    const existingNotification = document.querySelector('.notification');
    if (existingNotification) {
        existingNotification.remove();
    }
    
    const notification = document.createElement('div');
    notification.className = 'notification';
    notification.textContent = message;
    
    notification.style.cssText = `
        position: fixed;
        bottom: 2rem;
        right: 2rem;
        background-color: #1a1a1a;
        color: white;
        padding: 1rem 1.5rem;
        border-radius: 0.5rem;
        box-shadow: 0 8px 24px rgba(0, 0, 0, 0.15);
        z-index: 10000;
        animation: slideInUp 0.3s ease-out;
        max-width: 300px;
        font-weight: 500;
    `;
    
    if (!document.querySelector('#notificationStyles')) {
        const style = document.createElement('style');
        style.id = 'notificationStyles';
        style.textContent = `
            @keyframes slideInUp {
                from {
                    transform: translateY(100%);
                    opacity: 0;
                }
                to {
                    transform: translateY(0);
                    opacity: 1;
                }
            }
            @keyframes slideOutDown {
                from {
                    transform: translateY(0);
                    opacity: 1;
                }
                to {
                    transform: translateY(100%);
                    opacity: 0;
                }
            }
        `;
        document.head.appendChild(style);
    }
    
    document.body.appendChild(notification);
    
    setTimeout(() => {
        notification.style.animation = 'slideOutDown 0.3s ease-out';
        setTimeout(() => {
            notification.remove();
        }, 300);
    }, 3000);
}

// Quiz functionality
function setupQuizFunctionality() {
    document.querySelectorAll('.quiz-item').forEach(item => {
        const radios = item.querySelectorAll('input[type="radio"]');
        radios.forEach(radio => {
            radio.addEventListener('change', () => {
                const answer = item.querySelector('.quiz-answer');
                if (answer) {
                    answer.style.display = 'block';
                }
            });
        });
    });
}

// Initialize reading time
function updateReadingTime() {
    const currentLesson = getLessonFromURL();
    const lessonInfo = lessonData[currentLesson];
    if (lessonInfo) {
        console.log(`Materi ${currentLesson}: ${lessonInfo.title} - ${lessonInfo.duration}`);
    }
}

// Intersection Observer for scroll animations
const observerOptions = {
    threshold: 0.1,
    rootMargin: '0px 0px -50px 0px'
};

const animateOnScroll = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
        if (entry.isIntersecting) {
            entry.target.style.opacity = '1';
            entry.target.style.transform = 'translateY(0)';
        }
    });
}, observerOptions);

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', () => {
    const currentLesson = getLessonFromURL();
    
    showLesson(currentLesson);
    setupNavigationButtons();
    setupSidebarNavigation();
    setupFeedbackButtons();
    setupQuizFunctionality();
    updateReadingTime();
    
    // Observe lesson sections for animations
    document.querySelectorAll('.lesson-section').forEach((section, index) => {
        section.style.opacity = '0';
        section.style.transform = 'translateY(10px)';
        section.style.transition = `all 0.5s ease-out ${index * 0.1}s`;
        animateOnScroll.observe(section);
    });
    
    console.log('Lesson page initialized');
});

// Handle page visibility change for tracking
document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        console.log('User kembali ke halaman materi');
    }
});