# scratch/check_club_col.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 8) { continue }
    $name = if (-not [string]::IsNullOrWhiteSpace($cols[1])) { $cols[1] } else { "$($cols[2]) $($cols[3])" }
    if ($name -match "Garnacho|Gyokeres|Gyökeres|Konsa|Guimaraes|Guimarães") {
        Write-Host "Player: $name | Col 6: $($cols[6]) | Col 7: $($cols[7]) | Col 8: $($cols[8])"
    }
}
$parser.Close()

