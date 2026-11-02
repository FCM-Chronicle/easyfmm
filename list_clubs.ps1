$utf8 = [System.Text.Encoding]::UTF8
$clubs = Get-Content "tier1_clubs.json" -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($prop in $clubs.PSObject.Properties) {
    if ($prop.Value.leagueId -eq "laliga") {
        Write-Host "LaLiga club key: $($prop.Name)"
    }
    if ($prop.Value.leagueId -eq "kleague_1") {
        Write-Host "KLeague club key: $($prop.Name)"
    }
}

