// deepenTactic.js
// [PART 1] 기존 UI 관리자 (DeepTacticManager) - 유지
const DeepTacticManager = {
    init() {
        if (!gameData.deepTactics) {
            gameData.deepTactics = {
                attackFocus: 'mixed',
                passStyle: { shortRatio: 7, longRatio: 3 },
                pressIntensity: 'mid',
                defensiveLine: 'standard'
            };
        }
        this.renderUI();
    },
    renderUI() {
        // ... (기존 UI 코드 유지 - 아래는 간략화) ...
        const container = document.getElementById('deepTacticsContainer');
        if (!container) {
            const tacticsTab = document.getElementById('tactics');
            if (!tacticsTab) return;
            const newContainer = document.createElement('div');
            newContainer.id = 'deepTacticsContainer';
            newContainer.style.cssText = `margin-top: 20px; padding: 15px; background: rgba(255, 255, 255, 0.05); border-radius: 10px;`;
            tacticsTab.appendChild(newContainer);
        }
        const dt = gameData.deepTactics;
        const el = document.getElementById('deepTacticsContainer');
        el.innerHTML = `
            <h4 style="color: #ffd700; margin-top: 0;">⚙️ 세부 전술 설정</h4>
            <div style="margin-bottom: 10px;">
                <label>수비 라인</label>
                <select id="dt-defensiveLine" style="width:100%; padding:5px; background:#333; color:white;">
                    <option value="deep" ${dt.defensiveLine === 'deep' ? 'selected' : ''}>내림 (Deep)</option>
                    <option value="standard" ${dt.defensiveLine === 'standard' ? 'selected' : ''}>보통</option>
                    <option value="high" ${dt.defensiveLine === 'high' ? 'selected' : ''}>올림 (High)</option>
                </select>
            </div>
            <div style="color: #aaa; font-size: 0.8rem;">* 나머지는 자동 적용됩니다.</div>
        `;
        document.getElementById('dt-defensiveLine').addEventListener('change', (e) => {
            gameData.deepTactics.defensiveLine = e.target.value;
        });
    }
};

// [신규] 런 타입 정의
const RUN_TYPE = {
    STRIKER_RUN: 'striker_run',    // 골문 향해 깊숙이 침투
    SUPPORT_RUN: 'support_run',    // 공 소유자 가까이 삼각형 형성
    CHANNEL_RUN: 'channel_run',    // 수비 라인 사이 공간 파고들기
    WIDE_RUN:    'wide_run',       // 측면으로 넓혀서 공간 창출
    UNDERLAP_RUN:'underlap_run',   // 안으로 파고들기 (IF, IWB)
    HOLD_POSITION:'hold_position', // 위치 유지 + 미세 조정만
};

// [신규] 역할별 런 타입 매핑
const ROLE_RUN_TYPE = {
    // 공격진
    AF: RUN_TYPE.STRIKER_RUN, CF: RUN_TYPE.SUPPORT_RUN, P: RUN_TYPE.STRIKER_RUN,
    DLF: RUN_TYPE.SUPPORT_RUN, TM: RUN_TYPE.HOLD_POSITION, F9: RUN_TYPE.SUPPORT_RUN,
    PF: RUN_TYPE.CHANNEL_RUN, RD: RUN_TYPE.CHANNEL_RUN, W: RUN_TYPE.WIDE_RUN, IF: RUN_TYPE.UNDERLAP_RUN,
    WP: RUN_TYPE.SUPPORT_RUN, IW: RUN_TYPE.UNDERLAP_RUN,
    
    // 미드필더
    BBM: RUN_TYPE.STRIKER_RUN, MEZ: RUN_TYPE.UNDERLAP_RUN, DLP: RUN_TYPE.HOLD_POSITION,
    BWM: RUN_TYPE.HOLD_POSITION, AP: RUN_TYPE.SUPPORT_RUN, REG: RUN_TYPE.HOLD_POSITION,
    CAR: RUN_TYPE.SUPPORT_RUN, EG: RUN_TYPE.HOLD_POSITION, SS: RUN_TYPE.STRIKER_RUN,
    ANC: RUN_TYPE.HOLD_POSITION, DM: RUN_TYPE.HOLD_POSITION, SV: RUN_TYPE.STRIKER_RUN,
    
    // 수비진 (빌드업 시 움직임)
    BPD: RUN_TYPE.SUPPORT_RUN, CD: RUN_TYPE.HOLD_POSITION, NCB: RUN_TYPE.HOLD_POSITION,
    IWB: RUN_TYPE.UNDERLAP_RUN, CWB: RUN_TYPE.WIDE_RUN, LIB: RUN_TYPE.SUPPORT_RUN,
    FB: RUN_TYPE.HOLD_POSITION, WB: RUN_TYPE.WIDE_RUN,
    GK: RUN_TYPE.HOLD_POSITION
};

// [신규] 헬퍼: 각도로 좌표 구하기
function getPosByAngle(x, y, angleDeg, dist) {
    const rad = angleDeg * (Math.PI / 180);
    return {
        x: Math.max(2, Math.min(98, x + Math.cos(rad) * dist)),
        y: Math.max(2, Math.min(98, y + Math.sin(rad) * dist))
    };
}

// =========================================================================================
// [PART 2] 리얼 사커 엔진 (RealSoccerEngine) - 핵심 로직
// =========================================================================================

// 1. 공 상태 머신 정의
const BallState = {
    LOOSE: 0,       // 누구의 소유도 아님 (경합, 흐르는 공)
    CONTROLLED: 1,  // 선수가 소유 중 (드리블, 키핑)
    IN_FLIGHT: 2,   // 패스/슈팅으로 날아가는 중
    DEAD: 3         // 아웃, 골, 파울 등 정지 상태
};

class SimBall {
    constructor() {
        this.x = 50;
        this.y = 50;
        this.z = 0; // 높이
        this.state = BallState.DEAD;
        this.owner = null; // 소유한 SimPlayer 객체
        this.lastOwner = null; // [신규] 직전 소유자 (패스 루프 방지용)
        this.targetPos = { x: 50, y: 50 }; // 패스/슛 목표 지점
        this.velocity = { x: 0, y: 0 };
    }
}

class SimPlayer {
    constructor(data, teamId, role, lineStats, morale = 50, tacticMultiplier = 1.0) {
        this.id = data.name; // 고유 식별자
        this.name = data.name;
        this.position = data.position; // GK, DF, MF, FW
        this.rating = data.rating;
        this.teamId = teamId; // 'home' or 'away'
        this.role = role; // 전술 역할

        // 시뮬레이션 상태
        this.x = 0;
        this.y = 0;
        // [신규] 엔진 내부 물리 계산을 위한 속도 데이터
        this.vx = 0;
        this.vy = 0;

        this.baseX = 0; // 포메이션 기준 위치 (X)
        this.baseY = 0; // 포메이션 기준 위치 (Y)
        this.stamina = (data.condition !== undefined) ? data.condition : 100;

        // 능력치 매핑 (0~100)
        this.stats = this.mapDNAStats(data, role, lineStats, morale, tacticMultiplier);
    }

    mapDNAStats(playerData, role, lineStats, morale, tacticMultiplier) {
        if (!lineStats || !lineStats.attack) { // 데이터 유효성 검사
            // Fallback to rating if lineStats are not available
            return { speed: playerData.rating, passing: playerData.rating, shooting: playerData.rating, defense: playerData.rating, decision: playerData.rating };
        }

        // [수정] 사기(Morale)에 따른 능력치 보정 조정 (유저 이점 제거)
        // 기존: 10당 2% (사기 100일 때 스탯 +10% 뻥튀기 -> 유저가 너무 유리함)
        // 변경: 10당 0.5% (사기 100일 때 스탯 +2.5% -> 합리적인 수준으로 조정)
        const moraleFactor = 1 + ((morale - 50) * 0.0005);

        let line;
        if (playerData.position === 'FW') line = 'attack';
        else if (playerData.position === 'MF') line = 'midfield';
        else line = 'defense'; // DF and GK

        const baseStats = lineStats[line].stats;

        const finalStats = {};
        const statMapping = {
            'passing': 'technique', 'shooting': 'attack', 'defense': 'defense', 'speed': 'speed', 'decision': 'mentality',
            'physical': 'physical' // [신규] 피지컬 스탯 매핑 추가
        };

        for (const [simStat, dnaStat] of Object.entries(statMapping)) {
            const baseStatValue = baseStats[dnaStat] || playerData.rating; // DNA 스탯 없으면 OVR로 대체
            
            let statVal = TacticsManager.calculateFinalPower(baseStatValue, role, dnaStat);
            
            // [적용] 사기 보너스 반영
            statVal = statVal * moraleFactor;
            
            // [적용] 전술 완성도 반영 (balanced일 경우 페널티)
            statVal = statVal * tacticMultiplier;

            finalStats[simStat] = statVal;
        }
        
        return finalStats;
    }
}

class RealSoccerEngine {
    constructor(homeSquad, awaySquad, homeTactic = 'balanced', awayTactic = 'balanced') {
        this.players = [];
        this.ball = new SimBall();
        this.matchTime = 0;
        this.eventsQueue = []; // 렌더러/시스템으로 보낼 이벤트
        this.pendingShot = null; // [신규] 슛 결과 대기
        this.celebrationTimer = 0; // [신규] 세레머니 타이머
        this.celebrationActor = null; // 세레머니 주인공
        this.celebrationTarget = null; // 세레머니 목표 지점
        this.celebrationType = null; // 'celebrate' or 'quick_restart'
        this.lastScorerTeam = null;
        this.homeScore = 0; // [신규] 엔진 내부 스코어 추적
        this.awayScore = 0;
        this.userStats = null;
        this.aiStats = null;
        this.lastAction = 'normal'; // [신규] 역습 트리거 추적용

        // 선수 초기화
        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        
        // 킥오프 세팅
        this.resetPositions('home');
    }

    // [신규] 체력이 반영된 실시간 스탯 계산 헬퍼
    getEffectiveStat(player, statName) {
        let val = player.stats[statName];
        if (val === undefined) return 50;

        // 체력에 따른 페널티 적용
        // 30 미만: 심각한 저하 (50%)
        // 50 미만: 저하 (75%)
        // 70 미만: 약간 저하 (90%)
        let factor = 1.0;
        if (player.stamina < 50) factor = 0.5;
        else if (player.stamina < 60) factor = 0.75;
        else if (player.stamina < 70) factor = 0.9;

        return val * factor;
    }

    // [신규] AI 팀을 위한 DNA 스탯 생성
    generateAIStats(squad) {
        const aiStats = {
            attack: { stats: {} },
            midfield: { stats: {} },
            defense: { stats: {} }
        };

        const calcAvg = (players) => players.length > 0 ? Math.round(players.reduce((sum, p) => sum + p.rating, 0) / players.length) : 70;

        const fwOVR = calcAvg(squad.fw.filter(p => p));
        const mfOVR = calcAvg(squad.mf.filter(p => p));
        const dfOVR = calcAvg([...squad.df.filter(p => p), squad.gk].filter(p => p));

        const lines = { attack: fwOVR, midfield: mfOVR, defense: dfOVR };

        for (const [line, ovr] of Object.entries(lines)) {
            const totalPoints = ovr * 6;
            const baseValue = Math.floor(totalPoints / 6);
            let remainder = totalPoints % 6;
            const statKeys = ['attack', 'speed', 'technique', 'physical', 'defense', 'mentality'];
            
            statKeys.forEach(key => {
                aiStats[line].stats[key] = baseValue;
                if (remainder > 0) {
                    aiStats[line].stats[key]++;
                    remainder--;
                }
            });
        }
        return aiStats;
    }

    initTeam(squad, teamId, tactic) {
        // [수정] 가로 모드 포메이션 좌표 설정 (Left <-> Right)
        // Home(Red): 왼쪽(0) 진영 -> 오른쪽(100)으로 공격
        // Away(Blue): 오른쪽(100) 진영 -> 왼쪽(0)으로 공격
        
        // [신규] 전술이 'balanced'(기본)일 경우 조직력 페널티 부여
        // 전술을 짜지 않으면 선수들이 우왕좌왕한다는 컨셉 (능력치 15% 하향)
        const tacticMultiplier = tactic === 'balanced' ? 0.85 : 1.0;

        const setupLine = (list, baseX) => {
            const height = 100; // Y축 높이

            // [신규] DNA 스탯 및 사기 설정
            const isUserTeam = (teamId === 'home' && gameData.isHomeGame) || (teamId === 'away' && !gameData.isHomeGame);
            let lineStats;
            let teamMorale = 50; // AI 기본 사기

            if (isUserTeam) {
                lineStats = gameData.lineStats;
                this.userStats = lineStats;
                teamMorale = gameData.teamMorale; // 유저 팀은 현재 사기 반영 (전술 상성 포함됨)
            } else {
                lineStats = this.aiStats || this.generateAIStats(squad);
                this.aiStats = lineStats;
                // [수정] AI 기본 사기 하향 (너무 강함)
                // 85~100 -> 60~90 (적당히 좋은 상태)
                teamMorale = 60 + Math.floor(Math.random() * 31);
            }

            list.forEach((p, i) => {
                if (!p) return;
                
                // [수정] 역할 할당 (유저 설정 우선 -> 없으면 전술 맞춤형 자동 배정)
                let role = null;
                if (gameData.playerRoles && gameData.playerRoles[p.name]) {
                    role = gameData.playerRoles[p.name];
                } 
                
                if (!role) {
                    // AI 또는 설정 안 된 유저 선수는 전술에 맞는 역할 자동 부여
                    role = this.getBestRoleForTactic(tactic, p.position, i);
                }

                const simP = new SimPlayer(p, teamId, role, lineStats, teamMorale, tacticMultiplier);
                simP.currentBaseX = baseX; // [신규] 전술에 따른 가변 기준점
                simP.baseX = baseX;
                // Y축(상하) 균등 배치 (5~95 사이)
                simP.baseY = (height / (list.length + 1)) * (i + 1);
                simP.x = simP.baseX;
                simP.y = simP.baseY;
                this.players.push(simP);
            });
        };

        if (teamId === 'home') {
            // Home Formation (Left Side)
            if (squad.gk) setupLine([squad.gk], 5); // GK
            setupLine(squad.df, 20); // DF
            setupLine(squad.mf, 45); // MF
            setupLine(squad.fw, 70); // FW
        } else {
            // Away Formation (Right Side)
            if (squad.gk) setupLine([squad.gk], 95);
            setupLine(squad.df, 80);
            setupLine(squad.mf, 55);
            setupLine(squad.fw, 30);
        }
    }

    // [신규] 전술별 최적 역할 반환 헬퍼
    getBestRoleForTactic(tactic, position, index) {
        if (position === 'GK') return 'GK';

        // 전술별 추천 역할 리스트 (순환 배정)
        const roleMap = {
            // 점유율 중심: 연계형 공격수, 플레이메이커, 볼 플레잉 수비수
            'tikitaka': { FW: ['F9', 'DLF'], MF: ['DLP', 'AP', 'MEZ'], DF: ['BPD', 'IWB'] },
            'possession': { FW: ['DLF', 'CF'], MF: ['DLP', 'AP', 'CAR'], DF: ['BPD', 'WB'] },
            'lavolpiana': { FW: ['F9', 'W'], MF: ['DLP', 'REG', 'MEZ'], DF: ['BPD', 'IWB'] },
            
            // 압박/공격 중심: 침투형 공격수, 활동량 많은 미드필더
            'gegenpress': { FW: ['PF', 'AF'], MF: ['BBM', 'BWM', 'MEZ'], DF: ['CD', 'CWB'] },
            'totalFootball': { FW: ['CF', 'F9'], MF: ['BBM', 'MEZ', 'AP'], DF: ['BPD', 'CWB', 'LIB'] },
            
            // 수비/역습 중심: 빠른 공격수, 수비형 미드필더, 안정적 수비수
            'counter': { FW: ['AF', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'FB'] },
            'longBall': { FW: ['TM', 'AF'], MF: ['BWM', 'CM'], DF: ['NCB', 'CD'] },
            'twoLine': { FW: ['AF', 'P'], MF: ['BWM', 'CAR'], DF: ['CD', 'FB'] },
            'parkBus': { FW: ['P', 'TM'], MF: ['BWM', 'DLP'], DF: ['NCB', 'CD'] },
            'catenaccio': { FW: ['TM', 'P'], MF: ['BWM', 'DLP'], DF: ['NCB', 'LIB'] }
        };

        // 기본값 (밸런스)
        const defaultRoles = { FW: ['AF', 'CF'], MF: ['BBM', 'AP'], DF: ['CD', 'FB'] };

        // 매핑된 역할이 없으면 'counter' 등을 기본값으로 처리하거나 defaultRoles 사용
        // tacticSystem의 전술명과 매칭 (counter 등은 그룹으로 묶일 수 있음)
        let selectedMap = roleMap[tactic];
        if (!selectedMap) {
            // twoLine, longBall 등은 위 맵에 있으므로 매칭됨.
            // 매칭 안 되는 경우(오타 등) 대비
            selectedMap = defaultRoles;
        }

        const candidates = selectedMap[position] || defaultRoles[position];
        // 선수 순서(index)에 따라 역할 순환 배정 (예: MF가 3명이면 DLP, AP, MEZ 골고루)
        return candidates[index % candidates.length];
    }

    resetPositions(kickoffTeamId = null) {
    this.ball.x = 50; this.ball.y = 50;
    this.ball.lastOwner = null;
    
    let kicker = null;
    if (kickoffTeamId) {
        kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'FW');
        if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId && p.position === 'MF');
        if (!kicker) kicker = this.players.find(p => p.teamId === kickoffTeamId);
    }

    if (kicker) {
        this.ball.state = BallState.CONTROLLED;
        this.ball.owner = kicker;
        kicker.x = 50;
        kicker.y = 50;
    } else {
        this.ball.state = BallState.LOOSE;
        this.ball.owner = null;
    }
    
    this.players.forEach(p => {
        if (p !== kicker) {
            p.y = p.baseY;
            p.vx = 0; p.vy = 0;
            
            if (p.teamId === 'home') {
                const maxLine = p.position === 'MF' ? 40 : 48;
                p.x = Math.min(p.baseX, maxLine);
            } else {
                const minLine = p.position === 'MF' ? 60 : 52;
                p.x = Math.max(p.baseX, minLine);
            }
        }
    });
}
    // ============================================================
    // 🟣 [핵심] 메인 틱 업데이트 함수 (1틱 = 1분 흐름 시뮬레이션)
    // ============================================================
    update(minute, isNewMinute) {
    this.eventsQueue = [];

    if (this.ball.state === BallState.DEAD && this.celebrationTimer <= 0 && !this.pendingShot) {
        this._deadTicks = (this._deadTicks || 0) + 1;
        if (this._deadTicks >= 2) { this._deadTicks = 0; this.resetPositions(this.lastScorerTeam === 'home' ? 'away' : 'home'); }
        return this.getSnapshot();
    }
    if (this.ball.state !== BallState.DEAD) this._deadTicks = 0;

    if (this.ball.state === BallState.IN_FLIGHT) {
        const tx = this.ball.targetPos ? this.ball.targetPos.x : null;
        const ty = this.ball.targetPos ? this.ball.targetPos.y : null;
        if (tx === null || tx === undefined || isNaN(tx) || isNaN(ty)) {
            this.ball.state = BallState.LOOSE;
            this.ball.owner = null;
        }
    }

    if (this.ball.state === BallState.LOOSE && !this.pendingShot) {
        this._looseTicks = (this._looseTicks || 0) + 1;
        if (this._looseTicks >= 5) {
            this._looseTicks = 0;
            let nearest = null;
            let minDst = 999;
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDst) { minDst = d; nearest = p; }
            });
            if (nearest) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.x = nearest.x;
                this.ball.y = nearest.y;
            }
        }
    } else {
        this._looseTicks = 0;
    }

    if (isNewMinute) {
        this.consumeStamina();
    }

    if (this.celebrationTimer > 0) {
        this.processCelebrationMovement();
        this.celebrationTimer--;
        if (this.celebrationTimer <= 0) {
            const nextKickoff = this.lastScorerTeam === 'home' ? 'away' : 'home';
            this.resetPositions(nextKickoff);
        }
        return this.getSnapshot();
    }

    if (this.ball.state === BallState.IN_FLIGHT) {
        const ballSpeed = 11;
        const dx = this.ball.targetPos.x - this.ball.x;
        const dy = this.ball.targetPos.y - this.ball.y;
        const dist = Math.hypot(dx, dy);

        if (dist <= ballSpeed) {
            this.ball.x = this.ball.targetPos.x;
            this.ball.y = this.ball.targetPos.y;
            this.ball.state = BallState.LOOSE;

            if (this.pendingShot) {
                this.handleShotResult();
                return this.getSnapshot();
            }
        } else {
            const ratio = ballSpeed / dist;
            this.ball.x += dx * ratio;
            this.ball.y += dy * ratio;
            this.checkInterception();
        }
    }

    if (this.ball.state === BallState.LOOSE) {
        let nearest = null;
        let minDst = 999;
        this.players.forEach(p => {
            const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
            if (d < minDst) { minDst = d; nearest = p; }
        });

        if (nearest && minDst < 5) {
            const isBallInOwnHalf = (nearest.teamId === 'home' && this.ball.x < 50) ||
                                    (nearest.teamId === 'away' && this.ball.x > 50);
            const dt = gameData.deepTactics || { defensiveLine: 'standard' };
            if (dt.defensiveLine === 'deep' && isBallInOwnHalf) {
                this.lastAction = 'counter_attack';
            } else {
                this.lastAction = 'normal';
            }
            this.ball.state = BallState.CONTROLLED;
            this.ball.owner = nearest;
            this.ball.x = nearest.x;
            this.ball.y = nearest.y;
        }
    }

    if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
        this.processBallCarrierAI(this.ball.owner);
    }
    this.processOffBallAI();

    this.adjustDefensiveLines();

    return this.getSnapshot();
}
    
    // [신규] 엔진 내부 체력 소모 로직
    consumeStamina() {
        const rates = { 'FW': 0.6, 'MF': 0.7, 'DF': 0.4, 'GK': 0.1 };
        this.players.forEach(p => {
            const rate = rates[p.position] || 0.5;
            // 랜덤 변수 ±20% 적용하여 체력 소모의 다양성 부여
            p.stamina = Math.max(0, p.stamina - (rate * (0.8 + Math.random() * 0.4)));
        });
    }

    // [신규] 현재 상태 스냅샷 반환 헬퍼 (중복 코드 제거)
    getSnapshot() {
        return {
            ball: { x: this.ball.x, y: this.ball.y, z: this.ball.z, state: this.ball.state },
            players: this.players.map(p => ({
                id: p.id, x: p.x, y: p.y, team: p.teamId, hasBall: (this.ball.owner === p)
            })),
            events: [...this.eventsQueue],
            isCelebration: this.celebrationTimer > 0 // [신규] 세레머니 중인지 여부 전달
        };
    }

    // 🟠 [AI] 공 가진 선수 행동 우선순위
    processBallCarrierAI(player) {
        const isHome = player.teamId === 'home';
        const goalX = isHome ? 100 : 0; // [수정] 가로 모드: 홈->100, 원정->0
        const distToGoal = Math.abs(player.x - goalX);
        
        // [신규] AI 팀인지 확인 (상대팀 버프용)
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        // 0. 압박감 체크 (가장 가까운 적과의 거리)
        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8; // 8m 이내에 적이 있으면 압박받음

        // 1. 슛 (찬스 파이프라인)
        let shootThreshold = 30;
        if (isAI) shootThreshold = 32; // [AI 너프] 38m -> 32m (중거리 슛 남발 방지)

        if (distToGoal < shootThreshold) { 
            // 거리가 가까울수록 슈팅 확률 대폭 상승
            let shootChance = 0.15; 
            if (distToGoal < 20) shootChance = 0.7; // [수정] 20m: 60% -> 70%
            if (distToGoal < 12) shootChance = 0.95; // [수정] 12m: 90% -> 95%

            // [AI 너프] 슈팅 확률 보정 감소 (+15% -> +5%)
            if (isAI) shootChance += 0.05;

            if (Math.random() < shootChance) {
                this.attemptShoot(player, goalX);
                return;
            }
        }

        // 2. 패스 (공간 계산)
        // [수정] 압박 및 전방 상황에 따른 동적 패스/드리블 결정
        let passProb = 0.5; // 기본값
        const isBlocked = this.checkFrontalBlock(player, goalX);

        // 내 앞(골대 방향)이 막혀있는지 확인
        if (isBlocked) {
            if (underPressure) {
                // [수정] 압박 시 패스 확률 하향 (95% -> 75%)하여 드리블 시도 증가
                passProb = 0.75;
            } else {
                // [수정] 앞이 막혔지만 압박이 없을 때 패스 확률 하향 (10% -> 5%)
                passProb = 0.05; 
            }
        } else {
            // 뚫려있으면 드리블 우선 (패스 확률 20%로 낮춤 -> 드리블 80%)
            // [수정] 단, 수비수와 골키퍼는 무리한 드리블 자제 (안전 지향)
            if (player.position === 'DF' || player.position === 'GK') {
                // 압박이 없으면 수비수도 조금 몰고 올라감 (빌드업)
                passProb = underPressure ? 0.98 : 0.4; 
            } else {
                // [재수정] 패스 확률 상향 (0.02 -> 0.15) 하여 주변 동료와의 연계 플레이(Link-up) 강화
                // 너무 낮은 패스 확률은 팀원들을 무시하는 독주로 이어짐
                passProb = 0.15;

                // [전술 반영] 티키타카일 경우 패스 빈도 상향 (원터치 패스 유지)
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') {
                    passProb = 0.45;
                }

                // [AI 버프] AI는 공간이 있으면 드리블 돌파를 더 선호 (패스 확률 낮춤)
                if (isAI && !isBlocked) {
                    passProb -= 0.15; 
                }
            }
        }

        // 전방에 있는 팀원 중 '공간'이 열린 선수 찾기
        let bestPassTarget = null;

        // [수정] 골키퍼는 상황에 따라 짧은 패스(빌드업)와 롱킥을 섞어서 사용
        if (player.position === 'GK') {
            if (Math.random() < 0.7) { // 70% 확률로 짧은 패스(안전) 우선 탐색
                bestPassTarget = this.findBestPassTarget(player, 'safe');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            } else { // 30% 확률로 롱킥 시도
                bestPassTarget = this.findBestPassTarget(player, 'aggressive');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
            }
            
            // [신규] GK가 패스 줄 곳을 못 찾았을 때: 드리블 금지! 걷어내기 시도
            // [수정] 패스 확률 체크에서 떨어져도(드리블 하려 해도) 걷어냄
            if (!bestPassTarget || Math.random() >= passProb) {
                this.clearBall(player);
                return;
            }
        } else {
            // 필드 플레이어: 1차 전진, 2차 안전
            bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            if (!bestPassTarget) {
                bestPassTarget = this.findBestPassTarget(player, 'safe');
            }
        }

        if (bestPassTarget && Math.random() < passProb) { 
            this.executePass(player, bestPassTarget);
            return;
        }

        // 3. 드리블 (전진)
        // [신규] 수비수가 앞에 있으면 돌파 시도 or 뺏김
        const nearestDef = this.findNearestDefender(player);
        if (nearestDef && nearestDef.dist < 7) { // 감지 거리 확대 (5m -> 7m)
            // 수비수가 가까이 붙었을 때의 처리
            // 개인기 로직 제거: 부자연스러운 흔들림 방지
            
            if (Math.random() < 0.4) { // 40% 확률로 태클 당함
                this.attemptTackle(nearestDef.player, player);
                return;
            }
        }

        const moveDir = isHome ? 1 : -1;
        // [수정] 스피드 스탯 반영 (기본 속도 + 스피드 스탯 보정)
        // [체력 반영] 체력이 떨어진 속도로 계산
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const speedFactor = effectiveSpeed / 75; // 평균 75 기준
        let moveSpeed = 0.7 * Math.max(0.7, Math.min(1.4, speedFactor)); // [속도조절] 온더볼 속도 추가 하향
        
        // [수정] 수비수는 드리블 거리 짧게 (안전 제일)
        let moveDist = (0.25 + Math.random() * 0.3) * speedFactor; // [속도조절] 드리블 보폭 소폭 축소
        if (player.position === 'DF') moveDist = (0.5 + Math.random() * 0.5); 

        // [신규] 미드필더 전진 드리블 강화 (공 운반)
        if (player.position === 'MF' && !underPressure && !isBlocked) {
            moveDist += 0.6; // 공간이 있으면 더 멀리 치고 나감
        }

        // [AI 버프] AI 공격진은 드리블 시 더 폭발적으로 전진
        if (isAI && (player.position === 'FW' || player.position === 'MF')) {
            moveDist *= 1.1; // [AI 너프] 1.5 -> 1.1 (과도한 돌파 억제)
        }

        // [신규] 공간이 열려있어서 드리블을 선택한 경우(passProb가 낮음), 과감하게 치고 달림
        if (passProb <= 0.1 && (player.position === 'FW' || player.position === 'MF')) {
            moveDist += 1.0; // 속도 증가 (2.5 -> 1.0)
            moveSpeed = 1.5;
        }

        if (isBlocked && !underPressure) {
            // [신규] 앞이 막혔지만 압박이 없으면 횡드리블 (공간 창출)
            player.x += moveDir * (Math.random() * 0.8); // 2 -> 0.8
            player.y += (Math.random() < 0.5 ? 6.5 : -6.5) + (Math.random() * 2.0);
        } else {
            // 기본 전진 드리블
            player.x += moveDir * moveDist; 
            player.y += (Math.random() - 0.5) * 4; // [수정] 무작위 흔들림 대폭 축소 (18 -> 4)
        }

        // 드리블을 했으므로 어시스트 체인 초기화
        this.ball.lastOwner = null;
        
        //  밖으로 나가지 않게
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));

        // 공도 같이 이동
        this.ball.x = player.x;
        this.ball.y = player.y;
        
        // 드리블 이벤트 (텍스트용)
        if (Math.random() < 0.2) {
            this.eventsQueue.push({ type: 'dribble', player: player.name });
        }
    }

    // 🟡 [공간 계산] 패스 대상 선정 알고리즘
    findBestPassTarget(player, mode = 'aggressive') { // mode: 'aggressive'(전진) or 'safe'(점유)
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        // 공격 모드일 땐 기준점 높음, 안전 모드일 땐 기준점 낮춰서라도 패스처 찾음
        let maxScore = mode === 'aggressive' ? 10 : -50;

        // [신규] AI 여부 확인
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0; // [수정] 공격 방향 X좌표

        teamates.forEach(tm => {
            // 1. 전진 점수 (공격 방향에 가까울수록 높음)
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter); 
            
            // 안전 모드(빌드업)에서는 전진 가중치를 낮춰서 횡/백패스도 점수를 받게 함
            if (mode === 'safe') {
                forwardScore *= 0.5;
            } else {
                forwardScore *= 3.0; // [수정] 전진 패스 선호도 증가
                // [재수정] 백패스 페널티 대폭 강화 (40 -> 80) 하여 의미 없는 백패스 방지
                if (distAfter > distBefore) forwardScore -= 80; 
                
                // [AI 버프] AI는 전진 패스에 더 높은 가산점을 줌 (공격적 운영)
                if (isAI && forwardScore > 0) {
                    forwardScore *= 1.2; // [AI 너프] 1.8 -> 1.2 (패스 선택지 다양화)
                }
            }

            // 2. 거리 점수 (너무 멀거나 너무 가까우면 감점)
            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 10) distScore = -50; // 너무 가까움
            else if (dist > 25) distScore = -(dist - 25) * 2.0; // [수정] 25m 이상이면 점수 대폭 감점 (짧은 패스 선호)
            else distScore = 20; // [신규] 적당한 거리(10~25m)에 가산점 부여

            // [신규] 롱패스(20m 이상)이면서 백패스인 경우 점수 대폭 삭감 (요청 반영)
            // distAfter(받는사람 골거리) > distBefore(내 골거리) => 골대에서 멀어짐 (백패스)
            if (dist > 20 && distAfter > distBefore) {
                distScore -= 100; // 사실상 금지 수준의 페널티
            }

            // [신규] 수비수 -> 공격수 다이렉트 롱패스 억제 (빌드업 장려)
            if (player.position === 'DF' && tm.position === 'FW' && dist > 35) {
                distScore -= 40; // 뻥축구 방지 (미드필더 거쳐가도록 유도)
            }

            // [신규] 최전방 공격수의 최후방 백패스 강력 억제 (경기 루즈함 방지)
            if (player.position === 'FW' && distAfter > distBefore) {
                if (tm.position === 'GK') {
                    distScore -= 500; // GK에게 백패스 금지
                } else if (tm.position === 'DF' && dist > 15) {
                    distScore -= 150; // 수비수에게 15m 이상 백패스 금지
                }
            }

            // 3. 압박 점수 (주변에 적이 없어야 함)
            let pressureScore = 0;
            this.players.forEach(opp => {
                if (opp.teamId !== player.teamId) {
                    const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                    if (d < 15) pressureScore -= (15 - d) * 3; // 적이 가까우면 감점
                }
            });
            
            // 안전 모드에서는 압박 회피가 최우선 (뺏기면 안됨)
            if (mode === 'safe') pressureScore *= 2.0;

            // [수정] 4. 패스 루프 방지 (직전 패스해준 사람에게 다시 주는 것 감점)
            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) {
                // [밸런스] 리턴 패스 페널티 대폭 강화 (60 -> 150)
                loopPenalty = mode === 'aggressive' ? 150 : 40;
            }

            // [신규] 4-1. 미드필더의 의미 없는 백패스 방지 (수비수에게 돌려주기 억제)
            if (mode === 'aggressive' && player.position === 'MF' && tm.position === 'DF') {
                loopPenalty += 80; 
            }

            // [신규] 5. 빌드업 보너스 (DF -> MF 연결 장려)
            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5; // 미드필더에게 주는 전진 패스 (가장 선호)
                else if (tm.position === 'DF') positionBonus = 3; // [수정] 같은 수비수(CB↔FB) 간 연결도 장려
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            // [신규] 6. 연계 플레이 보너스 (내려오는 공격수나 전진하는 미드필더 선호)
            let linkupBonus = 0;
            const targetBehavior = this.getRoleBehavior(tm.role);
            if (targetBehavior.comeShort && tm.position === 'FW') linkupBonus += 35;
            if (targetBehavior.attackBias > 0.2 && tm.position === 'MF') linkupBonus += 20;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + linkupBonus;
            
            if (totalScore > maxScore) {
                maxScore = totalScore;
                bestTarget = tm;
            }
        });

        return bestTarget;
    }

    // [신규] 공 걷어내기 (Clearance) - GK나 수비수가 위급할 때 사용
    clearBall(player) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        
        // 중앙선(50) 부근, 좌우 랜덤하게 걷어냄
        const targetX = 50 + (forwardDir * (Math.random() * 10)); 
        const targetY = 20 + Math.random() * 60; // 터치라인 밖으로 나가지 않게 안쪽으로
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.lastOwner = player; // [수정] 걷어내기 시에도 마지막 소유자 기록 (아군 인터셉트 방지용)
        this.ball.targetPos = { x: targetX, y: targetY };
        this.eventsQueue.push({ type: 'pass', from: player.name, to: '걷어내기', desc: `${player.name}, 멀리 걷어냅니다!` });
    }

    executePass(from, to) {
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.lastOwner = from; // [신규] 패스한 사람 기억 (다음 턴에 이 사람한테 바로 안 주게 함)
        this.ball.owner = null;
        
        // [신규] 패스 성공률 계산 로직
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        // [신규] 스루패스 여부 판단 (전방으로 길게 찌르는 패스)
        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);
        const isThroughPass = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60; // 5m 이상 전진, 10m 이상 거리, 상대 진영
        
        // 거리 페널티: 20m까지는 괜찮고, 그 이후 1m당 정확도 감소
        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        
        // 골키퍼 롱킥은 랜덤성 추가 (가끔 삑사리)
        if (from.position === 'GK' && dist > 50) successChance -= 15;

        // [신규] 스루패스 보정 (오버롤 영향력 강화)
        let eventType = 'pass';
        let eventDesc = `${from.name}, ${to.name}에게 연결!`;

        if (isThroughPass) {
            eventType = 'throughpass';
            // 기본 난이도 페널티 (-20)
            successChance -= 20; 
            // 오버롤(Passing 스탯)에 따른 보너스: 75 이상부터 성공률 급상승
            if (accuracy > 75) {
                successChance += (accuracy - 75) * 1.5; 
            }
            eventDesc = `⚡ ${from.name}, ${to.name}에게 결정적인 스루패스!`;
        }

        // 주사위 굴리기 (성공 확률 0~100)
        const roll = Math.random() * 100;
        const isBadPass = roll > successChance;

        if (isBadPass) {
            // [실패] 목표 지점에서 빗나감 (거리 비례 오차)
            const errorMargin = dist * 0.25; // 거리의 25%만큼 빗나갈 수 있음
            const angle = Math.random() * Math.PI * 2;
            const errorDist = Math.random() * errorMargin + 5; // 최소 5m 이상 빗나감
            
            // 엉뚱한 곳으로 공이 날아감 -> 상대가 잡거나 루즈볼 경합
            const targetX = Math.max(2, Math.min(98, to.x + Math.cos(angle) * errorDist));
            const targetY = Math.max(2, Math.min(98, to.y + Math.sin(angle) * errorDist));
            
            this.ball.targetPos = { x: targetX, y: targetY };
            const failDesc = isThroughPass ? `${from.name}의 스루패스가 차단됩니다.` : `${from.name}, 패스 미스!`;
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: failDesc });
        } else {
            // [성공] 정확하게 배달
            this.ball.targetPos = { x: to.x, y: to.y };
            this.eventsQueue.push({ type: eventType, from: from.name, to: to.name, desc: eventDesc });
        }
    }

    // 🔵 [찬스 파이프라인] 슛 시도
    attemptShoot(shooter, goalX) {
        // [수정] 상대 GK 찾기 및 능력치 반영
        const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
        const gk = this.players.find(p => p.teamId === opponentTeamId && p.position === 'GK');
        const gkRating = gk ? gk.stats.defense : 60; // GK가 없으면 60으로 가정

        // 거리 보정 (골대와 가까울수록 유리)
        const dist = Math.abs(shooter.x - goalX);
        const distFactor = Math.max(0.7, 1.3 - (dist / 40)); // 가까우면 1.3배, 멀면 0.7배

        // [신규] 슈팅 각도 보정 (비현실적 각도 슛 방지)
        const distY = Math.abs(shooter.y - 50); // 골대 중심(50)으로부터의 Y축 거리
        let angleFactor = 1.0;
        
        // 골대 폭(약 10)을 벗어난 경우 각도 계산
        if (distY > 8) {
            // 골대와 가까울수록(dist가 작을수록), 측면일수록(distY가 클수록) 각도가 좁아짐
            // atan2(y, x) -> 라디안 값 반환 (0 ~ PI/2)
            const angle = Math.atan2(distY, Math.max(1, dist)); 
            
            // 각도가 클수록(측면일수록) 페널티 부여
            if (angle > 1.2) angleFactor = 0.15; // 약 68도 이상 (사각지대) -> 15% 파워
            else if (angle > 0.9) angleFactor = 0.4; // 약 51도 이상 -> 40% 파워
            else if (angle > 0.6) angleFactor = 0.7; // 약 34도 이상 -> 70% 파워
            else angleFactor = 0.9;
        }

        // 슈팅 파워: 능력치(80~120% 변동) * 거리보정 * 각도보정
        // [체력 반영] 슈팅 파워에 체력 반영
        const effectiveShooting = this.getEffectiveStat(shooter, 'shooting');
        const shotPower = effectiveShooting * (0.8 + Math.random() * 0.4) * distFactor * angleFactor;
        // [수정] 선방 파워 재조정 (GK 버프): 0.7 -> 0.8 계수 상향 및 기본값 +5 추가
        const savePower = gkRating * (0.8 + Math.random() * 0.5) + 5; 

        // [밸런스 수정] 골 결정 로직 변경 (확률 기반)
        // 기존: isGoal = shotPower > savePower; (너무 극단적)
        // 변경: 스탯 차이에 따라 확률을 계산하여, 운의 요소를 추가하고 극단적인 결과를 완화
        const powerDiff = shotPower - savePower;
        
        // [밸런스] 득점률 추가 하향: 기본 확률 12%, 스탯 반영률 0.25%로 조정 (다득점 방지)
        let goalChance = 0.12 + (powerDiff * 0.0025);
        
        // [밸런스] 최소/최대 확률 추가 조정 (최소 1%, 최대 55%)
        goalChance = Math.max(0.01, Math.min(0.55, goalChance));

        // [수정] 역습 보너스 하향 (1.5 -> 1.2)
        if (this.lastAction === 'counter_attack') {
            goalChance *= 1.2;
        }

        let isGoal = Math.random() < goalChance;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 }; // [수정] 골문 구석도 노리도록 Y좌표 분산 (45~55)

        // [수정] 즉시 결과를 처리하지 않고 예약 (공이 날아가는 시간을 확보)
        this.pendingShot = {
            isGoal: isGoal,
            shooter: shooter,
            goalX: goalX
        };
        // 참고: 여기서 바로 'goal' 이벤트를 보내지 않음
    }

    // [신규] 공이 골대에 도착했을 때 결과 처리
    handleShotResult() {
        const { isGoal, shooter, goalX } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            // [신규] 스코어 업데이트 및 세레머니 타입 결정
            if (shooter.teamId === 'home') this.homeScore++;
            else this.awayScore++;

            const isHome = shooter.teamId === 'home';
            const myScore = isHome ? this.homeScore : this.awayScore;
            const oppScore = isHome ? this.awayScore : this.homeScore;
            
            // [신규] 어시스트 기록 로직
            let assister = null;
            // 직전 소유자가 있고, 득점자와 같은 팀이며, 다른 선수일 경우 어시스트로 인정
            if (this.ball.lastOwner && this.ball.lastOwner.teamId === shooter.teamId && this.ball.lastOwner.name !== shooter.name) {
                assister = this.ball.lastOwner.name;
            }
            
            // 지고 있으면 빨리 복귀(Quick Restart), 아니면 세레머니
            this.celebrationType = (myScore < oppScore) ? 'quick_restart' : 'celebrate';
            this.celebrationActor = shooter;
            
            // 목표 지점 설정
            if (this.celebrationType === 'quick_restart') {
                this.celebrationTarget = { x: 50, y: 50 }; // 센터 서클
            } else {
                // 코너 플래그 쪽 (골 넣은 진영의 가까운 코너)
                const goalX = isHome ? 100 : 0;
                const cornerY = (shooter.y < 50) ? 0 : 100; 
                this.celebrationTarget = { x: goalX, y: cornerY };
            }

            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId, assister: assister });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40; // [수정] 세레머니 시간 확대 (약 2.4초) - 이동 보여주기 위해
            this.ball.state = BallState.DEAD;

            // 골이 들어갔으므로 어시스트 체인 초기화
            this.ball.lastOwner = null;
        } else {
            // [수정] 슈팅 실패 시 다양한 상황 연출 (수비 블록, 펀칭, 캐칭)
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';

            // 1. 수비 블록 체크 (슈터 근처에 수비수가 있는지)
            const defenders = this.players.filter(p => 
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            
            // 슈터보다 골대 쪽에 있는 수비수 필터링
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefenders.length > 0 && Math.random() < 0.35) { // 35% 확률로 수비 블록
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                
                // 튕겨나온 공 (루즈볼)
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5); // 튕겨 나옴
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            // 2. GK 선방 처리 (캐칭 vs 펀칭)
            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            if (enemyGk) {
                if (Math.random() < 0.5) { // 50% 확률로 펀칭 (루즈볼)
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE;
                    this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAttacking ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else { // 50% 확률로 캐칭 (소유권 획득)
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 안정적으로 공을 잡아냅니다.` });
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = enemyGk;
                    this.ball.x = enemyGk.x;
                    this.ball.y = enemyGk.y;
                }
            } else {
                // GK가 없으면 골대 앞 루즈볼
                this.eventsQueue.push({ type: 'miss', shooter: shooter.name, desc: `🥅 ${shooter.name}의 슈팅이 골문을 벗어납니다.` });
                this.ball.state = BallState.LOOSE;
                this.ball.x = goalX === 0 ? 5 : 95;
                this.ball.y = 50;
            }
        }
    }

    // [신규] 세레머니 움직임 처리
    processCelebrationMovement() {
        if (!this.celebrationActor || !this.celebrationTarget) return;

        const p = this.celebrationActor;
        const target = this.celebrationTarget;
        
        // 1. 득점자 이동
        const dx = target.x - p.x;
        const dy = target.y - p.y;
        const dist = Math.hypot(dx, dy);
        
        if (dist > 1) {
            const speed = 1.2; // 빠르게 이동
            p.x += (dx / dist) * speed;
            p.y += (dy / dist) * speed;
        }

        // 2. 공 이동 (지고 있을 때만 공을 들고 뜀)
        if (this.celebrationType === 'quick_restart') {
            this.ball.x = p.x;
            this.ball.y = p.y;
        }

        // 3. 동료들 이동
        this.players.forEach(tm => {
            if (tm.teamId === p.teamId && tm !== p) {
                if (this.celebrationType === 'celebrate') {
                    // 축하하러 득점자에게 모임
                    const ddx = p.x - tm.x;
                    const ddy = p.y - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 3) {
                        tm.x += (ddx / d) * 0.9;
                        tm.y += (ddy / d) * 0.9;
                    }
                } else {
                    // 빨리 자기 진영으로 복귀
                    const ddx = tm.baseX - tm.x;
                    const ddy = tm.baseY - tm.y;
                    const d = Math.hypot(ddx, ddy);
                    if (d > 1) {
                        tm.x += (ddx / d) * 1.0;
                        tm.y += (ddy / d) * 1.0;
                    }
                }
            }
        });
    }

    // 오프 더 볼 움직임 (간단화)
    processOffBallAI() {
        const attackingTeam = this.ball.owner ? this.ball.owner.teamId : null;
        let isChasingLooseBall = false; // Declare and initialize at the beginning of the function
        
        // [신규] AI 팀인지 확인
        let isAttackingAI = false;
        if (attackingTeam && typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAttackingAI = (attackingTeam !== userSide);
        }

        const isLooseBall = !this.ball.owner && this.ball.state === BallState.LOOSE;
        
        // [신규] 공 소유자가 있을 때 가장 가까운 수비수 찾기 (압박 담당)
        let presser = null;
        if (this.ball.owner) {
            let minD = 999;
            this.players.forEach(p => {
                if (p.teamId !== attackingTeam) {
                    const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    if (d < minD) { minD = d; presser = p; }
                }
            });
        }

        // [수정] 루즈볼일 때 각 팀별로 가장 가까운 선수 1명씩 찾기
        let nearestHome = null;
        let nearestAway = null;
        
        if (isLooseBall) {
             let minDHome = 999;
             let minDAway = 999;
             
             this.players.forEach(p => {
                 const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                 if (p.teamId === 'home') {
                     if (d < minDHome) { minDHome = d; nearestHome = p; }
                 } else {
                     if (d < minDAway) { minDAway = d; nearestAway = p; }
                 }
             });
        }

        this.players.forEach(p => {
            if (p === this.ball.owner) return; // 공 가진 사람은 processBallCarrierAI에서 처리

            const dt = gameData.deepTactics || { pressIntensity: 'mid', defensiveLine: 'standard' };
            // [신규] 역할별 행동 특성 미리 가져오기
            const behavior = this.getRoleBehavior(p.role);

            let targetX = p.x;
            let targetY = p.y;
            
            // [전술 반영] 압박 강도에 따른 감지 범위 및 적극성 조절
            let pressDetectDist = 8;
            let sprintBonus = 1.0;
            if (dt.pressIntensity === 'high') {
                pressDetectDist = 20; // 20m까지 압박 시도
                sprintBonus = 1.2;    // 압박 시 속도 20% 증가
            } else if (dt.pressIntensity === 'low') {
                pressDetectDist = 4;  // 아주 가까울 때만 압박
            }

            // [신규] 이동 속도에 '스피드' 스탯 반영
            // 기본 0.15 * (스피드 / 75) -> 스피드 100이면 약 0.2 (33% 빠름)
            // [체력 반영] 오프더볼 움직임에도 체력 반영
            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 1.0 * Math.max(0.7, Math.min(1.4, speedFactor)); // [속도조절] 오프더볼 기본 속도 소폭 하향 (1.2 -> 1.0)

            // ------------------------------------
            // 상황 1: 루즈볼 (공이 주인 없을 때) - 모두가 공을 향해 뜀
            // ------------------------------------
            if (isLooseBall) {
                // [수정] 동네 축구 방지: 각 팀에서 가장 가까운 선수만 공을 쫓음
                const isNearest = (p === nearestHome || p === nearestAway);
                
                if (isNearest) {
                    targetX = this.ball.x;
                    targetY = this.ball.y;
                    moveSpeed = 1.1; // [속도조절] 루즈볼 추격 속도 하향 (1.3 -> 1.1)
                    isChasingLooseBall = true; // 루즈볼을 쫓는 중임을 표시
                }
                // [수정] 루즈볼일 때도 나머지는 공의 위치에 따른 공수 대형을 유지함 (서성이는 현상 방지)
            }

            // [수정] 공 소유권 여부와 상관없이 공의 위치를 기준으로 공격/수비 상황 판단
            const isHome = p.teamId === 'home';
            const isTeamAttacking = attackingTeam ? (p.teamId === attackingTeam) : (isHome ? this.ball.x > 50 : this.ball.x < 50);

            if (isTeamAttacking) {
                // [공격 시] 침투, 지원, 오버래핑
                const forwardDir = isHome ? 1 : -1; // [수정] 홈(1), 어웨이(-1)
                
                // [신규] Give & Go 움직임 (패스하고 전방 침투)
                // 방금 패스한 선수(lastOwner)는 가만히 있지 않고 앞으로 달려서 리턴 패스를 노림
                const isLastPasser = (p === this.ball.lastOwner);
                // 센터백(CD, BPD, NCB)이나 골키퍼는 자리 지킴
                const isRearDefender = p.position === 'GK' || (p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role));

                if (isLastPasser && !isRearDefender) {
                    // 패스 앤 런: 현재 위치에서 전방 15m 지점으로 침투
                    targetX = p.x + (forwardDir * 15);
                    // Y축은 공 방향으로 약간 좁혀 들어감 (지원)
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.8; // [속도조절] 침투 속도 하향 (0.9 -> 0.8)
                } 
                // 1. 기본 위치 로직 (기존 유지)
                else if (p.position === 'FW') {
                    // 공격수: 수비 라인 깨기 시도 or 빈 공간 찾아가기
                    // 상대 수비수와 겹치지 않게 약간 옆으로 이동 (공간 창출)
                    let nearestDefender = null;
                    let minDist = 999;
                    this.players.forEach(opp => {
                        if (opp.teamId !== p.teamId && (opp.position === 'DF' || opp.position === 'GK')) {
                            const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                            if (d < minDist) { minDist = d; nearestDefender = opp; }
                        }
                    });

                    // 수비수가 너무 가까우면(5m) 옆(Y축)으로 벌림
                    let avoidY = 0;
                    if (nearestDefender && minDist < 5) {
                        avoidY = (p.y - nearestDefender.y) > 0 ? 5 : -5;
                    }

                    // [수정] 기본 침투 거리 설정
                    let pushDistance = 20;
                    if (isAttackingAI) pushDistance = 25;

                    // [신규] 연계형 공격수(F9, DLF 등) 내려오는 움직임 구현
                    if (behavior.comeShort) {
                        pushDistance = 2; // 공 근처로 내려와서 대기하며 연계 유도
                    }

                    targetX = this.ball.x + (forwardDir * pushDistance); // 공보다 앞 (X축)
                    targetY = p.baseY + avoidY; // 포메이션 Y위치 + 회피
                    targetY = Math.max(5, Math.min(95, targetY)); // 터치라인 이탈 방지
                    
                    if (behavior.runBehind) targetX += (forwardDir * 10); // 침투형은 더 깊게
                    
                    // [수정] 공격수 침투 속도 상향 (전술 반영)
                    moveSpeed = 0.6 * speedFactor * sprintBonus; // [속도조절] 0.7 -> 0.6
                } else if (p.position === 'MF') {
                    // 미드필더: 공 주변에서 패스 받을 준비 (삼각형 대형 유지)
                    // [수정] 역할 성향(attackBias/defenseBias) 반영
                    const attackBias = behavior.attackBias || 0;
                    const defenseBias = behavior.defenseBias || 0;

                    // 기본 가중치 (공 60%, 베이스 40%) -> 공격적일수록 공에 더 쏠림
                    let ballWeight = 0.6 + (attackBias * 0.4) - (defenseBias * 0.3);
                    ballWeight = Math.max(0.2, Math.min(0.95, ballWeight));

                    targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                    targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);

                    // [수정] 공격적인 미드필더(BBM, MEZ, AP 등)의 전진성 대폭 강화
                    if (attackBias > 0.2) {
                        targetX += (forwardDir * attackBias * 22); // 공격수 라인까지 적극 가담
                    }
                    
                    // 너무 뭉치지 않게 산개 (Y축 기준)
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);
                } else {
                    // 수비수: 라인 올리기 (하프라인 근처까지)
                    // [수정] 공격 시 수비 라인 높이 조절 (더 공격적으로 전진: +15 -> +35)
                    // 공보다 뒤에 머물도록 안전 거리 확보 (35m)
                    if (isHome) {
                        targetX = Math.min(p.baseX + 35, Math.max(p.baseX, this.ball.x - 30));
                    } else {
                        targetX = Math.max(p.baseX - 35, Math.min(p.baseX, this.ball.x + 30));
                    }
                    targetY = p.baseY; // 좌우(Y)는 유지
                }

                // Y축 이동 (벌리기/좁히기 - Cut Inside / Hug Line)
                if (behavior.cutInside) {
                    targetY = 50 + (p.baseY - 50) * 0.5; // 중앙으로 좁힘
                } else if (behavior.hugLine) {
                    targetY = p.baseY < 50 ? 5 : 95; // 터치라인으로 벌림
                }

            } else {
                // ------------------------------------
                // 상황 3: 상대 팀이 공격 중 (수비 오프더볼)
                // ------------------------------------
                // 1. 기본 수비 블록 형성 (공 위치에 따라 전체 이동)
                // [수정] 라인 간격 조정을 위한 이동 계수 차등 적용 (Compactness)
                let shiftFactor = 0.8;
                // [신규] Y축(폭) 이동 계수: 수비수는 대형 유지를 위해 공 쪽으로 덜 쏠리게 함
                let yShiftFactor = 0.2;
                
                const isHomeDef = p.teamId === 'home'; // 변수 선언을 이 위치로 이동
                const myGoalX = isHomeDef ? 0 : 100;
                const inMyBox = isHomeDef ? (this.ball.x < 22) : (this.ball.x > 78);
                
                // 수비 시 미드필더는 더 적극적으로 내려와서 수비 라인과 간격을 좁힘
                if (p.position === 'MF') {
                    const defenseBias = behavior.defenseBias || 0;
                    const attackBias = behavior.attackBias || 0;

                    // [수정] 미드필더 수비 가담: 수비수 바로 앞까지 대폭 후퇴
                    // shiftFactor를 높여 공이 우리 진영으로 올 때 수비수들과 보조를 맞춰 깊숙이 내려옴
                    shiftFactor = 1.25 + (defenseBias * 0.4); 
                    shiftFactor = Math.max(1.1, Math.min(1.6, shiftFactor));
                    moveSpeed = 1.1 * (1 + defenseBias) * sprintBonus; 
                } else if (p.position === 'FW') {
                    // [수정] 공격수 수비 가담: 하프라인 부근(50)까지만 내려와서 역습 대기
                    shiftFactor = 0.45; 
                    moveSpeed = 0.85 * sprintBonus;
                } else if (p.position === 'DF') {
                    shiftFactor = 0.75; // [수정] 수비 라인이 공을 따라 유기적으로 이동하도록 상향 (0.4 -> 0.75)
                    yShiftFactor = 0.05; // [수정] 수비 폭을 더 넓게 유지 (0.1 -> 0.05) - 뭉침 방지
                }

                const ballXShift = (this.ball.x - 50) * shiftFactor; 
                let formationX = p.currentBaseX + ballXShift;
                let formationY = p.baseY + (this.ball.y - 50) * yShiftFactor; 

                // 2. 대인 마크 (내 구역에 들어온 공격수 마크)
                let markTarget = null;
                let minMarkDist = 30; // [수정] 마크 범위 25->30 확대 (더 빨리 붙도록)
                
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                             // [신규] 내 수비 구역을 지키기 위해 포메이션 위치와 너무 멀어지면 마크 안함
                             // [수정] 마크 허용 Y범위 축소 (30 -> 18)하여 뭉침 방지
                             if (Math.abs(p.baseY - opp.y) > 18) return;
                             
                        if (d < minMarkDist) {
                            minMarkDist = d;
                            markTarget = opp;
                        }
                    }
                });

                if (markTarget && p.position !== 'GK') {
                    // 마크 대상과 골대 사이를 막아서는 위치
                    const goalX = p.teamId === 'home' ? 0 : 100; // 내 골대 (Home defends 0)

                        // [수정] 페널티 박스 안이거나 슈팅 위협 시 물러나지 않고 직접 압박
                    const distToGoal = Math.abs(this.ball.x - goalX);
                    const isShootingThreat = distToGoal < 35; // 35m 이내면 위험 지역

                        if ((inMyBox || isShootingThreat) && markTarget === this.ball.owner) {
                            targetX = markTarget.x; // 직접 돌진
                            moveSpeed = 0.9 * speedFactor; // 박스 안에서는 더 빠르게 반응
                    } else {
                            // 상대와 내 골대 사이 9.8 : 0.2 지점 (거의 딱 붙어서 대기)
                            targetX = markTarget.x + (goalX - markTarget.x) * 0.02; 
                            moveSpeed = 0.6;
                    }
                    targetY = markTarget.y; 

                    // [신규] 수비 라인 정렬 (Line Discipline)
                    // 수비수(DF)는 대인 마크 시에도 라인 유지를 최우선으로 함
                    if (p.position === 'DF') {
                        const isHome = p.teamId === 'home';
                        // 침투 여부 판단: 마크해야 할 위치가 내 포메이션 라인보다 더 깊은가(골대 쪽인가)?
                        // Home(0 수비): targetX < formationX 이면 침투
                        // Away(100 수비): targetX > formationX 이면 침투
                        const isPenetrating = isHome ? (targetX < formationX) : (targetX > formationX);

                        if (!isPenetrating) {
                            // 상대가 라인 앞에서 움직이거나 내려와서 받을 때는(Non-penetrating),
                            // 따라나가지 않고 지역 방어(Zone Defense) 형태로 라인을 고수함
                            // formationX(라인 위치) 가중치를 80%로 높여서 일자 라인 유지
                            targetX = (targetX * 0.2) + (formationX * 0.8);
                        } else {
                            // 뒷공간 침투 시에는 따라가야 함 (Man Marking)
                            // 단, 완전히 개별 행동하기보다 라인과의 유기적 움직임을 위해 약간 보정
                            targetX = (targetX * 0.9) + (formationX * 0.1);
                        }
                    }
                } else {
                    targetX = formationX;
                    targetY = formationY;
                }

                // [신규] 골키퍼 위치 고정 (골대 앞 사수)
                if (p.position === 'GK') {
                    const isHomeGK = p.teamId === 'home';
                    const goalLineX = isHomeGK ? 3 : 97; // 절대 넘으면 안 되는 골라인
                    const goalX = isHomeGK ? 5 : 95;     // 기본 포지션
                    
                    targetX = goalX + (this.ball.x - goalX) * 0.1;
                    // 골라인 안쪽으로 강제 클램프 (절대 골라인 밖으로 못 나감)
                    targetX = isHomeGK
                        ? Math.max(goalLineX, Math.min(targetX, 15))
                        : Math.min(goalLineX, Math.max(targetX, 85));
                    
                    targetY = 50 + (this.ball.y - 50) * 0.3;
                    targetY = Math.max(35, Math.min(65, targetY)); // 골문 범위 내로 Y축 제한
                }

                // 3. 압박 (Pressing)
                if (this.ball.owner && p.position !== 'GK') {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    
                    // [신규] 페널티 박스 안 수비수 강제 압박 / 박스 밖 미드필더 강제 압박
                    let forcePress = false;
                    if (inMyBox && p.position === 'DF' && distToBall < 15) forcePress = true;
                    if (!inMyBox && p.position === 'MF' && distToBall < 18) forcePress = true;

                    // [수정] 전술 지시 또는 구역별 강제 압박 상황인 경우 수행
                    if (p === presser || distToBall < pressDetectDist || forcePress) {
                        // [밸런스 수정] 수비수 압박 이동 로직 변경 (보간 -> 직접 이동)
                        // 공격수의 드리블 속도(1.0)에 대응하기 위해 수비수의 전력 질주 속도를 설정합니다.
                        const dx = this.ball.x - p.x;
                        const dy = this.ball.y - p.y;
                        const dist = Math.hypot(dx, dy);
                        // [수정] 압박 속도 상향 (추격 능력 강화)
                        const sprintSpeed = 3.4 * speedFactor * (dt.pressIntensity === 'high' ? 1.15 : 1.0); 

                        if (dist > 0) {
                            p.x += (dx / dist) * sprintSpeed;
                            p.y += (dy / dist) * sprintSpeed;
                        }
                        
                        // 태클 시도
                        // [재수정] 근접 시 태클 빈도 대폭 상향 (거리 5m, 확률 50%~90%)
                        let tackleChance = 0.5;
                        if (distToBall < 2) tackleChance = 0.9;

                        if (distToBall < 5 && Math.random() < tackleChance) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        
                        return; 
                    }
                }

                
                // [수정] 4. 수비 복귀 (Retreat) 로직 최적화: 공이 수비수 뒤로 완전히 빠졌을 때만 긴급 복귀
                const isDeepBeaten = p.position === 'DF' && (isHomeDef ? (this.ball.x < p.x - 8) : (this.ball.x > p.x + 8)) && !inMyBox;

if (isDeepBeaten) {
    // 복귀 목표: baseX 기준으로, 절대 골라인 5 / 95 이내로는 들어가지 않음
    const safeMinX = isHomeDef ? 5 : 5;
    const safeMaxX = isHomeDef ? 95 : 95;
    const retreatTargetX = isHomeDef
        ? Math.max(Math.max(p.baseX, safeMinX), this.ball.x - 8)
        : Math.min(Math.min(p.baseX, safeMaxX), this.ball.x + 8);
    const retreatTargetY = p.baseY;

    const dx = retreatTargetX - p.x;
    const dy = retreatTargetY - p.y;
    const dist = Math.hypot(dx, dy);
    const retreatSpeed = 2.8 * speedFactor;

    if (dist > 0.5) {
        p.x += (dx / dist) * retreatSpeed;
        p.y += (dy / dist) * retreatSpeed;
    }
    // X축 하드 클램프 (골라인 절대 돌파 금지)
    p.x = Math.max(5, Math.min(95, p.x));
    return;
}
            // [신규] 아군끼리 너무 뭉치지 않게 거리 벌리기 (Separation)
            // 주변 아군을 확인하여 너무 가까우면 반대 방향으로 밀어냄
            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                const dist = Math.hypot(targetX - tm.x, targetY - tm.y);
                
                // [수정] 수비수끼리는 간격을 더 넓게 유지 (뭉침 방지, 5m -> 9m)
                let separationDist = 5;
                if (p.position === 'DF' && tm.position === 'DF') separationDist = 9;

                if (dist < separationDist) {
                    const angle = Math.atan2(targetY - tm.y, targetX - tm.x);
                    const push = (separationDist - dist) * 0.5; // 밀어내는 힘
                    targetX += Math.cos(angle) * push;
                    targetY += Math.sin(angle) * push;
                }
            }

            // 경기장 범위 제한
            targetY = Math.max(2, Math.min(98, targetY));
            targetX = Math.max(2, Math.min(98, targetX));
                
            // [신규] 기계적인 움직임 방지를 위한 노이즈(Noise) 추가
            // 목표 지점에 ±2m 정도의 무작위성을 부여하여 자연스러운 곡선/흔들림 연출
            if (!isLooseBall) { // 루즈볼 경합 때는 정확하게 가야 하므로 제외
                targetX += (Math.random() - 0.5) * 0.5; // [수정] 떨림 현상 방지를 위해 노이즈 대폭 축소
                targetY += (Math.random() - 0.5) * 1.0;
            }

            // 실제 이동 적용
            // [수정] 부드러운 가속도와 관성을 적용한 물리 기반 이동
            const accelX = (targetX - p.x) * moveSpeed * 0.12; // [속도조절] 물리 반응성 소폭 하향 (0.15 -> 0.12)
            const accelY = (targetY - p.y) * moveSpeed * 0.12;

            p.vx = (p.vx + accelX) * 0.7; // 이전 속도 유지(관성) + 가속도 - 저항
            p.vy = (p.vy + accelY) * 0.7;

            p.x += p.vx;
            p.y += p.vy;
        });
    }

    // [신규] 전방 수비벽 감지 (드리블 vs 패스 판단용)
    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1; // 홈(100방향), 어웨이(0방향)
        const checkDist = 10; // [수정] 감지 거리를 15m에서 10m로 축소하여 드리블 기회 확대
        const checkWidth = 6; // 좌우 6m 확인

        // 내 앞의 사각형 영역 정의
        const minY = player.y - checkWidth;
        const maxY = player.y + checkWidth;
        const minX = forwardDir === 1 ? player.x : player.x - checkDist;
        const maxX = forwardDir === 1 ? player.x + checkDist : player.x;

        // 이 영역 안에 적이 있는지 검사
        return this.players.some(opp => {
            if (opp.teamId === player.teamId) return false; // 아군은 통과
            
            return (
                opp.x >= minX && opp.x <= maxX &&
                opp.y >= minY && opp.y <= maxY
            );
        });
    }

    // [신규] 런 타입별 목표 위치 계산
    calcOffBallTarget(player, runType, roleStats) {
        const isHome = player.teamId === 'home';
        const forwardDir = isHome ? 1 : -1;
        const attackBonus = (roleStats.attack || 0) * 10; // 공격 가중치 -> 침투 깊이

        // 1. 스트라이커 런 (침투)
        if (runType === RUN_TYPE.STRIKER_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            // 수비 라인 바로 뒤 + 공격성만큼 더 깊이
            const penetrationDepth = 5 + attackBonus; 
            return {
                x: defLineX + (forwardDir * penetrationDepth),
                y: this.ball.y + (Math.random() - 0.5) * 20 // 공 근처 Y
            };
        }
        
        // 2. 서포트 런 (삼각형)
        else if (runType === RUN_TYPE.SUPPORT_RUN) {
            // 공 소유자 기준 대각선 뒤쪽 (안전한 패스 옵션)
            const side = player.baseY < 50 ? 'top' : 'bottom';
            const backDirX = -forwardDir;
            const sideDirY = side === 'top' ? -1 : 1;
            
            return {
                x: this.ball.x + (backDirX * 10),
                y: this.ball.y + (sideDirY * 10)
            };
        }
        
        // 3. 채널 런 (수비 사이)
        else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            // 공과 반대쪽 하프스페이스 찾기
            const targetY = this.ball.y < 50 ? 70 : 30; 
            return { x: defLineX + (forwardDir * 2), y: targetY }; 
        }
        
        // 4. 와이드 런 (벌리기)
        else if (runType === RUN_TYPE.WIDE_RUN) {
            // 터치라인 쪽으로 벌림 (Y=5 or Y=95)
            const sideY = player.baseY < 50 ? 5 : 95;
            return { x: this.ball.x + (forwardDir * 5), y: sideY };
        }
        
        // 5. 언더랩 런 (안으로)
        else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const halfSpaceY = player.baseY < 50 ? 30 : 70;
            const defLineX = this.getDefensiveLineX(isHome ? 'away' : 'home');
            return { x: defLineX + (forwardDir * 5), y: halfSpaceY };
        }
        
        // 6. 홀드 포지션 (자리 지키기)
        else {
            const ballInfluence = 0.2; // 공 쪽으로 약간 쏠림
            return {
                x: player.baseX + (this.ball.x - player.baseX) * ballInfluence,
                y: player.baseY + (this.ball.y - player.baseY) * ballInfluence
            };
        }
    }

    // [신규] 상대 수비 라인 Y좌표 구하기
    getDefensiveLineX(opposingTeamId) {
        let relevantPlayers = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        
        // Home defends 0. Away defends 100.
        if (opposingTeamId === 'away') {
            // Away defends 100. Attackers come from 0.
            // Defenders are at X=80.
            // Line closest to attackers is min X of defenders.
            const xs = relevantPlayers.map(p => p.x);
            return Math.min(...xs); 
        } else {
            // Home defends 0. Attackers come from 100.
            // Defenders are at X=20.
            // Line closest to attackers is max X of defenders.
            const xs = relevantPlayers.map(p => p.x);
            return Math.max(...xs);
        }
    }

    // [신규] 오프사이드 체크 (목표 위치 보정)
    applyOffsideCheck(targetPos, player) {
        const opposingTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === opposingTeamId);
        
        // 골라인 기준 2번째로 가까운 선수 찾기 (오프사이드 라인)
        if (player.teamId === 'home') {
            // Home attacks 100. Opponent(Away) defends 100.
            // Sort by X descending (closest to 100).
            opponents.sort((a, b) => b.x - a.x);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineX = opponents[1].x; 
            const ballX = this.ball.x;
            const limitX = Math.max(offsideLineX, ballX); // Can't go beyond (greater than) this
            
            if (targetPos.x > limitX) {
                targetPos.x = limitX - 2; 
            }
        } else {
            // Away attacks 0. Opponent(Home) defends 0.
            // Sort by X ascending (closest to 0).
            opponents.sort((a, b) => a.x - b.x);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineX = opponents[1].x;
            const ballX = this.ball.x;
            const limitX = Math.min(offsideLineX, ballX); // Can't go below this
            if (targetPos.x < limitX) {
                targetPos.x = limitX + 2;
            }
        }
        return targetPos;
    }

    // [신규] 가장 가까운 수비수 찾기 (거리 포함 반환)
    findNearestDefender(attacker) {
        let nearest = null;
        let minDst = 999;
        this.players.forEach(p => {
            if (p.teamId !== attacker.teamId) {
                const d = Math.hypot(p.x - attacker.x, p.y - attacker.y);
                if (d < minDst) { minDst = d; nearest = p; }
            }
        });
        return nearest ? { player: nearest, dist: minDst } : null;
    }

    // [신규] 패스 차단 로직
    checkInterception() {
        // 공 위치 근처에 수비수가 있는지 확인
        this.players.forEach(p => {
            // 주인이 없고(날아가는 중), 공과 매우 가까운 수비수
            // [수정] 슛 시도 중에는 인터셉트 불가 (GK 선방 로직 별도 존재)
            if (!this.ball.owner && this.ball.state === BallState.IN_FLIGHT && !this.pendingShot) {
                // [수정] 패스한 선수와 같은 팀이면 인터셉트 시도 안 함 (정상적인 패스 리시브는 도착 후 처리됨)
                if (this.ball.lastOwner && p.teamId === this.ball.lastOwner.teamId) return;

                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                
                // [수정] 거리 3m 이내, 능력치 기반 확률 체크 (틱마다 실행되므로 확률 조정)
                if (d < 3) {
                    // [체력 반영] 수비력에 체력 반영
                    const effectiveDefense = this.getEffectiveStat(p, 'defense');
                    const interceptChance = 0.05 + (effectiveDefense / 400); 
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
                        // [추가] 인터셉트 시 어시스트 체인 초기화
                        this.ball.lastOwner = null;
                        this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 날카로운 패스 차단!` });
                    }
                }
            }
        });
    }

    // [신규] 역할별 행동 특성 반환 헬퍼
    getRoleBehavior(role) {
        const behaviors = {
            // 공격수
            'AF': { runBehind: true, shootBias: 0.2, dribbleBias: 0.1 }, // 침투, 슛
            'P':  { runBehind: true, shootBias: 0.3, passBias: -0.2 }, // 침투, 탐욕
            'DLF':{ comeShort: true, passBias: 0.1 }, // 연계
            'F9': { comeShort: true, dribbleBias: 0.1, passBias: 0.1 }, // 내려와서 연계
            'TM': { comeShort: true, holdUp: true }, // 등딱
            
            // 윙어
            'W':  { hugLine: true, dribbleBias: 0.2, crossBias: 0.2 }, // 측면 돌파
            'IF': { cutInside: true, shootBias: 0.1, dribbleBias: 0.2 }, // 중앙 침투
            
            // 미드필더
            'BBM': { runBehind: false, pressBias: 0.1, attackBias: 0.3, defenseBias: 0.3 }, // 박스투박스
            'MEZ': { cutInside: true, attackBias: 0.5, defenseBias: 0.1 }, // 메짤라 (공격적)
            'DLP': { comeShort: true, passBias: 0.3, defenseBias: 0.4 }, // 후방 플레이메이커
            'AP':  { comeShort: true, passBias: 0.2, dribbleBias: 0.1, attackBias: 0.4, defenseBias: 0.1 }, // 전진 플레이메이커
            'BWM': { pressBias: 0.3, passBias: -0.1, defenseBias: 0.5 }, // 볼 위닝 (수비적)
            'REG': { passBias: 0.4, defenseBias: 0.3 },
            'CAR': { comeShort: true, defenseBias: 0.4 },
            'EG':  { comeShort: true, attackBias: 0.3 },
            'SS':  { runBehind: true, attackBias: 0.6 },
            'ANC': { defenseBias: 0.6 },
            'DM':  { defenseBias: 0.5 },
            'SV':  { runBehind: true, attackBias: 0.4, defenseBias: 0.3 },
            
            // 수비수
            'BPD': { passBias: 0.1 }, // 빌드업
            'CD':  { passBias: -0.1 }, // 안전 제일
            'WB':  { overlap: true, dribbleBias: 0.1 }, // 윙백 (오버래핑)
            'FB':  { overlap: false }, // 풀백 (수비적)
            'NCB': { passBias: -0.3 } // 걷어내기 위주
        };
        
        return behaviors[role] || {}; // 기본값
    }

    attemptTackle(defender, attacker) {
        // [밸런스] 수비 성공률 5% 보너스
        // [체력 반영] 태클 시 체력 반영된 스탯 사용
        const defStat = this.getEffectiveStat(defender, 'defense');
        const atkStat = this.getEffectiveStat(attacker, 'decision');
        const defRoll = (defStat * 1.05) * Math.random();
        const atkRoll = atkStat * Math.random();

        if (defRoll > atkRoll) {
            // 태클 성공 -> 소유권 전환
            this.ball.owner = defender;
            // [추가] 태클 성공 시 어시스트 체인 초기화
            this.ball.lastOwner = null;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
        }
    }

    adjustDefensiveLines() {
        // [구현] 세부 전술 설정에 따른 실제 수비 라인 좌표 이동
        const dt = gameData.deepTactics || { defensiveLine: 'standard' };
        
        // High: 라인 전진 (+10), Deep: 라인 후퇴 (-10)
        // 홈팀(0->100공격) 기준 수비라인은 20. High면 30으로, Deep이면 10으로.
        let shift = 0;
        if (dt.defensiveLine === 'high') shift = 12;
        else if (dt.defensiveLine === 'deep') shift = -12;

        this.players.forEach(p => {
            if (p.position === 'DF') {
                const teamDir = p.teamId === 'home' ? 1 : -1;
                p.currentBaseX = p.baseX + (shift * teamDir);
            } else {
                p.currentBaseX = p.baseX;
            }
        });
    }

    // [신규] 경기 종료 후 퇴장 애니메이션 시작
    startExitAnimation(winnerId = null) {
        this.winningTeamId = winnerId;
        this.lapAngle = 0; // 세레머니 회전 각도

        // 홈팀 승리 시에만 줄서서 한바퀴 (Phase 1 진입)
        if (winnerId === 'home') {
            this.postMatchPhase = 1; // 집결 단계
            
            const homePlayers = this.players.filter(p => p.teamId === 'home');
            
            homePlayers.forEach((p, i) => {
                // "너무 일자면 어색하니깐" -> 약간의 랜덤성과 간격을 주어 자연스럽게 배치
                p.lapOrder = i * 0.2; // 선수 간 간격 (라디안)
                p.radiusNoise = (Math.random() - 0.5) * 6; // 반지름에 약간의 불규칙성 (±3m)
                
                // 경기장 하단 중앙(90도 방향) 부근으로 집결 목표 설정
                const startAngle = Math.PI / 2 + p.lapOrder; 
                p.exitTargetX = 50 + Math.cos(startAngle) * (35 + p.radiusNoise);
                p.exitTargetY = 50 + Math.sin(startAngle) * (30 + p.radiusNoise);
            });

            // 진 팀(원정팀)은 바로 퇴장
            const awayPlayers = this.players.filter(p => p.teamId !== 'home');
            awayPlayers.forEach(p => {
                p.exitTargetX = 50 + (Math.random() - 0.5) * 40;
                p.exitTargetY = -20; // 위쪽으로 퇴장
            });

        } else {
            // 홈팀 패배(또는 무승부) 시 모두 바로 퇴장
            this.initExitMovement();
        }
    }

    // [신규] 퇴장 이동 경로 설정 (별도 분리)
    initExitMovement() {
        this.postMatchPhase = 3; // 퇴장 단계 (기존 2에서 3으로 변경)
        const exitY = Math.random() < 0.5 ? -20 : 120; // 퇴장 방향
        
        this.players.forEach(p => {
            p.exitTargetX = 50 + (Math.random() - 0.5) * 10;
            p.exitTargetY = exitY;
        });
    }

    // [신규] 퇴장 애니메이션 업데이트
    updatePostMatch() {
        // Phase 1: 홈팀 집결 (진 팀은 퇴장)
        if (this.postMatchPhase === 1) {
            let allAligned = true;
            
            // 홈팀: 시작 지점(하단)으로 이동
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    const dx = p.exitTargetX - p.x;
                    const dy = p.exitTargetY - p.y;
                    const dist = Math.hypot(dx, dy);
                    if (dist > 3) { // 대충 근처에 오면 됨 (너무 칼같이 맞출 필요 없음)
                        p.x += (dx / dist) * 0.8;
                        p.y += (dy / dist) * 0.8;
                        allAligned = false; 
                    }
                } else {
                    // 원정팀: 계속 퇴장
                    p.y -= 0.8;
                }
            });

            if (allAligned) {
                this.postMatchPhase = 2; // 돌기 시작
                this.lapAngle = Math.PI / 2; // 하단(90도)에서 시작
            }
        }
        // Phase 2: 경기장 외곽 크게 돌기 (Lap of Honor)
        else if (this.postMatchPhase === 2) {
            this.lapAngle -= 0.015; // 반시계 방향으로 천천히 회전
            
            // 홈팀: 타원 궤도 이동
            this.players.forEach(p => {
                if (p.teamId === 'home') {
                    // 현재 각도 + 개인 오프셋
                    const currentAngle = this.lapAngle + p.lapOrder;
                    
                    // 경기장 외곽을 도는 타원 궤도 (가로 40, 세로 35 + 개인차)
                    const radiusX = 40 + p.radiusNoise;
                    const radiusY = 35 + p.radiusNoise;
                    
                    const targetX = 50 + Math.cos(currentAngle) * radiusX;
                    const targetY = 50 + Math.sin(currentAngle) * radiusY;
                    
                    // 부드럽게 따라가기
                    p.x += (targetX - p.x) * 0.1;
                    p.y += (targetY - p.y) * 0.1;
                } else {
                    // 원정팀은 계속 퇴장 이동
                    p.y -= 0.8; 
                }
            });

            // 한 바퀴 다 돌면 퇴장 (시작 각도 PI/2, 반시계로 돌아서 -3PI/2까지)
            if (this.lapAngle < -Math.PI * 1.5) { 
                this.initExitMovement(); 
            }
        }
        // Phase 3: 모두 퇴장 이동
        else if (this.postMatchPhase === 3) {
            this.players.forEach(p => {
                const dx = p.exitTargetX - p.x;
                const dy = p.exitTargetY - p.y;
                const dist = Math.hypot(dx, dy);
                
                if (dist > 1) {
                    const speed = 0.7; 
                    p.x += (dx / dist) * speed;
                    p.y += (dy / dist) * speed;
                }
            });
        }
        
        return this.getSnapshot();
    }

    isExitAnimationDone() {
        // 퇴장 단계(3)이고 모든 선수가 화면 밖으로 나갔는지 확인
        if (this.postMatchPhase !== 3) return false;
        return this.players.every(p => p.y < -10 || p.y > 110);
    }
}

// 전역 노출
window.RealSoccerEngine = RealSoccerEngine;
window.DeepTacticManager = DeepTacticManager;

// 초기화
document.addEventListener('DOMContentLoaded', () => {
    const tacticsBtn = document.querySelector('[data-tab="tactics"]');
    if (tacticsBtn) {
        tacticsBtn.addEventListener('click', () => setTimeout(() => DeepTacticManager.init(), 100));
    }
    setTimeout(() => DeepTacticManager.init(), 1000);
});
