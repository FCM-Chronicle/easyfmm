[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$lines = Get-Content -Encoding UTF8 "./easyfmm/teamsData.js"
$existingPlayers = @()
foreach ($line in $lines) {
    if ($line -match 'name:\s*"([^"]+)"') {
        $existingPlayers += $matches[1]
    }
}

Write-Output "Extracted $($existingPlayers.Count) player names from teamsData.js"
$existingPlayers | Select-Object -First 30 | ForEach-Object { Write-Output $_ }

