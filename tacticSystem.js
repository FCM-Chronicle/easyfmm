// c:\Users\jinuj\vsc\easyfmm\tacticSystem.js

// [전역 설정] 기본 롤(Role) 설정
if (!gameData.lineRoles) {
    gameData.lineRoles = {
        attack: 'AF',
        midfield: 'BBM',
        defense: 'BPD'
    };
}

// [신규] 팀 컬러 데이터 (주요 팀)
const TeamColors = {
    "바르셀로나": ["#a50044", "#004170"],
    "레알_마드리드": "#ffffff",
    "맨체스터_시티": "skyblue",
    "리버풀": "#c8102e",
    "토트넘_홋스퍼": "#ffffff",
    "파리_생제르맹": ["#004170", "#da291c"],
    "AC_밀란": ["#fb090b", "#000000"],
    "인터_밀란": ["#010e80", "#000000"],
    "아스널": ["#ef0107", "#ffffff"],
    "나폴리": "skyblue",
    "첼시": "#034694",
    "바이에른_뮌헨": "#dc052d",
    "아틀레티코_마드리드": ["#cb3524", "#ffffff"],
    "도르트문트": ["#fde100", "#000000"],
    "맨체스터_유나이티드": "#da291c",
    "FC_서울": ["#fc0000", "#000000"],
    "대한민국": "#ec0e27"
};

function getTeamColor(teamName) {
    if (TeamColors[teamName]) return TeamColors[teamName];
    // 팀 데이터가 없으면 이름 해시로 고유 색상 생성 (파스텔톤)
    let hash = 0;
    for (let i = 0; i < teamName.length; i++) {
        hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
    }
    return `hsl(${Math.abs(hash) % 360}, 70%, 50%)`;
}

// =========================================================================================
// [PART 1] 유틸리티 함수 (전력 계산, 베스트 11 등)
// =========================================================================================


function updateTeamStrength() {
    if (gameData.selectedTeam && gameData.currentOpponent) {
        const strengthData = calculateTeamStrengthDifference();
        const strengthDisplay = document.getElementById('strengthDisplay');
        if (strengthDisplay) {
            strengthDisplay.innerHTML = `
                <div>우리팀 전력: ${strengthData.userRating.toFixed(1)}</div>
                <div>상대팀 전력: ${strengthData.opponentRating.toFixed(1)}</div>
                <div>전력 차이: ${strengthData.difference > 0 ? '+' : ''}${strengthData.difference.toFixed(1)}</div>
                <div>상대적 우위: ${strengthData.userAdvantage ? '유리' : '불리'}</div>
            `;
        }
        return strengthData;
    }
    return null;
}

setInterval(() => updateTeamStrength(), 5000);

// =========================================================================================
// [PART 2] 전술 시스템 (TacticSystem)
// =========================================================================================

class TacticSystem {
    constructor() {
        this.tactics = {
            balanced: { name: "기본 전술 (무전술)", effective: [], ineffective: ["gegenpress", "twoLine", "lavolpiana", "longBall", "possession", "parkBus", "catenaccio", "totalFootball", "tikitaka"], description: "특별한 전술 지시가 없는 상태입니다. 조직력이 크게 떨어집니다." },
            gegenpress: { name: "게겐프레싱", effective: ["twoLine", "possession"], ineffective: ["longBall", "catenaccio"], description: "높은 압박으로 빠른 역습을 노리는 전술" },
            twoLine: { name: "다이렉트 축구", effective: ["longBall", "parkBus"], ineffective: ["gegenpress", "totalFootball"], description: "긴 패스로 상대의 공간을 파고드는 전술" },
            lavolpiana: { name: "라볼피아나", effective: ["possession", "tikitaka"], ineffective: ["catenaccio", "longBall"], description: "측면 공격과 크로스를 중심으로 한 전술" },
            longBall: { name: "롱볼 축구", effective: ["parkBus", "catenaccio"], ineffective: ["gegenpress", "tikitaka"], description: "긴 패스로 빠르게 공격을 전개하는 전술" },
            possession: { name: "점유율 축구", effective: ["tikitaka", "lavolpiana"], ineffective: ["longBall", "gegenpress"], description: "공을 오래 소유하며 천천히 공격 기회를 만드는 전술" },
            parkBus: { name: "역습 축구", effective: ["catenaccio", "twoLine"], ineffective: ["gegenpress", "totalFootball"], description: "수비에 집중하고 호시탐탐 역습을 노리는 전술" },
            catenaccio: { name: "카테나치오", effective: ["twoLine", "parkBus"], ineffective: ["possession", "totalFootball"], description: "이탈리아식 견고한 수비 전술" },
            totalFootball: { name: "토탈 풋볼", effective: ["tikitaka", "gegenpress"], ineffective: ["twoLine", "catenaccio"], description: "모든 선수가 공격과 수비에 참여하는 전술" },
            tikitaka: { name: "티키타카", effective: ["possession", "lavolpiana"], ineffective: ["longBall", "parkBus"], description: "짧은 패스를 연결하며 공간을 만드는 전술" }
        };
        // 팀별 전술은 script.js의 teamTactics 객체 또는 LegendLeagueManager를 참조한다고 가정
        // 여기서는 메서드만 제공
    }

    getOpponentTactic(opponentTeam) {
        if (typeof teamTactics !== 'undefined' && teamTactics[opponentTeam]) {
            return teamTactics[opponentTeam];
        }
        return 'possession'; // 기본값
    }

    calculateTacticEffect(userTactic, opponentTactic) {
        const userTacticData = this.tactics[userTactic];
        if (!userTacticData) return 0;
        
        let effect = 0;
        if (userTacticData.effective.includes(opponentTactic)) effect += 5;
        else if (userTacticData.ineffective.includes(opponentTactic)) effect -= 5;
        return effect;
    }

    getTacticMatchup(userTactic, opponentTactic) {
        const userTacticData = this.tactics[userTactic];
        const opponentTacticData = this.tactics[opponentTactic];
        
        if (!userTacticData) return { result: "알 수 없음", advantage: 0, description: "정보 없음" };

        let result = "중립";
        let advantage = 0;

        if (userTacticData.effective.includes(opponentTactic)) {
            result = "유리";
            advantage = 5;
        } else if (userTacticData.ineffective.includes(opponentTactic)) {
            result = "불리";
            advantage = -3;
        }

        return {
            result: result,
            advantage: advantage,
            userTacticName: userTacticData.name,
            opponentTacticName: opponentTacticData ? opponentTacticData.name : opponentTactic,
            description: `${userTacticData.name} vs ${opponentTacticData ? opponentTacticData.name : opponentTactic}: ${result}`
        };
    }

    // [신규] 모든 전술 목록 가져오기
    getAllTactics() {
        return Object.keys(this.tactics).map(key => ({
            key: key,
            name: this.tactics[key].name,
            description: this.tactics[key].description
        }));
    }
}

// =========================================================================================
// [PART 3] 경기 진행 로직 (RealSoccerEngine 연동)
// =========================================================================================

function startMatch() {
    // 1. 초기 검증
    if (!gameData.selectedTeam || !gameData.currentOpponent) {
        alert("팀이나 상대가 설정되지 않았습니다.");
        return;
    }

    // 2. 스쿼드 검증
    if (!validateFormationBeforeMatch()) return;

    // 3. 화면 전환
    showScreen('matchScreen');

    // 4. 경기 데이터 초기화
    const matchData = {
        homeTeam: gameData.isHomeGame ? gameData.selectedTeam : gameData.currentOpponent,
        awayTeam: gameData.isHomeGame ? gameData.currentOpponent : gameData.selectedTeam,
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        events: [],
        isRunning: false,
        substitutionsMade: 0,
        strengthDiff: calculateTeamStrengthDifference(),
        isFastForward: false // [신규] 고속 모드 플래그
    };
    window.currentMatchData = matchData; // [신규] 치트키 사용을 위해 전역 노출

    // 5. 전술 효과 적용
    const tacticSystem = new TacticSystem();
    const opponentTactic = tacticSystem.getOpponentTactic(gameData.currentOpponent);
    const tacticEffect = tacticSystem.calculateTacticEffect(gameData.currentTactic, opponentTactic);
    if (window.GameState) {
        window.GameState.adjustTeamMorale(tacticEffect);
    } else {
        gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + tacticEffect));
    }

    // 6. UI ?낅뜲?댄듃
    document.getElementById('homeTeam').textContent = teamNames[matchData.homeTeam];
    document.getElementById('awayTeam').textContent = teamNames[matchData.awayTeam];
    document.getElementById('scoreDisplay').textContent = "0 - 0";
    document.getElementById('matchTime').textContent = "0분";
    document.getElementById('eventList').innerHTML = '';
    
    // 援먯껜 踰꾪듉
    const subBtn = document.getElementById('substituteBtn');
    subBtn.style.display = 'inline-block';
    subBtn.onclick = () => openSubstitutionModal(matchData);
    document.getElementById('endMatchBtn').style.display = 'none';

    // 7. ?붿쭊 諛?鍮꾩＜?쇰씪?댁? 珥덇린??
    // (RealSoccerEngine? deepenTactic.js???뺤쓽?섏뼱 ?덉쓬)
    const homeSquad = getSquadData(matchData.homeTeam);
    const awaySquad = getSquadData(matchData.awayTeam);
    
    // [?섏젙] ??????꾩닠 ?뺣낫瑜??붿쭊???꾨떖
    const homeTactic = (matchData.homeTeam === gameData.selectedTeam) ? gameData.currentTactic : tacticSystem.getOpponentTactic(matchData.homeTeam);
    const awayTactic = (matchData.awayTeam === gameData.selectedTeam) ? gameData.currentTactic : tacticSystem.getOpponentTactic(matchData.awayTeam);

    const engine = new RealSoccerEngine(homeSquad, awaySquad, homeTactic, awayTactic);
    
    matchData.engine = engine; // ?붿쭊 李몄“ ???
    
    // [?섏젙] ? 而щ윭 媛?몄삤湲?諛?異⑸룎 諛⑹? (?좊땲???됱긽 寃뱀묠 ?닿껐)
    const homeColor = getTeamColor(matchData.homeTeam);
    let awayColor = getTeamColor(matchData.awayTeam);

    // 二??됱긽 異붿텧 ?ы띁 (諛곗뿴?대㈃ 泥?踰덉㎏ ?됱긽, 臾몄옄?댁씠硫?洹몃?濡?
    const getPrimaryColor = (c) => Array.isArray(c) ? c[0] : c;
    
    const hPrimary = getPrimaryColor(homeColor);
    const aPrimary = getPrimaryColor(awayColor);

    // ?됱긽??媛숈쑝硫??먯젙 ? ?됱긽 蹂寃?
    if (hPrimary.toLowerCase() === aPrimary.toLowerCase()) {
        // ?덉씠 ?곗깋?대㈃ ?먯젙? 寃?? ?꾨땲硫??먯젙? ?곗깋
        if (hPrimary.toLowerCase() === '#ffffff' || hPrimary.toLowerCase() === 'white') {
            awayColor = '#000000';
        } else {
            awayColor = '#ffffff';
        }
        console.log(`?렓 ?좊땲???됱긽 異⑸룎 媛먯?! ?먯젙? ?됱긽??${awayColor}濡?蹂寃쏀빀?덈떎.`);
    }

    // 鍮꾩＜?쇰씪?댁? 珥덇린??
    if (window.matchVisualizer) {
        // [?섏젙] ? 而щ윭 ?꾨떖
        window.matchVisualizer.init('matchVisualizerContainer', engine.players, { home: homeColor, away: awayColor });
    } else {
        // 鍮꾩＜?쇰씪?댁?媛 ?놁쑝硫?罹붾쾭???곸뿭???④린嫄곕굹 ?띿뒪??紐⑤뱶濡??숈옉
        console.warn("matchVisualizer not found. Playing in text mode.");
    }

    // 8. ?μ삤??踰꾪듉 ?쒖떆
    showKickoffButton(matchData, engine);
}

function showKickoffButton(matchData, engine) {
    const eventList = document.getElementById('eventList');
    const kickoffInfo = document.createElement('div');
    kickoffInfo.className = 'event-card kickoff-ready';
    kickoffInfo.innerHTML = `
        <div class="event-time">以鍮??꾨즺</div>
        <div>寃쎄린 ?쒖옉 以鍮꾧? ?꾨즺?섏뿀?듬땲??</div>
        <button id="kickoffBtn" class="btn primary" style="margin-top: 15px; padding: 12px 30px; font-size: 1.1rem; font-weight: bold; width: 100%;">???μ삤??/button>
    `;
    eventList.appendChild(kickoffInfo);

    document.getElementById('kickoffBtn').addEventListener('click', () => {
        startMatchSimulation(matchData, engine);
        kickoffInfo.remove();
    });
}

function startMatchSimulation(matchData, engine) {
    console.log('⚽ [Match] 경기 시뮬레이션 시작');
    matchData.isRunning = true;
    
    const kickoffEvent = {
        minute: 0,
        type: 'kickoff',
        description: `🟢 경기 시작! ${teamNames[matchData.homeTeam]} vs ${teamNames[matchData.awayTeam]}`
    };
    displayEvent(kickoffEvent, matchData);

    simulateMatch(matchData, engine);
}

function simulateMatch(matchData, engine) {
    let tickCount = 0;
    matchData.seconds = 0; // [신규] 초 단위 정밀 시간 계산용
    const tickDuration = 60; // [수정] 140ms -> 60ms (약 16FPS 연산) : 훨씬 부드러운 움직임

    // [최적화] setInterval 대신 setTimeout 재귀 호출 사용
    // 처리 시간이 길어져도 메인 스레드를 차단하지 않도록 함
    function gameLoop() {
        // 경기 종료 상태면 루프 중단
        if (matchData.isEnded && !matchData.isExiting) return;

        // 일시정지 상태면 잠시 대기 후 다시 체크 (폴링)
        if (!matchData.isRunning) {
            matchData.timeoutId = setTimeout(gameLoop, 500);
            return;
        }

        // 1. 경기 종료 체크
        if (matchData.minute >= 90) {
            if (!matchData.isEnded) {
                matchData.isEnded = true;
                endMatch(matchData);
                
                // [신규] 퇴장 애니메이션 시작
                if (typeof engine.startExitAnimation === 'function') {
                    // 승리 팀 판별 ('home', 'away', or null)
                    let winner = null;
                    if (matchData.homeScore > matchData.awayScore) winner = 'home';
                    else if (matchData.awayScore > matchData.homeScore) winner = 'away';

                    engine.startExitAnimation(winner);
                    matchData.isExiting = true;
                }
            }

            // [신규] 퇴장 애니메이션 진행
            if (matchData.isExiting) {
                const snapshot = engine.updatePostMatch();
                if (window.matchVisualizer) window.matchVisualizer.sync(snapshot);

                if (engine.isExitAnimationDone()) {
                    matchData.isExiting = false;
                    return;
                }
                matchData.timeoutId = setTimeout(gameLoop, 60);
                return;
            }
            return;
        }

        const startTime = performance.now();

        // 2. 엔진 업데이트 (1틱 = 4초)
        // [수정] 현재 분과 1분 경과 여부(seconds가 0일 때)를 엔진에 전달하여 체력 소모 로직 트리거
        const snapshot = engine.update(matchData.minute, matchData.seconds === 0);

        // [추가] 경기 중 실시간 라인 체력(숫자) 업데이트
        if (gameData.lineStats) {
            if (document.getElementById('atkStamina')) document.getElementById('atkStamina').textContent = Math.floor(gameData.lineStats.attack.stamina);
            if (document.getElementById('midStamina')) document.getElementById('midStamina').textContent = Math.floor(gameData.lineStats.midfield.stamina);
            if (document.getElementById('defStamina')) document.getElementById('defStamina').textContent = Math.floor(gameData.lineStats.defense.stamina);
        }

        // 3. 비주얼라이저 동기화
        if (window.matchVisualizer) {
            window.matchVisualizer.sync(snapshot);
        }

        // 4. 이벤트 처리 (텍스트 로그 변환 및 점수 업데이트)
        if (snapshot.events && snapshot.events.length > 0) {
            snapshot.events.forEach(engineEvent => {
                // 엔진 이벤트를 텍스트 이벤트로 변환
                const textEvent = convertToTextEvent(engineEvent, matchData);
                
                if (textEvent) {
                    displayEvent(textEvent, matchData);
                    
                    if (engineEvent.type === 'goal') {
                        if (engineEvent.team === 'home') matchData.homeScore++;
                        else matchData.awayScore++;
                        
                        document.getElementById('scoreDisplay').textContent = `${matchData.homeScore} - ${matchData.awayScore}`;
                        
                        // 진동 효과
                        if (window.customCursorInstance && typeof window.customCursorInstance.triggerVibration === 'function') {
                            window.customCursorInstance.triggerVibration(600, 0.9, 0.6);
                        }
                    }
                }
            });
        }

        // 5. 부상 시스템 체크 (기존 시스템 연동)
        const injuryResult = injurySystem.checkInjury(matchData);
        if (injuryResult.occurred) {
            const event = createInjuryEvent(matchData, injuryResult);
            displayEvent(event, matchData);
            if (injuryResult.isUserTeam) handleForcedSubstitution(injuryResult.player, matchData);
            // 부상 발생 시 처리를 위해 루프는 계속 돌되 다음 틱에 isRunning 체크로 대기 상태 진입
        }

        // 6. 시간 업데이트
        tickCount++;
        
        // [수정] 세리머니 중에는 시간 멈춤
        if (!snapshot.isCelebration) {
            matchData.seconds += 4;
            if (matchData.seconds >= 60) {
                matchData.minute++;
                matchData.seconds = matchData.seconds % 60; // 남은 초 이월
                document.getElementById('matchTime').textContent = matchData.minute + '분';
                if (window.ScoreboardUI) {
                    window.ScoreboardUI.updateTime(matchData.minute, matchData.seconds);
                }
            }
        }

        const endTime = performance.now();
        const elapsed = endTime - startTime;
        
        // [수정] 고속 모드인 경우 딜레이를 0으로 설정하여 즉시 다음 틱 실행
        const targetDuration = matchData.isFastForward ? 0 : tickDuration;
        const nextDelay = Math.max(0, targetDuration - elapsed);
        
        matchData.timeoutId = setTimeout(gameLoop, nextDelay);
    }

    // 루프 시작
    gameLoop();
}


// [헬퍼] 스쿼드 데이터 추출 (엔진 전달용)
function getSquadData(teamKey) {
    if (teamKey === gameData.selectedTeam) {
        return gameData.squad;
    } else {
        const best11 = getBestEleven(teamKey);
        return {
            gk: best11.find(p => p.position === 'GK'),
            df: best11.filter(p => p.position === 'DF'),
            mf: best11.filter(p => p.position === 'MF'),
            fw: best11.filter(p => p.position === 'FW')
        };
    }
}

// [신규] 해설 멘트 데이터 및 생성 함수
const MatchCommentaryData = {
    goal: [
        "골입니다! {team}의 {scorer}가 마무리합니다!",
        "{scorer}, 침착한 마무리로 골망을 흔듭니다!",
        "결정적인 골입니다! {scorer}의 슈팅이 그대로 들어갑니다!",
        "{scorer}, 박스 안에서 기회를 놓치지 않습니다!"
    ],
    miss: [
        "{shooter}의 슈팅이 골문을 벗어납니다.",
        "{shooter}, 좋은 기회를 살리지 못합니다.",
        "{shooter}의 슈팅이 아쉽게 빗나갑니다."
    ],
    dribble: [
        "{player}, 드리블로 전진합니다.",
        "{player}가 수비를 흔들며 공간을 만듭니다.",
        "{player}, 공을 몰고 올라갑니다."
    ],
    tackle: [
        "{player}, 정확한 태클로 공을 따냅니다.",
        "{player}가 중요한 순간에 수비에 성공합니다.",
        "{player}, 침착하게 패스를 차단합니다."
    ],
    throughpass: [
        "{from}, 수비 라인 뒤로 날카로운 패스를 찔러줍니다!",
        "{to}에게 결정적인 침투 패스가 연결됩니다!",
        "{from}의 패스가 수비 사이를 가릅니다!"
    ],
    save: [
        "{gk}, 좋은 선방입니다!",
        "{gk}가 슈팅을 막아냅니다!",
        "{gk}, 골문을 지켜냅니다!"
    ],
    block: [
        "{blocker}, 몸을 던져 슈팅을 막아냅니다!",
        "{shooter}의 슈팅이 수비벽에 막힙니다.",
        "{blocker}가 중요한 위치에서 길목을 지킵니다."
    ]
};

function getRandomCommentary(type, data) {
    const templates = MatchCommentaryData[type];
    if (!templates) return "경기 진행 중..";
    let template = templates[Math.floor(Math.random() * templates.length)];
    for (const key in data) {
        template = template.replace(new RegExp(`{${key}}`, 'g'), data[key]);
    }
    return template;
}

// [헬퍼] 엔진 이벤트를 텍스트 이벤트로 변환
function convertToTextEvent(engineEvent, matchData) {
    const homeName = teamNames[matchData.homeTeam];
    const awayName = teamNames[matchData.awayTeam];
    const eventTeamName = engineEvent.team === 'home' ? homeName : awayName;

    if (engineEvent.type === 'goal') {
        const data = { scorer: engineEvent.scorer, team: eventTeamName };
        let description = getRandomCommentary('goal', data);
        if (engineEvent.assister) description += ` (도움: ${engineEvent.assister})`;
        return {
            minute: matchData.minute,
            type: 'goal',
            team: eventTeamName,
            scorer: engineEvent.scorer,
            assister: engineEvent.assister, // [추가] 어시스트 정보 전달
            description: description
        };
    } else if (engineEvent.type === 'miss') {
        const data = { shooter: engineEvent.shooter };
        return {
            minute: matchData.minute,
            type: 'miss',
            description: getRandomCommentary('miss', data)
        };
    } else if (engineEvent.type === 'dribble') {
        const data = { player: engineEvent.player };
        return {
            minute: matchData.minute,
            type: 'dribble',
            // 엔진에서 보낸 전용 desc(개인기 멘트)가 있으면 그것을 사용, 없으면 일반 멘트 사용
            description: engineEvent.desc || getRandomCommentary('dribble', data)
        };
    } else if (engineEvent.type === 'tackle') {
        const data = { player: engineEvent.player };
        return {
            minute: matchData.minute,
            type: 'tackle',
            description: getRandomCommentary('tackle', data)
        };
    } else if (engineEvent.type === 'pass') {
        // 패스는 너무 자주 나오므로 30% 확률로만 로그 출력
        if (Math.random() < 0.3) {
            // 패스의 성공/실패 여부가 엔진 desc에 포함되어 있으므로 engineEvent.desc를 우선 사용
            return {
                minute: matchData.minute,
                type: 'pass',
                description: engineEvent.desc || `??${engineEvent.from} -> ${engineEvent.to} ?곌껐`
            };
        }
        return null;
    } else if (engineEvent.type === 'throughpass') {
        // [신규] 스루패스는 중요한 이벤트이므로 항상 출력
        const data = { from: engineEvent.from, to: engineEvent.to };
        return {
            minute: matchData.minute,
            type: 'pass', // UI 스타일은 pass와 공유
            description: getRandomCommentary('throughpass', data)
        };
    } else if (engineEvent.type === 'save') {
        const data = { gk: engineEvent.gk, shooter: engineEvent.shooter };
        return {
            minute: matchData.minute,
            type: 'save', // CSS ?ㅽ????꾩슂 (?놁쑝硫??쇰컲 ?띿뒪??
            description: getRandomCommentary('save', data)
        };
    } else if (engineEvent.type === 'block') {
        const data = { blocker: engineEvent.blocker, shooter: engineEvent.shooter };
        return {
            minute: matchData.minute,
            type: 'block', 
            description: getRandomCommentary('block', data)
        };
    }
    return null;
}

function displayEvent(event, matchData) {
    const eventList = document.getElementById('eventList');
    if (!eventList) return;

    // 기존 리스트 방식은 버리고 최신 이벤트 하나만 띄우기
    eventList.innerHTML = `
        <div class="event-card ${event.type}" style="animation: none; margin: 0; padding: 12px; background: rgba(0,0,0,0.6); border-radius: 12px; display: flex; align-items: center; justify-content: center; gap: 15px; font-size: 1.1rem; border: 1px solid rgba(255,255,255,0.1); width: 100%; box-sizing: border-box;">
            <span class="event-time" style="color: #ffd700; font-weight: bold; white-space: nowrap; min-width: 45px;">${event.minute}분</span>
            <span style="color: #fff; text-align: center; line-height: 1.4;">${event.description}</span>
        </div>
    `;
    
    matchData.events.push(event);
}

// =========================================================================================
// [PART 4] 경기 종료 및 후처리
// =========================================================================================

function endMatch(matchData) {
    console.log('🏁 [Match] 경기 종료 처리');
    document.getElementById('endMatchBtn').style.display = 'block';
    document.getElementById('substituteBtn').style.display = 'none';

    // 진동 피드백
    if (window.customCursorInstance && typeof window.customCursorInstance.triggerVibration === 'function') {
        window.customCursorInstance.triggerVibration(2000, 1.0, 1.0);
    }

    // 결과 산정
    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const userScore = isUserHome ? matchData.homeScore : matchData.awayScore;
    const oppScore = isUserHome ? matchData.awayScore : matchData.homeScore;
    
    let result = userScore > oppScore ? '승리' : (userScore < oppScore ? '패배' : '무승부');
    let points = result === '승리' ? 3 : (result === '무승부' ? 1 : 0);
    
    // 자금 및 사기 보상
    if (result === '승리') {
        if (window.GameState) {
            window.GameState.addTeamMoney(50);
            window.GameState.adjustTeamMorale(5);
        } else {
            gameData.teamMoney += 50;
            gameData.teamMorale = Math.min(100, gameData.teamMorale + 5);
        }
    } else if (result === '무승부') {
        if (window.GameState) {
            window.GameState.addTeamMoney(15);
        } else {
            gameData.teamMoney += 15;
        }
    } else {
        if (window.GameState) {
            window.GameState.addTeamMoney(10);
            window.GameState.adjustTeamMorale(-3);
        } else {
            gameData.teamMoney += 10;
            gameData.teamMorale = Math.max(0, gameData.teamMorale - 3);
        }
    }

    // 스폰서 보너스
    if (gameData.currentSponsor) {
        if (result === '승리') {
            if (window.GameState) window.GameState.addTeamMoney(gameData.currentSponsor.payPerWin);
            else gameData.teamMoney += gameData.currentSponsor.payPerWin;
        }
        else if (result === '패배') {
            if (window.GameState) window.GameState.addTeamMoney(gameData.currentSponsor.payPerLoss);
            else gameData.teamMoney += gameData.currentSponsor.payPerLoss;
        }
        else {
            const drawBonus = Math.floor(gameData.currentSponsor.payPerWin / 2);
            if (window.GameState) window.GameState.addTeamMoney(drawBonus);
            else gameData.teamMoney += drawBonus;
        }
    }

    // 由ш렇 ?곗씠???낅뜲?댄듃
    updateLeagueData(matchData, points);
    if (window.GameState) window.GameState.incrementMatchesPlayed();
    else gameData.matchesPlayed++;

    // 理쒖쥌 硫붿떆吏
    const strengthDiff = matchData.strengthDiff || { userAdvantage: false };
    let finalMsg = `寃쎄린 醫낅즺! ${result} (${userScore}-${oppScore})`;
    if ((result === '?밸━' && !strengthDiff.userAdvantage) || (result === '?⑤같' && strengthDiff.userAdvantage)) {
        finalMsg += result === '?밸━' ? `\n?럦 ??대?! 遺덈━???꾨젰???ㅼ쭛怨??밸━!` : `\n?삺 異⑷꺽! ?좊━??寃쎄린?먯꽌 ?⑤같...`;
    }

    const finalEvent = {
        minute: 90,
        type: 'final',
        description: finalMsg
    };
    displayEvent(finalEvent, matchData);

    // ?ㅽ룿??泥섎━ (寃쎄린 寃곌낵 ?곕룞)
    if (typeof window.processSponsorAfterMatch === 'function') {
        const matchResult = result === '?밸━' ? 'win' : result === '?⑤같' ? 'loss' : 'draw';
        window.processSponsorAfterMatch(matchResult);
    }

    // [蹂듦뎄] 硫붿씪 ?쒖뒪???곕룞 (寃쎄린 寃곌낵 諛??댁쟻 ?쒖븞)
    if (!gameData.isWorldCupMode && typeof mailManager !== 'undefined') {
        mailManager.sendMatchResultMail(matchData);
        mailManager.checkTransferOffer();
    }

    // 踰꾪듉 ?대깽???곌껐
    const ratings = calculateMatchRatings(matchData);
    
    // [?좉퇋] ?좎? ? ?됱젏 湲곕줉 ?쒖뒪?쒖뿉 ?깅줉 (踰좎뒪??11 ?좎젙??
    if (typeof recordsSystem !== 'undefined') {
        recordsSystem.processMatchRatings(ratings, matchData);
    }

    document.getElementById('endMatchBtn').onclick = () => {
        showMatchResultModal(matchData, ratings, result, userScore, oppScore, matchData.strengthDiff);
    };

    // [蹂듦뎄] 寃쎄린 ???ㅼ뭅?고듃 ?쒕룞 泥섎━
    if (!gameData.isWorldCupMode && gameData.hiredScout && typeof scoutingSystem !== 'undefined') {
        const scout = scoutingSystem.scouts[gameData.hiredScout.tier];
        if (scout && Math.random() < scout.chance) {
            const result = scoutingSystem.scoutForPlayers(gameData.hiredScout.tier);
            if (result.success) {
                setTimeout(() => {
                    alert(`[?ㅼ뭅?고듃 蹂닿퀬??\n${result.message}`);
                    if(typeof displayScoutedPlayers === 'function') displayScoutedPlayers(result.players);
                    if(typeof displayYouthPlayers === 'function') displayYouthPlayers();
                }, 1500);
            }
        }
        gameData.hiredScout.remainingMatches--;
        if (gameData.hiredScout.remainingMatches <= 0) {
            setTimeout(() => {
                alert(`[怨꾩빟 留뚮즺] ${scout.name}怨쇱쓽 怨꾩빟??留뚮즺?섏뿀?듬땲??`);
                gameData.hiredScout = null;
            }, 2000);
        }
    }

    // ?꾩쿂由?(?깆옣, 遺???뚮났 ??
    if (typeof processPostMatchGrowth === 'function') setTimeout(processPostMatchGrowth, 1000);
    
    // [以묒슂] 媛쒖씤湲곕줉 ?낅뜲?댄듃 諛?AI ?쒕??덉씠???ㅽ뻾 (simulateOtherMatches ?泥?
    if (typeof updateRecordsAfterMatch === 'function') {
        updateRecordsAfterMatch(matchData);
    }

    injurySystem.removeInjuredFromSquad();

    // [蹂듦뎄] ?쇱떆???ㅽ꺈 珥덇린??
    if (gameData.temporaryStats) {
        if (window.GameState) window.GameState.clearTemporaryStats();
        else gameData.temporaryStats = {};
    }
    
    // ?ㅼ쓬 ?쇱슫??以鍮?
    if (window.GameState) window.GameState.advanceRound();
    else gameData.currentRound++;
    setNextOpponent();

    // [?섏젙] 泥대젰 ?뚮났 ?쒖뒪??媛쒗렪 (媛쒕퀎 ?좎닔 ?⑥쐞)
    if (matchData.engine && matchData.engine.players && gameData.selectedTeam) {
        const userTeamKey = gameData.selectedTeam;
        const userPlayers = teams[userTeamKey];
        
        // ?ъ슜?먯쓽 ???home?몄? away?몄? ?뺤씤
        const userSide = matchData.homeTeam === userTeamKey ? 'home' : 'away';
        const playedPlayerNames = new Set();

        // 1. 寃쎄린 ???좎닔 泥대젰 ?낅뜲?댄듃
        matchData.engine.players.forEach(simPlayer => {
            if (simPlayer.teamId === userSide) {
                const realPlayer = userPlayers.find(p => p.name === simPlayer.name);
                if (realPlayer) {
                    playedPlayerNames.add(realPlayer.name);
                    
                    const remaining = simPlayer.stamina;
                    
                    // [蹂듦뎄] 泥대젰 ?뚮났 濡쒖쭅 (?뚮え??泥대젰????83% ?뚮났)
                    // ?? ?붿뿬 40(?뚮え 60) -> ?뚮났 50 -> 寃곌낵 90
                    const recovered = Math.min(100, Math.floor(remaining + (100 - remaining) * (5/6)));

                    realPlayer.condition = recovered;
                }
            }
        });

        // 2. 寃쎄린 ?????좎닔 ?먯쭊???뚮났 (+25)
        userPlayers.forEach(p => {
            if (!playedPlayerNames.has(p.name)) {
                const current = p.condition !== undefined ? p.condition : 100;
                p.condition = Math.min(100, current + 25);
            }
        });
    }

    // ?쒖쫵 醫낅즺 諛????泥섎━
    if (window.GameEventBus) {
        window.GameEventBus.emit('match:end', matchData);
    }

    setTimeout(() => {
        if(typeof processRetirementsAndReincarnations === 'function') processRetirementsAndReincarnations();
        checkSeasonEnd();
    }, 1000);
}

function updateLeagueData(matchData, points) {
    const divisionKey = `division${gameData.currentLeague}`;
    const userData = gameData.leagueData[divisionKey][gameData.selectedTeam];
    const oppData = gameData.leagueData[divisionKey][gameData.currentOpponent];

    if (!userData || !oppData) return;

    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const myScore = isUserHome ? matchData.homeScore : matchData.awayScore;
    const oppScore = isUserHome ? matchData.awayScore : matchData.homeScore;

    // ?좎? ? ?낅뜲?댄듃
    userData.matches++;
    userData.goalsFor += myScore;
    userData.goalsAgainst += oppScore;
    userData.points += points;
    if (points === 3) userData.wins++;
    else if (points === 1) userData.draws++;
    else userData.losses++;

    // ?곷? ? ?낅뜲?댄듃
    oppData.matches++;
    oppData.goalsFor += oppScore;
    oppData.goalsAgainst += myScore;
    if (oppScore > myScore) {
        oppData.wins++;
        oppData.points += 3;
    } else if (oppScore === myScore) {
        oppData.draws++;
        oppData.points += 1;
    } else {
        oppData.losses++;
    }
}

// =========================================================================================
// [PART 5] 인터뷰 및 평점 시스템
// =========================================================================================

function startInterview(result, userScore, opponentScore, strengthDiff) {
    // 부상자 업데이트
    injurySystem.updateInjuries();
    injurySystem.removeInjuredFromSquad();

    showScreen('interviewScreen');
    
    const questions = getInterviewQuestions(result, userScore, opponentScore, strengthDiff);
    const q = questions[Math.floor(Math.random() * questions.length)];
    
    document.getElementById('interviewQuestion').textContent = q.question;
    const btns = document.querySelectorAll('.interview-btn');
    
    q.options.forEach((opt, i) => {
        if (btns[i]) {
            btns[i].textContent = opt.text;
            btns[i].dataset.morale = opt.morale;
            btns[i].style.display = 'block';
        }
    });
    for (let i = q.options.length; i < btns.length; i++) btns[i].style.display = 'none';
}

function getInterviewQuestions(result, userScore, oppScore, strengthDiff) {
    const scoreDiff = Math.abs(userScore - oppScore);
    // strengthDiff媛 ?놁쓣 寃쎌슦 ?鍮?
    const safeStrengthDiff = strengthDiff || { userAdvantage: false, strengthGap: 0 };
    // ?대? ?щ?: ?닿? 遺덈━?쒕뜲 ?닿꼈嫄곕굹, ?좊━?쒕뜲 議뚯쓣 ??
    const isUpset = (result === '?밸━' && !safeStrengthDiff.userAdvantage) || 
                   (result === '?⑤같' && safeStrengthDiff.userAdvantage);
    
    if (result === '?밸━') {
        if (isUpset) {
            // ?낆뀑 ?밸━ (遺덈━???꾨젰?쇰줈 ?밸━)
            return [{
                question: "媛앷??곸씤 ?꾨젰???댁꽭瑜??ㅼ쭛怨??뚮????밸━瑜?嫄곕??듬땲?? ?ㅻ뒛 寃쎄린???뱀씤(?앭썱)? 臾댁뾿?낅땲源?",
                options: [
                    { text: "?좎닔?ㅼ쓽 ?ъ?媛 留뚮뱾?대궦 湲곗쟻?낅땲?? 洹몃뱾? ?대룞?μ뿉??紐⑤뱺 寃껋쓣 ?잛븘遺?덇퀬, 遺덇??μ쓣 媛?μ쑝濡?留뚮뱾?덉뒿?덈떎.", morale: 20 },
                    { text: "?곕━媛 以鍮꾪븳 留욎땄???꾩닠???꾨꼍?섍쾶 ?곸쨷?덉뒿?덈떎. ?곷????덉젏???뚭퀬??寃껋씠 二쇳슚?덉뒿?덈떎.", morale: 15 },
                    { text: "?댁씠 苑?醫뗭븯??寃쎄린??듬땲?? ?섏?留?寃곌낵??留뚯”?섎ŉ ?뱀젏 3?먯쓣 梨숆릿 寃껋뿉 ?섏쓽瑜??〓땲??", morale: 5 }
                ]
            }];
        } else if (scoreDiff >= 3) {
            // ???(3?먯감 ?댁긽)
            return [{
                question: "?뺣룄?곸씤 寃쎄린?μ쑝濡???뱀쓣 嫄곕몢?⑥뒿?덈떎. ?ㅻ뒛 寃쎄린?μ뿉 ????대뼸寃??됯??섏떆?섏슂?",
                options: [
                    { text: "?꾨꼍??媛源뚯슫 寃쎄린??듬땲?? 怨듭닔 紐⑤뱺 硫댁뿉???곕━媛 ?먰븯???뚮젅?닿? ?섏솕怨? ?좎닔?ㅼ씠 ?먮옉?ㅻ읇?듬땲??", morale: 15 },
                    { text: "?곕━??蹂몄떎?μ쓣 蹂댁뿬以 寃쎄린??듬땲?? ??湲곗꽭瑜?紐곗븘 ?ㅼ쓬 寃쎄린?먯꽌??醫뗭? 紐⑥뒿??蹂댁뿬?쒕━寃좎뒿?덈떎.", morale: 10 },
                    { text: "?곷?媛 ?ㅻ뒛 ?좊룆 遺吏꾪뻽??寃?媛숈뒿?덈떎. ?먯닔 李⑤쭔?쇱쓽 ?ㅻ젰 李⑥씠???꾨땲?덈떎怨??앷컖?⑸땲??", morale: 0 }
                ]
            }];
        } else {
            // ?쇰컲 ?밸━
            return [{
                question: "移섏뿴???묒쟾 ?앹뿉 洹以묓븳 ?밸━瑜?梨숆꼈?듬땲?? ?ㅻ뒛 寃쎄린瑜?珥앺룊?댁＜?좊떎硫?",
                options: [
                    { text: "?좎닔?ㅼ씠 ?앷퉴吏 吏묒쨷?μ쓣 ?껋? ?딄퀬 ?곗뼱以 ?뺣텇?낅땲?? ??뚰겕媛 鍮쏅궃 ?밸━??듬땲??", morale: 10 },
                    { text: "?섎뱺 寃쎄린?吏留?寃곌낵?곸쑝濡??밸━?덈떎??寃껋씠 以묒슂?⑸땲?? ?곕━???뱀젏 3?먯쓣 ?살쓣 ?먭꺽???덉뿀?듬땲??", morale: 7 },
                    { text: "紐뉖챺 ?λ㈃?먯꽌???ㅼ닔媛 ?덉뿀吏留? 寃곌낵瑜?媛?몄삩 寃껋뿉 留뚯”?⑸땲?? 蹂댁셿???먯? ?덈젴???듯빐 怨좎퀜?섍?寃좎뒿?덈떎.", morale: 3 }
                ]
            }];
        }
    } else if (result === '?⑤같') {
        if (isUpset) {
            // 異⑷꺽??(?좊━???꾨젰?쇰줈 ?⑤같)
            return [{
                question: "?꾨젰???곗쐞媛 ?덉긽?섏뿀?뚯뿉??遺덇뎄?섍퀬 異⑷꺽?곸씤 ?⑤같瑜??뱁뻽?듬땲?? ?щ뱾???ㅻ쭩?????먮뜲, ?대뼸寃??앷컖?섏떗?덇퉴?",
                options: [
                    { text: "?ㅻ뒛 ?⑤같??紐⑤뱺 梨낆엫? 媛먮룆????먭쾶 ?덉뒿?덈떎. ?꾩닠??以鍮꾧? 誘명씉?덇퀬, ?좎닔?ㅼ쓣 ?쒕?濡??대걣吏 紐삵뻽?듬땲??", morale: 10 }, // 梨낆엫 媛먯닔 -> ?ш린 ?곸듅(蹂댄샇)
                    { text: "紐뉖챺 ?좎닔?ㅼ쓽 ?덉씪???뚮젅?닿? ?ㅻ쭩?ㅻ윭?좎뒿?덈떎. ?꾨줈?쇰㈃ 寃쎄린?μ뿉??利앸챸?댁빞 ?⑸땲?? ?뺤떊???щТ?μ씠 ?꾩슂?⑸땲??", morale: -15 }, // ?좎닔 鍮꾨궃 -> ?ш린 ?섎씫
                    { text: "異뺢뎄?먯꽌???쇱뼱?????덈뒗 ?쇱엯?덈떎. ?곷?媛 ?ㅻ뒛 留ㅼ슦 ??以鍮꾪빐?붽퀬, ?곕━???댁씠 ?곕Ⅴ吏 ?딆븯?듬땲??", morale: -5 }
                ]
            }];
        } else if (scoreDiff >= 3) {
            // ???
            return [{
                question: "臾닿린?ν븳 寃쎄린 ?앹뿉 ??⑤? ?뱁뻽?듬땲?? 臾댁뾿??媛????臾몄젣??ㅺ퀬 蹂댁떗?덇퉴?",
                options: [
                    { text: "???щ윭遺꾧퍡 二꾩넚?⑸땲?? ?ㅻ뒛 ?곕━???꾨Т寃껊룄 蹂댁뿬二쇱? 紐삵뻽?듬땲?? 泥좎???遺꾩꽍?섏뿬 ?ㅼ떆???대윴 寃쎄린瑜??섏? ?딄쿋?듬땲??", morale: 5 },
                    { text: "?곷?????ㅻ젰 李⑥씠瑜??몄젙???섎컰???놁뒿?덈떎. ?곕━???꾩쭅 遺議깊븯怨? 諛곗썙?????먯씠 留롮뒿?덈떎.", morale: -5 },
                    { text: "珥덈컲 ?ㅼ젏 ?댄썑 ???湲됯꺽??臾대꼫議뚯뒿?덈떎. ?섎퉬 議곗쭅?μ쓣 泥섏쓬遺???ㅼ떆 ?먭??댁빞 ??寃?媛숈뒿?덈떎.", morale: -10 }
                ]
            }];
        } else {
            // ?쇰컲 ?⑤같 (?꾩돩???⑤같)
            return [{
                question: "?꾩돺寃??⑤같?섎ŉ ?뱀젏???살? 紐삵뻽?듬땲?? ?ㅻ뒛 寃쎄린?먯꽌 湲띿젙?곸씤 遺遺꾩쓣 李얠쓣 ???덉뿀?섏슂?",
                options: [
                    { text: "?⑤같???몄젣???곕씪由ъ?留? ?좎닔?ㅼ씠 ?앷퉴吏 ?ш린?섏? ?딄퀬 ???먯? ?믪씠 ?됯??⑸땲??", morale: 5 },
                    { text: "寃곗젙??遺議깆씠 ?꾩돺?듬땲?? 李ъ뒪??留뚮뱾?덉?留?留덈Т由ы븯吏 紐삵븯硫??닿만 ???놁뒿?덈떎.", morale: -5 },
                    { text: "?곷?媛 ?곕━蹂대떎 議곌툑 ???닿만 ?먭꺽???덉뿀?듬땲?? ?⑤같瑜??몄젙?섍퀬 ?ㅼ쓬 寃쎄린瑜?以鍮꾪븯寃좎뒿?덈떎.", morale: 0 }
                ]
            }];
        }
    }
    
    // 臾댁듅遺
    if (safeStrengthDiff.userAdvantage && safeStrengthDiff.strengthGap > 10) {
        // 媛뺥븳 ???臾댁듅遺 (?ㅻ쭩?ㅻ윭??臾댁듅遺)
        return [{
            question: "諛섎뱶???≪븘????寃쎄린?먯꽌 臾댁듅遺??洹몄낀?듬땲?? 寃곌낵??留뚯”?섏떆?섏슂?",
            options: [
                { text: "?꾪? 留뚯”?ㅻ읇吏 ?딆뒿?덈떎. ?곕━???닿만 ???덈뒗 寃쎄린瑜??볦낀怨? ?뱀젏 2?먯쓣 ?껋? 湲곕텇?낅땲??", morale: -5 },
                { text: "?곷?媛 ?묒젙?섍퀬 ?섎퉬?곸쑝濡??섏솕?????レ뼱?댁? 紐삵븳 ?곕━??梨낆엫?낅땲?? ??李쎌쓽?곸씤 怨듦꺽 ?대쾿??李얠븘???⑸땲??", morale: 0 },
                { text: "?꾩돺吏留??먯젙?먯꽌 ?뱀젏 1?먮룄 ?섏걯吏 ?딆뒿?덈떎. 由ш렇???κ린 ?덉씠?ㅻ땲源뚯슂.", morale: 2 }
            ]
        }];
    } else if (!safeStrengthDiff.userAdvantage && safeStrengthDiff.strengthGap > 10) {
        // ?쏀븳 ???臾댁듅遺 (媛믪쭊 臾댁듅遺)
        return [{
            question: "媛뺥????곷?濡???깊븳 寃쎄린瑜??쇱튂硫?臾댁듅遺瑜?湲곕줉?덉뒿?덈떎. ?ㅻ뒛 寃쎄린瑜??대뼸寃?蹂댁뀲?듬땲源?",
            options: [
                { text: "?좎닔?ㅼ씠 ?먮옉?ㅻ읇?듬땲?? 媛뺥????곷?濡?臾쇰윭?쒖? ?딄퀬 ?곕━??異뺢뎄瑜?蹂댁뿬以ъ뒿?덈떎. ?밸━留뚰겮 媛믪쭊 臾댁듅遺?낅땲??", morale: 10 },
                { text: "?섎퉬?곸쑝濡???踰꾪뀲以ъ뒿?덈떎. 怨꾪쉷?濡??뱀젏??梨숆만 ???덉뼱???ㅽ뻾?낅땲??", morale: 5 },
                { text: "?닿만 ?섎룄 ?덉뿀??寃쎄린??議곌툑 ?꾩돩????⑥뒿?덈떎. ?섏?留??좎닔?ㅼ쓽 ?먯떊媛먯? ?뺤떎???щ씪媛붿쓣 寃껋엯?덈떎.", morale: 8 }
            ]
        }];
    } else {
        // 鍮꾩듂???꾨젰 媛?臾댁듅遺
        return [{
            question: "?쏀뙺???묒쟾 ?앹뿉 ?밸?瑜?媛由ъ? 紐삵뻽?듬땲?? 寃쎄린 ?댁슜??????대뼸寃??앷컖?섏떗?덇퉴?",
            options: [
                { text: "??? 紐⑤몢 醫뗭? 寃쎄린瑜??덉뒿?덈떎. 臾댁듅遺媛 怨듭젙??寃곌낵?쇨퀬 ?앷컖?⑸땲??", morale: 3 },
                { text: "?곕━媛 議곌툑 ???곗꽭?덈떎怨??앷컖?섏?留? 怨?寃곗젙?μ씠 ?꾩돩?좎뒿?덈떎. ?ㅼ쓬?먮뒗 諛섎뱶???밸━?섍쿋?듬땲??", morale: 0 },
                { text: "?щ뱾?먭쾶 ?밸━瑜??좊Ъ?섏? 紐삵빐 二꾩넚?⑸땲?? ?ㅼ쓬 寃쎄린?먯꽌????怨듦꺽?곸씤 紐⑥뒿?쇰줈 蹂대떟?섍쿋?듬땲??", morale: 2 }
            ]
        }];
    }
}

function handleInterview(option) {
    const moraleChange = parseInt(document.querySelector(`[data-option="${option}"]`).dataset.morale);
    if (window.GameState) window.GameState.adjustTeamMorale(moraleChange);
    else gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + moraleChange));
    
    checkSeasonEnd();
    showScreen('lobby');
    updateDisplay();
    alert(`인터뷰 완료! 팀 사기 ${moraleChange > 0 ? '+' : ''}${moraleChange}`);
}

function calculateMatchRatings(matchData) {
    // 평점 계산 로직 (기존 유지)
    const homeTeam = matchData.homeTeam;
    const awayTeam = matchData.awayTeam;
    
    // 유저 팀 선수 명단 정보
    let homePlayers = [], awayPlayers = [];
    
    if (homeTeam === gameData.selectedTeam) {
        const s = gameData.squad;
        if (s.gk) homePlayers.push(s.gk);
        [...s.df, ...s.mf, ...s.fw].forEach(p => { if(p) homePlayers.push(p); });
    } else {
        homePlayers = getBestEleven(homeTeam);
    }
    
    if (awayTeam === gameData.selectedTeam) {
        const s = gameData.squad;
        if (s.gk) awayPlayers.push(s.gk);
        [...s.df, ...s.mf, ...s.fw].forEach(p => { if(p) awayPlayers.push(p); });
    } else {
        awayPlayers = getBestEleven(awayTeam);
    }

    const calc = (p, team, goalsAgainst) => {
        let r = 6.0 + (Math.random() * 0.4 - 0.2);
        const goals = matchData.events.filter(e => e.type === 'goal' && e.scorer === p.name).length;
        const assists = matchData.events.filter(e => e.type === 'goal' && e.assister === p.name).length;
        r += goals * 1.5;
        r += assists * 1.2; // [異붽?] ?댁떆?ㅽ듃 ?됱젏 諛섏쁺
        if (goalsAgainst === 0 && (p.position === 'GK' || p.position === 'DF')) r += 0.5;
        
        // 승리 보너스
        const myScore = team === homeTeam ? matchData.homeScore : matchData.awayScore;
        const oppScore = team === homeTeam ? matchData.awayScore : matchData.homeScore;
        if (myScore > oppScore) r += 0.3;
        else if (myScore < oppScore) r -= 0.2;

        // 최대 10.0, 최소 3.0 제한
        return { player: p, rating: Math.max(3.0, Math.min(10.0, r)).toFixed(1), goals: goals, assists: assists };
    };

    const homeRatings = homePlayers.map(p => calc(p, homeTeam, matchData.awayScore));
    const awayRatings = awayPlayers.map(p => calc(p, awayTeam, matchData.homeScore));
    
    // MOM
    const all = [...homeRatings, ...awayRatings];
    all.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    
    return { home: homeRatings, away: awayRatings, mom: all[0] };
}

function showMatchResultModal(matchData, ratings, result, userScore, oppScore, diff) {
    const modal = document.getElementById('matchResultModal');
    document.getElementById('resultHomeTeam').textContent = teamNames[matchData.homeTeam];
    document.getElementById('resultAwayTeam').textContent = teamNames[matchData.awayTeam];
    document.getElementById('resultScore').textContent = `${matchData.homeScore} - ${matchData.awayScore}`;
    
    const render = (id, list) => {
        const el = document.getElementById(id);
        el.innerHTML = '';
        list.forEach(r => {
            const div = document.createElement('div');
            div.className = 'rating-row';
            let stats = '';
            if (r.goals > 0) stats += ` ??${r.goals})`;
            if (r.assists > 0) stats += ` ?몷(${r.assists})`;

            div.innerHTML = `
                <span>${r.player.name}${stats}</span>
                <span>${r.rating}</span>
            `;
            el.appendChild(div);
        });
    };
    render('homeTeamRatings', ratings.home);
    render('awayTeamRatings', ratings.away);
    
    document.getElementById('confirmResultBtn').onclick = () => {
        modal.style.display = 'none';
        if (gameData.isWorldCupMode && typeof WorldCupManager !== 'undefined') {
            WorldCupManager.handleMatchEnd(matchData);

            if (!WorldCupManager.isEliminated) {
                if (typeof setNextOpponent === 'function') setNextOpponent();
                if (typeof showScreen === 'function') showScreen('lobby');
                if (typeof updateDisplay === 'function') updateDisplay();
            } else if (typeof showScreen === 'function') {
                showScreen('lobby');
            }
            return;
        }

        startInterview(result, userScore, oppScore, diff);
    };
    modal.style.display = 'block';
}

// =========================================================================================
// [PART 6] 부상 및 교체 시스템
// =========================================================================================

class InjurySystem {
    constructor() { this.injuredPlayers = new Map(); }
    
    checkInjury(matchData) {
        // [수정] 부상 확률 대폭 하향 (0.05% -> 0.01%)
        if (Math.random() < 0.0001) {
            const isUser = Math.random() < 0.5;
            const teamKey = isUser ? gameData.selectedTeam : gameData.currentOpponent;
            const squad = isUser ? [gameData.squad.gk, ...gameData.squad.df, ...gameData.squad.mf, ...gameData.squad.fw] : getBestEleven(teamKey);
            const player = squad.filter(p => p)[Math.floor(Math.random() * squad.filter(p => p).length)];
            
            if (player && !this.isInjured(teamKey, player.name)) {
                const games = Math.floor(Math.random() * 3) + 1;
                this.injuredPlayers.set(`${teamKey}_${player.name}`, { team: teamKey, name: player.name, gamesRemaining: games });
                return { occurred: true, isUserTeam: isUser, player: player, teamName: teamNames[teamKey], gamesOut: games };
            }
        }
        return { occurred: false };
    }

    updateInjuries() {
        this.injuredPlayers.forEach((v, k) => {
            v.gamesRemaining--;
            if (v.gamesRemaining <= 0) this.injuredPlayers.delete(k);
        });
    }

    isInjured(team, name) { return this.injuredPlayers.has(`${team}_${name}`); }
    
    getInjuredPlayers(team) {
        const list = [];
        this.injuredPlayers.forEach(v => { if (v.team === team) list.push(v); });
        return list;
    }

    removeInjuredFromSquad() {
        if (!gameData.selectedTeam) return;
        const s = gameData.squad;
        if (s.gk && this.isInjured(gameData.selectedTeam, s.gk.name)) s.gk = null;
        s.df = s.df.map(p => p && this.isInjured(gameData.selectedTeam, p.name) ? null : p);
        s.mf = s.mf.map(p => p && this.isInjured(gameData.selectedTeam, p.name) ? null : p);
        s.fw = s.fw.map(p => p && this.isInjured(gameData.selectedTeam, p.name) ? null : p);
    }
    
    getSaveData() { return { injuredPlayers: Array.from(this.injuredPlayers.entries()) }; }
    loadSaveData(data) { if (data && data.injuredPlayers) this.injuredPlayers = new Map(data.injuredPlayers); }
    reset() { this.injuredPlayers.clear(); }
}

function createInjuryEvent(matchData, injury) {
    return {
        minute: matchData.minute,
        type: 'injury',
        description: `🚑 ${injury.teamName}의 ${injury.player.name}, 부상으로 교체됩니다! (${injury.gamesOut}경기 결장 예상)`
    };
}

// [교체 시스템 구현]
let selectedFieldPlayer = null;
let selectedBenchPlayer = null;

function createSubPlayerElement(player) {
    const el = document.createElement('div');
    el.className = 'substitution-player';
    el.dataset.playerName = player.name;
    el.innerHTML = `
        <div class="name">${player.name} (${player.position})</div>
        <div class="details">?λ젰移? ${Math.floor(player.rating)}</div>
    `;
    return el;
}

function openSubstitutionModal(matchData, isForced = false, injuredPlayer = null) {
    if (matchData.substitutionsMade >= 5 && !isForced) {
        alert('교체 횟수를 모두 사용했습니다.');
        return;
    }

    const modal = document.getElementById('substitutionModal');
    const fieldPlayersList = document.getElementById('fieldPlayersList');
    const benchPlayersList = document.getElementById('benchPlayersList');
    const subsLeftEl = document.getElementById('substitutionsLeft');
    const modalTitle = document.getElementById('substitutionModalTitle');

    // 초기화
    fieldPlayersList.innerHTML = '';
    benchPlayersList.innerHTML = '';
    selectedFieldPlayer = null;
    selectedBenchPlayer = null;

    subsLeftEl.textContent = `남은 교체 횟수: ${5 - matchData.substitutionsMade}`;
    modalTitle.textContent = isForced ? `🚨 부상 선수 교체` : '선수 교체';

    // 1. 현재 필드 위 선수 목록 (스쿼드 기준)
    const squad = gameData.squad;
    const fieldPlayers = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(p => p);

    fieldPlayers.forEach(player => {
        const playerEl = createSubPlayerElement(player);
        
        // 부상 교체 시 부상자 자동 선택 및 강조
        if (isForced && injuredPlayer && player.name === injuredPlayer.name) {
            playerEl.classList.add('selected');
            playerEl.style.borderColor = '#e74c3c'; // 빨간색 강조
            selectedFieldPlayer = { element: playerEl, player: player };
        } 
        
        // 클릭 이벤트 (부상 교체 시 부상자가 아니면 선택 불가)
        playerEl.addEventListener('click', () => {
            if (isForced && injuredPlayer && player.name !== injuredPlayer.name) return;
            selectPlayerForSub(player, playerEl, 'field', matchData);
        });
        
        fieldPlayersList.appendChild(playerEl);
    });

    // 2. 벤치 선수 목록 (전체 선수 중 필드/부상 제외)
    const allPlayers = teams[gameData.selectedTeam];
    const fieldPlayerNames = new Set(fieldPlayers.map(p => p.name));
    
    const benchPlayers = allPlayers.filter(p => 
        !fieldPlayerNames.has(p.name) && 
        (!injurySystem || !injurySystem.isInjured(gameData.selectedTeam, p.name))
    );

    benchPlayers.forEach(player => {
        const playerEl = createSubPlayerElement(player);
        playerEl.addEventListener('click', () => selectPlayerForSub(player, playerEl, 'bench', matchData));
        benchPlayersList.appendChild(playerEl);
    });

    modal.style.display = 'block';
}

function selectPlayerForSub(player, element, type, matchData) {
    // 선택 스타일 처리
    if (type === 'field') {
        if (selectedFieldPlayer && selectedFieldPlayer.element !== element) {
            selectedFieldPlayer.element.classList.remove('selected');
        }
        element.classList.add('selected');
        selectedFieldPlayer = { element, player };
    } else {
        if (selectedBenchPlayer && selectedBenchPlayer.element !== element) {
            selectedBenchPlayer.element.classList.remove('selected');
        }
        element.classList.add('selected');
        selectedBenchPlayer = { element, player };
    }

    // 둘 다 선택하면 교체 실행 확인
    if (selectedFieldPlayer && selectedBenchPlayer) {
        setTimeout(() => {
            if (confirm(`${selectedFieldPlayer.player.name}을(를) ${selectedBenchPlayer.player.name} 선수가 교체하시겠습니까?`)) {
                performSubstitution(selectedFieldPlayer.player, selectedBenchPlayer.player, matchData);
            } else {
                // 취소 시 선택 해제
                if (selectedBenchPlayer) selectedBenchPlayer.element.classList.remove('selected');
                selectedBenchPlayer = null;
                
                if (!matchData.isPausedForInjury) {
                    if (selectedFieldPlayer) selectedFieldPlayer.element.classList.remove('selected');
                    selectedFieldPlayer = null;
                }
            }
        }, 100);
    }
}

function performSubstitution(playerOut, playerIn, matchData) {
    // 1. gameData.squad ?낅뜲?댄듃
    const squad = gameData.squad;
    if (squad.gk && squad.gk.name === playerOut.name) squad.gk = playerIn;
    else {
        ['df', 'mf', 'fw'].forEach(pos => {
            const idx = squad[pos].findIndex(p => p && p.name === playerOut.name);
            if (idx !== -1) squad[pos][idx] = playerIn;
        });
    }

    // 2. 엔진 데이터 업데이트 (SimPlayer 교체)
    if (matchData.engine) {
        const simPlayers = matchData.engine.players;
        const simPlayerIndex = simPlayers.findIndex(p => p.id === playerOut.name);
        
        if (simPlayerIndex !== -1) {
            const simPlayer = simPlayers[simPlayerIndex];
            
            // 기존 SimPlayer 객체를 새 선수 정보로 갱신
            simPlayer.id = playerIn.name;
            simPlayer.name = playerIn.name;
            simPlayer.rating = playerIn.rating;
            // [수정] 교체 투입 선수 체력 반영
            simPlayer.stamina = (playerIn.condition !== undefined) ? playerIn.condition : 100;
            
            // 능력치 업데이트
            simPlayer.stats = {
                speed: playerIn.rating,
                passing: playerIn.rating,
                shooting: playerIn.rating,
                defense: playerIn.rating,
                decision: playerIn.rating
            };
            
            // 역할 재설정
            let role = 'CM';
            if (gameData.playerRoles && gameData.playerRoles[playerIn.name]) {
                role = gameData.playerRoles[playerIn.name];
            } else {
                if (playerIn.position === 'FW') role = 'AF';
                else if (playerIn.position === 'MF') role = 'BBM';
                else if (playerIn.position === 'DF') role = 'CD';
                else if (playerIn.position === 'GK') role = 'GK';
            }
            simPlayer.role = role;

            // [시각화 동기화] 비주얼라이저 유닛 업데이트
            if (window.matchVisualizer && window.matchVisualizer.units[playerOut.name]) {
                const unit = window.matchVisualizer.units[playerOut.name];
                delete window.matchVisualizer.units[playerOut.name];
                unit.id = playerIn.name;
                unit.name = playerIn.name;
                window.matchVisualizer.units[playerIn.name] = unit;
            }
        }
        
        // 스테미나 재계산 (엔진 메서드 호출)
        if (typeof matchData.engine.recalculateStaminaOnSub === 'function') {
            matchData.engine.recalculateStaminaOnSub(playerOut);
        }
    }

    // 3. 기록 및 이벤트
    matchData.substitutionsMade++;
    const subEvent = {
        minute: matchData.minute,
        type: 'substitution',
        description: `🔄 교체: ${playerOut.name} OUT / ${playerIn.name} IN`
    };
    displayEvent(subEvent, matchData);

    // 4. 모달 닫기 및 경기 재개
    document.getElementById('substitutionModal').style.display = 'none';
    selectedFieldPlayer = null;
    selectedBenchPlayer = null;
    
    if (matchData.isPausedForInjury) {
        matchData.isPausedForInjury = false;
        matchData.isRunning = true;
        console.log('⚽ 부상 교체 완료, 경기 재개');
    }
}

// 모달 닫기 버튼
function closeSubstitutionModal() {
    const modal = document.getElementById('substitutionModal');
    // 강제 교체 중이 아닐 때만 닫기 허용
    // 여기서는 간단히 닫기만 수행
    if (modal) modal.style.display = 'none';
    selectedFieldPlayer = null;
    selectedBenchPlayer = null;
} 

function handleForcedSubstitution(player, matchData) {
    matchData.isRunning = false;
    matchData.isPausedForInjury = true; // 부상 일시정지 플래그
    
    // [수정] 알림 후 즉시 모달 열기 (비동기 처리로 UI 블로킹 방지)
    setTimeout(() => {
        alert(`🚨 ${player.name} 부상 발생! 경기를 뛸 수 없어 교체가 필요합니다.`);
        openSubstitutionModal(matchData, true, player);
    }, 100);
}

// 전역 인스턴스
const injurySystem = new InjurySystem();
window.injurySystem = injurySystem;
window.startMatch = startMatch;
window.handleInterview = handleInterview;

// [신규] 경기 속도 조절 치트키 (Shift + F)
document.addEventListener('keydown', (e) => {
    if (e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        if (window.currentMatchData && window.currentMatchData.isRunning) {
            window.currentMatchData.isFastForward = !window.currentMatchData.isFastForward;
            
            // 시각적 피드백 (시간 텍스트 색상 변경)
            const timeEl = document.getElementById('matchTime');
            if (timeEl) {
                timeEl.style.color = window.currentMatchData.isFastForward ? '#f1c40f' : '';
                timeEl.style.textShadow = window.currentMatchData.isFastForward ? '0 0 10px #f1c40f' : '';
            }
        }
    }
});
