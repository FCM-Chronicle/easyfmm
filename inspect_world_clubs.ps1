# inspect_world_clubs.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8) | ConvertFrom-Json

$testClubs = @(
    "Real Madrid", "FC Barcelona", "FC Bayern München", "Borussia Dortmund",
    "Paris SG", "OM", "Sporting CP", "FC Porto", "Galatasaray", "Fenerbahçe",
    "Ulsan HD FC", "FC Seoul", "Ajax", "PSV"
)

foreach ($cName in $testClubs) {
    if (-not $clubs.PSObject.Properties[$cName]) { continue }
    $kKey = $clubs.$cName.key
    Write-Host "`n=== $cName ($kKey) ==="
    $idx = $td.IndexOf("`"$kKey`": {")
    if ($idx -lt 0) { Write-Host "Not found"; continue }
    $endIdx = $td.IndexOf("    },", $idx)
    $chunk = $td.Substring($idx, $endIdx - $idx)
    $matches = [regex]::Matches($chunk, 'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)')
    foreach ($m in ($matches | Select-Object -First 6)) {
        Write-Host " * $($m.Groups[1].Value) ($($m.Groups[2].Value), $($m.Groups[5].Value), $($m.Groups[3].Value))"
    }
}

