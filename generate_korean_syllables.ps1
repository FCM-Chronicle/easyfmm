# generate_korean_syllables.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Comprehensive Korean Syllable Map
$kMap = [ordered]@{
    # Surnames and major syllables
    "kim" = "김"; "gim" = "김"; "lee" = "이"; "yi" = "이"; "rhee" = "이"; "park" = "박"; "bak" = "박"
    "choi" = "최"; "choe" = "최"; "jung" = "정"; "jeong" = "정"; "chung" = "정"; "kang" = "강"; "gang" = "강"
    "cho" = "조"; "jo" = "조"; "yoon" = "윤"; "yun" = "윤"; "jang" = "장"; "chang" = "장"; "lim" = "임"
    "im" = "임"; "rim" = "임"; "han" = "한"; "oh" = "오"; "o" = "오"; "seo" = "서"; "suh" = "서"
    "shin" = "신"; "sin" = "신"; "kwon" = "권"; "gwon" = "권"; "hwang" = "황"; "ahn" = "안"; "an" = "안"
    "song" = "송"; "ryu" = "류"; "yu" = "유"; "yoo" = "유"; "you" = "유"; "hong" = "홍"; "ko" = "고"
    "go" = "고"; "koh" = "고"; "moon" = "문"; "mun" = "문"; "yang" = "양"; "son" = "손"; "sohn" = "손"
    "bae" = "배"; "baek" = "백"; "paik" = "백"; "heo" = "허"; "huh" = "허"; "noh" = "노"; "no" = "노"
    "ro" = "노"; "rho" = "노"; "shim" = "심"; "sim" = "심"; "ha" = "하"; "nam" = "남"; "jeon" = "전"
    "jun" = "전"; "chun" = "전"; "kwak" = "곽"; "gwak" = "곽"; "seong" = "성"; "sung" = "성"; "cha" = "차"
    "joo" = "주"; "ju" = "주"; "woo" = "우"; "wu" = "우"; "koo" = "구"; "gu" = "구"; "goo" = "구"
    "min" = "민"; "jin" = "진"; "hyun" = "현"; "hyeon" = "현"; "hyoun" = "현"; "joon" = "준"; "ho" = "호"
    "young" = "영"; "yeong" = "영"; "tae" = "태"; "hwan" = "환"; "won" = "원"; "jae" = "재"; "sang" = "상"
    "ki" = "기"; "gi" = "기"; "il" = "일"; "kwang" = "광"; "gwang" = "광"; "myung" = "명"; "myeong" = "명"
    "seok" = "석"; "suk" = "석"; "jong" = "종"; "chan" = "찬"; "wook" = "욱"; "uk" = "욱"; "seung" = "승"
    "hoon" = "훈"; "hun" = "훈"; "yeop" = "엽"; "yup" = "엽"; "gyu" = "규"; "kyu" = "규"; "yong" = "용"
    "sik" = "식"; "shik" = "식"; "seop" = "섭"; "sup" = "섭"; "hyeok" = "혁"; "hyuk" = "혁"; "cheol" = "철"
    "chul" = "철"; "soo" = "수"; "su" = "수"; "geon" = "건"; "gun" = "건"; "gyeom" = "겸"; "kyum" = "겸"
    "woong" = "웅"; "ung" = "웅"; "beom" = "범"; "bum" = "범"; "bin" = "빈"; "pyo" = "표"; "heon" = "헌"
    "deok" = "덕"; "duck" = "덕"; "ryul" = "률"; "yul" = "율"; "nak" = "낙"; "ryeol" = "렬"; "yeol" = "열"
    "hee" = "희"; "hye" = "혜"; "hyo" = "효"; "hwi" = "휘"; "sol" = "솔"; "byul" = "별"; "byeol" = "별"
    "seul" = "슬"; "ram" = "람"; "rin" = "린"; "ryeong" = "령"; "yeong" = "영"; "ran" = "란"; "ryeon" = "련"
    "yeon" = "연"; "dong" = "동"; "gyeong" = "경"; "kyung" = "경"; "eun" = "은"; "in" = "인"; "dae" = "대"
    "man" = "만"; "ik" = "익"; "han" = "한"; "hae" = "해"; "jin" = "진"; "bok" = "복"; "geun" = "근"
    "chane" = "찬"; "woon" = "운"; "un" = "운"; "chi" = "치"; "pil" = "필"; "gon" = "곤"; "sam" = "삼"
    "bo" = "보"; "gwan" = "관"; "kwan" = "관"; "joong" = "중"; "jung" = "중"; "chul" = "철"; "won" = "원"
    "yoon" = "윤"; "yun" = "윤"; "sung" = "성"; "seong" = "성"; "byung" = "병"; "byeong" = "병"
    "woong" = "웅"; "ung" = "웅"; "taek" = "택"; "tak" = "탁"; "hyun" = "현"; "hyeon" = "현"
    "hyeok" = "혁"; "hyuk" = "혁"; "kyu" = "규"; "gyu" = "규"; "min" = "민"; "seok" = "석"; "suk" = "석"
    "wook" = "욱"; "uk" = "욱"; "hoon" = "훈"; "hun" = "훈"; "jin" = "진"; "hwan" = "환"; "won" = "원"
    "young" = "영"; "yeong" = "영"; "ho" = "호"; "woo" = "우"; "soo" = "수"; "su" = "수"; "jae" = "재"
    "sang" = "상"; "tae" = "태"; "jun" = "준"; "joon" = "준"; "seung" = "승"; "dong" = "동"
}

$json = ConvertTo-Json -Depth 2 $kMap
[System.IO.File]::WriteAllText("korean_syllables_complete.json", $json, $utf8NoBom)
Write-Host "Generated korean_syllables_complete.json with $($kMap.Keys.Count) syllable rules."

