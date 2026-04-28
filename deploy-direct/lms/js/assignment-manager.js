/**
 * ================================================
 * AXINOVA LMS - 과제 제출 시스템
 * ================================================
 * 파일명: assignment-manager.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 과제 등록, 제출, 채점 관리
 * ================================================
 */

const AssignmentManager = (function() {
    'use strict';

    // ===== 상수 정의 =====
    const STORAGE_KEY_ASSIGNMENTS = 'lms_assignments';
    const STORAGE_KEY_SUBMISSIONS = 'lms_submissions';
    const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB

    // ===== Private 변수 =====
    let assignments = [];
    let submissions = [];
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        loadData();
        currentUser = getCurrentUser();
        console.log('[AssignmentManager] 초기화 완료');
    }

    // ===== 데이터 로드 =====
    function loadData() {
        try {
            const assignData = localStorage.getItem(STORAGE_KEY_ASSIGNMENTS);
            const submitData = localStorage.getItem(STORAGE_KEY_SUBMISSIONS);
            assignments = assignData ? JSON.parse(assignData) : [];
            submissions = submitData ? JSON.parse(submitData) : [];
        } catch (error) {
            console.error('[AssignmentManager] 데이터 로드 실패:', error);
            assignments = [];
            submissions = [];
        }
    }

    // ===== 데이터 저장 =====
    function saveAssignments() {
        try {
            localStorage.setItem(STORAGE_KEY_ASSIGNMENTS, JSON.stringify(assignments));
            return true;
        } catch (error) {
            console.error('[AssignmentManager] 과제 저장 실패:', error);
            return false;
        }
    }

    function saveSubmissions() {
        try {
            localStorage.setItem(STORAGE_KEY_SUBMISSIONS, JSON.stringify(submissions));
            return true;
        } catch (error) {
            console.error('[AssignmentManager] 제출 저장 실패:', error);
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

    // ===== 과제 생성 (관리자) =====
    /**
     * @param {object} assignmentData
     * @param {string} courseId
     * @param {string} title
     * @param {string} description
     * @param {string} dueDate - ISO 형식
     * @param {number} points - 배점
     * @param {string} type - 'file' or 'text'
     */
    function createAssignment(assignmentData) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const assignment = {
            id: generateId('ASSIGN'),
            courseId: assignmentData.courseId,
            title: assignmentData.title,
            description: assignmentData.description || '',
            type: assignmentData.type || 'file', // 'file', 'text', 'both'
            dueDate: assignmentData.dueDate,
            points: assignmentData.points || 0,
            createdBy: currentUser.id,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            active: true
        };

        assignments.push(assignment);
        saveAssignments();

        return {
            success: true,
            message: '과제가 등록되었습니다.',
            assignment: assignment
        };
    }

    // ===== 과제 수정 (관리자) =====
    function updateAssignment(assignmentId, updateData) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const assignment = assignments.find(a => a.id === assignmentId);
        if (!assignment) {
            return { success: false, message: '과제를 찾을 수 없습니다.' };
        }

        Object.assign(assignment, updateData, {
            updatedAt: new Date().toISOString()
        });

        saveAssignments();

        return {
            success: true,
            message: '과제가 수정되었습니다.',
            assignment: assignment
        };
    }

    // ===== 과제 삭제 (관리자) =====
    function deleteAssignment(assignmentId) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const index = assignments.findIndex(a => a.id === assignmentId);
        if (index >= 0) {
            assignments.splice(index, 1);
            saveAssignments();
            return { success: true, message: '과제가 삭제되었습니다.' };
        }

        return { success: false, message: '과제를 찾을 수 없습니다.' };
    }

    // ===== 과제 조회 =====
    function getAssignmentsByCourse(courseId) {
        return assignments.filter(a => a.courseId === courseId && a.active);
    }

    function getAssignmentById(assignmentId) {
        return assignments.find(a => a.id === assignmentId);
    }

    function getAllAssignments() {
        return assignments;
    }

    // ===== 과제 제출 (학생) =====
    /**
     * @param {object} submissionData
     * @param {string} assignmentId
     * @param {string} content - 텍스트 내용
     * @param {string} fileData - Base64 파일 데이터
     * @param {string} fileName
     */
    function submitAssignment(submissionData) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        const assignment = getAssignmentById(submissionData.assignmentId);
        if (!assignment) {
            return { success: false, message: '과제를 찾을 수 없습니다.' };
        }

        // 마감일 확인
        if (new Date(assignment.dueDate) < new Date()) {
            return { success: false, message: '제출 기한이 지났습니다.' };
        }

        // 기존 제출 확인
        const existingIndex = submissions.findIndex(
            s => s.assignmentId === submissionData.assignmentId && 
                 s.userId === currentUser.id
        );

        const submission = {
            id: existingIndex >= 0 ? submissions[existingIndex].id : generateId('SUBMIT'),
            assignmentId: submissionData.assignmentId,
            userId: currentUser.id,
            userName: currentUser.name,
            courseId: assignment.courseId,
            content: submissionData.content || '',
            fileData: submissionData.fileData || null,
            fileName: submissionData.fileName || '',
            fileSize: submissionData.fileSize || 0,
            submittedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
            score: null,
            feedback: '',
            gradedAt: null,
            gradedBy: null
        };

        if (existingIndex >= 0) {
            submissions[existingIndex] = submission;
        } else {
            submissions.push(submission);
        }

        saveSubmissions();

        return {
            success: true,
            message: '과제가 제출되었습니다.',
            submission: submission
        };
    }

    // ===== 과제 채점 (관리자) =====
    function gradeAssignment(submissionId, score, feedback = '') {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const submission = submissions.find(s => s.id === submissionId);
        if (!submission) {
            return { success: false, message: '제출물을 찾을 수 없습니다.' };
        }

        const assignment = getAssignmentById(submission.assignmentId);
        if (score > assignment.points) {
            return { success: false, message: `점수는 ${assignment.points}점을 초과할 수 없습니다.` };
        }

        submission.score = score;
        submission.feedback = feedback;
        submission.gradedAt = new Date().toISOString();
        submission.gradedBy = currentUser.id;

        saveSubmissions();

        return {
            success: true,
            message: '채점이 완료되었습니다.',
            submission: submission
        };
    }

    // ===== 제출물 조회 =====
    function getSubmissionsByAssignment(assignmentId) {
        return submissions.filter(s => s.assignmentId === assignmentId);
    }

    function getSubmissionsByUser(userId, courseId = null) {
        let userSubmissions = submissions.filter(s => s.userId === userId);
        if (courseId) {
            userSubmissions = userSubmissions.filter(s => s.courseId === courseId);
        }
        return userSubmissions;
    }

    function getSubmissionByUserAndAssignment(userId, assignmentId) {
        return submissions.find(
            s => s.userId === userId && s.assignmentId === assignmentId
        );
    }

    // ===== 제출 여부 확인 =====
    function isSubmitted(userId, assignmentId) {
        return submissions.some(
            s => s.userId === userId && s.assignmentId === assignmentId
        );
    }

    // ===== 과제 통계 =====
    function getAssignmentStats(assignmentId) {
        const assignmentSubmissions = getSubmissionsByAssignment(assignmentId);
        const gradedSubmissions = assignmentSubmissions.filter(s => s.score !== null);

        let totalScore = 0;
        gradedSubmissions.forEach(s => totalScore += s.score);

        return {
            totalSubmissions: assignmentSubmissions.length,
            gradedSubmissions: gradedSubmissions.length,
            pendingGrade: assignmentSubmissions.length - gradedSubmissions.length,
            averageScore: gradedSubmissions.length > 0 
                ? Math.round(totalScore / gradedSubmissions.length * 10) / 10 
                : 0
        };
    }

    // ===== 과정별 과제 점수 합계 =====
    function getUserAssignmentScore(userId, courseId) {
        const courseAssignments = getAssignmentsByCourse(courseId);
        const userSubmissions = getSubmissionsByUser(userId, courseId);

        let totalEarned = 0;
        let totalPossible = 0;

        courseAssignments.forEach(assignment => {
            totalPossible += assignment.points;
            const submission = userSubmissions.find(s => s.assignmentId === assignment.id);
            if (submission && submission.score !== null) {
                totalEarned += submission.score;
            }
        });

        return {
            totalEarned: totalEarned,
            totalPossible: totalPossible,
            percentage: totalPossible > 0 ? Math.round((totalEarned / totalPossible) * 100 * 10) / 10 : 0
        };
    }

    // ===== 미제출 과제 확인 =====
    function getPendingAssignments(userId, courseId) {
        const courseAssignments = getAssignmentsByCourse(courseId);
        const userSubmissions = getSubmissionsByUser(userId, courseId);

        return courseAssignments.filter(assignment => {
            const submitted = userSubmissions.some(s => s.assignmentId === assignment.id);
            return !submitted && new Date(assignment.dueDate) >= new Date();
        });
    }

    // ===== 마감 임박 과제 =====
    function getUpcomingDeadlines(userId, courseId, daysAhead = 7) {
        const pending = getPendingAssignments(userId, courseId);
        const deadline = new Date();
        deadline.setDate(deadline.getDate() + daysAhead);

        return pending.filter(assignment => {
            return new Date(assignment.dueDate) <= deadline;
        }).sort((a, b) => new Date(a.dueDate) - new Date(b.dueDate));
    }

    // ===== 데이터 내보내기 =====
    function exportSubmissionsData(courseId = null) {
        let exportData = submissions;
        if (courseId) {
            exportData = submissions.filter(s => s.courseId === courseId);
        }

        return exportData.map(submission => {
            const assignment = getAssignmentById(submission.assignmentId);
            return {
                '사용자ID': submission.userId,
                '사용자명': submission.userName,
                '과정ID': submission.courseId,
                '과제ID': submission.assignmentId,
                '과제제목': assignment ? assignment.title : '',
                '제출일시': submission.submittedAt,
                '점수': submission.score !== null ? submission.score : '미채점',
                '만점': assignment ? assignment.points : '',
                '피드백': submission.feedback,
                '채점일시': submission.gradedAt || ''
            };
        });
    }

    // ===== 파일 처리 유틸리티 =====
    function processFile(file) {
        return new Promise((resolve, reject) => {
            if (file.size > MAX_FILE_SIZE) {
                reject('파일 크기는 10MB를 초과할 수 없습니다.');
                return;
            }

            const reader = new FileReader();
            reader.onload = function(e) {
                resolve({
                    fileName: file.name,
                    fileSize: file.size,
                    fileData: e.target.result // Base64
                });
            };
            reader.onerror = function() {
                reject('파일 읽기 실패');
            };
            reader.readAsDataURL(file);
        });
    }

    // ===== 유틸리티 =====
    function generateId(prefix) {
        return prefix + '-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===== Public API =====
    return {
        init: init,

        // 과제 관리 (관리자)
        createAssignment: createAssignment,
        updateAssignment: updateAssignment,
        deleteAssignment: deleteAssignment,

        // 과제 조회
        getAssignmentsByCourse: getAssignmentsByCourse,
        getAssignmentById: getAssignmentById,
        getAllAssignments: getAllAssignments,

        // 과제 제출 (학생)
        submitAssignment: submitAssignment,
        isSubmitted: isSubmitted,
        getPendingAssignments: getPendingAssignments,
        getUpcomingDeadlines: getUpcomingDeadlines,

        // 제출물 조회
        getSubmissionsByAssignment: getSubmissionsByAssignment,
        getSubmissionsByUser: getSubmissionsByUser,
        getSubmissionByUserAndAssignment: getSubmissionByUserAndAssignment,

        // 채점 (관리자)
        gradeAssignment: gradeAssignment,

        // 통계
        getAssignmentStats: getAssignmentStats,
        getUserAssignmentScore: getUserAssignmentScore,

        // 데이터 관리
        exportSubmissionsData: exportSubmissionsData,

        // 유틸리티
        processFile: processFile,
        MAX_FILE_SIZE: MAX_FILE_SIZE
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.AssignmentManager = AssignmentManager;
    document.addEventListener('DOMContentLoaded', function() {
        AssignmentManager.init();
    });
}
