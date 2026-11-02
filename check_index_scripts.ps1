# check_index_scripts.ps1
$utf8 = [System.Text.Encoding]::UTF8
$idx = [System.IO.File]::ReadAllText("easyfmm\index.html", $utf8)
$scriptTags = [regex]::Matches($idx, '<script[^>]*src="([^"]+)"')
foreach ($s in $scriptTags) {
    Write-Host "Script: $($s.Groups[1].Value)"
}

