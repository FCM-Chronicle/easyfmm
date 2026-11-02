[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

$lines = Get-Content -Encoding UTF8 "players.csv - players.csv.csv"

$clubs = @{}

foreach ($line in $lines) {
    if ($line -match '^(\d+),([^,]*),([^,]*),([^,]*),(\d+),([^,]*),([^,]*),([^,]*),([^,]*),') {
        $club = $matches[8].Trim('"')
        $league = $matches[9].Trim('"')

        $normLeague = $null
        if ($league -eq "Premier League") { $normLeague = "Premier League" }
        elseif ($league -eq "LALIGA EA SPORTS") { $normLeague = "LALIGA EA SPORTS" }
        elseif ($league -eq "Bundesliga") { $normLeague = "Bundesliga" }
        elseif ($league -eq "Serie A Enilive") { $normLeague = "Serie A Enilive" }
        elseif ($league -like "Ligue 1*") { $normLeague = "Ligue 1" }
        elseif ($league -eq "Eredivisie") { $normLeague = "Eredivisie" }
        elseif ($league -eq "Liga Portugal") { $normLeague = "Liga Portugal" }
        elseif ($league -like "*S*per Lig*") { $normLeague = "Süper Lig" }
        elseif ($league -eq "K League 1") { $normLeague = "K League 1" }

        if ($normLeague) {
            if (-not $clubs.ContainsKey($normLeague)) { $clubs[$normLeague] = @() }
            if ($clubs[$normLeague] -notcontains $club) {
                $clubs[$normLeague] += $club
            }
        }
    }
}

$outObj = @{}
foreach ($k in $clubs.Keys) {
    $outObj[$k] = ($clubs[$k] | Sort-Object)
}

$json = ConvertTo-Json -InputObject $outObj -Depth 5
[System.IO.File]::WriteAllText("tier1_raw_clubs.json", $json, [System.Text.Encoding]::UTF8)
Write-Output "Extracted raw clubs into tier1_raw_clubs.json"

