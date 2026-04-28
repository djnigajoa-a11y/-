// AXINOVA CMS - Media Library Manager
// LocalStorage key
const MEDIA_STORAGE_KEY = 'axinova_media_library';

// Current state
let currentFilter = 'all';
let currentView = 'grid';
let currentMedia = null;
let mediaFiles = [];

// File type configurations
const FILE_TYPES = {
    image: {
        extensions: ['jpg', 'jpeg', 'png', 'gif', 'webp', 'svg'],
        icon: 'fa-image',
        maxSize: 10 * 1024 * 1024 // 10MB
    },
    document: {
        extensions: ['pdf', 'doc', 'docx', 'txt', 'zip'],
        icon: 'fa-file-alt',
        maxSize: 10 * 1024 * 1024 // 10MB
    }
};

// ========================================
// Initialization
// ========================================
document.addEventListener('DOMContentLoaded', () => {
    loadMediaFiles();
    setupEventListeners();
    renderMedia();
});

// ========================================
// Event Listeners
// ========================================
function setupEventListeners() {
    // Upload area
    const uploadArea = document.getElementById('uploadArea');
    const fileInput = document.getElementById('fileInput');

    uploadArea.addEventListener('click', () => fileInput.click());
    fileInput.addEventListener('change', handleFileSelect);

    // Drag and drop
    uploadArea.addEventListener('dragover', handleDragOver);
    uploadArea.addEventListener('dragleave', handleDragLeave);
    uploadArea.addEventListener('drop', handleDrop);

    // Filter buttons
    document.querySelectorAll('.filter-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentFilter = btn.getAttribute('data-type');
            renderMedia();
        });
    });

    // View toggle
    document.querySelectorAll('.view-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            document.querySelectorAll('.view-btn').forEach(b => b.classList.remove('active'));
            btn.classList.add('active');
            currentView = btn.getAttribute('data-view');
            toggleView();
        });
    });

    // Search
    document.getElementById('searchInput').addEventListener('input', (e) => {
        renderMedia(e.target.value);
    });
}

// ========================================
// File Upload Handlers
// ========================================
function handleDragOver(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.add('dragover');
}

function handleDragLeave(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
}

function handleDrop(e) {
    e.preventDefault();
    e.stopPropagation();
    e.currentTarget.classList.remove('dragover');
    
    const files = e.dataTransfer.files;
    processFiles(files);
}

function handleFileSelect(e) {
    const files = e.target.files;
    processFiles(files);
    e.target.value = ''; // Reset input
}

async function processFiles(files) {
    if (files.length === 0) return;

    showLoading();

    for (let file of files) {
        await uploadFile(file);
    }

    hideLoading();
    renderMedia();
    updateCounts();
}

async function uploadFile(file) {
    // Validate file
    const validation = validateFile(file);
    if (!validation.valid) {
        alert(validation.message);
        return;
    }

    // Read file as base64
    return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (e) => {
            const mediaItem = {
                id: generateId(),
                name: file.name,
                size: file.size,
                type: getFileType(file.name),
                mimeType: file.type,
                data: e.target.result,
                uploadDate: new Date().toISOString(),
                dimensions: null
            };

            // Get image dimensions if it's an image
            if (mediaItem.type === 'image') {
                const img = new Image();
                img.onload = () => {
                    mediaItem.dimensions = {
                        width: img.width,
                        height: img.height
                    };
                    saveMediaItem(mediaItem);
                    resolve();
                };
                img.src = e.target.result;
            } else {
                saveMediaItem(mediaItem);
                resolve();
            }
        };
        reader.readAsDataURL(file);
    });
}

function validateFile(file) {
    const extension = getFileExtension(file.name);
    const fileType = getFileType(file.name);

    if (!fileType) {
        return {
            valid: false,
            message: `지원하지 않는 파일 형식입니다: .${extension}`
        };
    }

    if (file.size > FILE_TYPES[fileType].maxSize) {
        return {
            valid: false,
            message: `파일 크기가 너무 큽니다. 최대 ${formatFileSize(FILE_TYPES[fileType].maxSize)}`
        };
    }

    return { valid: true };
}

// ========================================
// Media Management
// ========================================
function loadMediaFiles() {
    try {
        const stored = localStorage.getItem(MEDIA_STORAGE_KEY);
        mediaFiles = stored ? JSON.parse(stored) : [];
    } catch (error) {
        console.error('미디어 파일 로드 오류:', error);
        mediaFiles = [];
    }
}

function saveMediaItem(item) {
    mediaFiles.unshift(item);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaFiles));
}

function deleteMediaItem(id) {
    mediaFiles = mediaFiles.filter(item => item.id !== id);
    localStorage.setItem(MEDIA_STORAGE_KEY, JSON.stringify(mediaFiles));
}

// ========================================
// Rendering
// ========================================
function renderMedia(searchQuery = '') {
    const grid = document.getElementById('mediaGrid');
    
    // Filter media
    let filteredMedia = mediaFiles;
    
    if (currentFilter !== 'all') {
        filteredMedia = mediaFiles.filter(item => item.type === currentFilter);
    }

    if (searchQuery) {
        const query = searchQuery.toLowerCase();
        filteredMedia = filteredMedia.filter(item =>
            item.name.toLowerCase().includes(query)
        );
    }

    // Update counts
    updateCounts();

    // Render
    if (filteredMedia.length === 0) {
        grid.innerHTML = `
            <div class="empty-state">
                <i class="fas fa-images"></i>
                <h3>${searchQuery ? '검색 결과가 없습니다' : '업로드된 미디어가 없습니다'}</h3>
                <p>${searchQuery ? '다른 검색어를 입력해보세요' : '위의 업로드 영역을 사용하여 파일을 추가하세요'}</p>
            </div>
        `;
        return;
    }

    grid.innerHTML = filteredMedia.map(item => createMediaCard(item)).join('');
}

function createMediaCard(item) {
    const thumbnail = item.type === 'image'
        ? `<img src="${item.data}" alt="${item.name}">`
        : `<i class="fas ${getFileIcon(item.name)} file-icon"></i>`;

    return `
        <div class="media-item" onclick="openMediaModal('${item.id}')">
            <div class="media-thumbnail">
                ${thumbnail}
            </div>
            <div class="media-info">
                <div class="media-name" title="${item.name}">${item.name}</div>
                <div class="media-meta">
                    <span>${formatFileSize(item.size)}</span>
                    <span>${formatDate(item.uploadDate)}</span>
                </div>
            </div>
        </div>
    `;
}

function updateCounts() {
    const imageCount = mediaFiles.filter(item => item.type === 'image').length;
    const documentCount = mediaFiles.filter(item => item.type === 'document').length;

    document.getElementById('countAll').textContent = mediaFiles.length;
    document.getElementById('countImages').textContent = imageCount;
    document.getElementById('countDocuments').textContent = documentCount;
}

function toggleView() {
    const grid = document.getElementById('mediaGrid');
    if (currentView === 'list') {
        grid.classList.add('list-view');
    } else {
        grid.classList.remove('list-view');
    }
}

// ========================================
// Media Modal
// ========================================
function openMediaModal(id) {
    currentMedia = mediaFiles.find(item => item.id === id);
    if (!currentMedia) return;

    const modal = document.getElementById('mediaModal');
    const modalImage = document.getElementById('modalImage');
    const modalDocument = document.getElementById('modalDocument');

    // Show appropriate preview
    if (currentMedia.type === 'image') {
        modalImage.src = currentMedia.data;
        modalImage.style.display = 'block';
        modalDocument.style.display = 'none';
    } else {
        document.getElementById('modalDocName').textContent = currentMedia.name;
        modalImage.style.display = 'none';
        modalDocument.style.display = 'block';
    }

    // Fill details
    document.getElementById('modalTitle').textContent = '파일 정보';
    document.getElementById('modalFileName').value = currentMedia.name;
    document.getElementById('modalFileUrl').value = currentMedia.data;
    document.getElementById('modalFileSize').textContent = formatFileSize(currentMedia.size);
    document.getElementById('modalFileType').textContent = currentMedia.mimeType;
    document.getElementById('modalUploadDate').textContent = formatDateTime(currentMedia.uploadDate);
    
    if (currentMedia.dimensions) {
        document.getElementById('modalDimensions').textContent = 
            `${currentMedia.dimensions.width} × ${currentMedia.dimensions.height}px`;
    } else {
        document.getElementById('modalDimensions').textContent = '-';
    }

    modal.style.display = 'block';
}

function closeMediaModal() {
    document.getElementById('mediaModal').style.display = 'none';
    currentMedia = null;
}

function copyFileName() {
    const input = document.getElementById('modalFileName');
    input.select();
    document.execCommand('copy');
    alert('파일명이 복사되었습니다.');
}

function copyFileUrl() {
    const input = document.getElementById('modalFileUrl');
    input.select();
    document.execCommand('copy');
    alert('URL이 복사되었습니다.');
}

function downloadFile() {
    if (!currentMedia) return;

    const link = document.createElement('a');
    link.href = currentMedia.data;
    link.download = currentMedia.name;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
}

function deleteFile() {
    if (!currentMedia) return;

    if (confirm(`"${currentMedia.name}" 파일을 삭제하시겠습니까?`)) {
        deleteMediaItem(currentMedia.id);
        closeMediaModal();
        renderMedia();
        updateCounts();
    }
}

// ========================================
// Utility Functions
// ========================================
function generateId() {
    return 'media_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

function getFileExtension(filename) {
    return filename.split('.').pop().toLowerCase();
}

function getFileType(filename) {
    const ext = getFileExtension(filename);
    
    if (FILE_TYPES.image.extensions.includes(ext)) return 'image';
    if (FILE_TYPES.document.extensions.includes(ext)) return 'document';
    return null;
}

function getFileIcon(filename) {
    const ext = getFileExtension(filename);
    const iconMap = {
        pdf: 'fa-file-pdf',
        doc: 'fa-file-word',
        docx: 'fa-file-word',
        txt: 'fa-file-alt',
        zip: 'fa-file-archive'
    };
    return iconMap[ext] || 'fa-file';
}

function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

function formatDate(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    return `${year}.${month}.${day}`;
}

function formatDateTime(dateString) {
    const date = new Date(dateString);
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    return `${year}.${month}.${day} ${hours}:${minutes}`;
}

function showLoading() {
    const overlay = document.createElement('div');
    overlay.className = 'loading-overlay';
    overlay.id = 'loadingOverlay';
    overlay.innerHTML = `
        <div class="loading-spinner">
            <i class="fas fa-spinner"></i>
            <p style="margin-top: 12px;">파일 업로드 중...</p>
        </div>
    `;
    document.body.appendChild(overlay);
}

function hideLoading() {
    const overlay = document.getElementById('loadingOverlay');
    if (overlay) {
        overlay.remove();
    }
}

// ========================================
// Export API
// ========================================
window.MediaLibrary = {
    getAll: () => mediaFiles,
    getById: (id) => mediaFiles.find(item => item.id === id),
    getByType: (type) => mediaFiles.filter(item => item.type === type),
    getImages: () => mediaFiles.filter(item => item.type === 'image'),
    getDocuments: () => mediaFiles.filter(item => item.type === 'document')
};
