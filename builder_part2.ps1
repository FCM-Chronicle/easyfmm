[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

. .\builder_part1.ps1

Write-Output "Building name translation tables..."

# 3. Known Football Player Names Dictionary (Hundreds of high-frequency names)
$knownNames = @{
    "Erling Haaland" = "엘링 홀란드"; "Kevin De Bruyne" = "케빈 더브라위너"; "Jude Bellingham" = "주드 벨링엄"
    "Kylian Mbappé" = "킬리안 음바페"; "Kylian Mbappe" = "킬리안 음바페"; "Vinícius Jr." = "비니시우스 주니오르"
    "Vinicius Junior" = "비니시우스 주니오르"; "Rodri" = "로드리"; "Bukayo Saka" = "부카요 사카"
    "Mohamed Salah" = "모하메드 살라"; "Virgil van Dijk" = "버질 반 다이크"; "Alisson" = "알리송"
    "Thibaut Courtois" = "티보 쿠르투아"; "Gavi" = "가비"; "Pedri" = "페드리"; "Lamine Yamal" = "라민 야말"
    "Jamal Musiala" = "자말 무시알라"; "Florian Wirtz" = "플로리안 비르츠"; "Harry Kane" = "해리 케인"
    "Son Heung Min" = "손흥민"; "Heung Min Son" = "손흥민"; "Phil Foden" = "필 포든"
    "Cole Palmer" = "콜 파머"; "Martin Ødegaard" = "마르틴 외데고르"; "Martin Odegaard" = "마르틴 외데고르"
    "Declan Rice" = "데클란 라이스"; "William Saliba" = "윌리엄 살리바"; "Gabriel" = "가브리에우"
    "Gabriel Martinelli" = "가브리에우 마르티넬리"; "Kai Havertz" = "카이 하베르츠"; "Bruno Fernandes" = "브루누 페르난데스"
    "Marcus Rashford" = "마커스 래시포드"; "Alejandro Garnacho" = "알레한드로 가르나초"; "Kobbie Mainoo" = "코비 마이누"
    "Bernardo Silva" = "베르나르두 실바"; "Rúben Dias" = "후벵 디아스"; "Ruben Dias" = "후벵 디아스"
    "Ederson" = "에데르송"; "Josko Gvardiol" = "요슈코 그바르디올"; "Joško Gvardiol" = "요슈코 그바르디올"
    "Alexander Isak" = "알렉산더 이삭"; "Bruno Guimarães" = "브루누 기마랑이스"; "Anthony Gordon" = "앤서니 고든"
    "Ollie Watkins" = "올리 왓킨스"; "Emiliano Martínez" = "에밀리아노 마르티네스"; "Douglas Luiz" = "더글라스 루이스"
    "Lucas Paquetá" = "루카스 파케타"; "Jarrod Bowen" = "재러드 보웬"; "Mohammed Kudus" = "모하메드 쿠두스"
    "Antoine Griezmann" = "앙투안 그리즈만"; "Jan Oblak" = "얀 오블락"; "Rodrigo De Paul" = "로드리고 데 파울"
    "Federico Valverde" = "페데리코 발베르데"; "Eduardo Camavinga" = "에두아르도 카마빙가"; "Aurélien Tchouaméni" = "오렐리앵 추아메니"
    "Aurelien Tchouameni" = "오렐리앵 추아메니"; "Antonio Rüdiger" = "안토니오 뤼디거"; "Éder Militão" = "에데르 밀리탕"
    "Robert Lewandowski" = "로베르트 레반도프스키"; "Raphinha" = "하피냐"; "Frenkie de Jong" = "프렝키 더용"
    "Jules Koundé" = "쥘 쿤데"; "Marc-André ter Stegen" = "마르크안드레 테어 슈테겐"; "Pau Cubarsí" = "파우 쿠바르시"
    "Dani Olmo" = "다니 올모"; "Ferran Torres" = "페란 토레스"; "İlkay Gündoğan" = "일카이 귄도안"
    "Nico Williams" = "니코 윌리엄스"; "Iñaki Williams" = "이냐키 윌리엄스"; "Oihan Sancet" = "오이한 산세트"
    "Unai Simón" = "우나이 시몬"; "Takefusa Kubo" = "구보 다케후사"; "Mikel Merino" = "미켈 메리노"
    "Martin Zubimendi" = "마르틴 수비멘디"; "Álex Baena" = "알렉스 바에나"; "Gerard Moreno" = "제라르 모레노"
    "Manuel Neuer" = "마누엘 노이어"; "Joshua Kimmich" = "요주아 키미히"; "Leroy Sané" = "르로이 자네"
    "Leroy Sane" = "르로이 자네"; "Serge Gnabry" = "세르주 그나브리"; "Kingsley Coman" = "킹슬레 코망"
    "Alphonso Davies" = "알폰소 데이비스"; "Dayot Upamecano" = "다요 우파메카노"; "Min Jae Kim" = "김민재"
    "Kim Min Jae" = "김민재"; "Granit Xhaka" = "그라니트 자카"; "Jeremie Frimpong" = "제레미 프림퐁"
    "Alejandro Grimaldo" = "알렉스 그리말도"; "Victor Boniface" = "빅터 보니페이스"; "Jonathan Tah" = "요나탄 타"
    "Gregor Kobel" = "그레고어 코벨"; "Julian Brandt" = "율리안 브란트"; "Nico Schlotterbeck" = "니코 슐로터베크"
    "Donyell Malen" = "도니얼 말런"; "Karim Adeyemi" = "카림 아데예미"; "Xavi Simons" = "샤비 시몬스"
    "Loïs Openda" = "로이스 오펜다"; "Benjamin Šeško" = "베냐민 세슈코"; "Dani Olmo" = "다니 올모"
    "Lautaro Martínez" = "라우타로 마르티네스"; "Nicolò Barella" = "니콜로 바렐라"; "Hakan Çalhanoğlu" = "하칸 찰하놀루"
    "Marcus Thuram" = "마르쿠스 튀랑"; "Alessandro Bastoni" = "알레산드로 바스토니"; "Federico Dimarco" = "페데리코 디마르코"
    "Rafael Leão" = "하파엘 레앙"; "Theo Hernández" = "테오 에르난데스"; "Christian Pulisic" = "크리스천 풀리식"
    "Mike Maignan" = "마이크 메냥"; "Dušan Vlahović" = "두샨 블라호비치"; "Bremer" = "글레이송 브레메르"
    "Federico Chiesa" = "페데리코 키에사"; "Khvicha Kvaratskhelia" = "흐비차 크바라츠헬리아"; "Victor Osimhen" = "빅터 오시멘"
    "Ousmane Dembélé" = "우스만 뎀벨레"; "Bradley Barcola" = "브래들리 바르콜라"; "Warren Zaïre-Emery" = "와렌 자이르에메리"
    "Achraf Hakimi" = "아슈라프 하키미"; "Marquinhos" = "마르키뉴스"; "Gianluigi Donnarumma" = "잔루이지 돈나룸마"
    "Lee Kang In" = "이강인"; "Kang In Lee" = "이강인"; "Vitinha" = "비티냐"; "Fabián Ruiz" = "파비안 루이스"
    "Gonçalo Ramos" = "곤살루 하무스"; "Nuno Mendes" = "누누 멘데스"; "Lucas Hernández" = "뤼카 에르난데스"
    "Mauro Icardi" = "마우로 이카르디"; "Dries Mertens" = "드리스 메르텐스"; "Lucas Torreira" = "루카스 토레이라"
    "Edin Džeko" = "에딘 제코"; "Dušan Tadić" = "두샨 타디치"; "Fred" = "프레드"; "Ciro Immobile" = "치로 임모빌레"
    "Rafa" = "라파 실바"; "Ángel Di María" = "앙헬 디 마리아"; "Orkun Kökçü" = "오르쿤 쾨크취"
    "Viktor Gyökeres" = "빅토르 요케레스"; "Morten Hjulmand" = "모르텐 히울만"; "Pedro Gonçalves" = "페드루 곤살베스"
    "Diogo Costa" = "디오구 코스타"; "Francisco Conceição" = "프란시스쿠 콘세이상"; "Evanilson" = "이바니우송"
    "Jordan Henderson" = "조던 헨더슨"; "Steven Bergwijn" = "스테번 베르흐베인"; "Brian Brobbey" = "브라이언 브로비"
    "Luuk de Jong" = "뤽 더용"; "Joey Veerman" = "조이 페이르만"; "Jerdy Schouten" = "예르디 스하우텐"
    "Santiago Giménez" = "산티아고 히메네스"; "Quinten Timber" = "크빈텐 팀버르"; "David Hancko" = "다비드 한츠코"
}

# 4. Syllable/Word translation dictionary for football names
$nameTokens = @{
    "Silva" = "실바"; "Santos" = "산투스"; "Garcia" = "가르시아"; "Rodriguez" = "로드리게스"; "Martinez" = "마르티네스"
    "Hernandez" = "에르난데스"; "Lopez" = "로페스"; "Gonzalez" = "곤살레스"; "Perez" = "페레스"; "Sanchez" = "산체스"
    "Ramirez" = "라미레스"; "Torres" = "토레스"; "Diaz" = "디아스"; "Alvarez" = "알바레스"; "Romero" = "로메로"
    "Gomez" = "고메스"; "Ruiz" = "루이스"; "Fernandez" = "페르난데스"; "Moreno" = "모레노"; "Jimenez" = "히메네스"
    "Smith" = "스미스"; "Johnson" = "존슨"; "Williams" = "윌리엄스"; "Jones" = "존스"; "Brown" = "브라운"
    "Davis" = "데이비스"; "Miller" = "밀러"; "Wilson" = "윌슨"; "Moore" = "무어"; "Taylor" = "테일러"
    "Anderson" = "앤더슨"; "Thomas" = "토머스"; "Jackson" = "잭슨"; "White" = "화이트"; "Harris" = "해리스"
    "Martin" = "마르틴"; "Bernard" = "베르나르"; "Dubois" = "뒤부아"; "Thomas" = "토마"; "Robert" = "로베르"
    "Richard" = "리샤르"; "Petit" = "프티"; "Durand" = "뒤랑"; "Leroy" = "르루아"; "Moreau" = "모로"
    "Müller" = "뮐러"; "Muller" = "뮐러"; "Schmidt" = "슈미트"; "Schneider" = "슈나이더"; "Fischer" = "피셔"
    "Weber" = "베버"; "Meyer" = "마이어"; "Wagner" = "바그너"; "Becker" = "베커"; "Schulz" = "슐츠"
    "Hoffmann" = "호프만"; "Schäfer" = "셰퍼"; "Koch" = "코흐"; "Bauer" = "바우어"; "Richter" = "리히터"
    "Rossi" = "로시"; "Russo" = "루소"; "Ferrari" = "페라리"; "Esposito" = "에스포시토"; "Bianchi" = "비앙키"
    "Romano" = "로마노"; "Colombo" = "콜롬보"; "Ricci" = "리치"; "Marino" = "마리노"; "Greco" = "그레코"
    "de Jong" = "더용"; "Jong" = "더용"; "Jansen" = "얀센"; "de Vries" = "더프리스"; "van den Berg" = "반덴베르흐"
    "van Dijk" = "반다이크"; "Bakker" = "바커"; "Janssen" = "얀센"; "Visser" = "피서르"; "Smit" = "스밋"
    "Yılmaz" = "이을마즈"; "Kaya" = "카야"; "Demir" = "데미르"; "Şahin" = "샤힌"; "Çelik" = "첼릭"
    "Yıldız" = "이을드즈"; "Yıldırım" = "이을드름"; "Öztürk" = "외즈튀르크"; "Aydın" = "아이든"; "Özdemir" = "외즈데미르"
    "David" = "데이비드"; "John" = "존"; "James" = "제임스"; "Michael" = "마이클"; "Alex" = "알렉스"
    "Alexander" = "알렉산더"; "Daniel" = "대니얼"; "Jack" = "잭"; "Harry" = "해리"; "Tom" = "톰"
    "Thomas" = "토머스"; "Luke" = "루크"; "Lucas" = "루카스"; "Mark" = "마크"; "Paul" = "폴"
    "George" = "조지"; "Joe" = "조"; "Sam" = "샘"; "Ben" = "벤"; "Benjamin" = "베냐민"
    "Carlos" = "카를로스"; "Juan" = "후안"; "Jose" = "호세"; "José" = "호세"; "Luis" = "루이스"
    "Pedro" = "페드로"; "Miguel" = "미겔"; "Jorge" = "호르헤"; "Antonio" = "안토니오"; "Manuel" = "마누엘"
    "Francisco" = "프란시스코"; "Diego" = "디에고"; "Javier" = "하비에르"; "Sergio" = "세르히오"; "Alejandro" = "알레한드로"
    "Jean" = "장"; "Pierre" = "피에르"; "Michel" = "미셸"; "Nicolas" = "니콜라"; "Julien" = "쥘리앵"
    "Guillaume" = "기욤"; "Maxime" = "막심"; "Romain" = "로맹"; "Antoine" = "앙투안"; "Mathieu" = "마티외"
    "Hans" = "한스"; "Peter" = "페터"; "Wolfgang" = "볼프강"; "Klaus" = "클라우스"; "Jürgen" = "위르겐"
    "Stefan" = "슈테판"; "Christian" = "크리스티안"; "Jan" = "얀"; "Lukas" = "루카스"; "Felix" = "펠릭스"
    "Marco" = "마르코"; "Andrea" = "안드레아"; "Luca" = "루카"; "Matteo" = "마테오"; "Alessandro" = "알레산드로"
    "Lorenzo" = "로렌초"; "Davide" = "다비데"; "Simone" = "시모네"; "Francesco" = "프란체스코"; "Federico" = "페데리코"
    "Ali" = "알리"; "Mehmet" = "메흐메트"; "Mustafa" = "무스타파"; "Ahmet" = "아흐메트"; "Emre" = "엠레"
    "Hakan" = "하칸"; "Burak" = "부락"; "Arda" = "아르다"; "Kerem" = "케렘"; "Cenk" = "젱크"
}

# 5. Korean Syllable converter for K-League
$krSurnames = @{
    "Kim" = "김"; "Lee" = "이"; "Yi" = "이"; "Rhee" = "이"; "Park" = "박"; "Bak" = "박"; "Choi" = "최"; "Choe" = "최"
    "Jung" = "정"; "Jeong" = "정"; "Chung" = "정"; "Kang" = "강"; "Gang" = "강"; "Cho" = "조"; "Jo" = "조"
    "Yoon" = "윤"; "Yun" = "윤"; "Jang" = "장"; "Chang" = "장"; "Lim" = "임"; "Im" = "임"; "Han" = "한"
    "Oh" = "오"; "Seo" = "서"; "Suh" = "서"; "Shin" = "신"; "Sin" = "신"; "Kwon" = "권"; "Gwon" = "권"
    "Hwang" = "황"; "Ahn" = "안"; "An" = "안"; "Song" = "송"; "Ryu" = "류"; "Yoo" = "유"; "Yu" = "유"
    "Hong" = "홍"; "Ko" = "고"; "Go" = "고"; "Koh" = "고"; "Moon" = "문"; "Mun" = "문"; "Yang" = "양"
    "Son" = "손"; "Sohn" = "손"; "Bae" = "배"; "Baek" = "백"; "Paik" = "백"; "Heo" = "허"; "Huh" = "허"
    "Nam" = "남"; "Shim" = "심"; "Sim" = "심"; "Noh" = "노"; "No" = "노"; "Ha" = "하"; "Kwak" = "곽"
    "Sung" = "성"; "Seong" = "성"; "Cha" = "차"; "Joo" = "주"; "Ju" = "주"; "Woo" = "우"; "Koo" = "구"; "Gu" = "구"
}

$krSyllables = @{
    "hyun" = "현"; "hyeon" = "현"; "woo" = "우"; "jin" = "진"; "min" = "민"; "won" = "원"; "sang" = "상"
    "kyung" = "경"; "gyeong" = "경"; "kyeong" = "경"; "hoon" = "훈"; "hun" = "훈"; "jae" = "재"; "suk" = "석"
    "seok" = "석"; "jun" = "준"; "joon" = "준"; "young" = "영"; "yeong" = "영"; "hwan" = "환"; "ho" = "호"
    "dong" = "동"; "gun" = "건"; "geon" = "건"; "tae" = "태"; "kyu" = "규"; "gyu" = "규"; "sik" = "식"
    "seong" = "성"; "sung" = "성"; "soo" = "수"; "su" = "수"; "chul" = "철"; "cheol" = "철"; "bum" = "범"
    "beom" = "범"; "wook" = "욱"; "uk" = "욱"; "hee" = "희"; "hi" = "희"; "seung" = "승"; "bo" = "보"
    "kyum" = "겸"; "gyeom" = "겸"; "seob" = "섭"; "sub" = "섭"; "hyuk" = "혁"; "hyeok" = "혁"; "ki" = "기"
    "gi" = "기"; "chan" = "찬"; "sol" = "솔"; "bin" = "빈"; "ha" = "하"; "ye" = "예"; "in" = "인"
    "yoon" = "윤"; "yun" = "윤"; "dae" = "대"; "kwang" = "광"; "gwang" = "광"; "man" = "만"; "myung" = "명"
    "myeong" = "명"; "il" = "일"; "woong" = "웅"; "ung" = "웅"; "yong" = "용"; "jong" = "종"; "joong" = "중"
    "jung" = "중"; "han" = "한"; "jin" = "진"; "sun" = "선"; "seon" = "선"; "tae" = "태"; "seok" = "석"
}

function Translate-KoreanName($first, $last, $common) {
    # If common name is given like "Son Heung Min" or "Cho Hyun Woo"
    $target = if ($common) { $common } else { "$first $last".Trim() }
    
    # Try exact match first
    if ($knownNames.ContainsKey($target)) { return $knownNames[$target] }

    $parts = $target -split '\s+'
    if ($parts.Count -ge 2) {
        $surname = $parts[0]
        $given = $parts[1..($parts.Count - 1)] -join ""
        if (-not $krSurnames.ContainsKey($surname)) {
            $surname = $parts[-1]
            $given = $parts[0..($parts.Count - 2)] -join ""
        }

        if ($krSurnames.ContainsKey($surname)) {
            $krSurname = $krSurnames[$surname]
            # Try to parse given name syllables
            $krGiven = ""
            $lowerGiven = $given.ToLower()
            $i = 0
            while ($i -lt $lowerGiven.Length) {
                $matchedSyl = $null
                # Match longest syllable (4 to 2 chars)
                for ($len = 6; $len -ge 2; $len--) {
                    if ($i + $len -le $lowerGiven.Length) {
                        $sub = $lowerGiven.Substring($i, $len)
                        if ($krSyllables.ContainsKey($sub)) {
                            $matchedSyl = $krSyllables[$sub]
                            $i += $len
                            break
                        }
                    }
                }
                if ($matchedSyl) {
                    $krGiven += $matchedSyl
                } else {
                    $i++
                }
            }
            if ($krGiven.Length -ge 1) {
                return "$krSurname$krGiven"
            }
        }
    }
    return $null
}

function Transliterate-GeneralName($name) {
    if (-not $name) { return "선수" }
    if ($knownNames.ContainsKey($name)) { return $knownNames[$name] }

    $tokens = $name -split '\s+'
    $translatedTokens = @()

    foreach ($t in $tokens) {
        $cleanT = $t.Trim('.,"')
        if ($nameTokens.ContainsKey($cleanT)) {
            $translatedTokens += $nameTokens[$cleanT]
        } elseif ($cleanT.Length -gt 0) {
            # Simple phonetic fallback for western names
            $trans = $cleanT
            # Common western phonetics
            $trans = $trans -replace 'th', '트' -replace 'sh', '슈' -replace 'ch', '치'
            $trans = $trans -replace 'ph', '프' -replace 'ck', '크' -replace 'qu', '크'
            $trans = $trans -replace 'tion', '션' -replace 'sion', '션'
            $trans = $trans -replace 'ing', '잉' -replace 'er', '어' -replace 'ar', '아'
            $trans = $trans -replace 'al', '알' -replace 'el', '엘' -replace 'il', '일'
            $trans = $trans -replace 'an', '안' -replace 'en', '엔' -replace 'on', '온'
            $trans = $trans -replace 'ba', '바' -replace 'be', '베' -replace 'bi', '비' -replace 'bo', '보' -replace 'bu', '부'
            $trans = $trans -replace 'ca', '카' -replace 'ce', '세' -replace 'ci', '시' -replace 'co', '코' -replace 'cu', '쿠'
            $trans = $trans -replace 'da', '다' -replace 'de', '데' -replace 'di', '디' -replace 'do', '도' -replace 'du', '두'
            $trans = $trans -replace 'fa', '파' -replace 'fe', '페' -replace 'fi', '피' -replace 'fo', '포' -replace 'fu', '푸'
            $trans = $trans -replace 'ga', '가' -replace 'ge', '게' -replace 'gi', '기' -replace 'go', '고' -replace 'gu', '구'
            $trans = $trans -replace 'ha', '하' -replace 'he', '헤' -replace 'hi', '히' -replace 'ho', '호' -replace 'hu', '후'
            $trans = $trans -replace 'ja', '자' -replace 'je', '제' -replace 'ji', '지' -replace 'jo', '조' -replace 'ju', '주'
            $trans = $trans -replace 'ka', '카' -replace 'ke', '케' -replace 'ki', '키' -replace 'ko', '코' -replace 'ku', '쿠'
            $trans = $trans -replace 'la', '라' -replace 'le', '레' -replace 'li', '리' -replace 'lo', '로' -replace 'lu', '루'
            $trans = $trans -replace 'ma', '마' -replace 'me', '메' -replace 'mi', '미' -replace 'mo', '모' -replace 'mu', '무'
            $trans = $trans -replace 'na', '나' -replace 'ne', '네' -replace 'ni', '니' -replace 'no', '노' -replace 'nu', '누'
            $trans = $trans -replace 'pa', '파' -replace 'pe', '페' -replace 'pi', '피' -replace 'po', '포' -replace 'pu', '푸'
            $trans = $trans -replace 'ra', '라' -replace 're', '레' -replace 'ri', '리' -replace 'ro', '로' -replace 'ru', '루'
            $trans = $trans -replace 'sa', '사' -replace 'se', '세' -replace 'si', '시' -replace 'so', '소' -replace 'su', '수'
            $trans = $trans -replace 'ta', '타' -replace 'te', '테' -replace 'ti', '티' -replace 'to', '토' -replace 'tu', '투'
            $trans = $trans -replace 'va', '바' -replace 've', '베' -replace 'vi', '비' -replace 'vo', '보' -replace 'vu', '부'
            $trans = $trans -replace 'wa', '와' -replace 'we', '웨' -replace 'wi', '위' -replace 'wo', '워'
            $trans = $trans -replace 'za', '자' -replace 'ze', '제' -replace 'zi', '지' -replace 'zo', '조' -replace 'zu', '주'
            $trans = $trans -replace '[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]', '스'
            $trans = $trans -replace '[aeiouAEIOU]', ''
            if ($trans.Length -gt 0 -and $trans -match '[\uac00-\ud7af]') {
                $translatedTokens += $trans
            } else {
                $translatedTokens += $cleanT
            }
        }
    }

    return ($translatedTokens -join " ")
}

Write-Output "Translation engine ready."

