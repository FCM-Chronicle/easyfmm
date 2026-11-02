$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

$preserved = Get-Content "preserved_teams.json" -Raw -Encoding UTF8 | ConvertFrom-Json
foreach ($p in $preserved) {
    $found = $td.IndexOf($p) -ge 0
    Write-Host "$p in td: $found"
}

$lines = [System.IO.File]::ReadAllLines("easyfmm\teamsData.js", $utf8)
for ($i = 0; $i -lt 30; $i++) {
    Write-Host $lines[$i]
}
