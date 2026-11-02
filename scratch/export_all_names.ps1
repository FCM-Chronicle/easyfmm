# scratch/export_all_names.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json") | ConvertFrom-Json
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$players = @()
while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 11) { continue }
    $club = $cols[7].Trim()
    if (-not $clubs.PSObject.Properties[$club]) { continue }

    $known = $cols[1].Trim()
    $first = $cols[2].Trim()
    $last = $cols[3].Trim()
    $full = if (-not [string]::IsNullOrWhiteSpace($known)) { $known } else { "$first $last".Trim() }

    $players += [ordered]@{
        id = $cols[0].Trim()
        name = $full
        first = $first
        last = $last
        club = $club
        country = $cols[9].Trim()
    }
}
$parser.Close()

Write-Host "Total unique Tier-1 players: $($players.Count)"

# Extract all unique first names and last names
$fnSet = @{}
$lnSet = @{}
$tokenSet = @{}
foreach ($p in $players) {
    if (-not [string]::IsNullOrWhiteSpace($p.first)) { $fnSet[$p.first] = 1 + $fnSet[$p.first] }
    if (-not [string]::IsNullOrWhiteSpace($p.last)) { $lnSet[$p.last] = 1 + $lnSet[$p.last] }
    $tokens = $p.name -split "[\s\-]+"
    foreach ($t in $tokens) {
        $clean = $t.Trim(" .,'`"()")
        if ($clean.Length -ge 1) {
            $tokenSet[$clean] = 1 + $tokenSet[$clean]
        }
    }
}

Write-Host "Unique first names: $($fnSet.Count)"
Write-Host "Unique last names: $($lnSet.Count)"
Write-Host "Unique tokens: $($tokenSet.Count)"

