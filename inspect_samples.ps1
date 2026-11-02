# inspect_samples.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

function ShowTeamPlayers($key, $title) {
    Write-Host "`n=== $title ($key) ==="
    $idx = $td.IndexOf("`"$key`": {")
    if ($idx -lt 0) {
        Write-Host "Team not found!"
        return
    }
    $endIdx = $td.IndexOf("},", $idx + 20)
    $chunk = $td.Substring($idx, [math]::Min(2000, $td.Length - $idx))
    $matches = [regex]::Matches($chunk, 'name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)')
    foreach ($m in ($matches | Select-Object -First 10)) {
        Write-Host " * $($m.Groups[1].Value) | $($m.Groups[2].Value) | $($m.Groups[3].Value) | 나이: $($m.Groups[4].Value) | OVR: $($m.Groups[5].Value)"
    }
}

ShowTeamPlayers "첼시" "첼시 (Chelsea FC)"
ShowTeamPlayers "피오렌티나" "피오렌티나 (ACF Fiorentina)"
ShowTeamPlayers "아스톤_빌라" "아스톤 빌라 (Aston Villa)"
ShowTeamPlayers "아스널" "아스널 (Arsenal FC)"
ShowTeamPlayers "맨체스터_시티" "맨체스터 시티 (Manchester City)"

