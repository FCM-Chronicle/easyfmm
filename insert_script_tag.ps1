$path = "./easyfmm/index.html"
$content = [System.IO.File]::ReadAllText($path, [System.Text.Encoding]::UTF8)

if ($content -notmatch 'leagueManager\.js') {
    $target = '<script src="teamsData.js"></script>'
    $replacement = "<script src=`"teamsData.js`"></script>`r`n    <script src=`"leagueManager.js`"></script>"
    $content = $content.Replace($target, $replacement)
    [System.IO.File]::WriteAllText($path, $content, [System.Text.Encoding]::UTF8)
    Write-Host "Added leagueManager.js script tag to index.html"
} else {
    Write-Host "leagueManager.js already in index.html"
}

