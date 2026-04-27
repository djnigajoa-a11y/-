// 블로그 포스트 관리
const BlogManager = {
    storageKey: 'axinova_blog_posts',
    
    // 초기 데이터
    defaultPosts: [],

    // 포스트 로드
    loadPosts() {
        const stored = localStorage.getItem(this.storageKey);
        if (!stored) {
            this.savePosts(this.defaultPosts);
            return this.defaultPosts;
        }
        return JSON.parse(stored);
    },

    // 포스트 저장
    savePosts(posts) {
        localStorage.setItem(this.storageKey, JSON.stringify(posts));
    },

    // 모든 포스트 가져오기
    getAll() {
        return this.loadPosts();
    },

    // ID로 포스트 가져오기
    getById(id) {
        const posts = this.loadPosts();
        return posts.find(p => p.id === id);
    },

    // 포스트 추가
    add(post) {
        const posts = this.loadPosts();
        const newPost = {
            ...post,
            id: post.id || this.generateId(),
            slug: this.generateSlug(post.title),
            views: 0,
            comments: 0,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString()
        };
        posts.unshift(newPost);
        this.savePosts(posts);
        return newPost;
    },

    // 포스트 수정
    update(id, updates) {
        const posts = this.loadPosts();
        const index = posts.findIndex(p => p.id === id);
        if (index === -1) return null;
        
        posts[index] = {
            ...posts[index],
            ...updates,
            id: posts[index].id,
            createdAt: posts[index].createdAt,
            updatedAt: new Date().toISOString()
        };
        this.savePosts(posts);
        return posts[index];
    },

    // 포스트 삭제
    delete(id) {
        const posts = this.loadPosts();
        const filtered = posts.filter(p => p.id !== id);
        this.savePosts(filtered);
        return filtered.length < posts.length;
    },

    // ID 생성
    generateId() {
        return 'post_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
    },

    // Slug 생성
    generateSlug(title) {
        return title
            .toLowerCase()
            .replace(/[^a-z0-9가-힣\s-]/g, '')
            .replace(/\s+/g, '-')
            .substring(0, 50);
    },

    // 통계
    getStats() {
        const posts = this.loadPosts();
        return {
            total: posts.length,
            published: posts.filter(p => p.status === 'published').length,
            draft: posts.filter(p => p.status === 'draft').length,
            totalViews: posts.reduce((sum, p) => sum + (p.views || 0), 0),
            totalComments: posts.reduce((sum, p) => sum + (p.comments || 0), 0)
        };
    }
};

// Quill 에디터 인스턴스
let quill;

// 페이지 로드 시
document.addEventListener('DOMContentLoaded', () => {
    loadPosts();
    updateStats();
});

// 포스트 목록 로드
function loadPosts() {
    const posts = BlogManager.getAll();
    const container = document.getElementById('postList');
    
    if (posts.length === 0) {
        container.innerHTML = '<p style="text-align: center; color: #999; padding: 40px;">등록된 포스트가 없습니다.</p>';
        return;
    }

    container.innerHTML = posts.map(post => {
        const date = new Date(post.createdAt).toLocaleDateString('ko-KR');
        const statusBadge = post.status === 'published' 
            ? '<span style="background:#e8f5e9;color:#2e7d32;padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600;">게시됨</span>'
            : '<span style="background:#fff3e0;color:#e65100;padding:4px 10px;border-radius:12px;font-size:0.8rem;font-weight:600;">초안</span>';
        
        return `
            <div class="post-item">
                <div class="post-icon">
                    <i class="fas fa-file-alt"></i>
                </div>
                <div class="post-info">
                    <h4>${post.title}</h4>
                    <div class="post-meta">
                        ${date} • ${getCategoryName(post.category)} • ${statusBadge}
                    </div>
                </div>
                <div class="post-actions">
                    <button class="btn-edit" onclick="editPost('${post.id}')">
                        <i class="fas fa-edit"></i> 편집
                    </button>
                    <button class="btn-delete" onclick="deletePost('${post.id}')">
                        <i class="fas fa-trash"></i> 삭제
                    </button>
                </div>
            </div>
        `;
    }).join('');
}

// 카테고리 이름 가져오기
function getCategoryName(category) {
    const categories = {
        'ai-trend': 'AI 트렌드',
        'ai-trends': 'AI 트렌드',
        'education': '교육 소식',
        'technology': '기술 리뷰',
        'case-study': '성공 사례',
        'case-studies': '사례 연구',
        'tutorials': '튜토리얼'
    };
    return categories[category] || category;
}

// 통계 업데이트
function updateStats() {
    const stats = BlogManager.getStats();
    document.getElementById('totalPosts').textContent = stats.total;
    document.getElementById('publishedPosts').textContent = stats.published;
    document.getElementById('totalViews').textContent = stats.totalViews;
    document.getElementById('totalComments').textContent = stats.totalComments;
}

// 모달 열기 (추가)
function openAddModal() {
    document.getElementById('modalTitle').textContent = '새 포스트 작성';
    document.getElementById('blogForm').reset();
    document.getElementById('postId').value = '';
    
    // Quill 에디터 초기화
    if (quill) {
        quill.root.innerHTML = '';
    } else {
        initQuill();
    }
    
    document.getElementById('blogModal').style.display = 'block';
}

// Quill 에디터 초기화
function initQuill() {
    quill = new Quill('#editor-container', {
        theme: 'snow',
        placeholder: '포스트 내용을 작성하세요...',
        modules: {
            toolbar: [
                [{ 'header': [1, 2, 3, 4, 5, 6, false] }],
                ['bold', 'italic', 'underline', 'strike'],
                [{ 'list': 'ordered'}, { 'list': 'bullet' }],
                [{ 'indent': '-1'}, { 'indent': '+1' }],
                [{ 'color': [] }, { 'background': [] }],
                [{ 'align': [] }],
                ['link', 'image', 'code-block'],
                ['clean']
            ]
        }
    });
}

// 모달 열기 (편집)
function editPost(id) {
    const post = BlogManager.getById(id);
    if (!post) return;

    document.getElementById('modalTitle').textContent = '포스트 편집';
    document.getElementById('postId').value = post.id;
    document.getElementById('postTitle').value = post.title;
    document.getElementById('postCategory').value = post.category;
    document.getElementById('postThumbnail').value = post.thumbnail || '';
    document.getElementById('postStatus').value = post.status;

    // Quill 에디터 초기화 및 내용 설정
    if (!quill) {
        initQuill();
    }
    quill.root.innerHTML = post.content;

    document.getElementById('blogModal').style.display = 'block';
}

// 모달 닫기
function closeModal() {
    document.getElementById('blogModal').style.display = 'none';
}

// 포스트 삭제
function deletePost(id) {
    const post = BlogManager.getById(id);
    if (!post) return;

    if (confirm(`"${post.title}" 포스트를 정말 삭제하시겠습니까?`)) {
        BlogManager.delete(id);
        loadPosts();
        updateStats();
        alert('포스트가 삭제되었습니다.');
    }
}

// 폼 제출
document.getElementById('blogForm').addEventListener('submit', (e) => {
    e.preventDefault();

    const id = document.getElementById('postId').value;
    const content = quill.root.innerHTML;

    // 간단한 요약 생성 (처음 150자)
    const textContent = quill.getText().substring(0, 150).trim() + '...';
    
    // 썸네일 URL (없으면 빈 문자열)
    const thumbnail = document.getElementById('postThumbnail').value.trim();

    const postData = {
        title: document.getElementById('postTitle').value,
        category: document.getElementById('postCategory').value,
        thumbnail: thumbnail,
        status: document.getElementById('postStatus').value,
        content: content,
        excerpt: textContent,
        author: 'AXINOVA',
        tags: []
    };

    if (id) {
        // 편집
        BlogManager.update(id, postData);
        alert('포스트가 수정되었습니다.\n웹사이트 블로그 페이지에서 확인할 수 있습니다.');
    } else {
        // 추가
        BlogManager.add(postData);
        alert('포스트가 추가되었습니다.\n웹사이트 블로그 페이지에서 확인할 수 있습니다.');
    }

    closeModal();
    loadPosts();
    updateStats();
});

// 모달 외부 클릭 시 닫기
window.onclick = (event) => {
    const modal = document.getElementById('blogModal');
    if (event.target === modal) {
        closeModal();
    }
};
