// c:\Users\jinuj\vsc\easyfmm\visibleMatch.js

class VisualUnit {
    constructor(id, name, role, positionType, teamType, startX, startY) {
        this.id = id;
        this.name = name;
        this.role = role;
        this.positionType = positionType;
        this.teamType = teamType; // 'home' or 'away'
        
        // 좌표 시스템: 0~100% (Percentage)
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        
        // 기본 위치 저장 (수비 복귀용)
        this.baseX = startX;
        this.baseY = startY;
        
        this.velocity = { x: 0, y: 0 };
        this.speed = 0.05;
        this.stamina = 100;
        
        this.radius = 2.5;
        this.color = this.teamType === 'home' ? '#e74c3c' : '#3498db';
        
        this.hasBall = false;
        this.isCelebrating = false;
        
        // [신규] 자연스러운 움직임을 위한 노이즈 오프셋
        this.noiseOffset = Math.random() * 100;

        // [신규] 수비 상태 관리
        this.defenseState = 'none'; // 'none', 'pressure', 'tackle'
        this.tackleTimer = 0;
    }

    update() {
        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        
        // [수정] 1. 물리 기반 관성 및 마찰력 도입
        // 가속도(Force) 계산: 타겟 방향으로 힘 작용
        const force = 0.04; 
        let ax = dx * force;
        let ay = dy * force;

        // 가속도 제한 (너무 빠른 반응 방지)
        const maxAccel = 0.15;
        const accelMag = Math.hypot(ax, ay);
        if (accelMag > maxAccel) {
            ax = (ax / accelMag) * maxAccel;
            ay = (ay / accelMag) * maxAccel;
        }

        // 속도에 가속도 적용
        this.velocity.x += ax;
        this.velocity.y += ay;

        // 마찰력 적용 (감속)
        const friction = 0.88; // 0.9에 가까울수록 미끄러짐, 낮을수록 뻑뻑함
        this.velocity.x *= friction;
        this.velocity.y *= friction;

        // 정지 조건 (타겟에 매우 가깝고 속도가 느릴 때)
        if (dist < 0.5 && Math.hypot(this.velocity.x, this.velocity.y) < 0.05) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.velocity.x = 0;
            this.velocity.y = 0;
        } else {
            const fatigueFactor = this.stamina < 30 ? 0.6 : 1.0;
            let maxSpeed = 0.7 * fatigueFactor; // 최대 속도 제한

            // [신규] 태클 시 속도 증가 (런지 효과)
            if (this.defenseState === 'tackle') {
                maxSpeed *= 1.8;
                // 태클 시 순간 가속 추가
                this.velocity.x += (dx / dist) * 0.2;
                this.velocity.y += (dy / dist) * 0.2;
            }
            
            // 최대 속도 캡 (Cap)
            const currentSpeed = Math.hypot(this.velocity.x, this.velocity.y);
            if (currentSpeed > maxSpeed) {
                this.velocity.x = (this.velocity.x / currentSpeed) * maxSpeed;
                this.velocity.y = (this.velocity.y / currentSpeed) * maxSpeed;
            }

            // 위치 업데이트
            this.x += this.velocity.x;
            this.y += this.velocity.y;
        }
        
        if (this.tackleTimer > 0) this.tackleTimer--;
    }

    draw(ctx, width, height) {
        const coords = matchVisualizer.getScreenCoords(this.x, this.y);
        const px = coords.x;
        const py = coords.y;
        
        const baseSize = matchVisualizer.isLandscape ? height : width;
        const r = Math.max(8, baseSize * 0.03); 

        // [수정] 5. 시각적 회전 처리 (이동 방향으로 회전)
        const angle = Math.atan2(this.velocity.y, this.velocity.x) + Math.PI / 2;

        ctx.save();
        
        // 회전 적용
        ctx.translate(px, py);
        ctx.rotate(angle);
        ctx.translate(-px, -py);

        if (this.stamina < 30) {
            ctx.globalAlpha = 0.6;
        }

        // 그림자 (회전하지 않도록 별도 처리하거나, 바둑알이라 무시 가능하지만 여기선 포함됨)
        // 바둑알은 원형이라 회전이 티가 안 날 수 있으므로, 방향 표시(삼각형) 추가 고려

        // 바둑알 본체 (0,0 기준이 아니라 px, py 기준)
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        
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
        
        // [신규] 방향 표시 (작은 삼각형)
        ctx.beginPath();
        ctx.moveTo(px, py - r + 2);
        ctx.lineTo(px - 3, py - r + 8);
        ctx.lineTo(px + 3, py - r + 8);
        ctx.fillStyle = 'rgba(255,255,255,0.8)';
        ctx.fill();
        
        // [신규] 태클 시 시각 효과 (밝은 테두리 + 강조)
        if (this.defenseState === 'tackle') {
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 3;
        } else {
            ctx.strokeStyle = 'rgba(255,255,255,0.8)';
        }
        ctx.lineWidth = 1.5;
        ctx.stroke();

        if (this.hasBall) {
            ctx.beginPath();
            ctx.arc(px, py, r + 4, 0, Math.PI * 2);
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }

        ctx.restore();
    }
}

class VisualBall {
    constructor(startX, startY) {
        this.x = startX;
        this.y = startY;
        this.targetX = startX;
        this.targetY = startY;
        this.owner = null;
        this.speed = 0.15;
        this.z = 0; // [추가] 공의 높이 (Z축)
        this.vz = 0; // [추가] 수직 속도
        this.isShooting = false; // [추가] 슈팅 상태 플래그
    }

    update() {
        if (this.owner) {
            // [수정] 1. 드리블 시 공의 위치를 '진행 방향 앞'으로 수정 (꽁무니 현상 해결)
            let offsetX = 0;
            let offsetY = 0;
            
            // 선수의 속도 벡터를 기반으로 공의 위치 계산
            const speed = Math.hypot(this.owner.velocity.x, this.owner.velocity.y);
            if (speed > 0.01) {
                // 이동 중: 진행 방향 앞쪽으로 오프셋 (약 3.0 거리)
                const factor = 3.0 / Math.max(speed, 0.1); 
                offsetX = this.owner.velocity.x * factor;
                offsetY = this.owner.velocity.y * factor;
            } else {
                // 정지 시: 팀 공격 방향 앞 (Home: 위, Away: 아래)
                offsetY = this.owner.teamType === 'home' ? -2.5 : 2.5;
            }

            this.x += (this.owner.x + offsetX - this.x) * 0.3; // Lerp 계수 0.5 -> 0.3 (더 부드럽게)
            this.y += (this.owner.y + offsetY - this.y) * 0.3;
            this.targetX = this.x;
            this.targetY = this.y;
            this.z = 0; // 드리블 중에는 땅에 붙음
            this.isShooting = false;
        } else {
            // 패스나 슈팅 중
            if (this.z > 0 || this.vz !== 0) {
                this.z += this.vz;
                this.vz -= 0.5; // 중력 적용
                if (this.z < 0) {
                    this.z = 0;
                    this.vz = -this.vz * 0.5; // 바닥 튀기기 (감쇠)
                    if (Math.abs(this.vz) < 1) this.vz = 0;
                }
            }
        }

        const dx = this.targetX - this.x;
        const dy = this.targetY - this.y;
        const dist = Math.hypot(dx, dy);
        
        if (!this.owner) {
            // [수정] 4. 슈팅 및 패스 속도의 '이징(Easing)' 적용
            if (dist < 0.5) {
                this.x = this.targetX;
                this.y = this.targetY;
                this.z = 0; this.vz = 0; // 정지 시 바운드 리셋
                this.isShooting = false; // [수정] 정지 시 슈팅 상태 해제
            } else {
                let moveSpeed;
                if (this.isShooting) {
                    // 슈팅: 거리에 비례한 속도 (멀수록 빠름) + 최소 속도 보장
                    moveSpeed = Math.max(1.0, dist * 0.12); 
                } else {
                    // [수정] 2. 패스 속도 물리 방식 적용 (등속 운동, 데굴데굴 효과)
                    moveSpeed = 0.8; 
                }
                
                const step = Math.min(dist, moveSpeed);
                this.x += (dx / dist) * step;
                this.y += (dy / dist) * step;
            }
        }
    }

    draw(ctx, width, height) {
        const coords = matchVisualizer.getScreenCoords(this.x, this.y);
        const px = coords.x;
        const py = coords.y;
        const baseSize = matchVisualizer.isLandscape ? height : width;
        const r = Math.max(4, baseSize * 0.015);
        
        // [추가] 그림자 (높이에 따라 작아지고 흐려짐)
        const shadowScale = Math.max(0.5, 1 - this.z / 50);
        ctx.beginPath();
        ctx.ellipse(px, py + r + (this.z * 0.5), r * shadowScale, r * 0.5 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${0.3 * shadowScale})`;
        ctx.fill();

        // [추가] 공 본체 (Z축 적용)
        const ballY = py - this.z; // 높이만큼 위로
        ctx.beginPath();
        ctx.arc(px, ballY, r + (this.z * 0.02), 0, Math.PI * 2); // [수정] 크기 변화 폭 축소 (0.05 -> 0.02)
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
        this.units = [];
        this.ball = null;
        this.animationId = null;
        this.isRunning = false;
        this.pitchColor = '#27ae60';
        this.lineColor = 'rgba(255,255,255,0.5)';
        this.width = 0;
        this.height = 0;
        this.isLandscape = false;
        
        // [신규] 이벤트 큐 시스템
        this.eventQueue = [];
        this.isProcessingEvent = false;
        this.eventDelayTimer = null;
        
        // [신규] 애니메이션 연출 중 일시 정지 플래그 (슛 등)
        this.isPausedForAnimation = false;

        // [신규] 전술 업데이트 타이머 (스로틀링용)
        this.tacticalUpdateTimer = 0;
    }

    init(containerId, homeTeamData, awayTeamData) {
        const container = document.getElementById(containerId);
        if (!container) return;

        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
        }

        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        this.setupUnits(homeTeamData, awayTeamData);
        this.ball = new VisualBall(50, 50);

        this.resize();
        window.addEventListener('resize', () => this.resize());

        this.isRunning = false;
        this.render();
    }

    stop() {
        this.isRunning = false;
        if (this.animationId) cancelAnimationFrame(this.animationId);
        if (this.eventDelayTimer) clearTimeout(this.eventDelayTimer);
        this.eventQueue = [];
        this.isProcessingEvent = false;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    resize() {
        if (!this.canvas) return;
        const parent = this.canvas.parentElement;
        const dpr = window.devicePixelRatio || 1;
        const rect = parent.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        this.canvas.style.width = `${rect.width}px`;
        this.canvas.style.height = `${rect.height}px`;
        this.ctx.scale(dpr, dpr);
        
        this.width = rect.width;
        this.height = rect.height;
        this.isLandscape = this.width > this.height;
        
        if (!this.isRunning) this.render();
    }

    setupUnits(homeData, awayData) {
        this.units = [];
        
        const createTeamUnits = (players, teamType) => {
            const gks = players.filter(p => p.position === 'GK');
            const dfs = players.filter(p => p.position === 'DF');
            const mfs = players.filter(p => p.position === 'MF');
            const fws = players.filter(p => p.position === 'FW');

            // 홈팀: 아래쪽(50~100), 어웨이팀: 위쪽(0~50)
            const yCoords = teamType === 'home' 
                ? { GK: 98, DF: 88, MF: 72, FW: 58 } // [수정] 라인 전체적으로 후퇴
                : { GK: 2,  DF: 12, MF: 28, FW: 42 }; // [수정] 라인 전체적으로 후퇴

            const placeLine = (linePlayers, y) => {
                const count = linePlayers.length;
                linePlayers.forEach((p, i) => { 
                    // [수정] 1. 포메이션 데이터 완벽 동기화
                    // formation.js에서 저장된 좌표(formationX, formationY)가 있다면 우선 사용
                    // [추가] p 객체에 없으면 gameData.squad에서 원본을 찾아 확인 (안전 장치)
                    let fX = p.formationX;
                    let fY = p.formationY;
                    
                    if (teamType === 'home' && (fX === undefined || fY === undefined)) {
                        // gameData.squad에서 이름으로 검색
                        const squad = gameData.squad;
                        const allSquad = [squad.gk, ...squad.df, ...squad.mf, ...squad.fw].filter(sp => sp);
                        const original = allSquad.find(sp => sp.name === p.name);
                        if (original) {
                            fX = original.formationX;
                            fY = original.formationY;
                        }
                    }

                    if (fX !== undefined && fY !== undefined) {
                        let role = 'BBM'; // 기본값
                        if (gameData.playerRoles && gameData.playerRoles[p.name]) {
                            role = gameData.playerRoles[p.name];
                        }
                        this.units.push(new VisualUnit(p.name, p.name, role, p.position, teamType, fX, fY));
                        return;
                    }

                    const x = (100 / (count + 1)) * (i + 1);
                    let role = 'BBM';
                    if (teamType === 'home' && gameData.playerRoles && gameData.playerRoles[p.name]) {
                        role = gameData.playerRoles[p.name];
                    } else {
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

    // [수정] 이벤트를 큐에 추가
    processMatchEvent(event) {
        if (!event) return;
        this.eventQueue.push(event);
    }

    // [신규] 이벤트 큐 처리 (애니메이션 루프에서 호출)
    updateEventQueue() {
        if (this.isProcessingEvent) return;
        if (this.eventQueue.length === 0) return;

        const event = this.eventQueue.shift();
        this.isProcessingEvent = true;

        // [신규] 텍스트 이벤트 동기화: 이벤트 처리 시점에 텍스트 표시
        if (event.domElement) {
            event.domElement.style.display = 'block';
            const eventList = document.getElementById('eventList');
            if (eventList) {
                 eventList.scrollTop = eventList.scrollHeight;
                 if (eventList.parentElement) eventList.parentElement.scrollTop = eventList.parentElement.scrollHeight;
            }
        }

        let delay = 500; // 기본 딜레이

        switch (event.type) {
            case 'pass': this.handlePass(event); delay = 800; break;
            case 'dribble': this.handleDribble(event); delay = 800; break;
            case 'shoot': 
                this.handleShoot(event); 
                delay = 2500; // [수정] 슛 애니메이션 시간 확보 (1.5초 -> 2.5초)
                break;
            case 'goal': 
                this.handleGoal(event); 
                delay = 3000; // 골 세리머니 시간
                break;
            case 'tackle': this.handleTackle(event); delay = 600; break;
            case 'save': this.handleSave(event); delay = 800; break;
            case 'block': this.handleBlock(event); delay = 800; break;
            // [신규] 텍스트 전용 이벤트 처리
            case 'kickoff':
                this.resetPositions(); // [수정] 킥오프 시 위치 및 상태 초기화
                this.ball.x = 50; this.ball.y = 50; // 공 중앙으로
                this.ball.owner = null;
                delay = 1000;
                break;
            case 'text_only':
            case 'foul':
            case 'injury':
            case 'substitution':
                delay = 1500;
                break;
        }

        this.eventDelayTimer = setTimeout(() => {
            this.isProcessingEvent = false;
            this.isPausedForAnimation = false; // [신규] 이벤트 처리 완료 시 일시 정지 해제
        }, delay);
    }

    handlePass(event) {
        const fromUnit = this.findUnit(event.from);
        const toUnit = this.findUnit(event.to);

        if (fromUnit && toUnit) {
            fromUnit.hasBall = false;
            this.ball.owner = null;
            this.ball.targetX = toUnit.x;
            this.ball.targetY = toUnit.y;
            
            toUnit.targetX = (toUnit.x + this.ball.x) / 2;
            toUnit.targetY = (toUnit.y + this.ball.y) / 2;

            const dist = Math.hypot(toUnit.x - fromUnit.x, toUnit.y - fromUnit.y);
            if (dist > 25) {
                this.ball.vz = 3 + Math.random(); // 롱패스는 공을 띄움
                this.ball.z = 1;
            }
            
            setTimeout(() => {
                toUnit.hasBall = true;
                this.ball.owner = toUnit;
            }, 500);
        }
    }

    handleGoal(event) {
        const scorer = this.findUnit(event.scorer);
        if (scorer) {
            scorer.hasBall = false; // [수정] 골 넣은 후 공 소유 해제 (얼음 방지)
            const cornerX = scorer.x < 50 ? 0 : 100;
            const cornerY = scorer.teamType === 'home' ? 0 : 100;
            
            scorer.targetX = cornerX;
            scorer.targetY = cornerY;
            scorer.isCelebrating = true;
            
            this.units.forEach(u => {
                if (u.teamType === scorer.teamType && u !== scorer) {
                    u.targetX = cornerX + (Math.random() * 20 - 10);
                    u.targetY = cornerY + (Math.random() * 20 - 10);
                }
            });

            // [수정] 1. 영원한 세리머니 버그 수정 (3초 후 복귀)
            setTimeout(() => {
                this.resetPositions();
            }, 3000);
        }
    }

    handleShoot(event) {
        const shooter = this.findUnit(event.shooter);
        if (shooter) {
            shooter.hasBall = false; // [수정] 슈팅 후 공 소유 해제 (얼음 방지)
            const isHome = shooter.teamType === 'home';
            const goalY = isHome ? 0 : 100;
            const goalX = 50;

            // [수정] 슈팅 위치 보정 없이 현재 위치에서 슈팅
            this.ball.owner = null;
            this.ball.x = shooter.x;
            this.ball.y = shooter.y;
            
            this.ball.targetX = goalX;
            this.ball.targetY = goalY;
            this.ball.isShooting = true;
            
            this.ball.vz = 1.5 + Math.random(); // [수정] 슈팅 탄도 낮춤 (순간이동 방지)
            this.ball.z = 0; // [수정] 2 -> 0 (갑작스러운 크기 변화 방지, vz로 자연스럽게 뜨도록)

            // [수정] 슈팅 시 선수가 움직이지 않도록 고정
            shooter.targetX = shooter.x;
            shooter.targetY = shooter.y;
            shooter.velocity = { x: 0, y: 0 };

            // [신규] 골인 경우 슈팅 후 세리머니 연결
            if (event.isGoal) {
                setTimeout(() => {
                    this.handleGoal(event);
                }, 1000); // 공이 날아가는 시간 고려
            }

            // this.isPausedForAnimation = true; // [수정] 얼음 현상 제거를 위해 주석 처리
        }
    }

    handleDribble(event) {
        const unit = this.findUnit(event.player);
        if (unit) {
            this.ball.owner = unit;
            unit.hasBall = true;
            const goalY = unit.teamType === 'home' ? 0 : 100;
            unit.targetY = unit.y + (goalY - unit.y) * 0.2;
            unit.targetX += (Math.random() - 0.5) * 15;
            unit.targetX = Math.max(5, Math.min(95, unit.targetX));
            unit.targetY = Math.max(5, Math.min(95, unit.targetY));
        }
    }

    handleTackle(event) {
        if (event.player) {
            const unit = this.findUnit(event.player);
            if (unit) {
                this.ball.owner = unit;
                unit.hasBall = true;
                unit.targetX = unit.x;
                unit.targetY = unit.y;
            }
        } else {
            this.ball.owner = null;
        }
    }

    handleSave(event) {
        const shooter = this.findUnit(event.shooter);
        const gkTeam = shooter ? (shooter.teamType === 'home' ? 'away' : 'home') : 'home';
        const gk = this.units.find(u => u.teamType === gkTeam && u.positionType === 'GK');
        
        if (gk) {
            this.ball.owner = null;
            this.ball.targetX = gk.x;
            this.ball.targetY = gk.y;
            setTimeout(() => {
                this.ball.owner = gk;
                gk.hasBall = true;
            }, 400);
        }
    }

    handleBlock(event) {
        const shooter = this.findUnit(event.shooter);
        const defTeam = shooter ? (shooter.teamType === 'home' ? 'away' : 'home') : 'home';
        const defenders = this.units.filter(u => u.teamType === defTeam && u.positionType === 'DF');
        let nearestDef = null;
        let minDist = Infinity;
        
        defenders.forEach(def => {
            const dist = Math.hypot(def.x - this.ball.x, def.y - this.ball.y);
            if (dist < minDist) {
                minDist = dist;
                nearestDef = def;
            }
        });

        if (nearestDef) {
            this.ball.owner = null;
            this.ball.targetX = nearestDef.x;
            this.ball.targetY = nearestDef.y;
            setTimeout(() => {
                this.ball.owner = nearestDef;
                nearestDef.hasBall = true;
            }, 400);
        }
    }

    // [신규] 선수 위치 및 상태 리셋 (골 직후, 킥오프 등)
    resetPositions() {
        this.units.forEach(unit => {
            unit.isCelebrating = false;
            unit.hasBall = false;
            unit.defenseState = 'none';
            unit.targetX = unit.baseX;
            unit.targetY = unit.baseY;
        });
        this.isPausedForAnimation = false;
    }

    calculateTeamShift(ballY, teamType) {
        // 공의 위치에 따라 팀 전체 라인을 올리거나 내림
        // Home (Red): Base 50-100. Ball at 0 -> Shift -40 (Move Up). Ball at 100 -> Shift 0.
        // Away (Blue): Base 0-50. Ball at 100 -> Shift +40 (Move Down). Ball at 0 -> Shift 0.

        if (teamType === 'home') {
            return -30 * (1 - ballY / 100); // [수정] 라인 이동 폭 축소 (40 -> 30)
        } else {
            return 30 * (ballY / 100); // [수정] 라인 이동 폭 축소 (40 -> 30)
        }
    }

    updateTacticalMovements() {
        if (!this.ball) return;
        if (this.ball.isShooting) return; // [수정] 슈팅 중일 때는 전술 움직임 일시 정지 (선수들이 공을 지켜봄)
        // if (this.isPausedForAnimation) return; // [수정] 얼음 현상 제거 (자연스러운 흐름 유지)

        // [수정] 3. 전술 업데이트 주기 조절 (Throttling)
        // 매 프레임 계산하지 않고 10프레임(약 0.16초)마다 타겟 갱신
        this.tacticalUpdateTimer++;
        if (this.tacticalUpdateTimer < 10) return;
        this.tacticalUpdateTimer = 0;

        const ballX = this.ball.x;
        const ballY = this.ball.y;
        const ballOwnerTeam = this.ball.owner ? this.ball.owner.teamType : null;
        
        const homeShift = this.calculateTeamShift(ballY, 'home');
        const awayShift = this.calculateTeamShift(ballY, 'away');

        // [신규] 수비 시 가장 가까운 선수 찾기 (우르르 몰려다님 방지)
        let nearestDefender = null;
        let minDist = Infinity;
        
        if (ballOwnerTeam) {
            const defendingTeam = ballOwnerTeam === 'home' ? 'away' : 'home';
            this.units.forEach(u => {
                if (u.teamType === defendingTeam && u.positionType !== 'GK') {
                    const d = Math.hypot(u.x - ballX, u.y - ballY);
                    if (d < minDist) {
                        minDist = d;
                        nearestDefender = u;
                    }
                }
            });
        }

        this.units.forEach(unit => {
            if (unit.isCelebrating) return;

            // [수정] 골키퍼 위치 고정 (골대 근처에서 좌우로만 살짝 이동)
            if (unit.positionType === 'GK') {
                const goalY = unit.teamType === 'home' ? 98 : 2; 
                unit.targetX = 50 + (ballX - 50) * 0.15; 
                unit.targetY = goalY;
                return;
            }

            const teamShift = unit.teamType === 'home' ? homeShift : awayShift;
            let baseX = unit.baseX;
            let baseY = unit.baseY + teamShift;

            const isNearest = (unit === nearestDefender);
            const roleVector = this.getRoleVector(unit, ballX, ballY, ballOwnerTeam, isNearest);
            
            let destX = baseX + roleVector.x;
            let destY = baseY + roleVector.y;
            
            // [신규] 이벤트 주체가 아니어도 움직이게 (숨쉬기 효과)
            const time = Date.now() * 0.001;
            const noiseX = Math.sin(time + unit.noiseOffset) * 2;
            const noiseY = Math.cos(time + unit.noiseOffset * 0.5) * 2;
            
            destX += noiseX;
            destY += noiseY;

            destX = Math.max(2, Math.min(98, destX));
            destY = Math.max(2, Math.min(98, destY));
            
            unit.targetX = destX;
            unit.targetY = destY;
        });
    }

    getRoleVector(unit, ballX, ballY, ballOwnerTeam, isNearestDefender) {
        const vector = { x: 0, y: 0 };
        const isAttacking = unit.teamType === ballOwnerTeam;
        const isHome = unit.teamType === 'home';
        const forwardDir = isHome ? -1 : 1; 

        unit.defenseState = 'none'; // 기본 상태 초기화

        // [신규] 공 소유 시 전진 로직 (자석 로직 무시)
        if (unit.hasBall) {
            vector.y = forwardDir * 40; // 골대 방향으로 강하게 전진
            return vector;
        }

        if (isAttacking) {
            // [수정] 공격 시 우르르 몰려가지 않도록 기본 대형 유지
            // 공이 있는 쪽으로 약간만 쏠림 (전체 대형의 20% 정도만 이동)
            const formationShiftX = (ballX - 50) * 0.15; // [수정] 0.2 -> 0.15 (쏠림 완화)
            vector.x = formationShiftX;

            // [신규] 3. 빌드업 지원(Support) 로직 추가
            // 공을 가지지 않은 주변 동료들이 패스를 받기 위해 접근
            if (!unit.hasBall) {
                const distToBall = Math.hypot(unit.x - ballX, unit.y - ballY);
                // 지원 거리 (10 ~ 40) 내에 있으면 공 쪽으로 이동
                if (distToBall < 40 && distToBall > 10) {
                    vector.x += (ballX - unit.x) * 0.08;
                    vector.y += (ballY - unit.y) * 0.08;
                }
            }

            // [수정] 풀백 오버래핑 로직
            if (['FB', 'WB', 'CWB', 'IWB'].includes(unit.role)) {
                const inAttackingHalf = isHome ? ballY < 50 : ballY > 50;
                if (inAttackingHalf) {
                    // 공격 진영에서는 과감하게 전진 (오버래핑)
                    vector.y = forwardDir * 25; 
                    if (unit.role === 'IWB') {
                        vector.x = (50 - unit.x) * 0.3; // 중앙으로 좁힘
                    } else {
                        const side = unit.x < 50 ? 5 : 95;
                        vector.x = (side - unit.x) * 0.1; // 측면 벌림
                    }
                } else {
                    vector.y = forwardDir * 10; // 빌드업 지원
                }
            } else {
                // 역할별 오프 더 볼 움직임 (기본 위치 기준)
                switch (unit.role) {
                    case 'AF': vector.y = forwardDir * 15; break;
                    case 'CF': vector.y = forwardDir * 12; vector.x = (50 - unit.x) * 0.05; break;
                    case 'P': 
                        const targetY = isHome ? 10 : 90;
                        vector.y = (targetY - unit.y) * 0.2; 
                        break; // [수정] 2. 회귀 본능 강화: 역할별 로직이 없으면 기본적으로 0,0 반환하여 baseX, baseY로 복귀
                    case 'DLF': vector.y = -forwardDir * 2; break;
                    case 'TM': vector.y = forwardDir * 8; break;
                    case 'F9': vector.y = -forwardDir * 5; break;
                    case 'PF': vector.x = (ballX - unit.x) * 0.2; vector.y = forwardDir * 10; break;
                    case 'RD': vector.x = (50 - unit.x) * 0.15; vector.y = forwardDir * 10; break;
                    case 'W': 
                        const sideW = unit.x < 50 ? 5 : 95;
                        vector.x = (sideW - unit.x) * 0.1;
                        vector.y = forwardDir * 10;
                        break;
                    case 'IF': vector.x = (50 - unit.baseX) * 0.2; vector.y = forwardDir * 12; break; // unit.x -> unit.baseX (기준점 고정)
                    case 'BBM': vector.y = forwardDir * 8; vector.x += (ballX - unit.baseX) * 0.3; break; // 공 쪽으로 좀 더 이동
                    case 'MEZ': 
                        const targetX_MEZ = unit.x < 50 ? 25 : 75;
                        vector.x = (targetX_MEZ - unit.x) * 0.1;
                        vector.y = forwardDir * 10;
                        break;
                    case 'DLP': vector.y = -forwardDir * 3; break;
                    case 'BWM': vector.x = (ballX - unit.x) * 0.15; vector.y = forwardDir * 2; break;
                    case 'AP': vector.y = forwardDir * 10; vector.x += (ballX - unit.baseX) * 0.2; break;
                    case 'REG': vector.y = -forwardDir * 1; break;
                    case 'CAR': 
                        const sideCAR = unit.x < 50 ? 20 : 80;
                        vector.x = (sideCAR - unit.baseX) * 0.1;
                        break;
                    case 'EG': vector.x = 0; vector.y = 0; break;
                    case 'SS': vector.y = forwardDir * 12; vector.x = (ballX - unit.x) * 0.1; break;
                    case 'LIB': vector.y = forwardDir * 6; break;
                    case 'BPD': vector.y = forwardDir * 4; break;
                    case 'NCB': vector.y = -forwardDir * 2; break;
                    default: 
                        // 기본적으로 대형 유지 (vector 0,0)
                        break;
                }
            }
        } else {
            const distToBall = Math.hypot(unit.x - ballX, unit.y - ballY);
            const isDangerZone = isHome ? (ballY > 60) : (ballY < 40);

            // [수정] 수비 로직: 가장 가까운 선수만 압박 (나머지는 대형 유지)
            if (isNearestDefender) { 
                // 1. 능력치 가져오기 (DNA 연동)
                let defenseStat = 50;
                let mobilityStat = 50;
                
                // 유저 팀인지 확인
                const isUserTeam = (unit.teamType === 'home' && gameData.isHomeGame) || (unit.teamType === 'away' && !gameData.isHomeGame);
                
                if (isUserTeam && gameData.lineStats) {
                    let line = 'defense';
                    if (unit.positionType === 'MF') line = 'midfield';
                    else if (unit.positionType === 'FW') line = 'attack';
                    
                    defenseStat = gameData.lineStats[line].stats.defense || 50;
                    mobilityStat = gameData.lineStats[line].stats.speed || 50;
                }

                // 2. 태클 트리거 (거리가 가깝고 쿨타임이 없을 때)
                if (distToBall < 5 && unit.tackleTimer === 0) {
                    // 태클 시도 확률 (수비 능력치 비례)
                    if (Math.random() < (defenseStat / 2000)) { 
                        unit.defenseState = 'tackle';
                        unit.tackleTimer = 60; // 쿨타임 (약 1초)
                    }
                }

                if (unit.defenseState === 'tackle') {
                    // 태클: 공을 향해 돌진 (기동력 비례 속도는 update에서 처리됨)
                    vector.x = (ballX - unit.x); // 상대 위치로 직행 (baseX 무시를 위해 상대좌표 계산 필요하지만 여기선 offset 방식이므로)
                    // getRoleVector는 offset을 반환하므로: Target - Base
                    vector.x = ballX - unit.baseX;
                    vector.y = ballY - unit.baseY;
                } else {
                    // 압박: 공 소유자와 골대 사이 길목 차단 (거리 유지)
                    // [수정] 3. 압박(Pressure) 시퀀스 구현 (진로 차단)
                    unit.defenseState = 'pressure';
                    const goalX = 50;
                    const goalY = isHome ? 100 : 0; // 수비해야 할 골대
                    
                    // 공에서 골대로 향하는 벡터 (수비수가 막아야 할 길목)
                    const bgDx = goalX - ballX;
                    const bgDy = goalY - ballY;
                    const bgDist = Math.hypot(bgDx, bgDy);
                    
                    // 공 앞 10% 지점 (압박 위치) - 상대의 이동 경로 앞
                    const pressureDist = 10; 
                    
                    // 공 소유자의 이동 예측 (velocity가 있다면 반영)
                    // 여기서는 단순화하여 골대 방향 길목을 선점
                    const targetX = ballX + (bgDx / bgDist) * pressureDist; 
                    const targetY = ballY + (bgDy / bgDist) * pressureDist;

                    vector.x = (targetX - unit.baseX);
                    vector.y = (targetY - unit.baseY);
                }
            } else if (isDangerZone) {
                const goalY = isHome ? 100 : 0; // 내 골대
                let defenseAggression = 0.3;
                if (['BWM', 'NCB', 'PF', 'CB'].includes(unit.role)) defenseAggression = 0.5;
                else if (['CWB', 'WB', 'P', 'EG'].includes(unit.role)) defenseAggression = 0.15;

                const targetDefX = ballX + (50 - ballX) * 0.2; // 공과 중앙 사이
                const targetDefY = ballY + (goalY - ballY) * defenseAggression;
                
                // 수비 라인 조절은 calculateTeamShift에서 처리하므로 여기선 미세 조정만
                // vector.y = 0; // 기본적으로 라인 유지
            }
        }
        return vector;
    }

    getScreenCoords(x, y) {
        if (this.isLandscape) {
            return {
                x: (1 - y / 100) * this.width,
                y: (x / 100) * this.height
            };
        } else {
            return {
                x: (x / 100) * this.width,
                y: (y / 100) * this.height
            };
        }
    }

    findUnit(name) {
        return this.units.find(u => u.name === name);
    }

    animate() {
        if (!this.isRunning) return;

        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawPitch();

        // [신규] 이벤트 큐 처리
        this.updateEventQueue();

        // [신규] 매 프레임 전술 움직임 업데이트 (자연스러운 움직임)
        this.updateTacticalMovements();

        this.units.sort((a, b) => a.y - b.y);
        this.units.forEach(unit => {
            unit.update();
            unit.draw(this.ctx, this.width, this.height);
        });

        this.ball.update();
        this.ball.draw(this.ctx, this.width, this.height);

        this.animationId = requestAnimationFrame(() => this.animate());
    }

    render() {
        if (!this.ctx) return;
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawPitch();
        
        this.units.sort((a, b) => a.y - b.y);
        this.units.forEach(unit => {
            unit.draw(this.ctx, this.width, this.height);
        });

        if (this.ball) {
            this.ball.draw(this.ctx, this.width, this.height);
        }
    }

    drawPitch() {
        this.ctx.fillStyle = this.pitchColor;
        this.ctx.fillRect(0, 0, this.width, this.height);
        this.ctx.strokeStyle = this.lineColor;
        this.ctx.lineWidth = 2;

        if (this.isLandscape) {
            this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
            this.ctx.beginPath();
            this.ctx.moveTo(this.width / 2, 10);
            this.ctx.lineTo(this.width / 2, this.height - 10);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.height * 0.15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            const boxWidth = this.width * 0.15;
            const boxHeight = this.height * 0.5;
            this.ctx.strokeRect(10, (this.height - boxHeight) / 2, boxWidth, boxHeight);
            this.ctx.strokeRect(this.width - 10 - boxWidth, (this.height - boxHeight) / 2, boxWidth, boxHeight);
        } else {
            this.ctx.strokeRect(10, 10, this.width - 20, this.height - 20);
            this.ctx.beginPath();
            this.ctx.moveTo(10, this.height / 2);
            this.ctx.lineTo(this.width - 10, this.height / 2);
            this.ctx.stroke();
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.width * 0.15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            const boxWidth = this.width * 0.5;
            const boxHeight = this.height * 0.15;
            this.ctx.strokeRect((this.width - boxWidth) / 2, 10, boxWidth, boxHeight);
            this.ctx.strokeRect((this.width - boxWidth) / 2, this.height - 10 - boxHeight, boxWidth, boxHeight);
        }
    }
}

const matchVisualizer = new MatchVisualizer();
window.matchVisualizer = matchVisualizer;

document.addEventListener('DOMContentLoaded', () => {
    if (typeof window.startMatch === 'function') {
        const originalStartMatch = window.startMatch;
        window.startMatch = function() {
            originalStartMatch.apply(this, arguments);
            
            let visualContainer = document.getElementById('matchVisualizerContainer');
            if (!visualContainer) {
                const matchScreen = document.getElementById('matchScreen');
                visualContainer = document.createElement('div');
                visualContainer.id = 'matchVisualizerContainer';
                visualContainer.style.cssText = 'width: 100%; height: 60vh; margin-bottom: 20px; position: relative;';
                
                const matchEvents = matchScreen.querySelector('.match-events');
                if (matchEvents) {
                    matchScreen.insertBefore(visualContainer, matchEvents);
                } else {
                    const header = matchScreen.querySelector('.match-header');
                    if (header) {
                        matchScreen.insertBefore(visualContainer, header.nextSibling);
                    } else {
                        matchScreen.prepend(visualContainer);
                    }
                }
            }
            
            const userSquadArray = [
                gameData.squad.gk,
                ...gameData.squad.df,
                ...gameData.squad.mf,
                ...gameData.squad.fw
            ].filter(p => p);

            let homePlayers = gameData.isHomeGame ? userSquadArray : getBestEleven(gameData.currentOpponent);
            let awayPlayers = gameData.isHomeGame ? getBestEleven(gameData.currentOpponent) : userSquadArray;
            
            if (!homePlayers) homePlayers = [];
            if (!awayPlayers) awayPlayers = [];
            
            matchVisualizer.init('matchVisualizerContainer', homePlayers, awayPlayers);
            
            setTimeout(() => matchVisualizer.resize(), 100);
        };
    }
    
    if (typeof window.displayEvent === 'function') {
        const originalDisplayEvent = window.displayEvent;
        window.displayEvent = function(event, matchData) {
            // 1. DOM 요소 생성 (화면에는 아직 표시하지 않음)
            const eventCard = originalDisplayEvent.apply(this, arguments);
            if (eventCard) eventCard.style.display = 'none';

            // 2. 시각화 이벤트 파싱 또는 더미 이벤트 생성
            let visualEvent = parseTextEventToVisual(event);
            if (!visualEvent) {
                visualEvent = { ...event, type: 'text_only' };
            }
            
            // 3. DOM 요소 연결 및 큐 등록
            visualEvent.domElement = eventCard;
            matchVisualizer.processMatchEvent(visualEvent);

            // 4. 킥오프 시 애니메이션 시작
            if (event.type === 'kickoff') {
                matchVisualizer.start();
            }
            return eventCard;
        };
    }

    if (typeof window.endMatch === 'function') {
        const originalEndMatch = window.endMatch;
        window.endMatch = function(matchData) {
            originalEndMatch.apply(this, arguments);
            matchVisualizer.stop();
        };
    }
});

function parseTextEventToVisual(event) {
    if (event.from && event.to && event.type === 'pass') {
        return event;
    }
    if (event.scorer && event.type === 'goal') {
        return { ...event, type: 'shoot', isGoal: true, shooter: event.scorer };
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
    return null;
}
