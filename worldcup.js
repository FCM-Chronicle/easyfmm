// c:\Users\jinuj\vsc\easyfmm\worldcup.js

const WorldCupManager = {
    wcPlayers: {}, // 월드컵 참가 선수 데이터
    nationalPools: {}, // 해당 국가의 전체 가용 선수 풀 (Real + Virtual)
    groups: {},    // 조 편성 데이터
    userTeam: null, // 유저가 선택한 팀
    tournamentBracket: [], // 토너먼트 대진표 데이터
    currentStage: 'group', // group, r32, r16, qf, sf, final
    isEliminated: false, // 유저 탈락 여부

    // [수정] 언어권별 이름 데이터베이스 (한글 표기)
    // 주요 국가(한국, 잉글랜드, 스페인, 독일, 이탈리아, 네덜란드)는 제외됨
    nameDatabase: {
        "Latin": { // 남미, 포르투갈, 기타 라틴어권
            first: ["안토니오", "호세", "마누엘", "프란시스코", "다비드", "후안", "하비에르", "다니엘", "카를로스", "헤수스", "루이스", "디에고", "가브리엘", "루카스", "마르코", "파울로", "페드로", "미겔", "앙헬"],
            last: ["가르시아", "곤잘레스", "로드리게스", "페르난데스", "로페즈", "마르티네즈", "산체스", "페레즈", "고메즈", "마틴", "실바", "산토스", "올리베이라", "수자", "페레이라", "코스타", "카르발류"]
        },
        "Germanic": { // 북유럽, 오스트리아, 스위스 등
            first: ["한스", "클라우스", "루카스", "얀", "피터", "에릭", "마그누스", "스벤", "올레", "칼", "토마스", "미카엘", "안드레아스", "마르틴", "요나스", "크리스티안"],
            last: ["뮐러", "슈미트", "슈나이더", "피셔", "베버", "마이어", "바그너", "베커", "한센", "요한센", "닐슨", "옌센", "안데르센", "라르손"]
        },
        "FrenchAfrican": { // 프랑스어권 아프리카, 벨기에 등
            first: ["장", "피에르", "미셸", "필립", "알랭", "루이", "마마두", "이브라힘", "모하메드", "알리", "오마르", "세이두", "무사", "아다마", "바카리"],
            last: ["마르탱", "베르나르", "토마", "프티", "로베르", "리샤르", "뒤랑", "뒤부아", "트라오레", "카마라", "디알로", "케이타", "시소코", "코네", "쿨리발리"]
        },
        "EasternEurope": { // 동유럽 (크로아티아, 세르비아, 폴란드 등)
            first: ["이반", "루카", "마르코", "니콜라", "다비드", "필립", "알렉산다르", "세르게이", "블라디미르", "안드레이", "드미트리", "로베르트", "도미니크", "마테오"],
            last: ["페트로비치", "이바노비치", "요바노비치", "코바치", "호르바트", "노바크", "스토야노비치", "포포비치", "디미트로프", "레반도프스키", "모드리치", "블라호비치"]
        },
        "MiddleEast": { // 중동 (사우디, 이란, 카타르 등)
            first: ["모하메드", "아흐메드", "알리", "하산", "후세인", "이브라힘", "오마르", "유세프", "압둘라", "칼리드", "살렘", "나세르", "파하드"],
            last: ["알리", "모하메드", "아흐메드", "하산", "이브라힘", "살라", "마흐무드", "사이드", "압델", "라만", "알도사리", "알셰흐리"]
        },
        "Japanese": { // 일본
            first: ["타쿠미", "쇼타", "켄타", "다이키", "유우키", "나오키", "료", "카이토", "타츠야", "카오루", "타케후사", "히로키", "아오", "리츠", "코이타쿠"],
            last: ["사토", "스즈키", "타카하시", "타나카", "와타나베", "이토", "야마모토", "나카무라", "코바야시", "카토", "미토마", "쿠보", "토미야스", "엔도", "카마다"]
        },
        "Chinese": { // 중국
            first: ["웨이", "하오", "레이", "양", "펑", "보", "린", "지에", "타오", "민", "준", "롱", "시", "카이"],
            last: ["리", "왕", "장", "류", "첸", "양", "자오", "황", "주", "우", "가오", "마", "궈"]
        },
        "English": { // 미국, 호주, 캐나다 등 (잉글랜드 제외)
            first: ["제임스", "존", "로버트", "마이클", "윌리엄", "데이비드", "리차드", "조셉", "토마스", "찰스", "해리", "올리버", "잭", "노아", "조지", "카일"],
            last: ["스미스", "존슨", "윌리엄스", "브라운", "존스", "밀러", "데이비스", "가르시아", "로드리게스", "윌슨", "워커", "케인", "벨링엄", "포든", "라이스"]
        }
    },
    
    // 월드컵 조 편성 데이터 (12개 조)
    groupDefinitions: {
        A: ["멕시코", "남아공", "대한민국", "PO_EU_D"],
        B: ["캐나다", "PO_EU_A", "카타르", "스위스"],
        C: ["브라질", "모로코", "아이티", "스코틀랜드"],
        D: ["미국", "파라과이", "호주", "PO_EU_C"],
        E: ["독일", "퀴라소", "코트디부아르", "에콰도르"],
        F: ["네덜란드", "일본", "PO_EU_B", "튀니지"],
        G: ["벨기에", "이집트", "이란", "뉴질랜드"],
        H: ["스페인", "카보베르데", "사우디아라비아", "우루과이"],
        I: ["프랑스", "세네갈", "PO_IC_2", "노르웨이"],
        J: ["아르헨티나", "알제리", "오스트리아", "요르단"],
        K: ["포르투갈", "PO_IC_1", "우즈베키스탄", "콜롬비아"],
        L: ["잉글랜드", "크로아티아", "가나", "파나마"]
    },

    // 플레이오프(PO) 후보군
    poCandidates: {
        "PO_EU_D": ["체코", "덴마크"],
        "PO_EU_A": ["이탈리아", "웨일스"],
        "PO_EU_C": ["튀르키예", "루마니아"],
        "PO_EU_B": ["우크라이나", "폴란드"],
        "PO_IC_2": ["이라크", "볼리비아"],
        "PO_IC_1": ["코스타리카", "아랍에미리트"]
    },

    init() {
        this.createWorldCupButton();
    },

    createWorldCupButton() {
        if (document.getElementById('worldCupBtn')) return; // 중복 방지

        const btn = document.createElement('button');
        btn.id = 'worldCupBtn';
        btn.className = 'btn';
        btn.innerHTML = '🏆 월드컵 모드';
        btn.style.cssText = `position: fixed; top: 20px; left: 20px; z-index: 100000; background: linear-gradient(45deg, #e74c3c, #c0392b); color: white; padding: 10px 20px; border: none; border-radius: 5px; box-shadow: 0 4px 15px rgba(0,0,0,0.3); cursor: pointer; font-weight: bold;`;
        btn.onclick = () => this.openWorldCupMenu();
        document.body.appendChild(btn);
    },

    openWorldCupMenu() {
        let modal = document.getElementById('wcModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'wcModal';
            modal.className = 'modal';
            modal.style.zIndex = '10000';
            modal.innerHTML = `
                <div class="modal-content" style="background: #2c3e50; color: white; max-width: 600px;">
                    <span class="close" onclick="document.getElementById('wcModal').style.display='none'">&times;</span>
                    <h2 style="color: #ffd700; text-align: center;">🏆 FIFA 월드컵 모드</h2>
                    <p style="text-align: center; margin-bottom: 20px;">48개국이 펼치는 세계 최고의 축제!</p>
                    <div style="display: flex; flex-direction: column; gap: 10px;">
                        <button class="btn primary" onclick="WorldCupManager.startNewWorldCup()">새 월드컵 시작</button>
                        <hr style="border: 0; border-top: 1px solid rgba(255,255,255,0.1); width: 100%; margin: 10px 0;">
                        <h4 style="margin: 0;">불러오기 (월드컵 전용 슬롯)</h4>
                        <div id="wcSaveSlots"></div>
                    </div>
                </div>`;
            document.body.appendChild(modal);
        }
        this.renderSaveSlots();
        modal.style.display = 'block';
    },

    renderSaveSlots() {
        const container = document.getElementById('wcSaveSlots');
        container.innerHTML = '';
        for (let i = 1; i <= 3; i++) {
            const slotData = localStorage.getItem(`worldcup_save_${i}`);
            const info = slotData ? JSON.parse(slotData).timestamp : null;
            const dateStr = info ? new Date(info).toLocaleString() : '비어있음';
            const slotBtn = document.createElement('div');
            slotBtn.style.cssText = `background: rgba(255,255,255,0.1); padding: 10px; margin-bottom: 5px; border-radius: 5px; display: flex; justify-content: space-between; align-items: center;`;
            slotBtn.innerHTML = `<span>슬롯 ${i} <small style="color: #aaa;">(${dateStr})</small></span><div style="display: flex; gap: 5px;">${slotData ? `<button class="btn" onclick="WorldCupManager.loadWorldCup(${i})" style="padding: 5px 10px; font-size: 0.8rem;">로드</button>` : ''}${slotData ? `<button class="btn" onclick="WorldCupManager.deleteWorldCup(${i})" style="padding: 5px 10px; font-size: 0.8rem; background: #c0392b;">삭제</button>` : ''}</div>`;
            container.appendChild(slotBtn);
        }
    },

    startNewWorldCup() {
        if (!confirm('새로운 월드컵을 시작하시겠습니까?')) return;
        this.generateWorldCupData();
        this.setupGroups();
        this.saveWorldCup(1);
        document.getElementById('wcModal').style.display = 'none';
        this.showGroupStageUI();
    },

    generateWorldCupData() {
        this.wcPlayers = {}; // 최종 스쿼드 (25인)
        this.nationalPools = {}; // 전체 선수 풀 (차출용)
        const countries = {};

        // 1. 기존 allTeams에서 국적별로 선수 분류 (아이콘 제외) - teamNames가 필요하므로 함께 확인
        if (typeof allTeams !== 'undefined') {
            Object.values(allTeams).forEach(team => {
                team.players.forEach(p => {
                    // [수정] 레전드 선수(isIcon) 제외
                    if (p.isIcon) return;

                    if (p.country && p.country !== "국적 미상") {
                        if (!countries[p.country]) countries[p.country] = [];
                        countries[p.country].push({ ...p, originalClub: teamNames[team] || team });
                    }
                });
            });
        }

        // 2. 월드컵 참가국 목록 확정
        const participatingCountries = new Set();
        Object.values(this.groupDefinitions).forEach(group => {
            group.forEach(teamName => {
                if (this.poCandidates[teamName]) {
                    this.poCandidates[teamName].forEach(c => participatingCountries.add(c));
                } else {
                    participatingCountries.add(teamName);
                }
            });
        });

        // 3. 각 국가별 스쿼드 구성 (25인)
        participatingCountries.forEach(country => {
            let realPlayers = countries[country] || [];
            
            // 포지션별 분류 및 정렬
            const gks = realPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
            const dfs = realPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
            const mfs = realPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
            const fws = realPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);

            const squad = [];
            const pool = [...realPlayers]; // 전체 풀

            // 필수 인원 선발 (GK 3, DF 6, MF 6, FW 6)
            const selectTop = (list, count) => {
                const selected = list.slice(0, count);
                squad.push(...selected);
                return selected;
            };

            const selectedGKs = selectTop(gks, 3);
            const selectedDFs = selectTop(dfs, 6);
            const selectedMFs = selectTop(mfs, 6);
            const selectedFWs = selectTop(fws, 6);

            // 부족한 인원 가상 선수로 채우기
            const fillVirtual = (pos, currentCount, targetCount) => {
                for (let i = currentCount; i < targetCount; i++) {
                    const vp = this.createVirtualPlayer(country, pos);
                    squad.push(vp);
                    pool.push(vp); // 풀에도 추가
                }
            };

            fillVirtual('GK', selectedGKs.length, 3);
            fillVirtual('DF', selectedDFs.length, 6);
            fillVirtual('MF', selectedMFs.length, 6);
            fillVirtual('FW', selectedFWs.length, 6);

            // 와일드카드 4명 (남은 선수 중 오버롤 높은 순)
            const selectedNames = new Set(squad.map(p => p.name));
            const remaining = pool.filter(p => !selectedNames.has(p.name)).sort((a, b) => b.rating - a.rating);
            
            const wildcards = remaining.slice(0, 4);
            squad.push(...wildcards);

            // 와일드카드도 부족하면 가상 선수 (포지션 균형)
            if (wildcards.length < 4) {
                const needed = 4 - wildcards.length;
                for (let i = 0; i < needed; i++) {
                    const pos = ['DF', 'MF', 'FW'][i % 3];
                    const vp = this.createVirtualPlayer(country, pos);
                    squad.push(vp);
                    pool.push(vp);
                }
            }

            this.wcPlayers[country] = squad;
            this.nationalPools[country] = pool;
        });
    },

    createVirtualPlayer(country, fixedPos = null) {
        // 언어권 기반 이름 생성 로직
        let region = "English"; // 기본값 (미국, 호주 등)

        if (["스페인", "포르투갈", "브라질", "아르헨티나", "멕시코", "콜롬비아", "우루과이", "파라과이", "칠레", "에콰도르", "볼리비아", "페루", "베네수엘라", "코스타리카", "파나마", "쿠바", "온두라스"].includes(country)) region = "Latin";
        else if (["프랑스", "벨기에", "세네갈", "카메룬", "코트디부아르", "모로코", "알제리", "튀니지", "가나", "나이지리아", "부르키나파소", "말리", "기니", "콩고"].includes(country)) region = "FrenchAfrican";
        else if (["독일", "오스트리아", "스위스", "네덜란드", "덴마크", "스웨덴", "노르웨이", "아이슬란드"].includes(country)) region = "Germanic";
        else if (["크로아티아", "세르비아", "폴란드", "우크라이나", "러시아", "체코", "슬로바키아", "헝가리", "루마니아", "불가리아", "보스니아", "슬로베니아"].includes(country)) region = "EasternEurope";
        else if (["사우디아라비아", "이란", "카타르", "UAE", "이라크", "요르단", "이집트"].includes(country)) region = "MiddleEast";
        else if (["일본"].includes(country)) region = "Japanese";
        else if (["중국", "북한", "베트남", "태국"].includes(country)) region = "Chinese";

        // 한국, 잉글랜드, 이탈리아 등은 DB에 충분하므로 가상 생성 시에는 기본값이나 근접한 지역 사용
        // (실제로는 DB가 충분하면 이 함수가 호출될 일이 거의 없음)

        const nameSet = this.nameDatabase[region] || this.nameDatabase["English"];
        const first = nameSet.first[Math.floor(Math.random() * nameSet.first.length)];
        const last = nameSet.last[Math.floor(Math.random() * nameSet.last.length)];
        
        // 동양권은 성+이름, 그 외는 이름+성
        const name = ["대한민국", "일본", "중국", "북한"].includes(country) ? `${last}${first}` : `${first} ${last}`;
        
        const positions = ['GK', 'DF', 'MF', 'FW'];
        const position = fixedPos || positions[Math.floor(Math.random() * positions.length)];
        const rating = Math.floor(Math.random() * 16) + 70;
        const age = Math.floor(Math.random() * 15) + 18;

        return { name, position, country, age, rating, isVirtual: true, originalClub: "FA" };
    },

    setupGroups() {
        this.groups = {};
        Object.keys(this.groupDefinitions).forEach(groupName => {
            const rawTeams = this.groupDefinitions[groupName];
            const resolvedTeams = rawTeams.map(team => {
                if (this.poCandidates[team]) {
                    const candidates = this.poCandidates[team];
                    return candidates[Math.floor(Math.random() * candidates.length)];
                }
                return team;
            });
            this.groups[groupName] = resolvedTeams;
        });
    },

    showGroupStageUI() {
        let modal = document.getElementById('wcGroupsModal');
        if (!modal) {
            modal = document.createElement('div');
            modal.id = 'wcGroupsModal';
            modal.className = 'modal';
            modal.style.zIndex = '10001';
            modal.innerHTML = `
                <div class="modal-content" style="background: #2c3e50; color: white; max-width: 900px; max-height: 90vh; overflow-y: auto;">
                    <span class="close" onclick="document.getElementById('wcGroupsModal').style.display='none'">&times;</span>
                    <h2 style="color: #ffd700; text-align: center;">🏆 조별리그 대진표</h2>
                    <p style="text-align: center; font-size: 1.1rem; color: #2ecc71; margin-bottom: 20px;">▼ 감독을 맡을 국가대표팀을 클릭하세요! ▼</p>
                    <div id="wcGroupsContainer" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 15px; margin-top: 20px;"></div>
                </div>`;
            document.body.appendChild(modal);
        }
        const container = document.getElementById('wcGroupsContainer');
        container.innerHTML = '';
        Object.keys(this.groups).forEach(groupName => {
            const teams = this.groups[groupName];
            const groupDiv = document.createElement('div');
            groupDiv.style.cssText = `background: rgba(255,255,255,0.1); padding: 15px; border-radius: 10px; border: 1px solid rgba(255,255,255,0.2);`;
            let teamsHtml = teams.map(t => `
                <div onclick="WorldCupManager.selectTeam('${t}')" 
                     style="padding: 8px; margin: 5px 0; border-radius: 5px; background: rgba(0,0,0,0.3); cursor: pointer; transition: all 0.2s; text-align: center; border: 1px solid transparent;"
                     onmouseover="this.style.background='#2980b9'; this.style.borderColor='#3498db';"
                     onmouseout="this.style.background='rgba(0,0,0,0.3)'; this.style.borderColor='transparent';">
                    ${t}
                </div>`).join('');
            groupDiv.innerHTML = `<h3 style="color: #ffd700; margin-top: 0; border-bottom: 2px solid #ffd700; padding-bottom: 5px;">${groupName}조</h3>${teamsHtml}`;
            container.appendChild(groupDiv);
        });
        modal.style.display = 'block';
    },

    selectTeam(teamName) {
        if (confirm(`'${teamName}' 국가대표팀으로 월드컵에 참가하시겠습니까?`)) {
            this.userTeam = teamName;
            this.enterWorldCupMode();
        }
    },

    enterWorldCupMode() {
        console.log("🏆 월드컵 모드 진입 시작:", this.userTeam);

        // [수정] 1. UI 전환을 가장 먼저 수행 (화면이 멈춘 것처럼 보이지 않게 함)
        const groupsModal = document.getElementById('wcGroupsModal');
        if (groupsModal) groupsModal.style.display = 'none';
        
        const wcModal = document.getElementById('wcModal');
        if (wcModal) wcModal.style.display = 'none';

        try {
        // 1. 전역 데이터 설정
        Object.keys(this.wcPlayers).forEach(country => {
            if (!window.teams) window.teams = {};
            if (!window.teamNames) window.teamNames = {};
            if (!window.allTeams) window.allTeams = {};

            window.teams[country] = this.wcPlayers[country];
            window.teamNames[country] = country;
            window.allTeams[country] = { league: 4, players: this.wcPlayers[country], description: "National Team" };
        });

        // 2. 게임 데이터 초기화
        gameData.selectedTeam = this.userTeam;
        gameData.currentLeague = 4; // 월드컵 리그 ID
        gameData.teamMoney = 0;
        gameData.matchesPlayed = 0;
        gameData.seasonCount = 1;
        gameData.isWorldCupMode = true;
        this.currentStage = 'group';
        this.isEliminated = false;

        // 3. 리그 데이터 초기화
        if (!gameData.leagueData) gameData.leagueData = {};
        gameData.leagueData.division4 = {};
        Object.keys(this.wcPlayers).forEach(teamKey => {
            gameData.leagueData.division4[teamKey] = { matches: 0, wins: 0, draws: 0, losses: 0, points: 0, goalsFor: 0, goalsAgainst: 0 };
        });

        // 4. 스쿼드 자동 채우기
        gameData.squad = { gk: null, df: [null,null,null,null], mf: [null,null,null], fw: [null,null,null] };
        if (typeof window.autoFillSquad === 'function') {
            window.autoFillSquad();
        } else {
            console.warn("autoFillSquad 함수를 찾을 수 없습니다.");
        }

        // 5. DNA 초기화 (중요!)
        if (typeof DNAManager !== 'undefined') {
            DNAManager.initialize(window.teams[this.userTeam]);
        }

        // 5. 전체 조별리그 일정 생성 (모든 조 포함)
        this.generateWCSchedule();

        // 7. UI 전환 (탭 숨김/표시)
        this.updateWorldCupUI();

        // 6. UI 전환
        if (document.getElementById('teamName')) document.getElementById('teamName').textContent = this.userTeam;
        if (typeof window.updateDisplay === 'function') window.updateDisplay();
        if (typeof window.displayTeamPlayers === 'function') window.displayTeamPlayers();
        
        // [수정] 로비 화면으로 이동하고 스쿼드 탭 표시
        if (typeof window.showScreen === 'function') window.showScreen('lobby');
        if (typeof window.showTab === 'function') window.showTab('squad');

        alert(`🏆 ${this.userTeam} 감독 취임! 월드컵 조별리그가 시작됩니다.`);
        
        } catch (e) {
            console.error("월드컵 모드 진입 중 오류 발생:", e);
            alert("오류가 발생했습니다. 콘솔을 확인해주세요.");
        }
    },

    // [신규] 월드컵 모드 UI 업데이트 (탭 제어)
    updateWorldCupUI() {
        // 1. 불필요한 탭 숨기기
        const tabsToHide = ['transfer', 'sponsor', 'youth', 'transfer_news', 'league', 'sns', 'mail'];
        tabsToHide.forEach(t => {
            const btn = document.querySelector(`[data-tab="${t}"]`);
            if (btn) btn.style.display = 'none';
        });

        // 2. 차출 탭 (이적 탭 재활용)
        const transferBtn = document.querySelector(`[data-tab="transfer"]`);
        if (transferBtn) {
            transferBtn.style.display = 'inline-block';
            transferBtn.textContent = '🔄 차출';
            transferBtn.dataset.tab = 'callup'; // 탭 ID 변경
        }

        // 3. 기록 탭 (이름 변경)
        const recordsBtn = document.querySelector(`[data-tab="records"]`);
        if (recordsBtn) {
            recordsBtn.textContent = '📊 대회 기록';
        }
    },

    // [신규] 차출(Call-up) 탭 렌더링
    renderCallUpTab() {
        const container = document.getElementById('transferPlayers'); // 이적 탭 컨테이너 재활용
        if (!container) return;
        
        // 첫 경기 시작 전까지만 차출 가능
        if (gameData.matchesPlayed > 0) {
            container.innerHTML = '<div style="text-align:center; padding: 50px; color:#e74c3c;"><h3>🚫 차출 기간 종료</h3><p>대회가 시작되어 더 이상 선수를 교체할 수 없습니다.</p></div>';
            return;
        }

        container.innerHTML = `
            <div style="padding: 15px; background: rgba(0,0,0,0.2); margin-bottom: 15px; border-radius: 5px;">
                <h3 style="color: #ffd700; margin-top: 0;">국가대표 선수단 관리 (25인)</h3>
                <p style="color: #ccc; font-size: 0.9rem;">현재 스쿼드에 없는 선수를 클릭하여 스쿼드 내 선수와 교체할 수 있습니다.</p>
            </div>
            <div id="callupList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;"></div>
        `;

        const list = document.getElementById('callupList');
        const pool = this.nationalPools[this.userTeam] || [];
        const currentSquad = window.teams[this.userTeam];
        const currentNames = new Set(currentSquad.map(p => p.name));

        // 스쿼드에 없는 선수들만 표시
        const candidates = pool.filter(p => !currentNames.has(p.name));

        if (candidates.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">교체 가능한 선수가 없습니다.</p>';
            return;
        }

        candidates.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="details">${player.position} | OVR: ${player.rating} | ${player.age}세</div>
                <div style="font-size: 0.8rem; color: #aaa;">${player.originalClub}</div>
            `;
            card.onclick = () => this.swapSquadPlayer(player);
            list.appendChild(card);
        });
    },

    swapSquadPlayer(newPlayer) {
        // 교체 대상 선택 (스쿼드 내 선수 목록 팝업)
        const currentSquad = window.teams[this.userTeam];
        let options = currentSquad.map((p, idx) => `${idx + 1}. ${p.name} (${p.position}, ${p.rating})`).join('\n');
        
        const input = prompt(`[${newPlayer.name}] 선수와 교체할 스쿼드 선수의 번호를 입력하세요:\n\n${options}`);
        const idx = parseInt(input) - 1;

        if (!isNaN(idx) && idx >= 0 && idx < currentSquad.length) {
            const oldPlayer = currentSquad[idx];
            
            // 교체 실행
            currentSquad[idx] = newPlayer;
            
            // gameData.squad(선발/후보)에서도 제거해야 함
            if (typeof removePlayerFromSquad === 'function') {
                removePlayerFromSquad(oldPlayer);
            }

            alert(`🔄 교체 완료: ${oldPlayer.name} OUT ➔ ${newPlayer.name} IN`);
            this.renderCallUpTab(); // UI 갱신
            if (typeof displayTeamPlayers === 'function') displayTeamPlayers();
        }
    },

    // [신규] 대회 기록 탭 렌더링
    renderRecordsTab() {
        const container = document.querySelector('.records-content');
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'block'; // 그리드 대신 블록으로

        // 1. 조별리그 순위표
        const groupSection = document.createElement('div');
        groupSection.innerHTML = `<h3 style="color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">🏆 조별리그 현황</h3>`;
        
        const standings = this.calculateAllGroupStandings();
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 15px;';

        Object.keys(standings).sort().forEach(group => {
            const table = document.createElement('div');
            table.style.cssText = 'background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;';
            
            let rows = standings[group].map((t, i) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1); ${t.team === this.userTeam ? 'color: #2ecc71; font-weight: bold;' : ''}">
                    <span style="width: 20px;">${i+1}</span>
                    <span style="flex: 1;">${t.team}</span>
                    <span style="width: 30px; text-align: center;">${t.points}</span>
                    <span style="width: 30px; text-align: center;">${t.goalDiff}</span>
                </div>
            `).join('');

            table.innerHTML = `<h4 style="margin: 0 0 10px 0; color: #3498db;">${group}조</h4>${rows}`;
            grid.appendChild(table);
        });
        groupSection.appendChild(grid);
        container.appendChild(groupSection);

        // 2. 토너먼트 대진표 (16강 이상일 때)
        if (this.currentStage !== 'group') {
            const bracketSection = document.createElement('div');
            bracketSection.style.marginTop = '30px';
            bracketSection.innerHTML = `<h3 style="color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">⚔️ 토너먼트 대진</h3>`;
            
            const bracketDiv = document.createElement('div');
            bracketDiv.innerHTML = `<p style="padding: 20px; text-align: center;">현재 ${this.currentStage.toUpperCase()} 진행 중입니다.</p>`;
            // TODO: 실제 대진표 시각화 (간단히 텍스트로)
            if (this.tournamentBracket.length > 0) {
                const list = this.tournamentBracket.map(m => `<div style="padding: 5px; background: rgba(0,0,0,0.3); margin: 5px 0;">${m.home} vs ${m.away}</div>`).join('');
                bracketDiv.innerHTML += list;
            }
            
            bracketSection.appendChild(bracketDiv);
            container.appendChild(bracketSection);
        }
    },

    // [신규] 월드컵 모드 UI 업데이트 (탭 제어)
    updateWorldCupUI() {
        // 1. 불필요한 탭 숨기기
        const tabsToHide = ['sponsor', 'youth', 'transfer_news', 'league', 'sns', 'mail'];
        tabsToHide.forEach(t => {
            const btn = document.querySelector(`[data-tab="${t}"]`);
            if (btn) btn.style.display = 'none';
        });

        // 2. 차출 탭 (이적 탭 재활용)
        const transferBtn = document.querySelector(`[data-tab="transfer"]`);
        if (transferBtn) {
            transferBtn.style.display = 'inline-block';
            transferBtn.textContent = '🔄 차출';
            transferBtn.dataset.tab = 'callup'; // 탭 ID 변경
        }

        // 3. 기록 탭 (이름 변경)
        const recordsBtn = document.querySelector(`[data-tab="records"]`);
        if (recordsBtn) {
            recordsBtn.style.display = 'inline-block'; // 숨겨져 있었다면 다시 표시
            recordsBtn.textContent = '📊 대회 기록';
        }
    },

    // [신규] 차출(Call-up) 탭 렌더링
    renderCallUpTab() {
        const container = document.getElementById('transferPlayers'); // 이적 탭 컨테이너 재활용
        if (!container) return;
        
        // 첫 경기 시작 전까지만 차출 가능
        if (gameData.matchesPlayed > 0) {
            container.innerHTML = '<div style="text-align:center; padding: 50px; color:#e74c3c;"><h3>🚫 차출 기간 종료</h3><p>대회가 시작되어 더 이상 선수를 교체할 수 없습니다.</p></div>';
            return;
        }

        container.innerHTML = `
            <div style="padding: 15px; background: rgba(0,0,0,0.2); margin-bottom: 15px; border-radius: 5px;">
                <h3 style="color: #ffd700; margin-top: 0;">국가대표 선수단 관리 (25인)</h3>
                <p style="color: #ccc; font-size: 0.9rem;">현재 스쿼드에 없는 선수를 클릭하여 스쿼드 내 선수와 교체할 수 있습니다.</p>
            </div>
            <div id="callupList" style="display: grid; grid-template-columns: repeat(auto-fill, minmax(250px, 1fr)); gap: 10px;"></div>
        `;

        const list = document.getElementById('callupList');
        const pool = this.nationalPools[this.userTeam] || [];
        const currentSquad = window.teams[this.userTeam];
        const currentNames = new Set(currentSquad.map(p => p.name));

        // 스쿼드에 없는 선수들만 표시
        const candidates = pool.filter(p => !currentNames.has(p.name));

        if (candidates.length === 0) {
            list.innerHTML = '<p style="grid-column: 1/-1; text-align: center;">교체 가능한 선수가 없습니다.</p>';
            return;
        }

        candidates.forEach(player => {
            const card = document.createElement('div');
            card.className = 'player-card';
            card.innerHTML = `
                <div class="name">${player.name}</div>
                <div class="details">${player.position} | OVR: ${player.rating} | ${player.age}세</div>
                <div style="font-size: 0.8rem; color: #aaa;">${player.originalClub}</div>
            `;
            card.onclick = () => this.swapSquadPlayer(player);
            list.appendChild(card);
        });
    },

    swapSquadPlayer(newPlayer) {
        // 교체 대상 선택 (스쿼드 내 선수 목록 팝업)
        const currentSquad = window.teams[this.userTeam];
        let options = currentSquad.map((p, idx) => `${idx + 1}. ${p.name} (${p.position}, ${p.rating})`).join('\n');
        
        const input = prompt(`[${newPlayer.name}] 선수와 교체할 스쿼드 선수의 번호를 입력하세요:\n\n${options}`);
        const idx = parseInt(input) - 1;

        if (!isNaN(idx) && idx >= 0 && idx < currentSquad.length) {
            const oldPlayer = currentSquad[idx];
            
            // 교체 실행
            currentSquad[idx] = newPlayer;
            
            // gameData.squad(선발/후보)에서도 제거해야 함
            if (typeof removePlayerFromSquad === 'function') {
                removePlayerFromSquad(oldPlayer);
            }

            alert(`🔄 교체 완료: ${oldPlayer.name} OUT ➔ ${newPlayer.name} IN`);
            this.renderCallUpTab(); // UI 갱신
            if (typeof displayTeamPlayers === 'function') displayTeamPlayers();
        }
    },

    // [신규] 대회 기록 탭 렌더링
    renderRecordsTab() {
        const container = document.querySelector('.records-content');
        if (!container) return;

        container.innerHTML = '';
        container.style.display = 'block'; // 그리드 대신 블록으로

        // 1. 조별리그 순위표
        const groupSection = document.createElement('div');
        groupSection.innerHTML = `<h3 style="color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">🏆 조별리그 현황</h3>`;
        
        const standings = this.calculateAllGroupStandings();
        const grid = document.createElement('div');
        grid.style.cssText = 'display: grid; grid-template-columns: repeat(auto-fit, minmax(300px, 1fr)); gap: 20px; margin-top: 15px;';

        Object.keys(standings).sort().forEach(group => {
            const table = document.createElement('div');
            table.style.cssText = 'background: rgba(255,255,255,0.05); padding: 10px; border-radius: 8px;';
            
            let rows = standings[group].map((t, i) => `
                <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid rgba(255,255,255,0.1); ${t.team === this.userTeam ? 'color: #2ecc71; font-weight: bold;' : ''}">
                    <span style="width: 20px;">${i+1}</span>
                    <span style="flex: 1;">${t.team}</span>
                    <span style="width: 30px; text-align: center;">${t.points}</span>
                    <span style="width: 30px; text-align: center;">${t.goalDiff}</span>
                </div>
            `).join('');

            table.innerHTML = `<h4 style="margin: 0 0 10px 0; color: #3498db;">${group}조</h4>${rows}`;
            grid.appendChild(table);
        });
        groupSection.appendChild(grid);
        container.appendChild(groupSection);

        // 2. 토너먼트 대진표 (16강 이상일 때)
        if (this.currentStage !== 'group') {
            const bracketSection = document.createElement('div');
            bracketSection.style.marginTop = '30px';
            bracketSection.innerHTML = `<h3 style="color: #ffd700; border-bottom: 2px solid #ffd700; padding-bottom: 10px;">⚔️ 토너먼트 대진</h3>`;
            
            const bracketDiv = document.createElement('div');
            bracketDiv.innerHTML = `<p style="padding: 20px; text-align: center;">현재 ${this.currentStage.toUpperCase()} 진행 중입니다.</p>`;
            // TODO: 실제 대진표 시각화 (간단히 텍스트로)
            if (this.tournamentBracket.length > 0) {
                const list = this.tournamentBracket.map(m => `<div style="padding: 5px; background: rgba(0,0,0,0.3); margin: 5px 0;">${m.home} vs ${m.away}</div>`).join('');
                bracketDiv.innerHTML += list;
            }
            
            bracketSection.appendChild(bracketDiv);
            container.appendChild(bracketSection);
        }
    },

    // [수정] 조별리그 전체 일정 생성 (모든 조 포함)
    generateWCSchedule() {
        const schedule = [[], [], []]; // 3라운드

        Object.entries(this.groups).forEach(([groupName, teams]) => {
            // teams: [t1, t2, t3, t4]
            // Round 1: t1 vs t2, t3 vs t4
            // Round 2: t1 vs t3, t2 vs t4
            // Round 3: t1 vs t4, t2 vs t3
            const matches = [
                [{h: teams[0], a: teams[1]}, {h: teams[2], a: teams[3]}],
                [{h: teams[0], a: teams[2]}, {h: teams[1], a: teams[3]}],
                [{h: teams[0], a: teams[3]}, {h: teams[1], a: teams[2]}]
            ];

            matches.forEach((roundMatches, roundIndex) => {
                roundMatches.forEach(m => {
                    schedule[roundIndex].push({
                        home: m.h,
                        away: m.a,
                        isGroupMatch: true,
                        group: groupName
                    });
                });
            });
        });

        // 경기 순서 섞기 (유저 경기가 항상 맨 위나 아래에 있지 않도록)
        schedule.forEach(round => round.sort(() => Math.random() - 0.5));

        gameData.schedule = { division4: schedule };
        gameData.currentRound = 1;
        
        if (typeof window.setNextOpponent === 'function') window.setNextOpponent();
    },

    // 경기 종료 후 호출되는 핸들러
    handleMatchEnd(matchData) {
        // 1. 조별리그 종료 체크
        if (this.currentStage === 'group') {
            // 현재 라운드가 3라운드이고 경기가 끝났으면 다음 단계 준비
            if (gameData.currentRound === 3) {
                setTimeout(() => this.startKnockoutStage(), 1000);
            }
        } 
        // 2. 토너먼트 진행 중일 때
        else {
            this.handleKnockoutMatchEnd(matchData);
        }
    },

    // 토너먼트 경기 종료 처리 (승부차기 포함)
    handleKnockoutMatchEnd(matchData) {
        const userScore = matchData.homeTeam === this.userTeam ? matchData.homeScore : matchData.awayScore;
        const oppScore = matchData.homeTeam === this.userTeam ? matchData.awayScore : matchData.homeScore;
        
        if (userScore > oppScore) {
            alert(`🎉 승리! ${this.getNextStageName()} 진출!`);
            this.advanceTournament(true);
        } else if (userScore < oppScore) {
            alert(`😭 패배... 월드컵 여정이 여기서 끝납니다.`);
            this.isEliminated = true;
        } else {
            // 무승부 -> 승부차기
            this.simulatePenaltyShootout(matchData);
        }
    },

    simulatePenaltyShootout(matchData) {
        // 간단한 승부차기 로직
        let userGoals = 0;
        let oppGoals = 0;
        
        // 5번씩 킥
        for(let i=0; i<5; i++) {
            if(Math.random() > 0.2) userGoals++;
            if(Math.random() > 0.2) oppGoals++;
        }
        
        // 동점이면 서든데스
        while(userGoals === oppGoals) {
            if(Math.random() > 0.2) userGoals++;
            if(Math.random() > 0.2) oppGoals++;
        }
        
        const won = userGoals > oppGoals;
        const msg = `[승부차기 결과] ${userGoals} : ${oppGoals}\n` + (won ? "승리했습니다!" : "패배했습니다...");
        alert(msg);
        
        if (won) {
            this.advanceTournament(true);
        } else {
            this.isEliminated = true;
        }
    },

    getNextStageName() {
        const stages = ['r32', 'r16', 'qf', 'sf', 'final'];
        const idx = stages.indexOf(this.currentStage);
        if (idx < stages.length - 1) return stages[idx + 1].toUpperCase();
        return "우승";
    },

    // 32강 토너먼트 시작 (조별리그 종료 후)
    startKnockoutStage() {
        alert("조별리그 종료! 32강 진출팀을 결정합니다.");
        
        // 1. 모든 조 순위 산정
        const standings = this.calculateAllGroupStandings();
        
        // 2. 진출팀 분류 (1위, 2위, 3위)
        const firsts = [];
        const seconds = [];
        const thirds = [];
        
        Object.keys(standings).sort().forEach(group => {
            const groupTeams = standings[group];
            firsts.push({ ...groupTeams[0], group });
            seconds.push({ ...groupTeams[1], group });
            thirds.push({ ...groupTeams[2], group });
        });

        // 3. 3위 팀 서열 정리 (상위 8팀 진출)
        thirds.sort((a, b) => {
            if (b.points !== a.points) return b.points - a.points;
            if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
            if (b.goalsFor !== a.goalsFor) return b.goalsFor - a.goalsFor;
            return b.wins - a.wins; // 승리 횟수
        });
        
        const bestThirds = thirds.slice(0, 8);
        
        // 유저 탈락 여부 확인
        const userRank = this.getUserGroupRank(standings);
        if (userRank > 3 || (userRank === 3 && !bestThirds.find(t => t.team === this.userTeam))) {
            this.isEliminated = true;
            alert("조별리그 탈락! 대회를 마칩니다.");
            return;
        }

        // 4. 32강 대진표 생성
        const bracket = this.generateBracket(firsts, seconds, bestThirds);
        this.tournamentBracket = bracket;
        this.currentStage = 'r32';
        
        // 5. 일정 설정
        this.setKnockoutSchedule(bracket);
        
        alert("32강 대진표가 확정되었습니다!");
    },

    calculateAllGroupStandings() {
        const standings = {};
        const data = gameData.leagueData.division4;
        
        Object.entries(this.groups).forEach(([group, teams]) => {
            const groupTeams = teams.map(team => ({
                team: team,
                ...data[team],
                goalDiff: data[team].goalsFor - data[team].goalsAgainst
            }));
            
            // 정렬: 승점 > 득실 > 다득점 > 승자승(생략) > 랜덤
            groupTeams.sort((a, b) => {
                if (b.points !== a.points) return b.points - a.points;
                if (b.goalDiff !== a.goalDiff) return b.goalDiff - a.goalDiff;
                return b.goalsFor - a.goalsFor;
            });
            
            standings[group] = groupTeams;
        });
        return standings;
    },

    getUserGroupRank(standings) {
        for (const group in standings) {
            const rank = standings[group].findIndex(t => t.team === this.userTeam);
            if (rank !== -1) return rank + 1;
        }
        return 4;
    },

    // 32강 대진표 생성 알고리즘
    generateBracket(firsts, seconds, thirds) {
        const matches = [];
        
        // 1. 2위 vs 2위 고정 매칭 (2A vs 2B, 2C vs 2D ...)
        for (let i = 0; i < seconds.length; i += 2) {
            matches.push({ home: seconds[i].team, away: seconds[i+1].team });
        }
        
        // 2. 1위 vs 3위 매칭 (와일드카드 셔플)
        // 1위 팀들을 성적순으로 정렬
        firsts.sort((a, b) => b.points - a.points || b.goalDiff - a.goalDiff || b.goalsFor - a.goalsFor);
        
        const unmatchedFirsts = [...firsts];
        const unmatchedThirds = [...thirds];
        
        // 상위 8개 1위 팀 vs 3위 팀 (같은 조 피하기)
        const top8Firsts = unmatchedFirsts.slice(0, 8);
        const bottom4Firsts = unmatchedFirsts.slice(8);
        
        for (let i = 0; i < top8Firsts.length; i++) {
            const first = top8Firsts[i];
            let thirdIndex = 0;
            
            // 같은 조가 아닌 3위 팀 찾기
            while (thirdIndex < unmatchedThirds.length) {
                if (unmatchedThirds[thirdIndex].group !== first.group) {
                    break;
                }
                thirdIndex++;
            }
            
            // 만약 적절한 팀이 없으면(거의 없겠지만) 0번 선택
            if (thirdIndex >= unmatchedThirds.length) thirdIndex = 0;
            
            const third = unmatchedThirds.splice(thirdIndex, 1)[0];
            matches.push({ home: first.team, away: third.team });
        }
        
        // 3. 남은 1위 vs 1위 (4팀 -> 2경기)
        for (let i = 0; i < bottom4Firsts.length; i += 2) {
            matches.push({ home: bottom4Firsts[i].team, away: bottom4Firsts[i+1].team });
        }
        
        return matches;
    },

    setKnockoutSchedule(matches) {
        // 단판 승부 스케줄 설정
        gameData.schedule.division4 = [matches];
        gameData.currentRound = 1; // 토너먼트 라운드 리셋
        if (typeof window.setNextOpponent === 'function') window.setNextOpponent();
    },

    advanceTournament(userWon) {
        // 다음 라운드 진출 로직 (16강 -> 8강 -> 4강 -> 결승)
        const stages = ['r32', 'r16', 'qf', 'sf', 'final'];
        const currentIndex = stages.indexOf(this.currentStage);
        
        if (currentIndex < stages.length - 1) {
            this.currentStage = stages[currentIndex + 1];
            
            // 다음 라운드 대진 생성 (간소화: 랜덤 매칭)
            this.generateNextRoundRandomly(userWon);
            
            alert(`${this.currentStage.toUpperCase()} 진출! 다음 상대를 확인하세요.`);
        } else {
            alert("🏆 월드컵 우승! 축하합니다!");
            // 엔딩 크레딧 or 메인 메뉴 복귀
        }
    },

    generateNextRoundRandomly(userWon) {
        // 현재 라운드의 승자 수 (이전 라운드 경기 수 / 2)
        const currentMatches = gameData.schedule.division4[0];
        const nextRoundCount = Math.floor(currentMatches.length / 2);
        
        if (nextRoundCount < 1) return; // 결승 종료

        const nextMatches = [];
        
        // 유저 매치 생성
        // 실제로는 승자들 중 하나여야 함. 여기서는 랜덤한 강팀을 상대로 설정
        const potentialOpponents = ["브라질", "프랑스", "아르헨티나", "잉글랜드", "스페인", "독일", "포르투갈", "네덜란드"];
        const nextOpponent = potentialOpponents[Math.floor(Math.random() * potentialOpponents.length)];
        
        nextMatches.push({ home: this.userTeam, away: nextOpponent });
        
        // 나머지 매치들 (시뮬레이션용 더미)
        for(let i=1; i<nextRoundCount; i++) {
            nextMatches.push({ home: `AI팀_${i}A`, away: `AI팀_${i}B` });
        }
        
        this.setKnockoutSchedule(nextMatches);
    },

    saveWorldCup(slotIndex) {
        const data = {
            wcPlayers: this.wcPlayers,
            groups: this.groups,
            userTeam: this.userTeam,
            currentStage: this.currentStage,
            timestamp: Date.now()
        };
        localStorage.setItem(`worldcup_save_${slotIndex}`, JSON.stringify(data));
        alert(`월드컵 슬롯 ${slotIndex}에 저장되었습니다.`);
        this.renderSaveSlots();
    },

    loadWorldCup(slotIndex) {
        const dataStr = localStorage.getItem(`worldcup_save_${slotIndex}`);
        if (!dataStr) {
            alert('저장된 데이터가 없습니다.');
            return;
        }
        const data = JSON.parse(dataStr);
        this.wcPlayers = data.wcPlayers;
        this.groups = data.groups;
        this.userTeam = data.userTeam;
        this.currentStage = data.currentStage || 'group';
        
        document.getElementById('wcModal').style.display = 'none';
        this.enterWorldCupMode(); // 데이터 로드 후 모드 진입
    },
    
    deleteWorldCup(slotIndex) {
        if (confirm(`정말 월드컵 슬롯 ${slotIndex} 데이터를 삭제하시겠습니까?`)) {
            localStorage.removeItem(`worldcup_save_${slotIndex}`);
            this.renderSaveSlots();
        }
    }
};

// DOM 로드 후 초기화
document.addEventListener('DOMContentLoaded', () => {
    setTimeout(() => {
        WorldCupManager.init();
    }, 500);
});

window.WorldCupManager = WorldCupManager;
