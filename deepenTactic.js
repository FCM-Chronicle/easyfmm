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
        this.intendedReceiver = null; // [신규] 패스 수신 예정자
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
        this.ball.lastOwner = null; // [신규] 초기화
        
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
                // [수정] 킥오프 시 하프라인(50)을 넘지 않도록 자기 진영으로 복귀
                p.y = p.baseY;
                // [추가] 킥오프 시 속도 초기화
                p.vx = 0; p.vy = 0;
                
                if (p.teamId === 'home') {
                    // 홈팀(왼쪽, 0~50)은 48을 넘지 않게 (FW도 하프라인 뒤로)
                    // [수정] 미드필더는 센터 서클(약 10m 반경) 밖인 40까지 물러나게 함
                    const maxLine = p.position === 'MF' ? 40 : 48;
                    p.x = Math.min(p.baseX, maxLine);
                } else {
                    // 원정팀(오른쪽, 50~100)은 52보다 작아지지 않게
                    // [수정] 미드필더는 센터 서클 밖인 60까지 물러나게 함
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
        this.eventsQueue = []; // 이벤트 초기화

        // [신규] 매 분마다 체력 소모 로직 실행
        if (isNewMinute) {
            this.consumeStamina();
        }

        // [신규] 득점 후 세레머니/리플레이 딜레이 처리 (공이 골망에 머무름)
        if (this.celebrationTimer > 0) {
            this.processCelebrationMovement(); // [신규] 세레머니 움직임 처리
            this.celebrationTimer--;
            if (this.celebrationTimer <= 0) {
                // 타이머 종료 후 킥오프 위치로 리셋
                const nextKickoff = this.lastScorerTeam === 'home' ? 'away' : 'home';
                this.resetPositions(nextKickoff);
            }
            // 세레머니 중에는 상태 유지 (공/선수 멈춤)
            return this.getSnapshot();
        }

        // 1. 공 상태 처리
        if (this.ball.state === BallState.IN_FLIGHT) {
            // [수정] 공 이동 속도 시뮬레이션 (즉시 도착 방지)
            const ballSpeed = 4.2; // [수정] 패스 속도 하향 (7 -> 4.2)
            const dx = this.ball.targetPos.x - this.ball.x;
            const dy = this.ball.targetPos.y - this.ball.y;
            const dist = Math.hypot(dx, dy);

            if (dist <= ballSpeed) {
                // [도착] 목표 지점 도달
                this.ball.x = this.ball.targetPos.x;
                this.ball.y = this.ball.targetPos.y;
                this.ball.state = BallState.LOOSE; // 도착 후 루즈볼 상태

                // 슛 결과 처리
                if (this.pendingShot) {
                    this.handleShotResult();
                    return this.getSnapshot();
                }
            } else {
                // [이동 중] 목표 방향으로 이동
                const ratio = ballSpeed / dist;
                this.ball.x += dx * ratio;
                this.ball.y += dy * ratio;

                // 이동 중 인터셉트 체크
                this.checkInterception();
            }
        }

        // 2. 공 소유권 판정 (LOOSE 상태일 때)
        if (this.ball.state === BallState.LOOSE) {
            // 가장 가까운 선수 찾기
            let nearest = null;
            let minDst = 999;
            
            this.players.forEach(p => {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < minDst) { minDst = d; nearest = p; }
            });

            // [수정] 소유 획득 거리 축소 (10 -> 2.5): 선수가 공에 "닿아야" 소유 인정
            if (nearest && minDst < 2.5) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = nearest;
                this.ball.intendedReceiver = null; // 소유 시 수신 상태 해제
                this.ball.x = nearest.x; // 공을 발밑으로
                this.ball.y = nearest.y;
            }
        }

        // 3. 선수 AI 행동 (소유자 vs 비소유자)
        if (this.ball.state === BallState.CONTROLLED && this.ball.owner) {
            this.processBallCarrierAI(this.ball.owner);
        }
        // [수정] 공 소유 여부와 상관없이 나머지 선수들의 오프더볼 움직임은 항상 실행
        this.processOffBallAI();

        // 4. 수비 라인 조정
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
        const behavior = this.getRoleBehavior(player.role);
        
        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isOnFlank = player.y < 25 || player.y > 75;

        const nearestOpp = this.findNearestDefender(player);
        const pressureDist = nearestOpp ? nearestOpp.dist : 999;
        const underPressure = pressureDist < 8; // 8m 이내에 적이 있으면 압박받음
        const moveDir = isHome ? 1 : -1;

        // [신규] 상대 수비와의 속도 경쟁력 계산 (치달/돌파 판단용)
        const effectiveSpeed = this.getEffectiveStat(player, 'speed');
        const speedFactor = effectiveSpeed / 75;
        const oppSpeed = nearestOpp ? this.getEffectiveStat(nearestOpp.player, 'speed') : 0;
        const canOutrun = effectiveSpeed > oppSpeed + 5; 

        // [신규] 측면 자원의 돌파 의지 강화
        const isWingerOnFlank = behavior.hugLine && isOnFlank;

        // [신규] 슈팅 각도 봉쇄 여부 계산 (진짜 경기 같은 판단력)
        let isAngleBlocked = false;
        if (distToGoal < 35) {
            isAngleBlocked = this.players.some(opp => {
                if (opp.teamId === player.teamId) return false;
                const d = Math.hypot(opp.x - player.x, opp.y - player.y);
                if (d > 10) return false; // 10m 이상 떨어진 수비수는 각도를 못 막음

                // 내 위치에서 골대 중앙(goalX, 50)으로 가는 벡터와 수비수로 가는 벡터 사이의 각도 계산
                const dot = (goalX - player.x) * (opp.x - player.x) + (50 - player.y) * (opp.y - player.y);
                const mag1 = Math.hypot(goalX - player.x, 50 - player.y);
                const mag2 = Math.hypot(opp.x - player.x, opp.y - player.y);
                const angle = Math.acos(Math.max(-1, Math.min(1, dot / (mag1 * mag2))));
                
                return angle < 0.28; // 약 16도 이내에 수비수가 있으면 '각이 막혔다'고 판단
            });
        }

        let shootThreshold = 30;
        if (isAI) shootThreshold = 32;

        if (isAngleBlocked && distToGoal > 12 && Math.random() < 0.8) {
            shootThreshold = 0; // 이 틱에서는 슛을 안 함
        }

        if (distToGoal < shootThreshold) { 
            let shootChance = 0.15; 
            if (distToGoal < 20) shootChance = 0.7;
            if (distToGoal < 12) shootChance = 0.95;
            if (isAI) shootChance += 0.05;
            if (Math.random() < shootChance) {
                this.attemptShoot(player, goalX);
                return;
            }
        }

        let passProb = 0.5;
        const runner = this.players.find(p => p.teamId === player.teamId && p.burstTimer > 10);
        if (runner && distToGoal > 30) {
            passProb = (canOutrun && (behavior.dribbleBias || 0) > 0) ? 0.35 : 0.9;
        }

        const isBlocked = this.checkFrontalBlock(player, goalX);
        if (isBlocked) {
            passProb = isWingerOnFlank ? 0.05 : (underPressure ? 0.75 : 0.05);
        } else {
            if (player.position === 'DF' || player.position === 'GK') {
                passProb = underPressure ? 0.98 : 0.4; 
            } else {
                passProb = (isWingerOnFlank && distToGoal > 25) ? 0.001 : 0.15;
                if (isAngleBlocked) passProb = 0.85; 
                if (behavior.hugLine && isOnFlank && distToGoal < 25) {
                    const targetInBox = this.players.find(p => p.teamId === player.teamId && p.position === 'FW' && Math.abs(p.y - 50) < 18);
                    if (targetInBox && Math.random() < 0.7) {
                        this.executePass(player, targetInBox);
                        return;
                    }
                }
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') passProb = 0.25;
            }
        }

        let bestPassTarget = null;
        if (player.position === 'GK') {
            if (Math.random() < 0.5) { // GK도 가급적 멀리 보내도록 조정
                bestPassTarget = this.findBestPassTarget(player, 'safe');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            } else {
                bestPassTarget = this.findBestPassTarget(player, 'aggressive');
                if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
            }
            
            if (!bestPassTarget || Math.random() >= passProb) {
                this.clearBall(player);
                return;
            }
        } else {
            bestPassTarget = this.findBestPassTarget(player, 'aggressive');
            if (!bestPassTarget) bestPassTarget = this.findBestPassTarget(player, 'safe');
        }

        if (bestPassTarget && Math.random() < passProb) { 
            this.executePass(player, bestPassTarget);
            return;
        }

        // [수비 너프] 자동 태클 시도 확률 하향 (0.10 -> 0.05)
        if (nearestOpp && nearestOpp.dist < 7 && Math.random() < 0.05) {
            if (this.attemptTackle(nearestOpp.player, player)) return;
        }

        // [수정] 드리블러 이동 로직: 직선적인 '치달' 돌파와 지능적 회피 시스템
        let moveSpeed = 0.32 * Math.max(0.7, Math.min(1.4, speedFactor)); 
        let targetX = player.x + (moveDir * 22); 
        let targetY = player.y; 

        if (behavior.hugLine && isOnFlank) {
            targetY = player.y < 50 ? 4 : 96;
            moveSpeed = 0.58; 
        } else if (isBlocked) {
            if (canOutrun && Math.random() < 0.65) {
                targetX = player.x + (moveDir * 28);
                moveSpeed *= 1.4;
            } else {
                let evadeOffset = 7;
                if (nearestOpp) {
                    targetY = player.y < nearestOpp.player.y ? player.y - evadeOffset : player.y + evadeOffset;
                } else {
                    targetY = player.y + (Math.random() < 0.5 ? evadeOffset : -evadeOffset);
                }
                targetX = player.x + (moveDir * 15);
                moveSpeed *= 1.5;
            }
        }

        targetY = Math.max(2, Math.min(98, targetY));
        const accelX = (targetX - player.x) * moveSpeed * 0.1;
        const accelY = (targetY - player.y) * moveSpeed * 0.1;
        player.vx = (player.vx + accelX) * 0.7;
        player.vy = (player.vy + accelY) * 0.7;
        player.x += player.vx;
        player.y += player.vy;

        this.ball.lastOwner = null;
        player.x = Math.max(5, Math.min(95, player.x));
        player.y = Math.max(2, Math.min(98, player.y));
        this.ball.x = player.x;
        this.ball.y = player.y;
        if (Math.random() < 0.2) this.eventsQueue.push({ type: 'dribble', player: player.name });
    }

    // 🟡 [공간 계산] 패스 대상 선정 알고리즘
    findBestPassTarget(player, mode = 'aggressive') { 
        const teamates = this.players.filter(p => p.teamId === player.teamId && p !== player);
        let bestTarget = null;
        let maxScore = mode === 'aggressive' ? 0 : -50;

        let isAI = false;
        if (typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAI = (player.teamId !== userSide);
        }

        const isHome = player.teamId === 'home';
        const forwardX = isHome ? 100 : 0;

        const nearbyOppsCount = this.players.filter(p => 
            p.teamId !== player.teamId && 
            Math.hypot(p.x - player.x, p.y - player.y) < 15
        ).length;

        teamates.forEach(tm => {
            const distBefore = Math.abs(player.x - forwardX);
            const distAfter = Math.abs(tm.x - forwardX);
            let forwardScore = (distBefore - distAfter); 

            if (tm.burstTimer > 0) {
                forwardScore += 150;
            }

            const isPenetrating = tm.position === 'FW' && (isHome ? tm.vx > 0.1 : tm.vx < -0.1);
            if (isPenetrating) forwardScore += 35;

            let switchBonus = 0;
            if (nearbyOppsCount >= 1 && Math.abs(player.y - tm.y) > 35) {
                switchBonus = 40;
            }
            
            if (mode === 'safe') {
                forwardScore *= 0.5;
            } else {
                forwardScore *= 8.0;
                if (distAfter > distBefore) forwardScore -= 40; 
                if (isAI && forwardScore > 0) {
                    forwardScore *= 1.5;
                }
            }

            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 10) distScore = -50;
            else if (dist > 25) distScore = -(dist - 25) * 2.0;
            else distScore = 40;

            if (dist > 20 && distAfter > distBefore) {
                distScore -= 200;
            }

            if (player.position === 'DF' && tm.position === 'FW' && dist > 35) {
                distScore -= 40;
            }

            if (player.position === 'FW' && distAfter > distBefore) {
                if (tm.position === 'GK') {
                    distScore -= 500;
                } else if (tm.position === 'DF' && dist > 15) {
                    distScore -= 150;
                }
            }

            let pressureScore = 0;
            this.players.forEach(opp => {
                if (opp.teamId !== player.teamId) {
                    const d = Math.hypot(tm.x - opp.x, tm.y - opp.y);
                    if (d < 15) pressureScore -= (15 - d) * 3;
                }
            });
            
            if (mode === 'safe') pressureScore *= 2.0;

            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) {
                loopPenalty = mode === 'aggressive' ? 60 : 20;
            }

            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5;
                else if (tm.position === 'DF') positionBonus = 3;
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus + switchBonus;
            
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
        this.ball.intendedReceiver = to; // [신규] 수신 예정자 등록
        this.ball.owner = null;
        
        // [신규] 패스 성공률 계산 로직
        const dist = Math.hypot(from.x - to.x, from.y - to.y);
        let accuracy = from.stats.passing;

        // [신규] 스루패스 정확도 보정: 침투 중인 선수에게는 더 정확하게 줌 (연계 플레이 보상)
        if (to.burstTimer > 0) {
            accuracy += 30; // [수정] 보너스 강화 (15 -> 30)
        }

        // [신규] 스루패스 여부 판단 (전방으로 길게 찌르는 패스)
        const forwardX = from.teamId === 'home' ? 100 : 0;
        const distToGoalFrom = Math.abs(from.x - forwardX);
        const distToGoalTo = Math.abs(to.x - forwardX);

        // ─────────────────────────────────────────────────────────────────
        // [수정] 스루패스 최대 거리 제한: 실제 경기 기준 약 30~35유닛 이내
        // dist > 35인 장거리 스루패스는 패스 자체를 '안전 패스'로 강제 전환하거나 차단
        // 피치 전체 길이가 100유닛 ≈ 105m 기준이므로 35유닛 ≈ 37m (현실적인 스루패스 한계)
        // ─────────────────────────────────────────────────────────────────
        const MAX_THROUGH_PASS_DIST = 35;
        const isThroughPass = (distToGoalFrom - distToGoalTo > 5) && dist > 10 && distToGoalFrom < 60 && dist <= MAX_THROUGH_PASS_DIST;
        
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
            // [수정] 스루패스 난이도 페널티 제거 (-20 -> 0)
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

            this.ball.intendedReceiver = null;
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
            this.ball.intendedReceiver = null;
            // [수정] 슈팅 실패 시 다양한 상황 연출 (수비 블록, 펀칭, 캐칭)
            const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
            const isHomeAttacking = shooter.teamId === 'home';

            // ─────────────────────────────────────────────────────────────────
            // [수정] GK 선방 로직: 슈팅 방향(Y)을 미리 읽고 측면으로 이동해서 잡기
            // 실제 골키퍼처럼 공이 날아오는 Y좌표 방향으로 슬라이드 이동 후 캐칭
            // ─────────────────────────────────────────────────────────────────
            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');

            // [수정] 수비 블록 확률 대폭 하향 (0.35 -> 0.1): 웬만하면 키퍼가 막도록 유도
            const defenders = this.players.filter(p => 
                p.teamId === opponentTeamId && p.position !== 'GK' &&
                Math.abs(p.x - shooter.x) < 15 && Math.abs(p.y - shooter.y) < 5
            );
            
            const blockingDefenders = defenders.filter(p => isHomeAttacking ? (p.x > shooter.x) : (p.x < shooter.x));

            if (blockingDefenders.length > 0 && Math.random() < 0.1) { 
                const blocker = blockingDefenders[0];
                this.eventsQueue.push({ type: 'block', shooter: shooter.name, blocker: blocker.name, desc: `🛡️ ${blocker.name}, 몸을 날려 슈팅을 막아냅니다!` });
                
                this.ball.state = BallState.LOOSE;
                this.ball.owner = null;
                this.ball.x = blocker.x + (isHomeAttacking ? -5 : 5); // 튕겨 나옴
                this.ball.y = blocker.y + (Math.random() - 0.5) * 15;
                return;
            }

            if (enemyGk) {
                // ─────────────────────────────────────────────────────────────
                // [신규] GK 측면 이동: 공의 targetPos.y 방향으로 스텝 이동 후 캐칭
                // 공이 날아온 Y를 목표로 GK가 슬라이드 이동 (최대 ±15유닛)
                // ─────────────────────────────────────────────────────────────
                const shotTargetY = this.ball.targetPos.y;
                const gkBaseX   = enemyGk.teamId === 'home' ? 5 : 95;

                // GK를 공의 Y좌표 쪽으로 즉시 이동 (한 틱 안에 처리)
                // 실제 애니메이션은 이 좌표 변경으로 렌더러에서 자연스럽게 표현됨
                const maxGkSlide = 15; // GK가 중앙에서 최대 움직일 수 있는 범위 (유닛)
                const newGkY = Math.max(50 - maxGkSlide, Math.min(50 + maxGkSlide, shotTargetY));
                enemyGk.x = gkBaseX;   // X는 골라인 고정
                enemyGk.y = newGkY;    // Y는 슈팅 방향으로 이동
                // 공도 GK 발밑으로 당김 (시각적 일치)
                this.ball.x = enemyGk.x;
                this.ball.y = enemyGk.y;

                // 85% 확률로 캐칭, 15%만 쳐냄 (골포스트 맞는 듯한 루즈볼 상황 감소)
                if (Math.random() < 0.15) { 
                    this.eventsQueue.push({ type: 'save', shooter: shooter.name, gk: enemyGk.name, desc: `🧤 ${enemyGk.name}, 슈팅을 펀칭으로 쳐냅니다!` });
                    this.ball.state = BallState.LOOSE;
                    this.ball.owner = null;
                    this.ball.x = enemyGk.x + (isHomeAttacking ? -10 : 10);
                    this.ball.y = enemyGk.y + (Math.random() - 0.5) * 30;
                } else { 
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
        let attackingTeam = null;
        if (this.ball.owner) attackingTeam = this.ball.owner.teamId;
        else if (this.ball.state === BallState.IN_FLIGHT && this.ball.lastOwner) attackingTeam = this.ball.lastOwner.teamId;
        
        let isAttackingAI = false;
        if (attackingTeam && typeof gameData !== 'undefined') {
            const userSide = gameData.isHomeGame ? 'home' : 'away';
            isAttackingAI = (attackingTeam !== userSide);
        }
        const isLooseBall = !this.ball.owner && this.ball.state === BallState.LOOSE;
        
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
            const behavior = this.getRoleBehavior(p.role);
            let targetX = p.x;
            let targetY = p.y;
            
            const effectiveSpeed = this.getEffectiveStat(p, 'speed');
            const speedFactor = effectiveSpeed / 75;
            let moveSpeed = 0.22 * Math.max(0.7, Math.min(1.4, speedFactor));

            if (isLooseBall) {
                const isNearest = (p === nearestHome || p === nearestAway);
                if (isNearest) {
                    targetX = this.ball.x;
                    targetY = this.ball.y;
                    moveSpeed = 0.55;
                } else {
                    const ballInfluence = 0.15;
                    targetX = p.baseX + (this.ball.x - p.baseX) * ballInfluence;
                    targetY = p.baseY + (this.ball.y - p.baseY) * ballInfluence;
                    moveSpeed = 0.15;
                }
            } 
            else if (p.teamId === attackingTeam) {
                const isHome = p.teamId === 'home';
                const forwardDir = isHome ? 1 : -1;
                
                if (this.ball.state === BallState.IN_FLIGHT && p === this.ball.intendedReceiver) {
                    targetX = this.ball.targetPos.x;
                    targetY = this.ball.targetPos.y;
                    moveSpeed = 0.7;
                } else {
                const isLastPasser = (p === this.ball.lastOwner);
                const isRearDefender = p.position === 'GK' || (p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role));

                if (isLastPasser && !isRearDefender) {
                    targetX = p.x + (forwardDir * 15);
                    targetY = p.y + (this.ball.y - p.y) * 0.3;
                    moveSpeed = 0.4;
                } 
                else if (p.position === 'FW') {
                    if (!p.burstTimer) p.burstTimer = 0;
                    const oppDefLineX = this.getDefensiveLineX(p.teamId === 'home' ? 'away' : 'home');
                    
                    if (p.burstTimer > 0) {
                        targetX = oppDefLineX + (forwardDir * 15);
                        moveSpeed = 0.35;
                        p.burstTimer--;
                    } else {
                        let ballPushX = this.ball.x + (forwardDir * 25);
                        targetX = isHome ? Math.min(oppDefLineX - 1.5, ballPushX) : Math.max(oppDefLineX + 1.5, ballPushX);
                        targetX = isHome ? Math.max(targetX, 65) : Math.min(targetX, 35); 

                        const ballCarrier = this.ball.owner;
                        let burstChance = (ballCarrier && ballCarrier.teamId === p.teamId && ballCarrier.position !== 'FW') ? 0.08 : 0.03;
                        if (behavior.runBehind && Math.random() < burstChance) p.burstTimer = 45;
                    }
                    const nearOpp = this.findNearestDefender(p);
                    let avoidY = 0;
                    if (nearOpp && nearOpp.dist < 4) avoidY = (p.y > nearOpp.player.y) ? 4 : -4;
                    targetY = p.baseY + avoidY;
                    if (p.burstTimer > 0) targetX = oppDefLineX + (forwardDir * 15);
                    if (behavior.hugLine) { targetY = p.baseY < 50 ? 5 : 95; targetX += (forwardDir * 8); }
                    if (p.burstTimer === 0 && !behavior.runBehind && !behavior.hugLine && nearOpp) {
                        const safeGap = isHome ? -8 : 8;
                        targetX = nearOpp.player.x + safeGap; 
                    }
                    moveSpeed = 0.25 * speedFactor;
                } else if (p.position === 'MF') {
                    const attackBias = behavior.attackBias || 0;
                    const defenseBias = behavior.defenseBias || 0;
                    let ballWeight = 0.6 + (attackBias * 0.4) - (defenseBias * 0.3);
                    ballWeight = Math.max(0.2, Math.min(0.95, ballWeight));
                    targetX = (p.baseX * (1 - ballWeight)) + (this.ball.x * ballWeight);
                    targetY = (p.baseY * (1 - ballWeight)) + (this.ball.y * ballWeight);
                    if (attackBias > 0.3) targetX += (forwardDir * attackBias * 12);
                    if (Math.abs(p.y - this.ball.y) < 3) targetY += (p.y > 50 ? 4 : -4);
                } else if (p.position === 'DF') {
                    const lineTactic = gameData.deepTactics?.defensiveLine || 'standard';
                    let safetyDist = 22;
                    if (lineTactic === 'high') safetyDist = 14;
                    else if (lineTactic === 'deep') safetyDist = 32;
                    if (isHome) targetX = Math.min(75, Math.max(p.baseX, this.ball.x - safetyDist));
                    else targetX = Math.max(25, Math.min(p.baseX, this.ball.x + safetyDist));
                    if (Math.abs(this.ball.x - (isHome ? 0 : 100)) < 45) targetY = p.baseY < 50 ? 12 : 88;
                    else targetY = p.baseY; 
                } else if (p.position === 'GK') {
                    // [수정] 공격 상황에서도 키퍼는 제자리를 지키며 측면 이동 억제
                    targetX = p.baseX; 
                    targetY = 50 + (this.ball.y - 50) * 0.05;
                }
                if (behavior.cutInside) targetY = 50 + (p.baseY - 50) * 0.5;
                else if (behavior.hugLine) targetY = p.baseY < 50 ? 5 : 95;
                }
            } else {
                // ─────────────────────────────────────────────────────────────────
                // [수정] 수비 전환 시 공격수 오프사이드 방지 복귀 로직
                // 공이 상대팀(수비 입장에서는 공격팀)에게 넘어간 경우,
                // FW 포지션 선수들이 상대 수비 라인 뒤(오프사이드 라인 안쪽)로 빠르게 복귀
                // ─────────────────────────────────────────────────────────────────
                const isHomeDef = p.teamId === 'home';

                if (p.position === 'FW') {
                    // 상대 수비 라인 X 좌표 기준으로 오프사이드 라인 계산
                    // home팀 공격수 입장: 상대(away)의 수비 라인에서 약간 뒤쪽
                    // away팀 공격수 입장: 상대(home)의 수비 라인에서 약간 뒤쪽
                    const opposingTeamId = p.teamId === 'home' ? 'away' : 'home';
                    const opponents = this.players.filter(q => q.teamId === opposingTeamId && q.position !== 'GK');

                    if (opponents.length > 0) {
                        // home 공격수 → away 수비 중 X가 가장 작은(골라인 쪽) 두 번째 선수
                        // away 공격수 → home 수비 중 X가 가장 큰(골라인 쪽) 두 번째 선수
                        let offsideLineX;
                        if (isHomeDef) {
                            // home이 수비 중 → away FW가 home 수비 라인 안으로 들어와야 함
                            // home 수비 라인 = home 선수 중 가장 전진한(X 큰) 위치
                            const homeField = this.players.filter(q => q.teamId === 'home' && q.position !== 'GK');
                            const sortedX = homeField.map(q => q.x).sort((a, b) => b - a);
                            offsideLineX = sortedX.length >= 2 ? sortedX[1] : (sortedX[0] ?? 20);
                            // away FW는 이 라인보다 오른쪽(숫자 큼)에 있으면 오프사이드 위험
                            // → offsideLineX + 2 이하로 유지
                            targetX = Math.min(p.x, offsideLineX + 2);
                            // 빠른 복귀를 위해 moveSpeed 증가
                            moveSpeed = 0.45 * speedFactor;
                        } else {
                            // away가 수비 중 → home FW가 away 수비 라인 안으로 들어와야 함
                            const awayField = this.players.filter(q => q.teamId === 'away' && q.position !== 'GK');
                            const sortedX = awayField.map(q => q.x).sort((a, b) => a - b);
                            offsideLineX = sortedX.length >= 2 ? sortedX[1] : (sortedX[0] ?? 80);
                            // home FW는 이 라인보다 왼쪽(숫자 작음)에 있으면 오프사이드 위험
                            // → offsideLineX - 2 이상으로 유지
                            targetX = Math.max(p.x, offsideLineX - 2);
                            moveSpeed = 0.45 * speedFactor;
                        }
                        // Y축은 자기 base 포지션 기준으로 유지
                        targetY = p.baseY;
                    } else {
                        // 상대 필드 플레이어가 없으면 자기 baseX로 복귀
                        targetX = p.baseX;
                        targetY = p.baseY;
                        moveSpeed = 0.35;
                    }
                } else {
                // ─────────────────────────────────────────────────────────────────
                // 기존 수비 로직 (FW 제외)
                // ─────────────────────────────────────────────────────────────────
                let shiftFactor = 0.7;
                let yShiftFactor = 0.2;
                if (p.position === 'MF') {
                    shiftFactor = Math.max(0.6, Math.min(1.1, 0.95 + (behavior.defenseBias || 0) * 0.1 - (behavior.attackBias || 0) * 0.2));
                    moveSpeed = 0.22 * (1 + (behavior.defenseBias || 0));
                } else if (p.position === 'DF') { shiftFactor = 0.75; yShiftFactor = 0.05; }

                const isGKPossession = this.ball.owner && this.ball.owner.position === 'GK';
                const refBallX = (this.pendingShot || isGKPossession) ? 50 : Math.max(30, Math.min(70, this.ball.x));
                const isSpecialCase = (this.pendingShot || isGKPossession);
                let formationX = p.baseX + (refBallX - 50) * shiftFactor;
                let formationY = p.baseY + ((this.pendingShot ? 50 : this.ball.y) - 50) * yShiftFactor; 
                let markTarget = null;
                if (!isSpecialCase) {
                    let minM = 30;
                    this.players.forEach(opp => {
                        if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                            const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                            if (Math.abs(p.baseY - opp.y) <= 18 && d < minM) { minM = d; markTarget = opp; }
                        }
                    });
                }
                if (markTarget && p.position !== 'GK') {
                    const gX = p.teamId === 'home' ? 0 : 100;
                    targetX = markTarget.x + (gX - markTarget.x) * 0.1; targetY = markTarget.y; moveSpeed = 0.06;
                    if (p.position === 'DF') {
                        const isPen = p.teamId === 'home' ? (targetX < formationX) : (targetX > formationX);
                        targetX = isPen ? (targetX * 0.9 + formationX * 0.1) : (targetX * 0.2 + formationX * 0.8);
                    }
                } else { targetX = formationX; targetY = formationY; }

                if (p.position === 'GK') {
                    const gX = p.teamId === 'home' ? 5 : 95;
                    // [수정] 키퍼 위치 고정: 골대 라인(5 or 95)에서 거의 움직이지 않음
                    targetX = gX; 
                    targetY = 50 + (this.ball.y - 50) * 0.05; // [수정] 키퍼 정중앙 유지 강화 (0.15 -> 0.05)
                }
                if (this.ball.owner && p.position !== 'GK' && !isSpecialCase) {
                    const dB = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    const shouldStep = (p === presser) || ((isHomeDef ? this.ball.x < 35 : this.ball.x > 65) && dB < 15 && p.position === 'DF');
                    if (shouldStep) {
                        const iX = (this.ball.x * 0.9) + (isHomeDef ? 0 : 100) * 0.1;
                        const dx = iX - p.x; const dy = (this.ball.y * 0.9 + 50 * 0.1) - p.y;
                        const d = Math.hypot(dx, dy); const sS = 2.3 * speedFactor; // [수비 너프] 압박 속도 하향
                        if (d > 0) { p.x += (dx / d) * sS; p.y += (dy / d) * sS; }
                        let tC = dB < 2 ? 0.2 : 0.05; // [수비 너프] 압박 시 태클 성공률 하향
                        if (dB < 5 && Math.random() < tC) this.attemptTackle(p, this.ball.owner);
                        return;
                    }
                }
                const isBeaten = p.position === 'DF' && !isSpecialCase && (isHomeDef ? (this.ball.x < p.x - 2) : (this.ball.x > p.x + 2));
                if (isBeaten && !isSpecialCase) {
                    const rX = this.ball.x + (isHomeDef ? -15 : 15); const dx = rX - p.x; const dy = this.ball.y - p.y;
                    const d = Math.hypot(dx, dy); const rS = 2.2 * speedFactor; // [수비 너프] 복귀 속도 하향
                    if (d > 0) { p.x += (dx / d) * rS; p.y += (dy / d) * rS; }
                    return;
                }
                } // end else (FW 제외 수비 로직)
            }

            const teammates = this.players.filter(tm => tm.teamId === p.teamId && tm !== p);
            for (const tm of teammates) {
                const d = Math.hypot(targetX - tm.x, targetY - tm.y);
                let sD = (p.position === 'DF' && tm.position === 'DF') ? 9 : 5;
                if (d < sD) {
                    const a = Math.atan2(targetY - tm.y, targetX - tm.x);
                    targetX += Math.cos(a) * (sD - d) * 0.5; targetY += Math.sin(a) * (sD - d) * 0.5;
                }
            }
            targetY = Math.max(2, Math.min(98, targetY)); targetX = Math.max(2, Math.min(98, targetX));
            const aX = (targetX - p.x) * moveSpeed * 0.1; const aY = (targetY - p.y) * moveSpeed * 0.1;
            p.vx = (p.vx + aX) * 0.7; p.vy = (p.vy + aY) * 0.7;
            p.x += p.vx; p.y += p.vy;
        });
    }

    // [신규] 전방 수비벽 감지 (드리블 vs 패스 판단용)
    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1; // 홈(100방향), 어웨이(0방향)
        const checkDist = 8; // [수정] 감지 거리 축소 (10 -> 8): 웬만한 수비는 뚫고 전진 시도
        const checkWidth = 4; // [수정] 감지 폭 축소 (6 -> 4): 더 좁은 틈도 길로 인식

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
                    // [대폭 너프] 인터셉트 확률 추가 하향 (1000 -> 2500)
                    const interceptChance = 0.01 + (effectiveDefense / 2500); 
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
                        this.ball.intendedReceiver = null; // 차단 시 수신 상태 해제
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
        // [체력 반영] 태클 시 체력 반영된 스탯 사용
        const defStat = this.getEffectiveStat(defender, 'defense');
        const atkStat = this.getEffectiveStat(attacker, 'decision');

        // [신규] 돌파 중인 공격수의 속도 가중치 반영 (치달 중인 선수는 태클하기 힘듦)
        const atkSpeed = this.getEffectiveStat(attacker, 'speed');
        const speedBonus = (atkSpeed / 100) * 30; // [버프] 속도 보너스 강화 (20 -> 30)

        const defRoll = defStat * Math.random();
        const atkRoll = (atkStat + speedBonus) * Math.random();

        if (attacker && defRoll > atkRoll) {
            // 태클 성공 -> 소유권 전환
            this.ball.owner = defender;
            // [추가] 태클 성공 시 어시스트 체인 초기화
            this.ball.lastOwner = null;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
            return true; // 성공 반환
        }
        return false; // 실패 반환
    }

    adjustDefensiveLines() {
        // processOffBallAI에서 이미 공 위치 기반 라인 조정을 수행함.
        // 추가적인 전술적 라인 조정(Deep/High)은 여기서 가능
        const lineShift = gameData.deepTactics.defensiveLine === 'high' ? -10 : (gameData.deepTactics.defensiveLine === 'deep' ? 10 : 0);
        // (구현 생략 - 위 로직에 포함됨)
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
