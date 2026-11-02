# find_missing_tokens.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json
$knownNames = [System.IO.File]::ReadAllText("tier1_known_names.json", $utf8NoBom) | ConvertFrom-Json

$fn = $nameData.firstNames
$sn = $nameData.surnames
$ks = $nameData.koreanSyllables

$missingTokens = @{}

foreach ($p in $players) {
    if ($knownNames.PSObject.Properties[$p.rawName]) { continue }
    
    $words = $p.rawName -split "[\s\-]+"
    foreach ($w in $words) {
        $clean = $w.Trim().Trim(".,'`"")
        if ([string]::IsNullOrWhiteSpace($clean)) { continue }
        if ($clean -match "[\uAC00-\uD7A3]") { continue }
        
        $hasFn = $fn.PSObject.Properties[$clean]
        $hasSn = $sn.PSObject.Properties[$clean]
        $hasKs = $ks.PSObject.Properties[$clean.ToLower()]
        $hasKn = $knownNames.PSObject.Properties[$clean]
        
        if (-not ($hasFn -or $hasSn -or $hasKs -or $hasKn)) {
            if (-not $missingTokens.ContainsKey($clean)) { $missingTokens[$clean] = 0 }
            $missingTokens[$clean]++
        }
    }
}

Write-Host "Missing unique tokens: $($missingTokens.Keys.Count)"

# Sort missing tokens by frequency
$sorted = $missingTokens.GetEnumerator() | Sort-Object -Property Value -Descending | Select-Object -First 50

Write-Host "`nTop 50 missing tokens by frequency:"
foreach ($item in $sorted) {
    Write-Host "$($item.Key) ($($item.Value))"
}

