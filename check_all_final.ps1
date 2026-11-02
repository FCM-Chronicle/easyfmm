# check_all_final.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

Write-Host "=== FINAL INTEGRATION CHECK ==="
Write-Host "1. iconPlayersList present: $($td.Contains('const iconPlayersList = ['))"
Write-Host "2. teams export present: $($td.Contains('const teams = Object.values(allTeams);'))"
Write-Host "3. allTeams export present: $($td.Contains('export { teams, allTeams };') -or $td.Contains('window.allTeams = allTeams;'))"

$preserved = [System.IO.File]::ReadAllText("preserved_teams.json", $utf8) | ConvertFrom-Json
Write-Host "`n4. Preserved teams check:"
foreach ($team in $preserved) {
    $searchKey = "`"$team`":"
    Write-Host " - $team : $($td.Contains($searchKey))"
}

# Count total teams in allTeams
$teamKeyMatches = [regex]::Matches($td, '^\s{4}"([^"]+)":\s*\{', [System.Text.RegularExpressions.RegexOptions]::Multiline)
Write-Host "`n5. Total teams in allTeams: $($teamKeyMatches.Count)"
