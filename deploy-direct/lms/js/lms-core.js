/**
 * ================================================
 * AXINOVA LMS - 통합 코어 모듈
 * ================================================
 * 파일명: lms-core.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 모든 LMS 모듈을 통합 관리하는 코어 시스템
 * ================================================
 */

const LMSCore = (function() {
    'use strict';

    // ===== 모듈 의존성 확인 =====
    const REQUIRED_MODULES = [
        'AttendanceManager',
        'ProgressTracker',
        'AssignmentManager',
        'ExamManager',
        'CertificateManager',
        'GradesManager'
    ];

    let modulesLoaded = false;
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        console.log('[LMSCore] AXINOVA LMS 시스템 초기화 시작...');
        
        // 모듈 로드 확인
        checkModules();
        
        // 각 모듈 초기화
        if (modulesLoaded) {
            initializeModules();
            currentUser = getCurrentUser();
            console.log('[LMSCore] 초기화 완료 ✓');
        } else {
            console.warn('[LMSCore] 일부 모듈이 로드되지 않았습니다.');
        }
    }

    // ===== 모듈 로드 확인 =====
    function checkModules() {
        const loadedModules = [];
        const missingModules = [];

        REQUIRED_MODULES.forEach(moduleName => {
            if (typeof window[moduleName] !== 'undefined') {
                loadedModules.push(moduleName);
            } else {
                missingModules.push(moduleName);
            }
        });

        console.log(`[LMSCore] 로드된 모듈: ${loadedModules.join(', ')}`);
        if (missingModules.length > 0) {
            console.warn(`[LMSCore] 누락된 모듈: ${missingModules.join(', ')}`);
        }

        modulesLoaded = loadedModules.length === REQUIRED_MODULES.length;
        return modulesLoaded;
    }

    // ===== 각 모듈 초기화 =====
    function initializeModules() {
        REQUIRED_MODULES.forEach(moduleName => {
            if (window[moduleName] && typeof window[moduleName].init === 'function') {
                try {
                    window[moduleName].init();
                } catch (error) {
                    console.error(`[LMSCore] ${moduleName} 초기화 실패:`, error);
                }
            }
        });
    }

    // ===== 현재 사용자 =====
    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    // ===== 통합 대시보드 데이터 =====
    /**
     * 학습자의 전체 학습 현황을 한눈에 보여주는 대시보드 데이터
     */
    function getDashboardData(userId, courseId = null) {
        if (!modulesLoaded) {
            return { error: 'LMS 모듈이 로드되지 않았습니다.' };
        }

        // 과정 목록 (진도 데이터 기반)
        const allProgress = ProgressTracker.getUserAllProgress(userId);
        const targetProgress = courseId 
            ? allProgress.filter(p => p.courseId === courseId) 
            : allProgress;

        const dashboardData = {
            user: {
                id: userId,
                totalCourses: allProgress.length,
                activeCourses: allProgress.filter(p => p.overallProgress < 100).length,
                completedCourses: allProgress.filter(p => p.overallProgress === 100).length
            },
            courses: targetProgress.map(progress => {
                // 출석 정보
                const attendance = AttendanceManager.calculateAttendanceRate(
                    userId, 
                    progress.courseId, 
                    progress.totalLessons
                );

                // 과제 정보
                const assignments = AssignmentManager.getUserAssignmentScore(
                    userId, 
                    progress.courseId
                );

                const pendingAssignments = AssignmentManager.getPendingAssignments(
                    userId, 
                    progress.courseId
                );

                // 시험 정보
                const exams = ExamManager.getUserExamScore(
                    userId, 
                    progress.courseId
                );

                // 종합 성적
                const grades = GradesManager.getComprehensiveGrades(
                    userId, 
                    progress.courseId, 
                    progress.totalLessons
                );

                // 수료증
                const certificate = CertificateManager.getCertificateByCourse(
                    userId, 
                    progress.courseId
                );

                return {
                    courseId: progress.courseId,
                    progress: {
                        overall: progress.overallProgress,
                        completed: progress.completedLessons,
                        total: progress.totalLessons
                    },
                    attendance: {
                        rate: attendance.attendanceRate,
                        qualified: attendance.isQualified
                    },
                    assignments: {
                        score: assignments.percentage,
                        pending: pendingAssignments.length
                    },
                    exams: {
                        score: exams.percentage
                    },
                    grades: grades.total,
                    certificate: certificate ? {
                        number: certificate.certificateNumber,
                        issued: true
                    } : null,
                    status: certificate ? 'completed' : 
                           (progress.overallProgress === 100 ? 'ready_for_certificate' : 'in_progress')
                };
            })
        };

        return dashboardData;
    }

    // ===== 학습 시작 =====
    /**
     * 강의 시청 시작 시 호출
     */
    function startLesson(courseId, lessonId, duration) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        // 이어보기 위치 가져오기
        const resumePosition = ProgressTracker.getResumePosition(
            currentUser.id, 
            courseId, 
            lessonId
        );

        return {
            success: true,
            resumePosition: resumePosition,
            message: resumePosition > 0 ? '이어보기 위치로 이동합니다.' : '강의를 시작합니다.'
        };
    }

    // ===== 학습 진행 중 =====
    /**
     * 영상 플레이어에서 주기적으로 호출 (예: 10초마다)
     */
    function updateLearning(courseId, lessonId, currentTime, duration) {
        if (!currentUser) return;

        // 진도 업데이트
        ProgressTracker.updateProgress(
            courseId, 
            lessonId, 
            currentTime, 
            duration, 
            false
        );

        // 출석 자동 체크 (80% 이상 시청 시)
        AttendanceManager.autoCheckAttendance(
            courseId, 
            lessonId, 
            currentTime, 
            duration
        );
    }

    // ===== 학습 완료 =====
    /**
     * 강의 시청 완료 시 호출
     */
    function completeLesson(courseId, lessonId, watchedTime, totalTime) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        // 진도 완료 처리
        ProgressTracker.completeLesson(
            currentUser.id, 
            courseId, 
            lessonId
        );

        // 출석 기록
        const attendance = AttendanceManager.recordAttendance(
            courseId, 
            lessonId, 
            watchedTime, 
            totalTime
        );

        return {
            success: true,
            attendance: attendance,
            message: '차시 학습이 완료되었습니다.'
        };
    }

    // ===== 과정 완료 여부 확인 =====
    /**
     * 모든 차시 완료 후 수료 가능 여부 확인
     */
    function checkCourseCompletion(userId, courseId, courseInfo) {
        const completion = CertificateManager.checkCompletionRequirements(
            userId, 
            courseId, 
            courseInfo
        );

        return {
            canComplete: completion.canComplete,
            requirements: completion.requirements,
            message: completion.message
        };
    }

    // ===== 수료증 발급 요청 =====
    /**
     * 학습자가 수료증 발급 요청
     */
    function requestCertificate(userId, courseInfo) {
        const result = CertificateManager.issueCertificate(userId, courseInfo);
        
        if (result.success) {
            // PDF 자동 생성 (선택 사항)
            // CertificateManager.generateCertificatePDF(result.certificate.id);
        }

        return result;
    }

    // ===== 전체 데이터 내보내기 =====
    function exportAllData(courseId = null) {
        return {
            attendance: AttendanceManager.exportAttendanceData(courseId),
            progress: ProgressTracker.exportProgressData(courseId),
            assignments: AssignmentManager.exportSubmissionsData(courseId),
            exams: ExamManager.exportExamResults(courseId),
            certificates: CertificateManager.exportCertificatesData(courseId),
            grades: GradesManager.exportGradesData(courseId)
        };
    }

    // ===== 시스템 상태 확인 =====
    function getSystemStatus() {
        return {
            version: '1.0.0',
            modulesLoaded: modulesLoaded,
            modules: REQUIRED_MODULES.reduce((status, moduleName) => {
                status[moduleName] = typeof window[moduleName] !== 'undefined';
                return status;
            }, {}),
            currentUser: currentUser ? {
                id: currentUser.id,
                name: currentUser.name,
                role: currentUser.role
            } : null
        };
    }

    // ===== 데모 데이터 생성 (개발/테스트용) =====
    function generateDemoData() {
        console.log('[LMSCore] 데모 데이터 생성 중...');

        // 데모 과정 정보
        const demoCourse = {
            courseId: 'COURSE-001',
            courseName: 'AI 기초 입문 과정',
            coursePeriod: '2026-01-01 ~ 2026-02-28',
            totalHours: 20,
            totalLessons: 10
        };

        // 데모 사용자
        const demoUser = {
            id: 'user-demo-001',
            name: '김테스트',
            birthDate: '1990-01-01',
            role: 'student'
        };

        // 1. 출석 데모 데이터 (8개 차시 출석)
        for (let i = 1; i <= 8; i++) {
            AttendanceManager.recordAttendance(
                demoCourse.courseId,
                `lesson-${i}`,
                900, // 15분
                1000 // 16.7분
            );
        }

        // 2. 진도 데모 데이터
        for (let i = 1; i <= 10; i++) {
            const completed = i <= 8;
            ProgressTracker.updateProgress(
                demoCourse.courseId,
                `lesson-${i}`,
                completed ? 1000 : 300,
                1000,
                completed
            );
        }

        // 3. 과제 데모 데이터
        const demoAssignment = AssignmentManager.createAssignment({
            courseId: demoCourse.courseId,
            title: '프로젝트 계획서 작성',
            description: 'AI 프로젝트 주제 선정 및 계획서 제출',
            dueDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            points: 100,
            type: 'file'
        });

        if (demoAssignment.success) {
            const submission = AssignmentManager.submitAssignment({
                assignmentId: demoAssignment.assignment.id,
                content: '프로젝트 계획서 내용...',
                fileName: 'project-plan.pdf',
                fileSize: 1024000
            });

            if (submission.success) {
                AssignmentManager.gradeAssignment(
                    submission.submission.id,
                    85,
                    '잘 작성하셨습니다.'
                );
            }
        }

        // 4. 시험 데모 데이터
        const demoExam = ExamManager.createExam({
            courseId: demoCourse.courseId,
            title: 'AI 기초 중간고사',
            duration: 60,
            passingScore: 60,
            questions: [
                {
                    id: 'q1',
                    type: 'multiple_choice',
                    question: 'AI의 정의는?',
                    options: ['A', 'B', 'C', 'D'],
                    correctAnswer: 'B',
                    points: 25
                },
                {
                    id: 'q2',
                    type: 'multiple_choice',
                    question: 'ML의 종류가 아닌 것은?',
                    options: ['지도학습', '비지도학습', '강화학습', '암기학습'],
                    correctAnswer: '암기학습',
                    points: 25
                },
                {
                    id: 'q3',
                    type: 'true_false',
                    question: 'AI는 인간의 지능을 모방한다.',
                    correctAnswer: 'true',
                    points: 25
                },
                {
                    id: 'q4',
                    type: 'short_answer',
                    question: 'LLM의 약자는?',
                    correctAnswer: 'Large Language Model',
                    points: 25
                }
            ]
        });

        if (demoExam.success) {
            const examStart = ExamManager.startExam(demoExam.exam.id);
            if (examStart.success) {
                ExamManager.submitExam(
                    demoExam.exam.id,
                    [
                        { questionId: 'q1', answer: 'B' },
                        { questionId: 'q2', answer: '암기학습' },
                        { questionId: 'q3', answer: 'true' },
                        { questionId: 'q4', answer: 'large language model' }
                    ],
                    examStart.examSession.startTime
                );
            }
        }

        console.log('[LMSCore] 데모 데이터 생성 완료 ✓');
        return {
            success: true,
            message: '데모 데이터가 생성되었습니다.',
            demoCourse: demoCourse,
            demoUser: demoUser
        };
    }

    // ===== Public API =====
    return {
        // 초기화
        init: init,
        checkModules: checkModules,
        
        // 대시보드
        getDashboardData: getDashboardData,
        
        // 학습 관리
        startLesson: startLesson,
        updateLearning: updateLearning,
        completeLesson: completeLesson,
        
        // 수료 관리
        checkCourseCompletion: checkCourseCompletion,
        requestCertificate: requestCertificate,
        
        // 데이터 관리
        exportAllData: exportAllData,
        
        // 시스템
        getSystemStatus: getSystemStatus,
        generateDemoData: generateDemoData,
        
        // 모듈 접근
        Attendance: () => window.AttendanceManager,
        Progress: () => window.ProgressTracker,
        Assignment: () => window.AssignmentManager,
        Exam: () => window.ExamManager,
        Certificate: () => window.CertificateManager,
        Grades: () => window.GradesManager
    };
})();

// 자동 초기화
if (typeof window !== 'undefined') {
    window.LMSCore = LMSCore;
    
    // DOM 로드 완료 후 초기화
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', function() {
            LMSCore.init();
        });
    } else {
        // 이미 로드된 경우 즉시 초기화
        LMSCore.init();
    }
    
    // 전역 객체로 LMS 노출
    window.LMS = LMSCore;
}

console.log('🎓 AXINOVA LMS v1.0 로드 완료');
