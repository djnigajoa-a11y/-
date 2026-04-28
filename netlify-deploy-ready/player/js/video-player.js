// 강의 영상 플레이어 JavaScript
const video = document.getElementById('videoPlayer');
const playPauseBtn = document.getElementById('playPauseBtn');
const progressBar = document.getElementById('progressBar');
const progressFill = document.getElementById('progressFill');
const speedBtn = document.getElementById('speedBtn');
const fullscreenBtn = document.getElementById('fullscreenBtn');
let currentSpeed = 1.0;

// 재생/일시정지
playPauseBtn?.addEventListener('click', () => {
    if (video.paused) {
        video.play();
        playPauseBtn.innerHTML = '<i class="fas fa-pause"></i>';
    } else {
        video.pause();
        playPauseBtn.innerHTML = '<i class="fas fa-play"></i>';
    }
});

// 진도율 업데이트
video?.addEventListener('timeupdate', () => {
    const percent = (video.currentTime / video.duration) * 100;
    progressFill.style.width = percent + '%';
    document.getElementById('currentTime').textContent = formatTime(video.currentTime);
    document.getElementById('currentLessonProgress').style.width = percent + '%';
    document.getElementById('currentPercentText').textContent = Math.floor(percent) + '%';
    
    // 이어보기 저장
    localStorage.setItem('lastPosition_lesson1', video.currentTime);
    
    // 80% 이상 시청 시 완료 처리
    if (percent >= 80) {
        markLessonComplete();
    }
});

video?.addEventListener('loadedmetadata', () => {
    document.getElementById('duration').textContent = formatTime(video.duration);
    
    // 이어보기 복원
    const lastPosition = localStorage.getItem('lastPosition_lesson1');
    if (lastPosition && lastPosition > 0) {
        video.currentTime = lastPosition;
    }
});

// 재생 속도
speedBtn?.addEventListener('click', () => {
    const speeds = [1.0, 1.25, 1.5, 1.75, 2.0];
    const currentIndex = speeds.indexOf(currentSpeed);
    currentSpeed = speeds[(currentIndex + 1) % speeds.length];
    video.playbackRate = currentSpeed;
    speedBtn.textContent = currentSpeed + 'x';
});

// 전체화면
fullscreenBtn?.addEventListener('click', () => {
    if (video.requestFullscreen) {
        video.requestFullscreen();
    }
});

// 프로그레스 바 클릭
progressBar?.addEventListener('click', (e) => {
    const rect = progressBar.getBoundingClientRect();
    const percent = (e.clientX - rect.left) / rect.width;
    video.currentTime = percent * video.duration;
});

function formatTime(seconds) {
    const mins = Math.floor(seconds / 60);
    const secs = Math.floor(seconds % 60);
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
}

function markLessonComplete() {
    console.log('강의 완료 처리');
}

// 강의 목록 로드
const lessons = [
    { id: 1, title: '1강. AI 에이전트 소개', duration: '30분', completed: true },
    { id: 2, title: '2강. 프롬프트 기초', duration: '45분', completed: true },
    { id: 3, title: '3강. 실습 1', duration: '60분', completed: false, current: true }
];

const lessonList = document.getElementById('lessonList');
if (lessonList) {
    lessonList.innerHTML = lessons.map(l => `
        <div class="lesson-item ${l.completed ? 'completed' : ''} ${l.current ? 'current' : ''}">
            <div style="display: flex; justify-content: space-between; align-items: center;">
                <span>${l.title}</span>
                <span style="font-size: 12px; color: #64748b;">${l.duration}</span>
            </div>
            ${l.completed ? '<i class="fas fa-check-circle" style="color: #10b981; margin-top: 8px;"></i>' : ''}
        </div>
    `).join('');
}
