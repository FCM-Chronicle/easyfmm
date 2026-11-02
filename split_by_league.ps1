# split_by_league.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json

$leagueMap = @{
    "premier_league" = New-Object System.Collections.Generic.List[object]
    "laliga" = New-Object System.Collections.Generic.List[object]
    "bundesliga" = New-Object System.Collections.Generic.List[object]
    "serie_a" = New-Object System.Collections.Generic.List[object]
    "ligue_1" = New-Object System.Collections.Generic.List[object]
    "eredivisie" = New-Object System.Collections.Generic.List[object]
    "liga_portugal" = New-Object System.Collections.Generic.List[object]
    "super_lig" = New-Object System.Collections.Generic.List[object]
    "kleague_1" = New-Object System.Collections.Generic.List[object]
}

foreach ($p in $players) {
    $c = $clubs.PSObject.Properties[$p.club]
    if ($c -and $leagueMap.ContainsKey($c.Value.leagueId)) {
        $leagueMap[$c.Value.leagueId].Add($p)
    }
}

foreach ($lid in $leagueMap.Keys) {
    $outPath = "league_${lid}.json"
    $json = ConvertTo-Json -Depth 3 $leagueMap[$lid]
    [System.IO.File]::WriteAllText($outPath, $json, $utf8NoBom)
    Write-Host "$outPath saved with $($leagueMap[$lid].Count) players."
}

