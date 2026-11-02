# scratch/test_clean_trans.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json

function NormalizeNameChars($str) {
    if ([string]::IsNullOrWhiteSpace($str)) { return "" }
    $s = $str.Replace([char]0x00F0, "d").Replace([char]0x00D0, "D") # eth
    $s = $s.Replace([char]0x00FE, "th").Replace([char]0x00DE, "Th") # thorn
    $s = $s.Replace([char]0x00E6, "ae").Replace([char]0x00C6, "Ae") # aesc
    $s = $s.Replace([char]0x00F8, "o").Replace([char]0x00D8, "O")   # o slash
    $s = $s.Replace([char]0x0142, "l").Replace([char]0x0141, "L")   # l stroke
    $s = $s.Replace([char]0x0111, "d").Replace([char]0x0110, "D")   # d stroke
    $s = $s.Replace([char]0x00DF, "ss") # sharp s
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

$tests = @(
    "Albert Guðmundsson",
    "Gabriel Gudmundsson",
    "Albert Sambi Lokonga",
    "Silas Andersen",
    "Senny Mayulu",
    "Anthony Bermont",
    "Arthur Avom Ebong",
    "Francis Onyeka",
    "Kingstone Mutandwa"
)

foreach ($t in $tests) {
    Write-Host "$t -> $(TranslateName $t)"
}

