# analyze_names.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json
$nameSet = New-Object "System.Collections.Generic.HashSet[string]"
$tokenSet = New-Object "System.Collections.Generic.HashSet[string]"

foreach ($p in $players) {
    [void]$nameSet.Add($p.rawName)
    $words = $p.rawName -split "\s+"
    foreach ($w in $words) {
        $clean = $w.Trim().Trim(".,")
        if (-not [string]::IsNullOrWhiteSpace($clean)) {
            [void]$tokenSet.Add($clean)
        }
    }
}

Write-Host "Total unique full names: $($nameSet.Count)"
Write-Host "Total unique word tokens: $($tokenSet.Count)"

