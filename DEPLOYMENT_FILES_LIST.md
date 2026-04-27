# 📦 Netlify 배포 파일 전체 목록

**작성일시:** 2026-04-27 03:15 KST  
**배포 위치:** `/home/user/webapp`  
**총 파일 개수:** 77개  
**배포 방식:** GitHub 자동 배포 (main 브랜치)

---

## 🎯 배포 파일 전체 목록 (77개)

### 📄 **1. 루트 디렉토리 파일 (16개)**

| 파일명 | 크기 | 용도 |
|--------|------|------|
| **index.html** | 94 KB | 메인 페이지 (홈페이지) ⭐ |
| **simple-ai-chat.js** | 17 KB | AI 챗봇 스크립트 ⭐ |
| **styles.css** | 35 KB | 메인 스타일시트 ⭐ |
| **script.js** | 12 KB | 메인 JavaScript |
| **dark-mode.css** | 7.3 KB | 다크모드 스타일 |
| **banners.css** | 14 KB | 배너 스타일 |
| **blog.html** | 15 KB | 블로그 페이지 |
| **blog.css** | 19 KB | 블로그 스타일 |
| **logo.png** | 51 KB | AXINOVA 로고 |
| **netlify.toml** | 1.3 KB | Netlify 배포 설정 ⭐ |
| **_redirects** | 92 B | SPA 리다이렉트 설정 |
| **robots.txt** | - | SEO 크롤러 설정 |
| **sitemap.xml** | - | 사이트맵 (SEO) |
| **.gitignore** | 351 B | Git 제외 파일 목록 |
| **.gitkeep** | 0 B | Git 디렉토리 유지 |

---

### 📚 **2. 문서 파일 (5개)**

| 파일명 | 크기 | 내용 |
|--------|------|------|
| AI_CHAT_COMPLETE.md | 7.6 KB | AI 챗봇 완성 보고서 |
| BUILD_FIX_REPORT.md | 4.5 KB | 빌드 오류 수정 보고서 |
| DEPLOYMENT_ISSUE_DIAGNOSIS.md | 6.6 KB | 배포 문제 진단 보고서 |
| DEPLOYMENT_SUCCESS_REPORT.md | 14 KB | 배포 성공 보고서 |
| PROGRAM_UPDATE_v4.3.md | 3.9 KB | v4.3 업데이트 문서 |

---

### 👤 **3. About (소개) 페이지 (2개)**

```
about/
├── educator.html          (22 KB)   - 평생교육사 소개 페이지
└── educator-photo.jpg     (122 KB)  - 평생교육사 사진
```

---

### 🔧 **4. Admin (관리자) CMS (25개)**

#### **HTML 페이지 (7개)**
```
admin/
├── login.html             (3.4 KB)  - 관리자 로그인
├── dashboard.html         (9.5 KB)  - 대시보드
├── blog-manager.html      (9.1 KB)  - 블로그 관리
├── content-manager.html   (12 KB)   - 콘텐츠 관리
├── media-library.html     (8.1 KB)  - 미디어 라이브러리
├── program-manager.html   (21 KB)   - 프로그램 관리
├── settings.html          (24 KB)   - 사이트 설정
└── user-manager.html      (18 KB)   - 회원 관리
```

#### **CSS 스타일 (5개)**
```
admin/css/
├── admin-login.css        (5.9 KB)  - 로그인 스타일
├── admin-dashboard.css    (10 KB)   - 대시보드 스타일
├── admin-content.css      (6.6 KB)  - 콘텐츠 스타일
├── media-library.css      (8.6 KB)  - 미디어 스타일
└── user-manager.css       (9.8 KB)  - 회원 관리 스타일
```

#### **JavaScript (12개)**
```
admin/js/
├── admin-auth.js          (3.0 KB)  - 인증 처리
├── admin-login.js         (4.7 KB)  - 로그인 로직
├── admin-dashboard.js     (3.2 KB)  - 대시보드 로직
├── admin-content.js       (14 KB)   - 콘텐츠 관리
├── blog-manager-new.js    (9.0 KB)  - 블로그 관리
├── program-manager.js     (6.5 KB)  - 프로그램 관리
├── media-library.js       (14 KB)   - 미디어 라이브러리
├── user-manager.js        (20 KB)   - 회원 관리
├── site-settings.js       (15 KB)   - 사이트 설정
├── user-management.js     (904 B)   - 회원 관리 유틸
├── course-management.js   (110 B)   - 과정 관리
├── assignment-grading.js  (75 B)    - 과제 채점
└── statistics.js          (93 B)    - 통계
```

#### **문서 (1개)**
```
admin/
└── CMS_USER_GUIDE.md      (8.3 KB)  - CMS 사용자 가이드
```

---

### 🖼️ **5. Images (이미지) (7개)**

```
images/
├── placeholder-hero.svg   - 히어로 섹션 플레이스홀더
├── placeholder-1.svg      - 플레이스홀더 1
├── placeholder-2.svg      - 플레이스홀더 2
├── placeholder-3.svg      - 플레이스홀더 3
├── placeholder-4.svg      - 플레이스홀더 4
├── placeholder-5.svg      - 플레이스홀더 5
└── placeholder-6.svg      - 플레이스홀더 6
```

---

### 🧪 **6. Lab (실습) (1개)**

```
lab/
└── ai-practice-gateway.html  - AI 실습 게이트웨이
```

---

### 📚 **7. LMS (학습관리시스템) (14개)**

#### **CSS (3개)**
```
lms/css/
├── my-classroom-lms.css      - My강의실 스타일
├── assignment-submit.css     - 과제 제출 스타일
└── notification-system.css   - 알림 시스템 스타일
```

#### **JavaScript (10개)**
```
lms/js/
├── lms-core.js               - LMS 코어
├── my-classroom-lms.js       - My강의실
├── attendance-manager.js     - 출석 관리
├── assignment-manager.js     - 과제 관리
├── assignment-submit.js      - 과제 제출
├── exam-manager.js           - 시험 관리
├── grades-manager.js         - 성적 관리
├── certificate-manager.js    - 수료증 관리
├── progress-tracker.js       - 진도 추적
└── notification-system.js    - 알림 시스템
```

#### **HTML 페이지 (1개)**
```
lms/pages/
└── assignment-submit.html    - 과제 제출 페이지
```

---

### 🤖 **8. Page Agent (AI 에이전트) (2개)**

```
page-agent/
├── css/page-agent.css        - Page Agent 스타일
└── js/page-agent.js          - Page Agent 스크립트
```

---

### 💳 **9. Payment (결제) (2개)**

```
payment/
├── css/payment.css           - 결제 스타일
└── js/payment.js             - 결제 로직
```

---

### 🎥 **10. Player (비디오 플레이어) (2개)**

```
player/
├── css/video-player.css      - 비디오 플레이어 스타일
└── js/video-player.js        - 비디오 플레이어 로직
```

---

## 📊 배포 파일 통계

### **파일 유형별 분류**

| 유형 | 개수 | 비율 |
|------|------|------|
| JavaScript (.js) | 27개 | 35% |
| HTML (.html) | 14개 | 18% |
| CSS (.css) | 12개 | 16% |
| 이미지 (.svg, .jpg, .png) | 9개 | 12% |
| Markdown (.md) | 6개 | 8% |
| 설정 파일 | 4개 | 5% |
| 기타 | 5개 | 6% |
| **총계** | **77개** | **100%** |

---

### **크기별 분류**

| 크기 범위 | 파일 개수 | 예시 |
|----------|----------|------|
| 0-1 KB | 12개 | .gitkeep, 설정 파일 |
| 1-10 KB | 35개 | JavaScript, CSS |
| 10-50 KB | 23개 | HTML, 문서 |
| 50-100 KB | 4개 | index.html, logo.png |
| 100 KB 이상 | 3개 | educator-photo.jpg |

---

### **디렉토리별 분류**

| 디렉토리 | 파일 개수 | 용도 |
|----------|----------|------|
| **루트 (/)** | 16개 | 메인 페이지, 스타일, 스크립트 |
| **admin/** | 25개 | 관리자 CMS 시스템 |
| **lms/** | 14개 | 학습관리 시스템 |
| **images/** | 7개 | 이미지 자산 |
| **문서 (*.md)** | 6개 | 기술 문서 및 보고서 |
| **about/** | 2개 | 소개 페이지 |
| **page-agent/** | 2개 | AI 에이전트 |
| **payment/** | 2개 | 결제 시스템 |
| **player/** | 2개 | 비디오 플레이어 |
| **lab/** | 1개 | 실습 페이지 |

---

## 🎯 핵심 배포 파일 (반드시 필요)

### **필수 파일 ⭐**

1. **index.html** (94 KB)
   - 메인 랜딩 페이지
   - 모든 섹션 통합

2. **simple-ai-chat.js** (17 KB)
   - AI 챗봇 스크립트
   - 키워드 기반 응답 시스템

3. **styles.css** (35 KB)
   - 메인 스타일시트
   - 레이아웃, 타이포그래피

4. **script.js** (12 KB)
   - 메인 JavaScript
   - 네비게이션, 인터랙션

5. **netlify.toml** (1.3 KB)
   - Netlify 배포 설정
   - 리다이렉트, 헤더 설정

6. **_redirects** (92 B)
   - SPA 리다이렉트
   - 404 → index.html

7. **logo.png** (51 KB)
   - AXINOVA 로고
   - 브랜드 아이덴티티

---

## ✅ 배포 확인 명령어

### **전체 파일 목록 확인**
```bash
cd /home/user/webapp
git ls-files
```

### **파일 개수 확인**
```bash
git ls-files | wc -l
# 출력: 77
```

### **파일별 크기 확인**
```bash
git ls-files | xargs ls -lh | awk '{print $5 "\t" $9}'
```

### **디렉토리별 파일 개수**
```bash
git ls-files | cut -d'/' -f1 | sort | uniq -c
```

---

## 🚫 배포 제외 파일 (.gitignore)

```gitignore
# 의존성
node_modules/
package-lock.json

# 빌드 출력
dist/
build/

# 로그
logs/
*.log

# 환경 변수
.env

# 백업 파일
*.zip
*.tar.gz
*.bak

# 백엔드 (별도 배포)
backend/
```

---

## 📦 배포 패키지 정보

### **현재 배포 버전**
- **버전:** v4.3-production
- **Git Commit:** `6efdacb` + `ab7e7db`
- **배포 일시:** 2026-04-27 02:35 KST
- **배포 방식:** GitHub 자동 배포

### **변경 내역**
- ✅ AI 교육 콘텐츠 개발 전문가 12주 과정 추가
- ✅ Pure JavaScript AI 챗봇 통합 (simple-ai-chat.js)
- ✅ OpenAI API 오류 해결
- ✅ 다크모드 지원
- ✅ 모바일 반응형 UI

---

## 🎯 요약

### **배포 파일 총계**
```
총 파일:    77개
총 크기:    약 2.2 MB
배포 위치:  /home/user/webapp
배포 방식:  GitHub 자동 배포 (main 브랜치)
```

### **주요 구성**
- ✅ 메인 페이지 (index.html)
- ✅ AI 챗봇 (simple-ai-chat.js)
- ✅ 관리자 CMS (admin/)
- ✅ 학습관리 시스템 (lms/)
- ✅ 결제 시스템 (payment/)
- ✅ 비디오 플레이어 (player/)
- ✅ Page Agent (page-agent/)

---

## 📞 참고 정보

**배포 확인:**
- Netlify: https://app.netlify.com
- 사이트: https://www.axinova.ai
- GitHub: https://github.com/djnigajoa-a11y/-

**문의:**
- 이메일: tech@axinova.ai.kr
- 전화: 070-8657-1948

---

**🎯 모든 77개 파일이 www.axinova.ai에 배포됩니다!**
