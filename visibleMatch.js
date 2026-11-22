// visibleMatch.js

class VisualUnit {
    constructor(id, name, teamType, x, y, color) { // [수정] color 인자 추가
        this.id = id;
        this.name = name;
        this.teamType = teamType;
        
        // 현재 렌더링 위치
        this.x = x; 
        this.y = y;
        
        // 직전 틱 위치 및 목표 위치 (시간 기반 선형 프레임 보간용)
        this.prevX = x;
        this.prevY = y;
        this.targetX = x;
        this.targetY = y;

        this.hasBall = false;
        this.skillEffectTimer = 0; // 개인기 효과 타이머
        this.activeSkillId = null; // 현재 진행 중인 개인기 ID
        this.activeSkillName = null; // 현재 진행 중인 개인기 이름
        this.color = color || (teamType === 'home' ? '#e74c3c' : '#3498db'); // [수정] 전달받은 컬러 사용
        this.pulse = 0; // [신규] 공 소유 시 강조 애니메이션용
        this.stamina = 100; // [신규] 실시간 체력 표시용
    }

    // 시간 기반 프레임 보간(alpha: 0~1)으로 틱 간격을 60/120/144FPS에서 균일하고 부드럽게 렌더링
    update(alpha = 1) {
        const d = Math.hypot(this.targetX - this.prevX, this.targetY - this.prevY);
        if (d > 28) {
            // 킥오프/리셋 등 대규모 좌표 이동 시에는 즉시 스냅
            this.x = this.targetX;
            this.y = this.targetY;
        } else {
            this.x = this.prevX + (this.targetX - this.prevX) * alpha;
            this.y = this.prevY + (this.targetY - this.prevY) * alpha;
        }

        // [신규] 공 소유 시 맥동 효과를 위한 타이머 업데이트
        if (this.hasBall) {
            this.pulse += 0.12;
        } else {
            this.pulse = 0;
        }

        if (this.skillEffectTimer > 0) {
            this.skillEffectTimer--;
            if (this.skillEffectTimer === 0) {
                this.activeSkillId = null;
                this.activeSkillName = null;
            }
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
                    // 좌표 강제 오프셋(순간이동 착시) 없이 제자리에서 태클 임팩트만 강조
                    r *= (1 + Math.sin(progress * Math.PI) * 0.18);
                    break;
                case 'MARSEILLE_TURN':
                case 'ROULETTE':
                case 'BERBATOV_SPIN':
                case 'MCGEADY_SPIN':
                    // 한 바퀴 회전 스핀 동작
                    rotation = progress * Math.PI * 2;
                    break;
                case 'ELASTICO':
                case 'REVERSE_ELASTICO':
                case 'STEP_OVER':
                case 'STEPOVER':
                case 'BODY_FEINT':
                    // 좌우로 빠르게 흔드는 페인팅 (지그재그)
                    px += Math.sin(progress * Math.PI * 4) * (r * 1.4);
                    break;
                case 'LA_CROQUETA':
                case 'RONALDO_CHOP':
                case 'HEEL_CHOP':
                case 'BALL_ROLL': {
                    // 옆으로 꺾은 뒤 전방 돌파 (사이드 스텝/촙)
                    const sideStep = (progress < 0.5) ? (progress * 2) * (r * 1.8) : (r * 1.8);
                    const forwardStep = (progress >= 0.5) ? ((progress - 0.5) * 2) * (r * 1.8) : 0;
                    py += sideStep;
                    px += (this.teamType === 'home' ? forwardStep : -forwardStep);
                    break;
                }
                case 'CRUYFF_TURN':
                case 'DRAG_BACK':
                case 'RABONA_FAKE': {
                    // 뒤로 접고 순간 방향 전환
                    const backPull = Math.sin(progress * Math.PI) * (r * 1.6);
                    px += (this.teamType === 'home' ? -backPull : backPull);
                    py += Math.sin(progress * Math.PI * 2) * (r * 1.1);
                    break;
                }
                case 'RAINBOW_FLICK':
                case 'SOMBRERO_FLICK':
                case 'NUTMEG':
                    // 공을 띄우거나 가랑이 사이 돌파 시 도약/번쩍임 강조
                    r *= (1 + Math.sin(progress * Math.PI) * 0.35);
                    ctx.shadowColor = '#38bdf8';
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

        if (this.skillEffectTimer > 0 && this.activeSkillId && this.activeSkillId !== 'TACKLE' && this.activeSkillName) {
            ctx.save();
            ctx.font = 'bold 9px sans-serif';
            ctx.textAlign = 'center';
            ctx.textBaseline = 'bottom';
            ctx.lineWidth = 2.5;
            ctx.strokeStyle = 'rgba(0,0,0,0.8)';
            const label = `⚡ ${this.activeSkillName}`;
            ctx.strokeText(label, px, py - r - 6);
            ctx.fillStyle = '#fde047';
            ctx.fillText(label, px, py - r - 6);
            ctx.restore();
        }

        if (this.skillEffectTimer > 0) {
            ctx.restore(); // 개인기 발광 효과 컨텍스트 복구
        }
    }

    // [신규] 개인기 시각 효과 트리거
    triggerSkillEffect(skillId, skillName = null) {
        this.skillEffectTimer = 45; // 약 0.7초 유지
        this.activeSkillId = skillId;
        this.activeSkillName = skillName;
    }
}

class VisualBall {
    constructor() {
        this.x = 50; this.y = 50;
        this.z = 0; // [FLR 물리 이식] 실제 3D 포물선 높이
        this.prevX = 50; this.prevY = 50; this.prevZ = 0;
        this.targetX = 50; this.targetY = 50;
        this.targetZ = 0;
        this.accelFactor = 0.25;
        this.state = 0; // 공 상태
        this.trail = []; // 고속 이동 잔상
    }
    update(units, alpha = 1) {
        // 드리블 시 볼 캐리어 발밑에 100% 동기화
        if (this.state === 1 && units) {
            const carrier = Object.values(units).find(u => u.hasBall);
            if (carrier) {
                this.x = carrier.x;
                this.y = carrier.y;
                this.z = 0;
                this.trail.length = 0;
                return;
            }
        }
        // 패스/슈팅/루즈볼: 직전 틱 위치(prev)에서 목표 위치(target)까지 시간 기반 선형 보간
        const d = Math.hypot(this.targetX - this.prevX, this.targetY - this.prevY);
        if (d > 28) {
            this.x = this.targetX;
            this.y = this.targetY;
            this.z = this.targetZ;
            this.trail.length = 0;
            return;
        }
        this.x = this.prevX + (this.targetX - this.prevX) * alpha;
        this.y = this.prevY + (this.targetY - this.prevY) * alpha;
        this.z = this.prevZ + (this.targetZ - this.prevZ) * alpha;

        if (this.state === 2) {
            this.trail.push({ x: this.x, y: this.y, z: this.z });
            if (this.trail.length > 7) this.trail.shift();
        } else if (this.trail.length > 0) {
            this.trail.shift();
        }
    }
    draw(ctx, width, height) {
        const isPortrait = height > width;
        const toPx = (nx, ny) => isPortrait
            ? { px: (ny / 100) * width, py: height - (nx / 100) * height }
            : { px: (nx / 100) * width, py: (ny / 100) * height };

        const { px, py } = toPx(this.x, this.y);
        const scale = Math.min(width, height);
        const r = Math.max(2.5, scale * 0.010);

        // 공중 패스/슈팅 궤적 잔상
        if (this.trail.length > 1) {
            for (let i = 0; i < this.trail.length - 1; i++) {
                const pt = this.trail[i];
                const { px: tx, py: ty } = toPx(pt.x, pt.y);
                const tVisualY = ty - (pt.z * (height / 100) * 0.85);
                const ratio = (i + 1) / this.trail.length;
                ctx.beginPath();
                ctx.arc(tx, tVisualY, r * (0.35 + ratio * 0.45), 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${(ratio * 0.22).toFixed(3)})`;
                ctx.fill();
            }
        }
        
        // [FLR 물리 이식] 입체 그림자 (고도가 높을수록 그림자가 옅어지고 자연스럽게 번짐)
        const shadowScale = 1 + (this.z * 0.04);
        const shadowAlpha = Math.max(0.06, 0.35 - (this.z * 0.022));
        ctx.beginPath();
        ctx.ellipse(px, py + r * 0.5, r * 0.8 * shadowScale, r * 0.4 * shadowScale, 0, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0,0,0,${shadowAlpha})`;
        ctx.fill();

        // [FLR 물리 이식] 공 본체 높이 적용 (포물선 궤적)
        const visualY = py - (this.z * (height / 100) * 0.85);

        // 세트피스 대기(DEAD 상태) 시 시각적 포커스 링 표시
        if (this.state === 3 && this.setPieceType) {
            const pulse = 1.8 + Math.abs(Math.sin(Date.now() * 0.008)) * 0.8;
            ctx.save();
            ctx.beginPath();
            ctx.setLineDash([3, 3]);
            ctx.arc(px, visualY, r * pulse, 0, Math.PI * 2);
            ctx.strokeStyle = this.setPieceType === 'penalty' ? '#f43f5e' : '#fbbf24';
            ctx.lineWidth = 1.8;
            ctx.stroke();
            ctx.restore();
        }

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
        this.container = null;
        this.units = {}; // ID로 관리
        this.ball = new VisualBall();
        this.isRunning = false;
        this.width = 0;
        this.height = 0;
        this.dpr = 1;
        this.storedSpeed = null; // [신규] 패스 딜레이 대응을 위한 속도 저장
        this.grassPattern = null; // [신규] 잔디 텍스처 패턴
        this.pitchCache = null; // 정적 경기장 배경 오프스크린 캐시
        this.lastSyncTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        this.lastFrameTime = this.lastSyncTime;
        this.syncInterval = 80; // 엔진 기본 틱 간격(80ms)에 자동 적응

        this.matchMeta = {};
        this.env = {
            month: 8,
            isWinter: false,
            weather: 'clear', // 'clear' | 'rain' | 'snow'
            lighting: 'night' // 'day' | 'dusk' | 'night'
        };
        this.weatherParticles = [];
        this.rainSplashes = [];
        this.goalNetEffect = null; // { side: 'left'|'right'|'top'|'bottom', team: 'home'|'away', timer: number, duration: number }
        this._resizeBound = null;
    }

    createGrassPattern() {
        const size = 128;
        const cvs = document.createElement('canvas');
        cvs.width = size;
        cvs.height = size;
        const ctx = cvs.getContext('2d');

        // 미세 잔디 결 노이즈 (시드 느낌으로 균일한 잔디 질감)
        for (let i = 0; i < 900; i++) {
            ctx.fillStyle = i % 3 === 0 ? 'rgba(255, 255, 255, 0.025)' : 'rgba(0, 0, 0, 0.045)';
            ctx.fillRect(Math.random() * size, Math.random() * size, 1.8, 1.8);
        }

        return this.ctx.createPattern(cvs, 'repeat');
    }

    _hashSeed(str) {
        let h = 2166136261;
        for (let i = 0; i < str.length; i++) {
            h ^= str.charCodeAt(i);
            h = Math.imul(h, 16777619);
        }
        return (h >>> 0) / 4294967295;
    }

    _resolveMatchDate(options = {}) {
        const gd = (typeof gameData !== 'undefined' && gameData) ? gameData : {};
        const startYear = Number.isFinite(options.startYear) ? options.startYear : (gd.startYear || 2025);
        const currentRound = Number.isFinite(options.currentRound) ? options.currentRound : (gd.currentRound || 1);
        const isWorldCupMode = options.isWorldCupMode !== undefined ? Boolean(options.isWorldCupMode) : Boolean(gd.isWorldCupMode);

        const matchDate = new Date(startYear, 7, 1); // 8월 1일 시즌 개막 기준 (script.js와 동일)
        matchDate.setDate(matchDate.getDate() + (Math.max(1, currentRound) - 1) * 4);
        const month = matchDate.getMonth() + 1;
        const isWinter = !isWorldCupMode && (month === 12 || month === 1 || month === 2);

        return { month, day: matchDate.getDate(), isWinter, currentRound, isWorldCupMode };
    }

    resolveEnvironment(options = {}) {
        const gd = (typeof gameData !== 'undefined' && gameData) ? gameData : {};
        const dateInfo = this._resolveMatchDate(options);

        const homeTeam = options.homeTeam || gd.selectedTeam || 'HOME';
        const awayTeam = options.awayTeam || gd.currentOpponent || 'AWAY';
        const seasonCount = gd.seasonCount || 1;
        const isUCLMatch = options.isUCLMatch !== undefined ? Boolean(options.isUCLMatch) : Boolean(gd.isUCLMatch);
        const isFACupMatch = options.isFACupMatch !== undefined ? Boolean(options.isFACupMatch) : Boolean(gd.isFACupMatch);

        const rLight = this._hashSeed(`light|${seasonCount}|${dateInfo.currentRound}|${homeTeam}|${awayTeam}`);
        const rWeather = this._hashSeed(`weather|${seasonCount}|${dateInfo.currentRound}|${homeTeam}|${awayTeam}`);

        let lighting = 'day';
        if (isUCLMatch) {
            lighting = 'night';
        } else if (isFACupMatch) {
            lighting = rLight < 0.65 ? 'night' : 'dusk';
        } else if (dateInfo.isWinter) {
            lighting = rLight < 0.58 ? 'night' : (rLight < 0.80 ? 'dusk' : 'day');
        } else {
            lighting = rLight < 0.45 ? 'night' : (rLight < 0.65 ? 'dusk' : 'day');
        }

        // 눈은 겨울(12, 1, 2월 / 월드컵 제외)에만 오도록 엄격 제한
        let weather = 'clear';
        if (dateInfo.isWinter) {
            if (rWeather < 0.36) weather = 'snow';
            else if (rWeather < 0.50) weather = 'rain';
        } else {
            const rainThreshold = (dateInfo.month >= 9 && dateInfo.month <= 11) ? 0.24 : 0.18;
            if (rWeather < rainThreshold) weather = 'rain';
        }

        if (options.lighting && ['day', 'dusk', 'night'].includes(options.lighting)) {
            lighting = options.lighting;
        }
        if (options.weather && ['clear', 'rain', 'snow'].includes(options.weather)) {
            if (options.weather === 'snow' && !dateInfo.isWinter && !options.forceSnow) {
                weather = 'rain';
            } else {
                weather = options.weather;
            }
        }

        this.env = {
            month: dateInfo.month,
            day: dateInfo.day,
            isWinter: dateInfo.isWinter,
            weather,
            lighting
        };
        this.initWeatherParticles();
        this.updateEnvBadge();
    }

    setEnvironment(overrides = {}) {
        const nextWeather = overrides.weather || this.env.weather;
        const nextLighting = overrides.lighting || this.env.lighting;
        if (['day', 'dusk', 'night'].includes(nextLighting)) {
            this.env.lighting = nextLighting;
        }
        if (['clear', 'rain', 'snow'].includes(nextWeather)) {
            if (nextWeather === 'snow' && !this.env.isWinter && !overrides.forceSnow) {
                this.env.weather = 'clear';
            } else {
                this.env.weather = nextWeather;
            }
        }
        this.pitchCache = null;
        this.initWeatherParticles();
        this.updateEnvBadge();
    }

    initWeatherParticles() {
        this.weatherParticles = [];
        this.rainSplashes = [];
        if (this.env.weather === 'rain') {
            const count = 130;
            for (let i = 0; i < count; i++) {
                this.weatherParticles.push({
                    x: Math.random(),
                    y: Math.random(),
                    len: 0.018 + Math.random() * 0.022,
                    speed: 1.35 + Math.random() * 0.85,
                    alpha: 0.22 + Math.random() * 0.26
                });
            }
        } else if (this.env.weather === 'snow') {
            const count = 95;
            for (let i = 0; i < count; i++) {
                this.weatherParticles.push({
                    x: Math.random(),
                    y: Math.random(),
                    r: 1.2 + Math.random() * 2.1,
                    speed: 0.08 + Math.random() * 0.11,
                    swayPhase: Math.random() * Math.PI * 2,
                    swaySpeed: 1.2 + Math.random() * 1.4,
                    alpha: 0.45 + Math.random() * 0.45
                });
            }
        }
    }

    updateEnvBadge() {
        if (!this.container) return;
        let badge = this.container.querySelector('#vm-env-badge');
        if (!badge) {
            badge = document.createElement('div');
            badge.id = 'vm-env-badge';
            badge.style.cssText = [
                'position:absolute',
                'left:10px',
                'bottom:8px',
                'z-index:90',
                'pointer-events:none',
                'user-select:none',
                'display:inline-flex',
                'align-items:center',
                'gap:6px',
                'padding:4px 9px',
                'border-radius:999px',
                'background:rgba(9,13,22,0.68)',
                'border:1px solid rgba(255,255,255,0.14)',
                'backdrop-filter:blur(6px)',
                '-webkit-backdrop-filter:blur(6px)',
                'color:#e2e8f0',
                'font-size:11px',
                'font-weight:700',
                'letter-spacing:0.02em',
                'box-shadow:0 4px 12px rgba(0,0,0,0.35)'
            ].join(';');
            this.container.appendChild(badge);
        }

        const weatherLabel = this.env.weather === 'snow'
            ? '❄️ 설중전'
            : (this.env.weather === 'rain' ? '🌧️ 우천' : '⛅ 쾌청');
        const lightLabel = this.env.lighting === 'night'
            ? '🌙 야간 라이트'
            : (this.env.lighting === 'dusk' ? '🌆 황혼' : '☀️ 주간');
        const monthText = `${this.env.month}월`;
        badge.textContent = `${monthText} · ${weatherLabel} · ${lightLabel}`;
    }

    triggerGoalEffect(scoringTeam) {
        // 득점한 팀의 반대편 골대(실점 팀 골대)가 흔들림
        const isHomeGoal = (scoringTeam === 'home');
        this.goalNetEffect = {
            targetSide: isHomeGoal ? 'away' : 'home',
            timer: 0,
            duration: 1.25
        };
    }

    init(containerId, initialPlayers, teamColors, options = {}) { // [수정] teamColors 및 경기 메타 옵션 추가
        // 캔버스 셋업
        const container = document.getElementById(containerId);
        if (!container) return;
        this.container = container;

        // 캔버스 재생성 방지
        let canvas = container.querySelector('canvas');
        if (!canvas) {
            canvas = document.createElement('canvas');
            canvas.style.width = '100%';
            canvas.style.height = '100%';
            canvas.style.display = 'block';
            container.appendChild(canvas);
        }
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');

        // 팀 컬러 및 경기 메타 저장
        this.teamColors = teamColors || {};
        this.matchMeta = options || {};
        this.goalNetEffect = null;
        this.resolveEnvironment(this.matchMeta);

        // 유닛 생성
        this.units = {};
        initialPlayers.forEach(p => {
            const color = this.teamColors[p.teamId];
            this.units[p.id] = new VisualUnit(p.id, p.name, p.teamId, p.x, p.y, color);
        });

        if (!this._resizeBound) {
            this._resizeBound = () => this.resize();
            window.addEventListener('resize', this._resizeBound);
        }
        if (typeof ResizeObserver !== 'undefined' && !this._resizeObserver) {
            this._resizeObserver = new ResizeObserver(() => this.resize());
            this._resizeObserver.observe(container);
        }

        this.pitchCache = null;
        this.resize();
        this.start();
    }

    // 엔진에서 온 데이터로 동기화
    sync(snapshot) {
        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const elapsed = now - this.lastSyncTime;
        if (elapsed >= 16 && elapsed <= 220) {
            this.syncInterval = this.syncInterval * 0.65 + elapsed * 0.35;
        }
        this.lastSyncTime = now;

        // 1) 선수 위치 업데이트 (현재 렌더 위치를 prev로 저장해 끊김 없는 연속 보간)
        snapshot.players.forEach(pData => {
            const unit = this.units[pData.id];
            if (unit) {
                unit.prevX = unit.x;
                unit.prevY = unit.y;
                unit.targetX = pData.x;
                unit.targetY = pData.y;
                unit.hasBall = pData.hasBall;
                if (pData.stamina !== undefined) unit.stamina = pData.stamina;
            }
        });

        // 2) 공 상태 및 탄도학 동기화
        this.ball.state = snapshot.ball.state; // 0:LOOSE, 1:CONTROLLED, 2:IN_FLIGHT, 3:DEAD (deepenTactic.js 기준)
        this.ball.setPieceType = snapshot.setPiece ? snapshot.setPiece.type : null;
        this.ball.prevX = this.ball.x;
        this.ball.prevY = this.ball.y;
        this.ball.prevZ = this.ball.z;

        if (snapshot.ball.state === 1) { 
            // CONTROLLED (드리블) - 볼 캐리어 발밑에 동기화
            const carrierUnit = Object.values(this.units).find(u => u.hasBall);
            if (carrierUnit) {
                this.ball.targetX = carrierUnit.targetX;
                this.ball.targetY = carrierUnit.targetY;
                this.ball.targetZ = 0;
            } else {
                this.ball.targetX = snapshot.ball.x;
                this.ball.targetY = snapshot.ball.y;
                this.ball.targetZ = 0;
            }
        } else if (snapshot.ball.state === 2) { 
            // IN_FLIGHT (패스, 슛, 롱볼)
            this.ball.targetX = snapshot.ball.x;
            this.ball.targetY = snapshot.ball.y;
            this.ball.targetZ = Number.isFinite(snapshot.ball.z) ? snapshot.ball.z : 0;
        } else {
            // LOOSE / DEAD
            this.ball.targetX = snapshot.ball.x;
            this.ball.targetY = snapshot.ball.y;
            this.ball.targetZ = 0;
        }
    }

    resize() {
        if (!this.canvas || !this.canvas.parentElement) return;
        const rect = this.canvas.parentElement.getBoundingClientRect();
        if (rect.width <= 0 || rect.height <= 0) return;

        const dpr = Math.min(window.devicePixelRatio || 1, 2);
        this.dpr = dpr;
        this.width = rect.width;
        this.height = rect.height;
        this.canvas.width = Math.round(rect.width * dpr);
        this.canvas.height = Math.round(rect.height * dpr);
        this.pitchCache = null; // 리사이즈 시 잔디/라인 캐시 재생성
    }

    start() {
        if (!this.isRunning) {
            this.isRunning = true;
            this.lastFrameTime = (typeof performance !== 'undefined' ? performance.now() : Date.now());
            this.animate();
        }
    }

    animate() {
        if (!this.isRunning) return;

        if (this.width <= 0 || this.height <= 0) {
            this.resize();
            if (this.width <= 0 || this.height <= 0) {
                requestAnimationFrame(() => this.animate());
                return;
            }
        }

        const now = (typeof performance !== 'undefined' ? performance.now() : Date.now());
        const dt = Math.min(0.05, Math.max(0.001, (now - this.lastFrameTime) / 1000));
        this.lastFrameTime = now;

        const interval = Math.max(16, this.syncInterval || 80);
        const alpha = Math.max(0, Math.min(1, (now - this.lastSyncTime) / interval));

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        this.drawPitch();

        this.ctx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        // 골망 흔들림 동적 하이라이트
        if (this.goalNetEffect) {
            this.goalNetEffect.timer += dt;
            if (this.goalNetEffect.timer >= this.goalNetEffect.duration) {
                this.goalNetEffect = null;
            } else {
                this.drawGoalRippleOverlay();
            }
        }

        // 시간 기반 보간 업데이트 & 그리기
        Object.values(this.units).forEach(u => {
            u.update(alpha);
            u.draw(this.ctx, this.width, this.height);
        });
        this.ball.update(this.units, alpha);
        this.ball.draw(this.ctx, this.width, this.height);

        // 날씨(비/눈) 및 경기장 조명 라이트 비네팅 오버레이
        this.updateAndDrawWeather(dt);
        this.drawLightingOverlay();

        requestAnimationFrame(() => this.animate());
    }

    _getTeamPrimaryColor(teamId, fallback) {
        const c = this.teamColors ? this.teamColors[teamId] : null;
        if (Array.isArray(c)) return c[0] || fallback;
        return c || fallback;
    }

    _getPitchPalette() {
        const { weather, lighting } = this.env;
        if (weather === 'snow') {
            return {
                apronTop: '#162822',
                apronBottom: '#0f1c18',
                stripeEven: lighting === 'night' ? '#336b54' : '#407e62',
                stripeOdd: lighting === 'night' ? '#3c795f' : '#4c8c6f',
                frostTint: 'rgba(226, 240, 255, 0.09)',
                lineColor: 'rgba(255, 255, 255, 0.94)'
            };
        }
        if (weather === 'rain') {
            return {
                apronTop: '#0d2218',
                apronBottom: '#091811',
                stripeEven: lighting === 'night' ? '#1a6539' : '#1f7443',
                stripeOdd: lighting === 'night' ? '#207443' : '#26844d',
                frostTint: null,
                lineColor: 'rgba(248, 252, 255, 0.88)'
            };
        }
        if (lighting === 'night') {
            return {
                apronTop: '#0d2117',
                apronBottom: '#08150f',
                stripeEven: '#1f7841',
                stripeOdd: '#268a4d',
                frostTint: null,
                lineColor: 'rgba(255, 255, 255, 0.92)'
            };
        }
        if (lighting === 'dusk') {
            return {
                apronTop: '#13281b',
                apronBottom: '#0c1c13',
                stripeEven: '#248247',
                stripeOdd: '#2b9453',
                frostTint: null,
                lineColor: 'rgba(255, 255, 255, 0.92)'
            };
        }
        return {
            apronTop: '#153422',
            apronBottom: '#0f2518',
            stripeEven: '#268e4f',
            stripeOdd: '#2ea05b',
            frostTint: null,
            lineColor: 'rgba(255, 255, 255, 0.93)'
        };
    }

    _isKLeagueMatch() {
        const home = this.matchMeta && this.matchMeta.homeTeam;
        try {
            if (typeof allTeams !== 'undefined' && home && allTeams[home]) {
                return allTeams[home].leagueId === 'kleague_1';
            }
        } catch (e) { /* ignore */ }
        return false;
    }

    _loadSponsorImage(file) {
        if (!MatchVisualizer._adImgCache) MatchVisualizer._adImgCache = {};
        const cache = MatchVisualizer._adImgCache;
        if (!cache[file]) {
            const img = new Image();
            img.onload = () => { this.pitchCache = null; };
            img.src = 'assets/ad/' + encodeURIComponent(file);
            cache[file] = img;
        }
        return cache[file];
    }

    // assets/ad 폴더의 실제 스폰서 로고 사용 (한글 파일명 스폰서는 K리그 경기에서만 노출)
    _getImageSponsorSpecs() {
        const GLOBAL = [
            'adidas.png', 'Adobe.png', 'aws.png', 'barclays.png', 'betway.png', 'budweiser.png',
            'decathlon.png', 'FC27.webp', 'fedex.png', 'guiness.png', 'hankooktire.png', 'hyundai.webp',
            'images.png', 'img_05.png', 'microsoft.png', 'msc.png', 'panini.png', 'philadelphia.png',
            'puma.png', 'vodafone.png', 'W88.webp'
        ];
        const KOREAN = ['동원샘물.png', '링티.webp', '스포츠토토.png', '하나은행.jpg'];

        const isK = this._isKLeagueMatch();
        let files = GLOBAL.slice();
        if (isK) {
            // K리그: 한글 스폰서를 고르게 섞어 노출
            files = [];
            const maxLen = Math.max(GLOBAL.length, KOREAN.length * 3);
            let gi = 0, ki = 0;
            for (let i = 0; i < maxLen; i++) {
                if (i % 2 === 0 && gi < GLOBAL.length) files.push(GLOBAL[gi++]);
                else files.push(KOREAN[ki++ % KOREAN.length]);
            }
            while (gi < GLOBAL.length) files.push(GLOBAL[gi++]);
        }

        // 경기마다 동일한 순서가 유지되도록 시드 기반 회전
        const seed = this._hashSeed('ad|' + ((this.matchMeta && this.matchMeta.homeTeam) || '') + '|' + ((this.matchMeta && this.matchMeta.currentRound) || 1));
        const rot = Math.floor(seed * files.length);
        files = files.slice(rot).concat(files.slice(0, rot));

        const accents = ['#38bdf8', '#f43f5e', '#fbbf24', '#22c55e', '#a78bfa'];
        return files.map((f, i) => ({
            img: this._loadSponsorImage(f),
            bg1: '#f8fafc',
            bg2: '#dbe3ee',
            accent: accents[i % accents.length],
            text: '',
            textColor: '#0f172a'
        }));
    }

    _drawSponsorContent(ctx, spec, w, h) {
        // 현재 원점(0,0) 중심, 가로 w · 세로 h 영역에 로고를 비율 유지로 맞춰 그림
        const img = spec.img;
        if (img && img.complete && img.naturalWidth > 0) {
            const pad = Math.max(1, h * 0.12);
            const maxW = w - pad * 2;
            const maxH = h - pad * 2;
            const ratio = Math.min(maxW / img.naturalWidth, maxH / img.naturalHeight);
            const dw = img.naturalWidth * ratio;
            const dh = img.naturalHeight * ratio;
            ctx.drawImage(img, -dw / 2, -dh / 2, dw, dh);
        } else if (spec.text) {
            ctx.font = `900 ${Math.max(6, Math.min(h * 0.6, 10))}px sans-serif`;
            ctx.textAlign = 'center';
            ctx.textBaseline = 'middle';
            ctx.fillStyle = spec.textColor;
            ctx.fillText(spec.text, 0, 0, w * 0.72);
        }
    }

    _getSponsorPalette() {
        const imageSpecs = this._getImageSponsorSpecs();
        if (imageSpecs.length) return imageSpecs;
        const homePrimary = this._getTeamPrimaryColor('home', '#e11d48');
        const awayPrimary = this._getTeamPrimaryColor('away', '#2563eb');
        const stadiumName = (this.matchMeta && this.matchMeta.stadiumName) ? this.matchMeta.stadiumName : '';
        const clubShort = (typeof teamNames !== 'undefined' && this.matchMeta && this.matchMeta.homeTeam && teamNames[this.matchMeta.homeTeam])
            ? teamNames[this.matchMeta.homeTeam].slice(0, 7)
            : 'HOME';
        const compLabel = (this.matchMeta && this.matchMeta.isUCLMatch)
            ? 'CHAMPIONS'
            : ((this.matchMeta && this.matchMeta.isFACupMatch) ? 'CUP LIVE' : 'EASYFMM');

        return [
            { bg1: '#0f172a', bg2: '#1e293b', accent: '#38bdf8', text: 'EASYFMM 26', textColor: '#f8fafc' },
            { bg1: homePrimary, bg2: '#0f172a', accent: '#fbbf24', text: stadiumName ? stadiumName.slice(0, 8) : clubShort, textColor: '#ffffff' },
            { bg1: '#111827', bg2: '#1f2937', accent: '#22c55e', text: compLabel, textColor: '#e2e8f0' },
            { bg1: '#1e1b4b', bg2: '#312e81', accent: '#f43f5e', text: 'MATCHDAY', textColor: '#ffffff' },
            { bg1: '#064e3b', bg2: '#065f46', accent: '#34d399', text: 'FAIR PLAY', textColor: '#ecfdf5' },
            { bg1: awayPrimary, bg2: '#0f172a', accent: '#38bdf8', text: 'LIVE HD', textColor: '#ffffff' }
        ];
    }

    /**
     * 골대 옆 및 터치라인 주변에 세워진 입체적인 3D A-보드(LED 광고판) 렌더링
     * @param {CanvasRenderingContext2D} ctx
     * @param {number} x0 시작 X
     * @param {number} y0 시작 Y
     * @param {number} x1 끝 X
     * @param {number} y1 끝 Y
     * @param {'left'|'right'|'top'|'bottom'} facing 어느 방향(피치 쪽)을 바라보는지
     * @param {number} depth 보드 입체 깊이(px)
     * @param {object} spec 색상/문구 스펙
     */
    _draw3DAdBoard(ctx, x0, y0, x1, y1, facing, depth, spec) {
        const isVertical = (facing === 'left' || facing === 'right');
        const isNight = this.env.lighting === 'night';
        const isSnow = this.env.weather === 'snow';

        // 카메라 원근: 아래쪽(남쪽)으로 살짝 내려다보는 시점 -> 위/바깥 면과 측면 두께가 드러남
        const skew = Math.max(2.2, depth * 0.32);
        const capThick = Math.max(2.2, depth * 0.24);
        const shadowOffsetX = facing === 'left' ? -depth * 0.65 : (facing === 'right' ? depth * 0.65 : 2);
        const shadowOffsetY = facing === 'top' ? -depth * 0.55 : (facing === 'bottom' ? depth * 0.55 : depth * 0.45);

        ctx.save();

        if (isVertical) {
            // facing === 'left': 왼쪽 골라인 바깥, 피치(+x)를 향해 세워짐
            // facing === 'right': 오른쪽 골라인 바깥, 피치(-x)를 향해 세워짐
            const dir = (facing === 'left') ? -1 : 1; // 피치 바깥 방향
            const frontX = x0;
            const topX = frontX + dir * depth;

            // 앞면 4개 꼭짓점 (사다리꼴 원근 + 약간의 틸트)
            const fTop = { x: frontX, y: y0 };
            const fBot = { x: frontX, y: y1 };
            const bTop = { x: topX, y: y0 - skew * 0.55 };
            const bBot = { x: topX, y: y1 - skew * 0.55 };

            // 1) 바닥 투영 그림자
            ctx.beginPath();
            ctx.moveTo(fTop.x, fTop.y);
            ctx.lineTo(bTop.x + shadowOffsetX * 0.5, bTop.y + shadowOffsetY * 0.6);
            ctx.lineTo(bBot.x + shadowOffsetX * 0.5, bBot.y + shadowOffsetY * 0.85);
            ctx.lineTo(fBot.x, fBot.y + 2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.44)';
            ctx.fill();

            // 2) 뒤쪽 A-프레임 지지대(철제 다리)
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.4;
            const legPositions = [0.22, 0.5, 0.78];
            legPositions.forEach(t => {
                const lx0 = frontX + dir * (depth * 0.55);
                const ly0 = y0 + (y1 - y0) * t - skew * 0.25;
                const lx1 = topX + dir * (depth * 0.35);
                const ly1 = ly0 + 2;
                ctx.beginPath();
                ctx.moveTo(lx0, ly0);
                ctx.lineTo(lx1, ly1);
                ctx.stroke();
            });

            // 3) 3D 하단 측면 두께(남쪽 엔드캡)
            ctx.beginPath();
            ctx.moveTo(fBot.x, fBot.y);
            ctx.lineTo(bBot.x, bBot.y);
            ctx.lineTo(bBot.x, bBot.y + capThick);
            ctx.lineTo(fBot.x, fBot.y + capThick);
            ctx.closePath();
            ctx.fillStyle = '#0f172a';
            ctx.fill();
            ctx.strokeStyle = 'rgba(148, 163, 184, 0.35)';
            ctx.lineWidth = 0.7;
            ctx.stroke();

            // 4) 3D 상단/외곽 금속 프레임 테두리 (보드 두께감)
            ctx.beginPath();
            ctx.moveTo(bTop.x, bTop.y);
            ctx.lineTo(bTop.x + dir * (capThick * 0.75), bTop.y - capThick * 0.35);
            ctx.lineTo(bBot.x + dir * (capThick * 0.75), bBot.y - capThick * 0.35);
            ctx.lineTo(bBot.x, bBot.y);
            ctx.closePath();
            ctx.fillStyle = isSnow ? '#cbd5e1' : '#475569';
            ctx.fill();

            // 5) LED 광고판 앞면(입체 경사면)
            ctx.beginPath();
            ctx.moveTo(fTop.x, fTop.y);
            ctx.lineTo(bTop.x, bTop.y);
            ctx.lineTo(bBot.x, bBot.y);
            ctx.lineTo(fBot.x, fBot.y);
            ctx.closePath();

            const grad = ctx.createLinearGradient(fTop.x, fTop.y, bBot.x, bBot.y);
            grad.addColorStop(0, spec.bg1);
            grad.addColorStop(1, spec.bg2);
            ctx.fillStyle = grad;
            if (isNight) {
                ctx.shadowColor = spec.accent;
                ctx.shadowBlur = 6;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            // 프레임 선
            ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
            ctx.lineWidth = 0.8;
            ctx.stroke();

            // 앞면 클리핑 후 악센트 바, 글로스 반사, 스폰서 텍스트
            ctx.save();
            ctx.clip();

            // 좌/우 컬러 악센트 스트립
            ctx.fillStyle = spec.accent;
            ctx.beginPath();
            ctx.moveTo(fTop.x, fTop.y);
            ctx.lineTo(bTop.x, bTop.y);
            ctx.lineTo(bTop.x, bTop.y + (y1 - y0) * 0.14);
            ctx.lineTo(fTop.x, fTop.y + (y1 - y0) * 0.14);
            ctx.closePath();
            ctx.fill();

            // 대각선 유리/LED 광택 반사
            ctx.fillStyle = 'rgba(255, 255, 255, 0.12)';
            ctx.beginPath();
            ctx.moveTo(fTop.x, fTop.y + (y1 - y0) * 0.26);
            ctx.lineTo(bTop.x, bTop.y + (y1 - y0) * 0.16);
            ctx.lineTo(bTop.x, bTop.y + (y1 - y0) * 0.34);
            ctx.lineTo(fTop.x, fTop.y + (y1 - y0) * 0.44);
            ctx.closePath();
            ctx.fill();

            // 세로 회전 스폰서 텍스트
            const cx = (fTop.x + bTop.x + fBot.x + bBot.x) / 4;
            const cy = (fTop.y + bTop.y + fBot.y + bBot.y) / 4 + (y1 - y0) * 0.04;
            const boardLen = Math.abs(y1 - y0);
            ctx.translate(cx, cy);
            ctx.rotate(facing === 'left' ? -Math.PI / 2 : Math.PI / 2);
            this._drawSponsorContent(ctx, spec, boardLen * 0.92, Math.max(8, depth * 0.95));
            ctx.restore();
        } else {
            // 가로형 보드 (top: y0에서 위쪽(-y)으로 / bottom: y0에서 아래쪽(+y)으로)
            const dir = (facing === 'top') ? -1 : 1;
            const frontY = y0;
            const topY = frontY + dir * depth;
            const taper = Math.max(1.5, depth * 0.22);

            const fLeft = { x: x0, y: frontY };
            const fRight = { x: x1, y: frontY };
            const bLeft = { x: x0 + taper, y: topY };
            const bRight = { x: x1 - taper, y: topY };

            // 1) 바닥 투영 그림자
            ctx.beginPath();
            ctx.moveTo(fLeft.x, fLeft.y);
            ctx.lineTo(bLeft.x + 2, bLeft.y + dir * (depth * 0.45));
            ctx.lineTo(bRight.x + 2, bRight.y + dir * (depth * 0.45));
            ctx.lineTo(fRight.x, fRight.y);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.40)';
            ctx.fill();

            // 2) 뒤쪽 지지대
            ctx.strokeStyle = '#334155';
            ctx.lineWidth = 1.2;
            [0.25, 0.75].forEach(t => {
                const lx = x0 + (x1 - x0) * t;
                ctx.beginPath();
                ctx.moveTo(lx, frontY + dir * (depth * 0.5));
                ctx.lineTo(lx, topY + dir * (depth * 0.3));
                ctx.stroke();
            });

            // 3) 상단 림 두께
            ctx.beginPath();
            ctx.moveTo(bLeft.x, bLeft.y);
            ctx.lineTo(bRight.x, bRight.y);
            ctx.lineTo(bRight.x, bRight.y + dir * (capThick * 0.7));
            ctx.lineTo(bLeft.x, bLeft.y + dir * (capThick * 0.7));
            ctx.closePath();
            ctx.fillStyle = isSnow ? '#cbd5e1' : '#475569';
            ctx.fill();

            // 4) 앞면 LED 스크린
            ctx.beginPath();
            ctx.moveTo(fLeft.x, fLeft.y);
            ctx.lineTo(bLeft.x, bLeft.y);
            ctx.lineTo(bRight.x, bRight.y);
            ctx.lineTo(fRight.x, fRight.y);
            ctx.closePath();

            const grad = ctx.createLinearGradient(fLeft.x, fLeft.y, bRight.x, bRight.y);
            grad.addColorStop(0, spec.bg1);
            grad.addColorStop(1, spec.bg2);
            ctx.fillStyle = grad;
            if (isNight) {
                ctx.shadowColor = spec.accent;
                ctx.shadowBlur = 5;
            }
            ctx.fill();
            ctx.shadowBlur = 0;

            ctx.strokeStyle = 'rgba(255, 255, 255, 0.22)';
            ctx.lineWidth = 0.75;
            ctx.stroke();

            ctx.save();
            ctx.clip();
            ctx.fillStyle = spec.accent;
            ctx.fillRect(x0, Math.min(frontY, topY), (x1 - x0) * 0.1, depth + 2);

            ctx.fillStyle = 'rgba(255, 255, 255, 0.11)';
            ctx.beginPath();
            ctx.moveTo(x0 + (x1 - x0) * 0.22, fLeft.y);
            ctx.lineTo(x0 + (x1 - x0) * 0.30, bLeft.y);
            ctx.lineTo(x0 + (x1 - x0) * 0.45, bLeft.y);
            ctx.lineTo(x0 + (x1 - x0) * 0.37, fLeft.y);
            ctx.closePath();
            ctx.fill();

            const cx = (x0 + x1) / 2;
            const cy = (frontY + topY) / 2;
            const boardW = Math.abs(x1 - x0);
            ctx.translate(cx, cy);
            this._drawSponsorContent(ctx, spec, boardW * 0.92, Math.max(8, depth * 0.95));
            ctx.restore();
        }

        ctx.restore();
    }

    _drawAdBoardStrip(ctx, startCoord, endCoord, fixedFront, facing, depth, count, gap, sponsors, offsetIdx = 0) {
        const total = endCoord - startCoord;
        const panelSpan = (total - gap * (count - 1)) / count;
        if (panelSpan <= 6) return;

        for (let i = 0; i < count; i++) {
            const c0 = startCoord + i * (panelSpan + gap);
            const c1 = c0 + panelSpan;
            const spec = sponsors[(i + offsetIdx) % sponsors.length];
            if (facing === 'left' || facing === 'right') {
                this._draw3DAdBoard(ctx, fixedFront, c0, fixedFront, c1, facing, depth, spec);
            } else {
                this._draw3DAdBoard(ctx, c0, fixedFront, c1, fixedFront, facing, depth, spec);
            }
        }
    }

    _drawCornerFlag(ctx, x, y, dx, dy, color, size) {
        ctx.save();
        // 그림자
        ctx.strokeStyle = 'rgba(0,0,0,0.45)';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(x + dx * size * 0.7, y + dy * size * 0.35 + size * 0.35);
        ctx.stroke();

        // 폴대
        const poleTopX = x + dx * size * 0.15;
        const poleTopY = y - size * 0.95;
        ctx.strokeStyle = '#f8fafc';
        ctx.lineWidth = 1.6;
        ctx.beginPath();
        ctx.moveTo(x, y);
        ctx.lineTo(poleTopX, poleTopY);
        ctx.stroke();

        // 삼각 깃발
        ctx.beginPath();
        ctx.moveTo(poleTopX, poleTopY);
        ctx.lineTo(poleTopX + (dx === 0 ? 1 : dx) * size * 0.65, poleTopY + size * 0.22);
        ctx.lineTo(poleTopX, poleTopY + size * 0.44);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
        ctx.restore();
    }

    _drawTeamBench(ctx, x, y, w, h, color, label, isVertical = false) {
        ctx.save();
        // 그림자
        ctx.fillStyle = 'rgba(0,0,0,0.45)';
        ctx.fillRect(x + 2, y + 2, w, h);

        // 덕아웃 지붕
        ctx.fillStyle = '#1e293b';
        ctx.fillRect(x, y, w, h);
        ctx.strokeStyle = 'rgba(255,255,255,0.28)';
        ctx.lineWidth = 1;
        ctx.strokeRect(x, y, w, h);

        // 팀 컬러 스트립
        ctx.fillStyle = color;
        if (isVertical) {
            ctx.fillRect(x, y, Math.max(2.5, w * 0.28), h);
        } else {
            ctx.fillRect(x, y, w, Math.max(2.5, h * 0.28));
        }

        // 좌석 디테일
        const seats = 4;
        ctx.fillStyle = 'rgba(255,255,255,0.22)';
        for (let i = 0; i < seats; i++) {
            if (isVertical) {
                const sy = y + (h / (seats + 1)) * (i + 1) - 1.5;
                ctx.fillRect(x + w * 0.42, sy, w * 0.4, 3);
            } else {
                const sx = x + (w / (seats + 1)) * (i + 1) - 2;
                ctx.fillRect(sx, y + h * 0.45, 4, h * 0.35);
            }
        }
        ctx.restore();
    }

    _drawGoalNet(ctx, isPortrait, side, W, H) {
        ctx.save();
        const postR = Math.max(2.4, Math.min(W, H) * 0.0055);
        const netBg = 'rgba(15, 23, 42, 0.32)';
        const meshColor = 'rgba(255, 255, 255, 0.34)';

        if (!isPortrait) {
            const isLeft = (side === 'left');
            const lineX = isLeft ? W * 0.05 : W * 0.95;
            const backX = isLeft ? W * 0.020 : W * 0.980;
            const gTop = H * 0.44;
            const gBot = H * 0.56;
            const backInset = (gBot - gTop) * 0.075;
            const bTop = gTop + backInset;
            const bBot = gBot - backInset;

            // 골대 그물 그림자
            ctx.beginPath();
            ctx.moveTo(lineX, gTop);
            ctx.lineTo(backX, bTop + 3);
            ctx.lineTo(backX, bBot + 4);
            ctx.lineTo(lineX, gBot + 2);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.32)';
            ctx.fill();

            // 입체 그물 사다리꼴 바탕
            ctx.beginPath();
            ctx.moveTo(lineX, gTop);
            ctx.lineTo(backX, bTop);
            ctx.lineTo(backX, bBot);
            ctx.lineTo(lineX, gBot);
            ctx.closePath();
            ctx.fillStyle = netBg;
            ctx.fill();

            // 그물 메쉬(클리핑)
            ctx.save();
            ctx.clip();
            ctx.strokeStyle = meshColor;
            ctx.lineWidth = 0.85;
            const step = Math.max(4, (gBot - gTop) / 10);
            const minX = Math.min(lineX, backX);
            const maxX = Math.max(lineX, backX);
            for (let gx = minX; gx <= maxX; gx += step) {
                ctx.beginPath();
                ctx.moveTo(gx, gTop);
                ctx.lineTo(gx, gBot);
                ctx.stroke();
            }
            for (let gy = gTop; gy <= gBot; gy += step) {
                ctx.beginPath();
                ctx.moveTo(minX, gy);
                ctx.lineTo(maxX, gy);
                ctx.stroke();
            }
            ctx.restore();

            // 그물 외곽 지지 프레임 & 크로스바
            ctx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(lineX, gTop);
            ctx.lineTo(backX, bTop);
            ctx.lineTo(backX, bBot);
            ctx.lineTo(lineX, gBot);
            ctx.stroke();

            // 흰색 크로스바 & 양쪽 포스트
            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(lineX, gTop);
            ctx.lineTo(lineX, gBot);
            ctx.stroke();

            [gTop, gBot].forEach(py => {
                ctx.beginPath();
                ctx.arc(lineX, py, postR, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        } else {
            const isTop = (side === 'top');
            const lineY = isTop ? H * 0.05 : H * 0.95;
            const backY = isTop ? H * 0.020 : H * 0.980;
            const gLeft = W * 0.44;
            const gRight = W * 0.56;
            const backInset = (gRight - gLeft) * 0.075;
            const bLeft = gLeft + backInset;
            const bRight = gRight - backInset;

            ctx.beginPath();
            ctx.moveTo(gLeft, lineY);
            ctx.lineTo(bLeft, backY + 2);
            ctx.lineTo(bRight, backY + 2);
            ctx.lineTo(gRight, lineY);
            ctx.closePath();
            ctx.fillStyle = 'rgba(0, 0, 0, 0.30)';
            ctx.fill();

            ctx.beginPath();
            ctx.moveTo(gLeft, lineY);
            ctx.lineTo(bLeft, backY);
            ctx.lineTo(bRight, backY);
            ctx.lineTo(gRight, lineY);
            ctx.closePath();
            ctx.fillStyle = netBg;
            ctx.fill();

            ctx.save();
            ctx.clip();
            ctx.strokeStyle = meshColor;
            ctx.lineWidth = 0.85;
            const step = Math.max(4, (gRight - gLeft) / 10);
            const minY = Math.min(lineY, backY);
            const maxY = Math.max(lineY, backY);
            for (let gx = gLeft; gx <= gRight; gx += step) {
                ctx.beginPath();
                ctx.moveTo(gx, minY);
                ctx.lineTo(gx, maxY);
                ctx.stroke();
            }
            for (let gy = minY; gy <= maxY; gy += step) {
                ctx.beginPath();
                ctx.moveTo(gLeft, gy);
                ctx.lineTo(gRight, gy);
                ctx.stroke();
            }
            ctx.restore();

            ctx.strokeStyle = 'rgba(226, 232, 240, 0.78)';
            ctx.lineWidth = 1.6;
            ctx.beginPath();
            ctx.moveTo(gLeft, lineY);
            ctx.lineTo(bLeft, backY);
            ctx.lineTo(bRight, backY);
            ctx.lineTo(gRight, lineY);
            ctx.stroke();

            ctx.strokeStyle = '#ffffff';
            ctx.lineWidth = 2.6;
            ctx.beginPath();
            ctx.moveTo(gLeft, lineY);
            ctx.lineTo(gRight, lineY);
            ctx.stroke();

            [gLeft, gRight].forEach(px => {
                ctx.beginPath();
                ctx.arc(px, lineY, postR, 0, Math.PI * 2);
                ctx.fillStyle = '#ffffff';
                ctx.fill();
                ctx.strokeStyle = 'rgba(15, 23, 42, 0.55)';
                ctx.lineWidth = 1;
                ctx.stroke();
            });
        }
        ctx.restore();
    }

    drawGoalRippleOverlay() {
        if (!this.goalNetEffect) return;
        const W = this.width;
        const H = this.height;
        const isPortrait = H > W;
        const progress = this.goalNetEffect.timer / this.goalNetEffect.duration;
        const alpha = (1 - progress) * 0.55;
        const wave = Math.sin(progress * Math.PI * 10) * 3.5 * (1 - progress);
        const isAwayGoal = (this.goalNetEffect.targetSide === 'away');

        this.ctx.save();
        this.ctx.strokeStyle = `rgba(253, 224, 71, ${alpha.toFixed(3)})`;
        this.ctx.lineWidth = 2;

        if (!isPortrait) {
            const x1 = isAwayGoal ? W * 0.95 : W * 0.05;
            const x2 = isAwayGoal ? W * 0.980 + wave : W * 0.020 + wave;
            const y1 = H * 0.44;
            const y2 = H * 0.56;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.quadraticCurveTo(x2, H * 0.50, x1, y2);
            this.ctx.stroke();
        } else {
            const y1 = isAwayGoal ? H * 0.05 : H * 0.95;
            const y2 = isAwayGoal ? H * 0.020 + wave : H * 0.980 + wave;
            const x1 = W * 0.44;
            const x2 = W * 0.56;
            this.ctx.beginPath();
            this.ctx.moveTo(x1, y1);
            this.ctx.quadraticCurveTo(W * 0.50, y2, x2, y1);
            this.ctx.stroke();
        }
        this.ctx.restore();
    }

    updateAndDrawWeather(dt) {
        if (this.env.weather === 'clear') return;
        const W = this.width;
        const H = this.height;
        const ctx = this.ctx;

        ctx.save();
        if (this.env.weather === 'rain') {
            // 빗방울 대기 톤
            ctx.fillStyle = 'rgba(15, 35, 65, 0.10)';
            ctx.fillRect(0, 0, W, H);

            ctx.lineCap = 'round';
            const windX = -0.18;
            for (let i = 0; i < this.weatherParticles.length; i++) {
                const p = this.weatherParticles[i];
                p.y += p.speed * dt;
                p.x += windX * p.speed * dt;

                if (p.y > 1.03) {
                    if (Math.random() < 0.22 && this.rainSplashes.length < 24) {
                        this.rainSplashes.push({
                            x: p.x * W,
                            y: Math.random() * H,
                            r: 1,
                            alpha: 0.35
                        });
                    }
                    p.y = -0.04;
                    p.x = Math.random() * 1.15;
                }
                if (p.x < -0.05) p.x += 1.1;

                const px = p.x * W;
                const py = p.y * H;
                const dx = windX * p.len * H;
                const dy = p.len * H;
                ctx.strokeStyle = `rgba(198, 226, 255, ${p.alpha.toFixed(2)})`;
                ctx.lineWidth = 1.15;
                ctx.beginPath();
                ctx.moveTo(px, py);
                ctx.lineTo(px + dx, py + dy);
                ctx.stroke();
            }

            // 피치 위 빗물 튀김(잔물결)
            for (let i = this.rainSplashes.length - 1; i >= 0; i--) {
                const s = this.rainSplashes[i];
                s.r += dt * 16;
                s.alpha -= dt * 1.1;
                if (s.alpha <= 0) {
                    this.rainSplashes.splice(i, 1);
                    continue;
                }
                ctx.beginPath();
                ctx.ellipse(s.x, s.y, s.r, s.r * 0.48, 0, 0, Math.PI * 2);
                ctx.strokeStyle = `rgba(210, 236, 255, ${s.alpha.toFixed(2)})`;
                ctx.lineWidth = 0.9;
                ctx.stroke();
            }
        } else if (this.env.weather === 'snow') {
            // 겨울 설중전 차가운 공기 톤
            ctx.fillStyle = 'rgba(210, 232, 255, 0.06)';
            ctx.fillRect(0, 0, W, H);

            for (let i = 0; i < this.weatherParticles.length; i++) {
                const p = this.weatherParticles[i];
                p.swayPhase += p.swaySpeed * dt;
                p.y += p.speed * dt;
                p.x += Math.sin(p.swayPhase) * 0.028 * dt;

                if (p.y > 1.03) {
                    p.y = -0.03;
                    p.x = Math.random();
                }
                if (p.x < -0.02) p.x = 1.01;
                if (p.x > 1.02) p.x = -0.01;

                const px = p.x * W;
                const py = p.y * H;
                ctx.beginPath();
                ctx.arc(px, py, p.r, 0, Math.PI * 2);
                ctx.fillStyle = `rgba(255, 255, 255, ${p.alpha.toFixed(2)})`;
                ctx.fill();
            }
        }
        ctx.restore();
    }

    drawLightingOverlay() {
        const W = this.width;
        const H = this.height;
        const ctx = this.ctx;
        const lighting = this.env.lighting;

        ctx.save();
        if (lighting === 'night') {
            // 1) 4모서리 스타디움 서치라이트 광선
            const corners = [
                { x: 0, y: 0 },
                { x: W, y: 0 },
                { x: 0, y: H },
                { x: W, y: H }
            ];
            const beamRadius = Math.max(W, H) * 0.62;
            ctx.globalCompositeOperation = 'screen';
            corners.forEach(c => {
                const beam = ctx.createRadialGradient(c.x, c.y, 0, c.x, c.y, beamRadius);
                beam.addColorStop(0, 'rgba(215, 238, 255, 0.14)');
                beam.addColorStop(0.35, 'rgba(186, 224, 255, 0.05)');
                beam.addColorStop(1, 'rgba(186, 224, 255, 0)');
                ctx.fillStyle = beam;
                ctx.fillRect(0, 0, W, H);
            });

            // 2) 외곽 어두운 스타디움 비네팅 (중앙 피치는 밝고 선명하게 유지)
            ctx.globalCompositeOperation = 'source-over';
            const outerR = Math.hypot(W * 0.5, H * 0.5) * 1.05;
            const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, outerR * 0.42, W * 0.5, H * 0.5, outerR);
            vig.addColorStop(0, 'rgba(2, 6, 23, 0)');
            vig.addColorStop(0.65, 'rgba(2, 8, 23, 0.16)');
            vig.addColorStop(1, 'rgba(2, 6, 18, 0.54)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        } else if (lighting === 'dusk') {
            // 황혼 노을 라이트 + 은은한 비네팅
            const sunset = ctx.createLinearGradient(0, 0, W, H);
            sunset.addColorStop(0, 'rgba(251, 146, 60, 0.08)');
            sunset.addColorStop(0.5, 'rgba(251, 191, 36, 0.02)');
            sunset.addColorStop(1, 'rgba(30, 27, 75, 0.14)');
            ctx.fillStyle = sunset;
            ctx.fillRect(0, 0, W, H);

            const outerR = Math.hypot(W * 0.5, H * 0.5) * 1.06;
            const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, outerR * 0.48, W * 0.5, H * 0.5, outerR);
            vig.addColorStop(0, 'rgba(15, 23, 42, 0)');
            vig.addColorStop(1, 'rgba(15, 23, 42, 0.34)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        } else {
            // 주간 경기 가벼운 중계 카메라 림 비네팅
            const outerR = Math.hypot(W * 0.5, H * 0.5) * 1.08;
            const vig = ctx.createRadialGradient(W * 0.5, H * 0.5, outerR * 0.55, W * 0.5, H * 0.5, outerR);
            vig.addColorStop(0, 'rgba(0, 0, 0, 0)');
            vig.addColorStop(1, 'rgba(0, 12, 8, 0.20)');
            ctx.fillStyle = vig;
            ctx.fillRect(0, 0, W, H);
        }
        ctx.restore();
    }

    drawPitch() {
        if (this.width <= 0 || this.height <= 0) return;
        const targetW = Math.round(this.width * this.dpr);
        const targetH = Math.round(this.height * this.dpr);
        if (this.pitchCache && this.pitchCache.width === targetW && this.pitchCache.height === targetH) {
            this.ctx.drawImage(this.pitchCache, 0, 0, targetW, targetH);
            return;
        }

        const cache = document.createElement('canvas');
        cache.width = targetW;
        cache.height = targetH;
        const pCtx = cache.getContext('2d');
        pCtx.setTransform(this.dpr, 0, 0, this.dpr, 0, 0);

        const W = this.width;
        const H = this.height;
        const isPortrait = H > W;
        const scale = Math.min(W, H);
        const palette = this._getPitchPalette();
        const sponsors = this._getSponsorPalette();

        // 1) 스타디움 트랙 / 에이프런 배경
        const apronGrad = pCtx.createLinearGradient(0, 0, 0, H);
        apronGrad.addColorStop(0, palette.apronTop);
        apronGrad.addColorStop(1, palette.apronBottom);
        pCtx.fillStyle = apronGrad;
        pCtx.fillRect(0, 0, W, H);

        // 눈 오는 겨울 경기장 가장자리 서리/눈 쌓임 디테일
        if (this.env.weather === 'snow') {
            pCtx.fillStyle = 'rgba(241, 245, 249, 0.14)';
            pCtx.fillRect(0, 0, W, H * 0.016);
            pCtx.fillRect(0, H * 0.984, W, H * 0.016);
            pCtx.fillRect(0, 0, W * 0.014, H);
            pCtx.fillRect(W * 0.986, 0, W * 0.014, H);
        }

        // 2) 실제 잔디 피치 영역 (라인 바깥 1% 여유 잔디 포함)
        const pitchLeft = W * 0.05;
        const pitchTop = H * 0.05;
        const pitchW = W * 0.90;
        const pitchH = H * 0.90;
        const bleedX = W * 0.010;
        const bleedY = H * 0.010;

        // 피치 외곽 살짝 어두운 보더 그림자
        pCtx.fillStyle = 'rgba(0, 0, 0, 0.25)';
        pCtx.fillRect(pitchLeft - bleedX - 2, pitchTop - bleedY - 2, pitchW + bleedX * 2 + 4, pitchH + bleedY * 2 + 4);

        pCtx.save();
        pCtx.beginPath();
        pCtx.rect(pitchLeft - bleedX, pitchTop - bleedY, pitchW + bleedX * 2, pitchH + bleedY * 2);
        pCtx.clip();

        // 잔디 줄무늬 (14스트라이프)
        const numStripes = 14;
        if (isPortrait) {
            const stripeH = pitchH / numStripes;
            for (let i = -1; i <= numStripes; i++) {
                pCtx.fillStyle = (Math.abs(i) % 2 === 0) ? palette.stripeEven : palette.stripeOdd;
                pCtx.fillRect(pitchLeft - bleedX, pitchTop + i * stripeH, pitchW + bleedX * 2, stripeH + 1);
            }
        } else {
            const stripeW = pitchW / numStripes;
            for (let i = -1; i <= numStripes; i++) {
                pCtx.fillStyle = (Math.abs(i) % 2 === 0) ? palette.stripeEven : palette.stripeOdd;
                pCtx.fillRect(pitchLeft + i * stripeW, pitchTop - bleedY, stripeW + 1, pitchH + bleedY * 2);
            }
        }

        // 하이브리드 온열 잔디 설치 시 고급 크로스 컷 체크무늬 결 추가
        if (this.matchMeta && this.matchMeta.hasHybridPitch) {
            const crossStripes = 8;
            pCtx.fillStyle = 'rgba(255, 255, 255, 0.025)';
            if (isPortrait) {
                const cw = pitchW / crossStripes;
                for (let i = 0; i < crossStripes; i += 2) {
                    pCtx.fillRect(pitchLeft + i * cw, pitchTop - bleedY, cw, pitchH + bleedY * 2);
                }
            } else {
                const ch = pitchH / crossStripes;
                for (let i = 0; i < crossStripes; i += 2) {
                    pCtx.fillRect(pitchLeft - bleedX, pitchTop + i * ch, pitchW + bleedX * 2, ch);
                }
            }
        }

        // 겨울 설중전 서리/눈 틴트
        if (palette.frostTint) {
            pCtx.fillStyle = palette.frostTint;
            pCtx.fillRect(pitchLeft - bleedX, pitchTop - bleedY, pitchW + bleedX * 2, pitchH + bleedY * 2);
        }

        // 미세 잔디 텍스처 오버레이
        if (!this.grassPattern) this.grassPattern = this.createGrassPattern();
        pCtx.fillStyle = this.grassPattern;
        pCtx.fillRect(pitchLeft - bleedX, pitchTop - bleedY, pitchW + bleedX * 2, pitchH + bleedY * 2);

        // 피치 내부 은은한 중앙 하이라이트
        const centerGlow = pCtx.createRadialGradient(W * 0.5, H * 0.5, scale * 0.05, W * 0.5, H * 0.5, Math.max(W, H) * 0.55);
        centerGlow.addColorStop(0, 'rgba(255, 255, 255, 0.045)');
        centerGlow.addColorStop(1, 'rgba(0, 0, 0, 0.06)');
        pCtx.fillStyle = centerGlow;
        pCtx.fillRect(pitchLeft - bleedX, pitchTop - bleedY, pitchW + bleedX * 2, pitchH + bleedY * 2);
        pCtx.restore();

        // 3) FIFA 정식 규격 라인 마킹
        const lineW = Math.max(1.5, scale * 0.0032);
        pCtx.strokeStyle = palette.lineColor;
        pCtx.fillStyle = palette.lineColor;
        pCtx.lineWidth = lineW;

        // 터치라인 & 골라인
        pCtx.strokeRect(pitchLeft, pitchTop, pitchW, pitchH);

        const cornerR = Math.max(6, scale * 0.018);
        const spotR = Math.max(2.2, scale * 0.0045);

        if (isPortrait) {
            // 하프라인 & 센터 서클 & 센터 스팟
            pCtx.beginPath();
            pCtx.moveTo(pitchLeft, H * 0.5);
            pCtx.lineTo(pitchLeft + pitchW, H * 0.5);
            pCtx.stroke();

            const centerR = W * 0.145;
            pCtx.beginPath();
            pCtx.arc(W * 0.5, H * 0.5, centerR, 0, Math.PI * 2);
            pCtx.stroke();

            pCtx.beginPath();
            pCtx.arc(W * 0.5, H * 0.5, spotR * 1.15, 0, Math.PI * 2);
            pCtx.fill();

            // 페널티 박스 (18야드) & 골 에어리어 (6야드)
            const boxW = W * 0.50;
            const boxD = H * 0.155;
            const sixW = W * 0.26;
            const sixD = H * 0.058;

            pCtx.strokeRect(W * 0.25, pitchTop, boxW, boxD);
            pCtx.strokeRect(W * 0.25, H * 0.95 - boxD, boxW, boxD);

            pCtx.strokeRect(W * 0.37, pitchTop, sixW, sixD);
            pCtx.strokeRect(W * 0.37, H * 0.95 - sixD, sixW, sixD);

            // 페널티 스팟 & 페널티 아크 (D존)
            const topSpotY = pitchTop + H * 0.105;
            const botSpotY = H * 0.95 - H * 0.105;
            [topSpotY, botSpotY].forEach(sy => {
                pCtx.beginPath();
                pCtx.arc(W * 0.5, sy, spotR, 0, Math.PI * 2);
                pCtx.fill();
            });

            const dyToBox = boxD - H * 0.105; // 0.05 * H
            const arcR = Math.max(dyToBox * 1.5, H * 0.082);
            const arcAng = Math.acos(dyToBox / arcR);
            pCtx.beginPath();
            pCtx.arc(W * 0.5, topSpotY, arcR, Math.PI / 2 - arcAng, Math.PI / 2 + arcAng);
            pCtx.stroke();

            pCtx.beginPath();
            pCtx.arc(W * 0.5, botSpotY, arcR, -Math.PI / 2 - arcAng, -Math.PI / 2 + arcAng);
            pCtx.stroke();
        } else {
            // 하프라인 & 센터 서클 & 센터 스팟
            pCtx.beginPath();
            pCtx.moveTo(W * 0.5, pitchTop);
            pCtx.lineTo(W * 0.5, pitchTop + pitchH);
            pCtx.stroke();

            const centerR = H * 0.145;
            pCtx.beginPath();
            pCtx.arc(W * 0.5, H * 0.5, centerR, 0, Math.PI * 2);
            pCtx.stroke();

            pCtx.beginPath();
            pCtx.arc(W * 0.5, H * 0.5, spotR * 1.15, 0, Math.PI * 2);
            pCtx.fill();

            // 페널티 박스 (18야드) & 골 에어리어 (6야드)
            const boxD = W * 0.155;
            const boxH = H * 0.50;
            const sixD = W * 0.058;
            const sixH = H * 0.26;

            pCtx.strokeRect(pitchLeft, H * 0.25, boxD, boxH);
            pCtx.strokeRect(W * 0.95 - boxD, H * 0.25, boxD, boxH);

            pCtx.strokeRect(pitchLeft, H * 0.37, sixD, sixH);
            pCtx.strokeRect(W * 0.95 - sixD, H * 0.37, sixD, sixH);

            // 페널티 스팟 & 페널티 아크 (D존)
            const leftSpotX = pitchLeft + W * 0.105;
            const rightSpotX = W * 0.95 - W * 0.105;
            [leftSpotX, rightSpotX].forEach(sx => {
                pCtx.beginPath();
                pCtx.arc(sx, H * 0.5, spotR, 0, Math.PI * 2);
                pCtx.fill();
            });

            const dxToBox = boxD - W * 0.105; // 0.05 * W
            const arcR = Math.max(dxToBox * 1.5, W * 0.082);
            const arcAng = Math.acos(dxToBox / arcR);
            pCtx.beginPath();
            pCtx.arc(leftSpotX, H * 0.5, arcR, -arcAng, arcAng);
            pCtx.stroke();

            pCtx.beginPath();
            pCtx.arc(rightSpotX, H * 0.5, arcR, Math.PI - arcAng, Math.PI + arcAng);
            pCtx.stroke();
        }

        // 4) 4개 코너 아크 & 코너 깃발
        const corners = [
            { x: pitchLeft, y: pitchTop, sAng: 0, eAng: Math.PI / 2, fx: -1, fy: -1 },
            { x: pitchLeft + pitchW, y: pitchTop, sAng: Math.PI / 2, eAng: Math.PI, fx: 1, fy: -1 },
            { x: pitchLeft + pitchW, y: pitchTop + pitchH, sAng: Math.PI, eAng: Math.PI * 1.5, fx: 1, fy: 1 },
            { x: pitchLeft, y: pitchTop + pitchH, sAng: Math.PI * 1.5, eAng: Math.PI * 2, fx: -1, fy: 1 }
        ];
        const flagSize = Math.max(7, scale * 0.015);
        corners.forEach(c => {
            pCtx.beginPath();
            pCtx.arc(c.x, c.y, cornerR, c.sAng, c.eAng);
            pCtx.strokeStyle = palette.lineColor;
            pCtx.lineWidth = lineW;
            pCtx.stroke();
            this._drawCornerFlag(pCtx, c.x, c.y, c.fx, c.fy, '#f97316', flagSize);
        });

        // 5) 골대 옆 입체 3D A-보드 광고판 & 터치라인 LED 보드 + 팀 벤치
        const homeColor = this._getTeamPrimaryColor('home', '#e11d48');
        const awayColor = this._getTeamPrimaryColor('away', '#2563eb');
        const adGap = Math.max(3, scale * 0.005);

        if (!isPortrait) {
            const goalSideDepth = Math.max(11, Math.min(22, W * 0.019));
            const touchDepth = Math.max(9, Math.min(16, H * 0.021));
            const leftBoardX = W * 0.036;
            const rightBoardX = W * 0.964;

            // 왼쪽 골대 위/아래 입체 광고판 (각 3개씩)
            this._drawAdBoardStrip(pCtx, H * 0.065, H * 0.405, leftBoardX, 'left', goalSideDepth, 3, adGap, sponsors, 0);
            this._drawAdBoardStrip(pCtx, H * 0.595, H * 0.935, leftBoardX, 'left', goalSideDepth, 3, adGap, sponsors, 3);

            // 오른쪽 골대 위/아래 입체 광고판 (각 3개씩)
            this._drawAdBoardStrip(pCtx, H * 0.065, H * 0.405, rightBoardX, 'right', goalSideDepth, 3, adGap, sponsors, 2);
            this._drawAdBoardStrip(pCtx, H * 0.595, H * 0.935, rightBoardX, 'right', goalSideDepth, 3, adGap, sponsors, 5);

            // 상단 터치라인 입체 LED 보드
            this._drawAdBoardStrip(pCtx, W * 0.07, W * 0.93, H * 0.035, 'top', touchDepth, 7, adGap, sponsors, 1);

            // 하단 터치라인 양측 보드 + 중앙 홈/원정 팀 벤치
            this._drawAdBoardStrip(pCtx, W * 0.07, W * 0.34, H * 0.965, 'bottom', touchDepth, 2, adGap, sponsors, 0);
            this._drawAdBoardStrip(pCtx, W * 0.66, W * 0.93, H * 0.965, 'bottom', touchDepth, 2, adGap, sponsors, 4);

            const benchW = W * 0.11;
            const benchH = Math.max(9, H * 0.022);
            this._drawTeamBench(pCtx, W * 0.37, H * 0.964, benchW, benchH, homeColor, 'HOME', false);
            this._drawTeamBench(pCtx, W * 0.52, H * 0.964, benchW, benchH, awayColor, 'AWAY', false);
        } else {
            const goalSideDepth = Math.max(9, Math.min(18, H * 0.022));
            const touchDepth = Math.max(8, Math.min(15, W * 0.022));
            const topBoardY = H * 0.036;
            const botBoardY = H * 0.964;

            // 상단 골대 좌/우 입체 광고판
            this._drawAdBoardStrip(pCtx, W * 0.065, W * 0.405, topBoardY, 'top', goalSideDepth, 2, adGap, sponsors, 0);
            this._drawAdBoardStrip(pCtx, W * 0.595, W * 0.935, topBoardY, 'top', goalSideDepth, 2, adGap, sponsors, 3);

            // 하단 골대 좌/우 입체 광고판
            this._drawAdBoardStrip(pCtx, W * 0.065, W * 0.405, botBoardY, 'bottom', goalSideDepth, 2, adGap, sponsors, 2);
            this._drawAdBoardStrip(pCtx, W * 0.595, W * 0.935, botBoardY, 'bottom', goalSideDepth, 2, adGap, sponsors, 5);

            // 좌/우 터치라인 LED 보드 + 벤치
            this._drawAdBoardStrip(pCtx, H * 0.07, H * 0.93, W * 0.035, 'left', touchDepth, 6, adGap, sponsors, 1);
            this._drawAdBoardStrip(pCtx, H * 0.07, H * 0.34, W * 0.965, 'right', touchDepth, 2, adGap, sponsors, 0);
            this._drawAdBoardStrip(pCtx, H * 0.66, H * 0.93, W * 0.965, 'right', touchDepth, 2, adGap, sponsors, 4);

            const benchW = Math.max(9, W * 0.024);
            const benchH = H * 0.11;
            this._drawTeamBench(pCtx, W * 0.964, H * 0.37, benchW, benchH, awayColor, 'AWAY', true);
            this._drawTeamBench(pCtx, W * 0.964, H * 0.52, benchW, benchH, homeColor, 'HOME', true);
        }

        // 6) 입체 골대 & 그물망 (광고판과 겹치지 않는 골마우스 영역)
        if (isPortrait) {
            this._drawGoalNet(pCtx, true, 'top', W, H);
            this._drawGoalNet(pCtx, true, 'bottom', W, H);
        } else {
            this._drawGoalNet(pCtx, false, 'left', W, H);
            this._drawGoalNet(pCtx, false, 'right', W, H);
        }

        this.pitchCache = cache;
        this.ctx.drawImage(this.pitchCache, 0, 0, targetW, targetH);
    }
}

const matchVisualizer = new MatchVisualizer();
window.matchVisualizer = matchVisualizer;
