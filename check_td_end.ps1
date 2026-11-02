# check_td_end.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)
$iconIdx = $td.IndexOf("iconPlayersList")
if ($iconIdx -gt 0) {
    $endChunk = $td.Substring($iconIdx)
    $lastIdx = [math]::Max(0, $endChunk.Length - 600)
    Write-Host ($endChunk.Substring($lastIdx))
}

