// visibleMatch.js

class VisualUnit {
    constructor(id, name, teamType, x, y, color) { // [수정] color 인자 추가
        this.id = id;
        this.name = name;
        this.teamType = teamType;
        
        // 현재 렌더링 위치
        this.x = x; 
        this.y = y;
        
        // 목표 위치 (엔진에서 받음)
        this.targetX = x;
        this.targetY = y;

        this.hasBall = false;
        this.skillEffectTimer = 0; // 개인기 효과 타이머
        this.activeSkillId = null; // 현재 진행 중인 개인기 ID
        this.color = color || (teamType === 'home' ? '#e74c3c' : '#3498db'); // [수정] 전달받은 컬러 사용
        this.pulse = 0; // [신규] 공 소유 시 강조 애니메이션용
        this.stamina = 100; // [신규] 실시간 체력 표시용
    }

    //  [FLR 이식] 어댑티브 거리 기반 부드러운 가감속 보간 (달리기 반응성 개선)
    update() {
        const d = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        const lerpFactor = d > 8 ? 0.38 : (d > 3 ? 0.28 : 0.20); 
        this.x += (this.targetX - this.x) * lerpFactor;
        this.y += (this.targetY - this.y) * lerpFactor;

        // [신규] 공 소유 시 맥동 효과를 위한 타이머 업데이트
        if (this.hasBall) {
            this.pulse += 0.12;
        } else {
            this.pulse = 0;
        }

        if (this.skillEffectTimer > 0) {
            this.skillEffectTimer--;
            if (this.skillEffectTimer === 0) this.activeSkillId = null;
        }
    }

    draw(ctx, width, height) {
        // 좌표 변환 (0~100 -> 픽셀)
        const isPortrait = height > width;
        let px, py;
        if (isPortrait) {
            // 세로 모드: 홈팀(X=0)이 아래(Bottom)에서 시작해서 위(Top)로 공격
            px = (this.y / 100) * width;
            py = height - (this.x / 100) * height;
        } else {
            px = (this.x / 100) * width;
            py = (this.y / 100) * height;
        }
        const scale = Math.min(width, height);
        let r = Math.max(4, scale * 0.015);
        let rotation = 0;

        // [신규] 개인기별 특수 모션 계산
        if (this.skillEffectTimer > 0 && this.activeSkillId) {
            const progress = 1 - (this.skillEffectTimer / 45); // 0.0 ~ 1.0
            
            ctx.save();
            ctx.shadowBlur = 15;
            ctx.shadowColor = this.activeSkillId === 'TACKLE' ? "#ff3333" : "#f1c40f"; // 태클은 붉은색 강렬한 이펙트, 개인기는 황금색
            r *= (this.activeSkillId === 'TACKLE' ? 1.1 : 1.2);

            switch(this.activeSkillId) {
                case 'TACKLE':
                    // 깊게 들어가는 슬라이딩 태클 모션 (돌진)
                    const slideDist = Math.sin(progress * Math.PI) * (r * 3.5);
                    px += (this.teamType === 'home' ? slideDist : -slideDist);
                    break;
                case 'MARSEILLE_TURN':
                case 'ROULETTE':
                    // 한 바퀴 돌기 (360도 회전)
                    rotation = progress * Math.PI * 2;
                    break;
                case 'ELASTICO':
                    // 좌우로 쉭쉭 (지그재그 오프셋)
                    px += Math.sin(progress * Math.PI * 4) * (r * 1.5);
                    break;
                case 'LA_CROQUETA':
                    // 왼쪽/오른쪽 후 앞으로 (사이드 스텝)
                    const sideStep = (progress < 0.5) ? (progress * 2) * (r * 2) : (r * 2);
                    const forwardStep = (progress >= 0.5) ? ((progress - 0.5) * 2) * (r * 2) : 0;
                    py += sideStep;
                    px += (this.teamType === 'home' ? forwardStep : -forwardStep);
                    break;
                default:
                    // 기타 기술은 진동 효과
                    px += (Math.random() - 0.5) * 5;
                    py += (Math.random() - 0.5) * 5;
            }
        }

        ctx.save();
        ctx.translate(px, py);
        ctx.rotate(rotation);

        ctx.beginPath();
        ctx.arc(0, 0, r, 0, Math.PI * 2);
        
        // [수정] 2가지 색상일 경우 줄무늬(Stripes) 처리
        if (Array.isArray(this.color)) {
            ctx.save();
            ctx.clip(); // 원형으로 클리핑
            
            // 배경색 (색상 1)
            ctx.fillStyle = this.color[0];
            ctx.fillRect(-r, -r, r * 2, r * 2);
            
            // 줄무늬 (색상 2) - 중앙에 세로 줄무늬
            ctx.fillStyle = this.color[1];
            ctx.fillRect(-r / 3, -r, 2 * r / 3, r * 2);
            
            ctx.restore();
        } else {
            ctx.fillStyle = this.color;
            ctx.fill();
        }

        // [추가] 시인성을 위한 테두리 (흰색 유니폼 등을 위해)
        ctx.beginPath(); 
        ctx.arc(0, 0, r, 0, Math.PI * 2); // px, py 대신 0, 0 사용
        ctx.strokeStyle = 'rgba(0,0,0,0.3)';
        ctx.lineWidth = 1;
        ctx.stroke();
        
        // [수정] 공을 가진 선수 강조 효과 강화 (Pulsing Halo + Neon Glow)
        if (this.hasBall) {
            ctx.save();
            // 1. 외부 맥동하는 고리 (확장했다 수축했다 함)
            const pulseScale = 1.3 + Math.sin(this.pulse) * 0.3;
            ctx.beginPath();
            ctx.arc(0, 0, r * pulseScale, 0, Math.PI * 2);
            ctx.strokeStyle = 'rgba(241, 196, 15, 0.4)';
            ctx.lineWidth = 2;
            ctx.stroke();

            // 2. 본체 강한 발광 효과
            ctx.shadowBlur = 15 + Math.sin(this.pulse) * 5;
            ctx.shadowColor = '#f1c40f';
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 4;
            ctx.beginPath();
            ctx.arc(0, 0, r + 1, 0, Math.PI * 2);
            ctx.stroke();
            ctx.restore();
        }

        // [신규] 인게임 실시간 체력 게이지 (바둑돌 하단 체력바 + 체력 링)
        const stam = Math.max(0, Math.min(100, Number.isFinite(this.stamina) ? this.stamina : 100));
        const stamColor = stam < 45 ? '#ef4444' : (stam < 72 ? '#f59e0b' : '#22c55e');

        if (stam < 96) {
            ctx.save();
            ctx.beginPath();
            const startAngle = -Math.PI / 2;
            const endAngle = startAngle + (Math.PI * 2 * (stam / 100));
            ctx.arc(0, 0, r + 2.5, startAngle, endAngle);
            ctx.strokeStyle = stamColor;
            ctx.lineWidth = 2.2;
            ctx.lineCap = 'round';
            ctx.stroke();
            ctx.restore();
        }

        // 바둑돌 바로 아래 가로형 미니 체력바
        const barW = 24;
        const barH = 3.2;
        const barX = -barW / 2;
        const barY = r + 3;
        ctx.save();
        ctx.fillStyle = 'rgba(0, 0, 0, 0.65)';
        ctx.fillRect(barX - 0.5, barY - 0.5, barW + 1, barH + 1);
        ctx.fillStyle = stamColor;
        ctx.fillRect(barX, barY, barW * (stam / 100), barH);
        ctx.restore();

        // [신규] 선수 이름 표시 (체력바 아래)
        ctx.font = 'bold 10px sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        
        // 텍스트 외곽선 (translate 외부 좌표계 기준이므로 px, py 유지)
        ctx.lineWidth = 2.5;
        ctx.strokeStyle = 'rgba(0,0,0,0.7)';
        ctx.strokeText(this.name, 0, r + 8);
        
        // 텍스트 채우기
        ctx.fillStyle = '#ffffff';
        ctx.fillText(this.name, 0, r + 8);

        ctx.restore(); // 회전/이동 컨텍스트 복구

        if (this.skillEffectTimer > 0) {
            ctx.restore(); // 개인기 발광 효과 컨텍스트 복구
        }
    }

    // [신규] 개인기 시각 효과 트리거
    triggerSkillEffect(skillId) {
        this.skillEffectTimer = 45; // 약 0.7초 유지
        this.activeSkillId = skillId;
    }
}

class VisualBall {
    constructor() {
        this.x = 50; this.y = 50;
        this.z = 0; // [FLR 물리 이식] 실제 3D 포물선 높이
        this.targetX = 50; this.targetY = 50;
        this.targetZ = 0;
        this.accelFactor = 0.25; // 60ms 틱 간격을 60FPS(16ms)에서 부드럽게 글라이딩
        this.state = 0; // 공 상태
    }
    update(units) {
        // [FLR 이식] 드리블 시 볼 캐리어 발밑에 100% 동기화 (프레임 단위 뚝뚝 끊김 완전 제거)
        if (this.state === 1 && units) {
            const carrier = Object.values(units).find(u => u.hasBall);
            if (carrier) {
                this.x = carrier.x;
                this.y = carrier.y;
                this.z = 0;
                return;
            }
        }
        // [FLR 물리 이식] 패스/슈팅 비행 시 부드러운 연속 글라이딩 보간 (뚝뚝 끊김 완전 해결)
        const d = Math.hypot(this.targetX - this.x, this.targetY - this.y);
        if (d > 28) {
            // 킥오프, 리셋 등 대규모 좌표 이동 시 즉시 이동
            this.x = this.targetX;
            this.y = this.targetY;
            this.z = this.targetZ;
            return;
        }
        const factor = this.accelFactor || 0.35;
        this.x += (this.targetX - this.x) * factor;
        this.y += (this.targetY - this.y) * factor;
        this.z += (this.targetZ - this.z) * factor;
    }
    draw(ctx, width, height) {
        const isPortrait = height > width;
        let px, py;
        if (isPortrait) {
            px = (this.y / 100) * width;
            py = height - (this.x / 100) * height;
        } else {
            px = (this.x / 100) * width;
            py = (this.y / 100) * height;
        }
        
        const scale = Math.min(width, height);
        const r = Math.max(2.5, scale * 0.010); 
        
        // [FLR 물리 이식] 입체 그림자 (고도가 높을수록 그림자가 옅어지고 자연스럽게 번짐)
        const shadowScale = 1 + (this.z * 0.04);
        const shadowAlpha = Math.max(0.06, 0.35 - (this.z * 0.022));
        ctx.beginPath();
        ctx.ellipse(px, py + r * 0.5, r * 0.8 * shadowScale, r * 0.4 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.fill();

        // [FLR 물리 이식] 공 본체 높이 적용 (포물선 궤적)
        const visualY = py - (this.z * (height / 100) * 0.85);

        ctx.beginPath();
        ctx.arc(px, visualY, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
        ctx.lineWidth = 1.5;
        ctx.stroke();
    }
}

class MatchVisualizer {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.units = {}; // ID로 관리
        this.ball = new VisualBall();
        this.isRunning = false;
        this.width = 0;
        this.height = 0;
        this.storedSpeed = null; // [신규] 패스 딜레이 대응을 위한 속도 저장
        this.grassPattern = null; // [신규] 잔디 텍스처 패턴
    }

    createGrassPattern() {
        const size = 128;
        const cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        const ctx = cvs.getContext('2d');
        
        // 노이즈 추가
        ctx.fillStyle = 'rgba(0, 0, 0, 0.04)'; // 은은한 텍스처
        for (let i = 0; i < 600; i++) {
            ctx.fillRect(Math.random() * size, Math.random() * size, 2, 2);
        }
        
        return this.ctx.createPattern(cvs, 'repeat');
    }

    init(containerId, initialPlayers, teamColors) { // [수정] teamColors 인자 추가
        // 캔버스 셋업 (기존과 동일)
        const container = document.getElementById(containerId);
        if (!container) return;
        
        // 캔버스 재생성 방지
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            container.appendChild(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        
        // [수정] 팀 컬러 저장
        this.teamColors = teamColors || {};

        // 유닛 생성
        this.units = {};
        initialPlayers.forEach(p => {
            const color = this.teamColors[p.teamId];
            this.units[p.id] = new VisualUnit(p.id, p.name, p.teamId, p.x, p.y, color);
        });

        this.resize();
        this.start();
    }

    // 엔진에서 온 데이터로 동기화
    sync(snapshot) {
        // 1) 선수 위치 업데이트
        snapshot.players.forEach(pData => {
            const unit = this.units[pData.id];
            if (unit) {
                unit.targetX = pData.x;
                unit.targetY = pData.y;
                unit.hasBall = pData.hasBall;
                if (pData.stamina !== undefined) unit.stamina = pData.stamina;
            }
        });

        // 2) [FLR 이식] 공 상태 및 탄도학 동기화
        this.ball.state = snapshot.ball.state; // 0:DEAD, 1:CONTROLLED, 2:IN_FLIGHT, 3:LOOSE

        if (snapshot.ball.state === 1) { 
            // CONTROLLED (드리블) - 볼 캐리어 발밑에 100% 동기화하여 발밑 이탈/끊김 완전 방지
            const carrierUnit = Object.values(this.units).find(u => u.hasBall);
            if (carrierUnit) {
                this.ball.x = carrierUnit.x;
                this.ball.y = carrierUnit.y;
                this.ball.z = 0;
                this.ball.targetX = carrierUnit.targetX;
                this.ball.targetY = carrierUnit.targetY;
                this.ball.targetZ = 0;
                this.ball.accelFactor = 1.0;
            } else {
                this.ball.targetX = snapshot.ball.x;
                this.ball.targetY = snapshot.ball.y;
                this.ball.targetZ = 0;
                this.ball.accelFactor = 0.40;
            }
        } else if (snapshot.ball.state === 2) { 
            // IN_FLIGHT (패스, 슛, 롱볼) - 60ms 틱 사이를 16ms 프레임으로 매끄럽고 부드럽게 글라이딩
            this.ball.accelFactor = 0.38; 
            this.ball.targetX = snapshot.ball.x;
            this.ball.targetY = snapshot.ball.y;
            this.ball.targetZ = Number.isFinite(snapshot.ball.z) ? snapshot.ball.z : 0;
        } else {
            // LOOSE / DEAD - 자연스러운 지면 감속
            this.ball.accelFactor = 0.28;
            this.ball.targetX = snapshot.ball.x;
            this.ball.targetY = snapshot.ball.y;
            this.ball.targetZ = 0;
        }
    }

    resize() {
        if (!this.canvas) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        this.canvas.width = rect.width;
        this.canvas.height = rect.height;
        this.width = rect.width;
        this.height = rect.height;
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.animate();
        }
    }

    animate() {
        if (!this.isRunning) return;
        
        this.ctx.clearRect(0, 0, this.width, this.height);
        this.drawPitch();

        // 업데이트 & 그리기
        Object.values(this.units).forEach(u => {
            u.update();
            u.draw(this.ctx, this.width, this.height);
        });
        this.ball.update(this.units);
        this.ball.draw(this.ctx, this.width, this.height);

        requestAnimationFrame(() => this.animate());
    }

    drawPitch() {
        const numStripes = 12;
        const isPortrait = this.height > this.width;
        
        // [수정] 잔디 줄무늬 패턴 적용 (가로/세로 방향 맞춤)
        if (isPortrait) {
            const stripeHeight = this.height / numStripes;
            for (let i = 0; i < numStripes; i++) {
                this.ctx.fillStyle = i % 2 === 0 ? '#27ae60' : '#2ecc71';
                this.ctx.fillRect(0, i * stripeHeight, this.width, stripeHeight + 1);
            }
        } else {
            const stripeWidth = this.width / numStripes;
            for (let i = 0; i < numStripes; i++) {
                this.ctx.fillStyle = i % 2 === 0 ? '#27ae60' : '#2ecc71';
                this.ctx.fillRect(i * stripeWidth, 0, stripeWidth + 1, this.height);
            }
        }

        // [신규] 잔디 텍스처 오버레이
        if (!this.grassPattern) this.grassPattern = this.createGrassPattern();
        this.ctx.fillStyle = this.grassPattern;
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.strokeStyle = '#ffffff';
        this.ctx.lineWidth = 2;
        
        // 테두리
        this.ctx.strokeRect(this.width * 0.05, this.height * 0.05, this.width * 0.9, this.height * 0.9);
        
        if (isPortrait) {
            // 중앙선 (가로)
            this.ctx.beginPath();
            this.ctx.moveTo(this.width * 0.05, this.height / 2);
            this.ctx.lineTo(this.width * 0.95, this.height / 2);
            this.ctx.stroke();
            
            // 센터 서클
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.width * 0.15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 페널티 박스 (상하)
            this.ctx.strokeRect(this.width * 0.25, this.height * 0.05, this.width * 0.5, this.height * 0.15);
            this.ctx.strokeRect(this.width * 0.25, this.height * 0.8, this.width * 0.5, this.height * 0.15);

            // 골대 그리기 (상하)
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.width * 0.44, this.height * 0.02, this.width * 0.12, this.height * 0.03);
            this.ctx.strokeRect(this.width * 0.44, this.height * 0.95, this.width * 0.12, this.height * 0.03);
        } else {
            // 중앙선 (세로)
            this.ctx.beginPath();
            this.ctx.moveTo(this.width / 2, this.height * 0.05);
            this.ctx.lineTo(this.width / 2, this.height * 0.95);
            this.ctx.stroke();
            
            // 센터 서클
            this.ctx.beginPath();
            this.ctx.arc(this.width / 2, this.height / 2, this.height * 0.15, 0, Math.PI * 2);
            this.ctx.stroke();
            
            // 페널티 박스 (좌우)
            this.ctx.strokeRect(this.width * 0.05, this.height * 0.25, this.width * 0.15, this.height * 0.5);
            this.ctx.strokeRect(this.width * 0.8, this.height * 0.25, this.width * 0.15, this.height * 0.5);

            // 골대 그리기 (좌우)
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(this.width * 0.02, this.height * 0.44, this.width * 0.03, this.height * 0.12);
            this.ctx.strokeRect(this.width * 0.95, this.height * 0.44, this.width * 0.03, this.height * 0.12);
        }
        
        this.ctx.lineWidth = 2; // 원래 두께로 복구
    }
}

const matchVisualizer = new MatchVisualizer();
window.matchVisualizer = matchVisualizer;
