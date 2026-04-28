// ========================================
// AXINOVA CMS - 회원 관리 JavaScript
// ========================================

// LocalStorage 키
const STORAGE_KEY = 'axinova_users';

// 회원 관리 객체
const UserManager = {
    // 모든 회원 가져오기
    getAll: function() {
        const data = localStorage.getItem(STORAGE_KEY);
        return data ? JSON.parse(data) : this.getDefaultUsers();
    },

    // 기본 회원 데이터
    getDefaultUsers: function() {
        return [
            {
                id: '1',
                name: '관리자',
                email: 'admin@axinova.ai.kr',
                phone: '02-1234-5678',
                birthdate: '1985-05-15',
                address: '서울특별시 강남구 테헤란로 123',
                role: 'admin',
                status: 'active',
                emailVerified: true,
                joinDate: '2024-01-01T09:00:00.000Z',
                lastLogin: '2026-02-20T10:30:00.000Z',
                notes: '시스템 관리자 계정'
            },
            {
                id: '2',
                name: '김지훈',
                email: 'jihoon.kim@example.com',
                phone: '010-1234-5678',
                birthdate: '1992-03-20',
                address: '서울특별시 서초구',
                role: 'instructor',
                status: 'active',
                emailVerified: true,
                joinDate: '2024-02-15T14:20:00.000Z',
                lastLogin: '2026-02-19T16:45:00.000Z',
                notes: 'AI 기초 과정 담당 강사'
            },
            {
                id: '3',
                name: '박민지',
                email: 'minji.park@example.com',
                phone: '010-2345-6789',
                birthdate: '1995-07-10',
                address: '경기도 성남시 분당구',
                role: 'student',
                status: 'active',
                emailVerified: true,
                joinDate: '2024-03-01T11:00:00.000Z',
                lastLogin: '2026-02-20T08:15:00.000Z',
                notes: 'Python 프로그래밍 수강 중'
            },
            {
                id: '4',
                name: '이서연',
                email: 'seoyeon.lee@example.com',
                phone: '010-3456-7890',
                birthdate: '1998-11-25',
                address: '인천광역시 연수구',
                role: 'student',
                status: 'active',
                emailVerified: false,
                joinDate: '2024-04-10T16:30:00.000Z',
                lastLogin: '2026-02-18T20:00:00.000Z',
                notes: '머신러닝 기초 과정 수강'
            },
            {
                id: '5',
                name: '최준호',
                email: 'junho.choi@example.com',
                phone: '010-4567-8901',
                birthdate: '1990-09-05',
                address: '대전광역시 유성구',
                role: 'student',
                status: 'inactive',
                emailVerified: true,
                joinDate: '2024-05-20T09:45:00.000Z',
                lastLogin: '2026-01-15T13:20:00.000Z',
                notes: '휴면 계정'
            }
        ];
    },

    // 특정 회원 가져오기
    getById: function(id) {
        const users = this.getAll();
        return users.find(user => user.id === id);
    },

    // 회원 저장
    save: function(users) {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users));
    },

    // 회원 추가
    add: function(user) {
        const users = this.getAll();
        user.id = Date.now().toString();
        user.joinDate = new Date().toISOString();
        user.lastLogin = null;
        users.push(user);
        this.save(users);
        return user;
    },

    // 회원 수정
    update: function(id, updatedUser) {
        const users = this.getAll();
        const index = users.findIndex(user => user.id === id);
        if (index !== -1) {
            users[index] = { ...users[index], ...updatedUser };
            this.save(users);
            return true;
        }
        return false;
    },

    // 회원 삭제
    delete: function(id) {
        const users = this.getAll();
        const filtered = users.filter(user => user.id !== id);
        this.save(filtered);
        return filtered.length < users.length;
    },

    // 통계 정보
    getStats: function() {
        const users = this.getAll();
        return {
            total: users.length,
            admin: users.filter(u => u.role === 'admin').length,
            instructor: users.filter(u => u.role === 'instructor').length,
            student: users.filter(u => u.role === 'student').length,
            active: users.filter(u => u.status === 'active').length
        };
    }
};

// 전역 상태
let currentFilter = 'all';
let currentSearch = '';
let selectedUsers = new Set();
let currentEditingId = null;

// 페이지 로드
document.addEventListener('DOMContentLoaded', function() {
    initializeUsers();
    updateStats();
    renderUsers();
    setupEventListeners();
});

// 초기화
function initializeUsers() {
    // 기본 회원 데이터 로드
    if (!localStorage.getItem(STORAGE_KEY)) {
        UserManager.save(UserManager.getDefaultUsers());
    }
}

// 이벤트 리스너 설정
function setupEventListeners() {
    // 필터 버튼
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            this.classList.add('active');
            currentFilter = this.dataset.filter;
            renderUsers();
        });
    });

    // 검색
    document.getElementById('searchInput').addEventListener('input', function() {
        currentSearch = this.value.toLowerCase();
        renderUsers();
    });
    
    // 전체 선택 체크박스
    document.getElementById('selectAll').addEventListener('change', function() {
        toggleSelectAll();
    });
}

// 테이블 이벤트 리스너 (이벤트 위임)
function attachTableEventListeners() {
    const tbody = document.getElementById('userTableBody');
    
    // 체크박스 변경
    tbody.querySelectorAll('.user-checkbox').forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            toggleUserSelection(this.dataset.userId);
        });
    });
    
    // 버튼 클릭
    tbody.querySelectorAll('.btn-view').forEach(btn => {
        btn.addEventListener('click', function() {
            viewUser(this.dataset.userId);
        });
    });
    
    tbody.querySelectorAll('.btn-edit').forEach(btn => {
        btn.addEventListener('click', function() {
            editUser(this.dataset.userId);
        });
    });
    
    tbody.querySelectorAll('.btn-delete').forEach(btn => {
        btn.addEventListener('click', function() {
            deleteUser(this.dataset.userId);
        });
    });
}

// 통계 업데이트
function updateStats() {
    const stats = UserManager.getStats();
    document.getElementById('totalUsers').textContent = stats.total;
    document.getElementById('adminUsers').textContent = stats.admin;
    document.getElementById('studentUsers').textContent = stats.student;
    document.getElementById('activeUsers').textContent = stats.active;

    document.getElementById('countAll').textContent = stats.total;
    document.getElementById('countAdmin').textContent = stats.admin;
    document.getElementById('countStudent').textContent = stats.student;
    document.getElementById('countInstructor').textContent = stats.instructor;
}

// 회원 렌더링
function renderUsers() {
    const users = UserManager.getAll();
    const filtered = filterUsers(users);
    const tbody = document.getElementById('userTableBody');
    const emptyState = document.getElementById('emptyState');

    if (filtered.length === 0) {
        tbody.innerHTML = '';
        emptyState.style.display = 'block';
        return;
    }

    emptyState.style.display = 'none';
    tbody.innerHTML = filtered.map(user => `
        <tr data-user-id="${user.id}">
            <td>
                <input type="checkbox" 
                       class="user-checkbox"
                       data-user-id="${user.id}"
                       ${selectedUsers.has(user.id) ? 'checked' : ''}>
            </td>
            <td><strong>${escapeHtml(user.name)}</strong></td>
            <td>${escapeHtml(user.email)}</td>
            <td>${user.phone || '-'}</td>
            <td>${getRoleBadge(user.role)}</td>
            <td>${getStatusBadge(user.status)}</td>
            <td>${formatDate(user.joinDate)}</td>
            <td>
                <div class="action-buttons">
                    <button class="btn-action btn-view" data-user-id="${user.id}" title="상세보기">
                        <i class="fas fa-eye"></i>
                    </button>
                    <button class="btn-action btn-edit" data-user-id="${user.id}" title="수정">
                        <i class="fas fa-edit"></i>
                    </button>
                    <button class="btn-action btn-delete" data-user-id="${user.id}" title="삭제">
                        <i class="fas fa-trash"></i>
                    </button>
                </div>
            </td>
        </tr>
    `).join('');
    
    // 이벤트 위임으로 버튼 클릭 처리
    attachTableEventListeners();
}

// 회원 필터링
function filterUsers(users) {
    return users.filter(user => {
        // 권한 필터
        if (currentFilter !== 'all' && user.role !== currentFilter) {
            return false;
        }

        // 검색 필터
        if (currentSearch) {
            const searchLower = currentSearch;
            return user.name.toLowerCase().includes(searchLower) ||
                   user.email.toLowerCase().includes(searchLower) ||
                   (user.phone && user.phone.includes(currentSearch));
        }

        return true;
    });
}

// 권한 뱃지
function getRoleBadge(role) {
    const badges = {
        admin: '<span class="role-badge admin"><i class="fas fa-user-shield"></i> 관리자</span>',
        instructor: '<span class="role-badge instructor"><i class="fas fa-chalkboard-teacher"></i> 강사</span>',
        student: '<span class="role-badge student"><i class="fas fa-user-graduate"></i> 수강생</span>'
    };
    return badges[role] || badges.student;
}

// 상태 뱃지
function getStatusBadge(status) {
    const badges = {
        active: '<span class="status-badge active"><i class="fas fa-check-circle"></i> 활성</span>',
        inactive: '<span class="status-badge inactive"><i class="fas fa-times-circle"></i> 비활성</span>',
        suspended: '<span class="status-badge suspended"><i class="fas fa-ban"></i> 정지</span>'
    };
    return badges[status] || badges.active;
}

// 날짜 포맷
function formatDate(dateString) {
    if (!dateString) return '-';
    const date = new Date(dateString);
    return date.toLocaleDateString('ko-KR', {
        year: 'numeric',
        month: '2-digit',
        day: '2-digit'
    });
}

// HTML 이스케이프
function escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
}

// 회원 선택 토글
function toggleUserSelection(userId) {
    if (selectedUsers.has(userId)) {
        selectedUsers.delete(userId);
    } else {
        selectedUsers.add(userId);
    }
    updateBulkActions();
}

// 전체 선택 토글
function toggleSelectAll() {
    const checkbox = document.getElementById('selectAll');
    const users = UserManager.getAll();
    const filtered = filterUsers(users);

    if (checkbox.checked) {
        filtered.forEach(user => selectedUsers.add(user.id));
    } else {
        selectedUsers.clear();
    }

    renderUsers();
    updateBulkActions();
}

// 일괄 작업 UI 업데이트
function updateBulkActions() {
    const bulkActions = document.getElementById('bulkActions');
    const selectedCount = document.getElementById('selectedCount');

    if (selectedUsers.size > 0) {
        bulkActions.style.display = 'flex';
        selectedCount.textContent = selectedUsers.size;
    } else {
        bulkActions.style.display = 'none';
    }
}

// 회원 추가 모달 열기
function openAddUserModal() {
    currentEditingId = null;
    document.getElementById('modalTitle').textContent = '회원 추가';
    document.getElementById('userForm').reset();
    document.getElementById('userId').value = '';
    document.getElementById('userModal').classList.add('active');
}

// 회원 수정
function editUser(id) {
    const user = UserManager.getById(id);
    if (!user) return;

    currentEditingId = id;
    document.getElementById('modalTitle').textContent = '회원 수정';
    document.getElementById('userId').value = user.id;
    document.getElementById('userName').value = user.name;
    document.getElementById('userEmail').value = user.email;
    document.getElementById('userPhone').value = user.phone || '';
    document.getElementById('userBirthdate').value = user.birthdate || '';
    document.getElementById('userAddress').value = user.address || '';
    document.getElementById('userRole').value = user.role;
    document.getElementById('userStatus').value = user.status;
    document.getElementById('userNotes').value = user.notes || '';
    document.getElementById('userEmailVerified').checked = user.emailVerified;

    document.getElementById('userModal').classList.add('active');
}

// 회원 저장
function saveUser() {
    const form = document.getElementById('userForm');
    if (!form.checkValidity()) {
        form.reportValidity();
        return;
    }

    const userData = {
        name: document.getElementById('userName').value.trim(),
        email: document.getElementById('userEmail').value.trim(),
        phone: document.getElementById('userPhone').value.trim(),
        birthdate: document.getElementById('userBirthdate').value,
        address: document.getElementById('userAddress').value.trim(),
        role: document.getElementById('userRole').value,
        status: document.getElementById('userStatus').value,
        notes: document.getElementById('userNotes').value.trim(),
        emailVerified: document.getElementById('userEmailVerified').checked
    };

    if (currentEditingId) {
        UserManager.update(currentEditingId, userData);
        showToast('회원 정보가 수정되었습니다.', 'success');
    } else {
        UserManager.add(userData);
        showToast('새 회원이 추가되었습니다.', 'success');
    }

    closeUserModal();
    updateStats();
    renderUsers();
}

// 회원 삭제
function deleteUser(id) {
    const user = UserManager.getById(id);
    if (!user) return;

    if (confirm(`"${user.name}" 회원을 정말 삭제하시겠습니까?`)) {
        UserManager.delete(id);
        showToast('회원이 삭제되었습니다.', 'success');
        updateStats();
        renderUsers();
    }
}

// 회원 상세보기
function viewUser(id) {
    const user = UserManager.getById(id);
    if (!user) return;

    document.getElementById('detailName').textContent = user.name;
    document.getElementById('detailEmail').textContent = user.email;
    document.getElementById('detailPhone').textContent = user.phone || '-';
    document.getElementById('detailBirthdate').textContent = user.birthdate || '-';
    document.getElementById('detailAddress').textContent = user.address || '-';
    document.getElementById('detailRole').innerHTML = getRoleBadge(user.role);
    document.getElementById('detailStatus').innerHTML = getStatusBadge(user.status);
    document.getElementById('detailEmailVerified').innerHTML = user.emailVerified 
        ? '<span style="color: #10b981;"><i class="fas fa-check-circle"></i> 인증됨</span>'
        : '<span style="color: #ef4444;"><i class="fas fa-times-circle"></i> 미인증</span>';
    document.getElementById('detailJoinDate').textContent = formatDate(user.joinDate);
    document.getElementById('detailLastLogin').textContent = user.lastLogin ? formatDate(user.lastLogin) : '없음';
    document.getElementById('detailNotes').textContent = user.notes || '메모 없음';

    currentEditingId = id;
    document.getElementById('userDetailModal').classList.add('active');
}

// 상세보기에서 수정
function editUserFromDetail() {
    closeUserDetailModal();
    editUser(currentEditingId);
}

// 모달 닫기
function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
    currentEditingId = null;
}

function closeUserDetailModal() {
    document.getElementById('userDetailModal').classList.remove('active');
}

function closeRoleModal() {
    document.getElementById('roleModal').classList.remove('active');
}

function closeStatusModal() {
    document.getElementById('statusModal').classList.remove('active');
}

// 일괄 권한 변경
function bulkChangeRole() {
    if (selectedUsers.size === 0) return;
    document.getElementById('roleModal').classList.add('active');
}

function confirmBulkRoleChange() {
    const newRole = document.getElementById('bulkRole').value;
    selectedUsers.forEach(userId => {
        UserManager.update(userId, { role: newRole });
    });

    showToast(`${selectedUsers.size}명의 회원 권한이 변경되었습니다.`, 'success');
    selectedUsers.clear();
    closeRoleModal();
    updateStats();
    renderUsers();
    updateBulkActions();
}

// 일괄 상태 변경
function bulkChangeStatus() {
    if (selectedUsers.size === 0) return;
    document.getElementById('statusModal').classList.add('active');
}

function confirmBulkStatusChange() {
    const newStatus = document.getElementById('bulkStatus').value;
    selectedUsers.forEach(userId => {
        UserManager.update(userId, { status: newStatus });
    });

    showToast(`${selectedUsers.size}명의 회원 상태가 변경되었습니다.`, 'success');
    selectedUsers.clear();
    closeStatusModal();
    updateStats();
    renderUsers();
    updateBulkActions();
}

// 일괄 삭제
function bulkDeleteUsers() {
    if (selectedUsers.size === 0) return;

    if (confirm(`선택한 ${selectedUsers.size}명의 회원을 정말 삭제하시겠습니까?`)) {
        selectedUsers.forEach(userId => {
            UserManager.delete(userId);
        });

        showToast(`${selectedUsers.size}명의 회원이 삭제되었습니다.`, 'success');
        selectedUsers.clear();
        updateStats();
        renderUsers();
        updateBulkActions();
    }
}

// 토스트 메시지
function showToast(message, type = 'info') {
    // 기존 토스트 제거
    const existingToast = document.querySelector('.toast');
    if (existingToast) {
        existingToast.remove();
    }

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.textContent = message;
    toast.style.cssText = `
        position: fixed;
        top: 20px;
        right: 20px;
        padding: 16px 24px;
        background: ${type === 'success' ? '#10b981' : '#ef4444'};
        color: white;
        border-radius: 8px;
        box-shadow: 0 4px 12px rgba(0,0,0,0.15);
        z-index: 10000;
        animation: slideInRight 0.3s ease;
    `;

    document.body.appendChild(toast);

    setTimeout(() => {
        toast.style.animation = 'slideOutRight 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// API 노출
window.UserManager = UserManager;

// 전역 함수 노출 (HTML onclick 핸들러용)
window.toggleUserSelection = toggleUserSelection;
window.toggleSelectAll = toggleSelectAll;
window.openAddUserModal = openAddUserModal;
window.editUser = editUser;
window.saveUser = saveUser;
window.deleteUser = deleteUser;
window.viewUser = viewUser;
window.editUserFromDetail = editUserFromDetail;
window.closeUserModal = closeUserModal;
window.closeUserDetailModal = closeUserDetailModal;
window.closeRoleModal = closeRoleModal;
window.closeStatusModal = closeStatusModal;
window.bulkChangeRole = bulkChangeRole;
window.confirmBulkRoleChange = confirmBulkRoleChange;
window.bulkChangeStatus = bulkChangeStatus;
window.confirmBulkStatusChange = confirmBulkStatusChange;
window.bulkDeleteUsers = bulkDeleteUsers;
