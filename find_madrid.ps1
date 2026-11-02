$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

$matches = [regex]::Matches($td, '`"([^`"]*마드리드[^`"]*)`":')
foreach ($m in $matches) {
    Write-Host "Found Madrid key: $($m.Groups[1].Value)"
}

$matchesSeoul = [regex]::Matches($td, '`"([^`"]*서울[^`"]*)`":')
foreach ($m in $matchesSeoul) {
    Write-Host "Found Seoul key: $($m.Groups[1].Value)"
}

