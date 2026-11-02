# patch_integration.ps1
$utf8 = [System.Text.Encoding]::UTF8

# 1. script.js
$scriptPath = "easyfmm\script.js"
$scriptContent = [System.IO.File]::ReadAllText($scriptPath, $utf8)

# 1.1 generateFullSchedule
$target1 = "function generateFullSchedule() {
    if (typeof gameData !== 'undefined' && gameData.isWorldCupMode) {
        if (typeof WorldCupManager !== 'undefined') {
            WorldCupManager.generateWCSchedule();
        }
        return;
    }"

$replace1 = "function generateFullSchedule() {
    if (typeof gameData !== 'undefined' && gameData.isWorldCupMode) {
        if (typeof WorldCupManager !== 'undefined') {
            WorldCupManager.generateWCSchedule();
        }
        return;
    }

    if (typeof LeagueManager !== 'undefined') {
        LeagueManager.generateAllLeagueSchedules();
        gameData.currentRound = 1;
        console.log('새 시즌 스케줄 생성 완료 (LeagueManager)');
        return;
    }"

# 1.2 setNextOpponent
$target2 = "    const currentLeagueKey = ``division`${gameData.currentLeague}``;
    const leagueSchedule = gameData.schedule ? gameData.schedule[currentLeagueKey] : null;"

$replace2 = "    const userLeagueId = (typeof LeagueManager !== 'undefined') ? LeagueManager.getLeagueIdByTeam(gameData.selectedTeam) : null;
    const currentLeagueKey = (userLeagueId && gameData.schedule && gameData.schedule[userLeagueId]) ? userLeagueId : ``division`${gameData.currentLeague}``;
    const leagueSchedule = gameData.schedule ? gameData.schedule[currentLeagueKey] : null;"

# 1.3 initializeLeagueData
$target3 = "function initializeLeagueData() {
    if (!gameData.leagueData) {
        gameData.leagueData = {};
    }"

$replace3 = "function initializeLeagueData() {
    if (typeof LeagueManager !== 'undefined') {
        LeagueManager.initializeAllLeagueData();
        return;
    }

    if (!gameData.leagueData) {
        gameData.leagueData = {};
    }"

# 1.4 displayLeagueTable
$target4 = "function displayLeagueTable() {
    const leagueTable = document.getElementById('leagueTable');
    if (!leagueTable) return;"

$replace4 = "function displayLeagueTable() {
    if (typeof LeagueManager !== 'undefined') {
        LeagueManager.renderLeagueStandingsUI();
        return;
    }

    const leagueTable = document.getElementById('leagueTable');
    if (!leagueTable) return;"

$scriptContent = $scriptContent.Replace($target1.Replace("`r`n", "`n"), $replace1.Replace("`r`n", "`n"))
$scriptContent = $scriptContent.Replace($target1.Replace("`n", "`r`n"), $replace1.Replace("`n", "`r`n"))

$scriptContent = $scriptContent.Replace($target2.Replace("`r`n", "`n"), $replace2.Replace("`r`n", "`n"))
$scriptContent = $scriptContent.Replace($target2.Replace("`n", "`r`n"), $replace2.Replace("`n", "`r`n"))

$scriptContent = $scriptContent.Replace($target3.Replace("`r`n", "`n"), $replace3.Replace("`r`n", "`n"))
$scriptContent = $scriptContent.Replace($target3.Replace("`n", "`r`n"), $replace3.Replace("`n", "`r`n"))

$scriptContent = $scriptContent.Replace($target4.Replace("`r`n", "`n"), $replace4.Replace("`r`n", "`n"))
$scriptContent = $scriptContent.Replace($target4.Replace("`n", "`r`n"), $replace4.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($scriptPath, $scriptContent, $utf8)
Write-Host "script.js patched successfully."

# 2. records.js
$recPath = "easyfmm\records.js"
$recContent = [System.IO.File]::ReadAllText($recPath, $utf8)

# 2.1 simulateAllLeaguesMatches
$targetRec1 = "    simulateAllLeaguesMatches() {
        // [신규] 중복 실행 방지 체크
        if (this.lastSimulatedRound === gameData.currentRound) {
            console.log(``[Records] `${gameData.currentRound}라운드 AI 경기는 이미 시뮬레이션 되었습니다. 스킵합니다.``);
            return;
        }
        this.lastSimulatedRound = gameData.currentRound;"

$replaceRec1 = "    simulateAllLeaguesMatches() {
        // [신규] 중복 실행 방지 체크
        if (this.lastSimulatedRound === gameData.currentRound) {
            console.log(``[Records] `${gameData.currentRound}라운드 AI 경기는 이미 시뮬레이션 되었습니다. 스킵합니다.``);
            return;
        }
        this.lastSimulatedRound = gameData.currentRound;

        if (typeof LeagueManager !== 'undefined') {
            LeagueManager.simulateAllLeaguesRound(gameData.currentRound);
            return;
        }"

# 2.2 updateLeagueTableForAIMatch
$targetRec2 = "updateLeagueTableForAIMatch(team1Key, team2Key, score1, score2) {
    // updateLeagueTableForAIMatch 함수 맨 첫 줄에 이것만 추가
    console.log(``리그 테이블 업데이트 호출: `${team1Key} vs `${team2Key}``);"

$replaceRec2 = "updateLeagueTableForAIMatch(team1Key, team2Key, score1, score2) {
    if (typeof LeagueManager !== 'undefined') {
        const lId1 = LeagueManager.getLeagueIdByTeam(team1Key);
        if (gameData.leagueData && gameData.leagueData[lId1]) {
            this.applyMatchResultToTable(gameData.leagueData[lId1], team1Key, team2Key, score1, score2);
        }
        return;
    }
    // updateLeagueTableForAIMatch 함수 맨 첫 줄에 이것만 추가
    console.log(``리그 테이블 업데이트 호출: `${team1Key} vs `${team2Key}``);"

$recContent = $recContent.Replace($targetRec1.Replace("`r`n", "`n"), $replaceRec1.Replace("`r`n", "`n"))
$recContent = $recContent.Replace($targetRec1.Replace("`n", "`r`n"), $replaceRec1.Replace("`n", "`r`n"))

$recContent = $recContent.Replace($targetRec2.Replace("`r`n", "`n"), $replaceRec2.Replace("`r`n", "`n"))
$recContent = $recContent.Replace($targetRec2.Replace("`n", "`r`n"), $replaceRec2.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($recPath, $recContent, $utf8)
Write-Host "records.js patched successfully."

# 3. tacticSystem.js
$tacPath = "easyfmm\tacticSystem.js"
$tacContent = [System.IO.File]::ReadAllText($tacPath, $utf8)

$targetTac1 = "function updateLeagueData(matchData, points) {
    const divisionKey = ``division`${gameData.currentLeague}``;
    const userData = gameData.leagueData[divisionKey][gameData.selectedTeam];
    const oppData = gameData.leagueData[divisionKey][gameData.currentOpponent];"

$replaceTac1 = "function updateLeagueData(matchData, points) {
    let uLId = (typeof LeagueManager !== 'undefined') ? LeagueManager.getLeagueIdByTeam(gameData.selectedTeam) : null;
    let tTable = (uLId && gameData.leagueData && gameData.leagueData[uLId]) ? gameData.leagueData[uLId] : (gameData.leagueData ? gameData.leagueData[``division`${gameData.currentLeague}``] : null);
    if (!tTable) return;
    const userData = tTable[gameData.selectedTeam];
    const oppData = tTable[gameData.currentOpponent];"

$tacContent = $tacContent.Replace($targetTac1.Replace("`r`n", "`n"), $replaceTac1.Replace("`r`n", "`n"))
$tacContent = $tacContent.Replace($targetTac1.Replace("`n", "`r`n"), $replaceTac1.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($tacPath, $tacContent, $utf8)
Write-Host "tacticSystem.js patched successfully."

# 4. endSeason.js
$endPath = "easyfmm\endSeason.js"
$endContent = [System.IO.File]::ReadAllText($endPath, $utf8)

$targetEnd1 = "function checkSeasonEnd() {
    // 현재 리그의 모든 팀이 26경기를 완료했는지 확인 (14팀 리그에서 홈&어웨이)
    const currentLeagueTeams = Object.keys(allTeams).filter(team => 
        allTeams[team].league === gameData.currentLeague
    );"

$replaceEnd1 = "function checkSeasonEnd() {
    if (typeof LeagueManager !== 'undefined') {
        const uLId = LeagueManager.getLeagueIdByTeam(gameData.selectedTeam);
        const targetRounds = (typeof LEAGUES_CONFIG !== 'undefined' && LEAGUES_CONFIG[uLId]) ? LEAGUES_CONFIG[uLId].rounds : 38;
        const leagueTeams = LeagueManager.getTeamsInLeague(uLId);
        const uTable = (gameData.leagueData && gameData.leagueData[uLId]) ? gameData.leagueData[uLId] : (gameData.leagueData ? gameData.leagueData.division1 : null);
        if (!uTable) return;
        const allDone = leagueTeams.every(k => uTable[k] && uTable[k].matches >= targetRounds);
        if (allDone) {
            endSeason();
        }
        return;
    }
    // 현재 리그의 모든 팀이 26경기를 완료했는지 확인 (14팀 리그에서 홈&어웨이)
    const currentLeagueTeams = Object.keys(allTeams).filter(team => 
        allTeams[team].league === gameData.currentLeague
    );"

$targetEnd2 = "    if (typeof allTeams !== 'undefined' && Object.keys(allTeams).length > 19) {"
$replaceEnd2 = "    if (typeof LeagueManager === 'undefined' && typeof allTeams !== 'undefined' && Object.keys(allTeams).length > 19) {"

$endContent = $endContent.Replace($targetEnd1.Replace("`r`n", "`n"), $replaceEnd1.Replace("`r`n", "`n"))
$endContent = $endContent.Replace($targetEnd1.Replace("`n", "`r`n"), $replaceEnd1.Replace("`n", "`r`n"))

$endContent = $endContent.Replace($targetEnd2.Replace("`r`n", "`n"), $replaceEnd2.Replace("`r`n", "`n"))
$endContent = $endContent.Replace($targetEnd2.Replace("`n", "`r`n"), $replaceEnd2.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($endPath, $endContent, $utf8)
Write-Host "endSeason.js patched successfully."

