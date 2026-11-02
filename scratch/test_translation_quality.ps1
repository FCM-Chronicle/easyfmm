# scratch/test_translation_quality.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$clubs = [System.IO.File]::ReadAllText("tier1_clubs.json", $utf8NoBom) | ConvertFrom-Json
$knownNames = [System.IO.File]::ReadAllText("tier1_known_names.json", $utf8NoBom) | ConvertFrom-Json
$nameData = [System.IO.File]::ReadAllText("korean_names_data.json", $utf8NoBom) | ConvertFrom-Json

# Check how Gudmundsson is handled
Write-Host "knownNames Gudmundsson: $($knownNames.Gudmundsson)"
Write-Host "firstNames Albert: $($nameData.firstNames.Albert)"
Write-Host "surnames Gudmundsson: $($nameData.surnames.Gudmundsson)"

