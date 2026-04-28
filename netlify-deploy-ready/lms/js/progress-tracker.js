/**
 * ================================================
 * AXINOVA LMS - 학습 진도 관리 시스템
 * ================================================
 * 파일명: progress-tracker.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 차시별 진도 추적, 전체 진도율 계산, 이어보기
 * ================================================
 */

const ProgressTracker = (function() {
    'use strict';

    // ===== 상수 정의 =====
    const STORAGE_KEY = 'lms_progress';

    // ===== Private 변수 =====
    let progressData = [];
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        loadProgressData();
        currentUser = getCurrentUser();
        console.log('[ProgressTracker] 초기화 완료');
    }

    // ===== 데이터 로드 =====
    function loadProgressData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            progressData = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[ProgressTracker] 데이터 로드 실패:', error);
            progressData = [];
        }
    }

    // ===== 데이터 저장 =====
    function saveProgressData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(progressData));
            return true;
        } catch (error) {
            console.error('[ProgressTracker] 데이터 저장 실패:', error);
            return false;
        }
    }

    // ===== 현재 사용자 가져오기 =====
    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            return null;
        }
    }

    // ===== 진도 업데이트 =====
    /**
     * 강의 진도 업데이트
     * @param {string} courseId 
     * @param {string} lessonId 
     * @param {number} currentTime - 현재 재생 시간 (초)
     * @param {number} duration - 전체 시간 (초)
     * @param {boolean} completed - 완료 여부
     */
    function updateProgress(courseId, lessonId, currentTime, duration, completed = false) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        const progressPercentage = duration > 0 ? (currentTime / duration) * 100 : 0;

        // 기존 진도 찾기
        let userProgress = progressData.find(
            p => p.userId === currentUser.id && p.courseId === courseId
        );

        if (!userProgress) {
            // 새 과정 진도 생성
            userProgress = {
                id: generateId(),
                userId: currentUser.id,
                userName: currentUser.name,
                courseId: courseId,
                lessons: [],
                overallProgress: 0,
                completedLessons: 0,
                totalLessons: 0,
                startedAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };
            progressData.push(userProgress);
        }

        // 차시 진도 업데이트
        let lessonProgress = userProgress.lessons.find(l => l.lessonId === lessonId);

        if (!lessonProgress) {
            lessonProgress = {
                lessonId: lessonId,
                progress: 0,
                completed: false,
                currentTime: 0,
                duration: duration,
                startedAt: new Date().toISOString(),
                lastWatchedAt: new Date().toISOString()
            };
            userProgress.lessons.push(lessonProgress);
        }

        // 진도 업데이트
        lessonProgress.progress = Math.min(Math.round(progressPercentage * 10) / 10, 100);
        lessonProgress.currentTime = currentTime;
        lessonProgress.duration = duration;
        lessonProgress.lastWatchedAt = new Date().toISOString();

        if (completed || progressPercentage >= 95) {
            lessonProgress.completed = true;
            lessonProgress.progress = 100;
            lessonProgress.completedAt = new Date().toISOString();
        }

        userProgress.updatedAt = new Date().toISOString();

        // 전체 진도율 재계산
        recalculateOverallProgress(userProgress);

        saveProgressData();

        return {
            success: true,
            lessonProgress: lessonProgress,
            overallProgress: userProgress.overallProgress
        };
    }

    // ===== 전체 진도율 재계산 =====
    function recalculateOverallProgress(userProgress) {
        const totalLessons = userProgress.lessons.length;
        const completedLessons = userProgress.lessons.filter(l => l.completed).length;
        
        if (totalLessons === 0) {
            userProgress.overallProgress = 0;
        } else {
            userProgress.overallProgress = Math.round((completedLessons / totalLessons) * 100 * 10) / 10;
        }

        userProgress.completedLessons = completedLessons;
        userProgress.totalLessons = totalLessons;
    }

    // ===== 진도 조회 =====
    /**
     * 특정 과정의 진도 조회
     */
    function getCourseProgress(userId, courseId) {
        const progress = progressData.find(
            p => p.userId === userId && p.courseId === courseId
        );
        return progress || null;
    }

    /**
     * 특정 차시의 진도 조회
     */
    function getLessonProgress(userId, courseId, lessonId) {
        const courseProgress = getCourseProgress(userId, courseId);
        if (!courseProgress) return null;

        const lessonProgress = courseProgress.lessons.find(l => l.lessonId === lessonId);
        return lessonProgress || null;
    }

    /**
     * 사용자의 모든 과정 진도 조회
     */
    function getUserAllProgress(userId) {
        return progressData.filter(p => p.userId === userId);
    }

    // ===== 차시 완료 여부 =====
    function isLessonCompleted(userId, courseId, lessonId) {
        const lessonProgress = getLessonProgress(userId, courseId, lessonId);
        return lessonProgress ? lessonProgress.completed : false;
    }

    // ===== 다음 미완료 차시 찾기 =====
    function getNextIncompleteLesson(userId, courseId, allLessonIds) {
        const courseProgress = getCourseProgress(userId, courseId);
        if (!courseProgress) return allLessonIds[0] || null;

        for (let lessonId of allLessonIds) {
            const lessonProgress = courseProgress.lessons.find(l => l.lessonId === lessonId);
            if (!lessonProgress || !lessonProgress.completed) {
                return lessonId;
            }
        }

        return null; // 모두 완료
    }

    // ===== 이어보기 위치 가져오기 =====
    function getResumePosition(userId, courseId, lessonId) {
        const lessonProgress = getLessonProgress(userId, courseId, lessonId);
        if (!lessonProgress) return 0;

        // 완료된 차시는 처음부터
        if (lessonProgress.completed) return 0;

        // 미완료 차시는 마지막 시청 위치
        return lessonProgress.currentTime || 0;
    }

    // ===== 진도율 통계 =====
    function getProgressStats(userId, courseId) {
        const courseProgress = getCourseProgress(userId, courseId);
        if (!courseProgress) {
            return {
                totalLessons: 0,
                completedLessons: 0,
                inProgressLessons: 0,
                notStartedLessons: 0,
                overallProgress: 0
            };
        }

        const inProgressLessons = courseProgress.lessons.filter(
            l => !l.completed && l.progress > 0
        ).length;

        return {
            totalLessons: courseProgress.totalLessons,
            completedLessons: courseProgress.completedLessons,
            inProgressLessons: inProgressLessons,
            notStartedLessons: courseProgress.totalLessons - courseProgress.completedLessons - inProgressLessons,
            overallProgress: courseProgress.overallProgress
        };
    }

    // ===== 학습 시간 통계 =====
    function getTotalWatchTime(userId, courseId) {
        const courseProgress = getCourseProgress(userId, courseId);
        if (!courseProgress) return 0;

        let totalTime = 0;
        courseProgress.lessons.forEach(lesson => {
            totalTime += lesson.currentTime || 0;
        });

        return Math.round(totalTime);
    }

    // ===== 차시 완료 처리 =====
    function completeLesson(userId, courseId, lessonId) {
        const lessonProgress = getLessonProgress(userId, courseId, lessonId);
        if (!lessonProgress) {
            // 진도가 없으면 생성
            updateProgress(courseId, lessonId, 0, 0, true);
        } else {
            lessonProgress.completed = true;
            lessonProgress.progress = 100;
            lessonProgress.completedAt = new Date().toISOString();

            const courseProgress = getCourseProgress(userId, courseId);
            recalculateOverallProgress(courseProgress);
            saveProgressData();
        }

        return { success: true, message: '차시가 완료되었습니다.' };
    }

    // ===== 관리자: 전체 진도 데이터 =====
    function getAllProgressData() {
        return progressData;
    }

    /**
     * 과정별 진도 요약
     */
    function getProgressSummaryByCourse(courseId) {
        const courseProgressList = progressData.filter(p => p.courseId === courseId);

        return courseProgressList.map(progress => ({
            userId: progress.userId,
            userName: progress.userName,
            overallProgress: progress.overallProgress,
            completedLessons: progress.completedLessons,
            totalLessons: progress.totalLessons,
            startedAt: progress.startedAt,
            updatedAt: progress.updatedAt
        }));
    }

    // ===== 데이터 내보내기 =====
    function exportProgressData(courseId = null) {
        let exportData = progressData;
        if (courseId) {
            exportData = progressData.filter(p => p.courseId === courseId);
        }

        const rows = [];
        exportData.forEach(progress => {
            progress.lessons.forEach(lesson => {
                rows.push({
                    '사용자ID': progress.userId,
                    '사용자명': progress.userName,
                    '과정ID': progress.courseId,
                    '차시ID': lesson.lessonId,
                    '진도율(%)': lesson.progress,
                    '완료여부': lesson.completed ? 'Y' : 'N',
                    '현재시간(초)': lesson.currentTime,
                    '전체시간(초)': lesson.duration,
                    '시작일시': lesson.startedAt,
                    '마지막시청': lesson.lastWatchedAt
                });
            });
        });

        return rows;
    }

    // ===== 진도 초기화 =====
    function resetProgress(userId, courseId) {
        const index = progressData.findIndex(
            p => p.userId === userId && p.courseId === courseId
        );

        if (index >= 0) {
            progressData.splice(index, 1);
            saveProgressData();
            return { success: true, message: '진도가 초기화되었습니다.' };
        }

        return { success: false, message: '진도 데이터를 찾을 수 없습니다.' };
    }

    // ===== 전체 데이터 삭제 =====
    function clearAllProgress() {
        if (confirm('모든 진도 데이터를 삭제하시겠습니까?')) {
            progressData = [];
            saveProgressData();
            return { success: true, message: '모든 진도 데이터가 삭제되었습니다.' };
        }
        return { success: false, message: '취소되었습니다.' };
    }

    // ===== 유틸리티: ID 생성 =====
    function generateId() {
        return 'PRG-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===== Public API =====
    return {
        init: init,

        // 진도 업데이트
        updateProgress: updateProgress,
        completeLesson: completeLesson,

        // 진도 조회
        getCourseProgress: getCourseProgress,
        getLessonProgress: getLessonProgress,
        getUserAllProgress: getUserAllProgress,
        isLessonCompleted: isLessonCompleted,

        // 학습 관리
        getNextIncompleteLesson: getNextIncompleteLesson,
        getResumePosition: getResumePosition,

        // 통계
        getProgressStats: getProgressStats,
        getTotalWatchTime: getTotalWatchTime,

        // 관리자
        getAllProgressData: getAllProgressData,
        getProgressSummaryByCourse: getProgressSummaryByCourse,
        exportProgressData: exportProgressData,

        // 데이터 관리
        resetProgress: resetProgress,
        clearAllProgress: clearAllProgress
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.ProgressTracker = ProgressTracker;
    document.addEventListener('DOMContentLoaded', function() {
        ProgressTracker.init();
    });
}
