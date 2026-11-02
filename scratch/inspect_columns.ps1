# scratch/inspect_columns.ps1
Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols[0] -eq "238004") {
        for ($i = 0; $i -lt $cols.Length; $i++) {
            Write-Host "Col $i : $($cols[$i])"
        }
        break
    }
}
$parser.Close()

