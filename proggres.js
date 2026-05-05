// Progress Page Navigation
const sidebarLinks = document.querySelectorAll('.sidebar-link');
const progressSections = document.querySelectorAll('.progress-section');

sidebarLinks.forEach(link => {
    link.addEventListener('click', (e) => {
        e.preventDefault();
        
        const targetId = link.getAttribute('href').substring(1);
        
        // Remove active from all links
        sidebarLinks.forEach(l => l.classList.remove('active'));
        
        // Remove active from all sections
        progressSections.forEach(section => section.classList.remove('active'));
        
        // Add active to clicked link
        link.classList.add('active');
        
        // Add active to target section
        const targetSection = document.getElementById(targetId);
        if (targetSection) {
            targetSection.classList.add('active');
            window.scrollTo(0, 0);
        }
    });
});

// Progress Data Management
class ProgressManager {
    constructor() {
        this.storageKey = 'progressData';
        this.loadData();
    }
    
    loadData() {
        const stored = localStorage.getItem(this.storageKey);
        this.data = stored ? JSON.parse(stored) : this.getDefaultData();
    }
    
    getDefaultData() {
        return {
            completedLessons: [],
            studyTime: 0, // in minutes
            studyDays: 0,
            lessonProgress: {
                1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0
            },
            dailyActivity: {
                monday: 0,
                tuesday: 0,
                wednesday: 0,
                thursday: 0,
                friday: 0,
                saturday: 0,
                sunday: 0
            },
            performance: {
                understanding: 0,
                speed: 0,
                consistency: 0
            }
        };
    }
    
    saveData() {
        localStorage.setItem(this.storageKey, JSON.stringify(this.data));
    }
    
    addCompletedLesson(lessonNumber) {
        if (!this.data.completedLessons.includes(lessonNumber)) {
            this.data.completedLessons.push(lessonNumber);
            this.saveData();
        }
    }
    
    updateLessonProgress(lessonNumber, progress) {
        this.data.lessonProgress[lessonNumber] = Math.min(progress, 100);
        this.saveData();
    }
    
    addStudyTime(minutes) {
        this.data.studyTime += minutes;
        this.saveData();
    }
    
    getOverallProgress() {
        const totalProgress = Object.values(this.data.lessonProgress).reduce((a, b) => a + b, 0);
        return Math.round(totalProgress / 6);
    }
    
    getCompletedCount() {
        return this.data.completedLessons.length;
    }
}

const progressManager = new ProgressManager();

// Initialize Progress Display
function initializeProgressDisplay() {
    updateOverviewSection();
    updateDetailedProgress();
    updateStatistics();
    updateMilestones();
}

// Update Overview Section
function updateOverviewSection() {
    const overallProgress = progressManager.getOverallProgress();
    const completedCount = progressManager.getCompletedCount();
    const totalTime = progressManager.data.studyTime;
    
    // Update circular progress
    const progressCircle = document.querySelector('.progress-circle');
    if (progressCircle) {
        const circumference = 2 * Math.PI * 110;
        const offset = circumference - (overallProgress / 100) * circumference;
        progressCircle.style.strokeDashoffset = offset;
        
        // Update text
        const progressValue = document.querySelector('.progress-value');
        const progressSubtitle = document.querySelector('.overview-subtitle');
        
        if (progressValue) progressValue.textContent = overallProgress;
        if (progressSubtitle) progressSubtitle.textContent = `${completedCount} dari 6 materi selesai`;
    }
    
    // Update stat cards
    const statItems = document.querySelectorAll('.stat-item');
    if (statItems.length >= 3) {
        // Total time
        const hours = Math.floor(totalTime / 60);
        const minutes = totalTime % 60;
        const timeText = `${hours} jam ${minutes} menit`;
        const timeValue = statItems[0].querySelector('.stat-value');
        if (timeValue) timeValue.textContent = timeText;
        
        // Completed lessons
        const completedValue = statItems[1].querySelector('.stat-value');
        if (completedValue) completedValue.textContent = `${completedCount} dari 6`;
        
        // Study days
        const daysValue = statItems[2].querySelector('.stat-value');
        if (daysValue) daysValue.textContent = `${progressManager.data.studyDays} hari`;
    }
    
    // Update progress bars in stat items
    const statBars = document.querySelectorAll('.stat-bar-fill');
    if (statBars.length >= 3) {
        statBars[0].style.width = (totalTime / 1200) * 100 + '%'; // 20 hours = 1200 minutes
        statBars[1].style.width = (completedCount / 6) * 100 + '%';
        statBars[2].style.width = (progressManager.data.studyDays / 30) * 100 + '%';
    }
}

// Update Detailed Progress
function updateDetailedProgress() {
    const lessonItems = document.querySelectorAll('.lesson-progress-item');
    
    lessonItems.forEach((item, index) => {
        const lessonNumber = index + 1;
        const progress = progressManager.data.lessonProgress[lessonNumber];
        
        // Update percentage
        const percentElement = item.querySelector('.lesson-progress-percentage');
        if (percentElement) percentElement.textContent = progress + '%';
        
        // Update progress bar
        const progressFill = item.querySelector('.progress-bar-fill');
        if (progressFill) progressFill.style.width = progress + '%';
    });
}

// Update Statistics
function updateStatistics() {
    // Update activity chart
    const activityBars = document.querySelectorAll('.bar');
    const maxActivity = 100;
    
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    
    activityBars.forEach((bar, index) => {
        const dayActivity = progressManager.data.dailyActivity[days[index]] || 0;
        const percentage = (dayActivity / maxActivity) * 100;
        bar.style.height = Math.max(percentage, 5) + '%';
    });
    
    // Update time stats
    const totalTime = progressManager.data.studyTime;
    const hours = Math.floor(totalTime / 60);
    const avgTime = Math.round(totalTime / 7); // Average per day
    
    const timeStats = document.querySelectorAll('.time-value');
    if (timeStats.length >= 3) {
        timeStats[0].textContent = avgTime + ' menit';
        timeStats[1].textContent = hours + ' jam';
    }
    
    // Update performance
    const performanceFills = document.querySelectorAll('.performance-fill');
    const performanceValues = document.querySelectorAll('.performance-value');
    
    if (performanceFills.length >= 3) {
        performanceFills[0].style.width = progressManager.data.performance.understanding + '%';
        performanceFills[1].style.width = progressManager.data.performance.speed + '%';
        performanceFills[2].style.width = progressManager.data.performance.consistency + '%';
    }
    
    if (performanceValues.length >= 3) {
        performanceValues[0].textContent = progressManager.data.performance.understanding + '%';
        performanceValues[1].textContent = progressManager.data.performance.speed + '%';
        performanceValues[2].textContent = progressManager.data.performance.consistency + '%';
    }
}

// Update Milestones
function updateMilestones() {
    const milestones = document.querySelectorAll('.milestone-marker');
    const completedCount = progressManager.getCompletedCount();
    
    // Mark milestones as completed
    milestones[0].classList.add('completed'); // Start milestone always completed
    
    if (completedCount >= 1) milestones[1].classList.add('completed'); // First lesson
    if (completedCount >= 2) milestones[2].classList.add('completed'); // Quarter
    if (completedCount >= 3) milestones[3].classList.add('completed'); // Half
    if (completedCount >= 5) milestones[4].classList.add('completed'); // Three quarters
    if (completedCount === 6) milestones[5].classList.add('completed'); // Complete
}

// Simulate progress update for demo
function simulateProgress() {
    // Add random progress to lessons
    for (let i = 1; i <= 6; i++) {
        const randomProgress = Math.floor(Math.random() * 100);
        progressManager.updateLessonProgress(i, randomProgress);
    }
    
    // Add study time
    progressManager.addStudyTime(Math.floor(Math.random() * 120));
    
    // Update daily activity
    const days = ['monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday', 'sunday'];
    days.forEach(day => {
        progressManager.data.dailyActivity[day] = Math.floor(Math.random() * 100);
    });
    
    // Update performance
    progressManager.data.performance = {
        understanding: Math.floor(Math.random() * 100),
        speed: Math.floor(Math.random() * 100),
        consistency: Math.floor(Math.random() * 100)
    };
    
    progressManager.data.studyDays = Math.floor(Math.random() * 20);
    
    // Add completed lessons
    const completedCount = Math.floor(Math.random() * 4);
    for (let i = 1; i <= completedCount; i++) {
        progressManager.addCompletedLesson(i);
    }
    
    progressManager.saveData();
    initializeProgressDisplay();
}

// Notification System
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

// Intersection Observer for animations
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
    // Initialize progress display
    initializeProgressDisplay();
    
    // Set up animations
    document.querySelectorAll('.lesson-progress-item, .statistic-card, .overview-card').forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = 'translateY(20px)';
        el.style.transition = `all 0.5s ease-out ${index * 0.08}s`;
        animateOnScroll.observe(el);
    });
    
    // Demo: Add some test data if localStorage is empty
    if (localStorage.getItem('progressData') === null) {
        simulateProgress();
    }
    
    console.log('Progress page initialized');
    console.log('Current progress:', progressManager.getOverallProgress() + '%');
});

// Export for external use
window.progressManager = progressManager;
window.showProgressNotification = showNotification;