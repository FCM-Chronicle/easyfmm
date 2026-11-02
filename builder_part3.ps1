[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

$scriptDir = if ($PSScriptRoot) { $PSScriptRoot } else { "." }
. "$scriptDir\builder_part1.ps1"
. "$scriptDir\builder_part2.ps1"

if (-not $clubMap) {
    Write-Error "Failed to load clubMap from builder_part1.ps1!"
    exit 1
}

Write-Output "Processing players.csv - players.csv.csv..."

# Map of raw club name to list of player objects
$tier1Players = @{}
foreach ($rawClub in $clubMap.Keys) {
    $tier1Players[$rawClub] = @()
}

$lines = Get-Content -Encoding UTF8 "players.csv - players.csv.csv"

$processedCount = 0

foreach ($line in $lines) {
    # Parse CSV fields
    $fields = @()
    $inQuote = $false
    $current = ""
    for ($i = 0; $i -lt $line.Length; $i++) {
        $c = $line[$i]
        if ($c -eq '"') {
            $inQuote = -not $inQuote
        } elseif ($c -eq ',' -and -not $inQuote) {
            $fields += $current
            $current = ""
        } else {
            $current += $c
        }
    }
    $fields += $current

    if ($fields.Count -ge 24) {
        $rawClub = $fields[7].Trim('"')
        if ($clubMap.ContainsKey($rawClub)) {
            $pid = [int]$fields[0]
            $commonName = $fields[1].Trim('"')
            $firstName = $fields[2].Trim('"')
            $lastName = $fields[3].Trim('"')
            $ovr = [int]$fields[4]
            $detailPos = $fields[5].Trim('"')
            $rawNat = $fields[9].Trim('"')
            $foot = $fields[11].Trim('"')
            $wf = if ($fields[12]) { [int]$fields[12] } else { 3 }
            $sm = if ($fields[13]) { [int]$fields[13] } else { 3 }
            $birth = $fields[16].Trim('"')
            $traitsRaw = $fields[17].Trim('"')

            # 6 Face Attributes
            $pac = if ($fields[18]) { [int]$fields[18] } else { $ovr }
            $sho = if ($fields[19]) { [int]$fields[19] } else { $ovr }
            $pas = if ($fields[20]) { [int]$fields[20] } else { $ovr }
            $dri = if ($fields[21]) { [int]$fields[21] } else { $ovr }
            $def = if ($fields[22]) { [int]$fields[22] } else { $ovr }
            $phy = if ($fields[23]) { [int]$fields[23] } else { $ovr }

            # Position mapping
            $pos = "MF"
            if ($detailPos -eq "GK") { $pos = "GK" }
            elseif ($detailPos -in @("CB", "LB", "RB", "LWB", "RWB")) { $pos = "DF" }
            elseif ($detailPos -in @("CDM", "CM", "CAM", "LM", "RM")) { $pos = "MF" }
            elseif ($detailPos -in @("ST", "CF", "LW", "RW")) { $pos = "FW" }

            # Age calculation (Season 2025/2026)
            $birthYear = 2000
            if ($birth -match '^(\d{4})') {
                $birthYear = [int]$matches[1]
            }
            $age = [math]::Max(16, [math]::Min(42, 2026 - $birthYear))

            # Country translation
            $country = if ($countryMap.ContainsKey($rawNat)) { $countryMap[$rawNat] } else { $rawNat }

            # Player Name translation
            $krName = $null
            if ($rawNat -eq "Korea Republic" -or $rawClub -in @("FC Seoul", "Jeonbuk Hyundai", "Ulsan HD FC", "Pohang Steelers", "Gwangju FC", "Gangwon FC", "Daejeon Hana", "Incheon United", "Jeju United", "Gimcheon Sangmu", "FC Anyang", "Bucheon FC 1995")) {
                $krName = Translate-KoreanName $firstName $lastName $commonName
            }

            if (-not $krName) {
                $displayNameRaw = if ($commonName) { $commonName } elseif ($firstName -and $lastName) { "$firstName $lastName" } elseif ($lastName) { $lastName } else { $firstName }
                $krName = Transliterate-GeneralName $displayNameRaw
            }

            if (-not $krName -or $krName.Trim().Length -eq 0) {
                $krName = "선수 $pid"
            }

            # Economic values (억 원 단위)
            # Market value: power curve based on rating & age
            $baseVal = [math]::Pow($ovr / 70.0, 5.5) * 20.0
            if ($age -le 23) { $baseVal *= 1.35 }
            elseif ($age -ge 33) { $baseVal *= 0.65 }
            $val = [math]::Round([math]::Max(1.0, $baseVal), 1)

            # Weekly wage:
            $baseWage = [math]::Pow($ovr / 72.0, 5.0) * 0.8
            if ($age -le 21) { $baseWage *= 1.2 }
            elseif ($age -ge 34) { $baseWage *= 0.75 }
            $wage = [math]::Round([math]::Max(0.1, $baseWage), 2)

            # Potential
            $pot = [math]::Max($ovr, [math]::Min(99, $ovr + [math]::Max(0, 26 - $age) * 2))

            # Traits array
            $traits = @()
            if ($traitsRaw) {
                $traits = ($traitsRaw -split ',\s*') | Where-Object { $_ -and $_.Length -gt 0 }
            }

            $pObj = @{
                name = $krName
                position = $pos
                country = $country
                age = $age
                rating = $ovr
                playerid = $pid
                detailPosition = $detailPos
                potential = $pot
                value = $val
                weeklyWage = $wage
                preferredFoot = $foot
                weakFoot = $wf
                skillMoves = $sm
                attributes = @{
                    pace = $pac
                    shooting = $sho
                    passing = $pas
                    dribbling = $dri
                    defending = $def
                    physical = $phy
                }
                traits = $traits
            }

            $tier1Players[$rawClub] += $pObj
            $processedCount++
        }
    }
}

Write-Output "Successfully processed $processedCount players across $($clubMap.Count) Tier-1 clubs."
