$utf8 = [System.Text.Encoding]::UTF8
$clubs = Get-Content "tier1_clubs.json" -Raw -Encoding UTF8 | ConvertFrom-Json

foreach ($prop in $clubs.PSObject.Properties) {
    if ($prop.Value.leagueId -eq "premier_league") {
        Write-Host "EPL: $($prop.Name) -> displayName: $($prop.Value.displayName)"
    }
}

