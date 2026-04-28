// 콘텐츠 관리 스크립트
document.addEventListener('DOMContentLoaded', function() {
    // 탭 전환 이벤트
    setupTabs();
    
    // 저장된 데이터 로드
    loadSavedContent();
    
    // 특징 & 통계 아이템 초기화
    initializeFeatures();
    initializeStats();
});

// 탭 전환
function setupTabs() {
    const tabButtons = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');
    
    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabId = this.getAttribute('data-tab');
            
            // 모든 탭 비활성화
            tabButtons.forEach(btn => btn.classList.remove('active'));
            tabContents.forEach(content => content.classList.remove('active'));
            
            // 선택된 탭 활성화
            this.classList.add('active');
            document.getElementById(`tab-${tabId}`).classList.add('active');
        });
    });
}

// 저장된 콘텐츠 로드
function loadSavedContent() {
    const savedContent = localStorage.getItem('siteContent');
    
    if (savedContent) {
        try {
            const content = JSON.parse(savedContent);
            
            // Hero Section
            if (content.hero) {
                document.getElementById('heroTitle').value = content.hero.title || '';
                document.getElementById('heroSubtitle').value = content.hero.subtitle || '';
                document.getElementById('heroDescription').value = content.hero.description || '';
                document.getElementById('heroBtn1Text').value = content.hero.btn1Text || '';
                document.getElementById('heroBtn1Link').value = content.hero.btn1Link || '';
                document.getElementById('heroBtn2Text').value = content.hero.btn2Text || '';
                document.getElementById('heroBtn2Link').value = content.hero.btn2Link || '';
            }
            
            // About Section
            if (content.about) {
                document.getElementById('aboutTitle').value = content.about.title || '';
                document.getElementById('aboutSubtitle').value = content.about.subtitle || '';
                document.getElementById('aboutDescription').value = content.about.description || '';
                document.getElementById('aboutExtraDescription').value = content.about.extraDescription || '';
            }
            
            // Features Section
            if (content.features) {
                document.getElementById('featuresTitle').value = content.features.title || '';
            }
            
            // Contact Section
            if (content.contact) {
                document.getElementById('contactTitle').value = content.contact.title || '';
                document.getElementById('contactPhone').value = content.contact.phone || '';
                document.getElementById('contactEmail').value = content.contact.email || '';
                document.getElementById('contactAddress').value = content.contact.address || '';
                document.getElementById('contactHours').value = content.contact.hours || '';
            }
        } catch (e) {
            console.error('콘텐츠 로드 오류:', e);
        }
    } else {
        // 기본값 설정
        loadDefaultContent();
    }
}

// 기본값 로드
function loadDefaultContent() {
    // Hero
    document.getElementById('heroTitle').value = 'AI 시대를 선도하는';
    document.getElementById('heroSubtitle').value = 'AXINOVA 평생교육원';
    document.getElementById('heroDescription').value = '2026 공공 AI 자격인증 대비 실무 중심 교육을 제공합니다';
    document.getElementById('heroBtn1Text').value = '교육 프로그램 보기';
    document.getElementById('heroBtn1Link').value = '#programs';
    document.getElementById('heroBtn2Text').value = '문의하기';
    document.getElementById('heroBtn2Link').value = '#contact';
    
    // About
    document.getElementById('aboutTitle').value = 'AXINOVA 평생교육원을 소개합니다';
    document.getElementById('aboutSubtitle').value = 'AI 교육 및 AI 에이전시 교육 전문 기관';
    document.getElementById('aboutDescription').value = 'AXINOVA 평생교육원은 AI 시대에 필요한 실무 중심의 교육을 제공합니다.';
    
    // Features
    document.getElementById('featuresTitle').value = '왜 AXINOVA인가?';
    
    // Contact
    document.getElementById('contactTitle').value = '문의하기';
    document.getElementById('contactPhone').value = '070-8657-1948';
    document.getElementById('contactEmail').value = 'info@axinova.ai.kr';
    document.getElementById('contactAddress').value = '충남 천안시 서북구 불당17길 27';
    document.getElementById('contactHours').value = '평일 09:00 - 18:00\n주말 및 공휴일 휴무';
}

// 특징 아이템 초기화
function initializeFeatures() {
    const savedContent = localStorage.getItem('siteContent');
    let features = [];
    
    if (savedContent) {
        try {
            const content = JSON.parse(savedContent);
            features = content.features?.items || [];
        } catch (e) {
            console.error('특징 로드 오류:', e);
        }
    }
    
    if (features.length === 0) {
        // 기본 특징 추가
        features = [
            { icon: 'fa-graduation-cap', title: '실무 중심 교육', description: '현장에서 바로 활용 가능한 실무 중심의 커리큘럼' },
            { icon: 'fa-certificate', title: '자격증 취득', description: '2026 공공 AI 자격인증 대비 체계적인 교육' },
            { icon: 'fa-users', title: '전문 강사진', description: '업계 최고의 전문가들로 구성된 강사진' }
        ];
    }
    
    const featuresList = document.getElementById('featuresList');
    featuresList.innerHTML = '';
    
    features.forEach((feature, index) => {
        addFeatureItemToDOM(feature, index);
    });
}

// 특징 아이템 DOM에 추가
function addFeatureItemToDOM(feature, index) {
    const featuresList = document.getElementById('featuresList');
    
    const item = document.createElement('div');
    item.className = 'feature-item';
    item.innerHTML = `
        <div class="item-header">
            <h4>특징 ${index + 1}</h4>
            <button class="btn-remove" onclick="removeFeatureItem(this)">
                <i class="fas fa-times"></i> 삭제
            </button>
        </div>
        <div class="form-group">
            <label>아이콘 (Font Awesome 클래스)</label>
            <input type="text" class="form-input feature-icon" 
                   placeholder="예: fa-graduation-cap" value="${feature.icon || ''}">
            <small style="color: var(--gray-medium); display: block; margin-top: 4px;">
                <a href="https://fontawesome.com/icons" target="_blank">Font Awesome 아이콘 찾기</a>
            </small>
        </div>
        <div class="form-group">
            <label>제목</label>
            <input type="text" class="form-input feature-title" 
                   placeholder="특징 제목" value="${feature.title || ''}">
        </div>
        <div class="form-group">
            <label>설명</label>
            <textarea class="form-textarea feature-description" rows="3"
                      placeholder="특징 설명">${feature.description || ''}</textarea>
        </div>
    `;
    
    featuresList.appendChild(item);
}

// 특징 추가
function addFeatureItem() {
    const feature = { icon: '', title: '', description: '' };
    const index = document.querySelectorAll('.feature-item').length;
    addFeatureItemToDOM(feature, index);
}

// 특징 삭제
function removeFeatureItem(button) {
    if (confirm('이 특징을 삭제하시겠습니까?')) {
        button.closest('.feature-item').remove();
        // 번호 재정렬
        document.querySelectorAll('.feature-item').forEach((item, index) => {
            item.querySelector('h4').textContent = `특징 ${index + 1}`;
        });
    }
}

// 통계 아이템 초기화
function initializeStats() {
    const savedContent = localStorage.getItem('siteContent');
    let stats = [];
    
    if (savedContent) {
        try {
            const content = JSON.parse(savedContent);
            stats = content.stats || [];
        } catch (e) {
            console.error('통계 로드 오류:', e);
        }
    }
    
    if (stats.length === 0) {
        // 기본 통계 추가
        stats = [
            { number: '500+', label: '수강생' },
            { number: '15+', label: '교육 프로그램' },
            { number: '95%', label: '만족도' },
            { number: '200+', label: '기업 파트너' }
        ];
    }
    
    const statsList = document.getElementById('statsList');
    statsList.innerHTML = '';
    
    stats.forEach((stat, index) => {
        addStatItemToDOM(stat, index);
    });
}

// 통계 아이템 DOM에 추가
function addStatItemToDOM(stat, index) {
    const statsList = document.getElementById('statsList');
    
    const item = document.createElement('div');
    item.className = 'stat-item';
    item.innerHTML = `
        <div class="item-header">
            <h4>통계 ${index + 1}</h4>
            <button class="btn-remove" onclick="removeStatItem(this)">
                <i class="fas fa-times"></i> 삭제
            </button>
        </div>
        <div class="form-row">
            <div class="form-group">
                <label>숫자</label>
                <input type="text" class="form-input stat-number" 
                       placeholder="예: 500+" value="${stat.number || ''}">
            </div>
            <div class="form-group">
                <label>레이블</label>
                <input type="text" class="form-input stat-label" 
                       placeholder="예: 수강생" value="${stat.label || ''}">
            </div>
        </div>
    `;
    
    statsList.appendChild(item);
}

// 통계 추가
function addStatItem() {
    const stat = { number: '', label: '' };
    const index = document.querySelectorAll('.stat-item').length;
    addStatItemToDOM(stat, index);
}

// 통계 삭제
function removeStatItem(button) {
    if (confirm('이 통계를 삭제하시겠습니까?')) {
        button.closest('.stat-item').remove();
        // 번호 재정렬
        document.querySelectorAll('.stat-item').forEach((item, index) => {
            item.querySelector('h4').textContent = `통계 ${index + 1}`;
        });
    }
}

// 모든 변경사항 저장
function saveAllChanges() {
    const content = {
        hero: {
            title: document.getElementById('heroTitle').value,
            subtitle: document.getElementById('heroSubtitle').value,
            description: document.getElementById('heroDescription').value,
            btn1Text: document.getElementById('heroBtn1Text').value,
            btn1Link: document.getElementById('heroBtn1Link').value,
            btn2Text: document.getElementById('heroBtn2Text').value,
            btn2Link: document.getElementById('heroBtn2Link').value
        },
        about: {
            title: document.getElementById('aboutTitle').value,
            subtitle: document.getElementById('aboutSubtitle').value,
            description: document.getElementById('aboutDescription').value,
            extraDescription: document.getElementById('aboutExtraDescription').value
        },
        features: {
            title: document.getElementById('featuresTitle').value,
            items: []
        },
        stats: [],
        contact: {
            title: document.getElementById('contactTitle').value,
            phone: document.getElementById('contactPhone').value,
            email: document.getElementById('contactEmail').value,
            address: document.getElementById('contactAddress').value,
            hours: document.getElementById('contactHours').value
        }
    };
    
    // 특징 수집
    document.querySelectorAll('.feature-item').forEach(item => {
        content.features.items.push({
            icon: item.querySelector('.feature-icon').value,
            title: item.querySelector('.feature-title').value,
            description: item.querySelector('.feature-description').value
        });
    });
    
    // 통계 수집
    document.querySelectorAll('.stat-item').forEach(item => {
        content.stats.push({
            number: item.querySelector('.stat-number').value,
            label: item.querySelector('.stat-label').value
        });
    });
    
    // LocalStorage에 저장
    localStorage.setItem('siteContent', JSON.stringify(content));
    
    // 성공 메시지
    showAlert('변경사항이 성공적으로 저장되었습니다!', 'success');
    
    // 실제 index.html 업데이트는 별도 구현 필요
    // 여기서는 JSON 데이터만 저장
}

// 미리보기
function previewChanges() {
    // 변경사항 임시 저장
    saveAllChanges();
    
    // 새 탭에서 메인 사이트 열기
    window.open('../index.html', '_blank');
}

// 알림 표시
function showAlert(message, type) {
    // 기존 알림 제거
    const existingAlert = document.querySelector('.alert');
    if (existingAlert) {
        existingAlert.remove();
    }
    
    // 새 알림 생성
    const alert = document.createElement('div');
    alert.className = `alert alert-${type}`;
    
    const icon = type === 'success' ? 'fa-check-circle' : 'fa-exclamation-circle';
    alert.innerHTML = `
        <i class="fas ${icon}"></i>
        <span>${message}</span>
    `;
    
    // 첫 번째 섹션 앞에 추가
    const firstSection = document.querySelector('.section-card');
    if (firstSection) {
        firstSection.parentNode.insertBefore(alert, firstSection);
    }
    
    // 3초 후 자동 제거
    setTimeout(() => {
        alert.remove();
    }, 3000);
}
