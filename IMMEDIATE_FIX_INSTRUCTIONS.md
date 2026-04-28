# 🚨 즉시 해결 방법 - www.axinova.ai.kr 배포 불일치 문제

## ⚠️ 현재 상황
- ✅ **임시 사이트**: https://69eec8586147a9b11d9670f9--admirable-melomakarona-67325f.netlify.app/ (v4.3 코드 있음)
- ❌ **프로덕션 사이트**: https://www.axinova.ai.kr (구버전, AI 챗봇 없음)

## 🎯 해결 방법: 올바른 사이트에 배포

---

## 방법 1: Netlify 대시보드에서 직접 업로드 (가장 쉬움) ⭐⭐⭐⭐⭐

### 📋 단계별 가이드

#### Step 1: 올바른 Netlify 사이트 접속
```
URL: https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
```

**중요**: `benevolent-pony-b21d5f` 사이트여야 합니다!

#### Step 2: 배포 업로드
1. 페이지를 아래로 스크롤
2. **"Need to update your site?"** 또는 **"Drag and drop your site folder here"** 찾기
3. `/home/user/webapp/axinova-netlify-final.zip` 파일을 해당 영역에 드래그 & 드롭

**또는:**

1. 우측 상단 **"Deploys"** 탭 클릭
2. 페이지 하단의 **드래그 & 드롭** 영역 찾기
3. ZIP 파일 업로드

#### Step 3: 배포 완료 확인
```
⏳ Uploading (5-10초)
⏳ Post-processing (10-20초)
⏳ Deploying (10-20초)
✅ Site is live
```

#### Step 4: 검증
1. https://www.axinova.ai.kr 접속
2. Ctrl + Shift + R (강제 새로고침)
3. 우측 하단 보라색 AI 챗봇 아이콘 확인 ✅
4. 교육프로그램 → 기술/개발 → "AI 교육 콘텐츠 개발 전문가" 12주 과정 확인 ✅

**예상 소요 시간**: 1-2분

---

## 방법 2: GitHub 자동 배포 트리거 (자동화) ⭐⭐⭐⭐⭐

### Step 1: Netlify 대시보드 접속
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
```

### Step 2: 수동 빌드 트리거
1. 우측 상단 **"Trigger deploy"** 버튼 클릭
2. **"Deploy site"** 선택
3. 빌드 시작 확인
4. 1-2분 대기

### Step 3: Build 로그 확인
```
Deploy log에서 다음 확인:
- ✅ Cloning repository
- ✅ Build command: echo '✅ AXINOVA Static Site - No build needed'
- ✅ Publishing directory: .
- ✅ Deploy succeeded
```

### Step 4: 검증
```
https://www.axinova.ai.kr
- AI 챗봇 아이콘 ✅
- 새 교육과정 ✅
```

**예상 소요 시간**: 2-3분

---

## 🔧 방법 3: ZIP 파일 다시 생성하여 업로드

만약 위 방법들이 작동하지 않으면:

### Step 1: 최신 ZIP 재생성
```bash
cd /home/user/webapp
rm -f axinova-production-final-v2.zip

zip -r axinova-production-final-v2.zip . \
  -x "*.zip" \
  -x "*.md" \
  -x ".git/*" \
  -x "node_modules/*" \
  -x "backend/*" \
  -x "logs/*" \
  -x "*.log" \
  -x ".gitignore" \
  -x ".gitkeep" \
  -x "deploy-direct/*"

ls -lh axinova-production-final-v2.zip
```

### Step 2: 업로드
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
→ axinova-production-final-v2.zip 드래그 & 드롭
```

---

## 📊 사이트 비교표

| 항목 | 임시 사이트 (현재) | 프로덕션 사이트 (목표) |
|------|-------------------|---------------------|
| **Site ID** | admirable-melomakarona-67325f | benevolent-pony-b21d5f |
| **URL** | https://69eec856...netlify.app | https://www.axinova.ai.kr |
| **AI 챗봇** | ✅ 있음 | ❌ 없음 → ✅ 배포 필요 |
| **새 과정** | ✅ 있음 | ❌ 없음 → ✅ 배포 필요 |
| **버전** | v4.3 | v4.0 (구버전) |
| **상태** | 임시 (삭제 가능) | 프로덕션 (유지) |

---

## ✅ 성공 확인 방법

### 1. 브라우저 테스트
```
1. https://www.axinova.ai.kr 접속
2. Ctrl + Shift + R (강제 새로고침)
3. 우측 하단 보라색 아이콘 확인
4. 클릭 → 챗봇 패널 열림
5. "초급자 AI 과정 추천해줘" 입력
6. 즉시 응답 확인
```

### 2. 개발자 도구 확인
```
F12 → Network 탭
- simple-ai-chat.js 로딩 확인 (200 OK)
- 크기: ~16 KB
```

### 3. cURL 테스트
```bash
# AI 챗봇 파일 확인
curl -I https://www.axinova.ai.kr/simple-ai-chat.js

# 예상 결과:
HTTP/2 200
content-type: application/javascript
```

---

## 🚨 주의사항

### ❌ 하지 말 것
- **Netlify Drop 사용 금지**: https://app.netlify.com/drop
  → 새로운 임시 사이트가 또 생성됩니다!
  
- **임시 사이트 URL 공유 금지**:
  → 프로덕션과 다른 사이트입니다

### ✅ 해야 할 것
- **올바른 사이트에만 배포**: benevolent-pony-b21d5f
- **배포 후 검증 필수**
- **브라우저 캐시 강제 새로고침**

---

## 📞 문제가 계속되면

### AXINOVA 기술 지원
- tech@axinova.ai.kr
- 070-8657-1948 (09:00-18:00)

### Netlify 정보
- **프로덕션 사이트**: https://app.netlify.com/sites/benevolent-pony-b21d5f
- **임시 사이트**: https://app.netlify.com/sites/admirable-melomakarona-67325f (삭제 가능)

---

## 🎯 권장 순서

1. **즉시 해결**: 방법 1 (Netlify 대시보드 업로드) - 1-2분
2. **장기 자동화**: 방법 2 (GitHub 자동 배포 설정) - 2-3분
3. **백업 방법**: 방법 3 (ZIP 재생성) - 3-5분

---

**다음 단계**: 위의 **방법 1** 또는 **방법 2**를 지금 바로 실행하세요!

**배포 파일**: `/home/user/webapp/axinova-netlify-final.zip` (353 KB)  
**목표 사이트**: https://www.axinova.ai.kr  
**Netlify 사이트 ID**: benevolent-pony-b21d5f
