# inspect_chelsea_players.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("league_premier_league.json", $utf8) | ConvertFrom-Json

$chelsea = $players | Where-Object { $_.club -eq "Chelsea" } | Sort-Object -Property ovr -Descending

Write-Host "Chelsea players ($($chelsea.Count)):"
foreach ($p in $chelsea) {
    Write-Host "$($p.id) | $($p.rawName) | $($p.country) | $($p.ovr)"
}

