$path = "./easyfmm/start.js"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

# 1. Add AVAILABLE_LEAGUES and getTeamsForSelection
$oldHeader = '// 팀 선택 UI 렌더링 함수
function renderTeamSelectionUI() {'

$newHeader = 'const AVAILABLE_LEAGUES = [
    { id: "premier_league", name: "🇬🇧 잉글랜드 프리미어리그 (20팀)" },
    { id: "laliga", name: "🇪🇸 스페인 라리가 (20팀)" },
    { id: "bundesliga", name: "🇩🇪 독일 분데스리가 (18팀)" },
    { id: "serie_a", name: "🇮🇹 이탈리아 세리에 A (20팀)" },
    { id: "ligue_1", name: "🇫🇷 프랑스 리그 1 (18팀)" },
    { id: "eredivisie", name: "🇳🇱 네덜란드 에레디비시 (18팀)" },
    { id: "liga_portugal", name: "🇵🇹 포르투갈 프리메이라리가 (18팀)" },
    { id: "super_lig", name: "🇹🇷 튀르키예 쉬페르리그 (18팀)" },
    { id: "kleague_1", name: "🇰🇷 대한민국 K리그 1 (12팀)" },
    { id: "other", name: "🌐 연합팀 및 기타 클럽 (8팀)" }
];

function getTeamsForSelection() {
    if (typeof selectionState.leagueIndex !== "number") {
        selectionState.leagueIndex = 0;
    }
    const curLeague = AVAILABLE_LEAGUES[selectionState.leagueIndex] || AVAILABLE_LEAGUES[0];
    if (curLeague.id === "other") {
        return Object.keys(allTeams).filter(key => !allTeams[key].leagueId || allTeams[key].leagueId === "other");
    }
    return Object.keys(allTeams).filter(key => allTeams[key].leagueId === curLeague.id);
}

// 팀 선택 UI 렌더링 함수
function renderTeamSelectionUI() {'

$content = $content.Replace($oldHeader, $newHeader)

# 2. Update teamsInLeague and leagueNameEl in renderTeamSelectionUI
$oldFilter = '    const league = selectionState.league;
    const teamsInLeague = Object.keys(allTeams).filter(key => allTeams[key].league === league);'

$newFilter = '    const teamsInLeague = getTeamsForSelection();
    const curLeagueConfig = AVAILABLE_LEAGUES[selectionState.leagueIndex || 0];
    selectionState.league = 1;'

$content = $content.Replace($oldFilter, $newFilter)

$oldNameSet = '    const leagueNames = { 1: "1부 리그 (1ST DIVISION)", 2: "2부 리그 (2ND DIVISION)", 3: "3부 리그 (3RD DIVISION)" };
    const leagueNameEl = document.getElementById(''ts-league-name'');
    if (leagueNameEl) leagueNameEl.textContent = leagueNames[league];'

$newNameSet = '    const leagueNameEl = document.getElementById(''ts-league-name'');
    if (leagueNameEl && curLeagueConfig) leagueNameEl.textContent = curLeagueConfig.name;'

$content = $content.Replace($oldNameSet, $newNameSet)

# 3. Update changeLeague and changeSelectionTeam
$oldNav = '// 리그 변경 함수 (화살표용)
function changeLeague(direction) {
    if (typeof selectionState === ''undefined'') return;
    
    let newLeague = selectionState.league + direction;
    if (newLeague > 3) newLeague = 1;
    if (newLeague < 1) newLeague = 3;
    
    selectionState.league = newLeague;
    selectionState.teamIndex = 0; // 리그 변경 시 첫 팀으로 리셋
    renderTeamSelectionUI();
}

// 팀 네비게이션 함수
function changeSelectionTeam(direction) {
    if (typeof selectionState === ''undefined'' || typeof allTeams === ''undefined'') return;

    const league = selectionState.league;
    const teamsInLeague = Object.keys(allTeams).filter(key => allTeams[key].league === league);
    
    selectionState.teamIndex += direction;
    
    // 순환 로직
    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;
    
    renderTeamSelectionUI();
}'

$newNav = '// 리그 변경 함수 (화살표용)
function changeLeague(direction) {
    if (typeof selectionState === ''undefined'') return;
    if (typeof selectionState.leagueIndex !== ''number'') selectionState.leagueIndex = 0;
    
    let newIndex = selectionState.leagueIndex + direction;
    if (newIndex >= AVAILABLE_LEAGUES.length) newIndex = 0;
    if (newIndex < 0) newIndex = AVAILABLE_LEAGUES.length - 1;
    
    selectionState.leagueIndex = newIndex;
    selectionState.teamIndex = 0;
    renderTeamSelectionUI();
}

// 팀 네비게이션 함수
function changeSelectionTeam(direction) {
    if (typeof selectionState === ''undefined'' || typeof allTeams === ''undefined'') return;

    const teamsInLeague = getTeamsForSelection();
    if (!teamsInLeague || teamsInLeague.length === 0) return;
    
    selectionState.teamIndex += direction;
    
    // 순환 로직
    if (selectionState.teamIndex >= teamsInLeague.length) selectionState.teamIndex = 0;
    if (selectionState.teamIndex < 0) selectionState.teamIndex = teamsInLeague.length - 1;
    
    renderTeamSelectionUI();
}'

$content = $content.Replace($oldNav, $newNav)

[System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
Write-Host "Updated start.js with AVAILABLE_LEAGUES successfully."

