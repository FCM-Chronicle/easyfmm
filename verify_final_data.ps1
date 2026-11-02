# verify_final_data.ps1 - Pure ASCII Script
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
$vData = [System.IO.File]::ReadAllText("verify_targets.json", $utf8) | ConvertFrom-Json

Write-Host "=== VERIFYING FINAL teamsData.js ==="

# Check UTF-8 BOM
$bytes = [System.IO.File]::ReadAllBytes("easyfmm\teamsData.js")
$hasBom = ($bytes[0] -eq 0xEF -and $bytes[1] -eq 0xBB -and $bytes[2] -eq 0xBF)
Write-Host "UTF-8 BOM Present: $hasBom"

# Check targets
Write-Host "`nTarget Player Verification:"
$allTargetsOk = $true
foreach ($name in $vData.targets) {
    $found = $td.Contains($name)
    if (-not $found) { $allTargetsOk = $false }
    Write-Host " - $name : $(if ($found) { 'OK' } else { 'FAIL' })"
}

# Check banned strings
Write-Host "`nBanned Weird String Check:"
$anyBannedFound = $false
foreach ($b in $vData.banned) {
    $found = $td.Contains($b)
    if ($found) { $anyBannedFound = $true }
    Write-Host " - $b : $(if ($found) { 'DETECTED (BUG!)' } else { 'CLEAN' })"
}

# Check remaining English letters in player names
$playerMatches = [regex]::Matches($td, 'name:\s*"([^"]+)"')
$englishRemaining = 0
$sampleEnglish = @()

foreach ($m in $playerMatches) {
    $pName = $m.Groups[1].Value
    if ($pName -match "[a-zA-Z]") {
        $englishRemaining++
        if ($sampleEnglish.Count -lt 15) {
            $sampleEnglish += $pName
        }
    }
}

Write-Host "`nTotal Player Entries: $($playerMatches.Count)"
Write-Host "Players with English characters: $englishRemaining"
if ($englishRemaining -gt 0) {
    Write-Host "Sample English names remaining:"
    foreach ($s in $sampleEnglish) {
        Write-Host " * $s"
    }
}

# Verify Chelsea snippet
Write-Host "`nChelsea Players Snippet:"
$chelseaIdx = $td.IndexOf('"chelsea":')
if ($chelseaIdx -lt 0) {
    # Search for Chelsea Korean displayName
    $chelseaIdx = $td.IndexOf('displayName: "첼시"')
}
if ($chelseaIdx -ge 0) {
    $sub = $td.Substring($chelseaIdx, [math]::Min(2500, $td.Length - $chelseaIdx))
    $names = [regex]::Matches($sub, 'name:\s*"([^"]+)"')
    foreach ($n in $names) {
        Write-Host " > $($n.Groups[1].Value)"
    }
}
