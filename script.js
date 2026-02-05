// script.js
// 주요 데이터 구조 및 초기화

const allTeams = {
    // 1부 리그
    "바르셀로나": {
        league: 1,
        players: [
            { name: "페드리", position: "MF", country: "스페인", age: 22, rating: 92 },
            { name: "로베르트 레반도프스키", position: "FW", country: "폴란드", age: 36, rating: 90 },
            { name: "라민 야말", position: "FW", country: "스페인", age: 18, rating: 94 },
            { name: "하피냐", position: "FW", country: "브라질", age: 28, rating: 95 },
            { name: "이냐키 페냐", position: "GK", country: "스페인", age: 26, rating: 73 },
            { name: "마커스 래시포드", position: "MF", country: "잉글랜드", age: 27, rating: 80 },
            { name: "마르크 안드레 테어 슈테겐", position: "GK", country: "독일", age: 33, rating: 79 },
            { name: "안드레아스 크리스텐센", position: "DF", country: "덴마크", age: 29, rating: 78 },
            { name: "가비", position: "MF", country: "스페인", age: 20, rating: 88 },
            { name: "페르민 로페스", position: "MF", country: "스페인", age: 22, rating: 82 },
            { name: "마르크 카사도", position: "MF", country: "스페인", age: 21, rating: 79 },
            { name: "다니 올모", position: "MF", country: "스페인", age: 27, rating: 83 },
            { name: "프렝키 더용", position: "MF", country: "네덜란드", age: 28, rating: 86 },
            { name: "쥘 쿤데", position: "DF", country: "프랑스", age: 26, rating: 88 },
            { name: "에릭 가르시아", position: "DF", country: "스페인", age: 24, rating: 75 },
            { name: "보이치에흐 슈체스니", position: "GK", country: "폴란드", age: 35, rating: 83 },
            { name: "주안 가르시아", position: "GK", country: "스페인", age: 23, rating: 85 },
            { name: "오리올 로메우", position: "MF", country: "스페인", age: 33, rating: 69 },
            { name: "엑토르 포트", position: "DF", country: "스페인", age: 19, rating: 72 },
            { name: "마르크 베르날", position: "MF", country: "스페인", age: 18, rating: 76 },
            { name: "제라르 마르틴", position: "DF", country: "스페인", age: 23, rating: 80 },
            { name: "파우 쿠바르시", position: "DF", country: "스페인", age: 18, rating: 84 },
            { name: "루니 바르다그지", position: "FW", country: "덴마크", age: 19, rating: 69 },
            { name: "알레한드로 발데", position: "DF", country: "스페인", age: 22, rating: 83 }
        ],
        description: "꿈과 열정이 살아 숨쉬는 카탈루냐의 자존심"
    },

    "레알_마드리드": {
        league: 1,
        players: [
            { name: "티보 쿠르투아", position: "GK", country: "벨기에", age: 33, rating: 89 },
            { name: "다니 카르바할", position: "DF", country: "스페인", age: 33, rating: 83 },
            { name: "에데르 밀리탕", position: "DF", country: "브라질", age: 27, rating: 86 },
            { name: "데이비드 알라바", position: "DF", country: "오스트리아", age: 33, rating: 69 },
            { name: "주드 벨링엄", position: "MF", country: "잉글랜드", age: 22, rating: 92 },
            { name: "에두아르도 카마빙가", position: "MF", country: "프랑스", age: 22, rating: 85 },
            { name: "비니시우스 주니오르", position: "FW", country: "브라질", age: 25, rating: 93 },
            { name: "페데리코 발베르데", position: "MF", country: "우루과이", age: 27, rating: 92 },
            { name: "킬리안 음바페", position: "FW", country: "프랑스", age: 26, rating: 95 },
            { name: "호드리구", position: "FW", country: "브라질", age: 24, rating: 89 },
            { name: "트렌트 알렉산더아놀드", position: "DF", country: "잉글랜드", age: 26, rating: 86 },
            { name: "안드리 루닌", position: "GK", country: "우크라이나", age: 26, rating: 79 },
            { name: "오렐리앵 추아메니", position: "MF", country: "프랑스", age: 25, rating: 85 },
            { name: "아르다 귈러", position: "MF", country: "튀르키예", age: 20, rating: 83 },
            { name: "알바로 카레라스", position: "DF", country: "스페인", age: 22, rating: 84 },
            { name: "다니 세바요스", position: "MF", country: "스페인", age: 28, rating: 73 },
            { name: "프란 가르시아", position: "DF", country: "스페인", age: 25, rating: 81 },
            { name: "브라힘 디아스", position: "FW", country: "모로코", age: 25, rating: 82 },
            { name: "안토니오 뤼디거", position: "DF", country: "독일", age: 32, rating: 82 },
            { name: "페를랑 멘디", position: "DF", country: "프랑스", age: 30, rating: 72 },
            { name: "딘 하위선", position: "DF", country: "스페인", age: 20, rating: 86 },
            { name: "라울 아센시오", position: "DF", country: "스페인", age: 22, rating: 83 }
        ],
        description: "황실의 위엄을 지닌 세계 최고의 클럽"
    },

    "맨체스터_시티": {
        league: 1,
        players: [
            { name: "제임스 트래포드", position: "GK", country: "잉글랜드", age: 22, rating: 81 },
            { name: "잔루이지 돈나룸마", position: "GK", country: "이탈리아", age: 26, rating: 87 },
            { name: "후벵 디아스", position: "DF", country: "포르투갈", age: 28, rating: 87 },
            { name: "티자니 라인더르스", position: "MF", country: "네덜란드", age: 27, rating: 85 },
            { name: "존 스톤스", position: "DF", country: "잉글랜드", age: 31, rating: 77 },
            { name: "네이선 아케", position: "DF", country: "네덜란드", age: 30, rating: 79 },
            { name: "오마르 마르무시", position: "FW", country: "이집트", age: 26, rating: 84 },
            { name: "마테오 코바치치", position: "MF", country: "크로아티아", age: 31, rating: 83 },
            { name: "엘링 홀란드", position: "FW", country: "노르웨이", age: 25, rating: 94 },
            { name: "잭 그릴리쉬", position: "MF", country: "잉글랜드", age: 29, rating: 71 },
            { name: "제레미 도쿠", position: "FW", country: "벨기에", age: 23, rating: 88 },
            { name: "마커스 베티넬리", position: "GK", country: "잉글랜드", age: 33, rating: 62 },
            { name: "니코 곤살레스", position: "MF", country: "스페인", age: 27, rating: 81 },
            { name: "로드리", position: "MF", country: "스페인", age: 29, rating: 93 },
            { name: "슈테판 오르테가", position: "GK", country: "독일", age: 32, rating: 76 },
            { name: "일카이 귄도안", position: "MF", country: "독일", age: 34, rating: 82 },
            { name: "베르나르두 실바", position: "MF", country: "포르투갈", age: 30, rating: 84 },
            { name: "라얀 아이트누리", position: "DF", country: "알제리", age: 24, rating: 85 },
            { name: "비토르 헤이스", position: "DF", country: "브라질", age: 19, rating: 73 },
            { name: "요슈코 그바르디올", position: "DF", country: "크로아티아", age: 23, rating: 89 },
            { name: "마누엘 아칸지", position: "DF", country: "스위스", age: 30, rating: 78 },
            { name: "사비뉴", position: "FW", country: "브라질", age: 21, rating: 84 },
            { name: "마테우스 누네스", position: "MF", country: "포르투갈", age: 26, rating: 81 },
            { name: "라얀 셰르키", position: "MF", country: "프랑스", age: 21, rating: 89 },
            { name: "클라우디오 에체베리", position: "MF", country: "아르헨티나", age: 19, rating: 74 },
            { name: "필 포든", position: "FW", country: "잉글랜드", age: 25, rating: 84 },
            { name: "오스카르 보브", position: "MF", country: "노르웨이", age: 22, rating: 73 },
            { name: "리코 루이스", position: "DF", country: "잉글랜드", age: 20, rating: 79 },
            { name: "앙투안 세메뇨", position: "FW", country: "가나", age: 25, rating: 87 },
        ],
        description: "천상의 축구를 구현하는 맨체스터의 블루 문"
    },

    "맨체스터_유나이티드": {
        league: 2,
        players: [
            { name: "알타이 바이은드르", position: "GK", country: "튀르키예", age: 27, rating: 69 },
            { name: "센느 라멘스", position: "GK", country: "벨기에", age: 23, rating: 85 },
            { name: "디오구 달로", position: "DF", country: "포르투갈", age: 26, rating: 77 },
            { name: "누사이르 마즈라위", position: "DF", country: "모로코", age: 27, rating: 84 },
            { name: "마테이스 더리흐트", position: "DF", country: "네덜란드", age: 25, rating: 82 },
            { name: "해리 매과이어", position: "DF", country: "잉글랜드", age: 32, rating: 80 },
            { name: "리산드로 마르티네스", position: "DF", country: "아르헨티나", age: 27, rating: 84 },
            { name: "메이슨 마운트", position: "MF", country: "잉글랜드", age: 26, rating: 82 },
            { name: "브루노 페르난데스", position: "MF", country: "포르투갈", age: 30, rating: 89 },
            { name: "마테우스 쿠냐", position: "FW", country: "브라질", age: 26, rating: 88 },
            { name: "조슈아 지르크지", position: "FW", country: "네덜란드", age: 24, rating: 76 },
            { name: "파트리크 도르구", position: "DF", country: "덴마크", age: 19, rating: 80 },
            { name: "레니 요로", position: "DF", country: "프랑스", age: 19, rating: 82 },
            { name: "아마드 디알로", position: "MF", country: "코트디부아르", age: 23, rating: 84 },
            { name: "카세미루", position: "MF", country: "브라질", age: 33, rating: 85 },
            { name: "브라이언 음뵈모", position: "FW", country: "카메룬", age: 25, rating: 87 },
            { name: "톰 히튼", position: "GK", country: "잉글랜드", age: 39, rating: 62 },
            { name: "루크 쇼", position: "DF", country: "잉글랜드", age: 30, rating: 77 },
            { name: "마누엘 우가르테", position: "MF", country: "우루과이", age: 24, rating: 83 },
            { name: "코비 마이누", position: "MF", country: "잉글랜드", age: 20, rating: 81 },
            { name: "베냐민 셰슈코", position: "FW", country: "슬로베니아", age: 22, rating: 84 }
        ],
        description: "붉은 악마들의 자존심과 전통"
    },

    "리버풀": {
        league: 1,
        players: [
            { name: "알리송 베케르", position: "GK", country: "브라질", age: 32, rating: 86 },
            { name: "리오 응구모하", position: "GK", country: "잉글랜드", age: 17, rating: 69 },
            { name: "조 고메즈", position: "DF", country: "잉글랜드", age: 28, rating: 75 },
            { name: "엔도 와타루", position: "MF", country: "일본", age: 32, rating: 74 },
            { name: "버질 반 다이크", position: "DF", country: "네덜란드", age: 34, rating: 92 },
            { name: "이브라히마 코나테", position: "DF", country: "프랑스", age: 26, rating: 84 },
            { name: "밀로시 케르케즈", position: "DF", country: "헝가리", age: 21, rating: 83 },
            { name: "플로리안 비르츠", position: "FW", country: "독일", age: 22, rating: 85 },
            { name: "도미니크 소보슬라이", position: "MF", country: "헝가리", age: 24, rating: 87 },
            { name: "알렉시스 맥 알리스터", position: "MF", country: "아르헨티나", age: 26, rating: 90 },
            { name: "모하메드 살라", position: "FW", country: "이집트", age: 33, rating: 89 },
            { name: "알렉산데르 이사크", position: "FW", country: "스웨덴", age: 25, rating: 85 },
            { name: "코너 브래들리", position: "DF", country: "북아일랜드", age: 22, rating: 76 },
            { name: "페데리코 키에사", position: "FW", country: "이탈리아", age: 27, rating: 82 },
            { name: "커티스 존스", position: "MF", country: "잉글랜드", age: 24, rating: 81 },
            { name: "코디 각포", position: "FW", country: "네덜란드", age: 26, rating: 84 },
            { name: "하비 엘리엇", position: "MF", country: "잉글랜드", age: 22, rating: 83 },
            { name: "코스타스 치미카스", position: "DF", country: "그리스", age: 29, rating: 73 },
            { name: "위고 에키티케", position: "FW", country: "프랑스", age: 23, rating: 86 },
            { name: "기오르기 마마르다슈빌리", position: "GK", country: "조지아", age: 24, rating: 81 },
            { name: "앤드류 로버트슨", position: "DF", country: "스코틀랜드", age: 31, rating: 83 },
            { name: "제레미 프림퐁", position: "DF", country: "네덜란드", age: 24, rating: 85 },
            { name: "라이언 흐라벤베르흐", position: "MF", country: "네덜란드", age: 23, rating: 91 },
            { name: "스테판 바이체티치", position: "MF", country: "스페인", age: 20, rating: 67 },
            { name: "리스 윌리엄스", position: "DF", country: "잉글랜드", age: 24, rating: 66 },
            { name: "벤 도크", position: "FW", country: "스코틀랜드", age: 19, rating: 69 },
            { name: "타일러 모튼", position: "MF", country: "잉글랜드", age: 22, rating: 71 }
        ],
        description: "You'll Never Walk Alone - 리버풀의 불굴의 정신"
    },

    "토트넘_홋스퍼": {
        league: 1,
        players: [
            { name: "굴리엘모 비카리오", position: "GK", country: "이탈리아", age: 28, rating: 84 },
            { name: "케빈 단소", position: "DF", country: "오스트리아", age: 26, rating: 81 },
            { name: "라두 드라구신", position: "DF", country: "루마니아", age: 23, rating: 76 },
            { name: "손흥민", position: "FW", country: "대한민국", age: 33, rating: 93 },
            { name: "이브 비수마", position: "MF", country: "말리", age: 28, rating: 82 },
            { name: "히샬리송", position: "FW", country: "브라질", age: 28, rating: 77 },
            { name: "제임스 매디슨", position: "MF", country: "잉글랜드", age: 28, rating: 85 },
            { name: "마티스 텔", position: "FW", country: "프랑스", age: 20, rating: 78 },
            { name: "데스티니 우도기", position: "DF", country: "이탈리아", age: 22, rating: 84 },
            { name: "아치 그레이", position: "MF", country: "잉글랜드", age: 19, rating: 82 },
            { name: "루카스 베리발", position: "MF", country: "스웨덴", age: 19, rating: 82 },
            { name: "크리스티안 로메로", position: "DF", country: "아르헨티나", age: 27, rating: 88 },
            { name: "양민혁", position: "FW", country: "대한민국", age: 19, rating: 85 },
            { name: "도미닉 솔랑케", position: "FW", country: "잉글랜드", age: 27, rating: 86 },
            { name: "모하메드 쿠두스", position: "FW", country: "가나", age: 25, rating: 87 },
            { name: "데얀 쿨루셉스키", position: "MF", country: "스웨덴", age: 25, rating: 85 },
            { name: "브레넌 존슨", position: "FW", country: "웨일스", age: 24, rating: 82 },
            { name: "페드로 포로", position: "DF", country: "스페인", age: 25, rating: 86 },
            { name: "제드 스펜스", position: "DF", country: "잉글랜드", age: 24, rating: 77 },
            { name: "마노르 솔로몬", position: "FW", country: "이스라엘", age: 26, rating: 78 },
            { name: "윌손 오도베르", position: "FW", country: "프랑스", age: 20, rating: 75 },
            { name: "파페 마타르 사르", position: "MF", country: "세네갈", age: 22, rating: 83 },
            { name: "로드리고 벤쿠르", position: "MF", country: "우루과이", age: 28, rating: 81 },
            { name: "안토닌 킨스키", position: "GK", country: "체코", age: 22, rating: 73 },
            { name: "벤 데이비스", position: "DF", country: "웨일스", age: 32, rating: 76 },
            { name: "미키 판더벤", position: "DF", country: "네덜란드", age: 24, rating: 86 },
            { name: "브랜던 오스틴", position: "GK", country: "미국", age: 25, rating: 65 },
            { name: "데인 스칼렛", position: "FW", country: "잉글랜드", age: 21, rating: 68 },
            { name: "알피 디바인", position: "MF", country: "잉글랜드", age: 20, rating: 66 },
            { name: "루카 부슈코비치", position: "DF", country: "크로아티아", age: 18, rating: 68 },
            { name: "타카이 코타", position: "DF", country: "일본", age: 20, rating: 71 },
            { name: "사비 시몬스", position: "MF", country: "네덜란드", age: 22, rating: 87 }
        ],
        description: "To Dare Is To Do - 스퍼스의 도전 정신"
    },

    "파리_생제르맹": {
        league: 1,
        players: [
            { name: "루카 슈발리에", position: "GK", country: "프랑스", age: 24, rating: 85 },
            { name: "아슈라프 하키미", position: "DF", country: "모로코", age: 26, rating: 92 },
            { name: "프레스넬 킴펨베", position: "DF", country: "프랑스", age: 29, rating: 69 },
            { name: "루카스 베랄두", position: "DF", country: "브라질", age: 21, rating: 75 },
            { name: "마르퀴뇨스", position: "DF", country: "브라질", age: 31, rating: 85 },
            { name: "흐비차 크바라츠헬리아", position: "FW", country: "조지아", age: 24, rating: 93 },
            { name: "파비안 루이스", position: "MF", country: "스페인", age: 29, rating: 83 },
            { name: "곤살루 하무스", position: "FW", country: "포르투갈", age: 24, rating: 75 },
            { name: "우스만 뎀벨레", position: "FW", country: "프랑스", age: 28, rating: 95 },
            { name: "데지레 두에", position: "FW", country: "프랑스", age: 20, rating: 89 },
            { name: "비티냐", position: "MF", country: "포르투갈", age: 25, rating: 93 },
            { name: "이강인", position: "MF", country: "대한민국", age: 24, rating: 82 },
            { name: "뤼카 에르난데스", position: "DF", country: "프랑스", age: 29, rating: 77 },
            { name: "세니 마율루", position: "MF", country: "프랑스", age: 19, rating: 73 },
            { name: "누누 멘데스", position: "DF", country: "포르투갈", age: 23, rating: 91 },
            { name: "브래들리 바르콜라", position: "FW", country: "프랑스", age: 22, rating: 86 },
            { name: "워렌 자이르에메리", position: "MF", country: "프랑스", age: 19, rating: 82 },
            { name: "마트베이 사포노프", position: "GK", country: "러시아", age: 26, rating: 68 },
            { name: "윌리안 파초", position: "DF", country: "에콰도르", age: 23, rating: 83 },
            { name: "아르나우 테나스", position: "GK", country: "스페인", age: 24, rating: 72 },
            { name: "주앙 네베스", position: "MF", country: "포르투갈", age: 20, rating: 92 }
        ],
        description: "파리의 별들이 빛나는 세계 최고의 무대"
    },

    "AC_밀란": {
        league: 1,
        players: [
            { name: "피에트로 테라치아노", position: "GK", country: "이탈리아", age: 21, rating: 67 },
            { name: "크리스토퍼 은쿤쿠", position: "FW", country: "프랑스", age: 27, rating: 75 },
            { name: "사무엘레 리치", position: "FW", country: "이탈리아", age: 22, rating: 80 },
            { name: "산티아고 히메네스", position: "FW", country: "멕시코", age: 24, rating: 83 },
            { name: "루벤 로프터스치크", position: "MF", country: "잉글랜드", age: 29, rating: 81 },
            { name: "알렉시스 살레마커스", position: "FW", country: "벨기에", age: 26, rating: 81 },
            { name: "프란치스코 카마르다", position: "FW", country: "이탈리아", age: 17, rating: 78 },
            { name: "하파엘 레앙", position: "FW", country: "포르투갈", age: 26, rating: 89 },
            { name: "아드리앙 라비오", position: "MF", country: "프랑스", age: 30, rating: 86 },
            { name: "크리스천 풀리식", position: "FW", country: "미국", age: 26, rating: 90 },
            { name: "루카 모드리치", position: "MF", country: "크로아티아", age: 39, rating: 85 },
            { name: "마이크 메냥", position: "GK", country: "프랑스", age: 30, rating: 85 },
            { name: "알렉스 히메네스", position: "DF", country: "스페인", age: 20, rating: 73 },
            { name: "아르돈 야샤리", position: "MF", country: "스위스", age: 22, rating: 83 },
            { name: "사무엘 추쿠에제", position: "FW", country: "나이지리아", age: 26, rating: 76 },
            { name: "에메르송 로얄", position: "DF", country: "브라질", age: 26, rating: 72 },
            { name: "피카요 토모리", position: "DF", country: "잉글랜드", age: 27, rating: 85 },
            { name: "유수프 포파나", position: "MF", country: "프랑스", age: 26, rating: 82 },
            { name: "스트라히냐 파블로비치", position: "DF", country: "세르비아", age: 24, rating: 77 },
            { name: "페르비스 에스투피냔", position: "DF", country: "에콰도르", age: 28, rating: 78 },
            { name: "워렌 본도", position: "MF", country: "프랑스", age: 23, rating: 67 },
            { name: "필리포 테라치아노", position: "DF", country: "이탈리아", age: 22, rating: 67 },
            { name: "마테오 가비아", position: "DF", country: "이탈리아", age: 25, rating: 80 },
            { name: "니클라스 퓔크루크", position: "FW", country: "독일", age: 32, rating: 81 },
            { name: "유누스 무사", position: "MF", country: "미국", age: 22, rating: 77 }
        ],
        description: "로소네리의 전통과 명예를 이어가는 밀라노의 자존심"
    },

    "인터_밀란": {
        league: 1,
        players: [
            { name: "얀 조머", position: "GK", country: "스위스", age: 36, rating: 83 },
            { name: "덴젤 둠프리스", position: "DF", country: "네덜란드", age: 29, rating: 87 },
            { name: "스테판 더프레이", position: "DF", country: "네덜란드", age: 33, rating: 74 },
            { name: "피오트르 지엘린스키", position: "MF", country: "폴란드", age: 31, rating: 81 },
            { name: "페타르 수치치", position: "MF", country: "크로아티아", age: 22, rating: 72 },
            { name: "마르쿠스 튀랑", position: "FW", country: "프랑스", age: 27, rating: 87 },
            { name: "라우타로 마르티네스", position: "FW", country: "아르헨티나", age: 27, rating: 90 },
            { name: "루이스 엔히키", position: "FW", country: "브라질", age: 24, rating: 72 },
            { name: "라파엘레 디젠나로", position: "GK", country: "이탈리아", age: 25, rating: 67 },
            { name: "주젭 마르티네스", position: "GK", country: "스페인", age: 27, rating: 69 },
            { name: "프란체스코 아체르비", position: "DF", country: "이탈리아", age: 37, rating: 83 },
            { name: "다비데 프라테시", position: "MF", country: "이탈리아", age: 25, rating: 82 },
            { name: "하칸 찰하놀루", position: "MF", country: "튀르키예", age: 31, rating: 89 },
            { name: "크리스티안 아슬라니", position: "MF", country: "알바니아", age: 23, rating: 79 },
            { name: "헨리크 미키타리안", position: "MF", country: "아르메니아", age: 36, rating: 75 },
            { name: "니콜로 바렐라", position: "MF", country: "이탈리아", age: 28, rating: 91 },
            { name: "뱅자맹 파바르", position: "DF", country: "프랑스", age: 29, rating: 81 },
            { name: "카를루스 아우구스투", position: "DF", country: "브라질", age: 26, rating: 77 },
            { name: "얀 아우렐 비세크", position: "DF", country: "독일", age: 24, rating: 73 },
            { name: "페데리코 디마르코", position: "DF", country: "이탈리아", age: 27, rating: 87 },
            { name: "마테오 다르미안", position: "DF", country: "이탈리아", age: 35, rating: 71 },
            { name: "니콜라 잘레프스키", position: "DF", country: "폴란드", age: 23, rating: 74 },
            { name: "알레산드로 바스토니", position: "DF", country: "이탈리아", age: 26, rating: 90 },
            { name: "메흐디 타레미", position: "FW", country: "이란", age: 33, rating: 69 }
        ],
        description: "네라추리의 위대한 전통을 이어가는 밀라노의 또 다른 자존심"
    },

    "아스널": {
        league: 1,
        players: [
            { name: "다비드 라야", position: "GK", country: "스페인", age: 29, rating: 85 },
            { name: "윌리엄 살리바", position: "DF", country: "프랑스", age: 24, rating: 85 },
            { name: "크리스티안 모스케라", position: "DF", country: "스페인", age: 21, rating: 73 },
            { name: "벤 화이트", position: "DF", country: "잉글랜드", age: 27, rating: 78 },
            { name: "가브리에우 마갈량이스", position: "DF", country: "브라질", age: 27, rating: 90 },
            { name: "부카요 사카", position: "FW", country: "잉글랜드", age: 23, rating: 91 },
            { name: "마르틴 외데고르", position: "MF", country: "노르웨이", age: 26, rating: 86 },
            { name: "가브리에우 제주스", position: "FW", country: "브라질", age: 28, rating: 75 },
            { name: "가브리에우 마르티넬리", position: "FW", country: "브라질", age: 24, rating: 85 },
            { name: "위리엔 팀버르", position: "DF", country: "네덜란드", age: 24, rating: 85 },
            { name: "케파 아리사발라가", position: "GK", country: "스페인", age: 30, rating: 74 },
            { name: "빅토르 요케레스", position: "FW", country: "스웨덴", age: 27, rating: 90 },
            { name: "야쿠프 키비오르", position: "DF", country: "폴란드", age: 25, rating: 81 },
            { name: "크리스티안 뇌르고르", position: "MF", country: "덴마크", age: 31, rating: 76 },
            { name: "올렉산드르 진첸코", position: "DF", country: "우크라이나", age: 28, rating: 76 },
            { name: "레안드로 트로사르", position: "MF", country: "벨기에", age: 30, rating: 78 },
            { name: "노니 마두에케", position: "FW", country: "잉글랜드", age: 23, rating: 77 },
            { name: "에단 은와네리", position: "FW", country: "잉글랜드", age: 18, rating: 75 },
            { name: "미켈 메리노", position: "MF", country: "스페인", age: 29, rating: 83 },
            { name: "카이 하베르츠", position: "MF", country: "독일", age: 26, rating: 80 },
            { name: "리카르도 칼라피오리", position: "DF", country: "이탈리아", age: 23, rating: 85 },
            { name: "마르틴 수비멘디", position: "MF", country: "스페인", age: 26, rating: 87 },
            { name: "데클란 라이스", position: "MF", country: "잉글랜드", age: 26, rating: 91 },
            { name: "마일스 루이스스켈리", position: "DF", country: "잉글랜드", age: 19, rating: 83 },
            { name: "맥스 다우먼", position: "FW", country: "잉글랜드", age: 16, rating: 70 },
        ],
        description: "거너스의 아름다운 축구와 불굴의 정신력"
    },

    "나폴리": {
        league: 1,
        players: [
            { name: "알렉스 메렛", position: "GK", country: "이탈리아", age: 28, rating: 83 },
            { name: "알레산드로 부온조르노", position: "DF", country: "이탈리아", age: 26, rating: 85 },
            { name: "주앙 제주스", position: "DF", country: "브라질", age: 34, rating: 72 },
            { name: "빌리 길모어", position: "MF", country: "스코틀랜드", age: 24, rating: 81 },
            { name: "다비드 네리스", position: "FW", country: "브라질", age: 28, rating: 76 },
            { name: "스콧 맥토미니", position: "MF", country: "스코틀랜드", age: 28, rating: 92 },
            { name: "노아 오카포르", position: "FW", country: "스위스", age: 25, rating: 74 },
            { name: "로멜루 루카쿠", position: "FW", country: "벨기에", age: 32, rating: 86 },
            { name: "아미르 라흐마니", position: "DF", country: "코소보", age: 31, rating: 82 },
            { name: "니키타 콘티니", position: "GK", country: "이탈리아", age: 29, rating: 65 },
            { name: "라스무스 호일룬", position: "FW", country: "덴마크", age: 22, rating: 79 },
            { name: "필리프 빌링", position: "MF", country: "덴마크", age: 28, rating: 76 },
            { name: "라파 마린", position: "MF", country: "스페인", age: 23, rating: 74 },
            { name: "마티아스 올리베라", position: "DF", country: "우루과이", age: 27, rating: 83 },
            { name: "지오바니 시메오네", position: "FW", country: "아르헨티나", age: 30, rating: 74 },
            { name: "마테오 폴리타노", position: "FW", country: "이탈리아", age: 31, rating: 85 },
            { name: "조반니 디 로렌초", position: "DF", country: "이탈리아", age: 31, rating: 87 },
            { name: "시릴 은곤게", position: "FW", country: "벨기에", age: 30, rating: 67 },
            { name: "케빈 더 브라위너", position: "MF", country: "벨기에", age: 34, rating: 87 },
            { name: "레오나르도 스피나촐라", position: "DF", country: "이탈리아", age: 32, rating: 81 },
            { name: "스타니슬라프 로보트카", position: "MF", country: "슬로바키아", age: 30, rating: 84 },
            { name: "자코모 라스파도리", position: "FW", country: "이탈리아", age: 25, rating: 85 },
            { name: "시모네 스쿠페트", position: "GK", country: "이탈리아", age: 29, rating: 67 },
            { name: "앙드레프랑크 잠보 앙귀사", position: "MF", country: "카메룬", age: 29, rating: 82 }
        ],
        description: "남부 이탈리아의 열정과 자존심을 대표하는 파르테노페이"
    },

    "첼시": {
        league: 1,
        players: [
            { name: "로베르트 산체스", position: "GK", country: "스페인", age: 27, rating: 81 },
            { name: "마르크 쿠쿠레야", position: "DF", country: "스페인", age: 27, rating: 88 },
            { name: "토신 아다라비오요", position: "DF", country: "잉글랜드", age: 27, rating: 77 },
            { name: "알레한드로 가르나초", position: "FW", country: "아르헨티나", age: 21, rating: 78 },
            { name: "브누아 바디아실", position: "DF", country: "프랑스", age: 24, rating: 76 },
            { name: "리바이 콜윌", position: "DF", country: "잉글랜드", age: 22, rating: 84 },
            { name: "페드루 네투", position: "FW", country: "포르투갈", age: 25, rating: 83 },
            { name: "엔소 페르난데스", position: "MF", country: "아르헨티나", age: 24, rating: 90 },
            { name: "리암 델랍", position: "FW", country: "잉글랜드", age: 22, rating: 81 },
            { name: "콜 파머", position: "MF", country: "잉글랜드", age: 23, rating: 91 },
            { name: "필립 요르겐센", position: "GK", country: "덴마크", age: 23, rating: 72 },
            { name: "다리우 이수구", position: "MF", country: "포르투갈", age: 21, rating: 73 },
            { name: "니콜라 잭슨", position: "FW", country: "세네갈", age: 24, rating: 79 },
            { name: "안드레이 산투스", position: "MF", country: "브라질", age: 21, rating: 86 },
            { name: "마마두 사르", position: "DF", country: "프랑스", age: 19, rating: 74 },
            { name: "주앙 페드루", position: "FW", country: "브라질", age: 24, rating: 86 },
            { name: "키어넌 듀스버리홀", position: "MF", country: "잉글랜드", age: 26, rating: 77 },
            { name: "트레보 찰로바", position: "DF", country: "잉글랜드", age: 26, rating: 80 },
            { name: "리스 제임스", position: "DF", country: "잉글랜드", age: 25, rating: 88 },
            { name: "모이세스 카이세도", position: "MF", country: "에콰도르", age: 23, rating: 91 },
            { name: "말로 귀스토", position: "DF", country: "프랑스", age: 22, rating: 84 },
            { name: "웨슬리 포파나", position: "DF", country: "프랑스", age: 24, rating: 79 },
            { name: "아론 안셀미노", position: "DF", country: "아르헨티나", age: 20, rating: 72 },
            { name: "타이리크 조지", position: "FW", country: "잉글랜드", age: 20, rating: 64 },
            { name: "조시 아체암퐁", position: "DF", country: "잉글랜드", age: 18, rating: 69 },
            { name: "오마리 켈리먼", position: "MF", country: "잉글랜드", age: 19, rating: 66 },
            { name: "마르크 기우", position: "FW", country: "스페인", age: 19, rating: 71 },
            { name: "가브리엘 슬로니나", position: "GK", country: "미국", age: 21, rating: 68 },
            { name: "로메오 라비아", position: "MF", country: "벨기에", age: 21, rating: 82 },
            { name: "제이미 기튼스", position: "FW", country: "잉글랜드", age: 20, rating: 83 }
        ],
        description: "블루스의 강력한 투지와 승부근성"
    },

    "바이에른_뮌헨": {
        league: 1,
        players: [
            { name: "마누엘 노이어", position: "GK", country: "독일", age: 39, rating: 83 },
            { name: "레나르트 칼", position: "MF", country: "독일", age: 17, rating: 76 },
            { name: "다요 우파메카노", position: "DF", country: "프랑스", age: 26, rating: 85 },
            { name: "김민재", position: "DF", country: "대한민국", age: 28, rating: 86 },
            { name: "요나단 타", position: "DF", country: "독일", age: 29, rating: 87 },
            { name: "요주아 키미히", position: "MF", country: "독일", age: 30, rating: 90 },
            { name: "세르주 그나브리", position: "FW", country: "독일", age: 30, rating: 77 },
            { name: "레온 고레츠카", position: "MF", country: "독일", age: 30, rating: 85 },
            { name: "해리 케인", position: "FW", country: "잉글랜드", age: 32, rating: 93 },
            { name: "자말 무시알라", position: "MF", country: "독일", age: 22, rating: 93 },
            { name: "킹슬리 코망", position: "FW", country: "프랑스", age: 29, rating: 80 },
            { name: "루이스 디아스", position: "FW", country: "콜롬비아", age: 28, rating: 85 },
            { name: "주앙 팔리냐", position: "MF", country: "포르투갈", age: 30, rating: 79 },
            { name: "마이클 올리세", position: "FW", country: "프랑스", age: 23, rating: 88 },
            { name: "알폰소 데이비스", position: "DF", country: "캐나다", age: 24, rating: 87 },
            { name: "이토 히로키", position: "DF", country: "일본", age: 26, rating: 75 },
            { name: "라파엘 게헤이루", position: "DF", country: "포르투갈", age: 31, rating: 77 },
            { name: "사샤 보이", position: "DF", country: "프랑스", age: 24, rating: 73 },
            { name: "스벤 울라이히", position: "GK", country: "독일", age: 36, rating: 67 },
            { name: "콘라트 라이머", position: "MF", country: "오스트리아", age: 28, rating: 81 },
            { name: "요시프 스타니시치", position: "DF", country: "크로아티아", age: 25, rating: 76 },
            { name: "알렉산다르 파블로비치", position: "MF", country: "독일", age: 21, rating: 85 },
            { name: "파울 바너", position: "MF", country: "독일", age: 19, rating: 67 }
        ],
        description: "독일 축구의 자존심이자 뮌헨의 왕자들"
    },

    "아틀레티코_마드리드": {
        league: 1,
        players: [
            { name: "후안 무소", position: "GK", country: "아르헨티나", age: 31, rating: 70 },
            { name: "호세 히메네스", position: "DF", country: "우루과이", age: 30, rating: 84 },
            { name: "마테오 루제리", position: "DF", country: "이탈리아", age: 23, rating: 79 },
            { name: "코너 갤러거", position: "MF", country: "잉글랜드", age: 25, rating: 83 },
            { name: "조니 카르도주", position: "MF", country: "미국", age: 23, rating: 81 },
            { name: "코케", position: "MF", country: "스페인", age: 33, rating: 82 },
            { name: "앙투안 그리즈만", position: "FW", country: "프랑스", age: 34, rating: 90 },
            { name: "파블로 바리오스", position: "MF", country: "스페인", age: 22, rating: 85 },
            { name: "알렉산데르 쇠를로트", position: "FW", country: "노르웨이", age: 29, rating: 81 },
            { name: "알렉스 바에나", position: "MF", country: "스페인", age: 24, rating: 86 },
            { name: "티아고 알마다", position: "FW", country: "아르헨티나", age: 24, rating: 75 },
            { name: "얀 오블락", position: "GK", country: "슬로베니아", age: 32, rating: 86 },
            { name: "마르코스 요렌테", position: "MF", country: "스페인", age: 30, rating: 84 },
            { name: "클레망 랑글레", position: "DF", country: "프랑스", age: 30, rating: 87 },
            { name: "나우엘 몰리나", position: "DF", country: "아르헨티나", age: 27, rating: 82 },
            { name: "다비드 한츠코", position: "DF", country: "슬로바키아", age: 27, rating: 83 },
            { name: "마르크 푸빌", position: "DF", country: "스페인", age: 22, rating: 67 },
            { name: "훌리안 알바레스", position: "FW", country: "아르헨티나", age: 25, rating: 90 },
            { name: "하비 갈란", position: "DF", country: "스페인", age: 30, rating: 72 },
            { name: "줄리아노 시메오네", position: "FW", country: "아르헨티나", age: 22, rating: 81 },
            { name: "로뱅 르노르망", position: "DF", country: "스페인", age: 28, rating: 82 },
            { name: "카를로스 마르틴", position: "FW", country: "스페인", age: 23, rating: 67 }
        ],
        description: "콜치오네로스의 불굴의 투지와 승부욕"
    },

    "도르트문트": {
        league: 1,
        players: [
            { name: "그레고어 코벨", position: "GK", country: "스위스", age: 27, rating: 85 },
            { name: "얀 코투", position: "DF", country: "브라질", age: 23, rating: 82 },
            { name: "발데마르 안톤", position: "DF", country: "독일", age: 29, rating: 78 },
            { name: "니코 슐로터베크", position: "DF", country: "독일", age: 25, rating: 86 },
            { name: "라미 벤세바이니", position: "DF", country: "알제리", age: 30, rating: 81 },
            { name: "살리흐 외즈잔", position: "MF", country: "튀르키예", age: 27, rating: 72 },
            { name: "펠릭스 은메차", position: "MF", country: "독일", age: 24, rating: 80 },
            { name: "세루 기라시", position: "FW", country: "기니", age: 29, rating: 91 },
            { name: "율리안 브란트", position: "MF", country: "독일", age: 29, rating: 86 },
            { name: "파스칼 그로스", position: "MF", country: "독일", age: 34, rating: 83 },
            { name: "막시밀리안 바이어", position: "FW", country: "독일", age: 22, rating: 80 },
            { name: "쥘리앵 뒤랑빌", position: "FW", country: "벨기에", age: 19, rating: 73 },
            { name: "카니 추쿠에메카", position: "MF", country: "잉글랜드", age: 21, rating: 77 },
            { name: "마르셀 자비처", position: "MF", country: "오스트리아", age: 31, rating: 81 },
            { name: "엠레 잔", position: "MF", country: "독일", age: 31, rating: 75 },
            { name: "율리안 뤼에르손", position: "DF", country: "노르웨이", age: 27, rating: 84 },
            { name: "카림 아데예미", position: "FW", country: "독일", age: 23, rating: 85 },
            { name: "실라스 오스트신스키", position: "GK", country: "폴란드", age: 21, rating: 67 },
            { name: "알렉산더 마이어", position: "GK", country: "독일", age: 34, rating: 65 },
            { name: "마르셀 로트카", position: "GK", country: "폴란드", age: 24, rating: 67 },
            { name: "콜 캠벨", position: "FW", country: "미국", age: 19, rating: 70 },
            { name: "키엘 베티엔", position: "MF", country: "독일", age: 19, rating: 67 },
            { name: "알무게라 카바르", position: "DF", country: "독일", age: 19, rating: 66 },
            { name: "다니엘 스벤슨", position: "DF", country: "스웨덴", age: 23, rating: 82 }
        ],
        description: "보루시아의 노란 벽과 함께하는 젊은 열정"
    },

    // 2부 리그
    "유벤투스": {
        league: 2,
        players: [
            { name: "마티아 페린", position: "GK", country: "이탈리아", age: 35, rating: 72 },
            { name: "알베르투 코스타", position: "DF", country: "포르투갈", age: 21, rating: 67 },
            { name: "글레이송 브레메르", position: "DF", country: "브라질", age: 28, rating: 85 },
            { name: "페데리코 가티", position: "DF", country: "이탈리아", age: 27, rating: 83 },
            { name: "마누엘 로카텔리", position: "MF", country: "이탈리아", age: 27, rating: 79 },
            { name: "로이드 켈리", position: "DF", country: "잉글랜드", age: 26, rating: 74 },
            { name: "프란시스쿠 콘세이상", position: "FW", country: "포르투갈", age: 22, rating: 82 },
            { name: "퇸 코프메이너르스", position: "MF", country: "네덜란드", age: 27, rating: 85 },
            { name: "두샨 블라호비치", position: "FW", country: "세르비아", age: 25, rating: 84 },
            { name: "케난 일디즈", position: "FW", country: "튀르키예", age: 20, rating: 87 },
            { name: "니코 곤살레스", position: "FW", country: "아르헨티나", age: 27, rating: 82 },
            { name: "아르카디우스 밀리크", position: "FW", country: "폴란드", age: 31, rating: 69 },
            { name: "피에르 칼룰루", position: "DF", country: "프랑스", age: 25, rating: 80 },
            { name: "웨스턴 맥케니", position: "MF", country: "미국", age: 26, rating: 81 },
            { name: "바실리예 아지치", position: "MF", country: "몬테네그로", age: 19, rating: 67 },
            { name: "케프랑 튀랑", position: "MF", country: "프랑스", age: 24, rating: 84 },
            { name: "랑달 콜로 무아니", position: "FW", country: "프랑스", age: 26, rating: 82 },
            { name: "조너선 데이비드", position: "FW", country: "캐나다", age: 25, rating: 86 },
            { name: "카를로 핀솔리오", position: "GK", country: "이탈리아", age: 35, rating: 66 },
            { name: "도글라스 루이스", position: "MF", country: "브라질", age: 27, rating: 85 },
            { name: "안드레아 캄비아소", position: "DF", country: "이탈리아", age: 25, rating: 86 },
            { name: "미켈레 디그레고리오", position: "GK", country: "이탈리아", age: 28, rating: 80 },
            { name: "후안 카발", position: "DF", country: "콜롬비아", age: 24, rating: 74 },
            { name: "니콜로 사보나", position: "DF", country: "이탈리아", age: 22, rating: 70 },
            { name: "요나스 로우히", position: "DF", country: "스웨덴", age: 21, rating: 68 },
            { name: "사무엘 음방굴라", position: "FW", country: "벨기에", age: 21, rating: 75 }
        ],
        description: "비앙코네리의 전통과 명예를 되찾기 위한 도전"
    },

    "뉴캐슬_유나이티드": {
        league: 2,
        players: [
            { name: "마르틴 두브라프카", position: "GK", country: "슬로바키아", age: 36, rating: 71 },
            { name: "키어런 트리피어", position: "DF", country: "잉글랜드", age: 34, rating: 82 },
            { name: "스벤 보트만", position: "DF", country: "네덜란드", age: 25, rating: 83 },
            { name: "말릭 티아우", position: "DF", country: "독일", age: 23, rating: 81 },
            { name: "파비안 셰어", position: "DF", country: "스위스", age: 33, rating: 84 },
            { name: "자말 라셀스", position: "DF", country: "잉글랜드", age: 31, rating: 75 },
            { name: "조엘린통", position: "MF", country: "브라질", age: 28, rating: 84 },
            { name: "산드로 토날리", position: "MF", country: "이탈리아", age: 25, rating: 89 },
            { name: "칼럼 윌슨", position: "FW", country: "잉글랜드", age: 33, rating: 74 },
            { name: "앤서니 고든", position: "FW", country: "잉글랜드", age: 24, rating: 87 },
            { name: "하비 반스", position: "FW", country: "잉글랜드", age: 27, rating: 81 },
            { name: "맷 타겟", position: "DF", country: "잉글랜드", age: 29, rating: 74 },
            { name: "닉 볼테마테", position: "FW", country: "스웨덴", age: 23, rating: 85 },
            { name: "에밀 크라프트", position: "DF", country: "스웨덴", age: 31, rating: 71 },
            { name: "윌리엄 오술라", position: "FW", country: "덴마크", age: 21, rating: 72 },
            { name: "오디세아스 블라호디모스", position: "GK", country: "그리스", age: 31, rating: 72 },
            { name: "루이스 홀", position: "DF", country: "잉글랜드", age: 20, rating: 84 },
            { name: "티노 리브라멘토", position: "DF", country: "잉글랜드", age: 22, rating: 85 },
            { name: "닉 포프", position: "GK", country: "잉글랜드", age: 33, rating: 81 },
            { name: "제이콥 머피", position: "FW", country: "잉글랜드", age: 30, rating: 84 },
            { name: "존 러디", position: "GK", country: "잉글랜드", age: 38, rating: 66 },
            { name: "조 윌록", position: "MF", country: "잉글랜드", age: 25, rating: 73 },
            { name: "마크 길레스피", position: "GK", country: "스코틀랜드", age: 33, rating: 70 },
            { name: "댄 번", position: "DF", country: "잉글랜드", age: 33, rating: 83 },
            { name: "션 롱스태프", position: "MF", country: "잉글랜드", age: 27, rating: 77 },
            { name: "브루누 기마랑이스", position: "MF", country: "브라질", age: 27, rating: 90 },
            { name: "루이스 마일리", position: "MF", country: "잉글랜드", age: 19, rating: 72 },
            { name: "닉 볼테마데", position: "FW", country: "독일", age: 23, rating: 88 },
        ],
        description: "마그파이스의 재기를 꿈꾸는 타인 사이드의 열정"
    },

    "아스톤_빌라": {
        league: 2,
        players: [
            { name: "매티 캐시", position: "DF", country: "폴란드", age: 27, rating: 83 },
            { name: "악셀 디사시", position: "DF", country: "프랑스", age: 27, rating: 77 },
            { name: "에즈리 콘사", position: "DF", country: "잉글랜드", age: 27, rating: 75 },
            { name: "타이론 밍스", position: "DF", country: "잉글랜드", age: 31, rating: 72 },
            { name: "로스 바클리", position: "MF", country: "잉글랜드", age: 31, rating: 75 },
            { name: "존 맥긴", position: "MF", country: "스코틀랜드", age: 30, rating: 82 },
            { name: "유리 틸레만스", position: "MF", country: "벨기에", age: 28, rating: 88 },
            { name: "올리 왓킨스", position: "FW", country: "잉글랜드", age: 29, rating: 87 },
            { name: "뤼카 디뉴", position: "DF", country: "프랑스", age: 32, rating: 71 },
            { name: "파우 토레스", position: "DF", country: "스페인", age: 28, rating: 85 },
            { name: "안드레스 가르시아", position: "DF", country: "스페인", age: 22, rating: 68 },
            { name: "도니얼 말런", position: "FW", country: "네덜란드", age: 26, rating: 83 },
            { name: "마르코 아센시오", position: "FW", country: "스페인", age: 29, rating: 79 },
            { name: "이안 마트센", position: "DF", country: "네덜란드", age: 23, rating: 84 },
            { name: "에밀리아노 마르티네스", position: "GK", country: "아르헨티나", age: 32, rating: 85 },
            { name: "아마두 오나나", position: "MF", country: "벨기에", age: 23, rating: 84 },
            { name: "로빈 올센", position: "GK", country: "스웨덴", age: 35, rating: 69 },
            { name: "라마어 보하르더", position: "DF", country: "네덜란드", age: 21, rating: 71 },
            { name: "모건 로저스", position: "FW", country: "잉글랜드", age: 23, rating: 86 },
            { name: "코트니 호즈", position: "DF", country: "잉글랜드", age: 30, rating: 71 },
            { name: "레온 베일리", position: "FW", country: "자메이카", age: 27, rating: 82 },
            { name: "제이콥 램지", position: "MF", country: "잉글랜드", age: 24, rating: 79 },
            { name: "부바카르 카마라", position: "MF", country: "프랑스", age: 25, rating: 82 },
            { name: "올리비에르 지크", position: "GK", country: "폴란드", age: 21, rating: 67 }
        ],
        description: "빌라 파크의 자존심을 되찾기 위한 클라렛과 블루의 부활"
    },

    "라이프치히": {
        league: 2,
        players: [
            { name: "페테르 굴라치", position: "GK", country: "헝가리", age: 35, rating: 81 },
            { name: "뤼츠하럴 헤이르트라위다", position: "DF", country: "네덜란드", age: 25, rating: 83 },
            { name: "빌리 오르반", position: "DF", country: "헝가리", age: 32, rating: 83 },
            { name: "엘 샤데유 비치아부", position: "DF", country: "프랑스", age: 20, rating: 77 },
            { name: "안토니오 누사", position: "MF", country: "노르웨이", age: 20, rating: 84 },
            { name: "아마두 아이다라", position: "MF", country: "말리", age: 27, rating: 81 },
            { name: "유수프 포울센", position: "FW", country: "덴마크", age: 31, rating: 73 },
            { name: "로이스 오펜다", position: "FW", country: "벨기에", age: 25, rating: 87 },
            { name: "니콜라스 자이발트", position: "MF", country: "오스트리아", age: 24, rating: 80 },
            { name: "크리스토프 바움가르트너", position: "MF", country: "오스트리아", age: 26, rating: 78 },
            { name: "루카스 클로스터만", position: "DF", country: "독일", age: 29, rating: 81 },
            { name: "리들레 바쿠", position: "DF", country: "독일", age: 27, rating: 78 },
            { name: "아르투르 베르미렌", position: "MF", country: "벨기에", age: 20, rating: 79 },
            { name: "아산 우에드라오고", position: "MF", country: "독일", age: 19, rating: 79 },
            { name: "코스타 네델코비치", position: "DF", country: "세르비아", age: 20, rating: 67 },
            { name: "다비트 라움", position: "DF", country: "독일", age: 27, rating: 84 },
            { name: "카스텔로 뤼케바", position: "DF", country: "프랑스", age: 22, rating: 76 },
            { name: "크사버 슐라거", position: "MF", country: "오스트리아", age: 27, rating: 82 },
            { name: "마르턴 판더보르트", position: "GK", country: "벨기에", age: 23, rating: 81 },
            { name: "베냐민 헨릭스", position: "DF", country: "독일", age: 28, rating: 76 },
            { name: "케빈 캄플", position: "MF", country: "슬로베니아", age: 34, rating: 69 }
        ],
        description: "라이프치히의 젊은 에너지와 혁신적인 축구"
    },

    "세비야": {
        league: 2,
        players: [
            { name: "알바로 페르난데스", position: "GK", country: "스페인", age: 27, rating: 73 },
            { name: "아드리아 페드로사", position: "DF", country: "스페인", age: 27, rating: 76 },
            { name: "키케 살라스", position: "DF", country: "스페인", age: 23, rating: 79 },
            { name: "루벤 바르가스", position: "FW", country: "스위스", age: 26, rating: 78 },
            { name: "네마냐 구데이", position: "MF", country: "세르비아", age: 33, rating: 78 },
            { name: "이삭 로메로", position: "FW", country: "스페인", age: 25, rating: 74 },
            { name: "도디 루케바키오", position: "FW", country: "벨기에", age: 27, rating: 84 },
            { name: "외르얀 뉠란", position: "GK", country: "노르웨이", age: 34, rating: 75 },
            { name: "페케", position: "FW", country: "스페인", age: 24, rating: 74 },
            { name: "아코르 아담스", position: "FW", country: "나이지리아", age: 30, rating: 71 },
            { name: "뤼시앵 아구메", position: "MF", country: "프랑스", age: 23, rating: 83 },
            { name: "지브릴 소우", position: "MF", country: "스위스", age: 28, rating: 82 },
            { name: "치데라 에주케", position: "FW", country: "나이지리아", age: 27, rating: 72 },
            { name: "로익 바데", position: "DF", country: "프랑스", age: 25, rating: 83 },
            { name: "마르캉", position: "DF", country: "브라질", age: 29, rating: 75 },
            { name: "탕기 니안주", position: "DF", country: "프랑스", age: 23, rating: 79 },
            { name: "후안루 산체스", position: "DF", country: "스페인", age: 21, rating: 76 },
            { name: "스타니스 이덤보 무잠보", position: "FW", country: "벨기에", age: 20, rating: 70 },
            { name: "알베르토 플로레스", position: "GK", country: "스페인", age: 28, rating: 68 },
            { name: "호세 앙헬 카르모나", position: "DF", country: "스페인", age: 23, rating: 82 },
            { name: "켈레치 이헤나초", position: "FW", country: "나이지리아", age: 28, rating: 74 },
            { name: "김민수", position: "MF", country: "대한민국", age: 19, rating: 68 }
        ],
        description: "네르비온의 열정을 되살리려는 세비야의 도전"
    },

    "아약스": {
        league: 2,
        players: [
            { name: "비테슬라프 야로스", position: "GK", country: "체코", age: 24, rating: 67 },
            { name: "루카스 호자", position: "DF", country: "브라질", age: 25, rating: 73 },
            { name: "안톤 고에이", position: "DF", country: "덴마크", age: 22, rating: 74 },
            { name: "조렐 하토", position: "DF", country: "네덜란드", age: 19, rating: 84 },
            { name: "오언 베인달", position: "DF", country: "네덜란드", age: 25, rating: 71 },
            { name: "라울 모로", position: "FW", country: "스페인", age: 22, rating: 72 },
            { name: "케네스 테일러", position: "MF", country: "네덜란드", age: 23, rating: 82 },
            { name: "브라이언 브로비", position: "FW", country: "네덜란드", age: 23, rating: 85 },
            { name: "오스카르 글루크", position: "FW", country: "이스라엘", age: 21, rating: 70 },
            { name: "미카 고츠", position: "FW", country: "벨기에", age: 20, rating: 68 },
            { name: "요에리 헤르켄스", position: "GK", country: "네덜란드", age: 19, rating: 66 },
            { name: "아흐메트잔 카플란", position: "DF", country: "튀르키예", age: 22, rating: 71 },
            { name: "유리 바스", position: "DF", country: "네덜란드", age: 22, rating: 76 },
            { name: "올리베르 에드바르센", position: "FW", country: "노르웨이", age: 26, rating: 77 },
            { name: "데이비 클라센", position: "MF", country: "네덜란드", age: 32, rating: 78 },
            { name: "베르트랑 트라오레", position: "FW", country: "부르키나파소", age: 29, rating: 73 },
            { name: "브랑코 판 덴 보먼", position: "MF", country: "네덜란드", age: 30, rating: 74 },
            { name: "렘코 파스베이르", position: "GK", country: "네덜란드", age: 41, rating: 75 },
            { name: "스티븐 베르하위스", position: "FW", country: "네덜란드", age: 33, rating: 83 },
            { name: "바웃 베호르스트", position: "FW", country: "네덜란드", age: 32, rating: 74 },
            { name: "키안 피츠짐", position: "MF", country: "네덜란드", age: 22, rating: 70 },
            { name: "요르디 무키오", position: "MF", country: "벨기에", age: 17, rating: 66 },
            { name: "디스 얀서", position: "DF", country: "네덜란드", age: 19, rating: 67 },
            { name: "요시프 슈탈로", position: "DF", country: "크로아티아", age: 25, rating: 81 },
            { name: "율리안 브란데스", position: "MF", country: "독일", age: 21, rating: 70 },
            { name: "유리 레헤이르", position: "MF", country: "네덜란드", age: 21, rating: 72 },
            { name: "얀 파베르스키", position: "FW", country: "폴란드", age: 19, rating: 68 },
            { name: "찰리 셋퍼드", position: "GK", country: "잉글랜드", age: 21, rating: 74 },
            { name: "폴 리버슨", position: "GK", country: "네덜란드", age: 20, rating: 68 },
            { name: "라얀 부니다", position: "FW", country: "벨기에", age: 19, rating: 67 },
            { name: "데이빗 칼로코", position: "FW", country: "네덜란드", age: 20, rating: 68 },
            { name: "돈안젤로 코나두", position: "FW", country: "네덜란드", age: 19, rating: 68 },
            { name: "숀 스퇴르", position: "MF", country: "네덜란드", age: 17, rating: 66 },
            { name: "아론 바우만", position: "DF", country: "네덜란드", age: 17, rating: 65 },
            { name: "추바 악폼", position: "FW", country: "잉글랜드", age: 29, rating: 73 },
            { name: "시베르트 만스베르크", position: "MF", country: "노르웨이", age: 23, rating: 75 },
            { name: "트리스탄 호이어", position: "DF", country: "네덜란드", age: 20, rating: 67 }
        ],
        description: "암스테르담의 자존심을 되찾기 위한 토털 풋볼의 부활"
    },

    "AS_로마": {
        league: 2,
        players: [
            { name: "데빈 렌스", position: "DF", country: "네덜란드", age: 22, rating: 75 },
            { name: "앙헬리뇨", position: "DF", country: "스페인", age: 28, rating: 82 },
            { name: "브라얀 크리스탄테", position: "MF", country: "이탈리아", age: 30, rating: 81 },
            { name: "에방 은디카", position: "DF", country: "프랑스", age: 25, rating: 84 },
            { name: "로렌초 펠레그리니", position: "MF", country: "이탈리아", age: 29, rating: 83 },
            { name: "아르템 도우비크", position: "FW", country: "우크라이나", age: 28, rating: 85 },
            { name: "사우드 압둘하미드", position: "DF", country: "사우디아라비아", age: 26, rating: 74 },
            { name: "에반 퍼거슨", position: "FW", country: "아일랜드", age: 20, rating: 78 },
            { name: "마라쉬 쿰불라", position: "DF", country: "알바니아", age: 25, rating: 78 },
            { name: "레안드로 파레데스", position: "MF", country: "아르헨티나", age: 31, rating: 75 },
            { name: "마누 코네", position: "MF", country: "프랑스", age: 24, rating: 82 },
            { name: "마티아스 소울레", position: "FW", country: "아르헨티나", age: 22, rating: 86 },
            { name: "제키 첼리크", position: "DF", country: "튀르키예", age: 28, rating: 77 },
            { name: "파울로 디발라", position: "FW", country: "아르헨티나", age: 31, rating: 84 },
            { name: "잔루카 만치니", position: "DF", country: "이탈리아", age: 29, rating: 83 },
            { name: "빅토르 넬손", position: "DF", country: "덴마크", age: 26, rating: 76 },
            { name: "닐 엘 야누이", position: "MF", country: "프랑스", age: 21, rating: 83 },
            { name: "아나스 살라에딘", position: "DF", country: "네덜란드", age: 23, rating: 69 },
            { name: "톰마소 발단치", position: "MF", country: "이탈리아", age: 22, rating: 77 },
            { name: "니콜로 피실리", position: "FW", country: "이탈리아", age: 20, rating: 75 },
            { name: "레온 베일리", position: "FW", country: "자메이카", age: 28, rating: 78 },
            { name: "부바 상가레", position: "DF", country: "스페인", age: 17, rating: 67 },
            { name: "페데리코 나르딘", position: "DF", country: "이탈리아", age: 18, rating: 66 },
            { name: "스테판 엘샤라위", position: "FW", country: "이탈리아", age: 32, rating: 82 },
            { name: "피에를루이지 골리니", position: "GK", country: "이탈리아", age: 30, rating: 71 },
            { name: "밀레 스빌라르", position: "GK", country: "세르비아", age: 25, rating: 75 }
        ],
        description: "로마의 영광을 되찾기 위한 잘로로시의 도전"
    },

    "레버쿠젠": {
        league: 2,
        players: [
            { name: "루카시 흐라데츠키", position: "GK", country: "핀란드", age: 35, rating: 82 },
            { name: "피에로 잉카피에", position: "DF", country: "에콰도르", age: 23, rating: 83 },
            { name: "자렐 콴사", position: "DF", country: "잉글랜드", age: 22, rating: 74 },
            { name: "마리오 에르모소", position: "DF", country: "스페인", age: 30, rating: 77 },
            { name: "요나스 호프만", position: "MF", country: "독일", age: 33, rating: 81 },
            { name: "로베르트 안드리히", position: "MF", country: "독일", age: 30, rating: 79 },
            { name: "마르탱 테리에", position: "FW", country: "프랑스", age: 28, rating: 76 },
            { name: "에드몽 탑소바", position: "DF", country: "부르키나파소", age: 26, rating: 85 },
            { name: "아르투르", position: "DF", country: "브라질", age: 22, rating: 69 },
            { name: "파트리크 시크", position: "FW", country: "체코", age: 29, rating: 86 },
            { name: "알레호 사르코", position: "FW", country: "아르헨티나", age: 19, rating: 67 },
            { name: "네이선 텔러", position: "FW", country: "잉글랜드", age: 26, rating: 76 },
            { name: "알레한드로 그리말도", position: "DF", country: "스페인", age: 29, rating: 85 },
            { name: "아민 아들리", position: "FW", country: "프랑스", age: 25, rating: 77 },
            { name: "빅터 보니페이스", position: "FW", country: "나이지리아", age: 24, rating: 85 },
            { name: "알레시 가르시아", position: "MF", country: "스페인", age: 28, rating: 81 },
            { name: "에세키엘 팔라시오스", position: "MF", country: "아르헨티나", age: 26, rating: 82 },
            { name: "말릭 틸먼", position: "MF", country: "미국", age: 23, rating: 86 },
            { name: "니클라스 롬프", position: "GK", country: "독일", age: 32, rating: 64 },
            { name: "주누엘 벨로시앙", position: "DF", country: "프랑스", age: 20, rating: 76 },
            { name: "마르크 플레컨", position: "GK", country: "네덜란드", age: 32, rating: 71 },
            { name: "악셀 타페", position: "DF", country: "프랑스", age: 17, rating: 66 },
            { name: "이브라힘 마자", position: "MF", country: "독일", age: 19, rating: 67 },
            { name: "압둘라예 파예", position: "DF", country: "세네갈", age: 20, rating: 72 }
        ],
        description: "바이엘 레버쿠젠의 무패 신화를 이어가려는 의지"
    },

    "스포르팅_CP": {
        league: 2,
        players: [
            { name: "프랑코 이스라엘", position: "GK", country: "우루과이", age: 25, rating: 72 },
            { name: "마테우스 헤이스", position: "DF", country: "브라질", age: 30, rating: 74 },
            { name: "제리 신트쥐스터", position: "DF", country: "네덜란드", age: 28, rating: 72 },
            { name: "모리타 히데마사", position: "MF", country: "일본", age: 30, rating: 77 },
            { name: "제노 데바스트", position: "DF", country: "벨기에", age: 21, rating: 73 },
            { name: "페드루 곤살베스", position: "FW", country: "포르투갈", age: 27, rating: 85 },
            { name: "누누 산투스", position: "MF", country: "포르투갈", age: 30, rating: 82 },
            { name: "블라단 코바체비치", position: "GK", country: "보스니아 헤르체고비나", age: 27, rating: 69 },
            { name: "프란시스쿠 트링캉", position: "FW", country: "포르투갈", age: 25, rating: 86 },
            { name: "콘라드 하더", position: "FW", country: "덴마크", age: 20, rating: 67 },
            { name: "막시밀리아노 아라우호", position: "FW", country: "우루과이", age: 25, rating: 71 },
            { name: "이반 프레스네다", position: "DF", country: "스페인", age: 20, rating: 72 },
            { name: "후이 실바", position: "GK", country: "포르투갈", age: 31, rating: 74 },
            { name: "곤살루 이나시우", position: "DF", country: "포르투갈", age: 23, rating: 84 },
            { name: "우스망 디오망데", position: "DF", country: "코트디부아르", age: 21, rating: 83 },
            { name: "비엘 테이셰이라", position: "FW", country: "포르투갈", age: 20, rating: 67 },
            { name: "지에구 칼라이", position: "GK", country: "브라질", age: 21, rating: 66 },
            { name: "모르텐 히울만", position: "MF", country: "덴마크", age: 26, rating: 83 },
            { name: "히카르두 이스가이우", position: "DF", country: "포르투갈", age: 32, rating: 69 },
            { name: "지오바니 켄다", position: "FW", country: "포르투갈", age: 18, rating: 83 },
            { name: "에두아르두 콰레스마", position: "DF", country: "포르투갈", age: 23, rating: 79 },
            { name: "라파엘 넬", position: "FW", country: "포르투갈", age: 19, rating: 66 },
            { name: "아폰수 모레이라", position: "FW", country: "포르투갈", age: 20, rating: 67 }
        ],
        description: "리스본의 사자들이 다시 한번 포효하는 스포르팅의 부활"
    },

    "벤피카": {
        league: 2,
        players: [
            { name: "아나톨리 트루빈", position: "GK", country: "우크라이나", age: 24, rating: 79 },
            { name: "안토니우 실바", position: "DF", country: "포르투갈", age: 21, rating: 84 },
            { name: "알렉산데르 바", position: "DF", country: "덴마크", age: 27, rating: 82 },
            { name: "아마르 데디치", position: "DF", country: "보스니아", age: 22, rating: 72 },
            { name: "프레드리크 아우르스네스", position: "MF", country: "노르웨이", age: 29, rating: 84 },
            { name: "프란조 이바노비치", position: "FW", country: "크로아티아", age: 21, rating: 73 },
            { name: "오르쿤 쾨크취", position: "MF", country: "튀르키예", age: 24, rating: 85 },
            { name: "엔조 바레네체아", position: "MF", country: "아르헨티나", age: 24, rating: 82 },
            { name: "반젤리스 파블리디스", position: "FW", country: "그리스", age: 26, rating: 86 },
            { name: "마누 실바", position: "MF", country: "포르투갈", age: 24, rating: 81 },
            { name: "케렘 아크튀르크올루", position: "FW", country: "튀르키예", age: 26, rating: 84 },
            { name: "레안드루 바헤이루", position: "MF", country: "룩셈부르크", age: 25, rating: 77 },
            { name: "안드레아 벨로티", position: "FW", country: "이탈리아", age: 31, rating: 75 },
            { name: "안드레아스 시엘데루프", position: "MF", country: "노르웨이", age: 21, rating: 73 },
            { name: "사무엘 소아르스", position: "GK", country: "포르투갈", age: 23, rating: 74 },
            { name: "잔루카 프레스티아니", position: "FW", country: "아르헨티나", age: 19, rating: 71 },
            { name: "사무엘 달", position: "DF", country: "노르웨이", age: 22, rating: 77 },
            { name: "브루마", position: "FW", country: "포르투갈", age: 30, rating: 82 },
            { name: "니콜라스 오타멘디", position: "DF", country: "아르헨티나", age: 37, rating: 78 },
            { name: "토마스 아라우주", position: "DF", country: "포르투갈", age: 23, rating: 81 },
            { name: "티아구 고베이아", position: "FW", country: "포르투갈", age: 24, rating: 69 },
            { name: "플로렌티누 루이스", position: "MF", country: "포르투갈", age: 25, rating: 82 },
            { name: "안드레 고메스", position: "GK", country: "포르투갈", age: 20, rating: 67 },
            { name: "구스타부 마르케스", position: "DF", country: "브라질", age: 22, rating: 68 },
            { name: "아드리안 바이마리", position: "MF", country: "스위스", age: 22, rating: 67 },
            { name: "주앙 벨로소", position: "MF", country: "포르투갈", age: 20, rating: 69 },
            { name: "헤나투 산체스", position: "MF", country: "포르투갈", age: 27, rating: 82 },
            { name: "리차르드 리오스", position: "MF", country: "콜롬비아", age: 25, rating: 71 }
        ],
        description: "이글스의 자존심과 전통을 이어가는 벤피카의 도전"
    },

    "셀틱": {
        league: 2,
        players: [
            { name: "카스페르 슈마이켈", position: "GK", country: "덴마크", age: 38, rating: 72 },
            { name: "앨리스테어 존스턴", position: "DF", country: "캐나다", age: 26, rating: 81 },
            { name: "리암 스케일스", position: "DF", country: "아일랜드", age: 26, rating: 76 },
            { name: "오스턴 트러스티", position: "DF", country: "미국", age: 26, rating: 70 },
            { name: "조타", position: "FW", country: "포르투갈", age: 26, rating: 76 },
            { name: "베니아민 뉘그렌", position: "FW", country: "스웨덴", age: 24, rating: 72 },
            { name: "아담 이다", position: "FW", country: "아일랜드", age: 24, rating: 73 },
            { name: "빌랴미 시니살로", position: "GK", country: "핀란드", age: 23, rating: 73 },
            { name: "양현준", position: "FW", country: "대한민국", age: 23, rating: 76 },
            { name: "루크 매코완", position: "MF", country: "스코틀랜드", age: 27, rating: 75 },
            { name: "야마다 신", position: "FW", country: "일본", age: 25, rating: 69 },
            { name: "칼럼 오스먼드", position: "FW", country: "오스트레일리아", age: 19, rating: 66 },
            { name: "캐머런 카터비커스", position: "DF", country: "미국", age: 27, rating: 74 },
            { name: "마르코 틸리오", position: "FW", country: "오스트레일리아", age: 23, rating: 71 },
            { name: "조니 케니", position: "FW", country: "아일랜드", age: 22, rating: 66 },
            { name: "이나무라 하야토", position: "DF", country: "일본", age: 24, rating: 75 },
            { name: "아르네 엥얼스", position: "MF", country: "벨기에", age: 21, rating: 67 },
            { name: "파울루 베르나르두", position: "MF", country: "포르투갈", age: 23, rating: 69 },
            { name: "로스 두핸", position: "GK", country: "스코틀랜드", age: 27, rating: 68 },
            { name: "마에다 다이젠", position: "FW", country: "일본", age: 27, rating: 77 },
            { name: "하타테 레오", position: "MF", country: "일본", age: 27, rating: 74 },
            { name: "칼럼 맥그리거", position: "MF", country: "스코틀랜드", age: 32, rating: 76 },
            { name: "자마이 심슨-퓨시", position: "DF", country: "잉글랜드", age: 19, rating: 69 },
            { name: "제임스 포레스트", position: "FW", country: "스코틀랜드", age: 34, rating: 67 },
            { name: "안토니 랄스턴", position: "DF", country: "스코틀랜드", age: 26, rating: 73 },
            { name: "스티븐 웰시", position: "DF", country: "스코틀랜드", age: 25, rating: 70 },
            { name: "키어런 티어니", position: "DF", country: "스코틀랜드", age: 28, rating: 76 }
        ],
        description: "글래스고의 녹색과 흰색 호프스를 위한 셀틱의 전통"
    },

    "페예노르트": {
        league: 2,
        players: [
            { name: "저스틴 베일로", position: "GK", country: "네덜란드", age: 27, rating: 67 },
            { name: "배승균", position: "MF", country: "대한민국", age: 18, rating: 66 },
            { name: "바르트 니우코프", position: "DF", country: "네덜란드", age: 29, rating: 71 },
            { name: "토마스 베일런", position: "DF", country: "네덜란드", age: 23, rating: 77 },
            { name: "와타나베 츠요시", position: "DF", country: "일본", age: 28, rating: 73 },
            { name: "헤이스 스말", position: "DF", country: "네덜란드", age: 27, rating: 76 },
            { name: "황인범", position: "MF", country: "대한민국", age: 28, rating: 83 },
            { name: "야쿠프 모데르", position: "MF", country: "폴란드", age: 26, rating: 82 },
            { name: "퀸턴 팀버르", position: "MF", country: "네덜란드", age: 24, rating: 82 },
            { name: "우에다 아야세", position: "FW", country: "일본", age: 26, rating: 73 },
            { name: "칼빈 스텡스", position: "FW", country: "네덜란드", age: 26, rating: 75 },
            { name: "아넬 아흐메도지치", position: "DF", country: "보스니아", age: 26, rating: 76 },
            { name: "곤살로 보르즈스", position: "FW", country: "포르투갈", age: 24, rating: 74 },
            { name: "루시아노 발렌테", position: "MF", country: "네덜란드", age: 21, rating: 78 },
            { name: "게르노트 트라우너", position: "DF", country: "오스트리아", age: 33, rating: 73 },
            { name: "훌리안 카란사", position: "FW", country: "아르헨티나", age: 25, rating: 72 },
            { name: "제일란드 미첼", position: "DF", country: "코스타리카", age: 20, rating: 66 },
            { name: "플라멘 안드레예프", position: "GK", country: "불가리아", age: 21, rating: 65 },
            { name: "티몬 벨렌로이터", position: "GK", country: "독일", age: 29, rating: 75 },
            { name: "아니스 하지 무사", position: "FW", country: "알제리", age: 23, rating: 79 },
            { name: "셈 스테인", position: "MF", country: "네덜란드", age: 23, rating: 84 },
            { name: "실로 트잔트", position: "MF", country: "네덜란드", age: 21, rating: 69 },
            { name: "히베로 레아트", position: "DF", country: "네덜란드", age: 19, rating: 78 },
            { name: "카스퍼르 텡스테트", position: "FW", country: "덴마크", age: 25, rating: 76 },
            { name: "우사마 타갈린", position: "MF", country: "모로코", age: 22, rating: 73 },
            { name: "조르당 로통바", position: "DF", country: "스위스", age: 26, rating: 74 },
            { name: "스테파노 카리요", position: "FW", country: "멕시코", age: 19, rating: 68 },
            { name: "크리스-케빈 나제", position: "MF", country: "프랑스", age: 24, rating: 71 },
            { name: "리암 보신", position: "GK", country: "벨기에", age: 29, rating: 68 }
        ],
        description: "로테르담의 자존심을 되찾기 위한 페예노르트의 열정"
    },

    // "PSV": {
    //     league: 2,
    //     players: [
    //         { name: "니크 올레이", position: "GK", country: "네덜란드", age: 30, rating: 75 },
    //         { name: "아르만도 오비스포", position: "DF", country: "네덜란드", age: 26, rating: 72 },
    //         { name: "이반 페리시치", position: "MF", country: "크로아티아", age: 36, rating: 82 },
    //         { name: "라이언 플라밍고", position: "DF", country: "네덜란드", age: 22, rating: 80 },
    //         { name: "루번 판보멀", position: "FW", country: "네덜란드", age: 20, rating: 79 },
    //         { name: "세르지뇨 데스트", position: "DF", country: "미국", age: 24, rating: 75 },
    //         { name: "리카르도 페피", position: "FW", country: "미국", age: 22, rating: 79 },
    //         { name: "알라산 플레아", position: "FW", country: "프랑스", age: 32, rating: 77 },
    //         { name: "마체이 코바르시", position: "GK", country: "체코", age: 25, rating: 73 },
    //         { name: "마우루 주니오르", position: "MF", country: "브라질", age: 26, rating: 83 },
    //         { name: "올리비에 보스칼리", position: "DF", country: "프랑스", age: 27, rating: 81 },
    //         { name: "에스미르 바즈락타레비치", position: "FW", country: "미국", age: 20, rating: 68 },
    //         { name: "휘스 틸", position: "MF", country: "네덜란드", age: 27, rating: 84 },
    //         { name: "쿠하이브 드리우시", position: "FW", country: "모로코", age: 23, rating: 72 },
    //         { name: "예르디 스하우턴", position: "MF", country: "네덜란드", age: 28, rating: 78 },
    //         { name: "조이 페이르만", position: "MF", country: "네덜란드", age: 26, rating: 85 },
    //         { name: "닉 스힉스", position: "GK", country: "네덜란드", age: 19, rating: 69 },
    //         { name: "킬리안 실디야", position: "DF", country: "프랑스", age: 23, rating: 81 },
    //         { name: "아이삭 바바디", position: "MF", country: "네덜란드", age: 20, rating: 76 },
    //         { name: "루카스 페레스", position: "FW", country: "스페인", age: 36, rating: 74 },
    //         { name: "티호 랜드", position: "MF", country: "네덜란드", age: 19, rating: 70 },
    //         { name: "이스마엘 세이바리", position: "MF", country: "모로코", age: 24, rating: 83 },
    //         { name: "야레크 가시오로프스키", position: "DF", country: "스페인", age: 20, rating: 74 },
    //         { name: "아다모 나갈로", position: "DF", country: "부르키나파소", age: 22, rating: 69 },
    //         { name: "타이 아베드", position: "MF", country: "이스라엘", age: 21, rating: 71 }
    //     ],
    //     description: "아인트호벤의 빨간 군단이 되살리는 PSV의 전통"
    // },

    "올랭피크_드_마르세유": {
        league: 2,
        players: [
            { name: "헤로니모 룰리", position: "GK", country: "아르헨티나", age: 33, rating: 78 },
            { name: "파쿤도 메디나", position: "DF", country: "아르헨티나", age: 26, rating: 83 },
            { name: "C-J 이건라일리", position: "DF", country: "잉글랜드", age: 22, rating: 80 },
            { name: "레오나르도 발레르디", position: "DF", country: "아르헨티나", age: 26, rating: 85 },
            { name: "울리세스 가르시아", position: "DF", country: "스위스", age: 29, rating: 78 },
            { name: "앙겔 고메스", position: "MF", country: "잉글랜드", age: 24, rating: 76 },
            { name: "닐 모페", position: "FW", country: "프랑스", age: 28, rating: 72 },
            { name: "아민 구이리", position: "FW", country: "프랑스", age: 25, rating: 81 },
            { name: "메이슨 그린우드", position: "FW", country: "잉글랜드", age: 23, rating: 87 },
            { name: "아민 하릿", position: "MF", country: "모로코", age: 28, rating: 78 },
            { name: "제프리 더랭", position: "GK", country: "네덜란드", age: 27, rating: 71 },
            { name: "데릭 코넬리우스", position: "DF", country: "캐나다", age: 27, rating: 75 },
            { name: "이고르 파이샹", position: "FW", country: "브라질", age: 25, rating: 84 },
            { name: "조너선 로우", position: "FW", country: "잉글랜드", age: 22, rating: 74 },
            { name: "조프레 콘도그비아", position: "MF", country: "중앙아프리카공화국", age: 32, rating: 79 },
            { name: "티모시 웨아", position: "FW", country: "미국", age: 25, rating: 79 },
            { name: "이스마엘 베나세르", position: "MF", country: "알제리", age: 27, rating: 78 },
            { name: "피에르에밀 호이비에르", position: "MF", country: "덴마크", age: 30, rating: 85 },
            { name: "빌랄 나디르", position: "MF", country: "프랑스", age: 21, rating: 69 },
            { name: "폴 리롤라", position: "DF", country: "스페인", age: 27, rating: 73 },
            { name: "루벤 블랑코", position: "GK", country: "스페인", age: 30, rating: 70 },
            { name: "피에르 에메릭 오바메양", position: "FW", country: "가봉", age: 36, rating: 83 },
            { name: "야니스 셀라미", position: "MF", country: "프랑스", age: 18, rating: 66 },
            { name: "가엘 라퐁", position: "MF", country: "프랑스", age: 19, rating: 67 },
            { name: "케일리안 압달라", position: "FW", country: "프랑스", age: 19, rating: 66 },
            { name: "대릴 바콜라", position: "MF", country: "프랑스", age: 17, rating: 68 },
            { name: "아미르 무리요", position: "DF", country: "파나마", age: 29, rating: 82 },
            { name: "아마르 데디치", position: "DF", country: "보스니아 헤르체고비나", age: 23, rating: 72 }
        ],
        description: "지중해의 열정과 프랑스의 자존심을 대표하는 마르세유"
    },

    // 3부 리그 시작
    "FC_서울": {
        league: 3,
        players: [
            { name: "이상민", position: "DF", country: "대한민국", age: 27, rating: 75 },
            { name: "야잔", position: "DF", country: "요르단", age: 29, rating: 78 },
            { name: "정승원", position: "MF", country: "대한민국", age: 28, rating: 79 },
            { name: "이승모", position: "MF", country: "대한민국", age: 27, rating: 76 },
            { name: "조영욱", position: "FW", country: "대한민국", age: 26, rating: 74 },
            { name: "린가드", position: "MF", country: "잉글랜드", age: 32, rating: 82 },
            { name: "천성훈", position: "FW", country: "대한민국", age: 24, rating: 72 },
            { name: "손승범", position: "FW", country: "대한민국", age: 21, rating: 71 },
            { name: "김현덕", position: "DF", country: "대한민국", age: 20, rating: 69 },
            { name: "최준", position: "DF", country: "대한민국", age: 26, rating: 73 },
            { name: "정태욱", position: "DF", country: "대한민국", age: 28, rating: 75 },
            { name: "강주혁", position: "FW", country: "대한민국", age: 18, rating: 67 },
            { name: "이한도", position: "DF", country: "대한민국", age: 31, rating: 76 },
            { name: "최철원", position: "GK", country: "대한민국", age: 31, rating: 74 },
            { name: "김진수", position: "DF", country: "대한민국", age: 33, rating: 73 },
            { name: "조영광", position: "DF", country: "대한민국", age: 21, rating: 68 },
            { name: "임준섭", position: "GK", country: "대한민국", age: 21, rating: 67 },
            { name: "허동민", position: "MF", country: "대한민국", age: 21, rating: 69 },
            { name: "문선민", position: "FW", country: "대한민국", age: 33, rating: 72 },
            { name: "바또", position: "FW", country: "코트디부아르", age: 19, rating: 70 },
            { name: "류재문", position: "MF", country: "대한민국", age: 31, rating: 74 },
            { name: "김주성", position: "DF", country: "대한민국", age: 24, rating: 71 },
            { name: "강현무", position: "GK", country: "대한민국", age: 30, rating: 73 },
            { name: "클리말라", position: "FW", country: "폴란드", age: 26, rating: 76 },
            { name: "배현서", position: "DF", country: "대한민국", age: 20, rating: 67 },
            { name: "김지원", position: "DF", country: "대한민국", age: 21, rating: 68 },
            { name: "정한민", position: "FW", country: "대한민국", age: 24, rating: 71 },
            { name: "박성훈", position: "DF", country: "대한민국", age: 22, rating: 69 },
            { name: "황도윤", position: "MF", country: "대한민국", age: 22, rating: 70 },
            { name: "둑스", position: "FW", country: "크로아티아", age: 31, rating: 77 },
            { name: "박수일", position: "DF", country: "대한민국", age: 29, rating: 72 },
            { name: "최준영", position: "DF", country: "대한민국", age: 20, rating: 67 },
            { name: "안데르손", position: "FW", country: "브라질", age: 27, rating: 75 },
            { name: "윤기욱", position: "GK", country: "대한민국", age: 18, rating: 65 },
            { name: "민지훈", position: "MF", country: "대한민국", age: 20, rating: 68 },
            { name: "루카스", position: "FW", country: "브라질", age: 25, rating: 74 },
            { name: "박장한결", position: "MF", country: "대한민국", age: 21, rating: 68 }
        ],
        description: "대한민국 수도의 자존심, 끊임없는 도전정신"
    },

    "갈라타사라이": {
        league: 3,
        players: [
            { name: "페르난도 무슬레라", position: "GK", country: "우루과이", age: 39, rating: 74 },
            { name: "이스마일 자콥스", position: "DF", country: "세네갈", age: 25, rating: 76 },
            { name: "에위프 아이든", position: "MF", country: "튀르키예", age: 21, rating: 71 },
            { name: "다빈손 산체스", position: "DF", country: "콜롬비아", age: 29, rating: 78 },
            { name: "롤런드 셜러이", position: "FW", country: "헝가리", age: 28, rating: 77 },
            { name: "케렘 데미르바이", position: "MF", country: "독일", age: 32, rating: 76 },
            { name: "마우로 이카르디", position: "FW", country: "아르헨티나", age: 32, rating: 79 },
            { name: "리로이 사네", position: "MF", country: "독일", age: 29, rating: 82 },
            { name: "유누스 아크귄", position: "MF", country: "튀르키예", age: 25, rating: 74 },
            { name: "데릭 쾬", position: "DF", country: "독일", age: 30, rating: 75 },
            { name: "베르칸 쿠틀루", position: "MF", country: "튀르키예", age: 27, rating: 74 },
            { name: "귀나이 귀벤츠", position: "GK", country: "튀르키예", age: 34, rating: 72 },
            { name: "가브리에우 사라", position: "MF", country: "브라질", age: 26, rating: 76 },
            { name: "아흐메드 쿠투주", position: "FW", country: "튀르키예", age: 25, rating: 74 },
            { name: "칸 아이한", position: "DF", country: "튀르키예", age: 30, rating: 73 },
            { name: "엘리아스 엘러르트", position: "DF", country: "덴마크", age: 22, rating: 73 },
            { name: "카를로스 쿠에스타", position: "DF", country: "콜롬비아", age: 26, rating: 74 },
            { name: "프셰미스와프 프랑코프스키", position: "DF", country: "폴란드", age: 30, rating: 73 },
            { name: "유수프 데미르", position: "MF", country: "오스트리아", age: 22, rating: 72 },
            { name: "루카스 토레이라", position: "MF", country: "우루과이", age: 29, rating: 76 },
            { name: "압둘케림 바르닥치", position: "DF", country: "튀르키예", age: 30, rating: 73 },
            { name: "빅터 오시멘", position: "FW", country: "나이지리아", age: 26, rating: 85 },
            { name: "잔카트 일마즈", position: "GK", country: "튀르키예", age: 20, rating: 68 },
            { name: "바르쉬 알페르 일마즈", position: "MF", country: "튀르키예", age: 25, rating: 72 },
            { name: "바란 데미로글루", position: "MF", country: "튀르키예", age: 20, rating: 70 },
            { name: "알리 예실유르트", position: "DF", country: "튀르키예", age: 20, rating: 68 },
            { name: "알리 투랍 불뷸", position: "DF", country: "튀르키예", age: 20, rating: 68 },
            { name: "함자 아크만", position: "MF", country: "튀르키예", age: 20, rating: 69 },
            { name: "에페 아크만", position: "MF", country: "튀르키예", age: 19, rating: 68 },
            { name: "카짐칸 카라타스", position: "DF", country: "튀르키예", age: 27, rating: 72 },
            { name: "아르다 윈야이", position: "DF", country: "튀르키예", age: 20, rating: 69 },
            { name: "마리오 르미나", position: "MF", country: "가봉", age: 31, rating: 74 }
        ],
        description: "이스탄불의 사자들이 보여주는 터키 축구의 자존심"
    },

    "알_힐랄": {
        league: 3,
        players: [
            { name: "야신 부누", position: "GK", country: "모로코", age: 34, rating: 79 },
            { name: "모하메드 알 오와이스", position: "GK", country: "사우디아라비아", age: 33, rating: 76 },
            { name: "칼리두 쿨리발리", position: "DF", country: "세네갈", age: 34, rating: 81 },
            { name: "알리 알 불라이히", position: "DF", country: "사우디아라비아", age: 35, rating: 74 },
            { name: "칼리파 알 다우사리", position: "DF", country: "사우디아라비아", age: 26, rating: 73 },
            { name: "테오 에르난데스", position: "DF", country: "프랑스", age: 27, rating: 84 },
            { name: "주앙 칸셀루", position: "DF", country: "포르투갈", age: 31, rating: 82 },
            { name: "야세르 알 샤흐라니", position: "DF", country: "사우디아라비아", age: 33, rating: 72 },
            { name: "하산 알 탐박티", position: "DF", country: "사우디아라비아", age: 26, rating: 72 },
            { name: "하마드 알 야미", position: "DF", country: "사우디아라비아", age: 26, rating: 71 },
            { name: "알리 라자미", position: "DF", country: "사우디아라비아", age: 29, rating: 72 },
            { name: "후벵 네베스", position: "MF", country: "포르투갈", age: 28, rating: 83 },
            { name: "세르게이 밀린코비치-사비치", position: "MF", country: "세르비아", age: 30, rating: 82 },
            { name: "모하메드 칸노", position: "MF", country: "사우디아라비아", age: 30, rating: 74 },
            { name: "살렘 알 다우사리", position: "MF", country: "사우디아라비아", age: 33, rating: 73 },
            { name: "무사브 알 주와이르", position: "MF", country: "사우디아라비아", age: 22, rating: 70 },
            { name: "나세르 알 다우사리", position: "MF", country: "사우디아라비아", age: 26, rating: 71 },
            { name: "알렉산다르 미트로비치", position: "FW", country: "세르비아", age: 30, rating: 81 },
            { name: "마우콩", position: "FW", country: "브라질", age: 28, rating: 77 },
            { name: "마르코스 레오나르두", position: "FW", country: "브라질", age: 22, rating: 75 },
            { name: "압둘라 알 함단", position: "FW", country: "사우디아라비아", age: 25, rating: 71 },
            { name: "압데라작 함달라", position: "FW", country: "모로코", age: 34, rating: 74 },
            { name: "카이오 세자르", position: "FW", country: "브라질", age: 21, rating: 72 },
            { name: "모테브 알 하르비", position: "DF", country: "사우디아라비아", age: 25, rating: 70 },
            { name: "다르윈 누녜스", position: "FW", country: "우루과이", age: 25, rating: 75 },
            { name: "모하메드 알 야미", position: "GK", country: "사우디아라비아", age: 27, rating: 69 }
        ],
        description: "사우디아라비아의 킹 클럽이 보여주는 중동 축구의 힘"
    },

    "알_이티하드": {
        league: 3,
        players: [
            { name: "카림 벤제마", position: "FW", country: "프랑스", age: 37, rating: 83 },
            { name: "은골로 캉테", position: "MF", country: "프랑스", age: 34, rating: 80 },
            { name: "파비뉴", position: "MF", country: "브라질", age: 31, rating: 79 },
            { name: "루이스 펠리피", position: "DF", country: "이탈리아", age: 28, rating: 77 },
            { name: "아흐메드 헤가지", position: "DF", country: "이집트", age: 34, rating: 73 },
            { name: "로마리뉴", position: "FW", country: "브라질", age: 34, rating: 75 },
            { name: "조타", position: "FW", country: "포르투갈", age: 26, rating: 76 },
            { name: "압데라작 함달라", position: "FW", country: "모로코", age: 34, rating: 74 },
            { name: "마르셀루 그로헤", position: "GK", country: "브라질", age: 38, rating: 71 },
            { name: "압둘라 알 마이유프", position: "GK", country: "사우디아라비아", age: 38, rating: 69 },
            { name: "파와즈 알 카르니", position: "GK", country: "사우디아라비아", age: 33, rating: 68 },
            { name: "아흐메드 샤라힐리", position: "DF", country: "사우디아라비아", age: 30, rating: 71 },
            { name: "무한나드 알 샹키티", position: "DF", country: "사우디아라비아", age: 25, rating: 70 },
            { name: "오마르 하우사위", position: "DF", country: "사우디아라비아", age: 40, rating: 67 },
            { name: "아흐메드 바마수드", position: "DF", country: "사우디아라비아", age: 29, rating: 70 },
            { name: "자카리아 알 하우사위", position: "DF", country: "사우디아라비아", age: 24, rating: 69 },
            { name: "파와즈 알 사구르", position: "DF", country: "사우디아라비아", age: 32, rating: 69 },
            { name: "술탄 파르한", position: "MF", country: "사우디아라비아", age: 28, rating: 71 },
            { name: "아와드 알 나슈리", position: "MF", country: "사우디아라비아", age: 23, rating: 70 },
            { name: "파르한 알 샴라니", position: "MF", country: "사우디아라비아", age: 26, rating: 70 },
            { name: "마르완 알 사하피", position: "MF", country: "사우디아라비아", age: 21, rating: 69 },
            { name: "압둘하미드", position: "MF", country: "사우디아라비아", age: 26, rating: 70 },
            { name: "탈랄 하지", position: "FW", country: "사우디아라비아", age: 17, rating: 66 },
            { name: "하룬 카마라", position: "FW", country: "사우디아라비아", age: 27, rating: 70 },
            { name: "압둘라만 알 아부드", position: "FW", country: "사우디아라비아", age: 30, rating: 71 }
        ],
        description: "벤제마가 이끄는 알 이티하드의 새로운 도전"
    },

    "알_나스르": {
        league: 3,
        players: [
            { name: "크리스티아누 호날두", position: "FW", country: "포르투갈", age: 40, rating: 86 },
            { name: "사디오 마네", position: "FW", country: "세네갈", age: 33, rating: 82 },
            { name: "마르셀루 브로조비치", position: "MF", country: "크로아티아", age: 32, rating: 80 },
            { name: "아이메릭 라포르테", position: "DF", country: "스페인", age: 31, rating: 81 },
            { name: "오타비우", position: "MF", country: "포르투갈", age: 30, rating: 78 },
            { name: "안데르송 탈리스카", position: "FW", country: "브라질", age: 31, rating: 78 },
            { name: "알렉스 텔레스", position: "DF", country: "브라질", age: 32, rating: 76 },
            { name: "유세프 엔네시리", position: "FW", country: "모로코", age: 28, rating: 77 },
            { name: "다비드 오스피나", position: "GK", country: "콜롬비아", age: 36, rating: 74 },
            { name: "나와프 알 아키디", position: "GK", country: "사우디아라비아", age: 25, rating: 70 },
            { name: "술탄 알 간남", position: "DF", country: "사우디아라비아", age: 31, rating: 72 },
            { name: "압둘라 알 암리", position: "DF", country: "사우디아라비아", age: 28, rating: 71 },
            { name: "압둘라흐만 가리브", position: "FW", country: "사우디아라비아", age: 28, rating: 72 },
            { name: "압둘마지드 알 술라이힘", position: "MF", country: "사우디아라비아", age: 31, rating: 71 },
            { name: "사미 알 나지", position: "MF", country: "사우디아라비아", age: 28, rating: 71 },
            { name: "알리 알 하산", position: "MF", country: "사우디아라비아", age: 28, rating: 71 },
            { name: "아이만 야히아", position: "MF", country: "사우디아라비아", age: 24, rating: 70 },
            { name: "모하메드 마란", position: "FW", country: "사우디아라비아", age: 24, rating: 70 },
            { name: "압둘아지즈 알 알리와", position: "FW", country: "사우디아라비아", age: 25, rating: 70 },
            { name: "칼리드 알 간남", position: "FW", country: "사우디아라비아", age: 24, rating: 69 },
            { name: "무함마드 알 파틸", position: "DF", country: "사우디아라비아", age: 33, rating: 70 },
            { name: "압둘레라 알 암리", position: "DF", country: "사우디아라비아", age: 28, rating: 70 },
            { name: "나와프 알 부샬", position: "DF", country: "사우디아라비아", age: 25, rating: 69 },
            { name: "압둘라히 마두", position: "DF", country: "사우디아라비아", age: 32, rating: 69 },
            { name: "모하메드 카심", position: "DF", country: "사우디아라비아", age: 30, rating: 69 }
        ],
        description: "크리스티아누 호날두가 새로운 도전을 펼치는 무대"
    },

    "아르헨티나_연합": {
        league: 3,
        players: [
            { name: "프랑코 아르마니", position: "GK", country: "아르헨티나", age: 38, rating: 74 },
            { name: "세르히오 로메로", position: "GK", country: "아르헨티나", age: 38, rating: 73 },
            { name: "세바스티안 메사", position: "GK", country: "아르헨티나", age: 25, rating: 72 },
            { name: "엔소 디아스", position: "DF", country: "아르헨티나", age: 29, rating: 76 },
            { name: "루카스 블론델", position: "DF", country: "아르헨티나", age: 28, rating: 75 },
            { name: "마르코스 로호", position: "DF", country: "아르헨티나", age: 35, rating: 74 },
            { name: "파브리시오 부스토스", position: "DF", country: "아르헨티나", age: 29, rating: 76 },
            { name: "니콜라스 발렌티니", position: "DF", country: "아르헨티나", age: 24, rating: 75 },
            { name: "에마누엘 맘마나", position: "DF", country: "아르헨티나", age: 29, rating: 75 },
            { name: "가브리엘 로하스", position: "DF", country: "아르헨티나", age: 28, rating: 74 },
            { name: "레오나르도 시갈리", position: "DF", country: "아르헨티나", age: 38, rating: 70 },
            { name: "아구스틴 팔라베시노", position: "MF", country: "아르헨티나", age: 28, rating: 77 },
            { name: "에세키엘 바르코", position: "MF", country: "아르헨티나", age: 26, rating: 76 },
            { name: "크리스티안 메디나", position: "MF", country: "아르헨티나", age: 23, rating: 74 },
            { name: "에키 페르난데스", position: "MF", country: "아르헨티나", age: 22, rating: 73 },
            { name: "엔소 페레스", position: "MF", country: "아르헨티나", age: 39, rating: 72 },
            { name: "이그나시오 페르난데스", position: "MF", country: "아르헨티나", age: 35, rating: 73 },
            { name: "후안 나르도니", position: "MF", country: "아르헨티나", age: 23, rating: 72 },
            { name: "페데리코 만쿠에요", position: "MF", country: "아르헨티나", age: 36, rating: 71 },
            { name: "미겔 보르자", position: "FW", country: "콜롬비아", age: 32, rating: 76 },
            { name: "에딘손 카바니", position: "FW", country: "우루과이", age: 38, rating: 75 },
            { name: "다리오 베네데토", position: "FW", country: "아르헨티나", age: 35, rating: 74 },
            { name: "후안 페르난도 킨테로", position: "FW", country: "콜롬비아", age: 32, rating: 75 },
            { name: "아담 바레이로", position: "FW", country: "파라과이", age: 29, rating: 73 },
            { name: "파쿤도 콜리디오", position: "FW", country: "아르헨티나", age: 25, rating: 74 }
        ],
        description: "아르헨티나 축구의 열정과 전통을 대표하는 팀"
    },

    "미국_연합": {
        league: 3,
        players: [
            { name: "리오넬 메시", position: "FW", country: "아르헨티나", age: 38, rating: 88 },
            { name: "루이스 수아레스", position: "FW", country: "우루과이", age: 38, rating: 81 },
            { name: "세르히오 부스케츠", position: "MF", country: "스페인", age: 37, rating: 79 },
            { name: "조르디 알바", position: "DF", country: "스페인", age: 36, rating: 76 },
            { name: "로드리고 데 파울", position: "MF", country: "아르헨티나", age: 31, rating: 83 },
            { name: "드레이크 캘린더", position: "GK", country: "미국", age: 27, rating: 72 },
            { name: "벤자민 크레마스키", position: "MF", country: "미국", age: 20, rating: 69 },
            { name: "니콜라스 프레이레", position: "DF", country: "아르헨티나", age: 31, rating: 74 },
            { name: "로만 첼렌타노", position: "GK", country: "미국", age: 24, rating: 70 },
            { name: "마르텐 파에스", position: "GK", country: "네덜란드", age: 27, rating: 73 },
            { name: "워커 짐머만", position: "DF", country: "미국", age: 32, rating: 74 },
            { name: "맷 미아즈가", position: "DF", country: "미국", age: 30, rating: 73 },
            { name: "마일스 로빈슨", position: "DF", country: "미국", age: 28, rating: 74 },
            { name: "카이 바그너", position: "DF", country: "독일", age: 32, rating: 75 },
            { name: "라이언 홀링스헤드", position: "DF", country: "미국", age: 34, rating: 72 },
            { name: "루시아노 아코스타", position: "MF", country: "아르헨티나", age: 31, rating: 76 },
            { name: "카를레스 길", position: "MF", country: "스페인", age: 32, rating: 75 },
            { name: "하니 무크타르", position: "MF", country: "독일", age: 30, rating: 74 },
            { name: "리키 푸치", position: "MF", country: "스페인", age: 25, rating: 73 },
            { name: "티아고 알마다", position: "MF", country: "아르헨티나", age: 24, rating: 75 },
            { name: "쿠초 에르난데스", position: "FW", country: "콜롬비아", age: 26, rating: 76 },
            { name: "드니 부앙가", position: "FW", country: "가봉", age: 30, rating: 80 },
            { name: "크리스티안 벤테케", position: "FW", country: "벨기에", age: 34, rating: 76 },
            { name: "로렌초 인시녜", position: "FW", country: "이탈리아", age: 34, rating: 77 },
            { name: "요르고스 야쿠마키스", position: "FW", country: "그리스", age: 30, rating: 74 }
        ],
        description: "메시의 마법이 펼쳐지는 MLS의 화려한 무대"
    },

    "멕시코_연합": {
        league: 3,
        players: [
        { name: "세르히오 라모스", position: "DF", country: "스페인", age: 39, rating: 78 },
        { name: "루이스 말라곤", position: "GK", country: "멕시코", age: 28, rating: 74 },
        { name: "나우엘 구스만", position: "GK", country: "아르헨티나", age: 39, rating: 72 },
        { name: "에스테반 안드라다", position: "GK", country: "아르헨티나", age: 34, rating: 73 },
        { name: "헤수스 가야르도", position: "DF", country: "멕시코", age: 30, rating: 74 },
        { name: "케빈 알바레스", position: "DF", country: "멕시코", age: 26, rating: 73 },
        { name: "이고르 리치노프스키", position: "DF", country: "칠레", age: 31, rating: 75 },
        { name: "에릭 아기레", position: "DF", country: "멕시코", age: 28, rating: 73 },
        { name: "빅토르 구스만", position: "DF", country: "멕시코", age: 30, rating: 74 },
        { name: "카를로스 살세도", position: "DF", country: "멕시코", age: 31, rating: 74 },
        { name: "이스라엘 레예스", position: "DF", country: "멕시코", age: 25, rating: 72 },
        { name: "기도 피사로", position: "MF", country: "아르헨티나", age: 35, rating: 75 },
        { name: "루이스 로모", position: "MF", country: "멕시코", age: 30, rating: 74 },
        { name: "디에고 발데스", position: "MF", country: "칠레", age: 31, rating: 75 },
        { name: "에릭 산체스", position: "MF", country: "멕시코", age: 25, rating: 72 },
        { name: "페르난도 고리아란", position: "MF", country: "우루과이", age: 30, rating: 74 },
        { name: "장 메네세스", position: "MF", country: "칠레", age: 32, rating: 74 },
        { name: "빅토르 구스만", position: "MF", country: "멕시코", age: 30, rating: 74 },
        { name: "알바로 피달고", position: "MF", country: "스페인", age: 28, rating: 73 },
        { name: "헨리 마르틴", position: "FW", country: "멕시코", age: 32, rating: 75 },
        { name: "앙드레 피에르 지냐크", position: "FW", country: "프랑스", age: 39, rating: 73 },
        { name: "기예르모 마르티네스", position: "FW", country: "멕시코", age: 30, rating: 74 },
        { name: "훌리안 키뇨네스", position: "FW", country: "멕시코", age: 28, rating: 73 },
        { name: "니콜라스 이바녜스", position: "FW", country: "아르헨티나", age: 30, rating: 74 }
        ],
        },
            "브라질_연합": {
        league: 3,
        players: [
            { name: "베베르통", position: "GK", country: "브라질", age: 37, rating: 74 },
            { name: "카시우", position: "GK", country: "브라질", age: 38, rating: 72 },
            { name: "존 빅토르", position: "GK", country: "브라질", age: 29, rating: 75 },
            { name: "구스타부 고메스", position: "DF", country: "파라과이", age: 32, rating: 80 },
            { name: "무리루 세르케이라", position: "DF", country: "브라질", age: 28, rating: 76 },
            { name: "레오 오르티스", position: "DF", country: "브라질", age: 29, rating: 77 },
            { name: "기예르메 아라나", position: "DF", country: "브라질", age: 28, rating: 78 },
            { name: "마르사우", position: "DF", country: "브라질", age: 36, rating: 73 },
            { name: "페드루 엔히키", position: "DF", country: "브라질", age: 30, rating: 76 },
            { name: "파브리시우 브루누", position: "DF", country: "브라질", age: 29, rating: 75 },
            { name: "아드리엘송", position: "DF", country: "브라질", age: 27, rating: 74 },
            { name: "하파에우 베이가", position: "MF", country: "브라질", age: 30, rating: 79 },
            { name: "히오르히안 데 아라스카에타", position: "MF", country: "우루과이", age: 31, rating: 82 },
            { name: "제르송", position: "MF", country: "브라질", age: 28, rating: 76 },
            { name: "안드레", position: "MF", country: "브라질", age: 24, rating: 77 },
            { name: "에베르통 히베이루", position: "MF", country: "브라질", age: 36, rating: 74 },
            { name: "알란 파트릭", position: "MF", country: "브라질", age: 34, rating: 75 },
            { name: "제 하파에우", position: "MF", country: "브라질", age: 32, rating: 76 },
            { name: "이고르 코로나두", position: "MF", country: "브라질", age: 32, rating: 75 },
            { name: "헐크", position: "FW", country: "브라질", age: 39, rating: 79 },
            { name: "치키뉴 소아레스", position: "FW", country: "브라질", age: 34, rating: 76 },
            { name: "헤르만 카노", position: "FW", country: "아르헨티나", age: 37, rating: 75 },
            { name: "가브리에우 바르보사", position: "FW", country: "브라질", age: 28, rating: 80 },
            { name: "페드루", position: "FW", country: "브라질", age: 28, rating: 78 },
            { name: "예페르손 소텔도", position: "FW", country: "베네수엘라", age: 28, rating: 77 }
        ],
        description: "브라질 축구의 삼바 리듬과 남미 특급 선수들의 축제"
    },

    "전북_현대": {
        league: 3,
        players: [
            { name: "김정훈", position: "GK", country: "대한민국", age: 24, rating: 72 },
            { name: "김영빈", position: "DF", country: "대한민국", age: 33, rating: 74 },
            { name: "최우진", position: "DF", country: "대한민국", age: 21, rating: 69 },
            { name: "박진섭", position: "MF", country: "대한민국", age: 29, rating: 76 },
            { name: "감보아", position: "MF", country: "브라질", age: 28, rating: 74 },
            { name: "한국영", position: "MF", country: "대한민국", age: 35, rating: 73 },
            { name: "티아고", position: "FW", country: "브라질", age: 31, rating: 79 },
            { name: "송민규", position: "FW", country: "대한민국", age: 25, rating: 74 },
            { name: "이승우", position: "MF", country: "대한민국", age: 27, rating: 78 },
            { name: "강상윤", position: "MF", country: "대한민국", age: 21, rating: 73 },
            { name: "전진우", position: "MF", country: "대한민국", age: 25, rating: 73 },
            { name: "성진영", position: "FW", country: "대한민국", age: 22, rating: 72 },
            { name: "박재용", position: "FW", country: "대한민국", age: 25, rating: 73 },
            { name: "진태호", position: "MF", country: "대한민국", age: 19, rating: 68 },
            { name: "이준호", position: "DF", country: "대한민국", age: 22, rating: 70 },
            { name: "츄마시", position: "FW", country: "가나", age: 31, rating: 74 },
            { name: "권창훈", position: "MF", country: "대한민국", age: 31, rating: 75 },
            { name: "김태환", position: "DF", country: "대한민국", age: 36, rating: 71 },
            { name: "박규민", position: "DF", country: "대한민국", age: 24, rating: 70 },
            { name: "최철순", position: "DF", country: "대한민국", age: 38, rating: 68 },
            { name: "홍정호", position: "DF", country: "대한민국", age: 35, rating: 72 },
            { name: "이규동", position: "MF", country: "대한민국", age: 21, rating: 69 },
            { name: "이영재", position: "MF", country: "대한민국", age: 30, rating: 74 },
            { name: "송범근", position: "GK", country: "대한민국", age: 27, rating: 71 },
            { name: "엄승민", position: "FW", country: "대한민국", age: 22, rating: 70 },
            { name: "장남웅", position: "MF", country: "대한민국", age: 21, rating: 68 },
            { name: "강현종", position: "FW", country: "대한민국", age: 21, rating: 69 },
            { name: "윤주영", position: "DF", country: "대한민국", age: 20, rating: 67 },
            { name: "황정구", position: "DF", country: "대한민국", age: 20, rating: 66 },
            { name: "이한결", position: "GK", country: "대한민국", age: 18, rating: 65 },
            { name: "한석진", position: "MF", country: "대한민국", age: 17, rating: 64 },
            { name: "김수형", position: "DF", country: "대한민국", age: 18, rating: 65 },
            { name: "서정혁", position: "DF", country: "대한민국", age: 19, rating: 66 },
            { name: "이재준", position: "DF", country: "대한민국", age: 18, rating: 65 },
            { name: "황승준", position: "DF", country: "대한민국", age: 19, rating: 66 },
            { name: "김민재", position: "MF", country: "대한민국", age: 21, rating: 68 },
            { name: "김태현", position: "DF", country: "대한민국", age: 28, rating: 73 },
            { name: "전지완", position: "GK", country: "대한민국", age: 21, rating: 67 },
            { name: "윤현석", position: "MF", country: "대한민국", age: 21, rating: 68 },
            { name: "정상운", position: "FW", country: "대한민국", age: 22, rating: 69 },
            { name: "공시현", position: "GK", country: "대한민국", age: 20, rating: 66 },
            { name: "연제운", position: "DF", country: "대한민국", age: 30, rating: 72 },
            { name: "콤파뇨", position: "FW", country: "이탈리아", age: 29, rating: 79 },
            { name: "김진규", position: "MF", country: "대한민국", age: 28, rating: 74 },
            { name: "임준휘", position: "FW", country: "대한민국", age: 20, rating: 67 },
            { name: "김창훈", position: "FW", country: "대한민국", age: 20, rating: 68 }
        ],
        description: "한국 축구의 명문, 전북의 자부심과 전통"
    },

    "울산_현대": {
        league: 3,
        players: [
            { name: "조현택", position: "DF", country: "대한민국", age: 24, rating: 72 },
            { name: "강민우", position: "DF", country: "대한민국", age: 19, rating: 67 },
            { name: "서명관", position: "DF", country: "대한민국", age: 22, rating: 70 },
            { name: "정우영", position: "MF", country: "대한민국", age: 35, rating: 74 },
            { name: "보야니치", position: "MF", country: "스웨덴", age: 30, rating: 77 },
            { name: "고승범", position: "MF", country: "대한민국", age: 31, rating: 75 },
            { name: "말컹", position: "FW", country: "브라질", age: 31, rating: 78 },
            { name: "엄원상", position: "MF", country: "대한민국", age: 26, rating: 73 },
            { name: "강상우", position: "DF", country: "대한민국", age: 31, rating: 74 },
            { name: "이진현", position: "MF", country: "대한민국", age: 27, rating: 73 },
            { name: "정승현", position: "DF", country: "대한민국", age: 31, rating: 75 },
            { name: "이희균", position: "MF", country: "대한민국", age: 27, rating: 73 },
            { name: "루빅손", position: "MF", country: "스웨덴", age: 31, rating: 76 },
            { name: "허율", position: "FW", country: "대한민국", age: 24, rating: 72 },
            { name: "김영권", position: "DF", country: "대한민국", age: 35, rating: 73 },
            { name: "조현우", position: "GK", country: "대한민국", age: 33, rating: 76 },
            { name: "김민혁", position: "MF", country: "대한민국", age: 32, rating: 74 },
            { name: "문정인", position: "GK", country: "대한민국", age: 27, rating: 71 },
            { name: "윤종규", position: "DF", country: "대한민국", age: 26, rating: 72 },
            { name: "박민서", position: "DF", country: "대한민국", age: 24, rating: 71 },
            { name: "이청용", position: "MF", country: "대한민국", age: 37, rating: 72 },
            { name: "이재익", position: "DF", country: "대한민국", age: 26, rating: 72 },
            { name: "윤재석", position: "MF", country: "대한민국", age: 21, rating: 69 },
            { name: "류성민", position: "GK", country: "대한민국", age: 21, rating: 67 },
            { name: "라카바", position: "MF", country: "베네수엘라", age: 22, rating: 73 },
            { name: "트로야크", position: "DF", country: "폴란드", age: 31, rating: 74 },
            { name: "백인우", position: "MF", country: "대한민국", age: 18, rating: 66 },
            { name: "최석현", position: "DF", country: "대한민국", age: 22, rating: 69 },
            { name: "에릭", position: "MF", country: "브라질", age: 28, rating: 75 }
        ],
        description: "공업도시 울산의 자존심, 현대의 힘찬 질주"
    },

    "포항_스틸러스": {
        league: 3,
        players: [
            { name: "윤평국", position: "GK", country: "대한민국", age: 33, rating: 74 },
            { name: "어정원", position: "DF", country: "대한민국", age: 26, rating: 72 },
            { name: "이동희", position: "DF", country: "대한민국", age: 25, rating: 71 },
            { name: "전민광", position: "DF", country: "대한민국", age: 32, rating: 73 },
            { name: "아스프로", position: "DF", country: "오스트레일리아", age: 29, rating: 75 },
            { name: "김종우", position: "MF", country: "대한민국", age: 31, rating: 74 },
            { name: "김인성", position: "FW", country: "대한민국", age: 35, rating: 73 },
            { name: "오베르단", position: "MF", country: "브라질", age: 30, rating: 76 },
            { name: "조르지", position: "FW", country: "브라질", age: 26, rating: 77 },
            { name: "백성동", position: "FW", country: "대한민국", age: 33, rating: 72 },
            { name: "주닝요", position: "FW", country: "브라질", age: 27, rating: 76 },
            { name: "조재훈", position: "FW", country: "대한민국", age: 22, rating: 70 },
            { name: "강민준", position: "DF", country: "대한민국", age: 22, rating: 69 },
            { name: "박승욱", position: "DF", country: "대한민국", age: 28, rating: 72 },
            { name: "이규민", position: "FW", country: "대한민국", age: 19, rating: 68 },
            { name: "신광훈", position: "DF", country: "대한민국", age: 38, rating: 69 },
            { name: "강현제", position: "FW", country: "대한민국", age: 22, rating: 69 },
            { name: "이호재", position: "FW", country: "대한민국", age: 24, rating: 70 },
            { name: "안재준", position: "FW", country: "대한민국", age: 24, rating: 70 },
            { name: "황인재", position: "GK", country: "대한민국", age: 31, rating: 72 },
            { name: "홍지우", position: "MF", country: "대한민국", age: 22, rating: 69 },
            { name: "이동협", position: "DF", country: "대한민국", age: 22, rating: 68 },
            { name: "한현서", position: "DF", country: "대한민국", age: 21, rating: 67 },
            { name: "차준영", position: "DF", country: "대한민국", age: 21, rating: 67 },
            { name: "박수빈", position: "FW", country: "대한민국", age: 19, rating: 66 },
            { name: "백승원", position: "FW", country: "대한민국", age: 19, rating: 66 },
            { name: "조성욱", position: "DF", country: "대한민국", age: 30, rating: 71 },
            { name: "홍윤상", position: "FW", country: "대한민국", age: 23, rating: 69 },
            { name: "기성용", position: "MF", country: "대한민국", age: 36, rating: 72 },
            { name: "이헌재", position: "FW", country: "대한민국", age: 19, rating: 66 },
            { name: "이창우", position: "DF", country: "대한민국", age: 19, rating: 66 },
            { name: "황서웅", position: "MF", country: "대한민국", age: 20, rating: 67 },
            { name: "완델손", position: "DF", country: "브라질", age: 36, rating: 70 },
            { name: "홍성민", position: "GK", country: "대한민국", age: 18, rating: 64 },
            { name: "김동진", position: "MF", country: "대한민국", age: 22, rating: 68 },
            { name: "김동민", position: "MF", country: "대한민국", age: 20, rating: 67 },
            { name: "권능", position: "GK", country: "대한민국", age: 19, rating: 65 },
            { name: "조상혁", position: "FW", country: "대한민국", age: 21, rating: 67 }
        ],
        description: "철강도시 포항의 강철 같은 의지와 투혼"
    },

    "광주_FC": {
        league: 3,
        players: [
            { name: "김경민", position: "GK", country: "대한민국", age: 33, rating: 73 },
            { name: "조성권", position: "DF", country: "대한민국", age: 24, rating: 70 },
            { name: "이민기", position: "DF", country: "대한민국", age: 32, rating: 72 },
            { name: "변준수", position: "DF", country: "대한민국", age: 23, rating: 69 },
            { name: "안영규", position: "DF", country: "대한민국", age: 35, rating: 70 },
            { name: "아사니", position: "FW", country: "북마케도니아", age: 27, rating: 78 },
            { name: "이강현", position: "MF", country: "대한민국", age: 27, rating: 73 },
            { name: "최경록", position: "MF", country: "대한민국", age: 30, rating: 73 },
            { name: "가브리엘", position: "FW", country: "브라질", age: 23, rating: 74 },
            { name: "노희동", position: "GK", country: "대한민국", age: 23, rating: 68 },
            { name: "박정인", position: "FW", country: "대한민국", age: 24, rating: 71 },
            { name: "유제호", position: "MF", country: "대한민국", age: 24, rating: 70 },
            { name: "정지훈", position: "MF", country: "대한민국", age: 21, rating: 68 },
            { name: "헤이스", position: "FW", country: "브라질", age: 32, rating: 74 },
            { name: "박인혁", position: "FW", country: "대한민국", age: 29, rating: 72 },
            { name: "진시우", position: "DF", country: "대한민국", age: 22, rating: 68 },
            { name: "강희수", position: "MF", country: "대한민국", age: 22, rating: 68 },
            { name: "김한길", position: "MF", country: "대한민국", age: 30, rating: 72 },
            { name: "김진호", position: "DF", country: "대한민국", age: 25, rating: 70 },
            { name: "권성윤", position: "MF", country: "대한민국", age: 24, rating: 69 },
            { name: "곽성훈", position: "DF", country: "대한민국", age: 19, rating: 66 },
            { name: "안혁주", position: "MF", country: "대한민국", age: 20, rating: 67 },
            { name: "김동화", position: "GK", country: "대한민국", age: 22, rating: 67 },
            { name: "민상기", position: "DF", country: "대한민국", age: 33, rating: 71 },
            { name: "신창무", position: "FW", country: "대한민국", age: 32, rating: 71 },
            { name: "김태준", position: "GK", country: "대한민국", age: 24, rating: 68 },
            { name: "김윤호", position: "FW", country: "대한민국", age: 18, rating: 65 },
            { name: "하승운", position: "FW", country: "대한민국", age: 27, rating: 72 },
            { name: "오후성", position: "MF", country: "대한민국", age: 25, rating: 70 },
            { name: "주세종", position: "MF", country: "대한민국", age: 34, rating: 71 },
            { name: "문민서", position: "MF", country: "대한민국", age: 21, rating: 67 },
            { name: "심상민", position: "DF", country: "대한민국", age: 32, rating: 70 },
            { name: "홍용준", position: "MF", country: "대한민국", age: 22, rating: 68 },
            { name: "박태준", position: "MF", country: "대한민국", age: 26, rating: 70 },
            { name: "두현석", position: "MF", country: "대한민국", age: 29, rating: 72 }
        ],
        description: "광주의 열정과 호남의 축구 정신을 이어가는 팀"
    },

    "리옹": {
        league: 3,
        players: [
            { name: "루카스 페리", position: "GK", country: "브라질", age: 27, rating: 76 },
            { name: "니콜라스 탈리아피코", position: "DF", country: "아르헨티나", age: 32, rating: 78 },
            { name: "폴 아쿠오쿠", position: "MF", country: "코트디부아르", age: 27, rating: 76 },
            { name: "조르당 베레투", position: "MF", country: "프랑스", age: 32, rating: 75 },
            { name: "코랑탱 톨리소", position: "MF", country: "프랑스", age: 30, rating: 79 },
            { name: "알렉상드르 라카제트", position: "FW", country: "프랑스", age: 34, rating: 81 },
            { name: "말릭 포파나", position: "MF", country: "벨기에", age: 20, rating: 74 },
            { name: "태너 테스만", position: "MF", country: "미국", age: 23, rating: 75 },
            { name: "아브네르 비니시우스", position: "DF", country: "브라질", age: 25, rating: 77 },
            { name: "무사 니아카테", position: "DF", country: "세네갈", age: 29, rating: 76 },
            { name: "샤엘 쿰베디", position: "DF", country: "프랑스", age: 20, rating: 73 },
            { name: "클린톤 마타", position: "DF", country: "앙골라", age: 32, rating: 78 },
            { name: "티아고 알마다", position: "MF", country: "아르헨티나", age: 24, rating: 75 },
            { name: "와흐메드 오마리", position: "DF", country: "코모로스", age: 25, rating: 74 },
            { name: "네마냐 마티치", position: "MF", country: "세르비아", age: 37, rating: 75 },
            { name: "마하마두 디아와라", position: "MF", country: "프랑스", age: 20, rating: 71 },
            { name: "어니스트 누아마", position: "FW", country: "가나", age: 21, rating: 72 },
            { name: "레미 데캉", position: "GK", country: "프랑스", age: 29, rating: 72 },
            { name: "두예 찰레타차르", position: "DF", country: "크로아티아", age: 28, rating: 75 },
            { name: "엔드릭", position: "FW", country: "브라질", age: 19, rating: 80 },
            { name: "조르지 미카우타제", position: "FW", country: "조지아", age: 24, rating: 76 },
            { name: "에인슬리 메이틀랜드나일스", position: "DF", country: "잉글랜드", age: 27, rating: 74 }
        ],
        description: "프랑스 축구의 명문 리옹의 영광 재건을 위한 도전"
    }
    }

// 아이콘 선수 명단
const iconPlayersList = [
    { name: "디에고 마라도나", position: "FW", country: "아르헨티나" },
    { name: "펠레", position: "FW", country: "브라질" },
    { name: "요한 크루이프", position: "MF", country: "네덜란드" },
    { name: "지네딘 지단", position: "MF", country: "프랑스" },
    { name: "프란츠 베켄바워", position: "DF", country: "독일" },
    { name: "알프레도 디 스테파노", position: "FW", country: "아르헨티나" },
    { name: "호나우두", position: "FW", country: "브라질" },
    { name: "카푸", position: "DF", country: "브라질" },
    { name: "페렌츠 푸스카스", position: "FW", country: "헝가리" },
    { name: "에우제비우", position: "FW", country: "포르투갈" },
    { name: "즐라탄 이브라히모비치", position: "FW", country: "스웨덴" },
    { name: "게르트 뮐러", position: "FW", country: "독일" },
    { name: "보비 찰튼", position: "MF", country: "잉글랜드" },
    { name: "지쿠", position: "MF", country: "브라질" },
    { name: "가린샤", position: "MF", country: "브라질" },
    { name: "조지 베스트", position: "FW", country: "북아일랜드" },
    { name: "마르코 반 바스텐", position: "FW", country: "네덜란드" },
    { name: "파올로 말디니", position: "DF", country: "이탈리아" },
    { name: "알레산드로 네스타", position: "DF", country: "이탈리아" },
    { name: "안드레스 이니에스타", position: "MF", country: "스페인" },
    { name: "사비 에르난데스", position: "MF", country: "스페인" },
    { name: "호나우지뉴", position: "FW", country: "브라질" },
    { name: "로타어 마테우스", position: "MF", country: "독일" },
    { name: "레프 야신", position: "GK", country: "소련" },
    { name: "리오 퍼디난드", position: "DF", country: "잉글랜드" },
    { name: "루드 굴리트", position: "MF", country: "네덜란드" },
    { name: "로베르토 바조", position: "FW", country: "이탈리아" },
    { name: "히바우두", position: "FW", country: "브라질" },
    { name: "티에리 앙리", position: "FW", country: "프랑스" },
    { name: "카카", position: "MF", country: "브라질" },
    { name: "스티븐 제라드", position: "MF", country: "잉글랜드" },
    { name: "안드레아 피를로", position: "MF", country: "이탈리아" },
    { name: "라이언 긱스", position: "MF", country: "웨일스" },
    { name: "파벨 네드베드", position: "MF", country: "체코" },
    { name: "필립 람", position: "DF", country: "독일" },
    { name: "알레산드로 델 피에로", position: "MF", country: "이탈리아" },
    { name: "카를레스 푸욜", position: "DF", country: "스페인" },
    { name: "루이스 피구", position: "MF", country: "포르투갈" },
    { name: "차범근", position: "FW", country: "대한민국" },
    { name: "올리버 칸", position: "GK", country: "독일" },
    { name: "피터 슈마이켈", position: "GK", country: "덴마크" },
    { name: "박지성", position: "MF", country: "대한민국" },
    { name: "프랑크 레이카르트", position: "MF", country: "네덜란드" },
    { name: "미하엘 발락", position: "MF", country: "독일" },
    { name: "토니 크로스", position: "MF", country: "독일" },
    { name: "세르히오 라모스", position: "DF", country: "스페인" },
    { name: "폴 스콜스", position: "MF", country: "잉글랜드" },
    { name: "호베르투 카를로스", position: "DF", country: "브라질" },
    { name: "파비오 칸나바로", position: "DF", country: "이탈리아" },
    { name: "프랭크 램파드", position: "MF", country: "잉글랜드" },
    { name: "파트리크 비에이라", position: "MF", country: "프랑스" },
    { name: "에드윈 반 데 사르", position: "GK", country: "네덜란드" }
];

// 기존 코드 호환용 변환
const teams = (() => {
    const convertedTeams = {};
    Object.keys(allTeams).forEach(teamName => {
        convertedTeams[teamName] = allTeams[teamName].players;
    });
    return convertedTeams;
})();


// gameData 객체에 부상 정보 추가 (기존 gameData 선언 부분 수정)
let gameData = {
    selectedTeam: null,
    currentLeague: 1,
    teamMoney: 1000,
    teamMorale: 80,
    currentSponsor: null,
    matchesPlayed: 0,
    currentOpponent: null,
    currentTactic: 'gegenpress',
    isWorldCupMode: false, // [추가] 월드컵 모드 플래그 초기화
    squad: {
        // 4-3-3 포메이션 기준
        gk: null,
        df: [null, null, null, null],
        mf: [null, null, null],
        fw: [null, null, null]
    },
    leagueData: {
        division1: {},
        division2: {},
        division3: {}
    },
    playerGrowthData: {},
    transferSystemData: {},
    injuredPlayers: [], // 부상 선수 목록 추가
    aiPrestige: {}, // AI 팀의 환생 선수/성장 보너스 관리
    youthSquad: [], // 유스팀 선수 목록 추가
    hiredScout: null, // 고용된 스카우터 정보
    schedule: null, // 시즌 스케줄
    currentRound: 1, // 현재 라운드
    isHomeGame: true, // 현재 경기가 홈 경기인지 여부
    startYear: 2025, // 시작 연도 (시즌 표기용)
    seasonCount: 1, // [신규] 시즌 카운트
    settings: { autoSave: false, bgm: true, bgmVolume: 50 }, // 게임 설정 (오디오 추가)
    playerRoles: {}, // [추가] 선수별 역할 데이터 초기화
    temporaryStats: {}, // [신규] 일시적 스탯 버프/디버프 저장소
    secretaryName: "김지수", // [신규] 비서 이름 (secretary.js에서 사용)
    losingStreak: 0 // [신규] 연패 기록
};


    const teamNames = {
    "바르셀로나": "바르셀로나",
    "레알_마드리드": "레알 마드리드", 
    "맨체스터_시티": "맨체스터 시티",
    "리버풀": "리버풀",
    "토트넘_홋스퍼": "토트넘 홋스퍼",
    "파리_생제르맹": "파리 생제르맹",
    "AC_밀란": "AC 밀란",
    "인터_밀란": "인터 밀란",
    "아스널": "아스널",
    "나폴리": "나폴리",
    "첼시": "첼시",
    "바이에른_뮌헨": "바이에른 뮌헨",
    "아틀레티코_마드리드": "아틀레티코 마드리드",
    "도르트문트": "도르트문트",
    "유벤투스": "유벤투스",
    "뉴캐슬_유나이티드": "뉴캐슬 유나이티드",
    "아스톤_빌라": "아스톤 빌라",
    "라이프치히": "라이프치히",
    "세비야": "세비야",
    "아약스": "아약스",
    "AS_로마": "AS 로마",
    "레버쿠젠": "레버쿠젠",
    "스포르팅_CP": "스포르팅 CP",
    "벤피카": "벤피카",
    "셀틱": "셀틱",
    "페예노르트": "페예노르트",
    "맨체스터_유나이티드": "맨체스터 유나이티드",
    "올랭피크_드_마르세유": "올랭피크 드 마르세유",
    "FC_서울": "FC 서울",
    "갈라타사라이": "갈라타사라이",
    "알_힐랄": "알 힐랄",
    "알_이티하드": "알 이티하드",
    "알_나스르": "알 나스르",
    "아르헨티나_연합": "아르헨티나 연합",
    "미국_연합": "미국 연합",
    "멕시코_연합": "멕시코 연합",
    "브라질_연합": "브라질 연합",
    "전북_현대": "전북 현대",
    "울산_현대": "울산 HD",
    "포항_스틸러스": "포항 스틸러스",
    "광주_FC": "광주 FC",
    "리옹": "리옹"
};




// 스폰서 데이터
const sponsors = [
    {
        name: "푸마",
        description: "빠르고 역동적인 스포츠 브랜드",
        payPerWin: 15,
        payPerLoss: 3,
        contractLength: 28,
        signingBonus: 80,
        requirements: { minRating: 70 }
    },
    {
        name: "나이키",
        description: "세계적인 스포츠 브랜드",
        payPerWin: 20,
        payPerLoss: 5,
        contractLength: 28,
        signingBonus: 100,
        requirements: { minRating: 75 }
    },
    {
        name: "뉴발란스",
        description: "전문성을 추구하는 스포츠 브랜드",
        payPerWin: 18,
        payPerLoss: 4,
        contractLength: 28,
        signingBonus: 120,
        requirements: { minRating: 78 }
    },
    {
        name: "아디다스",
        description: "독일의 프리미엄 스포츠 브랜드",
        payPerWin: 25,
        payPerLoss: 8,
        contractLength: 28,
        signingBonus: 150,
        requirements: { minRating: 80 }
    },
    {
        name: "넥센타이어",
        description: "한국의 타이어 브랜드",
        payPerWin: 30,
        payPerLoss: 10,
        contractLength: 28,
        signingBonus: 200,
        requirements: { minRating: 85 }
    },
    {
        name: "플라이 에미레이츠",
        description: "세계 최고의 항공사 중 하나",
        payPerWin: 40,
        payPerLoss: 15,
        contractLength: 28,
        signingBonus: 300,
        requirements: { minRating: 90 }
    },
    {
        name: "삼성",
        description: "세계 최고의 전자제품 생산 기업",
        payPerWin: 50,
        payPerLoss: 20,
        contractLength: 28,
        signingBonus: 300,
        requirements: { minRating: 98 }
    }
];

// 경기 이벤트 메시지
const passMessages = [
    "이(가) 팀이 미드필드에서 공을 돌리고 있습니다",
    "의 예리한 패스!",
    "의 후방 빌드업",
    "이(가) 측면으로 공을 연결합니다",
    "이(가) 중앙에서 패스를 시도합니다",
    "의 안전한 백패스",
    "이(가) 공격을 전개합니다",
    "이(가) 좌측으로 공을 옮깁니다",
    "이(가) 우측으로 볼을 배급합니다",
    "이(가) 킬패스를 시도합니다",
    "이(가) 크로스 올립니다",
    "이(가) 스루패스를 찔러넣습니다",
    "이(가) 롱패스로 전환합니다",
    "이(가) 숏패스를 연결합니다",
    "의 침착한 패스 플레이",
    "이(가) 템포를 조절합니다",
    "의 빠른 역습!",
    "이(가) 측면을 돌파합니다",
    "이(가) 중앙 침투를 시도합니다",
    "의 조직적인 수비",
    "이(가) 전방 압박을 가합니다",
    "이(가) 라인을 올립니다",
    "의 치밀한 빌드업",
    "이(가) 공간을 찾아갑니다",
    "이(가) 볼 소유권을 가져갑니다",
    "의 강력한 중거리 슛!",
    "이(가) 박스 안으로 침투합니다",
    "의 날카로운 돌파",
    "이(가) 측면을 활용합니다",
    "이(가) 수비 라인을 흔듭니다",
    "이(가) 빈 공간을 찾아 들어갑니다",
    "의 감각적인 힐패스!",
    "이(가) 반대편으로 길게 열어줍니다",
    "이(가) 2대1 패스를 주고받습니다",
    "의 탈압박 능력이 돋보입니다",
    "이(가) 상대의 압박을 여유롭게 벗어납니다",
    "이(가) 전방으로 쇄도합니다",
    "의 창의적인 플레이",
    "이(가) 경기를 조율합니다",
    "이(가) 볼을 지켜냅니다",
    "의 정확한 롱킥!",
    "이(가) 수비 사이로 파고듭니다",
    "이(가) 동료를 활용합니다",
    "의 센스 있는 터치",
    "이(가) 공격 템포를 올립니다",
    "이(가) 침착하게 볼을 소유합니다",
    "의 날카로운 크로스 시도",
    "이(가) 중앙으로 좁혀 들어옵니다",
    "이(가) 오버래핑을 시도합니다",
    "의 허를 찌르는 패스"
];

// DOM 요소들
let currentModal = null;
let selectedPosition = null;

// 초기화
document.addEventListener('DOMContentLoaded', function() {
    initializeGame();
    setupEventListeners();

    // ✅ 여기에 추가!
    // addReleasePlayerOption();

            // 이적 시스템 초기화 호출
            if (typeof initTransfer === 'function') {
                initTransfer();
            }
            
            // [신규] 자동 스크롤 시스템 초기화
            AutoScrollSystem.init();
});

function initializeGame() {
    // 리그 데이터 초기화
    initializeLeagueData();
    
    // 첫 번째 화면 표시
    showScreen('teamSelection');
}

function setupEventListeners() {
    // 팀 선택
    document.querySelectorAll('.team-card').forEach(card => {
        card.addEventListener('click', function() {
            // 1. data-team 속성에서 값 가져오기
            const originalTeamKey = this.dataset.team; 

            // 2. 공백을 언더스코어로 변환하여 유효한 키 생성
            const validTeamKey = originalTeamKey.replace(/\s/g, '_'); 
            
            // 3. 변환된 유효한 키를 selectTeam 함수에 전달
            selectTeam(validTeamKey); 
        });
    });


    // 탭 전환
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const tabName = this.dataset.tab;
            showTab(tabName);
        });
    });

    // 포지션 클릭
    // document.querySelectorAll('.position').forEach(position => {
    //     position.addEventListener('click', function() {
    //         const pos = this.dataset.position;
    //         const index = this.dataset.index;
    //         openPlayerModal(pos, index);
    //     });
    // });

    // 나만의 팀 만들기 버튼
    document.getElementById('openCreateTeamModalBtn').addEventListener('click', openCreateTeamModal);
    document.getElementById('closeCreateTeamModal').addEventListener('click', closeCreateTeamModal);
    document.getElementById('createIconTeamBtn').addEventListener('click', showIconTeamCreation);
    document.getElementById('createCustomTeamBtn').addEventListener('click', showCustomTeamCreation);
    document.getElementById('confirmCreateTeamBtn').addEventListener('click', createIconTeam);
    document.getElementById('confirmCreateCustomTeamBtn').addEventListener('click', createCustomTeam);
    document.getElementById('customLeagueSelect').addEventListener('change', updateCustomReplacementTeams);

    // 경기 시작
    document.getElementById('startMatchBtn').addEventListener('click', startMatch);

    // 모달 닫기
    document.querySelector('.close').addEventListener('click', closeModal);

    // 이적 검색
    if (document.getElementById('searchBtn')) {
        document.getElementById('searchBtn').addEventListener('click', searchPlayers);
    }

    // 게임 저장/불러오기
    document.getElementById('saveGameBtn').addEventListener('click', saveGame);
    document.getElementById('loadGameBtn').addEventListener('click', function() {
        document.getElementById('loadGameInput').click();
    });
    document.getElementById('loadGameInput').addEventListener('change', loadGame);

    // 성장 현황 보기
    document.getElementById('showGrowthBtn').addEventListener('click', showGrowthSummary);

    // 전술 변경
    document.getElementById('tacticSelect').addEventListener('change', function() {
        gameData.currentTactic = this.value;
    });

    // [신규] 매치 엔진 가이드 모달
    const guideBtn = document.getElementById('openEngineGuideBtn');
    const guideModal = document.getElementById('engineGuideModal');
    const closeGuideBtn = document.getElementById('closeEngineGuideModal');

    if (guideBtn && guideModal) {
        guideBtn.addEventListener('click', () => guideModal.style.display = 'block');
        closeGuideBtn.addEventListener('click', () => guideModal.style.display = 'none');
        
        // 모달 바깥 클릭 시 닫기
        window.addEventListener('click', (e) => {
            if (e.target === guideModal) guideModal.style.display = 'none';
        });
    }

    // 인터뷰 버튼
    document.querySelectorAll('.interview-btn').forEach(btn => {
        btn.addEventListener('click', function() {
            const option = this.dataset.option;
            handleInterview(option);
        });
    });

    // [신규] 감독실(비서 상담) 버튼 이벤트
    const officeBtn = document.getElementById('openOfficeBtn');
    if (officeBtn) {
        officeBtn.addEventListener('click', () => {
            if (typeof secretarySystem !== 'undefined') {
                secretarySystem.startConsultation();
            } else {
                alert('비서 시스템이 로드되지 않았습니다.');
            }
        });
    }
}

// 팀 만들기 모달 열기
function openCreateTeamModal() {
    document.getElementById('createTeamModal').style.display = 'block';
    document.getElementById('createTeamModeSelection').style.display = 'flex';
    document.getElementById('iconTeamCreationArea').style.display = 'none';
    document.getElementById('customTeamCreationArea').style.display = 'none';
}

function closeCreateTeamModal() {
    document.getElementById('createTeamModal').style.display = 'none';
}

// 아이콘 팀 생성 화면 표시
function showIconTeamCreation() {
    document.getElementById('createTeamModeSelection').style.display = 'none';
    document.getElementById('iconTeamCreationArea').style.display = 'block';
    
    // 교체할 팀 목록 채우기 (2부 리그)
    const teamSelect = document.getElementById('replacementTeamSelect');
    teamSelect.innerHTML = '';
    const league2Teams = Object.keys(allTeams).filter(key => allTeams[key].league === 2);
    league2Teams.forEach(teamKey => {
        const option = document.createElement('option');
        option.value = teamKey;
        option.textContent = teamNames[teamKey] || teamKey;
        teamSelect.appendChild(option);
    });

    // 선수 목록 포지션별 정렬 (GK -> DF -> MF -> FW)
    const positionOrder = { 'GK': 1, 'DF': 2, 'MF': 3, 'FW': 4 };
    iconPlayersList.sort((a, b) => {
        const posA = positionOrder[a.position] || 5;
        const posB = positionOrder[b.position] || 5;
        return posA - posB;
    });

    // 선택 초기화 (정렬로 인해 인덱스가 바뀌므로)
    selectedIconIndices.clear();
    updateSelectedCount();

    const listContainer = document.getElementById('iconPlayerSelectionList');
    listContainer.innerHTML = '';
    
    iconPlayersList.forEach((player, index) => {
        const item = document.createElement('div');
        item.className = 'icon-player-select-item';
        item.style.cssText = 'background: rgba(255,255,255,0.1); padding: 10px; border-radius: 5px; cursor: pointer; border: 1px solid transparent; display: flex; justify-content: space-between; align-items: center;';
        item.innerHTML = `
            <div>
                <span style="font-weight: bold;">${player.name}</span>
                <span style="font-size: 0.8rem; color: #aaa; margin-left: 5px;">${player.position}</span>
            </div>
            <div class="check-mark" style="display: none;">✅</div>
        `;
        
        item.addEventListener('click', () => toggleIconPlayerSelection(item, index));
        listContainer.appendChild(item);
    });
    
    updateSelectedCount();
}

let selectedIconIndices = new Set();

function toggleIconPlayerSelection(element, index) {
    if (selectedIconIndices.has(index)) {
        selectedIconIndices.delete(index);
        element.style.borderColor = 'transparent';
        element.style.background = 'rgba(255,255,255,0.1)';
        element.querySelector('.check-mark').style.display = 'none';
    } else {
        if (selectedIconIndices.size >= 18) {
            alert('최대 18명까지만 선택할 수 있습니다.');
            return;
        }
        selectedIconIndices.add(index);
        element.style.borderColor = '#ffd700';
        element.style.background = 'rgba(255, 215, 0, 0.2)';
        element.querySelector('.check-mark').style.display = 'block';
    }
    updateSelectedCount();
}

function updateSelectedCount() {
    const count = selectedIconIndices.size;
    document.getElementById('selectedCount').textContent = count;
    document.getElementById('confirmCreateTeamBtn').disabled = count !== 18;
}

function createIconTeam() {
    const teamNameInput = document.getElementById('customTeamName').value.trim();
    if (!teamNameInput) {
        alert('팀 이름(공백없이 6글자)을 입력해주세요.');
        return;
    }
    if (teamNameInput.length > 6) {
        alert('팀 이름은 6글자 이내(공백 없이)여야 합니다.');
        return;
    }
    if (selectedIconIndices.size !== 18) {
        alert('선수 18명을 선택해야 합니다.');
        return;
    }

    // 포지션별 인원 체크
    let gkCount = 0, dfCount = 0, mfCount = 0, fwCount = 0;
    selectedIconIndices.forEach(index => {
        const p = iconPlayersList[index];
        if (p.position === 'GK') gkCount++;
        else if (p.position === 'DF') dfCount++;
        else if (p.position === 'MF') mfCount++;
        else if (p.position === 'FW') fwCount++;
    });

    if (gkCount < 2) {
        alert('골키퍼는 최소 2명 선택해야 합니다.');
        return;
    }
    if (dfCount < 5) {
        alert('수비수는 최소 5명 선택해야 합니다.');
        return;
    }
    if (mfCount < 5) {
        alert('미드필더는 최소 5명 선택해야 합니다.');
        return;
    }

    // 선택된 교체 팀 가져오기
    const replacedTeamKey = document.getElementById('replacementTeamSelect').value;
    if (!replacedTeamKey || !allTeams[replacedTeamKey]) {
        alert('교체할 팀을 선택해주세요.');
        return;
    }
    
    // 선택된 선수 데이터 생성
    const newPlayers = Array.from(selectedIconIndices).map(index => {
        const p = iconPlayersList[index];
        return {
            name: p.name,
            position: p.position,
            country: p.country,
            age: 19,
            rating: 81,
            isIcon: true // 아이콘 선수 식별용 플래그
        };
    });

    // 새 팀 데이터 생성
    const newTeamKey = teamNameInput; // 유저 입력 이름을 키로 사용
    allTeams[newTeamKey] = {
        league: 2,
        players: newPlayers,
        description: "전설적인 선수들이 모인 나만의 드림팀"
    };
    teams[newTeamKey] = newPlayers;
    teamNames[newTeamKey] = teamNameInput;

    // 기존 팀 삭제
    delete allTeams[replacedTeamKey];
    delete teams[replacedTeamKey];
    delete teamNames[replacedTeamKey];

    // 게임 데이터 초기화
    gameData.teamMoney = 0; // 시작 자금 0원
    gameData.schedule = null; // 스케줄 재생성 필요
    initializeLeagueData(); // [수정] 리그 데이터 재설정 (삭제된 팀 제거 및 새 팀 등록)
    
    closeCreateTeamModal();
    selectTeam(newTeamKey);
}

// 커스텀 팀 생성 화면 표시
function showCustomTeamCreation() {
    document.getElementById('createTeamModeSelection').style.display = 'none';
    document.getElementById('customTeamCreationArea').style.display = 'block';
    
    updateCustomReplacementTeams(); // 초기 교체 팀 목록 로드
    generateCustomPlayerInputs(); // 입력 필드 생성
}

// 리그 선택에 따른 교체 팀 목록 업데이트
function updateCustomReplacementTeams() {
    const league = parseInt(document.getElementById('customLeagueSelect').value);
    const select = document.getElementById('customReplacementSelect');
    select.innerHTML = '';
    
    const leagueTeams = Object.keys(allTeams).filter(key => allTeams[key].league === league);
    leagueTeams.forEach(teamKey => {
        const option = document.createElement('option');
        option.value = teamKey;
        option.textContent = teamNames[teamKey] || teamKey;
        select.appendChild(option);
    });
}

// 선수 이름 입력 필드 생성 (GK 2, DF 6, MF 5, FW 5)
function generateCustomPlayerInputs() {
    const container = document.getElementById('customPlayerInputs');
    container.innerHTML = '';
    
    const structure = [
        { pos: 'GK', count: 2 },
        { pos: 'DF', count: 6 },
        { pos: 'MF', count: 5 },
        { pos: 'FW', count: 5 }
    ];
    
    structure.forEach(group => {
        for (let i = 1; i <= group.count; i++) {
            const div = document.createElement('div');
            div.style.marginBottom = '5px';
            div.innerHTML = `
                <span style="display:inline-block; width: 40px; font-weight:bold; color:#ffd700;">${group.pos}</span>
                <input type="text" class="custom-player-input" data-pos="${group.pos}" placeholder="선수명" style="width: 120px; padding: 5px; background: #444; color: white; border: 1px solid #666;">
            `;
            container.appendChild(div);
        }
    });
}

// 커스텀 팀 생성 실행
function createCustomTeam() {
    const teamName = document.getElementById('customTeamNameInput').value.trim();
    if (!teamName || teamName.length > 6) {
        alert('팀 이름을 1~6글자(공백 없이)로 입력해주세요.');
        return;
    }
    
    const league = parseInt(document.getElementById('customLeagueSelect').value);
    const replacedTeamKey = document.getElementById('customReplacementSelect').value;
    const nation = document.getElementById('customNationSelect').value;
    
    // 선수 이름 수집
    const inputs = document.querySelectorAll('.custom-player-input');
    const newPlayers = [];
    let emptyCount = 0;
    
    // 오버롤 범위 설정
    let minRating, maxRating;
    if (league === 1) { minRating = 80; maxRating = 86; }
    else if (league === 2) { minRating = 78; maxRating = 84; }
    else { minRating = 70; maxRating = 75; }
    
    inputs.forEach(input => {
        const name = input.value.trim();
        if (!name) {
            emptyCount++;
            return;
        }
        
        const pos = input.dataset.pos;
        const rating = Math.floor(Math.random() * (maxRating - minRating + 1)) + minRating;
        const age = Math.floor(Math.random() * 6) + 18; // 18~23세
        
        // 국적 설정
        let playerNation = nation;
        if (nation === 'random') {
            const nations = ['대한민국', '잉글랜드', '스페인', '독일', '프랑스', '이탈리아', '브라질', '아르헨티나', '네덜란드', '포르투갈'];
            playerNation = nations[Math.floor(Math.random() * nations.length)];
        }
        
        newPlayers.push({
            name: name,
            position: pos,
            country: playerNation,
            age: age,
            rating: rating,
            isCustom: true // 커스텀 선수 플래그 (성장 한계 돌파용)
        });
    });
    
    if (emptyCount > 0) {
        alert('모든 선수의 이름을 입력해주세요.');
        return;
    }

    // [추가] 중복 이름 체크
    const nameSet = new Set();
    for (const player of newPlayers) {
        if (nameSet.has(player.name)) {
            alert(`선수 이름이 중복됩니다: "${player.name}"\n같은 팀 내에서 모든 선수의 이름은 서로 달라야 합니다.`);
            return;
        }
        nameSet.add(player.name);
    }
    
    // 팀 데이터 생성 및 교체
    const newTeamKey = teamName;
    allTeams[newTeamKey] = {
        league: league,
        players: newPlayers,
        description: "내가 직접 만든 커스텀 팀"
    };
    teams[newTeamKey] = newPlayers;
    teamNames[newTeamKey] = teamName;
    
    delete allTeams[replacedTeamKey];
    delete teams[replacedTeamKey];
    delete teamNames[replacedTeamKey];
    
    gameData.teamMoney = 0;
    gameData.schedule = null;
    initializeLeagueData(); // [수정] 리그 데이터 재설정 (삭제된 팀 제거 및 새 팀 등록)
    
    closeCreateTeamModal();
    selectTeam(newTeamKey);
}

function selectTeam(teamKey) {
    gameData.selectedTeam = teamKey;
    gameData.currentLeague = allTeams[teamKey].league; // 팀의 리그 설정
    
    applyTeamTheme(teamKey);
    document.getElementById('teamName').textContent = teamKey; // 한국어 팀명 직접 표시
    
    // 자동으로 최고 능력치 선수들로 스쿼드 채우기
    autoFillSquad();
    
    // 선수 성장 시스템 초기화
    if (typeof playerGrowthSystem !== 'undefined') {
        playerGrowthSystem.initializePlayerGrowth();
    }
    
    // 이적 시스템 초기화
    if (typeof transferSystem !== 'undefined') {
        transferSystem.initializeTransferMarket();
    }

    // DNA 시스템 초기화 (추가)
    if (typeof DNAManager !== 'undefined') {
        DNAManager.initialize(teams[teamKey]);
    }
    
    // 개인기록 시스템 초기화
    if (typeof recordsSystem !== 'undefined') {
        recordsSystem.initialize();
    }
    
    // 상대팀 설정 (같은 리그에서)
    setNextOpponent();
    
    // 스케줄이 없으면 생성
    if (!gameData.schedule) {
        generateFullSchedule();
    }

    // 로비로 이동
    showScreen('lobby'); 
    displayTeamPlayers();
    updateDisplay();
    displaySponsors();

    // 환영 메일 발송
    if (typeof mailManager !== 'undefined') {
        mailManager.sendWelcomeMail();
    }

    // 배경음악 재생 시작
    if (typeof audioManager !== 'undefined') {
        audioManager.init();
        audioManager.play();
    }

    // 튜토리얼 시작 (처음인 경우)
    if (window.tutorialSystem) {
        window.tutorialSystem.init();
    }

    // [신규] 랜덤 이벤트 트리거 (경기 전/후 등 적절한 시점에 호출 가능)
    if (typeof secretarySystem !== 'undefined') {
        // secretarySystem.triggerRandomEvent(); // 테스트용, 실제로는 경기 전후에 호출
    }
}

// 자동으로 스쿼드 채우기 함수
function autoFillSquad() {
    const teamPlayers = teams[gameData.selectedTeam];
    
    // 포지션별로 선수들을 분류하고 능력치 순으로 정렬
    const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
    const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
    const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
    const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
    
    // 최고 능력치 선수들로 자동 배치
    if (gks.length > 0) {
        gameData.squad.gk = gks[0];
    }
    
    // 수비수 4명
    for (let i = 0; i < 4 && i < dfs.length; i++) {
        gameData.squad.df[i] = dfs[i];
    }
    
    // 미드필더 3명
    for (let i = 0; i < 3 && i < mfs.length; i++) {
        gameData.squad.mf[i] = mfs[i];
    }
    
    // 공격수 3명
    for (let i = 0; i < 3 && i < fws.length; i++) {
        gameData.squad.fw[i] = fws[i];
    }
    
    // 새 포메이션 시스템으로 화면 새로고침
    if (window.refreshFormation) {
        window.refreshFormation();
    }
}

function showScreen(screenId) {
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    document.getElementById(screenId).classList.add('active');
}

function showTab(tabName) {
    // [추가] 월드컵 모드 탭 제어
    if (gameData.isWorldCupMode) {
        // 허용된 탭: squad, match, tactics, settings, records(대회기록), callup(차출)
        // 차단된 탭: transfer, league, sponsor, youth, sns, transfer_news, mail
        const blockedTabs = ['transfer', 'league', 'sponsor', 'youth', 'sns', 'transfer_news', 'mail'];
        
        if (blockedTabs.includes(tabName)) {
            return;
        }

        // 'records' 탭 클릭 시 월드컵 기록 화면 표시
        if (tabName === 'records') {
            if (typeof WorldCupManager !== 'undefined') {
                WorldCupManager.renderRecordsTab();
            }
        }

        // 'callup' 탭 (이적 탭 자리에 대신 사용)
        if (tabName === 'callup') {
            if (typeof WorldCupManager !== 'undefined') {
                WorldCupManager.renderCallUpTab();
            }
            // callup 탭 활성화 (UI적으로는 transfer 탭을 사용)
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            const btn = document.querySelector(`[data-tab="transfer"]`); // 차출 버튼은 transfer 버튼을 재활용
            if (btn) btn.classList.add('active');
            
            document.querySelectorAll('.tab-panel').forEach(panel => panel.classList.remove('active'));
            const panel = document.getElementById('transfer'); // 패널도 transfer 재활용
            if (panel) panel.classList.add('active');
            return;
        }
    }

    // 탭 버튼 활성화
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    document.querySelector(`[data-tab="${tabName}"]`).classList.add('active');
    
    // 탭 패널 표시
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    document.getElementById(tabName).classList.add('active');
    
    // 탭별 초기화
    switch(tabName) {
        case 'squad':
            if (window.refreshFormation) {
                window.refreshFormation();
            }
            displayTeamPlayers(); // 선수 목록은 계속 표시
            break;
            
        case 'transfer':
            if (typeof displayTransferPlayers === 'function') {
                displayTransferPlayers();
            }
            break;
            
        case 'transfer_news': // [추가] 이적 뉴스 탭 처리
            if (typeof displayTransferNews === 'function') {
                displayTransferNews();
            }
            break;

        case 'tactics': // 전술 탭 추가
            if (typeof DNAManager !== 'undefined') {
                console.log('🧬 Tactics tab opened, calling DNAManager.renderUI()');
                DNAManager.renderUI();
            }
            break;
            
        case 'league':
            displayLeagueTable();
            break;
            
        case 'sponsor':
            displaySponsors();
            break;
            
        case 'records':
            if (typeof updateRecordsTab === 'function') {
                updateRecordsTab();
            }
            break;
            
        case 'sns':
            // SNS 매니저가 존재하는지 확인
            if (typeof snsManager !== 'undefined') {
                // SNS 피드 표시
                snsManager.displayFeed('snsFeed', 15);
            } else {
                // SNS 시스템이 아직 로드되지 않은 경우
                console.log('SNS 시스템을 로딩 중입니다...');
                
                // SNS 컨테이너가 있다면 로딩 메시지 표시
                const feedContainer = document.getElementById('snsFeed');
                if (feedContainer) {
                    feedContainer.innerHTML = '<div class="sns-empty">SNS 시스템을 초기화하는 중입니다...</div>';
                }
                
                // 잠시 후 다시 시도
                setTimeout(() => {
                    if (typeof snsManager !== 'undefined') {
                        snsManager.displayFeed('snsFeed', 15);
                    } else {
                        // 여전히 로드되지 않은 경우 에러 메시지
                        if (feedContainer) {
                            feedContainer.innerHTML = '<div class="sns-empty">SNS 시스템을 불러올 수 없습니다. 페이지를 새로고침해 주세요.</div>';
                        }
                    }
                }, 2000);
            }
            break;

        case 'mail':
            if (typeof mailManager !== 'undefined') {
                mailManager.renderList();
            }
            break;
            
        case 'settings':
            // 설정 탭을 열 때마다 슬롯 UI 생성
            createSaveSlots();
            // 오디오 설정 UI 생성
            if (typeof renderAudioSettings === 'function') {
                renderAudioSettings();
            }
            // 일반 설정 UI 생성
            if (typeof renderGeneralSettings === 'function') {
                renderGeneralSettings();
            }
    // [신규] 비서 설정 UI 생성
    if (typeof renderSecretarySettings === 'function') {
        renderSecretarySettings();
    }
            break;

        case 'youth':
            displayYouthPlayers();
            // 스카우트 UI도 함께 표시
            if (typeof displayScoutingScreen === 'function') {
                displayScoutingScreen();
            }
            break;
            
        default:
            console.log(`Unknown tab: ${tabName}`);
            break;
    }
}

// [신규] 탭 UI 활성화 헬퍼 함수
function activateTabUI(tabName) {
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.classList.remove('active');
    });
    
    // callup 탭은 transfer 버튼을 사용
    let btnSelector = `[data-tab="${tabName}"]`;
    if (tabName === 'callup') btnSelector = `[data-tab="transfer"]`;
    
    const btn = document.querySelector(btnSelector);
    if (btn) btn.classList.add('active');
    
    document.querySelectorAll('.tab-panel').forEach(panel => {
        panel.classList.remove('active');
    });
    
    // 패널 ID 매핑 (callup은 transfer 패널 재활용)
    let panelId = (tabName === 'callup') ? 'transfer' : tabName;
    const panel = document.getElementById(panelId);
    if (panel) panel.classList.add('active');
}

// 선수가 이미 스쿼드에 있는지 확인하는 함수
function isPlayerInSquad(player) {
    const squad = gameData.squad;
    
    if (squad.gk && squad.gk.name === player.name) return true;
    
    for (let df of squad.df) {
        if (df && df.name === player.name) return true;
    }
    
    for (let mf of squad.mf) {
        if (mf && mf.name === player.name) return true;
    }
    
    for (let fw of squad.fw) {
        if (fw && fw.name === player.name) return true;
    }
    
    return false;
}

function displayTeamPlayers() {
    const playerList = document.getElementById('playerList');
    playerList.innerHTML = '';
    
    const teamPlayers = teams[gameData.selectedTeam];
    
    teamPlayers.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        
        // 이미 스쿼드에 있는 선수인지 확인
        const isUsed = isPlayerInSquad(player);
        if (isUsed) {
            playerCard.classList.add('used');
        }
        
        // 부상 여부 확인
        const isInjured = typeof injurySystem !== 'undefined' && injurySystem.isInjured(gameData.selectedTeam, player.name);
        if (isInjured) {
            playerCard.classList.add('injured');
            const injuryInfo = injurySystem.getInjuredPlayers(gameData.selectedTeam).find(i => i.name === player.name);
            const gamesLeft = injuryInfo ? injuryInfo.gamesRemaining : '?';
            
            playerCard.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="details">
                    <div>${player.position} | 능력치: ${Math.floor(player.rating)} | 나이: ${player.age}</div>
                    <div style="color: #e74c3c; font-weight: bold; font-size: 0.8rem;">🚑 부상중 (${gamesLeft}경기)</div>
                </div>
            `;
        } else {
            playerCard.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="details">
                    <div>${player.position} | 능력치: ${Math.floor(player.rating)} | 나이: ${player.age}</div>
                    ${isUsed ? '<div style="color: #ffd700; font-size: 0.8rem;">★ 출전 중</div>' : ''}
                </div>
            `;
        }
        
        if (!isUsed && !isInjured) {
            playerCard.addEventListener('click', () => {
                if (selectedPosition !== null) {
                    assignPlayerToPosition(player);
                }
            });
            
            // ✅ 후보 선수 우클릭으로 방출 (이적료 받기) - 수정!
            playerCard.addEventListener('contextmenu', (e) => {
                e.preventDefault();
                // [추가] 월드컵 모드에서는 방출 불가
                if (gameData.isWorldCupMode) {
                    alert("🏆 월드컵 기간에는 선수를 방출할 수 없습니다.");
                    return;
                }
               releasePlayerWithFee(player, 0); // 직접 호출로 변경
            });
        }
        
        playerList.appendChild(playerCard);
    });
}



// 이적료를 받고 선수 방출
function releasePlayerWithFee(player, transferFee) {
    const teamPlayers = teams[gameData.selectedTeam];
    const playerIndex = teamPlayers.findIndex(p => 
        p.name === player.name && p.position === player.position
    );
    
    if (playerIndex === -1) {
        alert("해당 선수를 찾을 수 없습니다.");
        return;
    }
    
    // ✅ 최소 인원 체크 (16명 이상 유지)
    if (teamPlayers.length <= 16) {
        alert("팀 인원이 최소 16명 이상이어야 합니다!\n더 이상 선수를 방출할 수 없습니다.");
        return;
    }
    
    // === 이적료 계산 ===
    let price = 500; // 기본 가격 500억
    
    // 능력치 배율 (75를 기준으로 차등)
    let ratingMultiplier;
    if (player.rating >= 82) {
        ratingMultiplier = 1 + ((player.rating - 82) * 0.04);
    } else {
        ratingMultiplier = 1 - ((82 - player.rating) * 0.08);
        ratingMultiplier = Math.max(0.2, ratingMultiplier);
    }
    price *= ratingMultiplier;
    
    // 나이 배율 (25세 중심, 31세부터 급락)
    let ageMultiplier;
    if (player.age >= 24 && player.age <= 26) {
        ageMultiplier = 1.0;
    } else if (player.age >= 22 && player.age <= 28) {
        ageMultiplier = 0.95;
    } else if (player.age >= 20 && player.age <= 30) {
        ageMultiplier = 0.9;
    } else if (player.age <= 19) {
        ageMultiplier = 0.95 + (20 - player.age) * 0.025;
    } else if (player.age === 31) {
        ageMultiplier = 0.85;
    } else if (player.age === 32) {
        ageMultiplier = 0.75;
    } else if (player.age === 33) {
        ageMultiplier = 0.5;
    } else if (player.age === 34) {
        ageMultiplier = 0.3;
    } else if (player.age === 35) {
        ageMultiplier = 0.22;
    } else {
        ageMultiplier = 0.05;
    }
    price *= ageMultiplier;
    
    // 포지션 배율
    const positionMultiplier = {
        'GK': 0.95,
        'DF': 1.0,
        'MF': 1.05,
        'FW': 1.15
    };
    price *= positionMultiplier[player.position] || 1;
    
    // 랜덤 요소 (90% ~ 110%)
    const randomFactor = 0.9 + Math.random() * 0.2;
    price *= randomFactor;
    
    // 변수에 저장
    const playerCost = Math.round(price);
    
    // === 사용자에게 확인 받기 ===
    const confirmMessage = `${player.name}을(를) 방출하시겠습니까?\n\n` +
                          `능력치: ${player.rating} | 나이: ${player.age}\n` +
                          `받을 수 있는 이적료: ${playerCost}억원\n` +
                          `현재 팀 인원: ${teamPlayers.length}명 → ${teamPlayers.length - 1}명`;
    
    if (!confirm(confirmMessage)) {
        return;
    }
    
    // === 방출 처리 ===
    teamPlayers.splice(playerIndex, 1);
    removePlayerFromSquad(player);
    gameData.teamMoney += playerCost;
    
    const availableTeams = Object.keys(teams).filter(team => team !== gameData.selectedTeam);
    if (availableTeams.length > 0) {
        const randomTeam = availableTeams[Math.floor(Math.random() * availableTeams.length)];
        
        teams[randomTeam].push({
            name: player.name,
            position: player.position,
            rating: player.rating,
            age: player.age
        });
        
        // [추가] 이적 뉴스에 기록
        if (typeof transferSystem !== 'undefined') {
            transferSystem.addTransferNews(player, gameData.selectedTeam, randomTeam, playerCost);
        }
        
        alert(`${player.name}을(를) 방출했습니다!\n${teamNames[randomTeam]}로 이적했습니다.\n이적료 ${playerCost}억원을 받았습니다.`);
    } else {
        // [추가] 이적 뉴스에 기록 (외부리그)
        if (typeof transferSystem !== 'undefined') {
            transferSystem.addTransferNews(player, gameData.selectedTeam, "외부리그", playerCost);
        }
        
        alert(`${player.name}을(를) 방출했습니다!\n외부리그로 이적했습니다.\n이적료 ${playerCost}억원을 받았습니다.`);
    }
    
    updateDisplay();
    displayTeamPlayers();
    updateFormationDisplay();
    
    if (typeof transferSystem !== 'undefined') {
        transferSystem.transferMarket = transferSystem.transferMarket.filter(p => 
            !(p.name === player.name && p.position === player.position)
        );
    }
}

// 스쿼드에서 선수 제거하는 헬퍼 함수 (script.js에 추가)
function removePlayerFromSquad(player) {
    if (gameData.squad.gk && gameData.squad.gk.name === player.name) {
        gameData.squad.gk = null;
    }
    
    gameData.squad.df = gameData.squad.df.map(p => 
        p && p.name === player.name ? null : p
    );
    
    gameData.squad.mf = gameData.squad.mf.map(p => 
        p && p.name === player.name ? null : p
    );
    
    gameData.squad.fw = gameData.squad.fw.map(p => 
        p && p.name === player.name ? null : p
    );
}
function openPlayerModal(position, index) {
    selectedPosition = { position, index };
    const modal = document.getElementById('playerModal');
    const modalPlayerList = document.getElementById('modalPlayerList');
    
    modalPlayerList.innerHTML = '';
    
    const teamPlayers = teams[gameData.selectedTeam];
    const filteredPlayers = teamPlayers.filter(player => 
        !isPlayerInSquad(player)
    );
    
    if (filteredPlayers.length === 0) {
        modalPlayerList.innerHTML = '<p>배치 가능한 선수가 없습니다.</p>';
        modal.style.display = 'block';
    } else {
        filteredPlayers.forEach(player => {
            const playerCard = document.createElement('div');
            playerCard.className = 'player-card';
            playerCard.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="details">능력치: ${player.rating} | 나이: ${player.age}</div>
            `;
            
            playerCard.addEventListener('click', () => {
                // assignPlayerToPosition(player);
                closeModal();
            });
            
            modalPlayerList.appendChild(playerCard);
        });
    }
    
    // modal.style.display = 'block';
}

function assignPlayerToPosition(player) {
    if (!selectedPosition) return;
    
    // 이미 스쿼드에 있는 선수인지 확인
    if (isPlayerInSquad(player)) {
        alert('이 선수는 이미 스쿼드에 포함되어 있습니다.');
        return;
    }
    
    const { position, index } = selectedPosition;
    
    if (position === 'gk') {
        gameData.squad.gk = player;
    } else if (position === 'df') {
        gameData.squad.df[index] = player;
    } else if (position === 'mf') {
        gameData.squad.mf[index] = player;
    } else if (position === 'fw') {
        gameData.squad.fw[index] = player;
    }
    
    updateFormationDisplay();
    displayTeamPlayers(); // 선수 목록 새로고침
    selectedPosition = null;
}

function updateFormationDisplay() {

    // ✅ 이 3줄만 추가
    if (typeof refreshFormation === 'function') {
        refreshFormation();
        return;
    }
    
    // GK 업데이트
    const gkSlot = document.getElementById('gk-slot');
    if (gameData.squad.gk) {
        gkSlot.innerHTML = `
            <div>${gameData.squad.gk.name}</div>
            <div>${Math.floor(gameData.squad.gk.rating)}</div>
        `;
        gkSlot.classList.add('filled');
    } else {
        gkSlot.innerHTML = 'GK';
        gkSlot.classList.remove('filled');
    }
    
    // DF 업데이트
    for (let i = 0; i < 4; i++) {
        const dfSlot = document.querySelector(`.df-${i + 1} .player-slot`);
        if (gameData.squad.df[i]) {
            dfSlot.innerHTML = `
                <div>${gameData.squad.df[i].name}</div>
                <div>${Math.floor(gameData.squad.df[i].rating)}</div>
            `;
            dfSlot.classList.add('filled');
        } else {
            dfSlot.innerHTML = 'DF';
            dfSlot.classList.remove('filled');
        }
    }
    
    // MF 업데이트
    for (let i = 0; i < 3; i++) {
        const mfSlot = document.querySelector(`.mf-${i + 1} .player-slot`);
        if (gameData.squad.mf[i]) {
            mfSlot.innerHTML = `
                <div>${gameData.squad.mf[i].name}</div>
                <div>${Math.floor(gameData.squad.mf[i].rating)}</div>
            `;
            mfSlot.classList.add('filled');
        } else {
            mfSlot.innerHTML = 'MF';
            mfSlot.classList.remove('filled');
        }
    }
    
    // FW 업데이트
    for (let i = 0; i < 3; i++) {
        const fwSlot = document.querySelector(`.fw-${i + 1} .player-slot`);
        if (gameData.squad.fw[i]) {
            fwSlot.innerHTML = `
                <div>${gameData.squad.fw[i].name}</div>
                <div>${Math.floor(gameData.squad.fw[i].rating)}</div>
            `;
            fwSlot.classList.add('filled');
        } else {
            fwSlot.innerHTML = 'FW';
            fwSlot.classList.remove('filled');
        }
    }
}

function closeModal() {
    document.getElementById('playerModal').style.display = 'none';
    // selectedPosition = null; // formation.js의 교체 로직과 충돌하므로 주석 처리
}

function updateDisplay() {
    document.getElementById('teamMoney').textContent = gameData.teamMoney + '억';
    document.getElementById('teamMorale').textContent = gameData.teamMorale;
    document.getElementById('currentSponsor').textContent = 
        gameData.currentSponsor ? gameData.currentSponsor.name : '없음';
    
    if (gameData.currentOpponent) {
        document.getElementById('opponentName').textContent = 
            teamNames[gameData.currentOpponent];
    }
}

// 리그 스케줄 생성 (더블 라운드 로빈)
function generateLeagueSchedule(leagueTeams) {
    const schedule = [];
    const numberOfTeams = leagueTeams.length;
    if (numberOfTeams % 2 !== 0) return []; // 팀 수가 짝수여야 함
    
    const rounds = numberOfTeams - 1;
    const halfSize = numberOfTeams / 2;
    const teamsCopy = [...leagueTeams];

    // 전반기 (라운드 로빈)
    for (let round = 0; round < rounds; round++) {
        const roundMatches = [];
        for (let i = 0; i < halfSize; i++) {
            const home = teamsCopy[i];
            const away = teamsCopy[numberOfTeams - 1 - i];
            
            // 라운드마다 홈/어웨이 번갈아가며 배정 (공평성)
            if (round % 2 === 0) {
                 roundMatches.push({ home: home, away: away });
            } else {
                 roundMatches.push({ home: away, away: home });
            }
        }
        schedule.push(roundMatches);

        // 팀 회전 (0번 인덱스 고정, 나머지 회전)
        const first = teamsCopy[0];
        const rest = teamsCopy.slice(1);
        const last = rest.pop();
        rest.unshift(last);
        teamsCopy.splice(0, teamsCopy.length, first, ...rest);
    }

    // 후반기 (전반기와 대진은 같고 홈/어웨이만 반대)
    const secondHalf = schedule.map(round => 
        round.map(match => ({ home: match.away, away: match.home }))
    );

    return [...schedule, ...secondHalf];
}

function generateFullSchedule() {
    gameData.schedule = {};
    for (let i = 1; i <= 3; i++) {
        const leagueTeams = Object.keys(allTeams).filter(key => allTeams[key].league === i);
        // 매 시즌 랜덤한 순서로 스케줄 생성
        leagueTeams.sort(() => Math.random() - 0.5);
        gameData.schedule[`division${i}`] = generateLeagueSchedule(leagueTeams);
    }
    gameData.currentRound = 1;
    console.log("📅 새 시즌 스케줄 생성 완료");
}

function setNextOpponent() {
    if (!gameData.schedule) {
        generateFullSchedule();
    }
    // 실제 상대 결정 로직은 tacticSystem.js의 endMatch나 초기화 시점에서 
    // gameData.currentRound를 기반으로 처리되지만, 
    // UI 갱신을 위해 여기서도 현재 라운드 정보를 확인합니다.
    
    const currentLeagueKey = `division${gameData.currentLeague}`;
    const leagueSchedule = gameData.schedule[currentLeagueKey];
    
    if (!leagueSchedule || gameData.currentRound > leagueSchedule.length) {
        // 시즌 종료 상태
        return;
    }

    const currentRoundMatches = leagueSchedule[gameData.currentRound - 1];
    const userMatch = currentRoundMatches.find(m => m.home === gameData.selectedTeam || m.away === gameData.selectedTeam);

    if (userMatch) {
        gameData.currentOpponent = (userMatch.home === gameData.selectedTeam) ? userMatch.away : userMatch.home;
        gameData.isHomeGame = (userMatch.home === gameData.selectedTeam);
    }
    
    updateDisplay();
}

function initializeLeagueData() {
    // 각 division 초기화 (객체 자체는 유지)
    if (!gameData.leagueData) {
        gameData.leagueData = {};
    }
    
    // 각 division 비우기
    gameData.leagueData.division1 = {};
    gameData.leagueData.division2 = {};
    gameData.leagueData.division3 = {};
    
    // 리그 테이블도 초기화
    window.league1Table = {};
    window.league2Table = {};
    window.league3Table = {};
    
    // allTeams 기준으로 새로 구축
    Object.keys(allTeams).forEach(teamKey => {
        const league = allTeams[teamKey].league;
        const divisionKey = `division${league}`;
        
        // gameData.leagueData 초기화
        gameData.leagueData[divisionKey][teamKey] = {
            matches: 0,
            wins: 0,
            draws: 0,
            losses: 0,
            points: 0,
            goalsFor: 0,
            goalsAgainst: 0
        };
        
        // 리그 테이블도 동시에 초기화
        let leagueTable;
        if (league === 1) leagueTable = window.league1Table;
        else if (league === 2) leagueTable = window.league2Table;
        else if (league === 3) leagueTable = window.league3Table;
        
        if (leagueTable) {
            leagueTable[teamKey] = {
                matches: 0,
                wins: 0,
                draws: 0,
                losses: 0,
                points: 0,
                goalsFor: 0,
                goalsAgainst: 0
            };
        }
    });
    
    console.log('✅ 리그 데이터 및 테이블 완전 초기화 완료');
}

function displayLeagueTable() {
    const leagueTable = document.getElementById('leagueTable');
    
    // 현재 리그 확인
    const currentLeague = gameData.currentLeague;
    const divisionKey = `division${currentLeague}`;
    
    // 해당 리그 데이터 존재 여부 확인
    if (!gameData.leagueData || !gameData.leagueData[divisionKey]) {
        leagueTable.innerHTML = '<p>리그 데이터를 불러올 수 없습니다.</p>';
        return;
    }
    
    // 현재 리그의 팀들만 가져와서 순위 계산
    const standings = Object.keys(gameData.leagueData[divisionKey]).map(teamKey => ({
        team: teamKey,
        ...gameData.leagueData[divisionKey][teamKey],
        goalDiff: gameData.leagueData[divisionKey][teamKey].goalsFor - gameData.leagueData[divisionKey][teamKey].goalsAgainst
    })).sort((a, b) => {
        if (b.points !== a.points) return b.points - a.points;
        if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
        return b.goalsFor - a.goalsFor;
    });
    
   let tableHTML = `
    <table class='league-table'>
        <thead>
            <tr>
                <th>순위</th>
                <th>팀</th>
                <th>경기</th>
                <th>승</th>
                <th>무</th>
                <th>패</th>
                <th>득점</th>
                <th>실점</th>
                <th>득실차</th>
                <th>승점</th>
            </tr>
        </thead>
        <tbody>
`;
    
    standings.forEach((team, index) => {
        const isUserTeam = team.team === gameData.selectedTeam;
        tableHTML += `
            <tr class="${isUserTeam ? 'user-team' : ''}">
                <td>${index + 1}</td>
                <td>${teamNames[team.team]}</td>
                <td>${team.matches}</td>
                <td>${team.wins}</td>
                <td>${team.draws}</td>
                <td>${team.losses}</td>
                <td>${team.goalsFor}</td>
                <td>${team.goalsAgainst}</td>
                <td>${team.goalDiff > 0 ? '+' : ''}${team.goalDiff}</td>
                <td>${team.points}</td>
            </tr>
        `;
    });
    
    tableHTML += '</tbody></table>';
    leagueTable.innerHTML = tableHTML;
}

// 스폰서 계약 체결 시 (기존 displaySponsors 함수 수정)
function displaySponsors() {
    const sponsorList = document.getElementById('sponsorList');
    sponsorList.innerHTML = '';
    
    const teamRating = calculateTeamRating();
    
    sponsors.forEach(sponsor => {
        const sponsorCard = document.createElement('div');
        const isAvailable = teamRating >= sponsor.requirements.minRating;
        const isContracted = gameData.currentSponsor && gameData.currentSponsor.name === sponsor.name;
        
        let cardClass = 'sponsor-card';
        if (isContracted) {
            cardClass += ' contracted';
        } else if (isAvailable && !gameData.currentSponsor) {
            cardClass += ' available';
        } else {
            cardClass += ' unavailable';
        }
        
        sponsorCard.className = cardClass;
        
        // 계약 중인 경우 남은 경기 수 표시
        let contractInfo = '';
        if (isContracted && gameData.sponsorRemainingMatches) {
            contractInfo = `<div style="color: #f39c12; font-weight: bold; margin-top: 10px;">남은 계약: ${gameData.sponsorRemainingMatches}경기</div>`;
        }
        
        sponsorCard.innerHTML = `
            <h4>${sponsor.name}</h4>
            <p>${sponsor.description}</p>
            <div class="sponsor-details">
                <div class="sponsor-detail">
                    <strong>승리당:</strong> ${sponsor.payPerWin}억
                </div>
                <div class="sponsor-detail">
                    <strong>패배당:</strong> ${sponsor.payPerLoss}억
                </div>
                <div class="sponsor-detail">
                    <strong>계약금:</strong> ${sponsor.signingBonus}억
                </div>
                <div class="sponsor-detail">
                    <strong>기간:</strong> ${sponsor.contractLength}경기
                </div>
            </div>
            <div class="sponsor-requirements">
                <strong>요구 능력치:</strong> ${sponsor.requirements.minRating} 
                <span style="color: ${teamRating >= sponsor.requirements.minRating ? '#2ecc71' : '#e74c3c'};">
                    (현재: ${teamRating.toFixed(1)})
                </span>
            </div>
            ${isContracted ? '<div style="color: #2ecc71; font-weight: bold; margin-top: 10px;">✓ 계약 중</div>' : ''}
            ${contractInfo}
        `;
        
        if (isAvailable && !gameData.currentSponsor) {
            sponsorCard.addEventListener('click', () => {
                // 계약 체결
                gameData.currentSponsor = sponsor;
                gameData.sponsorRemainingMatches = sponsor.contractLength; // 남은 경기 수 설정
                gameData.teamMoney += sponsor.signingBonus;
                
                updateDisplay();
                displaySponsors();
                alert(`${sponsor.name}와 계약을 체결했습니다! 계약금 ${sponsor.signingBonus}억을 받았습니다.`);

                // 스폰서 계약 메일 발송
                if (typeof mailManager !== 'undefined') {
                    mailManager.sendSponsorMail(sponsor);
                }
            });
        }
        
        sponsorList.appendChild(sponsorCard);
    });
}

// 경기 후 스폰서 관련 처리 함수
function processSponsorAfterMatch(matchResult) {
    if (!gameData.currentSponsor) return;
    
    const sponsor = gameData.currentSponsor;
    let payment = 0;
    
    // 경기 결과에 따른 보너스 지급
    if (matchResult === 'win') {
        payment = sponsor.payPerWin;
        gameData.teamMoney += payment;
        console.log(`스폰서 승리 보너스: ${payment}억원`);
    } else if (matchResult === 'loss') {
        payment = sponsor.payPerLoss;
        gameData.teamMoney += payment;
        console.log(`스폰서 패배 보상: ${payment}억원`);
    }
    
    // 계약 기간 감소
    if (gameData.sponsorRemainingMatches > 0) {
        gameData.sponsorRemainingMatches--;
        console.log(`스폰서 계약 남은 경기: ${gameData.sponsorRemainingMatches}`);
        
        // 계약 만료 체크
        if (gameData.sponsorRemainingMatches <= 0) {
            expireSponsorContract();
        } else if (gameData.sponsorRemainingMatches <= 3) {
            // 계약 만료 임박 알림
            alert(`스폰서 계약이 ${gameData.sponsorRemainingMatches}경기 후 만료됩니다.`);
        }
    }
    
    updateDisplay();
}

// 스폰서 계약 만료 처리
function expireSponsorContract() {
    const expiredSponsor = gameData.currentSponsor;
    
    // 계약 정보 초기화
    gameData.currentSponsor = null;
    gameData.sponsorRemainingMatches = 0;
    
    console.log(`${expiredSponsor.name} 계약 만료`);
    alert(`${expiredSponsor.name}와의 계약이 만료되었습니다. 새로운 스폰서를 선택할 수 있습니다.`);
    
    // 스폰서 탭이 활성화되어 있다면 새로고침
    if (document.getElementById('sponsor').classList.contains('active')) {
        displaySponsors();
    }
    
    updateDisplay();
}

function endMatch(matchData) {
    document.getElementById('endMatchBtn').style.display = 'block';
    
    // 경기 결과 계산
    const userScore = matchData.homeScore;
    const opponentScore = matchData.awayScore;
    let result = '';
    let moraleChange = 0;
    let points = 0;
    
    // 전력 차이에 따른 결과 반영
    const strengthDiff = matchData.strengthDiff;
    const expectation = strengthDiff.userAdvantage ? '승리' : '패배';
    const isUpset = (result === '승리' && !strengthDiff.userAdvantage) || 
                   (result === '패배' && strengthDiff.userAdvantage);
    
    if (userScore > opponentScore) {
        result = '승리';
        if (strengthDiff.userAdvantage) {
            // 예상된 승리
            moraleChange = Math.floor(Math.random() * 8) + 5; // 5-12
        } else {
            // 예상 밖 승리 (업셋)
            moraleChange = Math.floor(Math.random() * 15) + 10; // 10-24
        }
        points = 3;
        
        // 기본 경기 수익
        gameData.teamMoney += 50; // 승리 시 50억
        
        // 스폰서 보너스
        if (gameData.currentSponsor) {
            gameData.teamMoney += gameData.currentSponsor.payPerWin;
        }
    } else if (userScore < opponentScore) {
        result = '패배';
        if (!strengthDiff.userAdvantage) {
            // 예상된 패배
            moraleChange = -(Math.floor(Math.random() * 8) + 3); // -3 to -10
        } else {
            // 예상 밖 패배 (충격적 패배)
            moraleChange = -(Math.floor(Math.random() * 15) + 10); // -10 to -24
        }
        points = 0;
        
        // 기본 경기 수익
        gameData.teamMoney += 10; // 패배 시 10억
        
        // 스폰서 보너스
        if (gameData.currentSponsor) {
            gameData.teamMoney += gameData.currentSponsor.payPerLoss;
        }
    } else {
        result = '무승부';
        if (strengthDiff.strengthGap < 5) {
            // 비슷한 전력 간 무승부
            moraleChange = Math.floor(Math.random() * 3) - 1; // -1 to 1
        } else if (strengthDiff.userAdvantage) {
            // 강한 팀이 무승부 (실망)
            moraleChange = -(Math.floor(Math.random() * 5) + 2); // -2 to -6
        } else {
            // 약한 팀이 무승부 (선전)
            moraleChange = Math.floor(Math.random() * 8) + 3; // 3-10
        }
        points = 1;
        
        // 기본 경기 수익
        gameData.teamMoney += 15; // 무승부 시 15억
        
        // 스폰서 보너스 (승리의 절반)
        if (gameData.currentSponsor) {
            gameData.teamMoney += Math.floor(gameData.currentSponsor.payPerWin / 2);
        }
    }
    
    // 리그 데이터 업데이트
    updateLeagueData(matchData, points);
    
    // 사기 업데이트
    gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + moraleChange));
    
    // 경기 수 증가
    gameData.matchesPlayed++;
    
    // 경기 종료 메시지 (이변 여부 반영)
    let finalMessage = `경기 종료! ${result} (${userScore}-${opponentScore})`;
    
    if (isUpset) {
        if (result === '승리') {
            finalMessage += `\n🎉 대이변! 전력상 불리했던 경기에서 승리!`;
        } else if (result === '패배') {
            finalMessage += `\n😱 충격! 전력상 유리했던 경기에서 패배...`;
        }
    }
    
    finalMessage += `\n${strengthDiff.userAdvantage ? '전력상 유리했던' : '전력상 불리했던'} 경기에서 ${result}`;
    finalMessage += `\n사기 변화: ${moraleChange > 0 ? '+' : ''}${moraleChange}`;
    
    const finalEvent = {
        minute: 90,
        type: 'final',
        description: finalMessage
    };
    displayEvent(finalEvent, matchData);
    
    // 스폰서 처리 (수정된 부분)
    if (typeof window.processSponsorAfterMatch === 'function') {
        const matchResult = result === '승리' ? 'win' : result === '패배' ? 'loss' : 'draw';
        window.processSponsorAfterMatch(matchResult);
    }
    
    // 경기 종료 버튼 이벤트
    document.getElementById('endMatchBtn').onclick = () => {
        // 인터뷰 화면으로 이동
        startInterview(result, userScore, opponentScore, strengthDiff);
    };
    
    // 선수 성장 처리
    if (typeof processPostMatchGrowth === 'function') {
        setTimeout(() => {
            processPostMatchGrowth();
        }, 2000);
    }

    // 개인기록 업데이트
    if (typeof updateRecordsAfterMatch === 'function') {
        updateRecordsAfterMatch(matchData);
    }
    
    // AI 팀들 경기 시뮬레이션
    simulateOtherMatches();
}
    // 시즌 종료 후 처리
    setTimeout(() => {
        processRetirementsAndReincarnations(); // 은퇴 및 환생 처리
        checkSeasonEnd(); // 시즌 종료 조건 체크
    }, 1000);

// 저장/불러오기에 스폰서 데이터 포함 확인
function checkSponsorDataInSave() {
    // gameData에 다음이 포함되어야 함:
    // - currentSponsor
    // - sponsorRemainingMatches
    console.log('현재 스폰서:', gameData.currentSponsor);
    console.log('남은 계약 경기:', gameData.sponsorRemainingMatches);
}

function calculateTeamRating() {
    const squad = gameData.squad;
    let totalRating = 0;
    let playerCount = 0;
    
    if (squad.gk) {
        totalRating += squad.gk.rating;
        playerCount++;
    }
    
    squad.df.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });
    
    squad.mf.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });
    
    squad.fw.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });
    
    return playerCount > 0 ? totalRating / playerCount : 0;
}

// 상대팀의 평균 능력치 계산 (AI 팀은 최고 11명으로 계산)
function calculateOpponentTeamRating(opponentTeam) {
    const teamPlayers = teams[opponentTeam];
    if (!teamPlayers || teamPlayers.length === 0) return 70;
    
    // 포지션별로 선수들을 분류하고 능력치 순으로 정렬
    const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
    const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
    const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
    const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
    
    let selectedPlayers = [];
    
    // 최고 능력치 선수들로 가상 스쿼드 구성
    if (gks.length > 0) selectedPlayers.push(gks[0]);
    
    // 수비수 4명
    for (let i = 0; i < 4 && i < dfs.length; i++) {
        selectedPlayers.push(dfs[i]);
    }
    
    // 미드필더 3명
    for (let i = 0; i < 3 && i < mfs.length; i++) {
        selectedPlayers.push(mfs[i]);
    }
    
    // 공격수 3명
    for (let i = 0; i < 3 && i < fws.length; i++) {
        selectedPlayers.push(fws[i]);
    }
    
    // 11명이 안 되면 나머지 포지션에서 채우기
    const allPlayers = teamPlayers.sort((a, b) => b.rating - a.rating);
    while (selectedPlayers.length < 11 && selectedPlayers.length < allPlayers.length) {
        const nextPlayer = allPlayers.find(p => !selectedPlayers.includes(p));
        if (nextPlayer) selectedPlayers.push(nextPlayer);
    }
    
    // 평균 능력치 계산
    const totalRating = selectedPlayers.reduce((sum, player) => sum + player.rating, 0);
    return selectedPlayers.length > 0 ? totalRating / selectedPlayers.length : 70;
}

// 팀 전력 차이 계산
function calculateTeamStrengthDifference() {
    const userRating = calculateTeamRating();
    const opponentRating = calculateOpponentTeamRating(gameData.currentOpponent);
    
    return {
        userRating: userRating,
        opponentRating: opponentRating,
        difference: userRating - opponentRating,
        userAdvantage: userRating > opponentRating,
        strengthGap: Math.abs(userRating - opponentRating)
    };
}

// [신규] 불러오기 후 스쿼드 선수 객체 재연결 (Re-linking)
// 저장된 스쿼드의 선수 객체는 복사본이므로, 실제 teams의 선수 객체와 연결해줘야 함
function relinkSquadPlayers() {
    if (!gameData.squad || !gameData.selectedTeam || !teams[gameData.selectedTeam]) return;

    const teamPlayers = teams[gameData.selectedTeam];
    
    const findRealPlayer = (savedPlayer) => {
        if (!savedPlayer) return null;
        // 이름과 포지션으로 실제 선수 객체 찾기
        return teamPlayers.find(p => p.name === savedPlayer.name && p.position === savedPlayer.position) || savedPlayer;
    };

    if (gameData.squad.gk) gameData.squad.gk = findRealPlayer(gameData.squad.gk);
    gameData.squad.df = gameData.squad.df.map(p => findRealPlayer(p));
    gameData.squad.mf = gameData.squad.mf.map(p => findRealPlayer(p));
    gameData.squad.fw = gameData.squad.fw.map(p => findRealPlayer(p));

    console.log('✅ 스쿼드 선수 객체 재연결 완료');
}

  function saveGame() {
    // 중복 실행 방지
    if (window.savingInProgress) {
        console.log('저장이 이미 진행 중입니다.');
        return;
    }
    window.savingInProgress = true;
    
    console.log('=== 저장 시작 ===');
    
    // [추가] AI 선수들의 성장 데이터를 allTeams에도 반영 (저장 시 누락 방지)
    if (typeof allTeams !== 'undefined' && typeof teams !== 'undefined') {
        Object.keys(teams).forEach(teamKey => {
            if (allTeams[teamKey]) {
                allTeams[teamKey].players = teams[teamKey];
            }
        });
        console.log('✅ teams 데이터를 allTeams에 동기화 완료 (AI 성장 반영)');
    }

    try {
        // 이적 시장 데이터 저장 (gameData에 통합)
        if (typeof transferSystem !== 'undefined') {
            gameData.transferSystemData = transferSystem.getSaveData();
        }
        
        // Records System에서 모든 득점/도움 데이터 수집
        const recordsData = {};
        
        if (typeof leagueBasedRecordsSystem !== 'undefined') {
            recordsData.recordsSystemData = leagueBasedRecordsSystem.getSaveData();
            
            // 전체 득점왕/도움왕 순위도 저장
            recordsData.topScorersAll = leagueBasedRecordsSystem.getTopScorers(20);
            recordsData.topAssistersAll = leagueBasedRecordsSystem.getTopAssisters(20);
            
            // 리그별 득점왕/도움왕도 저장
            recordsData.leagueTopScorers = {};
            recordsData.leagueTopAssisters = {};
            
            for (let league = 1; league <= 3; league++) {
                recordsData.leagueTopScorers[league] = leagueBasedRecordsSystem.getTopScorersByLeague(league, 10);
                recordsData.leagueTopAssisters[league] = leagueBasedRecordsSystem.getTopAssistersByLeague(league, 10);
            }
        }
        
        const saveData = {
        gameData: gameData,
        allTeams: typeof allTeams !== 'undefined' ? allTeams : null, // teams는 allTeams에서 복구 가능하므로 제외
        recordsData: recordsData,
        snsData: snsManager.getSaveData(),
        mailData: mailManager.getSaveData(), // 메일 데이터 저장
        growthData: playerGrowthSystem.getSaveData(),
        injuryData: injurySystem.getSaveData(), // 부상 데이터 추가
        timestamp: new Date().toISOString()
    };
        
        // JSON 파일로 저장
        const blob = new Blob([JSON.stringify(saveData, null, 2)], {type: 'application/json'});
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${teamNames[gameData.selectedTeam]}_${new Date().toISOString().slice(0, 10)}.json`;
        a.click();
        URL.revokeObjectURL(url);
        
        console.log('게임 저장 완료');
        
    } catch (error) {
        console.error('저장 중 오류:', error);
        alert('저장 중 오류가 발생했습니다.');
    } finally {
        // 중복 실행 방지 해제 (2초 후)
        setTimeout(() => {
            window.savingInProgress = false;
        }, 2000);
    }
}

function loadGame(event) {
    const file = event.target.files[0];
    if (!file) return;
    
    // 중복 실행 방지
    if (window.loadingInProgress) {
        console.log('불러오기가 이미 진행 중입니다.');
        return;
    }
    window.loadingInProgress = true;
    
    const reader = new FileReader();
    reader.onload = function(e) {
        try {
            console.log('=== 게임 불러오기 시작 ===');
            const saveData = JSON.parse(e.target.result);
            
            // 기본 게임 데이터 복원
            gameData = saveData.gameData;
            if (!gameData.playerRoles) gameData.playerRoles = {}; // [추가] 구버전 세이브 호환성 보장
            console.log('gameData 복원 완료');
            
            // 팀 데이터 복원 (allTeams -> teams 재구성)
            if (saveData.allTeams) {
                Object.assign(allTeams, saveData.allTeams);
                console.log('allTeams 데이터 복원 완료');
                
                // teams 객체 재구성
                Object.keys(allTeams).forEach(teamKey => {
                    teams[teamKey] = allTeams[teamKey].players;
                });
                console.log('teams 객체 재구성 완료');
            } else if (saveData.teams) {
                // 구버전 호환: teams만 있는 경우
                Object.assign(teams, saveData.teams);
            }
            
            // 스쿼드 선수 객체 재연결 (중요!)
            relinkSquadPlayers();
            
            // 리그 테이블 복원 (gameData.leagueData 기반으로 전역 변수 복구)
            if (gameData.leagueData) {
                if (gameData.leagueData.division1) window.league1Table = gameData.leagueData.division1;
                if (gameData.leagueData.division2) window.league2Table = gameData.leagueData.division2;
                if (gameData.leagueData.division3) window.league3Table = gameData.leagueData.division3;
                console.log('리그 테이블 전역 변수 복구 완료');
            } else {
                // 구버전 호환
                if (saveData.league1Table) window.league1Table = saveData.league1Table;
                if (saveData.league2Table) window.league2Table = saveData.league2Table;
                if (saveData.league3Table) window.league3Table = saveData.league3Table;
            }
            
            // Records System 데이터 복원
            if (saveData.recordsData && typeof leagueBasedRecordsSystem !== 'undefined') {
                if (saveData.recordsData.recordsSystemData) {
                    leagueBasedRecordsSystem.loadSaveData(saveData.recordsData.recordsSystemData);
                    console.log('Records System 데이터 복원 완료');
                }
            }
            // 기존 형식 호환성 지원
            else if (saveData.recordsSystemData && typeof leagueBasedRecordsSystem !== 'undefined') {
                leagueBasedRecordsSystem.loadSaveData(saveData.recordsSystemData);
                console.log('Records System 데이터 복원 완료 (기존 형식)');
            }
            
            // SNS 데이터 복원
            if (saveData.snsData && typeof snsManager !== 'undefined') {
                snsManager.loadSaveData(saveData.snsData);
                console.log('SNS 데이터 복원 완료');
            }

            // 부상 데이터 복원
    if (saveData.injuryData && typeof injurySystem !== 'undefined') {
        injurySystem.loadSaveData(saveData.injuryData);
        console.log('부상 데이터 복원 완료');
    }

            // 이적 시장 데이터 복원
            if (gameData.transferSystemData && typeof transferSystem !== 'undefined') {
                transferSystem.loadSaveData(gameData.transferSystemData);
                console.log('이적 시장 데이터 복원 완료');
            }

            // 스케줄 데이터 복원 (없으면 생성)
            if (!gameData.schedule) {
                generateFullSchedule();
            }

            // 시작 연도 초기화 (구버전 호환)
            if (!gameData.startYear) {
                gameData.startYear = 2025;
            }
            
            // [추가] 시즌 카운트 복원 (구버전 호환)
            if (!gameData.seasonCount) {
                gameData.seasonCount = (gameData.startYear || 2025) - 2024;
            }
            
            // 포텐셜 시스템 처리
            if (typeof playerGrowthSystem !== 'undefined') {
                console.log('=== 포텐셜 시스템 처리 시작 ===');
                
                playerGrowthSystem.resetGrowthSystem();
                console.log('기존 포텐셜 데이터 초기화 완료');
                
                if (saveData.growthData) {
                    playerGrowthSystem.loadSaveData(saveData.growthData);
                    console.log('저장된 포텐셜 데이터 로드 완료');
                    
                    const summary = playerGrowthSystem.getTeamGrowthSummary();
                    console.log('복원된 성장 중인 선수 수:', summary.length);
                } else {
                    playerGrowthSystem.initializePlayerGrowth();
                    console.log('새로운 포텐셜 시스템 초기화');
                }
                
                console.log('=== 포텐셜 시스템 처리 완료 ===');
            }
            
            
            // 화면 업데이트
            console.log('=== 화면 업데이트 시작 ===');
            document.getElementById('teamName').textContent = teamNames[gameData.selectedTeam];
            updateDisplay();
            updateFormationDisplay();
            displayTeamPlayers();
            showScreen('lobby'); // 로비 화면으로 이동
            console.log('기본 화면 업데이트 완료');
            
            // SNS 피드 새로고침
            if (typeof snsManager !== 'undefined' && document.getElementById('snsFeed')) {
                snsManager.displayFeed('snsFeed', 15);
                console.log('SNS 피드 새로고침 완료');
            }
            
            // Records 탭 업데이트
            if (typeof updateRecordsTab === 'function') {
                updateRecordsTab();
                console.log('Records 탭 업데이트 완료');
            }
            
            console.log('=== 게임 불러오기 완료 ===');
            alert('게임을 불러왔습니다!');
            
            // gameData 객체가 교체되었으므로 자동 저장 감지기 재설정
            if (window.autoSaveSystem) {
                window.autoSaveSystem.hookMoney();
            }

            // 자동 저장 UI 업데이트
            if (typeof window.updateAutoSaveUI === 'function') {
                window.updateAutoSaveUI();
            }

            // 오디오 설정 복원 및 재생
            if (typeof audioManager !== 'undefined') {
                audioManager.init();
                audioManager.applySettings(gameData.settings);
            }
            
        } catch (error) {
            console.error('불러오기 에러:', error);
            alert('저장 파일을 불러오는 중 오류가 발생했습니다.');
        } finally {
            setTimeout(() => {
                window.loadingInProgress = false;
            }, 1000);
        }
    };
    
    reader.readAsText(file);
    event.target.value = '';
}

// 이벤트 리스너 설정
function setupSaveLoadListeners() {
    const saveBtn = document.getElementById('saveGameBtn');
    const loadBtn = document.getElementById('loadGameBtn');
    const loadInput = document.getElementById('loadGameInput');
    
    if (saveBtn) {
        const newSaveBtn = saveBtn.cloneNode(true);
        saveBtn.parentNode.replaceChild(newSaveBtn, saveBtn);
        newSaveBtn.addEventListener('click', saveGame);
        console.log('저장 버튼 이벤트 리스너 설정 완료');
    }
    
    if (loadBtn && loadInput) {
        const newLoadBtn = loadBtn.cloneNode(true);
        loadBtn.parentNode.replaceChild(newLoadBtn, loadBtn);
        
        const newLoadInput = loadInput.cloneNode(true);
        loadInput.parentNode.replaceChild(newLoadInput, loadInput);
        
        newLoadBtn.addEventListener('click', function() {
            newLoadInput.click();
        });
        newLoadInput.addEventListener('change', loadGame);
        
        console.log('불러오기 버튼 이벤트 리스너 설정 완료');
    }
}

document.addEventListener('DOMContentLoaded', function() {
    setTimeout(setupSaveLoadListeners, 1500);
});

// 전술 정보 버튼 이벤트 리스너 추가
document.getElementById('showTacticsBtn').addEventListener('click', showTacticsInfo);
document.getElementById('showTeamTacticsBtn').addEventListener('click', showTeamTacticsInfo);

// 전술 상성표 표시 함수
function showTacticsInfo() {
    const tactics = {
        gegenpress: {
            name: "게겐프레싱",
            effective: ["twoLine", "possession"],
            ineffective: ["longBall", "catenaccio"],
            description: "높은 압박으로 빠른 역습을 노리는 전술"
        },
        twoLine: {
            name: "다이렉트 축구",
            effective: ["longBall", "parkBus"],
            ineffective: ["gegenpress", "totalFootball"],
            description: "긴 패스로 상대의 공간을 파고드는 전술"
        },
        lavolpiana: {
            name: "라볼피아나",
            effective: ["possession", "tikitaka"],
            ineffective: ["catenaccio", "longBall"],
            description: "측면 공격과 크로스를 중심으로 한 전술"
        },
        longBall: {
            name: "롱볼 축구",
            effective: ["parkBus", "catenaccio"],
            ineffective: ["gegenpress", "tikitaka"],
            description: "긴 패스로 빠르게 공격을 전개하는 전술"
        },
        possession: {
            name: "점유율 축구",
            effective: ["tikitaka", "lavolpiana"],
            ineffective: ["longBall", "gegenpress"],
            description: "공을 오래 소유하며 천천히 공격 기회를 만드는 전술"
        },
        parkBus: {
            name: "역습 축구",
            effective: ["catenaccio", "twoLine"],
            ineffective: ["gegenpress", "totalFootball"],
            description: "수비에 집중하고 호시탐탐 역습을 노리는 전술"
        },
        catenaccio: {
            name: "카테나치오",
            effective: ["twoLine", "parkBus"],
            ineffective: ["possession", "totalFootball"],
            description: "이탈리아식 견고한 수비 전술"
        },
        totalFootball: {
            name: "토탈 풋볼",
            effective: ["tikitaka", "gegenpress"],
            ineffective: ["twoLine", "catenaccio"],
            description: "모든 선수가 공격과 수비에 참여하는 전술"
        },
        tikitaka: {
            name: "티키타카",
            effective: ["possession", "lavolpiana"],
            ineffective: ["longBall", "parkBus"],
            description: "짧은 패스를 연결하며 공간을 만드는 전술"
        }
    };

    document.getElementById('tacticsModalTitle').textContent = '🎯 전술 상성표';
    
    let content = '<div style="max-height: 500px; overflow-y: auto;">';
    
    Object.entries(tactics).forEach(([key, tactic]) => {
        content += `
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px;">
                <h4 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 10px;">【${tactic.name}】</h4>
                <p style="margin-bottom: 15px; line-height: 1.4; opacity: 0.9;">📖 ${tactic.description}</p>
                <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 15px;">
                    <div style="background: rgba(46, 204, 113, 0.2); padding: 10px; border-radius: 8px; border-left: 3px solid #2ecc71;">
                        <strong style="color: #2ecc71;">✅ 효과적 vs:</strong><br>
                        ${tactic.effective.map(t => tactics[t].name).join('<br>')}
                    </div>
                    <div style="background: rgba(231, 76, 60, 0.2); padding: 10px; border-radius: 8px; border-left: 3px solid #e74c3c;">
                        <strong style="color: #e74c3c;">❌ 비효과적 vs:</strong><br>
                        ${tactic.ineffective.map(t => tactics[t].name).join('<br>')}
                    </div>
                </div>#e74c3c
            </div>
        `;
    });

    content += `
        <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; padding: 15px; margin-top: 20px; text-align: center;">
            <strong style="color: #ffd700;">💡 팁: 상대팀의 전술을 파악하고 유리한 전술을 선택하세요(비효과적 vs라는 건 상대가 그 전술일때 비효과적이라는 뜻)<strong>
        </div>
    </div>`;
    
    document.getElementById('tacticsModalContent').innerHTML = content;
    document.getElementById('tacticsModal').style.display = 'block';
}

// 팀별 전술 매핑 (전역 변수)
const teamTactics = {
    // 1부 리그
    바르셀로나: "tikitaka",
    레알_마드리드: "possession",
    맨체스터_시티: "tikitaka",
    리버풀: "gegenpress",
    토트넘_홋스퍼: "totalFootball",
    파리_생제르맹: "tikitaka",
    AC_밀란: "twoLine",
    인터_밀란: "catenaccio",
    아스널: "tikitaka",
    나폴리: "possession",
    첼시: "gegenpress",
    바이에른_뮌헨: "tikitaka",
    아틀레티코_마드리드: "catenaccio",
    도르트문트: "gegenpress",
    
    // 2부 리그
    유벤투스: "catenaccio",
    뉴캐슬_유나이티드: "longBall",
    아스톤_빌라: "possession",
    라이프치히: "gegenpress",
    세비야: "tikitaka",
    아약스: "totalFootball",
    AS_로마: "catenaccio",
    레버쿠젠: "longBall",
    스포르팅_CP: "possession",
    벤피카: "twoLine",
    셀틱: "longBall",
    페예노르트: "possession",
    맨체스터_유나이티드: "gegenpress",
    올랭피크_드_마르세유: "twoLine",
    
    // 3부 리그
    FC_서울: "lavolpiana",
    갈라타사라이: "possession",
    알_힐랄: "tikitaka",
    알_이티하드: "possession",
    알_나스르: "twoLine",
    아르헨티나_연합: "catenaccio",
    미국_연합: "gegenpress",
    멕시코_연합: "totalFootball",
    브라질_연합: "possession",
    전북_현대: "lavolpiana",
    울산_현대: "tikitaka",
    포항_스틸러스: "possession",
    광주_FC: "tikitaka",
    리옹: "twoLine"
};

// 팀별 전술 정보 표시 함수
function showTeamTacticsInfo() {
    // 전술별로 그룹화
    const tacticGroups = {};
    Object.entries(teamTactics).forEach(([teamKey, tacticKey]) => {
        if (!tacticGroups[tacticKey]) {
            tacticGroups[tacticKey] = [];
        }
        tacticGroups[tacticKey].push(teamNames[teamKey]);
    });
    
    let content = '<div style="max-height: 500px; overflow-y: auto;">';
    Object.entries(tacticGroups).forEach(([tacticKey, teams]) => {
        content += `
            <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px;">
                <h4 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 15px; display: flex; align-items: center;">
                    🎯 ${tacticNames[tacticKey]}
                </h4>
                <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                    ${teams.map(team => 
                        '<div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2);">' +
                            team +
                        '</div>'
                    ).join('')}
                </div>
            </div>
        `;
    });
    
    content += `
        <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; padding: 15px; margin-top: 20px; text-align: center;">
            <strong style="color: #ffd700;">💡 경기 전에 상대팀의 전술을 확인하고 대응 전술을 준비하세요!</strong>
        </div>
    </div>`;
    
    document.getElementById('tacticsModalContent').innerHTML = content;
    document.getElementById('tacticsModal').style.display = 'block';
}


    const tacticNames = {
        gegenpress: "게겐프레싱",
        twoLine: "다이렉트 축구",
        lavolpiana: "라볼피아나",
        longBall: "롱볼축구",
        possession: "점유율 축구",
        parkBus: "역습 축구",
        catenaccio: "카테나치오",
        totalFootball: "토탈 풋볼",
        tikitaka: "티키타카"
    };

    document.getElementById('tacticsModalTitle').textContent = '📋 팀별 기본 전술';
    
// 전술별로 그룹화
const tacticGroups = {};
Object.entries(teamTactics).forEach(([teamKey, tacticKey]) => {
    if (!tacticGroups[tacticKey]) {
        tacticGroups[tacticKey] = [];
    }
    tacticGroups[tacticKey].push(teamNames[teamKey]);
});

let content = '<div style="max-height: 500px; overflow-y: auto;">';
Object.entries(tacticGroups).forEach(([tacticKey, teams]) => {
    content += `
        <div style="background: rgba(255, 255, 255, 0.1); border-radius: 10px; padding: 20px; margin-bottom: 15px;">
            <h4 style="color: #ffd700; font-size: 1.3rem; margin-bottom: 15px; display: flex; align-items: center;">
                🎯 ${tacticNames[tacticKey]}
            </h4>
            <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 10px;">
                ${teams.map(team => 
                    '<div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 8px; text-align: center; border: 1px solid rgba(255, 255, 255, 0.2);">' +
                        team +
                    '</div>'
                ).join('')}
            </div>
        </div>
    `;
});

content += `
    <div style="background: rgba(255, 215, 0, 0.1); border: 1px solid rgba(255, 215, 0, 0.3); border-radius: 10px; padding: 15px; margin-top: 20px; text-align: center;">
        <strong style="color: #ffd700;">💡 경기 전에 상대팀의 전술을 확인하고 대응 전술을 준비하세요!</strong>
    </div>
</div>`;

document.getElementById('tacticsModalContent').innerHTML = content;
document.getElementById('tacticsModal').style.display = 'block';

// 전술 모달 닫기 함수
function closeTacticsModal() {
    document.getElementById('tacticsModal').style.display = 'none';
}

// 모달 바깥 클릭 시 닫기
window.onclick = function(event) {
    const tacticsModal = document.getElementById('tacticsModal');
    if (event.target === tacticsModal) {
        tacticsModal.style.display = 'none';
    }
}

document.getElementById('tacticsModalContent').innerHTML = content;
document.getElementById('tacticsModal').style.display = 'block';

// 전술 모달 닫기 함수
function closeTacticsModal() {
    document.getElementById('tacticsModal').style.display = 'none';
}

// 모달 바깥 클릭 시 닫기
window.onclick = function(event) {
    const tacticsModal = document.getElementById('tacticsModal');
    if (event.target === tacticsModal) {
        tacticsModal.style.display = 'none';
    }
}

// 팀 테마 적용 함수
function applyTeamTheme(teamKey) {
    // 기존 팀 클래스 제거
    document.body.className = document.body.className.replace(/team-\w+/g, '');
    
    // 새로운 팀 클래스 추가
    document.body.classList.add(`team-${teamKey}`);
}

// 아니진짜왜안되지

// 슬롯 정보 가져오기
function getSlotInfo(slotNumber) {
    const savedData = localStorage.getItem(`footballManagerSave_slot${slotNumber}`);
    if (!savedData) return null;
    
    try {
        const data = JSON.parse(savedData);
        const selectedTeam = data.gameData.selectedTeam;
        const currentLeague = data.gameData.currentLeague;
        
        // 팀 순위 계산
        let teamRank = '-';
        const divisionKey = `division${currentLeague}`;
        
        if (data.gameData.leagueData && data.gameData.leagueData[divisionKey]) {
            const standings = Object.keys(data.gameData.leagueData[divisionKey]).map(teamKey => ({
                team: teamKey,
                ...data.gameData.leagueData[divisionKey][teamKey],
                goalDiff: data.gameData.leagueData[divisionKey][teamKey].goalsFor - data.gameData.leagueData[divisionKey][teamKey].goalsAgainst
            })).sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                return b.goalsFor - a.goalsFor;
            });
            
            const rank = standings.findIndex(team => team.team === selectedTeam);
            if (rank !== -1) {
                teamRank = rank + 1;
            }
        }
        
        // 다음 상대팀
        const nextOpponent = data.gameData.currentOpponent ? teamNames[data.gameData.currentOpponent] : '미정';
        
        return {
            teamName: teamNames[selectedTeam] || '알 수 없음',
            timestamp: data.timestamp,
            matchesPlayed: data.gameData.matchesPlayed || 0,
            money: data.gameData.teamMoney || 0,
            league: currentLeague || 1,
            rank: teamRank,
            nextOpponent: nextOpponent,
            season: data.gameData.seasonCount || ((data.gameData.startYear || 2025) - 2024) // [추가] 시즌 정보
        };
    } catch (error) {
        console.error(`슬롯 ${slotNumber} 정보 읽기 오류:`, error);
        return null;
    }
}

// 슬롯 UI 생성
function createSaveSlots() {
    const container = document.getElementById('saveSlots');
    if (!container) return;
    
    container.innerHTML = '';
    
    for (let i = 1; i <= 3; i++) {
        const slotDiv = document.createElement('div');
        slotDiv.className = 'save-slot';
        slotDiv.style.cssText = `
            background: rgba(255, 255, 255, 0.1);
            border: 2px solid rgba(255, 255, 255, 0.2);
            border-radius: 10px;
            padding: 15px;
            display: flex;
            flex-direction: column;
            gap: 10px;
        `;
        
        const slotInfo = getSlotInfo(i);
        
        let infoHTML = '';
        if (slotInfo) {
            const date = new Date(slotInfo.timestamp);
            const formattedDate = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
            
            infoHTML = `
                <div style="background: rgba(255, 255, 255, 0.1); padding: 10px; border-radius: 5px;">
                    <div style="color: #ffd700; font-weight: bold; font-size: 1.1rem; margin-bottom: 5px;">
                        ${slotInfo.teamName}
                    </div>
                    <div style="font-size: 0.9rem; opacity: 0.9;">
                        📅 ${formattedDate}<br>
                        🏆 시즌 ${slotInfo.season} | ${slotInfo.league}부 리그 ${slotInfo.rank}위<br>
                        ⚽ 경기 수: ${slotInfo.matchesPlayed}<br>
                        💰 자금: ${slotInfo.money}억<br>
                        🎯 다음 상대: ${slotInfo.nextOpponent}
                    </div>
                </div>
            `;
        } else {
            infoHTML = `
                <div style="text-align: center; padding: 20px; opacity: 0.5;">
                    <div style="font-size: 2rem; margin-bottom: 10px;">📁</div>
                    <div>비어있는 슬롯</div>
                </div>
            `;
        }
        
        slotDiv.innerHTML = `
            <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 10px;">
                <h4 style="margin: 0; color: #ffd700;">슬롯 ${i}</h4>
                ${slotInfo ? '<span style="color: #2ecc71; font-size: 0.9rem;">✓ 저장됨</span>' : '<span style="color: #95a5a6; font-size: 0.9rem;">빈 슬롯</span>'}
            </div>
            ${infoHTML}
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px;">
                <button class="btn" onclick="saveToSlot(${i})" style="padding: 8px;">
                    💾 저장
                </button>
                <button class="btn" onclick="loadFromSlot(${i})" style="padding: 8px;" ${!slotInfo ? 'disabled' : ''}>
                    📁 불러오기
                </button>
            </div>
            <button class="btn" onclick="deleteSlot(${i})" style="background: #e74c3c; padding: 8px;" ${!slotInfo ? 'disabled' : ''}>
                🗑️ 이 슬롯 삭제
            </button>
        `;
        
        container.appendChild(slotDiv);
    }
}

// 특정 슬롯에 저장
function saveToSlot(slotNumber, silent = false) {
    try {
        if (!silent) console.log(`=== 슬롯 ${slotNumber}에 저장 시작 ===`);
        
        // [추가] AI 선수들의 성장 데이터를 allTeams에도 반영
        if (typeof allTeams !== 'undefined' && typeof teams !== 'undefined') {
            Object.keys(teams).forEach(teamKey => {
                if (allTeams[teamKey]) {
                    allTeams[teamKey].players = teams[teamKey];
                }
            });
        }

        const slotInfo = getSlotInfo(slotNumber);
        
        // 자동 저장이 아닐 때만 덮어쓰기 확인
        if (slotInfo && !silent) {
            if (!confirm(`슬롯 ${slotNumber}에 이미 저장된 데이터가 있습니다.\n(${slotInfo.teamName}, ${slotInfo.matchesPlayed}경기)\n\n덮어쓰시겠습니까?`)) {
                return;
            }
        }
        
        // [수정] 이적 시장 데이터 저장 (gameData에 통합)
        if (typeof transferSystem !== 'undefined') {
            gameData.transferSystemData = transferSystem.getSaveData();
        }
        
        // Records System에서 모든 득점/도움 데이터 수집
        const recordsData = {};
        
        if (typeof leagueBasedRecordsSystem !== 'undefined') {
            recordsData.recordsSystemData = leagueBasedRecordsSystem.getSaveData();
            recordsData.topScorersAll = leagueBasedRecordsSystem.getTopScorers(20);
            recordsData.topAssistersAll = leagueBasedRecordsSystem.getTopAssisters(20);
            
            recordsData.leagueTopScorers = {};
            recordsData.leagueTopAssisters = {};
            
            for (let league = 1; league <= 3; league++) {
                recordsData.leagueTopScorers[league] = leagueBasedRecordsSystem.getTopScorersByLeague(league, 10);
                recordsData.leagueTopAssisters[league] = leagueBasedRecordsSystem.getTopAssistersByLeague(league, 10);
            }
        }
        
        const saveData = {
            gameData: gameData,
            allTeams: typeof allTeams !== 'undefined' ? allTeams : null,
            recordsData: recordsData,
            snsData: snsManager.getSaveData(),
            mailData: mailManager.getSaveData(),
            growthData: playerGrowthSystem.getSaveData(),
            injuryData: injurySystem.getSaveData(),
            timestamp: new Date().toISOString()
        };
        
        // 로컬스토리지에 저장
        localStorage.setItem(`footballManagerSave_slot${slotNumber}`, JSON.stringify(saveData));
        
        if (!silent) {
            console.log(`슬롯 ${slotNumber}에 저장 완료`);
            alert(`슬롯 ${slotNumber}에 게임이 저장되었습니다!`);
        }
        
        // 슬롯 UI 새로고침
        createSaveSlots();
        
    } catch (error) {
        console.error(`슬롯 ${slotNumber} 저장 중 오류:`, error);
        
        // 용량 초과 에러 처리
        if (error.name === 'QuotaExceededError') {
            alert('브라우저 저장 공간이 부족합니다. 다른 슬롯을 삭제하거나 파일 저장을 이용해주세요.');
        } else {
            alert('저장 중 오류가 발생했습니다.');
        }
    }
}

// 특정 슬롯에서 불러오기
function loadFromSlot(slotNumber) {
    try {
        const savedData = localStorage.getItem(`footballManagerSave_slot${slotNumber}`);
        
        if (!savedData) {
            alert(`슬롯 ${slotNumber}에 저장된 게임이 없습니다.`);
            return;
        }
        
        const slotInfo = getSlotInfo(slotNumber);
        const confirmMessage = slotInfo 
            ? `슬롯 ${slotNumber}의 게임을 불러오시겠습니까?\n\n팀: ${slotInfo.teamName}\n경기 수: ${slotInfo.matchesPlayed}\n\n현재 진행 중인 게임은 사라집니다.`
            : `슬롯 ${slotNumber}의 게임을 불러오시겠습니까?\n현재 진행 중인 게임은 사라집니다.`;
        
        if (!confirm(confirmMessage)) {
            return;
        }
        
        console.log(`=== 슬롯 ${slotNumber}에서 불러오기 시작 ===`);
        const saveData = JSON.parse(savedData);
        
        // 기본 게임 데이터 복원
        gameData = saveData.gameData;
        console.log('gameData 복원 완료');
        
        // 팀 데이터 복원 (allTeams -> teams 재구성)
        if (saveData.allTeams) {
            Object.assign(allTeams, saveData.allTeams);
            console.log('allTeams 데이터 복원 완료');
            
            // teams 객체 재구성
            Object.keys(allTeams).forEach(teamKey => {
                teams[teamKey] = allTeams[teamKey].players;
            });
            console.log('teams 객체 재구성 완료');
        } else if (saveData.teams) {
            // 구버전 호환
            Object.assign(teams, saveData.teams);
        }
        
        // 스쿼드 선수 객체 재연결
        relinkSquadPlayers();
        
        // 리그 테이블 복원
        if (gameData.leagueData) {
            if (gameData.leagueData.division1) window.league1Table = gameData.leagueData.division1;
            if (gameData.leagueData.division2) window.league2Table = gameData.leagueData.division2;
            if (gameData.leagueData.division3) window.league3Table = gameData.leagueData.division3;
            console.log('리그 테이블 전역 변수 복구 완료');
        } else {
            // 구버전 호환
            if (saveData.league1Table) window.league1Table = saveData.league1Table;
            if (saveData.league2Table) window.league2Table = saveData.league2Table;
            if (saveData.league3Table) window.league3Table = saveData.league3Table;
        }
        
        // Records System 데이터 복원
        if (saveData.recordsData && typeof leagueBasedRecordsSystem !== 'undefined') {
            if (saveData.recordsData.recordsSystemData) {
                leagueBasedRecordsSystem.loadSaveData(saveData.recordsData.recordsSystemData);
                console.log('Records System 데이터 복원 완료');
            }
        }
        
        // SNS 데이터 복원
        if (saveData.snsData && typeof snsManager !== 'undefined') {
            snsManager.loadSaveData(saveData.snsData);
            console.log('SNS 데이터 복원 완료');
        }

            // 메일 데이터 복원
            if (saveData.mailData && typeof mailManager !== 'undefined') {
                mailManager.loadSaveData(saveData.mailData);
                console.log('메일 데이터 복원 완료');
            }
        
        // 부상 데이터 복원
        if (saveData.injuryData && typeof injurySystem !== 'undefined') {
            injurySystem.loadSaveData(saveData.injuryData);
            console.log('부상 데이터 복원 완료');
        }

        // 포텐셜 시스템 처리
        if (typeof playerGrowthSystem !== 'undefined') {
            console.log('=== 포텐셜 시스템 처리 시작 ===');
            
            playerGrowthSystem.resetGrowthSystem();
            console.log('기존 포텐셜 데이터 초기화 완료');
            
            if (saveData.growthData) {
                playerGrowthSystem.loadSaveData(saveData.growthData);
                console.log('저장된 포텐셜 데이터 로드 완료');
            } else {
                playerGrowthSystem.initializePlayerGrowth();
                console.log('새로운 포텐셜 시스템 초기화');
            }
            
            console.log('=== 포텐셜 시스템 처리 완료 ===');
        }
        
        // 화면 업데이트
        console.log('=== 화면 업데이트 시작 ===');
        document.getElementById('teamName').textContent = teamNames[gameData.selectedTeam];
        updateDisplay();
        updateFormationDisplay();
        displayTeamPlayers();
        console.log('기본 화면 업데이트 완료');
        
        // SNS 피드 새로고침
        if (typeof snsManager !== 'undefined' && document.getElementById('snsFeed')) {
            snsManager.displayFeed('snsFeed', 15);
            console.log('SNS 피드 새로고침 완료');
        }
        
        // Records 탭 업데이트
        if (typeof updateRecordsTab === 'function') {
            updateRecordsTab();
            console.log('Records 탭 업데이트 완료');
        }
        
        console.log(`=== 슬롯 ${slotNumber}에서 불러오기 완료 ===`);
        alert(`슬롯 ${slotNumber}에서 게임을 불러왔습니다!`);

        // gameData 객체가 교체되었으므로 자동 저장 감지기 재설정
        if (window.autoSaveSystem) {
            window.autoSaveSystem.hookMoney();
        }

        // 자동 저장 UI 업데이트 (설정 복원)
        if (typeof window.updateAutoSaveUI === 'function') {
            window.updateAutoSaveUI();
        }
        
    } catch (error) {
        console.error(`슬롯 ${slotNumber} 불러오기 에러:`, error);
        alert('저장 데이터를 불러오는 중 오류가 발생했습니다.');
    }
}

// 특정 슬롯 삭제
function deleteSlot(slotNumber) {
    const slotInfo = getSlotInfo(slotNumber);
    
    if (!slotInfo) {
        alert(`슬롯 ${slotNumber}은(는) 이미 비어있습니다.`);
        return;
    }
    
    const confirmMessage = `슬롯 ${slotNumber}을(를) 삭제하시겠습니까?\n\n팀: ${slotInfo.teamName}\n경기 수: ${slotInfo.matchesPlayed}\n\n이 작업은 되돌릴 수 없습니다.`;
    
    if (confirm(confirmMessage)) {
        localStorage.removeItem(`footballManagerSave_slot${slotNumber}`);
        alert(`슬롯 ${slotNumber}이(가) 삭제되었습니다.`);
        
        // 슬롯 UI 새로고침
        createSaveSlots();
    }
}

// ==================== 유스 & 환생 시스템 ====================

// 유스팀 선수 표시
function displayYouthPlayers() {
    const container = document.getElementById('youthPlayerList');
    container.innerHTML = '';
    console.log('🔄 displayYouthPlayers 호출됨. 현재 gameData.youthSquad:', gameData.youthSquad);

    if (gameData.youthSquad.length === 0) {
        container.innerHTML = '<p style="text-align: center; opacity: 0.7; padding: 20px;">현재 유스팀에 소속된 선수가 없습니다.</p>';
        return;
    }

    gameData.youthSquad.forEach(player => {
        const playerCard = document.createElement('div');
        playerCard.className = 'player-card';
        playerCard.innerHTML = `
            <div class="name">${player.name}</div>
            <div class="details">
                <div>${player.position} | 능력치: ${player.rating} | 나이: ${player.age}</div>
                <div style="color: #2ecc71; font-size: 0.8rem;">유망주</div>
            </div>
        `;
        playerCard.addEventListener('click', () => {
            // 콜업 로직으로 변경
            if (teams[gameData.selectedTeam].length >= 50) {
                alert('팀 인원이 가득 찼습니다! (최대 50명)\n기존 선수를 방출해야 콜업할 수 있습니다.');
                return;
            }

            if (confirm(`${player.name} 선수를 1군으로 콜업하시겠습니까?`)) {
                // 1. 1군에 선수 추가
                teams[gameData.selectedTeam].push(player);

                // 2. 유스팀에서 선수 제거
                gameData.youthSquad = gameData.youthSquad.filter(p => p.name !== player.name);

                // 3. 선수에게 성장 포텐셜 부여
                if (typeof playerGrowthSystem !== 'undefined') {
                    const potentialGranted = playerGrowthSystem.grantPotentialToPlayer(player);
                    if (potentialGranted) {
                        alert(`${player.name} 선수가 1군으로 콜업되었으며, 성장 시스템이 적용되었습니다!`);
                    } else {
                        alert(`${player.name} 선수가 1군으로 콜업되었습니다.`);
                    }
                }

                // 4. UI 새로고침
                displayYouthPlayers();
                displayTeamPlayers();
            }
        });
        container.appendChild(playerCard);
    });
}

// 은퇴 및 환생 처리
function processRetirementsAndReincarnations() {
    console.log("🔄 은퇴 및 환생 시스템 작동...");
    Object.keys(allTeams).forEach(teamKey => {
        const teamPlayers = teams[teamKey];
        const retiredPlayers = [];

        for (let i = teamPlayers.length - 1; i >= 0; i--) {
            const player = teamPlayers[i];
            if (player.age > 37 && Math.random() < 0.07) { // 37세 초과, 7% 확률
                retiredPlayers.push(player);
                
                // 1. 팀에서 선수 제거
                teamPlayers.splice(i, 1);

                // 2. 유저팀 선수였다면 스쿼드에서도 제거
                if (teamKey === gameData.selectedTeam) {
                    removePlayerFromSquad(player);
                }

                // 3. 환생 선수 생성
                const reincarnatedPlayer = {
                    name: player.name, // 이름 유지
                    position: player.position,
                    country: player.country,
                    age: 17,
                    rating: Math.floor(Math.random() * (71 - 57 + 1)) + 57, // 57~71
                    isReincarnated: true // 환생 선수 플래그
                };

                let message;
                // 4. 환생한 선수를 소속에 맞게 배치
                if (teamKey === gameData.selectedTeam) {
                    // 사용자 팀에서 은퇴한 경우, 유스팀으로 이동
                    gameData.youthSquad.push(reincarnatedPlayer);
                    message = `[은퇴/환생] 우리 팀의 전설 ${player.name}(${player.age}세)가 은퇴를 선언했습니다. 동시에 그의 재능을 이어받은 17세 유망주가 유스팀에서 발견되었습니다!`;
                } else {
                    // AI 팀에서 은퇴한 경우, 해당 AI 팀에 바로 추가
                    teams[teamKey].push(reincarnatedPlayer);

                    // AI 프레스티지 시스템에 등록
                    if (!gameData.aiPrestige[teamKey]) {
                        gameData.aiPrestige[teamKey] = [];
                    }
                    gameData.aiPrestige[teamKey].push(reincarnatedPlayer.name);

                    message = `[은퇴/환생] ${teamNames[teamKey]}의 전설적인 선수 ${player.name}(${player.age}세)가 은퇴했습니다. 그의 뒤를 이을 17세 유망주가 팀에 새롭게 등장했습니다.`;
                }
                
                // 5. SNS 알림 생성
                if (typeof snsManager !== 'undefined') {
                    snsManager.posts.unshift({ id: snsManager.postIdCounter++, type: 'transfer_rumor', content: message, hashtags: ['#은퇴', '#환생', `#${snsManager.sanitizeHashtag(player.name)}`], timestamp: Date.now(), likes: Math.floor(Math.random() * 2000) + 500, comments: Math.floor(Math.random() * 300) + 50, shares: Math.floor(Math.random() * 100) + 20 });
                }
                console.log(message);
            }
        }
    });
}

// 전역 함수로 등록
window.saveToSlot = saveToSlot;
window.loadFromSlot = loadFromSlot;
window.deleteSlot = deleteSlot;



// 외부에서 호출할 수 있는 함수들
window.gameData = gameData;
window.allTeams = allTeams; // 추가
window.teams = teams;
window.teamNames = teamNames; // [수정] teamNames 전역 노출 (월드컵 모드 호환성)
// window.teamNames = teamNames; // 삭제 또는 수정
window.generateFullSchedule = generateFullSchedule; // 추가
window.updateDisplay = updateDisplay;
window.setNextOpponent = setNextOpponent;
window.displayTeamPlayers = displayTeamPlayers;
window.updateFormationDisplay = updateFormationDisplay;
window.calculateTeamRating = calculateTeamRating;
window.calculateOpponentTeamRating = calculateOpponentTeamRating;
window.calculateTeamStrengthDifference = calculateTeamStrengthDifference;

// ==================== 오디오 시스템 ====================

class AudioManager {
    constructor() {
        this.bgmFiles = [
            // ❗ 여기에 assets/ost 폴더에 넣은 mp3 파일명을 정확히 입력하세요.
            'assets/ost/[Bonus Track] Always Awake.mp3',
            'assets/ost/Aqua Man.mp3',
            'assets/ost/Bruno Mars - 24K Magic (Audio).mp3',
            'assets/ost/Caesars Palace - Jerk It Out (Official Video).mp3',
            'assets/ost/AEAO.mp3',
            'assets/ost/Glass Animals - Heat Waves (Lyrics).mp3',
            'assets/ost/Imagine Dragons - On Top Of The World (Lyric Video).mp3',
            'assets/ost/John Newman - Love Me Again.mp3',
            'assets/ost/Linkin Park - Battle Symphony [Lyrics].mp3',
            'assets/ost/Mark Ronson - Uptown Funk (Lyrics) ft. Bruno Mars.mp3',
            'assets/ost/MGMT - Kids (Lyrics).mp3',
            'assets/ost/SAINT MOTEL - My Type.mp3',
            'assets/ost/Song 2.mp3',
            'assets/ost/다이나믹 듀오(Dynamic Duo) - BAAAM (Feat. Muzie of UV) (가사_lyrics).mp3',
            'assets/ost/Born Hater.mp3',
            'assets/ost/Business class (Feat. JUSTHIS).mp3',
            'assets/ost/SUPERBEEWHY (Feat. BewhY) (Prod. by BewhY).mp3',
            'assets/ost/Travel Again (Feat. Cautious Clay).mp3',
            'assets/ost/Jay Park (박재범), GRAY (그레이) - _EL TORNADO_ Lyrics (Color Coded Lyrics Han_Rom_Eng_가사) [BAnXszYMGSU].mp3'
        ];
        this.currentTrackIndex = 0;
        this.audio = new Audio();
        this.isPlaying = false;
        this.initialized = false;
        
        // [추가] 플레이리스트 셔플 (랜덤 재생)
        this.shufflePlaylist();
        
        this.createNowPlayingUI(); // UI 생성
    }

    init() {
        if (this.initialized) return;
        
        // [수정] 오디오 객체가 가비지 컬렉션되어 끊기는 현상 방지 (DOM에 추가)
        document.body.appendChild(this.audio);

        // [추가] 에러 발생 시 다음 곡 재생
        this.audio.addEventListener('error', (e) => {
            console.warn("Audio error, playing next:", e);
            setTimeout(() => this.playNext(), 1000);
        });

        this.audio.loop = false;
        // 한 곡이 끝나면 다음 곡 재생
        this.audio.addEventListener('ended', () => this.playNext());
        
        // 초기 설정 적용
        if (typeof gameData !== 'undefined' && gameData.settings) {
            this.applySettings(gameData.settings);
        }
        
        this.initialized = true;
    }
    
    // [추가] 셔플 메서드
    shufflePlaylist() {
        for (let i = this.bgmFiles.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [this.bgmFiles[i], this.bgmFiles[j]] = [this.bgmFiles[j], this.bgmFiles[i]];
        }
        console.log("🔀 BGM 플레이리스트가 셔플되었습니다.");
    }
    
    applySettings(settings) {
        if (!settings) return;
        
        const isMuted = settings.bgm === false; // bgm: true가 켜짐
        const volume = (settings.bgmVolume !== undefined ? settings.bgmVolume : 50) / 100;
        
        this.audio.muted = isMuted;
        this.audio.volume = volume;
        
        if (!isMuted && !this.isPlaying && this.initialized) {
            this.play();
        } else if (isMuted && this.isPlaying) {
            this.pause();
        }
    }

    play() {
        if (this.bgmFiles.length === 0) return;
        if (this.audio.muted) return;

        // 소스가 없으면 설정
        if (!this.audio.src) {
            this.audio.src = this.bgmFiles[this.currentTrackIndex];
        }
        
        const playPromise = this.audio.play();
        if (playPromise !== undefined) {
            playPromise.then(() => {
                this.isPlaying = true;
                // 현재 재생 중인 곡 정보 표시
                this.showNowPlaying(this.bgmFiles[this.currentTrackIndex]);
            }).catch(error => {
                console.log("Audio play prevented (브라우저 정책):", error);
                this.isPlaying = false;
            });
        }
    }

    pause() {
        this.audio.pause();
        this.isPlaying = false;
    }

    playNext() {
        // [수정] 순차 재생 (마지막 곡이면 다시 처음으로)
        this.currentTrackIndex++;
        if (this.currentTrackIndex >= this.bgmFiles.length) {
            this.currentTrackIndex = 0;
        }
        
        this.audio.src = this.bgmFiles[this.currentTrackIndex];
        this.play();
    }
    
    setVolume(value) {
        // value: 0 ~ 100
        const normalizedVolume = value / 100;
        this.audio.volume = normalizedVolume;
        if (gameData.settings) {
            gameData.settings.bgmVolume = value;
        }
    }
    
    toggleBgm(isOn) {
        this.audio.muted = !isOn;
        if (gameData.settings) {
            gameData.settings.bgm = isOn;
        }
        
        if (isOn) {
            this.play();
        } else {
            this.pause();
        }
    }

    createNowPlayingUI() {
        if (document.getElementById('nowPlayingContainer')) return;

        const container = document.createElement('div');
        container.id = 'nowPlayingContainer';
        container.style.cssText = `
            position: fixed;
            top: 20px;
            right: 20px;
            background: rgba(0, 0, 0, 0.7);
            color: #fff;
            padding: 12px 20px;
            border-radius: 30px;
            z-index: 10000;
            display: none;
            align-items: center;
            gap: 10px;
            font-size: 0.95rem;
            font-weight: 500;
            backdrop-filter: blur(5px);
            border: 1px solid rgba(255, 255, 255, 0.15);
            box-shadow: 0 4px 15px rgba(0,0,0,0.3);
            transition: opacity 0.5s ease, transform 0.5s ease;
            opacity: 0;
            transform: translateY(-20px);
            pointer-events: none;
        `;
        
        const text = document.createElement('span');
        text.id = 'nowPlayingText';
        
        container.appendChild(text);
        document.body.appendChild(container);
        this.nowPlayingElement = container;
        this.nowPlayingText = text;
    }

    showNowPlaying(filename) {
        if (!this.nowPlayingElement) return;
        
        let cleanName = filename.split('/').pop().replace('.mp3', '');
        
        // 불필요한 태그 제거 및 정리
        cleanName = cleanName
            .replace(/\(Lyrics\)/gi, '')
            .replace(/\(Official Video\)/gi, '')
            .replace(/\(Lyric Video\)/gi, '')
            .replace(/\(Audio\)/gi, '')
            .replace(/\[Lyrics\]/gi, '')
            .replace(/\(가사_lyrics\)/gi, '')
            .replace(/\| Lyrics_가사/gi, '')
            .trim();

        // 하이픈 포맷팅 (띄어쓰기 추가)
        if (cleanName.includes('-') && !cleanName.includes(' - ')) {
             cleanName = cleanName.replace('-', ' - ');
        }

        this.nowPlayingText.textContent = `🎵 ${cleanName}`;
        
        // 표시 애니메이션
        this.nowPlayingElement.style.display = 'flex';
        void this.nowPlayingElement.offsetWidth; // reflow 강제
        
        this.nowPlayingElement.style.opacity = '1';
        this.nowPlayingElement.style.transform = 'translateY(0)';
        
        if (this.hideTimeout) clearTimeout(this.hideTimeout);
        this.hideTimeout = setTimeout(() => {
            this.nowPlayingElement.style.opacity = '0';
            this.nowPlayingElement.style.transform = 'translateY(-20px)';
            setTimeout(() => {
                if (this.nowPlayingElement.style.opacity === '0') {
                    this.nowPlayingElement.style.display = 'none';
                }
            }, 500);
        }, 5000); // 5초간 표시
    }
}

const audioManager = new AudioManager();
window.audioManager = audioManager;

// 설정 탭에 오디오 설정 UI 렌더링
function renderAudioSettings() {
    const settingsTab = document.getElementById('settings');
    if (!settingsTab) return;
    
    let audioContainer = document.getElementById('audioSettings');
    if (!audioContainer) {
        audioContainer = document.createElement('div');
        audioContainer.id = 'audioSettings';
        audioContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        // 설정 콘텐츠 영역(.settings-content)의 맨 위에 추가
        const settingsContent = settingsTab.querySelector('.settings-content');
        if (settingsContent) {
            settingsContent.insertBefore(audioContainer, settingsContent.firstChild);
        } else {
            settingsTab.appendChild(audioContainer);
        }
    }
    
    const isBgmOn = gameData.settings ? gameData.settings.bgm !== false : true;
    const volume = gameData.settings && gameData.settings.bgmVolume !== undefined ? gameData.settings.bgmVolume : 50;
    const isImmersionOn = gameData.settings ? gameData.settings.immersionMode !== false : true; // 기본값 ON
    
    audioContainer.innerHTML = `
        <h4 style="color: #ffd700; margin-top: 0; margin-bottom: 15px;">🎵 배경음악 설정</h4>
        <div style="display: flex; align-items: center; gap: 20px; margin-bottom: 15px;">
            <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                <input type="checkbox" id="bgmToggle" ${isBgmOn ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
            </label>
            <span id="bgmStatusText">배경음악 ${isBgmOn ? 'ON' : 'OFF'}</span>
        </div>
        <div style="display: flex; align-items: center; gap: 10px;">
            <span>볼륨:</span>
            <input type="range" id="bgmVolume" min="0" max="100" value="${volume}" style="flex-grow: 1; cursor: pointer;">
            <span id="volumeValue" style="width: 40px; text-align: right;">${volume}%</span>
        </div>
        <h4 style="color: #ffd700; margin-top: 20px; margin-bottom: 15px;">⚡ 경기 연출 설정</h4>
        <div style="display: flex; align-items: center; gap: 20px;">
            <label class="switch" style="position: relative; display: inline-block; width: 50px; height: 24px;">
                <input type="checkbox" id="immersionToggle" ${isImmersionOn ? 'checked' : ''} style="opacity: 0; width: 0; height: 0;">
                <span class="slider round" style="position: absolute; cursor: pointer; top: 0; left: 0; right: 0; bottom: 0; background-color: #ccc; transition: .4s; border-radius: 34px;"></span>
            </label>
            <span id="immersionStatusText">몰입감 모드 ${isImmersionOn ? 'ON' : 'OFF'}</span>
        </div>
    `;
    
    // CSS 추가 (슬라이더 스타일)
    const style = document.createElement('style');
    style.textContent = `
        .switch input:checked + .slider { background-color: #2ecc71; }
        .switch input:focus + .slider { box-shadow: 0 0 1px #2ecc71; }
        .switch .slider:before {
            position: absolute; content: ""; height: 16px; width: 16px; left: 4px; bottom: 4px;
            background-color: white; transition: .4s; border-radius: 50%;
        }
        .switch input:checked + .slider:before { transform: translateX(26px); }
    `;
    if (!document.getElementById('audioStyles')) {
        style.id = 'audioStyles';
        document.head.appendChild(style);
    }
    
    // 이벤트 리스너
    const bgmToggle = document.getElementById('bgmToggle');
    const bgmVolume = document.getElementById('bgmVolume');
    const volumeValue = document.getElementById('volumeValue');
    const bgmStatusText = document.getElementById('bgmStatusText');
    const immersionToggle = document.getElementById('immersionToggle');
    const immersionStatusText = document.getElementById('immersionStatusText');
    
    bgmToggle.addEventListener('change', (e) => {
        const isOn = e.target.checked;
        audioManager.toggleBgm(isOn);
        bgmStatusText.textContent = `배경음악 ${isOn ? 'ON' : 'OFF'}`;
    });
    
    bgmVolume.addEventListener('input', (e) => {
        const val = parseInt(e.target.value);
        volumeValue.textContent = `${val}%`;
        audioManager.setVolume(val);
    });

    immersionToggle.addEventListener('change', (e) => {
        const isOn = e.target.checked;
        if (!gameData.settings) gameData.settings = {};
        gameData.settings.immersionMode = isOn;
        immersionStatusText.textContent = `몰입감 모드 ${isOn ? 'ON' : 'OFF'}`;
    });
}
window.renderAudioSettings = renderAudioSettings;

// 일반 설정 UI 렌더링
function renderGeneralSettings() {
    const settingsTab = document.getElementById('settings');
    if (!settingsTab) return;
    
    let generalContainer = document.getElementById('generalSettings');
    if (!generalContainer) {
        generalContainer = document.createElement('div');
        generalContainer.id = 'generalSettings';
        generalContainer.style.cssText = `
            background: rgba(0, 0, 0, 0.3);
            border-radius: 10px;
            padding: 15px;
            margin-bottom: 20px;
            border: 1px solid rgba(255, 255, 255, 0.1);
        `;
        
        const settingsContent = settingsTab.querySelector('.settings-content');
        if (settingsContent) {
            const audioSettings = document.getElementById('audioSettings');
            if (audioSettings && audioSettings.parentNode === settingsContent) {
                settingsContent.insertBefore(generalContainer, audioSettings.nextSibling);
            } else {
                settingsContent.insertBefore(generalContainer, settingsContent.firstChild);
            }
        } else {
            settingsTab.appendChild(generalContainer);
        }
    }
    
    generalContainer.innerHTML = `
        <h4 style="color: #ffd700; margin-top: 0; margin-bottom: 15px;">⚙️ 일반 설정</h4>
        <button class="btn" id="replayTutorialBtn" style="width: 100%; margin-bottom: 10px;">튜토리얼 다시 보기</button>
        <button class="btn" onclick="openDatabaseModal()" style="width: 100%; background: linear-gradient(45deg, #3498db, #2980b9);">📚 데이터베이스 열람</button>
    `;
    
    document.getElementById('replayTutorialBtn').addEventListener('click', () => {
        if (window.tutorialSystem) {
            window.tutorialSystem.currentStep = 0;
            window.tutorialSystem.showTutorial();
        } else {
            alert('튜토리얼을 실행할 수 없습니다.');
        }
    });
}
window.renderGeneralSettings = renderGeneralSettings;

// [신규] 비서 설정 UI 렌더링
function renderSecretarySettings() {
    const settingsTab = document.getElementById('settings');
    if (!settingsTab) return;
    
    let secContainer = document.getElementById('secretarySettings');
    if (!secContainer) {
        secContainer = document.createElement('div');
        secContainer.id = 'secretarySettings';
        secContainer.className = 'settings-section';
        
        // 일반 설정 다음에 추가
        const generalSettings = document.getElementById('generalSettings');
        if (generalSettings) {
            generalSettings.parentNode.insertBefore(secContainer, generalSettings.nextSibling);
        } else {
            settingsTab.appendChild(secContainer);
        }
    }
    
    secContainer.innerHTML = `
        <h4>👩‍💼 비서 설정</h4>
        <div style="display: flex; gap: 10px; align-items: center;">
            <label>비서 이름:</label>
            <input type="text" id="secretaryNameInput" value="${gameData.secretaryName || '김지수'}" style="padding: 5px; width: 100px; background: #333; color: white; border: 1px solid #555;">
            <button class="btn" onclick="gameData.secretaryName = document.getElementById('secretaryNameInput').value; alert('비서 이름이 변경되었습니다.');">변경</button>
        </div>
    `;
}
window.renderSecretarySettings = renderSecretarySettings;

// [신규] 자동 스크롤 시스템 (경기 화면 전용, 조건 없음)
window.AutoScrollSystem = {
    scrollSpeed: 2.0,
    isPaused: false, // [추가] 일시 정지 플래그
    resumeTimer: null, // [추가] 재개 타이머

    init() {
        // [추가] 사용자 상호작용 감지 (휠, 터치, 키보드, 마우스 클릭)
        const events = ['wheel', 'touchmove', 'touchstart', 'keydown', 'mousedown'];
        events.forEach(eventType => {
            window.addEventListener(eventType, () => this.onUserInteraction(), { passive: true });
        });

        this.animate();
    },

    // [추가] 사용자 조작 시 호출
    onUserInteraction() {
        const matchScreen = document.getElementById('matchScreen');
        if (!matchScreen || !matchScreen.classList.contains('active')) return;

        this.isPaused = true; // 스크롤 멈춤

        if (this.resumeTimer) clearTimeout(this.resumeTimer);

        // 2초 뒤 다시 시작
        this.resumeTimer = setTimeout(() => {
            this.isPaused = false;
        }, 2000);
    },

    animate() {
        const matchScreen = document.getElementById('matchScreen');
        const eventList = document.getElementById('eventList');
        
        // 경기 화면이 활성화되어 있고 eventList가 존재하며, 일시 정지 상태가 아닐 때만 스크롤
        if (matchScreen && matchScreen.classList.contains('active') && eventList && !this.isPaused) {
            // [수정] 스크롤바가 어디에 생길지 모르므로 리스트와 부모 요소 모두 스크롤 시도
            eventList.scrollTop += this.scrollSpeed;
            if (eventList.parentElement) {
                eventList.parentElement.scrollTop += this.scrollSpeed;
            }
        }

        requestAnimationFrame(() => this.animate());
    }
};

// [신규] 데이터베이스 열람 시스템
function openDatabaseModal() {
    let modal = document.getElementById('databaseModal');
    if (!modal) {
        modal = document.createElement('div');
        modal.id = 'databaseModal';
        modal.className = 'modal';
        modal.style.zIndex = '9999'; // 최상위
        modal.innerHTML = `
            <div class="modal-content" style="max-width: 800px; height: 80vh; display: flex; flex-direction: column; background: #2c3e50; color: white;">
                <span class="close" onclick="document.getElementById('databaseModal').style.display='none'" style="color: white; align-self: flex-end; cursor: pointer; font-size: 28px;">&times;</span>
                <h3 id="dbModalTitle" style="text-align: center; color: #ffd700; margin-bottom: 20px; margin-top: 0;">데이터베이스</h3>
                <div id="dbModalContent" style="flex: 1; overflow-y: auto; padding: 10px;"></div>
                <div id="dbModalControls" style="margin-top: 15px; text-align: center; padding-top: 10px; border-top: 1px solid rgba(255,255,255,0.1);">
                    <button id="dbBackBtn" class="btn" style="display: none; background: #7f8c8d;">⬅️ 뒤로가기</button>
                </div>
            </div>
        `;
        document.body.appendChild(modal);
        
        // 뒤로가기 버튼 이벤트
        document.getElementById('dbBackBtn').addEventListener('click', () => {
            const currentView = modal.dataset.view;
            if (currentView === 'teams') {
                renderDatabaseLeagues();
            } else if (currentView === 'players') {
                const currentLeague = modal.dataset.league;
                renderDatabaseTeams(currentLeague);
            }
        });

        // 모달 바깥 클릭 시 닫기
        window.addEventListener('click', (e) => {
            if (e.target === modal) {
                modal.style.display = 'none';
            }
        });
    }
    
    modal.style.display = 'block';
    renderDatabaseLeagues();
}

function renderDatabaseLeagues() {
    const modal = document.getElementById('databaseModal');
    const content = document.getElementById('dbModalContent');
    const backBtn = document.getElementById('dbBackBtn');
    const title = document.getElementById('dbModalTitle');
    
    modal.dataset.view = 'leagues';
    backBtn.style.display = 'none';
    title.textContent = '리그 선택';
    
    content.innerHTML = `
        <div style="display: grid; gap: 15px;">
            <button class="btn" onclick="renderDatabaseTeams(1)" style="padding: 20px; font-size: 1.2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">🏆 1부 리그</button>
            <button class="btn" onclick="renderDatabaseTeams(2)" style="padding: 20px; font-size: 1.2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">⚽ 2부 리그</button>
            <button class="btn" onclick="renderDatabaseTeams(3)" style="padding: 20px; font-size: 1.2rem; background: rgba(255,255,255,0.1); border: 1px solid rgba(255,255,255,0.2);">🌟 3부 리그</button>
        </div>
    `;
}

function renderDatabaseTeams(league) {
    const modal = document.getElementById('databaseModal');
    const content = document.getElementById('dbModalContent');
    const backBtn = document.getElementById('dbBackBtn');
    const title = document.getElementById('dbModalTitle');
    
    modal.dataset.view = 'teams';
    modal.dataset.league = league;
    backBtn.style.display = 'inline-block';
    title.textContent = `${league}부 리그 팀 목록`;
    
    const leagueTeams = Object.keys(allTeams).filter(key => allTeams[key].league == league);
    
    let html = '<div style="display: grid; grid-template-columns: repeat(auto-fill, minmax(180px, 1fr)); gap: 15px;">';
    leagueTeams.forEach(teamKey => {
        const teamName = teamNames[teamKey] || teamKey;
        const currentPlayers = teams[teamKey] ? teams[teamKey].length : allTeams[teamKey].players.length;
        html += `
            <div onclick="renderDatabasePlayers('${teamKey}')" style="background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; cursor: pointer; text-align: center; transition: background 0.2s; border: 1px solid rgba(255,255,255,0.1);">
                <div style="font-weight: bold; font-size: 1.1rem; margin-bottom: 5px; color: #fff;">${teamName}</div>
                <div style="font-size: 0.9rem; color: #aaa;">선수 ${currentPlayers}명</div>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

function renderDatabasePlayers(teamKey) {
    const modal = document.getElementById('databaseModal');
    const content = document.getElementById('dbModalContent');
    const backBtn = document.getElementById('dbBackBtn');
    const title = document.getElementById('dbModalTitle');
    
    modal.dataset.view = 'players';
    backBtn.style.display = 'inline-block';
    const teamName = teamNames[teamKey] || teamKey;
    title.textContent = `${teamName} 선수 명단`;
    
    const players = teams[teamKey] || allTeams[teamKey].players;
    const posOrder = { 'GK': 1, 'DF': 2, 'MF': 3, 'FW': 4 };
    const sortedPlayers = [...players].sort((a, b) => (posOrder[a.position] || 5) - (posOrder[b.position] || 5) || b.rating - a.rating);
    
    let html = '<div style="display: flex; flex-direction: column; gap: 10px;">';
    sortedPlayers.forEach(player => {
        let stats = { goals: 0, assists: 0, matches: 0, moms: 0 };
        if (typeof leagueBasedRecordsSystem !== 'undefined' && leagueBasedRecordsSystem.playerStats.has(player.name)) {
            const record = leagueBasedRecordsSystem.playerStats.get(player.name);
            if (record.team === teamKey) stats = record;
        }
        let posColor = player.position === 'FW' ? '#e74c3c' : player.position === 'MF' ? '#2ecc71' : player.position === 'DF' ? '#3498db' : '#f1c40f';
        html += `
            <div style="background: rgba(0,0,0,0.3); padding: 15px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center; border-left: 4px solid ${posColor};">
                <div style="flex: 1;">
                    <div style="font-weight: bold; font-size: 1.1rem; display: flex; align-items: center; gap: 8px;">
                        <span style="color: ${posColor}; font-size: 0.9rem; background: rgba(255,255,255,0.1); padding: 2px 6px; border-radius: 4px;">${player.position}</span>
                        ${player.name}
                    </div>
                    <div style="font-size: 0.85rem; color: #ccc; margin-top: 6px;">
                        ${player.country || '국적 미상'} | ${player.age}세 | 오버롤 <span style="color: #ffd700; font-weight: bold;">${Math.floor(player.rating)}</span>
                    </div>
                </div>
                <div style="text-align: right; font-size: 0.85rem; color: #ddd; min-width: 100px;">
                    <div style="margin-bottom: 2px;">🏟️ 경기: ${stats.matches}</div>
                    <div style="margin-bottom: 2px;">⚽ 골: ${stats.goals}</div>
                    <div style="margin-bottom: 2px;">👟 도움: ${stats.assists}</div>
                    <div>⭐ MOM: ${stats.moms}</div>
                </div>
            </div>
        `;
    });
    html += '</div>';
    content.innerHTML = html;
}

// 전역 노출
window.openDatabaseModal = openDatabaseModal;
window.renderDatabaseTeams = renderDatabaseTeams;
window.renderDatabasePlayers = renderDatabasePlayers;
