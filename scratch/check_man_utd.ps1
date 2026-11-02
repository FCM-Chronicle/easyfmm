# scratch/check_man_utd.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 8) { continue }
    if ($cols[7] -match "Man Utd|Manchester United") {
        $name = if (-not [string]::IsNullOrWhiteSpace($cols[1])) { $cols[1] } else { "$($cols[2]) $($cols[3])" }
        Write-Host "$name ($($cols[7]), $($cols[4]))"
    }
}
$parser.Close()

