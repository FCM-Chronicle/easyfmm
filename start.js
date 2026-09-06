// start.js - 팀 선택 화면 UI 로직 및 데이터 표시

// 전역 변수 selectionState가 script.js에 정의되어 있다고 가정 (없으면 초기화)
if (typeof selectionState === 'undefined') {
    window.selectionState = {
        league: 1,
        teamIndex: 0
    };
}

// 팀 선택 UI 렌더링 함수
function renderTeamSelectionUI() {
    // 데이터 로드 확인
    if (typeof allTeams === 'undefined' || typeof teamNames === 'undefined') return;

    const league = selectionState.league;
    const teamsInLeague = Object.keys(allTeams).filter(key => allTeams[key].league === league);
    
    // 인덱스 안전 장치
    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;

    const currentTeamKey = teamsInLeague[selectionState.teamIndex];
    const teamData = allTeams[currentTeamKey];
    const teamName = teamNames[currentTeamKey] || currentTeamKey;

    // 0. 리그 표시 업데이트
    const leagueNames = { 1: "🏆 1부 리그", 2: "⚽ 2부 리그", 3: "🌟 3부 리그" };
    const leagueNameEl = document.getElementById('ts-league-name');
    if (leagueNameEl) leagueNameEl.textContent = leagueNames[league];

    // 1. 좌측: Identity Section (로고, 이름, 별점)
    const logoContainer = document.getElementById('ts-team-logo-container');
    if (logoContainer) {
        logoContainer.replaceChildren();
        const logoImg = document.createElement('img');
        logoImg.className = 'ts-team-logo';
        logoImg.src = `assets/logos/${currentTeamKey}.webp`;
        logoImg.onerror = () => { logoImg.src = 'assets/logos/default.webp'; };
        logoContainer.appendChild(logoImg);
    }

    const teamNameEl = document.getElementById('ts-team-name');
    if (teamNameEl) teamNameEl.textContent = teamName;
    
    // 별점 계산 (평균 오버롤 기반)
    const avgRating = calculateStaticTeamRating(currentTeamKey);
    let stars = '★★★☆☆';
    if (avgRating >= 85) stars = '★★★★★';
    else if (avgRating >= 80) stars = '★★★★☆';
    else if (avgRating >= 75) stars = '★★★☆☆';
    else if (avgRating >= 70) stars = '★★☆☆☆';
    else stars = '★☆☆☆☆';
    
    const starsEl = document.getElementById('ts-team-stars');
    if (starsEl) starsEl.textContent = stars;

    // 선택 버튼 이벤트 연결
    const selectBtn = document.getElementById('ts-select-btn');
    if (selectBtn) {
        selectBtn.onclick = () => {
            if (typeof selectTeam === 'function') {
                selectTeam(currentTeamKey);
            }
        };
    }

    // 2. 중앙: The Story Section (설명, 연고지, 자금)
    const descEl = document.getElementById('ts-team-desc');
    if (descEl) descEl.textContent = teamData.description || "전통의 강호이자 새로운 도전자";
    
    const cityEl = document.getElementById('ts-team-city');
    if (cityEl) {
        // teamCities는 script.js에 정의되어 있음
        const city = (typeof teamCities !== 'undefined' && teamCities[currentTeamKey]) ? teamCities[currentTeamKey] : "알 수 없음";
        cityEl.textContent = city;
    }

    // 시작 자금 설정 (데이터에 정의된 팀별 실제 예산 표시)
    const budget = (teamData.budget !== undefined ? teamData.budget : (league === 3 ? 10 : 1000)) + "억";
    const budgetEl = document.getElementById('ts-team-budget');
    if (budgetEl) budgetEl.textContent = budget;

    // 3. 우측: Key Assets Section (핵심 선수)
    const players = teamData.players;
    // 오버롤 순 정렬
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);
    
    // Key Player 1 & 2 업데이트
    // Key Player 1, 2, 3 업데이트
    updateKeyPlayerCard('ts-key-player-1', sortedPlayers[0]);
    updateKeyPlayerCard('ts-key-player-2', sortedPlayers[1]);
    updateKeyPlayerCard('ts-key-player-3', sortedPlayers[2]);
}

// 키 플레이어 카드 업데이트 헬퍼 함수
function updateKeyPlayerCard(elementId, player) {
    const el = document.getElementById(elementId);
    if (!el) return;
    
    el.replaceChildren();
    if (!player) return;
    
    const img = document.createElement('img');
    img.src = `assets/players/${player.name}.webp`;
    img.className = 'ts-kp-img';
    img.onerror = () => { img.src = 'assets/players/default.webp'; };

    const info = document.createElement('div');
    info.className = 'ts-kp-info';

    const nameDiv = document.createElement('div');
    nameDiv.textContent = player.name;

    const metaDiv = document.createElement('div');
    metaDiv.textContent = `${player.position} | ${player.age}세`;

    info.append(nameDiv, metaDiv);

    const ovrDiv = document.createElement('div');
    ovrDiv.className = 'ts-kp-ovr';
    ovrDiv.textContent = Math.floor(player.rating);

    el.append(img, info, ovrDiv);
}

// 정적 팀 평점 계산 (allTeams 데이터 기반)
function calculateStaticTeamRating(teamKey) {
    if (typeof allTeams === 'undefined') return 0;
    const players = allTeams[teamKey].players;
    if (!players || players.length === 0) return 0;
    
    // 상위 11명 기준 평균
    const top11 = [...players].sort((a, b) => b.rating - a.rating).slice(0, 11);
    const sum = top11.reduce((acc, p) => acc + p.rating, 0);
    return sum / top11.length;
}

// 리그 변경 함수 (화살표용)
function changeLeague(direction) {
    if (typeof selectionState === 'undefined') return;
    
    let newLeague = selectionState.league + direction;
    if (newLeague > 3) newLeague = 1;
    if (newLeague < 1) newLeague = 3;
    
    selectionState.league = newLeague;
    selectionState.teamIndex = 0; // 리그 변경 시 첫 팀으로 리셋
    renderTeamSelectionUI();
}

// 팀 네비게이션 함수
function changeSelectionTeam(direction) {
    if (typeof selectionState === 'undefined' || typeof allTeams === 'undefined') return;

    const league = selectionState.league;
    const teamsInLeague = Object.keys(allTeams).filter(key => allTeams[key].league === league);
    
    selectionState.teamIndex += direction;
    
    // 순환 로직
    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;
    
    renderTeamSelectionUI();
}

// 전역 함수로 노출 (HTML onclick 속성에서 접근 가능하도록)
window.renderTeamSelectionUI = renderTeamSelectionUI;
window.changeLeague = changeLeague;
window.changeSelectionTeam = changeSelectionTeam;

// =============================================================================
// 오프닝 시네마틱 시스템 (Pure DOM 기반 - 0 innerHTML)
// =============================================================================

let activeCinematicInstance = null;

function playCinematicIntro(options = {}) {
    if (activeCinematicInstance) {
        console.warn("이미 시네마틱이 재생 중입니다.");
        return;
    }

    const teamKey = options.teamKey || (typeof gameData !== 'undefined' ? gameData.selectedTeam : null);
    const onComplete = typeof options.onComplete === 'function' ? options.onComplete : null;

    // 기존 BGM 일시정지
    if (typeof audioManager !== 'undefined' && audioManager.bgm) {
        try { audioManager.pause(); } catch (e) { }
    }

    // 1. 오디오 소스 설정 (기본 경로 및 폴백 경로)
    const audioBasePath = 'assets/cinematic/';
    const audioFallbackPath = 'assets/assets/cinematic/';

    function createAudioWithFallback(filename, defaultVolume = 1.0) {
        const audio = new Audio(audioBasePath + filename);
        audio.volume = defaultVolume;
        audio.onerror = () => {
            console.warn(`[Cinematic] 기본 경로 실패, 폴백 시도: ${audioFallbackPath + filename}`);
            audio.src = audioFallbackPath + filename;
            audio.load();
        };
        return audio;
    }

    // 볼륨 설정 (audioManager 설정 반영)
    let masterBgmVol = 0.55;
    let masterSfxVol = 0.40;
    let masterVoiceVol = 0.95;

    if (typeof audioManager !== 'undefined') {
        if (audioManager.isMuted) {
            masterBgmVol = 0;
            masterSfxVol = 0;
            masterVoiceVol = 0;
        } else {
            masterBgmVol = ((audioManager.volume || 50) / 100) * 0.55;
            masterSfxVol = ((audioManager.sfxVolume || 50) / 100) * 0.40;
            masterVoiceVol = Math.min(1.0, ((audioManager.volume || 50) / 100) * 1.2);
        }
    }

    const crowdAudio = createAudioWithFallback('Start_crowd.mp3', masterSfxVol);
    const songAudio = createAudioWithFallback('Start_song.mp3', masterBgmVol);
    const narrationAudio = createAudioWithFallback('Start_narration.mp3', masterVoiceVol);

    // 2. 전체 오버레이 DOM 생성
    const overlay = document.createElement('div');
    overlay.id = 'cinematicOverlay';
    overlay.className = 'cinematic-overlay';

    // 앰비언트 글로우
    const ambientGlow = document.createElement('div');
    ambientGlow.className = 'cinematic-ambient-glow';
    overlay.appendChild(ambientGlow);

    // 상/하단 영화 레터박스
    const topBar = document.createElement('div');
    topBar.className = 'cinematic-letterbox top';
    const bottomBar = document.createElement('div');
    bottomBar.className = 'cinematic-letterbox bottom';
    overlay.append(topBar, bottomBar);

    // 3. 텍스트 스크롤 스테이지
    const stage = document.createElement('div');
    stage.className = 'cinematic-stage';

    const scrollContent = document.createElement('div');
    scrollContent.className = 'cinematic-scroll-content';

    // 헤더 인트로 섹션
    const headerSec = document.createElement('div');
    headerSec.className = 'cinematic-section header-sec';

    const kicker = document.createElement('div');
    kicker.className = 'cinematic-kicker';
    kicker.textContent = '👑 SUPER LEAGUE : THE NEW ERA 👑';

    const subKicker = document.createElement('div');
    subKicker.className = 'cinematic-subkicker';
    subKicker.textContent = 'THE MAESTRO\'S ODYSSEY';

    headerSec.append(kicker, subKicker);

    // 선택한 팀 정보 표기
    if (teamKey && typeof teamNames !== 'undefined') {
        const teamBadgeWrap = document.createElement('div');
        teamBadgeWrap.className = 'cinematic-team-badge-wrap';

        if (typeof createTeamLogoElement === 'function') {
            const logoEl = createTeamLogoElement(teamKey);
            logoEl.className = 'cinematic-team-logo';
            teamBadgeWrap.appendChild(logoEl);
        }

        const teamNameTitle = document.createElement('div');
        teamNameTitle.className = 'cinematic-team-title';
        teamNameTitle.textContent = `${teamNames[teamKey] || teamKey} 사령탑 부임`;

        teamBadgeWrap.appendChild(teamNameTitle);
        headerSec.appendChild(teamBadgeWrap);
    }

    const goldLine1 = document.createElement('div');
    goldLine1.className = 'cinematic-divider';
    headerSec.appendChild(goldLine1);

    scrollContent.appendChild(headerSec);

    // 4. 나레이션 문단들
    const NARRATION_BLOCKS = [
        {
            type: 'quote',
            lines: [
                { text: '변방의 그라운드에서 증명한 당신의 기적.', highlight: 'white-glow', size: 'large' }
            ]
        },
        {
            type: 'monologue',
            lines: [
                { text: '마침내 전 세계 축구 팬들의 심장이 고동치는 궁극의 전장,', highlight: 'muted' },
                { text: "'슈퍼리그'의 거대한 문이 열렸습니다.", highlight: 'gold-glow', size: 'xlarge' }
            ]
        },
        {
            type: 'warning',
            lines: [
                { text: '하지만 기쁨은 여기까지입니다.', highlight: 'amber', size: 'medium' }
            ]
        },
        {
            type: 'dramatic',
            lines: [
                { text: '이곳은 낭만의 무대가 아닙니다.', highlight: 'red' },
                { text: '축구에 인생을 건 훌리건들,', highlight: 'light' },
                { text: '당신의 몰락을 뜯어먹으려는 하이에나 같은 언론,', highlight: 'light' },
                { text: '그리고 당신의 전술을 산산조각 내기 위해 칼을 가는', highlight: 'light' },
                { text: '세계 최고의 명장들이 득실거리는 야수들의 소굴입니다.', highlight: 'red-glow', size: 'large' }
            ]
        },
        {
            type: 'question',
            lines: [
                { text: '질문은 하나입니다.', highlight: 'gold', size: 'medium' }
            ]
        },
        {
            type: 'dichotomy',
            lines: [
                { text: "당신은 '한번 반짝한 감독'으로 남을 것인가,", highlight: 'muted' },
                { text: '아니면 낡은 패러다임을 부수고 시대의', highlight: 'light' },
                { text: "✦ '마에스트로' ✦", highlight: 'blue-glow', size: 'huge' },
                { text: '로 군림할 것인가 선택하게 됩니다.', highlight: 'light' }
            ]
        },
        {
            type: 'challenge',
            lines: [
                { text: '이제 오직 당신의 실력만으로 증명하십시오.', highlight: 'white-bold', size: 'large' },
                { text: '당신의 그 전술 철학이 이 잔혹하고도 찬란한 최상위 무대마저', highlight: 'light' },
                { text: '완벽히 지배할 수 있다는 것을 똑똑히 보여주십시오.', highlight: 'green-glow', size: 'large' }
            ]
        },
        {
            type: 'climax',
            lines: [
                { text: '팔만 개의 목소리, 단 하나의 이름.', highlight: 'gold-huge', size: 'huge' },
                { text: '이제 지휘봉을 잡고 당신만의 제국을 건설하십시오.', highlight: 'epic-white', size: 'epic' }
            ]
        }
    ];

    NARRATION_BLOCKS.forEach((block, index) => {
        const blockEl = document.createElement('div');
        blockEl.className = `cinematic-block block-${block.type}`;
        blockEl.setAttribute('data-block-index', index);

        block.lines.forEach(item => {
            const p = document.createElement('p');
            p.className = `cinematic-line ${item.highlight || ''} ${item.size || ''}`;
            p.textContent = item.text;
            blockEl.appendChild(p);
        });

        scrollContent.appendChild(blockEl);
    });

    // 엔딩 푸터
    const footerSec = document.createElement('div');
    footerSec.className = 'cinematic-section footer-sec';

    const goldLine2 = document.createElement('div');
    goldLine2.className = 'cinematic-divider';

    const footerLogo = document.createElement('div');
    footerLogo.className = 'cinematic-footer-logo';
    footerLogo.textContent = '⚽ EASY FOOTBALL MANAGER ⚽';

    const footerSub = document.createElement('div');
    footerSub.className = 'cinematic-footer-sub';
    footerSub.textContent = '위대한 서사시의 첫 휘슬이 곧 울립니다';

    footerSec.append(goldLine2, footerLogo, footerSub);
    scrollContent.appendChild(footerSec);

    stage.appendChild(scrollContent);
    overlay.appendChild(stage);

    // 5. 우측 하단 스킵 버튼
    const skipBtn = document.createElement('button');
    skipBtn.id = 'cinematicSkipBtn';
    skipBtn.className = 'cinematic-skip-btn';

    const skipText = document.createElement('span');
    skipText.textContent = '건너뛰기 SKIP';
    const skipArrow = document.createElement('span');
    skipArrow.className = 'cinematic-skip-icon';
    skipArrow.textContent = '❯❯';

    skipBtn.append(skipText, skipArrow);
    overlay.appendChild(skipBtn);

    // DOM에 마운트
    document.body.appendChild(overlay);

    // 페이드 인 효과
    requestAnimationFrame(() => {
        overlay.classList.add('active');
    });

    // 6. 스크롤 동기화 및 오디오 재생 제어
    let isEnded = false;
    let animationFrameId = null;
    let estimatedDuration = 76; // 기본 추정 길이 76초
    let startTime = performance.now();

    // 오디오 재생
    crowdAudio.play().catch(e => console.log('Crowd audio autoplay prevented', e));
    songAudio.play().catch(e => console.log('Song audio autoplay prevented', e));
    narrationAudio.play().catch(e => console.log('Narration audio autoplay prevented', e));

    narrationAudio.onloadedmetadata = () => {
        if (narrationAudio.duration && isFinite(narrationAudio.duration)) {
            estimatedDuration = narrationAudio.duration;
        }
    };

    // 크레딧 스크롤 루프
    function updateScroll() {
        if (isEnded) return;

        const now = performance.now();
        let currentTime = 0;

        if (narrationAudio && !narrationAudio.paused && narrationAudio.currentTime > 0) {
            currentTime = narrationAudio.currentTime;
        } else {
            currentTime = (now - startTime) / 1000;
        }

        const duration = (narrationAudio && narrationAudio.duration && isFinite(narrationAudio.duration))
            ? narrationAudio.duration
            : estimatedDuration;

        // 0 ~ 1 비율 계산
        let progress = Math.min(1.0, Math.max(0, currentTime / (duration + 2.5)));

        // 스크롤 높이 계산
        const stageHeight = window.innerHeight;
        const contentHeight = scrollContent.offsetHeight || 2200;

        const startY = stageHeight * 0.72;
        const endY = -(contentHeight - stageHeight * 0.65);
        const currentY = startY - (startY - endY) * progress;

        scrollContent.style.transform = `translate3d(0, ${currentY}px, 0)`;

        // 문단별 뷰포트 중심 강조 효과 (하이라이트)
        const centerY = stageHeight / 2;
        const blocks = scrollContent.querySelectorAll('.cinematic-block');
        blocks.forEach(b => {
            const rect = b.getBoundingClientRect();
            const bCenter = rect.top + rect.height / 2;
            const dist = Math.abs(centerY - bCenter);
            if (dist < 180) {
                b.classList.add('focused');
            } else {
                b.classList.remove('focused');
            }
        });

        if (progress >= 1.0) {
            setTimeout(() => {
                finishCinematic();
            }, 1800);
            return;
        }

        animationFrameId = requestAnimationFrame(updateScroll);
    }

    // 나레이션 오디오 끝났을 때 안전 종료 처리
    narrationAudio.onended = () => {
        setTimeout(() => {
            if (!isEnded) finishCinematic();
        }, 2500);
    };

    // 스크롤 애니메이션 개시
    animationFrameId = requestAnimationFrame(updateScroll);

    // 7. 종료 / 스킵 함수
    function finishCinematic() {
        if (isEnded) return;
        isEnded = true;

        if (animationFrameId) cancelAnimationFrame(animationFrameId);

        // 오디오 부드러운 페이드아웃 (0.7초)
        const fadeInterval = 50;
        const fadeSteps = 14;
        let currentStep = 0;

        const initialCrowdVol = crowdAudio.volume;
        const initialSongVol = songAudio.volume;
        const initialNarrationVol = narrationAudio.volume;

        const fadeTimer = setInterval(() => {
            currentStep++;
            const factor = Math.max(0, 1 - currentStep / fadeSteps);
            crowdAudio.volume = initialCrowdVol * factor;
            songAudio.volume = initialSongVol * factor;
            narrationAudio.volume = initialNarrationVol * factor;

            if (currentStep >= fadeSteps) {
                clearInterval(fadeTimer);
                crowdAudio.pause();
                songAudio.pause();
                narrationAudio.pause();
            }
        }, fadeInterval);

        // 화면 페이드아웃
        overlay.classList.remove('active');
        overlay.classList.add('fade-out');

        setTimeout(() => {
            if (overlay.parentNode) {
                overlay.parentNode.removeChild(overlay);
            }
            activeCinematicInstance = null;

            // 콜백 실행 (로비 진입 등)
            if (onComplete) {
                onComplete();
            }
        }, 850);
    }

    // 스킵 버튼 클릭 핸들러
    skipBtn.onclick = (e) => {
        e.stopPropagation();
        finishCinematic();
    };

    // 키보드(Space, Escape) 스킵 지원
    const keyHandler = (e) => {
        if (e.key === 'Escape' || e.code === 'Space') {
            e.preventDefault();
            window.removeEventListener('keydown', keyHandler);
            finishCinematic();
        }
    };
    window.addEventListener('keydown', keyHandler);

    activeCinematicInstance = {
        finish: finishCinematic
    };
}

window.playCinematicIntro = playCinematicIntro;

