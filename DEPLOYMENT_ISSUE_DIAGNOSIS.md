# 🚨 AXINOVA 배포 문제 진단 보고서

**작성일시:** 2026-04-27 01:45 KST  
**문제:** Netlify Drop 배포 후 www.axinova.ai 미반영  
**상태:** 🔴 원인 3가지 발견

---

## 📋 문제 원인 분석

### 🔴 **원인 1: Git 브랜치 충돌 (Diverged State)**

```
Your branch and 'origin/main' have diverged,
and have 160 and 1 different commits each, respectively.
```

**설명:**
- 로컬 브랜치가 원격 저장소와 **160개 커밋 차이** 발생
- 원격 저장소에 1개의 다른 커밋이 존재
- 로컬 변경사항이 GitHub에 푸시되지 않음

**영향:**
- GitHub와 연동된 Netlify가 구버전 코드를 사용 중
- 최신 v4.3 AI 챗봇 변경사항이 반영되지 않음

---

### 🔴 **원인 2: Netlify Drop vs GitHub 연동 불일치**

**www.axinova.ai 도메인의 Netlify 사이트 설정:**
- **배포 방식:** GitHub Repository 자동 배포 (CI/CD)
- **연결된 저장소:** `https://github.com/djnigajoa-a11y/-.git`
- **배포 브랜치:** `main` 브랜치

**문제 상황:**
1. 사용자가 Netlify Drop으로 ZIP 파일 업로드
   - → 새로운 임시 사이트 생성 (예: `https://random-abc123.netlify.app`)
   - → **www.axinova.ai와 연결되지 않음**

2. www.axinova.ai는 GitHub `main` 브랜치를 모니터링
   - → 로컬 커밋이 푸시되지 않아 배포 트리거 안 됨
   - → 구버전 그대로 유지

**비유:**
- Netlify Drop = 새 건물 짓기 (임시 주소)
- www.axinova.ai = 기존 건물 (기존 주소)
- 두 건물은 완전히 별개

---

### 🔴 **원인 3: 커밋되지 않은 변경사항**

```
Changes not staged for commit:
    deleted:    axinova-renewal-v4.0-deploy.zip

Untracked files:
    AI_CHAT_COMPLETE.md
    BUILD_FIX_REPORT.md
    PROGRAM_UPDATE_v4.3.md
    axinova-renewal-v4.2-marketing.zip
    axinova-renewal-v4.3-edu-content.zip
    axinova-v4.3-ai-working.zip
    axinova-v4.3-static-fixed.zip
```

**설명:**
- 최신 문서 파일들이 Git에 추가되지 않음
- ZIP 파일들이 커밋되지 않음 (`.gitignore`에 포함될 수 있음)

---

## ✅ 해결 방법

### 📌 **방법 1: GitHub 푸시 후 자동 배포 (권장)**

**장점:**
- ✅ 버전 관리 유지
- ✅ CI/CD 자동화
- ✅ 롤백 가능
- ✅ 팀 협업 가능

**단계:**

#### Step 1: 원격 저장소 최신 상태 동기화
```bash
cd /home/user/webapp

# 원격 변경사항 가져오기
git fetch origin main

# 로컬과 병합 (충돌 해결 필요 시)
git pull origin main --rebase
```

#### Step 2: 변경사항 커밋
```bash
# 모든 변경사항 스테이징
git add .

# 커밋
git commit -m "release: v4.3 AI Working - Complete AI chatbot integration"
```

#### Step 3: GitHub에 푸시
```bash
# main 브랜치로 푸시
git push origin main
```

#### Step 4: Netlify 자동 배포 확인
- Netlify 대시보드 접속: https://app.netlify.com
- "Deploys" 탭에서 자동 배포 시작 확인 (1-2분 소요)
- 완료 후 www.axinova.ai 접속하여 확인

---

### 📌 **방법 2: Netlify 사이트 재연결 (빠른 임시 방법)**

**장점:**
- ⚡ 즉시 배포 가능 (30초)
- 🚫 Git 충돌 해결 불필요

**단점:**
- ❌ 기존 배포 히스토리 손실
- ❌ CI/CD 파이프라인 재설정 필요

**단계:**

#### Step 1: Netlify 대시보드 접속
1. https://app.netlify.com 로그인
2. "Sites" 메뉴에서 `www.axinova.ai` 사이트 선택

#### Step 2: 배포 설정 변경
1. **Site settings** → **Build & deploy** → **Build settings**
2. **"Stop auto publishing"** 클릭 (GitHub 자동 배포 중지)
3. **"Deploys"** 탭으로 이동
4. **"Drag and drop"** 영역에 `axinova-v4.3-ai-working.zip` 업로드

#### Step 3: 도메인 확인
- 배포 완료 후 https://www.axinova.ai 접속
- AI 챗봇 작동 확인

---

### 📌 **방법 3: Netlify CLI 배포 (개발자 추천)**

**장점:**
- ✅ 명령어로 즉시 배포
- ✅ 프로덕션/프리뷰 환경 선택 가능
- ✅ 기존 사이트에 직접 배포

**단계:**

#### Step 1: Netlify CLI 설치 (최초 1회)
```bash
cd /home/user/webapp
npm install -g netlify-cli
```

#### Step 2: Netlify 인증
```bash
netlify login
```
- 브라우저가 열리며 Netlify 계정 인증 요청
- "Authorize" 클릭

#### Step 3: 사이트 연결
```bash
# 기존 사이트에 연결
netlify link

# 또는 사이트 ID 직접 지정
netlify link --id=<SITE_ID>
```

#### Step 4: 프로덕션 배포
```bash
# 현재 디렉토리를 프로덕션으로 배포
netlify deploy --prod --dir=.
```

#### Step 5: 배포 확인
```bash
# 배포 상태 확인
netlify status

# 사이트 열기
netlify open:site
```

---

## 🎯 **권장 해결 순서**

### 1단계: Git 충돌 해결 (필수)
```bash
cd /home/user/webapp
git fetch origin main
git pull origin main --rebase

# 충돌 발생 시 해결
git add .
git rebase --continue

# 최종 푸시
git push origin main -f
```

### 2단계: Netlify 자동 배포 대기 (2-3분)
- Netlify가 GitHub 푸시를 감지하여 자동 배포 시작
- https://app.netlify.com/sites/<SITE_NAME>/deploys 에서 진행 상황 확인

### 3단계: 배포 확인
```bash
# 브라우저에서 확인
curl -I https://www.axinova.ai | grep -E "HTTP|date"
```

---

## 📊 배포 방식 비교

| 방식 | 속도 | Git 동기화 | CI/CD | 롤백 | 권장도 |
|------|------|-----------|-------|------|--------|
| GitHub 푸시 | 2-3분 | ✅ | ✅ | ✅ | ⭐⭐⭐⭐⭐ |
| Netlify Drop | 30초 | ❌ | ❌ | ❌ | ⭐⭐ |
| Netlify CLI | 1분 | 선택적 | ✅ | ✅ | ⭐⭐⭐⭐ |

---

## 🔧 즉시 실행 가능한 명령어 모음

### A. Git 동기화 + 자동 배포 (권장)
```bash
cd /home/user/webapp
git fetch origin main
git pull origin main --rebase
git add .
git commit -m "release: v4.3 AI Working - Complete deployment"
git push origin main
```

### B. Netlify CLI 직접 배포 (빠른 방법)
```bash
cd /home/user/webapp
npm install -g netlify-cli
netlify login
netlify link
netlify deploy --prod --dir=.
```

---

## 📞 지원 정보

**기술 지원:**
- 이메일: tech@axinova.ai.kr
- 전화: 070-8657-1948 (평일 09:00-18:00)
- 웹사이트: https://www.axinova.ai.kr

**Netlify 지원:**
- 문서: https://docs.netlify.com
- 커뮤니티: https://answers.netlify.com

---

## 📝 체크리스트

- [ ] Git 브랜치 충돌 해결
- [ ] 변경사항 커밋
- [ ] GitHub에 푸시
- [ ] Netlify 자동 배포 확인
- [ ] www.axinova.ai 접속 테스트
- [ ] AI 챗봇 작동 확인
- [ ] 모바일 테스트
- [ ] 다크모드 테스트

---

**최종 권장사항:** Git 푸시 방식 (방법 1)을 사용하여 버전 관리와 자동 배포의 이점을 모두 활용하세요.
