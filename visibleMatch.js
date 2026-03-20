// visibleMatch.js

class VisualUnit {
    constructor(id, name, teamType, x, y) {
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
        this.color = teamType === 'home' ? '#e74c3c' : '#3498db';
    }

    // ⚫ [7. 선수 이동] 보간 (Lerp) 업데이트
    update() {
        // 매 프레임 목표 위치로 15%씩 이동 (부드러운 감속)
        this.x += (this.targetX - this.x) * 0.15;
        this.y += (this.targetY - this.y) * 0.15;
    }

    draw(ctx, width, height) {
        // 좌표 변환 (0~100 -> 픽셀)
        const px = (this.x / 100) * width;
        const py = (this.y / 100) * height; // Top-down view
        const r = Math.max(6, width * 0.015);

        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = this.color;
        ctx.fill();
        
        if (this.hasBall) { // 공 가진 선수 표시
            ctx.strokeStyle = '#f1c40f';
            ctx.lineWidth = 2;
            ctx.stroke();
        }
    }
}

class VisualBall {
    constructor() {
        this.x = 50; this.y = 50;
        this.targetX = 50; this.targetY = 50;
    }
    update() {
        this.x += (this.targetX - this.x) * 0.2; // 공은 선수보다 조금 더 빠르게 반응
        this.y += (this.targetY - this.y) * 0.2;
    }
    draw(ctx, width, height) {
        const px = (this.x / 100) * width;
        const py = (this.y / 100) * height;
        const r = Math.max(3, width * 0.008);
        
        ctx.beginPath();
        ctx.arc(px, py, r, 0, Math.PI * 2);
        ctx.fillStyle = '#fff';
        ctx.fill();
        ctx.strokeStyle = '#000';
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
    }

    init(containerId, initialPlayers) {
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
        
        // 유닛 생성
        this.units = {};
        initialPlayers.forEach(p => {
            this.units[p.id] = new VisualUnit(p.id, p.name, p.teamId, p.x, p.y);
        });

        this.resize();
        this.start();
    }

    // 엔진에서 온 데이터로 동기화
    sync(snapshot) {
        // 공 위치 업데이트
        this.ball.targetX = snapshot.ball.x;
        this.ball.targetY = snapshot.ball.y;

        // 선수 위치 업데이트
        snapshot.players.forEach(pData => {
            const unit = this.units[pData.id];
            if (unit) {
                unit.targetX = pData.x;
                unit.targetY = pData.y;
                unit.hasBall = pData.hasBall;
            }
        });
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
        this.ball.update();
        this.ball.draw(this.ctx, this.width, this.height);

        requestAnimationFrame(() => this.animate());
    }

    drawPitch() {
        this.ctx.fillStyle = '#27ae60';
        this.ctx.fillRect(0, 0, this.width, this.height);
        
        this.ctx.strokeStyle = '#ffffff'; // [수정] 라인 색상 완전한 흰색으로 변경
        this.ctx.lineWidth = 2;
        
        // 테두리
        this.ctx.strokeRect(this.width * 0.05, this.height * 0.05, this.width * 0.9, this.height * 0.9);
        
        // 중앙선
        this.ctx.beginPath();
        this.ctx.moveTo(this.width / 2, this.height * 0.05);
        this.ctx.lineTo(this.width / 2, this.height * 0.95);
        this.ctx.stroke();
        
        // 센터 서클
        this.ctx.beginPath();
        this.ctx.arc(this.width / 2, this.height / 2, this.width * 0.1, 0, Math.PI * 2);
        this.ctx.stroke();
        
        // 페널티 박스 (좌우)
        this.ctx.strokeRect(this.width * 0.05, this.height * 0.25, this.width * 0.15, this.height * 0.5);
        this.ctx.strokeRect(this.width * 0.8, this.height * 0.25, this.width * 0.15, this.height * 0.5);
    }
}

const matchVisualizer = new MatchVisualizer();
window.matchVisualizer = matchVisualizer;
