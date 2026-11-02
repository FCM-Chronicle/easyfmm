# inspect_samples_ascii.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8) | ConvertFrom-Json

$targets = @("Chelsea", "Fiorentina", "Aston Villa", "Arsenal", "Manchester City")

foreach ($t in $targets) {
    $cObj = $clubs.$t
    $kKey = $cObj.key
    Write-Host "`n=== Club: $t (Key in teamsData: $kKey) ==="
    
    $searchKey = "`"$kKey`": {"
    $idx = $td.IndexOf($searchKey)
    if ($idx -lt 0) {
        Write-Host "Team $kKey not found in teamsData.js!"
        continue
    }
    
    $chunk = $td.Substring($idx, [math]::Min(2500, $td.Length - $idx))
    $matches = [regex]::Matches($chunk, 'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)')
    
    foreach ($m in ($matches | Select-Object -First 10)) {
        Write-Host " * Name: $($m.Groups[1].Value) | Pos: $($m.Groups[2].Value) | Country: $($m.Groups[3].Value) | Age: $($m.Groups[4].Value) | OVR: $($m.Groups[5].Value)"
    }
}

