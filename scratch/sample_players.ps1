# scratch/sample_players.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json

Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$players = @()
while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 11) { continue }
    $clubName = $cols[7].Trim()
    if (-not $clubs.PSObject.Properties[$clubName]) { continue }

    $known = $cols[1].Trim()
    $fn = $cols[2].Trim()
    $ln = $cols[3].Trim()
    $raw = if (-not [string]::IsNullOrWhiteSpace($known)) { $known } else { "$fn $ln".Trim() }
    $players += [ordered]@{
        name = $raw
        club = $clubName
        country = $cols[9].Trim()
        ovr = [int]$cols[4].Trim()
    }
}
$parser.Close()

Write-Host "Total players: $($players.Count)"
# Find Gudmundsson
$gud = $players | Where-Object { $_.name -match "Gudmundsson|Guðmundsson" }
$gud | ForEach-Object { Write-Host "$($_.name) ($($_.club), $($_.country), $($_.ovr))" }

