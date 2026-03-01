// tacticSystem.js

// 메모리 업데이트: 포지션별 골 확률이 FW: 75%, MF: 21%, DF: 4%로 설정됨

// [전역 설정] 기본 롤(Role) 설정 (유저가 선택하지 않았을 경우 대비)
if (!gameData.lineRoles) {
    gameData.lineRoles = { attack: 'AF', midfield: 'BBM', defense: 'BPD' };
}

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

// [추가] AI 팀 베스트 11 선발 함수 (포지션 고려)
function getBestEleven(teamKey) {
    const teamPlayers = teams[teamKey];
    if (!teamPlayers) return [];

    // 포지션별 분류 및 정렬
    const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating);
    const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
    const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
    const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);

    const best11 = [];

    // GK 1명 (필수)
    if (gks.length > 0) best11.push(gks[0]);

    // DF 4명, MF 3명, FW 3명 (기본 4-3-3)
    for (let i = 0; i < 4 && i < dfs.length; i++) best11.push(dfs[i]);
    for (let i = 0; i < 3 && i < mfs.length; i++) best11.push(mfs[i]);
    for (let i = 0; i < 3 && i < fws.length; i++) best11.push(fws[i]);

    // 11명이 안 되면 나머지 포지션에서 채우기 (GK 제외)
    if (best11.length < 11) {
        const remaining = teamPlayers
            .filter(p => !best11.includes(p) && p.position !== 'GK')
            .sort((a, b) => b.rating - a.rating);
        
        for (let i = 0; i < remaining.length && best11.length < 11; i++) {
            best11.push(remaining[i]);
        }
    }
    
    // 그래도 부족하면 GK 포함 (극단적인 경우)
    if (best11.length < 11) {
        const remainingAll = teamPlayers.filter(p => !best11.includes(p)).sort((a, b) => b.rating - a.rating);
        for (let i = 0; i < remainingAll.length && best11.length < 11; i++) best11.push(remainingAll[i]);
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
    "리옹": "twoLine",

    // [추가] 월드컵 국가대표팀 전술 매핑
    "대한민국": "lavolpiana",
    "멕시코": "possession",
    "남아공": "twoLine",
    "캐나다": "gegenpress",
    "카타르": "parkBus",
    "스위스": "catenaccio",
    "브라질": "totalFootball",
    "모로코": "parkBus",
    "아이티": "longBall",
    "스코틀랜드": "longBall",
    "미국": "gegenpress",
    "파라과이": "catenaccio",
    "호주": "longBall",
    "독일": "gegenpress",
    "퀴라소": "possession",
    "코트디부아르": "twoLine",
    "에콰도르": "gegenpress",
    "네덜란드": "totalFootball",
    "일본": "tikitaka",
    "튀니지": "parkBus",
    "벨기에": "possession",
    "이집트": "parkBus",
    "이란": "catenaccio",
    "뉴질랜드": "longBall",
    "스페인": "tikitaka",
    "카보베르데": "twoLine",
    "사우디아라비아": "parkBus",
    "우루과이": "twoLine",
    "프랑스": "possession",
    "세네갈": "twoLine",
    "노르웨이": "longBall",
    "아르헨티나": "possession",
    "알제리": "twoLine",
    "오스트리아": "gegenpress",
    "요르단": "parkBus",
    "포르투갈": "possession",
    "우즈베키스탄": "parkBus",
    "콜롬비아": "twoLine",
    "잉글랜드": "possession",
    "크로아티아": "possession",
    "가나": "twoLine",
    "파나마": "parkBus",
    
    // 플레이오프 및 기타 국가
    "체코": "gegenpress", "덴마크": "twoLine", "이탈리아": "catenaccio", "웨일스": "longBall",
    "튀르키예": "gegenpress", "루마니아": "twoLine", "우크라이나": "twoLine", "폴란드": "twoLine",
    "이라크": "parkBus", "볼리비아": "catenaccio", "코스타리카": "parkBus", "아랍에미리트": "possession"
};

        // [추가] 레전드 모드일 경우 전술 덮어쓰기
        if (typeof gameData !== 'undefined' && gameData.isLegendMode && typeof LegendLeagueManager !== 'undefined') {
            this.teamTactics = LegendLeagueManager.getTacticsMap();
        }
    }


    // 전술 효과 계산
    calculateTacticEffect(userTactic, opponentTactic) {
        const userTacticData = this.tactics[userTactic];
        const opponentTacticData = this.tactics[opponentTactic];

        let effect = 0;

        // 내 전술이 상대 전술에 효과적인 경우
        if (userTacticData.effective.includes(opponentTactic)) {
            effect += 5; // 사기 +5
        }
        // 내 전술이 상대 전술에 비효과적인 경우
        else if (userTacticData.ineffective.includes(opponentTactic)) {
            effect -= 5; // 사기 -5
        }

        return effect;
    }

    // 상대팀의 전술 가져오기
    getOpponentTactic(opponentTeam) {
        if (this.teamTactics[opponentTeam]) {
            return this.teamTactics[opponentTeam];
        }
        // 매핑된 전술이 없으면 랜덤으로 하나 배정 (기본값 'possession' 제거)
        const tacticKeys = Object.keys(this.tactics);
        return tacticKeys[Math.floor(Math.random() * tacticKeys.length)];
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
            modifiers.goalChance = 0.0; // +1.25%
            modifiers.foulChance = 0.0;
            modifiers.possessionBonus = 0;
            modifiers.passAccuracy = 0;
            break;
        case "twoLine":
            modifiers.goalChance = 0; // -0.75%
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 0;
            modifiers.passAccuracy = 0;
            break;
        case "lavolpiana":
            modifiers.goalChance = 0; // +0.75%
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 0;
            modifiers.passAccuracy = 0;
            break;
        case "longBall":
            modifiers.goalChance = 0; // +1.0%
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 0;
            modifiers.passAccuracy = 0;
            break;
        case "possession":
            modifiers.goalChance = 0; 
            modifiers.foulChance = 0;
            modifiers.possessionBonus = 0;
            modifiers.passAccuracy = 0;
            break;
        case "parkBus":
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

// ==================== [신규] AI 스탯 생성기 ====================
const AIStatGenerator = {
    // 전술별 스탯 가중치 프리셋
    presets: {
        tikitaka: { 
            attack: { attack: 0.9, speed: 0.9, technique: 1.2, physical: 0.8 },
            midfield: { technique: 1.3, attack: 1.1, defense: 0.8, mentality: 1.2 },
            defense: { defense: 0.9, speed: 1.0, physical: 0.9, mentality: 1.1 }
        },
        gegenpress: {
            attack: { attack: 1.0, speed: 1.2, technique: 0.9, physical: 1.1 },
            midfield: { technique: 0.9, attack: 1.0, defense: 1.2, mentality: 1.1 },
            defense: { defense: 1.0, speed: 1.2, physical: 1.1, mentality: 1.0 }
        },
        counter: { // twoLine, longBall, parkBus
            attack: { attack: 1.1, speed: 1.2, technique: 0.8, physical: 1.0 },
            midfield: { technique: 0.8, attack: 0.8, defense: 1.3, mentality: 1.0 },
            defense: { defense: 1.3, speed: 0.9, physical: 1.3, mentality: 1.0 }
        },
        balanced: { // possession, totalFootball, etc.
            attack: { attack: 1.0, speed: 1.0, technique: 1.0, physical: 1.0 },
            midfield: { technique: 1.0, attack: 1.0, defense: 1.0, mentality: 1.0 },
            defense: { defense: 1.0, speed: 1.0, physical: 1.0, mentality: 1.0 }
        }
    },

    getPreset(tactic) {
        if (['tikitaka', 'lavolpiana'].includes(tactic)) return this.presets.tikitaka;
        if (['gegenpress'].includes(tactic)) return this.presets.gegenpress;
        if (['twoLine', 'longBall', 'parkBus', 'catenaccio'].includes(tactic)) return this.presets.counter;
        return this.presets.balanced;
    },

    // [수정] AI 스탯 생성 시 베스트 11 기준 라인별 OVR 사용
    create(teamKey, tactic) {
        const teamPlayers = teams[teamKey];
        if (!teamPlayers) return { attack: {}, midfield: {}, defense: {} };

        // 포지션별 베스트 선별
        const fws = teamPlayers.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating).slice(0, 3);
        const mfs = teamPlayers.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating).slice(0, 3);
        const dfs = teamPlayers.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating).slice(0, 4);
        const gks = teamPlayers.filter(p => p.position === 'GK').sort((a, b) => b.rating - a.rating).slice(0, 1);

        const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((acc, p) => acc + p.rating, 0) / players.length) : 70;

        const attackOVR = calcAvg(fws);
        const midfieldOVR = calcAvg(mfs);
        const defenseOVR = calcAvg([...dfs, ...gks]);

        const preset = this.getPreset(tactic);
        const aiStats = { attack: {}, midfield: {}, defense: {} };

        ['attack', 'midfield', 'defense'].forEach(line => {
            const linePreset = preset[line];
            aiStats[line] = {};
            const baseOVR = line === 'attack' ? attackOVR : line === 'midfield' ? midfieldOVR : defenseOVR;

            for (const [statName, multiplier] of Object.entries(linePreset)) {
                // 기본 능력치 + 전술 보정 + 랜덤 변수(±5%)
                const randomFactor = 0.95 + Math.random() * 0.1;
                // multiplier는 평균 1.0 내외이므로 OVR * multiplier가 적절 (총합 4.0 근사)
                aiStats[line][statName] = Math.round(baseOVR * multiplier * randomFactor);
            }
            // AI 체력 초기화
            aiStats[line].stamina = 100;
        });

        return aiStats;
    }
};

// [신규] 해설 멘트 데이터 (다양성 추가)
const CommentaryData = {
    midfield: {
        bypass: [
            "🚀 {team}, 중원을 거치지 않는 긴 패스로 단숨에 공격 기회를 잡습니다!",
            "🚀 {team}, 롱볼 한 방으로 상대 허를 찌릅니다!",
            "🚀 {team}, 미드필더를 생략하고 전방으로 바로 연결합니다.",
            "🚀 {team}, 다이렉트 패스로 수비 뒷공간을 노립니다!",
            "🚀 {team}, 후방에서 한 번에 넘어오는 패스! 공격수에게 연결됩니다.",
            "🚀 {team}, 중원 싸움을 피하고 측면으로 길게 벌려줍니다."
        ],
        win: [
            "💪 {team}, {reason}(으)로 중원을 장악하며 공격을 전개합니다.",
            "💪 {team}, 허리 싸움에서 승리하며 주도권을 가져옵니다.",
            "💪 {team}, 미드필더진의 유기적인 패스워크가 돋보입니다.",
            "💪 중원에서 상대를 완전히 압도하는 {team}입니다.",
            "💪 {team}, 중원에서 상대를 완전히 갖고 노네요!",
            "💪 {team}, 지금 중원 싸움에서 우세한 모습을 보입니다"
        ]
    },
    defense: {
        success: [
            "🛡️ {team}, {reason}으로 {opponent}의 공격을 무력화합니다.",
            "🛡️ {team}, 견고한 수비벽을 세우며 상대 공격을 차단합니다.",
            "🛡️ {team}, 침착한 수비로 위기를 넘깁니다.",
            "🛡️ {team}, 상대의 패스 길목을 완벽하게 읽어냅니다.",
            "🛡️ {team}, 협력 수비로 상대 공격수를 고립시킵니다.",
            "🛡️ {team}, 몸을 사리지 않는 수비로 실점을 막아냅니다."
        ],
        counter: [
            "⚡️ {team}, 공을 뺏어내자마자 빛같은 역습! 수비 뒷공간을 파고듭니다!",
            "⚡️ {team}, 수비 성공 후 빠른 전환! 역습 찬스입니다!",
            "⚡️ {team}, 상대가 라인을 올린 틈을 타 날카로운 역습을 전개합니다!",
            "⚡️ {team}, 총알 같은 역습! 수비수들이 따라잡지 못합니다!",
            "⚡️ {team}, 역습 기회! 공격 숫자가 더 많습니다!",
            "⚡️ {team}, 전광석화 같은 역습으로 상대 진영을 흔듭니다!"
        ],
        block: [
            "🧱 {team}, 수비수가 몸을 날려 결정적인 슈팅을 막아냅니다!",
            "🧱 {team}, 육탄 방어! 슈팅이 수비수 몸에 맞고 굴절됩니다!",
            "🧱 {team}, 상대의 슈팅을 수비수가 블록해냅니다! 대단한 헌신입니다!",
            "🧱 {team}, 골문으로 향하던 공을 수비수가 막아냅니다!",
            "🧱 {team}, 수비벽에 막힙니다! 슈팅이 통과하지 못합니다."
        ]
    },
    miss: {
        counter: [
            "😱 {team} {player}, 결정적인 역습 찬스에서 슈팅이 빗나갑니다!",
            "😱 {team}, {player}의 마무리 슈팅이 골문을 외면합니다.",
            "😱 {team}, 역습 상황에서 {player}의 슛이 뜨고 맙니다.",
            "😱 {team} {player}, 골키퍼와 1대1 기회를 놓칩니다!",
            "😱 {team}, {player}의 칩슛이 골대 위로 넘어갑니다.",
            "😱 {team} {player}, 너무 급하게 찼나요? 역습 찬스가 무산됩니다.",
            "😱 {team}, 거의 빈골대나 다름 없었는데요, {player}선수. 이걸 놓칩니다",
            "😱 {team} 역습 찬스에서 슈팅이 골대를 강타합니다! {player}, 많이 아쉽겠어요"
        ],
        strong: [
            "🥅 {team} {player}, 완벽한 찬스를 허공으로 날려버립니다.",
            "🥅 {team}, {player}의 회심의 슈팅이 골대를 맞고 나갑니다!",
            "🥅 {team} {player}, 결정적인 기회였는데 슈팅이 빗나갑니다.",
            "🥅 {team}, {player}의 슈팅이 골문 옆으로 살짝 벗어납니다.",
            "🥅 {team} {player}, 노마크 찬스에서 실축합니다! 믿을 수 없네요.",
            "🥅 {team} {player}, 이걸 놓쳐요?? 이건 많이 아쉽겠는데요.",
            "🥅 {team}, {player}의 발리슛이 빗맞으며 기회가 무산됩니다.",
            "🥅 {team} 오늘 {player}선수가 컨디션이 좋지 않나봅니다. 이걸 놓쳐요...",
            "🥅 {player} 선수 이건 거의 아마추어급 실수인데요.."
        ],
        normal: [
            "🥅 {team} {player}의 중거리 슛, 골문을 크게 벗어납니다.",
            "🥅 {team}, {player}의 슈팅이 수비수 맞고 굴절되어 나갑니다.",
            "🥅 {team} {player}, 과감하게 때려봤지만 골문과는 거리가 멉니다.",
            "🥅 {team}, {player}의 슛이 힘없이 골대 옆으로 흘러갑니다.",
            "🥅 {team} {player}, 공간이 열리자마자 슈팅! 아쉽게 빗나갑니다.",
            "🥅 {team}, {player}의 터닝 슛이 골대 위로 넘어갑니다.",
            "🥅 {team} {player}, 수비수를 제치고 슈팅했으나 골문을 벗어납니다.",
            "🥅 {team}, {player}의 기습적인 슈팅! 하지만 골대 옆을 때립니다.",
            "🥅 {team} {player}, 아쉽습니다! 깻잎 한장 차이로 나갑니다."
        ]
    },
    save: {
        counter: [
            "🧤 키퍼, {player}의 1대1 슈팅을 막아냅니다! 슈퍼 세이브!",
            "🧤  키퍼, {player}의 결정적인 역습 슈팅을 몸을 날려 쳐냅니다!",
            "🧤  키퍼, 팀을 구합니다! {player}의 슛을 막았습니다."
        ],
        strong: [
            "🧤 골키퍼가 {player}의 슛을 막아냅니다! 엄청난 선방쇼!",
            "🧤 골키퍼, {player}의 구석을 노린 슛을 쳐냅니다!",
            "🧤 골키퍼, {player}의 골이나 다름없는 슈팅을 선방합니다!",
            "🧤 골키퍼, 슈퍼 세이브! {player}의 머리를 감싸쥐게 만듭니다."
        ],
        normal: [
            "🧤 골키퍼, {player}의 정면 슈팅을 안전하게 잡아냅니다.",
            "🧤 골키퍼, {player}의 슛을 침착하게 처리합니다.",
            "🧤 골키퍼, {player}의 중거리 슛을 어렵지 않게 막아냅니다.",
            "🧤 골키퍼, {player}의 슛을 펀칭으로 걷어냅니다.",
            "🧤 {team} {player}, 잘 찼네요! 그러나 골키퍼의 슈퍼세이브에 막힙니다!"
        ]
    }
};

// ==================== [신규] 리얼 매치 엔진 ====================
class RealMatchEngine {
    constructor(matchData) {
        this.matchData = matchData;
        this.tacticSystem = new TacticSystem();
        
        // 1. 유저 스탯 준비
        if (!gameData.lineStats) DNAManager.initialize(teams[gameData.selectedTeam]);
        this.userStats = gameData.lineStats;
        this.userRoles = gameData.lineRoles || { attack: 'AF', midfield: 'BBM', defense: 'BPD' };

        // 2. AI 스탯 생성
        const aiTeamKey = matchData.homeTeam === gameData.selectedTeam ? matchData.awayTeam : matchData.homeTeam;
        const aiTactic = this.tacticSystem.getOpponentTactic(aiTeamKey);
        this.aiStats = AIStatGenerator.create(aiTeamKey, aiTactic);
        this.aiRoles = this.assignAIRoles(aiTactic); // AI 롤 자동 배정

        // 3. 경기 상태 초기화
        this.ballZone = 'midfield'; // midfield, user_attack, ai_attack
        this.lastAction = 'kickoff';
        this.ballHolder = null; // [추가] 공 소유 선수 추적
        this.tickCount = 0; // [신규] 엔진 틱 카운터 (속도 조절용)
    }

    assignAIRoles(tactic) {
        // 전술에 맞는 단순 롤 배정
        if (['tikitaka', 'possession', 'lavolpiana', 'totalFootball'].includes(tactic)) return { attack: 'F9', midfield: 'DLP', defense: 'BPD' };
        if (['counter', 'longBall', 'twoLine', 'catenaccio', 'parkBus', 'gegenpress'].includes(tactic)) return { attack: 'P', midfield: 'BWM', defense: 'NCB' };
        return { attack: 'CF', midfield: 'BBM', defense: 'CD' };
    }

    // [신규] 랜덤 선수 가져오기 헬퍼 (공 소유권 로직용)
    getRandomPlayer(teamKey, positions, excludePlayer = null) {
        let players = [];
        if (teamKey === gameData.selectedTeam) {
            const squad = gameData.squad;
            positions.forEach(pos => {
                if (pos === 'GK' && squad.gk) players.push(squad.gk);
                if (pos === 'DF') players.push(...squad.df.filter(p => p));
                if (pos === 'MF') players.push(...squad.mf.filter(p => p));
                if (pos === 'FW') players.push(...squad.fw.filter(p => p));
            });
        } else {
            const all = getBestEleven(teamKey);
            players = all.filter(p => positions.includes(p.position));
        }
        
        if (excludePlayer) {
            players = players.filter(p => p.name !== excludePlayer.name);
        }
        
        if (players.length === 0) return null;
        const player = players[Math.floor(Math.random() * players.length)];
        // 팀 정보 추가 (비교용)
        if (player) player.team = teamKey;
        return player;
    }

    // [신규] 패스 플레이어 2명 선정 (같은 팀)
    getPassPlayers(teamKey) {
        let players = [];
        if (teamKey === gameData.selectedTeam) {
             const squad = gameData.squad;
             // GK 제외, 필드 플레이어만
             players = [...squad.fw, ...squad.mf, ...squad.df].filter(p => p !== null);
        } else {
             players = getBestEleven(teamKey).filter(p => p.position !== 'GK');
        }
        
        if (players.length < 2) return null;
        
        const p1 = players[Math.floor(Math.random() * players.length)];
        let p2 = players[Math.floor(Math.random() * players.length)];
        while (p1.name === p2.name) {
            p2 = players[Math.floor(Math.random() * players.length)];
        }
        
        return [p1, p2];
    }

    // 스탯 파워 계산 (롤 가중치 + 체력 반영)
    getLinePower(isUser, line, statType) {
        const stats = isUser ? this.userStats : this.aiStats;
        
        let baseValue = stats[line].stats ? stats[line].stats[statType] : stats[line][statType];
        if (!baseValue) baseValue = 50; // Fallback
        
        let power = 0;

        // 1. 롤 가중치 적용 (개별 선수 평균)
        if (isUser) {
            let avgMultiplier = 0;
            let avgEfficiency = 1.0; // [추가] 평균 효율성
            // 유저: 해당 라인의 선수들을 찾아 개별 역할 가중치 평균 계산
            let players = [];
            if (line === 'attack') players = gameData.squad.fw;
            else if (line === 'midfield') players = gameData.squad.mf;
            else if (line === 'defense') players = gameData.squad.df;
            
            players = players.filter(p => p !== null);
            
            if (players.length > 0) {
                let totalEfficiency = 0;
                let totalWeight = 0;
                players.forEach(p => {
                    // 선수별 역할 가져오기 (없으면 기본값)
                    const roleKey = gameData.playerRoles?.[p.name] || (line === 'attack' ? 'AF' : line === 'midfield' ? 'BBM' : 'BPD');
                    const roleData = TacticsManager.getRoleData(roleKey);
                    
                    // 스탯 매핑 (speed -> mobility)
                    const statMap = { speed: 'mobility' };
                    const mappedType = statMap[statType] || statType;
                    
                    const weight = roleData && roleData[mappedType] !== undefined ? roleData[mappedType] : 0;
                    totalWeight += weight;

                    // [추가] 체력 효율성 합산
                    const staminaKey = TacticsManager.getStaminaConsumptionKey(roleKey);
                    const efficiency = TacticsManager.getStaminaEfficiency(staminaKey);
                    totalEfficiency += efficiency;
                });
                avgMultiplier = totalWeight / players.length;
                avgEfficiency = totalEfficiency / players.length;
            }
            // 유저 파워 계산: 기본값 * (1 + 평균 가중치) * 평균 효율성
            power = baseValue * (1 + avgMultiplier) * avgEfficiency;
        } else {
            // AI: 라인별 단일 롤 적용
            const roleKey = this.aiRoles[line];
            power = TacticsManager.calculateFinalPower(baseValue, roleKey, statType);
        }
        
        // [신규] 일시적 스탯(상담/이벤트 효과) 적용
        if (isUser && gameData.temporaryStats) {
            let totalBonus = 0;
            let players = [];
            if (line === 'attack') players = gameData.squad.fw;
            else if (line === 'midfield') players = gameData.squad.mf;
            else if (line === 'defense') players = gameData.squad.df;
            players = players.filter(p => p !== null);

            players.forEach(p => {
                if (gameData.temporaryStats[p.name]) {
                    // statType 매핑 (mobility -> speed 등)
                    const map = { mobility: 'speed' };
                    const key = map[statType] || statType;
                    totalBonus += (gameData.temporaryStats[p.name][key] || 0);
                }
            });
            // 라인 전체 파워에 보너스 합산 (평균이 아닌 합산으로 임팩트 강화)
            if (players.length > 0) power += (totalBonus / players.length);
        }

        // 2. 체력 페널티 적용
        const stamina = stats[line].stamina;
        let staminaFactor = 1.0;
        if (stamina < 30) staminaFactor = 0.8; // 탈진 시 20% 감소
        else if (stamina < 50) staminaFactor = 0.9;
        else if (stamina < 70) staminaFactor = 0.98;

        return power * staminaFactor;
    }

    // 체력 소모
    consumeStamina() {
        const process = (isUser) => {
            const stats = isUser ? this.userStats : this.aiStats;
            
            ['attack', 'midfield', 'defense'].forEach(line => {
                let consumptionRate = 0;

                if (isUser) {
                    // 유저: 선수별 소모율 평균
                    let players = [];
                    if (line === 'attack') players = gameData.squad.fw;
                    else if (line === 'midfield') players = gameData.squad.mf;
                    else if (line === 'defense') players = gameData.squad.df;
                    players = players.filter(p => p !== null);

                    if (players.length > 0) {
                        let totalRate = 0;
                        players.forEach(p => {
                            const roleKey = gameData.playerRoles?.[p.name] || (line === 'attack' ? 'AF' : line === 'midfield' ? 'BBM' : 'BPD');
                            const staminaKey = TacticsManager.getStaminaConsumptionKey(roleKey);
                            totalRate += TacticsManager.getStaminaConsumptionRate(staminaKey);
                        });
                        consumptionRate = totalRate / players.length;
                    } else {
                        consumptionRate = 0.38; // 기본값
                    }
                } else {
                    // AI: 라인 롤 기준
                    const roleKey = this.aiRoles[line];
                    const staminaKey = TacticsManager.getStaminaConsumptionKey(roleKey);
                    consumptionRate = TacticsManager.getStaminaConsumptionRate(staminaKey);
                }

                stats[line].stamina = Math.max(0, stats[line].stamina - consumptionRate);
            });
        };
        process(true);
        process(false);
    }

    // 1분 단위 시뮬레이션
    update(minute, isNewMinute) {
        // [수정] 2. 엔진 틱 속도 조절 (3틱마다 1번씩 로직 실행 -> 약 0.6초 간격)
        this.tickCount++;
        if (this.tickCount % 3 !== 0) return;

        if (isNewMinute) {
            this.consumeStamina();
            this.updateStaminaUI();
        }
        
        // [수정] 2. 소유권 기반의 공격권 판정
        // 공을 가진 선수가 있다면, 그 선수의 팀이 공격 중인 것으로 간주
        if (this.ballHolder) {
            const isUserHolder = this.ballHolder.team === gameData.selectedTeam;
            if (isUserHolder) {
                this.ballZone = 'user_attack';
            } else {
                this.ballZone = 'ai_attack';
            }
        }

        // 1. 중원 싸움 (공 소유자가 없을 때만)
        if (!this.ballHolder && this.ballZone === 'midfield') {
            const userTech = this.getLinePower(true, 'midfield', 'technique');
            const userMental = this.getLinePower(true, 'midfield', 'mentality');
            const userMid = (userTech + userMental) / 2;
            
            const aiTech = this.getLinePower(false, 'midfield', 'technique');
            const aiMental = this.getLinePower(false, 'midfield', 'mentality');
            const aiMid = (aiTech + aiMental) / 2;

            const userRoll = userMid + Math.random() * 35;
            const aiRoll = aiMid + Math.random() * 35;

            let winnerIsUser = userRoll > aiRoll;

            // 중원 우회(Bypass) 로직
            if (!winnerIsUser) {
                let bypassChance = 0.15;
                if (['longBall', 'twoLine', 'parkBus', 'catenaccio'].includes(gameData.currentTactic)) {
                    bypassChance = 0.35;
                }
                if (Math.random() < bypassChance) winnerIsUser = true;
            } else {
                const aiTactic = this.tacticSystem.getOpponentTactic(this.matchData.homeTeam === gameData.selectedTeam ? this.matchData.awayTeam : this.matchData.homeTeam);
                let bypassChance = 0.15;
                if (['longBall', 'twoLine', 'parkBus', 'catenaccio', 'counter'].includes(aiTactic)) {
                    bypassChance = 0.35;
                }
                if (Math.random() < bypassChance) winnerIsUser = false;
            }

            // [변경] 승자가 결정되면 반드시 빌드업 이벤트 발생
            if (winnerIsUser) {
                this.ballZone = 'user_attack';
                this.lastAction = 'build_up';
                this.generateBuildUpEvent(true, minute);
            } else {
                this.ballZone = 'ai_attack';
                this.lastAction = 'build_up';
                this.generateBuildUpEvent(false, minute);
            }
        }
        // 2. 공격 시도 (Final Third)
        else {
            const isUserAttacking = this.ballZone === 'user_attack';
            
            // [수정] 공 소유권 확인 (엄격한 체크)
            if (this.ballHolder) {
                const holderIsUser = this.ballHolder.team === gameData.selectedTeam;
                // 현재 공격권과 공 소유자가 일치하지 않으면 로직 중단 (턴오버 대기)
                if (isUserAttacking !== holderIsUser) {
                    return; 
                }
            }

            // [변경] 100% 확률로 액션 발생 (Pass, Dribble, Shoot, Turnover)
            const actionRoll = Math.random();
            
            // [수정] 확률 분포 조정: 턴오버 20%, 패스 65%, 드리블 10%, 슈팅 5%
            if (actionRoll < 0.2) {
                // 턴오버 (수비 성공)
                this.handleTurnover(isUserAttacking, minute);
            } else if (actionRoll < 0.85) { 
                // [수정] 4. 패스 빈도 대폭 상향 (40% -> 65%) - 패스 위주 빌드업
                this.generatePassEvent(isUserAttacking, minute);
            } else if (actionRoll < 0.95) { 
                // [수정] 4. 드리블 빈도 하향 (30% -> 10%)
                this.generateDribbleEvent(isUserAttacking, minute);
            } else {
                // 슈팅 시도
                const atkPower = (this.getLinePower(isUserAttacking, 'attack', 'attack') + this.getLinePower(isUserAttacking, 'attack', 'speed'));
                const defPower = (this.getLinePower(!isUserAttacking, 'defense', 'defense') + this.getLinePower(!isUserAttacking, 'defense', 'physical'));
                this.attemptGoal(isUserAttacking, atkPower, defPower, minute);
            }
        }
    }

    // [신규] 빌드업 이벤트 생성
    generateBuildUpEvent(isUser, minute) {
        const teamKey = isUser ? gameData.selectedTeam : gameData.currentOpponent;
        const teamName = teamNames[teamKey];
        
        // [수정] ① 소유권 강제 변경 금지: 소유자가 없으면 할당하되, 이미 상대 팀이면 강제 변경 안 함
        if (!this.ballHolder) {
            this.ballHolder = this.getRandomPlayer(teamKey, ['DF', 'MF']);
        } else if (this.ballHolder.team !== teamKey) {
            return; // 소유권이 없으면 빌드업 불가 (턴오버 기다림)
        }
        
        // 가까운 포지션으로 패스
        let targetPositions = ['MF'];
        if (this.ballHolder.position === 'GK') targetPositions = ['DF'];
        else if (this.ballHolder.position === 'DF') targetPositions = ['MF', 'DF'];
        else if (this.ballHolder.position === 'MF') targetPositions = ['FW', 'MF'];
        
        const receiver = this.getRandomPlayer(teamKey, targetPositions, this.ballHolder);
        
        if (this.ballHolder && receiver) {
            const event = {
                minute: minute,
                type: 'pass',
                description: `⚽ ${teamName} ${this.ballHolder.name}, ${receiver.name}에게 연결하며 공격을 전개합니다.`,
                from: this.ballHolder.name,
                to: receiver.name
            };
            displayEvent(event, this.matchData);
            this.ballHolder = receiver; // 소유권 이전
        }
    }

    // [신규] 패스 이벤트 생성
    generatePassEvent(isUser, minute) {
        const teamKey = isUser ? gameData.selectedTeam : gameData.currentOpponent;
        
        // [수정] 1. 소유권 강제 배정 로직 제거
        if (!this.ballHolder) {
            this.ballHolder = this.getRandomPlayer(teamKey, ['MF', 'FW']);
        } else if (this.ballHolder.team !== teamKey) {
            return; // 상대방 공이면 패스 이벤트 발생 불가 (턴오버 대기)
        }
        
        // 가까운 포지션으로 패스
        let targetPositions = ['MF', 'FW'];
        
        // [수정] 공격 지역(Final Third)에서는 수비수에게 백패스 금지 (공격 흐름 유지)
        const isAttackingZone = this.ballZone === 'user_attack' || this.ballZone === 'ai_attack';

        if (this.ballHolder.position === 'GK') targetPositions = ['DF'];
        else if (this.ballHolder.position === 'DF') targetPositions = ['MF', 'DF'];
        else if (this.ballHolder.position === 'MF') {
            if (isAttackingZone) {
                targetPositions = ['FW', 'MF']; // 공격 중엔 전진/횡패스만 허용
            } else {
                targetPositions = ['FW', 'MF', 'DF']; // 빌드업 시엔 백패스 허용
            }
        }
        else if (this.ballHolder.position === 'FW') targetPositions = ['FW', 'MF'];

        const receiver = this.getRandomPlayer(teamKey, targetPositions, this.ballHolder);
        
        if (this.ballHolder && receiver) {
            const msgs = [
                `⚽ ${this.ballHolder.name}, ${receiver.name}에게 짧게 내줍니다.`,
                `⚽ ${this.ballHolder.name}, 빈 공간의 ${receiver.name}를 보고 패스합니다.`,
                `⚽ ${this.ballHolder.name}와 ${receiver.name}의 2대1 패스 연결!`,
                `⚽ ${this.ballHolder.name}, ${receiver.name}에게 정확하게 배달합니다.`
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            
            const event = {
                minute: minute,
                type: 'pass',
                description: msg,
                from: this.ballHolder.name,
                to: receiver.name
            };
            displayEvent(event, this.matchData);
            this.ballHolder = receiver;
        }
    }

    // [신규] 드리블 이벤트 생성
    generateDribbleEvent(isUser, minute) {
        const teamKey = isUser ? gameData.selectedTeam : gameData.currentOpponent;
        
        // [수정] 1. 소유권 강제 배정 로직 제거
        if (!this.ballHolder) {
            this.ballHolder = this.getRandomPlayer(teamKey, ['MF', 'FW']);
        } else if (this.ballHolder.team !== teamKey) {
            return; // 상대방 공이면 드리블 불가
        }
        
        if (this.ballHolder) {
            const msgs = [
                `💨 ${this.ballHolder.name}, 빠른 드리블로 치고 나갑니다!`,
                `💨 ${this.ballHolder.name}, 수비수를 제치고 전진합니다.`,
                `💨 ${this.ballHolder.name}, 개인기로 공간을 만듭니다.`
            ];
            const msg = msgs[Math.floor(Math.random() * msgs.length)];
            
            const event = {
                minute: minute,
                type: 'dribble',
                description: msg,
                player: this.ballHolder.name
            };
            displayEvent(event, this.matchData);
        }
    }

    // [신규] 턴오버(수비 성공) 처리
    handleTurnover(isUserAttacking, minute) {
        const defTeamKey = isUserAttacking ? gameData.currentOpponent : gameData.selectedTeam;
        const defTeamName = teamNames[defTeamKey];
        
        const defender = this.getRandomPlayer(defTeamKey, ['DF', 'MF']);
        
        const event = {
            minute: minute,
            type: 'tackle',
            description: `🛡️ ${defTeamName} ${defender ? defender.name : '수비수'}, 공을 뺏어냅니다!`,
            player: defender ? defender.name : null
        };
        displayEvent(event, this.matchData);
        
        this.ballZone = 'midfield';
        this.ballHolder = defender; // 공 소유권 넘어감
    }

    attemptGoal(isUserAttacking, atkPower, defPower, minute) {
        // [관문 3: 골 결정력]
        // 파워 차이에 따른 기본 확률
        const powerDiff = atkPower - defPower;
        let shootingQuality = 'difficult';

        // [이동] 수비수 슈팅 블록 확률 계산 (여기서 처리)
        const blockChance = (defPower / (atkPower + defPower)) * 0.2; // 평균 10% 내외
        let isBlocked = false;
        if (Math.random() < blockChance) {
            isBlocked = true;
            // 블록되면 골 확률은 0
        }
        
        // [수정] 슈터 결정: 공을 가진 선수가 있다면 그 선수가 슈팅
        let shooterName;
        const attackingTeamKey = isUserAttacking ? gameData.selectedTeam : gameData.currentOpponent;
        if (this.ballHolder && this.ballHolder.team === attackingTeamKey) {
            shooterName = this.ballHolder.name;
            // [수정] 수비수, 골키퍼는 슈팅 불가. 미드필더도 50% 확률로 패스 전환.
            if (this.ballHolder.position === 'GK' || this.ballHolder.position === 'DF' || (this.ballHolder.position === 'MF' && Math.random() < 0.5)) {
                this.generatePassEvent(isUserAttacking, minute);
                return; 
            }
        } else {
            shooterName = this.getShooter(isUserAttacking);
        }

        // [밸런스 수정] 골 확률 상향 (슈팅 찬스가 줄었으므로 결정력 증가)
        // 기존: 0.05 + ... -> 수정: 0.15 + ...
        let goalChance = 0.15 + (powerDiff * 0.001);
        
        // [추가] 월드컵 모드일 경우 골 확률 추가 하향 (대량 득점 방지)
        if (gameData.isWorldCupMode) {
            goalChance = 0.12 + (powerDiff * 0.001);
        }
        
        // 최소 5%, 최대 50%로 제한
        goalChance = Math.max(0.05, Math.min(0.50, goalChance));

        // 슈팅 퀄리티 텍스트 결정 (확률 기반)
        if (goalChance >= 0.15) shootingQuality = 'decisive';
        else if (goalChance >= 0.08) shootingQuality = 'normal';
        else shootingQuality = 'difficult';

        // 역습 보너스 적용
        if (this.lastAction === 'counter_attack') {
            goalChance *= 1.5; // 역습 시 골 확률 1.5배
        }

        // [신규] 체력 저하에 따른 결정력 페널티
        const attackingStats = isUserAttacking ? this.userStats.attack : this.aiStats.attack;
        if (attackingStats.stamina < 50) {
            goalChance *= 0.8; // 체력 50% 미만 시 골 확률 20% 감소
        }

        // === 결과 결정 ===
        let outcome = 'miss';
        if (isBlocked) {
            outcome = 'block';
        } else if (Math.random() < goalChance) {
            outcome = 'goal';
        } else if (Math.random() < 0.5) { // 빗나감/선방 반반
            outcome = 'save';
        } else {
            outcome = 'miss';
        }

        // === 몰입감 모드 확인 ===
        const immersionMode = gameData.settings ? gameData.settings.immersionMode !== false : true;

        if (immersionMode) {
            // 1. 경기 일시정지
            this.matchData.isRunning = false;

            // 2. 찬스 카드 생성 및 표시
            const attackingTeamName = isUserAttacking ? teamNames[gameData.selectedTeam] : teamNames[gameData.currentOpponent];
            const suspenseEvent = {
                minute: minute,
                type: 'chance',
                description: `🔥 ${attackingTeamName}, 결정적인 슈팅 기회! 과연?`,
                player: shooterName // [추가] 찬스를 잡은 선수 정보 전달
            };
            const cardElement = displayEvent(suspenseEvent, this.matchData);

            // 3. 하이라이트 효과 적용
            const eventList = document.getElementById('eventList');
            eventList.classList.add('dimmed');
            cardElement.classList.add('highlight');

            // [수정] 2. 슈팅 전 4초 대기 삭제 (즉시 진행)
            this.resolveGoalOutcome(outcome, isUserAttacking, minute, shootingQuality, cardElement, shooterName);
            this.matchData.isRunning = true;
        } else {
            // 즉시 결과 처리
            this.resolveGoalOutcome(outcome, isUserAttacking, minute, shootingQuality, null, shooterName);
        }
    }

    // [신규] 골 결과 처리 및 이벤트 표시 (분리됨)
    resolveGoalOutcome(outcome, isUserAttacking, minute, shootingQuality, existingCardElement = null, shooterName = null) {
        const attackingTeamName = isUserAttacking ? teamNames[gameData.selectedTeam] : teamNames[gameData.currentOpponent];
        const defendingTeamName = isUserAttacking ? teamNames[gameData.currentOpponent] : teamNames[gameData.selectedTeam];
        
        let event;

        if (outcome === 'goal') {
            // ⚽ 골 성공
            event = createGoalEvent(this.matchData, isUserAttacking);
            let context = "";
            if (this.lastAction === 'counter_attack') {
                context = "⚡️ 역습의 마침표! ";
            } else if (shootingQuality === 'decisive') {
                context = "🔥 압도적인 공격력! ";
            } else if (shootingQuality === 'difficult') {
                context = "💎 천금같은 기회! ";
            }

            // 기존 골 메시지에 문맥 추가
            event.description = event.description.replace("⚽", "⚽ " + context);

            // [신규] 골 기록 시 컨트롤러 진동
            if (window.customCursorInstance && typeof window.customCursorInstance.triggerVibration === 'function') {
                // 강하고 긴 진동
                window.customCursorInstance.triggerVibration(600, 0.9, 0.6);
            }

            this.ballZone = 'midfield';
            this.lastAction = 'kickoff';
            this.ballHolder = null; // [추가] 킥오프 대기 상태
        } else if (outcome === 'block') {
            // 🧱 블록
            const blockMsg = this.getRandomCommentary('defense', 'block', { team: defendingTeamName });
            event = { minute: minute, type: 'block', description: blockMsg };
            
            this.ballZone = 'midfield';
            this.lastAction = 'turnover';
        } else {
            // 빗나감 or 선방
            const finalShooterName = shooterName || this.getShooter(isUserAttacking);
            
            let description = '';
            let missCategory = shootingQuality === 'decisive' ? 'strong' : 'normal';
            const isSave = outcome === 'save';

            if (this.lastAction === 'counter_attack') {
                if (isSave) {
                    description = this.getRandomCommentary('save', 'counter', { team: defendingTeamName, player: finalShooterName });
                } else {
                    description = this.getRandomCommentary('miss', 'counter', { team: attackingTeamName, player: finalShooterName });
                }
            } else if (isSave) {
                description = this.getRandomCommentary('save', missCategory, { team: attackingTeamName, player: finalShooterName });
            } else {
                description = this.getRandomCommentary('miss', missCategory, { team: attackingTeamName, player: finalShooterName });
            }
            
            event = { minute: minute, type: outcome, description: description, shooter: finalShooterName };

            // [수정] 3. 슛 미스/선방 후 소유권 전환 (수비 팀에게 소유권 넘김)
            const defTeamKey = isUserAttacking ? gameData.currentOpponent : gameData.selectedTeam;
            this.ballHolder = this.getRandomPlayer(defTeamKey, ['GK', 'DF']);
            this.ballZone = 'midfield';
            this.lastAction = 'turnover'; // 턴오버로 처리하여 다음 틱에 빌드업 시작
        }

        if (existingCardElement) {
            // 기존 카드 업데이트 (몰입감 모드)
            existingCardElement.className = `event-card ${event.type}`;
            existingCardElement.innerHTML = `
                <div class="event-time">${event.minute}분</div>
                <div>${event.description}</div>
            `;
            // 이벤트 데이터에도 추가 (기록용)
            this.matchData.events.push(event);

            // [신규] 시각화 엔진에 이벤트 전달 (몰입 모드에서도 애니메이션 재생)
            if (window.matchVisualizer && typeof window.parseTextEventToVisual === 'function') {
                const visualEvent = window.parseTextEventToVisual(event);
                if (visualEvent) {
                    visualEvent.domElement = existingCardElement; // DOM 연결
                    window.matchVisualizer.processMatchEvent(visualEvent);
                }
            }
        } else {
            // 새 카드 생성 (일반 모드)
            displayEvent(event, this.matchData);
        }
    }

    // [신규] 슈팅한 선수 이름 가져오기
    getShooter(isUserAttacking) {
        const attackingTeamKey = isUserAttacking ? gameData.selectedTeam : gameData.currentOpponent;
        
        let players = [];
        if (attackingTeamKey === gameData.selectedTeam) {
             const squad = gameData.squad;
             players = [...squad.fw, ...squad.mf].filter(p => p !== null);
             if (players.length === 0) players = squad.df.filter(p => p !== null);
        } else {
             // [수정] AI팀은 베스트 11 중에서 슈터를 정함
             const best11 = getBestEleven(attackingTeamKey);
             if (best11.length > 0) {
                 players = best11.filter(p => p.position === 'FW' || p.position === 'MF');
                 if (players.length === 0) players = best11; // 공격/미드필더 없으면 베스트11 전체에서
             }
        }
        
        if (players.length > 0) {
            return players[Math.floor(Math.random() * players.length)].name;
        }
        return "선수";
    }

    // [신규] 해설 멘트 랜덤 선택 헬퍼
    getRandomCommentary(category, subCategory, data) {
        const templates = CommentaryData[category][subCategory];
        let template = templates[Math.floor(Math.random() * templates.length)];
        for (const key in data) {
            template = template.replace(`{${key}}`, data[key]);
        }
        return template;
    }

    // [신규] 스태미나 UI 업데이트
    updateStaminaUI() {
        const atk = document.getElementById('atkStamina');
        const mid = document.getElementById('midStamina');
        const def = document.getElementById('defStamina');
        
        if (atk) atk.textContent = Math.max(0, Math.floor(this.userStats.attack.stamina));
        if (mid) mid.textContent = Math.max(0, Math.floor(this.userStats.midfield.stamina));
        if (def) def.textContent = Math.max(0, Math.floor(this.userStats.defense.stamina));
    }

    // [신규] 선수 교체 시 스태미나 재계산
    recalculateStaminaOnSub(playerOut) {
        const positionType = playerOut.position;
        let lineKey;
        let playersInLine;

        if (positionType === 'FW') {
            lineKey = 'attack';
            playersInLine = gameData.squad.fw.filter(p => p);
        } else if (positionType === 'MF') {
            lineKey = 'midfield';
            playersInLine = gameData.squad.mf.filter(p => p);
        } else if (positionType === 'DF' || positionType === 'GK') {
            lineKey = 'defense';
            playersInLine = [...gameData.squad.df, gameData.squad.gk].filter(p => p);
        }

        if (lineKey && playersInLine && playersInLine.length > 0) {
            const currentStamina = this.userStats[lineKey].stamina;
            const numPlayers = playersInLine.length;
            const newStamina = (currentStamina * (numPlayers - 1) + 100) / numPlayers;
            this.userStats[lineKey].stamina = Math.min(100, newStamina);
            console.log(`🔄 교체 발생 (${lineKey}): ${playerOut.name} OUT. 스태미나 재계산: ${currentStamina.toFixed(1)} -> ${this.userStats[lineKey].stamina.toFixed(1)}`);
        }
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
        homeTeam: gameData.isHomeGame ? gameData.selectedTeam : gameData.currentOpponent,
        awayTeam: gameData.isHomeGame ? gameData.currentOpponent : gameData.selectedTeam,
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

    // [추가] 경기 종류 표시 로직
    const matchTypeDisplay = document.getElementById('matchTypeDisplay'); // HTML에 <div id="matchTypeDisplay"></div> 와 같은 요소가 있다고 가정
    if (matchTypeDisplay) {
        if (gameData.isWorldCupMode && typeof WorldCupManager !== 'undefined') {
            const stage = WorldCupManager.currentStage;
            const stageNames = {
                'group': '조별리그',
                'r32': '32강',
                'r16': '16강',
                'qf': '준준결승',
                'sf': '준결승',
                'qf': '8강',
                'sf': '4강',
                'final': '결승'
            };
            matchTypeDisplay.textContent = stageNames[stage] || '토너먼트';
        } else {
            // 일반 리그 모드일 경우
            matchTypeDisplay.textContent = `${gameData.currentLeague}부 리그`;
        }
    }
    
    // [추가] 스태미나 표시 초기화
    if (document.getElementById('atkStamina')) {
        document.getElementById('atkStamina').textContent = '100';
        document.getElementById('midStamina').textContent = '100';
        document.getElementById('defStamina').textContent = '100';
    }

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
    // [수정] MatchEngine 인스턴스 생성
    const matchEngine = new RealMatchEngine(matchData);
    
    matchData.engine = matchEngine; // [추가] 교체 시 스태미나 재계산을 위해 엔진 인스턴스 전달
    // 킥오프 버튼에 엔진 전달
    showKickoffButton(matchData, matchEngine, strengthDiff);
}

// 킥오프 버튼 표시
function showKickoffButton(matchData, matchEngine, strengthDiff) {
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
        startMatchSimulation(matchData, matchEngine, strengthDiff);
        kickoffInfo.remove(); // 킥오프 버튼 제거
    });
}

function startMatchSimulation(matchData, matchEngine, strengthDiff) {
    console.log('▶️ [Match] 경기 시뮬레이션 시작 (Kickoff)');
    matchData.isRunning = true;
    matchData.strengthDiff = strengthDiff; // 전력 차이 데이터 저장
    matchData.intervalId = null; // 인터벌 ID 저장
    
    // 이변모드 초기화 (경기당 1회만 체크)
    matchData.upsetModeChecked = false;
    matchData.upsetMode = false;
    matchData.upsetFactor = 0;
    
    // 킥오프 메시지
    const kickoffEvent = {
        minute: 0,
        type: 'kickoff',
        description: `🟢 경기 시작! ${teamNames[matchData.homeTeam]} vs ${teamNames[matchData.awayTeam]}`
    };
    displayEvent(kickoffEvent, matchData);

    // 경기 시뮬레이션 시작
    simulateMatch(matchData, matchEngine);
}

function simulateMatch(matchData, matchEngine) {
    let tickCount = 0;
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

        // [수정] 200ms마다 틱 발생, 5틱마다 1분 증가 (부드러운 진행)
        tickCount++;
        let isNewMinute = false;
        if (tickCount % 5 === 0) {
            matchData.minute++;
            isNewMinute = true;
            document.getElementById('matchTime').textContent = matchData.minute + '분';
        }

        
        // ===== 부상 체크 =====
        const injuryResult = injurySystem.checkInjury(matchData);
        if (injuryResult.occurred) {
            const event = createInjuryEvent(matchData, injuryResult);
            displayEvent(event, matchData);
            if (injuryResult.isUserTeam) handleForcedSubstitution(injuryResult.player, matchData);
            return; // 부상 발생 시 이번 틱 종료
        }

        // [신규] 매치 엔진 업데이트 (골 판정 포함)
        matchEngine.update(matchData.minute, isNewMinute);

        // [기타 이벤트] 골 외의 파울, 코너킥 등은 분위기용으로 랜덤 발생 (확률 낮춤)
        if (Math.random() < 0.05) {
            const miscEvent = createMiscEvent(matchData);
            if (miscEvent) displayEvent(miscEvent, matchData);
        }

        matchData.intervalId = matchInterval; // 인터벌 ID 저장
    }, 200); // [수정] 1초 -> 0.2초 (연속적인 느낌)
}

// [신규] 기타 이벤트 생성기 (골 제외)
function createMiscEvent(matchData) {
    const roll = Math.random();
    if (roll < 0.3) return createFoulEvent(matchData);
    if (roll < 0.6) return createPassEvent(matchData);
    if (roll < 0.8) return createCornerEvent(matchData);
    return null;
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
        // [수정] AI팀은 베스트 11 중에서 득점자를 정함
        const best11 = getBestEleven(team);
        const forwards = best11.filter(p => p.position === 'FW').sort((a, b) => b.rating - a.rating);
        const midfielders = best11.filter(p => p.position === 'MF').sort((a, b) => b.rating - a.rating);
        const defenders = best11.filter(p => p.position === 'DF').sort((a, b) => b.rating - a.rating);
        
        const possibleScorers = [];
        
        forwards.forEach((player, index) => {
            const weight = Math.max(75 - (index * 10), 35);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        midfielders.forEach((player, index) => {
            const weight = Math.max(21 - (index * 3), 9);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        defenders.forEach((player, index) => {
            const weight = Math.max(4 - index, 2);
            for (let i = 0; i < weight; i++) possibleScorers.push(player);
        });
        
        if (possibleScorers.length > 0) {
            scorer = possibleScorers[Math.floor(Math.random() * possibleScorers.length)];
        } else if (best11.length > 0) { // 만약 후보가 없으면 베스트11에서 랜덤 선택
            scorer = best11[Math.floor(Math.random() * best11.length)];
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
        // [수정] AI팀은 베스트 11 중에서 도움자를 정함
        const best11 = getBestEleven(team);
        const forwards = best11.filter(p => p.position === 'FW' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        const midfielders = best11.filter(p => p.position === 'MF' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        const defenders = best11.filter(p => p.position === 'DF' && p.name !== scorer.name).sort((a, b) => b.rating - a.rating);
        
        const possibleAssisters = [];
        
        forwards.forEach((player, index) => {
            const weight = Math.max(50 - (index * 7), 22);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        midfielders.forEach((player, index) => {
            const weight = Math.max(45 - (index * 6), 21);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        defenders.forEach((player, index) => {
            const weight = Math.max(5 - index, 3);
            for (let i = 0; i < weight; i++) possibleAssisters.push(player);
        });
        
        if (possibleAssisters.length > 0) {
            assister = possibleAssisters[Math.floor(Math.random() * possibleAssisters.length)];
        }
    }
}

    // 점수 업데이트
    if (isUserTeam) {
        if (matchData.homeTeam === gameData.selectedTeam) {
            matchData.homeScore++;
        } else {
            matchData.awayScore++;
        }
    } else {
        if (matchData.homeTeam === gameData.selectedTeam) {
            matchData.awayScore++;
        } else {
            matchData.homeScore++;
        }
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

    // [수정] 어시스트 멘트 다양화
    function getAssistMessage(assisterPosition) {
        // 기존 메시지 풀이 너무 적으면 여기서 확장 가능
        // 현재는 기존 로직 유지하되, 호출 시 랜덤성을 더 부여
        
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
        "의 완벽한 골!", "의 환상적인 골!", "의 멋진 골!", "의 강력한 골!",
        "의 정확한 골!", "의 침착한 골!", "의 기막힌 골!", "의 예술적인 골!",
        "의 완성도 높은 골!", "의 절묘한 골!", "가 골네트를 흔들었습니다!",
        "가 골문을 갈랐습니다!", "의 마무리가 골로 이어졌습니다!",
        "가 골을 만들어냈습니다!", "의 슛이 골문을 찾았습니다!",
        "의 득점포 가동!", "가 침착하게 마무리합니다!", "의 원더골 작렬!",
        "가 골망을 찢을 듯한 슈팅으로 득점합니다!", "의 감각적인 칩슛 성공!",
        "의 헤더골!", "의 발리슛 작렬!", "가 수비수를 제치고 득점합니다!",
        "의 대포알 같은 중거리 슛!", "가 골키퍼의 키를 넘기는 슛으로 득점!"
    ];

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
        "의 클래스가 돋보인 골!",
        "가 수비진을 홀로 무너뜨리고 득점합니다!",
        "의 드리블 돌파에 이은 득점!",
        "가 상대 수비를 농락하며 골을 넣습니다!",
        "의 환상적인 솔로 플레이!",
        "가 그라운드를 지배하며 직접 해결합니다!"
    ];

    let goalDescription;
    if (assister) {
        const assistMessage = getAssistMessage(assister.position);
        const goalFinish = goalFinishMessages[Math.floor(Math.random() * goalFinishMessages.length)];
        
        goalDescription = `⚽ ${teamName}의 ${assister.name}(${assister.rating})${assistMessage} ${scorer.name}(${scorer.rating})${goalFinish}${specialMessage}`;
    } else {
        
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
    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const homeTeamKey = matchData.homeTeam;
    const awayTeamKey = matchData.awayTeam;
    
    // 파울 팀 결정 (50:50)
    const isHomeFoul = Math.random() < 0.5;
    const foulTeamKey = isHomeFoul ? homeTeamKey : awayTeamKey;
    const foulTeamName = teamNames[foulTeamKey];
    
    // 파울 선수 결정
    let player = null;
    if (foulTeamKey === gameData.selectedTeam) {
        const squad = gameData.squad;
        const fieldPlayers = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(p => p);
        player = fieldPlayers[Math.floor(Math.random() * fieldPlayers.length)];
    } else {
        // AI 팀은 상위 11명 중 랜덤
        const top11 = getBestEleven(foulTeamKey);
        player = top11.length > 0 ? top11[Math.floor(Math.random() * top11.length)] : null;
    }
    
    // 옐로카드 확률 (20%)
    const isYellow = Math.random() < 0.2;
    
    const foulDescriptions = [
        `⚠️ ${foulTeamName} ${player ? player.name + '의' : ''} 파울입니다.`,
        `⚠️ ${foulTeamName}, 무리한 태클로 파울을 범합니다.`,
        `⚠️ ${foulTeamName}, 상대의 공격 흐름을 끊는 파울.`,
        `⚠️ ${foulTeamName}, 손을 써서 파울이 선언됩니다.`,
        `⚠️ ${foulTeamName}, 공중볼 경합 과정에서 파울.`
    ];

    return {
        minute: matchData.minute,
        type: 'foul',
        team: foulTeamName,
        player: player,
        isYellow: isYellow,
        description: isYellow && player ? `🟨 ${foulTeamName}의 ${player.name}, 거친 파울로 경고를 받습니다.` : foulDescriptions[Math.floor(Math.random() * foulDescriptions.length)]
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
    
    // [수정] 3. 이벤트 중계 표시 방식 변경 (현재 이벤트만 표시)
    eventList.innerHTML = ''; 
    
    // 이벤트 타입에 따라 클래스 추가
    eventCard.className = `event-card ${event.type}`;
    
    eventCard.innerHTML = `
        <div class="event-time">${event.minute}분</div>
        <div>${event.description}</div>
    `;
    
    eventList.appendChild(eventCard);
    
    // [수정] 자동 스크롤이 일시 정지 상태가 아닐 때만 바닥으로 내림
    // 사용자가 스크롤을 올려서 보고 있을 때(isPaused) 강제로 내리는 것을 방지
    if (window.AutoScrollSystem && !window.AutoScrollSystem.isPaused) {
        eventList.scrollTop = eventList.scrollHeight;
        if (eventList.parentElement) {
            eventList.parentElement.scrollTop = eventList.parentElement.scrollHeight;
        }
    }
    
    matchData.events.push(event);
    return eventCard; // [수정] 생성된 요소 반환
}

function endMatch(matchData) {
    console.log('🏁 [Match] 경기 종료 처리 시작 (endMatch)');
    document.getElementById('endMatchBtn').style.display = 'block';
    document.getElementById('substituteBtn').style.display = 'none'; // 교체 버튼 숨기기

    // [신규] 경기 종료 휘슬 진동 (2초)
    if (window.customCursorInstance && typeof window.customCursorInstance.triggerVibration === 'function') {
        // 2초간 강한 진동 후 자동 정지
        window.customCursorInstance.triggerVibration(2000, 1.0, 1.0);
    }
    
    // 경기 결과 계산
    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const userScore = isUserHome ? matchData.homeScore : matchData.awayScore;
    const opponentScore = isUserHome ? matchData.awayScore : matchData.homeScore;
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
    if (!gameData.isWorldCupMode && typeof window.processSponsorAfterMatch === 'function') {
        const matchResult = result === '승리' ? 'win' : result === '패배' ? 'loss' : 'draw';
        window.processSponsorAfterMatch(matchResult);
    }

    // 메일 시스템 연동 (경기 결과 및 이적 제안)
    if (!gameData.isWorldCupMode && typeof mailManager !== 'undefined') {
        // 경기 결과 메일
        mailManager.sendMatchResultMail(matchData);
        
        // 랜덤 이적 제안 체크 (경기 종료 후)
        mailManager.checkTransferOffer();
    }

    // 경기 종료 버튼 이벤트
    document.getElementById('endMatchBtn').onclick = () => {
        // 평점 계산 및 결과 모달 표시
        const ratings = calculateMatchRatings(matchData);
        showMatchResultModal(matchData, ratings, result, userScore, opponentScore, strengthDiff);
    };

    // 경기 후 스카우트 활동 처리
    if (!gameData.isWorldCupMode && gameData.hiredScout) {
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
    
    // 라운드 종료 및 다음 라운드 준비
    gameData.currentRound++;
    
    // 다음 상대 설정
    setNextOpponent();

    // [추가] 경기 종료 후 유저 팀 스태미나 100으로 회복
    if (gameData.lineStats) {
        ['attack', 'midfield', 'defense'].forEach(line => {
            if (gameData.lineStats[line]) {
                gameData.lineStats[line].stamina = 100;
            }
        });
        console.log('🔋 유저 팀 스태미나 100으로 회복 완료');
    }

    // 경기 종료 후 처리 (부상, 은퇴, 시즌종료 체크)
    setTimeout(() => {
        processRetirementsAndReincarnations(); // 은퇴 및 환생 처리
        // checkSeasonEnd는 인터뷰 후로 이동
    }, 1000);
    
    // ✅✅ 부상 선수를 스쿼드에서 제거 (추가!)
    injurySystem.removeInjuredFromSquad();

    // [신규] 일시적 스탯 초기화 (다음 경기에는 적용 안 됨)
    if (gameData.temporaryStats) {
        gameData.temporaryStats = {};
        console.log('🧹 경기 종료: 일시적 스탯(상담 효과)이 초기화되었습니다.');
    }
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
    
    // 홈/어웨이 여부에 따른 점수 판별
    const isUserHome = matchData.homeTeam === gameData.selectedTeam;
    const myScore = isUserHome ? matchData.homeScore : matchData.awayScore;
    const oppScore = isUserHome ? matchData.awayScore : matchData.homeScore;

    userData.matches++;
    userData.goalsFor += myScore;
    userData.goalsAgainst += oppScore;
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
    opponentData.goalsFor += oppScore;
    opponentData.goalsAgainst += myScore;
    
    if (myScore > oppScore) {
        opponentData.losses++;
    } else if (myScore < oppScore) {
        opponentData.wins++;
        opponentData.points += 3;
    } else {
        opponentData.draws++;
        opponentData.points += 1;
    }
}

function simulateOtherMatches() {
    // records.js의 simulateAllLeaguesMatches에서 스케줄 기반으로 통합 처리하므로
    // 여기서는 더 이상 개별적으로 시뮬레이션하지 않습니다.
}

function startInterview(result, userScore, opponentScore, strengthDiff) {
    // 부상 선수 업데이트 (경기 완전 종료 시점)
    if (typeof injurySystem !== 'undefined') {
        const recoveredPlayers = injurySystem.updateInjuries();
        injurySystem.removeInjuredFromSquad();

        // 회복된 선수 메일 발송
        if (recoveredPlayers.length > 0 && typeof mailManager !== 'undefined') {
            recoveredPlayers.forEach(player => {
                if (player.team === gameData.selectedTeam) {
                    mailManager.sendRecoveryMail(player);
                }
            });
        }
    }

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
    
    // 시즌 종료 체크
    checkSeasonEnd();
    
    // 로비로 돌아가기
    showScreen('lobby');
    updateDisplay();
    
    alert(`인터뷰 완료! 팀 사기가 ${moraleChange > 0 ? '+' : ''}${moraleChange} 변했습니다.\n현재 사기: ${gameData.teamMorale}`);
}

// ==================== 평점 시스템 ====================

function calculateMatchRatings(matchData) {
    const homeTeam = matchData.homeTeam;
    const awayTeam = matchData.awayTeam;
    const homeScore = matchData.homeScore;
    const awayScore = matchData.awayScore;
    
    // 출전 선수 명단 확보
    let homePlayers = [];
    let awayPlayers = [];
    
    // 홈팀이 유저팀인 경우
    if (homeTeam === gameData.selectedTeam) {
        const squad = gameData.squad;
        if (squad.gk) homePlayers.push(squad.gk);
        squad.df.forEach(p => { if(p) homePlayers.push(p); });
        squad.mf.forEach(p => { if(p) homePlayers.push(p); });
        squad.fw.forEach(p => { if(p) homePlayers.push(p); });
    } else {
        // AI 팀은 상위 11명
        homePlayers = getBestEleven(homeTeam);
    }
    
    // 어웨이팀이 유저팀인 경우
    if (awayTeam === gameData.selectedTeam) {
        const squad = gameData.squad;
        if (squad.gk) awayPlayers.push(squad.gk);
        squad.df.forEach(p => { if(p) awayPlayers.push(p); });
        squad.mf.forEach(p => { if(p) awayPlayers.push(p); });
        squad.fw.forEach(p => { if(p) awayPlayers.push(p); });
    } else {
        awayPlayers = getBestEleven(awayTeam);
    }
    
    // 평점 계산 함수
    const calc = (player, teamName, goalsConceded) => {
        let rating = 6.0; // 기본 평점
        
        // 득점/도움 체크
        const goals = matchData.events.filter(e => e.type === 'goal' && e.scorer === player.name).length;
        const assists = matchData.events.filter(e => e.type === 'goal' && e.assister === player.name).length;
        
        rating += goals * 1.5;
        rating += assists * 1.2;
        
        // 클린시트 (GK, DF)
        if (goalsConceded === 0 && (player.position === 'GK' || player.position === 'DF')) {
            rating += 0.5;
        }
        
        // 랜덤 변수 (-0.2 ~ +0.2)
        rating += (Math.random() * 0.4) - 0.2;
        
        // 옐로카드 체크 (실제 이벤트 기반)
        const hasYellow = matchData.events.some(e => e.type === 'foul' && e.isYellow && e.player && e.player.name === player.name);
        if (hasYellow) rating -= 1.0;

        // 승리 팀 보너스 (+0.3) / 패배 팀 페널티 (-0.2)
        const isHomePlayer = teamName === teamNames[matchData.homeTeam];
        const myScore = isHomePlayer ? matchData.homeScore : matchData.awayScore;
        const oppScore = isHomePlayer ? matchData.awayScore : matchData.homeScore;
        
        if (myScore > oppScore) {
            rating += 0.3;
        } else if (myScore < oppScore) {
            rating -= 0.2;
        }
        
        // 범위 제한 (3.0 ~ 10.0)
        return {
            player: player,
            rating: Math.max(3.0, Math.min(10.0, rating)).toFixed(1),
            goals: goals,
            assists: assists,
            hasYellow: hasYellow
        };
    };
    
    const homeRatings = homePlayers.map(p => calc(p, teamNames[homeTeam], awayScore));
    const awayRatings = awayPlayers.map(p => calc(p, teamNames[awayTeam], homeScore));
    
    // MOM 선정 (양팀 통틀어 최고 평점)
    const allRatings = [...homeRatings, ...awayRatings];
    allRatings.sort((a, b) => parseFloat(b.rating) - parseFloat(a.rating));
    const mom = allRatings[0];
    
    return {
        home: homeRatings,
        away: awayRatings,
        mom: mom
    };
}

function showMatchResultModal(matchData, ratings, result, userScore, opponentScore, strengthDiff) {
    const modal = document.getElementById('matchResultModal');
    
    document.getElementById('resultHomeTeam').textContent = teamNames[matchData.homeTeam];
    document.getElementById('resultAwayTeam').textContent = teamNames[matchData.awayTeam];
    document.getElementById('resultScore').textContent = `${matchData.homeScore} - ${matchData.awayScore}`;
    
    const renderTeamRatings = (containerId, teamRatings, teamName) => {
        const container = document.getElementById(containerId);
        container.innerHTML = `<h4>${teamName}</h4>`;
        
        teamRatings.forEach(r => {
            const isMom = r.player.name === ratings.mom.player.name;
            const row = document.createElement('div');
            row.className = `rating-row ${isMom ? 'mom' : ''}`;
            
            let icons = '';
            if (r.goals > 0) icons += ' ⚽'.repeat(r.goals);
            if (r.assists > 0) icons += ' 👟'.repeat(r.assists);
            if (r.hasYellow) icons += ' 🟨';
            if (isMom) icons += ' ⭐MOM';
            
            row.innerHTML = `
                <div class="player-name">
                    ${r.player.name} <span style="font-size:0.8em; opacity:0.7;">(${r.player.position})</span>
                    <div>${icons}</div>
                </div>
                <div class="rating-value">${r.rating}</div>
            `;
            container.appendChild(row);
        });
    };
    
    renderTeamRatings('homeTeamRatings', ratings.home, teamNames[matchData.homeTeam]);
    renderTeamRatings('awayTeamRatings', ratings.away, teamNames[matchData.awayTeam]);
    
    // 확인 버튼 클릭 시 인터뷰로 이동
    const confirmBtn = document.getElementById('confirmResultBtn');
    confirmBtn.onclick = () => {
        modal.style.display = 'none';
        
        // 기록 시스템에 평점 및 MOM 데이터 전달
        if (typeof recordsSystem !== 'undefined') {
            recordsSystem.processMatchRatings(ratings, matchData);
        }

        // [분기 처리] 월드컵 모드인지 확인
        if (gameData.isWorldCupMode && typeof WorldCupManager !== 'undefined') {
            WorldCupManager.handleMatchEnd(matchData);

            // 월드컵 모드에서는 경기 후 바로 다음 상대를 설정하고 로비로 돌아감
            // 단, 유저가 탈락한 경우는 제외
            if (!WorldCupManager.isEliminated) {
                if (typeof setNextOpponent === 'function') setNextOpponent();
                if (typeof showScreen === 'function') showScreen('lobby');
                if (typeof updateDisplay === 'function') updateDisplay();
            } else {
                alert("월드컵 여정이 종료되었습니다. 메인 메뉴로 돌아갑니다.");
                if (typeof showScreen === 'function') showScreen('lobby');
            }
        } else {
            // 기본 동작: 인터뷰로 이동
            startInterview(result, userScore, opponentScore, strengthDiff);
        }
    };
    
    modal.style.display = 'block';
}




// tacticSystem.js 파일 맨 끝에 추가

// ==================== 부상 시스템 ====================
class InjurySystem {
    constructor() {
        this.injuredPlayers = new Map(); // 부상당한 선수 목록
    }

    checkInjury(matchData) {
        const injuryChance = 0.00005;  // [수정] 부상 확률 극소화 (0.005%)
        
        if (Math.random() < injuryChance) {
            // 1. 부상당할 팀을 50% 확률로 결정
            const isUserTeam = Math.random() < 0.5; 
            const team = isUserTeam ? gameData.selectedTeam : gameData.currentOpponent;
            
            let injuredPlayer = null;
            const squadOnField = isUserTeam 
                ? [gameData.squad.gk, ...gameData.squad.df, ...gameData.squad.mf, ...gameData.squad.fw].filter(p => p)
                : getBestEleven(team);

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
                
                // 사용자 팀 부상 시 메일 발송 (return 전에 실행)
                if (isUserTeam && typeof mailManager !== 'undefined') {
                    mailManager.sendInjuryMail({ player: injuredPlayer, gamesOut: gamesOut });
                }

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
    const benchPlayers = teams[gameData.selectedTeam].filter(p => 
        !fieldPlayers.some(fp => fp.name === p.name) &&
        (!injurySystem || !injurySystem.isInjured(gameData.selectedTeam, p.name)) // 부상 선수 제외
    );
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

    // [추가] 교체 시 스태미나 재계산
    if (matchData.engine) {
        matchData.engine.recalculateStaminaOnSub(playerOut);
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
