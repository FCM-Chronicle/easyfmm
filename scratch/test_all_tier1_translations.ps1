# scratch/test_all_tier1_translations.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json
$countries = [System.IO.File]::ReadAllText("tier1_countries.json", $utf8NoBom) | ConvertFrom-Json
$knownNames = [System.IO.File]::ReadAllText("tier1_known_names.json", $utf8NoBom) | ConvertFrom-Json
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json

$backupPath = "easyfmm_backup_initial\teamsData.js"
$backupText = [System.IO.File]::ReadAllText($backupPath, $utf8NoBom)
$backupMap = @{}
$playerRegex = [regex]'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)'
$backupMatches = $playerRegex.Matches($backupText)
foreach ($m in $backupMatches) {
    $compKey = "$($m.Groups[3].Value)|$($m.Groups[2].Value)|$($m.Groups[4].Value)|$($m.Groups[5].Value)"
    if (-not $backupMap.ContainsKey($compKey)) {
        $backupMap[$compKey] = $m.Groups[1].Value
    }
}

function TransliterateWord($word) {
    if ([string]::IsNullOrWhiteSpace($word)) { return "" }
    $w = $word.Normalize([System.Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $w.Length; $i++) {
        $c = $w[$i]
        $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
        if ($cat -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($c)
        }
    }
    $w = $sb.ToString().ToLower()

    $sylObj = $nameData.syllables
    $res = ""
    $curr = $w
    while ($curr.Length -gt 0) {
        $matched = $false
        foreach ($prop in $sylObj.PSObject.Properties) {
            $pattern = $prop.Name
            if ($curr.StartsWith($pattern)) {
                $res += $prop.Value
                $curr = $curr.Substring($pattern.Length)
                $matched = $true
                break
            }
        }
        if (-not $matched) {
            $curr = $curr.Substring(1)
        }
    }
    if ([string]::IsNullOrWhiteSpace($res)) { return $word }
    return $res
}

function TranslateFullName($rawName, $country, $pos, $age, $rating, [ref]$source) {
    if ([string]::IsNullOrWhiteSpace($rawName)) { return "선수" }
    $clean = $rawName.Trim()

    if ($knownNames.PSObject.Properties[$clean]) {
        $source.Value = "known"
        return $knownNames.$clean
    }

    $kCountry = $clean
    if ($countries.PSObject.Properties[$country]) { $kCountry = $countries.$country }
    $comp = "$kCountry|$pos|$age|$rating"
    if ($backupMap.ContainsKey($comp)) {
        $source.Value = "backup"
        return $backupMap[$comp]
    }

    if ($country -eq "South Korea" -or $country -eq "Korea Republic") {
        $kSyl = $nameData.koreanSyllables
        $parts = $clean.ToLower() -split "[\s\-]+"
        $kName = ""
        $allConverted = $true
        foreach ($p in $parts) {
            if ($kSyl.PSObject.Properties[$p]) {
                $kName += $kSyl.$p
            } else {
                $allConverted = $false
                break
            }
        }
        if ($allConverted -and $kName.Length -ge 2) {
            $source.Value = "ksyl"
            return $kName
        }
    }

    $words = $clean -split "\s+"
    $translatedWords = @()
    $fnObj = $nameData.firstNames
    $lnObj = $nameData.surnames

    $usedFallback = $false
    foreach ($w in $words) {
        $cleanWord = $w.Trim()
        if ([string]::IsNullOrWhiteSpace($cleanWord)) { continue }

        if ($knownNames.PSObject.Properties[$cleanWord]) {
            $translatedWords += $knownNames.$cleanWord
            continue
        }
        if ($fnObj.PSObject.Properties[$cleanWord]) {
            $translatedWords += $fnObj.$cleanWord
            continue
        }
        if ($lnObj.PSObject.Properties[$cleanWord]) {
            $translatedWords += $lnObj.$cleanWord
            continue
        }
        if ($cleanWord -match "[\uAC00-\uD7A3]") {
            $translatedWords += $cleanWord
            continue
        }

        $usedFallback = $true
        $trans = TransliterateWord $cleanWord
        $translatedWords += $trans
    }

    if ($usedFallback) { $source.Value = "syllable" } else { $source.Value = "dict" }
    return ($translatedWords -join " ").Trim()
}

Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$stats = @{ known = 0; backup = 0; ksyl = 0; dict = 0; syllable = 0 }
$samples = @()

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($cols.Length -lt 11) { continue }
    $clubName = $cols[7].Trim()
    if (-not $clubs.PSObject.Properties[$clubName]) { continue }

    $knownAs = $cols[1].Trim()
    $fn = $cols[2].Trim()
    $ln = $cols[3].Trim()
    $rawFullName = if (-not [string]::IsNullOrWhiteSpace($knownAs)) { $knownAs } else { "$fn $ln".Trim() }
    $country = $cols[9].Trim()
    $rawPos = $cols[5].Trim()
    $ovr = 70; [void][int]::TryParse($cols[4].Trim(), [ref]$ovr)
    $dob = if ($cols.Length -gt 15) { $cols[15].Trim() } else { "" }
    $birthYear = 2000; if ($dob.Length -ge 4) { [void][int]::TryParse($dob.Substring(0, 4), [ref]$birthYear) }
    $age = [Math]::Max(16, [Math]::Min(42, 2026 - $birthYear))
    $legacyPos = "MF"
    if ($rawPos -eq "GK") { $legacyPos = "GK" }
    elseif ($rawPos -in @("CB", "LB", "RB", "LWB", "RWB")) { $legacyPos = "DF" }
    elseif ($rawPos -in @("CDM", "CM", "CAM", "LM", "RM")) { $legacyPos = "MF" }
    elseif ($rawPos -in @("ST", "CF", "LW", "RW")) { $legacyPos = "FW" }

    $src = ""
    $res = TranslateFullName $rawFullName $country $legacyPos $age $ovr ([ref]$src)
    $stats[$src]++

    if ($src -eq "syllable" -and $samples.Count -lt 25) {
        $samples += "$rawFullName -> $res"
    }
}
$parser.Close()

Write-Host "Translation Source Stats:"
$stats.GetEnumerator() | ForEach-Object { Write-Host "  $($_.Key): $($_.Value)" }
Write-Host "`nSample syllable fallbacks:"
$samples | ForEach-Object { Write-Host "  $_" }

