# 🚨 배포 불일치 문제 해결 가이드

## 문제 상황 분석

### ❌ 현재 상태
1. **임시 Netlify 사이트** (Drop으로 생성된 새 사이트):
   - URL: https://69eec8586147a9b11d9670f9--admirable-melomakarona-67325f.netlify.app/
   - Site ID: `admirable-melomakarona-67325f`
   - 상태: ✅ v4.3 코드 포함 (AI 챗봇, 새 과정 등)
   - 문제: **www.axinova.ai.kr과 연결되지 않음**

2. **실제 프로덕션 사이트**:
   - URL: https://www.axinova.ai.kr → https://axinova.ai.kr
   - Site ID: `benevolent-pony-b21d5f`
   - 상태: ❌ 구버전 (AI 챗봇 없음, 새 과정 없음)
   - 문제: **최신 코드가 배포되지 않음**

### 🔍 근본 원인
Netlify Drop을 사용하여 ZIP 파일을 업로드하면 **새로운 임시 사이트**가 생성됩니다.  
이는 기존의 www.axinova.ai.kr과 **완전히 별개의 사이트**입니다.

---

## ✅ 해결 방법 (3가지 옵션)

### 방법 1: 기존 Netlify 사이트에 직접 배포 ⭐⭐⭐⭐⭐ (가장 확실함)

#### Step 1: Netlify 대시보드 접속
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
```

#### Step 2: 새 배포 업로드
1. 페이지 중간의 **"Need to update your site?"** 섹션 찾기
2. **"Drag and drop your site output folder here"** 영역 확인
3. `/home/user/webapp/axinova-netlify-final.zip` 파일을 해당 영역에 드래그 & 드롭
4. 또는 우측 상단 **"Deploys"** 탭에서 **드래그 & 드롭 영역** 사용

#### Step 3: 배포 확인
- Deploys 목록에서 새 배포 상태 확인
- "Site is live" 메시지 대기 (30-60초)
- https://www.axinova.ai.kr 접속하여 확인

---

### 방법 2: 임시 사이트에 커스텀 도메인 연결 (대안)

#### Step 1: 임시 사이트 접속
```
https://app.netlify.com/sites/admirable-melomakarona-67325f/settings/domain
```

#### Step 2: 커스텀 도메인 추가
1. "Add custom domain" 클릭
2. `www.axinova.ai.kr` 입력
3. DNS 설정 안내에 따라 도메인 연결

⚠️ **주의**: 이 방법은 기존 사이트에서 도메인을 제거해야 하므로 다운타임 발생 가능

---

### 방법 3: GitHub를 통한 자동 배포 ⭐⭐⭐⭐⭐ (장기 추천)

현재 코드는 이미 GitHub에 푸시되었으므로 Netlify 자동 배포를 활성화하면 됩니다.

#### Step 1: Netlify Build 설정 확인
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/settings/deploys
```

#### Step 2: Continuous Deployment 설정
1. **"Build & deploy"** 섹션 확인
2. **"Continuous deployment"** 설정
3. **Repository**: `djnigajoa-a11y/-` 확인
4. **Branch**: `main` 확인
5. **Build command**: (비워둠) 또는 `echo 'Static site'`
6. **Publish directory**: `.` (현재 디렉토리)

#### Step 3: 수동 빌드 트리거
1. **Deploys** 탭으로 이동
2. **"Trigger deploy"** 버튼 클릭
3. **"Deploy site"** 선택
4. 빌드 완료 대기 (1-2분)

#### Step 4: 자동 배포 활성화 확인
```
Settings → Build & deploy → Build hooks
```
- GitHub 푸시 시 자동으로 배포되도록 웹훅 확인

---

## 🔧 즉시 실행 가능한 명령어

### 옵션 A: Netlify CLI로 직접 배포 (추천)

```bash
# 1. Netlify CLI 설치 (이미 설치되어 있으면 생략)
npm install -g netlify-cli

# 2. 로그인
netlify login

# 3. 사이트 연결
netlify link --id benevolent-pony-b21d5f

# 4. 배포
cd /home/user/webapp
netlify deploy --prod --dir=.

# 또는 ZIP 파일 압축 해제 후 배포
mkdir temp-deploy
unzip -q axinova-netlify-final.zip -d temp-deploy
cd temp-deploy
netlify deploy --prod --dir=. --site benevolent-pony-b21d5f
```

---

### 옵션 B: cURL로 Netlify API 직접 호출

```bash
# 1. Netlify Personal Access Token 필요
# https://app.netlify.com/user/applications#personal-access-tokens

# 2. 배포 생성
NETLIFY_TOKEN="your_token_here"
SITE_ID="benevolent-pony-b21d5f"

# ZIP 파일 업로드
curl -X POST \
  https://api.netlify.com/api/v1/sites/${SITE_ID}/deploys \
  -H "Authorization: Bearer ${NETLIFY_TOKEN}" \
  -H "Content-Type: application/zip" \
  --data-binary @axinova-netlify-final.zip
```

---

## 📋 각 방법 비교

| 방법 | 난이도 | 소요시간 | 안정성 | 추천도 |
|------|--------|----------|--------|--------|
| **방법 1: 대시보드 드래그 & 드롭** | ⭐ 쉬움 | 30-60초 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **방법 2: 도메인 재연결** | ⭐⭐⭐ 어려움 | 5-10분 | ⭐⭐⭐ | ⭐ |
| **방법 3: GitHub 자동 배포** | ⭐⭐ 보통 | 1-2분 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| **옵션 A: Netlify CLI** | ⭐⭐ 보통 | 1-2분 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |

---

## 🎯 추천 실행 순서

### 1️⃣ 즉시 해결 (방법 1)
```
1. https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys 접속
2. axinova-netlify-final.zip 드래그 & 드롭
3. 30-60초 대기
4. www.axinova.ai.kr 확인
```

### 2️⃣ 장기 자동화 (방법 3)
```
1. Netlify 설정에서 GitHub 자동 배포 활성화
2. 이후 Git 푸시만으로 자동 배포
3. CI/CD 파이프라인 완성
```

---

## 🔍 배포 후 검증 방법

### 1. AI 챗봇 확인
```bash
# simple-ai-chat.js 파일이 로드되는지 확인
curl -I https://www.axinova.ai.kr/simple-ai-chat.js

# 예상 결과: HTTP/2 200
```

### 2. 새 교육과정 확인
```bash
# HTML에서 새 과정 찾기
curl -s https://www.axinova.ai.kr | grep -i "AI 교육 콘텐츠 개발 전문가"

# 결과가 있으면 ✅ 배포 성공
```

### 3. 페이지 로드 확인
```bash
# 브라우저에서 확인
1. https://www.axinova.ai.kr 접속
2. 우측 하단 보라색 AI 챗봇 아이콘 확인
3. F12 개발자 도구 → Network 탭 → simple-ai-chat.js 로딩 확인
```

---

## 📞 지원 정보

### AXINOVA 기술 지원
- **이메일**: tech@axinova.ai.kr
- **전화**: 070-8657-1948
- **운영시간**: 09:00-18:00 (월-금)

### Netlify 지원
- **프로덕션 사이트 ID**: benevolent-pony-b21d5f
- **임시 사이트 ID**: admirable-melomakarona-67325f
- **Dashboard**: https://app.netlify.com
- **Support**: https://answers.netlify.com

### 배포 파일 정보
- **파일**: `/home/user/webapp/axinova-netlify-final.zip`
- **크기**: 353 KB
- **파일 수**: 93개
- **버전**: v4.3-production-final
- **Git 커밋**: 538011a

---

## 📝 문제 해결 체크리스트

- [ ] 프로덕션 사이트 ID 확인: `benevolent-pony-b21d5f`
- [ ] Netlify 대시보드 접속
- [ ] axinova-netlify-final.zip 다운로드 확인
- [ ] ZIP 파일을 올바른 사이트에 업로드
- [ ] 배포 완료 대기 (30-60초)
- [ ] www.axinova.ai.kr 접속
- [ ] AI 챗봇 동작 확인
- [ ] 새 교육과정 표시 확인
- [ ] 브라우저 캐시 강제 새로고침 (Ctrl+Shift+R)

---

## 🚨 중요 안내

### ❌ 하지 말아야 할 것
- Netlify Drop (https://app.netlify.com/drop) 사용 금지
  → 새로운 임시 사이트가 생성됨
- 임시 사이트 URL 공유 금지
  → 프로덕션 사이트와 다른 사이트임

### ✅ 해야 할 것
- 기존 프로덕션 사이트 (benevolent-pony-b21d5f)에만 배포
- GitHub 자동 배포 활성화 (장기적)
- 배포 후 반드시 검증

---

**생성일**: 2026-04-28 19:45 UTC  
**버전**: v1.0  
**상태**: ✅ 해결 방법 준비 완료

**다음 단계**: 위의 **방법 1**을 즉시 실행하여 프로덕션 사이트에 배포
