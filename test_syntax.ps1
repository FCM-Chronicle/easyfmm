# test_syntax.ps1
$utf8 = [System.Text.Encoding]::UTF8
$td = [System.IO.File]::ReadAllText("easyfmm\teamsData.js", $utf8)

Write-Host "Total length: $($td.Length) characters"

$openBraces = ([regex]::Matches($td, '\{')).Count
$closeBraces = ([regex]::Matches($td, '\}')).Count
$openBrackets = ([regex]::Matches($td, '\[').Count)
$closeBrackets = ([regex]::Matches($td, '\]').Count)

Write-Host "Open braces: $openBraces, Close braces: $closeBraces"
Write-Host "Open brackets: $openBrackets, Close brackets: $closeBrackets"

if ($openBraces -eq $closeBraces -and $openBrackets -eq $closeBrackets) {
    Write-Host "ALL BRACKETS AND BRACES BALANCED!"
} else {
    Write-Host "MISMATCH DETECTED!"
}

