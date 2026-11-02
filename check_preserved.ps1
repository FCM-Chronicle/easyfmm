$content = [System.IO.File]::ReadAllText("./easyfmm_backup_initial/teamsData.js", [System.Text.Encoding]::UTF8)

# Check existence of untouched teams in backup
$targets = @("아르헨티나_연합", "미국_연합", "멕시코_연합", "브라질_연합", "알_힐랄", "알_이티하드", "알_나스르", "셀틱")
foreach ($t in $targets) {
    if ($content -match "`"$t`":\s*\{") {
        Write-Host "Found preserved team: $t"
    } else {
        Write-Host "Not found: $t"
    }
}

