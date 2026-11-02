# scratch/find_chelsea_lines.ps1
$lines = [System.IO.File]::ReadAllLines("easyfmm\teamsData.js")
for ($i = 0; $i -lt $lines.Length; $i++) {
    if ($lines[$i] -match "244067") {
        Write-Host "Lacroix at line: $($i+1)"
        for ($j = [Math]::Max(0, $i - 30); $j -le [Math]::Min($lines.Length - 1, $i + 5); $j++) {
            Write-Host "$($j+1): $($lines[$j])"
        }
        break
    }
}

