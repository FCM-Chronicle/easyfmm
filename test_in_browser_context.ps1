# test_in_browser_context.ps1
$utf8 = [System.Text.Encoding]::UTF8
$html = [System.IO.File]::ReadAllText("easyfmm\test_runner.html", $utf8)
Write-Host "test_runner.html length: $($html.Length)"

