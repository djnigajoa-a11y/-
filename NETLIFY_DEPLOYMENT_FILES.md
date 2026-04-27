# 📦 Netlify 배포 파일 위치 안내

**작성일시:** 2026-04-27 03:10 KST  
**배포 경로:** `/home/user/webapp`  
**배포 방식:** GitHub 자동 배포 (CI/CD)

---

## 🎯 Netlify 배포 파일 위치

### **📍 메인 배포 디렉토리**

```bash
/home/user/webapp
```

**이 디렉토리 전체가 Netlify에 배포됩니다!**

---

## 📂 배포 파일 구조

### **1. 루트 디렉토리 (`/home/user/webapp`)**

```
/home/user/webapp/
├── index.html              (94KB)  ← 메인 페이지 ⭐
├── simple-ai-chat.js       (17KB)  ← AI 챗봇 ⭐
├── styles.css              (35KB)  ← 메인 스타일
├── script.js               (12KB)  ← 메인 JavaScript
├── dark-mode.css           (7.3KB) ← 다크모드
├── banners.css             (14KB)  ← 배너 스타일
├── blog.html               (15KB)  ← 블로그 페이지
├── blog.css                (19KB)  ← 블로그 스타일
├── logo.png                (51KB)  ← 로고 이미지
├── netlify.toml            (1.3KB) ← Netlify 설정 ⭐
├── _redirects              (92B)   ← SPA 리다이렉트
├── robots.txt                      ← SEO 설정
├── sitemap.xml                     ← 사이트맵
├── .gitignore                      ← Git 제외 파일
│
├── about/                          ← 소개 페이지
│   ├── educator.html
│   └── educator-photo.jpg
│
├── admin/                          ← 관리자 CMS
│   ├── dashboard.html
│   ├── blog-manager.html
│   ├── content-manager.html
│   ├── css/
│   └── js/
│
├── images/                         ← 이미지 자산
│
├── lab/                            ← 랩/실습 페이지
│
├── lms/                            ← 학습관리 시스템
│   ├── pages/
│   ├── css/
│   └── js/
│
├── page-agent/                     ← Page Agent
│   ├── css/
│   └── js/
│
├── payment/                        ← 결제 시스템
│   ├── css/
│   └── js/
│
├── player/                         ← 비디오 플레이어
│   ├── css/
│   └── js/
│
└── programs/                       ← 프로그램 페이지
```

---

## ⚙️ Netlify 배포 설정

### **`netlify.toml` 설정 내용:**

```toml
[build]
  publish = "."              ← 현재 디렉토리 전체 배포
  command = "echo '✅ AXINOVA Static Site - No build needed'"
```

**설명:**
- **`publish = "."`** → `/home/user/webapp` 디렉토리 **전체**를 배포
- 빌드 명령 없음 (순수 정적 사이트)
- 모든 파일과 하위 디렉토리가 배포됨

---

## 🚀 배포 방식별 파일 위치

### **방법 1: GitHub 자동 배포 (현재 설정) ⭐**

**작동 원리:**
```
GitHub Repository (main 브랜치)
    ↓
/home/user/webapp 전체
    ↓
Netlify가 자동으로 가져와서 배포
    ↓
www.axinova.ai
```

**배포되는 파일:**
- `/home/user/webapp` 아래 **모든 파일** (`.gitignore` 제외 항목 빼고)
- Git에 커밋된 파일만 배포됨

**제외되는 파일 (`.gitignore`):**
```
node_modules/        ← 의존성 패키지
backend/             ← 백엔드 서버 (별도 배포)
logs/                ← 로그 파일
*.zip                ← ZIP 백업 파일
*.log                ← 로그 파일
```

---

### **방법 2: Netlify Drop (수동 업로드)**

**업로드할 파일:**
- ZIP 파일: `/home/user/webapp/axinova-v4.3-ai-working.zip` (357KB)
- 또는 `/home/user/webapp` 디렉토리 전체를 ZIP으로 압축

**주의:**
- Netlify Drop은 **새로운 임시 사이트** 생성
- **www.axinova.ai와 연결 안 됨** ❌
- 테스트 용도로만 사용 권장

---

### **방법 3: Netlify CLI (명령어 배포)**

```bash
cd /home/user/webapp        ← 이 디렉토리에서 실행!

# 프로덕션 배포
netlify deploy --prod --dir=.

# 또는 현재 디렉토리 지정
netlify deploy --prod --dir=/home/user/webapp
```

**`--dir=.` 의미:**
- `.` = 현재 디렉토리 (즉, `/home/user/webapp`)
- 이 디렉토리 전체가 배포됨

---

## 📊 배포 파일 통계

### **전체 파일 개수:**
```bash
# Git 추적 파일 (배포되는 파일)
75개 파일

# 주요 파일 크기
index.html:          94 KB    ← 메인 페이지
simple-ai-chat.js:   17 KB    ← AI 챗봇
styles.css:          35 KB    ← 스타일시트
logo.png:            51 KB    ← 로고
```

### **디렉토리별 용도:**

| 디렉토리 | 용도 | 배포 여부 |
|---------|------|----------|
| `/` (루트) | 메인 페이지, 스타일, 스크립트 | ✅ 배포 |
| `/about` | 소개 페이지 | ✅ 배포 |
| `/admin` | 관리자 CMS | ✅ 배포 |
| `/lms` | 학습관리 시스템 | ✅ 배포 |
| `/programs` | 프로그램 페이지 | ✅ 배포 |
| `/backend` | 백엔드 서버 | ❌ 제외 |
| `/node_modules` | 의존성 | ❌ 제외 |
| `/logs` | 로그 | ❌ 제외 |

---

## ✅ 배포 확인 명령어

### **1. 현재 배포 디렉토리 확인**
```bash
pwd
# 출력: /home/user/webapp
```

### **2. 배포될 파일 목록 확인**
```bash
cd /home/user/webapp
git ls-files | wc -l
# 출력: 75 (Git 추적 파일 개수)
```

### **3. 주요 파일 존재 확인**
```bash
ls -lh index.html simple-ai-chat.js netlify.toml
```

### **4. 배포 크기 확인**
```bash
du -sh /home/user/webapp
# 출력: 약 2.2 MB (전체 크기, node_modules 제외)
```

---

## 🎯 요약

### **✅ Netlify 배포 파일 위치:**
```
/home/user/webapp
```

### **✅ 배포 방식:**
- **GitHub 자동 배포** (main 브랜치)
- Netlify가 `/home/user/webapp` 전체를 가져와서 배포
- `netlify.toml`의 `publish = "."` 설정에 따름

### **✅ 주요 파일:**
- `index.html` - 메인 페이지
- `simple-ai-chat.js` - AI 챗봇
- `styles.css` - 스타일시트
- `netlify.toml` - Netlify 설정
- `_redirects` - SPA 리다이렉트

### **✅ 제외 파일:**
- `backend/` - 백엔드 서버 (별도 배포)
- `node_modules/` - 의존성 패키지
- `*.zip` - ZIP 백업 파일
- `logs/` - 로그 파일

---

## 📞 추가 질문

**Q1: 특정 파일만 배포하고 싶다면?**
- A: `.gitignore`에 제외할 파일/디렉토리 추가

**Q2: 배포 디렉토리를 변경하고 싶다면?**
- A: `netlify.toml`의 `publish = "."` 부분 수정
  - 예: `publish = "dist"` (dist 폴더만 배포)

**Q3: 현재 배포된 버전 확인?**
- A: Netlify 대시보드 → Deploys → 최신 커밋 확인
  - 현재: `6efdacb release: v4.3 Complete`

---

**🎯 결론: `/home/user/webapp` 디렉토리 전체가 www.axinova.ai에 배포됩니다!**
