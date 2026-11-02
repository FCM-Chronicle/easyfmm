# scratch/list_backup_teams.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$backupPath = "easyfmm_backup_initial\teamsData.js"
$txt = [System.IO.File]::ReadAllText($backupPath, $utf8NoBom)

$teamRegex = [regex]'"([^"]+)":\s*\{\s*displayName:\s*"([^"]+)"'
$matches = $teamRegex.Matches($txt)

Write-Host "Total teams in initial backup: $($matches.Count)"
foreach ($m in $matches) {
    Write-Host "$($m.Groups[1].Value) ($($m.Groups[2].Value))"
}

