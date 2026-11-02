# scratch/find_lacroix_in_teamsdata.ps1
$txt = [System.IO.File]::ReadAllText("easyfmm\teamsData.js")
$lines = $txt -split "`n"
$currentTeam = ""
for ($i = 0; $i -lt $lines.Length; $i++) {
    $line = $lines[$i]
    if ($line -match '"([^"]+)":\s*\{') {
        $currentTeam = $matches[1]
    }
    if ($line -match "244067|라크루아|라크로이|Lacroix") {
        Write-Host "Found in team: $currentTeam at line $($i+1): $line"
    }
}

