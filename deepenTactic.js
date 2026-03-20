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
    constructor(homeSquad, awaySquad) {
        this.players = [];
        this.ball = new SimBall();
        this.matchTime = 0;
        this.eventsQueue = []; // 렌더러/시스템으로 보낼 이벤트
        this.pendingShot = null; // [신규] 슛 결과 대기
        this.celebrationTimer = 0; // [신규] 세레머니 타이머
        this.lastScorerTeam = null;

        // 선수 초기화
        this.initTeam(homeSquad, 'home');
        this.initTeam(awaySquad, 'away');
        
        // 킥오프 세팅
        this.resetPositions('home');
    }

    initTeam(squad, teamId) {
        // [수정] 가로 모드 포메이션 좌표 설정 (Left <-> Right)
        // Home(Red): 왼쪽(0) 진영 -> 오른쪽(100)으로 공격
        // Away(Blue): 오른쪽(100) 진영 -> 왼쪽(0)으로 공격
        
        const setupLine = (list, baseX) => {
            const height = 100; // Y축 높이
            list.forEach((p, i) => {
                if (!p) return;
                
                // [수정] 역할 할당 (유저 팀은 설정된 역할, AI는 기본 역할)
                let role = 'CM';
                if (gameData.playerRoles && gameData.playerRoles[p.name]) {
                    role = gameData.playerRoles[p.name];
                } else {
                    // 기본값 매핑
                    if (p.position === 'FW') role = 'AF';
                    else if (p.position === 'MF') role = 'BBM';
                    else if (p.position === 'DF') role = 'CD';
                    else if (p.position === 'GK') role = 'GK';
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
                // 킥오프 시 수비 위치로 복귀 (X좌표 중앙 집결 방지)
                p.x = p.baseX;
                p.y = p.baseY;
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
            // 날아가는 중 -> 목표 지점 도착
            this.ball.x = this.ball.targetPos.x;
            this.ball.y = this.ball.targetPos.y;
            this.ball.state = BallState.LOOSE; // 도착 후 루즈볼 상태 (받는 사람이 처리)
            
            // [신규] 슛 결과 처리 (공이 골대에 도착한 시점)
            if (this.pendingShot) {
                this.handleShotResult();
                return this.getSnapshot();
            }
            
            // [신규] 패스 차단(인터셉트) 체크 - 공이 날아가는 중에도 수비수가 있으면 걸림
            if (Math.random() < 0.3) { // 30% 확률로 인터셉트 시도
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

            // 5 거리 이내면 소유 획득
            if (nearest && minDst < 10) {
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
            events: [...this.eventsQueue]
        };
    }

    // 🟠 [AI] 공 가진 선수 행동 우선순위
    processBallCarrierAI(player) {
        const isHome = player.teamId === 'home';
        const goalY = isHome ? 0 : 100; // 공격 방향
        const distToGoal = Math.abs(player.y - goalY);

        // 1. 슛 (찬스 파이프라인)
        if (distToGoal < 30) { // [수정] 슈팅 사거리 30m로 확장
            // 거리가 가까울수록 슈팅 확률 대폭 상승
            let shootChance = 0.1; // 30m: 10%
            if (distToGoal < 20) shootChance = 0.6; // 20m: 60%
            if (distToGoal < 12) shootChance = 0.9; // 12m: 90% (거의 무조건 슛)

            if (Math.random() < shootChance) {
                this.attemptShoot(player, goalY);
                return;
            }
        }

        // 2. 패스 (공간 계산)
        // [수정] 전방 상황에 따른 동적 패스/드리블 결정
        let passProb = 0.5; // 기본값

        // 내 앞(골대 방향)이 막혀있는지 확인
        if (this.checkFrontalBlock(player, goalY)) {
            // 막혀있으면 패스 우선 (95%)
            passProb = 0.95;
        } else {
            // 뚫려있으면 드리블 우선 (패스 확률 20%로 낮춤 -> 드리블 80%)
            passProb = 0.20;
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
            if (!bestPassTarget) {
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

        const moveDir = isHome ? -1 : 1;
        player.y += moveDir * (5 + Math.random() * 5); // 5~10 전진
        // 좌우 랜덤 드리블
        player.x += (Math.random() - 0.5) * 10;
        
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

        const isHome = player.teamId === 'home';
        const forwardY = isHome ? 0 : 100;

        teamates.forEach(tm => {
            // 1. 전진 점수 (공격 방향에 가까울수록 높음)
            const distBefore = Math.abs(player.y - forwardY);
            const distAfter = Math.abs(tm.y - forwardY);
            let forwardScore = (distBefore - distAfter); 
            
            // 안전 모드(빌드업)에서는 전진 가중치를 낮춰서 횡/백패스도 점수를 받게 함
            if (mode === 'safe') forwardScore *= 0.5;
            else forwardScore *= 2.0;

            // 2. 거리 점수 (너무 멀거나 너무 가까우면 감점)
            const dist = Math.hypot(player.x - tm.x, player.y - tm.y);
            let distScore = 0;
            if (dist < 10) distScore = -50; // 너무 가까움
            else if (dist > 25) distScore = -(dist - 25) * 2.0; // [수정] 25m 이상이면 점수 대폭 감점 (짧은 패스 선호)
            else distScore = 20; // [신규] 적당한 거리(10~25m)에 가산점 부여

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
        
        // 거리 페널티: 20m까지는 괜찮고, 그 이후 1m당 정확도 감소
        const distPenalty = Math.max(0, (dist - 20) * 0.8);
        let successChance = accuracy - distPenalty;
        
        // 골키퍼 롱킥은 랜덤성 추가 (가끔 삑사리)
        if (from.position === 'GK' && dist > 50) successChance -= 15;

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
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: `${from.name}, 패스 미스!` });
        } else {
            // [성공] 정확하게 배달
            this.ball.targetPos = { x: to.x, y: to.y };
            this.eventsQueue.push({ type: 'pass', from: from.name, to: to.name, desc: `${from.name}, ${to.name}에게 연결!` });
        }
    }

    // 🔵 [찬스 파이프라인] 슛 시도
    attemptShoot(shooter, goalY) {
        // [수정] 상대 GK 찾기 및 능력치 반영
        const opponentTeamId = shooter.teamId === 'home' ? 'away' : 'home';
        const gk = this.players.find(p => p.teamId === opponentTeamId && p.position === 'GK');
        const gkRating = gk ? gk.stats.defense : 60; // GK가 없으면 60으로 가정

        // 거리 보정 (골대와 가까울수록 유리)
        const dist = Math.abs(shooter.y - goalY);
        const distFactor = Math.max(0.7, 1.3 - (dist / 40)); // 가까우면 1.3배, 멀면 0.7배

        // 슈팅 파워: 능력치(80~120% 변동) * 거리보정
        const shotPower = shooter.stats.shooting * (0.8 + Math.random() * 0.4) * distFactor;
        // 선방 파워: GK능력치(80~120% 변동) + 기본 방어 보정(+25, 골대는 작고 키퍼는 유리함)
        const savePower = gkRating * (0.8 + Math.random() * 0.4) + 25;

        let isGoal = shotPower > savePower;
        
        this.ball.state = BallState.IN_FLIGHT;
        this.ball.owner = null;
        this.ball.targetPos = { x: goalX, y: 45 + Math.random() * 10 }; // [수정] 골문 구석도 노리도록 Y좌표 분산 (45~55)

        // [수정] 즉시 결과를 처리하지 않고 예약 (공이 날아가는 시간을 확보)
        this.pendingShot = {
            isGoal: isGoal,
            shooter: shooter,
            goalY: goalY
        };
        // 참고: 여기서 바로 'goal' 이벤트를 보내지 않음
    }

    // [신규] 공이 골대에 도착했을 때 결과 처리
    handleShotResult() {
        const { isGoal, shooter, goalY } = this.pendingShot;
        this.pendingShot = null;

        if (isGoal) {
            this.eventsQueue.push({ type: 'goal', scorer: shooter.name, team: shooter.teamId });
            this.lastScorerTeam = shooter.teamId;
            this.celebrationTimer = 15; // [수정] 틱 속도(100ms)에 맞춰 세레머니 시간 조정 (약 1.5초)
            this.ball.state = BallState.DEAD;
        } else {
            this.eventsQueue.push({ type: 'miss', shooter: shooter.name });
            // 골킥 상황 -> 상대 진영 GK에게 공 주기
            const enemyGk = this.players.find(p => p.teamId !== shooter.teamId && p.position === 'GK');
            if (enemyGk) {
                this.ball.state = BallState.CONTROLLED;
                this.ball.owner = enemyGk;
                this.ball.x = enemyGk.x;
                this.ball.y = enemyGk.y;
            } else {
                // GK가 없으면 골대 앞 루즈볼
                this.ball.state = BallState.LOOSE;
                this.ball.x = 50;
                this.ball.y = goalY === 0 ? 5 : 95;
            }
        }
    }

    // 오프 더 볼 움직임 (간단화)
    processOffBallAI() {
        const attackingTeam = this.ball.owner ? this.ball.owner.teamId : null;
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
                const forwardDir = isHome ? -1 : 1;
                
                // [신규] Give & Go 움직임 (패스하고 전방 침투)
                // 방금 패스한 선수(lastOwner)는 가만히 있지 않고 앞으로 달려서 리턴 패스를 노림
                const isLastPasser = (p === this.ball.lastOwner);
                // 센터백(CD, BPD, NCB)이나 골키퍼는 자리 지킴
                const isRearDefender = p.position === 'GK' || (p.position === 'DF' && ['CD', 'BPD', 'NCB'].includes(p.role));

                if (isLastPasser && !isRearDefender) {
                    // 패스 앤 런: 현재 위치에서 전방 15m 지점으로 침투
                    targetY = p.y + (forwardDir * 15);
                    // X축은 공 방향으로 약간 좁혀 들어감 (지원)
                    targetX = p.x + (this.ball.x - p.x) * 0.3;
                    moveSpeed = 0.22; // 평소보다 빠르게 이동
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

                    // 수비수가 너무 가까우면(5m) 옆으로 벌림
                    let avoidX = 0;
                    if (nearestDefender && minDist < 5) {
                        avoidX = (p.x - nearestDefender.x) > 0 ? 5 : -5;
                    }

                    targetY = this.ball.y + (forwardDir * 20); // 공보다 20m 앞
                    targetX = p.baseX + avoidX;
                    
                    if (behavior.runBehind) targetY += (forwardDir * 10); // 침투형은 더 깊게
                } else if (p.position === 'MF') {
                    // 미드필더: 공 주변에서 패스 받을 준비 (삼각형 대형 유지)
                    // 공과 포메이션 위치의 중간 지점
                    targetY = (p.baseY * 0.4) + (this.ball.y * 0.6); 
                    targetX = (p.baseX * 0.4) + (this.ball.x * 0.6);
                    
                    // 너무 뭉치지 않게 산개
                    if (Math.abs(p.x - this.ball.x) < 5) targetX += (p.x > 50 ? 5 : -5);
                } else {
                    // 수비수: 라인 올리기 (하프라인 근처까지)
                    targetY = Math.min(Math.max(p.baseY, this.ball.y - (forwardDir * 30)), p.baseY + (forwardDir * 20)); 
                    targetX = p.baseX; // 좌우는 유지
                }

                // X축 이동 (벌리기/좁히기)
                if (behavior.cutInside) {
                    targetX = 50 + (p.baseX - 50) * 0.5; // 중앙으로 좁힘
                } else if (behavior.hugLine) {
                    targetX = p.baseX < 50 ? 5 : 95; // 터치라인으로 벌림
                }

            } else {
                // ------------------------------------
                // 상황 3: 상대 팀이 공격 중 (수비 오프더볼)
                // ------------------------------------
                // 1. 기본 수비 블록 형성 (공 위치에 따라 전체 이동)
                const ballYShift = (this.ball.y - 50) * 0.7; 
                let formationY = p.baseY + ballYShift;
                let formationX = p.baseX + (this.ball.x - 50) * 0.2; // [수정] 0.3 -> 0.2 (너무 좁게 모이는 것 방지)

                // 2. 대인 마크 (내 구역에 들어온 공격수 마크)
                let markTarget = null;
                let minMarkDist = 25; // [수정] 마크 범위 20->25 확대
                
                this.players.forEach(opp => {
                    if (opp.teamId !== p.teamId && opp.position !== 'GK' && opp !== this.ball.owner) {
                        const d = Math.hypot(p.x - opp.x, p.y - opp.y);
                             // [신규] 내 수비 구역(Lane)을 지키기 위해 Y축 차이가 크면 마크하지 않음 (뭉침 방지)
                             if (Math.abs(p.baseY - opp.y) > 25) return;
                             
                        if (d < minMarkDist) {
                            minMarkDist = d;
                            markTarget = opp;
                        }
                    }
                });

                if (markTarget && p.position !== 'GK') {
                    // 마크 대상과 골대 사이를 막아서는 위치
                    const goalY = p.teamId === 'home' ? 100 : 0; // 내 골대
                    // 상대와 내 골대 사이 8:2 지점
                    targetX = markTarget.x + (50 - markTarget.x) * 0.1; // 중앙 쪽으로 몰기
                    targetY = markTarget.y + (goalY - markTarget.y) * 0.1; 
                    moveSpeed = 0.15; // 마크할 땐 좀 더 기민하게
                } else {
                    targetX = formationX;
                    targetY = formationY;
                }

                // 3. 압박 (Pressing)
                if (this.ball.owner) {
                    const distToBall = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                    
                    // 내가 전담 압박러이거나, 공이 아주 가까우면 압박
                    if (p === presser || distToBall < 12) {
                        targetX = this.ball.x;
                        targetY = this.ball.y;
                        moveSpeed = 0.25; // [수정] 압박 속도
                        
                        // 태클 시도
                        if (distToBall < 3 && Math.random() < 0.1) {
                            this.attemptTackle(p, this.ball.owner);
                        }
                        
                        // 압박 로직은 바로 이동 적용하고 리턴
                        p.x += (targetX - p.x) * moveSpeed;
                        p.y += (targetY - p.y) * moveSpeed;
                        return; 
                    }
                }
            }

            // 경기장 범위 제한
            targetY = Math.max(2, Math.min(98, targetY));
            targetX = Math.max(2, Math.min(98, targetX));

            // [신규] 기계적인 움직임 방지를 위한 노이즈(Noise) 추가
            // 목표 지점에 ±2m 정도의 무작위성을 부여하여 자연스러운 곡선/흔들림 연출
            if (!isLooseBall) { // 루즈볼 경합 때는 정확하게 가야 하므로 제외
                targetX += (Math.random() - 0.5) * 4.0;
                targetY += (Math.random() - 0.5) * 4.0;
            }

            // 실제 이동 적용
            p.x += (targetX - p.x) * moveSpeed;
            p.y += (targetY - p.y) * moveSpeed;
        });
    }

    // [신규] 전방 수비벽 감지 (드리블 vs 패스 판단용)
    checkFrontalBlock(player, goalY) {
        const forwardDir = player.teamId === 'home' ? -1 : 1; // 홈은 위(-), 어웨이는 아래(+)
        const checkDist = 15; // 전방 15m 확인
        const checkWidth = 6; // 좌우 6m 확인

        // 내 앞의 사각형 영역 정의
        const minX = player.x - checkWidth;
        const maxX = player.x + checkWidth;
        const minY = forwardDir === 1 ? player.y : player.y - checkDist;
        const maxY = forwardDir === 1 ? player.y + checkDist : player.y;

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
        const forwardDir = isHome ? -1 : 1;
        const attackBonus = (roleStats.attack || 0) * 10; // 공격 가중치 -> 침투 깊이

        // 1. 스트라이커 런 (침투)
        if (runType === RUN_TYPE.STRIKER_RUN) {
            const defLineY = this.getDefensiveLineY(isHome ? 'away' : 'home');
            // 수비 라인 바로 뒤 + 공격성만큼 더 깊이
            const penetrationDepth = 5 + attackBonus; 
            return {
                x: this.ball.x + (Math.random() - 0.5) * 20, // 공 근처 좌우
                y: defLineY + (forwardDir * penetrationDepth)
            };
        }
        
        // 2. 서포트 런 (삼각형)
        else if (runType === RUN_TYPE.SUPPORT_RUN) {
            // 공 소유자 기준 대각선 뒤쪽 (안전한 패스 옵션)
            const side = player.baseX < 50 ? 'left' : 'right';
            // 홈팀 기준: 왼족 선수는 210도(7시), 오른쪽은 330도(5시) 방향
            // 원정팀(아래로 공격): 왼쪽은 330도(11시), 오른쪽은 210도(1시)? 
            // 간단하게: 공격 반대 방향으로 45도 벌림
            const backDirY = -forwardDir;
            const sideDirX = side === 'left' ? -1 : 1;
            
            return {
                x: this.ball.x + (sideDirX * 10),
                y: this.ball.y + (backDirY * 10)
            };
        }
        
        // 3. 채널 런 (수비 사이)
        else if (runType === RUN_TYPE.CHANNEL_RUN) {
            const defLineY = this.getDefensiveLineY(isHome ? 'away' : 'home');
            // 공과 반대쪽 하프스페이스 찾기
            const targetX = this.ball.x < 50 ? 70 : 30; 
            return { x: targetX, y: defLineY + (forwardDir * 2) }; // 라인과 동일선상
        }
        
        // 4. 와이드 런 (벌리기)
        else if (runType === RUN_TYPE.WIDE_RUN) {
            const sideX = player.baseX < 50 ? 5 : 95;
            return { x: sideX, y: this.ball.y + (forwardDir * 5) }; // 공보다 약간 앞
        }
        
        // 5. 언더랩 런 (안으로)
        else if (runType === RUN_TYPE.UNDERLAP_RUN) {
            const halfSpaceX = player.baseX < 50 ? 30 : 70;
            const defLineY = this.getDefensiveLineY(isHome ? 'away' : 'home');
            return { x: halfSpaceX, y: defLineY + (forwardDir * 5) };
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
    getDefensiveLineY(opposingTeamId) {
        const isOpponentHome = opposingTeamId === 'home';
        const goalY = isOpponentHome ? 0 : 100; // 상대가 지키는 골대 (홈팀은 0을 지킴?? 아님 100을 지킴)
        // 수정: Home attacks 0 (Top). So Away defends 0.
        // Away defends 0 -> Away defenders are at low Y (e.g. 20).
        // Opponent is Away. Their goal line is 0 (Top). No wait.
        // Home(Red) attacks 0. Away defends 0.
        // So Away defenders are closest to 0.
        // If Opponent is Away: Find defender with largest Y (deepest relative to 0? No, smallest Y is closest to 0).
        // But "Defensive Line" usually means the line closest to the attackers (highest up the pitch) or deepest?
        // For offside, we need the "second last opponent".
        
        let relevantPlayers = this.players.filter(p => p.teamId === opposingTeamId && p.position !== 'GK');
        
        if (opposingTeamId === 'away') {
            // Away defends 0 (Top). They are at Y=20, 30.
            // Deepest defender is the one with smallest Y (closest to 0).
            // But offside line is defined by the *second* deepest player (usually last defender, if GK is deepest).
            // Let's just return the last defender's Y for simplicity of run calculation.
            // For RUN calculation, we want the line where defenders ARE.
            // Let's take the average Y of defenders to handle formation structure.
            // Or simply Max Y of defenders? (Since Away defenders are [GK(5), DF(20)]).
            // If Home attacks 0, they come from 100.
            // Ah, coordinate system review: Home(Bottom->Top, 100->0). Away(Top->Bottom, 0->100).
            // Home attacks 0. Away defenders are at e.g. 20.
            // The defensive line is around 20.
            const ys = relevantPlayers.map(p => p.y);
            return Math.max(...ys); // The defender furthest from goal (highest line)
        } else {
            // Home defends 100 (Bottom). They are at Y=80.
            const ys = relevantPlayers.map(p => p.y);
            return Math.min(...ys); // Defender with smallest Y (highest up pitch)
        }
    }

    // [신규] 오프사이드 체크 (목표 위치 보정)
    applyOffsideCheck(targetPos, player) {
        const opposingTeamId = player.teamId === 'home' ? 'away' : 'home';
        const opponents = this.players.filter(p => p.teamId === opposingTeamId);
        
        // 골라인 기준 2번째로 가까운 선수 찾기 (오프사이드 라인)
        if (player.teamId === 'home') {
            // Home attacks 0. 
            // Opponents (Away) are at 0..20.
            // Sort by Y ascending (closest to 0).
            opponents.sort((a, b) => a.y - b.y);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineY = opponents[1].y; // 2번째 선수 (보통 마지막 수비수)
            const ballY = this.ball.y;
            
            // 공이나 수비수보다 더 깊이(작은 Y) 갈 수 없음
            const limitY = Math.min(offsideLineY, ballY);
            
            if (targetPos.y < limitY) {
                targetPos.y = limitY + 2; // 라인에 걸치기
            }
        } else {
            // Away attacks 100.
            // Opponents (Home) are at 80..100.
            // Sort by Y descending (closest to 100).
            opponents.sort((a, b) => b.y - a.y);
            if (opponents.length < 2) return targetPos;
            
            const offsideLineY = opponents[1].y;
            const ballY = this.ball.y;
            
            const limitY = Math.max(offsideLineY, ballY);
            
            if (targetPos.y > limitY) {
                targetPos.y = limitY - 2;
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
            if (!this.ball.owner && this.ball.state === BallState.IN_FLIGHT) {
                const d = Math.hypot(p.x - this.ball.x, p.y - this.ball.y);
                if (d < 5) { // 5m 이내면 가로채기 시도
                    this.ball.state = BallState.CONTROLLED;
                    this.ball.owner = p;
                    this.eventsQueue.push({ type: 'tackle', player: p.name, desc: `${p.name}, 패스를 차단합니다!` });
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
