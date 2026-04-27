# 📦 배포용 ZIP 파일 생성 완료

**생성 일시:** 2026-04-27 05:26 UTC (14:26 KST)  
**버전:** v4.3-production  
**파일 위치:** `/home/user/webapp`

---

## ✅ **생성된 ZIP 파일**

### **파일 정보:**

| 파일명 | 크기 | 설명 |
|--------|------|------|
| **axinova-website-production-v4.3.zip** | 388 KB | 배포용 ZIP (권장) ⭐ |
| axinova-deploy-20260427-052619.zip | 388 KB | 타임스탬프 버전 (백업용) |

**위치:**
```bash
/home/user/webapp/axinova-website-production-v4.3.zip
/home/user/webapp/axinova-deploy-20260427-052619.zip
```

---

## 📂 **ZIP 파일 내용**

### **포함된 파일: 104개**

```
총 파일:      104개
압축 후 크기:  388 KB
원본 크기:     약 1,013 KB (1.0 MB)
압축률:       약 62%
```

### **주요 파일:**

#### **1. 루트 파일 ⭐**
```
✅ index.html              (95 KB)   - 메인 페이지
✅ simple-ai-chat.js       (16 KB)   - AI 챗봇
✅ styles.css              (36 KB)   - 메인 스타일
✅ script.js               (11 KB)   - JavaScript
✅ logo.png                (52 KB)   - 로고
✅ dark-mode.css           (7.4 KB)  - 다크모드
✅ banners.css             (13 KB)   - 배너
✅ blog.html               (15 KB)   - 블로그
✅ blog.css                (19 KB)   - 블로그 스타일
✅ netlify.toml            (1.3 KB)  - Netlify 설정
✅ _redirects              (92 B)    - 리다이렉트
✅ robots.txt              - SEO 크롤러
✅ sitemap.xml             - 사이트맵
```

#### **2. 디렉토리:**
```
✅ about/              (2개)   - 소개 페이지
✅ admin/              (25개)  - 관리자 CMS
✅ images/             (7개)   - 이미지 자산
✅ lms/                (14개)  - 학습관리 시스템
✅ page-agent/         (2개)   - AI 에이전트
✅ payment/            (2개)   - 결제 시스템
✅ player/             (2개)   - 비디오 플레이어
✅ lab/                (1개)   - AI 실습
✅ programs/           - 프로그램 페이지
✅ 문서 파일            (9개)   - 기술 문서
```

---

## 🚫 **제외된 파일**

ZIP 파일에 포함되지 **않은** 파일들:

```
❌ .git/              - Git 저장소 (불필요)
❌ node_modules/      - Node.js 의존성 (불필요)
❌ backend/           - 백엔드 서버 (별도 배포)
❌ logs/              - 로그 파일
❌ *.log              - 로그 파일
❌ axinova-*.zip      - 기존 ZIP 백업
❌ *.bak              - 백업 파일
❌ *.tmp              - 임시 파일
❌ .gitkeep           - Git 유지 파일
```

---

## 🚀 **배포 방법**

### **방법 1: Netlify Drop (가장 빠름) ⭐**

**단계:**

1. **ZIP 파일 다운로드**
   ```bash
   # 파일 위치
   /home/user/webapp/axinova-website-production-v4.3.zip
   ```

2. **Netlify Drop 접속**
   ```
   https://app.netlify.com/drop
   ```

3. **ZIP 파일 드래그 앤 드롭**
   - 파일을 브라우저 창에 드래그
   - 자동 업로드 및 배포 (30-60초)

4. **임시 URL 생성**
   ```
   https://random-abc123.netlify.app
   ```

5. **도메인 연결 (선택)**
   - Site settings → Domain management
   - Add custom domain → `www.axinova.ai.kr`

**주의:**
- Netlify Drop은 **새로운 임시 사이트** 생성
- **www.axinova.ai.kr와 자동 연결 안 됨**
- 기존 사이트에 배포하려면 수동으로 도메인 연결 필요

---

### **방법 2: 기존 Netlify 사이트 업데이트**

**단계:**

1. **Netlify 대시보드 접속**
   ```
   https://app.netlify.com
   ```

2. **사이트 선택**
   - Sites → `www.axinova.ai.kr` 클릭

3. **Deploys 탭**
   - Deploys → "Drag and drop" 영역

4. **ZIP 파일 업로드**
   - `axinova-website-production-v4.3.zip` 드래그
   - 자동 배포 (1-2분)

5. **배포 완료 확인**
   - Status: **Published** ✅
   - URL: `https://www.axinova.ai.kr`

---

### **방법 3: Netlify CLI**

```bash
# Netlify CLI 설치 (최초 1회)
npm install -g netlify-cli

# 로그인
netlify login

# 사이트 연결
netlify link

# ZIP 압축 해제 후 배포
cd /home/user/webapp
unzip -q axinova-website-production-v4.3.zip -d deploy-temp
cd deploy-temp
netlify deploy --prod --dir=.

# 정리
cd ..
rm -rf deploy-temp
```

---

### **방법 4: FTP/SFTP 업로드**

**일반 웹 호스팅 사용 시:**

1. **ZIP 압축 해제**
   ```bash
   unzip axinova-website-production-v4.3.zip -d axinova-website
   ```

2. **FTP 클라이언트로 업로드**
   - FileZilla, WinSCP 등 사용
   - `axinova-website/` 폴더 내용을 `public_html/` 또는 `www/`에 업로드

3. **권한 설정**
   - HTML/CSS/JS 파일: 644
   - 디렉토리: 755

---

## 📋 **배포 전 체크리스트**

### **ZIP 파일 확인:**
- [x] 파일 생성 완료: `axinova-website-production-v4.3.zip`
- [x] 파일 크기: 388 KB (정상)
- [x] 포함 파일: 104개 (정상)
- [x] 주요 파일 확인: index.html, simple-ai-chat.js, netlify.toml

### **배포 전 준비:**
- [ ] 배포 방법 선택 (Netlify Drop / 기존 사이트 업데이트 / CLI)
- [ ] Netlify 계정 로그인 확인
- [ ] 도메인 연결 확인 (www.axinova.ai.kr)
- [ ] 백업 완료 (기존 사이트)

### **배포 후 확인:**
- [ ] www.axinova.ai.kr 접속 확인
- [ ] AI 챗봇 작동 확인
- [ ] 새 프로그램 표시 확인 (AI 교육 콘텐츠 개발 전문가)
- [ ] 모바일 반응형 확인
- [ ] 다크모드 토글 확인

---

## 🔍 **ZIP 파일 검증**

### **내용 확인:**
```bash
# ZIP 파일 목록 확인
unzip -l axinova-website-production-v4.3.zip

# 특정 파일 존재 확인
unzip -l axinova-website-production-v4.3.zip | grep "index.html"
unzip -l axinova-website-production-v4.3.zip | grep "simple-ai-chat.js"
unzip -l axinova-website-production-v4.3.zip | grep "netlify.toml"
```

### **압축 해제 테스트:**
```bash
# 임시 디렉토리에 압축 해제
mkdir -p /tmp/test-deploy
unzip -q axinova-website-production-v4.3.zip -d /tmp/test-deploy

# 주요 파일 확인
ls -lh /tmp/test-deploy/index.html
ls -lh /tmp/test-deploy/simple-ai-chat.js
ls -lh /tmp/test-deploy/netlify.toml

# 정리
rm -rf /tmp/test-deploy
```

---

## 📊 **파일 통계**

### **파일 유형별:**

| 유형 | 개수 | 예시 |
|------|------|------|
| HTML | 14개 | index.html, blog.html |
| JavaScript | 27개 | simple-ai-chat.js, script.js |
| CSS | 12개 | styles.css, dark-mode.css |
| 이미지 | 9개 | logo.png, placeholder-*.svg |
| Markdown | 9개 | 기술 문서 |
| 설정 | 3개 | netlify.toml, robots.txt |
| 기타 | 30개 | 디렉토리, 기타 자산 |

### **크기 분포:**

| 파일 크기 | 파일 개수 |
|----------|----------|
| 0-10 KB | 65개 |
| 10-50 KB | 30개 |
| 50-100 KB | 7개 |
| 100 KB+ | 2개 |

---

## 💡 **사용 시나리오**

### **시나리오 1: 빠른 테스트 배포**
```
목적: 변경사항을 빠르게 테스트

방법:
1. Netlify Drop에 ZIP 업로드
2. 임시 URL 생성
3. 테스트 후 삭제
```

### **시나리오 2: 프로덕션 배포**
```
목적: www.axinova.ai.kr 업데이트

방법:
1. Netlify 대시보드 → www.axinova.ai.kr 선택
2. Deploys 탭에서 ZIP 드래그
3. 자동 배포 완료
```

### **시나리오 3: 백업 및 아카이브**
```
목적: 버전 관리 및 백업

방법:
1. ZIP 파일을 안전한 위치에 저장
2. 버전 번호 포함 (v4.3)
3. 필요 시 복원 가능
```

### **시나리오 4: 다른 호스팅 서비스**
```
목적: Netlify 외 서비스에 배포

방법:
1. ZIP 압축 해제
2. FTP/SFTP로 업로드
3. 권한 설정 (644/755)
```

---

## 🛠️ **문제 해결**

### **문제 1: ZIP 파일이 너무 큼**

**증상:** 388 KB 이상

**해결:**
```bash
# 불필요한 파일 제거 후 재생성
cd /home/user/webapp
zip -r axinova-website-production-v4.3-minimal.zip . \
  -x "*.git/*" \
  -x "node_modules/*" \
  -x "backend/*" \
  -x "logs/*" \
  -x "*.log" \
  -x "*.zip" \
  -x "*.md" \
  -x "*.bak"
```

---

### **문제 2: 특정 파일이 누락됨**

**확인:**
```bash
unzip -l axinova-website-production-v4.3.zip | grep "파일명"
```

**해결:**
```bash
# ZIP 재생성
rm axinova-website-production-v4.3.zip
zip -r axinova-website-production-v4.3.zip . \
  -x "*.git/*" -x "node_modules/*" -x "backend/*"
```

---

### **문제 3: 압축 해제 오류**

**증상:** "invalid zip file" 오류

**해결:**
```bash
# ZIP 파일 무결성 확인
unzip -t axinova-website-production-v4.3.zip

# 재생성
zip -r axinova-website-production-v4.3-new.zip . \
  -x "*.git/*" -x "node_modules/*" -x "backend/*"
```

---

## 📞 **지원 정보**

**AXINOVA:**
- 이메일: tech@axinova.ai.kr
- 전화: 070-8657-1948
- 웹사이트: https://www.axinova.ai.kr

**Netlify:**
- 문서: https://docs.netlify.com
- Drop: https://app.netlify.com/drop
- 커뮤니티: https://answers.netlify.com

---

## 🎯 **최종 요약**

### **생성된 파일:**
```
파일명:  axinova-website-production-v4.3.zip
위치:    /home/user/webapp/
크기:    388 KB
파일 수:  104개
버전:    v4.3-production
```

### **배포 권장 방법:**
```
1. Netlify Drop (가장 빠름)
   → https://app.netlify.com/drop

2. 기존 사이트 업데이트
   → Netlify 대시보드 → Deploys 탭

3. Netlify CLI
   → netlify deploy --prod
```

### **포함 내용:**
```
✅ 메인 페이지 (index.html)
✅ AI 챗봇 (simple-ai-chat.js)
✅ 완전한 웹사이트 구조 (104개 파일)
✅ 관리자 CMS
✅ 학습관리 시스템
✅ 결제 시스템
✅ Netlify 설정 (netlify.toml)
```

---

**🎉 배포용 ZIP 파일이 준비되었습니다!**

**다음 단계:**
1. ZIP 파일 다운로드: `/home/user/webapp/axinova-website-production-v4.3.zip`
2. Netlify Drop 접속: https://app.netlify.com/drop
3. ZIP 파일 드래그 앤 드롭
4. 배포 완료! ✨
