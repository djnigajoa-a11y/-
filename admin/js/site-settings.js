// AXINOVA CMS - Site Settings Manager
// LocalStorage keys
const STORAGE_KEYS = {
    BASIC: 'axinova_site_basic',
    SEO: 'axinova_site_seo',
    CONTACT: 'axinova_site_contact'
};

// Default settings
const DEFAULT_SETTINGS = {
    basic: {
        siteName: 'AXINOVA 평생교육원',
        siteSubtitle: 'AI 교육 및 AI 에이전시 교육 전문',
        siteDescription: 'AXINOVA 평생교육원은 2026년 공공 AI 자격인증 시대를 대비한 실무 중심 AI 교육 및 AI 에이전시 교육 전문 기관입니다.',
        siteUrl: 'https://www.axinova.ai.kr',
        tagline: 'AI 생존전략 아카데미',
        mainCatchphrase: 'AI 전문가 양성의 중심'
    },
    seo: {
        metaTitle: 'AXINOVA 평생교육원 - AI 교육 및 AI 에이전시 교육 전문',
        metaDescription: '2026년 공공 AI 자격인증 시대를 대비한 실무 중심 AI 교육. AGI 네비게이터 10대 핵심 기술 교육 전문.',
        keywords: ['AI 교육', 'AI 자격증', 'AI 에이전트', '평생교육원', '인공지능 교육', 'AXINOVA', '공공 AI 자격인증', 'AGI 네비게이터'],
        ogTitle: 'AXINOVA 평생교육원',
        ogDescription: 'AI의 AX 시대를 선도하는 평생교육 혁신 기관',
        ogImage: '',
        googleVerification: '',
        naverVerification: '',
        googleAnalyticsId: ''
    },
    contact: {
        phone: '070-8657-1948',
        fax: '',
        email: 'info@axinova.ai.kr',
        address: '충남 천안시 서북구 불당17길 27',
        facebook: '',
        instagram: '',
        youtube: '',
        naverBlog: '',
        businessNumber: '',
        ceoName: ''
    }
};

// ========================================
// Settings Manager
// ========================================
const SettingsManager = {
    // Load settings from localStorage
    load(type) {
        try {
            const stored = localStorage.getItem(STORAGE_KEYS[type.toUpperCase()]);
            if (stored) {
                return JSON.parse(stored);
            }
        } catch (error) {
            console.error(`설정 로드 오류 (${type}):`, error);
        }
        return DEFAULT_SETTINGS[type];
    },

    // Save settings to localStorage
    save(type, data) {
        try {
            localStorage.setItem(STORAGE_KEYS[type.toUpperCase()], JSON.stringify(data));
            return true;
        } catch (error) {
            console.error(`설정 저장 오류 (${type}):`, error);
            return false;
        }
    },

    // Get all settings
    getAll() {
        return {
            basic: this.load('basic'),
            seo: this.load('seo'),
            contact: this.load('contact')
        };
    }
};

// ========================================
// Tab Management
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    // Tab switching
    const tabButtons = document.querySelectorAll('.settings-tab');
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const targetTab = button.getAttribute('data-tab');
            
            // Update button states
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');
            
            // Update content visibility
            document.querySelectorAll('.settings-content').forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(targetTab).classList.add('active');
        });
    });

    // Load all settings
    loadBasicSettings();
    loadSeoSettings();
    loadContactSettings();

    // Form submissions
    document.getElementById('basicSettingsForm').addEventListener('submit', handleBasicSubmit);
    document.getElementById('seoSettingsForm').addEventListener('submit', handleSeoSubmit);
    document.getElementById('contactSettingsForm').addEventListener('submit', handleContactSubmit);

    // Character counters
    setupCharacterCounters();

    // Keyword input - Enter key support
    document.getElementById('keywordInput').addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            addKeyword();
        }
    });
});

// ========================================
// Basic Settings
// ========================================
function loadBasicSettings() {
    const settings = SettingsManager.load('basic');
    
    document.getElementById('siteName').value = settings.siteName || '';
    document.getElementById('siteSubtitle').value = settings.siteSubtitle || '';
    document.getElementById('siteDescription').value = settings.siteDescription || '';
    document.getElementById('siteUrl').value = settings.siteUrl || '';
    document.getElementById('tagline').value = settings.tagline || '';
    document.getElementById('mainCatchphrase').value = settings.mainCatchphrase || '';
}

function handleBasicSubmit(e) {
    e.preventDefault();
    
    const settings = {
        siteName: document.getElementById('siteName').value,
        siteSubtitle: document.getElementById('siteSubtitle').value,
        siteDescription: document.getElementById('siteDescription').value,
        siteUrl: document.getElementById('siteUrl').value,
        tagline: document.getElementById('tagline').value,
        mainCatchphrase: document.getElementById('mainCatchphrase').value
    };
    
    if (SettingsManager.save('basic', settings)) {
        showSuccessMessage();
        // Update live site if needed
        updateLiveSiteBasicInfo(settings);
    } else {
        alert('설정 저장 중 오류가 발생했습니다.');
    }
}

function resetBasicSettings() {
    if (confirm('기본 정보를 초기화하시겠습니까?')) {
        SettingsManager.save('basic', DEFAULT_SETTINGS.basic);
        loadBasicSettings();
        showSuccessMessage('기본 설정이 초기화되었습니다.');
    }
}

// ========================================
// SEO Settings
// ========================================
function loadSeoSettings() {
    const settings = SettingsManager.load('seo');
    
    document.getElementById('metaTitle').value = settings.metaTitle || '';
    document.getElementById('metaDescription').value = settings.metaDescription || '';
    document.getElementById('ogTitle').value = settings.ogTitle || '';
    document.getElementById('ogDescription').value = settings.ogDescription || '';
    document.getElementById('ogImage').value = settings.ogImage || '';
    document.getElementById('googleVerification').value = settings.googleVerification || '';
    document.getElementById('naverVerification').value = settings.naverVerification || '';
    document.getElementById('googleAnalyticsId').value = settings.googleAnalyticsId || '';
    
    // Load keywords
    renderKeywords(settings.keywords || []);
    
    // Update character counts
    updateCharacterCount('metaTitle', 60);
    updateCharacterCount('metaDescription', 160);
}

function handleSeoSubmit(e) {
    e.preventDefault();
    
    const settings = {
        metaTitle: document.getElementById('metaTitle').value,
        metaDescription: document.getElementById('metaDescription').value,
        keywords: getCurrentKeywords(),
        ogTitle: document.getElementById('ogTitle').value,
        ogDescription: document.getElementById('ogDescription').value,
        ogImage: document.getElementById('ogImage').value,
        googleVerification: document.getElementById('googleVerification').value,
        naverVerification: document.getElementById('naverVerification').value,
        googleAnalyticsId: document.getElementById('googleAnalyticsId').value
    };
    
    if (SettingsManager.save('seo', settings)) {
        showSuccessMessage();
        // Update live site meta tags if needed
        updateLiveSiteSeoInfo(settings);
    } else {
        alert('설정 저장 중 오류가 발생했습니다.');
    }
}

function resetSeoSettings() {
    if (confirm('SEO 설정을 초기화하시겠습니까?')) {
        SettingsManager.save('seo', DEFAULT_SETTINGS.seo);
        loadSeoSettings();
        showSuccessMessage('SEO 설정이 초기화되었습니다.');
    }
}

// ========================================
// Keyword Management
// ========================================
let keywords = [];

function addKeyword() {
    const input = document.getElementById('keywordInput');
    const keyword = input.value.trim();
    
    if (!keyword) {
        alert('키워드를 입력해주세요.');
        return;
    }
    
    if (keywords.includes(keyword)) {
        alert('이미 추가된 키워드입니다.');
        return;
    }
    
    keywords.push(keyword);
    renderKeywords(keywords);
    input.value = '';
    input.focus();
}

function removeKeyword(keyword) {
    keywords = keywords.filter(k => k !== keyword);
    renderKeywords(keywords);
}

function renderKeywords(keywordList) {
    keywords = [...keywordList];
    const container = document.getElementById('keywordList');
    
    if (keywords.length === 0) {
        container.innerHTML = '<small style="color: #999;">추가된 키워드가 없습니다.</small>';
        return;
    }
    
    container.innerHTML = keywords.map(keyword => `
        <div class="keyword-tag">
            <span>${keyword}</span>
            <span class="remove-keyword" onclick="removeKeyword('${keyword}')">
                <i class="fas fa-times"></i>
            </span>
        </div>
    `).join('');
}

function getCurrentKeywords() {
    return keywords;
}

// ========================================
// Contact Settings
// ========================================
function loadContactSettings() {
    const settings = SettingsManager.load('contact');
    
    document.getElementById('phone').value = settings.phone || '';
    document.getElementById('fax').value = settings.fax || '';
    document.getElementById('email').value = settings.email || '';
    document.getElementById('address').value = settings.address || '';
    document.getElementById('facebook').value = settings.facebook || '';
    document.getElementById('instagram').value = settings.instagram || '';
    document.getElementById('youtube').value = settings.youtube || '';
    document.getElementById('naverBlog').value = settings.naverBlog || '';
    document.getElementById('businessNumber').value = settings.businessNumber || '';
    document.getElementById('ceoName').value = settings.ceoName || '';
}

function handleContactSubmit(e) {
    e.preventDefault();
    
    const settings = {
        phone: document.getElementById('phone').value,
        fax: document.getElementById('fax').value,
        email: document.getElementById('email').value,
        address: document.getElementById('address').value,
        facebook: document.getElementById('facebook').value,
        instagram: document.getElementById('instagram').value,
        youtube: document.getElementById('youtube').value,
        naverBlog: document.getElementById('naverBlog').value,
        businessNumber: document.getElementById('businessNumber').value,
        ceoName: document.getElementById('ceoName').value
    };
    
    if (SettingsManager.save('contact', settings)) {
        showSuccessMessage();
        // Update live site contact info if needed
        updateLiveSiteContactInfo(settings);
    } else {
        alert('설정 저장 중 오류가 발생했습니다.');
    }
}

function resetContactSettings() {
    if (confirm('연락처 정보를 초기화하시겠습니까?')) {
        SettingsManager.save('contact', DEFAULT_SETTINGS.contact);
        loadContactSettings();
        showSuccessMessage('연락처 정보가 초기화되었습니다.');
    }
}

// ========================================
// UI Utilities
// ========================================
function showSuccessMessage(message = '설정이 성공적으로 저장되었습니다.') {
    const messageEl = document.getElementById('successMessage');
    messageEl.querySelector('span').textContent = message;
    messageEl.classList.add('show');
    
    setTimeout(() => {
        messageEl.classList.remove('show');
    }, 3000);
}

function setupCharacterCounters() {
    const metaTitle = document.getElementById('metaTitle');
    const metaDescription = document.getElementById('metaDescription');
    
    metaTitle.addEventListener('input', () => updateCharacterCount('metaTitle', 60));
    metaDescription.addEventListener('input', () => updateCharacterCount('metaDescription', 160));
}

function updateCharacterCount(fieldId, maxLength) {
    const field = document.getElementById(fieldId);
    const countSpan = document.getElementById(fieldId + 'Count');
    const length = field.value.length;
    
    countSpan.textContent = length;
    
    // Change color based on usage
    const percentage = (length / maxLength) * 100;
    if (percentage > 90) {
        countSpan.style.color = '#e74c3c';
    } else if (percentage > 70) {
        countSpan.style.color = '#f39c12';
    } else {
        countSpan.style.color = '#27ae60';
    }
}

// ========================================
// Live Site Update Functions
// ========================================
function updateLiveSiteBasicInfo(settings) {
    // This function would update the live site if it's using localStorage
    // For now, we'll just store it for future reference
    console.log('Basic settings updated:', settings);
    
    // You can trigger a custom event that the main site listens to
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { type: 'basic', settings }
    }));
}

function updateLiveSiteSeoInfo(settings) {
    console.log('SEO settings updated:', settings);
    
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { type: 'seo', settings }
    }));
}

function updateLiveSiteContactInfo(settings) {
    console.log('Contact settings updated:', settings);
    
    window.dispatchEvent(new CustomEvent('siteSettingsUpdated', {
        detail: { type: 'contact', settings }
    }));
}

// ========================================
// Export Settings API
// ========================================
window.SiteSettings = {
    get: (type) => SettingsManager.load(type),
    getAll: () => SettingsManager.getAll(),
    save: (type, data) => SettingsManager.save(type, data)
};
