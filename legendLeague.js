// c:\Users\jinuj\vsc\easyfmm\legendLeague.js

const LegendLeagueManager = {
    // 레전드 팀 데이터 정의
    legendTeams: {
        "Legend_Barcelona": {
            league: 1,
            players: [
                { name: "호나우지뉴", position: "FW", country: "브라질", age: 26, rating: 98, isIcon: true },
                { name: "리오넬 메시", position: "FW", country: "아르헨티나", age: 26, rating: 99, isIcon: true },
                { name: "사무엘 에투", position: "FW", country: "카메룬", age: 26, rating: 94, isIcon: true },
                { name: "안드레스 이니에스타", position: "MF", country: "스페인", age: 26, rating: 96, isIcon: true },
                { name: "사비 에르난데스", position: "MF", country: "스페인", age: 26, rating: 97, isIcon: true },
                { name: "세르히오 부스케츠", position: "MF", country: "스페인", age: 26, rating: 94, isIcon: true },
                { name: "카를레스 푸욜", position: "DF", country: "스페인", age: 26, rating: 95, isIcon: true },
                { name: "제라르 피케", position: "DF", country: "스페인", age: 26, rating: 94, isIcon: true },
                { name: "다니 알베스", position: "DF", country: "브라질", age: 26, rating: 93, isIcon: true },
                { name: "빅토르 발데스", position: "GK", country: "스페인", age: 26, rating: 90, isIcon: true },
                { name: "티에리 앙리", position: "FW", country: "프랑스", age: 26, rating: 93, isIcon: true },
                { name: "히바우두", position: "FW", country: "브라질", age: 26, rating: 96, isIcon: true },
                { name: "호마리우", position: "FW", country: "브라질", age: 26, rating: 95, isIcon: true },
                { name: "로날드 쿠만", position: "DF", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "펩 과르디올라", position: "MF", country: "스페인", age: 26, rating: 93, isIcon: true },
                { name: "요한 크루이프", position: "FW", country: "네덜란드", age: 26, rating: 99, isIcon: true },
                { name: "디에고 마라도나", position: "FW", country: "아르헨티나", age: 26, rating: 98, isIcon: true }
            ],
            description: "티키타카의 정점, 아이콘 바르셀로나"
        },
        "Legend_RealMadrid": {
            league: 1,
            players: [
                { name: "호나우두", position: "FW", country: "브라질", age: 26, rating: 98, isIcon: true },
                { name: "크리스티아누 호날두", position: "FW", country: "포르투갈", age: 26, rating: 99, isIcon: true },
                { name: "라울 곤잘레스", position: "FW", country: "스페인", age: 26, rating: 94, isIcon: true },
                { name: "지네딘 지단", position: "MF", country: "프랑스", age: 26, rating: 98, isIcon: true },
                { name: "루이스 피구", position: "MF", country: "포르투갈", age: 26, rating: 95, isIcon: true },
                { name: "데이비드 베컴", position: "MF", country: "잉글랜드", age: 26, rating: 93, isIcon: true },
                { name: "호베르투 카를로스", position: "DF", country: "브라질", age: 26, rating: 94, isIcon: true },
                { name: "페르난도 이에로", position: "DF", country: "스페인", age: 26, rating: 92, isIcon: true },
                { name: "세르히오 라모스", position: "DF", country: "스페인", age: 26, rating: 95, isIcon: true },
                { name: "이케르 카시야스", position: "GK", country: "스페인", age: 26, rating: 96, isIcon: true },
                { name: "알프레도 디 스테파노", position: "FW", country: "아르헨티나", age: 26, rating: 99, isIcon: true },
                { name: "페렌츠 푸스카스", position: "FW", country: "헝가리", age: 26, rating: 98, isIcon: true },
                { name: "클로드 마켈렐레", position: "MF", country: "프랑스", age: 26, rating: 92, isIcon: true },
                { name: "파비오 칸나바로", position: "DF", country: "이탈리아", age: 26, rating: 93, isIcon: true },
                { name: "루카 모드리치", position: "MF", country: "크로아티아", age: 26, rating: 94, isIcon: true },
                { name: "카림 벤제마", position: "FW", country: "프랑스", age: 26, rating: 95, isIcon: true }
            ],
            description: "갈락티코의 위엄, 아이콘 레알 마드리드"
        },
        "Legend_ManUtd": {
            league: 1,
            players: [
                { name: "웨인 루니", position: "FW", country: "잉글랜드", age: 26, rating: 94, isIcon: true },
                { name: "크리스티아누 호날두", position: "FW", country: "포르투갈", age: 26, rating: 96, isIcon: true },
                { name: "에릭 칸토나", position: "FW", country: "프랑스", age: 26, rating: 93, isIcon: true },
                { name: "라이언 긱스", position: "MF", country: "웨일스", age: 26, rating: 92, isIcon: true },
                { name: "폴 스콜스", position: "MF", country: "잉글랜드", age: 26, rating: 94, isIcon: true },
                { name: "로이 킨", position: "MF", country: "아일랜드", age: 26, rating: 93, isIcon: true },
                { name: "데이비드 베컴", position: "MF", country: "잉글랜드", age: 26, rating: 92, isIcon: true },
                { name: "리오 퍼디난드", position: "DF", country: "잉글랜드", age: 26, rating: 93, isIcon: true },
                { name: "네마냐 비디치", position: "DF", country: "세르비아", age: 26, rating: 92, isIcon: true },
                { name: "게리 네빌", position: "DF", country: "잉글랜드", age: 26, rating: 89, isIcon: true },
                { name: "파트리스 에브라", position: "DF", country: "프랑스", age: 26, rating: 90, isIcon: true },
                { name: "피터 슈마이켈", position: "GK", country: "덴마크", age: 26, rating: 95, isIcon: true },
                { name: "에드윈 반 데 사르", position: "GK", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "박지성", position: "MF", country: "대한민국", age: 26, rating: 89, isIcon: true },
                { name: "루드 반 니스텔루이", position: "FW", country: "네덜란드", age: 26, rating: 93, isIcon: true },
                { name: "보비 찰튼", position: "MF", country: "잉글랜드", age: 26, rating: 96, isIcon: true },
                { name: "조지 베스트", position: "FW", country: "북아일랜드", age: 26, rating: 97, isIcon: true },
                { name: "야프 스탐", position: "DF", country: "네덜란드", age: 26, rating: 91, isIcon: true }
            ],
            description: "퍼거슨의 아이들, 아이콘 맨체스터 유나이티드"
        },
        "Legend_ACMilan": {
            league: 1,
            players: [
                { name: "마르코 반 바스텐", position: "FW", country: "네덜란드", age: 26, rating: 98, isIcon: true },
                { name: "안드레이 셰브첸코", position: "FW", country: "우크라이나", age: 26, rating: 94, isIcon: true },
                { name: "카카", position: "MF", country: "브라질", age: 26, rating: 96, isIcon: true },
                { name: "루드 굴리트", position: "MF", country: "네덜란드", age: 26, rating: 97, isIcon: true },
                { name: "프랑크 레이카르트", position: "MF", country: "네덜란드", age: 26, rating: 94, isIcon: true },
                { name: "안드레아 피를로", position: "MF", country: "이탈리아", age: 26, rating: 93, isIcon: true },
                { name: "젠나로 가투소", position: "MF", country: "이탈리아", age: 26, rating: 90, isIcon: true },
                { name: "클라렌스 세이도르프", position: "MF", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "파올로 말디니", position: "DF", country: "이탈리아", age: 26, rating: 98, isIcon: true },
                { name: "알레산드로 네스타", position: "DF", country: "이탈리아", age: 26, rating: 95, isIcon: true },
                { name: "프랑코 바레시", position: "DF", country: "이탈리아", age: 26, rating: 96, isIcon: true },
                { name: "카푸", position: "DF", country: "브라질", age: 26, rating: 93, isIcon: true },
                { name: "야프 스탐", position: "DF", country: "네덜란드", age: 26, rating: 91, isIcon: true },
                { name: "필리포 인자기", position: "FW", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "조지 웨아", position: "FW", country: "라이베리아", age: 26, rating: 93, isIcon: true },
                { name: "호나우지뉴", position: "MF", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "디다", position: "GK", country: "브라질", age: 26, rating: 91, isIcon: true }
            ],
            description: "밀란 제너레이션, 아이콘 AC 밀란"
        },
        "Legend_Arsenal": {
            league: 1,
            players: [
                { name: "티에리 앙리", position: "FW", country: "프랑스", age: 26, rating: 97, isIcon: true },
                { name: "데니스 베르캄프", position: "FW", country: "네덜란드", age: 26, rating: 94, isIcon: true },
                { name: "로베르 피레스", position: "MF", country: "프랑스", age: 26, rating: 91, isIcon: true },
                { name: "프레디 융베리", position: "MF", country: "스웨덴", age: 26, rating: 90, isIcon: true },
                { name: "파트리크 비에이라", position: "MF", country: "프랑스", age: 26, rating: 94, isIcon: true },
                { name: "질베르투 실바", position: "MF", country: "브라질", age: 26, rating: 89, isIcon: true },
                { name: "솔 캠벨", position: "DF", country: "잉글랜드", age: 26, rating: 91, isIcon: true },
                { name: "토니 아담스", position: "DF", country: "잉글랜드", age: 26, rating: 92, isIcon: true },
                { name: "애슐리 콜", position: "DF", country: "잉글랜드", age: 26, rating: 92, isIcon: true },
                { name: "옌스 레만", position: "GK", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "데이비드 시먼", position: "GK", country: "잉글랜드", age: 26, rating: 90, isIcon: true },
                { name: "이안 라이트", position: "FW", country: "잉글랜드", age: 26, rating: 90, isIcon: true },
                { name: "누완코 카누", position: "FW", country: "나이지리아", age: 26, rating: 89, isIcon: true },
                { name: "레이 팔러", position: "MF", country: "잉글랜드", age: 26, rating: 88, isIcon: true },
                { name: "메수트 외질", position: "MF", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "마크 오베르마스", position: "FW", country: "네덜란드", age: 26, rating: 90, isIcon: true },
                { name: "콜로 투레", position: "DF", country: "코트디부아르", age: 26, rating: 88, isIcon: true }
            ],
            description: "무패 우승의 신화, 아이콘 아스널"
        },
        "Legend_Chelsea": {
            league: 1,
            players: [
                { name: "디디에 드록바", position: "FW", country: "코트디부아르", age: 26, rating: 93, isIcon: true },
                { name: "프랭크 램파드", position: "MF", country: "잉글랜드", age: 26, rating: 94, isIcon: true },
                { name: "에당 아자르", position: "FW", country: "벨기에", age: 26, rating: 93, isIcon: true },
                { name: "잔프랑코 졸라", position: "FW", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "마이클 에시앙", position: "MF", country: "가나", age: 26, rating: 90, isIcon: true },
                { name: "클로드 마켈렐레", position: "MF", country: "프랑스", age: 26, rating: 91, isIcon: true },
                { name: "은골로 캉테", position: "MF", country: "프랑스", age: 26, rating: 92, isIcon: true },
                { name: "존 테리", position: "DF", country: "잉글랜드", age: 26, rating: 94, isIcon: true },
                { name: "리카르도 카르발류", position: "DF", country: "포르투갈", age: 26, rating: 91, isIcon: true },
                { name: "브라니슬라프 이바노비치", position: "DF", country: "세르비아", age: 26, rating: 89, isIcon: true },
                { name: "애슐리 콜", position: "DF", country: "잉글랜드", age: 26, rating: 92, isIcon: true },
                { name: "페트르 체흐", position: "GK", country: "체코", age: 26, rating: 94, isIcon: true },
                { name: "카를로 쿠디치니", position: "GK", country: "이탈리아", age: 26, rating: 88, isIcon: true },
                { name: "미하엘 발락", position: "MF", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "후안 마타", position: "MF", country: "스페인", age: 26, rating: 89, isIcon: true },
                { name: "디에고 코스타", position: "FW", country: "스페인", age: 26, rating: 90, isIcon: true },
                { name: "세사르 아스필리쿠에타", position: "DF", country: "스페인", age: 26, rating: 88, isIcon: true },
                { name: "마르셀 드사이", position: "DF", country: "프랑스", age: 26, rating: 90, isIcon: true }
            ],
            description: "푸른 사자 군단, 아이콘 첼시"
        },
        "Legend_Liverpool": {
            league: 1,
            players: [
                { name: "이안 러시", position: "FW", country: "웨일스", age: 26, rating: 92, isIcon: true },
                { name: "케니 달글리시", position: "FW", country: "스코틀랜드", age: 26, rating: 94, isIcon: true },
                { name: "스티븐 제라드", position: "MF", country: "잉글랜드", age: 26, rating: 95, isIcon: true },
                { name: "사비 알론소", position: "MF", country: "스페인", age: 26, rating: 92, isIcon: true },
                { name: "하비에르 마스체라노", position: "MF", country: "아르헨티나", age: 26, rating: 89, isIcon: true },
                { name: "존 반스", position: "MF", country: "잉글랜드", age: 26, rating: 90, isIcon: true },
                { name: "모하메드 살라", position: "FW", country: "이집트", age: 26, rating: 93, isIcon: true },
                { name: "루이스 수아레스", position: "FW", country: "우루과이", age: 26, rating: 94, isIcon: true },
                { name: "로베르토 피르미누", position: "FW", country: "브라질", age: 26, rating: 90, isIcon: true },
                { name: "버질 반 다이크", position: "DF", country: "네덜란드", age: 26, rating: 94, isIcon: true },
                { name: "제이미 캐러거", position: "DF", country: "잉글랜드", age: 26, rating: 89, isIcon: true },
                { name: "사미 히피아", position: "DF", country: "핀란드", age: 26, rating: 88, isIcon: true },
                { name: "알란 한센", position: "DF", country: "스코틀랜드", age: 26, rating: 90, isIcon: true },
                { name: "트렌트 알렉산더아놀드", position: "DF", country: "잉글랜드", age: 26, rating: 89, isIcon: true },
                { name: "앤드류 로버트슨", position: "DF", country: "스코틀랜드", age: 26, rating: 88, isIcon: true },
                { name: "알리송 베케르", position: "GK", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "레이 클레멘스", position: "GK", country: "잉글랜드", age: 26, rating: 90, isIcon: true },
                { name: "로비 파울러", position: "FW", country: "잉글랜드", age: 26, rating: 91, isIcon: true }
            ],
            description: "안필드의 영웅들, 아이콘 리버풀"
        },
        "Legend_Bayern": {
            league: 1,
            players: [
                { name: "게르트 뮐러", position: "FW", country: "독일", age: 26, rating: 97, isIcon: true },
                { name: "로베르트 레반도프스키", position: "FW", country: "폴란드", age: 26, rating: 95, isIcon: true },
                { name: "칼 하인츠 루메니게", position: "FW", country: "독일", age: 26, rating: 94, isIcon: true },
                { name: "프랑크 리베리", position: "MF", country: "프랑스", age: 26, rating: 92, isIcon: true },
                { name: "아르옌 로벤", position: "MF", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "로타어 마테우스", position: "MF", country: "독일", age: 26, rating: 96, isIcon: true },
                { name: "슈테판 에펜베르크", position: "MF", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "바스티안 슈바인슈타이거", position: "MF", country: "독일", age: 26, rating: 90, isIcon: true },
                { name: "프란츠 베켄바워", position: "DF", country: "독일", age: 26, rating: 98, isIcon: true },
                { name: "필립 람", position: "DF", country: "독일", age: 26, rating: 94, isIcon: true },
                { name: "파울 브라이트너", position: "DF", country: "독일", age: 26, rating: 92, isIcon: true },
                { name: "루시오", position: "DF", country: "브라질", age: 26, rating: 90, isIcon: true },
                { name: "다비드 알라바", position: "DF", country: "오스트리아", age: 26, rating: 89, isIcon: true },
                { name: "올리버 칸", position: "GK", country: "독일", age: 26, rating: 95, isIcon: true },
                { name: "마누엘 노이어", position: "GK", country: "독일", age: 26, rating: 96, isIcon: true },
                { name: "제프 마이어", position: "GK", country: "독일", age: 26, rating: 93, isIcon: true },
                { name: "토마스 뮐러", position: "FW", country: "독일", age: 26, rating: 90, isIcon: true },
                { name: "미하엘 발락", position: "MF", country: "독일", age: 26, rating: 91, isIcon: true }
            ],
            description: "독일의 거인, 아이콘 바이에른 뮌헨"
        },
        "Legend_Inter": {
            league: 1,
            players: [
                { name: "호나우두", position: "FW", country: "브라질", age: 26, rating: 97, isIcon: true },
                { name: "크리스티안 비에리", position: "FW", country: "이탈리아", age: 26, rating: 92, isIcon: true },
                { name: "디에고 밀리토", position: "FW", country: "아르헨티나", age: 26, rating: 91, isIcon: true },
                { name: "사무엘 에투", position: "FW", country: "카메룬", age: 26, rating: 93, isIcon: true },
                { name: "베슬리 스네이더", position: "MF", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "로타어 마테우스", position: "MF", country: "독일", age: 26, rating: 95, isIcon: true },
                { name: "에스테반 캄비아소", position: "MF", country: "아르헨티나", age: 26, rating: 89, isIcon: true },
                { name: "하비에르 사네티", position: "DF", country: "아르헨티나", age: 26, rating: 93, isIcon: true },
                { name: "주세페 베르고미", position: "DF", country: "이탈리아", age: 26, rating: 92, isIcon: true },
                { name: "왈테르 사무엘", position: "DF", country: "아르헨티나", age: 26, rating: 90, isIcon: true },
                { name: "루시오", position: "DF", country: "브라질", age: 26, rating: 90, isIcon: true },
                { name: "마이콘", position: "DF", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "안드레아스 브레메", position: "DF", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "줄리우 세자르", position: "GK", country: "브라질", age: 26, rating: 91, isIcon: true },
                { name: "발테르 젱가", position: "GK", country: "이탈리아", age: 26, rating: 92, isIcon: true },
                { name: "아드리아누", position: "FW", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "알바로 레코바", position: "FW", country: "우루과이", age: 26, rating: 89, isIcon: true },
                { name: "루이스 피구", position: "MF", country: "포르투갈", age: 26, rating: 89, isIcon: true }
            ],
            description: "트레블의 영광, 아이콘 인터 밀란"
        },
        "Legend_Juventus": {
            league: 1,
            players: [
                { name: "알레산드로 델 피에로", position: "FW", country: "이탈리아", age: 26, rating: 94, isIcon: true },
                { name: "로베르토 바조", position: "FW", country: "이탈리아", age: 26, rating: 95, isIcon: true },
                { name: "미셸 플라티니", position: "MF", country: "프랑스", age: 26, rating: 97, isIcon: true },
                { name: "지네딘 지단", position: "MF", country: "프랑스", age: 26, rating: 97, isIcon: true },
                { name: "파벨 네드베드", position: "MF", country: "체코", age: 26, rating: 93, isIcon: true },
                { name: "안드레아 피를로", position: "MF", country: "이탈리아", age: 26, rating: 92, isIcon: true },
                { name: "에드가 다비즈", position: "MF", country: "네덜란드", age: 26, rating: 90, isIcon: true },
                { name: "클라우디오 마르키시오", position: "MF", country: "이탈리아", age: 26, rating: 89, isIcon: true },
                { name: "가에타노 시레아", position: "DF", country: "이탈리아", age: 26, rating: 94, isIcon: true },
                { name: "클라우디오 젠틸레", position: "DF", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "안드레아 바르잘리", position: "DF", country: "이탈리아", age: 26, rating: 90, isIcon: true },
                { name: "조르조 키엘리니", position: "DF", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "릴리앙 튀랑", position: "DF", country: "프랑스", age: 26, rating: 92, isIcon: true },
                { name: "잔루이지 부폰", position: "GK", country: "이탈리아", age: 26, rating: 96, isIcon: true },
                { name: "디노 조프", position: "GK", country: "이탈리아", age: 26, rating: 94, isIcon: true },
                { name: "다비드 트레제게", position: "FW", country: "프랑스", age: 26, rating: 91, isIcon: true },
                { name: "마우로 카모라네시", position: "MF", country: "이탈리아", age: 26, rating: 88, isIcon: true }
            ],
            description: "비앙코네리의 아이콘, 유벤투스"
        },
        "Legend_Ajax": {
            league: 1,
            players: [
                { name: "요한 크루이프", position: "FW", country: "네덜란드", age: 26, rating: 99, isIcon: true },
                { name: "마르코 반 바스텐", position: "FW", country: "네덜란드", age: 26, rating: 97, isIcon: true },
                { name: "데니스 베르캄프", position: "FW", country: "네덜란드", age: 26, rating: 95, isIcon: true },
                { name: "패트릭 클루이베르트", position: "FW", country: "네덜란드", age: 26, rating: 93, isIcon: true },
                { name: "야리 리트마넨", position: "MF", country: "핀란드", age: 26, rating: 92, isIcon: true },
                { name: "클라렌스 세이도르프", position: "MF", country: "네덜란드", age: 26, rating: 94, isIcon: true },
                { name: "에드가 다비즈", position: "MF", country: "네덜란드", age: 26, rating: 93, isIcon: true },
                { name: "프랑크 레이카르트", position: "MF", country: "네덜란드", age: 26, rating: 96, isIcon: true },
                { name: "요한 네스켄스", position: "MF", country: "네덜란드", age: 26, rating: 94, isIcon: true },
                { name: "프랑크 데 부어", position: "DF", country: "네덜란드", age: 26, rating: 91, isIcon: true },
                { name: "대니 블린트", position: "DF", country: "네덜란드", age: 26, rating: 90, isIcon: true },
                { name: "루드 크롤", position: "DF", country: "네덜란드", age: 26, rating: 93, isIcon: true },
                { name: "마이클 라이지거", position: "DF", country: "네덜란드", age: 26, rating: 89, isIcon: true },
                { name: "에드윈 반 데 사르", position: "GK", country: "네덜란드", age: 26, rating: 95, isIcon: true },
                { name: "베슬리 스네이더", position: "MF", country: "네덜란드", age: 26, rating: 93, isIcon: true },
                { name: "마크 오베르마스", position: "FW", country: "네덜란드", age: 26, rating: 92, isIcon: true },
                { name: "즐라탄 이브라히모비치", position: "FW", country: "스웨덴", age: 26, rating: 91, isIcon: true }
            ],
            description: "토탈 풋볼의 산실, 아이콘 아약스"
        },
        "Legend_Roma": {
            league: 1,
            players: [
                { name: "프란체스코 토티", position: "FW", country: "이탈리아", age: 26, rating: 96, isIcon: true },
                { name: "가브리엘 바티스투타", position: "FW", country: "아르헨티나", age: 26, rating: 95, isIcon: true },
                { name: "빈첸초 몬텔라", position: "FW", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "다니엘레 데 로시", position: "MF", country: "이탈리아", age: 26, rating: 93, isIcon: true },
                { name: "팔캉", position: "MF", country: "브라질", age: 26, rating: 94, isIcon: true },
                { name: "주세페 잔니니", position: "MF", country: "이탈리아", age: 26, rating: 92, isIcon: true },
                { name: "브루노 콘티", position: "MF", country: "이탈리아", age: 26, rating: 93, isIcon: true },
                { name: "카푸", position: "DF", country: "브라질", age: 26, rating: 95, isIcon: true },
                { name: "알다이르", position: "DF", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "왈테르 사무엘", position: "DF", country: "아르헨티나", age: 26, rating: 91, isIcon: true },
                { name: "뱅상 캉델라", position: "DF", country: "프랑스", age: 26, rating: 89, isIcon: true },
                { name: "크리스티안 파누치", position: "DF", country: "이탈리아", age: 26, rating: 88, isIcon: true },
                { name: "알리송 베케르", position: "GK", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "모하메드 살라", position: "FW", country: "이집트", age: 26, rating: 91, isIcon: true },
                { name: "라자 나잉골란", position: "MF", country: "벨기에", age: 26, rating: 90, isIcon: true },
                { name: "안토니오 카사노", position: "FW", country: "이탈리아", age: 26, rating: 89, isIcon: true },
                { name: "나카타 히데토시", position: "MF", country: "일본", age: 26, rating: 88, isIcon: true }
            ],
            description: "로마의 황제와 글래디에이터들, 아이콘 AS 로마"
        },
        "Legend_Dortmund": {
            league: 1,
            players: [
                { name: "마티아스 잠머", position: "DF", country: "독일", age: 26, rating: 96, isIcon: true },
                { name: "마르코 로이스", position: "FW", country: "독일", age: 26, rating: 94, isIcon: true },
                { name: "마츠 훔멜스", position: "DF", country: "독일", age: 26, rating: 93, isIcon: true },
                { name: "위르겐 콜러", position: "DF", country: "독일", age: 26, rating: 92, isIcon: true },
                { name: "안드레아스 묄러", position: "MF", country: "독일", age: 26, rating: 91, isIcon: true },
                { name: "스테판 샤퓌자", position: "FW", country: "스위스", age: 26, rating: 90, isIcon: true },
                { name: "로만 바이덴펠러", position: "GK", country: "독일", age: 26, rating: 89, isIcon: true },
                { name: "우카시 피슈체크", position: "DF", country: "폴란드", age: 26, rating: 88, isIcon: true },
                { name: "야쿱 블라시키코프스키", position: "MF", country: "폴란드", age: 26, rating: 88, isIcon: true },
                { name: "케빈 그로스크로이츠", position: "DF", country: "독일", age: 26, rating: 85, isIcon: true },
                { name: "얀 콜러", position: "FW", country: "체코", age: 26, rating: 89, isIcon: true },
                { name: "토마스 로시츠키", position: "MF", country: "체코", age: 26, rating: 91, isIcon: true },
                { name: "데데", position: "DF", country: "브라질", age: 26, rating: 87, isIcon: true },
                { name: "세바스티안 켈", position: "MF", country: "독일", age: 26, rating: 86, isIcon: true },
                { name: "카를 하인츠 리들레", position: "FW", country: "독일", age: 26, rating: 89, isIcon: true },
                { name: "슈테판 로이터", position: "DF", country: "독일", age: 26, rating: 88, isIcon: true },
                { name: "신지 카가와", position: "MF", country: "일본", age: 26, rating: 87, isIcon: true },
                { name: "누리 사힌", position: "MF", country: "튀르키예", age: 26, rating: 88, isIcon: true }
            ],
            description: "꿀벌 군단의 아이콘, 보루시아 도르트문트"
        },
        "Legend_Napoli": {
            league: 1,
            players: [
                { name: "디에고 마라도나", position: "FW", country: "아르헨티나", age: 26, rating: 99, isIcon: true },
                { name: "마렉 함식", position: "MF", country: "슬로바키아", age: 26, rating: 92, isIcon: true },
                { name: "드리스 메르텐스", position: "FW", country: "벨기에", age: 26, rating: 91, isIcon: true },
                { name: "로렌초 인시녜", position: "FW", country: "이탈리아", age: 26, rating: 90, isIcon: true },
                { name: "에딘손 카바니", position: "FW", country: "우루과이", age: 26, rating: 93, isIcon: true },
                { name: "카레카", position: "FW", country: "브라질", age: 26, rating: 92, isIcon: true },
                { name: "치로 페라라", position: "DF", country: "이탈리아", age: 26, rating: 91, isIcon: true },
                { name: "칼리두 쿨리발리", position: "DF", country: "세네갈", age: 26, rating: 92, isIcon: true },
                { name: "지안프랑코 졸라", position: "FW", country: "이탈리아", age: 26, rating: 90, isIcon: true },
                { name: "에세키엘 라베찌", position: "FW", country: "아르헨티나", age: 26, rating: 89, isIcon: true },
                { name: "페페 레이나", position: "GK", country: "스페인", age: 26, rating: 88, isIcon: true },
                { name: "조르지뉴", position: "MF", country: "이탈리아", age: 26, rating: 89, isIcon: true },
                { name: "크리스티안 마지오", position: "DF", country: "이탈리아", age: 26, rating: 87, isIcon: true },
                { name: "파올로 칸나바로", position: "DF", country: "이탈리아", age: 26, rating: 86, isIcon: true },
                { name: "안토니오 율리아노", position: "MF", country: "이탈리아", age: 26, rating: 88, isIcon: true },
                { name: "주세페 브루스콜로티", position: "DF", country: "이탈리아", age: 26, rating: 87, isIcon: true },
                { name: "디노 조프", position: "GK", country: "이탈리아", age: 26, rating: 94, isIcon: true },
                { name: "알레망", position: "MF", country: "브라질", age: 26, rating: 88, isIcon: true }
            ],
            description: "나폴리의 신과 아이들, 아이콘 나폴리"
        }
    },

    init() {
        this.createLegendLeagueButton();
    },

    createLegendLeagueButton() {
        if (document.getElementById('legendLeagueBtn')) return;

        const btn = document.createElement('button');
        btn.id = 'legendLeagueBtn';
        btn.className = 'btn';
        btn.innerHTML = '👑 레전드 리그';
        btn.style.cssText = `
            position: fixed; 
            top: 70px; 
            left: 20px; 
            z-index: 100000; 
            background: linear-gradient(45deg, #f1c40f, #e67e22); 
            color: white; 
            padding: 10px 20px; 
            border: none; 
            border-radius: 5px; 
            box-shadow: 0 4px 15px rgba(0,0,0,0.3); 
            cursor: pointer; 
            font-weight: bold;
            text-shadow: 0 1px 2px rgba(0,0,0,0.2);
        `;
        btn.onclick = () => this.startLegendLeague();
        document.body.appendChild(btn);
    },

    startLegendLeague() {
        if (!confirm('👑 레전드 리그를 시작하시겠습니까?\n\n모든 팀이 아이콘 선수들로 교체되며, 새로운 게임이 시작됩니다.\n(기존 진행 상황은 저장되지 않은 경우 사라집니다)')) {
            return;
        }

        const btn = document.getElementById('legendLeagueBtn');
        if (btn) btn.style.display = 'none';

        console.log("👑 레전드 리그 모드 진입...");

        // 1. 전역 데이터 교체
        // script.js의 const 변수 참조 유지를 위해 객체를 새로 할당하지 않고 내용만 비움
        if (window.teams) Object.keys(window.teams).forEach(key => delete window.teams[key]);
        if (window.teamNames) Object.keys(window.teamNames).forEach(key => delete window.teamNames[key]);
        if (window.allTeams) Object.keys(window.allTeams).forEach(key => delete window.allTeams[key]);

        // 레전드 팀 데이터 로드
        Object.entries(this.legendTeams).forEach(([teamKey, teamData]) => {
            window.teams[teamKey] = JSON.parse(JSON.stringify(teamData.players)); // 깊은 복사
            window.teamNames[teamKey] = teamData.description.split(', ')[1] || teamKey; // "전설의 바르셀로나" 등
            window.allTeams[teamKey] = {
                league: 1, // 모든 레전드 팀은 1부 리그
                players: window.teams[teamKey],
                description: teamData.description
            };
        });

        // 2. 게임 데이터 초기화
        gameData.selectedTeam = null; // 팀 선택 전
        gameData.currentLeague = 1;
        gameData.teamMoney = 5000; // 레전드 리그는 자금 넉넉히
        gameData.isWorldCupMode = false;
        gameData.isLegendMode = true; // 레전드 모드 플래그
        gameData.matchesPlayed = 0;
        gameData.seasonCount = 1;
        gameData.schedule = null;
        
        // 리그 데이터 초기화
        if (typeof initializeLeagueData === 'function') {
            initializeLeagueData();
        }

        // 3. UI 초기화 및 팀 선택 화면으로 이동
        if (typeof showScreen === 'function') {
            this.renderTeamSelectionScreen();
            showScreen('teamSelection');
        }

        alert("👑 레전드 리그에 오신 것을 환영합니다!\n감독을 맡을 전설의 팀을 선택해주세요.");
    },

    getTacticsMap() {
        const map = {};
        Object.entries(this.legendTeams).forEach(([key, data]) => {
            map[key] = data.tactic || "possession";
        });
        return map;
    },

    renderTeamSelectionScreen() {
        const teamSelectionScreen = document.getElementById('teamSelection');
        if (!teamSelectionScreen) return;

        // 기존 내용 초기화
        teamSelectionScreen.innerHTML = '<h1>팀 선택</h1>';
        
        const section = document.createElement('div');
        section.className = 'league-section';
        section.innerHTML = '<h2 class="league-title">👑 레전드 슈퍼 리그</h2>';
        
        const grid = document.createElement('div');
        grid.className = 'teams-grid';
        
        Object.keys(this.legendTeams).forEach(teamKey => {
            const teamData = this.legendTeams[teamKey];
            const card = document.createElement('div');
            card.className = 'team-card';
            card.dataset.team = teamKey;
            
            // 대표 스타 3명
            const stars = teamData.players.slice(0, 3).map(p => p.name).join(', ');

            card.innerHTML = `
                <h3>${window.teamNames[teamKey]}</h3>
                <div class="team-rating">오버롤: 95+</div>
                <p class="team-description">${teamData.description}</p>
                <div class="key-players" style="font-size: 0.8rem; color: #ffd700; margin-top: 5px;">
                    ⭐ ${stars} 등
                </div>
            `;

            card.addEventListener('click', function() {
                if (typeof selectTeam === 'function') {
                    selectTeam(teamKey);
                }
            });

            grid.appendChild(card);
        });
        
        section.appendChild(grid);
        teamSelectionScreen.appendChild(section);
    }
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        LegendLeagueManager.init();
    }, 600);
});

window.LegendLeagueManager = LegendLeagueManager;
