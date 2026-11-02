# sample_kleague.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json

$kplayers = $players | Where-Object { 
    $c = $clubs.PSObject.Properties[$_.club]
    $c -and $c.Value.leagueId -eq "kleague_1"
}

Write-Host "Total K League players: $($kplayers.Count)"
for ($i = 0; $i -lt 30; $i++) {
    $p = $kplayers[$i]
    Write-Host "$($p.club) | $($p.rawName) | $($p.country) | $($p.ovr)"
}

