# scratch/analyze_names.ps1
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

    $knownAs = $cols[1].Trim()
    $fn = $cols[2].Trim()
    $ln = $cols[3].Trim()
    $fullName = if (-not [string]::IsNullOrWhiteSpace($knownAs)) { $knownAs } else { "$fn $ln".Trim() }
    $players += $fullName
}
$parser.Close()

Write-Host "Total players in Tier-1 clubs: $($players.Count)"

$wordFreq = @{}
foreach ($p in $players) {
    $words = $p -split "\s+"
    foreach ($w in $words) {
        $clean = $w.Trim(" ,.()'`"")
        if ($clean.Length -ge 2) {
            $wordFreq[$clean] = 1 + $wordFreq[$clean]
        }
    }
}

Write-Host "Total unique name tokens: $($wordFreq.Count)"

# Output top tokens
$topTokens = $wordFreq.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 50
foreach ($t in $topTokens) {
    Write-Host "$($t.Key): $($t.Value)"
}

