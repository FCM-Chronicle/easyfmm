$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

$matches = [regex]::Matches($td, '    "([^"]+)": \{')
Write-Host "Total matches in allTeams: $($matches.Count)"
for ($i = 0; $i -lt 25; $i++) {
    Write-Host "Key: $($matches[$i].Groups[1].Value)"
}

