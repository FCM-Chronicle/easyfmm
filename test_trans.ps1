[Console]::OutputEncoding = [System.Text.Encoding]::UTF8

# Test name translator on famous and typical names
$dict = @{
    "Haaland" = "홀란드"; "De Bruyne" = "더브라위너"; "Bellingham" = "벨링엄"; "Mbappé" = "음바페"; "Mbappe" = "음바페"
    "Vinícius" = "비니시우스"; "Vinicius" = "비니시우스"; "Rodri" = "로드리"; "Saka" = "사카"; "Salah" = "살라"
    "van Dijk" = "반 다이크"; "Alisson" = "알리송"; "Courtois" = "쿠르투아"; "Gavi" = "가비"; "Pedri" = "페드리"
    "Yamal" = "야말"; "Musiala" = "무시알라"; "Wirtz" = "비르츠"; "Kane" = "케인"; "Son" = "손흥민"
    "Foden" = "포든"; "Gündoğan" = "귄도안"; "Bernardo" = "베르나르두"; "Dias" = "디아스"; "Saliba" = "살리바"
    "Rice" = "라이스"; "Odegaard" = "외데고르"; "Ødegaard" = "외데고르"; "Bruno" = "브루누"; "Fernandes" = "페르난데스"
    "Son Heung Min" = "손흥민"; "Kim Min Jae" = "김민재"; "Lee Kang In" = "이강인"; "Hwang Hee Chan" = "황희찬"
}

Write-Output "Translation dictionary loaded with $($dict.Count) test entries."

