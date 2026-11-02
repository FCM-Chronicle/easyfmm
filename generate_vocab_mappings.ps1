# generate_vocab_mappings.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8) | ConvertFrom-Json

$firstNames = @{}
$lastNames = @{}

foreach ($p in $players) {
    if (-not [string]::IsNullOrWhiteSpace($p.firstName)) {
        $fn = $p.firstName.Trim()
        if (-not $firstNames.ContainsKey($fn)) { $firstNames[$fn] = 0 }
        $firstNames[$fn]++
    }
    if (-not [string]::IsNullOrWhiteSpace($p.lastName)) {
        $ln = $p.lastName.Trim()
        if (-not $lastNames.ContainsKey($ln)) { $lastNames[$ln] = 0 }
        $lastNames[$ln]++
    }
}

Write-Host "Unique First Names in Tier 1: $($firstNames.Keys.Count)"
Write-Host "Unique Last Names in Tier 1: $($lastNames.Keys.Count)"

