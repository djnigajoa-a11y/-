/**
 * ================================================
 * AXINOVA LMS - 수료증 발급 시스템
 * ================================================
 * 파일명: certificate-manager.js
 * 버전: v1.0
 * 작성일: 2026-02-26
 * 설명: 수료증 자동 발급, PDF 생성, 이력 관리
 * 의존성: jsPDF 라이브러리 필요 (CDN: https://cdnjs.cloudflare.com/ajax/libs/jspdf/2.5.1/jspdf.umd.min.js)
 * ================================================
 */

const CertificateManager = (function() {
    'use strict';

    // ===== 상수 정의 =====
    const STORAGE_KEY = 'lms_certificates';
    const REQUIRED_ATTENDANCE_RATE = 80; // 출석률 80% 이상
    const REQUIRED_ASSIGNMENT_SCORE = 60; // 과제 평균 60점 이상
    const REQUIRED_EXAM_SCORE = 60; // 시험 평균 60점 이상
    const REQUIRED_FINAL_SCORE = 60; // 종합 평균 60점 이상

    // ===== Private 변수 =====
    let certificates = [];
    let currentUser = null;

    // ===== 초기화 =====
    function init() {
        loadCertificates();
        currentUser = getCurrentUser();
        console.log('[CertificateManager] 초기화 완료');
    }

    // ===== 데이터 로드 =====
    function loadCertificates() {
        try {
            const data = localStorage.getItem(STORAGE_KEY);
            certificates = data ? JSON.parse(data) : [];
        } catch (error) {
            console.error('[CertificateManager] 데이터 로드 실패:', error);
            certificates = [];
        }
    }

    // ===== 데이터 저장 =====
    function saveCertificates() {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(certificates));
            return true;
        } catch (error) {
            console.error('[CertificateManager] 데이터 저장 실패:', error);
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

    // ===== 수료 요건 확인 =====
    /**
     * 모든 수료 요건을 종합 판정
     * @param {string} userId 
     * @param {string} courseId 
     * @param {object} courseInfo - { totalLessons, courseName, coursePeriod, totalHours }
     */
    function checkCompletionRequirements(userId, courseId, courseInfo) {
        // 1. 출석률 확인
        const attendanceCheck = window.AttendanceManager 
            ? window.AttendanceManager.checkCompletionByAttendance(userId, courseId, courseInfo.totalLessons)
            : { canComplete: false, attendanceRate: 0 };

        // 2. 과제 점수 확인
        const assignmentScore = window.AssignmentManager 
            ? window.AssignmentManager.getUserAssignmentScore(userId, courseId)
            : { percentage: 0 };

        // 3. 시험 점수 확인
        const examScore = window.ExamManager 
            ? window.ExamManager.getUserExamScore(userId, courseId)
            : { percentage: 0 };

        // 4. 종합 점수 계산 (출석 30%, 과제 30%, 시험 40%)
        const finalScore = Math.round(
            (attendanceCheck.attendanceRate * 0.3 +
             assignmentScore.percentage * 0.3 +
             examScore.percentage * 0.4) * 10
        ) / 10;

        // 수료 판정
        const requirements = {
            attendance: {
                rate: attendanceCheck.attendanceRate,
                required: REQUIRED_ATTENDANCE_RATE,
                passed: attendanceCheck.canComplete
            },
            assignment: {
                score: assignmentScore.percentage,
                required: REQUIRED_ASSIGNMENT_SCORE,
                passed: assignmentScore.percentage >= REQUIRED_ASSIGNMENT_SCORE
            },
            exam: {
                score: examScore.percentage,
                required: REQUIRED_EXAM_SCORE,
                passed: examScore.percentage >= REQUIRED_EXAM_SCORE
            },
            final: {
                score: finalScore,
                required: REQUIRED_FINAL_SCORE,
                passed: finalScore >= REQUIRED_FINAL_SCORE
            }
        };

        const canComplete = requirements.attendance.passed && 
                            requirements.assignment.passed && 
                            requirements.exam.passed && 
                            requirements.final.passed;

        return {
            canComplete: canComplete,
            requirements: requirements,
            finalScore: finalScore,
            message: canComplete 
                ? '수료 요건을 모두 충족했습니다.' 
                : '수료 요건을 충족하지 못했습니다.'
        };
    }

    // ===== 수료증 발급 =====
    /**
     * @param {string} userId 
     * @param {object} courseInfo
     * @param {string} courseId
     * @param {string} courseName
     * @param {string} coursePeriod - 'YYYY-MM-DD ~ YYYY-MM-DD'
     * @param {number} totalHours
     * @param {number} totalLessons
     */
    function issueCertificate(userId, courseInfo) {
        // 이미 발급되었는지 확인
        const existing = certificates.find(
            c => c.userId === userId && c.courseId === courseInfo.courseId
        );
        if (existing) {
            return {
                success: false,
                message: '이미 수료증이 발급되었습니다.',
                certificate: existing
            };
        }

        // 수료 요건 확인
        const completion = checkCompletionRequirements(userId, courseInfo.courseId, courseInfo);
        if (!completion.canComplete) {
            return {
                success: false,
                message: completion.message,
                requirements: completion.requirements
            };
        }

        // 사용자 정보 조회
        const users = JSON.parse(localStorage.getItem('lms_users') || '[]');
        const user = users.find(u => u.id === userId) || currentUser;

        if (!user) {
            return { success: false, message: '사용자 정보를 찾을 수 없습니다.' };
        }

        // 수료증 번호 생성
        const certificateNumber = generateCertificateNumber();

        const certificate = {
            id: generateId(),
            certificateNumber: certificateNumber,
            userId: userId,
            userName: user.name || user.userName,
            birthDate: user.birthDate || '',
            courseId: courseInfo.courseId,
            courseName: courseInfo.courseName,
            coursePeriod: courseInfo.coursePeriod,
            totalHours: courseInfo.totalHours || 0,
            totalLessons: courseInfo.totalLessons || 0,
            attendanceRate: completion.requirements.attendance.rate,
            assignmentScore: completion.requirements.assignment.score,
            examScore: completion.requirements.exam.score,
            finalScore: completion.finalScore,
            issueDate: new Date().toISOString(),
            issuedBy: 'AXINOVA 평생교육원',
            pdfGenerated: false,
            pdfUrl: null
        };

        certificates.push(certificate);
        saveCertificates();

        return {
            success: true,
            message: '수료증이 발급되었습니다.',
            certificate: certificate
        };
    }

    // ===== 수료증 PDF 생성 =====
    /**
     * jsPDF를 사용하여 수료증 PDF 생성
     */
    async function generateCertificatePDF(certificateId) {
        const certificate = certificates.find(c => c.id === certificateId);
        if (!certificate) {
            return { success: false, message: '수료증을 찾을 수 없습니다.' };
        }

        // jsPDF 라이브러리 확인
        if (typeof jspdf === 'undefined' && typeof window.jspdf === 'undefined') {
            console.error('[CertificateManager] jsPDF 라이브러리가 로드되지 않았습니다.');
            return { success: false, message: 'PDF 라이브러리를 불러오지 못했습니다.' };
        }

        try {
            const { jsPDF } = window.jspdf;
            const doc = new jsPDF({
                orientation: 'landscape',
                unit: 'mm',
                format: 'a4'
            });

            // 수료증 디자인 (간단한 버전)
            const pageWidth = doc.internal.pageSize.getWidth();
            const pageHeight = doc.internal.pageSize.getHeight();

            // 테두리
            doc.setLineWidth(2);
            doc.setDrawColor(102, 126, 234); // #667eea
            doc.rect(10, 10, pageWidth - 20, pageHeight - 20);

            doc.setLineWidth(0.5);
            doc.rect(15, 15, pageWidth - 30, pageHeight - 30);

            // 제목
            doc.setFontSize(36);
            doc.setFont('helvetica', 'bold');
            doc.text('수 료 증', pageWidth / 2, 40, { align: 'center' });

            doc.setFontSize(16);
            doc.text('Certificate of Completion', pageWidth / 2, 50, { align: 'center' });

            // 수료증 번호
            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text(`수료증 번호: ${certificate.certificateNumber}`, pageWidth - 20, 25, { align: 'right' });

            // 본문
            doc.setFontSize(14);
            doc.setFont('helvetica', 'bold');
            doc.text(certificate.userName, pageWidth / 2, 75, { align: 'center' });

            if (certificate.birthDate) {
                doc.setFontSize(11);
                doc.setFont('helvetica', 'normal');
                doc.text(`(${certificate.birthDate})`, pageWidth / 2, 82, { align: 'center' });
            }

            doc.setFontSize(12);
            doc.setFont('helvetica', 'normal');
            const mainText = [
                '',
                '위 사람은 AXINOVA 평생교육원에서 실시한',
                '',
                `「${certificate.courseName}」`,
                '',
                `교육과정(${certificate.totalHours}시간)을 이수하였으므로`,
                '이 증서를 수여합니다.',
                ''
            ];

            let yPos = 95;
            mainText.forEach(line => {
                if (line.includes('「')) {
                    doc.setFont('helvetica', 'bold');
                    doc.setFontSize(14);
                } else {
                    doc.setFont('helvetica', 'normal');
                    doc.setFontSize(12);
                }
                doc.text(line, pageWidth / 2, yPos, { align: 'center' });
                yPos += 8;
            });

            // 교육 기간
            doc.setFontSize(11);
            doc.text(`교육 기간: ${certificate.coursePeriod}`, pageWidth / 2, yPos + 5, { align: 'center' });

            // 성적 정보
            yPos += 15;
            doc.setFontSize(10);
            const gradeInfo = [
                `출석률: ${certificate.attendanceRate}%  |  과제 점수: ${certificate.assignmentScore}점  |  시험 점수: ${certificate.examScore}점  |  종합 점수: ${certificate.finalScore}점`
            ];
            doc.text(gradeInfo[0], pageWidth / 2, yPos, { align: 'center' });

            // 발급일
            const issueDate = new Date(certificate.issueDate);
            const dateStr = `${issueDate.getFullYear()}년 ${issueDate.getMonth() + 1}월 ${issueDate.getDate()}일`;
            doc.setFontSize(12);
            doc.text(dateStr, pageWidth / 2, pageHeight - 50, { align: 'center' });

            // 발급 기관
            doc.setFontSize(16);
            doc.setFont('helvetica', 'bold');
            doc.text('AXINOVA 평생교육원', pageWidth / 2, pageHeight - 35, { align: 'center' });

            doc.setFontSize(10);
            doc.setFont('helvetica', 'normal');
            doc.text('원장  [직인]', pageWidth / 2, pageHeight - 27, { align: 'center' });

            // PDF 다운로드
            const fileName = `수료증_${certificate.userName}_${certificate.courseName.replace(/\s/g, '_')}.pdf`;
            doc.save(fileName);

            // PDF 생성 완료 표시
            certificate.pdfGenerated = true;
            certificate.pdfUrl = fileName;
            saveCertificates();

            return {
                success: true,
                message: 'PDF가 생성되었습니다.',
                fileName: fileName
            };

        } catch (error) {
            console.error('[CertificateManager] PDF 생성 실패:', error);
            return { success: false, message: 'PDF 생성 중 오류가 발생했습니다.' };
        }
    }

    // ===== 수료증 조회 =====
    function getCertificatesByUser(userId) {
        return certificates.filter(c => c.userId === userId);
    }

    function getCertificateByCourse(userId, courseId) {
        return certificates.find(c => c.userId === userId && c.courseId === courseId);
    }

    function getCertificateById(certificateId) {
        return certificates.find(c => c.id === certificateId);
    }

    function getCertificateByNumber(certificateNumber) {
        return certificates.find(c => c.certificateNumber === certificateNumber);
    }

    function getAllCertificates() {
        return certificates;
    }

    // ===== 수료증 통계 =====
    function getCertificateStats(courseId = null) {
        let data = certificates;
        if (courseId) {
            data = certificates.filter(c => c.courseId === courseId);
        }

        return {
            totalCertificates: data.length,
            averageFinalScore: data.length > 0 
                ? Math.round(data.reduce((sum, c) => sum + c.finalScore, 0) / data.length * 10) / 10 
                : 0,
            averageAttendanceRate: data.length > 0 
                ? Math.round(data.reduce((sum, c) => sum + c.attendanceRate, 0) / data.length * 10) / 10 
                : 0
        };
    }

    // ===== 수료증 검증 =====
    function verifyCertificate(certificateNumber) {
        const certificate = getCertificateByNumber(certificateNumber);
        if (!certificate) {
            return {
                valid: false,
                message: '유효하지 않은 수료증 번호입니다.'
            };
        }

        return {
            valid: true,
            message: '유효한 수료증입니다.',
            certificate: {
                certificateNumber: certificate.certificateNumber,
                userName: certificate.userName,
                courseName: certificate.courseName,
                issueDate: certificate.issueDate,
                issuedBy: certificate.issuedBy
            }
        };
    }

    // ===== 데이터 내보내기 =====
    function exportCertificatesData(courseId = null) {
        let exportData = certificates;
        if (courseId) {
            exportData = certificates.filter(c => c.courseId === courseId);
        }

        return exportData.map(cert => ({
            '수료증번호': cert.certificateNumber,
            '사용자ID': cert.userId,
            '사용자명': cert.userName,
            '생년월일': cert.birthDate,
            '과정ID': cert.courseId,
            '과정명': cert.courseName,
            '교육기간': cert.coursePeriod,
            '총교육시간': cert.totalHours,
            '출석률(%)': cert.attendanceRate,
            '과제점수': cert.assignmentScore,
            '시험점수': cert.examScore,
            '종합점수': cert.finalScore,
            '발급일': cert.issueDate,
            '발급기관': cert.issuedBy
        }));
    }

    // ===== 수료증 취소 (관리자) =====
    function revokeCertificate(certificateId) {
        if (!currentUser || currentUser.role !== 'admin') {
            return { success: false, message: '권한이 없습니다.' };
        }

        const index = certificates.findIndex(c => c.id === certificateId);
        if (index >= 0) {
            certificates.splice(index, 1);
            saveCertificates();
            return { success: true, message: '수료증이 취소되었습니다.' };
        }

        return { success: false, message: '수료증을 찾을 수 없습니다.' };
    }

    // ===== 유틸리티: 수료증 번호 생성 =====
    function generateCertificateNumber() {
        const year = new Date().getFullYear();
        const month = String(new Date().getMonth() + 1).padStart(2, '0');
        const sequence = String(certificates.length + 1).padStart(4, '0');
        return `CERT-${year}${month}-${sequence}`;
    }

    function generateId() {
        return 'CERT-' + Date.now() + '-' + Math.random().toString(36).substr(2, 9);
    }

    // ===== Public API =====
    return {
        init: init,

        // 수료 요건 확인
        checkCompletionRequirements: checkCompletionRequirements,

        // 수료증 발급
        issueCertificate: issueCertificate,
        generateCertificatePDF: generateCertificatePDF,

        // 수료증 조회
        getCertificatesByUser: getCertificatesByUser,
        getCertificateByCourse: getCertificateByCourse,
        getCertificateById: getCertificateById,
        getCertificateByNumber: getCertificateByNumber,
        getAllCertificates: getAllCertificates,

        // 수료증 검증
        verifyCertificate: verifyCertificate,

        // 통계
        getCertificateStats: getCertificateStats,

        // 데이터 관리
        exportCertificatesData: exportCertificatesData,
        revokeCertificate: revokeCertificate,

        // 상수
        REQUIRED_ATTENDANCE_RATE: REQUIRED_ATTENDANCE_RATE,
        REQUIRED_ASSIGNMENT_SCORE: REQUIRED_ASSIGNMENT_SCORE,
        REQUIRED_EXAM_SCORE: REQUIRED_EXAM_SCORE,
        REQUIRED_FINAL_SCORE: REQUIRED_FINAL_SCORE
    };
})();

// 초기화
if (typeof window !== 'undefined') {
    window.CertificateManager = CertificateManager;
    document.addEventListener('DOMContentLoaded', function() {
        CertificateManager.init();
    });
}
