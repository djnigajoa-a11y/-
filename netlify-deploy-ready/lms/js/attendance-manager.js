/**
 * ================================================
 * AXINOVA LMS - 출결 관리 시스템
 * ================================================
 * 파일명: attendance-manager.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 온라인 출석 체크, 출석률 계산, 수료 판정
 * ================================================
 */

const AttendanceManager = (function() {
    'use strict';

    // ===== 상수 정의 =====
    const STORAGE_KEY = 'lms_attendance';
    const MIN_WATCH_PERCENTAGE = 80; // 출석 인정 최소 시청률
    const REQUIRED_ATTENDANCE_RATE = 80; // 수료 필요 출석률

    // ===== Private 변수 =====
    let attendanceData = [];
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        loadAttendanceData();
        currentUser = getCurrentUser();
        console.log('[AttendanceManager] 초기화 완료');
    }

    // ===== 데이터 로드 =====
    function loadAttendanceData() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            attendanceData = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[AttendanceManager] 데이터 로드 실패:', error);
            attendanceData = [];
        }
    }

    // ===== 데이터 저장 =====
    function saveAttendanceData() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(attendanceData));
            return true;
        } catch (error) {
            console.error('[AttendanceManager] 데이터 저장 실패:', error);
            return false;
        }
    }

    // ===== 현재 사용자 가져오기 =====
    function getCurrentUser() {
        try {
            const userData = localStorage.getItem('currentUser');
            return userData ? JSON.parse(userData) : null;
        } catch (error) {
            console.error('[AttendanceManager] 사용자 정보 로드 실패:', error);
            return null;
        }
    }

    // ===== 출석 기록 =====
    /**
     * 강의 시청 출석 기록
     * @param {string} courseId - 과정 ID
     * @param {string} lessonId - 차시 ID
     * @param {number} watchedDuration - 시청 시간 (초)
     * @param {number} totalDuration - 전체 시간 (초)
     * @returns {object} 출석 기록 결과
     */
    function recordAttendance(courseId, lessonId, watchedDuration, totalDuration) {
        if (!currentUser) {
            return { success: false, message: '로그인이 필요합니다.' };
        }

        const watchPercentage = (watchedDuration / totalDuration) * 100;
        const isCompleted = watchPercentage >= MIN_WATCH_PERCENTAGE;

        // 기존 출석 기록 확인
        const existingIndex = attendanceData.findIndex(
            record => record.userId === currentUser.id &&
                      record.courseId === courseId &&
                      record.lessonId === lessonId
        );

        const attendanceRecord = {
            id: existingIndex >= 0 ? attendanceData[existingIndex].id : generateId(),
            userId: currentUser.id,
            userName: currentUser.name,
            courseId: courseId,
            lessonId: lessonId,
            watchedDuration: watchedDuration,
            totalDuration: totalDuration,
            watchPercentage: Math.round(watchPercentage * 10) / 10,
            completed: isCompleted,
            attendedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };

        if (existingIndex >= 0) {
            // 기존 기록 업데이트 (더 높은 시청률로)
            if (watchPercentage > attendanceData[existingIndex].watchPercentage) {
                attendanceData[existingIndex] = attendanceRecord;
            }
        } else {
            // 새 기록 추가
            attendanceData.push(attendanceRecord);
        }

        saveAttendanceData();

        return {
            success: true,
            message: isCompleted ? '출석이 인정되었습니다.' : '최소 시청 시간(80%)을 충족하지 못했습니다.',
            record: attendanceRecord,
            isCompleted: isCompleted
        };
    }

    // ===== 자동 출석 체크 (영상 시청 중) =====
    /**
     * 영상 플레이어에서 주기적으로 호출
     * @param {string} courseId 
     * @param {string} lessonId 
     * @param {number} currentTime - 현재 재생 시간
     * @param {number} duration - 총 재생 시간
     */
    function autoCheckAttendance(courseId, lessonId, currentTime, duration) {
        const watchPercentage = (currentTime / duration) * 100;
        
        if (watchPercentage >= MIN_WATCH_PERCENTAGE) {
            recordAttendance(courseId, lessonId, currentTime, duration);
        }
    }

    // ===== 출석 기록 조회 =====
    /**
     * 특정 사용자의 특정 과정 출석 기록 조회
     */
    function getAttendanceRecords(userId, courseId) {
        return attendanceData.filter(
            record => record.userId === userId && record.courseId === courseId
        );
    }

    /**
     * 특정 차시의 출석 여부 확인
     */
    function isLessonAttended(userId, courseId, lessonId) {
        const record = attendanceData.find(
            r => r.userId === userId && 
                 r.courseId === courseId && 
                 r.lessonId === lessonId &&
                 r.completed === true
        );
        return record !== undefined;
    }

    // ===== 출석률 계산 =====
    /**
     * 과정별 출석률 계산
     * @param {string} userId 
     * @param {string} courseId 
     * @param {number} totalLessons - 전체 차시 수
     * @returns {object} 출석률 정보
     */
    function calculateAttendanceRate(userId, courseId, totalLessons) {
        const records = getAttendanceRecords(userId, courseId);
        const completedLessons = records.filter(r => r.completed === true).length;
        const attendanceRate = totalLessons > 0 ? (completedLessons / totalLessons) * 100 : 0;

        return {
            totalLessons: totalLessons,
            completedLessons: completedLessons,
            attendanceRate: Math.round(attendanceRate * 10) / 10,
            isQualified: attendanceRate >= REQUIRED_ATTENDANCE_RATE,
            requiredRate: REQUIRED_ATTENDANCE_RATE
        };
    }

    // ===== 출석 통계 =====
    /**
     * 전체 과정의 출석 통계
     */
    function getAttendanceStats(userId) {
        const userRecords = attendanceData.filter(r => r.userId === userId);
        
        // 과정별 그룹화
        const courseGroups = {};
        userRecords.forEach(record => {
            if (!courseGroups[record.courseId]) {
                courseGroups[record.courseId] = [];
            }
            courseGroups[record.courseId].push(record);
        });

        return {
            totalRecords: userRecords.length,
            completedRecords: userRecords.filter(r => r.completed).length,
            courseCount: Object.keys(courseGroups).length,
            courseGroups: courseGroups
        };
    }

    // ===== 관리자: 전체 출석 현황 =====
    /**
     * 관리자용 전체 출석 데이터
     */
    function getAllAttendanceData() {
        return attendanceData;
    }

    /**
     * 과정별 출석 현황
     */
    function getAttendanceByCourseSummary(courseId) {
        const courseRecords = attendanceData.filter(r => r.courseId === courseId);
        
        // 사용자별 그룹화
        const userGroups = {};
        courseRecords.forEach(record => {
            if (!userGroups[record.userId]) {
                userGroups[record.userId] = {
                    userId: record.userId,
                    userName: record.userName,
                    records: []
                };
            }
            userGroups[record.userId].records.push(record);
        });

        return Object.values(userGroups).map(user => ({
            userId: user.userId,
            userName: user.userName,
            totalAttendance: user.records.length,
            completedAttendance: user.records.filter(r => r.completed).length
        }));
    }

    // ===== 수료 판정 =====
    /**
     * 출석률 기준 수료 가능 여부 확인
     */
    function checkCompletionByAttendance(userId, courseId, totalLessons) {
        const stats = calculateAttendanceRate(userId, courseId, totalLessons);
        return {
            canComplete: stats.isQualified,
            attendanceRate: stats.attendanceRate,
            requiredRate: REQUIRED_ATTENDANCE_RATE,
            message: stats.isQualified 
                ? '출석 요건을 충족했습니다.' 
                : `출석률이 부족합니다. (현재: ${stats.attendanceRate}%, 필요: ${REQUIRED_ATTENDANCE_RATE}%)`
        };
    }

    // ===== 데이터 내보내기 (Excel용) =====
    function exportAttendanceData(courseId = null) {
        let exportData = attendanceData;
        if (courseId) {
            exportData = attendanceData.filter(r => r.courseId === courseId);
        }

        return exportData.map(record => ({
            '사용자ID': record.userId,
            '사용자명': record.userName,
            '과정ID': record.courseId,
            '차시ID': record.lessonId,
            '시청시간(초)': record.watchedDuration,
            '전체시간(초)': record.totalDuration,
            '시청률(%)': record.watchPercentage,
            '출석인정': record.completed ? 'Y' : 'N',
            '출석일시': record.attendedAt
        }));
    }

    // ===== 데이터 삭제 =====
    function deleteAttendance(attendanceId) {
        const index = attendanceData.findIndex(r => r.id === attendanceId);
        if (index >= 0) {
            attendanceData.splice(index, 1);
            saveAttendanceData();
            return { success: true, message: '출석 기록이 삭제되었습니다.' };
        }
        return { success: false, message: '출석 기록을 찾을 수 없습니다.' };
    }

    // ===== 데이터 초기화 =====
    function clearAttendanceData() {
        if (confirm('모든 출석 데이터를 삭제하시겠습니까?')) {
            attendanceData = [];
            saveAttendanceData();
            return { success: true, message: '모든 출석 데이터가 삭제되었습니다.' };
        }
        return { success: false, message: '취소되었습니다.' };
    }

    // ===== 유틸리티: ID 생성 =====
    function generateId() {
        return 'ATT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===== Public API =====
    return {
        init: init,
        
        // 출석 기록
        recordAttendance: recordAttendance,
        autoCheckAttendance: autoCheckAttendance,
        
        // 출석 조회
        getAttendanceRecords: getAttendanceRecords,
        isLessonAttended: isLessonAttended,
        calculateAttendanceRate: calculateAttendanceRate,
        getAttendanceStats: getAttendanceStats,
        
        // 관리자
        getAllAttendanceData: getAllAttendanceData,
        getAttendanceByCourseSummary: getAttendanceByCourseSummary,
        exportAttendanceData: exportAttendanceData,
        
        // 수료 판정
        checkCompletionByAttendance: checkCompletionByAttendance,
        
        // 데이터 관리
        deleteAttendance: deleteAttendance,
        clearAttendanceData: clearAttendanceData,
        
        // 상수
        MIN_WATCH_PERCENTAGE: MIN_WATCH_PERCENTAGE,
        REQUIRED_ATTENDANCE_RATE: REQUIRED_ATTENDANCE_RATE
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.AttendanceManager = AttendanceManager;
    document.addEventListener('DOMContentLoaded', function() {
        AttendanceManager.init();
    });
}
