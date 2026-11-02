# scratch/check_bournemouth.ps1
$txt = [System.IO.File]::ReadAllText("easyfmm\teamsData.js")
$bStart = $txt.IndexOf('"본머스": {')
$bEnd = $txt.IndexOf('    },', $bStart)
Write-Host $txt.Substring($bStart, $bEnd - $bStart + 6)

