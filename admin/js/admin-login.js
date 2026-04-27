// 관리자 로그인 처리
document.addEventListener('DOMContentLoaded', function() {
    const loginForm = document.getElementById('adminLoginForm');
    const alertMessage = document.getElementById('alertMessage');

    // 기본 관리자 계정 (실제 운영시에는 백엔드로 이동 필요)
    const ADMIN_CREDENTIALS = {
        username: 'admin',
        password: 'axinova2026'
    };

    // 세션 체크
    checkExistingSession();

    // 로그인 폼 제출
    loginForm.addEventListener('submit', function(e) {
        e.preventDefault();
        handleLogin();
    });

    function handleLogin() {
        const username = document.getElementById('adminUsername').value.trim();
        const password = document.getElementById('adminPassword').value;
        const rememberMe = document.getElementById('rememberMe').checked;

        // 입력 검증
        if (!username || !password) {
            showAlert('모든 필드를 입력해주세요.', 'error');
            return;
        }

        // 로그인 인증
        if (username === ADMIN_CREDENTIALS.username && password === ADMIN_CREDENTIALS.password) {
            // 세션 생성
            const sessionData = {
                username: username,
                loginTime: new Date().toISOString(),
                rememberMe: rememberMe
            };

            // 세션 저장
            if (rememberMe) {
                localStorage.setItem('adminSession', JSON.stringify(sessionData));
            } else {
                sessionStorage.setItem('adminSession', JSON.stringify(sessionData));
            }

            // 성공 메시지
            showAlert('로그인 성공! 관리자 페이지로 이동합니다...', 'success');

            // 대시보드로 리다이렉트
            setTimeout(() => {
                window.location.href = 'dashboard.html';
            }, 1000);
        } else {
            showAlert('아이디 또는 비밀번호가 올바르지 않습니다.', 'error');
            
            // 비밀번호 필드 초기화
            document.getElementById('adminPassword').value = '';
            document.getElementById('adminPassword').focus();
        }
    }

    function showAlert(message, type) {
        alertMessage.textContent = message;
        alertMessage.className = `alert-message ${type}`;
        alertMessage.style.display = 'flex';

        // 아이콘 추가
        const icon = document.createElement('i');
        icon.className = type === 'success' ? 'fas fa-check-circle' : 'fas fa-exclamation-circle';
        alertMessage.insertBefore(icon, alertMessage.firstChild);

        // 에러 메시지는 자동으로 사라지도록
        if (type === 'error') {
            setTimeout(() => {
                alertMessage.style.display = 'none';
            }, 5000);
        }
    }

    function checkExistingSession() {
        const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
        
        if (sessionData) {
            try {
                const session = JSON.parse(sessionData);
                const loginTime = new Date(session.loginTime);
                const now = new Date();
                const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

                // 세션이 24시간 이내이면 자동 로그인
                if (hoursSinceLogin < 24) {
                    showAlert('기존 세션이 확인되었습니다. 관리자 페이지로 이동합니다...', 'success');
                    setTimeout(() => {
                        window.location.href = 'dashboard.html';
                    }, 1000);
                } else {
                    // 만료된 세션 삭제
                    localStorage.removeItem('adminSession');
                    sessionStorage.removeItem('adminSession');
                }
            } catch (e) {
                console.error('세션 파싱 오류:', e);
            }
        }
    }
});

// 비밀번호 표시/숨김 토글
function togglePassword() {
    const passwordInput = document.getElementById('adminPassword');
    const toggleBtn = document.querySelector('.toggle-password i');
    
    if (passwordInput.type === 'password') {
        passwordInput.type = 'text';
        toggleBtn.className = 'fas fa-eye-slash';
    } else {
        passwordInput.type = 'password';
        toggleBtn.className = 'fas fa-eye';
    }
}

// Enter 키 처리
document.addEventListener('keypress', function(e) {
    if (e.key === 'Enter') {
        const loginForm = document.getElementById('adminLoginForm');
        if (loginForm) {
            loginForm.dispatchEvent(new Event('submit'));
        }
    }
});
