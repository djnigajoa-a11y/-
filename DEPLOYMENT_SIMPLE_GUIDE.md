# 🎯 Netlify 배포 파일 간단 정리

**핵심 답변:** `/home/user/webapp` 디렉토리 **전체**를 배포합니다!

---

## ✅ **배포 방법**

### **현재 설정 (netlify.toml):**

```toml
[build]
  publish = "."     ← "." = 현재 디렉토리 전체!
```

**의미:**
- `publish = "."` → `/home/user/webapp` 폴더 **전체**를 배포
- **어떤 파일을 선택할 필요 없음** ❌
- **모든 파일이 자동으로 배포됨** ✅

---

## 🚀 **배포 방식별 가이드**

### **방법 1: GitHub 자동 배포 (현재 설정) ⭐ 권장**

**작동 원리:**
```
1. /home/user/webapp 디렉토리 전체를 Git 커밋
   ↓
2. GitHub에 푸시
   ↓
3. Netlify가 자동으로 감지하여 배포
   ↓
4. www.axinova.ai 업데이트 완료!
```

**명령어:**
```bash
cd /home/user/webapp

# 전체 디렉토리를 그대로 커밋
git add .
git commit -m "배포 업데이트"
git push origin main

# 끝! Netlify가 자동으로 배포함
```

**배포되는 것:**
- `/home/user/webapp` 아래 **모든 파일**
- `.gitignore`에 없는 파일들 (77개)

---

### **방법 2: Netlify Drop (ZIP 업로드)**

**단계:**
1. `/home/user/webapp` 디렉토리 전체를 ZIP으로 압축
2. https://app.netlify.com/drop 접속
3. ZIP 파일 드래그 앤 드롭
4. 배포 완료!

**명령어:**
```bash
cd /home/user/webapp

# 현재 디렉토리 전체를 ZIP으로 압축
zip -r deploy.zip . -x "node_modules/*" "backend/*" "logs/*" "*.zip"

# deploy.zip 파일을 Netlify Drop에 업로드
```

**주의:**
- Netlify Drop은 **임시 사이트** 생성 (예: random-abc.netlify.app)
- **www.axinova.ai와 연결 안 됨** ❌

---

### **방법 3: Netlify CLI (명령어 배포)**

**단계:**
```bash
cd /home/user/webapp

# Netlify CLI 설치 (최초 1회)
npm install -g netlify-cli

# 로그인
netlify login

# 사이트 연결
netlify link

# 현재 디렉토리 전체를 프로덕션 배포
netlify deploy --prod --dir=.
```

**`--dir=.` 의미:**
- `.` = 현재 디렉토리 (`/home/user/webapp`)
- **전체 디렉토리가 배포됨**

---

## 📦 **실제 배포되는 파일**

### **배포 파일 (77개):**

```
/home/user/webapp/
├── index.html              ← 메인 페이지
├── simple-ai-chat.js       ← AI 챗봇
├── styles.css              ← 스타일
├── script.js               ← JavaScript
├── logo.png                ← 로고
├── netlify.toml            ← 설정
├── _redirects              ← 리다이렉트
│
├── about/                  ← 소개 페이지 (2개 파일)
├── admin/                  ← 관리자 (25개 파일)
├── images/                 ← 이미지 (7개 파일)
├── lab/                    ← 실습 (1개 파일)
├── lms/                    ← 학습관리 (14개 파일)
├── page-agent/             ← AI 에이전트 (2개 파일)
├── payment/                ← 결제 (2개 파일)
├── player/                 ← 비디오 (2개 파일)
└── ... (기타 문서 파일들)

총 77개 파일 = 전체 배포됨!
```

---

### **배포 제외 파일 (.gitignore):**

```
❌ backend/          - 백엔드 서버 (별도 배포)
❌ node_modules/     - 의존성 패키지
❌ logs/             - 로그 파일
❌ *.zip             - ZIP 백업
❌ *.log             - 로그
```

---

## 🎯 **핵심 포인트**

### ✅ **배포할 것:**
```
/home/user/webapp 디렉토리 전체
```

### ✅ **방법:**
```
1. GitHub 푸시 (자동 배포) ← 권장!
2. Netlify Drop (ZIP 업로드)
3. Netlify CLI (명령어 배포)
```

### ✅ **설정:**
```toml
[build]
  publish = "."    ← 현재 디렉토리 전체
```

---

## 💡 **자주 묻는 질문**

### **Q1: 특정 파일만 배포할 수 있나요?**
A: 아니요. `publish = "."`로 설정되어 있어서 **전체 디렉토리**가 배포됩니다.

**특정 폴더만 배포하려면:**
```toml
[build]
  publish = "dist"    ← dist 폴더만 배포
```

---

### **Q2: 어떤 파일을 선택해야 하나요?**
A: **선택 불필요!** `/home/user/webapp` 디렉토리 전체가 자동으로 배포됩니다.

---

### **Q3: 파일을 어디에 두어야 하나요?**
A: `/home/user/webapp` 디렉토리 안에 있으면 **모두 배포됩니다**.

**예시:**
```bash
/home/user/webapp/새파일.html     ← 배포됨 ✅
/home/user/webapp/폴더/파일.css   ← 배포됨 ✅
/home/user/images/사진.jpg         ← 배포 안 됨 ❌ (webapp 밖)
```

---

### **Q4: 백엔드 파일은 왜 배포 안 되나요?**
A: `.gitignore`에 `backend/`가 포함되어 있어서 제외됩니다.

**확인:**
```bash
cat .gitignore | grep backend
# 출력: backend/
```

---

## 🚀 **즉시 배포 명령어**

### **GitHub 자동 배포 (권장):**
```bash
cd /home/user/webapp
git add .
git commit -m "deploy: 배포 업데이트"
git push origin main
```

### **Netlify CLI 배포:**
```bash
cd /home/user/webapp
netlify deploy --prod --dir=.
```

### **ZIP 생성 (Netlify Drop용):**
```bash
cd /home/user/webapp
zip -r deploy.zip . -x "node_modules/*" "backend/*" "logs/*" "*.zip"
# deploy.zip을 https://app.netlify.com/drop에 업로드
```

---

## 📊 **배포 흐름도**

```
/home/user/webapp 디렉토리
    ↓
netlify.toml (publish = ".")
    ↓
전체 77개 파일 선택
    ↓
.gitignore 확인 (제외 파일 제거)
    ↓
GitHub 푸시 또는 ZIP 업로드
    ↓
Netlify 빌드 (1-2분)
    ↓
www.axinova.ai 배포 완료!
```

---

## ✅ **최종 답변**

### **배포할 파일:**
```
/home/user/webapp 디렉토리 전체
(77개 파일, 약 2.2 MB)
```

### **배포 방법:**
```bash
cd /home/user/webapp
git push origin main
```

### **설정:**
```
netlify.toml의 publish = "." 설정에 따라
현재 디렉토리 전체가 자동 배포됨
```

---

**🎯 핵심: `/home/user/webapp` 디렉토리 전체를 배포하면 됩니다! 파일 선택 불필요!** ✅
