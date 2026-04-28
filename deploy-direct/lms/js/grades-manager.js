/**
 * ================================================
 * AXINOVA LMS - 성적 조회 및 관리 시스템
 * ================================================
 * 파일명: grades-manager.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 종합 성적 조회, 성적표 생성, 학습 이력 관리
 * ================================================
 */

const GradesManager = (function() {
    'use strict';

    // ===== Private 변수 =====
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        currentUser = getCurrentUser();
        console.log('[GradesManager] 초기화 완료');
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

    // ===== 종합 성적 조회 =====
    /**
     * 특정 과정의 종합 성적
     * @param {string} userId 
     * @param {string} courseId 
     * @param {number} totalLessons - 전체 차시 수
     */
    function getComprehensiveGrades(userId, courseId, totalLessons) {
        // 1. 출석 점수 (30%)
        const attendanceData = window.AttendanceManager 
            ? window.AttendanceManager.calculateAttendanceRate(userId, courseId, totalLessons)
            : { attendanceRate: 0 };

        const attendanceScore = {
            rate: attendanceData.attendanceRate,
            points: Math.round(attendanceData.attendanceRate * 0.3 * 10) / 10,
            maxPoints: 30,
            weight: 30
        };

        // 2. 과제 점수 (30%)
        const assignmentData = window.AssignmentManager 
            ? window.AssignmentManager.getUserAssignmentScore(userId, courseId)
            : { totalEarned: 0, totalPossible: 0, percentage: 0 };

        const assignmentScore = {
            earned: assignmentData.totalEarned,
            possible: assignmentData.totalPossible,
            percentage: assignmentData.percentage,
            points: Math.round(assignmentData.percentage * 0.3 * 10) / 10,
            maxPoints: 30,
            weight: 30
        };

        // 3. 시험 점수 (40%)
        const examData = window.ExamManager 
            ? window.ExamManager.getUserExamScore(userId, courseId)
            : { totalEarned: 0, totalPossible: 0, percentage: 0 };

        const examScore = {
            earned: examData.totalEarned,
            possible: examData.totalPossible,
            percentage: examData.percentage,
            points: Math.round(examData.percentage * 0.4 * 10) / 10,
            maxPoints: 40,
            weight: 40
        };

        // 4. 종합 점수 계산
        const totalScore = attendanceScore.points + assignmentScore.points + examScore.points;
        const totalMaxPoints = 100;

        // 5. 등급 판정
        const grade = calculateGrade(totalScore);

        return {
            attendance: attendanceScore,
            assignment: assignmentScore,
            exam: examScore,
            total: {
                score: Math.round(totalScore * 10) / 10,
                maxScore: totalMaxPoints,
                percentage: Math.round(totalScore * 10) / 10,
                grade: grade
            },
            passStatus: totalScore >= 60 ? 'pass' : 'fail'
        };
    }

    // ===== 등급 계산 =====
    function calculateGrade(score) {
        if (score >= 95) return 'A+';
        if (score >= 90) return 'A';
        if (score >= 85) return 'B+';
        if (score >= 80) return 'B';
        if (score >= 75) return 'C+';
        if (score >= 70) return 'C';
        if (score >= 65) return 'D+';
        if (score >= 60) return 'D';
        return 'F';
    }

    // ===== 과정별 상세 성적 =====
    /**
     * 출석, 과제, 시험 세부 내역 포함
     */
    function getDetailedGrades(userId, courseId, totalLessons) {
        const comprehensive = getComprehensiveGrades(userId, courseId, totalLessons);

        // 출석 세부 내역
        const attendanceRecords = window.AttendanceManager 
            ? window.AttendanceManager.getAttendanceRecords(userId, courseId)
            : [];

        // 과제 세부 내역
        const assignments = window.AssignmentManager 
            ? window.AssignmentManager.getSubmissionsByUser(userId, courseId)
            : [];

        const assignmentDetails = assignments.map(submission => {
            const assignment = window.AssignmentManager.getAssignmentById(submission.assignmentId);
            return {
                assignmentId: submission.assignmentId,
                title: assignment ? assignment.title : '',
                submittedAt: submission.submittedAt,
                score: submission.score,
                maxScore: assignment ? assignment.points : 0,
                feedback: submission.feedback,
                graded: submission.score !== null
            };
        });

        // 시험 세부 내역
        const examResults = window.ExamManager 
            ? window.ExamManager.getExamResultsByUser(userId, courseId)
            : [];

        const examDetails = examResults.map(result => {
            const exam = window.ExamManager.getExamById(result.examId);
            return {
                examId: result.examId,
                title: exam ? exam.title : '',
                submittedAt: result.submittedAt,
                score: result.score,
                maxScore: result.totalPoints,
                percentage: result.percentage,
                passed: result.passed,
                attemptNumber: result.attemptNumber
            };
        });

        return {
            comprehensive: comprehensive,
            attendance: {
                records: attendanceRecords,
                summary: comprehensive.attendance
            },
            assignments: {
                details: assignmentDetails,
                summary: comprehensive.assignment
            },
            exams: {
                details: examDetails,
                summary: comprehensive.exam
            }
        };
    }

    // ===== 학습 이력 조회 =====
    /**
     * 사용자가 수강한 모든 과정의 성적
     */
    function getUserLearningHistory(userId) {
        // 진도 데이터에서 수강 과정 목록 추출
        const allProgress = window.ProgressTracker 
            ? window.ProgressTracker.getUserAllProgress(userId)
            : [];

        const history = allProgress.map(progress => {
            const grades = getComprehensiveGrades(userId, progress.courseId, progress.totalLessons);
            
            // 수료증 확인
            const certificate = window.CertificateManager 
                ? window.CertificateManager.getCertificateByCourse(userId, progress.courseId)
                : null;

            return {
                courseId: progress.courseId,
                startedAt: progress.startedAt,
                updatedAt: progress.updatedAt,
                overallProgress: progress.overallProgress,
                completedLessons: progress.completedLessons,
                totalLessons: progress.totalLessons,
                grades: grades,
                certificate: certificate ? {
                    certificateNumber: certificate.certificateNumber,
                    issueDate: certificate.issueDate
                } : null,
                status: certificate ? 'completed' : (progress.overallProgress === 100 ? 'completed' : 'in_progress')
            };
        });

        return history;
    }

    // ===== 성적 통계 =====
    function getUserGradeStats(userId) {
        const history = getUserLearningHistory(userId);

        if (history.length === 0) {
            return {
                totalCourses: 0,
                completedCourses: 0,
                inProgressCourses: 0,
                averageGrade: 0,
                totalCertificates: 0
            };
        }

        const completed = history.filter(h => h.status === 'completed');
        const inProgress = history.filter(h => h.status === 'in_progress');
        const withCertificates = history.filter(h => h.certificate !== null);

        const totalGrades = history.reduce((sum, h) => sum + h.grades.total.score, 0);
        const averageGrade = Math.round(totalGrades / history.length * 10) / 10;

        return {
            totalCourses: history.length,
            completedCourses: completed.length,
            inProgressCourses: inProgress.length,
            averageGrade: averageGrade,
            totalCertificates: withCertificates.length
        };
    }

    // ===== 성적표 생성 (HTML) =====
    /**
     * 인쇄 가능한 성적표 HTML 생성
     */
    function generateGradeReport(userId, courseId, courseInfo) {
        const detailed = getDetailedGrades(userId, courseId, courseInfo.totalLessons);
        const user = currentUser || { name: 'Unknown', email: '' };

        const html = `
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>성적표 - ${courseInfo.courseName}</title>
    <style>
        body { font-family: 'Noto Sans KR', sans-serif; margin: 40px; }
        .header { text-align: center; margin-bottom: 30px; }
        .header h1 { font-size: 28px; color: #1a1a1a; margin-bottom: 10px; }
        .header p { font-size: 14px; color: #666; }
        .info-table { width: 100%; border-collapse: collapse; margin-bottom: 30px; }
        .info-table th, .info-table td { border: 1px solid #ddd; padding: 12px; text-align: left; }
        .info-table th { background: #f8f9fa; font-weight: 600; width: 150px; }
        .grade-section { margin-bottom: 30px; }
        .grade-section h2 { font-size: 20px; color: #1a1a1a; border-bottom: 2px solid #667eea; padding-bottom: 10px; margin-bottom: 15px; }
        .grade-table { width: 100%; border-collapse: collapse; }
        .grade-table th, .grade-table td { border: 1px solid #ddd; padding: 10px; }
        .grade-table th { background: #667eea; color: white; font-weight: 600; }
        .grade-table tr:nth-child(even) { background: #f8f9fa; }
        .summary { background: #e7f3ff; padding: 20px; border-radius: 8px; margin-top: 30px; }
        .summary h3 { margin-top: 0; color: #1a1a1a; }
        .grade-badge { display: inline-block; padding: 5px 15px; border-radius: 20px; font-weight: bold; }
        .grade-A { background: #28a745; color: white; }
        .grade-B { background: #17a2b8; color: white; }
        .grade-C { background: #ffc107; color: #333; }
        .grade-D { background: #fd7e14; color: white; }
        .grade-F { background: #dc3545; color: white; }
        .pass { color: #28a745; font-weight: bold; }
        .fail { color: #dc3545; font-weight: bold; }
        @media print { body { margin: 20px; } }
    </style>
</head>
<body>
    <div class="header">
        <h1>성적표</h1>
        <p>AXINOVA 평생교육원</p>
    </div>

    <table class="info-table">
        <tr><th>과정명</th><td>${courseInfo.courseName}</td></tr>
        <tr><th>학습자명</th><td>${user.name}</td></tr>
        <tr><th>이메일</th><td>${user.email || '-'}</td></tr>
        <tr><th>조회일자</th><td>${new Date().toLocaleDateString('ko-KR')}</td></tr>
    </table>

    <div class="grade-section">
        <h2>종합 성적</h2>
        <table class="grade-table">
            <thead>
                <tr>
                    <th>평가 항목</th>
                    <th>획득 점수</th>
                    <th>만점</th>
                    <th>비율</th>
                    <th>가중치</th>
                </tr>
            </thead>
            <tbody>
                <tr>
                    <td>출석</td>
                    <td>${detailed.comprehensive.attendance.points}</td>
                    <td>${detailed.comprehensive.attendance.maxPoints}</td>
                    <td>${detailed.comprehensive.attendance.rate}%</td>
                    <td>${detailed.comprehensive.attendance.weight}%</td>
                </tr>
                <tr>
                    <td>과제</td>
                    <td>${detailed.comprehensive.assignment.points}</td>
                    <td>${detailed.comprehensive.assignment.maxPoints}</td>
                    <td>${detailed.comprehensive.assignment.percentage}%</td>
                    <td>${detailed.comprehensive.assignment.weight}%</td>
                </tr>
                <tr>
                    <td>시험</td>
                    <td>${detailed.comprehensive.exam.points}</td>
                    <td>${detailed.comprehensive.exam.maxPoints}</td>
                    <td>${detailed.comprehensive.exam.percentage}%</td>
                    <td>${detailed.comprehensive.exam.weight}%</td>
                </tr>
                <tr style="background: #f0f0f0; font-weight: bold;">
                    <td>총점</td>
                    <td>${detailed.comprehensive.total.score}</td>
                    <td>${detailed.comprehensive.total.maxScore}</td>
                    <td>${detailed.comprehensive.total.percentage}%</td>
                    <td>100%</td>
                </tr>
            </tbody>
        </table>
    </div>

    <div class="summary">
        <h3>평가 결과</h3>
        <p>
            <strong>종합 점수:</strong> ${detailed.comprehensive.total.score}점 
            <span class="grade-badge grade-${detailed.comprehensive.total.grade.charAt(0)}">${detailed.comprehensive.total.grade}</span>
        </p>
        <p>
            <strong>합격 여부:</strong> 
            <span class="${detailed.comprehensive.passStatus}">${detailed.comprehensive.passStatus === 'pass' ? '합격' : '불합격'}</span>
        </p>
    </div>

    <script>
        // 자동 인쇄 (선택 사항)
        // window.print();
    </script>
</body>
</html>
        `;

        return html;
    }

    // ===== 성적표 다운로드 (HTML 파일) =====
    function downloadGradeReport(userId, courseId, courseInfo) {
        const html = generateGradeReport(userId, courseId, courseInfo);
        const blob = new Blob([html], { type: 'text/html; charset=utf-8' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `성적표_${courseInfo.courseName.replace(/\s/g, '_')}_${new Date().toISOString().split('T')[0]}.html`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        return { success: true, message: '성적표가 다운로드되었습니다.' };
    }

    // ===== 성적 데이터 내보내기 (CSV) =====
    function exportGradesData(courseId = null) {
        const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
        const data = [];

        users.forEach(user => {
            const history = getUserLearningHistory(user.id);
            history.forEach(record => {
                if (courseId && record.courseId !== courseId) return;

                data.push({
                    '사용자ID': user.id,
                    '사용자명': user.name,
                    '과정ID': record.courseId,
                    '진도율(%)': record.overallProgress,
                    '출석률(%)': record.grades.attendance.rate,
                    '과제점수': record.grades.assignment.points,
                    '시험점수': record.grades.exam.points,
                    '종합점수': record.grades.total.score,
                    '등급': record.grades.total.grade,
                    '합격여부': record.grades.passStatus === 'pass' ? '합격' : '불합격',
                    '상태': record.status === 'completed' ? '완료' : '진행중',
                    '수료증번호': record.certificate ? record.certificate.certificateNumber : '-'
                });
            });
        });

        return data;
    }

    // ===== Public API =====
    return {
        init: init,

        // 성적 조회
        getComprehensiveGrades: getComprehensiveGrades,
        getDetailedGrades: getDetailedGrades,
        getUserLearningHistory: getUserLearningHistory,

        // 통계
        getUserGradeStats: getUserGradeStats,

        // 성적표
        generateGradeReport: generateGradeReport,
        downloadGradeReport: downloadGradeReport,

        // 데이터 관리
        exportGradesData: exportGradesData,

        // 유틸리티
        calculateGrade: calculateGrade
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.GradesManager = GradesManager;
    document.addEventListener('DOMContentLoaded', function() {
        GradesManager.init();
    });
}
