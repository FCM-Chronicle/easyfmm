# rating_distribution.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$players = [System.IO.File]::ReadAllText("all_tier1_extracted_players.json", $utf8NoBom) | ConvertFrom-Json

$ge80 = ($players | Where-Object { $_.ovr -ge 80 }).Count
$ge75 = ($players | Where-Object { $_.ovr -ge 75 -and $_.ovr -lt 80 }).Count
$ge70 = ($players | Where-Object { $_.ovr -ge 70 -and $_.ovr -lt 75 }).Count
$lt70 = ($players | Where-Object { $_.ovr -lt 70 }).Count

Write-Host "Rating >= 80: $ge80"
Write-Host "Rating 75-79: $ge75"
Write-Host "Rating 70-74: $ge70"
Write-Host "Rating < 70: $lt70"

