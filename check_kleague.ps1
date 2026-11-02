# check_kleague.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("league_kleague_1.json", $utf8NoBom) | ConvertFrom-Json

$foreigners = @()
$koreans = @()

foreach ($p in $players) {
    if ($p.country -in @("Korea Republic", "South Korea", "Korea DPR")) {
        $koreans += $p
    } else {
        $foreigners += $p
    }
}

Write-Host "Koreans: $($koreans.Count)"
Write-Host "Foreigners: $($foreigners.Count)"

Write-Host "`nForeigners list:"
foreach ($f in $foreigners) {
    Write-Host "$($f.id) | $($f.rawName) | $($f.country) | $($f.club)"
}

