// 관리자 인증 체크 (모든 관리자 페이지에서 사용)
(function() {
    // 로그인 페이지는 체크하지 않음
    if (window.location.pathname.includes('login.html')) {
        return;
    }

    // 세션 체크
    const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    
    if (!sessionData) {
        // 세션이 없으면 로그인 페이지로 리다이렉트
        alert('로그인이 필요합니다.');
        window.location.href = 'login.html';
        return;
    }

    try {
        const session = JSON.parse(sessionData);
        const loginTime = new Date(session.loginTime);
        const now = new Date();
        const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

        // 세션이 24시간 이상 지났으면 만료
        if (hoursSinceLogin >= 24) {
            alert('세션이 만료되었습니다. 다시 로그인해주세요.');
            localStorage.removeItem('adminSession');
            sessionStorage.removeItem('adminSession');
            window.location.href = 'login.html';
            return;
        }

        // 세션 활동 시간 업데이트 (선택 사항)
        session.lastActivity = new Date().toISOString();
        
        if (session.rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(session));
        }

    } catch (e) {
        console.error('세션 검증 오류:', e);
        alert('세션 오류가 발생했습니다. 다시 로그인해주세요.');
        window.location.href = 'login.html';
    }
})();

// 세션 정보 가져오기
function getSession() {
    const sessionData = localStorage.getItem('adminSession') || sessionStorage.getItem('adminSession');
    if (sessionData) {
        try {
            return JSON.parse(sessionData);
        } catch (e) {
            console.error('세션 파싱 오류:', e);
            return null;
        }
    }
    return null;
}

// 로그아웃 처리
function logout() {
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('adminSession');
        sessionStorage.removeItem('adminSession');
        window.location.href = 'login.html';
    }
}

// 세션 유지 시간 확인
function checkSessionValidity() {
    const session = getSession();
    if (!session) return false;

    const loginTime = new Date(session.loginTime);
    const now = new Date();
    const hoursSinceLogin = (now - loginTime) / (1000 * 60 * 60);

    return hoursSinceLogin < 24;
}

// 페이지 언로드 전 세션 저장
window.addEventListener('beforeunload', function() {
    const session = getSession();
    if (session) {
        session.lastActivity = new Date().toISOString();
        if (session.rememberMe) {
            localStorage.setItem('adminSession', JSON.stringify(session));
        } else {
            sessionStorage.setItem('adminSession', JSON.stringify(session));
        }
    }
});
