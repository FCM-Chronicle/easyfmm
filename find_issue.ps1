$utf8 = [System.Text.Encoding]::UTF8
$parsedPlayers = Get-Content "tier1_parsed_players.json" -Raw -Encoding UTF8 | ConvertFrom-Json

$validPositions = @("GK", "DF", "MF", "FW")
$idx = 0
foreach ($p in $parsedPlayers) {
    if ($validPositions -notcontains $p.position -or $null -eq $p.weeklyWage -or $null -eq $p.rating) {
        Write-Host "Item at index $idx is problematic:"
        Write-Host "name: $($p.name), pos: $($p.position), wage: $($p.weeklyWage), rating: $($p.rating)"
    }
    $idx++
}

