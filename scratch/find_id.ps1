# scratch/find_id.ps1
$txt = [System.IO.File]::ReadAllText("easyfmm\teamsData.js")
$idx = $txt.IndexOf("244067")
Write-Host "Idx: $idx"
if ($idx -gt 0) {
    # find team
    $teamIdx = $txt.LastIndexOf('": {', $idx)
    $teamLineStart = $txt.LastIndexOf("`n", $teamIdx)
    Write-Host "Team line: $($txt.Substring($teamLineStart + 1, $teamIdx - $teamLineStart + 3))"
    Write-Host "Player line: $($txt.Substring($idx - 50, 200))"
}

