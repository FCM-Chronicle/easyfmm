# check_ids.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$idSet = New-Object "System.Collections.Generic.HashSet[int]"
$duplicates = 0

foreach ($p in $players) {
    if (-not $idSet.Add($p.id)) {
        $duplicates++
    }
}

Write-Host "Total players: $($players.Count)"
Write-Host "Unique IDs: $($idSet.Count)"
Write-Host "Duplicate IDs: $duplicates"

