$ErrorActionPreference = "Stop"

Write-Host "Loading JSON dictionaries..."

function Load-JsonFile($path) {
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    return ($content | ConvertFrom-Json)
}

$clubsJson = Load-JsonFile "tier1_clubs.json"
$countriesJson = Load-JsonFile "tier1_countries.json"
$knownNamesJson = Load-JsonFile "tier1_known_names.json"
$tokensJson = Load-JsonFile "tier1_tokens.json"

$nameTokens = $tokensJson.nameTokens
$krSurnames = $tokensJson.krSurnames
$krSyllables = $tokensJson.krSyllables

Write-Host "Dictionaries loaded successfully."

function Translate-PlayerName($first, $last, $common, $isKLeague) {
    $target = if ($common) { $common } elseif ($first -and $last) { "$first $last".Trim() } elseif ($last) { $last } else { $first }
    if (-not $target) { return "선수" }

    # 1. Exact match in known names
    if ($knownNamesJson.$target) {
        return $knownNamesJson.$target
    }

    # 2. K-League Korean name
    if ($isKLeague) {
        $parts = $target -split '\s+'
        if ($parts.Count -ge 2) {
            $surname = $parts[0]
            $given = $parts[1..($parts.Count - 1)] -join ""
            if (-not $krSurnames.$surname) {
                $surname = $parts[-1]
                $given = $parts[0..($parts.Count - 2)] -join ""
            }

            if ($krSurnames.$surname) {
                $krSur = $krSurnames.$surname
                $krGiv = ""
                $lowerGiv = $given.ToLower()
                $idx = 0
                while ($idx -lt $lowerGiv.Length) {
                    $matched = $null
                    for ($len = 6; $len -ge 2; $len--) {
                        if ($idx + $len -le $lowerGiv.Length) {
                            $sub = $lowerGiv.Substring($idx, $len)
                            if ($krSyllables.$sub) {
                                $matched = $krSyllables.$sub
                                $idx += $len
                                break
                            }
                        }
                    }
                    if ($matched) {
                        $krGiv += $matched
                    } else {
                        $idx++
                    }
                }
                if ($krGiv.Length -ge 1) {
                    return "$krSur$krGiv"
                }
            }
        }
    }

    # 3. Token-by-token translation
    $words = $target -split '\s+'
    $translatedWords = @()
    foreach ($w in $words) {
        $cleanW = $w.Trim('.,"')
        if ($nameTokens.$cleanW) {
            $translatedWords += $nameTokens.$cleanW
        } else {
            $translatedWords += $cleanW
        }
    }

    return ($translatedWords -join " ")
}

Write-Host "Parsing players.csv - players.csv.csv..."
$lines = [System.IO.File]::ReadAllLines("players.csv - players.csv.csv", [System.Text.Encoding]::UTF8)

$clubPlayers = @{}
foreach ($prop in $clubsJson.PSObject.Properties) {
    $clubPlayers[$prop.Name] = [System.Collections.Generic.List[Object]]::new()
}

$count = 0
foreach ($line in $lines) {
    # Parse line
    $fields = [System.Collections.Generic.List[string]]::new()
    $inQuote = $false
    $sb = [System.Text.StringBuilder]::new()
    for ($i = 0; $i -lt $line.Length; $i++) {
        $c = $line[$i]
        if ($c -eq '"') {
            $inQuote = -not $inQuote
        } elseif ($c -eq ',' -and -not $inQuote) {
            $fields.Add($sb.ToString())
            $sb.Clear() | Out-Null
        } else {
            $sb.Append($c) | Out-Null
        }
    }
    $fields.Add($sb.ToString())

    if ($fields.Count -ge 24) {
        $rawClub = $fields[7].Trim('"')
        if ($clubsJson.$rawClub) {
            $playerId = 0
            [int]::TryParse($fields[0], [ref]$playerId) | Out-Null
            $commonName = $fields[1].Trim('"')
            $firstName = $fields[2].Trim('"')
            $lastName = $fields[3].Trim('"')
            
            $ovr = 70
            [int]::TryParse($fields[4], [ref]$ovr) | Out-Null
            $detailPos = $fields[5].Trim('"')
            $rawNat = $fields[9].Trim('"')
            $foot = $fields[11].Trim('"')
            
            $wf = 3
            if ($fields[12]) { [int]::TryParse($fields[12], [ref]$wf) | Out-Null }
            $sm = 3
            if ($fields[13]) { [int]::TryParse($fields[13], [ref]$sm) | Out-Null }

            $birth = $fields[16].Trim('"')
            $traitsRaw = $fields[17].Trim('"')

            $pac = $ovr; if ($fields[18]) { [int]::TryParse($fields[18], [ref]$pac) | Out-Null }
            $sho = $ovr; if ($fields[19]) { [int]::TryParse($fields[19], [ref]$sho) | Out-Null }
            $pas = $ovr; if ($fields[20]) { [int]::TryParse($fields[20], [ref]$pas) | Out-Null }
            $dri = $ovr; if ($fields[21]) { [int]::TryParse($fields[21], [ref]$dri) | Out-Null }
            $def = $ovr; if ($fields[22]) { [int]::TryParse($fields[22], [ref]$def) | Out-Null }
            $phy = $ovr; if ($fields[23]) { [int]::TryParse($fields[23], [ref]$phy) | Out-Null }

            # Position
            $pos = "MF"
            if ($detailPos -eq "GK") { $pos = "GK" }
            elseif ($detailPos -in @("CB", "LB", "RB", "LWB", "RWB")) { $pos = "DF" }
            elseif ($detailPos -in @("CDM", "CM", "CAM", "LM", "RM")) { $pos = "MF" }
            elseif ($detailPos -in @("ST", "CF", "LW", "RW")) { $pos = "FW" }

            # Age
            $birthYear = 2000
            if ($birth -match '^(\d{4})') {
                [int]::TryParse($matches[1], [ref]$birthYear) | Out-Null
            }
            $age = [math]::Max(16, [math]::Min(42, 2026 - $birthYear))

            # Country
            $country = if ($countriesJson.$rawNat) { $countriesJson.$rawNat } else { $rawNat }

            # Name translation
            $isKLeague = ($rawClub -in @("FC Seoul", "Jeonbuk Hyundai", "Ulsan HD FC", "Pohang Steelers", "Gwangju FC", "Gangwon FC", "Daejeon Hana", "Incheon United", "Jeju United", "Gimcheon Sangmu", "FC Anyang", "Bucheon FC 1995")) -or ($rawNat -eq "Korea Republic")
            $krName = Translate-PlayerName $firstName $lastName $commonName $isKLeague

            # Value and Wage
            $baseVal = [math]::Pow($ovr / 70.0, 5.5) * 20.0
            if ($age -le 23) { $baseVal *= 1.35 }
            elseif ($age -ge 33) { $baseVal *= 0.65 }
            $val = [math]::Round([math]::Max(1.0, $baseVal), 1)

            $baseWage = [math]::Pow($ovr / 72.0, 5.0) * 0.8
            if ($age -le 21) { $baseWage *= 1.2 }
            elseif ($age -ge 34) { $baseWage *= 0.75 }
            $wage = [math]::Round([math]::Max(0.1, $baseWage), 2)

            $pot = [math]::Max($ovr, [math]::Min(99, $ovr + [math]::Max(0, 26 - $age) * 2))

            $traitsList = @()
            if ($traitsRaw) {
                $traitsList = ($traitsRaw -split ',\s*') | Where-Object { $_ -and $_.Length -gt 0 }
            }

            $pObj = [PSCustomObject]@{
                name = $krName
                position = $pos
                country = $country
                age = $age
                rating = $ovr
                playerid = $playerId
                detailPosition = $detailPos
                potential = $pot
                value = $val
                weeklyWage = $wage
                preferredFoot = $foot
                weakFoot = $wf
                skillMoves = $sm
                attributes = [PSCustomObject]@{
                    pace = $pac
                    shooting = $sho
                    passing = $pas
                    dribbling = $dri
                    defending = $def
                    physical = $phy
                }
                traits = $traitsList
            }

            $clubPlayers[$rawClub].Add($pObj)
            $count++
        }
    }
}

Write-Host "Processed $count players for Tier-1 clubs."

# Save players JSON for next step
$jsonOut = ConvertTo-Json -InputObject $clubPlayers -Depth 6
[System.IO.File]::WriteAllText("tier1_parsed_players.json", $jsonOut, [System.Text.Encoding]::UTF8)
Write-Host "tier1_parsed_players.json saved."
