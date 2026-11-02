# scratch/test_improved_transliterator.ps1
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)

# Define robust transliteration rules
function ModernTransliterate($word) {
    if ([string]::IsNullOrWhiteSpace($word)) { return "" }
    $w = $word.Normalize([System.Text.NormalizationForm]::FormD)
    $sb = New-Object System.Text.StringBuilder
    for ($i = 0; $i -lt $w.Length; $i++) {
        $c = $w[$i]
        $cat = [System.Globalization.CharUnicodeInfo]::GetUnicodeCategory($c)
        if ($cat -ne [System.Globalization.UnicodeCategory]::NonSpacingMark) {
            [void]$sb.Append($c)
        }
    }
    $w = $sb.ToString().ToLower()

    # Pre-replacements for multi-char European phonemes
    $multi = [ordered]@{
        "gudmundsson" = "구드문드손"
        "gudmunds" = "구드문즈"
        "sson" = "손"
        "mund" = "문드"
        "berg" = "베르크"
        "burg" = "부르크"
        "bert" = "베르트"
        "ford" = "포드"
        "field" = "필드"
        "wood" = "우드"
        "stein" = "슈타인"
        "mann" = "만"
        "mont" = "몬트"
        "ville" = "빌"
        "bridge" = "브리지"
        "stone" = "스톤"
        "land" = "란트"
        "lund" = "룬드"
        "ovic" = "오비치"
        "evic" = "에비치"
        "ic" = "이치"
        "vic" = "비치"
        "sky" = "스키"
        "ski" = "스키"
        "sen" = "센"
        "son" = "손"
        "inho" = "이뉴"
        "inha" = "이냐"
        "sch" = "슈"
        "ch" = "치"
        "sh" = "시"
        "ph" = "프"
        "th" = "트"
        "ck" = "크"
        "qu" = "콰"
    }

    # Syllables with codas (받침)
    $syllablesWithCoda = [ordered]@{
        # 3-char + Coda combinations
        "al" = "알"; "el" = "엘"; "il" = "일"; "ol" = "올"; "ul" = "울"
        "an" = "안"; "en" = "엔"; "in" = "인"; "on" = "온"; "un" = "운"
        "am" = "암"; "em" = "엠"; "im" = "임"; "om" = "옴"; "um" = "움"
        "ar" = "아르"; "er" = "에르"; "ir" = "이르"; "or" = "오르"; "ur" = "우르"
        "ang" = "앙"; "eng" = "엥"; "ing" = "잉"; "ong" = "옹"; "ung" = "웅"

        # B + Vowel + Coda
        "ban" = "반"; "ben" = "벤"; "bin" = "빈"; "bon" = "본"; "bun" = "분"
        "bal" = "발"; "bel" = "벨"; "bil" = "빌"; "bol" = "볼"; "bul" = "불"
        "bam" = "밤"; "bem" = "벰"; "bim" = "빔"; "bom" = "봄"; "bum" = "붐"
        "bar" = "바르"; "ber" = "베르"; "bir" = "비르"; "bor" = "보르"; "bur" = "부르"
        "bang" = "방"; "beng" = "벵"; "bing" = "빙"; "bong" = "봉"; "bung" = "붕"

        # C / K + Vowel + Coda
        "can" = "칸"; "cen" = "센"; "cin" = "신"; "con" = "콘"; "cun" = "쿤"
        "cal" = "칼"; "cel" = "셀"; "cil" = "실"; "col" = "콜"; "cul" = "쿨"
        "cam" = "캄"; "cem" = "셈"; "cim" = "심"; "com" = "콤"; "cum" = "쿰"
        "car" = "카르"; "cer" = "세르"; "cir" = "시르"; "cor" = "코르"; "cur" = "쿠르"
        "cang" = "캉"; "kang" = "캉"; "king" = "킹"; "kong" = "콩"
        "kan" = "칸"; "ken" = "켄"; "kin" = "킨"; "kon" = "콘"; "kun" = "쿤"
        "kal" = "칼"; "kel" = "켈"; "kil" = "킬"; "kol" = "콜"; "kul" = "쿨"
        "kam" = "캄"; "kem" = "켐"; "kim" = "킴"; "kom" = "콤"; "kum" = "쿰"
        "kar" = "카르"; "ker" = "케르"; "kir" = "키르"; "kor" = "코르"; "kur" = "쿠르"

        # D + Vowel + Coda
        "dan" = "단"; "den" = "덴"; "din" = "딘"; "don" = "돈"; "dun" = "둔"
        "dal" = "달"; "del" = "델"; "dil" = "딜"; "dol" = "돌"; "dul" = "둘"
        "dam" = "담"; "dem" = "뎀"; "dim" = "딤"; "dom" = "돔"; "dum" = "둠"
        "dar" = "다르"; "der" = "데르"; "dir" = "디르"; "dor" = "도르"; "dur" = "두르"
        "dang" = "당"; "deng" = "뎅"; "ding" = "딩"; "dong" = "동"; "dung" = "둥"

        # F + Vowel + Coda
        "fan" = "판"; "fen" = "펜"; "fin" = "핀"; "fon" = "폰"; "fun" = "푼"
        "fal" = "팔"; "fel" = "펠"; "fil" = "필"; "fol" = "폴"; "ful" = "풀"
        "fam" = "팜"; "fem" = "펨"; "fim" = "핌"; "fom" = "폼"; "fum" = "품"
        "far" = "파르"; "fer" = "페르"; "fir" = "피르"; "for" = "포르"; "fur" = "푸르"
        "fang" = "팡"; "feng" = "펭"; "fing" = "핑"; "fong" = "퐁"; "fung" = "풍"

        # G + Vowel + Coda
        "gan" = "간"; "gen" = "겐"; "gin" = "긴"; "gon" = "곤"; "gun" = "군"
        "gal" = "갈"; "gel" = "겔"; "gil" = "길"; "gol" = "골"; "gul" = "굴"
        "gam" = "감"; "gem" = "겜"; "gim" = "김"; "gom" = "곰"; "gum" = "굼"
        "gar" = "가르"; "ger" = "게르"; "gir" = "기르"; "gor" = "고르"; "gur" = "구르"
        "gang" = "강"; "geng" = "겡"; "ging" = "깅"; "gong" = "공"; "gung" = "궁"

        # H + Vowel + Coda
        "han" = "한"; "hen" = "헨"; "hin" = "힌"; "hon" = "혼"; "hun" = "훈"
        "hal" = "할"; "hel" = "헬"; "hil" = "힐"; "hol" = "홀"; "hul" = "훌"
        "ham" = "함"; "hem" = "헴"; "him" = "힘"; "hom" = "홈"; "hum" = "훔"
        "har" = "하르"; "her" = "헤르"; "hir" = "히르"; "hor" = "호르"; "hur" = "후르"
        "hang" = "항"; "heng" = "헹"; "hing" = "힝"; "hong" = "홍"; "hung" = "훙"

        # J + Vowel + Coda
        "jan" = "얀"; "jen" = "옌"; "jin" = "진"; "jon" = "욘"; "jun" = "준"
        "jal" = "얄"; "jel" = "옐"; "jil" = "질"; "jol" = "욜"; "jul" = "율"

        # L + Vowel + Coda
        "lan" = "란"; "len" = "렌"; "lin" = "린"; "lon" = "론"; "lun" = "룬"
        "lal" = "랄"; "lel" = "렐"; "lil" = "릴"; "lol" = "롤"; "lul" = "룰"
        "lam" = "람"; "lem" = "렘"; "lim" = "림"; "lom" = "롬"; "lum" = "룸"
        "lar" = "라르"; "ler" = "레르"; "lir" = "리르"; "lor" = "로르"; "lur" = "루르"
        "lang" = "랑"; "leng" = "렝"; "ling" = "링"; "long" = "롱"; "lung" = "룽"

        # M + Vowel + Coda
        "man" = "만"; "men" = "멘"; "min" = "민"; "mon" = "몬"; "mun" = "문"
        "mal" = "말"; "mel" = "멜"; "mil" = "밀"; "mol" = "몰"; "mul" = "물"
        "mam" = "맘"; "mem" = "멤"; "mim" = "밈"; "mom" = "몸"; "mum" = "뭄"
        "mar" = "마르"; "mer" = "메르"; "mir" = "미르"; "mor" = "모르"; "mur" = "무르"
        "mang" = "망"; "meng" = "멩"; "ming" = "밍"; "mong" = "몽"; "mung" = "뭉"

        # N + Vowel + Coda
        "nan" = "난"; "nen" = "넨"; "nin" = "닌"; "non" = "논"; "nun" = "눈"
        "nal" = "날"; "nel" = "넬"; "nil" = "닐"; "nol" = "놀"; "nul" = "눌"
        "nam" = "남"; "nem" = "넴"; "nim" = "님"; "nom" = "놈"; "num" = "눔"
        "nar" = "나르"; "ner" = "네르"; "nir" = "니르"; "nor" = "노르"; "nur" = "누르"
        "nang" = "낭"; "neng" = "넹"; "ning" = "닝"; "nong" = "농"; "nung" = "눙"

        # P + Vowel + Coda
        "pan" = "판"; "pen" = "펜"; "pin" = "핀"; "pon" = "폰"; "pun" = "푼"
        "pal" = "팔"; "pel" = "펠"; "pil" = "필"; "pol" = "폴"; "pul" = "풀"
        "pam" = "팜"; "pem" = "펨"; "pim" = "핌"; "pom" = "폼"; "pum" = "품"
        "par" = "파르"; "per" = "페르"; "pir" = "피르"; "por" = "포르"; "pur" = "푸르"
        "pang" = "팡"; "peng" = "펭"; "ping" = "핑"; "pong" = "퐁"; "pung" = "풍"

        # R + Vowel + Coda
        "ran" = "란"; "ren" = "렌"; "rin" = "린"; "ron" = "론"; "run" = "룬"
        "ral" = "랄"; "rel" = "렐"; "ril" = "릴"; "rol" = "롤"; "rul" = "룰"
        "ram" = "람"; "rem" = "렘"; "rim" = "림"; "rom" = "롬"; "rum" = "룸"
        "rar" = "라르"; "rer" = "레르"; "rir" = "리르"; "ror" = "로르"; "rur" = "루르"
        "rang" = "랑"; "reng" = "렝"; "ring" = "링"; "rong" = "롱"; "rung" = "룽"

        # S + Vowel + Coda
        "san" = "산"; "sen" = "센"; "sin" = "신"; "son" = "손"; "sun" = "순"
        "sal" = "살"; "sel" = "셀"; "sil" = "실"; "sol" = "솔"; "sul" = "술"
        "sam" = "삼"; "sem" = "셈"; "sim" = "심"; "som" = "솜"; "sum" = "숨"
        "sar" = "사르"; "ser" = "세르"; "sir" = "시르"; "sor" = "소르"; "sur" = "수르"
        "sang" = "상"; "seng" = "셍"; "sing" = "싱"; "song" = "송"; "sung" = "숭"

        # T + Vowel + Coda
        "tan" = "탄"; "ten" = "텐"; "tin" = "틴"; "ton" = "톤"; "tun" = "툰"
        "tal" = "탈"; "tel" = "텔"; "til" = "틸"; "tol" = "톨"; "tul" = "툴"
        "tam" = "탐"; "tem" = "템"; "tim" = "팀"; "tom" = "톰"; "tum" = "툼"
        "tar" = "타르"; "ter" = "테르"; "tir" = "티르"; "tor" = "토르"; "tur" = "투르"
        "tang" = "탕"; "teng" = "텡"; "ting" = "팅"; "tong" = "통"; "tung" = "퉁"

        # V + Vowel + Coda
        "van" = "반"; "ven" = "벤"; "vin" = "빈"; "von" = "본"; "vun" = "분"
        "val" = "발"; "vel" = "벨"; "vil" = "빌"; "vol" = "볼"; "vul" = "불"
        "var" = "바르"; "ver" = "베르"; "vir" = "비르"; "vor" = "보르"; "vur" = "부르"

        # Z + Vowel + Coda
        "zan" = "잔"; "zen" = "젠"; "zin" = "진"; "zon" = "존"; "zun" = "준"
        "zal" = "잘"; "zel" = "젤"; "zil" = "질"; "zol" = "졸"; "zul" = "줄"
        "zar" = "자르"; "zer" = "제르"; "zir" = "지르"; "zor" = "조르"; "zur" = "주르"

        # Simple 2-char CV syllables
        "ba" = "바"; "be" = "베"; "bi" = "비"; "bo" = "보"; "bu" = "부"
        "pa" = "파"; "pe" = "페"; "pi" = "피"; "po" = "포"; "pu" = "푸"
        "da" = "다"; "de" = "데"; "di" = "디"; "do" = "도"; "du" = "두"
        "ta" = "타"; "te" = "테"; "ti" = "티"; "to" = "토"; "tu" = "투"
        "ga" = "가"; "ge" = "게"; "gi" = "기"; "go" = "고"; "gu" = "구"
        "ka" = "카"; "ke" = "케"; "ki" = "키"; "ko" = "코"; "ku" = "쿠"
        "ca" = "카"; "ce" = "세"; "ci" = "시"; "co" = "코"; "cu" = "쿠"
        "ma" = "마"; "me" = "메"; "mi" = "미"; "mo" = "모"; "mu" = "무"
        "na" = "나"; "ne" = "네"; "ni" = "니"; "no" = "노"; "nu" = "누"
        "ra" = "라"; "re" = "레"; "ri" = "리"; "ro" = "로"; "ru" = "루"
        "la" = "라"; "le" = "레"; "li" = "리"; "lo" = "로"; "lu" = "루"
        "sa" = "사"; "se" = "세"; "si" = "시"; "so" = "소"; "su" = "수"
        "za" = "자"; "ze" = "제"; "zi" = "지"; "zo" = "조"; "zu" = "주"
        "fa" = "파"; "fe" = "페"; "fi" = "피"; "fo" = "포"; "fu" = "푸"
        "va" = "바"; "ve" = "베"; "vi" = "비"; "vo" = "보"; "vu" = "부"
        "ha" = "하"; "he" = "헤"; "hi" = "히"; "ho" = "호"; "hu" = "후"
        "ja" = "야"; "je" = "예"; "ji" = "지"; "jo" = "요"; "ju" = "유"
        "ya" = "야"; "ye" = "예"; "yi" = "이"; "yo" = "요"; "yu" = "유"
        "wa" = "와"; "we" = "웨"; "wi" = "위"; "wo" = "워"; "wu" = "우"

        # Diphthongs
        "ai" = "아이"; "au" = "아우"; "ei" = "에이"; "eu" = "에우"; "oi" = "오이"; "ou" = "오우"; "ui" = "우이"

        # Single vowels
        "a" = "아"; "e" = "에"; "i" = "이"; "o" = "오"; "u" = "우"

        # Single consonants (at end or before other consonants)
        # FIXED: Never map 'n' to '른' or 'm' to '름'!
        "b" = "브"; "c" = "크"; "d" = "드"; "f" = "프"; "g" = "그"
        "h" = "흐"; "j" = "즈"; "k" = "크"; "l" = "르"; "m" = "음"
        "n" = "은"; "p" = "프"; "r" = "르"; "s" = "스"; "t" = "트"
        "v" = "브"; "w" = "우"; "x" = "크스"; "y" = "이"; "z" = "즈"
    }

    $res = ""
    $curr = $w

    # First check multi matches
    while ($curr.Length -gt 0) {
        $matched = $false
        foreach ($k in $multi.Keys) {
            if ($curr.StartsWith($k)) {
                $res += $multi[$k]
                $curr = $curr.Substring($k.Length)
                $matched = $true
                break
            }
        }
        if ($matched) { continue }

        foreach ($k in $syllablesWithCoda.Keys) {
            if ($curr.StartsWith($k)) {
                $res += $syllablesWithCoda[$k]
                $curr = $curr.Substring($k.Length)
                $matched = $true
                break
            }
        }
        if (-not $matched) {
            $curr = $curr.Substring(1)
        }
    }

    # Clean double consonants / cleanups
    $res = $res -replace "스손", "손"
    $res = $res -replace "크스", "크스"
    $res = $res -replace "알베르트", "알베르트"
    return $res
}

# Test cases
$tests = @(
    "Albert",
    "Gudmundsson",
    "Albert Gudmundsson",
    "Mayulu",
    "Andersen",
    "Francis",
    "Kingstone",
    "Ebong",
    "Lukovic",
    "Prioste",
    "Cabral"
)

foreach ($t in $tests) {
    $words = $t -split "\s+"
    $out = ($words | ForEach-Object { ModernTransliterate $_ }) -join " "
    Write-Host "$t -> $out"
}

