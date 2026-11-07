# build_final_teamsdata.ps1 - Pure ASCII Script
Add-Type -AssemblyName Microsoft.VisualBasic
$utf8 = [System.Text.Encoding]::UTF8
$utf8Bom = New-Object System.Text.UTF8Encoding($true)

Write-Host "=== BUILDING FINAL TEAMS DATA FOR ALL 162 CLUBS ==="

# 1. Load configuration and dictionaries
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8) | ConvertFrom-Json
$countries = [System.IO.File]::ReadAllText("tier1_countries.json", $utf8) | ConvertFrom-Json
$knownPlayers = [System.IO.File]::ReadAllText("master_known_players.json", $utf8) | ConvertFrom-Json
$topStars = [System.IO.File]::ReadAllText("master_top_stars.json", $utf8) | ConvertFrom-Json
foreach ($prop in $topStars.PSObject.Properties) {
    if (-not $knownPlayers.PSObject.Properties[$prop.Name]) {
        $knownPlayers | Add-Member -NotePropertyName $prop.Name -NotePropertyValue $prop.Value
    }
}
$tokens = [System.IO.File]::ReadAllText("master_tokens.json", $utf8) | ConvertFrom-Json
$kSyllables = [System.IO.File]::ReadAllText("korean_syllables_complete.json", $utf8) | ConvertFrom-Json
$kForeigners = [System.IO.File]::ReadAllText("trans_kleague_foreigners.json", $utf8) | ConvertFrom-Json
$phoneticRules = [System.IO.File]::ReadAllText("phonetic_rules.json", $utf8) | ConvertFrom-Json

$fnDict = $tokens.firstNames
$snDict = $tokens.surnames
$particles = $phoneticRules.particles
$suffixes = $phoneticRules.suffixes
$chunks = $phoneticRules.chunks

function NormalizeNameChars($str) {
    if ([string]::IsNullOrWhiteSpace($str)) { return "" }
    $s = $str.Replace(([string][char]0x00F0), "d").Replace(([string][char]0x00D0), "D")
    $s = $s.Replace(([string][char]0x00FE), "th").Replace(([string][char]0x00DE), "Th")
    $s = $s.Replace(([string][char]0x00E6), "ae").Replace(([string][char]0x00C6), "Ae")
    $s = $s.Replace(([string][char]0x00F8), "o").Replace(([string][char]0x00D8), "O")
    $s = $s.Replace(([string][char]0x0142), "l").Replace(([string][char]0x0141), "L")
    $s = $s.Replace(([string][char]0x0111), "d").Replace(([string][char]0x0110), "D")
    $s = $s.Replace(([string][char]0x00DF), "ss")
    return $s
}

function CleanPhoneticTransliterate($word) {
    if ([string]::IsNullOrWhiteSpace($word)) { return "" }
    $w = (NormalizeNameChars $word).ToLower().Trim()
    
    foreach ($prop in $suffixes.PSObject.Properties) {
        if ($w.EndsWith($prop.Name)) {
            $prefix = $w.Substring(0, $w.Length - $prop.Name.Length)
            if ($prefix.Length -eq 0) { return $prop.Value }
            return (CleanPhoneticTransliterate $prefix) + $prop.Value
        }
    }
    
    if ($w.StartsWith("mc") -and $w.Length -gt 2) {
        $mcVal = $particles.mc
        return $mcVal + (CleanPhoneticTransliterate $w.Substring(2))
    }
    if ($w.StartsWith("mac") -and $w.Length -gt 3) {
        $macVal = $particles.mac
        return $macVal + (CleanPhoneticTransliterate $w.Substring(3))
    }

    $res = ""
    $rem = $w
    while ($rem.Length -gt 0) {
        $matched = $false
        foreach ($prop in $chunks.PSObject.Properties) {
            if ($rem.StartsWith($prop.Name)) {
                $res += $prop.Value
                $rem = $rem.Substring($prop.Name.Length)
                $matched = $true
                break
            }
        }
        if (-not $matched) {
            $rem = $rem.Substring(1)
        }
    }
    return $res
}

function TranslateSingleWord($word) {
    if ([string]::IsNullOrWhiteSpace($word)) { return "" }
    $w = $word.Trim().Trim(".,'`"")
    if ($w.Length -eq 0) { return "" }
    
    if ($knownPlayers.PSObject.Properties[$w]) { return $knownPlayers.$w }
    if ($snDict.PSObject.Properties[$w]) { return $snDict.$w }
    if ($fnDict.PSObject.Properties[$w]) { return $fnDict.$w }
    
    $wLower = $w.ToLower()
    if ($particles.PSObject.Properties[$wLower]) { return $particles.$wLower }
    if ($w -match "[\uAC00-\uD7A3]") { return $w }
    
    return CleanPhoneticTransliterate $w
}

function TranslatePlayer($idNum, $rawFullName, $country) {
    $idStr = $idNum.ToString()
    
    if ($kForeigners.PSObject.Properties[$idStr]) {
        return $kForeigners.$idStr
    }
    
    if ($knownPlayers.PSObject.Properties[$rawFullName]) {
        return $knownPlayers.$rawFullName
    }
    
    if ($country -in @("Korea Republic", "South Korea", "Korea DPR")) {
        $camelSplit = [regex]::Replace($rawFullName, "([a-z])([A-Z])", '$1 $2')
        $parts = $camelSplit.ToLower() -split "[\s\-]+"
        $kName = ""
        $allMatched = $true
        foreach ($part in $parts) {
            if ($kSyllables.PSObject.Properties[$part]) {
                $kName += $kSyllables.$part
            } else {
                $allMatched = $false
                break
            }
        }
        if ($allMatched -and $kName.Length -ge 2) {
            return $kName
        }
    }
    
    $clean = NormalizeNameChars $rawFullName
    $words = $clean -split "\s+"
    $transWords = @()
    
    foreach ($w in $words) {
        if ($w.Contains("-")) {
            $subParts = $w -split "-"
            $subTrans = @()
            foreach ($sp in $subParts) {
                $subTrans += (TranslateSingleWord $sp)
            }
            $transWords += ($subTrans -join "")
        } else {
            $transWords += (TranslateSingleWord $w)
        }
    }
    
    return ($transWords -join " ").Trim()
}

Write-Host "Parsing players.csv with TextFieldParser..."
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
    
    $playerIdInt = 0
    if (-not [int]::TryParse($cols[0].Trim(), [ref]$playerIdInt)) { continue }
    
    $clubName = $cols[7].Trim()
    if (-not $clubs.PSObject.Properties[$clubName]) { continue }
    
    $knownAs = $cols[1].Trim()
    $firstName = $cols[2].Trim()
    $lastName = $cols[3].Trim()
    $rawFullName = if (-not [string]::IsNullOrWhiteSpace($knownAs)) { $knownAs } else { "$firstName $lastName".Trim() }
    
    $ovr = 70
    [void][int]::TryParse($cols[4].Trim(), [ref]$ovr)
    $rawPos = $cols[5].Trim()
    $country = $cols[9].Trim()
    $dob = if ($cols.Length -gt 16) { $cols[16].Trim() } else { "" }
    $traitsStr = if ($cols.Length -gt 17) { $cols[17].Trim() } else { "" }
    
    $legacyPos = "MF"
    if ($rawPos -eq "GK") { $legacyPos = "GK" }
    elseif ($rawPos -in @("CB", "LB", "RB", "LWB", "RWB")) { $legacyPos = "DF" }
    elseif ($rawPos -in @("CDM", "CM", "CAM", "LM", "RM")) { $legacyPos = "MF" }
    elseif ($rawPos -in @("ST", "CF", "LW", "RW")) { $legacyPos = "FW" }
    
    $birthYear = 2000
    if ($dob.Length -ge 4) { [void][int]::TryParse($dob.Substring(0, 4), [ref]$birthYear) }
    $age = [Math]::Max(16, [Math]::Min(42, 2026 - $birthYear))
    
    $koreanName = TranslatePlayer $playerIdInt $rawFullName $country
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
        playerid = $playerIdInt
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

Write-Host "Processed $processedCount players across $($playersByClub.Count) Tier-1 clubs."

# Assemble teamsData.js
$sb = New-Object System.Text.StringBuilder
[void]$sb.AppendLine("// easyfmm - FC 27 Real Football World (162 Clubs)")
[void]$sb.AppendLine("const allTeams = {")

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
        $traitsJson = ConvertTo-Json -Compress $p.traits
        $attrsJson = "{ pace: $($p.attributes.pace), shooting: $($p.attributes.shooting), passing: $($p.attributes.passing), dribbling: $($p.attributes.dribbling), defending: $($p.attributes.defending), physical: $($p.attributes.physical) }"
        
        $pLine = "            { name: `"$($p.name)`", position: `"$($p.position)`", country: `"$($p.country)`", age: $($p.age), rating: $($p.rating), playerid: $($p.playerid), detailPosition: `"$($p.detailPosition)`", potential: $($p.potential), value: $($p.value), weeklyWage: $($p.weeklyWage), preferredFoot: `"$($p.preferredFoot)`", weakFoot: $($p.weakFoot), skillMoves: $($p.skillMoves), attributes: $attrsJson, traits: $traitsJson },"
        [void]$sb.AppendLine($pLine)
    }
    
    [void]$sb.AppendLine("        ]")
    [void]$sb.AppendLine("    },")
}

$backupPath = "easyfmm_backup_initial\teamsData.js"
$backupText = [System.IO.File]::ReadAllText($backupPath, $utf8)
$preservedTeams = [System.IO.File]::ReadAllText("preserved_teams.json", $utf8) | ConvertFrom-Json

Write-Host "Appending preserved teams..."
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
        }
    }
}

[void]$sb.AppendLine("};")
[void]$sb.AppendLine("")

$iconIdx = $backupText.IndexOf("iconPlayersList")
if ($iconIdx -gt 0) {
    $prevLine = $backupText.LastIndexOf("`n", $iconIdx)
    $beforePrev = if ($prevLine -gt 0) { $backupText.LastIndexOf("`n", $prevLine - 1) } else { $prevLine }
    $iconPart = $backupText.Substring($beforePrev + 1)
    [void]$sb.Append($iconPart)
    Write-Host "Appended iconPlayersList and teams export from backup."
}

$destPath = "easyfmm\teamsData.js"
[System.IO.File]::WriteAllText($destPath, $sb.ToString(), $utf8Bom)

Write-Host "SUCCESS: teamsData.js generated with UTF-8 BOM. Size: $([math]::Round($sb.Length / 1MB, 2)) MB"
