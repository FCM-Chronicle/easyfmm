# inspect_epl.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("league_premier_league.json", $utf8NoBom) | ConvertFrom-Json

$byClub = @{}
foreach ($p in $players) {
    if (-not $byClub.ContainsKey($p.club)) { $byClub[$p.club] = @() }
    $byClub[$p.club] += $p
}

Write-Host "Premier League Clubs ($($byClub.Keys.Count)):"
foreach ($c in ($byClub.Keys | Sort-Object)) {
    Write-Host "$c : $($byClub[$c].Count) players"
}

