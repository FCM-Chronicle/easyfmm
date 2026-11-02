# find_son.ps1
$utf8 = [System.Text.Encoding]::UTF8
$old = [System.IO.File]::ReadAllText("easyfmm_backup_initial\teamsData.js", $utf8)
$hasSon = $old.Contains("Son Heung Min") -or $old.Contains("손흥민")
Write-Host "Old backup has Son Heung Min: $hasSon"
if ($hasSon) {
    $idx = $old.IndexOf("손흥민")
    if ($idx -lt 0) { $idx = $old.IndexOf("Son Heung Min") }
    $chunk = $old.Substring([math]::Max(0, $idx - 80), 200)
    Write-Host $chunk
}

