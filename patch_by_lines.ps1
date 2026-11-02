# patch_by_lines.ps1
$utf8 = [System.Text.Encoding]::UTF8

# 1. records.js
$recPath = "easyfmm\records.js"
$lines = [System.Collections.Generic.List[string]]([System.IO.File]::ReadAllLines($recPath, $utf8))

# Find simulateAllLeaguesMatches
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i] -match "simulateAllLeaguesMatches\(\)") {
        for ($j = $i; $j -lt $i + 15; $j++) {
            if ($lines[$j] -match "this\.lastSimulatedRound\s*=\s*gameData\.currentRound;") {
                $code = [string[]]@(
                    "        if (typeof LeagueManager !== 'undefined') {",
                    "            LeagueManager.simulateAllLeaguesRound(gameData.currentRound);",
                    "            return;",
                    "        }"
                )
                $lines.InsertRange($j + 1, $code)
                Write-Host "records.js simulateAllLeaguesMatches patched at line $($j+1)"
                break
            }
        }
        break
    }
}

# Find updateLeagueTableForAIMatch definition
for ($i = 0; $i -lt $lines.Count; $i++) {
    if ($lines[$i].Trim().StartsWith("updateLeagueTableForAIMatch(team1Key, team2Key, score1, score2)")) {
        $code = [string[]]@(
            "    if (typeof LeagueManager !== 'undefined') {",
            "        const lId1 = LeagueManager.getLeagueIdByTeam(team1Key);",
            "        if (gameData.leagueData && gameData.leagueData[lId1]) {",
            "            this.applyMatchResultToTable(gameData.leagueData[lId1], team1Key, team2Key, score1, score2);",
            "        }",
            "        return;",
            "    }"
        )
        $lines.InsertRange($i + 1, $code)
        Write-Host "records.js updateLeagueTableForAIMatch patched at line $($i+1)"
        break
    }
}

[System.IO.File]::WriteAllLines($recPath, $lines.ToArray(), $utf8)

# 2. endSeason.js
$endPath = "easyfmm\endSeason.js"
$endLines = [System.Collections.Generic.List[string]]([System.IO.File]::ReadAllLines($endPath, $utf8))

for ($i = 0; $i -lt $endLines.Count; $i++) {
    if ($endLines[$i].Trim().StartsWith("function checkSeasonEnd()")) {
        $code = [string[]]@(
            "    if (typeof LeagueManager !== 'undefined') {",
            "        const uLId = LeagueManager.getLeagueIdByTeam(gameData.selectedTeam);",
            "        const targetRounds = (typeof LEAGUES_CONFIG !== 'undefined' && LEAGUES_CONFIG[uLId]) ? LEAGUES_CONFIG[uLId].rounds : 38;",
            "        const leagueTeams = LeagueManager.getTeamsInLeague(uLId);",
            "        const uTable = (gameData.leagueData && gameData.leagueData[uLId]) ? gameData.leagueData[uLId] : (gameData.leagueData ? gameData.leagueData.division1 : null);",
            "        if (!uTable) return;",
            "        const allDone = leagueTeams.every(k => uTable[k] && uTable[k].matches >= targetRounds);",
            "        if (allDone) {",
            "            endSeason();",
            "        }",
            "        return;",
            "    }"
        )
        $endLines.InsertRange($i + 1, $code)
        Write-Host "endSeason.js checkSeasonEnd patched at line $($i+1)"
        break
    }
}

for ($i = 0; $i -lt $endLines.Count; $i++) {
    if ($endLines[$i] -match "if \(typeof allTeams !== 'undefined' && Object\.keys\(allTeams\)\.length > 19\)") {
        $endLines[$i] = "    if (typeof LeagueManager === 'undefined' && typeof allTeams !== 'undefined' && Object.keys(allTeams).length > 19) {"
        Write-Host "endSeason.js promotion/relegation guard patched at line $($i+1)"
        break
    }
}

[System.IO.File]::WriteAllLines($endPath, $endLines.ToArray(), $utf8)
Write-Host "All line patches complete."
