# inspect_extracted.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json

$byLeague = @{}
foreach ($p in $players) {
    $cObj = $clubs.PSObject.Properties[$p.club]
    $lid = if ($cObj) { $cObj.Value.leagueId } else { "unknown" }
    if (-not $byLeague.ContainsKey($lid)) { $byLeague[$lid] = 0 }
    $byLeague[$lid]++
}

foreach ($k in $byLeague.Keys) {
    Write-Host "$k : $($byLeague[$k]) players"
}

