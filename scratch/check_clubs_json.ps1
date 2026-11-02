# scratch/check_clubs_json.ps1
$txt = [System.IO.File]::ReadAllText("tier1_clubs.json")
$clubs = $txt | ConvertFrom-Json
foreach ($p in $clubs.PSObject.Properties) {
    if ($p.Name -match "Chelsea" -or $p.Value.name -match "첼시" -or $p.Value.key -match "첼시") {
        Write-Host "Found Chelsea property: $($p.Name) -> key: $($p.Value.key), name: $($p.Value.name)"
    }
}

