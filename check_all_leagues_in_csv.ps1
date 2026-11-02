# check_all_leagues_in_csv.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$utf8 = [System.Text.Encoding]::UTF8
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$leagues = @{}
$clubs = @{}
$totalPlayers = 0

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($null -eq $cols -or $cols.Length -lt 10) { continue }
    $idVal = 0
    if (-not [int]::TryParse($cols[0].Trim(), [ref]$idVal)) { continue }
    $totalPlayers++
    
    $cName = $cols[7].Trim()
    $lName = $cols[8].Trim()
    
    if (-not $leagues.ContainsKey($lName)) { $leagues[$lName] = 0 }
    $leagues[$lName]++
    
    if (-not $clubs.ContainsKey($cName)) { $clubs[$cName] = $lName }
}
$parser.Close()

Write-Host "Total players in CSV: $totalPlayers"
Write-Host "Total unique clubs in CSV: $($clubs.Keys.Count)"
Write-Host "Total unique leagues in CSV: $($leagues.Keys.Count)"

Write-Host "`nLeagues breakdown:"
foreach ($l in ($leagues.Keys | Sort-Object)) {
    Write-Host " - $l : $($leagues[$l]) players"
}
