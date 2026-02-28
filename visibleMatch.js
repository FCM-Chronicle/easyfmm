// c:\Users\jinuj\vsc\easyfmm\visibleMatch.js

/**
 * @file visibleMatch.js
 * @description 바둑알 매치 엔진의 시각화(Visualizer) 모듈.
 * 논리적 연산(Engine)과 시각적 표현(Visualizer)을 분리하여,
 * 엔진이 계산한 결과를 60fps 캔버스 애니메이션으로 '연기'합니다.
 */

class VisualUnit {
    constructor(id, name, role, positionType, teamType, startX, startY) {
        this.id = id;
        this.name = name;
        this.role = role; // AF, BBM, BPD etc.
        this.positionType = positionType; // GK, DF, MF, FW
        this.teamType = teamType; // 'home' (User/Red) or 'away' (AI/Blue)
        
        // 좌표 시스템: 0~100% (Percentage)
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        
        // [추가] 기본 위치 저장 (수비 복귀용)
        this.baseX = startX;
        this.baseY = startY;
        
        // 물리 속성
        this.velocity = { x: 0, y: 0 };
        this.speed = 0.05; // 기본 Lerp 계수 (기동력 DNA에 따라 가변)
        this.stamina = 100;
        
        // 렌더링 속성
        this.radius = 2.5; // 화면 비율에 따라 리사이징됨
        this.color = this.teamType === 'home' ? '#e74c3c' : '#3498db'; // Red vs Blue
        this.number = ""; // 등번호 (추후 구현)
        
        // 상태
        this.hasBall = false;
        this.isCelebrating = false;
    }

    update(dt) {
        // 선형 보간 (Lerp) 이동: 현재 위치에서 목표 위치로 부드럽게 이동
        // x += (target - x) * speed
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        // 거리가 매우 가까우면 스냅
        if (Math.abs(dx) < 0.1 && Math.abs(dy) < 0.1) {
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            // 체력이 낮으면 이동 속도(Lerp 계수) 감소
            const fatigueFactor = this.stamina < 30 ? 0.6 : 1.0;
            const currentSpeed = this.speed * fatigueFactor;
            
            this.x += dx * currentSpeed;
            this.y += dy * currentSpeed;
        }
    }

    draw(ctx, width, height) {
        // [수정] 좌표 변환 헬퍼 사용
        const coords = matchVisualizer.getScreenCoords(this.x, this.y);
        const px = coords.x;
        const py = coords.y;
        
        // 가로 모드일 때는 높이 기준으로 크기 계산 (너무 커지는 것 방지)
        const baseSize = matchVisualizer.isLandscape ? height : width;
        const r = Math.max(8, baseSize * 0.03); 

        // [추가] 체력에 따른 투명도 처리 (Context 상태 저장)
        ctx.save();
        if (this.stamina < 30) {
            ctx.globalAlpha = 0.6; // 체력이 낮으면 반투명
        }

        // 그림자
        ctx.beginPath();
        ctx.arc(px, py + 2, r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0,0,0,0.3)';
        ctx.fill();

        // 바둑알 본체 (Claymorphism 스타일)
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        
        // 그라데이션 효과
        const grad = ctx.createRadialGradient(px - r/3, py - r/3, r/5, px, py, r);
        if (this.teamType === 'home') {
            grad.addColorStop(0, '#ff7675');
            grad.addColorStop(1, '#c0392b');
        } else {
            grad.addColorStop(0, '#74b9ff');
            grad.addColorStop(1, '#2980b9');
        }
        
        ctx.fillStyle = grad;
        ctx.fill();
        
        // 테두리
        ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        ctx.lineWidth = 1.5;
        ctx.stroke();

        // 공 소유 시 하이라이트 (Bloom)
        if (this.hasBall) {
            ctx.beginPath();
            ctx.arc(px, py, r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        // [추가] Context 상태 복원 (투명도 초기화)
        ctx.restore();

        // 이름 표시 (선택적)
        /*
        ctx.fillStyle = '#fff';
        ctx.font = '10px Arial';
        ctx.textAlign = 'center';
        ctx.fillText(this.name, px, py + r + 12);
        */
    }
}

class VisualBall {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.owner = null; // 현재 소유한 VisualUnit
        this.isInAir = false; // 패스/슈팅 중 여부
        this.speed = 0.15; // 공은 선수보다 빠름
    }

    update() {
        if (this.owner) {
            // 소유자가 있으면 소유자 위치를 따라감 (드리블)
            this.targetX = this.owner.x;
            this.targetY = this.owner.y + 2; // 발 밑
            this.speed = 0.3; // 드리블 시 반응 속도 빠름
        } else {
            // 패스/슈팅 시 독립 이동
            this.speed = 0.15;
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        
        this.x += dx * this.speed;
        this.y += dy * this.speed;
    }

    draw(ctx, width, height) {
        const coords = matchVisualizer.getScreenCoords(this.x, this.y);
        const px = coords.x;
        const py = coords.y;
        const baseSize = matchVisualizer.isLandscape ? height : width;
        const r = Math.max(4, baseSize * 0.015);

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = '#ffffff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1;
        ctx.stroke();
    }
}

class MatchVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.units = []; // 22명의 선수
        this.ball = null;
        this.animationId = null;
        this.isRunning = false;
        
        // 경기장 설정
        this.pitchColor = '#27ae60';
        this.lineColor = 'rgba(255,255,255,0.5)';
        
        // 화면 비율 관리
        this.width = 0;
        this.height = 0;
        this.isLandscape = false; // [추가] 가로 모드 여부
    }

    init(containerId, homeTeamData, awayTeamData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        // 기존 애니메이션이 있다면 중지
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        // 캔버스 생성 또는 재사용
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 리사이징 이벤트 연결
        this.resize();
        window.addEventListener('resize', () => this.resize());

        // 유닛 및 공 초기화
        this.setupUnits(homeTeamData, awayTeamData);
        this.ball = new VisualBall(50, 50); // 센터 서클 시작

        this.isRunning = true;
        this.animate();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        
        // 고해상도(Retina) 대응
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        // CSS 크기 맞춤
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        
        // 컨텍스트 스케일링
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.isLandscape = this.width > this.height; // [추가] 가로 모드 감지
    }

    setupUnits(homeData, awayData) {
        this.units = [];
        
        // [수정] 포지션별 자동 배치 함수
        const createTeamUnits = (players, teamType) => {
            // 포지션별로 분류
            const gks = players.filter(p => p.position === 'GK');
            const dfs = players.filter(p => p.position === 'DF');
            const mfs = players.filter(p => p.position === 'MF');
            const fws = players.filter(p => p.position === 'FW');

            // 라인별 Y좌표 설정 (홈: 아래쪽 50~100, 어웨이: 위쪽 0~50)
            // [수정] 공격수 위치를 하프라인(50) 안쪽으로 조정하여 시작 시 자기 진영에 있도록 함
            const yCoords = teamType === 'home' 
                ? { GK: 96, DF: 82, MF: 65, FW: 52 }  // 홈팀 (공격 방향: 위)
                : { GK: 4,  DF: 18, MF: 35, FW: 48 }; // 어웨이팀 (공격 방향: 아래)

            const placeLine = (linePlayers, y) => {
                const count = linePlayers.length;
                linePlayers.forEach((p, i) => {
                    // X좌표 균등 분배 (좌우 여백 10% 제외하고 80% 공간 활용)
                    // 예: 4명이면 20, 40, 60, 80 위치
                    const x = (100 / (count + 1)) * (i + 1);
                    
                    // 역할(Role) 정보 가져오기
                    let role = 'BBM'; // 기본값
                    if (teamType === 'home' && gameData.playerRoles && gameData.playerRoles[p.name]) {
                        role = gameData.playerRoles[p.name];
                    } else {
                        // 포지션별 기본 역할
                        if (p.position === 'FW') role = 'AF';
                        else if (p.position === 'MF') role = 'BBM';
                        else if (p.position === 'DF') role = 'CD';
                        else role = 'GK';
                    }

                    this.units.push(new VisualUnit(p.name, p.name, role, p.position, teamType, x, y));
                });
            };

            placeLine(gks, yCoords.GK);
            placeLine(dfs, yCoords.DF);
            placeLine(mfs, yCoords.MF);
            placeLine(fws, yCoords.FW);
        };

        createTeamUnits(homeData, 'home');
        createTeamUnits(awayData, 'away');
    }

    // ==================== 핵심: 엔진 -> 비주얼라이저 명령 처리 ====================
    
    /**
     * 엔진에서 발생한 이벤트를 받아 시각적 연출로 변환합니다.
     * @param {Object} event - { type: 'pass', from: 'PlayerA', to: 'PlayerB' }
     */
    processMatchEvent(event) {
        if (!event) return;

        switch (event.type) {
            case 'pass':
                this.handlePass(event);
                break;
            case 'dribble':
                this.handleDribble(event);
                break;
            case 'shoot':
                this.handleShoot(event);
                break;
            case 'goal':
                this.handleGoal(event);
                break;
            case 'tackle':
                this.handleTackle(event);
                break;
        }
        
        // 모든 유닛의 전술적 위치 재조정 (공의 위치 기반)
        this.updateTacticalMovements();
    }

    handlePass(event) {
        const fromUnit = this.findUnit(event.from);
        const toUnit = this.findUnit(event.to);

        if (fromUnit && toUnit) {
            fromUnit.hasBall = false;
            this.ball.owner = null; // 공이 발을 떠남
            this.ball.targetX = toUnit.x;
            this.ball.targetY = toUnit.y;
            
            // 받는 선수는 공을 향해 약간 마중 나옴
            toUnit.targetX = (toUnit.x + this.ball.x) / 2;
            toUnit.targetY = (toUnit.y + this.ball.y) / 2;
            
            // 공 도착 예상 시간에 소유권 이전 (간이 구현)
            setTimeout(() => {
                toUnit.hasBall = true;
                this.ball.owner = toUnit;
            }, 500);
        }
    }

    handleGoal(event) {
        const scorer = this.findUnit(event.scorer);
        if (scorer) {
            // 세리머니: 득점자는 코너 플래그로 이동
            const cornerX = scorer.x < 50 ? 0 : 100;
            const cornerY = scorer.teamType === 'home' ? 0 : 100; // 상대 진영 코너
            
            scorer.targetX = cornerX;
            scorer.targetY = cornerY;
            scorer.isCelebrating = true;
            
            // 같은 팀 동료들도 근처로 이동
            this.units.forEach(u => {
                if (u.teamType === scorer.teamType && u !== scorer) {
                    u.targetX = cornerX + (Math.random() * 20 - 10);
                    u.targetY = cornerY + (Math.random() * 20 - 10);
                }
            });
        }
    }

    handleShoot(event) {
        const shooter = this.findUnit(event.shooter);
        if (shooter) {
            this.ball.owner = null; // 공이 발을 떠남
            this.ball.x = shooter.x;
            this.ball.y = shooter.y;
            
            // 골대 위치 설정 (상대 진영 골대)
            // 홈팀(아래쪽)은 위쪽(0) 골대로, 어웨이팀(위쪽)은 아래쪽(100) 골대로
            const goalX = 50;
            const goalY = shooter.teamType === 'home' ? 0 : 100;
            
            this.ball.targetX = goalX;
            this.ball.targetY = goalY;
            this.ball.speed = 0.4; // 슈팅은 패스보다 빠름
        }
    }

    handleDribble(event) {
        // [구현] 드리블: 해당 선수가 공을 가지고 상대 진영으로 전진
        const unit = this.findUnit(event.player);
        if (unit) {
            this.ball.owner = unit;
            
            // 상대 골대 방향 설정 (홈팀: 0, 어웨이팀: 100)
            // 주의: setupUnits에서 홈팀은 Y=50~100, 어웨이팀은 Y=0~50에 배치됨.
            // 홈팀 공격 방향: 위쪽(0), 어웨이팀 공격 방향: 아래쪽(100)
            const goalY = unit.teamType === 'home' ? 0 : 100;
            
            // 현재 위치에서 골대 쪽으로 20% 전진
            unit.targetY = unit.y + (goalY - unit.y) * 0.2;
            
            // 좌우로 약간의 랜덤 이동 (돌파 시도 연출)
            unit.targetX += (Math.random() - 0.5) * 15;
            
            // 경기장 밖으로 나가지 않게 클램핑
            unit.targetX = Math.max(5, Math.min(95, unit.targetX));
            unit.targetY = Math.max(5, Math.min(95, unit.targetY));
        }
    }

    handleTackle(event) {
        // [구현] 태클: 공 소유권 변경
        if (event.player) {
            const unit = this.findUnit(event.player);
            if (unit) {
                this.ball.owner = unit; // 공을 뺏은 선수에게 공 이동
                // 뺏은 선수는 잠시 멈춤 (안정화)
                unit.targetX = unit.x;
                unit.targetY = unit.y;
            }
        } else {
            // 선수가 특정되지 않은 경우 공을 주인 없음 상태로 만듦
            this.ball.owner = null;
        }
    }

    // [신규] 팀 전체 라인 이동 계산 (공 위치 기반)
    calculateTeamShift(ballY, teamType) {
        // Home(Red, Bottom): 공격 방향 위쪽(0). 공이 위로 갈수록 라인 올림(Y 감소).
        // Away(Blue, Top): 공격 방향 아래쪽(100). 공이 아래로 갈수록 라인 내림(Y 증가).
        
        if (teamType === 'home') {
            // 공이 0(상대 골문)에 가까울수록 -30(전진), 100(내 골문)에 가까울수록 0(복귀)
            // 수비 라인 기본 Y=80. 공격 시 Y=50까지 전진.
            const attackFactor = Math.max(0, (80 - ballY) / 80); 
            return -30 * attackFactor; 
        } else {
            // 공이 100(상대 골문)에 가까울수록 +30(전진), 0(내 골문)에 가까울수록 0(복귀)
            // 수비 라인 기본 Y=20. 공격 시 Y=50까지 전진.
            const attackFactor = Math.max(0, (ballY - 20) / 80);
            return 30 * attackFactor;
        }
    }

    // ==================== 역할(Role) 기반 움직임 로직 ====================

    updateTacticalMovements() {
        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const ballOwnerTeam = this.ball.owner ? this.ball.owner.teamType : null;

        this.units.forEach(unit => {
            // 공을 가진 선수는 유저 컨트롤(이벤트)에 따름
            if (unit.hasBall || unit.isCelebrating) return;

            // 1. 기본 포메이션 복귀 (Base Position)
            // 실제로는 formation.js의 좌표를 가져와야 하지만 여기선 초기값을 기준으로 함
            // (간소화를 위해 현재 위치 주변을 배회하도록 설정)
            
            // 2. 역할별 벡터 적용 (Role Vector)
            const roleVector = this.getRoleVector(unit, ballX, ballY, ballOwnerTeam);
            
            // 3. 최종 목표 좌표 설정
            // 현재 위치 + 역할 벡터
            let destX = unit.x + roleVector.x;
            let destY = unit.y + roleVector.y;
            
            // 경기장 밖으로 나가지 않게 클램핑
            destX = Math.max(5, Math.min(95, destX));
            destY = Math.max(5, Math.min(95, destY));
            
            unit.targetX = destX;
            unit.targetY = destY;
        });
    }

    getRoleVector(unit, ballX, ballY, ballOwnerTeam) {
        const vector = { x: 0, y: 0 };
        const isAttacking = unit.teamType === ballOwnerTeam;
        
        // 공격 시 움직임
        if (isAttacking) {
            // IF (인사이드 포워드): 측면에서 중앙으로 침투
            if (unit.role === 'IF') {
                // 중앙(50) 쪽으로 이동
                vector.x = (50 - unit.x) * 0.1; 
                vector.y = (unit.teamType === 'home' ? -1 : 1) * 5; // 전진
            }
            // W (윙어): 터치라인 유지하며 전진
            else if (unit.role === 'W') {
                vector.x = 0; // X축 유지
                vector.y = (unit.teamType === 'home' ? -1 : 1) * 8; // 빠른 전진
            }
            // F9 (펄스 나인): 미드필더 지역으로 후퇴
            else if (unit.role === 'F9') {
                vector.y = (unit.teamType === 'home' ? 1 : -1) * 5; // 후퇴
            }
            // 일반적인 전진 (공보다 뒤에 있으면 전진)
            else {
                if ((unit.teamType === 'home' && unit.y > ballY) || 
                    (unit.teamType === 'away' && unit.y < ballY)) {
                    vector.y = (unit.teamType === 'home' ? -1 : 1) * 3;
                }
            }
        } 
        // 수비 시 움직임 (Magnet Logic)
        else {
            // 공과 골대 사이를 지키는 자석 로직
            const goalY = unit.teamType === 'home' ? 100 : 0; // 내 골대
            
            // 공과 내 골대 사이의 30% 지점으로 이동
            const targetDefX = ballX + (50 - ballX) * 0.1; // 중앙 쪽으로 좁힘
            const targetDefY = ballY + (goalY - ballY) * 0.3;
            
            vector.x = (targetDefX - unit.x) * 0.05;
            vector.y = (targetDefY - unit.y) * 0.05;
        }

        return vector;
    }

    // [신규] 화면 좌표 변환 헬퍼 (가로/세로 모드 대응)
    getScreenCoords(x, y) {
        // x, y는 0~100% 논리 좌표 (세로 경기장 기준)
        // 세로 모드: x=가로, y=세로 (Home=Bottom)
        // 가로 모드: x=세로, y=가로 (Home=Left) -> 회전 변환
        
        if (this.isLandscape) {
            // 가로 모드: Home(Red)을 왼쪽(X=0), Away(Blue)를 오른쪽(X=100)으로 배치
            // 논리적 Y(100) -> 화면 X(0)
            // 논리적 X(0) -> 화면 Y(0)
            return {
                x: (1 - y / 100) * this.width,
                y: (x / 100) * this.height
            };
        } else {
            // 세로 모드 (기존 유지)
            return {
                x: (x / 100) * this.width,
                y: (y / 100) * this.height
            };
        }
    }

    findUnit(name) {
        return this.units.find(u => u.name === name);
    }

    // ==================== 렌더링 루프 ====================

    animate() {
        if (!this.isRunning) return;

        // 1. Clear
        this.ctx.clearRect(0, 0, this.width, this.height);

        // 2. Draw Pitch
        this.drawPitch();

        // 3. Update & Draw Units
        // Y축 기준으로 정렬하여 렌더링 (원근감 흉내 - 아래쪽이 위에 그려짐)
        this.units.sort((a, b) => a.y - b.y);
        
        this.units.forEach(unit => {
            unit.update();
            unit.draw(this.ctx, this.width, this.height);
        });

        // 4. Update & Draw Ball
        this.ball.update();
        this.ball.draw(this.ctx, this.width, this.height);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    drawPitch() {
        this.ctx.fillStyle = this.pitchColor;
        this.ctx.fillRect(0, 0, this.width, this.height);

        // 라인 그리기
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 2;

        if (this.isLandscape) {
            // 가로 모드 경기장 그리기
            // 외곽선
            this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
            
            // 중앙선 (세로)
            this.ctx.beginPath();
            this.ctx.moveTo(this.width / 2, 10);
            this.ctx.lineTo(this.width / 2, this.height - 10);
            this.ctx.stroke();
            
            // 센터 서클
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.height * 0.15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 페널티 박스 (좌/우)
            const boxWidth = this.width * 0.15;
            const boxHeight = this.height * 0.5;
            
            // Left Box (Home Goal - Logical Y=100)
            this.ctx.strokeRect(10, (this.height - boxHeight) / 2, boxWidth, boxHeight);
            
            // Right Box (Away Goal - Logical Y=0)
            this.ctx.strokeRect(this.width - 10 - boxWidth, (this.height - boxHeight) / 2, boxWidth, boxHeight);

        } else {
            // 세로 모드 경기장 그리기 (기존)
            this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
            this.ctx.beginPath();
            this.ctx.moveTo(10, this.height / 2);
            this.ctx.lineTo(this.width - 10, this.height / 2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.width * 0.15, 0, Math.PI * 2); // 비율 조정
            this.ctx.stroke();
            
            const boxWidth = this.width * 0.5;
            const boxHeight = this.height * 0.15;
            this.ctx.strokeRect((this.width - boxWidth) / 2, 10, boxWidth, boxHeight);
            this.ctx.strokeRect((this.width - boxWidth) / 2, this.height - 10 - boxHeight, boxWidth, boxHeight);
        }
    }
}

// 전역 인스턴스 생성
const matchVisualizer = new MatchVisualizer();
window.matchVisualizer = matchVisualizer;

// 기존 startMatch 함수에 연결하기 위한 훅 (Hook)
// tacticSystem.js가 로드된 후 실행되어야 함
document.addEventListener('DOMContentLoaded', () => {
    // 기존 startMatch 함수 백업
    if (typeof window.startMatch === 'function') {
        const originalStartMatch = window.startMatch;
        
        window.startMatch = function() {
            // 1. 기존 로직 실행 (데이터 초기화 등)
            originalStartMatch.apply(this, arguments);
            
            // 2. 비주얼라이저 초기화 및 시작
            // matchScreen 내부에 캔버스 컨테이너가 있다고 가정
            // 없으면 동적으로 생성
            let visualContainer = document.getElementById('matchVisualizerContainer');
            if (!visualContainer) {
                const matchScreen = document.getElementById('matchScreen');
                visualContainer = document.createElement('div');
                visualContainer.id = 'matchVisualizerContainer';
                visualContainer.style.cssText = 'width: 100%; height: 60vh; margin-bottom: 20px; position: relative;';
                
                 // [수정] 삽입 위치 변경: .match-events(텍스트 중계 영역) 바로 위에 삽입
                const matchEvents = matchScreen.querySelector('.match-events');
                if (matchEvents) {
                    matchScreen.insertBefore(visualContainer, matchEvents);
                } else {
                    matchScreen.appendChild(visualContainer);
                }
            }
            
            // 유저 팀은 실제 스쿼드 배열로 변환, AI 팀은 베스트 11 사용
            const userSquadArray = [
                gameData.squad.gk,
                ...gameData.squad.df,
                ...gameData.squad.mf,
                ...gameData.squad.fw
            ].filter(p => p); // null 제거

            let homePlayers = gameData.isHomeGame ? userSquadArray : getBestEleven(gameData.currentOpponent);
            let awayPlayers = gameData.isHomeGame ? getBestEleven(gameData.currentOpponent) : userSquadArray;
            
            // AI 팀 데이터가 없을 경우 안전장치
            if (!homePlayers) homePlayers = [];
            if (!awayPlayers) awayPlayers = [];
            
            matchVisualizer.init('matchVisualizerContainer', homePlayers, awayPlayers);
        };
    }
    
    // displayEvent 함수 훅 (텍스트 중계 -> 비주얼라이저 명령)
    if (typeof window.displayEvent === 'function') {
        const originalDisplayEvent = window.displayEvent;
        
        window.displayEvent = function(event, matchData) {
            // 1. 기존 텍스트 중계 표시
            const result = originalDisplayEvent.apply(this, arguments);
            
            // 2. 비주얼라이저에 이벤트 전달
            // 텍스트 이벤트를 파싱하여 좌표 명령으로 변환
            // 예: "A가 B에게 패스" -> { type: 'pass', from: 'A', to: 'B' }
            const parsedEvent = parseTextEventToVisual(event);
            if (parsedEvent) {
                matchVisualizer.processMatchEvent(parsedEvent);
            }
            
            return result;
        };
    }

    // endMatch 함수 훅 (경기 종료 시 애니메이션 정지)
    if (typeof window.endMatch === 'function') {
        const originalEndMatch = window.endMatch;
        
        window.endMatch = function(matchData) {
            originalEndMatch.apply(this, arguments);
            matchVisualizer.stop();
        };
    }
});

// 텍스트 이벤트를 비주얼라이저용 데이터로 변환하는 헬퍼 함수
function parseTextEventToVisual(event) {
    // 1. 엔진에서 보낸 구조화된 데이터가 있으면 우선 사용
    if (event.from && event.to && event.type === 'pass') {
        return event;
    }
    if (event.scorer && event.type === 'goal') {
        return event;
    }
    if (event.shooter && (event.type === 'miss' || event.type === 'save' || event.type === 'block')) {
        return { ...event, type: 'shoot' };
    }
    if (event.player && event.type === 'dribble') {
        return event;
    }
    if (event.player && event.type === 'tackle') {
        return event;
    }

    // 2. 데이터가 없을 경우 (레거시 지원 또는 단순 텍스트 이벤트)
    return null;
}
