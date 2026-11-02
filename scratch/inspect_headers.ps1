# scratch/inspect_headers.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$cols = $parser.ReadFields()
for ($i = 0; $i -lt $cols.Length; $i++) {
    Write-Host "Col $i : $($cols[$i])"
}
$parser.Close()

