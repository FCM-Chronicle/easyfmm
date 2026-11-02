# inspect_fiorentina.ps1
$utf8 = [System.Text.Encoding]::UTF8
$players = [System.IO.File]::ReadAllText("league_serie_a.json", $utf8) | ConvertFrom-Json

$fio = $players | Where-Object { $_.club -eq "Fiorentina" } | Sort-Object -Property ovr -Descending

Write-Host "Fiorentina players ($($fio.Count)):"
foreach ($p in $fio) {
    Write-Host "$($p.id) | $($p.rawName) | $($p.country) | $($p.ovr)"
}

