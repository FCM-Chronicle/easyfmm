$b = [System.IO.File]::ReadAllBytes('easyfmm\teamsData.js')
Write-Host "teamsData bytes: $($b[0]) $($b[1]) $($b[2])"
$b_sc = [System.IO.File]::ReadAllBytes('easyfmm\script.js')
Write-Host "script bytes: $($b_sc[0]) $($b_sc[1]) $($b_sc[2])"
$b_tac = [System.IO.File]::ReadAllBytes('easyfmm\tacticSystem.js')
Write-Host "tacticSystem bytes: $($b_tac[0]) $($b_tac[1]) $($b_tac[2])"

