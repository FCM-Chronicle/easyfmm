//tacticSystem.js

// 메모리 업데이트: 포지션별 골 확률이 FW: 75%, MF: 21%, DF: 4%로 설정됨

// 팀 전력 계산 함수들
function calculateUserTeamRating() {
    const squad = gameData.squad;
    let totalRating = 0;
    let playerCount = 0;

    // 골키퍼
    if (squad.gk) {
        totalRating += squad.gk.rating;
        playerCount++;
    }

    // 수비수들
    squad.df.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });

    // 미드필더들
    squad.mf.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });

    // 공격수들
    squad.fw.forEach(player => {
        if (player) {
            totalRating += player.rating;
            playerCount++;
        }
    });

    return playerCount > 0 ? totalRating / playerCount : 0;
}

function calculateOpponentTeamRating(teamKey) {
    const teamPlayers = teams[teamKey];
    if (!teamPlayers || teamPlayers.length === 0) return 70; // 기본값

    // 상위 11명의 평균 능력치 계산
    const sortedPlayers = teamPlayers.sort((a, b) => b.rating - a.rating);
    const topPlayers = sortedPlayers.slice(0, 11);
    const totalRating = topPlayers.reduce((sum, player) => sum + player.rating, 0);
    
    return totalRating / topPlayers.length;
}

function calculateTeamStrengthDifference() {
    const userRating = calculateUserTeamRating();
    const opponentRating = calculateOpponentTeamRating(gameData.currentOpponent);
    const difference = userRating - opponentRating;
    const strengthGap = Math.abs(difference);
    
    return {
        userRating: userRating,
        opponentRating: opponentRating,
        difference: difference,
        strengthGap: strengthGap,
        userAdvantage: difference > 0
    };
}

// 전력 계산을 수시로 업데이트하는 함수
function updateTeamStrength() {
    if (gameData.selectedTeam && gameData.currentOpponent) {
        const strengthData = calculateTeamStrengthDifference();
        
        // 전력 차이 정보를 화면에 표시 (있다면)
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

// 주기적으로 전력 계산 업데이트 (5초마다)
setInterval(() => {
    updateTeamStrength();
}, 5000);

// 전술 시스템
class TacticSystem {
    constructor() {
        // 전술 데이터
        this.tactics = {
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

       this.teamTactics = {
    // 1부 리그
    "바르셀로나": "tikitaka",
    "레알_마드리드": "possession",
    "맨체스터_시티": "tikitaka",
    "리버풀": "gegenpress",
    "토트넘_홋스퍼": "totalFootball",
    "파리_생제르맹": "tikitaka",
    "AC_밀란": "twoLine",
    "인터_밀란": "catenaccio",
    "아스널": "tikitaka",
    "나폴리": "possession",
    "첼시": "gegenpress",
    "바이에른_뮌헨": "tikitaka",
    "아틀레티코_마드리드": "catenaccio",
    "도르트문트": "gegenpress",
    
    // 2부 리그
    "유벤투스": "catenaccio",
    "뉴캐슬_유나이티드": "longBall",
    "아스톤_빌라": "possession",
    "라이프치히": "gegenpress",
    "세비야": "tikitaka",
    "아약스": "totalFootball",
    "AS_로마": "catenaccio",
    "레버쿠젠": "longBall",
    "스포르팅_CP": "possession",
    "벤피카": "twoLine",
    "셀틱": "longBall",
    "페예노르트": "possession",
    "맨체스터_유나이티드": "gegenpress",
    "올랭피크_드_마르세유": "twoLine",
    
    // 3부 리그
    "FC_서울": "lavolpiana",
    "갈라타사라이": "possession",
    "알_힐랄": "tikitaka",
    "알_이티하드": "possession",
    "알_나스르": "twoLine",
    "아르헨티나_연합": "catenaccio",
    "미국_연합": "gegenpress",
    "멕시코_연합": "totalFootball",
    "브라질_연합": "possession",
    "전북_현대": "lavolpiana",
    "울산_현대": "tikitaka",
    "포항_스틸러스": "possession",
    "광주_FC": "tikitaka",
    "리옹": "twoLine"
};
    }


    // 전술 효과 계산
    calculateTacticEffect(userTactic, opponentTactic) {
        const userTacticData = this.tactics[userTactic];
        const opponentTacticData = this.tactics[opponentTactic];

        let effect = 0;

        // 내 전술이 상대 전술에 효과적인 경우
        if (userTacticData.effective.includes(opponentTactic)) {
            effect += 15; // 사기 +15
        }
        // 내 전술이 상대 전술에 비효과적인 경우
        else if (userTacticData.ineffective.includes(opponentTactic)) {
            effect -= 10; // 사기 -10
        }

        return effect;
    }

    // 상대팀의 전술 가져오기
    getOpponentTactic(opponentTeam) {
        return this.teamTactics[opponentTeam] || "possession";
    }

  getTacticModifiers(tactic) {
    const modifiers = {
        goalChance: 0,
        foulChance: 0,
        possessionBonus: 0,
        passAccuracy: 0
    };

    switch (tactic) {
        case "gegenpress":
            modifiers.goalChance = 0.0125; // +1.25%
            modifiers.foulChance = 0.015;
            modifiers.possessionBonus = -5;
            modifiers.passAccuracy = -2;
            break;
        case "twoLine":
            modifiers.goalChance = -0.0075; // -0.75%
            modifiers.foulChance = 0.008;
            modifiers.possessionBonus = -10;
            modifiers.passAccuracy = 5;
            break;
        case "lavolpiana":
            modifiers.goalChance = 0.0075; // +0.75%
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 5;
            modifiers.passAccuracy = 3;
            break;
        case "longBall":
            modifiers.goalChance = 0.01; // +1.0%
            modifiers.foulChance = -0.008;
            modifiers.possessionBonus = -15;
            modifiers.passAccuracy = -5;
            break;
        case "possession":
            modifiers.goalChance = 0.005; // +0.5%
            modifiers.foulChance = -0.012;
            modifiers.possessionBonus = 15;
            modifiers.passAccuracy = 8;
            break;
        case "parkBus":
            modifiers.goalChance = -0.0125; // -1.25%
            modifiers.foulChance = 0.02;
            modifiers.possessionBonus = -20;
            modifiers.passAccuracy = -3;
            break;
        case "catenaccio":
            modifiers.goalChance = -0.01; // -1.0%
            modifiers.foulChance = 0.015;
            modifiers.possessionBonus = -12;
            modifiers.passAccuracy = 2;
            break;
        case "totalFootball":
            modifiers.goalChance = 0.0125; // +1.25%
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 8;
            modifiers.passAccuracy = 5;
            break;
        case "tikitaka":
            modifiers.goalChance = 0.0075; // +0.75%
            modifiers.foulChance = -0.012;
            modifiers.possessionBonus = 20;
            modifiers.passAccuracy = 10;
            break;
    }

    return modifiers;
}
    // 전술 설명 가져오기
    getTacticDescription(tactic) {
        return this.tactics[tactic] ? this.tactics[tactic].description : "";
    }

    // 전술 이름 가져오기
    getTacticName(tactic) {
        return this.tactics[tactic] ? this.tactics[tactic].name : tactic;
    }

    // 전술 상성 정보 가져오기
    getTacticMatchup(userTactic, opponentTactic) {
        const userTacticData = this.tactics[userTactic];
        const opponentTacticData = this.tactics[opponentTactic];

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
            userTacticName: this.getTacticName(userTactic),
            opponentTacticName: this.getTacticName(opponentTactic),
            description: `${this.getTacticName(userTactic)} vs ${this.getTacticName(opponentTactic)}: ${result}`
        };
    }

    // 모든 전술 목록 가져오기
    getAllTactics() {
        return Object.keys(this.tactics).map(key => ({
            key: key,
            name: this.tactics[key].name,
            description: this.tactics[key].description
        }));
    }

    // 추천 전술 계산
    getRecommendedTactic(opponentTactic) {
        const recommendations = [];

        Object.keys(this.tactics).forEach(tacticKey => {
            const tactic = this.tactics[tacticKey];
            if (tactic.effective.includes(opponentTactic)) {
                recommendations.push({
                    key: tacticKey,
                    name: tactic.name,
                    reason: `${this.getTacticName(opponentTactic)}에 효과적`
                });
            }
        });

        return recommendations;
    }

    // 전술 변경 시 팀 사기 영향
    changeTactic(newTactic) {
        const oldTactic = gameData.currentTactic;
        gameData.currentTactic = newTactic;

        // 전술 변경에 따른 사기 변화 (작은 변화)
        const moraleChange = Math.floor(Math.random() * 3) - 1; // -1, 0, 1
        gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + moraleChange));

        return {
            oldTactic: this.getTacticName(oldTactic),
            newTactic: this.getTacticName(newTactic),
            moraleChange: moraleChange
        };
    }
}

// 수정된 startMatch 함수 - tacticSystem.js에 교체하세요

function startMatch() {
    // === 1단계: 초기 검증 ===
    if (!gameData.selectedTeam || !gameData.currentOpponent) {
        alert("팀이나 상대가 설정되지 않았습니다.");
        return;
    }

    // === 2단계: 스쿼드 검증 (새로운 포메이션 시스템 사용) ===
    if (!validateFormationBeforeMatch()) {
        return; // 검증 실패 시 경기 시작 안 함
    }

    // === 3단계: 경기 화면 전환 ===
    showScreen('matchScreen');
    
    // === 4단계: 경기 데이터 초기화 ===
    const matchData = {
        homeTeam: gameData.selectedTeam,
        awayTeam: gameData.currentOpponent,
        homeScore: 0,
        awayScore: 0,
        minute: 0,
        events: [],
        isRunning: false, // 처음에는 중지 상태
        substitutionsMade: 0, // 교체 횟수
        userTeamRating: 0, // 경기 중 실시간 전력
        opponentTeamRating: 0,
        tacticAdvantage: 0
    };

    // === 5단계: 전술 효과 계산 ===
    const tacticSystem = new TacticSystem();
    const opponentTactic = tacticSystem.getOpponentTactic(gameData.currentOpponent);
    matchData.tacticAdvantage = tacticSystem.getTacticMatchup(gameData.currentTactic, opponentTactic).advantage;
    const tacticEffect = tacticSystem.calculateTacticEffect(gameData.currentTactic, opponentTactic);
    
    // === 6단계: 팀 전력 차이 계산 ===
    const strengthDiff = calculateTeamStrengthDifference();
    
    // === 7단계: 사기에 전술 효과 적용 ===
    gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + tacticEffect));

    // 경기 시작 시 전력 저장
    matchData.userTeamRating = strengthDiff.userRating;
    matchData.opponentTeamRating = strengthDiff.opponentRating;

    // === 8단계: 화면 UI 업데이트 ===
    document.getElementById('homeTeam').textContent = teamNames[matchData.homeTeam];
    document.getElementById('awayTeam').textContent = teamNames[matchData.awayTeam];
    document.getElementById('scoreDisplay').textContent = `${matchData.homeScore} - ${matchData.awayScore}`;
    document.getElementById('matchTime').textContent = '0분';
    document.getElementById('eventList').innerHTML = '';
    document.getElementById('substituteBtn').style.display = 'inline-block'; // 교체 버튼 표시
    document.getElementById('substituteBtn').onclick = () => {
        openSubstitutionModal(matchData);
    };

    // === 9단계: 전술 상성 정보 표시 ===
    const matchup = tacticSystem.getTacticMatchup(gameData.currentTactic, opponentTactic);
    const tacticInfo = document.createElement('div');
    tacticInfo.className = 'event-card';
    tacticInfo.innerHTML = `
        <div class="event-time">경기 전</div>
        <div>전술 상성: ${matchup.description}</div>
        <div>우리팀 평균: ${strengthDiff.userRating.toFixed(1)} vs 상대팀: ${strengthDiff.opponentRating.toFixed(1)}</div>
        <div>전력 차이: ${strengthDiff.difference > 0 ? '+' : ''}${strengthDiff.difference.toFixed(1)} (${strengthDiff.userAdvantage ? '유리' : '불리'})</div>
        <div>사기 변화: ${tacticEffect > 0 ? '+' : ''}${tacticEffect}</div>
    `;
    document.getElementById('eventList').appendChild(tacticInfo);

    // === 10단계: 킥오프 버튼 표시 ===
    showKickoffButton(matchData, tacticSystem, strengthDiff);
}

// 킥오프 버튼 표시
function showKickoffButton(matchData, tacticSystem, strengthDiff) {
    const eventList = document.getElementById('eventList');
    
    // 킥오프 안내 메시지
    const kickoffInfo = document.createElement('div');
    kickoffInfo.className = 'event-card kickoff-ready';
    kickoffInfo.innerHTML = `
        <div class="event-time">준비 완료</div>
        <div>경기 시작 준비가 완료되었습니다.</div>
        <button id="kickoffBtn" class="btn primary" style="margin-top: 10px;">⚽ 킥오프</button>
    `;
    eventList.appendChild(kickoffInfo);

    // 킥오프 버튼 이벤트
    document.getElementById('kickoffBtn').addEventListener('click', () => {
        startMatchSimulation(matchData, tacticSystem, strengthDiff);
        kickoffInfo.remove(); // 킥오프 버튼 제거
    });
}

// 실제 경기 시뮬레이션 시작
function startMatchSimulation(matchData, tacticSystem, strengthDiff) {
    matchData.isRunning = true;
    matchData.strengthDiff = strengthDiff; // 전력 차이 데이터 저장
    matchData.intervalId = null; // 인터벌 ID 저장
    // 킥오프 메시지
    const kickoffEvent = {
        minute: 0,
        type: 'kickoff',
        description: `🟢 경기 시작! ${teamNames[matchData.homeTeam]} vs ${teamNames[matchData.awayTeam]}`
    };
    displayEvent(kickoffEvent, matchData);

    // 경기 시뮬레이션 시작
    simulateMatch(matchData, tacticSystem);
}

function simulateMatch(matchData, tacticSystem) {
    const matchInterval = setInterval(function simulationTick() { // 함수에 이름 부여
        // 경기가 90분 이상 진행되면 인터벌을 완전히 종료
        if (matchData.minute >= 90) {
            clearInterval(matchInterval);
            if (matchData.minute >= 90 && !matchData.isEnded) {
                matchData.isEnded = true;
                endMatch(matchData);
            }
            return;
        }

        // 경기가 일시정지 상태이면(부상 등), 시간만 흐르지 않도록 하고 인터벌은 유지
        if (!matchData.isRunning) {
            return;
        }

        matchData.minute++;
        document.getElementById('matchTime').textContent = matchData.minute + '분';

        // 40% 확률로 이벤트 발생
        if (Math.random() > 0.4) {
            return;
        }
        
        // ===== 부상 체크 =====
        const injuryResult = injurySystem.checkInjury(matchData);
        if (injuryResult.occurred) {
            const event = createInjuryEvent(matchData, injuryResult);
            displayEvent(event, matchData);
            if (injuryResult.isUserTeam) handleForcedSubstitution(injuryResult.player, matchData);
            return; // 부상 발생 시 이번 틱 종료
        }

        // 이벤트 발생 확률 계산
        const userModifiers = tacticSystem.getTacticModifiers(gameData.currentTactic);
        const opponentTactic = tacticSystem.getOpponentTactic(gameData.currentOpponent);
        const opponentModifiers = tacticSystem.getTacticModifiers(opponentTactic);


        // 전술 상성 효과 계산
        const tacticAdvantage = matchData.tacticAdvantage;

        // 실시간 전력차 사용
        const strengthFactor = (matchData.userTeamRating - matchData.opponentTeamRating) / 60;

        const upsetMode = Math.random() < 0.07;
        let upsetFactor = 0;

        if (upsetMode) {
            upsetFactor = (Math.random() * 0.15) + 0.05;
            
            if (matchData.minute % 10 === 0) {
                const upsetEvent = {
                    minute: matchData.minute,
                    type: 'upset',
                    description: `✨ ${matchData.userTeamRating > matchData.opponentTeamRating ? teamNames[gameData.currentOpponent] : teamNames[gameData.selectedTeam]}이(가) 예상 외의 좋은 플레이를 보이고 있습니다!`
                };
                displayEvent(upsetEvent, matchData);
            }
        }

        // ===== 부상 체크를 먼저 독립적으로 수행 =====
        const injuryRoll = Math.random();
        if (injuryRoll < 0.55) {
            const injuryResult = injurySystem.checkInjury(matchData);
            if (injuryResult.occurred) {
                const event = createInjuryEvent(matchData, injuryResult);
                displayEvent(event, matchData);
                return; // 부상 발생 시 이번 틱 종료
            }
        }

        // 기본 이벤트 확률 (부상 제외하고 재조정)
        let baseGoalChance = 0.015;
        const baseFoulChance = 0.082;
        const basePassChance = 0.753;
        const baseThrowInChance = 0.06;
        const baseGoalKickChance = 0.04;
        const baseCornerChance = 0.05;

        const eventRoll = Math.random();
        let event = null;

        // 골 확률 계산
        let userGoalChance = baseGoalChance + userModifiers.goalChance;
        let opponentGoalChance = baseGoalChance + opponentModifiers.goalChance;

        // 전술 상성 효과를 골 확률에 반영
        if (tacticAdvantage > 0) {
            userGoalChance += tacticAdvantage * 0.002;
            opponentGoalChance -= tacticAdvantage * 0.001;
        } else if (tacticAdvantage < 0) {
            userGoalChance += tacticAdvantage * 0.002;
            opponentGoalChance -= tacticAdvantage * 0.001;
        }

        // 수비형 전술 효과
        if (userModifiers.goalChance < 0) {
            opponentGoalChance += userModifiers.goalChance;
            userGoalChance -= userModifiers.goalChance * 0.5;
        }
        if (opponentModifiers.goalChance < 0) {
            userGoalChance += opponentModifiers.goalChance;
            opponentGoalChance -= opponentModifiers.goalChance * 0.5;
        }

        // 전력차 및 이변 효과 반영
        if (matchData.userTeamRating > matchData.opponentTeamRating) {
            userGoalChance += Math.abs(strengthFactor) * 0.5;
            opponentGoalChance -= Math.abs(strengthFactor) * 0.2;
            
            if (upsetMode) {
                opponentGoalChance += upsetFactor;
                userGoalChance -= upsetFactor * 0.3;
            }
        } else {
            opponentGoalChance += Math.abs(strengthFactor) * 0.5;
            userGoalChance -= Math.abs(strengthFactor) * 0.3;
            
            if (upsetMode) {
                userGoalChance += upsetFactor;
                opponentGoalChance -= upsetFactor * 0.3;
            }
        }

        const randomVariation = 0.8 + (Math.random() * 0.4);
        userGoalChance *= randomVariation;
        opponentGoalChance *= (2 - randomVariation);

        userGoalChance = Math.max(0.01, userGoalChance);
        opponentGoalChance = Math.max(0.01, opponentGoalChance);

        // 이벤트 결정
        let cumulativeChance = 0;

        cumulativeChance += userGoalChance;
        if (eventRoll < cumulativeChance) {
            event = createGoalEvent(matchData, true);
        } else {
            cumulativeChance += opponentGoalChance;
            if (eventRoll < cumulativeChance) {
                event = createGoalEvent(matchData, false);
            } else {
                cumulativeChance += baseFoulChance;
                if (eventRoll < cumulativeChance) {
                    event = createFoulEvent(matchData);
                } else {
                    cumulativeChance += basePassChance;
                    if (eventRoll < cumulativeChance) {
                        event = createPassEvent(matchData);
                    } else {
                        cumulativeChance += baseThrowInChance;
                        if (eventRoll < cumulativeChance) {
                            event = createThrowInEvent(matchData);
                        } else {
                            cumulativeChance += baseGoalKickChance;
                            if (eventRoll < cumulativeChance) {
                                event = createGoalKickEvent(matchData);
                            } else {
                                event = createCornerEvent(matchData);
                            }
                        }
                    }
                }
            }
        }

        if (event) {
            displayEvent(event, matchData);
        }

        matchData.intervalId = matchInterval; // 인터벌 ID 저장
    }, 1000);
}



    function createGoalEvent(matchData, isUserTeam) {
    const team = isUserTeam ? gameData.selectedTeam : gameData.currentOpponent;
    const teamName = teamNames[team];
    
    let scorer = null;
    let scorerPosition = null;
    
    if (isUserTeam) {
        const squad = gameData.squad;
        const possibleScorers = [];
        
        // FW: rating 기준으로 정렬 후 가중치 적용
        const sortedFW = squad.fw.filter(p => p).sort((a, b) => b.rating - a.rating);
        sortedFW.forEach((player, index) => {
            // 1등: 80회, 2등: 65회, 3등: 50회 (15씩 감소, 1등/2등 = 1.23배, 1등/3등 = 1.6배)
            const weight = Math.max(80 - (index * 15), 35);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        // MF: rating 기준으로 정렬 후 가중치 적용
        const sortedMF = squad.mf.filter(p => p).sort((a, b) => b.rating - a.rating);
        sortedMF.forEach((player, index) => {
            // 1등: 24회, 2등: 19회, 3등: 15회 (5, 4씩 감소, 1등/3등 = 1.6배)
            const weights = [24, 19, 15, 12, 10];
            const weight = weights[index] !== undefined ? weights[index] : 10;
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        // DF: rating 기준으로 정렬 후 가중치 적용
        const sortedDF = squad.df.filter(p => p).sort((a, b) => b.rating - a.rating);
        sortedDF.forEach((player, index) => {
            // 1등: 5회, 2등: 4회, 3등: 3회, 4등: 2회 (완만한 감소)
            const weight = Math.max(5 - index, 2);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        if (possibleScorers.length > 0) {
            scorer = possibleScorers[Math.floor(Math.random() * possibleScorers.length)];
        }

    } else {
        const teamPlayers = teams[team];
        const forwards = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
        const midfielders = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const defenders = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        
        const possibleScorers = [];
        
        forwards.slice(0, 3).forEach((player, index) => {
            const weight = Math.max(75 - (index * 10), 35);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        midfielders.slice(0, 3).forEach((player, index) => {
            const weight = Math.max(21 - (index * 3), 9);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        defenders.slice(0, 4).forEach((player, index) => {
            const weight = Math.max(4 - index, 2);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        if (possibleScorers.length > 0) {
            scorer = possibleScorers[Math.floor(Math.random() * possibleScorers.length)];
        }
    }
    
    // 나머지 코드는 동일...

    // 어시스트 선수 결정 (rating 기반 가중치 적용)
let assister = null;
const hasAssist = Math.random() < 0.85;

if (hasAssist && scorer) {
    if (isUserTeam) {
        const squad = gameData.squad;
        const possibleAssisters = [];
        
        // FW: rating 기준으로 정렬 후 가중치 적용
        const sortedFW = squad.fw.filter(p => p && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        sortedFW.forEach((player, index) => {
            // 1등: 50회, 2등: 43회, 3등: 36회 (7씩 감소)
            const weight = Math.max(50 - (index * 7), 22);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        // MF: rating 기준으로 정렬 후 가중치 적용
        const sortedMF = squad.mf.filter(p => p && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        sortedMF.forEach((player, index) => {
            // 1등: 45회, 2등: 39회, 3등: 33회 (6씩 감소)
            const weight = Math.max(45 - (index * 6), 21);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        // DF: rating 기준으로 정렬 후 가중치 적용
        const sortedDF = squad.df.filter(p => p && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        sortedDF.forEach((player, index) => {
            // 1등: 5회, 2등: 4회, 3등: 4회, 4등: 3회 (1씩 감소)
            const weight = Math.max(5 - index, 3);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        if (possibleAssisters.length > 0) {
            assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
        }
    } else {
        const teamPlayers = teams[team];
        const forwards = teamPlayers.filter(p => p.position === 'FW' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        const midfielders = teamPlayers.filter(p => p.position === 'MF' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        const defenders = teamPlayers.filter(p => p.position === 'DF' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        
        const possibleAssisters = [];
        
        forwards.slice(0, 3).forEach((player, index) => {
            const weight = Math.max(50 - (index * 7), 22);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        midfielders.slice(0, 3).forEach((player, index) => {
            const weight = Math.max(45 - (index * 6), 21);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        defenders.slice(0, 4).forEach((player, index) => {
            const weight = Math.max(5 - index, 3);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        if (possibleAssisters.length > 0) {
            assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
        }
    }
}

    // 점수 업데이트 (기존 코드 동일)
    if (isUserTeam) {
        matchData.homeScore++;
    } else {
        matchData.awayScore++;
    }

    document.getElementById('scoreDisplay').textContent = `${matchData.homeScore} - ${matchData.awayScore}`;

    // 나머지 골 메시지 생성 코드는 동일...
    // (기존 코드 그대로 유지)
    
    let specialMessage = "";
    const totalGoals = matchData.homeScore + matchData.awayScore;
    const scoreDiff = Math.abs(matchData.homeScore - matchData.awayScore);
    
    if (totalGoals === 1) {
        specialMessage = " 🚀 선제골!";
    }
    
    if (matchData.minute >= 85) {
        if (scoreDiff <= 1) {
            specialMessage += " 🔥 극적인 골!";
        } else if (scoreDiff === 2) {
            specialMessage += " ⚡ 결정적인 골!";
        }
    } else if (matchData.minute >= 75) {
        if (scoreDiff === 1) {
            specialMessage += " ⚡ 후반 중요한 동점골!";
        } else {
            specialMessage += " ⚡ 후반 중요한 골!";
        }
    } else if (matchData.minute <= 5) {
        if (totalGoals === 1) {
            specialMessage = " 🚀 경기 시작과 함께 선제골!";
        } else {
            specialMessage += " 🚀 경기 초반 골!";
        }
    }
    
    if (totalGoals >= 2) {
        const prevScoreDiff = isUserTeam ? 
            Math.abs((matchData.homeScore - 1) - matchData.awayScore) : 
            Math.abs(matchData.homeScore - (matchData.awayScore - 1));
        
        if (scoreDiff === 0) {
            specialMessage += " ⚖️ 동점골!";
        }
        else if (prevScoreDiff >= 2 && scoreDiff <= 1) {
            specialMessage += " 🎯 추격골!";
        }
        else if (totalGoals >= 3) {
            const prevHomeScore = isUserTeam ? matchData.homeScore - 1 : matchData.homeScore;
            const prevAwayScore = isUserTeam ? matchData.awayScore : matchData.awayScore - 1;
            
            if ((isUserTeam && prevHomeScore < prevAwayScore && matchData.homeScore > matchData.awayScore) ||
                (!isUserTeam && prevAwayScore < prevHomeScore && matchData.awayScore > matchData.homeScore)) {
                specialMessage += " 🔄 역전골!";
            }
        }
    }

    const assistMessages = [
        "의 화려한 드리블 이후 완벽한 패스!",
        "의 감각적인 터치로 골문을 열어줬습니다!",
        "의 환상적인 개인기 후 찬스 메이킹!",
        "의 빠른 발놀림으로 수비를 농락한 뒤 어시스트!",
        "의 침착한 마무리 패스가 골로 연결됐습니다!",
        "의 눈부신 볼 컨트롤 후 결정적 패스!",
        "의 순간적인 판단력이 빛난 어시스트!",
        "의 기습적인 돌파 후 완벽한 패스!",
        "의 예술적인 터치가 골을 만들어냈습니다!",
        "의 창조적인 플레이로 골 기회 창출!",
        "의 감각적인 아웃프런트 패스!",
        "의 환상적인 시야로 완벽한 찬스 메이킹!",
        "의 정교한 스루패스가 수비라인을 갈랐습니다!",
        "의 킬패스가 골문을 열어젖혔습니다!",
        "의 날카로운 침투패스!",
        "의 절묘한 타이밍의 패스!",
        "의 예측불허 패스가 골로 이어졌습니다!",
        "의 완벽한 게임 리딩으로 만든 골!",
        "의 천재적인 발상의 전환으로 어시스트!",
        "의 마에스트로다운 패스 워크!",
        "의 놀라운 장거리 패스!",
        "의 예상치 못한 오버래핑으로 크로스!",
        "의 기습적인 측면 돌파 후 센터링!",
        "의 롱볼이 완벽하게 연결됐습니다!",
        "의 의외의 공격 가담으로 어시스트!"
    ];

    function getAssistMessage(assisterPosition) {
        let messagePool = [];
        
        if (assisterPosition === 'FW') {
            messagePool = assistMessages.slice(0, 10);
        } else if (assisterPosition === 'MF') {
            messagePool = assistMessages.slice(10, 20);
        } else if (assisterPosition === 'DF') {
            messagePool = assistMessages.slice(20, 25);
        } else {
            messagePool = assistMessages.slice(10, 15);
        }
        
        return messagePool[Math.floor(Math.random() * messagePool.length)];
    }

    const goalFinishMessages = [
        "의 완벽한 골!",
        "의 환상적인 골!",
        "의 멋진 골!",
        "의 강력한 골!",
        "의 정확한 골!",
        "의 침착한 골!",
        "의 기막힌 골!",
        "의 예술적인 골!",
        "의 완성도 높은 골!",
        "의 절묘한 골!",
        "가 골네트를 흔들었습니다!",
        "가 골문을 갈랐습니다!",
        "의 마무리가 골로 이어졌습니다!",
        "가 골을 만들어냈습니다!",
        "의 슛이 골문을 찾았습니다!"
    ];

    let goalDescription;
    if (assister) {
        const assistMessage = getAssistMessage(assister.position);
        const goalFinish = goalFinishMessages[Math.floor(Math.random() * goalFinishMessages.length)];
        
        goalDescription = `⚽ ${teamName}의 ${assister.name}(${assister.rating})${assistMessage} ${scorer.name}(${scorer.rating})${goalFinish}${specialMessage}`;
    } else {
        const soloGoalMessages = [
            "의 개인기가 빛난 골!",
            "의 독주골!",
            "가 혼자서 만들어낸 골!",
            "의 단독 돌파골!",
            "의 완벽한 개인플레이!",
            "의 기막힌 개인기!",
            "가 혼자 힘으로 골을 만들었습니다!",
            "의 솔로런이 골로 이어졌습니다!",
            "의 순간적인 판단력이 만든 골!",
            "의 클래스가 돋보인 골!"
        ];
        
        const soloMessage = soloGoalMessages[Math.floor(Math.random() * soloGoalMessages.length)];
        goalDescription = `⚽ ${teamName}의 ${scorer ? scorer.name : '선수'}(${scorer ? scorer.rating : '?'})${soloMessage}${specialMessage}`;
    }

    return {
        minute: matchData.minute,
        type: 'goal',
        team: teamName,
        scorer: scorer ? scorer.name : '선수',
        assister: assister ? assister.name : null,
        description: goalDescription
    };
}

function createFoulEvent(matchData) {
    const teams = [gameData.selectedTeam, gameData.currentOpponent];
    const team = teams[Math.floor(Math.random() * teams.length)];
    
    return {
        minute: matchData.minute,
        type: 'foul',
        team: teamNames[team],
        description: `⚠️ ${teamNames[team]}의 파울입니다.`
    };
}

function createPassEvent(matchData) {
    const teams = [gameData.selectedTeam, gameData.currentOpponent];
    const team = teams[Math.floor(Math.random() * teams.length)];
    const message = passMessages[Math.floor(Math.random() * passMessages.length)];
    
    return {
        minute: matchData.minute,
        type: 'pass',
        team: teamNames[team],
        description: `⚽ ${teamNames[team]}${message}`
    };
}

function createThrowInEvent(matchData) {
    const teams = [gameData.selectedTeam, gameData.currentOpponent];
    const team = teams[Math.floor(Math.random() * teams.length)];
    
    return {
        minute: matchData.minute,
        type: 'throwin',
        team: teamNames[team],
        description: `🤾 ${teamNames[team]}의 스로인입니다.`
    };
}

function createGoalKickEvent(matchData) {
    const teams = [gameData.selectedTeam, gameData.currentOpponent];
    const team = teams[Math.floor(Math.random() * teams.length)];
    
    return {
        minute: matchData.minute,
        type: 'goalkick',
        team: teamNames[team],
        description: `🥅 ${teamNames[team]}의 골킥입니다.`
    };
}

function createCornerEvent(matchData) {
    const teams = [gameData.selectedTeam, gameData.currentOpponent];
    const team = teams[Math.floor(Math.random() * teams.length)];
    
    return {
        minute: matchData.minute,
        type: 'corner',
        team: teamNames[team],
        description: `🚩 ${teamNames[team]}의 코너킥입니다.`
    };
}

// createCornerEvent 함수 다음에 추가

function createInjuryEvent(matchData, injuryResult) {
    const severityMessages = [
        "쓰려졌습니다.",
        "부상으로 교체되었습니다.",
        "부상을 당해 들것에 실려 나갔습니다."
    ];
    
    const severity = injuryResult.gamesOut - 1; // 0, 1, 2
    const message = severityMessages[Math.min(severity, 2)];
    
    return {
        minute: matchData.minute,
        type: 'injury',
        team: injuryResult.teamName,
        description: `🚑 ${injuryResult.teamName}의 ${injuryResult.player.name}(${injuryResult.player.rating})이(가) ${message} ${injuryResult.gamesOut}경기 결장 예정.`
    };
}

function displayEvent(event, matchData) {
    const eventList = document.getElementById('eventList');
    const eventCard = document.createElement('div');
    
    // 이벤트 타입에 따라 클래스 추가
    eventCard.className = `event-card ${event.type}`;
    
    eventCard.innerHTML = `
        <div class="event-time">${event.minute}분</div>
        <div>${event.description}</div>
    `;
    
    eventList.appendChild(eventCard);
    eventList.scrollTop = eventList.scrollHeight;
    
    matchData.events.push(event);
}

function endMatch(matchData) {
    document.getElementById('endMatchBtn').style.display = 'block';
    document.getElementById('substituteBtn').style.display = 'none'; // 교체 버튼 숨기기
    
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

    // 경기 후 스카우트 활동 처리
    if (gameData.hiredScout) {
        const scout = scoutingSystem.scouts[gameData.hiredScout.tier];
        if (scout && Math.random() < scout.chance) {
            const result = scoutingSystem.scoutForPlayers(gameData.hiredScout.tier);
            if (result.success) {
                setTimeout(() => {
                    alert(`[스카우트 보고서]\n${result.message}`);
                    displayScoutedPlayers(result.players);
                    displayYouthPlayers();
                }, 1500);
            }
        }

        gameData.hiredScout.remainingMatches--;
        if (gameData.hiredScout.remainingMatches <= 0) {
            setTimeout(() => {
                alert(`[계약 만료] ${scout.name}과의 계약이 만료되었습니다.`);
                gameData.hiredScout = null;
            }, 2000);
        }
    }
    
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
    
    // endMatch 함수 끝부분 (기존 코드 찾아서 수정)
    
    // AI 팀들 경기 시뮬레이션
    simulateOtherMatches();

    // 경기 종료 후 처리 (부상, 은퇴, 시즌종료 체크)
    setTimeout(() => {
        processRetirementsAndReincarnations(); // 은퇴 및 환생 처리
        checkSeasonEnd(); // 시즌 종료 조건 체크
    }, 1000);
    
    // ✅✅ 부상 선수를 스쿼드에서 제거 (추가!)
    injurySystem.removeInjuredFromSquad();
}
function updateLeagueData(matchData, points) {
    // 현재 리그 확인
    const currentLeague = gameData.currentLeague;
    const divisionKey = `division${currentLeague}`;
    
    // 사용자 팀 데이터 업데이트
    const userData = gameData.leagueData[divisionKey][gameData.selectedTeam];
    if (!userData) {
        console.error('User team data not found:', gameData.selectedTeam);
        return;
    }
    
    userData.matches++;
    userData.goalsFor += matchData.homeScore;
    userData.goalsAgainst += matchData.awayScore;
    userData.points += points;
    
    if (points === 3) {
        userData.wins++;
    } else if (points === 1) {
        userData.draws++;
    } else {
        userData.losses++;
    }
    
    // 상대팀 데이터 업데이트 - 같은 리그에 있다고 가정
    const opponentData = gameData.leagueData[divisionKey][gameData.currentOpponent];
    if (!opponentData) {
        console.error('Opponent team data not found:', gameData.currentOpponent);
        return;
    }
    
    opponentData.matches++;
    opponentData.goalsFor += matchData.awayScore;
    opponentData.goalsAgainst += matchData.homeScore;
    
    if (matchData.homeScore > matchData.awayScore) {
        opponentData.losses++;
    } else if (matchData.homeScore < matchData.awayScore) {
        opponentData.wins++;
        opponentData.points += 3;
    } else {
        opponentData.draws++;
        opponentData.points += 1;
    }
    // 경기 종료 버튼 이벤트
    document.getElementById('endMatchBtn').onclick = () => {
        // 부상 선수 업데이트
        if (typeof injurySystem !== 'undefined') {
            injurySystem.updateInjuries();
            injurySystem.removeInjuredFromSquad();
        }
        
        // 인터뷰 화면으로 이동
        startInterview(result, userScore, opponentScore, strengthDiff);
    };
    
}

function simulateOtherMatches() {
    // 현재 리그 확인 및 division 키 생성
    const currentLeague = gameData.currentLeague;
    const divisionKey = `division${currentLeague}`;
    
    // 현재 리그 데이터 존재 여부 확인
    if (!gameData.leagueData || !gameData.leagueData[divisionKey]) {
        console.error('League data not found for:', divisionKey);
        return;
    }
    
    // 같은 리그의 다른 팀들만 필터링 (사용자 팀과 현재 상대팀 제외)
    const otherTeams = Object.keys(gameData.leagueData[divisionKey]).filter(team => 
        team !== gameData.selectedTeam && team !== gameData.currentOpponent
    );
    
    // 짝수개의 팀들을 랜덤하게 매칭
    for (let i = 0; i < otherTeams.length - 1; i += 2) {
        const team1 = otherTeams[i];
        const team2 = otherTeams[i + 1];
        
        // 각 팀의 전력 계산
        const team1Rating = calculateOpponentTeamRating(team1);
        const team2Rating = calculateOpponentTeamRating(team2);
        const ratingDiff = team1Rating - team2Rating;
        
        // 이변 요소 (10% 확률로 이변 발생)
        const upsetOccurs = Math.random() < 0.08;
        
        // 전력 차이에 따른 확률 조정
        let team1WinChance = 0.33; // 기본 33%
        let team2WinChance = 0.33; // 기본 33%
        let drawChance = 0.34; // 기본 34%
        
        if (ratingDiff > 0) {
            // team1이 더 강함
            const advantage = Math.min(0.3, ratingDiff / 150); // 최대 30% 우위
            team1WinChance += advantage;
            team2WinChance -= advantage * 0.7;
            drawChance -= advantage * 0.3;
            
            // 이변 발생 시 약한 팀에게 보너스
            if (upsetOccurs) {
                const upsetBonus = 0.15 + (Math.random() * 0.15); // 15~30% 보너스
                team2WinChance += upsetBonus;
                team1WinChance -= upsetBonus * 0.6;
                drawChance -= upsetBonus * 0.4;
            }
        } else if (ratingDiff < 0) {
            // team2가 더 강함
            const advantage = Math.min(0.3, Math.abs(ratingDiff) / 100);
            team2WinChance += advantage;
            team1WinChance -= advantage * 0.7;
            drawChance -= advantage * 0.3;
            
            // 이변 발생 시 약한 팀에게 보너스
            if (upsetOccurs) {
                const upsetBonus = 0.15 + (Math.random() * 0.15); // 15~30% 보너스
                team1WinChance += upsetBonus;
                team2WinChance -= upsetBonus * 0.6;
                drawChance -= upsetBonus * 0.4;
            }
        } else {
            // 비슷한 전력일 때도 랜덤 요소
            const randomFactor = (Math.random() - 0.5) * 0.2; // ±10%
            team1WinChance += randomFactor;
            team2WinChance -= randomFactor;
        }
        
        // 확률 보정 (음수 방지 및 합계 1.0 유지)
        team1WinChance = Math.max(0.05, team1WinChance);
        team2WinChance = Math.max(0.05, team2WinChance);
        drawChance = Math.max(0.05, drawChance);
        
        const total = team1WinChance + team2WinChance + drawChance;
        team1WinChance /= total;
        team2WinChance /= total;
        drawChance /= total;
        
        const resultRoll = Math.random();
        let score1, score2;
        
        if (resultRoll < team1WinChance) {
            // team1 승리 - 더 현실적인 스코어
            if (upsetOccurs && ratingDiff < 0) {
                // 이변 승리는 간신히 이기는 느낌
                score1 = Math.floor(Math.random() * 2) + 1; // 1-2골
                score2 = Math.floor(Math.random() * 2); // 0-1골
            } else {
                // 일반 승리도 현실적으로
                const goalType = Math.random();
                if (goalType < 0.4) {
                    // 40% - 1골 승부
                    score1 = 1;
                    score2 = 0;
                } else if (goalType < 0.7) {
                    // 30% - 2골 차 승부
                    score1 = 2;
                    score2 = Math.random() < 0.5 ? 0 : 1;
                } else if (goalType < 0.9) {
                    // 20% - 3골 이상 게임
                    score1 = Math.floor(Math.random() * 2) + 2; // 2-3골
                    score2 = Math.floor(Math.random() * 2); // 0-1골
                } else {
                    // 10% - 높은 득점 게임
                    score1 = Math.floor(Math.random() * 3) + 2; // 2-4골
                    score2 = Math.floor(Math.random() * 3); // 0-2골
                }
            }
        } else if (resultRoll < team1WinChance + team2WinChance) {
            // team2 승리 - 더 현실적인 스코어
            if (upsetOccurs && ratingDiff > 0) {
                // 이변 승리는 간신히 이기는 느낌
                score2 = Math.floor(Math.random() * 2) + 1; // 1-2골
                score1 = Math.floor(Math.random() * 2); // 0-1골
            } else {
                // 일반 승리도 현실적으로
                const goalType = Math.random();
                if (goalType < 0.4) {
                    // 40% - 1골 승부
                    score2 = 1;
                    score1 = 0;
                } else if (goalType < 0.7) {
                    // 30% - 2골 차 승부
                    score2 = 2;
                    score1 = Math.random() < 0.5 ? 0 : 1;
                } else if (goalType < 0.9) {
                    // 20% - 3골 이상 게임
                    score2 = Math.floor(Math.random() * 2) + 2; // 2-3골
                    score1 = Math.floor(Math.random() * 2); // 0-1골
                } else {
                    // 10% - 높은 득점 게임
                    score2 = Math.floor(Math.random() * 3) + 2; // 2-4골
                    score1 = Math.floor(Math.random() * 3); // 0-2골
                }
            }
        } else {
            // 무승부 - 더 다양한 스코어
            const drawType = Math.random();
            if (drawType < 0.4) {
                // 40% - 0-0 무승부
                score1 = 0;
                score2 = 0;
            } else if (drawType < 0.7) {
                // 30% - 1-1 무승부
                score1 = 1;
                score2 = 1;
            } else if (drawType < 0.9) {
                // 20% - 2-2 무승부
                score1 = 2;
                score2 = 2;
            } else {
                // 10% - 3-3 이상 무승부
                const drawScore = Math.floor(Math.random() * 2) + 3; // 3-4골
                score1 = drawScore;
                score2 = drawScore;
            }
        }
        
        // 리그 데이터 업데이트 (수정된 부분)
        const team1Data = gameData.leagueData[divisionKey][team1];
        const team2Data = gameData.leagueData[divisionKey][team2];
        
        // 데이터 존재 여부 확인
        if (!team1Data || !team2Data) {
            console.error('Team data not found:', team1, team1Data, team2, team2Data);
            continue; // 이 매치는 스킵하고 다음으로
        }
        
        team1Data.matches++;
        team1Data.goalsFor += score1;
        team1Data.goalsAgainst += score2;
        
        team2Data.matches++;
        team2Data.goalsFor += score2;
        team2Data.goalsAgainst += score1;
        
        if (score1 > score2) {
            team1Data.wins++;
            team1Data.points += 3;
            team2Data.losses++;
        } else if (score1 < score2) {
            team2Data.wins++;
            team2Data.points += 3;
            team1Data.losses++;
        } else {
            team1Data.draws++;
            team2Data.draws++;
            team1Data.points += 1;
            team2Data.points += 1;
        }
    }
}

function startInterview(result, userScore, opponentScore, strengthDiff) {
    showScreen('interviewScreen');
    
    const questions = getInterviewQuestions(result, userScore, opponentScore, strengthDiff);
    const randomQuestion = questions[Math.floor(Math.random() * questions.length)];
    
    document.getElementById('interviewQuestion').textContent = randomQuestion.question;
    
    const optionButtons = document.querySelectorAll('.interview-btn');
    randomQuestion.options.forEach((option, index) => {
        if (optionButtons[index]) {
            optionButtons[index].textContent = option.text;
            optionButtons[index].dataset.morale = option.morale;
            optionButtons[index].style.display = 'block';
        }
    });
    
    // 사용하지 않는 버튼 숨기기
    for (let i = randomQuestion.options.length; i < optionButtons.length; i++) {
        optionButtons[i].style.display = 'none';
    }
}

function getInterviewQuestions(result, userScore, opponentScore, strengthDiff) {
    const scoreDiff = Math.abs(userScore - opponentScore);
    const isUpset = (result === '승리' && !strengthDiff.userAdvantage) || 
                   (result === '패배' && strengthDiff.userAdvantage);
    
    if (result === '승리') {
        if (isUpset) {
            // 업셋 승리
            return [{
                question: "전력상 불리했던 상대를 상대로 훌륭한 승리를 거뒀는데 소감은?",
                options: [
                    { text: "선수들이 정말 대단했습니다! 불가능을 가능하게 만들었어요!", morale: 20 },
                    { text: "우리의 전술과 준비가 완벽했습니다. 이런 결과가 우연이 아닙니다!", morale: 15 },
                    { text: "좋은 결과지만 상대가 컨디션이 좋지 않았던 것 같네요.", morale: 5 }
                ]
            }];
        } else if (scoreDiff >= 3) {
            // 대승
            return [{
                question: "예상대로 대승을 거둔 소감은 어떠신가요?",
                options: [
                    { text: "선수들이 정말 훌륭했습니다! 완벽한 경기였어요!", morale: 15 },
                    { text: "우리의 실력을 보여준 경기였습니다. 계속 이렇게 하겠습니다!", morale: 10 },
                    { text: "상대가 너무 약했네요. 별로 의미 없는 승리입니다.", morale: -5 }
                ]
            }];
        } else {
            // 일반 승리
            return [{
                question: "승리를 거둔 소감은 어떠신가요?",
                options: [
                    { text: "정말 훌륭한 경기였습니다! 여러분이 자랑스럽습니다!", morale: 10 },
                    { text: "팀워크가 빛났습니다! 계속 이렇게 해봅시다!", morale: 5 },
                    { text: "몇몇 실수는 아쉬웠습니다. 다음에는 더 집중해야 합니다.", morale: -5 }
                ]
            }];
        }
    } else if (result === '패배') {
        if (isUpset) {
            // 충격적 패배
            return [{
                question: "전력상 유리했음에도 불구하고 패배했는데 어떻게 생각하시나요?",
                options: [
                    { text: "몇몇의 선수들은 도대체 뭘 하는건지 모르겠습니다. 오늘의 태도는 최악이었고 더 나아지지 못한다면 이 팀에서 방출될 수도 있을 것입니다.", morale: 20 },
                    { text: "실망스럽지만 축구는 그런 스포츠입니다. 다음에는 더 집중하겠습니다.", morale: -10 },
                    { text: "상대가 정말 잘했습니다. 우리도 배울 점이 있었어요.", morale: 0 }
                ]
            }];
        } else if (scoreDiff >= 3) {
            // 대패
            return [{
                question: "어려운 상대를 만나 대패를 당했는데 소감은?",
                options: [
                    { text: "이번 경기는 정말 실망스러웠습니다. 더 잘할 수 있었는데...", morale: -15 },
                    { text: "상대가 훨씬 강했습니다. 우리는 더 많이 배우고 성장해야 합니다.", morale: -5 },
                    { text: "힘든 경기를 치렀지만, 여러분의 노력은 인정합니다. 다음에 더 좋은 결과를 기대합니다.", morale: 5 }
                ]
            }];
        } else {
            // 일반 패배
            return [{
                question: "아쉬운 패배를 당했는데 소감은 어떠신가요?",
                options: [
                    { text: "이번 경기는 정말 실망스러웠습니다. 더 잘할 수 있었는데...", morale: -10 },
                    { text: "아쉽지만 상대가 더 잘했습니다. 다음에는 더 준비해서 임하겠습니다.", morale: -3 },
                    { text: "힘든 경기를 치렀지만, 여러분의 노력은 인정합니다.", morale: 5 }
                ]
            }];
        }
    } else {
        // 무승부
        if (strengthDiff.userAdvantage && strengthDiff.strengthGap > 10) {
            // 강한 팀이 무승부
            return [{
                question: "유리한 전력에도 불구하고 무승부로 끝났는데 소감은?",
                options: [
                    { text: "승리할 수 있었던 우리 팀이 겨우 이정도라니, 정말 실망스럽습니다.", morale: 10 },
                    { text: "상대의 수비가 견고했습니다. 다음에는 더 창의적으로 공격하겠습니다.", morale: -3 },
                    { text: "무승부도 나쁘지 않은 결과입니다. 꾸준히 발전하고 있어요.", morale: 2 }
                ]
            }];
        } else if (!strengthDiff.userAdvantage && strengthDiff.strengthGap > 10) {
            // 약한 팀이 무승부
            return [{
                question: "강한 상대를 상대로 무승부를 기록했는데 소감은?",
                options: [
                    { text: "정말 자랑스러운 결과입니다! 선수들이 최선을 다했어요!", morale: 12 },
                    { text: "좋은 결과입니다. 우리의 가능성을 보여준 경기였어요.", morale: 8 },
                    { text: "승리까지 이어가지 못해 아쉽습니다.", morale: 9 }
                ]
            }];
        } else {
            // 비슷한 전력 간 무승부
            return [{
                question: "팽팽한 경기에서 무승부로 경기가 끝났는데 소감은?",
                options: [
                    { text: "더 좋은 결과를 원했지만, 선수들이 최선을 다했습니다.", morale: 3 },
                    { text: "승리할 수 있었던 경기였는데 아쉽습니다.", morale: -5 },
                    { text: "무승부도 나쁘지 않은 결과입니다. 다음 경기에 집중하겠습니다.", morale: 1 }
                ]
            }];
        }
    }
}

function handleInterview(option) {
    const moraleChange = parseInt(document.querySelector(`[data-option="${option}"]`).dataset.morale);
    
    gameData.teamMorale = Math.max(0, Math.min(100, gameData.teamMorale + moraleChange));
    
    // 다음 상대 설정
    setNextOpponent();
    
    // 시즌 종료 체크
    checkSeasonEnd();
    
    // 로비로 돌아가기
    showScreen('lobby');
    updateDisplay();
    
    alert(`인터뷰 완료! 팀 사기가 ${moraleChange > 0 ? '+' : ''}${moraleChange} 변했습니다.\n현재 사기: ${gameData.teamMorale}`);
}





// tacticSystem.js 파일 맨 끝에 추가

// ==================== 부상 시스템 ====================
class InjurySystem {
    constructor() {
        this.injuredPlayers = new Map(); // 부상당한 선수 목록
    }

    checkInjury(matchData) {
        const injuryChance = 0.0037;  // ✅ 10경기당 1-2명 부상 (0.37%)
        
        if (Math.random() < injuryChance) {
            // 1. 부상당할 팀을 50% 확률로 결정
            const isUserTeam = Math.random() < 0.5; 
            const team = isUserTeam ? gameData.selectedTeam : gameData.currentOpponent;
            
            let injuredPlayer = null;
            const squadOnField = isUserTeam 
                ? [gameData.squad.gk, ...gameData.squad.df, ...gameData.squad.mf, ...gameData.squad.fw].filter(p => p)
                : teams[team].sort((a, b) => b.rating - a.rating).slice(0, 11);

            // 2. 출전 선수 명단에서 부상당할 선수 1명을 무작위로 선택
            if (squadOnField.length > 0) {
                injuredPlayer = squadOnField[Math.floor(Math.random() * squadOnField.length)];
            }

            // 3. 부상 처리 (선수가 선택되었고, 아직 부상중이 아닐 경우)
            if (injuredPlayer && !this.isInjured(team, injuredPlayer.name)) {
                const gamesOut = Math.floor(Math.random() * 3) + 1; // 1~3경기 결장
                const playerKey = `${team}_${injuredPlayer.name}`;
                
                this.injuredPlayers.set(playerKey, {
                    team: team,
                    name: injuredPlayer.name,
                    position: injuredPlayer.position,
                    rating: injuredPlayer.rating,
                    gamesRemaining: gamesOut
                });
                
                return {
                    occurred: true,
                    team: team,
                    teamName: teamNames[team] || team,
                    player: injuredPlayer,
                    gamesOut: gamesOut,
                    isUserTeam: isUserTeam
                };
            }
        }
        return { occurred: false };
    } // checkInjury 메서드 닫는 괄호
    updateInjuries() {
        const recovered = [];
        
        this.injuredPlayers.forEach((injury, key) => {
            injury.gamesRemaining--;
            
            if (injury.gamesRemaining <= 0) {
                recovered.push(injury);
                this.injuredPlayers.delete(key);
            }
        });
        
        return recovered;
    }

    isInjured(team, playerName) {
        const playerKey = `${team}_${playerName}`;
        return this.injuredPlayers.has(playerKey);
    }

    getInjuredPlayers(team) {
        const injured = [];
        this.injuredPlayers.forEach((injury, key) => {
            if (injury.team === team) {
                injured.push(injury);
            }
        });
        return injured;
    }

    getSaveData() {
        return {
            injuredPlayers: Array.from(this.injuredPlayers.entries())
        };
    }

    loadSaveData(data) {
        if (data && data.injuredPlayers) {
            this.injuredPlayers = new Map(data.injuredPlayers);
        }
    }

    reset() {
        this.injuredPlayers.clear();
    }

    // ✅ 부상 선수를 스쿼드에서 제거하는 함수 추가
    removeInjuredFromSquad() {
        if (!gameData.selectedTeam) return;
        
        const squad = gameData.squad;
        
        // GK 체크
        if (squad.gk && this.isInjured(gameData.selectedTeam, squad.gk.name)) {
            squad.gk = null;
        }
        
        // DF 체크
        squad.df = squad.df.map(player => {
            if (player && this.isInjured(gameData.selectedTeam, player.name)) {
                return null;
            }
            return player;
        });
        
        // MF 체크
        squad.mf = squad.mf.map(player => {
            if (player && this.isInjured(gameData.selectedTeam, player.name)) {
                return null;
            }
            return player;
        });
        
        // FW 체크
        squad.fw = squad.fw.map(player => {
            if (player && this.isInjured(gameData.selectedTeam, player.name)) {
                return null;
            }
            return player;
        });
    }
}


// ==================== 교체 시스템 ====================

let selectedFieldPlayer = null;
let selectedBenchPlayer = null;

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

    fieldPlayersList.innerHTML = '';
    benchPlayersList.innerHTML = '';
    subsLeftEl.textContent = `남은 교체 횟수: ${5 - matchData.substitutionsMade}`;
    modalTitle.textContent = isForced ? `🚨 부상 선수 교체` : '선수 교체';

    // 현재 필드 위 선수 목록 생성
    const squad = gameData.squad;
    const fieldPlayers = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(p => p);

    fieldPlayers.forEach(player => {
        const playerEl = createSubPlayerElement(player);
        if (isForced && injuredPlayer && player.name === injuredPlayer.name) {
            playerEl.classList.add('selected');
            selectedFieldPlayer = { element: playerEl, player: player };
        } else {
            playerEl.addEventListener('click', () => selectPlayerForSub(player, playerEl, 'field', matchData));
        }
        fieldPlayersList.appendChild(playerEl);
    });

    // 벤치 선수 목록 생성
    const benchPlayers = teams[gameData.selectedTeam].filter(p => !fieldPlayers.some(fp => fp.name === p.name));
    benchPlayers.forEach(player => {
        const playerEl = createSubPlayerElement(player);
        playerEl.addEventListener('click', () => selectPlayerForSub(player, playerEl, 'bench', matchData));
        benchPlayersList.appendChild(playerEl);
    });

    modal.style.display = 'block';
}

function createSubPlayerElement(player) {
    const el = document.createElement('div');
    el.className = 'substitution-player';
    el.dataset.playerName = player.name;
    el.innerHTML = `
        <div class="name">${player.name} (${player.position})</div>
        <div class="details">능력치: ${player.rating}</div>
    `;
    return el;
}

function selectPlayerForSub(player, element, type, matchData) {
    if (type === 'field') {
        if (selectedFieldPlayer) selectedFieldPlayer.element.classList.remove('selected');
        element.classList.add('selected');
        selectedFieldPlayer = { element, player };
    } else {
        if (selectedBenchPlayer) selectedBenchPlayer.element.classList.remove('selected');
        element.classList.add('selected');
        selectedBenchPlayer = { element, player };
    }

    if (selectedFieldPlayer && selectedBenchPlayer) {
        performSubstitution(selectedFieldPlayer.player, selectedBenchPlayer.player, matchData);
    }
}

function performSubstitution(playerOut, playerIn, matchData) {
    if (matchData.substitutionsMade >= 5) {
        alert('교체 횟수를 모두 사용했습니다.');
        closeSubstitutionModal();
        return;
    }

    // 1. gameData.squad 업데이트
    const squad = gameData.squad;
    let replaced = false;
    ['gk', 'df', 'mf', 'fw'].forEach(posKey => {
        if (replaced) return;
        if (posKey === 'gk') {
            if (squad.gk && squad.gk.name === playerOut.name) {
                squad.gk = playerIn;
                replaced = true;
            }
        } else {
            const index = squad[posKey].findIndex(p => p && p.name === playerOut.name);
            if (index !== -1) {
                squad[posKey][index] = playerIn;
                replaced = true;
            }
        }
    });

    if (!replaced) {
        console.error("교체 대상 선수를 스쿼드에서 찾지 못했습니다:", playerOut);
        alert('교체 중 오류가 발생했습니다.');
        return;
    }

    // 2. 교체 횟수 증가
    matchData.substitutionsMade++;

    // 3. 전력 재계산 및 보너스 적용
    const newRating = calculateUserTeamRating();
    const bonus = 0.2;
    matchData.userTeamRating = newRating + bonus;

    // 4. 교체 이벤트 생성 및 표시
    const subEvent = {
        minute: matchData.minute,
        type: 'substitution',
        description: `🔄 교체: IN ${playerIn.name}(${playerIn.rating}) / OUT ${playerOut.name}(${playerOut.rating}).<br>
                      전력 재계산: ${newRating.toFixed(1)} + ${bonus}(보너스) = ${matchData.userTeamRating.toFixed(1)}`
    };
    displayEvent(subEvent, matchData);

    // 5. 모달 닫기 및 선택 초기화
    closeSubstitutionModal();
    
    // 6. 부상으로 인한 강제 교체였다면 경기 재개
    if (matchData.isPausedForInjury) {
        matchData.isPausedForInjury = false;
        matchData.isRunning = true;
        console.log('🔄 부상 교체 완료, 경기 재개');
    }

    // 6. 부상으로 인한 강제 교체였다면 경기 재개
    if (matchData.isPausedForInjury) {
        matchData.isPausedForInjury = false;
        matchData.isRunning = true;
    }
}

function handleForcedSubstitution(injuredPlayer, matchData) {
    matchData.isRunning = false; // 경기 일시정지
    matchData.isPausedForInjury = true;
    alert(`🚨 ${injuredPlayer.name} 선수가 부상으로 경기를 뛸 수 없습니다! 교체해야 합니다.`);
    openSubstitutionModal(matchData, true, injuredPlayer);
}

function closeSubstitutionModal() {
    document.getElementById('substitutionModal').style.display = 'none';
    selectedFieldPlayer = null;
    selectedBenchPlayer = null;
}

document.addEventListener('DOMContentLoaded', () => {
    const closeSubModalBtn = document.getElementById('closeSubstitutionModal');
    if (closeSubModalBtn) {
        closeSubModalBtn.addEventListener('click', closeSubstitutionModal);
    }

    // 모달 바깥 영역 클릭 시 닫기 (부상 시에는 닫히지 않도록)
    const subModal = document.getElementById('substitutionModal');
    if (subModal) {
        subModal.addEventListener('click', (e) => {
            if (e.target === subModal && !window.matchData?.isPausedForInjury) {
                closeSubstitutionModal();
            }
        });
    }
});

// ✅✅✅ 이 부분이 **반드시** 있어야 합니다! ✅✅✅
const injurySystem = new InjurySystem();

// 전역으로 노출 - 다른 파일에서 사용 가능하도록
window.injurySystem = injurySystem;
window.InjurySystem = InjurySystem;

console.log('✅ Injury System 로드 완료');

// 전역으로 함수들 노출
window.TacticSystem = TacticSystem;
window.startMatch = startMatch;
window.handleInterview = handleInterview;
