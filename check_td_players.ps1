$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

$clubCount = ([regex]::Matches($td, "budget:")).Count
Write-Host "Total clubs in teamsData.js: $clubCount"

$preserved = Get-Content "preserved_teams.json" -Raw -Encoding UTF8 | ConvertFrom-Json
$missing = 0
foreach ($p in $preserved) {
    if ($td.IndexOf("`"$p`":") -lt 0) {
        Write-Host "Missing preserved: $p"
        $missing++
    }
}
Write-Host "Missing preserved clubs: $missing (must be 0)"
