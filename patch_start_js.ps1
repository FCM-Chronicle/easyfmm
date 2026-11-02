# patch_start_js.ps1
$utf8 = [System.Text.Encoding]::UTF8

$startCode = @"
// start.js - 팀 선택 화면 UI 로직 및 데이터 표시

const AVAILABLE_LEAGUES = [
    { id: "premier_league", name: "🇬🇧 잉글랜드 프리미어리그" },
    { id: "laliga", name: "🇪🇸 스페인 라리가" },
    { id: "bundesliga", name: "🇩🇪 독일 분데스리가" },
    { id: "serie_a", name: "🇮🇹 이탈리아 세리에 A" },
    { id: "ligue_1", name: "🇫🇷 프랑스 리그 1" },
    { id: "eredivisie", name: "🇳🇱 네덜란드 에레디비시" },
    { id: "liga_portugal", name: "🇵🇹 포르투갈 프리메이라리가" },
    { id: "super_lig", name: "🇹🇷 튀르키예 쉬페르리그" },
    { id: "kleague_1", name: "🇰🇷 대한민국 K리그 1" },
    { id: "other", name: "🌍 기타 및 연합 클럽" }
];

if (typeof selectionState === 'undefined') {
    window.selectionState = {
        leagueIndex: 0,
        teamIndex: 0
    };
}

function getTeamsInCurrentSelection() {
    if (typeof allTeams === 'undefined') return [];
    const curIdx = selectionState.leagueIndex || 0;
    const curLeague = AVAILABLE_LEAGUES[curIdx] || AVAILABLE_LEAGUES[0];

    if (curLeague.id === 'other') {
        const knownLeagueIds = AVAILABLE_LEAGUES.map(l => l.id);
        return Object.keys(allTeams).filter(k => allTeams[k] && (!allTeams[k].leagueId || !knownLeagueIds.includes(allTeams[k].leagueId)));
    }
    return Object.keys(allTeams).filter(k => allTeams[k] && allTeams[k].leagueId === curLeague.id);
}

// 팀 선택 UI 렌더링 함수
function renderTeamSelectionUI() {
    if (typeof allTeams === 'undefined' || typeof teamNames === 'undefined') return;

    if (selectionState.leagueIndex === undefined) selectionState.leagueIndex = 0;
    const curLeague = AVAILABLE_LEAGUES[selectionState.leagueIndex] || AVAILABLE_LEAGUES[0];
    const teamsInLeague = getTeamsInCurrentSelection();

    if (!teamsInLeague.length) {
        console.warn("[start.js] 선택된 리그에 팀이 없습니다:", curLeague.id);
        return;
    }

    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;

    const currentTeamKey = teamsInLeague[selectionState.teamIndex];
    const teamData = allTeams[currentTeamKey];
    const teamName = teamNames[currentTeamKey] || currentTeamKey;

    // 0. 리그 표시 업데이트
    const leagueNameEl = document.getElementById('ts-league-name');
    if (leagueNameEl) leagueNameEl.textContent = curLeague.name;

    // 1. 좌측: Identity Section (로고, 이름, 별점)
    const logoContainer = document.getElementById('ts-team-logo-container');
    if (logoContainer) {
        logoContainer.replaceChildren();
        const logoImg = document.createElement('img');
        logoImg.className = 'ts-team-logo';
        const logoCode = teamData?.logoCode || "DFT";
        const logoLeague = teamData?.league || 1;
        logoImg.src = ``assets/logo/`${logoLeague}/`${logoCode}.webp``;
        logoImg.alt = teamName;
        logoImg.onerror = function() {
            this.onerror = null;
            const fallback = document.createElement('div');
            fallback.className = 'ts-team-logo-fallback';
            fallback.style.cssText = 'width: 180px; height: 180px; display: inline-flex; align-items: center; justify-content: center; background: linear-gradient(135deg, #ffd700, #f39c12); color: #000; border-radius: 50%; font-weight: 900; font-size: 3rem; border: 3px solid #ffd700;';
            fallback.textContent = (teamName || 'FC').substring(0, 2).toUpperCase();
            this.replaceWith(fallback);
        };
        logoContainer.appendChild(logoImg);
    }

    const teamNameEl = document.getElementById('ts-team-name');
    if (teamNameEl) teamNameEl.textContent = teamName;

    // 별점 계산 (평균 오버롤 기반)
    const avgRating = calculateStaticTeamRating(currentTeamKey);
    let starCount = 3;
    if (avgRating >= 85) starCount = 5;
    else if (avgRating >= 80) starCount = 4;
    else if (avgRating >= 75) starCount = 3;
    else if (avgRating >= 70) starCount = 2;
    else starCount = 1;

    const starsEl = document.getElementById('ts-team-stars');
    if (starsEl) {
        starsEl.replaceChildren();
        for (let i = 0; i < 5; i++) {
            const starSpan = document.createElement('span');
            starSpan.style.cssText = ``display: inline-flex; color: `${i < starCount ? '#FBBF24' : 'rgba(255,255,255,0.2)'}; margin: 0 2px;``;
            starSpan.innerHTML = typeof iconSVG === 'function' ? iconSVG('star') : '*';
            starsEl.appendChild(starSpan);
        }
    }

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
    if (descEl) descEl.textContent = teamData.description || (teamData.country + " " + (teamData.city || "") + " 연고 구단");

    const cityEl = document.getElementById('ts-team-city');
    if (cityEl) {
        const city = teamData.city || (typeof teamCities !== 'undefined' && teamCities[currentTeamKey]) || teamData.country || "알 수 없음";
        cityEl.textContent = city;
    }

    // 시작 자금 설정 (FC 27 데이터에 정의된 팀별 실제 이적 예산 표시)
    const budgetVal = (teamData.budget !== undefined) ? teamData.budget : 100;
    const budgetEl = document.getElementById('ts-team-budget');
    if (budgetEl) budgetEl.textContent = budgetVal + "억원";

    // 3. 우측: Key Assets Section (핵심 선수)
    const players = teamData.players || [];
    const sortedPlayers = [...players].sort((a, b) => b.rating - a.rating);

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

    const card = document.createElement('div');
    card.className = 'ts-key-player-card';

    const img = document.createElement('img');
    img.src = ``assets/players/`${player.name}.webp``;
    img.className = 'ts-kp-img';
    img.onerror = () => { img.src = 'assets/players/default.webp'; };

    const info = document.createElement('div');
    info.className = 'ts-kp-info';

    const nameDiv = document.createElement('div');
    nameDiv.className = 'ts-kp-name';
    nameDiv.textContent = player.name;

    const metaDiv = document.createElement('div');
    metaDiv.className = 'ts-kp-meta';
    metaDiv.textContent = ``${player.position} | ${player.age}세 | OVR ${player.rating}``;

    info.append(nameDiv, metaDiv);
    card.append(img, info);
    el.appendChild(card);
}

// 팀 전력(평균 OVR) 계산
function calculateStaticTeamRating(teamKey) {
    if (!allTeams || !allTeams[teamKey] || !allTeams[teamKey].players) return 70;
    const players = allTeams[teamKey].players;
    if (players.length === 0) return 70;

    const top11 = [...players].sort((a, b) => b.rating - a.rating).slice(0, 11);
    const sum = top11.reduce((acc, p) => acc + p.rating, 0);
    return Math.round(sum / top11.length);
}

// 리그 변경 함수 (화살표용)
function changeLeague(direction) {
    if (typeof selectionState === 'undefined') return;
    if (selectionState.leagueIndex === undefined) selectionState.leagueIndex = 0;

    let newIdx = selectionState.leagueIndex + direction;
    if (newIdx >= AVAILABLE_LEAGUES.length) newIdx = 0;
    if (newIdx < 0) newIdx = AVAILABLE_LEAGUES.length - 1;

    selectionState.leagueIndex = newIdx;
    selectionState.teamIndex = 0; // 리그 변경 시 첫 팀으로 리셋
    renderTeamSelectionUI();
}

// 팀 네비게이션 함수
function changeSelectionTeam(direction) {
    if (typeof selectionState === 'undefined' || typeof allTeams === 'undefined') return;

    const teamsInLeague = getTeamsInCurrentSelection();
    if (!teamsInLeague.length) return;

    selectionState.teamIndex += direction;

    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;

    renderTeamSelectionUI();
}

window.AVAILABLE_LEAGUES = AVAILABLE_LEAGUES;
window.renderTeamSelectionUI = renderTeamSelectionUI;
window.changeLeague = changeLeague;
window.changeSelectionTeam = changeSelectionTeam;
window.getTeamsInCurrentSelection = getTeamsInCurrentSelection;

"@

# Read existing start.js and replace lines 1 to 190
$startPath = "easyfmm\start.js"
$content = [System.IO.File]::ReadAllText($startPath, $utf8)

$cinematicMarker = "// ============================================================================="
$markerIdx = $content.IndexOf($cinematicMarker)

if ($markerIdx -gt 0) {
    $cinematicPart = $content.Substring($markerIdx)
    $newContent = $startCode + "`r`n" + $cinematicPart
    [System.IO.File]::WriteAllText($startPath, $newContent, $utf8)
    Write-Host "start.js patched with 9-league carousel successfully."
} else {
    Write-Error "Could not find cinematicMarker in start.js"
}

