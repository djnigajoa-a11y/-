/**
 * AXINOVA Page Agent - AI-Powered Web Navigation Assistant
 * 자연어로 웹사이트를 조작할 수 있는 AI 에이전트
 */

class AXINOVAPageAgent {
    constructor(options = {}) {
        // API 설정
        this.apiBaseURL = options.apiBaseURL || 'https://5002-ioxgvskekko4g8h04bu68-dfc00ec5.sandbox.novita.ai/api/page-agent';
        this.model = options.model || 'gemini-2.5-flash';
        this.userId = options.userId || 'user-' + Date.now();
        
        // UI 커스터마이징 옵션
        this.config = {
            title: options.title || 'AXINOVA AI 에이전트',
            subtitle: options.subtitle || 'Powered by Google Gemini',
            placeholder: options.placeholder || "예: '초급자용 AI 과정 추천해줘'",
            welcomeMessage: options.welcomeMessage || '저는 AXINOVA AI 에이전트입니다.<br>자연어로 명령하시면 원하시는 작업을 도와드립니다.',
            sendButtonText: options.sendButtonText || '전송',
            themeColor: options.themeColor || '#a78bfa'
        };
        
        // 대화 기록
        this.messages = [];
        this.isProcessing = false;
        
        this.init();
    }
    
    init() {
        this.createUI();
        this.attachEventListeners();
        this.showWelcomeMessage();
    }
    
    createUI() {
        const container = document.createElement('div');
        container.className = 'page-agent-container';
        container.innerHTML = `
            <!-- 플로팅 버튼 -->
            <button class="page-agent-fab" id="pageAgentFab" title="AI 에이전트 열기">
                <i class="fas fa-robot"></i>
            </button>
            
            <!-- 메인 패널 -->
            <div class="page-agent-panel" id="pageAgentPanel">
                <!-- 헤더 -->
                <div class="page-agent-header">
                    <div>
                        <h3>🤖 ${this.config.title}</h3>
                        <p>${this.config.subtitle}</p>
                    </div>
                    <button class="page-agent-close" id="pageAgentClose">
                        <i class="fas fa-times"></i>
                    </button>
                </div>
                
                <!-- 메시지 영역 -->
                <div class="page-agent-messages" id="pageAgentMessages">
                    <div class="page-agent-welcome">
                        <h4>👋 안녕하세요!</h4>
                        <p>${this.config.welcomeMessage}</p>
                        <div class="page-agent-examples">
                            <div class="page-agent-example-chip" data-command="초급자용 AI 과정 추천해줘">
                                💡 초급자용 AI 과정 추천
                            </div>
                            <div class="page-agent-example-chip" data-command="국비지원 과정 보여줘">
                                💰 국비지원 과정 보기
                            </div>
                            <div class="page-agent-example-chip" data-command="수강 신청 방법 알려줘">
                                📝 수강 신청 방법
                            </div>
                            <div class="page-agent-example-chip" data-command="블로그로 이동해줘">
                                📰 블로그로 이동
                            </div>
                        </div>
                    </div>
                </div>
                
                <!-- 입력 영역 -->
                <div class="page-agent-input-area">
                    <div class="page-agent-input-wrapper">
                        <textarea 
                            class="page-agent-input" 
                            id="pageAgentInput" 
                            placeholder="${this.config.placeholder}"
                            rows="1"
                        ></textarea>
                        <button class="page-agent-send" id="pageAgentSend">
                            <i class="fas fa-paper-plane"></i>
                        </button>
                    </div>
                </div>
            </div>
            
            <!-- 확인 다이얼로그 -->
            <div class="page-agent-confirm" id="pageAgentConfirm">
                <div class="page-agent-confirm-dialog">
                    <h4 id="confirmTitle">작업 확인</h4>
                    <p id="confirmMessage"></p>
                    <div class="page-agent-confirm-buttons">
                        <button class="page-agent-confirm-btn cancel" id="confirmCancel">
                            취소
                        </button>
                        <button class="page-agent-confirm-btn confirm" id="confirmOk">
                            확인
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        document.body.appendChild(container);
        
        // 요소 참조 저장
        this.fab = document.getElementById('pageAgentFab');
        this.panel = document.getElementById('pageAgentPanel');
        this.closeBtn = document.getElementById('pageAgentClose');
        this.messagesContainer = document.getElementById('pageAgentMessages');
        this.input = document.getElementById('pageAgentInput');
        this.sendBtn = document.getElementById('pageAgentSend');
        this.confirmDialog = document.getElementById('pageAgentConfirm');
    }
    
    attachEventListeners() {
        // 플로팅 버튼 클릭
        this.fab.addEventListener('click', () => this.togglePanel());
        
        // 닫기 버튼
        this.closeBtn.addEventListener('click', () => this.closePanel());
        
        // 전송 버튼
        this.sendBtn.addEventListener('click', () => this.sendMessage());
        
        // Enter 키로 전송 (Shift+Enter는 줄바꿈)
        this.input.addEventListener('keydown', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.sendMessage();
            }
        });
        
        // 자동 높이 조절
        this.input.addEventListener('input', () => {
            this.input.style.height = 'auto';
            this.input.style.height = Math.min(this.input.scrollHeight, 100) + 'px';
        });
        
        // 예시 명령어 칩 클릭
        document.addEventListener('click', (e) => {
            if (e.target.classList.contains('page-agent-example-chip')) {
                const command = e.target.dataset.command;
                this.input.value = command;
                this.input.focus();
            }
        });
        
        // 확인 다이얼로그 버튼
        document.getElementById('confirmCancel').addEventListener('click', () => {
            this.confirmDialog.classList.remove('show');
            if (this.confirmReject) this.confirmReject();
        });
        
        document.getElementById('confirmOk').addEventListener('click', () => {
            this.confirmDialog.classList.remove('show');
            if (this.confirmResolve) this.confirmResolve();
        });
    }
    
    togglePanel() {
        if (this.panel.classList.contains('show')) {
            this.closePanel();
        } else {
            this.openPanel();
        }
    }
    
    openPanel() {
        this.panel.classList.add('show');
        this.fab.classList.add('active');
        this.input.focus();
    }
    
    closePanel() {
        this.panel.classList.remove('show');
        this.fab.classList.remove('active');
    }
    
    showWelcomeMessage() {
        // 환영 메시지는 HTML에 이미 있음
    }
    
    addMessage(role, content) {
        // 환영 메시지 제거
        const welcome = this.messagesContainer.querySelector('.page-agent-welcome');
        if (welcome) {
            welcome.remove();
        }
        
        const messageDiv = document.createElement('div');
        messageDiv.className = `page-agent-message ${role}`;
        
        const avatar = role === 'user' ? '👤' : '🤖';
        
        messageDiv.innerHTML = `
            <div class="page-agent-avatar">${avatar}</div>
            <div class="page-agent-bubble">${this.formatMessage(content)}</div>
        `;
        
        this.messagesContainer.appendChild(messageDiv);
        this.scrollToBottom();
    }
    
    addLoadingIndicator() {
        const loadingDiv = document.createElement('div');
        loadingDiv.className = 'page-agent-message assistant';
        loadingDiv.id = 'pageAgentLoading';
        loadingDiv.innerHTML = `
            <div class="page-agent-avatar">🤖</div>
            <div class="page-agent-bubble">
                <div class="page-agent-loading">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        
        this.messagesContainer.appendChild(loadingDiv);
        this.scrollToBottom();
    }
    
    removeLoadingIndicator() {
        const loading = document.getElementById('pageAgentLoading');
        if (loading) {
            loading.remove();
        }
    }
    
    scrollToBottom() {
        this.messagesContainer.scrollTop = this.messagesContainer.scrollHeight;
    }
    
    formatMessage(content) {
        // 간단한 Markdown 형식 지원
        return content
            .replace(/\n/g, '<br>')
            .replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')
            .replace(/\*(.*?)\*/g, '<em>$1</em>')
            .replace(/`(.*?)`/g, '<code>$1</code>');
    }
    
    async sendMessage() {
        const message = this.input.value.trim();
        if (!message || this.isProcessing) return;
        
        // 사용자 메시지 추가
        this.addMessage('user', message);
        this.input.value = '';
        this.input.style.height = 'auto';
        
        // 메시지 히스토리에 추가
        this.messages.push({
            role: 'user',
            content: message
        });
        
        // 로딩 표시
        this.isProcessing = true;
        this.sendBtn.disabled = true;
        this.addLoadingIndicator();
        
        try {
            // 시스템 프롬프트 추가 (첫 요청시)
            const messagesToSend = this.messages.length === 1 ? [
                {
                    role: 'system',
                    content: `당신은 AXINOVA 평생교육원의 AI 에이전트입니다.
                    
사용자의 자연어 명령을 이해하고, 다음과 같은 작업을 도와주세요:

1. **교육 과정 안내**: 30종의 AI 교육 과정 정보 제공
   - 초급: AI 코딩 입문, 프롬프트 엔지니어링, 노코드 챗봇 등
   - 중급: RPA 자동화, AI 콘텐츠 크리에이터, 데이터 분석가 등
   - 고급: AI 에이전트 설계, LLM 애플리케이션 개발자 등

2. **국비지원 과정**: 10개 국비지원 과정 안내 (수강료 전액 무료)

3. **수강 신청**: 수강 신청 프로세스 안내 및 페이지 이동

4. **사이트 네비게이션**: 
   - 홈, 소개, 교육 프로그램, 특징, 로드맵, 블로그, 문의 페이지로 이동
   - My강의실, 로그인, 회원가입 페이지로 이동

5. **정보 검색**: FAQ, 환불 규정, 이용약관 등 정보 제공

응답 시:
- 친절하고 전문적인 톤 유지
- 구체적인 행동 제안 (예: "○○ 페이지로 이동할까요?")
- 추가 질문 유도

현재 페이지: ${window.location.pathname}
`
                },
                ...this.messages
            ] : this.messages;
            
            // API 호출
            const response = await fetch(this.apiBaseURL, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    messages: messagesToSend,
                    model: this.model,
                    userId: this.userId,
                    temperature: 0.7,
                    max_tokens: 1000
                })
            });
            
            if (!response.ok) {
                const error = await response.json();
                throw new Error(error.error || '응답을 받을 수 없습니다.');
            }
            
            const data = await response.json();
            const assistantMessage = data.choices[0].message.content;
            
            // 어시스턴트 메시지 추가
            this.removeLoadingIndicator();
            this.addMessage('assistant', assistantMessage);
            
            // 메시지 히스토리에 추가
            this.messages.push({
                role: 'assistant',
                content: assistantMessage
            });
            
            // 액션 실행 (페이지 이동 등)
            await this.executeActions(assistantMessage);
            
        } catch (error) {
            console.error('Page Agent Error:', error);
            this.removeLoadingIndicator();
            this.addMessage('assistant', `⚠️ 죄송합니다. 오류가 발생했습니다.\n\n${error.message}\n\n다시 시도해주세요.`);
        } finally {
            this.isProcessing = false;
            this.sendBtn.disabled = false;
        }
    }
    
    async executeActions(message) {
        // 간단한 액션 감지 및 실행
        const lowerMessage = message.toLowerCase();
        
        // 페이지 이동 감지
        if (lowerMessage.includes('이동') || lowerMessage.includes('페이지') || lowerMessage.includes('가기')) {
            let targetPage = null;
            
            if (lowerMessage.includes('블로그')) targetPage = 'blog.html';
            else if (lowerMessage.includes('프로그램') || lowerMessage.includes('과정')) targetPage = '#programs';
            else if (lowerMessage.includes('수강 신청')) targetPage = 'program-apply.html';
            else if (lowerMessage.includes('로그인')) targetPage = 'login.html';
            else if (lowerMessage.includes('회원가입')) targetPage = 'register.html';
            else if (lowerMessage.includes('강의실') || lowerMessage.includes('lms')) targetPage = 'my-classroom-lms.html';
            else if (lowerMessage.includes('문의')) targetPage = 'consultation.html';
            else if (lowerMessage.includes('faq') || lowerMessage.includes('자주')) targetPage = 'faq.html';
            
            if (targetPage) {
                const confirmed = await this.showConfirm(
                    '페이지 이동',
                    `${targetPage} 페이지로 이동하시겠습니까?`
                );
                
                if (confirmed) {
                    if (targetPage.startsWith('#')) {
                        const element = document.querySelector(targetPage);
                        if (element) {
                            element.scrollIntoView({ behavior: 'smooth' });
                        }
                    } else {
                        window.location.href = targetPage;
                    }
                }
            }
        }
    }
    
    showConfirm(title, message) {
        return new Promise((resolve, reject) => {
            document.getElementById('confirmTitle').textContent = title;
            document.getElementById('confirmMessage').textContent = message;
            this.confirmDialog.classList.add('show');
            
            this.confirmResolve = () => resolve(true);
            this.confirmReject = () => resolve(false);
        });
    }
}

// PageAgent 별칭 export (하위 호환성)
window.PageAgent = AXINOVAPageAgent;

// 자동 초기화는 비활성화 (index.html에서 수동으로 초기화)
// 필요시 index.html에서 new PageAgent({...})로 초기화하세요
