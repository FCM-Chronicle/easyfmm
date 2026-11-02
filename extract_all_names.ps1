# extract_all_names.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8) | ConvertFrom-Json

$uniqueNames = @{}
foreach ($p in $players) {
    if (-not $uniqueNames.ContainsKey($p.rawName)) {
        $uniqueNames[$p.rawName] = @{
            id = $p.id
            club = $p.club
            country = $p.country
            ovr = $p.ovr
        }
    }
}

Write-Host "Unique full names to translate: $($uniqueNames.Keys.Count)"

