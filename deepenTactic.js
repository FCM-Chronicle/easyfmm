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
    
    // 미드필더
    BBM: RUN_TYPE.STRIKER_RUN, MEZ: RUN_TYPE.UNDERLAP_RUN, DLP: RUN_TYPE.HOLD_POSITION,
    BWM: RUN_TYPE.HOLD_POSITION, AP: RUN_TYPE.SUPPORT_RUN, REG: RUN_TYPE.HOLD_POSITION,
    CAR: RUN_TYPE.SUPPORT_RUN, EG: RUN_TYPE.HOLD_POSITION, SS: RUN_TYPE.STRIKER_RUN,
    
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
    constructor(data, teamId, role) {
        this.id = data.name; // 고유 식별자
        this.name = data.name;
        this.position = data.position; // GK, DF, MF, FW
        this.rating = data.rating;
        this.teamId = teamId; // 'home' or 'away'
        this.role = role; // 전술 역할
        
        // 시뮬레이션 상태
        this.x = 0;
        this.y = 0;
        this.baseX = 0; // 포메이션 기준 위치 (X)
        this.baseY = 0; // 포메이션 기준 위치 (Y)
        this.stamina = 100;
        
        // 능력치 매핑 (0~100)
        this.stats = {
            speed: data.rating, // 간소화: 오버롤 기반
            passing: data.rating,
            shooting: data.rating,
            defense: data.rating,
            decision: data.rating // 지능
        };
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

        // 선수 초기화
        this.initTeam(homeSquad, 'home', homeTactic);
        this.initTeam(awaySquad, 'away', awayTactic);
        
        // 킥오프 세팅
        this.resetPositions('home');
    }

    initTeam(squad, teamId, tactic) {
        // [수정] 가로 모드 포메이션 좌표 설정 (Left <-> Right)
        // Home(Red): 왼쪽(0) 진영 -> 오른쪽(100)으로 공격
        // Away(Blue): 오른쪽(100) 진영 -> 왼쪽(0)으로 공격
        
        const setupLine = (list, baseX) => {
            const height = 100; // Y축 높이
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

                const simP = new SimPlayer(p, teamId, role);
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
    update() {
        this.eventsQueue = []; // 이벤트 초기화

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
            const ballSpeed = 7; // [수정] 패스 속도 상향 (3 -> 7)
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
        if (isAI) shootThreshold = 35; // [AI 버프] AI는 35m부터 슈팅 각을 봄 (더 과감함)

        if (distToGoal < shootThreshold) { 
            // 거리가 가까울수록 슈팅 확률 대폭 상승
            let shootChance = 0.15; 
            if (distToGoal < 20) shootChance = 0.7; // [수정] 20m: 60% -> 70%
            if (distToGoal < 12) shootChance = 0.95; // [수정] 12m: 90% -> 95%

            // [AI 버프] AI는 슈팅 확률 추가 보정 (+10%)
            if (isAI) shootChance += 0.1;

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
                // 막혀있고 압박까지 받으면 패스 우선 (95%)
                passProb = 0.95;
            } else {
                // 막혀있지만 압박은 없음 -> 횡드리블이나 소유 (패스 확률 낮춤 30%)
                passProb = 0.30; 
            }
        } else {
            // 뚫려있으면 드리블 우선 (패스 확률 20%로 낮춤 -> 드리블 80%)
            // [수정] 단, 수비수와 골키퍼는 무리한 드리블 자제 (안전 지향)
            if (player.position === 'DF' || player.position === 'GK') {
                // 압박이 없으면 수비수도 조금 몰고 올라감 (빌드업)
                passProb = underPressure ? 0.98 : 0.4; 
            } else {
                // [수정] 미드필더/공격수는 전방이 열려있으면 드리블을 더 길게 가져가도록 패스 확률 대폭 하향
                // 기존 0.2 (20%) -> 0.05 (5%). 약 20틱(실제 시간 2초 내외) 정도 드리블할 확률이 높음.
                passProb = 0.05;

                // [전술 반영] 티키타카일 경우 패스 빈도 상향 (원터치 패스 유지)
                if (typeof gameData !== 'undefined' && gameData.currentTactic === 'tikitaka') {
                    passProb = 0.25;
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
        if (nearestDef && nearestDef.dist < 5) {
            // 수비수가 5m 이내로 붙음 -> 돌파 시도
            if (Math.random() < 0.4) { // 40% 확률로 태클 당함
                this.attemptTackle(nearestDef.player, player);
                return;
            }
        }

        const moveDir = isHome ? 1 : -1;
        // [수정] 틱 레이트 상향(2.3배)에 맞춰 이동 거리 하향 조정
        let moveSpeed = 1.0; 
        
        // [수정] 수비수는 드리블 거리 짧게 (안전 제일)
        let moveDist = 2.0 + Math.random() * 2.0; // 5 -> 2
        if (player.position === 'DF') moveDist = 0.8 + Math.random() * 0.8; // 2 -> 0.8

        // [AI 버프] AI 공격진은 드리블 시 더 폭발적으로 전진
        if (isAI && (player.position === 'FW' || player.position === 'MF')) {
            moveDist *= 1.4; // 40% 더 멀리 이동
        }

        // [신규] 공간이 열려있어서 드리블을 선택한 경우(passProb가 낮음), 과감하게 치고 달림
        if (passProb <= 0.1 && (player.position === 'FW' || player.position === 'MF')) {
            moveDist += 1.0; // 속도 증가 (2.5 -> 1.0)
            moveSpeed = 1.5;
        }

        if (isBlocked && !underPressure) {
            // [신규] 앞이 막혔지만 압박이 없으면 횡드리블 (공간 창출)
            player.x += moveDir * (Math.random() * 0.8); // 2 -> 0.8
            player.y += (Math.random() < 0.5 ? 3.5 : -3.5) + (Math.random() * 1.5); // 8 -> 3.5
        } else {
            // 기본 전진 드리블
            player.x += moveDir * moveDist; 
            player.y += (Math.random() - 0.5) * 10;
        }
        
        // 경기장 밖으로 나가지 않게
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
                // [수정] 백패스(골대와 멀어지는 패스)에 대한 페널티 강화
                if (distAfter > distBefore) forwardScore -= 15; 
                
                // [AI 버프] AI는 전진 패스에 더 높은 가산점을 줌 (공격적 운영)
                if (isAI && forwardScore > 0) {
                    forwardScore *= 1.5;
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

            // [신규] 4. 패스 루프 방지 (직전 패스해준 사람에게 다시 주는 것 감점)
            let loopPenalty = 0;
            if (this.ball.lastOwner === tm) {
                // 공격 모드일 땐 전진해야 하므로 리턴 패스 대폭 감점 (-60)
                // 안전 모드일 땐 줄 곳 없으면 리턴 줄 수도 있으니 소폭 감점 (-20)
                loopPenalty = mode === 'aggressive' ? 60 : 20;
            }

            // [신규] 5. 빌드업 보너스 (DF -> MF 연결 장려)
            let positionBonus = 0;
            if (player.position === 'DF') {
                if (tm.position === 'MF') positionBonus = 5; // 미드필더에게 주는 전진 패스 (가장 선호)
                else if (tm.position === 'DF') positionBonus = 3; // [수정] 같은 수비수(CB↔FB) 간 연결도 장려
            }
            if (player.position === 'GK' && tm.position === 'DF') positionBonus = 5;

            const totalScore = forwardScore + distScore + pressureScore - loopPenalty + positionBonus;
            
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

        // 슈팅 파워: 능력치(80~120% 변동) * 거리보정
        const shotPower = shooter.stats.shooting * (0.8 + Math.random() * 0.4) * distFactor;
        // [수정] 선방 파워 재조정 (GK 버프): 0.7 -> 0.8 계수 상향 및 기본값 +5 추가
        const savePower = gkRating * (0.8 + Math.random() * 0.5) + 5; 

        let isGoal = shotPower > savePower;
        
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

            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 40; // [수정] 세레머니 시간 확대 (약 2.4초) - 이동 보여주기 위해
            this.ball.state = BallState.DEAD;
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

            let targetX = p.x;
            let targetY = p.y;
            let moveSpeed = 0.15; // [수정] 틱 주기가 빨라졌으므로(100ms) 이동 속도 하향 조정 (자연스러운 움직임)

            // ------------------------------------
            // 상황 1: 루즈볼 (공이 주인 없을 때) - 모두가 공을 향해 뜀
            // ------------------------------------
            if (isLooseBall) {
                // [수정] 동네 축구 방지: 각 팀에서 가장 가까운 선수만 공을 쫓음
                const isNearest = (p === nearestHome || p === nearestAway);
                
                if (isNearest) {
                    targetX = this.ball.x;
                    targetY = this.ball.y;
                    moveSpeed = 0.35; // 전력 질주
                } else {
                    // 나머지는 자기 포메이션 위치를 지키되, 공 쪽을 주시 (약간 이동)
                    const ballInfluence = 0.15; // 15% 정도만 공 쪽으로 쏠림
                    targetX = p.baseX + (this.ball.x - p.baseX) * ballInfluence;
                    targetY = p.baseY + (this.ball.y - p.baseY) * ballInfluence;
                    moveSpeed = 0.15; // 천천히 이동
                }
            } 
            // ------------------------------------
            // 상황 2: 우리 팀이 공격 중 (공격 오프더볼)
            // ------------------------------------
            else if (p.teamId === attackingTeam) {
                // [공격 시] 침투, 지원, 오버래핑
                const behavior = this.getRoleBehavior(p.role);
                const isHome = p.teamId === 'home';
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
                    moveSpeed = 0.09; // [수정] 0.22 -> 0.09
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

                    // [AI 버프] AI 공격수는 더 깊숙이 침투 (20m -> 25m)
                    let pushDistance = 20;
                    if (isAttackingAI) pushDistance = 25;

                    targetX = this.ball.x + (forwardDir * pushDistance); // 공보다 앞 (X축)
                    targetY = p.baseY + avoidY; // 포메이션 Y위치 + 회피
                    
                    if (behavior.runBehind) targetX += (forwardDir * 10); // 침투형은 더 깊게
                } else if (p.position === 'MF') {
                    // 미드필더: 공 주변에서 패스 받을 준비 (삼각형 대형 유지)
                    // 공과 포메이션 위치의 중간 지점
                    targetY = (p.baseY * 0.4) + (this.ball.y * 0.6); 
                    targetX = (p.baseX * 0.4) + (this.ball.x * 0.6);
                    
                    // 너무 뭉치지 않게 산개 (Y축 기준)
                    if (Math.abs(p.y - this.ball.y) < 5) targetY += (p.y > 50 ? 5 : -5);
                } else {
                    // 수비수: 라인 올리기 (하프라인 근처까지)
                    // [수정] 공격 시 수비 라인 높이 조절 (너무 높지 않게 +15로 제한)
                    // 공보다 뒤에 머물도록 안전 거리 확보 (35m)
                    if (isHome) {
                        targetX = Math.min(p.baseX + 15, Math.max(p.baseX, this.ball.x - 35));
                    } else {
                        targetX = Math.max(p.baseX - 15, Math.min(p.baseX, this.ball.x + 35));
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
                let shiftFactor = 0.7;
                // [신규] Y축(폭) 이동 계수: 수비수는 대형 유지를 위해 공 쪽으로 덜 쏠리게 함
                let yShiftFactor = 0.2;
                
                // 수비 시 미드필더는 더 적극적으로 내려와서 수비 라인과 간격을 좁힘
                if (p.position === 'MF') {
                    shiftFactor = 0.95; // [수정] 수비 가담 대폭 상향 (더 깊게 내려옴)
                } else if (p.position === 'FW') {
                    shiftFactor = 0.7; // [수정] 공격수도 수비 시 하프라인 아래로 내려오도록 조정 (0.5 -> 0.7)
                } else if (p.position === 'DF') {
                    shiftFactor = 0.4; // [수정] 수비 라인을 너무 내리지 않도록 이동 계수 감소 (0.6 -> 0.4)
                    yShiftFactor = 0.05; // [수정] 수비 폭을 더 넓게 유지 (0.1 -> 0.05) - 뭉침 방지
                }

                const ballXShift = (this.ball.x - 50) * shiftFactor; 
                let formationX = p.baseX + ballXShift;
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
                    // 상대와 내 골대 사이 8:2 지점
                    targetX = markTarget.x + (goalX - markTarget.x) * 0.1; 
                    targetY = markTarget.y; 
                    moveSpeed = 0.06; // [수정] 0.15 -> 0.06

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
                    const goalX = isHomeGK ? 5 : 95; // 기본 골대 앞 위치
                    
                    // 공의 위치에 따라 좌우(Y축)로만 살짝 이동하고 앞으로 튀어나가지 않음
                    // 공이 멀리 있으면 골대 앞 중앙, 가까우면 각도 좁히기
                    targetX = goalX + (this.ball.x - goalX) * 0.1; // 아주 조금만 앞으로
                    targetX = isHomeGK ? Math.min(targetX, 15) : Math.max(targetX, 85); // 페널티 박스 안쪽으로 제한
                    
                    targetY = 50 + (this.ball.y - 50) * 0.3; // 공 방향으로 Y축 이동
                }

                // 3. 압박 (Pressing)
                // [수정] 골키퍼는 압박 하러 뛰쳐나가지 않음
                if (this.ball.owner && p.position !== 'GK') {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    
                    // [수정] "우르르 몰려다니는" 현상 방지: 전담 압박러(presser)이거나 초근접(8m) 상황일 때만 압박
                    // 기존 30m 범위 내 모든 선수가 압박하던 로직 제거 -> 포메이션 유지 강화
                    if (p === presser || distToBall < 8) {
                        targetX = this.ball.x;
                        targetY = this.ball.y;
                        moveSpeed = 0.15; // [수정] 0.35 -> 0.15 (전력 질주)
                        
                        // 태클 시도
                        // [재수정] 근접 시 태클 빈도 대폭 상향 (거리 5m, 확률 50%~90%)
                        let tackleChance = 0.5;
                        if (distToBall < 2) tackleChance = 0.9;

                        if (distToBall < 5 && Math.random() < tackleChance) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        
                        // 압박 로직은 바로 이동 적용하고 리턴
                        p.x += (targetX - p.x) * moveSpeed;
                        p.y += (targetY - p.y) * moveSpeed;
                        return; 
                    }
                }

                // [신규] 4. 수비 복귀 (Retreat): 수비수가 뚫렸으면 뒤도 안보고 복귀
                const isHomeDef = p.teamId === 'home';
                // 홈팀은 공이 나보다 왼쪽(0쪽)에 있으면 뚫림, 원정팀은 오른쪽(100쪽)에 있으면 뚫림
                const isBeaten = p.position === 'DF' && (isHomeDef ? (this.ball.x < p.x - 2) : (this.ball.x > p.x + 2));

                if (isBeaten) {
                    targetX = this.ball.x + (isHomeDef ? -15 : 15); // 공보다 더 깊숙이 후퇴하여 길목 차단
                    targetY = this.ball.y; // 공 라인으로 이동
                    moveSpeed = 0.15; // [수정] 0.35 -> 0.15
                }
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
                targetX += (Math.random() - 0.5) * 2.0; // 4.0 -> 2.0 (떨림 감소)
                targetY += (Math.random() - 0.5) * 4.0;
            }

            // 실제 이동 적용
            p.x += (targetX - p.x) * moveSpeed;
            p.y += (targetY - p.y) * moveSpeed;
        });
    }

    // [신규] 전방 수비벽 감지 (드리블 vs 패스 판단용)
    checkFrontalBlock(player, goalX) {
        const forwardDir = player.teamId === 'home' ? 1 : -1; // 홈(100방향), 어웨이(0방향)
        const checkDist = 15; // 전방 15m 확인
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
                    // [수정] 인터셉트 확률 하향 (공격 전개 활성화를 위해 수비 너프)
                    // 기존: 0.1 + ... -> 수정: 0.05 + ... (패스 연결 빈도 증가)
                    const interceptChance = 0.05 + (p.stats.defense / 400); 
                    if (Math.random() < interceptChance) {
                        this.ball.state = BallState.CONTROLLED;
                        this.ball.owner = p;
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
            'BBM': { runBehind: false, pressBias: 0.1 }, // 박스투박스 (활동량)
            'DLP': { comeShort: true, passBias: 0.3 }, // 후방 플레이메이커
            'AP':  { comeShort: true, passBias: 0.2, dribbleBias: 0.1 }, // 전진 플레이메이커
            'BWM': { pressBias: 0.3, passBias: -0.1 }, // 볼 위닝 (강한 압박)
            
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
        const defRoll = defender.stats.defense * Math.random();
        const atkRoll = attacker.stats.decision * Math.random();

        if (defRoll > atkRoll) {
            // 태클 성공 -> 소유권 전환
            this.ball.owner = defender;
            this.eventsQueue.push({ type: 'tackle', player: defender.name, desc: `${defender.name}의 태클 성공!` });
        }
    }

    adjustDefensiveLines() {
        // processOffBallAI에서 이미 공 위치 기반 라인 조정을 수행함.
        // 추가적인 전술적 라인 조정(Deep/High)은 여기서 가능
        const lineShift = gameData.deepTactics.defensiveLine === 'high' ? -10 : (gameData.deepTactics.defensiveLine === 'deep' ? 10 : 0);
        // (구현 생략 - 위 로직에 포함됨)
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
