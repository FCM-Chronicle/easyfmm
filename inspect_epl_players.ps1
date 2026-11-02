# inspect_epl_players.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("league_premier_league.json", $utf8) | ConvertFrom-Json

$sorted = $players | Sort-Object -Property ovr -Descending | Select-Object -First 50

foreach ($p in $sorted) {
    Write-Host "$($p.id) | $($p.club) | $($p.rawName) | $($p.country) | $($p.ovr)"
}

