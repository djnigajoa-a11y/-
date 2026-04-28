# AXINOVA 웹사이트 배포 최종 해결 방법

## 🚨 현재 문제
- Netlify Drop에서 ZIP 업로드 시 Post-processing이 멈춤
- 웹사이트 www.axinova.ai.kr에 변경사항이 반영되지 않음

## ✅ 해결 방법 (3가지 옵션)

### 방법 1: 폴더 직접 업로드 (가장 확실함) ⭐ 추천
1. `/home/user/webapp/deploy-direct/` 폴더를 로컬로 다운로드
2. Netlify 사이트 열기: https://app.netlify.com/sites/benevolent-pony-b21d5f/deploys
3. **폴더 자체**를 드래그 & 드롭 (ZIP이 아님)
4. 30초 내 배포 완료

### 방법 2: Ultra-Minimal ZIP (가장 빠름)
1. 파일: `axinova-ultra-minimal.zip` (81KB, 8개 핵심 파일만)
2. 포함: index.html, simple-ai-chat.js, styles.css, script.js, dark-mode.css, logo.png, netlify.toml, _redirects
3. Netlify Drop에 업로드
4. Post-processing 10-15초 완료

### 방법 3: GitHub 자동 배포 (가장 안정적) ⭐ 장기 추천
현재 이미 설정되어 있으나 Netlify 웹훅이 작동하지 않는 것으로 보임

#### 해결 단계:
1. Netlify 사이트 설정 확인
   - https://app.netlify.com/sites/benevolent-pony-b21d5f/settings
   - "Build & deploy" → "Continuous deployment" 확인
   
2. GitHub 연결 재설정
   - "Link repository" 클릭
   - 저장소: djnigajoa-a11y/-
   - 브랜치: main
   - Build command: (비워둠)
   - Publish directory: .

3. 수동 트리거
   - Deploys 탭 → "Trigger deploy" → "Deploy site"

## 📋 각 방법 비교

| 방법 | 속도 | 안정성 | 추천도 |
|------|------|--------|--------|
| 폴더 직접 업로드 | 30초 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ |
| Ultra-Minimal ZIP | 15초 | ⭐⭐⭐⭐ | ⭐⭐⭐⭐ |
| GitHub 자동 배포 | 1-2분 | ⭐⭐⭐⭐⭐ | ⭐⭐⭐⭐⭐ (장기) |

## 🔧 즉시 실행 가능한 해결책

### Option A: 폴더 업로드 (지금 바로)
```bash
# 이미 준비된 폴더 위치
/home/user/webapp/deploy-direct/

# 이 폴더를 Netlify에 드래그 & 드롭
```

### Option B: 초경량 ZIP (지금 바로)
```bash
# 이미 준비된 ZIP 위치
/home/user/webapp/axinova-ultra-minimal.zip (81KB)

# 이 ZIP을 Netlify에 업로드
```

## 📊 배포 후 확인 사항
1. ✅ 사이트 로딩: https://www.axinova.ai.kr
2. ✅ AI 챗봇 동작 (우측 하단 보라색 아이콘)
3. ✅ 새 과정 확인: 교육프로그램 > 기술/개발 > "AI 교육 콘텐츠 개발 전문가"
4. ✅ 다크모드 토글
5. ✅ 모바일 반응형

## 🆘 여전히 문제가 있다면

### Netlify 빌드 캐시 초기화
1. https://app.netlify.com/sites/benevolent-pony-b21d5f/settings
2. "Build & deploy" → "Build settings"
3. "Clear build cache" 클릭
4. 다시 배포 시도

### Netlify 지원 문의
- Site ID: benevolent-pony-b21d5f
- 문제: Post-processing stuck during ZIP upload
- Netlify Support: https://answers.netlify.com

## 📞 연락처
- AXINOVA: tech@axinova.ai.kr
- 전화: 070-8657-1948
- 운영시간: 09:00-18:00 (월-금)

---
생성일: 2026-04-28
버전: Final Solution v1.0
