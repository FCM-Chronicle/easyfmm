# check_end.ps1
$utf8 = [System.Text.Encoding]::UTF8
$old = [System.IO.File]::ReadAllText("easyfmm_backup_initial\teamsData.js", $utf8)
$iconIdx = $old.IndexOf("iconPlayersList")
if ($iconIdx -gt 0) {
    $endChunk = $old.Substring($iconIdx)
    $lastIdx = [math]::Max(0, $endChunk.Length - 1000)
    Write-Host ($endChunk.Substring($lastIdx))
}

