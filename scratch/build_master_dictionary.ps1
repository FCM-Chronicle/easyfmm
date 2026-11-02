# scratch/build_master_dictionary.ps1 - Pure ASCII
$utf8NoBom = New-Object System.Text.UTF8Encoding($false)
$utf8Bom = New-Object System.Text.UTF8Encoding($true)

Write-Host "Building master football dictionary..."

$dictData = [ordered]@{
    "firstNames" = [ordered]@{
        # A
        "Aaron" = "에런"; "Abdoulaye" = "압둘라예"; "Abdou" = "압두"; "Abdul" = "압둘"; "Abdullah" = "압둘라"
        "Abner" = "아브네르"; "Adam" = "아담"; "Adama" = "아다마"; "Ademola" = "아데몰라"; "Adil" = "아딜"
        "Adrian" = "아드리안"; "Adrián" = "아드리안"; "Aitor" = "아이토르"; "Albert" = "알베르트"; "Alberto" = "알베르토"
        "Alejandro" = "알레한드로"; "Aleksandar" = "알렉산다르"; "Aleksandr" = "알렉산드르"; "Ales" = "알레시"; "Alex" = "알렉스"
        "Alexander" = "알렉산더"; "Alexandre" = "알렉상드르"; "Alexis" = "알렉시스"; "Alfie" = "알피"; "Ali" = "알리"
        "Alisson" = "알리송"; "Allan" = "알랑"; "Alvaro" = "알바로"; "Álvaro" = "알바로"; "Amadou" = "아마두"
        "Amine" = "아민"; "Amir" = "아미르"; "Anders" = "안데르스"; "Andre" = "앙드레"; "André" = "앙드레"
        "Andrea" = "안드레아"; "Andreas" = "안드레아스"; "Andrei" = "안드레이"; "Andres" = "안드레스"; "Andrés" = "안드레스"
        "Andrew" = "앤드루"; "Andriy" = "안드리"; "Angel" = "앙헬"; "Ángel" = "앙헬"; "Angelo" = "안젤로"
        "Anthony" = "앤서니"; "Antoine" = "앙투안"; "Anton" = "안톤"; "Antonio" = "안토니오"; "António" = "안토니우"
        "Antony" = "안토니"; "Ansu" = "안수"; "Archie" = "아치"; "Arda" = "아르다"; "Armando" = "아르만도"
        "Arnau" = "아르나우"; "Arnaud" = "아르노"; "Arne" = "아르네"; "Arthur" = "아르튀르"; "Artur" = "아르투르"
        "Assan" = "아산"; "Athanasios" = "아타나시오스"; "Aurelien" = "오렐리앵"; "Aurélien" = "오렐리앵"; "Axel" = "악셀"
        "Ayoub" = "아유브"; "Aymeric" = "에므리크"

        # B
        "Bafode" = "바포데"; "Bakary" = "바카리"; "Bart" = "바르트"; "Bartosz" = "바르토시"; "Bas" = "바스"
        "Bastos" = "바스토스"; "Ben" = "벤"; "Benjamin" = "베냐민"; "Benoit" = "브누아"; "Benoît" = "브누아"
        "Berke" = "베르케"; "Bernardo" = "베르나르두"; "Bilal" = "빌랄"; "Bismark" = "비스마르크"; "Bo" = "보"
        "Bobby" = "바비"; "Boubacar" = "부바카르"; "Boubakar" = "부바카르"; "Bradley" = "브래들리"; "Brahim" = "브라힘"
        "Brajan" = "브라얀"; "Branislav" = "브라니슬라프"; "Brendan" = "브렌던"; "Brennan" = "브레넌"; "Brian" = "브라이언"
        "Brice" = "브리스"; "Bruno" = "브루누"; "Bryan" = "브라이언"; "Bukayo" = "부카요"; "Burak" = "부라크"

        # C
        "Caio" = "카이우"; "Caleb" = "케일럽"; "Callum" = "칼럼"; "Calvin" = "캘빈"; "Cameron" = "캐머런"
        "Carlos" = "카를로스"; "Casemiro" = "카세미루"; "Cesar" = "세사르"; "César" = "세사르"; "Charles" = "샤를"
        "Charlie" = "찰리"; "Cheick" = "셰이크"; "Chimi" = "치미"; "Chris" = "크리스"; "Christian" = "크리스티안"
        "Christopher" = "크리스토퍼"; "Christos" = "흐리스토스"; "Ciro" = "치로"; "Clement" = "클레망"; "Clément" = "클레망"
        "Cody" = "코디"; "Cole" = "콜"; "Colin" = "콜린"; "Conor" = "코너"; "Connor" = "코너"
        "Corentin" = "코랑탱"; "Cristhian" = "크리스티안"; "Cristian" = "크리스티안"; "Cristiano" = "크리스티아누"; "Curtis" = "커티스"

        # D
        "Daichi" = "다이치"; "Daizen" = "다이젠"; "Daley" = "데일리"; "Dan" = "댄"; "Dani" = "다니"
        "Daniel" = "다니엘"; "Danilo" = "다닐루"; "Danny" = "대니"; "Dany" = "다니"; "Dario" = "다리오"
        "Darwin" = "다윈"; "David" = "다비드"; "Davide" = "다비데"; "Davinson" = "다빈손"; "Davy" = "데이비"
        "Dean" = "딘"; "Dejan" = "데얀"; "Demba" = "뎀바"; "Denis" = "데니스"; "Dennis" = "데니스"
        "Denso" = "덴소"; "Derek" = "데릭"; "Derry" = "데리"; "Destiny" = "데스티니"; "Deyovaisio" = "데이오바이시오"
        "Diego" = "디에고"; "Dimitri" = "디미트리"; "Diogo" = "디오구"; "Dion" = "디온"; "Dirk" = "디르크"
        "Djibril" = "지브릴"; "Dominic" = "도미닉"; "Dominik" = "도미니크"; "Dorde" = "조르제"; "Douglas" = "더글러스"
        "Dries" = "드리스"; "Dusan" = "두샨"; "Dušan" = "두샨"; "Dylan" = "딜런"

        # E
        "Eberechi" = "에베레치"; "Eddie" = "에디"; "Edgar" = "에드가"; "Ederson" = "에데르송"; "Edin" = "에딘"
        "Edouard" = "에두아르"; "Eduard" = "에두아르트"; "Eduardo" = "에두아르도"; "Edward" = "에드워드"; "Elia" = "엘리아"
        "Elias" = "엘리아스"; "Eliel" = "엘리엘"; "Eliesse" = "엘리에스"; "Emil" = "에밀"; "Emiliano" = "에밀리아노"
        "Emilio" = "에밀리오"; "Emir" = "에미르"; "Emre" = "엠레"; "Emrecan" = "엠레잔"; "Endrick" = "엔드릭"
        "Enes" = "에네스"; "Enis" = "에니스"; "Enzo" = "엔조"; "Eric" = "에릭"; "Erik" = "에릭"
        "Ernest" = "어니스트"; "Erling" = "엘링"; "Esteban" = "에스테반"; "Ethan" = "이선"; "Etienne" = "에티엔"
        "Evan" = "에반"; "Evanilson" = "이바니우송"; "Ezequiel" = "에세키엘"; "Ezri" = "에즈리"

        # F
        "Fabian" = "파비안"; "Fabián" = "파비안"; "Fabio" = "파비우"; "Fábio" = "파비우"; "Fabrice" = "파브리스"
        "Facundo" = "파쿤도"; "Fares" = "파레스"; "Faruk" = "파루크"; "Federico" = "페데리코"; "Felipe" = "펠리피"
        "Felix" = "펠릭스"; "Félix" = "펠릭스"; "Ferdi" = "페르디"; "Ferland" = "페를랑"; "Fermin" = "페르민"
        "Fernando" = "페르난도"; "Ferran" = "페란"; "Filip" = "필립"; "Filippo" = "필리포"; "Florent" = "플로랑"
        "Florian" = "플로리안"; "Francesco" = "프란체스코"; "Francis" = "프란시스"; "Francisco" = "프란시스코"; "Franco" = "프랑코"
        "Frank" = "프랭크"; "Fraser" = "프레이저"; "Fred" = "프레드"; "Frederic" = "프레데리크"; "Frenkie" = "프렝키"

        # G
        "Gabriel" = "가브리에우"; "Gaetan" = "가에탕"; "Gaston" = "가스톤"; "Gavi" = "가비"; "Geoffrey" = "조프레"
        "George" = "조지"; "Georges" = "조르주"; "Georginio" = "조르지니오"; "Gerard" = "제라르"; "Gerson" = "제르송"
        "Gianluigi" = "잔루이지"; "Gianluca" = "잔루카"; "Gideon" = "기디온"; "Gilles" = "질"; "Giorgi" = "기오르기"
        "Giorgio" = "조르조"; "Giovanni" = "지오바니"; "Giuliano" = "줄리아노"; "Giuseppe" = "주세페"; "Gleison" = "글레이송"
        "Goncalo" = "곤살루"; "Gonçalo" = "곤살루"; "Gonzalo" = "곤살로"; "Gorka" = "고르카"; "Granit" = "그라니트"
        "Gregor" = "그레고어"; "Gregory" = "그레고리"; "Guglielmo" = "굴리엘모"; "Guilherme" = "길례르미"; "Gustavo" = "구스타보"

        # H
        "Habib" = "하비브"; "Hakan" = "하칸"; "Hamari" = "하마리"; "Hamza" = "함자"; "Hans" = "한스"
        "Haris" = "하리스"; "Harrison" = "해리슨"; "Harry" = "해리"; "Harvey" = "하비"; "Hector" = "엑토르"
        "Héctor" = "엑토르"; "Henrik" = "헨리크"; "Henry" = "헨리"; "Heung-min" = "손흥민"; "Hiroki" = "히로키"
        "Hugo" = "위고"

        # I - J
        "Iago" = "이아고"; "Ian" = "이안"; "Ibrahima" = "이브라히마"; "Ignacio" = "이그나시오"; "Igor" = "이고르"
        "Iker" = "이케르"; "Ilkay" = "일카이"; "Illan" = "일란"; "Ilyes" = "일리에스"; "Inaki" = "이냐키"
        "Inigo" = "이니고"; "Iñigo" = "이니고"; "Isaac" = "아이작"; "Isak" = "이삭"; "Ismael" = "이스마엘"
        "Ismail" = "이스마일"; "Ivan" = "이반"; "Iwan" = "이완"; "Jack" = "잭"; "Jacob" = "제이콥"
        "Jadon" = "제이든"; "Jakub" = "야쿠프"; "Jamal" = "자말"; "James" = "제임스"; "Jan" = "얀"
        "Jari" = "야리"; "Jarrod" = "재러드"; "Jasin" = "야신"; "Jason" = "제이슨"; "Jasper" = "야스퍼"
        "Javi" = "하비"; "Javier" = "하비에르"; "Jean" = "장"; "Jean-Philippe" = "장필리프"; "Jed" = "제드"
        "Jeffrey" = "제프리"; "Jeong" = "정"; "Jeremie" = "제레미"; "Jeremy" = "제레미"; "Jérémie" = "제레미"
        "Jesper" = "예스페르"; "Jesse" = "제시"; "Jesus" = "헤수스"; "Jesús" = "헤수스"; "Jhon" = "존"
        "Jim" = "짐"; "Joao" = "주앙"; "João" = "주앙"; "Joaquin" = "호아킨"; "Joe" = "조"
        "Joel" = "조엘"; "Joelinton" = "조엘린톤"; "Johan" = "요한"; "John" = "존"; "Jonas" = "요나스"
        "Jonathan" = "조너선"; "Jordan" = "조던"; "Jordi" = "조르디"; "Jorge" = "호르헤"; "Jose" = "호세"
        "José" = "호세"; "Josep" = "주제프"; "Josh" = "조시"; "Joshua" = "조슈아"; "Josip" = "요시프"
        "Josko" = "요슈코"; "Joško" = "요슈코"; "Juan" = "후안"; "Jude" = "주드"; "Jules" = "쥘"
        "Julian" = "율리안"; "Julián" = "훌리안"; "Julien" = "쥘리앙"; "Julio" = "훌리오"; "Jurrien" = "유리엔"
        "Justin" = "저스틴"

        # K - L
        "Kai" = "카이"; "Kalvin" = "캘빈"; "Kamaldeen" = "카말딘"; "Kaoru" = "카오루"; "Karem" = "카렘"
        "Karim" = "카림"; "Karl" = "카를"; "Kasper" = "카스페르"; "Keinan" = "키넌"; "Keita" = "케이타"
        "Kelvin" = "켈빈"; "Kenan" = "케난"; "Kenny" = "케니"; "Kepa" = "케파"; "Kerem" = "케렘"
        "Kevin" = "케빈"; "Khvicha" = "흐비차"; "Kieran" = "키어런"; "Kilian" = "킬리안"; "Kim" = "김"
        "Kingsley" = "킹슬레"; "Kingstone" = "킹스턴"; "Klaas" = "클라스"; "Klaas-Jan" = "클라스얀"; "Koba" = "코바"
        "Kobbie" = "코비"; "Koke" = "코케"; "Konrad" = "콘라트"; "Kostas" = "코스타스"; "Kouadio" = "쿠아디오"
        "Kurt" = "퀴르트"; "Kyle" = "카일"; "Kylian" = "킬리안"; "Kyogo" = "쿄고"

        "Lamine" = "라민"; "Lars" = "라르스"; "Lautaro" = "라우타로"; "Lee" = "이"; "Leif" = "라이프"
        "Leny" = "레니"; "Leo" = "레오"; "Leon" = "레온"; "Leonardo" = "레오나르도"; "Leopold" = "레오폴트"
        "Leroy" = "르로이"; "Levi" = "레비"; "Lewis" = "루이스"; "Liam" = "리암"; "Linus" = "리누스"
        "Lionel" = "리오넬"; "Lisandro" = "리산드로"; "Lloyd" = "로이드"; "Logan" = "로건"; "Lois" = "로이스"
        "Loïc" = "로이크"; "Lorenzo" = "로렌초"; "Loris" = "로리스"; "Louie" = "루이"; "Louis" = "루이"
        "Luca" = "루카"; "Lucas" = "루카스"; "Ludovic" = "뤼도비크"; "Luis" = "루이스"; "Luiz" = "루이스"
        "Luka" = "루카"; "Lukas" = "루카스"; "Luke" = "루크"; "Luuk" = "뤽"

        # M - N
        "Mads" = "마스"; "Magnus" = "마그누스"; "Mahmoud" = "마흐무드"; "Malang" = "말랑"; "Malick" = "말리크"
        "Malo" = "말로"; "Manuel" = "마누엘"; "Marc" = "마르크"; "Marcel" = "마르셀"; "Marco" = "마르코"
        "Marcos" = "마르코스"; "Marcus" = "마커스"; "Mario" = "마리오"; "Marius" = "마리우스"; "Mark" = "마크"
        "Marko" = "마르코"; "Martin" = "마르틴"; "Martín" = "마르틴"; "Martim" = "마르팀"; "Marvin" = "마빈"
        "Mason" = "메이슨"; "Mateo" = "마테오"; "Mateus" = "마테우스"; "Matheo" = "마테오"; "Matheus" = "마테우스"
        "Mathias" = "마티아스"; "Mathieu" = "마티외"; "Mathis" = "마티스"; "Matias" = "마티아스"; "Matías" = "마티아스"
        "Mats" = "마츠"; "Matt" = "맷"; "Matteo" = "마테오"; "Mattia" = "마티아"; "Matty" = "매티"
        "Max" = "막스"; "Maxence" = "막상스"; "Maximilian" = "막시밀리안"; "Maxime" = "막심"; "Mehdi" = "메흐디"
        "Memphis" = "멤피스"; "Merih" = "메리흐"; "Michael" = "마이클"; "Michail" = "미카일"; "Michel" = "미셸"
        "Micky" = "미키"; "Miguel" = "미겔"; "Mikael" = "미카엘"; "Mike" = "마이크"; "Mikel" = "미켈"
        "Milan" = "밀란"; "Milos" = "밀로시"; "Miloš" = "밀로시"; "Mohamed" = "모하메드"; "Mohammed" = "모하메드"
        "Moises" = "모이세스"; "Moisés" = "모이세스"; "Morgan" = "모건"; "Morten" = "모르텐"; "Moussa" = "무사"
        "Munir" = "무니르"; "Mykhailo" = "미하일로"; "Myles" = "마일스"

        "Nabil" = "나빌"; "Nacho" = "나초"; "Nadiem" = "나딤"; "Naif" = "나이프"; "Nasser" = "나세르"
        "Nathan" = "네이선"; "Nathaniel" = "나다니엘"; "Neal" = "닐"; "Neco" = "네코"; "Nemanja" = "네마냐"
        "Neto" = "네투"; "Niclas" = "니클라스"; "Nico" = "니코"; "Nicolas" = "니콜라"; "Nicolás" = "니콜라스"
        "Nicolo" = "니콜로"; "Nicolò" = "니콜로"; "Niels" = "닐스"; "Nikita" = "니키타"; "Niklas" = "니클라스"
        "Nikola" = "니콜라"; "Nils" = "닐스"; "Noah" = "노아"; "Noel" = "노엘"; "Noni" = "노니"
        "Nouhou" = "누후"; "Noussair" = "누사이르"; "Nuno" = "누누"

        # O - P
        "Odsonne" = "오드손"; "Oihan" = "오이한"; "Oliver" = "올리버"; "Olivier" = "올리비에"; "Ollie" = "올리"
        "Omar" = "오마르"; "Orel" = "오렐"; "Orkun" = "오르쿤"; "Oscar" = "오스카"; "Óscar" = "오스카"
        "Osman" = "오스만"; "Ousmane" = "우스만"; "Owen" = "오웬"

        "Pablo" = "파블로"; "Pape" = "파페"; "Pascal" = "파스칼"; "Patrik" = "파트리크"; "Patrick" = "패트릭"
        "Paul" = "폴"; "Paulo" = "파울루"; "Pau" = "파우"; "Pedro" = "페드로"; "Pedri" = "페드리"
        "Pep" = "펩"; "Pere" = "페레"; "Peter" = "피터"; "Phil" = "필"; "Philip" = "필립"
        "Pierre" = "피에르"; "Pierre-Emerick" = "피에르에메릭"; "Pierre-Emile" = "피에르에밀"; "Piero" = "피에로"
        "Pietro" = "피에트로"; "Presnel" = "프레스넬"

        # R - S
        "Rafael" = "하파엘"; "Rafa" = "라파"; "Raheem" = "라힘"; "Ralf" = "랄프"; "Rami" = "라미"
        "Ramon" = "라몬"; "Ramy" = "라미"; "Randal" = "랑달"; "Raphael" = "라파엘"; "Raphaël" = "라파엘"
        "Raphinha" = "하피냐"; "Rasmus" = "라스무스"; "Raul" = "라울"; "Raúl" = "라울"; "Rayan" = "라얀"
        "Reece" = "리스"; "Reiss" = "리스"; "Remi" = "레미"; "Renan" = "헤낭"; "Renato" = "헤나투"
        "Rene" = "르네"; "Riccardo" = "리카르도"; "Richarlison" = "히샬리송"; "Rico" = "리코"; "Robert" = "로베르트"
        "Roberto" = "로베르토"; "Robin" = "로빈"; "Rodri" = "로드리"; "Rodrigo" = "로드리고"; "Rodrygo" = "호드리구"
        "Romain" = "로맹"; "Romeo" = "로메오"; "Romelu" = "로멜루"; "Ronald" = "로날드"; "Ronnie" = "로니"
        "Ross" = "로스"; "Ruben" = "후벵"; "Rúben" = "후벵"; "Rui" = "후이"; "Ryan" = "라이언"

        "Sadio" = "사디오"; "Saer" = "사에르"; "Said" = "사이드"; "Salih" = "살리흐"; "Salif" = "살리프"
        "Sam" = "샘"; "Sami" = "사미"; "Samu" = "사무"; "Samuel" = "사무엘"; "Sandro" = "산드로"
        "Santiago" = "산티아고"; "Santi" = "산티"; "Saul" = "사울"; "Saúl" = "사울"; "Sean" = "션"
        "Sebastian" = "제바스티안"; "Sebastien" = "세바스티앙"; "Seko" = "세코"; "Senny" = "세니"; "Serge" = "세르주"
        "Sergej" = "세르게이"; "Sergio" = "세르히오"; "Serhou" = "세루"; "Seung-woo" = "이승우"; "Shkodran" = "슈코드란"
        "Sidney" = "시드니"; "Sidny" = "시드니"; "Silas" = "실라스"; "Simon" = "시몬"; "Solly" = "솔리"
        "Son" = "손흥민"; "Stefan" = "슈테판"; "Stephane" = "스테판"; "Stephen" = "스티븐"; "Steven" = "스티븐"
        "Sven" = "스벤"

        # T - Z
        "Takefusa" = "타케후사"; "Takehiro" = "타케히로"; "Tanguy" = "탕기"; "Tariq" = "타릭"; "Teun" = "퇸"
        "Théophile" = "테오필"; "Theo" = "테오"; "Théo" = "테오"; "Thiago" = "티아고"; "Thibaut" = "티보"
        "Thomas" = "토마스"; "Tiago" = "티아구"; "Tijjani" = "티자니"; "Tim" = "팀"; "Timo" = "티모"
        "Timothy" = "티모시"; "Toby" = "토비"; "Tom" = "톰"; "Tomas" = "토마시"; "Tomás" = "토마스"
        "Tommy" = "토미"; "Toni" = "토니"; "Trent" = "트렌트"; "Tristan" = "트리스탄"; "Tyler" = "타일러"
        "Tyrell" = "타이렐"; "Tyrone" = "타이론"

        "Unai" = "우나이"; "Valentin" = "발렝탱"; "Vanja" = "바냐"; "Vicente" = "비센테"; "Victor" = "빅터"
        "Viktor" = "빅토르"; "Vinicius" = "비니시우스"; "Vinícius" = "비니시우스"; "Virgil" = "버질"; "Vitaly" = "비탈리"
        "Vitinha" = "비티냐"; "Vlad" = "블라드"; "Vladimir" = "블라디미르"

        "Warren" = "와렌"; "Wataru" = "와타루"; "Wesley" = "웨슬리"; "Wilfried" = "윌프리드"; "William" = "윌리엄"
        "Willi" = "빌리"; "Willy" = "윌리"; "Wilson" = "윌슨"; "Wissam" = "위삼"; "Wout" = "바우트"

        "Xavi" = "샤비"; "Xavier" = "샤비에르"

        "Yacine" = "야신"; "Yann" = "얀"; "Yannick" = "야니크"; "Yasin" = "야신"; "Yaya" = "야야"
        "Yoane" = "요안"; "Yohan" = "요앙"; "Yoro" = "요로"; "Youcef" = "유세프"; "Youri" = "유리"
        "Youssef" = "유세프"; "Youssouf" = "유수프"; "Yves" = "이브"

        "Zack" = "잭"; "Zeno" = "제노"; "Zinedine" = "지네딘"; "Zlatan" = "즐라탄"
    }

    "surnames" = [ordered]@{
        # Famous & Nordic & Surnames
        "Gudmundsson" = "구드문드손"; "Guðmundsson" = "구드문드손"; "Gudmunds" = "구드문즈"
        "Andersen" = "안데르센"; "Anderson" = "앤더슨"; "Andersson" = "안데르손"
        "Christensen" = "크리스텐센"; "Eriksen" = "에릭센"; "Hansen" = "한센"; "Jorgensen" = "외르겐센"
        "Larsson" = "라르손"; "Nilsson" = "닐손"; "Johansson" = "요한손"; "Lindelof" = "린델뢰프"
        "Isak" = "이삭"; "Kulusevski" = "쿨루셉스키"; "Gyokeres" = "요케레스"; "Gyökeres" = "요케레스"
        "Hojlund" = "호일룬"; "Højlund" = "호일룬"; "Odegaard" = "외데고르"; "Ødegaard" = "외데고르"
        "Hojbjerg" = "호이비에르"; "Højbjerg" = "호이비에르"; "Kjaer" = "키예르"; "Dolberg" = "돌베르"
        "Braithwaite" = "브레이스웨이트"; "Schmeichel" = "슈마이켈"; "Damsgaard" = "담스고르"

        # French & Dutch & German & Turkish
        "Mayulu" = "마율루"; "Bermont" = "베르몽"; "Ebong" = "에봉"; "Sangui" = "상기"
        "Amougou" = "아무구"; "Lutin" = "뤼탱"; "Bakayoko" = "바카요코"; "Onyeka" = "온예카"
        "Mutandwa" = "무탄드와"; "Nourani" = "누라니"; "Bojang" = "보장"; "Bulut" = "불루트"
        "Unyay" = "윈야이"; "Ünyay" = "윈야이"; "Prioste" = "프리오스트"; "Cabral" = "카브랄"
        "Lukovic" = "루코비치"; "Luković" = "루코비치"; "Goglichidze" = "고글리치제"
        "Calhanoglu" = "찰하놀루"; "Çalhanoğlu" = "찰하놀루"; "Guler" = "귈레르"; "Güler" = "귈레르"
        "Yildiz" = "일디즈"; "Yıldız" = "일디즈"; "Kokcu" = "쾨크취"; "Kökçü" = "쾨크취"
        "Demirbay" = "데미르바이"; "Aktürkoğlu" = "아크튀르코을루"; "Akturkoglu" = "아크튀르코을루"
        "Baris" = "바르쉬"; "Bardakci" = "바르닥치"; "Bardakcı" = "바르닥치"
        "Cakir" = "차크르"; "Çakır" = "차크르"; "Gunok" = "귀녹"; "Günok" = "귀녹"

        # Italian & Spanish & Portuguese & English
        "Barella" = "바렐라"; "Bastoni" = "바스토니"; "Dimarco" = "디마르코"; "Thuram" = "튀랑"
        "Martinez" = "마르티네스"; "Martínez" = "마르티네스"; "Vlahovic" = "블라호비치"; "Vlahović" = "블라호비치"
        "Koopmeiners" = "코프메이너르스"; "Bremer" = "브레메르"; "Leao" = "레앙"; "Leão" = "레앙"
        "Hernandez" = "에르난데스"; "Hernández" = "에르난데스"; "Pulisic" = "풀리식"; "Morata" = "모라타"
        "Reijnders" = "레인더르스"; "Fofana" = "포파나"; "Maignan" = "메냥"; "Kvaratskhelia" = "크바라츠헬리아"
        "Osimhen" = "오시멘"; "Lukaku" = "루카쿠"; "Anguissa" = "앙귀사"; "Di Lorenzo" = "디 로렌초"
        "Meret" = "메레트"; "Dovbyk" = "도우비크"; "Dybala" = "디발라"; "Pellegrini" = "펠레그리니"
        "Mancini" = "만치니"; "Ndicka" = "은디카"; "Zaccagni" = "차카니"; "Guendouzi" = "귀엥두지"
        "Castellanos" = "카스테야노스"; "Kean" = "킨"; "De Gea" = "데 헤아"; "Gosens" = "고젠스"
        "Dodo" = "도도"; "Dodô" = "도도"; "Colpani" = "콜파니"; "Bove" = "보베"; "Guirassy" = "기라시"
        "Adeyemi" = "아데예미"; "Brandt" = "브란트"; "Sabitzer" = "자비처"; "Schlotterbeck" = "슐로터베크"
        "Kobel" = "코벨"; "Openda" = "오펜다"; "Sesko" = "셰슈코"; "Šeško" = "셰슈코"; "Simons" = "시몬스"
        "Olmo" = "올모"; "Raum" = "라우름"; "Gulacsi" = "굴라치"; "Wirtz" = "비르츠"; "Boniface" = "보니페이스"
        "Frimpong" = "프림퐁"; "Grimaldo" = "그리말도"; "Xhaka" = "자카"; "Tah" = "타"; "Hradecky" = "흐라데츠키"
        "Marmoush" = "마르무시"; "Ekitike" = "에키티케"; "Trapp" = "트랍"; "Dembele" = "뎀벨레"
        "Dembélé" = "뎀벨레"; "Barcola" = "바르콜라"; "Hakimi" = "하키미"; "Vitinha" = "비티냐"
        "Neves" = "네베스"; "Marquinhos" = "마르키뉴스"; "Donnarumma" = "돈나룸마"; "Greenwood" = "그린우드"
        "Wahi" = "와히"; "Rulli" = "룰리"; "David" = "데이비드"; "Zhegrova" = "제그로바"; "Chevalier" = "슈발리에"
        "Golovin" = "골로빈"; "Ben Seghir" = "벤 세기르"; "Zakaria" = "자카리아"; "Kehrer" = "케러"
        "Kohn" = "쾬"; "Lacazette" = "라카제트"; "Cherki" = "체르키"; "Mikautadze" = "미카우타제"
        "Tolisso" = "톨리소"; "Perri" = "페히"; "Gimenez" = "히메네스"; "Giménez" = "히메네스"
        "Hancko" = "한츠코"; "Timber" = "팀버르"; "Wellreuther" = "벨렌로이터"; "Brobbey" = "브로비"
        "Berghuis" = "베르하위스"; "Taylor" = "테일러"; "Hato" = "하토"; "Pasveer" = "파스베이르"
        "De Jong" = "더 용"; "Lang" = "랑"; "Bakayoko" = "바카요코"; "Veerman" = "페이르만"
        "Schouten" = "스하우턴"; "Dest" = "데스트"; "Benitez" = "베니테스"; "Trincao" = "트링캉"
        "Trincão" = "트링캉"; "Pote" = "포테"; "Hjulmand" = "율만"; "Inacio" = "이나시우"
        "Inácio" = "이나시우"; "Diomande" = "디오망데"; "Israel" = "이스라엘"; "Pavlidis" = "파블리디스"
        "Di Maria" = "디 마리아"; "Di María" = "디 마리아"; "Otamendi" = "오타멘디"; "Trubin" = "트루빈"
        "Samu" = "사무"; "Galeno" = "갈레누"; "Varela" = "바렐라"; "Nico" = "니코"; "Costa" = "코스타"
        "Icardi" = "이카르디"; "Mertens" = "메르텐스"; "Torreira" = "토레이라"; "Davinson" = "다빈손"
        "Muslera" = "무슬레라"; "Dzeko" = "제코"; "Džeko" = "제코"; "En-Nesyri" = "엔네시리"
        "Tadic" = "타디치"; "Tadić" = "타디치"; "Szymanski" = "시만스키"; "Szymański" = "시만스키"
        "Fred" = "프레드"; "Amrabat" = "암라바트"; "Livakovic" = "리바코비치"; "Livaković" = "리바코비치"
        "Immobile" = "임모빌레"; "Rafa" = "라파"; "Fernandes" = "페르난드스"; "Al-Musrati" = "알무스라티"
        "Banza" = "반자"; "Visca" = "비슈차"; "Mendy" = "멘디"; "Rice" = "라이스"; "Saliba" = "살리바"
        "Saka" = "사카"; "Martinelli" = "마르티넬리"; "Havertz" = "하베르츠"; "Rashford" = "래시포드"
        "Mainoo" = "마이누"; "Garnacho" = "가르나초"; "Foden" = "포든"; "Haaland" = "홀란드"
        "De Bruyne" = "더 브라위너"; "Rodri" = "로드리"; "Dias" = "디아스"; "Gvardiol" = "그바르디올"
        "Walker" = "워커"; "Ederson" = "에데르송"; "Watkins" = "왓킨스"; "Bailey" = "베일리"
        "Konsa" = "콘사"; "Tielemans" = "틸레만스"; "Rogers" = "로저스"; "Duran" = "두란"
        "Bowen" = "보웬"; "Kudus" = "쿠두스"; "Paqueta" = "파케타"; "Paquetá" = "파케타"
        "Soucek" = "소우체크"; "Souček" = "소우체크"; "Areola" = "아레올라"; "Kilman" = "킬먼"
        "Solanke" = "솔랑케"; "Son" = "손흥민"; "Maddison" = "매디슨"; "Kulusevski" = "쿨루셉스키"
        "Bentancur" = "벤탄쿠르"; "Van de Ven" = "판 더 펜"; "Romero" = "로메로"; "Porro" = "포로"
        "Vicario" = "비카리오"; "Johnson" = "존슨"; "Udogie" = "우도기"; "Sarr" = "사르"
        "Bissouma" = "비수마"; "Spence" = "스펜스"; "Dragusin" = "드라구신"; "Forster" = "포스터"
        "Setford" = "셋포드"; "Raya" = "라야"; "Zubimendi" = "수비멘디"; "Merino" = "메리노"
        "Calafiori" = "칼라피오리"; "Kepa" = "케파"; "Nwaneri" = "은와네리"
    }

    "multi" = [ordered]@{
        "gudmundsson" = "구드문드손"; "gudmunds" = "구드문즈"; "sson" = "손"
        "mund" = "문드"; "berg" = "베르크"; "burg" = "부르크"; "bert" = "베르트"
        "ford" = "포드"; "field" = "필드"; "wood" = "우드"; "stein" = "슈타인"
        "mann" = "만"; "mont" = "몬트"; "ville" = "빌"; "bridge" = "브리지"
        "stone" = "스톤"; "land" = "란트"; "lund" = "룬드"; "ovic" = "오비치"
        "evic" = "에비치"; "vic" = "비치"; "ic" = "이치"; "sky" = "스키"
        "ski" = "스키"; "sen" = "센"; "son" = "손"; "inho" = "이뉴"
        "inha" = "이냐"; "sch" = "슈"; "ch" = "치"; "sh" = "시"
        "ph" = "프"; "th" = "트"; "ck" = "크"; "qu" = "콰"
    }

    "codaSyllables" = [ordered]@{
        "al" = "알"; "el" = "엘"; "il" = "일"; "ol" = "올"; "ul" = "울"
        "an" = "안"; "en" = "엔"; "in" = "인"; "on" = "온"; "un" = "운"
        "am" = "암"; "em" = "엠"; "im" = "임"; "om" = "옴"; "um" = "움"
        "ar" = "아르"; "er" = "에르"; "ir" = "이르"; "or" = "오르"; "ur" = "우르"
        "ang" = "앙"; "eng" = "엥"; "ing" = "잉"; "ong" = "옹"; "ung" = "웅"

        "ban" = "반"; "ben" = "벤"; "bin" = "빈"; "bon" = "본"; "bun" = "분"
        "bal" = "발"; "bel" = "벨"; "bil" = "빌"; "bol" = "볼"; "bul" = "불"
        "bam" = "밤"; "bem" = "벰"; "bim" = "빔"; "bom" = "봄"; "bum" = "붐"
        "bar" = "바르"; "ber" = "베르"; "bir" = "비르"; "bor" = "보르"; "bur" = "부르"
        "bang" = "방"; "beng" = "벵"; "bing" = "빙"; "bong" = "봉"; "bung" = "붕"

        "can" = "칸"; "cen" = "센"; "cin" = "신"; "con" = "콘"; "cun" = "쿤"
        "cal" = "칼"; "cel" = "셀"; "cil" = "실"; "col" = "콜"; "cul" = "쿨"
        "cam" = "캄"; "cem" = "셈"; "cim" = "심"; "com" = "콤"; "cum" = "쿰"
        "car" = "카르"; "cer" = "세르"; "cir" = "시르"; "cor" = "코르"; "cur" = "쿠르"
        "cang" = "캉"; "kang" = "캉"; "king" = "킹"; "kong" = "콩"
        "kan" = "칸"; "ken" = "켄"; "kin" = "킨"; "kon" = "콘"; "kun" = "쿤"
        "kal" = "칼"; "kel" = "켈"; "kil" = "킬"; "kol" = "콜"; "kul" = "쿨"
        "kam" = "캄"; "kem" = "켐"; "kim" = "킴"; "kom" = "콤"; "kum" = "쿰"
        "kar" = "카르"; "ker" = "케르"; "kir" = "키르"; "kor" = "코르"; "kur" = "쿠르"

        "dan" = "단"; "den" = "덴"; "din" = "딘"; "don" = "돈"; "dun" = "둔"
        "dal" = "달"; "del" = "델"; "dil" = "딜"; "dol" = "돌"; "dul" = "둘"
        "dam" = "담"; "dem" = "뎀"; "dim" = "딤"; "dom" = "돔"; "dum" = "둠"
        "dar" = "다르"; "der" = "데르"; "dir" = "디르"; "dor" = "도르"; "dur" = "두르"
        "dang" = "당"; "deng" = "뎅"; "ding" = "딩"; "dong" = "동"; "dung" = "둥"

        "fan" = "판"; "fen" = "펜"; "fin" = "핀"; "fon" = "폰"; "fun" = "푼"
        "fal" = "팔"; "fel" = "펠"; "fil" = "필"; "fol" = "폴"; "ful" = "풀"
        "fam" = "팜"; "fem" = "펨"; "fim" = "핌"; "fom" = "폼"; "fum" = "품"
        "far" = "파르"; "fer" = "페르"; "fir" = "피르"; "for" = "포르"; "fur" = "푸르"
        "fang" = "팡"; "feng" = "펭"; "fing" = "핑"; "fong" = "퐁"; "fung" = "풍"

        "gan" = "간"; "gen" = "겐"; "gin" = "긴"; "gon" = "곤"; "gun" = "군"
        "gal" = "갈"; "gel" = "겔"; "gil" = "길"; "gol" = "골"; "gul" = "굴"
        "gam" = "감"; "gem" = "겜"; "gim" = "김"; "gom" = "곰"; "gum" = "굼"
        "gar" = "가르"; "ger" = "게르"; "gir" = "기르"; "gor" = "고르"; "gur" = "구르"
        "gang" = "강"; "geng" = "겡"; "ging" = "깅"; "gong" = "공"; "gung" = "궁"

        "han" = "한"; "hen" = "헨"; "hin" = "힌"; "hon" = "혼"; "hun" = "훈"
        "hal" = "할"; "hel" = "헬"; "hil" = "힐"; "hol" = "홀"; "hul" = "훌"
        "ham" = "함"; "hem" = "헴"; "him" = "힘"; "hom" = "홈"; "hum" = "훔"
        "har" = "하르"; "her" = "헤르"; "hir" = "히르"; "hor" = "호르"; "hur" = "후르"
        "hang" = "항"; "heng" = "헹"; "hing" = "힝"; "hong" = "홍"; "hung" = "훙"

        "lan" = "란"; "len" = "렌"; "lin" = "린"; "lon" = "론"; "lun" = "룬"
        "lal" = "랄"; "lel" = "렐"; "lil" = "릴"; "lol" = "롤"; "lul" = "룰"
        "lam" = "람"; "lem" = "렘"; "lim" = "림"; "lom" = "롬"; "lum" = "룸"
        "lar" = "라르"; "ler" = "레르"; "lir" = "리르"; "lor" = "로르"; "lur" = "루르"
        "lang" = "랑"; "leng" = "렝"; "ling" = "링"; "long" = "롱"; "lung" = "룽"

        "man" = "만"; "men" = "멘"; "min" = "민"; "mon" = "몬"; "mun" = "문"
        "mal" = "말"; "mel" = "멜"; "mil" = "밀"; "mol" = "몰"; "mul" = "물"
        "mam" = "맘"; "mem" = "멤"; "mim" = "밈"; "mom" = "몸"; "mum" = "뭄"
        "mar" = "마르"; "mer" = "메르"; "mir" = "미르"; "mor" = "모르"; "mur" = "무르"
        "mang" = "망"; "meng" = "멩"; "ming" = "밍"; "mong" = "몽"; "mung" = "뭉"

        "nan" = "난"; "nen" = "넨"; "nin" = "닌"; "non" = "논"; "nun" = "눈"
        "nal" = "날"; "nel" = "넬"; "nil" = "닐"; "nol" = "놀"; "nul" = "눌"
        "nam" = "남"; "nem" = "넴"; "nim" = "님"; "nom" = "놈"; "num" = "눔"
        "nar" = "나르"; "ner" = "네르"; "nir" = "니르"; "nor" = "노르"; "nur" = "누르"
        "nang" = "낭"; "neng" = "넹"; "ning" = "닝"; "nong" = "농"; "nung" = "눙"

        "pan" = "판"; "pen" = "펜"; "pin" = "핀"; "pon" = "폰"; "pun" = "푼"
        "pal" = "팔"; "pel" = "펠"; "pil" = "필"; "pol" = "폴"; "pul" = "풀"
        "pam" = "팜"; "pem" = "펨"; "pim" = "핌"; "pom" = "폼"; "pum" = "품"
        "par" = "파르"; "per" = "페르"; "pir" = "피르"; "por" = "포르"; "pur" = "푸르"
        "pang" = "팡"; "peng" = "펭"; "ping" = "핑"; "pong" = "퐁"; "pung" = "풍"

        "ran" = "란"; "ren" = "렌"; "rin" = "린"; "ron" = "론"; "run" = "룬"
        "ral" = "랄"; "rel" = "렐"; "ril" = "릴"; "rol" = "롤"; "rul" = "룰"
        "ram" = "람"; "rem" = "렘"; "rim" = "림"; "rom" = "롬"; "rum" = "룸"
        "rar" = "라르"; "rer" = "레르"; "rir" = "리르"; "ror" = "로르"; "rur" = "루르"
        "rang" = "랑"; "reng" = "렝"; "ring" = "링"; "rong" = "롱"; "rung" = "룽"

        "san" = "산"; "sen" = "센"; "sin" = "신"; "son" = "손"; "sun" = "순"
        "sal" = "살"; "sel" = "셀"; "sil" = "실"; "sol" = "솔"; "sul" = "술"
        "sam" = "삼"; "sem" = "셈"; "sim" = "심"; "som" = "솜"; "sum" = "숨"
        "sar" = "사르"; "ser" = "세르"; "sir" = "시르"; "sor" = "소르"; "sur" = "수르"
        "sang" = "상"; "seng" = "셍"; "sing" = "싱"; "song" = "송"; "sung" = "숭"

        "tan" = "탄"; "ten" = "텐"; "tin" = "틴"; "ton" = "톤"; "tun" = "툰"
        "tal" = "탈"; "tel" = "텔"; "til" = "틸"; "tol" = "톨"; "tul" = "툴"
        "tam" = "탐"; "tem" = "템"; "tim" = "팀"; "tom" = "톰"; "tum" = "툼"
        "tar" = "타르"; "ter" = "테르"; "tir" = "티르"; "tor" = "토르"; "tur" = "투르"
        "tang" = "탕"; "teng" = "텡"; "ting" = "팅"; "tong" = "통"; "tung" = "퉁"

        "van" = "반"; "ven" = "벤"; "vin" = "빈"; "von" = "본"; "vun" = "분"
        "val" = "발"; "vel" = "벨"; "vil" = "빌"; "vol" = "볼"; "vul" = "불"
        "var" = "바르"; "ver" = "베르"; "vir" = "비르"; "vor" = "보르"; "vur" = "부르"

        "zan" = "잔"; "zen" = "젠"; "zin" = "진"; "zon" = "존"; "zun" = "준"
        "zal" = "잘"; "zel" = "젤"; "zil" = "질"; "zol" = "졸"; "zul" = "줄"
        "zar" = "자르"; "zer" = "제르"; "zir" = "지르"; "zor" = "조르"; "zur" = "주르"

        # Basic CV
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

        # Diphthongs & vowels
        "ai" = "아이"; "au" = "아우"; "ei" = "에이"; "eu" = "에우"; "oi" = "오이"; "ou" = "오우"; "ui" = "우이"
        "a" = "아"; "e" = "에"; "i" = "이"; "o" = "오"; "u" = "우"

        # Single consonants (at coda or standalone)
        # NEVER '른' or '름'!
        "b" = "브"; "c" = "크"; "d" = "드"; "f" = "프"; "g" = "그"
        "h" = "흐"; "j" = "즈"; "k" = "크"; "l" = "르"; "m" = "음"
        "n" = "은"; "p" = "프"; "r" = "르"; "s" = "스"; "t" = "트"
        "v" = "브"; "w" = "우"; "x" = "크스"; "y" = "이"; "z" = "즈"
    }

    "koreanSyllables" = [ordered]@{
        "dong" = "동"; "gyeong" = "경"; "lee" = "이"; "seung" = "승"; "woo" = "우"
        "min" = "민"; "kim" = "김"; "jin" = "진"; "su" = "수"; "soo" = "수"
        "hyun" = "현"; "hyeon" = "현"; "jun" = "준"; "joon" = "준"; "ho" = "호"
        "young" = "영"; "yeong" = "영"; "sung" = "성"; "seong" = "성"; "tae" = "태"
        "hwan" = "환"; "won" = "원"; "jae" = "재"; "sang" = "상"; "ki" = "기"
        "il" = "일"; "kwang" = "광"; "gwang" = "광"; "myung" = "명"; "myeong" = "명"
        "seok" = "석"; "suk" = "석"; "jong" = "종"; "choi" = "최"; "park" = "박"
        "jung" = "정"; "jeong" = "정"; "kang" = "강"; "gang" = "강"; "cho" = "조"
        "jo" = "조"; "yoon" = "윤"; "yun" = "윤"; "jang" = "장"; "lim" = "임"
        "han" = "한"; "oh" = "오"; "seo" = "서"; "shin" = "신"; "kwon" = "권"
        "hwang" = "황"; "ahn" = "안"; "song" = "송"; "hong" = "홍"; "yu" = "유"
        "ko" = "고"; "moon" = "문"; "yang" = "양"; "son" = "손"; "bae" = "배"
        "baek" = "백"; "heo" = "허"; "noh" = "노"; "shim" = "심"; "ha" = "하"
        "nam" = "남"; "jeon" = "전"; "chun" = "천"
    }
}

$jsonStr = ConvertTo-Json $dictData -Depth 5
[System.IO.File]::WriteAllText("korean_names_data.json", $jsonStr, $utf8NoBom)
Write-Host "Updated korean_names_data.json with $($dictData.firstNames.Count) firstNames and $($dictData.surnames.Count) surnames."

