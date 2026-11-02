# find_wasm.ps1
$js = [System.IO.File]::ReadAllText("main.adfeb125.js", [System.Text.Encoding]::UTF8)
$matches = [regex]::Matches($js, '[a-zA-Z0-9_\-\.\/]+\.wasm')
foreach ($m in $matches) {
    Write-Host $m.Value
}

