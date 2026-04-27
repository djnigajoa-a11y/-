// 관리자 대시보드 메인 JavaScript
document.addEventListener('DOMContentLoaded', function() {
    initNavigation();
    initCharts();
    loadDashboardData();
});

function initNavigation() {
    const navItems = document.querySelectorAll('.nav-item');
    navItems.forEach(item => {
        item.addEventListener('click', function(e) {
            e.preventDefault();
            const section = this.getAttribute('data-section');
            switchSection(section);
        });
    });
}

function switchSection(sectionName) {
    document.querySelectorAll('.content-section').forEach(s => s.classList.remove('active'));
    document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
    document.getElementById(sectionName)?.classList.add('active');
    document.querySelector(`[data-section="${sectionName}"]`)?.classList.add('active');
    
    const titles = {
        'dashboard': '대시보드',
        'users': '사용자 관리',
        'courses': '과정 관리',
        'assignments': '과제 채점',
        'statistics': '통계 및 리포트'
    };
    document.getElementById('pageTitle').textContent = titles[sectionName] || '대시보드';
}

function initCharts() {
    const enrollmentCtx = document.getElementById('enrollmentChart');
    if (enrollmentCtx) {
        new Chart(enrollmentCtx, {
            type: 'line',
            data: {
                labels: ['월', '화', '수', '목', '금', '토', '일'],
                datasets: [{
                    label: '수강 신청',
                    data: [12, 19, 15, 25, 22, 30, 28],
                    borderColor: '#667eea',
                    tension: 0.4
                }]
            }
        });
    }
}

function loadDashboardData() {
    loadRecentUsers();
    loadNotifications();
}

function loadRecentUsers() {
    const tbody = document.getElementById('recentUsersTable');
    if (!tbody) return;
    
    const users = [
        { name: '김학생', email: 'student1@test.com', date: '2026-02-25', status: '활성' },
        { name: '이학생', email: 'student2@test.com', date: '2026-02-24', status: '활성' }
    ];
    
    tbody.innerHTML = users.map(u => `
        <tr>
            <td>${u.name}</td>
            <td>${u.email}</td>
            <td>${u.date}</td>
            <td><span class="badge success">${u.status}</span></td>
        </tr>
    `).join('');
}

function loadNotifications() {
    const container = document.getElementById('systemNotifications');
    if (!container) return;
    
    const notifications = [
        { type: 'info', message: '새로운 수강 신청 5건', time: '5분 전' },
        { type: 'warning', message: '채점 대기 중인 과제 23건', time: '1시간 전' }
    ];
    
    container.innerHTML = notifications.map(n => `
        <div class="notification-item">
            <i class="fas fa-${n.type === 'info' ? 'info-circle' : 'exclamation-triangle'}"></i>
            <div>
                <p>${n.message}</p>
                <span>${n.time}</span>
            </div>
        </div>
    `).join('');
}

function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        window.location.href = 'login.html';
    }
}
