# check_bottom.ps1
$utf8 = [System.Text.Encoding]::UTF8
$old = [System.IO.File]::ReadAllText("easyfmm_backup_initial\teamsData.js", $utf8)
$iconIdx = $old.IndexOf("iconPlayersList")
if ($iconIdx -gt 0) {
    Write-Host "iconPlayersList is at $iconIdx"
    Write-Host ($old.Substring($iconIdx, [math]::Min(1500, $old.Length - $iconIdx)))
} else {
    Write-Host "iconPlayersList not found"
}

