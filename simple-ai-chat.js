/**
 * Simple AI Chat Assistant for AXINOVA
 * Pure JavaScript - No external dependencies
 */

class SimpleAIChat {
    constructor() {
        this.isOpen = false;
        this.messages = [];
        this.init();
    }

    init() {
        this.createUI();
        this.attachEvents();
        this.addWelcomeMessage();
    }

    createUI() {
        // Create chat button
        const chatBtn = document.createElement('button');
        chatBtn.id = 'aiChatBtn';
        chatBtn.className = 'ai-chat-btn';
        chatBtn.innerHTML = '<i class="fas fa-robot"></i>';
        chatBtn.title = 'AI 도우미';
        document.body.appendChild(chatBtn);

        // Create chat panel
        const chatPanel = document.createElement('div');
        chatPanel.id = 'aiChatPanel';
        chatPanel.className = 'ai-chat-panel';
        chatPanel.innerHTML = `
            <div class="ai-chat-header">
                <div class="ai-chat-header-content">
                    <div class="ai-avatar">🤖</div>
                    <div class="ai-info">
                        <div class="ai-name">AXINOVA AI 도우미</div>
                        <div class="ai-status">온라인</div>
                    </div>
                </div>
                <button id="aiChatClose" class="ai-chat-close">✕</button>
            </div>
            <div id="aiChatMessages" class="ai-chat-messages"></div>
            <div class="ai-chat-input-area">
                <input type="text" id="aiChatInput" placeholder="무엇을 도와드릴까요?" />
                <button id="aiChatSend" class="ai-chat-send">
                    <i class="fas fa-paper-plane"></i>
                </button>
            </div>
        `;
        document.body.appendChild(chatPanel);

        // Add styles
        this.addStyles();
    }

    addStyles() {
        const style = document.createElement('style');
        style.textContent = `
            .ai-chat-btn {
                position: fixed;
                bottom: 2rem;
                right: 2rem;
                width: 60px;
                height: 60px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                font-size: 1.8rem;
                cursor: pointer;
                box-shadow: 0 4px 20px rgba(102, 126, 234, 0.4);
                z-index: 1000;
                transition: all 0.3s ease;
                display: flex;
                align-items: center;
                justify-content: center;
            }

            .ai-chat-btn:hover {
                transform: scale(1.1);
                box-shadow: 0 6px 25px rgba(102, 126, 234, 0.6);
            }

            .ai-chat-panel {
                position: fixed;
                bottom: 100px;
                right: 2rem;
                width: 380px;
                height: 550px;
                background: white;
                border-radius: 16px;
                box-shadow: 0 10px 40px rgba(0,0,0,0.2);
                z-index: 1001;
                display: none;
                flex-direction: column;
                overflow: hidden;
                animation: slideUp 0.3s ease;
            }

            .ai-chat-panel.open {
                display: flex;
            }

            @keyframes slideUp {
                from {
                    opacity: 0;
                    transform: translateY(20px);
                }
                to {
                    opacity: 1;
                    transform: translateY(0);
                }
            }

            .ai-chat-header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                padding: 1rem;
                display: flex;
                justify-content: space-between;
                align-items: center;
            }

            .ai-chat-header-content {
                display: flex;
                align-items: center;
                gap: 0.75rem;
            }

            .ai-avatar {
                width: 40px;
                height: 40px;
                background: rgba(255,255,255,0.2);
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.5rem;
            }

            .ai-info {
                display: flex;
                flex-direction: column;
            }

            .ai-name {
                font-weight: 600;
                font-size: 1rem;
            }

            .ai-status {
                font-size: 0.75rem;
                opacity: 0.9;
            }

            .ai-chat-close {
                background: none;
                border: none;
                color: white;
                font-size: 1.5rem;
                cursor: pointer;
                width: 32px;
                height: 32px;
                display: flex;
                align-items: center;
                justify-content: center;
                border-radius: 50%;
                transition: background 0.2s;
            }

            .ai-chat-close:hover {
                background: rgba(255,255,255,0.2);
            }

            .ai-chat-messages {
                flex: 1;
                overflow-y: auto;
                padding: 1rem;
                display: flex;
                flex-direction: column;
                gap: 1rem;
                background: #f5f5f5;
            }

            .ai-message {
                display: flex;
                gap: 0.5rem;
                animation: fadeIn 0.3s ease;
            }

            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }

            .ai-message.user {
                flex-direction: row-reverse;
            }

            .ai-message-avatar {
                width: 32px;
                height: 32px;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.2rem;
                flex-shrink: 0;
            }

            .ai-message.bot .ai-message-avatar {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            }

            .ai-message.user .ai-message-avatar {
                background: #e0e0e0;
            }

            .ai-message-content {
                max-width: 70%;
                padding: 0.75rem 1rem;
                border-radius: 12px;
                line-height: 1.5;
            }

            .ai-message.bot .ai-message-content {
                background: white;
                color: #333;
                border-bottom-left-radius: 4px;
            }

            .ai-message.user .ai-message-content {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border-bottom-right-radius: 4px;
            }

            .ai-chat-input-area {
                padding: 1rem;
                background: white;
                border-top: 1px solid #e0e0e0;
                display: flex;
                gap: 0.5rem;
            }

            #aiChatInput {
                flex: 1;
                padding: 0.75rem 1rem;
                border: 2px solid #e0e0e0;
                border-radius: 24px;
                font-size: 0.95rem;
                outline: none;
                transition: border-color 0.2s;
            }

            #aiChatInput:focus {
                border-color: #667eea;
            }

            .ai-chat-send {
                width: 44px;
                height: 44px;
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                color: white;
                border: none;
                border-radius: 50%;
                cursor: pointer;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: transform 0.2s;
            }

            .ai-chat-send:hover {
                transform: scale(1.1);
            }

            .ai-chat-send:disabled {
                opacity: 0.5;
                cursor: not-allowed;
            }

            .ai-typing {
                display: flex;
                gap: 4px;
                padding: 0.5rem;
            }

            .ai-typing span {
                width: 8px;
                height: 8px;
                background: #667eea;
                border-radius: 50%;
                animation: typing 1.4s infinite;
            }

            .ai-typing span:nth-child(2) {
                animation-delay: 0.2s;
            }

            .ai-typing span:nth-child(3) {
                animation-delay: 0.4s;
            }

            @keyframes typing {
                0%, 60%, 100% { transform: translateY(0); }
                30% { transform: translateY(-10px); }
            }

            /* Dark mode support */
            [data-theme="dark"] .ai-chat-panel {
                background: #1a1a1a;
            }

            [data-theme="dark"] .ai-chat-messages {
                background: #0d0d0d;
            }

            [data-theme="dark"] .ai-message.bot .ai-message-content {
                background: #2a2a2a;
                color: #f5f5f5;
            }

            [data-theme="dark"] .ai-chat-input-area {
                background: #1a1a1a;
                border-top-color: #333;
            }

            [data-theme="dark"] #aiChatInput {
                background: #2a2a2a;
                border-color: #333;
                color: #f5f5f5;
            }

            /* Mobile responsive */
            @media (max-width: 768px) {
                .ai-chat-panel {
                    width: calc(100vw - 2rem);
                    right: 1rem;
                    height: 70vh;
                    max-height: 600px;
                }

                .ai-chat-btn {
                    bottom: 1rem;
                    right: 1rem;
                }
            }
        `;
        document.head.appendChild(style);
    }

    attachEvents() {
        const chatBtn = document.getElementById('aiChatBtn');
        const chatPanel = document.getElementById('aiChatPanel');
        const closeBtn = document.getElementById('aiChatClose');
        const sendBtn = document.getElementById('aiChatSend');
        const input = document.getElementById('aiChatInput');

        chatBtn.addEventListener('click', () => this.toggleChat());
        closeBtn.addEventListener('click', () => this.closeChat());
        sendBtn.addEventListener('click', () => this.sendMessage());
        input.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') this.sendMessage();
        });
    }

    toggleChat() {
        this.isOpen = !this.isOpen;
        const panel = document.getElementById('aiChatPanel');
        panel.classList.toggle('open', this.isOpen);
    }

    closeChat() {
        this.isOpen = false;
        document.getElementById('aiChatPanel').classList.remove('open');
    }

    addWelcomeMessage() {
        this.addMessage('bot', `안녕하세요! AXINOVA AI 도우미입니다. 😊

교육 과정, 수강 신청, 시설 안내 등 궁금하신 점을 물어보세요!

**자주 묻는 질문:**
• 초급자 AI 과정 추천
• 국비지원 과정 안내
• 수강료 및 할인 혜택
• 수강 신청 방법`);
    }

    addMessage(type, content) {
        const messagesDiv = document.getElementById('aiChatMessages');
        const messageEl = document.createElement('div');
        messageEl.className = `ai-message ${type}`;
        
        const avatar = type === 'bot' ? '🤖' : '👤';
        messageEl.innerHTML = `
            <div class="ai-message-avatar">${avatar}</div>
            <div class="ai-message-content">${content}</div>
        `;
        
        messagesDiv.appendChild(messageEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    showTyping() {
        const messagesDiv = document.getElementById('aiChatMessages');
        const typingEl = document.createElement('div');
        typingEl.id = 'aiTyping';
        typingEl.className = 'ai-message bot';
        typingEl.innerHTML = `
            <div class="ai-message-avatar">🤖</div>
            <div class="ai-message-content">
                <div class="ai-typing">
                    <span></span>
                    <span></span>
                    <span></span>
                </div>
            </div>
        `;
        messagesDiv.appendChild(typingEl);
        messagesDiv.scrollTop = messagesDiv.scrollHeight;
    }

    hideTyping() {
        const typingEl = document.getElementById('aiTyping');
        if (typingEl) typingEl.remove();
    }

    async sendMessage() {
        const input = document.getElementById('aiChatInput');
        const message = input.value.trim();
        
        if (!message) return;

        // Add user message
        this.addMessage('user', message);
        input.value = '';

        // Show typing indicator
        this.showTyping();

        // Get AI response
        const response = await this.getAIResponse(message);
        
        // Hide typing and show response
        this.hideTyping();
        this.addMessage('bot', response);
    }

    async getAIResponse(message) {
        // Simple keyword-based responses for common questions
        const responses = {
            '초급': `초급자분들께 추천드리는 과정입니다:

**🎯 프롬프트 엔지니어링 전문가**
- 기간: 6주
- 난이도: 초급
- 효과적인 AI 활용 기법 학습

**⚡ 생성형 AI 사무 자동화**
- 기간: 8주  
- 국비지원 가능
- 업무 생산성 향상

더 자세한 정보가 필요하시면 070-8657-1948로 문의해주세요!`,

            '국비': `국비지원 과정 안내드립니다:

**생성형 AI 사무 자동화** (8주)
- 문서/보고/회의록 자동화
- 100% 국비지원

**AI 활용 데이터분석 취업형** (12주)
- 실무 프로젝트 중심
- 포트폴리오 완성

**노코드 AI 챗봇 구축** (8주)
- 챗봇 MVP 제작
- 운영 매뉴얼 제공

상담 문의: 070-8657-1948`,

            '수강료': `수강료 및 할인 정보:

**정규 과정**
- 프롬프트 엔지니어링: 50만원
- AI 에이전트 설계: 120만원
- LLM 애플리케이션 개발: 150만원

**할인 혜택**
- 조기 등록: 10% 할인
- 2개 과정 동시 수강: 15% 할인
- 국비지원 과정: 100% 무료

자세한 상담: 070-8657-1948`,

            '신청': `수강 신청 방법:

**온라인 신청**
1. 홈페이지 방문 (www.axinova.ai.kr)
2. 원하는 과정 선택
3. 수강 신청 버튼 클릭
4. 신청서 작성 및 제출

**전화 신청**
- 전화: 070-8657-1948
- 운영시간: 평일 09:00-18:00

**방문 신청**
- 상담 후 현장 등록 가능

궁금하신 점이 더 있으시면 편하게 물어보세요!`,

            '평생교육사': `평생교육사 2급 과정 안내:

**과정 개요**
- AXINOVA는 교육부 인가 평생교육원입니다
- 평생교육사 2급 자격 과정 운영

**취득 방법**
1. 필수 과목 이수
2. 실습 과정 완료
3. 자격 신청

**문의**
- 전화: 070-8657-1948
- 평일 상담 가능

자세한 커리큘럼은 전화 상담을 통해 안내드립니다.`
        };

        // Find matching response
        for (const keyword in responses) {
            if (message.includes(keyword)) {
                return responses[keyword];
            }
        }

        // Default response
        return `감사합니다! 😊

문의하신 내용에 대해 정확한 안내를 도와드리겠습니다.

**상담 방법:**
- 📞 전화: 070-8657-1948
- 📧 이메일: info@axinova.ai.kr
- 🕐 운영시간: 평일 09:00-18:00

아래 내용도 확인해보세요:
• 교육 프로그램 목록
• 수강 신청 안내
• FAQ 및 자주 묻는 질문

다른 궁금하신 점이 있으시면 편하게 물어보세요!`;
    }
}

// Initialize on page load
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => new SimpleAIChat());
} else {
    new SimpleAIChat();
}
