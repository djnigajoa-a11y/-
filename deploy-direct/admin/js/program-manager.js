// 프로그램 데이터 관리
const ProgramManager = {
    storageKey: 'axinova_programs',
    
    // 초기 프로그램 데이터
    defaultPrograms: [
        {
            id: 'ai-basic-office',
            title: '생성형 AI 오피스 자동화 전문가',
            category: 'ai-basic',
            level: '기초',
            duration: '4-6주',
            price: 0,
            originalPrice: 0,
            isFree: true,
            description: 'ChatGPT, Claude 등을 활용한 업무 자동화 실습',
            objectives: ['Excel/PPT 작업 자동화', 'AI 기반 문서 작성', '업무 효율 200% 향상'],
            prerequisites: '컴퓨터 기본 사용 능력',
            instructor: '박서영 대표',
            curriculum: [
                { week: 1, topic: 'AI 도구 소개 및 설정', hours: 4 },
                { week: 2, topic: 'ChatGPT 업무 활용', hours: 4 },
                { week: 3, topic: 'Excel/PPT 자동화', hours: 4 },
                { week: 4, topic: '실무 프로젝트', hours: 4 }
            ],
            features: ['실시간 온라인', '녹화 복습', '수료증 발급'],
            status: 'active',
            enrollmentCount: 245,
            rating: 4.8,
            reviewCount: 89,
            imageUrl: '',
            createdAt: '2026-01-15',
            updatedAt: '2026-02-20'
        },
        {
            id: 'ai-agent-expert',
            title: 'AI 에이전트 설계 전문가',
            category: 'ai-advanced',
            level: '고급',
            duration: '12주',
            price: 1200000,
            originalPrice: 1500000,
            isFree: false,
            description: 'LangChain, AutoGPT를 활용한 AI 에이전트 설계 및 구축',
            objectives: ['AI 에이전트 아키텍처 이해', 'LangChain 마스터', '실전 프로젝트 포트폴리오'],
            prerequisites: 'Python 기초, API 사용 경험',
            instructor: '김민준 교수',
            curriculum: [
                { week: 1-3, topic: 'AI 에이전트 기초', hours: 12 },
                { week: 4-6, topic: 'LangChain 심화', hours: 12 },
                { week: 7-9, topic: 'AutoGPT 실습', hours: 12 },
                { week: 10-12, topic: '최종 프로젝트', hours: 12 }
            ],
            features: ['실시간 온라인', '녹화 복습', '프로젝트 실습', '포트폴리오 제작', '수료증 발급', '취업 지원'],
            status: 'active',
            enrollmentCount: 87,
            rating: 4.9,
            reviewCount: 45,
            imageUrl: '',
            createdAt: '2026-01-10',
            updatedAt: '2026-02-20'
        },
        {
            id: 'llm-developer',
            title: 'LLM 개발자 (RAG & Fine-tuning)',
            category: 'development',
            level: '고급',
            duration: '14주',
            price: 1500000,
            originalPrice: 1800000,
            isFree: false,
            description: 'LLM 개발의 모든 것: RAG 시스템 구축부터 Fine-tuning까지',
            objectives: ['RAG 시스템 설계', 'Fine-tuning 실습', 'Production 배포'],
            prerequisites: 'Python 필수, 머신러닝 기초',
            instructor: '이준호 박사',
            curriculum: [
                { week: 1-4, topic: 'LLM 기초 및 API', hours: 16 },
                { week: 5-8, topic: 'RAG 시스템 구축', hours: 16 },
                { week: 9-12, topic: 'Fine-tuning', hours: 16 },
                { week: 13-14, topic: '최종 프로젝트', hours: 8 }
            ],
            features: ['실시간 온라인', '녹화 복습', '프로젝트 실습', '포트폴리오 제작', '수료증 발급', '취업 지원'],
            status: 'active',
            enrollmentCount: 68,
            rating: 5.0,
            reviewCount: 52,
            imageUrl: '',
            createdAt: '2026-01-05',
            updatedAt: '2026-02-20'
        }
    ],

    // 프로그램 로드
    loadPrograms() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            this.savePrograms(this.defaultPrograms);
            return this.defaultPrograms;
        }
        return JSON.parse(stored);
    },

    // 프로그램 저장
    savePrograms(programs) {
        localStorage.setItem(this.storageKey, JSON.stringify(programs));
    },

    // 모든 프로그램 가져오기
    getAll() {
        return this.loadPrograms();
    },

    // ID로 프로그램 가져오기
    getById(id) {
        const programs = this.loadPrograms();
        return programs.find(p => p.id === id);
    },

    // 프로그램 추가
    add(program) {
        const programs = this.loadPrograms();
        const newProgram = {
            ...program,
            id: program.id || this.generateId(),
            createdAt: new Date().toISOString().split('T')[0],
            updatedAt: new Date().toISOString().split('T')[0]
        };
        programs.push(newProgram);
        this.savePrograms(programs);
        return newProgram;
    },

    // 프로그램 수정
    update(id, updates) {
        const programs = this.loadPrograms();
        const index = programs.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        programs[index] = {
            ...programs[index],
            ...updates,
            id: programs[index].id,
            createdAt: programs[index].createdAt,
            updatedAt: new Date().toISOString().split('T')[0]
        };
        this.savePrograms(programs);
        return programs[index];
    },

    // 프로그램 삭제
    delete(id) {
        const programs = this.loadPrograms();
        const filtered = programs.filter(p => p.id !== id);
        this.savePrograms(filtered);
        return filtered.length < programs.length;
    },

    // ID 생성
    generateId() {
        return 'prog_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // 통계
    getStats() {
        const programs = this.loadPrograms();
        return {
            total: programs.length,
            active: programs.filter(p => p.status === 'active').length,
            inactive: programs.filter(p => p.status === 'inactive').length,
            totalEnrollments: programs.reduce((sum, p) => sum + (p.enrollmentCount || 0), 0),
            avgRating: programs.reduce((sum, p) => sum + (p.rating || 0), 0) / programs.length
        };
    }
};

// Export for use in other scripts
if (typeof module !== 'undefined' && module.exports) {
    module.exports = ProgramManager;
}
