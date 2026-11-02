# scratch/test_real_csv_trans.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json

function NormalizeNameChars($str) {
    if ([string]::IsNullOrWhiteSpace($str)) { return "" }
    $s = $str.Replace(([string][char]0x00F0), "d").Replace(([string][char]0x00D0), "D") # eth
    $s = $s.Replace(([string][char]0x00FE), "th").Replace(([string][char]0x00DE), "Th") # thorn
    $s = $s.Replace(([string][char]0x00E6), "ae").Replace(([string][char]0x00C6), "Ae") # aesc
    $s = $s.Replace(([string][char]0x00F8), "o").Replace(([string][char]0x00D8), "O")   # o slash
    $s = $s.Replace(([string][char]0x0142), "l").Replace(([string][char]0x0141), "L")   # l stroke
    $s = $s.Replace(([string][char]0x0111), "d").Replace(([string][char]0x0110), "D")   # d stroke
    $s = $s.Replace(([string][char]0x00DF), "ss") # sharp s
    return $s
}

function TransliterateWord($word) {
    if ([string]::IsNullOrWhiteSpace($word)) { return "" }
    $norm = NormalizeNameChars $word
    $w = $norm.Normalize([System.Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $w.Length; $i++) {
        $c = $w[$i]
        $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
        if ($cat -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($c)
        }
    }
    $w = $sb.ToString().ToLower()

    $multiObj = $nameData.multi
    $codaObj = $nameData.codaSyllables
    $res = ""
    $curr = $w

    while ($curr.Length -gt 0) {
        $matched = $false
        if ($multiObj) {
            foreach ($prop in $multiObj.PSObject.Properties) {
                if ($curr.StartsWith($prop.Name)) {
                    $res += $prop.Value
                    $curr = $curr.Substring($prop.Name.Length)
                    $matched = $true
                    break
                }
            }
        }
        if ($matched) { continue }

        if ($codaObj) {
            foreach ($prop in $codaObj.PSObject.Properties) {
                if ($curr.StartsWith($prop.Name)) {
                    $res += $prop.Value
                    $curr = $curr.Substring($prop.Name.Length)
                    $matched = $true
                    break
                }
            }
        }
        if (-not $matched) {
            $curr = $curr.Substring(1)
        }
    }

    if ([string]::IsNullOrWhiteSpace($res)) { return $word }
    return $res
}

function TranslateName($name) {
    $norm = NormalizeNameChars $name
    $words = $norm -split "\s+"
    $out = @()
    $fn = $nameData.firstNames
    $ln = $nameData.surnames

    foreach ($w in $words) {
        $clean = $w.Trim()
        if ([string]::IsNullOrWhiteSpace($clean)) { continue }

        if ($fn.PSObject.Properties[$clean]) {
            $out += $fn.$clean
            continue
        }
        if ($ln.PSObject.Properties[$clean]) {
            $out += $ln.$clean
            continue
        }

        # Fallback
        $out += TransliterateWord $clean
    }

    return ($out -join " ").Trim()
}

Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 11) { continue }
    $known = $cols[1].Trim()
    $first = $cols[2].Trim()
    $last = $cols[3].Trim()
    $full = if (-not [string]::IsNullOrWhiteSpace($known)) { $known } else { "$first $last".Trim() }

    if ($full -match "Gudmundsson|Gu.mundsson") {
        $res = TranslateName $full
        Write-Host "Real CSV Player: $full -> $res"
    }
}
$parser.Close()

