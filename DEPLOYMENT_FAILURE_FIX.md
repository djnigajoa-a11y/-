# 🚨 긴급: 배포 실패 원인 및 해결책

## 문제 확인

### 배포 실패 증거
```
현재 axinova.ai.kr의 index.html: 83,211 bytes
준비한 axinova-netlify-final.zip의 index.html: 95,316 bytes

차이: 12,105 bytes (약 12 KB)
결론: 업로드한 ZIP이 실제로 배포되지 않음
```

### 추가 증거
- `simple-ai-chat.js` 파일은 존재 (HTTP 200)
- 하지만 `index.html`에 포함되지 않음 (grep 결과 0)
- **배포는 일부만 진행되었거나, 잘못된 사이트에 업로드됨**

---

## ✅ 즉시 해결 방법

### 방법 1: GitHub Netlify 연동 확인 및 수동 트리거

#### 문제점
Netlify 사이트가 GitHub 저장소와 연결되어 있지만, 자동 배포가 작동하지 않을 수 있습니다.

#### 해결 단계

**1단계: Netlify 사이트 설정 확인**
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/settings/deploys
```

**2단계: GitHub 연결 상태 확인**
- "Continuous deployment" 섹션에서
- "Link repository" 또는 "Repository" 정보 확인
- 연결되어 있지 않다면 → **GitHub 재연결 필요**

**3단계: 수동 배포 트리거**
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
```
- 우측 상단 **"Trigger deploy"** 버튼 클릭
- **"Deploy site"** 선택
- 또는 **"Clear cache and deploy site"** (캐시 문제 해결)

**4단계: 배포 로그 확인**
- 배포 시작 후 **로그 확인**
- 에러 메시지 체크
- "Site is live" 메시지 대기

---

### 방법 2: 직접 폴더 업로드 (ZIP 말고)

#### 문제점
ZIP 파일 업로드 시 압축 해제나 처리 과정에서 문제 발생 가능

#### 해결 단계

**1단계: ZIP 파일 압축 해제**
```bash
cd /home/user/webapp
mkdir netlify-deploy-folder
unzip -q axinova-netlify-final.zip -d netlify-deploy-folder
```

**2단계: Netlify에서 폴더 직접 업로드**
```
https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
```
- **폴더 전체**를 드래그 & 드롭
- ZIP이 아닌 **폴더 자체**를 업로드

---

### 방법 3: Netlify CLI 사용 (가장 확실)

#### 명령어 실행

```bash
# 1. Netlify CLI 설치 확인
which netlify || npm install -g netlify-cli

# 2. 로그인 (브라우저 열림)
netlify login

# 3. 배포 (프로덕션)
cd /home/user/webapp
netlify deploy \
  --prod \
  --site benevolent-pony-b21d5f \
  --dir . \
  --message "v4.3 deployment - AI chatbot and new course"

# 4. 배포 완료 확인
# CLI에서 배포 URL 출력됨
```

---

## 🔍 배포 상태 확인 방법

### 즉시 확인 명령어
```bash
# 1. 파일 크기 확인
echo "현재 배포된 크기:"
curl -sI https://axinova.ai.kr/index.html | grep content-length

echo -e "\n기대 크기: 95316"

# 2. simple-ai-chat 포함 여부
echo -e "\n현재 HTML에 simple-ai-chat 포함 개수:"
curl -s https://axinova.ai.kr | grep -c "simple-ai-chat"

echo "기대 개수: 1 (최소)"

# 3. AI 챗봇 파일 확인
echo -e "\nsimple-ai-chat.js 상태:"
curl -sI https://axinova.ai.kr/simple-ai-chat.js | grep HTTP

echo "기대: HTTP/2 200"
```

### 브라우저 확인
1. **캐시 완전 삭제**
   - Ctrl + Shift + Delete
   - "모든 시간" 선택
   - "캐시된 이미지 및 파일" 체크
   - 삭제 실행

2. **Incognito 모드**
   - Ctrl + Shift + N (Chrome)
   - https://www.axinova.ai.kr 접속
   - AI 챗봇 아이콘 확인

3. **강제 새로고침**
   - Ctrl + F5 (Windows)
   - Cmd + Shift + R (Mac)

---

## 📋 체크리스트

### 즉시 확인할 사항
- [ ] Netlify 사이트 ID 확인: `benevolent-pony-b21d5f`
- [ ] Netlify Deploys 페이지에서 최신 배포 확인
- [ ] 배포 시간이 최근 (지난 10분 이내)인지 확인
- [ ] 배포 상태가 "Published" 또는 "Site is live"인지 확인
- [ ] 배포 로그에 에러 없는지 확인

### 배포 후 확인
- [ ] `curl -s https://axinova.ai.kr | grep -c "simple-ai-chat"` → 1 이상
- [ ] `curl -sI https://axinova.ai.kr/index.html | grep content-length` → 95316
- [ ] 브라우저 Incognito 모드에서 AI 챗봇 아이콘 표시
- [ ] 챗봇 클릭 시 패널 열림
- [ ] 새 교육과정 표시 (교육프로그램 → 기술/개발)

---

## 🚨 가능한 원인

### 1. 잘못된 사이트에 업로드
- **임시 사이트** (admirable-melomakarona-67325f)에 업로드했을 가능성
- **올바른 사이트**: benevolent-pony-b21d5f

### 2. 캐시 문제
- CDN 캐시가 이전 버전 제공
- 해결: "Clear cache and deploy site"

### 3. 배포 실패
- Netlify에서 배포 중 에러 발생
- 해결: 배포 로그 확인

### 4. GitHub 자동 배포 미작동
- GitHub 연결이 끊어짐
- 해결: GitHub 재연결 또는 수동 트리거

---

## 💡 즉시 실행 가능한 해결책 (우선순위)

### 🥇 1순위: Netlify 수동 트리거 (1분)
```
1. https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
2. "Trigger deploy" → "Clear cache and deploy site"
3. 로그 확인
4. "Site is live" 대기
```

### 🥈 2순위: Netlify CLI 배포 (3분)
```bash
cd /home/user/webapp
netlify login
netlify deploy --prod --site benevolent-pony-b21d5f --dir .
```

### 🥉 3순위: 폴더 직접 업로드 (5분)
```
1. ZIP 압축 해제
2. 폴더 전체를 Netlify에 드래그 & 드롭
```

---

**생성일**: 2026-04-28 21:00 UTC  
**상태**: 🚨 배포 실패 확인, 해결 방법 제시  
**다음 단계**: 위의 1순위 방법 즉시 실행
