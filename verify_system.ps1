# verify_system.ps1
$utf8 = [System.Text.Encoding]::UTF8

Write-Host "=== VERIFYING EASYFMM 9-LEAGUE SYSTEM ==="

# 1. Check index.html script tags
$html = [System.IO.File]::ReadAllText("easyfmm\index.html", $utf8)
$hasLeagueMgr = $html.Contains("leagueManager.js")
$hasTeamsData = $html.Contains("teamsData.js")
Write-Host "index.html has leagueManager.js: $hasLeagueMgr"
Write-Host "index.html has teamsData.js: $hasTeamsData"

# 2. Check teamsData.js
$tdContent = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
Write-Host "teamsData.js size: $([math]::Round($tdContent.Length / 1MB, 2)) MB"

# Check preserved teams from preserved_teams.json
$preserved = Get-Content "preserved_teams.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$missingCount = 0
foreach ($t in $preserved) {
    if (-not $tdContent.Contains("'$t'")) {
        Write-Host "Missing preserved team: $t"
        $missingCount++
    }
}
Write-Host "Missing preserved teams: $missingCount (must be 0)"

# Check iconPlayersList preserved
$hasIcons = $tdContent.Contains("iconPlayersList")
Write-Host "iconPlayersList preserved: $hasIcons"

# 3. Check parsed players count & squad validity
$parsedPlayers = Get-Content "tier1_parsed_players.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$tier1Clubs = Get-Content "tier1_clubs.json" -Raw -Encoding UTF8 | ConvertFrom-Json

Write-Host "Total Tier-1 Clubs: $($tier1Clubs.Count)"
Write-Host "Total Tier-1 Players: $($parsedPlayers.Count)"

$validPositions = @("GK", "DF", "MF", "FW")
$invalidPosCount = 0
$missingWageCount = 0
$missingRatingCount = 0

foreach ($p in $parsedPlayers) {
    if ($validPositions -notcontains $p.position) {
        $invalidPosCount++
    }
    if ($null -eq $p.weeklyWage) {
        $missingWageCount++
    }
    if ($null -eq $p.rating -or $p.rating -le 0) {
        $missingRatingCount++
    }
}

Write-Host "Invalid position count: $invalidPosCount (must be 0)"
Write-Host "Missing wage count: $missingWageCount (must be 0)"
Write-Host "Missing rating count: $missingRatingCount (must be 0)"

# 4. Check leagueManager.js
$lmContent = [System.IO.File]::ReadAllText("easyfmm\leagueManager.js", $utf8)
$has9Leagues = $lmContent.Contains("premier_league") -and $lmContent.Contains("laliga") -and $lmContent.Contains("bundesliga") -and $lmContent.Contains("serie_a") -and $lmContent.Contains("ligue_1") -and $lmContent.Contains("eredivisie") -and $lmContent.Contains("liga_portugal") -and $lmContent.Contains("super_lig") -and $lmContent.Contains("kleague_1")
Write-Host "leagueManager.js has all 9 leagues config: $has9Leagues"

# 5. Check start.js
$startContent = [System.IO.File]::ReadAllText("easyfmm\start.js", $utf8)
$hasStartNav = $startContent.Contains("AVAILABLE_LEAGUES")
Write-Host "start.js has 9 leagues selector: $hasStartNav"

Write-Host "=== VERIFICATION COMPLETE ==="
