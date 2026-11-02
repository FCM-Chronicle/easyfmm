# test_hangulize_url.ps1
$url = "https://hangulize.org/?lang=ita&word=Kean"
$args = "--headless=new --virtual-time-budget=5000 --dump-dom `"$url`""
$p = Start-Process -FilePath "C:\Program Files\Google\Chrome\Application\chrome.exe" -ArgumentList $args -RedirectStandardOutput "out_hangulize.html" -Wait -PassThru

$content = [System.IO.File]::ReadAllText("out_hangulize.html", [System.Text.Encoding]::UTF8)
$m = [regex]::Match($content, 'class="result[^"]*"[^>]*><p>([^<]+)</p>')
if ($m.Success) {
    Write-Host "Success: $($m.Groups[1].Value)"
} else {
    Write-Host "Not found"
}

