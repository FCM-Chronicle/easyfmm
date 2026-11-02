# patch_facup.ps1
$utf8 = [System.Text.Encoding]::UTF8
$faPath = "easyfmm\faCupSystem.js"
$content = [System.IO.File]::ReadAllText($faPath, $utf8)

$target = "            const r1Winners = (cup.bracket['R1'] || []).map(m => m.winner || m.home);
            const all32 = shuffle([...cup.seedTeams, ...r1Winners]);"

$replace = "            const r1Winners = (cup.bracket['R1'] || []).map(m => m.winner || m.home);
            let pool = [...cup.seedTeams, ...r1Winners];
            if (pool.length > 32) {
                const uTeam = (typeof gameData !== 'undefined') ? gameData.selectedTeam : null;
                const poolNoUser = pool.filter(t => t !== uTeam);
                pool = uTeam ? [uTeam, ...shuffle(poolNoUser).slice(0, 31)] : shuffle(pool).slice(0, 32);
            }
            const all32 = shuffle(pool);"

$content = $content.Replace($target.Replace("`r`n", "`n"), $replace.Replace("`r`n", "`n"))
$content = $content.Replace($target.Replace("`n", "`r`n"), $replace.Replace("`n", "`r`n"))

[System.IO.File]::WriteAllText($faPath, $content, $utf8)
Write-Host "faCupSystem.js patched successfully."

