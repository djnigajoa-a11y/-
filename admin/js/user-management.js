// 사용자 관리 JavaScript
function openUserModal(userId = null) {
    const modal = document.getElementById('userModal');
    modal.classList.add('active');
    if (userId) {
        document.getElementById('userModalTitle').textContent = '사용자 수정';
    } else {
        document.getElementById('userModalTitle').textContent = '신규 사용자 추가';
        document.getElementById('userForm').reset();
    }
}

function closeUserModal() {
    document.getElementById('userModal').classList.remove('active');
}

document.getElementById('userForm')?.addEventListener('submit', function(e) {
    e.preventDefault();
    const formData = new FormData(this);
    console.log('사용자 저장:', Object.fromEntries(formData));
    alert('사용자가 저장되었습니다');
    closeUserModal();
});

function exportUsers() {
    alert('사용자 데이터를 CSV로 내보냅니다');
}
