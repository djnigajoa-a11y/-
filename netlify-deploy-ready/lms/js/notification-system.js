// ===================================
// 실시간 알림 클라이언트 JavaScript
// ===================================

class NotificationSystem {
    constructor() {
        this.socket = null;
        this.notifications = [];
        this.userId = null;
        this.init();
    }
    
    // 초기화
    init() {
        // Socket.IO 연결
        this.socket = io('http://localhost:5000', {
            transports: ['websocket'],
            upgrade: false
        });
        
        // 연결 이벤트
        this.socket.on('connect', () => {
            console.log('✅ Socket.IO 연결됨:', this.socket.id);
            
            // 사용자 정보 가져오기
            const userInfo = JSON.parse(localStorage.getItem('userInfo'));
            if (userInfo) {
                this.userId = userInfo.id;
                this.socket.emit('join-room', this.userId);
            }
        });
        
        // 알림 수신
        this.socket.on('notification', (data) => {
            this.handleNotification(data);
        });
        
        // 연결 해제
        this.socket.on('disconnect', () => {
            console.log('❌ Socket.IO 연결 해제');
        });
        
        // 로컬 스토리지에서 알림 불러오기
        this.loadNotifications();
        
        // UI 초기화
        this.initUI();
    }
    
    // 알림 처리
    handleNotification(data) {
        this.notifications.unshift(data);
        this.saveNotifications();
        this.renderNotifications();
        this.showToast(data);
        this.playSound();
        
        // 배지 업데이트
        this.updateBadge();
    }
    
    // 알림 로드
    loadNotifications() {
        const saved = localStorage.getItem('notifications');
        if (saved) {
            this.notifications = JSON.parse(saved);
        }
    }
    
    // 알림 저장
    saveNotifications() {
        localStorage.setItem('notifications', JSON.stringify(this.notifications));
    }
    
    // UI 초기화
    initUI() {
        // 알림 버튼 생성
        const notifBtn = document.createElement('button');
        notifBtn.id = 'notificationBtn';
        notifBtn.className = 'notification-btn';
        notifBtn.innerHTML = `
            <i class="fas fa-bell"></i>
            <span class="notification-badge" id="notificationBadge">0</span>
        `;
        notifBtn.addEventListener('click', () => this.togglePanel());
        
        // 알림 패널 생성
        const notifPanel = document.createElement('div');
        notifPanel.id = 'notificationPanel';
        notifPanel.className = 'notification-panel';
        notifPanel.innerHTML = `
            <div class="panel-header">
                <h3><i class="fas fa-bell"></i> 알림</h3>
                <button class="btn-mark-all-read" onclick="notificationSystem.markAllRead()">
                    <i class="fas fa-check-double"></i> 모두 읽음
                </button>
            </div>
            <div class="panel-body" id="notificationList">
                <!-- 동적 생성 -->
            </div>
        `;
        
        // DOM에 추가
        document.body.appendChild(notifBtn);
        document.body.appendChild(notifPanel);
        
        // 배지 업데이트
        this.updateBadge();
        
        // 알림 렌더링
        this.renderNotifications();
    }
    
    // 패널 토글
    togglePanel() {
        const panel = document.getElementById('notificationPanel');
        panel.classList.toggle('active');
    }
    
    // 알림 렌더링
    renderNotifications() {
        const container = document.getElementById('notificationList');
        if (!container) return;
        
        if (this.notifications.length === 0) {
            container.innerHTML = `
                <div class="empty-notifications">
                    <i class="fas fa-inbox"></i>
                    <p>알림이 없습니다</p>
                </div>
            `;
            return;
        }
        
        container.innerHTML = this.notifications.map((notif, index) => `
            <div class="notification-item ${notif.isRead ? 'read' : 'unread'}" 
                 onclick="notificationSystem.markRead(${index})">
                <div class="notif-icon ${notif.type}">
                    ${this.getIconByType(notif.type)}
                </div>
                <div class="notif-content">
                    <h4>${notif.title}</h4>
                    <p>${notif.message}</p>
                    <span class="notif-time">${this.formatTime(notif.timestamp)}</span>
                </div>
            </div>
        `).join('');
    }
    
    // 타입별 아이콘
    getIconByType(type) {
        const icons = {
            'assignment': '<i class="fas fa-tasks"></i>',
            'exam': '<i class="fas fa-file-alt"></i>',
            'grade': '<i class="fas fa-chart-line"></i>',
            'certificate': '<i class="fas fa-award"></i>',
            'course': '<i class="fas fa-book"></i>',
            'system': '<i class="fas fa-info-circle"></i>'
        };
        return icons[type] || icons['system'];
    }
    
    // 알림 읽음 처리
    markRead(index) {
        this.notifications[index].isRead = true;
        this.saveNotifications();
        this.renderNotifications();
        this.updateBadge();
        
        // 링크가 있으면 이동
        if (this.notifications[index].link) {
            window.location.href = this.notifications[index].link;
        }
    }
    
    // 모두 읽음 처리
    markAllRead() {
        this.notifications.forEach(notif => notif.isRead = true);
        this.saveNotifications();
        this.renderNotifications();
        this.updateBadge();
    }
    
    // 배지 업데이트
    updateBadge() {
        const badge = document.getElementById('notificationBadge');
        if (!badge) return;
        
        const unreadCount = this.notifications.filter(n => !n.isRead).length;
        badge.textContent = unreadCount;
        badge.style.display = unreadCount > 0 ? 'block' : 'none';
    }
    
    // 토스트 메시지 표시
    showToast(data) {
        const toast = document.createElement('div');
        toast.className = 'notification-toast';
        toast.innerHTML = `
            <div class="toast-icon ${data.type}">${this.getIconByType(data.type)}</div>
            <div class="toast-content">
                <h4>${data.title}</h4>
                <p>${data.message}</p>
            </div>
            <button class="toast-close" onclick="this.parentElement.remove()">
                <i class="fas fa-times"></i>
            </button>
        `;
        
        document.body.appendChild(toast);
        
        // 3초 후 자동 제거
        setTimeout(() => {
            toast.classList.add('fade-out');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    
    // 알림음 재생
    playSound() {
        const audio = new Audio('data:audio/wav;base64,UklGRnoGAABXQVZFZm10IBAAAAABAAEAQB8AAEAfAAABAAgAZGF0YQoGAACBhYqFbF1fdJivrJBhNjVgodDbq2EcBj+a2/LDciUFLIHO8tiJNwgZaLvt559NEAxQp+PwtmMcBjiR1/LMeSwFJHfH8N2QQAoUXrTp66hVFApGn+DyvmwhBSuB0PPWgDQGHnLH8N5tOwcbccvv1ogyCBxa%');
        audio.play().catch(e => console.log('알림음 재생 실패:', e));
    }
    
    // 시간 포맷
    formatTime(timestamp) {
        const now = new Date();
        const notifTime = new Date(timestamp);
        const diff = now - notifTime;
        
        const minutes = Math.floor(diff / 60000);
        const hours = Math.floor(diff / 3600000);
        const days = Math.floor(diff / 86400000);
        
        if (minutes < 1) return '방금 전';
        if (minutes < 60) return `${minutes}분 전`;
        if (hours < 24) return `${hours}시간 전`;
        if (days < 7) return `${days}일 전`;
        
        return notifTime.toLocaleDateString('ko-KR');
    }
    
    // 알림 전송 (테스트용)
    sendTestNotification() {
        const testNotif = {
            userId: this.userId,
            type: 'assignment',
            title: '새 과제가 등록되었습니다',
            message: 'AI 챗봇 프로토타입 개발 과제를 확인하세요',
            link: '/lms/pages/assignment-submit.html?id=1',
            timestamp: new Date().toISOString(),
            isRead: false
        };
        
        this.socket.emit('send-notification', testNotif);
    }
}

// 전역 인스턴스 생성
let notificationSystem;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', () => {
    notificationSystem = new NotificationSystem();
});
