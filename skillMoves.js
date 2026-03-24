// skillMoves.js
// 드리블 스킬 무브 시스템
//
// 동작 원리:
//   매치 엔진이 sync()로 공 위치를 갱신할 때, 공 상태가 CONTROLLED(1)이면
//   이 시스템이 공의 targetX/Y를 일시적으로 가로채어 스킬 무브 경로를 재생합니다.
//   스킬 재생이 끝나면 엔진이 보낸 원래 목표 위치로 자연스럽게 복귀합니다.
//
// 설치:
//   visibleMatch.js 다음에 이 파일을 로드하면 자동으로 주입됩니다.
//   <script src="visibleMatch.js"></script>
//   <script src="skillMoves.js"></script>

// ─────────────────────────────────────────────────────────────
// 1. 스킬 정의
//    각 스킬은 keyframes 배열로 공의 상대 경로를 정의합니다.
//    ox/oy: 볼 캐리어 기준 오프셋 (경기장 좌표계 단위, 약 1 = 필드의 1%)
//    t    : 전체 재생 시간 중 이 keyframe의 위치 (0~1)
// ─────────────────────────────────────────────────────────────
const SKILLS = {

    // 스텝오버: 공을 한쪽으로 살짝 밀었다가 반대편으로 빠져나감
    STEPOVER: {
        name: '스텝오버',
        minFrames: 18,
        buildPath(dir) {
            // dir: 1 = 오른쪽 우선, -1 = 왼쪽 우선
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.35, ox:  2.5 * dir,  oy:  0.5 },  // 한쪽으로 유인
                { t: 0.65, ox: -3.0 * dir,  oy: -0.5 },  // 반대편으로 빠짐
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 드래그백: 공을 발등으로 뒤로 당겨서 방향 전환
    DRAG_BACK: {
        name: '드래그백',
        minFrames: 20,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.40, ox:  0,          oy:  3.0 },  // 뒤로 당김
                { t: 0.70, ox:  3.5 * dir,  oy:  1.5 },  // 옆으로 전환
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 플립 플랩 (= 엘라스티코): 안으로 살짝 밀었다가 바깥으로 튕기듯 빠져나감
    // 호나우지뉴의 트레이드마크 — 발 바깥쪽으로 공을 안으로 밀고 순간적으로 바깥으로 꺾음
    FLIP_FLAP: {
        name: '플립 플랩',
        minFrames: 16,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.30, ox:  2.0 * dir,  oy:  0   },  // 안쪽 페이크 (발 바깥으로 밀기)
                { t: 0.55, ox: -0.5 * dir,  oy:  0   },  // 중심으로 순간 복귀
                { t: 0.80, ox: -3.5 * dir,  oy: -1.0 },  // 바깥으로 폭발적으로 튕겨나감
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 마르세유 턴 (= 룰렛 / 지단 룰렛): 공 주위를 반원형으로 감아돌며 방향 전환
    // 지네딘 지단이 98 WC에서 선보인 기술 — 발뒤꿈치로 공을 끌어당기며 180도 회전
    MARSEILLE_TURN: {
        name: '마르세유 턴',
        minFrames: 24,
        buildPath(dir) {
            const r = 2.8;
            return [
                { t: 0.00, ox:  0,          oy:  0        },
                { t: 0.25, ox:  r * dir,    oy:  r * 0.5  },  // 한 발로 공 끌기 시작
                { t: 0.50, ox:  r * dir,    oy:  r * 1.2  },  // 몸이 반 바퀴 돔
                { t: 0.75, ox:  0,          oy:  r * 1.5  },  // 다른 발로 이어받음
                { t: 1.00, ox:  0,          oy:  0        },  // 완전히 방향 전환
            ];
        }
    },

    // 인사이드 컷: 공을 안쪽 발로 빠르게 잘라 방향 전환
    INSIDE_CUT: {
        name: '인사이드 컷',
        minFrames: 14,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.45, ox:  1.5 * dir,  oy: -1.0 },
                { t: 0.75, ox: -2.5 * dir,  oy: -2.5 },
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 스쿱 턴: 공을 발끝으로 퍼올리듯 뒤로 넘기며 방향 반전
    SCOOP_TURN: {
        name: '스쿱 턴',
        minFrames: 22,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.30, ox: -1.0 * dir,  oy: -2.0 },
                { t: 0.60, ox:  2.5 * dir,  oy: -3.5 },
                { t: 0.85, ox:  3.0 * dir,  oy: -1.5 },
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 라 크로케타: 인사이드 발로 공을 몸 앞을 가로질러 반대편으로 쓸어넘기는 기술
    // 이니에스타의 트레이드마크 — 공이 발 아래를 부드럽게 호를 그리며 이동
    LA_CROQUETA: {
        name: '라 크로케타',
        minFrames: 20,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.20, ox:  1.0 * dir,  oy: -0.5 },  // 한쪽 발에서 시작
                { t: 0.45, ox:  0,          oy: -2.5 },  // 몸 정면(가장 앞)을 통과
                { t: 0.70, ox: -2.0 * dir,  oy: -1.5 },  // 반대편으로 쓸려감
                { t: 0.88, ox: -3.5 * dir,  oy: -0.5 },  // 반대쪽 발에 안착
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },

    // 호날두 촙: 발 바깥쪽으로 공을 몸 뒤를 통과시켜 반대편으로 폭발적으로 꺾는 기술
    // 짧고 날카로운 동작 — CR7 특유의 순간 방향 전환
    RONALDO_CHOP: {
        name: '호날두 촙',
        minFrames: 14,
        buildPath(dir) {
            return [
                { t: 0.00, ox:  0,          oy:  0   },
                { t: 0.25, ox:  0.5 * dir,  oy:  1.0 },  // 잠깐 뒤로
                { t: 0.50, ox: -1.0 * dir,  oy:  2.0 },  // 몸 뒤쪽 통과
                { t: 0.72, ox: -3.5 * dir,  oy:  1.0 },  // 반대편으로 폭발적으로 꺾임
                { t: 0.88, ox: -4.0 * dir,  oy: -0.5 },  // 전진 방향으로 복귀
                { t: 1.00, ox:  0,          oy:  0   },
            ];
        }
    },
};

// ─────────────────────────────────────────────────────────────
// 2. Keyframe 보간 (Catmull-Rom 곡선)
// ─────────────────────────────────────────────────────────────
function catmullRom(p0, p1, p2, p3, t) {
    return 0.5 * (
        (2 * p1) +
        (-p0 + p2) * t +
        (2 * p0 - 5 * p1 + 4 * p2 - p3) * t * t +
        (-p0 + 3 * p1 - 3 * p2 + p3) * t * t * t
    );
}

function samplePath(keyframes, t) {
    if (t <= 0) return { ox: keyframes[0].ox,                    oy: keyframes[0].oy };
    if (t >= 1) return { ox: keyframes[keyframes.length-1].ox,   oy: keyframes[keyframes.length-1].oy };

    let i = 1;
    while (i < keyframes.length - 1 && keyframes[i].t < t) i++;

    const k0 = keyframes[Math.max(0, i-2)];
    const k1 = keyframes[i-1];
    const k2 = keyframes[i];
    const k3 = keyframes[Math.min(keyframes.length-1, i+1)];

    const segLen = k2.t - k1.t;
    if (segLen <= 0) return { ox: k2.ox, oy: k2.oy };
    const localT = (t - k1.t) / segLen;

    return {
        ox: catmullRom(k0.ox, k1.ox, k2.ox, k3.ox, localT),
        oy: catmullRom(k0.oy, k1.oy, k2.oy, k3.oy, localT),
    };
}

// ─────────────────────────────────────────────────────────────
// 3. 스킬 무브 매니저
// ─────────────────────────────────────────────────────────────
const SkillMoveManager = {

    active: null,
    /*  active = {
            keyframes    : [...],
            frame        : 0,
            totalFrames  : number,
            carrierUnit  : VisualUnit,
        }
    */

    lastTriggerFrame  : {},   // unit.id -> 마지막 발동 글로벌 프레임
    controlFrames     : {},   // unit.id -> 현재 연속 볼 소지 프레임 수
    prevCarrierId     : null, // 직전 sync의 볼 소지자 id
    globalFrame       : 0,

    // ── 설정
    // sync()가 얼마나 자주 불리는지 알 수 없으므로,
    // "최소 연속 소지 프레임"과 "경기당 발동 횟수 상한"으로 빈도를 제어합니다.
    cooldownFrames    : 600,  // 같은 선수 재발동 최소 대기 (~10초 @ 60fps)
    minControlFrames  : 40,   // 공을 이 프레임 수 이상 연속 소지해야 판정 (~0.7초)
    triggerChance     : 0.006, // 조건 충족 후 프레임당 발동 확률

    // ── MatchVisualizer.sync() 호출마다 실행됨
    onSync(visualizer, snapshot) {
        this.globalFrame++;

        const ball      = visualizer.ball;
        const ballState = snapshot.ball.state; // 0:LOOSE, 1:CONTROLLED, 2:IN_FLIGHT
        const carrier   = Object.values(visualizer.units).find(u => u.hasBall);

        // ── 진행 중인 스킬 업데이트
        if (this.active) {
            this.active.frame++;

            if (this.active.frame >= this.active.totalFrames) {
                this.active = null;
            } else {
                const t    = this.active.frame / this.active.totalFrames;
                const unit = this.active.carrierUnit;
                const { ox, oy } = samplePath(this.active.keyframes, t);
                ball.targetX = unit.x + ox;
                ball.targetY = unit.y + oy;
                return;
            }
        }

        // ── 연속 소지 프레임 추적
        if (ballState === 1 && carrier) {
            if (carrier.id === this.prevCarrierId) {
                this.controlFrames[carrier.id] = (this.controlFrames[carrier.id] || 0) + 1;
            } else {
                // 소지자가 바뀌었으면 카운터 초기화
                this.controlFrames[carrier.id] = 1;
            }
            this.prevCarrierId = carrier.id;
        } else {
            this.prevCarrierId = null;
        }

        // ── 스킬 발동 조건 판정
        if (ballState === 1 && carrier && !this.active) {
            const held      = this.controlFrames[carrier.id] || 0;
            const lastFrame = this.lastTriggerFrame[carrier.id] || -9999;
            const cooledDown = this.globalFrame - lastFrame > this.cooldownFrames;

            // 조건: ① 연속 소지 충분히 됨 ② 쿨타임 지남 ③ 전방으로 이동 중
            const movingForward = this._isMovingForward(carrier);

            if (held >= this.minControlFrames && cooledDown && movingForward) {
                if (Math.random() < this.triggerChance) {
                    this._trigger(carrier, ball);
                }
            }
        }
    },

    // 선수가 전방(상대 골문 방향)으로 이동 중인지 확인
    // home팀은 오른쪽(+x), away팀은 왼쪽(-x)이 전방
    _isMovingForward(unit) {
        const dx = unit.targetX - unit.x;
        if (unit.teamType === 'home') return dx > 0.3;
        if (unit.teamType === 'away') return dx < -0.3;
        return Math.abs(dx) > 0.3; // 팀 정보 없으면 그냥 움직이기만 해도 허용
    },

    _trigger(carrierUnit, ball) {
        const keys = Object.keys(SKILLS);
        const key  = keys[Math.floor(Math.random() * keys.length)];
        const skill = SKILLS[key];

        const dir         = Math.random() < 0.5 ? 1 : -1;
        const keyframes   = skill.buildPath(dir);
        const totalFrames = skill.minFrames + Math.floor(Math.random() * 8);

        this.active = { keyframes, frame: 0, totalFrames, carrierUnit };
        this.lastTriggerFrame[carrierUnit.id] = this.globalFrame;

        this._showLabel(carrierUnit, skill.name);
        console.log(`⚽ 스킬 무브: ${carrierUnit.name} → ${skill.name}`);
    },

    // 캔버스 위에 얇은 텍스트 레이블 (DOM 오버레이, 1.8초 후 자동 제거)
    _showLabel(unit, skillName) {
        const v = window.matchVisualizer;
        if (!v || !v.canvas) return;

        const rect = v.canvas.getBoundingClientRect();
        const px   = rect.left + (unit.x / 100) * rect.width;
        const py   = rect.top  + (unit.y / 100) * rect.height;

        const old = document.getElementById('skillMoveLabel');
        if (old) old.remove();

        const el = document.createElement('div');
        el.id = 'skillMoveLabel';
        el.textContent = skillName;
        el.style.cssText = `
            position: fixed;
            left: ${px}px;
            top:  ${py - 26}px;
            transform: translateX(-50%);
            background: rgba(0,0,0,0.6);
            color: #fff;
            font: bold 11px/1 sans-serif;
            padding: 3px 8px;
            border-radius: 4px;
            pointer-events: none;
            z-index: 9999;
            white-space: nowrap;
            opacity: 1;
            transition: opacity 0.4s ease 1.2s;
        `;
        document.body.appendChild(el);

        // 페이드아웃 트리거
        requestAnimationFrame(() => requestAnimationFrame(() => {
            el.style.opacity = '0';
        }));
        setTimeout(() => el.remove(), 1800);
    },

    // ── 수동 발동 (테스트용)
    // 인자 없이 호출하면 현재 공 소지자에게 랜덤 스킬 발동
    // 예: skillMoveManager.triggerManual()
    // 예: skillMoveManager.triggerManual('MARSEILLE_TURN')
    // 예: skillMoveManager.triggerManual('FLIP_FLAP')
    triggerManual(skillKey) {
        const v = window.matchVisualizer;
        if (!v) return;
        const unit = Object.values(v.units).find(u => u.hasBall);
        if (!unit) { console.warn('현재 공 소지 선수가 없습니다.'); return; }
        const key = (skillKey && SKILLS[skillKey]) ? skillKey : null;
        if (key) {
            const skill = SKILLS[key];
            const dir = Math.random() < 0.5 ? 1 : -1;
            const keyframes = skill.buildPath(dir);
            const totalFrames = skill.minFrames + Math.floor(Math.random() * 8);
            this.active = { keyframes, frame: 0, totalFrames, carrierUnit: unit };
            this.lastTriggerFrame[unit.id] = this.globalFrame;
            this._showLabel(unit, skill.name);
            console.log(`⚽ 스킬 무브 (수동): ${unit.name} → ${skill.name}`);
        } else {
            this._trigger(unit, v.ball);
        }
    },

    // ── 설정 변경 헬퍼
    setChance(val)   { this.triggerChance  = val; },
    setCooldown(val) { this.cooldownFrames = val; },
};

// ─────────────────────────────────────────────────────────────
// 4. MatchVisualizer.sync() 자동 패치
// ─────────────────────────────────────────────────────────────
(function patchVisualizer() {
    function apply(v) {
        if (v._skillMovesPatched) return;
        v._skillMovesPatched = true;

        const _originalSync = v.sync.bind(v);

        v.sync = function (snapshot) {
            _originalSync(snapshot);                   // 엔진 데이터 먼저 정상 반영
            SkillMoveManager.onSync(this, snapshot);   // 그 후 공 위치 필요시 덮어씀
        };

        console.log('✅ skillMoves.js: MatchVisualizer.sync() 패치 완료');
    }

    if (window.matchVisualizer) {
        apply(window.matchVisualizer);
    } else {
        const id = setInterval(() => {
            if (window.matchVisualizer) { apply(window.matchVisualizer); clearInterval(id); }
        }, 200);
    }
})();

// ─────────────────────────────────────────────────────────────
// 5. 전역 노출
// ─────────────────────────────────────────────────────────────
window.SKILLS            = SKILLS;
window.SkillMoveManager  = SkillMoveManager;
window.skillMoveManager  = SkillMoveManager;
