# 🚨 Netlify Drop 배포 문제 진단 보고서

**작성일시:** 2026-04-27 05:35 UTC (14:35 KST)  
**문제:** Netlify Drop에 ZIP 업로드했으나 www.axinova.ai.kr에 미반영  
**상태:** 🔴 원인 분석 및 해결 방안 제시

---

## 🔍 **문제 원인 분석**

### **핵심 원인: Netlify Drop vs GitHub 자동 배포 충돌**

```
❌ 잘못된 이해:
Netlify Drop 업로드 → www.axinova.ai.kr 자동 업데이트

✅ 실제 작동 방식:
Netlify Drop 업로드 → 새로운 임시 사이트 생성 (예: random-abc.netlify.app)
www.axinova.ai.kr → GitHub Repository 연동 (자동 배포)
```

---

## 📋 **상세 문제 설명**

### **1. Netlify Drop의 실제 동작**

**Netlify Drop 업로드 시:**
```
ZIP 파일 업로드 (axinova-website-production-v4.3.zip)
    ↓
Netlify가 새로운 사이트 생성
    ↓
임시 URL 발급
    ↓
https://random-abc123.netlify.app  ← 새 사이트
```

**결과:**
- ✅ 새로운 Netlify 사이트 생성됨
- ✅ 임시 URL로 접속 가능
- ❌ **www.axinova.ai.kr와 연결 안 됨**

---

### **2. www.axinova.ai.kr의 실제 배포 방식**

**현재 설정:**
```
www.axinova.ai.kr (도메인)
    ↓
Netlify 사이트 (특정 Site ID)
    ↓
GitHub Repository 연동
    ↓
main 브랜치 모니터링
    ↓
자동 배포 (CI/CD)
```

**작동 원리:**
- www.axinova.ai.kr는 **특정 Netlify 사이트**에 연결됨
- 해당 사이트는 **GitHub Repository와 연동**
- GitHub `main` 브랜치 푸시 시 **자동 배포**
- Netlify Drop 업로드는 **완전히 별개의 사이트** 생성

---

## 🎯 **비유로 이해하기**

```
비유: 아파트 (www.axinova.ai.kr)

❌ 잘못된 방법:
→ 새 집을 지음 (Netlify Drop)
→ 새 주소를 받음 (random-abc.netlify.app)
→ 기존 아파트 주소(www.axinova.ai.kr)는 그대로
→ 사람들은 여전히 옛날 아파트로 감

✅ 올바른 방법:
→ 기존 아파트 내부를 리모델링 (GitHub 푸시)
→ 주소는 그대로 (www.axinova.ai.kr)
→ 사람들이 같은 주소로 와서 새 인테리어를 봄
```

---

## ✅ **해결 방법**

### **방법 1: GitHub 푸시 (권장) ⭐**

**이유:**
- www.axinova.ai.kr가 GitHub와 연동되어 있음
- 자동 배포 시스템 활용
- 버전 관리 및 롤백 가능

**단계:**

#### **Step 1: 최신 변경사항 커밋**
```bash
cd /home/user/webapp

# 새 문서 추가
git add ZIP_DEPLOYMENT_GUIDE.md

# 커밋
git commit -m "docs: Add ZIP deployment guide"

# GitHub에 푸시
git push origin main
```

#### **Step 2: Netlify 자동 배포 대기**
```
[05:36:00] GitHub 푸시 완료
[05:36:05] Netlify 웹훅 트리거
[05:36:10] 빌드 시작 (1-2분)
[05:37:30] CDN 배포
[05:37:45] www.axinova.ai.kr 업데이트 완료 ✅
```

#### **Step 3: 배포 확인**
```
1. Netlify 대시보드: https://app.netlify.com
2. Sites → www.axinova.ai.kr
3. Deploys 탭 → 최신 배포 "Published" 확인
4. 브라우저 캐시 삭제 후 www.axinova.ai.kr 접속
```

---

### **방법 2: 기존 Netlify 사이트에 직접 업로드**

**이유:**
- Netlify Drop이 아닌 **기존 사이트**에 업로드
- www.axinova.ai.kr 도메인 유지

**단계:**

#### **Step 1: Netlify 대시보드 접속**
```
https://app.netlify.com
```

#### **Step 2: 기존 사이트 선택**
```
1. Sites 메뉴 클릭
2. 사이트 목록에서 "www.axinova.ai.kr" 또는 연결된 사이트 찾기
3. 사이트 이름 클릭
```

#### **Step 3: 수동 배포**
```
1. Deploys 탭 클릭
2. 페이지 하단 "Drag and drop" 영역 찾기
3. axinova-website-production-v4.3.zip 드래그
4. 자동 배포 시작 (1-2분)
```

#### **Step 4: 배포 완료 확인**
```
1. Deploy log 확인
2. Status: "Published" 표시
3. www.axinova.ai.kr 접속 테스트
```

**주의사항:**
- **"New site from drag and drop"가 아님!**
- **기존 사이트의 Deploys 탭**에서 업로드해야 함
- Site settings → Build & deploy → "Stop auto publishing" 필요 (옵션)

---

### **방법 3: Netlify CLI로 기존 사이트 배포**

**이유:**
- 명령어로 정확하게 기존 사이트에 배포
- 사이트 ID 지정 가능

**단계:**

#### **Step 1: Netlify CLI 설치 및 로그인**
```bash
cd /home/user/webapp

# CLI 설치 (최초 1회)
npm install -g netlify-cli

# 로그인
netlify login
# → 브라우저 열림 → "Authorize" 클릭
```

#### **Step 2: 기존 사이트 연결**
```bash
# 사이트 목록 확인
netlify sites:list

# 사이트 연결 (대화형)
netlify link

# 또는 사이트 ID로 직접 연결
netlify link --id=<SITE_ID>
```

#### **Step 3: 배포**
```bash
# 현재 디렉토리를 프로덕션으로 배포
netlify deploy --prod --dir=.

# 또는 ZIP 압축 해제 후 배포
mkdir deploy-temp
unzip -q axinova-website-production-v4.3.zip -d deploy-temp
cd deploy-temp
netlify deploy --prod --dir=.
cd ..
rm -rf deploy-temp
```

#### **Step 4: 배포 확인**
```bash
# 배포 상태 확인
netlify status

# 사이트 열기
netlify open:site
```

---

### **방법 4: Netlify Drop 사이트에 도메인 연결 (비권장)**

**이유:**
- Netlify Drop으로 생성된 **새 사이트**에 도메인 재연결
- 기존 자동 배포 설정 손실
- 복잡하고 권장하지 않음

**단계 (참고용):**

#### **Step 1: Netlify Drop 사이트 찾기**
```
1. Netlify 대시보드
2. Sites 메뉴
3. 최근 생성된 사이트 찾기 (random-abc123)
```

#### **Step 2: 도메인 재연결**
```
1. 새 사이트 선택
2. Site settings → Domain management
3. Add custom domain → "www.axinova.ai.kr"
4. DNS 설정 확인
```

#### **Step 3: 기존 사이트 도메인 제거**
```
1. 기존 www.axinova.ai.kr 사이트 선택
2. Site settings → Domain management
3. www.axinova.ai.kr 도메인 제거
```

**주의:**
- ⚠️ GitHub 자동 배포 연결 끊김
- ⚠️ 이후 배포는 수동으로 해야 함
- ⚠️ CI/CD 파이프라인 손실

---

## 🎯 **권장 해결 순서**

### **최선의 방법: GitHub 푸시 (방법 1)**

```bash
cd /home/user/webapp

# 1. 미커밋 파일 추가
git add ZIP_DEPLOYMENT_GUIDE.md

# 2. 커밋
git commit -m "docs: Add ZIP deployment guide"

# 3. GitHub 푸시
git push origin main

# 4. Netlify 자동 배포 대기 (1-2분)

# 5. 브라우저 캐시 삭제 후 www.axinova.ai.kr 접속
```

**장점:**
- ✅ 자동 배포 시스템 활용
- ✅ 버전 관리 유지
- ✅ 롤백 가능
- ✅ CI/CD 파이프라인 유지
- ✅ 가장 안전하고 추천

---

### **대안: 기존 사이트에 직접 업로드 (방법 2)**

```
1. Netlify 대시보드: https://app.netlify.com
2. Sites → www.axinova.ai.kr (기존 사이트 선택!)
3. Deploys 탭
4. "Drag and drop" 영역에 ZIP 업로드
5. 배포 완료 대기 (1-2분)
```

**장점:**
- ✅ 즉시 배포 가능
- ✅ 도메인 연결 유지
- ❌ Git 동기화 필요

---

## 📊 **Netlify 사이트 구조 이해**

### **현재 상황:**

```
Netlify 계정
├── 사이트 A (www.axinova.ai.kr 연결) ← 기존 사이트
│   ├── 도메인: www.axinova.ai.kr
│   ├── GitHub: https://github.com/djnigajoa-a11y/-
│   ├── 브랜치: main
│   └── 자동 배포: ✅ 활성화
│
└── 사이트 B (random-abc.netlify.app) ← Netlify Drop으로 생성
    ├── 도메인: random-abc.netlify.app (임시)
    ├── GitHub: ❌ 연결 없음
    ├── 수동 업로드: ✅ ZIP 파일
    └── 자동 배포: ❌ 없음
```

**문제:**
- Netlify Drop 업로드 → **사이트 B** 생성
- www.axinova.ai.kr → **사이트 A** 연결
- 두 사이트는 완전히 별개!

---

## 🔧 **즉시 실행 가능한 명령어**

### **옵션 1: GitHub 푸시 (권장)**

```bash
cd /home/user/webapp
git add ZIP_DEPLOYMENT_GUIDE.md
git commit -m "docs: Add ZIP deployment guide"
git push origin main
```

**예상 결과:**
```
[05:36:00] GitHub 푸시 완료 ✅
[05:36:05] Netlify 웹훅 트리거 ✅
[05:36:10] 빌드 시작 ⏳
[05:37:30] www.axinova.ai.kr 업데이트 완료 🎉
```

---

### **옵션 2: Netlify CLI 배포**

```bash
cd /home/user/webapp

# Netlify CLI 설치 (최초 1회)
npm install -g netlify-cli

# 로그인
netlify login

# 사이트 연결
netlify link

# 배포
netlify deploy --prod --dir=.
```

---

## 🎯 **핵심 요약**

### **문제 원인:**
```
Netlify Drop 업로드 → 새 사이트 생성 (random-abc.netlify.app)
www.axinova.ai.kr → 기존 사이트 (GitHub 연동)
→ 두 사이트가 별개이므로 도메인에 반영 안 됨
```

### **해결 방법:**
```
방법 1 (권장): GitHub 푸시 → 자동 배포
방법 2: 기존 Netlify 사이트에 직접 ZIP 업로드
방법 3: Netlify CLI로 기존 사이트에 배포
```

### **권장 조치:**
```bash
cd /home/user/webapp
git add .
git commit -m "deploy: Update website to v4.3"
git push origin main

# 1-2분 후 www.axinova.ai.kr 확인
```

---

## 📞 **지원 정보**

**AXINOVA:**
- 이메일: tech@axinova.ai.kr
- 전화: 070-8657-1948

**Netlify:**
- 대시보드: https://app.netlify.com
- 문서: https://docs.netlify.com
- 지원: https://answers.netlify.com

---

**🎯 결론: Netlify Drop은 새 사이트를 만듭니다. www.axinova.ai.kr를 업데이트하려면 GitHub 푸시 또는 기존 사이트에 직접 업로드해야 합니다!**
