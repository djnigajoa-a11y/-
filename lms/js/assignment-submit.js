// ===================================
// AXINOVA 평생교육원 - 과제 제출 페이지 JavaScript
// ===================================

// 전역 변수
let uploadedFiles = [];
let assignmentData = null;
let isDraft = false;

// 페이지 로드 시 초기화
document.addEventListener('DOMContentLoaded', function() {
    // URL에서 과제 ID 가져오기
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('id');
    
    if (assignmentId) {
        loadAssignmentData(assignmentId);
    }
    
    // 이벤트 리스너 등록
    initializeEventListeners();
    
    // 임시저장된 내용 불러오기
    loadDraftIfExists(assignmentId);
});

// 과제 데이터 로드
function loadAssignmentData(assignmentId) {
    try {
        const assignments = AssignmentManager.getAssignments();
        assignmentData = assignments.find(a => a.id === assignmentId);
        
        if (assignmentData) {
            updateAssignmentInfo(assignmentData);
            updateDeadlineTimer(assignmentData.dueDate);
            
            // 제출 내역 확인
            loadSubmissionHistory(assignmentId);
        }
    } catch (error) {
        console.error('과제 데이터 로드 실패:', error);
        showErrorMessage('과제 정보를 불러올 수 없습니다.');
    }
}

// 과제 정보 표시
function updateAssignmentInfo(assignment) {
    document.getElementById('courseName').textContent = assignment.courseTitle || '과정명 없음';
    document.getElementById('assignmentTitle').textContent = assignment.title;
    document.getElementById('assignmentDescription').innerHTML = assignment.description;
    document.getElementById('deadline').textContent = formatDateTime(assignment.dueDate);
}

// 마감일 타이머 업데이트
function updateDeadlineTimer(dueDate) {
    const updateTimer = () => {
        const now = new Date();
        const deadline = new Date(dueDate);
        const diff = deadline - now;
        
        if (diff > 0) {
            const days = Math.floor(diff / (1000 * 60 * 60 * 24));
            const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
            
            const timeRemaining = document.getElementById('timeRemaining');
            if (days > 0) {
                timeRemaining.textContent = `${days}일 ${hours}시간 남음`;
                timeRemaining.style.color = days < 3 ? '#f59e0b' : '#10b981';
            } else if (hours > 0) {
                timeRemaining.textContent = `${hours}시간 ${minutes}분 남음`;
                timeRemaining.style.color = '#ef4444';
            } else {
                timeRemaining.textContent = `${minutes}분 남음`;
                timeRemaining.style.color = '#ef4444';
                timeRemaining.style.fontWeight = '700';
            }
        } else {
            document.getElementById('timeRemaining').textContent = '마감되었습니다';
            document.getElementById('timeRemaining').style.color = '#dc2626';
            disableForm();
        }
    };
    
    updateTimer();
    setInterval(updateTimer, 60000); // 1분마다 업데이트
}

// 이벤트 리스너 초기화
function initializeEventListeners() {
    // 폼 제출
    const form = document.getElementById('submissionForm');
    form.addEventListener('submit', handleFormSubmit);
    
    // 임시저장 버튼
    const saveDraftBtn = document.getElementById('saveDraftBtn');
    saveDraftBtn.addEventListener('click', saveDraft);
    
    // 파일 업로드
    const fileUploadArea = document.getElementById('fileUploadArea');
    const fileInput = document.getElementById('fileInput');
    
    fileUploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);
    
    // 드래그 앤 드롭
    fileUploadArea.addEventListener('dragover', handleDragOver);
    fileUploadArea.addEventListener('dragleave', handleDragLeave);
    fileUploadArea.addEventListener('drop', handleFileDrop);
    
    // 글자 수 카운터
    const content = document.getElementById('submissionContent');
    content.addEventListener('input', updateCharacterCount);
    
    // 에디터 툴바
    initializeEditorToolbar();
}

// 에디터 툴바 초기화
function initializeEditorToolbar() {
    const toolbarBtns = document.querySelectorAll('.toolbar-btn');
    const textarea = document.getElementById('submissionContent');
    
    toolbarBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const action = btn.getAttribute('data-action');
            applyTextFormatting(action, textarea);
        });
    });
}

// 텍스트 서식 적용
function applyTextFormatting(action, textarea) {
    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = textarea.value.substring(start, end);
    
    let formattedText = '';
    
    switch(action) {
        case 'bold':
            formattedText = `**${selectedText}**`;
            break;
        case 'italic':
            formattedText = `*${selectedText}*`;
            break;
        case 'underline':
            formattedText = `__${selectedText}__`;
            break;
        case 'list':
            formattedText = `\n• ${selectedText}`;
            break;
        case 'link':
            const url = prompt('URL을 입력하세요:', 'https://');
            if (url) formattedText = `[${selectedText}](${url})`;
            break;
        case 'code':
            formattedText = `\`${selectedText}\``;
            break;
    }
    
    if (formattedText) {
        textarea.value = textarea.value.substring(0, start) + formattedText + textarea.value.substring(end);
        textarea.focus();
        textarea.setSelectionRange(start, start + formattedText.length);
    }
}

// 파일 선택 처리
function handleFileSelect(event) {
    const files = Array.from(event.target.files);
    addFiles(files);
}

// 파일 드래그 오버
function handleDragOver(event) {
    event.preventDefault();
    event.currentTarget.classList.add('dragover');
}

// 파일 드래그 리브
function handleDragLeave(event) {
    event.currentTarget.classList.remove('dragover');
}

// 파일 드롭
function handleFileDrop(event) {
    event.preventDefault();
    event.currentTarget.classList.remove('dragover');
    
    const files = Array.from(event.dataTransfer.files);
    addFiles(files);
}

// 파일 추가
function addFiles(files) {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['.pdf', '.doc', '.docx', '.zip', '.rar', '.py', '.js', '.html', '.css', '.txt'];
    
    files.forEach(file => {
        // 파일 크기 확인
        if (file.size > maxSize) {
            showErrorMessage(`${file.name}은(는) 10MB를 초과합니다.`);
            return;
        }
        
        // 파일 형식 확인
        const fileExt = '.' + file.name.split('.').pop().toLowerCase();
        if (!allowedTypes.includes(fileExt)) {
            showErrorMessage(`${file.name}은(는) 지원하지 않는 형식입니다.`);
            return;
        }
        
        // 중복 확인
        if (uploadedFiles.some(f => f.name === file.name && f.size === file.size)) {
            showErrorMessage(`${file.name}은(는) 이미 추가되었습니다.`);
            return;
        }
        
        uploadedFiles.push(file);
    });
    
    renderFileList();
}

// 파일 목록 렌더링
function renderFileList() {
    const fileList = document.getElementById('fileList');
    
    if (uploadedFiles.length === 0) {
        fileList.innerHTML = '';
        return;
    }
    
    fileList.innerHTML = uploadedFiles.map((file, index) => `
        <div class="file-item">
            <div class="file-info">
                <div class="file-icon">
                    <i class="fas ${getFileIcon(file.name)}"></i>
                </div>
                <div class="file-details">
                    <div class="file-name">${file.name}</div>
                    <div class="file-size">${formatFileSize(file.size)}</div>
                </div>
            </div>
            <button class="file-remove" onclick="removeFile(${index})">
                <i class="fas fa-times"></i> 제거
            </button>
        </div>
    `).join('');
}

// 파일 제거
function removeFile(index) {
    uploadedFiles.splice(index, 1);
    renderFileList();
}

// 파일 아이콘 가져오기
function getFileIcon(filename) {
    const ext = filename.split('.').pop().toLowerCase();
    const iconMap = {
        'pdf': 'fa-file-pdf',
        'doc': 'fa-file-word',
        'docx': 'fa-file-word',
        'zip': 'fa-file-archive',
        'rar': 'fa-file-archive',
        'py': 'fa-file-code',
        'js': 'fa-file-code',
        'html': 'fa-file-code',
        'css': 'fa-file-code',
        'txt': 'fa-file-alt'
    };
    return iconMap[ext] || 'fa-file';
}

// 파일 크기 포맷
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// 글자 수 업데이트
function updateCharacterCount() {
    const content = document.getElementById('submissionContent');
    const charCount = document.getElementById('charCount');
    const count = content.value.length;
    
    charCount.textContent = count.toLocaleString();
    
    if (count > 5000) {
        charCount.style.color = '#ef4444';
        content.value = content.value.substring(0, 5000);
    } else if (count > 4500) {
        charCount.style.color = '#f59e0b';
    } else {
        charCount.style.color = '#64748b';
    }
}

// 링크 입력 추가
function addLinkInput() {
    const container = document.getElementById('linkContainer');
    const newInput = document.createElement('div');
    newInput.className = 'link-input-group';
    newInput.innerHTML = `
        <input type="url" class="form-input link-input" placeholder="https://">
        <button type="button" class="btn-add-link" style="background: #ef4444;" onclick="this.parentElement.remove()">
            <i class="fas fa-minus"></i>
        </button>
    `;
    container.appendChild(newInput);
}

// 폼 제출 처리
async function handleFormSubmit(event) {
    event.preventDefault();
    
    // 유효성 검사
    if (!validateForm()) {
        return;
    }
    
    // 제출 확인 모달 표시
    showConfirmModal();
}

// 폼 유효성 검사
function validateForm() {
    const title = document.getElementById('submissionTitle').value.trim();
    const content = document.getElementById('submissionContent').value.trim();
    
    if (!title) {
        showErrorMessage('과제 제목을 입력해주세요.');
        document.getElementById('submissionTitle').focus();
        return false;
    }
    
    if (!content) {
        showErrorMessage('과제 내용을 입력해주세요.');
        document.getElementById('submissionContent').focus();
        return false;
    }
    
    if (uploadedFiles.length === 0) {
        const confirm = window.confirm('첨부 파일이 없습니다. 계속 진행하시겠습니까?');
        if (!confirm) return false;
    }
    
    // 체크박스 확인
    const checkboxes = ['check1', 'check2', 'check3', 'check4'];
    for (let id of checkboxes) {
        if (!document.getElementById(id).checked) {
            showErrorMessage('모든 확인사항을 체크해주세요.');
            return false;
        }
    }
    
    return true;
}

// 제출 확인 모달 표시
function showConfirmModal() {
    const modal = document.getElementById('confirmModal');
    const summary = document.getElementById('submissionSummary');
    
    const title = document.getElementById('submissionTitle').value;
    const content = document.getElementById('submissionContent').value;
    const links = Array.from(document.querySelectorAll('.link-input'))
        .map(input => input.value)
        .filter(val => val);
    
    summary.innerHTML = `
        <div class="detail-row">
            <span class="detail-label">제목</span>
            <span class="detail-value">${title}</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">내용 길이</span>
            <span class="detail-value">${content.length}자</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">첨부 파일</span>
            <span class="detail-value">${uploadedFiles.length}개</span>
        </div>
        <div class="detail-row">
            <span class="detail-label">참고 링크</span>
            <span class="detail-value">${links.length}개</span>
        </div>
    `;
    
    modal.classList.add('active');
}

// 확인 모달 닫기
function closeConfirmModal() {
    document.getElementById('confirmModal').classList.remove('active');
}

// 제출 확인
async function confirmSubmission() {
    closeConfirmModal();
    
    const submitBtn = document.getElementById('submitBtn');
    submitBtn.disabled = true;
    submitBtn.innerHTML = '<i class="fas fa-spinner fa-spin"></i> 제출 중...';
    
    try {
        // 제출 데이터 준비
        const submissionData = {
            assignmentId: assignmentData.id,
            courseId: assignmentData.courseId,
            title: document.getElementById('submissionTitle').value,
            content: document.getElementById('submissionContent').value,
            files: uploadedFiles,
            links: Array.from(document.querySelectorAll('.link-input'))
                .map(input => input.value)
                .filter(val => val),
            submittedAt: new Date().toISOString()
        };
        
        // LocalStorage에 저장 (실제로는 서버로 전송)
        await submitAssignment(submissionData);
        
        // 임시저장 데이터 삭제
        deleteDraft(assignmentData.id);
        
        // 성공 모달 표시
        showSuccessModal(submissionData);
        
    } catch (error) {
        console.error('제출 실패:', error);
        showErrorMessage('과제 제출에 실패했습니다. 다시 시도해주세요.');
        submitBtn.disabled = false;
        submitBtn.innerHTML = '<i class="fas fa-paper-plane"></i> 과제 제출하기';
    }
}

// 과제 제출
async function submitAssignment(submissionData) {
    return new Promise((resolve, reject) => {
        setTimeout(() => {
            try {
                // AssignmentManager 사용
                const result = AssignmentManager.submitAssignment(
                    submissionData.assignmentId,
                    submissionData.content,
                    submissionData.files[0] || null
                );
                
                if (result.success) {
                    resolve(result);
                } else {
                    reject(new Error(result.message));
                }
            } catch (error) {
                reject(error);
            }
        }, 1500);
    });
}

// 성공 모달 표시
function showSuccessModal(submissionData) {
    const modal = document.getElementById('successModal');
    const submissionId = 'SUB' + Date.now().toString().substr(-8);
    const submissionTime = formatDateTime(new Date());
    
    document.getElementById('submissionId').textContent = submissionId;
    document.getElementById('submissionTime').textContent = submissionTime;
    
    modal.classList.add('active');
}

// My강의실로 이동
function goToMyClassroom() {
    window.location.href = '../my-classroom-lms.html';
}

// 임시저장
function saveDraft() {
    const urlParams = new URLSearchParams(window.location.search);
    const assignmentId = urlParams.get('id');
    
    const draftData = {
        assignmentId: assignmentId,
        title: document.getElementById('submissionTitle').value,
        content: document.getElementById('submissionContent').value,
        savedAt: new Date().toISOString()
    };
    
    localStorage.setItem(`assignment_draft_${assignmentId}`, JSON.stringify(draftData));
    
    showSuccessMessage('임시저장되었습니다.');
}

// 임시저장 불러오기
function loadDraftIfExists(assignmentId) {
    const draftKey = `assignment_draft_${assignmentId}`;
    const draftData = localStorage.getItem(draftKey);
    
    if (draftData) {
        const draft = JSON.parse(draftData);
        
        const confirmed = confirm(`임시저장된 내용이 있습니다.\n(${formatDateTime(draft.savedAt)})\n불러오시겠습니까?`);
        
        if (confirmed) {
            document.getElementById('submissionTitle').value = draft.title;
            document.getElementById('submissionContent').value = draft.content;
            updateCharacterCount();
        }
    }
}

// 임시저장 삭제
function deleteDraft(assignmentId) {
    localStorage.removeItem(`assignment_draft_${assignmentId}`);
}

// 제출 내역 로드
function loadSubmissionHistory(assignmentId) {
    try {
        const submissions = AssignmentManager.getSubmissions();
        const history = submissions.filter(s => s.assignmentId === assignmentId);
        
        if (history.length > 0) {
            const historySection = document.getElementById('submissionHistory');
            const historyList = document.getElementById('historyList');
            
            historyList.innerHTML = history.map(sub => `
                <div class="history-item">
                    <div class="history-header">
                        <span class="history-date">${formatDateTime(sub.submittedAt)}</span>
                        <span class="history-status status-${sub.status}">
                            ${sub.status === 'submitted' ? '제출완료' : '채점완료'}
                        </span>
                    </div>
                    <div class="history-content">
                        ${sub.grade ? `점수: ${sub.grade}점` : '채점 대기 중'}
                    </div>
                </div>
            `).join('');
            
            historySection.style.display = 'block';
        }
    } catch (error) {
        console.error('제출 내역 로드 실패:', error);
    }
}

// 폼 비활성화
function disableForm() {
    const form = document.getElementById('submissionForm');
    const inputs = form.querySelectorAll('input, textarea, button');
    inputs.forEach(input => input.disabled = true);
    
    showErrorMessage('마감일이 지나 제출할 수 없습니다.');
}

// 날짜/시간 포맷
function formatDateTime(date) {
    const d = new Date(date);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, '0');
    const day = String(d.getDate()).padStart(2, '0');
    const hours = String(d.getHours()).padStart(2, '0');
    const minutes = String(d.getMinutes()).padStart(2, '0');
    
    return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 성공 메시지 표시
function showSuccessMessage(message) {
    alert('✅ ' + message);
}

// 에러 메시지 표시
function showErrorMessage(message) {
    alert('❌ ' + message);
}
