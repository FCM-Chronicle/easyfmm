# extract_players.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json

$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$allPlayers = New-Object System.Collections.Generic.List[object]

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($null -eq $cols -or $cols.Length -lt 10) { continue }
    $playerIdInt = 0
    if (-not [int]::TryParse($cols[0].Trim(), [ref]$playerIdInt)) { continue }
    $clubName = $cols[7].Trim()
    if (-not $clubs.PSObject.Properties[$clubName]) { continue }
    
    $knownAs = $cols[1].Trim()
    $fn = $cols[2].Trim()
    $ln = $cols[3].Trim()
    $rawName = if (-not [string]::IsNullOrWhiteSpace($knownAs)) { $knownAs } else { "$fn $ln".Trim() }
    
    $allPlayers.Add([ordered]@{
        id = $playerIdInt
        rawName = $rawName
        knownAs = $knownAs
        firstName = $fn
        lastName = $ln
        club = $clubName
        country = $cols[9].Trim()
        ovr = [int]$cols[4].Trim()
    })
}
$parser.Close()

Write-Host "Extracted $($allPlayers.Count) players across 162 clubs."
$json = ConvertTo-Json -Depth 3 $allPlayers
[System.IO.File]::WriteAllText("all_tier1_extracted_players.json", $json, $utf8NoBom)
Write-Host "Saved to all_tier1_extracted_players.json."
