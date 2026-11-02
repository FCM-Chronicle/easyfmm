# test_kleague_conversion.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("league_kleague_1.json", $utf8) | ConvertFrom-Json
$syl = [System.IO.File]::ReadAllText("korean_syllables_complete.json", $utf8) | ConvertFrom-Json

$success = 0
$failed = @()

foreach ($p in $players) {
    if ($p.country -notin @("Korea Republic", "South Korea", "Korea DPR")) { continue }
    
    $cleanName = [regex]::Replace($p.rawName, "([a-z])([A-Z])", '$1 $2')
    $parts = $cleanName.ToLower() -split "[\s\-]+"
    $kName = ""
    $allMatched = $true
    
    foreach ($part in $parts) {
        if ($syl.PSObject.Properties[$part]) {
            $kName += $syl.$part
        } else {
            $allMatched = $false
            break
        }
    }
    
    if ($allMatched -and $kName.Length -ge 2) {
        $success++
    } else {
        $failed += $p.rawName
    }
}

Write-Host "Korean players tested: $($success + $failed.Count)"
Write-Host "Success: $success"
Write-Host "Failed: $($failed.Count)"
if ($failed.Count -gt 0) {
    Write-Host "Failed names:"
    foreach ($f in $failed) {
        Write-Host " - $f"
    }
}
