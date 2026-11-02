# check_top_players.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8) | ConvertFrom-Json
$known = [System.IO.File]::ReadAllText("master_known_players.json", $utf8) | ConvertFrom-Json

$unmappedTop = @()
foreach ($p in ($players | Where-Object { $_.ovr -ge 76 } | Sort-Object -Property ovr -Descending)) {
    if (-not $known.PSObject.Properties[$p.rawName]) {
        $unmappedTop += $p
    }
}

Write-Host "Unmapped players rated >= 76: $($unmappedTop.Count)"
foreach ($p in ($unmappedTop | Select-Object -First 40)) {
    Write-Host "$($p.id) | $($p.club) | $($p.rawName) | $($p.ovr) | $($p.country)"
}

