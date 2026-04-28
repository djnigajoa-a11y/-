/**
 * ================================================
 * AXINOVA LMS - 온라인 시험 시스템
 * ================================================
 * 파일명: exam-manager.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 시험 등록, 응시, 자동 채점, 결과 관리
 * ================================================
 */

const ExamManager = (function() {
    'use strict';

    // ===== 상수 정의 =====
    const STORAGE_KEY_EXAMS = 'lms_exams';
    const STORAGE_KEY_RESULTS = 'lms_exam_results';

    // ===== Private 변수 =====
    let exams = [];
    let examResults = [];
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        loadData();
        currentUser = getCurrentUser();
        console.log('[ExamManager] 초기화 완료');
    }

    // ===== 데이터 로드 =====
    function loadData() {
        try {
            const examData = localStorage.getItem(STORAGE_KEY_EXAMS);
            const resultData = localStorage.getItem(STORAGE_KEY_RESULTS);
            exams = examData ? JSON.parse(examData) : [];
            examResults = resultData ? JSON.parse(resultData) : [];
        } catch (error) {
            console.error('[ExamManager] 데이터 로드 실패:', error);
            exams = [];
            examResults = [];
        }
    }

    // ===== 데이터 저장 =====
    function saveExams() {
        try {
            localStorage.setItem(STORAGE_KEY_EXAMS, JSON.stringify(exams));
            return true;
        } catch (error) {
            console.error('[ExamManager] 시험 저장 실패:', error);
            return false;
        }
    }

    function saveResults() {
        try {
            localStorage.setItem(STORAGE_KEY_RESULTS, JSON.stringify(examResults));
            return true;
        } catch (error) {
            console.error('[ExamManager] 결과 저장 실패:', error);
            return false;
        }
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

    // ===== 시험 생성 (관리자) =====
    /**
     * @param {object} examData
     * @param {string} courseId
     * @param {string} title
     * @param {string} description
     * @param {number} duration - 분
     * @param {number} passingScore - 합격 점수
     * @param {array} questions - 문제 배열
     * @param {boolean} shuffleQuestions - 문제 순서 섞기
     * @param {boolean} showResultImmediately - 즉시 결과 표시
     */
    function createExam(examData) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const exam = {
            id: generateId('EXAM'),
            courseId: examData.courseId,
            title: examData.title,
            description: examData.description || '',
            duration: examData.duration || 60, // minutes
            passingScore: examData.passingScore || 60,
            totalPoints: 0,
            questions: examData.questions || [],
            shuffleQuestions: examData.shuffleQuestions || false,
            shuffleOptions: examData.shuffleOptions || false,
            showResultImmediately: examData.showResultImmediately !== false,
            allowRetake: examData.allowRetake || false,
            maxAttempts: examData.maxAttempts || 1,
            startDate: examData.startDate || null,
            endDate: examData.endDate || null,
            active: true,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        // 총점 계산
        exam.totalPoints = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0);

        exams.push(exam);
        saveExams();

        return {
            success: true,
            message: '시험이 등록되었습니다.',
            exam: exam
        };
    }

    // ===== 시험 수정 (관리자) =====
    function updateExam(examId, updateData) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const exam = exams.find(e => e.id === examId);
        if (!exam) {
            return { success: false, message: '시험을 찾을 수 없습니다.' };
        }

        Object.assign(exam, updateData, {
            updatedAt: new Date().toISOString()
        });

        // 총점 재계산
        if (updateData.questions) {
            exam.totalPoints = exam.questions.reduce((sum, q) => sum + (q.points || 0), 0);
        }

        saveExams();

        return {
            success: true,
            message: '시험이 수정되었습니다.',
            exam: exam
        };
    }

    // ===== 시험 삭제 (관리자) =====
    function deleteExam(examId) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const index = exams.findIndex(e => e.id === examId);
        if (index >= 0) {
            exams.splice(index, 1);
            saveExams();
            return { success: true, message: '시험이 삭제되었습니다.' };
        }

        return { success: false, message: '시험을 찾을 수 없습니다.' };
    }

    // ===== 시험 조회 =====
    function getExamsByCourse(courseId) {
        return exams.filter(e => e.courseId === courseId && e.active);
    }

    function getExamById(examId) {
        return exams.find(e => e.id === examId);
    }

    function getAllExams() {
        return exams;
    }

    // ===== 시험 응시 시작 =====
    function startExam(examId) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        const exam = getExamById(examId);
        if (!exam) {
            return { success: false, message: '시험을 찾을 수 없습니다.' };
        }

        // 시험 기간 확인
        const now = new Date();
        if (exam.startDate && new Date(exam.startDate) > now) {
            return { success: false, message: '아직 시험 시작 시간이 아닙니다.' };
        }
        if (exam.endDate && new Date(exam.endDate) < now) {
            return { success: false, message: '시험 기간이 종료되었습니다.' };
        }

        // 응시 횟수 확인
        const previousAttempts = getExamResultsByUser(currentUser.id, examId);
        if (!exam.allowRetake && previousAttempts.length > 0) {
            return { success: false, message: '이미 응시한 시험입니다.' };
        }
        if (previousAttempts.length >= exam.maxAttempts) {
            return { success: false, message: `최대 응시 횟수(${exam.maxAttempts}회)를 초과했습니다.` };
        }

        // 시험 문제 준비 (섞기 옵션 적용)
        let examQuestions = JSON.parse(JSON.stringify(exam.questions));
        if (exam.shuffleQuestions) {
            examQuestions = shuffleArray(examQuestions);
        }
        if (exam.shuffleOptions) {
            examQuestions.forEach(q => {
                if (q.type === 'multiple_choice' && q.options) {
                    q.options = shuffleArray(q.options);
                }
            });
        }

        const examSession = {
            examId: examId,
            questions: examQuestions,
            startTime: new Date().toISOString(),
            endTime: new Date(Date.now() + exam.duration * 60000).toISOString(),
            duration: exam.duration,
            attemptNumber: previousAttempts.length + 1
        };

        return {
            success: true,
            message: '시험을 시작합니다.',
            examSession: examSession
        };
    }

    // ===== 시험 제출 및 자동 채점 =====
    /**
     * @param {string} examId
     * @param {array} answers - [{ questionId, answer }, ...]
     * @param {string} startTime
     */
    function submitExam(examId, answers, startTime) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        const exam = getExamById(examId);
        if (!exam) {
            return { success: false, message: '시험을 찾을 수 없습니다.' };
        }

        const submitTime = new Date();
        const timeTaken = Math.round((submitTime - new Date(startTime)) / 1000); // seconds

        // 자동 채점
        const gradingResult = gradeExamAnswers(exam, answers);

        const examResult = {
            id: generateId('RESULT'),
            examId: examId,
            userId: currentUser.id,
            userName: currentUser.name,
            courseId: exam.courseId,
            answers: answers,
            score: gradingResult.score,
            totalPoints: exam.totalPoints,
            percentage: gradingResult.percentage,
            passed: gradingResult.percentage >= exam.passingScore,
            correctCount: gradingResult.correctCount,
            wrongCount: gradingResult.wrongCount,
            unansweredCount: gradingResult.unansweredCount,
            timeTaken: timeTaken,
            startedAt: startTime,
            submittedAt: submitTime.toISOString(),
            attemptNumber: getExamResultsByUser(currentUser.id, examId).length + 1,
            detailedResults: gradingResult.detailedResults
        };

        examResults.push(examResult);
        saveResults();

        return {
            success: true,
            message: '시험이 제출되었습니다.',
            result: examResult,
            showResult: exam.showResultImmediately
        };
    }

    // ===== 자동 채점 로직 =====
    function gradeExamAnswers(exam, answers) {
        let score = 0;
        let correctCount = 0;
        let wrongCount = 0;
        let unansweredCount = 0;
        const detailedResults = [];

        exam.questions.forEach((question, index) => {
            const userAnswer = answers.find(a => a.questionId === question.id);
            const answer = userAnswer ? userAnswer.answer : null;

            let isCorrect = false;
            let earnedPoints = 0;

            if (!answer || answer === '') {
                unansweredCount++;
            } else {
                // 문제 유형별 채점
                if (question.type === 'multiple_choice' || question.type === 'true_false') {
                    isCorrect = answer === question.correctAnswer;
                } else if (question.type === 'multiple_select') {
                    // 복수 선택: 정답 배열 비교
                    const userAnswers = Array.isArray(answer) ? answer.sort() : [answer];
                    const correctAnswers = Array.isArray(question.correctAnswer) 
                        ? question.correctAnswer.sort() 
                        : [question.correctAnswer];
                    isCorrect = JSON.stringify(userAnswers) === JSON.stringify(correctAnswers);
                } else if (question.type === 'short_answer') {
                    // 단답형: 대소문자 무시 비교
                    isCorrect = answer.toLowerCase().trim() === question.correctAnswer.toLowerCase().trim();
                }

                if (isCorrect) {
                    earnedPoints = question.points || 0;
                    score += earnedPoints;
                    correctCount++;
                } else {
                    wrongCount++;
                }
            }

            detailedResults.push({
                questionId: question.id,
                questionNumber: index + 1,
                question: question.question,
                userAnswer: answer,
                correctAnswer: question.correctAnswer,
                isCorrect: isCorrect,
                points: question.points,
                earnedPoints: earnedPoints
            });
        });

        const percentage = exam.totalPoints > 0 
            ? Math.round((score / exam.totalPoints) * 100 * 10) / 10 
            : 0;

        return {
            score: score,
            percentage: percentage,
            correctCount: correctCount,
            wrongCount: wrongCount,
            unansweredCount: unansweredCount,
            detailedResults: detailedResults
        };
    }

    // ===== 시험 결과 조회 =====
    function getExamResultsByUser(userId, examId = null) {
        let results = examResults.filter(r => r.userId === userId);
        if (examId) {
            results = results.filter(r => r.examId === examId);
        }
        return results;
    }

    function getExamResultsByExam(examId) {
        return examResults.filter(r => r.examId === examId);
    }

    function getExamResultById(resultId) {
        return examResults.find(r => r.id === resultId);
    }

    // ===== 과정별 시험 점수 합계 =====
    function getUserExamScore(userId, courseId) {
        const courseExams = getExamsByCourse(courseId);
        const userResults = examResults.filter(
            r => r.userId === userId && r.courseId === courseId
        );

        let totalEarned = 0;
        let totalPossible = 0;

        courseExams.forEach(exam => {
            totalPossible += exam.totalPoints;
            // 가장 높은 점수 사용 (재시험 허용 시)
            const examAttempts = userResults.filter(r => r.examId === exam.id);
            if (examAttempts.length > 0) {
                const bestScore = Math.max(...examAttempts.map(a => a.score));
                totalEarned += bestScore;
            }
        });

        return {
            totalEarned: totalEarned,
            totalPossible: totalPossible,
            percentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100 * 10) / 10 : 0
        };
    }

    // ===== 시험 통계 =====
    function getExamStats(examId) {
        const exam = getExamById(examId);
        const results = getExamResultsByExam(examId);

        if (results.length === 0) {
            return {
                totalAttempts: 0,
                uniqueStudents: 0,
                averageScore: 0,
                passRate: 0,
                highestScore: 0,
                lowestScore: 0
            };
        }

        const scores = results.map(r => r.score);
        const passedCount = results.filter(r => r.passed).length;
        const uniqueStudents = new Set(results.map(r => r.userId)).size;

        return {
            totalAttempts: results.length,
            uniqueStudents: uniqueStudents,
            averageScore: Math.round(scores.reduce((a, b) => a + b, 0) / scores.length * 10) / 10,
            passRate: Math.round((passedCount / results.length) * 100 * 10) / 10,
            highestScore: Math.max(...scores),
            lowestScore: Math.min(...scores)
        };
    }

    // ===== 데이터 내보내기 =====
    function exportExamResults(courseId = null) {
        let exportData = examResults;
        if (courseId) {
            exportData = examResults.filter(r => r.courseId === courseId);
        }

        return exportData.map(result => {
            const exam = getExamById(result.examId);
            return {
                '사용자ID': result.userId,
                '사용자명': result.userName,
                '과정ID': result.courseId,
                '시험ID': result.examId,
                '시험제목': exam ? exam.title : '',
                '응시차수': result.attemptNumber,
                '점수': result.score,
                '만점': result.totalPoints,
                '백분율(%)': result.percentage,
                '합격여부': result.passed ? '합격' : '불합격',
                '정답수': result.correctCount,
                '오답수': result.wrongCount,
                '미답수': result.unansweredCount,
                '소요시간(초)': result.timeTaken,
                '제출일시': result.submittedAt
            };
        });
    }

    // ===== 유틸리티: 배열 섞기 =====
    function shuffleArray(array) {
        const shuffled = [...array];
        for (let i = shuffled.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
        }
        return shuffled;
    }

    // ===== 유틸리티: ID 생성 =====
    function generateId(prefix) {
        return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===== Public API =====
    return {
        init: init,

        // 시험 관리 (관리자)
        createExam: createExam,
        updateExam: updateExam,
        deleteExam: deleteExam,

        // 시험 조회
        getExamsByCourse: getExamsByCourse,
        getExamById: getExamById,
        getAllExams: getAllExams,

        // 시험 응시 (학생)
        startExam: startExam,
        submitExam: submitExam,

        // 시험 결과 조회
        getExamResultsByUser: getExamResultsByUser,
        getExamResultsByExam: getExamResultsByExam,
        getExamResultById: getExamResultById,

        // 통계
        getUserExamScore: getUserExamScore,
        getExamStats: getExamStats,

        // 데이터 관리
        exportExamResults: exportExamResults
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.ExamManager = ExamManager;
    document.addEventListener('DOMContentLoaded', function() {
        ExamManager.init();
    });
}
