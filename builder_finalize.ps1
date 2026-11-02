$ErrorActionPreference = "Stop"

function Load-JsonFile($path) {
    $content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)
    return ($content | ConvertFrom-Json)
}

$clubsJson = Load-JsonFile "tier1_clubs.json"
$parsedPlayers = Load-JsonFile "tier1_parsed_players.json"
$preservedList = Load-JsonFile "preserved_teams.json"

Write-Host "Extracting preserved teams and icon players from backup..."
$backupContent = [System.IO.File]::ReadAllText("./easyfmm_backup_initial/teamsData.js", [System.Text.Encoding]::UTF8)

# Extract iconPlayersList section
$iconSection = ""
if ($backupContent -match '(?ms)(const iconPlayersList\s*=\s*\[.*?\];)') {
    $iconSection = $matches[1]
    Write-Host "Found iconPlayersList in backup."
}

# Extract preserved clubs text from backup
$preservedClubBlocks = @{}
foreach ($teamKey in $preservedList) {
    $pattern = '(?ms)("' + [regex]::Escape($teamKey) + '"\s*:\s*\{.*?description\s*:\s*"[^"]*"\s*\})'
    if ($backupContent -match $pattern) {
        $preservedClubBlocks[$teamKey] = $matches[1]
        Write-Host "Extracted preserved team: $teamKey"
    } else {
        Write-Host "Could not match block for $teamKey using regex"
    }
}

Write-Host "Assembling 162 Tier-1 clubs..."
$sb = [System.Text.StringBuilder]::new()
$sb.AppendLine('// easyfmm - FC 27 Real Football World (162 Clubs)') | Out-Null
$sb.AppendLine('const allTeams = {') | Out-Null

$clubIndex = 0

foreach ($prop in $clubsJson.PSObject.Properties) {
    $rawClub = $prop.Name
    $meta = $prop.Value
    $teamKey = $meta.key
    $players = $parsedPlayers.$rawClub

    # Check position balances
    $gkCount = 0; $dfCount = 0; $mfCount = 0; $fwCount = 0
    foreach ($p in $players) {
        if ($p.position -eq "GK") { $gkCount++ }
        elseif ($p.position -eq "DF") { $dfCount++ }
        elseif ($p.position -eq "MF") { $mfCount++ }
        elseif ($p.position -eq "FW") { $fwCount++ }
    }

    # Auto-balance if missing essential positions
    if ($gkCount -lt 1) {
        $players += [PSCustomObject]@{
            name = "$($meta.name) GK"; position = "GK"; country = $meta.country; age = 19; rating = 65
            playerid = 900000 + $clubIndex; detailPosition = "GK"; potential = 78; value = 5.0; weeklyWage = 0.2
            preferredFoot = "Right"; weakFoot = 3; skillMoves = 1
            attributes = [PSCustomObject]@{ pace = 60; shooting = 20; passing = 55; dribbling = 50; defending = 30; physical = 65 }
            traits = @()
        }
        $gkCount++
    }
    if ($dfCount -lt 4) {
        for ($i = $dfCount; $i -lt 4; $i++) {
            $players += [PSCustomObject]@{
                name = "$($meta.name) DF $($i+1)"; position = "DF"; country = $meta.country; age = 20; rating = 66
                playerid = 910000 + ($clubIndex * 10) + $i; detailPosition = "CB"; potential = 77; value = 6.0; weeklyWage = 0.25
                preferredFoot = "Right"; weakFoot = 3; skillMoves = 2
                attributes = [PSCustomObject]@{ pace = 65; shooting = 35; passing = 60; dribbling = 55; defending = 67; physical = 70 }
                traits = @()
            }
        }
    }
    if ($mfCount -lt 3) {
        for ($i = $mfCount; $i -lt 3; $i++) {
            $players += [PSCustomObject]@{
                name = "$($meta.name) MF $($i+1)"; position = "MF"; country = $meta.country; age = 20; rating = 67
                playerid = 920000 + ($clubIndex * 10) + $i; detailPosition = "CM"; potential = 78; value = 8.0; weeklyWage = 0.3
                preferredFoot = "Right"; weakFoot = 3; skillMoves = 3
                attributes = [PSCustomObject]@{ pace = 68; shooting = 62; passing = 68; dribbling = 67; defending = 58; physical = 64 }
                traits = @()
            }
        }
    }
    if ($fwCount -lt 3) {
        for ($i = $fwCount; $i -lt 3; $i++) {
            $players += [PSCustomObject]@{
                name = "$($meta.name) FW $($i+1)"; position = "FW"; country = $meta.country; age = 20; rating = 68
                playerid = 930000 + ($clubIndex * 10) + $i; detailPosition = "ST"; potential = 80; value = 10.0; weeklyWage = 0.35
                preferredFoot = "Right"; weakFoot = 3; skillMoves = 3
                attributes = [PSCustomObject]@{ pace = 74; shooting = 69; passing = 60; dribbling = 68; defending = 32; physical = 66 }
                traits = @()
            }
        }
    }

    # Write club header
    $sb.AppendLine("    `"$teamKey`": {") | Out-Null
    $sb.AppendLine("        displayName: `"$($meta.name)`",") | Out-Null
    $sb.AppendLine("        city: `"$($meta.city)`",") | Out-Null
    $sb.AppendLine("        country: `"$($meta.country)`",") | Out-Null
    $sb.AppendLine("        leagueId: `"$($meta.leagueId)`",") | Out-Null
    $sb.AppendLine("        league: 1,") | Out-Null
    $sb.AppendLine("        logoCode: `"$($meta.logo)`",") | Out-Null
    $sb.AppendLine("        budget: $($meta.budget),") | Out-Null
    $sb.AppendLine("        clubValue: $($meta.val),") | Out-Null
    $sb.AppendLine("        stadium: { name: `"$($meta.stName)`", capacity: $($meta.stCap) },") | Out-Null
    $sb.AppendLine("        description: `"$($meta.country) $($meta.name)`",") | Out-Null
    $sb.AppendLine("        players: [") | Out-Null

    # Write players
    for ($pIdx = 0; $pIdx -lt $players.Count; $pIdx++) {
        $p = $players[$pIdx]
        $attrStr = "{ pace: $($p.attributes.pace), shooting: $($p.attributes.shooting), passing: $($p.attributes.passing), dribbling: $($p.attributes.dribbling), defending: $($p.attributes.defending), physical: $($p.attributes.physical) }"
        $traitsJson = ConvertTo-Json -InputObject $p.traits -Compress

        $pLine = "            { name: `"$($p.name)`", position: `"$($p.position)`", country: `"$($p.country)`", age: $($p.age), rating: $($p.rating), playerid: $($p.playerid), detailPosition: `"$($p.detailPosition)`", potential: $($p.potential), value: $($p.value), weeklyWage: $($p.weeklyWage), preferredFoot: `"$($p.preferredFoot)`", weakFoot: $($p.weakFoot), skillMoves: $($p.skillMoves), attributes: $attrStr, traits: $traitsJson },"
        $sb.AppendLine($pLine) | Out-Null
    }

    $sb.AppendLine("        ]") | Out-Null
    $sb.AppendLine("    },") | Out-Null

    $clubIndex++
}

# Append Preserved Teams
$sb.AppendLine('    // === Preserved Teams ===') | Out-Null
foreach ($teamKey in $preservedClubBlocks.Keys) {
    $sb.AppendLine("    " + $preservedClubBlocks[$teamKey] + ",") | Out-Null
}

$sb.AppendLine('};') | Out-Null
$sb.AppendLine('') | Out-Null

# Append icon players list if found
if ($iconSection) {
    $sb.AppendLine($iconSection.Trim()) | Out-Null
} else {
    $sb.AppendLine('const iconPlayersList = [];') | Out-Null
}

$sb.AppendLine('') | Out-Null
$sb.AppendLine('// Legacy teams compatibility mapping') | Out-Null
$sb.AppendLine('const teams = (() => {') | Out-Null
$sb.AppendLine('    const convertedTeams = {};') | Out-Null
$sb.AppendLine('    Object.keys(allTeams).forEach(teamName => {') | Out-Null
$sb.AppendLine('        convertedTeams[teamName] = allTeams[teamName].players;') | Out-Null
$sb.AppendLine('    });') | Out-Null
$sb.AppendLine('    return convertedTeams;') | Out-Null
$sb.AppendLine('})();') | Out-Null

[System.IO.File]::WriteAllText("./easyfmm/teamsData.js", $sb.ToString(), [System.Text.Encoding]::UTF8)
Write-Host "Successfully generated ./easyfmm/teamsData.js!"
