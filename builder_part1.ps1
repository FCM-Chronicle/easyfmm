[Console]::OutputEncoding = [System.Text.Encoding]::UTF8
$OutputEncoding = [System.Text.Encoding]::UTF8

Write-Output "Starting Tier-1 World Builder..."

# 1. Load Country Dictionary
$countryMap = @{
    "England" = "잉글랜드"; "Spain" = "스페인"; "Germany" = "독일"; "Italy" = "이탈리아"; "France" = "프랑스"
    "Netherlands" = "네덜란드"; "Portugal" = "포르투갈"; "Turkey" = "튀르키예"; "Korea Republic" = "대한민국"; "South Korea" = "대한민국"
    "Brazil" = "브라질"; "Argentina" = "아르헨티나"; "Belgium" = "벨기에"; "Croatia" = "크로아티아"; "Denmark" = "덴마크"
    "Norway" = "노르웨이"; "Sweden" = "스웨덴"; "Poland" = "폴란드"; "Uruguay" = "우루과이"; "Colombia" = "콜롬비아"
    "Japan" = "일본"; "Senegal" = "세네갈"; "Morocco" = "모로코"; "Nigeria" = "나이지리아"; "Egypt" = "이집트"
    "Ghana" = "가나"; "Cameroon" = "카메룬"; "Ivory Coast" = "코트디부아르"; "Cote d'Ivoire" = "코트디부아르"; "Serbia" = "세르비아"
    "Switzerland" = "스위스"; "Austria" = "오스트리아"; "Scotland" = "스코틀랜드"; "Wales" = "웨일스"; "Czech Republic" = "체코"
    "Ukraine" = "우크라이나"; "Algeria" = "알제리"; "Chile" = "칠레"; "Ecuador" = "에콰도르"; "Paraguay" = "파라과이"
    "Peru" = "페루"; "Venezuela" = "베네수엘라"; "United States" = "미국"; "Canada" = "캐나다"; "Mexico" = "멕시코"
    "Australia" = "호주"; "New Zealand" = "뉴질랜드"; "Slovakia" = "슬로바키아"; "Slovenia" = "슬로베니아"; "Hungary" = "헝가리"
    "Romania" = "루마니아"; "Greece" = "그리스"; "Bulgaria" = "불가리아"; "Finland" = "핀란드"; "Iceland" = "아이슬란드"
    "Republic of Ireland" = "아일랜드"; "Northern Ireland" = "북아일랜드"; "Bosnia and Herzegovina" = "보스니아 헤르체고비나"
    "Georgia" = "조지아"; "Albania" = "알바니아"; "Mali" = "말리"; "Guinea" = "기니"; "DR Congo" = "민주콩고"
    "Congo" = "콩고"; "Gabon" = "가봉"; "Tunisia" = "튀니지"; "South Africa" = "남아공"; "Angola" = "앙골라"
    "Zambia" = "잠비아"; "Burkina Faso" = "부르키나파소"; "Cape Verde" = "카보베르데"; "Cape Verde Islands" = "카보베르데"
    "Kosovo" = "코소보"; "Montenegro" = "몬테네그로"; "North Macedonia" = "북마케도니아"; "Israel" = "이스라엘"
    "Iran" = "이란"; "Saudi Arabia" = "사우디아라비아"; "Qatar" = "카타르"; "Uzbekistan" = "우즈베키스탄"; "China PR" = "중국"
}

# 2. Club Dictionary for 162 clubs
# Key: CSV club name -> @{ key, displayName, city, country, leagueId, logoCode, budget, clubValue, stadiumName, stadiumCapacity }
$clubMap = @{
    # --- Premier League (20) ---
    "Arsenal" = @{ key = "아스널"; name = "아스널"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "ARS"; budget = 1200; val = 12000; stName = "에미레이트 스타디움"; stCap = 60704 }
    "Aston Villa" = @{ key = "아스톤_빌라"; name = "아스톤 빌라"; city = "버밍엄"; country = "잉글랜드"; leagueId = "premier_league"; logo = "AVL"; budget = 650; val = 6000; stName = "빌라 파크"; stCap = 42657 }
    "AFC Bournemouth" = @{ key = "본머스"; name = "본머스"; city = "본머스"; country = "잉글랜드"; leagueId = "premier_league"; logo = "BOU"; budget = 350; val = 3200; stName = "바이탈리티 스타디움"; stCap = 11307 }
    "Brentford" = @{ key = "브렌트포드"; name = "브렌트포드"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "BRE"; budget = 350; val = 3500; stName = "지테크 커뮤니티 스타디움"; stCap = 17250 }
    "Brighton" = @{ key = "브라이튼"; name = "브라이튼"; city = "브라이튼"; country = "잉글랜드"; leagueId = "premier_league"; logo = "BHA"; budget = 500; val = 5000; stName = "아멕스 스타디움"; stCap = 31800 }
    "Chelsea" = @{ key = "첼시"; name = "첼시"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "CHE"; budget = 1400; val = 11000; stName = "스탬퍼드 브리지"; stCap = 40341 }
    "Coventry City" = @{ key = "코번트리_시티"; name = "코번트리 시티"; city = "코번트리"; country = "잉글랜드"; leagueId = "premier_league"; logo = "COV"; budget = 200; val = 1800; stName = "코번트리 빌딩 소사이어티 아레나"; stCap = 32609 }
    "Crystal Palace" = @{ key = "크리스탈_팰리스"; name = "크리스탈 팰리스"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "CRY"; budget = 400; val = 3800; stName = "셀허스트 파크"; stCap = 25486 }
    "Everton" = @{ key = "에버턴"; name = "에버턴"; city = "리버풀"; country = "잉글랜드"; leagueId = "premier_league"; logo = "EVE"; budget = 350; val = 3600; stName = "구디슨 파크"; stCap = 39572 }
    "Fulham" = @{ key = "풀럼"; name = "풀럼"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "FUL"; budget = 400; val = 3500; stName = "크레이븐 코티지"; stCap = 25700 }
    "Hull City" = @{ key = "헐_시티"; name = "헐 시티"; city = "킹스턴어폰헐"; country = "잉글랜드"; leagueId = "premier_league"; logo = "HUL"; budget = 200; val = 1500; stName = "MKM 스타디움"; stCap = 25586 }
    "Ipswich" = @{ key = "입스위치"; name = "입스위치 타운"; city = "입스위치"; country = "잉글랜드"; leagueId = "premier_league"; logo = "IPS"; budget = 250; val = 2000; stName = "포트먼 로드"; stCap = 29673 }
    "Leeds United" = @{ key = "리즈_유나이티드"; name = "리즈 유나이티드"; city = "리즈"; country = "잉글랜드"; leagueId = "premier_league"; logo = "LEE"; budget = 350; val = 3000; stName = "엘런드 로드"; stCap = 37890 }
    "Liverpool" = @{ key = "리버풀"; name = "리버풀"; city = "리버풀"; country = "잉글랜드"; leagueId = "premier_league"; logo = "LIV"; budget = 1300; val = 13000; stName = "안필드"; stCap = 61276 }
    "Man Utd" = @{ key = "맨체스터_유나이티드"; name = "맨체스터 유나이티드"; city = "맨체스터"; country = "잉글랜드"; leagueId = "premier_league"; logo = "MUN"; budget = 1200; val = 11500; stName = "올드 트래포드"; stCap = 74310 }
    "Manchester City" = @{ key = "맨체스터_시티"; name = "맨체스터 시티"; city = "맨체스터"; country = "잉글랜드"; leagueId = "premier_league"; logo = "MCI"; budget = 2200; val = 18000; stName = "에티하드 스타디움"; stCap = 53400 }
    "Newcastle Utd" = @{ key = "뉴캐슬_유나이티드"; name = "뉴캐슬 유나이티드"; city = "뉴캐슬"; country = "잉글랜드"; leagueId = "premier_league"; logo = "NEW"; budget = 800; val = 7500; stName = "세인트 제임스 파크"; stCap = 52305 }
    "Nott'm Forest" = @{ key = "노팅엄_포레스트"; name = "노팅엄 포레스트"; city = "노팅엄"; country = "잉글랜드"; leagueId = "premier_league"; logo = "NFO"; budget = 400; val = 3500; stName = "시티 그라운드"; stCap = 30445 }
    "Spurs" = @{ key = "토트넘_홋스퍼"; name = "토트넘 홋스퍼"; city = "런던"; country = "잉글랜드"; leagueId = "premier_league"; logo = "TOT"; budget = 900; val = 8500; stName = "토트넘 홋스퍼 스타디움"; stCap = 62850 }
    "Sunderland" = @{ key = "선덜랜드"; name = "선덜랜드"; city = "선덜랜드"; country = "잉글랜드"; leagueId = "premier_league"; logo = "SUN"; budget = 250; val = 2000; stName = "스타디움 오브 라이트"; stCap = 49000 }

    # --- LALIGA EA SPORTS (20) ---
    "Athletic Club" = @{ key = "아틀레틱_클루브"; name = "아틀레틱 빌바오"; city = "빌바오"; country = "스페인"; leagueId = "laliga"; logo = "ATH"; budget = 500; val = 4500; stName = "산 마메스"; stCap = 53289 }
    "Atlético de Madrid" = @{ key = "아틀레티코_마드리드"; name = "아틀레티코 마드리드"; city = "마드리드"; country = "스페인"; leagueId = "laliga"; logo = "ATM"; budget = 800; val = 7500; stName = "리야드 에어 메트로폴리타노"; stCap = 70460 }
    "CA Osasuna" = @{ key = "오사수나"; name = "오사수나"; city = "팜플로나"; country = "스페인"; leagueId = "laliga"; logo = "OSA"; budget = 250; val = 2200; stName = "엘 사다르"; stCap = 23576 }
    "Celta" = @{ key = "셀타_비고"; name = "셀타 비고"; city = "비고"; country = "스페인"; leagueId = "laliga"; logo = "CEL"; budget = 300; val = 2500; stName = "에스타디오 아방카 발라이도스"; stCap = 24791 }
    "D. Alavés" = @{ key = "알라베스"; name = "데포르티보 알라베스"; city = "비토리아"; country = "스페인"; leagueId = "laliga"; logo = "ALA"; budget = 200; val = 1800; stName = "멘디소로사"; stCap = 19840 }
    "Elche CF" = @{ key = "엘체"; name = "엘체 CF"; city = "엘체"; country = "스페인"; leagueId = "laliga"; logo = "ELC"; budget = 180; val = 1500; stName = "마르티네스 발레로"; stCap = 31388 }
    "FC Barcelona" = @{ key = "바르셀로나"; name = "바르셀로나"; city = "바르셀로나"; country = "스페인"; leagueId = "laliga"; logo = "FCB"; budget = 800; val = 13500; stName = "스포티파이 캄 노우"; stCap = 99354 }
    "Getafe CF" = @{ key = "헤타페"; name = "헤타페 CF"; city = "헤타페"; country = "스페인"; leagueId = "laliga"; logo = "GET"; budget = 220; val = 2000; stName = "콜리세움 알폰소 페레스"; stCap = 16500 }
    "Levante UD" = @{ key = "레반테"; name = "레반테 UD"; city = "발렌시아"; country = "스페인"; leagueId = "laliga"; logo = "LEV"; budget = 200; val = 1700; stName = "에스타디 시우타트 데 발렌시아"; stCap = 26354 }
    "Málaga CF" = @{ key = "말라가"; name = "말라가 CF"; city = "말라가"; country = "스페인"; leagueId = "laliga"; logo = "MAL"; budget = 180; val = 1400; stName = "라 로살레다"; stCap = 30044 }
    "R. Racing Club" = @{ key = "라싱_클루브"; name = "라싱 산탄데르"; city = "산탄데르"; country = "스페인"; leagueId = "laliga"; logo = "RAC"; budget = 180; val = 1500; stName = "엘 사르디네로"; stCap = 22222 }
    "Rayo Vallecano" = @{ key = "라요_바예카노"; name = "라요 바예카노"; city = "마드리드"; country = "스페인"; leagueId = "laliga"; logo = "RAY"; budget = 250; val = 2100; stName = "에스타디오 데 바예카스"; stCap = 14708 }
    "RC Deportivo" = @{ key = "데포르티보"; name = "데포르티보 라 코루냐"; city = "라코루냐"; country = "스페인"; leagueId = "laliga"; logo = "DEP"; budget = 200; val = 1800; stName = "에스타디오 데 리아소르"; stCap = 32490 }
    "RCD Espanyol" = @{ key = "에스파뇰"; name = "RCD 에스파뇰"; city = "바르셀로나"; country = "스페인"; leagueId = "laliga"; logo = "ESP"; budget = 250; val = 2200; stName = "스테이지 프론트 스타디움"; stCap = 40000 }
    "Real Betis" = @{ key = "레알_베티스"; name = "레알 베티스"; city = "세비야"; country = "스페인"; leagueId = "laliga"; logo = "BET"; budget = 450; val = 4000; stName = "베니토 비야마린"; stCap = 60721 }
    "Real Madrid" = @{ key = "레알_마드리드"; name = "레알 마드리드"; city = "마드리드"; country = "스페인"; leagueId = "laliga"; logo = "RMA"; budget = 1500; val = 17500; stName = "산티아고 베르나베우"; stCap = 84744 }
    "Real Sociedad" = @{ key = "레알_소시에다드"; name = "레알 소시에다드"; city = "산세바스티안"; country = "스페인"; leagueId = "laliga"; logo = "RSO"; budget = 500; val = 4800; stName = "레알레 아레나"; stCap = 39500 }
    "Sevilla FC" = @{ key = "세비야"; name = "세비야 FC"; city = "세비야"; country = "스페인"; leagueId = "laliga"; logo = "SEV"; budget = 400; val = 3800; stName = "라몬 산체스 피스후안"; stCap = 43883 }
    "Valencia CF" = @{ key = "발렌시아"; name = "발렌시아 CF"; city = "발렌시아"; country = "스페인"; leagueId = "laliga"; logo = "VAL"; budget = 350; val = 3400; stName = "메스타야"; stCap = 49430 }
    "Villarreal CF" = @{ key = "비야레알"; name = "비야레알 CF"; city = "비야레알"; country = "스페인"; leagueId = "laliga"; logo = "VIL"; budget = 450; val = 4200; stName = "에스타디오 데 라 세라미카"; stCap = 23000 }

    # --- Bundesliga (18) ---
    "1. FC Köln" = @{ key = "FC_쾰른"; name = "FC 쾰른"; city = "쾰른"; country = "독일"; leagueId = "bundesliga"; logo = "KOE"; budget = 250; val = 2200; stName = "라인에네르기슈타디온"; stCap = 50000 }
    "1. FSV Mainz 05" = @{ key = "마인츠"; name = "마인츠 05"; city = "마인츠"; country = "독일"; leagueId = "bundesliga"; logo = "M05"; budget = 250; val = 2100; stName = "메바 아레나"; stCap = 33305 }
    "Borussia Dortmund" = @{ key = "도르트문트"; name = "보루시아 도르트문트"; city = "도르트문트"; country = "독일"; leagueId = "bundesliga"; logo = "BVB"; budget = 800; val = 8500; stName = "지그날 이두나 파크"; stCap = 81365 }
    "FC Augsburg" = @{ key = "아우크스부르크"; name = "아우크스부르크"; city = "아우크스부르크"; country = "독일"; leagueId = "bundesliga"; logo = "FCA"; budget = 220; val = 2000; stName = "WWK 아레나"; stCap = 30660 }
    "FC Bayern München" = @{ key = "바이에른_뮌헨"; name = "바이에른 뮌헨"; city = "뮌헨"; country = "독일"; leagueId = "bundesliga"; logo = "BAY"; budget = 1500; val = 16000; stName = "알리안츠 아레나"; stCap = 75024 }
    "FC Schalke 04" = @{ key = "샬케_04"; name = "샬케 04"; city = "겔젠키르헨"; country = "독일"; leagueId = "bundesliga"; logo = "S04"; budget = 250; val = 2400; stName = "벨틴스 아레나"; stCap = 62271 }
    "Frankfurt" = @{ key = "프랑크푸르트"; name = "아인트라흐트 프랑크푸르트"; city = "프랑크푸르트"; country = "독일"; leagueId = "bundesliga"; logo = "SGE"; budget = 450; val = 4200; stName = "도이체 방크 파르크"; stCap = 58000 }
    "Hamburger SV" = @{ key = "함부르크"; name = "함부르크 SV"; city = "함부르크"; country = "독일"; leagueId = "bundesliga"; logo = "HSV"; budget = 280; val = 2500; stName = "폴크스파르크슈타디온"; stCap = 57000 }
    "Leverkusen" = @{ key = "레버쿠젠"; name = "바이어 레버쿠젠"; city = "레버쿠젠"; country = "독일"; leagueId = "bundesliga"; logo = "B04"; budget = 850; val = 8000; stName = "바이아레나"; stCap = 30210 }
    "M'gladbach" = @{ key = "묀헨글라트바흐"; name = "묀헨글라트바흐"; city = "묀헨글라트바흐"; country = "독일"; leagueId = "bundesliga"; logo = "BMG"; budget = 350; val = 3000; stName = "보루시아 파크"; stCap = 54057 }
    "RB Leipzig" = @{ key = "라이프치히"; name = "RB 라이프치히"; city = "라이프치히"; country = "독일"; leagueId = "bundesliga"; logo = "RBL"; budget = 750; val = 7000; stName = "레드불 아레나"; stCap = 47069 }
    "SC Freiburg" = @{ key = "프라이부르크"; name = "SC 프라이부르크"; city = "프라이부르크"; country = "독일"; leagueId = "bundesliga"; logo = "SCF"; budget = 300; val = 2800; stName = "오이로파 파크 슈타디온"; stCap = 34700 }
    "SC Paderborn 07" = @{ key = "파더보른"; name = "SC 파더보른"; city = "파더보른"; country = "독일"; leagueId = "bundesliga"; logo = "SCP"; budget = 180; val = 1500; stName = "홈 디럭스 아레나"; stCap = 15000 }
    "SV Elversberg" = @{ key = "엘버스베르크"; name = "SV 엘버스베르크"; city = "슈피젠엘버스베르크"; country = "독일"; leagueId = "bundesliga"; logo = "SVE"; budget = 150; val = 1200; stName = "우르사팜 아레나"; stCap = 10000 }
    "SV Werder Bremen" = @{ key = "베르더_브레멘"; name = "베르더 브레멘"; city = "브레멘"; country = "독일"; leagueId = "bundesliga"; logo = "SVW"; budget = 300; val = 2600; stName = "베저슈타디온"; stCap = 42100 }
    "TSG Hoffenheim" = @{ key = "호펜하임"; name = "TSG 호펜하임"; city = "진스하임"; country = "독일"; leagueId = "bundesliga"; logo = "TSG"; budget = 350; val = 3200; stName = "프리제로 아레나"; stCap = 30150 }
    "Union Berlin" = @{ key = "우니온_베를린"; name = "우니온 베를린"; city = "베를린"; country = "독일"; leagueId = "bundesliga"; logo = "FCU"; budget = 300; val = 2800; stName = "슈타디온 안 데어 알텐 푀르스테라이"; stCap = 22012 }
    "VfB Stuttgart" = @{ key = "슈투트가르트"; name = "VfB 슈투트가르트"; city = "슈투트가르트"; country = "독일"; leagueId = "bundesliga"; logo = "VFB"; budget = 450; val = 4500; stName = "MHP 아레나"; stCap = 60449 }

    # --- Serie A Enilive (20) ---
    "AS Roma" = @{ key = "AS_로마"; name = "AS 로마"; city = "로마"; country = "이탈리아"; leagueId = "serie_a"; logo = "ASR"; budget = 600; val = 5500; stName = "스타디오 올림피코"; stCap = 70634 }
    "Bergamo Calcio" = @{ key = "아탈란타"; name = "아탈란타 BC"; city = "베르가모"; country = "이탈리아"; leagueId = "serie_a"; logo = "ATA"; budget = 550; val = 5000; stName = "게비스 스타디움"; stCap = 24950 }
    "Bologna" = @{ key = "볼로냐"; name = "볼로냐 FC"; city = "볼로냐"; country = "이탈리아"; leagueId = "serie_a"; logo = "BOL"; budget = 350; val = 3200; stName = "스타디오 레나토 달라라"; stCap = 38279 }
    "Cagliari" = @{ key = "칼리아리"; name = "칼리아리 칼초"; city = "칼리아리"; country = "이탈리아"; leagueId = "serie_a"; logo = "CAG"; budget = 200; val = 1800; stName = "우니폴 도무스"; stCap = 16416 }
    "Como" = @{ key = "코모"; name = "코모 1907"; city = "코모"; country = "이탈리아"; leagueId = "serie_a"; logo = "COM"; budget = 300; val = 2500; stName = "스타디오 주세페 시니갈리아"; stCap = 13602 }
    "Fiorentina" = @{ key = "피오렌티나"; name = "ACF 피오렌티나"; city = "피렌체"; country = "이탈리아"; leagueId = "serie_a"; logo = "FIO"; budget = 450; val = 4000; stName = "스타디오 아르테미오 프랑키"; stCap = 43147 }
    "Frosinone" = @{ key = "프로시노네"; name = "프로시노네 칼초"; city = "프로시노네"; country = "이탈리아"; leagueId = "serie_a"; logo = "FRO"; budget = 180; val = 1500; stName = "스타디오 베니토 스티르페"; stCap = 16227 }
    "Genoa" = @{ key = "제노아"; name = "제노아 CFC"; city = "제노바"; country = "이탈리아"; leagueId = "serie_a"; logo = "GEN"; budget = 250; val = 2200; stName = "스타디오 루이지 페라리스"; stCap = 36599 }
    "Juventus" = @{ key = "유벤투스"; name = "유벤투스"; city = "토리노"; country = "이탈리아"; leagueId = "serie_a"; logo = "JUV"; budget = 900; val = 9500; stName = "알리안츠 스타디움"; stCap = 41507 }
    "Latium" = @{ key = "라치오"; name = "SS 라치오"; city = "로마"; country = "이탈리아"; leagueId = "serie_a"; logo = "LAZ"; budget = 450; val = 4200; stName = "스타디오 올림피코"; stCap = 70634 }
    "Lecce" = @{ key = "레체"; name = "US 레체"; city = "레체"; country = "이탈리아"; leagueId = "serie_a"; logo = "LEC"; budget = 180; val = 1600; stName = "스타디오 비아 델 마레"; stCap = 31533 }
    "Lombardia FC" = @{ key = "인터_밀란"; name = "인터 밀란"; city = "밀라노"; country = "이탈리아"; leagueId = "serie_a"; logo = "INT"; budget = 850; val = 10000; stName = "스타디오 주세페 메아차"; stCap = 75817 }
    "Milano FC" = @{ key = "AC_밀란"; name = "AC 밀란"; city = "밀라노"; country = "이탈리아"; leagueId = "serie_a"; logo = "ACM"; budget = 750; val = 9000; stName = "산 시로"; stCap = 75817 }
    "Monza" = @{ key = "몬차"; name = "AC 몬차"; city = "몬차"; country = "이탈리아"; leagueId = "serie_a"; logo = "MON"; budget = 250; val = 2100; stName = "U-파워 스타디움"; stCap = 16917 }
    "Parma" = @{ key = "파르마"; name = "파르마 칼초"; city = "파르마"; country = "이탈리아"; leagueId = "serie_a"; logo = "PAR"; budget = 250; val = 2200; stName = "스타디오 엔니오 타르디니"; stCap = 22352 }
    "Sassuolo" = @{ key = "사수올로"; name = "US 사수올로"; city = "사수올로"; country = "이탈리아"; leagueId = "serie_a"; logo = "SAS"; budget = 250; val = 2300; stName = "마페이 스타디움"; stCap = 21584 }
    "SSC Napoli" = @{ key = "나폴리"; name = "SSC 나폴리"; city = "나폴리"; country = "이탈리아"; leagueId = "serie_a"; logo = "NAP"; budget = 800; val = 8000; stName = "스타디오 디에고 아르만도 마라도나"; stCap = 54726 }
    "Torino" = @{ key = "토리노"; name = "토리노 FC"; city = "토리노"; country = "이탈리아"; leagueId = "serie_a"; logo = "TOR"; budget = 300; val = 2700; stName = "스타디오 올림피코 그란데 토리노"; stCap = 27958 }
    "Udinese" = @{ key = "우디네세"; name = "우디네세 칼초"; city = "우디네"; country = "이탈리아"; leagueId = "serie_a"; logo = "UDI"; budget = 250; val = 2200; stName = "블루에너지 스타디움"; stCap = 25144 }
    "Venezia" = @{ key = "베네치아"; name = "베네치아 FC"; city = "베네치아"; country = "이탈리아"; leagueId = "serie_a"; logo = "VEN"; budget = 200; val = 1800; stName = "스타디오 피에를루이지 펜초"; stCap = 11150 }

    # --- Ligue 1 (18) ---
    "AJ Auxerre" = @{ key = "오세르"; name = "AJ 오세르"; city = "오세르"; country = "프랑스"; leagueId = "ligue_1"; logo = "AUX"; budget = 180; val = 1600; stName = "스타드 드 라베 데샹"; stCap = 18541 }
    "Angers SCO" = @{ key = "앙제"; name = "앙제 SCO"; city = "앙제"; country = "프랑스"; leagueId = "ligue_1"; logo = "ANG"; budget = 160; val = 1400; stName = "스타드 레몽 코파"; stCap = 18752 }
    "AS Monaco" = @{ key = "모나코"; name = "AS 모나코"; city = "모나코"; country = "프랑스"; leagueId = "ligue_1"; logo = "ASM"; budget = 600; val = 5500; stName = "스타드 루이 2세"; stCap = 16360 }
    "ESTAC Troyes" = @{ key = "트루아"; name = "트루아 AC"; city = "트루아"; country = "프랑스"; leagueId = "ligue_1"; logo = "TRO"; budget = 150; val = 1300; stName = "스타드 드 로브"; stCap = 20400 }
    "FC Lorient" = @{ key = "로리앙"; name = "FC 로리앙"; city = "로리앙"; country = "프랑스"; leagueId = "ligue_1"; logo = "FCL"; budget = 180; val = 1500; stName = "스타드 뒤 무스투아르"; stCap = 18890 }
    "Havre AC" = @{ key = "르아브르"; name = "르아브르 AC"; city = "르아브르"; country = "프랑스"; leagueId = "ligue_1"; logo = "HAC"; budget = 160; val = 1400; stName = "스타드 오세안"; stCap = 25178 }
    "Le Mans FC" = @{ key = "르망"; name = "르망 FC"; city = "르망"; country = "프랑스"; leagueId = "ligue_1"; logo = "LEM"; budget = 150; val = 1200; stName = "스타드 마리 마르뱅"; stCap = 25064 }
    "LOSC Lille" = @{ key = "릴"; name = "LOSC 릴"; city = "릴"; country = "프랑스"; leagueId = "ligue_1"; logo = "LIL"; budget = 450; val = 4200; stName = "스타드 피에르 모루아"; stCap = 50186 }
    "OGC Nice" = @{ key = "니스"; name = "OGC 니스"; city = "니스"; country = "프랑스"; leagueId = "ligue_1"; logo = "NIC"; budget = 400; val = 3800; stName = "알리안츠 리비에라"; stCap = 36178 }
    "OL" = @{ key = "리옹"; name = "올랭피크 리옹"; city = "리옹"; country = "프랑스"; leagueId = "ligue_1"; logo = "OLY"; budget = 450; val = 4500; stName = "그루파마 스타디움"; stCap = 59186 }
    "OM" = @{ key = "올랭피크_드_마르세유"; name = "올랭피크 드 마르세유"; city = "마르세유"; country = "프랑스"; leagueId = "ligue_1"; logo = "MAR"; budget = 500; val = 5000; stName = "스타드 벨로드롬"; stCap = 67394 }
    "Paris FC" = @{ key = "파리_FC"; name = "파리 FC"; city = "파리"; country = "프랑스"; leagueId = "ligue_1"; logo = "PFC"; budget = 250; val = 2000; stName = "스타드 샤를레티"; stCap = 20000 }
    "Paris SG" = @{ key = "파리_생제르맹"; name = "파리 생제르맹"; city = "파리"; country = "프랑스"; leagueId = "ligue_1"; logo = "PSG"; budget = 1800; val = 15000; stName = "파르크 데 프랭스"; stCap = 47929 }
    "RC Lens" = @{ key = "랑스"; name = "RC 랑스"; city = "랑스"; country = "프랑스"; leagueId = "ligue_1"; logo = "RCL"; budget = 350; val = 3200; stName = "스타드 볼라르트 들렐리스"; stCap = 38223 }
    "Stade Brestois 29" = @{ key = "브레스트"; name = "스타드 브레스트"; city = "브레스트"; country = "프랑스"; leagueId = "ligue_1"; logo = "BRE"; budget = 250; val = 2300; stName = "스타드 프랑시스 르 블레"; stCap = 15220 }
    "Stade Rennais FC" = @{ key = "렌"; name = "스타드 렌"; city = "렌"; country = "프랑스"; leagueId = "ligue_1"; logo = "REN"; budget = 350; val = 3300; stName = "로아존 파크"; stCap = 29778 }
    "Strasbourg" = @{ key = "스트라스부르"; name = "RC 스트라스부르"; city = "스트라스부르"; country = "프랑스"; leagueId = "ligue_1"; logo = "STR"; budget = 300; val = 2800; stName = "스타드 드 라 메노"; stCap = 26109 }
    "Toulouse FC" = @{ key = "툴루즈"; name = "툴루즈 FC"; city = "툴루즈"; country = "프랑스"; leagueId = "ligue_1"; logo = "TOU"; budget = 250; val = 2200; stName = "스타디움 드 툴루즈"; stCap = 33150 }

    # --- Eredivisie (18) ---
    "ADO Den Haag" = @{ key = "덴하흐"; name = "ADO 덴하흐"; city = "헤이그"; country = "네덜란드"; leagueId = "eredivisie"; logo = "ADH"; budget = 150; val = 1200; stName = "카르스 진스 스타디온"; stCap = 15000 }
    "Ajax" = @{ key = "아약스"; name = "AFC 아약스"; city = "암스테르담"; country = "네덜란드"; leagueId = "eredivisie"; logo = "AJA"; budget = 650; val = 6000; stName = "요한 크루이프 아레나"; stCap = 55865 }
    "AZ" = @{ key = "AZ_알크마르"; name = "AZ 알크마르"; city = "알크마르"; country = "네덜란드"; leagueId = "eredivisie"; logo = "AZA"; budget = 350; val = 3200; stName = "AFAS 스타디온"; stCap = 19478 }
    "Excelsior" = @{ key = "엑셀시오르"; name = "SBV 엑셀시오르"; city = "로테르담"; country = "네덜란드"; leagueId = "eredivisie"; logo = "EXC"; budget = 120; val = 1000; stName = "반 동게 & 데 로 스타디온"; stCap = 4500 }
    "FC Groningen" = @{ key = "흐로닝언"; name = "FC 흐로닝언"; city = "흐로닝언"; country = "네덜란드"; leagueId = "eredivisie"; logo = "GRO"; budget = 150; val = 1300; stName = "유로보르흐"; stCap = 22550 }
    "FC Twente" = @{ key = "트벤테"; name = "FC 트벤테"; city = "엔스헤데"; country = "네덜란드"; leagueId = "eredivisie"; logo = "TWE"; budget = 250; val = 2400; stName = "더 흐롤스 페스테"; stCap = 30205 }
    "FC Utrecht" = @{ key = "위트레흐트"; name = "FC 위트레흐트"; city = "위트레흐트"; country = "네덜란드"; leagueId = "eredivisie"; logo = "UTR"; budget = 200; val = 1900; stName = "스타디온 할헨바르트"; stCap = 23750 }
    "Feyenoord" = @{ key = "페예노르트"; name = "페예노르트"; city = "로테르담"; country = "네덜란드"; leagueId = "eredivisie"; logo = "FEY"; budget = 500; val = 4800; stName = "더 카위프"; stCap = 47500 }
    "Fortuna Sittard" = @{ key = "포르투나_시타르트"; name = "포르투나 시타르트"; city = "시타르트"; country = "네덜란드"; leagueId = "eredivisie"; logo = "FSI"; budget = 120; val = 1000; stName = "포르투나 시타르트 스타디온"; stCap = 12500 }
    "Go Ahead Eagles" = @{ key = "고_어헤드_이글스"; name = "고 어헤드 이글스"; city = "데벤터르"; country = "네덜란드"; leagueId = "eredivisie"; logo = "GAE"; budget = 130; val = 1100; stName = "더 아델라르스호르스트"; stCap = 10000 }
    "N.E.C. Nijmegen" = @{ key = "NEC_네이메헌"; name = "NEC 네이메헌"; city = "네이메헌"; country = "네덜란드"; leagueId = "eredivisie"; logo = "NEC"; budget = 150; val = 1300; stName = "고페르트스타디온"; stCap = 12500 }
    "PEC Zwolle" = @{ key = "PEC_즈볼레"; name = "PEC 즈볼레"; city = "즈볼레"; country = "네덜란드"; leagueId = "eredivisie"; logo = "ZWO"; budget = 130; val = 1100; stName = "MAC³PARK 스타디온"; stCap = 14000 }
    "PSV" = @{ key = "PSV_에인트호번"; name = "PSV 에인트호번"; city = "에인트호번"; country = "네덜란드"; leagueId = "eredivisie"; logo = "PSV"; budget = 600; val = 5500; stName = "필립스 스타디온"; stCap = 35000 }
    "SC Cambuur" = @{ key = "캄뷔르"; name = "SC 캄뷔르"; city = "레이와르던"; country = "네덜란드"; leagueId = "eredivisie"; logo = "CAM"; budget = 120; val = 1000; stName = "코비시 스타디온"; stCap = 15000 }
    "sc Heerenveen" = @{ key = "헤이렌베인"; name = "SC 헤이렌베인"; city = "헤이렌베인"; country = "네덜란드"; leagueId = "eredivisie"; logo = "HEE"; budget = 160; val = 1400; stName = "아베 렌스트라 스타디온"; stCap = 26100 }
    "SC Telstar" = @{ key = "텔스타"; name = "SC 텔스타"; city = "펠선"; country = "네덜란드"; leagueId = "eredivisie"; logo = "TEL"; budget = 100; val = 800; stName = "BUKO 스타디온"; stCap = 5250 }
    "Sparta Rotterdam" = @{ key = "스파르타_로테르담"; name = "스파르타 로테르담"; city = "로테르담"; country = "네덜란드"; leagueId = "eredivisie"; logo = "SPA"; budget = 150; val = 1300; stName = "스파르타 스타디온 헷 카스틸"; stCap = 11000 }
    "Willem II" = @{ key = "빌럼_II"; name = "빌럼 II"; city = "틸뷔르흐"; country = "네덜란드"; leagueId = "eredivisie"; logo = "WIL"; budget = 130; val = 1100; stName = "코닝 빌럼 II 스타디온"; stCap = 14700 }

    # --- Liga Portugal (18) ---
    "Académico de Viseu FC" = @{ key = "비제우"; name = "비제우"; city = "비제우"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "VIS"; budget = 120; val = 1000; stName = "에스타디우 두 폰텔루"; stCap = 12000 }
    "Arouca" = @{ key = "아로카"; name = "FC 아로카"; city = "아로카"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "ARO"; budget = 140; val = 1200; stName = "에스타디우 무니시팔 드 아로카"; stCap = 5000 }
    "Casa Pia AC" = @{ key = "카사_피아"; name = "카사 피아 AC"; city = "리스본"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "CAS"; budget = 130; val = 1100; stName = "에스타디우 피나 마니크"; stCap = 2574 }
    "Estoril Praia" = @{ key = "에스토릴"; name = "에스토릴 프라이아"; city = "에스토릴"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "EST"; budget = 150; val = 1300; stName = "에스타디우 안토니우 코임브라 다 모타"; stCap = 8000 }
    "Estrela Amadora" = @{ key = "에스트렐라"; name = "에스트렐라 다 아마도라"; city = "아마도라"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "EAM"; budget = 130; val = 1100; stName = "에스타디우 조제 고메스"; stCap = 9288 }
    "FC Alverca" = @{ key = "알베르카"; name = "FC 알베르카"; city = "알베르카"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "ALV"; budget = 120; val = 1000; stName = "컴플렉소 데스포르티보 두 FC 알베르카"; stCap = 7705 }
    "FC Famalicão" = @{ key = "파말리캉"; name = "FC 파말리캉"; city = "파말리캉"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "FAM"; budget = 160; val = 1400; stName = "에스타디우 무니시팔 22 드 주뇨"; stCap = 5186 }
    "FC Porto" = @{ key = "FC_포르투"; name = "FC 포르투"; city = "포르투"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "POR"; budget = 650; val = 6000; stName = "에스타디우 두 드라강"; stCap = 50033 }
    "Gil Vicente" = @{ key = "질_비센테"; name = "질 비센테 FC"; city = "바르셀루스"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "GIL"; budget = 140; val = 1200; stName = "에스타디우 시다드 드 바르셀루스"; stCap = 12504 }
    "Marítimo da Madeira" = @{ key = "마리티무"; name = "CS 마리티무"; city = "푼샬"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "MAR"; budget = 140; val = 1200; stName = "에스타디우 두 마리티무"; stCap = 10600 }
    "Moreirense FC" = @{ key = "모레이렌스"; name = "모레이렌스 FC"; city = "모레이라드코네고스"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "MOR"; budget = 130; val = 1100; stName = "파르케 조아킹 드 알메이다 프레이타스"; stCap = 6153 }
    "Nacional" = @{ key = "나시오날"; name = "CD 나시오날"; city = "푼샬"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "NAC"; budget = 130; val = 1100; stName = "에스타디우 다 마데이라"; stCap = 5200 }
    "Rio Ave FC" = @{ key = "히우_아브"; name = "히우 아브 FC"; city = "빌라두콘드"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "RAV"; budget = 150; val = 1300; stName = "에스타디우 두스 아르쿠스"; stCap = 9065 }
    "Santa Clara" = @{ key = "산타_클라라"; name = "CD 산타 클라라"; city = "폰타델가다"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "SAN"; budget = 140; val = 1200; stName = "에스타디우 데 사오 미겔"; stCap = 13277 }
    "SC Braga" = @{ key = "SC_브라가"; name = "SC 브라가"; city = "브라가"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "BRA"; budget = 400; val = 3800; stName = "에스타디우 무니시팔 드 브라가"; stCap = 30286 }
    "SL Benfica" = @{ key = "벤피카"; name = "SL 벤피카"; city = "리스본"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "SLB"; budget = 700; val = 7000; stName = "이스타디우 다 루스"; stCap = 64642 }
    "Sporting CP" = @{ key = "스포르팅_CP"; name = "스포르팅 CP"; city = "리스본"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "SCP"; budget = 650; val = 6500; stName = "이스타디우 조제 알발라드"; stCap = 50095 }
    "Vitória SC" = @{ key = "비토리아_기마랑이스"; name = "비토리아 기마랑이스"; city = "기마랑이스"; country = "포르투갈"; leagueId = "liga_portugal"; logo = "VIT"; budget = 250; val = 2400; stName = "에스타디우 D. 아폰수 엔히크스"; stCap = 30029 }

    # --- Süper Lig (18) ---
    "Alanyaspor" = @{ key = "알라냐스포르"; name = "알라냐스포르"; city = "알라냐"; country = "튀르키예"; leagueId = "super_lig"; logo = "ALA"; budget = 180; val = 1600; stName = "알라냐 오바 스타디움"; stCap = 10128 }
    "Amed Sportif Faaliyetler" = @{ key = "아메드"; name = "아메드 SFK"; city = "디야르바키르"; country = "튀르키예"; leagueId = "super_lig"; logo = "AME"; budget = 140; val = 1200; stName = "디야르바키르 스타디움"; stCap = 33000 }
    "Başakşehir" = @{ key = "바샥셰히르"; name = "이스탄불 바샥셰히르"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "IBF"; budget = 300; val = 2800; stName = "바샥셰히르 파티흐 테림 스타디움"; stCap = 17300 }
    "Beşiktaş" = @{ key = "베식타스"; name = "베식타스 JK"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "BES"; budget = 500; val = 4500; stName = "튀프라쉬 스타디움"; stCap = 42590 }
    "Çaykur Rizespor" = @{ key = "리제스포르"; name = "차이쿠르 리제스포르"; city = "리제"; country = "튀르키예"; leagueId = "super_lig"; logo = "RIZ"; budget = 160; val = 1400; stName = "차이쿠르 디디 스타디움"; stCap = 15332 }
    "Çorum Futbol Kulübü" = @{ key = "초룸_FK"; name = "초룸 FK"; city = "초룸"; country = "튀르키예"; leagueId = "super_lig"; logo = "COR"; budget = 120; val = 1000; stName = "초룸 시티 스타디움"; stCap = 15000 }
    "Erzurumspor Futbol Kulübü" = @{ key = "에르주룸스포르"; name = "에르주룸스포르 FK"; city = "에르주룸"; country = "튀르키예"; leagueId = "super_lig"; logo = "ERZ"; budget = 130; val = 1100; stName = "카짐 카라베키르 스타디움"; stCap = 21374 }
    "Eyüpspor" = @{ key = "에위프스포르"; name = "에위프스포르"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "EYU"; budget = 200; val = 1800; stName = "에윱 스타디움"; stCap = 2500 }
    "Fenerbahçe" = @{ key = "페네르바체"; name = "페네르바체 SK"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "FEN"; budget = 650; val = 6000; stName = "쉬크뤼 사라졸루 스타디움"; stCap = 47834 }
    "Galatasaray" = @{ key = "갈라타사라이"; name = "갈라타사라이 SK"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "GAL"; budget = 700; val = 6500; stName = "RAMS 파크"; stCap = 52280 }
    "Gaziantep" = @{ key = "가지안테프"; name = "가지안테프 FK"; city = "가지안테프"; country = "튀르키예"; leagueId = "super_lig"; logo = "GAZ"; budget = 160; val = 1400; stName = "가지안테프 스타디움"; stCap = 33502 }
    "Gençlerbirliği" = @{ key = "겐츨레르비를리이"; name = "겐츨레르비를리이 SK"; city = "앙카라"; country = "튀르키예"; leagueId = "super_lig"; logo = "GEN"; budget = 140; val = 1200; stName = "에리야만 스타디움"; stCap = 20560 }
    "Göztepe" = @{ key = "괴즈테페"; name = "괴즈테페 SK"; city = "리즈미르"; country = "튀르키예"; leagueId = "super_lig"; logo = "GOZ"; budget = 180; val = 1600; stName = "귀르셀 악셀 스타디움"; stCap = 20040 }
    "Kasımpaşa" = @{ key = "카슴파샤"; name = "카슴파샤 SK"; city = "이스탄불"; country = "튀르키예"; leagueId = "super_lig"; logo = "KAS"; budget = 180; val = 1600; stName = "레제프 타이이프 에르도안 스타디움"; stCap = 14234 }
    "Kocaelispor" = @{ key = "코자엘리스포르"; name = "코자엘리스포르"; city = "이즈미트"; country = "튀르키예"; leagueId = "super_lig"; logo = "KOC"; budget = 150; val = 1300; stName = "코자엘리 스타디움"; stCap = 34924 }
    "Konyaspor" = @{ key = "코냐스포르"; name = "코냐스포르"; city = "코냐"; country = "튀르키예"; leagueId = "super_lig"; logo = "KON"; budget = 160; val = 1400; stName = "메드아쉬 코냐 시티 스타디움"; stCap = 42000 }
    "Samsunspor" = @{ key = "삼순스포르"; name = "삼순스포르"; city = "삼순"; country = "튀르키예"; leagueId = "super_lig"; logo = "SAM"; budget = 180; val = 1600; stName = "삼순 19 마이스 스타디움"; stCap = 33919 }
    "Trabzonspor" = @{ key = "트라브존스포르"; name = "트라브존스포르"; city = "트라브존"; country = "튀르키예"; leagueId = "super_lig"; logo = "TRA"; budget = 350; val = 3200; stName = "파프라 파크"; stCap = 40782 }

    # --- K League 1 (12) ---
    "Bucheon FC 1995" = @{ key = "부천_FC"; name = "부천 FC 1995"; city = "부천"; country = "대한민국"; leagueId = "kleague_1"; logo = "BUC"; budget = 80; val = 700; stName = "부천종합운동장"; stCap = 35456 }
    "Daejeon Hana" = @{ key = "대전_하나"; name = "대전 하나 시티즌"; city = "대전"; country = "대한민국"; leagueId = "kleague_1"; logo = "DHN"; budget = 150; val = 1300; stName = "대전월드컵경기장"; stCap = 40535 }
    "FC Anyang" = @{ key = "FC_안양"; name = "FC 안양"; city = "안양"; country = "대한민국"; leagueId = "kleague_1"; logo = "ANY"; budget = 80; val = 700; stName = "안양종합운동장"; stCap = 17143 }
    "FC Seoul" = @{ key = "FC_서울"; name = "FC 서울"; city = "서울"; country = "대한민국"; leagueId = "kleague_1"; logo = "SEO"; budget = 200; val = 1800; stName = "서울월드컵경기장"; stCap = 66704 }
    "Gangwon FC" = @{ key = "강원_FC"; name = "강원 FC"; city = "강원"; country = "대한민국"; leagueId = "kleague_1"; logo = "GWN"; budget = 120; val = 1000; stName = "춘천송암스포츠타운"; stCap = 20000 }
    "Gimcheon Sangmu" = @{ key = "김천_상무"; name = "김천 상무"; city = "김천"; country = "대한민국"; leagueId = "kleague_1"; logo = "GMC"; budget = 80; val = 700; stName = "김천종합운동장"; stCap = 25000 }
    "Gwangju FC" = @{ key = "광주_FC"; name = "광주 FC"; city = "광주"; country = "대한민국"; leagueId = "kleague_1"; logo = "GWJ"; budget = 100; val = 900; stName = "광주축구전용구장"; stCap = 10007 }
    "Incheon United" = @{ key = "인천_유나이티드"; name = "인천 유나이티드"; city = "인천"; country = "대한민국"; leagueId = "kleague_1"; logo = "ICN"; budget = 120; val = 1000; stName = "인천축구전용경기장"; stCap = 20891 }
    "Jeju United" = @{ key = "제주_유나이티드"; name = "제주 유나이티드"; city = "제주"; country = "대한민국"; leagueId = "kleague_1"; logo = "JEJ"; budget = 130; val = 1100; stName = "제주월드컵경기장"; stCap = 29791 }
    "Jeonbuk Hyundai" = @{ key = "전북_현대"; name = "전북 현대 모터스"; city = "전북"; country = "대한민국"; leagueId = "kleague_1"; logo = "JHM"; budget = 250; val = 2200; stName = "전주월드컵경기장"; stCap = 36781 }
    "Pohang Steelers" = @{ key = "포항_스틸러스"; name = "포항 스틸러스"; city = "포항"; country = "대한민국"; leagueId = "kleague_1"; logo = "POH"; budget = 180; val = 1600; stName = "포항스틸야드"; stCap = 17443 }
    "Ulsan HD FC" = @{ key = "울산_현대"; name = "울산 HD"; city = "울산"; country = "대한민국"; leagueId = "kleague_1"; logo = "UHD"; budget = 250; val = 2300; stName = "울산문수축구경기장"; stCap = 44102 }
}

Write-Output "Configured $($clubMap.Count) clubs mapping."

