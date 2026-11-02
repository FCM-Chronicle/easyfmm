# rebuild_all_korean.ps1 - Pure ASCII Script with robust CSV parser and UTF-8 BOM
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8Bom = New-Object System.Text.UTF8Encoding($true)

Write-Host "=== REBUILDING TEAMS DATA WITH 100% KOREAN AND UTF-8 BOM ==="

# 1. Load data files
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json
$countries = [System.IO.File]::ReadAllText("tier1_countries.json", $utf8NoBom) | ConvertFrom-Json
$knownNames = [System.IO.File]::ReadAllText("tier1_known_names.json", $utf8NoBom) | ConvertFrom-Json
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json

# 2. Extract existing Korean players from original backup
$backupPath = "easyfmm_backup_initial\teamsData.js"
$backupText = [System.IO.File]::ReadAllText($backupPath, $utf8NoBom)

$backupMap = @{}
$playerRegex = [regex]'\{\s*name:\s*"([^"]+)",\s*position:\s*"([^"]+)",\s*country:\s*"([^"]+)",\s*age:\s*(\d+),\s*rating:\s*(\d+)'
$backupMatches = $playerRegex.Matches($backupText)

Write-Host "Found $($backupMatches.Count) player entries in initial backup."
foreach ($m in $backupMatches) {
    $pName = $m.Groups[1].Value
    $pPos = $m.Groups[2].Value
    $pCountry = $m.Groups[3].Value
    $pAge = [int]$m.Groups[4].Value
    $pRating = [int]$m.Groups[5].Value

    $compKey = "$pCountry|$pPos|$pAge|$pRating"
    if (-not $backupMap.ContainsKey($compKey)) {
        $backupMap[$compKey] = $pName
    }
}

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

# 3. Fallback syllable transliterator with 받침(codas) & multi-character phonemes
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

function TranslateFullName($rawName, $country, $pos, $age, $rating) {
    if ([string]::IsNullOrWhiteSpace($rawName)) { return [char]0xC120 + [char]0xC218 }
    $clean = $rawName.Trim()

    # 1. Check known stars dictionary
    if ($knownNames.PSObject.Properties[$clean]) {
        return $knownNames.$clean
    }

    # 2. Check original backup dictionary by composite key
    $kCountry = $clean
    if ($countries.PSObject.Properties[$country]) { $kCountry = $countries.$country }
    $comp = "$kCountry|$pos|$age|$rating"
    if ($backupMap.ContainsKey($comp)) {
        return $backupMap[$comp]
    }

    # 3. K-League Romanized Korean Syllable converter
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
            return $kName
        }
    }

    # 4. Word-by-word dictionary translation
    $norm = NormalizeNameChars $clean
    $words = $norm -split "\s+"
    $translatedWords = @()
    $fnObj = $nameData.firstNames
    $lnObj = $nameData.surnames

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

        # Keep already-Korean word
        if ($cleanWord -match "[\uAC00-\uD7A3]") {
            $translatedWords += $cleanWord
            continue
        }

        # Syllable transliteration
        $trans = TransliterateWord $cleanWord
        $translatedWords += $trans
    }

    $finalName = ($translatedWords -join " ").Trim()

    # Clean up any remaining English chars
    if ($finalName -match "[a-zA-Z]") {
        $subWords = $finalName -split "\s+"
        $fixedWords = @()
        foreach ($sw in $subWords) {
            if ($sw -match "^[a-zA-Z]+$") {
                $fixedWords += (TransliterateWord $sw)
            } else {
                $fixedWords += $sw
            }
        }
        $finalName = $fixedWords -join " "
    }

    return $finalName
}

# 4. Parse CSV safely with TextFieldParser
Write-Host "Parsing players.csv with TextFieldParser..."
Add-Type -AssemblyName Microsoft.VisualBasic
$csvPath = (Resolve-Path "players.csv - players.csv.csv").Path
$parser = New-Object Microsoft.VisualBasic.FileIO.TextFieldParser($csvPath)
$parser.TextFieldType = [Microsoft.VisualBasic.FileIO.FieldType]::Delimited
$parser.SetDelimiters(",")
$parser.HasFieldsEnclosedInQuotes = $true

$playersByClub = @{}
$processedCount = 0

while (-not $parser.EndOfData) {
    $cols = $parser.ReadFields()
    if ($null -eq $cols -or $cols.Length -lt 11) { continue }

    $playerId = 0
    if (-not [int]::TryParse($cols[0].Trim(), [ref]$playerId)) { continue }

    $knownAs = $cols[1].Trim()
    $firstName = $cols[2].Trim()
    $lastName = $cols[3].Trim()
    $ovr = 70
    [void][int]::TryParse($cols[4].Trim(), [ref]$ovr)
    $rawPos = $cols[5].Trim()
    $clubName = $cols[7].Trim()
    $country = $cols[9].Trim()
    $dob = if ($cols.Length -gt 16) { $cols[16].Trim() } else { "" }
    $traitsStr = if ($cols.Length -gt 17) { $cols[17].Trim() } else { "" }

    if (-not $clubs.PSObject.Properties[$clubName]) { continue }

    $legacyPos = "MF"
    if ($rawPos -eq "GK") { $legacyPos = "GK" }
    elseif ($rawPos -in @("CB", "LB", "RB", "LWB", "RWB")) { $legacyPos = "DF" }
    elseif ($rawPos -in @("CDM", "CM", "CAM", "LM", "RM")) { $legacyPos = "MF" }
    elseif ($rawPos -in @("ST", "CF", "LW", "RW")) { $legacyPos = "FW" }

    $birthYear = 2000
    if ($dob.Length -ge 4) { [void][int]::TryParse($dob.Substring(0, 4), [ref]$birthYear) }
    $age = [Math]::Max(16, [Math]::Min(42, 2026 - $birthYear))

    $rawFullName = if (-not [string]::IsNullOrWhiteSpace($knownAs)) { $knownAs } else { "$firstName $lastName".Trim() }

    $koreanName = TranslateFullName $rawFullName $country $legacyPos $age $ovr
    $kCountry = if ($countries.PSObject.Properties[$country]) { $countries.$country } else { $country }

    $traits = @()
    if (-not [string]::IsNullOrWhiteSpace($traitsStr)) {
        $traits = ($traitsStr -split ",\s*") | Where-Object { -not [string]::IsNullOrWhiteSpace($_) }
    }

    $pace = 70; $shooting = 70; $passing = 70; $dribbling = 70; $defending = 70; $physical = 70
    if ($cols.Length -gt 18) { [void][int]::TryParse($cols[18].Trim(), [ref]$pace) }
    if ($cols.Length -gt 19) { [void][int]::TryParse($cols[19].Trim(), [ref]$shooting) }
    if ($cols.Length -gt 20) { [void][int]::TryParse($cols[20].Trim(), [ref]$passing) }
    if ($cols.Length -gt 21) { [void][int]::TryParse($cols[21].Trim(), [ref]$dribbling) }
    if ($cols.Length -gt 22) { [void][int]::TryParse($cols[22].Trim(), [ref]$defending) }
    if ($cols.Length -gt 23) { [void][int]::TryParse($cols[23].Trim(), [ref]$physical) }

    $prefFoot = if ($cols.Length -gt 11 -and -not [string]::IsNullOrWhiteSpace($cols[11])) { $cols[11].Trim() } else { "Right" }
    $weakFoot = 3
    if ($cols.Length -gt 12) { [void][int]::TryParse($cols[12].Trim(), [ref]$weakFoot) }
    $skillMoves = 3
    if ($cols.Length -gt 13) { [void][int]::TryParse($cols[13].Trim(), [ref]$skillMoves) }

    $value = [math]::Round([math]::Max(5.0, [math]::Pow($ovr / 70.0, 4.5) * 20.0), 1)
    $wage = [math]::Round([math]::Max(0.1, [math]::Pow($ovr / 70.0, 3.8) * 0.7), 2)
    $potential = [math]::Min(99, $ovr + [math]::Max(0, [int]((30 - $age) * 0.7)))

    $playerObj = [ordered]@{
        name = $koreanName
        position = $legacyPos
        country = $kCountry
        age = $age
        rating = $ovr
        playerid = $playerId
        detailPosition = $rawPos
        potential = $potential
        value = $value
        weeklyWage = $wage
        preferredFoot = $prefFoot
        weakFoot = $weakFoot
        skillMoves = $skillMoves
        attributes = [ordered]@{
            pace = $pace
            shooting = $shooting
            passing = $passing
            dribbling = $dribbling
            defending = $defending
            physical = $physical
        }
        traits = $traits
    }

    if (-not $playersByClub.ContainsKey($clubName)) {
        $playersByClub[$clubName] = New-Object System.Collections.Generic.List[object]
    }
    $playersByClub[$clubName].Add($playerObj)
    $processedCount++
}
$parser.Close()

Write-Host "Parsed $processedCount players for $($playersByClub.Count) Tier-1 clubs."

# 5. Build teamsData.js
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("// easyfmm - FC 27 Real Football World (162 Clubs)")
[void]$sb.AppendLine("const allTeams = {")

$englishCharRegex = [regex]"[a-zA-Z]"
$remainingEnglishCount = 0

foreach ($prop in $clubs.PSObject.Properties) {
    $clubKey = $prop.Name
    $clubData = $prop.Value
    
    $cKeySafe = if (-not [string]::IsNullOrWhiteSpace($clubData.key)) { $clubData.key } elseif (-not [string]::IsNullOrWhiteSpace($clubData.name)) { $clubData.name.Replace(" ", "_") } else { $prop.Name.Replace(" ", "_") }
    $cKoreanName = if (-not [string]::IsNullOrWhiteSpace($clubData.name)) { $clubData.name } else { $cKeySafe.Replace("_", " ") }
    $cCity = if (-not [string]::IsNullOrWhiteSpace($clubData.city)) { $clubData.city } else { "" }
    $cCountry = if (-not [string]::IsNullOrWhiteSpace($clubData.country)) { $clubData.country } else { "" }
    $cLeagueId = if (-not [string]::IsNullOrWhiteSpace($clubData.leagueId)) { $clubData.leagueId } else { "premier_league" }
    $cLogo = if (-not [string]::IsNullOrWhiteSpace($clubData.logo)) { $clubData.logo } else { "GEN" }
    $cBudget = if ($clubData.budget) { $clubData.budget } else { 300 }
    $cVal = if ($clubData.val) { $clubData.val } else { 3000 }
    $cStName = if (-not [string]::IsNullOrWhiteSpace($clubData.stName)) { $clubData.stName } else { "$cKoreanName Stadium" }
    $cStCap = if ($clubData.stCap) { $clubData.stCap } else { 30000 }

    $pList = if ($playersByClub.ContainsKey($clubKey)) { $playersByClub[$clubKey] } else { @() }
    $sortedPlayers = ($pList | Sort-Object -Property rating -Descending)

    # Squad balance guarantees: Ensure at least 1 GK
    $gkCount = ($sortedPlayers | Where-Object { $_.position -eq "GK" }).Count
    if ($gkCount -lt 1) {
        $sortedPlayers += [ordered]@{
            name = "$cKoreanName GK"
            position = "GK"
            country = $cCountry
            age = 25
            rating = 72
            playerid = 900000 + ($cBudget % 1000)
            detailPosition = "GK"
            potential = 76
            value = 15.0
            weeklyWage = 0.5
            preferredFoot = "Right"
            weakFoot = 3
            skillMoves = 1
            attributes = [ordered]@{ pace=68; shooting=65; passing=68; dribbling=70; defending=40; physical=70 }
            traits = @()
        }
    }

    [void]$sb.AppendLine("    `"$cKeySafe`": {")
    [void]$sb.AppendLine("        displayName: `"$cKoreanName`",")
    [void]$sb.AppendLine("        city: `"$cCity`",")
    [void]$sb.AppendLine("        country: `"$cCountry`",")
    [void]$sb.AppendLine("        leagueId: `"$cLeagueId`",")
    [void]$sb.AppendLine("        league: 1,")
    [void]$sb.AppendLine("        logoCode: `"$cLogo`",")
    [void]$sb.AppendLine("        budget: $cBudget,")
    [void]$sb.AppendLine("        clubValue: $cVal,")
    [void]$sb.AppendLine("        stadium: { name: `"$cStName`", capacity: $cStCap },")
    [void]$sb.AppendLine("        description: `"$cCountry $cKoreanName`",")
    [void]$sb.AppendLine("        players: [")

    foreach ($p in $sortedPlayers) {
        if ($englishCharRegex.IsMatch($p.name)) {
            $remainingEnglishCount++
        }
        $traitsJson = ConvertTo-Json -Compress $p.traits
        $attrsJson = "{ pace: $($p.attributes.pace), shooting: $($p.attributes.shooting), passing: $($p.attributes.passing), dribbling: $($p.attributes.dribbling), defending: $($p.attributes.defending), physical: $($p.attributes.physical) }"
        
        $pLine = "            { name: `"$($p.name)`", position: `"$($p.position)`", country: `"$($p.country)`", age: $($p.age), rating: $($p.rating), playerid: $($p.playerid), detailPosition: `"$($p.detailPosition)`", potential: $($p.potential), value: $($p.value), weeklyWage: $($p.weeklyWage), preferredFoot: `"$($p.preferredFoot)`", weakFoot: $($p.weakFoot), skillMoves: $($p.skillMoves), attributes: $attrsJson, traits: $traitsJson },"
        [void]$sb.AppendLine($pLine)
    }

    [void]$sb.AppendLine("        ]")
    [void]$sb.AppendLine("    },")
}

Write-Host "Remaining players with any English letters: $remainingEnglishCount"

# 6. Append preserved teams & icons from backup
$preservedTeams = [System.IO.File]::ReadAllText("preserved_teams.json", $utf8NoBom) | ConvertFrom-Json

Write-Host "Appending preserved teams: $($preservedTeams -join ', ')..."

foreach ($teamName in $preservedTeams) {
    $searchKey = "`"$teamName`":"
    $startIdx = $backupText.IndexOf($searchKey)
    if ($startIdx -ge 0) {
        $lineStart = $backupText.LastIndexOf("`n", $startIdx)
        if ($lineStart -lt 0) { $lineStart = 0 } else { $lineStart = $lineStart + 1 }
        
        $closingMarker = "    },"
        $endIdx = $backupText.IndexOf($closingMarker, $startIdx)
        if ($endIdx -gt $startIdx) {
            $teamBlock = $backupText.Substring($lineStart, ($endIdx + $closingMarker.Length) - $lineStart)
            [void]$sb.AppendLine($teamBlock)
            Write-Host "Preserved team appended: $teamName"
        } else {
            Write-Host "Warning: Could not find closing marker for $teamName"
        }
    } else {
        Write-Host "Warning: Preserved team '$teamName' not found in backup."
    }
}

# Close allTeams object
[void]$sb.AppendLine("};")
[void]$sb.AppendLine("")

# Append icons and exports from backup
$iconIdx = $backupText.IndexOf("iconPlayersList")
if ($iconIdx -gt 0) {
    $prevLine = $backupText.LastIndexOf("`n", $iconIdx)
    $beforePrev = if ($prevLine -gt 0) { $backupText.LastIndexOf("`n", $prevLine - 1) } else { $prevLine }
    $iconPart = $backupText.Substring($beforePrev + 1)
    [void]$sb.Append($iconPart)
    Write-Host "Appended iconPlayersList and teams export from backup."
} else {
    Write-Host "Warning: iconPlayersList not found in backup."
}

# 7. Save file with UTF-8 BOM
$destPath = "easyfmm\teamsData.js"
[System.IO.File]::WriteAllText($destPath, $sb.ToString(), $utf8Bom)

Write-Host "teamsData.js generated successfully with UTF-8 BOM."
Write-Host "File size: $([math]::Round($sb.Length / 1MB, 2)) MB"
