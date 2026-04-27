// ===================================
// AXINOVA 평생교육원 - My강의실 메인 JavaScript
// ===================================

// 전역 변수
let currentUser = null;
let currentTab = 'dashboard';

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializePage();
});

// 페이지 초기화
function initializePage() {
    // 사용자 정보 로드
    loadUserInfo();
    
    // 탭 이벤트 설정
    setupTabNavigation();
    
    // 초기 데이터 로드
    loadDashboardData();
    
    // 필터 버튼 설정
    setupFilterButtons();
}

// 사용자 정보 로드
function loadUserInfo() {
    // localStorage에서 사용자 정보 가져오기
    const userInfo = JSON.parse(localStorage.getItem('userInfo')) || {
        name: '학습자',
        email: 'student@axinova.ai.kr'
    };
    
    currentUser = userInfo;
    document.getElementById('userName').textContent = userInfo.name;
    document.getElementById('userNameDisplay').textContent = userInfo.name + '님';
}

// 탭 네비게이션 설정
function setupTabNavigation() {
    const tabBtns = document.querySelectorAll('.lms-tab');
    
    tabBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const targetTab = this.getAttribute('data-tab');
            switchTab(targetTab);
        });
    });
}

// 탭 전환
function switchTab(tabName) {
    // 모든 탭 버튼과 패널 비활성화
    document.querySelectorAll('.lms-tab').forEach(btn => btn.classList.remove('active'));
    document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
    
    // 선택된 탭 활성화
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    document.getElementById(tabName).classList.add('active');
    
    currentTab = tabName;
    
    // 탭별 데이터 로드
    loadTabData(tabName);
}

// 탭 데이터 로드
function loadTabData(tabName) {
    switch(tabName) {
        case 'dashboard':
            loadDashboardData();
            break;
        case 'courses':
            loadCoursesData();
            break;
        case 'assignments':
            loadAssignmentsData();
            break;
        case 'exams':
            loadExamsData();
            break;
        case 'grades':
            loadGradesData();
            break;
        case 'certificates':
            loadCertificatesData();
            break;
    }
}

// 대시보드 데이터 로드
function loadDashboardData() {
    // 통계 업데이트
    updateStats();
    
    // 진행 중인 과정
    loadActiveCourses();
    
    // 마감 임박 과제
    loadUpcomingAssignments();
    
    // 예정된 시험
    loadUpcomingExams();
}

// 통계 업데이트
function updateStats() {
    const courses = getSampleCourses();
    const active = courses.filter(c => c.status === 'in-progress');
    const completed = courses.filter(c => c.status === 'completed');
    
    document.getElementById('totalCourses').textContent = courses.length;
    document.getElementById('activeCourses').textContent = active.length;
    document.getElementById('completedCourses').textContent = completed.length;
    document.getElementById('totalCertificates').textContent = completed.length;
}

// 진행 중인 과정 로드
function loadActiveCourses() {
    const container = document.getElementById('activeCoursesContainer');
    const courses = getSampleCourses().filter(c => c.status === 'in-progress');
    
    if (courses.length === 0) {
        container.innerHTML = '<p class="empty-message">진행 중인 과정이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = courses.map(course => createCourseCard(course)).join('');
}

// 과정 카드 생성
function createCourseCard(course) {
    const statusText = {
        'in-progress': '진행중',
        'completed': '완료',
        'upcoming': '예정'
    };
    
    return `
        <div class="course-card" onclick="window.location.href='course-detail.html?id=${course.id}'">
            <div class="course-thumbnail">
                <div style="font-size: 48px; color: white;">📚</div>
                <span class="course-status-badge status-${course.status}">
                    ${statusText[course.status]}
                </span>
            </div>
            <div class="course-info">
                <h3>${course.title}</h3>
                <div class="course-meta">
                    <span><i class="fas fa-user"></i> ${course.instructor}</span>
                    <span><i class="fas fa-clock"></i> ${course.duration}</span>
                </div>
                <div class="progress-container">
                    <div class="progress-header">
                        <span class="progress-label">학습 진도</span>
                        <span class="progress-value">${course.progress}%</span>
                    </div>
                    <div class="progress-bar">
                        <div class="progress-fill" style="width: ${course.progress}%"></div>
                    </div>
                </div>
                <div class="course-actions">
                    <button class="btn-course btn-primary" onclick="event.stopPropagation(); startLearning('${course.id}')">
                        <i class="fas fa-play"></i> 학습하기
                    </button>
                </div>
            </div>
        </div>
    `;
}

// 마감 임박 과제 로드
function loadUpcomingAssignments() {
    const container = document.getElementById('upcomingAssignments');
    const assignments = getSampleAssignments()
        .filter(a => a.status === 'pending')
        .slice(0, 3);
    
    if (assignments.length === 0) {
        container.innerHTML = '<p class="empty-message">마감 임박 과제가 없습니다.</p>';
        return;
    }
    
    container.innerHTML = assignments.map(assignment => `
        <div class="alert-item" onclick="window.location.href='pages/assignment-submit.html?id=${assignment.id}'">
            <div class="alert-icon">
                <i class="fas fa-exclamation-circle" style="color: #f59e0b;"></i>
            </div>
            <div class="alert-content">
                <h4>${assignment.title}</h4>
                <p>마감: ${formatDate(assignment.dueDate)}</p>
            </div>
            <div class="alert-action">
                <button class="btn-course btn-outline">제출하기</button>
            </div>
        </div>
    `).join('');
}

// 예정된 시험 로드
function loadUpcomingExams() {
    const container = document.getElementById('upcomingExams');
    const exams = getSampleExams()
        .filter(e => e.status === 'available')
        .slice(0, 3);
    
    if (exams.length === 0) {
        container.innerHTML = '<p class="empty-message">예정된 시험이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = exams.map(exam => `
        <div class="alert-item" onclick="window.location.href='pages/exam-take.html?id=${exam.id}'">
            <div class="alert-icon">
                <i class="fas fa-file-alt" style="color: #2563eb;"></i>
            </div>
            <div class="alert-content">
                <h4>${exam.title}</h4>
                <p>시작: ${formatDate(exam.startDate)}</p>
            </div>
            <div class="alert-action">
                <button class="btn-course btn-primary">응시하기</button>
            </div>
        </div>
    `).join('');
}

// 과정 데이터 로드
function loadCoursesData() {
    const container = document.getElementById('allCoursesContainer');
    const courses = getSampleCourses();
    
    container.innerHTML = courses.map(course => createCourseCard(course)).join('');
}

// 과제 데이터 로드
function loadAssignmentsData() {
    const container = document.getElementById('assignmentsContainer');
    const assignments = getSampleAssignments();
    
    container.innerHTML = assignments.map(assignment => createAssignmentCard(assignment)).join('');
}

// 과제 카드 생성
function createAssignmentCard(assignment) {
    const priorityText = {
        'high': '높음',
        'medium': '보통',
        'low': '낮음'
    };
    
    const statusText = {
        'pending': '미제출',
        'submitted': '제출완료',
        'graded': '채점완료'
    };
    
    return `
        <div class="assignment-card">
            <div class="assignment-header">
                <div class="assignment-title">
                    <h3>${assignment.title}</h3>
                    <span class="assignment-course">${assignment.courseTitle}</span>
                </div>
                <span class="assignment-priority priority-${assignment.priority}">
                    ${priorityText[assignment.priority]}
                </span>
            </div>
            <div class="assignment-details">
                <div class="detail-item">
                    <i class="fas fa-calendar"></i>
                    <span class="detail-label">마감일:</span>
                    <span class="detail-value ${isDeadlineNear(assignment.dueDate) ? 'deadline-warning' : ''}">
                        ${formatDate(assignment.dueDate)}
                    </span>
                </div>
                <div class="detail-item">
                    <i class="fas fa-star"></i>
                    <span class="detail-label">배점:</span>
                    <span class="detail-value">${assignment.points}점</span>
                </div>
            </div>
            <p class="assignment-description">${assignment.description}</p>
            <div class="assignment-footer">
                <span class="submission-status status-${assignment.status}">
                    <i class="fas ${assignment.status === 'graded' ? 'fa-check-circle' : assignment.status === 'submitted' ? 'fa-clock' : 'fa-exclamation-circle'}"></i>
                    ${statusText[assignment.status]}
                    ${assignment.grade ? ` - ${assignment.grade}점` : ''}
                </span>
                <div class="course-actions">
                    ${assignment.status === 'pending' ? `
                        <button class="btn-course btn-primary" onclick="window.location.href='pages/assignment-submit.html?id=${assignment.id}'">
                            <i class="fas fa-paper-plane"></i> 제출하기
                        </button>
                    ` : `
                        <button class="btn-course btn-outline" onclick="viewAssignmentDetail('${assignment.id}')">
                            <i class="fas fa-eye"></i> 상세보기
                        </button>
                    `}
                </div>
            </div>
        </div>
    `;
}

// 시험 데이터 로드
function loadExamsData() {
    const container = document.getElementById('examsContainer');
    const exams = getSampleExams();
    
    container.innerHTML = exams.map(exam => createExamCard(exam)).join('');
}

// 시험 카드 생성
function createExamCard(exam) {
    const statusText = {
        'available': '응시가능',
        'taken': '응시완료',
        'graded': '채점완료'
    };
    
    return `
        <div class="exam-card">
            <div class="exam-header">
                <span class="exam-type">${exam.type}</span>
                <h3 class="exam-title">${exam.title}</h3>
                <p class="exam-course">${exam.courseTitle}</p>
            </div>
            <div class="exam-info">
                <div class="info-item">
                    <span class="info-label">문항 수</span>
                    <span class="info-value">${exam.questionCount}문항</span>
                </div>
                <div class="info-item">
                    <span class="info-label">시험 시간</span>
                    <span class="info-value">${exam.duration}분</span>
                </div>
            </div>
            <div class="exam-schedule">
                <div class="schedule-item">
                    <i class="fas fa-calendar-check"></i>
                    <span class="schedule-label">시작:</span>
                    <span class="schedule-value">${formatDate(exam.startDate)}</span>
                </div>
                <div class="schedule-item">
                    <i class="fas fa-calendar-times"></i>
                    <span class="schedule-label">종료:</span>
                    <span class="schedule-value">${formatDate(exam.endDate)}</span>
                </div>
            </div>
            <div class="exam-actions">
                ${exam.status === 'available' ? `
                    <button class="btn-course btn-primary" onclick="window.location.href='pages/exam-take.html?id=${exam.id}'">
                        <i class="fas fa-play"></i> 시험 응시
                    </button>
                ` : `
                    <button class="btn-course btn-outline" onclick="viewExamResult('${exam.id}')">
                        <i class="fas fa-chart-bar"></i> 결과 보기
                    </button>
                `}
            </div>
        </div>
    `;
}

// 성적 데이터 로드
function loadGradesData() {
    const container = document.getElementById('gradesContainer');
    
    // 요약 통계
    const summary = `
        <div class="grades-summary">
            <div class="grade-card">
                <div class="grade-icon">📊</div>
                <div class="grade-label">전체 평균</div>
                <div class="grade-value">85.5</div>
                <div class="grade-subtitle">점</div>
            </div>
            <div class="grade-card">
                <div class="grade-icon">📝</div>
                <div class="grade-label">출석률</div>
                <div class="grade-value">92</div>
                <div class="grade-subtitle">%</div>
            </div>
            <div class="grade-card">
                <div class="grade-icon">✅</div>
                <div class="grade-label">과제 평균</div>
                <div class="grade-value">88.0</div>
                <div class="grade-subtitle">점</div>
            </div>
            <div class="grade-card">
                <div class="grade-icon">🎯</div>
                <div class="grade-label">시험 평균</div>
                <div class="grade-value">83.5</div>
                <div class="grade-subtitle">점</div>
            </div>
        </div>
        
        <div class="detailed-grades">
            <div class="table-header">상세 성적표</div>
            <table class="grades-table">
                <thead>
                    <tr>
                        <th>과목명</th>
                        <th>출석</th>
                        <th>과제</th>
                        <th>시험</th>
                        <th>총점</th>
                        <th>학점</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>AI 에이전트 개발 실무</td>
                        <td>95%</td>
                        <td>90점</td>
                        <td>88점</td>
                        <td>89.5점</td>
                        <td><span class="grade-badge grade-a">A</span></td>
                    </tr>
                    <tr>
                        <td>프롬프트 엔지니어링</td>
                        <td>90%</td>
                        <td>85점</td>
                        <td>80점</td>
                        <td>83.5점</td>
                        <td><span class="grade-badge grade-b">B+</span></td>
                    </tr>
                    <tr>
                        <td>RAG 시스템 구축</td>
                        <td>88%</td>
                        <td>92점</td>
                        <td>85점</td>
                        <td>87.0점</td>
                        <td><span class="grade-badge grade-b">B+</span></td>
                    </tr>
                </tbody>
            </table>
        </div>
    `;
    
    container.innerHTML = summary;
}

// 수료증 데이터 로드
function loadCertificatesData() {
    const container = document.getElementById('certificatesContainer');
    const certificates = getSampleCertificates();
    
    if (certificates.length === 0) {
        container.innerHTML = '<p class="empty-message">발급된 수료증이 없습니다.</p>';
        return;
    }
    
    container.innerHTML = certificates.map(cert => `
        <div class="certificate-card">
            <div class="certificate-icon">🏆</div>
            <h3 class="certificate-title">${cert.title}</h3>
            <div class="certificate-details">
                <div class="certificate-detail">
                    <span class="detail-label">수료일</span>
                    <span class="detail-value">${formatDate(cert.issueDate)}</span>
                </div>
                <div class="certificate-detail">
                    <span class="detail-label">총 학습시간</span>
                    <span class="detail-value">${cert.hours}시간</span>
                </div>
                <div class="certificate-detail">
                    <span class="detail-label">최종 성적</span>
                    <span class="detail-value">${cert.finalGrade}점</span>
                </div>
            </div>
            <div class="certificate-actions">
                <button class="btn-course btn-primary" onclick="downloadCertificate('${cert.id}')">
                    <i class="fas fa-download"></i> PDF 다운로드
                </button>
                <button class="btn-course btn-outline" onclick="verifyCertificate('${cert.id}')">
                    <i class="fas fa-check-circle"></i> 진위 확인
                </button>
            </div>
        </div>
    `).join('');
}

// 필터 버튼 설정
function setupFilterButtons() {
    const filterBtns = document.querySelectorAll('.filter-btn');
    
    filterBtns.forEach(btn => {
        btn.addEventListener('click', function() {
            const parent = this.parentElement;
            parent.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            
            const filter = this.getAttribute('data-filter');
            applyFilter(filter);
        });
    });
}

// 필터 적용
function applyFilter(filter) {
    if (currentTab === 'courses') {
        filterCourses(filter);
    } else if (currentTab === 'assignments') {
        filterAssignments(filter);
    } else if (currentTab === 'exams') {
        filterExams(filter);
    }
}

// 과정 필터
function filterCourses(filter) {
    const courses = getSampleCourses();
    const filtered = filter === 'all' ? courses : courses.filter(c => c.status === filter.replace('-', ''));
    
    const container = document.getElementById('allCoursesContainer');
    container.innerHTML = filtered.map(course => createCourseCard(course)).join('');
}

// 과제 필터
function filterAssignments(filter) {
    const assignments = getSampleAssignments();
    const filtered = assignments.filter(a => a.status === filter);
    
    const container = document.getElementById('assignmentsContainer');
    container.innerHTML = filtered.map(assignment => createAssignmentCard(assignment)).join('');
}

// 시험 필터
function filterExams(filter) {
    const exams = getSampleExams();
    const filtered = exams.filter(e => e.status === filter);
    
    const container = document.getElementById('examsContainer');
    container.innerHTML = filtered.map(exam => createExamCard(exam)).join('');
}

// 샘플 데이터 함수들
function getSampleCourses() {
    return [
        {
            id: 'course1',
            title: 'AI 에이전트 개발 실무',
            instructor: '김AI 교수',
            duration: '8주',
            progress: 75,
            status: 'in-progress'
        },
        {
            id: 'course2',
            title: '프롬프트 엔지니어링',
            instructor: '박프롬프트 교수',
            duration: '6주',
            progress: 100,
            status: 'completed'
        },
        {
            id: 'course3',
            title: 'RAG 시스템 구축',
            instructor: '이벡터 교수',
            duration: '10주',
            progress: 45,
            status: 'in-progress'
        }
    ];
}

function getSampleAssignments() {
    return [
        {
            id: 'assignment1',
            title: 'AI 챗봇 프로토타입 개발',
            courseTitle: 'AI 에이전트 개발 실무',
            description: 'Python 또는 JavaScript를 사용하여 간단한 AI 챗봇을 개발하세요.',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            points: 100,
            priority: 'high',
            status: 'pending'
        },
        {
            id: 'assignment2',
            title: '프롬프트 최적화 보고서',
            courseTitle: '프롬프트 엔지니어링',
            description: '다양한 프롬프트 기법을 비교 분석하는 보고서를 작성하세요.',
            dueDate: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            points: 80,
            priority: 'medium',
            status: 'graded',
            grade: 88
        }
    ];
}

function getSampleExams() {
    return [
        {
            id: 'exam1',
            title: '중간고사',
            courseTitle: 'AI 에이전트 개발 실무',
            type: '중간고사',
            questionCount: 20,
            duration: 60,
            startDate: new Date(Date.now() + 3 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'available'
        },
        {
            id: 'exam2',
            title: '기말고사',
            courseTitle: '프롬프트 엔지니어링',
            type: '기말고사',
            questionCount: 25,
            duration: 90,
            startDate: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
            endDate: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            status: 'graded',
            score: 85
        }
    ];
}

function getSampleCertificates() {
    return [
        {
            id: 'cert1',
            title: '프롬프트 엔지니어링 수료증',
            issueDate: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
            hours: 40,
            finalGrade: 88
        }
    ];
}

// 유틸리티 함수들
function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}-${month}-${day}`;
}

function isDeadlineNear(dateString) {
    const deadline = new Date(dateString);
    const now = new Date();
    const diff = deadline - now;
    const days = diff / (1000 * 60 * 60 * 24);
    return days <= 3 && days > 0;
}

function startLearning(courseId) {
    window.location.href = `course-detail.html?id=${courseId}`;
}

function viewAssignmentDetail(assignmentId) {
    window.location.href = `pages/assignment-detail.html?id=${assignmentId}`;
}

function viewExamResult(examId) {
    window.location.href = `pages/exam-result.html?id=${examId}`;
}

function downloadCertificate(certId) {
    alert('수료증 PDF 다운로드 기능이 준비 중입니다.');
}

function verifyCertificate(certId) {
    alert('수료증 진위 확인 기능이 준비 중입니다.');
}

// 로그아웃
document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
    e.preventDefault();
    if (confirm('로그아웃 하시겠습니까?')) {
        localStorage.removeItem('userInfo');
        window.location.href = 'login.html';
    }
});
