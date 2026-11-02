# scratch/check_chelsea.ps1
$txt = [System.IO.File]::ReadAllText("easyfmm\teamsData.js")
$idx = $txt.IndexOf('"첼시": {')
Write-Host "Chelsea Idx: $idx"
if ($idx -gt 0) {
    $end = $txt.IndexOf('    },', $idx)
    Write-Host $txt.Substring($idx, [Math]::Min(3000, $end - $idx + 6))
}

