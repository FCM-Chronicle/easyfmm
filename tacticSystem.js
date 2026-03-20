// c:\Users\jinuj\vsc\easyfmm\tacticSystem.js

// [전역 설정] 기본 롤(Role) 설정
if (!gameData.lineRoles) {
    gameData.lineRoles = { attack: 'AF', midfield: 'BBM', defense: 'BPD' };
}

// =========================================================================================
// [PART 1] 유틸리티 함수 (전력 계산, 베스트 11 등)
// =========================================================================================

function calculateUserTeamRating() {
    const squad = gameData.squad;
    let totalRating = 0;
    let playerCount = 0;

    if (squad.gk) { totalRating += squad.gk.rating; playerCount++; }
    squad.df.forEach(p => { if (p) { totalRating += p.rating; playerCount++; } });
    squad.mf.forEach(p => { if (p) { totalRating += p.rating; playerCount++; } });
    squad.fw.forEach(p => { if (p) { totalRating += p.rating; playerCount++; } });

    return playerCount > 0 ? totalRating / playerCount : 0;
}

function getBestEleven(teamKey) {
    const teamPlayers = teams[teamKey];
    if (!teamPlayers) return [];

    const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
    const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
    const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
    const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);

    const best11 = [];
    if (gks.length > 0) best11.push(gks[0]);
    for (let i = 0; i < 4 && i < dfs.length; i++) best11.push(dfs[i]);
    for (let i = 0; i < 3 && i < mfs.length; i++) best11.push(mfs[i]);
    for (let i = 0; i < 3 && i < fws.length; i++) best11.push(fws[i]);

    // 부족한 인원 채우기
    if (best11.length < 11) {
        const remaining = teamPlayers.filter(p => !best11.includes(p)).sort((a, b) => b.rating - a.rating);
        for (let i = 0; i < remaining.length && best11.length < 11; i++) {
            best11.push(remaining[i]);
        }
    }
    return best11;
}

function calculateOpponentTeamRating(teamKey) {
    const topPlayers = getBestEleven(teamKey);
    if (topPlayers.length === 0) return 70;
    const totalRating = topPlayers.reduce((sum, player) => sum + player.rating, 0);
    return totalRating / topPlayers.length;
}

function calculateTeamStrengthDifference() {
    const userRating = calculateUserTeamRating();
    const opponentRating = calculateOpponentTeamRating(gameData.currentOpponent);
    const difference = userRating - opponentRating;
    
    return {
        userRating: userRating,
        opponentRating: opponentRating,
        difference: difference,
        strengthGap: Math.abs(difference),
        userAdvantage: difference > 0
    };
}

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
        strengthDiff: calculateTeamStrengthDifference()
    };

    // 5. 전술 효과 적용
    const tacticSystem = new TacticSystem();
    const opponentTactic = tacticSystem.getOpponentTactic(gameData.currentOpponent);
    const tacticEffect = tacticSystem.calculateTacticEffect(gameData.currentTactic, opponentTactic);
    gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + tacticEffect));

    // 6. UI 업데이트
    document.getElementById('homeTeam').textContent = teamNames[matchData.homeTeam];
    document.getElementById('awayTeam').textContent = teamNames[matchData.awayTeam];
    document.getElementById('scoreDisplay').textContent = "0 - 0";
    document.getElementById('matchTime').textContent = "0분";
    document.getElementById('eventList').innerHTML = '';
    
    // 교체 버튼
    const subBtn = document.getElementById('substituteBtn');
    subBtn.style.display = 'inline-block';
    subBtn.onclick = () => openSubstitutionModal(matchData);
    document.getElementById('endMatchBtn').style.display = 'none';

    // 7. 엔진 및 비주얼라이저 초기화
    // (RealSoccerEngine은 deepenTactic.js에 정의되어 있음)
    const homeSquad = getSquadData(matchData.homeTeam);
    const awaySquad = getSquadData(matchData.awayTeam);
    const engine = new RealSoccerEngine(homeSquad, awaySquad);
    
    matchData.engine = engine; // 엔진 참조 저장

    // 비주얼라이저 초기화
    if (window.matchVisualizer) {
        window.matchVisualizer.init('matchVisualizerContainer', engine.players);
    } else {
        // 비주얼라이저가 없으면 캔버스 영역을 숨기거나 텍스트 모드로 동작
        console.warn("matchVisualizer not found. Playing in text mode.");
    }

    // 8. 킥오프 버튼 표시
    showKickoffButton(matchData, engine);
}

function showKickoffButton(matchData, engine) {
    const eventList = document.getElementById('eventList');
    const kickoffInfo = document.createElement('div');
    kickoffInfo.className = 'event-card kickoff-ready';
    kickoffInfo.innerHTML = `
        <div class="event-time">준비 완료</div>
        <div>경기 시작 준비가 완료되었습니다.</div>
        <button id="kickoffBtn" class="btn primary" style="margin-top: 10px;">⚽ 킥오프</button>
    `;
    eventList.appendChild(kickoffInfo);

    document.getElementById('kickoffBtn').addEventListener('click', () => {
        startMatchSimulation(matchData, engine);
        kickoffInfo.remove();
    });
}

function startMatchSimulation(matchData, engine) {
    console.log('▶️ [Match] 경기 시뮬레이션 시작');
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
    
    const matchInterval = setInterval(function simulationTick() {
        if (!matchData.isRunning) return;

        // 1. 경기 종료 체크
        if (matchData.minute >= 90) {
            clearInterval(matchInterval);
            if (!matchData.isEnded) {
                matchData.isEnded = true;
                endMatch(matchData);
            }
            return;
        }

        // 2. 엔진 업데이트 (1틱 = 10초)
        const snapshot = engine.update();

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
        }

        // 6. 시간 업데이트
        tickCount++;
        
        // [수정] 1틱당 10초 증가 (6틱 = 1분)
        matchData.seconds += 10;
        if (matchData.seconds >= 60) {
            matchData.minute++;
            matchData.seconds = 0;
            document.getElementById('matchTime').textContent = matchData.minute + '분';
        }

        matchData.intervalId = matchInterval;

    }, 100); // [수정] 800ms -> 100ms (부드러운 움직임을 위해 8배 빠르게 갱신)
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

// [헬퍼] 엔진 이벤트를 텍스트 이벤트로 변환
function convertToTextEvent(engineEvent, matchData) {
    const homeName = teamNames[matchData.homeTeam];
    const awayName = teamNames[matchData.awayTeam];
    const eventTeamName = engineEvent.team === 'home' ? homeName : awayName;

    if (engineEvent.type === 'goal') {
        return {
            minute: matchData.minute,
            type: 'goal',
            team: eventTeamName,
            scorer: engineEvent.scorer,
            description: `⚽ GOAL! ${engineEvent.scorer} (${eventTeamName}) 득점! 환상적인 마무리입니다!`
        };
    } else if (engineEvent.type === 'miss') {
        return {
            minute: matchData.minute,
            type: 'miss',
            description: `🥅 ${engineEvent.shooter}의 슈팅이 빗나갑니다. 아쉬운 기회네요.`
        };
    } else if (engineEvent.type === 'dribble') {
        return {
            minute: matchData.minute,
            type: 'dribble',
            description: `💨 ${engineEvent.player}, 화려한 드리블로 돌파합니다!`
        };
    } else if (engineEvent.type === 'tackle') {
        return {
            minute: matchData.minute,
            type: 'tackle',
            description: engineEvent.desc || `🛡️ ${engineEvent.player}, 멋진 태클로 공을 뺏어냅니다.`
        };
    } else if (engineEvent.type === 'pass') {
        // 패스는 너무 자주 나오므로 30% 확률로만 로그 출력
        if (Math.random() < 0.3) {
            return {
                minute: matchData.minute,
                type: 'pass',
                description: engineEvent.desc || `⚽ ${engineEvent.from} -> ${engineEvent.to} 연결`
            };
        }
        return null;
    }
    return null;
}

function displayEvent(event, matchData) {
    const eventList = document.getElementById('eventList');
    // 중계창이 꽉 차면 비우기 (최적화)
    if (eventList.children.length > 5) { 
        eventList.innerHTML = ''; 
    }

    const eventCard = document.createElement('div');
    eventCard.className = `event-card ${event.type}`;
    eventCard.innerHTML = `
        <div class="event-time">${event.minute}분</div>
        <div>${event.description}</div>
    `;
    eventList.appendChild(eventCard);
    
    // 자동 스크롤
    if (window.AutoScrollSystem && !window.AutoScrollSystem.isPaused) {
        eventList.scrollTop = eventList.scrollHeight;
    }
    
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
        gameData.teamMoney += 50;
        gameData.teamMorale = Math.min(100, gameData.teamMorale + 5);
    } else if (result === '무승부') {
        gameData.teamMoney += 15;
    } else {
        gameData.teamMoney += 10;
        gameData.teamMorale = Math.max(0, gameData.teamMorale - 3);
    }

    // 스폰서 보너스
    if (gameData.currentSponsor) {
        if (result === '승리') gameData.teamMoney += gameData.currentSponsor.payPerWin;
        else if (result === '패배') gameData.teamMoney += gameData.currentSponsor.payPerLoss;
        else gameData.teamMoney += Math.floor(gameData.currentSponsor.payPerWin / 2);
    }

    // 리그 데이터 업데이트
    updateLeagueData(matchData, points);
    gameData.matchesPlayed++;

    // 최종 메시지
    const finalEvent = {
        minute: 90,
        type: 'final',
        description: `경기 종료! ${result} (${userScore}-${oppScore})`
    };
    displayEvent(finalEvent, matchData);

    // 버튼 이벤트 연결
    const ratings = calculateMatchRatings(matchData);
    document.getElementById('endMatchBtn').onclick = () => {
        showMatchResultModal(matchData, ratings, result, userScore, oppScore, matchData.strengthDiff);
    };

    // 후처리 (성장, 부상 회복 등)
    if (typeof processPostMatchGrowth === 'function') setTimeout(processPostMatchGrowth, 1000);
    injurySystem.removeInjuredFromSquad();
    
    // 다음 라운드 준비
    gameData.currentRound++;
    setNextOpponent();
}

function updateLeagueData(matchData, points) {
    const divisionKey = `division${gameData.currentLeague}`;
    const userData = gameData.leagueData[divisionKey][gameData.selectedTeam];
    const oppData = gameData.leagueData[divisionKey][gameData.currentOpponent];

    if (!userData || !oppData) return;

    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const myScore = isUserHome ? matchData.homeScore : matchData.awayScore;
    const oppScore = isUserHome ? matchData.awayScore : matchData.homeScore;

    // 유저 팀 업데이트
    userData.matches++;
    userData.goalsFor += myScore;
    userData.goalsAgainst += oppScore;
    userData.points += points;
    if (points === 3) userData.wins++;
    else if (points === 1) userData.draws++;
    else userData.losses++;

    // 상대 팀 업데이트
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
    // 간단한 질문 생성 로직
    if (result === '승리') {
        return [{
            question: "훌륭한 승리였습니다. 소감은?",
            options: [
                { text: "선수들이 잘해줬습니다.", morale: 5 },
                { text: "전술이 완벽했습니다.", morale: 3 },
                { text: "운이 좋았습니다.", morale: 0 }
            ]
        }];
    } else if (result === '패배') {
        return [{
            question: "아쉬운 패배입니다. 원인이 무엇인가요?",
            options: [
                { text: "제 책임입니다.", morale: 5 }, // 선수 보호 -> 사기 상승
                { text: "선수들의 집중력이 부족했습니다.", morale: -5 },
                { text: "상대가 강했습니다.", morale: 0 }
            ]
        }];
    }
    return [{
        question: "무승부로 끝났습니다. 만족하시나요?",
        options: [
            { text: "아쉽지만 승점 1점도 소중합니다.", morale: 2 },
            { text: "이길 수 있는 경기였습니다.", morale: -2 },
            { text: "다음 경기를 준비하겠습니다.", morale: 0 }
        ]
    }];
}

function handleInterview(option) {
    const moraleChange = parseInt(document.querySelector(`[data-option="${option}"]`).dataset.morale);
    gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + moraleChange));
    
    checkSeasonEnd();
    showScreen('lobby');
    updateDisplay();
    alert(`인터뷰 완료! 팀 사기 ${moraleChange > 0 ? '+' : ''}${moraleChange}`);
}

function calculateMatchRatings(matchData) {
    // 평점 계산 로직 (기존 유지)
    const homeTeam = matchData.homeTeam;
    const awayTeam = matchData.awayTeam;
    
    // 유저 팀 선수 명단 확보
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
        r += goals * 1.5;
        if (goalsAgainst === 0 && (p.position === 'GK' || p.position === 'DF')) r += 0.5;
        
        // 승리 보너스
        const myScore = team === homeTeam ? matchData.homeScore : matchData.awayScore;
        const oppScore = team === homeTeam ? matchData.awayScore : matchData.homeScore;
        if (myScore > oppScore) r += 0.3;
        else if (myScore < oppScore) r -= 0.2;

        return { player: p, rating: r.toFixed(1), goals: goals };
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
            div.innerHTML = `
                <span>${r.player.name}</span>
                <span>${r.rating}</span>
            `;
            el.appendChild(div);
        });
    };
    render('homeTeamRatings', ratings.home);
    render('awayTeamRatings', ratings.away);
    
    document.getElementById('confirmResultBtn').onclick = () => {
        modal.style.display = 'none';
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
        // 부상 확률 (0.05%)
        if (Math.random() < 0.0005) {
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
        description: `🚑 ${injury.teamName}의 ${injury.player.name}, 부상으로 교체됩니다. (${injury.gamesOut}경기 결장 예상)`
    };
}

// 교체 시스템 (간소화)
function openSubstitutionModal(matchData) {
    if (matchData.substitutionsMade >= 5) { alert('교체 횟수 초과'); return; }
    // 기존 formation.js의 UI 사용하거나 여기에 간단히 구현
    // 여기서는 formation.js의 showSubstitutionSheet를 활용하도록 유도
    alert("스쿼드 탭이나 선수 카드를 클릭하여 교체를 진행하세요.");
}

function handleForcedSubstitution(player, matchData) {
    matchData.isRunning = false;
    alert(`🚨 ${player.name} 부상 발생! 교체가 필요합니다.`);
    // 실제로는 여기서 모달을 띄워야 함
}

// 전역 인스턴스
const injurySystem = new InjurySystem();
window.injurySystem = injurySystem;
window.startMatch = startMatch;
window.handleInterview = handleInterview;
