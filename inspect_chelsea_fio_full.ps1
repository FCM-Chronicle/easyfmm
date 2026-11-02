# inspect_chelsea_fio_full.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8) | ConvertFrom-Json

function ShowAllPlayers($clubProp, $title) {
    $kKey = $clubs.$clubProp.key
    Write-Host "`n=== $title ($kKey) ==="
    $idx = $td.IndexOf("`"$kKey`": {")
    $endIdx = $td.IndexOf("    },", $idx)
    $chunk = $td.Substring($idx, $endIdx - $idx)
    $matches = [regex]::Matches($chunk, 'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)')
    foreach ($m in $matches) {
        Write-Host " * $($m.Groups[1].Value) ($($m.Groups[2].Value), $($m.Groups[5].Value), $($m.Groups[3].Value))"
    }
}

ShowAllPlayers "Chelsea" "Chelsea FC"
ShowAllPlayers "Fiorentina" "ACF Fiorentina"
